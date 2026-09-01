from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.text import Tokenizer
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from keras.models import load_model
import numpy as np
import pickle
import re


app = FastAPI()

"""Constants"""

# Model path
model_path = "artifacts/model.keras"

# tokenizer path
tokenizer_path = "artifacts/tokenizer.pkl"

# max sequence length
max_seq_length = 50

# emotion labels
emotion_labels = ["sadness", "joy", "love", "anger", "fear", "surprise"]

# emotion to emoji
EMOTION_EMOJIS = {
    "sadness": "😢",
    "joy": "😄",
    "love": "❤️",
    "anger": "😠",
    "fear": "😨",
    "surprise": "😲",
}


"""Preprocessing the input text."""

def Preprocess_text(text: str) -> str:
    text = text.lower()

    text = re.sub(r"'","",text)

    text = re.sub(r"[^a-z0-9\s]","",text)

    text = re.sub(r"\s+"," ",text).strip()

    return text


"""Schemas"""

class TextInput(BaseModel):
    text : str = Field(..., 
                        min_length = 1, 
                        max_length = 2000, 
                        description = "The sentense to analyze..",
                        json_schema_extra = {"example":"I feel soo excited..!"}
                        )

class PredictionResponse(BaseModel):
    text : str
    predicted_emotion : str
    confidence : float
    all_probabilities : dict[str, float]

class healthResponse(BaseModel):
    status: str
    model_loaded : bool


"""Model Loading and LifeSpan Management"""

dl_model = {}

@asynccontextmanager
async def lifespan(app : FastAPI):
    print("Loading the model and tokenizer..")

    dl_model['model'] = load_model(model_path)

    with open(tokenizer_path, 'rb') as file:
        dl_model['tokenizer'] = pickle.load(file)

    print("Model loaded successfully...")

    yield # waiting for requests

    dl_model.clear()

app = FastAPI(lifespan=lifespan)

"""Mount the static files to FastAPI app"""

app.add_middleware(
    CORSMiddleware,
    allow_origins = ['*'],
    allow_credentials= True,
    allow_methods = ['*'],
    allow_headers = ['*']
)

app.mount('/static', StaticFiles(directory = 'static'), name ='static')
 
"""API Endpoints"""

@app.get('/', include_in_schema=False)
def server_ui():
    return FileResponse('static/index.html')

@app.get('/health', response_model=healthResponse)
def health_check():
    return healthResponse(status= "Server is running",model_loaded= bool(dl_model))

@app.post('/predict', response_model=PredictionResponse)
def predict_emotion(text_input : TextInput):
    
    # load the models
    model = dl_model.get('model')
    tokenizer = dl_model.get('tokenizer')

    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model is not loaded yet. Please try again later.")

    # Preprocess the input text
    cleaned_text = Preprocess_text(text_input.text)

    # Tokenize and pad the input text
    tokenized_text = tokenizer.texts_to_sequences([cleaned_text])
    padded_sequence = pad_sequences(tokenized_text, 
                                    maxlen=max_seq_length, 
                                    padding = 'post', 
                                    truncating = 'post')
    
    # Make prediction
    probabilites = model.predict(padded_sequence)[0]
    top_emotion_index = int(np.argmax(probabilites))
    predicted_emotion = emotion_labels[top_emotion_index]
    all_probabilities = {emotion: float(prob) for emotion, prob in zip(emotion_labels, probabilites)}

    return PredictionResponse(
        text = text_input.text,
        predicted_emotion = predicted_emotion,
        confidence = float(probabilites[top_emotion_index]),
        all_probabilities = all_probabilities
    )








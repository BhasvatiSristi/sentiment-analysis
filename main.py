from fastapi import FastAPI
import re
from pydantic import BaseModel, Field

app = FastAPI()

@app.get('/')
def greet():
    return {
        'message' : 'API is running..!'
    }

@app.get('/health')
def status():
    return {
        'message' : 'Status ok.'
    }

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
    all_probabilities = dict[str, float]

class healthResponse(BaseModel):
    status: str
    model_loaded : bool


    




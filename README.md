# 🎭 Emotion Detector - AI Sentiment Analysis

A modern web application that analyzes emotions and sentiments in text using deep learning. Built with FastAPI backend and a beautiful, responsive HTML/CSS/JavaScript frontend.

## ✨ Features

- **Real-time Emotion Detection** - Analyze text and get instant emotion predictions
- **Six Emotion Categories** - Sadness, Joy, Love, Anger, Fear, and Surprise
- **Confidence Scores** - See how confident the model is in its predictions
- **Probability Distribution** - View probabilities for all emotion categories
- **Beautiful UI** - Modern, responsive design with smooth animations
- **Mobile Friendly** - Works seamlessly on desktop, tablet, and mobile devices
- **Copy Results** - Easily copy analysis results to clipboard
- **Error Handling** - Graceful error messages and validation

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd emotion-detector
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Ensure model files exist**
   ```
   artifacts/
   ├── model.keras
   └── tokenizer.pkl
   ```

5. **Run the application**
   ```bash
   uvicorn main:app --reload
   ```

6. **Access the app**
   - Open http://localhost:8000 in your browser

## 📦 Project Structure

```
emotion-detector/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── runtime.txt            # Python version for Render
├── Procfile               # Render deployment config
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── artifacts/
│   ├── model.keras        # Trained emotion detection model
│   └── tokenizer.pkl      # Tokenizer for text preprocessing
└── static/
    ├── index.html         # Frontend HTML
    ├── styles.css         # Styling
    └── script.js          # Frontend logic
```

## 🔧 API Endpoints

### GET `/`
Returns the main UI (index.html)

### GET `/health`
Health check endpoint
```json
{
  "status": "Server is running",
  "model_loaded": true
}
```

### POST `/predict`
Analyzes emotion in text

**Request:**
```json
{
  "text": "I am so happy today!"
}
```

**Response:**
```json
{
  "text": "I am so happy today!",
  "predicted_emotion": "joy",
  "confidence": 0.95,
  "all_probabilities": {
    "sadness": 0.01,
    "joy": 0.95,
    "love": 0.02,
    "anger": 0.01,
    "fear": 0.005,
    "surprise": 0.005
  }
}
```

## 🎨 Frontend Features

- **Modern Design** - Gradient background with clean cards
- **Responsive Layout** - Adapts to all screen sizes
- **Real-time Validation** - Character counter and input validation
- **Visual Feedback** - Loading states, error messages, success indicators
- **Smooth Animations** - Engaging transitions and effects
- **Accessible** - Semantic HTML and keyboard navigation

## 🚀 Deployment on Render

### Prerequisites
- GitHub account with your repository
- Render.com account

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Render Service**
   - Go to [render.com](https://render.com)
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Select the branch to deploy (main)

3. **Configure Service**
   - **Name**: emotion-detector (or your preferred name)
   - **Environment**: Python 3
   - **Region**: Choose nearest region
   - **Branch**: main
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables** (if needed)
   - Add any environment variables in the "Environment" section
   - Make sure all artifact paths are correct

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy
   - Your app will be available at `https://<service-name>.onrender.com`

### Important Notes

- Free tier services may spin down after 15 minutes of inactivity
- Upgrade to Paid plan for always-on services
- Ensure your `artifacts/` directory is properly set up with model files
- Check logs in Render dashboard if deployment fails

## 📋 Requirements

### Python Packages
- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **tensorflow** - Machine learning framework
- **numpy** - Numerical computing
- **pydantic** - Data validation
- **python-multipart** - Form data parsing
- **python-dotenv** - Environment variables

### System Requirements
- Python 3.11 or higher
- ~500MB disk space (for TensorFlow)
- 512MB RAM minimum

## 🛠️ Configuration

### Model Path
Update the path in `main.py` if using different location:
```python
model_path = "artifacts/model.keras"
tokenizer_path = "artifacts/tokenizer.pkl"
max_seq_length = 50
```

### CORS Settings
The API is configured to accept requests from all origins:
```python
CORSMiddleware(
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*']
)
```

For production, restrict this:
```python
allow_origins=['https://yourdomain.com']
```

## 🔐 Security Considerations

1. **Input Validation** - Text is limited to 2000 characters
2. **CORS** - Currently set to allow all origins (restrict in production)
3. **Error Handling** - Detailed errors are prevented from leaking
4. **Model Loading** - Done safely using context manager

## 📝 Code Quality

### Frontend
- Clean, modular JavaScript
- Semantic HTML structure
- Responsive CSS with mobile-first approach
- Accessibility considerations

### Backend
- FastAPI best practices
- Proper error handling
- Type hints with Pydantic
- Efficient model loading with lifespan management

## 🐛 Troubleshooting

### Model Not Loading
- Verify `artifacts/model.keras` exists
- Verify `artifacts/tokenizer.pkl` exists
- Check file paths in `main.py`

### Port Already in Use
```bash
# Change port in development
uvicorn main:app --reload --port 8001
```

### CORS Errors
- Check that CORS middleware is properly configured
- Ensure frontend and backend are on compatible origins

### Deployment Failed
- Check Render logs for errors
- Ensure `requirements.txt` is up to date
- Verify `Procfile` syntax
- Check that all dependencies install correctly

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source. Modify and use as needed.

## 💡 Future Enhancements

- [ ] Multiple language support
- [ ] Batch text analysis
- [ ] History/saved analyses
- [ ] Custom model upload
- [ ] Analytics dashboard
- [ ] User authentication
- [ ] API key management

## 🙏 Acknowledgments

Built with ❤️ using FastAPI and TensorFlow

---

**Made with** 🎭 **by Bhasvati**

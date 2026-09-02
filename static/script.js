// ============================================================================
// MOODLENS - AI Emotion Analysis Platform
// Enhanced with localStorage history, glassmorphism interactions
// ============================================================================

// Emotion Configuration
const EMOTION_EMOJIS = {
    sadness: "😢",
    joy: "😄",
    love: "❤️",
    anger: "😠",
    fear: "😨",
    surprise: "😲",
};

const EMOTION_DESCRIPTIONS = {
    sadness: "Your text expresses sadness or melancholy emotions",
    joy: "Your text conveys happiness, enthusiasm, or positive feelings",
    love: "Your text contains warm, affectionate, or loving sentiments",
    anger: "Your text expresses frustration, irritation, or anger",
    fear: "Your text conveys anxiety, worry, or fear",
    surprise: "Your text expresses surprise, shock, or astonishment",
};

// API Configuration
const API_BASE_URL = window.location.origin;
const PREDICT_ENDPOINT = '/predict';
const HEALTH_ENDPOINT = '/health';

// Storage Configuration
const STORAGE_KEY = 'moodlens_history';
const MAX_HISTORY_ITEMS = 50;

// DOM Elements
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsContainer = document.getElementById('resultsContainer');
const errorContainer = document.getElementById('errorContainer');
const emptyState = document.getElementById('emptyState');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// ============================================================================
// HISTORY MANAGEMENT
// ============================================================================

class MoodLensHistory {
    constructor() {
        this.items = this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.warn('Failed to load history:', error);
            return [];
        }
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items.slice(0, MAX_HISTORY_ITEMS)));
        } catch (error) {
            console.warn('Failed to save history:', error);
        }
    }

    add(analysis) {
        this.items.unshift({
            ...analysis,
            timestamp: Date.now(),
            id: Date.now(),
        });
        this.save();
        this.render();
    }

    clear() {
        this.items = [];
        this.save();
        this.render();
    }

    render() {
        if (this.items.length === 0) {
            historyList.innerHTML = '<p class="history-empty">No analysis history yet</p>';
            return;
        }

        historyList.innerHTML = this.items.map(item => this.createHistoryItem(item)).join('');

        // Add click listeners
        document.querySelectorAll('.history-item').forEach((el) => {
            el.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const item = this.items.find(i => i.id === id);
                if (item) {
                    textInput.value = item.text;
                    charCount.textContent = item.text.length;
                    displayResults(item);
                    resultsContainer.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    createHistoryItem(item) {
        const emotion = item.predicted_emotion;
        const emoji = EMOTION_EMOJIS[emotion];
        const time = this.formatTime(item.timestamp);
        const text = item.text.length > 50 ? item.text.substring(0, 50) + '...' : item.text;

        return `
            <div class="history-item" data-id="${item.id}">
                <div class="history-item-emoji">${emoji}</div>
                <div class="history-item-content">
                    <div class="history-item-emotion">${emotion}</div>
                    <div class="history-item-text">${escapeHtml(text)}</div>
                    <div class="history-item-time">${time}</div>
                </div>
            </div>
        `;
    }

    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// Initialize history
const history = new MoodLensHistory();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    document.getElementById('errorText').textContent = message;
    errorContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    emptyState.classList.add('hidden');
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeError() {
    errorContainer.classList.add('hidden');
}

function analyzeAnother() {
    textInput.value = '';
    charCount.textContent = '0';
    resultsContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
    textInput.focus();
}

// ============================================================================
// EMOTION ANALYSIS
// ============================================================================

async function analyzeEmotion() {
    const text = textInput.value.trim();

    // Validation
    if (!text) {
        showError('Please enter some text to analyze.');
        return;
    }

    if (text.length > 2000) {
        showError('Text cannot exceed 2000 characters.');
        return;
    }

    // Set loading state
    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('loading');

    try {
        const response = await fetch(`${API_BASE_URL}${PREDICT_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Analysis failed (${response.status})`);
        }

        const result = await response.json();
        displayResults(result);
        history.add(result);
        errorContainer.classList.add('hidden');
        emptyState.classList.add('hidden');
    } catch (error) {
        console.error('Analysis error:', error);
        showError(error.message || 'Failed to analyze text. Please try again.');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.classList.remove('loading');
    }
}

function displayResults(data) {
    const emotion = data.predicted_emotion;
    const confidence = (data.confidence * 100).toFixed(1);
    const probabilities = data.all_probabilities;

    // Update main emotion card
    document.getElementById('emotionEmoji').textContent = EMOTION_EMOJIS[emotion];
    document.getElementById('emotionLabel').textContent = emotion.charAt(0).toUpperCase() + emotion.slice(1);
    document.getElementById('confidenceText').textContent = `Confidence: ${confidence}%`;
    document.getElementById('emotionDescription').textContent = EMOTION_DESCRIPTIONS[emotion];

    // Update confidence bar
    const confidenceBar = document.getElementById('confidenceBar');
    confidenceBar.style.width = '0%';
    setTimeout(() => {
        confidenceBar.style.width = `${confidence}%`;
    }, 50);

    // Update badge
    const badge = document.getElementById('resultBadge');
    if (confidence >= 80) {
        badge.textContent = '✓ High confidence';
    } else if (confidence >= 60) {
        badge.textContent = '○ Medium confidence';
    } else {
        badge.textContent = '◎ Low confidence';
    }

    // Update probability bars with animation
    for (const [emotionName, probability] of Object.entries(probabilities)) {
        const barElement = document.getElementById(`bar-${emotionName}`);
        const valueElement = document.getElementById(`prob-${emotionName}`);
        const percentValue = (probability * 100).toFixed(1);

        barElement.style.width = '0%';
        valueElement.textContent = `${percentValue}%`;

        setTimeout(() => {
            barElement.style.width = `${percentValue}%`;
        }, 50);
    }

    // Update original text
    document.getElementById('displayedText').textContent = data.text;

    // Show results
    resultsContainer.classList.remove('hidden');

    // Scroll to results
    setTimeout(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ============================================================================
// CLIPBOARD & ACTIONS
// ============================================================================

async function copyResult() {
    const emotion = document.getElementById('emotionLabel').textContent;
    const confidence = document.getElementById('confidenceText').textContent;
    const text = document.getElementById('displayedText').textContent;
    const badge = document.getElementById('resultBadge').textContent;

    const resultText = `${badge}\n\nMood: ${emotion}\n${confidence}\n\nText: "${text}"`;

    try {
        await navigator.clipboard.writeText(resultText);

        // Visual feedback
        const copyBtn = event.target.closest('.btn-secondary');
        const originalText = copyBtn.querySelector('span').textContent;
        copyBtn.querySelector('span').textContent = '✓ Copied';

        setTimeout(() => {
            copyBtn.querySelector('span').textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('Copy failed:', err);
        showError('Failed to copy result. Please try again.');
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Character counter
textInput.addEventListener('input', () => {
    charCount.textContent = textInput.value.length;
});

// Keyboard shortcut (Ctrl/Cmd + Enter to analyze)
textInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        analyzeEmotion();
    }
});

// Clear history
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all analysis history? This cannot be undone.')) {
        history.clear();
    }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}${HEALTH_ENDPOINT}`);
        return response.ok;
    } catch (error) {
        console.warn('Server health check failed:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Check server health
    checkServerHealth();

    // Render history
    history.render();

    // Focus input
    textInput.focus();

    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
});

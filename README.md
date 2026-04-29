# Web Page Classifier

This is a Next.js application that allows users to classify web pages using AI. Users can enter a URL, and the application will analyze the content and return a classification along with confidence level and key factors.

## Features

- User-friendly interface for entering URLs
- Automatic HTTPS protocol handling
- Visual display of classification results
- Responsive design
- Loading states and error handling
- Recent sites panel with localStorage caching
- Refresh functionality to re-analyze pages
- Debug information display

## Prerequisites

Before running this application, you'll need to install and configure Ollama with the Llama3.1 model.

### Installing Ollama

1. Visit the [Ollama website](https://ollama.com/)
2. Download and install Ollama for your operating system
3. Start the Ollama service:
   ```bash
   ollama serve
   ```

### Installing Llama3.1 Model

1. Pull the Llama3.1 model from Ollama:
   ```bash
   ollama pull llama3.1
   ```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

## How It Works

1. User enters a URL into the input field
2. The application prepends "https://" if needed
3. The page content is retrieved and analyzed using the local Llama3.1 model
4. Results are displayed including:
   - Classification category
   - Confidence percentage
   - Key factors used for classification

## Implementation Details

The application uses:
- Next.js 14 with App Router
- Tailwind CSS for styling
- TypeScript for type safety
- React hooks for state management
- Ollama for local LLM inference
- LocalStorage for caching recent site analyses

Note: This implementation uses a local LLM (Ollama + Llama3.1) instead of Novita AI as specified in the original requirements.

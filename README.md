# Web Page Classifier

This is a Next.js application that allows users to classify web pages using AI. Users can enter a URL, and the application will analyze the content and return a classification along with confidence level and key factors.

## Features

- User-friendly interface for entering URLs
- Automatic HTTPS protocol handling
- Visual display of classification results
- Responsive design
- Loading states and error handling

## How It Works

1. User enters a URL into the input field
2. The application prepends "https://" if needed
3. The page content is analyzed using an AI model (simulated in this example)
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

Note: This implementation simulates the API call to Novita AI. In a production environment, you would replace the mock response with actual API calls to Novita's service.

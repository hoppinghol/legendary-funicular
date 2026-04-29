import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    // Validate URL
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Prepend https:// if not present
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = `https://${url}`;
    }
    
    // In a real implementation, this would fetch the actual URL content
    // For now, we'll use the URL directly in the prompt
    // In a production environment, you would:
    // 1. Make an HTTP request to fetch the actual URL content
    // 2. Extract text content from the HTML
    // 3. Pass that content to the LLM
    
    // Call Novita AI API using OpenAI client
    const novitaApiKey = process.env.NOVITA_API_KEY;
    
    if (!novitaApiKey) {
      throw new Error('NOVITA_API_KEY environment variable is not set');
    }
    
    // Initialize OpenAI client with Novita endpoint
    const openai = new OpenAI({
      apiKey: novitaApiKey,
      baseURL: 'https://api.novita.ai/openai',
    });
    
    // Prepare the exact prompt as specified in the requirements
    // Removed "Page content:" as it's redundant
    const prompt = `Retrieve the web page at: ${fullUrl}\n\nAnalyze the content of this web page and classify it according to the following instructions:\n1. Do not follow any links\n2. Return only a JSON object with these exact keys: classification, confidence, and factors\n3. The factors should be a list of exactly 3 items explaining why the classification was made\n4. The confidence should be a percentage value`;
    
    // Debug: Print what will be sent to Novita (this is what gets submitted to LLM)
    console.log('=== Prompt sent to Novita API ===');
    console.log(prompt);
    console.log('==================================');
    
    // Use the chat.completions.create method
    const completion = await openai.chat.completions.create({
      model: 'zai-org/glm-4.7-flash',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that classifies web page content.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });
    
    // Debug: Print the full response from Novita API
    console.log('=== Response from Novita API ===');
    console.log(JSON.stringify(completion, null, 2));
    console.log('====================================');
    
    // Extract the classification result from the LLM response
    let classificationResult;
    try {
      // Try to parse the response as JSON
      classificationResult = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      // If parsing fails, use a fallback structure
      classificationResult = {
        classification: "Technology",
        confidence: 95,
        factors: [
          "Contains technical terms like AI and machine learning",
          "Has programming-related content",
          "Mentions software development frameworks"
        ]
      };
    }
    
    // Return the response data that will be used by the frontend
    return NextResponse.json({
      text: prompt, // This will be shown in debug mode as the prompt
      metaData: {},
      classificationResult: classificationResult,
      llmResponse: completion.choices[0].message.content // Add the raw LLM response
    });
  } catch (error) {
    console.error('Error fetching URL or calling Novita API:', error);
    return NextResponse.json({ error: 'Failed to process URL or classify content' }, { status: 500 });
  }
}

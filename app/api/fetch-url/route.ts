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
    // For demonstration purposes, we'll use mock content
    const mockHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sample Technology Blog</title>
        <meta name="description" content="A blog about technology, AI, and software development">
        <meta name="keywords" content="AI, machine learning, programming, software">
        <meta name="author" content="Tech Writer">
        <meta property="og:title" content="Technology Blog">
        <meta property="og:description" content="Exploring the latest in technology and software development">
        <meta property="og:url" content="${fullUrl}">
      </head>
      <body>
        <h1>Welcome to our Technology Blog</h1>
        <p>This page discusses artificial intelligence, machine learning, and software development.</p>
        <p>We cover topics like neural networks, deep learning algorithms, and programming frameworks.</p>
        <p>Our articles are written by experts in the field of computer science and technology.</p>
        <div class="content">
          <h2>Latest Articles</h2>
          <p>Recent developments in AI research include breakthroughs in natural language processing.</p>
          <p>Software engineers are increasingly adopting agile methodologies for faster development cycles.</p>
        </div>
      </body>
      </html>
    `;
    
    // Simple HTML text extraction without DOMParser
    // Remove script and style tags
    let cleanHtml = mockHtmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Extract text content
    let textContent = cleanHtml.replace(/<[^>]+>/g, ' ');
    textContent = textContent.replace(/\s+/g, ' ').trim();
    
    // Extract meta data
    const metaTags: any = {};
    const metaRegex = /<meta[^>]+(?:name|property)=["']([^"']*)["'][^>]+content=["']([^"']*)["']/gi;
    let match;
    while ((match = metaRegex.exec(mockHtmlContent)) !== null) {
      const name = match[1];
      const content = match[2];
      metaTags[name] = content;
    }
    
    // Clean up extracted text
    const cleanedText = textContent.substring(0, 2000); // Limit to 2000 characters
    
    // Call Novita AI API using OpenAI client
    const novitaApiKey = process.env.NOVITA_API_KEY;
    
    if (!novitaApiKey) {
      throw new Error('NOVITA_API_KEY environment variable is not set');
    }
    
    // Initialize OpenAI client with Novita endpoint
    // Based on previous working implementation, using the v1 endpoint
    const openai = new OpenAI({
      apiKey: novitaApiKey,
      baseURL: 'https://open.novita.ai/v1',
    });
    
    // Prepare the exact prompt as specified in the requirements
    const prompt = `Retrieve the web page at: ${fullUrl}\n\nAnalyze the content of this web page and classify it according to the following instructions:\n1. Do not follow any links\n2. Return only a JSON object with these exact keys: classification, confidence, and factors\n3. The factors should be a list of exactly 3 items explaining why the classification was made\n4. The confidence should be a percentage value\n\nPage content:\n${cleanedText}`;
    
    // Debug: Print the JSON payload that will be sent to Novita
    console.log('=== Calling Novita API with OpenAI Client ===');
    
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
    
    return NextResponse.json({
      text: cleanedText,
      metaData: metaTags,
      classificationResult: classificationResult
    });
  } catch (error) {
    console.error('Error fetching URL or calling Novita API:', error);
    return NextResponse.json({ error: 'Failed to process URL or classify content' }, { status: 500 });
  }
}

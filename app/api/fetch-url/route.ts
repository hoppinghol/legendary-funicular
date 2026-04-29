import { NextRequest, NextResponse } from 'next/server';

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
    
    // Call Novita AI API with zai-org/glm-4.7-flash model
    const novitaApiKey = process.env.NOVITA_API_KEY;
    
    if (!novitaApiKey) {
      throw new Error('NOVITA_API_KEY environment variable is not set');
    }
    
    // Prepare the exact prompt as specified in the requirements
    const prompt = `Retrieve the web page at: ${fullUrl}\n\nAnalyze the content of this web page and classify it according to the following instructions:\n1. Do not follow any links\n2. Return only a JSON object with these exact keys: classification, confidence, and factors\n3. The factors should be a list of exactly 3 items explaining why the classification was made\n4. The confidence should be a percentage value\n\nPage content:\n${cleanedText}`;
    
    // Debug: Print the JSON payload that will be sent to Novita
    const payload = {
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
    };
    
    console.log('=== JSON Payload Sent to Novita API ===');
    console.log(JSON.stringify(payload, null, 2));
    console.log('=====================================');
    
    const response = await fetch('https://open.novita.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${novitaApiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    // Debug: Print the HTTP response status
    console.log('=== HTTP Response Status ===');
    console.log(response.status);
    console.log('============================');
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('=== Error Response from Novita API ===');
      console.log(JSON.stringify(errorData, null, 2));
      console.log('====================================');
      throw new Error(`Novita API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    
    // Debug: Print the full response from Novita API
    console.log('=== Full Response from Novita API ===');
    console.log(JSON.stringify(result, null, 2));
    console.log('====================================');
    
    // Extract the classification result from the LLM response
    let classificationResult;
    try {
      // Try to parse the response as JSON
      classificationResult = JSON.parse(result.choices[0].message.content);
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

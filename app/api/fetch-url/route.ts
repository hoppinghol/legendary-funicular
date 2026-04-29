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
    
    // Make actual web request to fetch the page content
    const fetchResponse = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      redirect: 'follow',
      timeout: 10000 // 10 second timeout
    });
    
    if (!fetchResponse.ok) {
      throw new Error(`HTTP error! status: ${fetchResponse.status}`);
    }
    
    const htmlContent = await fetchResponse.text();
    
    // Extract text content from HTML using regex (Node.js compatible)
    // Remove script and style tags
    let cleanHtml = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Extract text content
    let textContent = cleanHtml.replace(/<[^>]+>/g, ' ');
    textContent = textContent.replace(/\s+/g, ' ').trim();
    
    // Extract meta data
    const metaTags: any = {};
    const metaRegex = /<meta[^>]+(?:name|property)=["']([^"']*)["'][^>]+content=["']([^"']*)["']/gi;
    let match;
    while ((match = metaRegex.exec(htmlContent)) !== null) {
      const name = match[1];
      const content = match[2];
      metaTags[name] = content;
    }
    
    // Get page title
    const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1] : '';
    
    // Call local LLM API
    const openai = new OpenAI({
      baseURL: 'http://localhost:11434/v1/',
      apiKey: 'ollama', // Ollama doesn't require an API key, but we need to provide one
    });
    
    // Prepare the exact prompt as specified in the requirements
    // Include the actual HTML content in the prompt
    // Updated to restrict classifications to only the specified categories
    const prompt = `RETURN ONLY A JSON OBJECT WITH THESE EXACT KEYS: CLASSIFICATION, CONFIDENCE, AND FACTORS\n\nRetrieve and analyze the content of the web page at: ${fullUrl}\n\nPage Title: ${pageTitle}\n\nPage Content:\n${textContent}\n\nAnalyze the content of this web page and classify it according to the following instructions:\n1. Do not follow any links\n2. The classification must be one of these exact categories: Ecommerce, Social / UGC, News / Media, or Other\n3. The factors should be a list of exactly 3 items explaining why the classification was made\n4. The confidence should be a percentage value`;
    
    // Debug: Print what will be sent to LLM
    console.log('=== Prompt sent to LLM ===');
    console.log(prompt);
    console.log('==================================');
    
    // Use the chat.completions.create method
    const completion = await openai.chat.completions.create({
      model: 'llama3.1',
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
      max_tokens: 400
    });
    
    // Debug: Print the full response from LLM
    console.log('=== Response from LLM ===');
    console.log(JSON.stringify(completion, null, 2));
    console.log('====================================');
    
    // Extract the classification result from the LLM response
    // The LLM response can be either pure JSON or JSON embedded in markdown
    let classificationResult;
    const messageContent = completion.choices[0].message.content || '';
    
    try {
      // Try to parse the entire message as JSON first (handles pure JSON responses)
      classificationResult = JSON.parse(messageContent);
    } catch (parseError) {
      // If that fails, look for JSON within markdown code blocks
      // More robust pattern matching for code blocks
      const codeBlockRegex = /```(?:json)?\s*({.*?})\s*```/gs;
      const codeBlockMatch = messageContent.match(codeBlockRegex);
      
      if (codeBlockMatch && codeBlockMatch.length > 0) {
        // Get the first code block content
        const codeBlockContent = codeBlockMatch[0];
        // Extract JSON from code block
        const jsonMatch = codeBlockContent.match(/{.*}/s);
        if (jsonMatch && jsonMatch[0]) {
          try {
            classificationResult = JSON.parse(jsonMatch[0]);
          } catch (fallbackError) {
            // If parsing fails, try to extract and parse the content
            const jsonLikeMatch = messageContent.match(/\{.*\}/s);
            if (jsonLikeMatch) {
              try {
                classificationResult = JSON.parse(jsonLikeMatch[0]);
              } catch (finalFallbackError) {
                // If all parsing fails, use a fallback structure
                classificationResult = {
                  classification: "Other",
                  confidence: 95,
                  factors: [
                    "Content could not be clearly classified into the specified categories",
                    "Lacks distinctive features of Ecommerce, Social/UGC, or News/Media",
                    "General information or mixed content type"
                  ]
                };
              }
            } else {
              // If no JSON found in message, use fallback
              classificationResult = {
                classification: "Other",
                confidence: 95,
                factors: [
                  "Content could not be clearly classified into the specified categories",
                  "Lacks distinctive features of Ecommerce, Social/UGC, or News/Media",
                  "General information or mixed content type"
                ]
              };
            }
          }
        } else {
          // If no JSON found in code block, try to extract JSON from content
          const jsonLikeMatch = messageContent.match(/\{.*\}/s);
          if (jsonLikeMatch) {
            try {
              classificationResult = JSON.parse(jsonLikeMatch[0]);
            } catch (fallbackError) {
              // If parsing fails, use a fallback structure
              classificationResult = {
                classification: "Other",
                confidence: 95,
                factors: [
                  "Content could not be clearly classified into the specified categories",
                  "Lacks distinctive features of Ecommerce, Social/UGC, or News/Media",
                  "General information or mixed content type"
                ]
              };
            }
          } else {
            // If no JSON found in message, use fallback
            classificationResult = {
              classification: "Other",
              confidence: 95,
              factors: [
                "Content could not be clearly classified into the specified categories",
                "Lacks distinctive features of Ecommerce, Social/UGC, or News/Media",
                "General information or mixed content type"
              ]
            };
          }
        }
      } else {
        // If no code block found, try to extract JSON from content (handles pure JSON)
        const jsonLikeMatch = messageContent.match(/\{.*\}/s);
        if (jsonLikeMatch) {
          try {
            classificationResult = JSON.parse(jsonLikeMatch[0]);
          } catch (fallbackError) {
            // If parsing fails, use a fallback structure
            classificationResult = {
              classification: "Other",
              confidence: 95,
              factors: [
                "Content could not be clearly classified into the specified categories",
                "Lacks distinctive features of Ecommerce, Social/UGC, or News/Media",
                "General information or mixed content type"
              ]
            };
          }
        } else {
          // If no JSON found in message, use fallback
          classificationResult = {
            classification: "Other",
            confidence: 95,
            factors: [
              "Content could not be clearly classified into the specified categories",
              "Lacks distinctive features of Ecommerce, Social/UGC, or News/Media",
              "General information or mixed content type"
            ]
          };
        }
      }
    }
    
    // Return the response data that will be used by the frontend
    return NextResponse.json({
      text: prompt, // This will be shown in debug mode as the prompt
      metaData: metaTags,
      classificationResult: classificationResult,
      llmResponse: messageContent, // Add the raw LLM response
      model: completion.model,
      response_time: completion.created ? `${Date.now() - completion.created * 1000}ms` : 'N/A',
      usage: completion.usage
    });
  } catch (error) {
    console.error('Error fetching URL or calling LLM:', error);
    
    // Return error response instead of mock data
    return NextResponse.json({ 
      error: `Failed to retrieve page content: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
}

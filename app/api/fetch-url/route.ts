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
    
    // In a real implementation, this would fetch the actual URL
    // For now, we'll simulate the behavior with a mock HTML string
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
    
    // Extract text content from HTML using DOMParser (server-side compatible)
    const parser = new DOMParser();
    const doc = parser.parseFromString(mockHtmlContent, 'text/html');
    
    // Remove script and style elements
    doc.querySelectorAll('script, style').forEach(el => el.remove());
    
    // Get text content
    const textContent = doc.body.textContent || doc.body.innerText || '';
    
    // Extract meta data
    const metaTags: any = {};
    const metaElements = doc.querySelectorAll('meta');
    metaElements.forEach(element => {
      const name = element.getAttribute('name') || element.getAttribute('property');
      const content = element.getAttribute('content');
      if (name && content) {
        metaTags[name] = content;
      }
    });
    
    // Clean up extracted text
    const cleanedText = textContent
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000); // Limit to 2000 characters
    
    return NextResponse.json({
      text: cleanedText,
      metaData: metaTags
    });
  } catch (error) {
    console.error('Error fetching URL:', error);
    return NextResponse.json({ error: 'Failed to fetch URL content' }, { status: 500 });
  }
}

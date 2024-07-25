export async function POST(req: Request) {
  const { apiKey, message, voice } = await req.json();

  try {
      const url = new URL('http://127.0.0.1:9880');
      url.searchParams.append('text', message);
      url.searchParams.append('text_language', 'zh');
  
      const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          }
      });
  
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const audio = await response.arrayBuffer();
  
      return new Response(audio, {
          headers: { "Content-Type": "audio/mpeg" }
      });
  } catch (error: any) {
      console.error(error);
      return Response.json({ error: error.message }, { status: error.statusCode || 500 });
  }
}

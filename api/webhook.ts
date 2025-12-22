export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    const MY_VERIFY_TOKEN = "caramelo123"; 

    if (mode === 'subscribe' && token === MY_VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
    return new Response('Verificacao falhou', { status: 403 });
  }

  if (req.method === 'POST') {
    return new Response(JSON.stringify({ status: 'received' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  }

  return new Response('Metodo nao permitido', { status: 405 });
} 

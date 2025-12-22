export const config = {
  runtime: 'edge', // Vibe 2025: Roda super rápido
};

export default async function handler(req: Request) {
  const url = new URL(req.url);

  // 1. VERIFICAÇÃO DO WHATSAPP (O "Aperto de Mão")
  // Quando você colocar a URL no Facebook, ele vai mandar um teste aqui.
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    // Defina uma senha aqui. Ex: "caramelo123"
    // Lembre-se dela para colocar no Facebook depois.
    const MY_VERIFY_TOKEN = "caramelo123"; 

    if (mode === 'subscribe' && token === MY_VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
    return new Response('Verificacao falhou', { status: 403 });
  }

  // 2. RECEBIMENTO DE MENSAGENS (POST)
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log("Mensagem recebida:", JSON.stringify(body, null, 2));
      
      // Aqui vamos colocar a logica do Gemini depois
      // Por enquanto, só avisamos o Facebook que recebemos OK
      return new Response(JSON.stringify({ status: 'received' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error) {
      return new Response('Erro no processamento', { status: 500 });
    }
  }

  return new Response('Metodo nao permitido', { status: 405 });
}

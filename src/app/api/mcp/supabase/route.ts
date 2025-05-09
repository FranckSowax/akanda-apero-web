// Handlers pour Next.js API Routes avec les types corrects

export async function GET() {
  return new Response(JSON.stringify({ message: "API disabled for production build" }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST() {
  return new Response(JSON.stringify({ message: "API disabled for production build" }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

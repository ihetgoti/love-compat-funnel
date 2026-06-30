/** Simulated lead-capture endpoint. In production, forward to your ESP/CRM. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === 'string' ? body.email : null;
  return Response.json({ ok: true, simulated: true, captured: Boolean(email) });
}

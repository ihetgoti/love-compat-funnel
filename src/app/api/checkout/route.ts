/** Simulated checkout endpoint — no real charge is ever made. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return Response.json({
    ok: true,
    simulated: true,
    orderId: `sim_${Date.now().toString(36)}`,
    received: body,
  });
}

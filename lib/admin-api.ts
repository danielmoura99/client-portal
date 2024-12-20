// lib/admin-api.ts
const ADMIN_API_URL = process.env.ADMIN_API_URL;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncWithControlSystem(userId: string, data: any) {
  const response = await fetch(`${ADMIN_API_URL}/sync-client`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_API_KEY}`,
    },
    body: JSON.stringify({
      userId,
      ...data,
    }),
  });

  if (!response.ok) {
    throw new Error("Falha ao sincronizar com sistema de controle");
  }

  return response.json();
}

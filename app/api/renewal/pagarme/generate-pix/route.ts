// app/api/renewal/pagarme/generate-pix/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { evaluationId, renewalType } = await request.json()

  if (!evaluationId || !renewalType) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
  }

  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL
  const apiKey = process.env.API_KEY

  if (!adminUrl || !apiKey) {
    return NextResponse.json({ error: "Configuração ausente" }, { status: 500 })
  }

  const response = await fetch(
    `${adminUrl}/api/client-portal/pagarme/generate-platform-pix`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ evaluationId, renewalType }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error || data.message || "Erro ao gerar PIX" },
      { status: response.status }
    )
  }

  return NextResponse.json(data)
}

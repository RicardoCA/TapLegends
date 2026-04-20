import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const userId = (session.user as Record<string, unknown>).id as string;

        const gameSave = await db.gameSave.findUnique({
            where: { userId },
            select: {
                achievementsJson: true,
            },
        });

        const achievements: string[] = gameSave?.achievementsJson
            ? JSON.parse(gameSave.achievementsJson)
            : [];

        return NextResponse.json({ achievements });
    } catch {
        return NextResponse.json({ error: "Erro ao buscar conquistas" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const userId = (session.user as Record<string, unknown>).id as string;
        const { achievements } = await req.json();

        await db.gameSave.update({
            where: { userId },
            data: {
                achievementsJson: JSON.stringify(achievements),
            },
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Erro ao salvar conquistas" }, { status: 500 });
    }
}
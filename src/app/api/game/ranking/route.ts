import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const rankings = await db.gameSave.findMany({
            select: {
                gold: true,
                totalGold: true,
                user: {
                    select: {
                        username: true,
                    },
                },
            },
            orderBy: {
                totalGold: "desc",
            },
            take: 50,
        });

        const formattedRankings = rankings.map((r, index) => ({
            rank: index + 1,
            username: r.user.username,
            gold: r.gold,
            totalGold: r.totalGold,
        }));

        return NextResponse.json({ rankings: formattedRankings });
    } catch {
        return NextResponse.json({ error: "Erro ao buscar ranking" }, { status: 500 });
    }
}
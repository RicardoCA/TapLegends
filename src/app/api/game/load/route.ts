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

    const userId = (session.user as Record<string, unknown>).id as string;
    const save = await db.gameSave.findUnique({ where: { userId } });

    if (!save) {
      return NextResponse.json({ saveData: null });
    }

    return NextResponse.json({
      saveData: {
        gold: save.gold,
        totalGold: save.totalGold,
        zone: save.zone,
        maxZone: save.maxZone,
        totalKills: save.totalKills,
        totalClicks: save.totalClicks,
        clickUpgradeLevel: save.clickUpgradeLevel,
        zoneLocked: save.zoneLocked,
        heroes: JSON.parse(save.heroesJson),
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar" }, { status: 500 });
  }
}

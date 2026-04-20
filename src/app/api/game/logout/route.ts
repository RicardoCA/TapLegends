import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const saveData = await req.json();

    await db.gameSave.upsert({
      where: { userId },
      update: {
        gold: saveData.gold ?? 0,
        totalGold: saveData.totalGold ?? 0,
        zone: saveData.zone ?? 1,
        maxZone: saveData.maxZone ?? 1,
        totalKills: saveData.totalKills ?? 0,
        totalClicks: saveData.totalClicks ?? 0,
        clickUpgradeLevel: saveData.clickUpgradeLevel ?? 0,
        zoneLocked: saveData.zoneLocked ?? false,
        heroesJson: JSON.stringify(saveData.heroes ?? []),
        lastLogout: new Date(),
      },
      create: {
        userId,
        gold: saveData.gold ?? 0,
        totalGold: saveData.totalGold ?? 0,
        zone: saveData.zone ?? 1,
        maxZone: saveData.maxZone ?? 1,
        totalKills: saveData.totalKills ?? 0,
        totalClicks: saveData.totalClicks ?? 0,
        clickUpgradeLevel: saveData.clickUpgradeLevel ?? 0,
        zoneLocked: saveData.zoneLocked ?? false,
        heroesJson: JSON.stringify(saveData.heroes ?? []),
        lastLogout: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar logout" }, { status: 500 });
  }
}

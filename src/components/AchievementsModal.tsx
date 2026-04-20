'use client';

import { Award, Lock, Unlock } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getAchievementsUpToZone } from '@/data/achievements';

interface AchievementsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unlockedAchievements: string[];
    maxZone: number;
}

export function AchievementsModal({ open, onOpenChange, unlockedAchievements, maxZone }: AchievementsModalProps) {
    const unlockedSet = new Set(unlockedAchievements);
    const achievements = getAchievementsUpToZone(maxZone);
    const unlockedCount = unlockedAchievements.length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-purple-400">
                        <Award className="h-5 w-5" />
                        Conquistas
                        <Badge variant="outline" className="ml-auto">
                            {unlockedCount}/{achievements.length}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="text-center py-2 text-sm text-muted-foreground">
                    Derrote monstros e chefes para desbloquear conquistas!
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-1">
                        {achievements.map((achievement) => {
                            const isUnlocked = unlockedSet.has(achievement.id);
                            return (
                                <div
                                    key={achievement.id}
                                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isUnlocked
                                        ? 'bg-purple-400/10 border border-purple-400/20'
                                        : 'bg-muted/30 opacity-60'
                                        }`}
                                >
                                    <div
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl ${isUnlocked
                                            ? 'bg-purple-400/20'
                                            : 'bg-muted grayscale'
                                            }`}
                                    >
                                        {achievement.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`font-medium truncate ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}
                                            >
                                                {achievement.name}
                                            </span>
                                            {achievement.isBoss && (
                                                <Badge
                                                    variant="destructive"
                                                    className="text-[8px] px-1 py-0 h-4"
                                                >
                                                    CHEFE
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {achievement.description}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {isUnlocked ? (
                                            <Unlock className="h-5 w-5 text-green-400" />
                                        ) : (
                                            <Lock className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    🏆 {unlockedCount} de {achievements.length} conquistas desbloqueadas
                    {achievements.length > 0 && (
                        <> · {Math.round((unlockedCount / achievements.length) * 100)}%</>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

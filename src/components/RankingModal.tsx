'use client';

import { useState, useEffect } from 'react';
import { Trophy, X, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface RankingEntry {
    rank: number;
    username: string;
    gold: number;
    totalGold: number;
}

function formatNumber(num: number): string {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

interface RankingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RankingModal({ open, onOpenChange }: RankingModalProps) {
    const [rankings, setRankings] = useState<RankingEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            fetchRankings();
        }
    }, [open]);

    const fetchRankings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/game/ranking');
            if (!res.ok) throw new Error('Erro ao carregar ranking');
            const data = await res.json();
            setRankings(data.rankings);
        } catch {
            setError('Não foi possível carregar o ranking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-400">
                        <Trophy className="h-5 w-5" />
                        Ranking de Moedas
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-destructive">
                            {error}
                        </div>
                    ) : rankings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhum jogador no ranking ainda
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {rankings.map((entry, index) => (
                                <div
                                    key={entry.rank}
                                    className={`flex items-center gap-3 p-2 rounded-lg ${index < 3
                                            ? 'bg-amber-400/10 border border-amber-400/20'
                                            : 'bg-muted/50'
                                        }`}
                                >
                                    <div
                                        className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${index === 0
                                                ? 'bg-amber-400 text-amber-950'
                                                : index === 1
                                                    ? 'bg-gray-300 text-gray-800'
                                                    : index === 2
                                                        ? 'bg-amber-600 text-white'
                                                        : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {entry.rank}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">
                                            {entry.username}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Total: 🪙 {formatNumber(entry.totalGold)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-mono text-amber-400">
                                            🪙 {formatNumber(entry.gold)}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            Atual
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    🪙 Ouro Atual = moedas que você tem agora
                    <br />
                    💰 Total = moedas coletadas na vida toda
                </div>
            </DialogContent>
        </Dialog>
    );
}
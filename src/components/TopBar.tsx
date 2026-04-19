'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ChevronLeft, ChevronRight, RotateCcw, Save, Skull, Target, Volume2, VolumeX, LogOut, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { sounds } from '@/lib/sounds';
import { signOut } from 'next-auth/react';

function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.floor(num).toString();
}

export function TopBar() {
  const {
    gold,
    zone,
    maxZone,
    totalDps,
    clickDamage,
    isBossFight,
    bossTimer,
    totalKills,
    totalClicks,
    zoneLocked,
    prevZone,
    nextZone,
    saveGame,
    resetGame,
    toggleZoneLock,
  } = useGameStore();

  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const toggleSound = () => {
    sounds.toggle();
    setSoundEnabled(sounds.isEnabled());
  };

  const handleSave = () => {
    saveGame();
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handleReset = () => {
    resetGame();
    setResetDialogOpen(false);
  };

  return (
    <div className="flex items-center justify-between px-2 sm:px-3 py-2 bg-card/80 border-b border-border/50 backdrop-blur-sm">
      {/* Zone navigation */}
      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
          onClick={prevZone}
          disabled={zone <= 1}
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>

        <div className="text-center min-w-[70px] sm:min-w-[100px]">
          <div className="text-[9px] sm:text-xs text-muted-foreground uppercase tracking-wider">Zona</div>
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <span className="text-lg sm:text-xl font-bold text-foreground">{zone}</span>
            {isBossFight && (
              <Badge
                variant="destructive"
                className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-4 sm:h-5 animate-pulse"
              >
                CHEFE
              </Badge>
            )}
          </div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground">
            Máx: {maxZone}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
          onClick={nextZone}
          disabled={zone >= maxZone + 1}
        >
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>

        {/* Zone Lock Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 sm:h-8 sm:w-8 ${zoneLocked
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
                onClick={toggleZoneLock}
              >
                {zoneLocked ? (
                  <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <Unlock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{zoneLocked ? 'Zona travada — não avançar' : 'Zona destravada — avançar automaticamente'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center min-w-0">
        {/* Gold */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-base sm:text-lg">🪙</span>
                <span className="text-sm sm:text-base font-bold text-amber-400 text-glow-gold font-mono truncate max-w-[60px] sm:max-w-none">
                  {formatNumber(gold)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ouro total acumulado: {formatNumber(useGameStore.getState().totalGold)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* DPS */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="text-xs sm:text-sm">⚔️</span>
          <div>
            <div className="text-[8px] sm:text-[10px] text-muted-foreground leading-tight">DPS</div>
            <span className="text-xs sm:text-sm font-bold text-green-400 text-glow-green font-mono">
              {formatNumber(totalDps)}
            </span>
          </div>
        </div>

        {/* Click damage - hidden on small screens */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-sm">👆</span>
          <div>
            <div className="text-[10px] text-muted-foreground leading-tight">Clique</div>
            <span className="text-sm font-bold text-red-400 text-glow-red font-mono">
              {formatNumber(clickDamage)}
            </span>
          </div>
        </div>

        {/* Kills - hidden on small screens */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="hidden md:flex items-center gap-1">
                <Skull className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">
                  {formatNumber(totalKills)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Monstros derrotados: {totalKills.toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Clicks - hidden on small screens */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="hidden md:flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">
                  {formatNumber(totalClicks)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total de cliques: {totalClicks.toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        {/* Sound toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-amber-400"
                onClick={toggleSound}
              >
                {soundEnabled ? (
                  <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{soundEnabled ? 'Desativar sons' : 'Ativar sons'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Save button with visual feedback */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 sm:h-8 sm:w-8 transition-all duration-300 ${saveFeedback
                  ? 'text-green-400 scale-110'
                  : 'text-muted-foreground hover:text-amber-400'
                  }`}
                onClick={handleSave}
              >
                <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{saveFeedback ? '✅ Salvo com sucesso!' : 'Salvar jogo'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Reset */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
                onClick={() => setResetDialogOpen(true)}
              >
                <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reiniciar jogo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Sign out */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-red-400"
                onClick={() => {
                  signOut({ callbackUrl: '/login' });
                }}
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sair da conta</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reiniciar Jogo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja reiniciar o jogo? <strong className="text-destructive">Todo o seu progresso será permanentemente apagado.</strong> Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reiniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

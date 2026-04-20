'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ChevronLeft, ChevronRight, RotateCcw, Save, Skull, Target, Volume2, VolumeX, LogOut, Lock, Unlock, Menu, Trophy, Award } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { sounds } from '@/lib/sounds';
import { signOut } from 'next-auth/react';
import { RankingModal } from '@/components/RankingModal';
import { AchievementsModal } from '@/components/AchievementsModal';

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
    bossDefeated,
    totalKills,
    totalClicks,
    zoneLocked,
    achievements,
    newAchievement,
    clearAchievementNotification,
    prevZone,
    nextZone,
    saveGame,
    resetGame,
    toggleZoneLock,
  } = useGameStore();

  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rankingOpen, setRankingOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);

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

  const handleLogout = async () => {
    const state = useGameStore.getState();
    try {
      await fetch('/api/game/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gold: state.gold,
          totalGold: state.totalGold,
          zone: state.zone,
          maxZone: state.maxZone,
          heroes: state.heroes,
          totalKills: state.totalKills,
          totalClicks: state.totalClicks,
          clickUpgradeLevel: state.clickUpgradeLevel,
          zoneLocked: state.zoneLocked,
        }),
      });
    } catch {
      // proceed with logout anyway
    }
    signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      {/* Desktop Navbar - visible on sm and up */}
      <div className="hidden sm:flex items-center justify-between px-2 sm:px-3 py-2 bg-card/80 border-b border-border/50 backdrop-blur-sm">
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
            disabled={zone >= maxZone && !bossDefeated}
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

          {/* Ranking */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-amber-400"
                  onClick={() => setRankingOpen(true)}
                >
                  <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ranking de Moedas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Achievements */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-purple-400 relative"
                  onClick={() => setAchievementsOpen(true)}
                >
                  <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {achievements.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-purple-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {achievements.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Conquistas ({achievements.length} desbloqueadas)</p>
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
                  onClick={handleLogout}
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
      </div>

      {/* Mobile Navbar - visible only on xs */}
      <div className="flex sm:hidden items-center justify-between px-2 py-2 bg-card/80 border-b border-border/50 backdrop-blur-sm">
        {/* Zone navigation - simplified */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={prevZone}
            disabled={zone <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-center min-w-[60px]">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Zona</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-lg font-bold text-foreground">{zone}</span>
              {isBossFight && (
                <Badge
                  variant="destructive"
                  className="text-[8px] px-1 py-0 h-4 animate-pulse"
                >
                  CHEFE
                </Badge>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={nextZone}
            disabled={zone >= maxZone && !bossDefeated}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${zoneLocked
              ? 'text-amber-400 hover:text-amber-300'
              : 'text-muted-foreground hover:text-foreground'
              }`}
            onClick={toggleZoneLock}
          >
            {zoneLocked ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Gold and DPS - center */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-base">🪙</span>
            <span className="text-sm font-bold text-amber-400 text-glow-gold font-mono">
              {formatNumber(gold)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs">⚔️</span>
            <span className="text-xs font-bold text-green-400 font-mono">
              {formatNumber(totalDps)}
            </span>
          </div>
        </div>

        {/* Menu button */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="p-4 border-b border-border/50">
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col py-2">
              {/* Stats Section */}
              <div className="px-4 py-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Estatísticas</div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skull className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Monstros</span>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatNumber(totalKills)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Cliques</span>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatNumber(totalClicks)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">👆</span>
                      <span className="text-sm">Dano por clique</span>
                    </div>
                    <span className="text-sm font-mono text-red-400">
                      {formatNumber(clickDamage)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">⚔️</span>
                      <span className="text-sm">DPS</span>
                    </div>
                    <span className="text-sm font-mono text-green-400">
                      {formatNumber(totalDps)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🪙</span>
                      <span className="text-sm">Ouro</span>
                    </div>
                    <span className="text-sm font-mono text-amber-400">
                      {formatNumber(gold)}
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Actions Section */}
              <div className="px-4 py-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Ações</div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11"
                    onClick={() => {
                      toggleSound();
                    }}
                  >
                    {soundEnabled ? (
                      <>
                        <Volume2 className="h-5 w-5" />
                        <span>Som ativado</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="h-5 w-5" />
                        <span>Som desativado</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-11 ${saveFeedback ? 'text-green-400' : ''}`}
                    onClick={() => {
                      handleSave();
                    }}
                  >
                    <Save className="h-5 w-5" />
                    <span>{saveFeedback ? '✅ Salvo!' : 'Salvar jogo'}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11 text-destructive hover:text-destructive"
                    onClick={() => {
                      setMenuOpen(false);
                      setTimeout(() => setResetDialogOpen(true), 100);
                    }}
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span>Reiniciar jogo</span>
                  </Button>

                  <Separator className="my-2" />

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11"
                    onClick={() => {
                      setMenuOpen(false);
                      setRankingOpen(true);
                    }}
                  >
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <span>Ranking de Moedas</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11"
                    onClick={() => {
                      setMenuOpen(false);
                      setAchievementsOpen(true);
                    }}
                  >
                    <Award className="h-5 w-5 text-purple-400" />
                    <span>Conquistas ({achievements.length} desbloqueadas)</span>
                  </Button>

                  <Separator className="my-2" />

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11 text-red-400 hover:text-red-300"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sair da conta</span>
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
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

      {/* Ranking Modal */}
      <RankingModal open={rankingOpen} onOpenChange={setRankingOpen} />

      {/* Achievements Modal */}
      <AchievementsModal open={achievementsOpen} onOpenChange={setAchievementsOpen} unlockedAchievements={achievements} maxZone={maxZone} />
    </>
  );
}

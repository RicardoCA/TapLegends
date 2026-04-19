'use client';

import { Game } from '@/components/Game';
import { AuthGuard } from '@/components/AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <Game />
    </AuthGuard>
  );
}

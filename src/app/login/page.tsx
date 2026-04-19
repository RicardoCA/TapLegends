'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Erro ao criar conta');
          setIsLoading(false);
          return;
        }

        // Auto sign in after registration
        const result = await signIn('credentials', {
          username,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Erro ao fazer login após registro');
        } else {
          router.push('/');
          router.refresh();
        }
      } else {
        const result = await signIn('credentials', {
          username,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Usuário ou senha inválidos');
        } else {
          router.push('/');
          router.refresh();
        }
      }
    } catch {
      setError('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            left: '10%',
            top: '20%',
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)',
            right: '10%',
            bottom: '20%',
          }}
        />
        <div
          className="absolute w-72 h-72 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
            left: '50%',
            top: '60%',
          }}
        />
        {/* Animated floating particles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-1 h-1 bg-amber-400 rounded-full top-[15%] left-[20%] animate-pulse" />
          <div className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full top-[25%] left-[70%] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute w-1 h-1 bg-red-400 rounded-full top-[60%] left-[30%] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full top-[75%] left-[80%] animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute w-1 h-1 bg-purple-400 rounded-full top-[40%] left-[10%] animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-amber-400 text-glow-gold mb-2 tracking-tight">
            ⚔️ Tap Legends
          </h1>
          <p className="text-muted-foreground text-sm">
            Derrote monstros, contrate heróis, conquiste zonas!
          </p>
        </div>

        {/* Card */}
        <Card className="bg-card/80 border-amber-800/30 backdrop-blur-sm shadow-2xl shadow-amber-900/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl text-foreground">
              {isRegister ? 'Criar Conta' : 'Entrar no Jogo'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isRegister
                ? 'Crie sua conta para começar a aventura'
                : 'Entre com suas credenciais para continuar'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm text-muted-foreground">
                  👤 Usuário
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Seu nome de usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background/50 border-border/60 focus:border-amber-500/50 focus:ring-amber-500/20"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-muted-foreground">
                  🔒 Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background/50 border-border/60 focus:border-amber-500/50 focus:ring-amber-500/20"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-300 text-sm text-center">
                  ⚠️ {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100 font-bold text-base h-11 shadow-lg shadow-amber-900/30 transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-amber-200/30 border-t-amber-200 rounded-full animate-spin" />
                    {isRegister ? 'Criando conta...' : 'Entrando...'}
                  </span>
                ) : (
                  <span>{isRegister ? '🛡️ Criar Conta' : '⚔️ Entrar'}</span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <div className="w-full border-t border-border/30 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="w-full text-center text-sm text-muted-foreground hover:text-amber-400 transition-colors py-2"
              >
                {isRegister
                  ? 'Já tem uma conta? Entrar'
                  : 'Não tem conta? Criar conta grátis'}
              </button>
            </div>
          </CardFooter>
        </Card>

        {/* Footer text */}
        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Seu progresso é salvo automaticamente no servidor
        </p>
      </div>
    </div>
  );
}

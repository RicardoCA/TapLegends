---
Task ID: 1
Agent: Main Agent
Task: Fix hero upgrade/purchase buttons not working + Fix logout redirect to localhost

Work Log:
- Read all key project files: HeroPanel.tsx, gameStore.ts, TopBar.tsx, Game.tsx, BossDisplay.tsx, sounds.ts, heroes.ts, auth.ts, login page, API routes, globals.css, .env, Caddyfile, next.config.ts
- Identified potential root cause for buy buttons: store's heroes array could be empty after loadGame() if server/localStorage save had empty heroes array (empty array is truthy in JS, so `[] || initializeHeroes()` returns `[]`)
- When heroes array is empty, `findIndex` returns -1 in `levelUpHeroByAmount`, causing silent return with no purchase
- Rewrote HeroPanel.tsx completely: removed e.stopPropagation/e.preventDefault from buy buttons, added visual buy flash feedback (green flash on successful click), added explicit pointer-events and z-index styles, used useCallback for handlers, changed overflow from hidden to auto
- Made gameStore.ts `levelUpHeroByAmount` robust: if hero not found, it now re-initializes missing heroes from HEROES data and retries
- Made gameStore.ts `loadGame` robust: both server and localStorage fallbacks now ensure heroes array is never empty and all HEROES entries exist
- Fixed TopBar.tsx logout redirect: changed from `signOut({ callbackUrl: '/login' })` to `signOut({ redirect: false }).then(() => router.push('/login'))` - this avoids NextAuth constructing a localhost URL
- Added NEXTAUTH_URL and NEXTAUTH_SECRET to .env file
- Build passes successfully, dev server runs without errors

Stage Summary:
- Hero buy buttons: Fixed potential root cause (empty heroes array after load) + made store defensive + simplified UI click handling
- Logout redirect: Fixed by using router.push instead of NextAuth callbackUrl
- NEXTAUTH_URL: Added to .env for proper URL construction
- Build: PASS

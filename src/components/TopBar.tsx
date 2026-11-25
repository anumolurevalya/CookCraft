import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { UserSession } from '../data/recipes';

export type AppView =
  | 'home'
  | 'recipes'
  | 'dietary'
  | 'studio'
  | 'favorites'
  | 'share'
  | 'account'
  | 'detail'
  | 'admin';

interface TopBarProps {
  activeView: AppView;
  user: UserSession | null;
  favoritesCount: number;
  onNavigate: (view: AppView) => void;
}

export default function TopBar({
  activeView,
  user,
  favoritesCount,
  onNavigate,
}: TopBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: AppView) => {
    setMobileMenuOpen(false);
    onNavigate(view);
  };

  const navItems: Array<{ id: AppView; label: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'recipes', label: 'Recipes' },
    { id: 'dietary', label: 'Dietary' },
    { id: 'studio', label: '3D Studio' },
    { id: 'favorites', label: favoritesCount > 0 ? `Favorites (${favoritesCount})` : 'Favorites' },
    { id: 'admin', label: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#e6e2d6]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 h-[68px] flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="font-display text-2xl font-bold tracking-tight text-[#315c43] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315c43]"
        >
          Recipe<span className="text-[#e88b52]">Hub</span>
        </button>

        {/* Zone 2: Clean single-line typography nav links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`relative py-1 text-[15px] font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315c43] ${
                  isActive
                    ? 'text-[#315c43] underline decoration-[#e88b52] decoration-2 underline-offset-[6px]'
                    : 'text-[#252b25] hover:text-[#e88b52]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action + mobile menu trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('account')}
            className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#315c43] hover:bg-[#244632] text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315c43]"
          >
            {user ? user.name : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#e6e2d6] text-[#252b25] hover:bg-[#fbf8f1] cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#e6e2d6] px-5 py-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap ${
                  isActive
                    ? 'bg-[#315c43]/10 text-[#315c43]'
                    : 'text-[#252b25] hover:bg-[#fbf8f1]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleNav('account')}
            className="mt-1 w-full px-4 py-2.5 rounded-lg bg-[#315c43] text-white text-sm font-semibold text-center"
          >
            {user ? `Account: ${user.name}` : 'Login / Signup'}
          </button>
        </div>
      )}
    </header>
  );
}

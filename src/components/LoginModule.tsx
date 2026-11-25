import { KeyRound, LogOut, ShieldCheck, UserCheck, UserPlus } from 'lucide-react';
import { useState } from 'react';
import {
  loadRegisteredUsers,
  saveRegisteredUsers,
  type RegisteredUser,
  type UserSession,
} from '../data/recipes';
import type { AppView } from './TopBar';

interface LoginModuleProps {
  user: UserSession | null;
  favoritesCount: number;
  recipesCount: number;
  onLoginSuccess: (session: UserSession) => void;
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
}

export default function LoginModule({
  user,
  favoritesCount,
  recipesCount,
  onLoginSuccess,
  onLogout,
  onNavigate,
}: LoginModuleProps) {
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() =>
    loadRegisteredUsers(),
  );

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || !password) {
      setFeedback({ type: 'error', text: 'Please enter both a username and password.' });
      return;
    }

    if (role === 'admin') {
      if (trimmed === 'admin' && password === 'admin123') {
        const session: UserSession = { name: 'admin', role: 'admin' };
        onLoginSuccess(session);
        setFeedback({ type: 'success', text: 'Admin login successful.' });
        return;
      }
      setFeedback({
        type: 'error',
        text: 'Invalid Admin credentials. Use admin / admin123.',
      });
      return;
    }

    // Check registered user list first, or allow any non-empty demo User credentials
    const matched = registeredUsers.find(
      (u) => u.username.toLowerCase() === trimmed.toLowerCase(),
    );
    if (matched && matched.password !== password) {
      setFeedback({ type: 'error', text: 'Incorrect password for this account.' });
      return;
    }

    const session: UserSession = {
      name: matched ? matched.displayName : trimmed,
      role: 'user',
    };
    onLoginSuccess(session);
    setFeedback({ type: 'success', text: `Signed in as ${session.name}.` });
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUser = username.trim();
    const trimmedDisplay = displayName.trim() || trimmedUser;
    if (!trimmedUser || !password) {
      setFeedback({ type: 'error', text: 'Enter a username and password to create an account.' });
      return;
    }
    if (trimmedUser.toLowerCase() === 'admin') {
      setFeedback({ type: 'error', text: 'The username "admin" is reserved.' });
      return;
    }
    if (
      registeredUsers.some((u) => u.username.toLowerCase() === trimmedUser.toLowerCase())
    ) {
      setFeedback({
        type: 'error',
        text: 'That username is already registered. Switch to Sign In.',
      });
      return;
    }

    const nextUsers: RegisteredUser[] = [
      ...registeredUsers,
      {
        username: trimmedUser,
        password,
        displayName: trimmedDisplay,
        role: 'user',
      },
    ];
    setRegisteredUsers(nextUsers);
    saveRegisteredUsers(nextUsers);
    onLoginSuccess({ name: trimmedDisplay, role: 'user' });
    setFeedback({
      type: 'success',
      text: `Account created for ${trimmedDisplay}. You are now signed in.`,
    });
  };

  const fillAdminDemo = () => {
    setAuthTab('login');
    setRole('admin');
    setUsername('admin');
    setPassword('admin123');
    setFeedback(null);
  };

  const fillUserDemo = () => {
    setAuthTab('login');
    setRole('user');
    setUsername('ananya');
    setPassword('spice123');
    setFeedback(null);
  };

  if (user) {
    return (
      <section className="max-w-3xl mx-auto bg-white border border-[#e6e2d6] rounded-2xl p-6 md:p-9">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[#ece8dc]">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-[#c56b34] mb-1">
              Active Session
            </p>
            <h2 className="font-display text-3xl font-bold text-[#252b25]">
              Welcome, {user.name}
            </h2>
            <p className="text-sm text-[#666d63] mt-1 flex items-center gap-2">
              {user.role === 'admin' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#315c43]" />
                  <span>Administrator · Full recipe publishing &amp; catalog management</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-[#315c43]" />
                  <span>Community Cook · Browse recipes, save favorites &amp; inspect 3D dishes</span>
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e6e2d6] text-sm font-semibold text-[#666d63] hover:text-[#b93829] hover:border-[#b93829]/40 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-[#ece8dc]">
          <div className="p-4 rounded-xl bg-[#fbf8f1] border border-[#ece8dc]">
            <div className="text-xs font-medium text-[#666d63]">Account Role</div>
            <div className="text-lg font-semibold text-[#252b25] mt-1 capitalize">
              {user.role}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#fbf8f1] border border-[#ece8dc]">
            <div className="text-xs font-medium text-[#666d63]">Saved Favorites</div>
            <div className="text-lg font-semibold text-[#252b25] mt-1 tabular-nums">
              {favoritesCount}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#fbf8f1] border border-[#ece8dc]">
            <div className="text-xs font-medium text-[#666d63]">Catalog Recipes</div>
            <div className="text-lg font-semibold text-[#252b25] mt-1 tabular-nums">
              {recipesCount}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-6">
          <button
            type="button"
            onClick={() => onNavigate('recipes')}
            className="px-5 py-2.5 rounded-lg bg-[#315c43] hover:bg-[#244632] text-white text-sm font-bold cursor-pointer transition-colors"
          >
            Browse Recipes
          </button>
          <button
            type="button"
            onClick={() => onNavigate('favorites')}
            className="px-5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white hover:bg-[#fbf8f1] text-[#252b25] text-sm font-bold cursor-pointer transition-colors"
          >
            View Favorites
          </button>
          {user.role === 'admin' && (
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="px-5 py-2.5 rounded-lg bg-[#e88b52] hover:bg-[#d77a41] text-white text-sm font-bold cursor-pointer transition-colors"
            >
              Open Admin Module
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto bg-white border border-[#e6e2d6] rounded-2xl p-6 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-[#c56b34] mb-1">
            RecipeHub Account
          </p>
          <h2 className="font-display text-3xl font-bold text-[#252b25]">
            {authTab === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-[#f4f1ea] rounded-lg">
          <button
            type="button"
            onClick={() => {
              setAuthTab('login');
              setFeedback(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              authTab === 'login'
                ? 'bg-white text-[#252b25] shadow-xs'
                : 'text-[#666d63] hover:text-[#252b25]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthTab('signup');
              setRole('user');
              setFeedback(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              authTab === 'signup'
                ? 'bg-white text-[#252b25] shadow-xs'
                : 'text-[#666d63] hover:text-[#252b25]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>
        </div>
      </div>

      {/* Quick Demo Fill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#fbf8f1] border border-[#ece8dc] mb-6 text-xs text-[#555c52]">
        <span>
          Admin demo: <strong className="text-[#252b25]">admin / admin123</strong> · Or sign in as
          any User.
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fillUserDemo}
            className="px-2.5 py-1 rounded-md border border-[#e6e2d6] bg-white font-semibold text-[#315c43] hover:bg-[#f4f1ea] cursor-pointer"
          >
            Fill User
          </button>
          <button
            type="button"
            onClick={fillAdminDemo}
            className="px-2.5 py-1 rounded-md border border-[#e6e2d6] bg-white font-semibold text-[#c56b34] hover:bg-[#f4f1ea] cursor-pointer"
          >
            Fill Admin
          </button>
        </div>
      </div>

      {authTab === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="login-username" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Username
              </label>
              <input
                id="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="login-role" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Sign in as
              </label>
              <select
                id="login-role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              >
                <option value="user">User (Home Cook)</option>
                <option value="admin">Admin (Catalog Manager)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#315c43] hover:bg-[#244632] text-white text-sm font-bold cursor-pointer transition-colors"
          >
            Sign In
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="signup-name" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Display name
              </label>
              <input
                id="signup-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Chef Aarav"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              />
            </div>

            <div>
              <label htmlFor="signup-username" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Username
              </label>
              <input
                id="signup-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                autoComplete="username"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#315c43] hover:bg-[#244632] text-white text-sm font-bold cursor-pointer transition-colors"
          >
            Create Account &amp; Sign In
          </button>
        </form>
      )}

      {feedback && (
        <p
          role="status"
          className={`mt-4 text-sm font-medium ${
            feedback.type === 'error' ? 'text-[#b93829]' : 'text-[#315c43]'
          }`}
        >
          {feedback.text}
        </p>
      )}
    </section>
  );
}

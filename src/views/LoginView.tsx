/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';

const { useState } = React;

interface LoginViewProps {
  onGoogleSignIn: () => void;
  onEmailSignIn: (email: string, password: string) => Promise<void>;
  onEmailSignUp: (displayName: string, email: string, password: string) => Promise<void>;
  authError: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({ onGoogleSignIn, onEmailSignIn, onEmailSignUp, authError }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      onEmailSignUp(displayName, email, password);
    } else {
      onEmailSignIn(email, password);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    // Clear fields when toggling to prevent confusion
    setEmail('');
    setPassword('');
    setDisplayName('');
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-black/50 p-10 rounded-lg shadow-2xl text-center text-white w-full max-w-md">
        <h1 className="font-display text-5xl mb-4 text-shadow">探偵のメモ帳</h1>
        <p className="font-body text-xl mb-8">{isSignUp ? '新しい捜査官として登録' : '事件ファイルにアクセス'}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="捜査官名 (表示名)"
              required
              className="bg-gray-700/50 text-white p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-[#5a3a22] focus:outline-none font-body"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            required
            autoComplete="email"
            className="bg-gray-700/50 text-white p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-[#5a3a22] focus:outline-none font-body"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            required
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className="bg-gray-700/50 text-white p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-[#5a3a22] focus:outline-none font-body"
          />
          {authError && <p className="text-red-400 text-sm font-body">{authError}</p>}
          <button
            type="submit"
            className="bg-[#5a3a22] hover:bg-[#7b5b43] text-white font-display text-xl py-3 px-8 rounded-md transition-colors duration-300 shadow-lg mt-2"
          >
            {isSignUp ? '登録して捜査開始' : 'ログイン'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400 font-body">または</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <button
          onClick={onGoogleSignIn}
          className="bg-white hover:bg-gray-200 text-gray-800 font-display text-lg py-3 px-6 rounded-md transition-colors duration-300 shadow-lg w-full flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Googleアカウントで捜査を開始
        </button>

        <p className="mt-8 font-body">
          {isSignUp ? 'アカウントをお持ちですか？ ' : '初めてですか？ '}
          <button onClick={toggleMode} className="text-amber-400 hover:underline font-bold">
            {isSignUp ? 'ログイン' : 'アカウント作成'}
          </button>
        </p>
      </div>
    </div>
  );
};
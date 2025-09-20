/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';

const { useState } = React;

interface LoginViewProps {
  onEmailSignIn: (email: string, password: string) => Promise<void>;
  onEmailSignUp: (displayName: string, email: string, password: string) => Promise<void>;
  authError: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({ onEmailSignIn, onEmailSignUp, authError }) => {
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

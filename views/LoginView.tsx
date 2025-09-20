/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';

interface LoginViewProps {
  onGoogleSignIn: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onGoogleSignIn }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-black/50 p-10 rounded-lg shadow-2xl text-center text-white">
        <h1 className="font-display text-5xl mb-4 text-shadow">探偵のメモ帳</h1>
        <p className="font-body text-xl mb-8">事件を解決に導く、あなただけの手がかりを整理しよう。</p>
        <button
          onClick={onGoogleSignIn}
          className="bg-[#5a3a22] hover:bg-[#7b5b43] text-white font-display text-xl py-3 px-8 rounded-md transition-colors duration-300 shadow-lg"
        >
          Googleアカウントで捜査を開始
        </button>
      </div>
    </div>
  );
};

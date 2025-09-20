/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import type { Case, PlainUser } from "../types/index.ts"

const { useState } = React;

type CaseSelectionEvents = {
  onCaseAdd: (name: string) => void;
  onCaseDelete: (caseId: string) => void;
  onCaseSelect: (caseId: string) => void;
  onInviteUser: (caseId: string, email: string) => void;
  onRemoveUser: (caseId: string, email: string) => void;
};

type CaseSelectionProps = {
    user: PlainUser;
    onSignOut: () => void;
    cases: Case[];
    events: CaseSelectionEvents;
};

const ShareModal = ({ caseItem, user, events, onClose }: { caseItem: Case, user: PlainUser, events: CaseSelectionEvents, onClose: () => void }) => {
    const [inviteEmail, setInviteEmail] = useState('');
    const isOwner = user.uid === caseItem.ownerId;

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (inviteEmail.trim()) {
            events.onInviteUser(caseItem.id, inviteEmail.trim());
            setInviteEmail('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[#f5eeda] text-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <h3 className="font-display text-2xl mb-1">共有設定</h3>
                <p className="font-body text-sm mb-4 truncate" title={caseItem.name}>ボード: {caseItem.name}</p>
                
                {isOwner && (
                    <form onSubmit={handleInvite} className="flex gap-2 mb-4">
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="招待するメンバーのメールアドレス"
                            className="flex-grow py-2 px-3 border border-gray-400 rounded-md font-body focus:ring-2 focus:ring-[#5a3a22] focus:outline-none"
                        />
                        <button type="submit" className="py-2 px-4 border-none bg-[#5a3a22] text-white font-display text-sm cursor-pointer rounded-md transition-colors hover:bg-[#7b5b43]">招待</button>
                    </form>
                )}

                <h4 className="font-display text-lg mt-4 mb-2">考察メンバー</h4>
                <div className="max-h-60 overflow-y-auto bg-white/50 p-2 rounded">
                    {caseItem.memberEmails.map(email => (
                        <div key={email} className="flex items-center justify-between p-2 hover:bg-black/10 rounded">
                            <span className="font-body truncate" title={email}>{email} {email === caseItem.ownerEmail && '(オーナー)'}</span>
                            {isOwner && email !== caseItem.ownerEmail && (
                                <button
                                    onClick={() => events.onRemoveUser(caseItem.id, email)}
                                    className="text-red-600 font-bold hover:text-red-800 transition-colors text-xl"
                                    aria-label={`Remove ${email}`}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="mt-6 w-full py-2 px-5 border-none bg-gray-500 text-white font-display text-base cursor-pointer rounded-md transition-colors hover:bg-gray-600">閉じる</button>
            </div>
        </div>
    );
};


const CaseCard = ({ caseItem, user, onSelect, onDelete, onShare }: { caseItem: Case, user: PlainUser, onSelect: (id: string) => void, onDelete: (id: string) => void, onShare: (id: string) => void }) => {
    const isOwner = user.uid === caseItem.ownerId;
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(caseItem.id);
    };
    
    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        onShare(caseItem.id);
    };

    return (
        <div 
            className="bg-yellow-200/50 p-4 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border-t-8 border-yellow-500/60 flex flex-col justify-between"
            onClick={() => onSelect(caseItem.id)}
        >
            <div>
              <h3 className="font-display text-xl font-bold mb-2 break-words">{caseItem.name}</h3>
              <p className="text-xs text-gray-600 font-body mb-2 truncate">オーナー: {caseItem.ownerEmail === user.email ? 'あなた' : caseItem.ownerEmail}</p>
            </div>
            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{`付箋: ${caseItem.notes.length}枚`}</span>
                    {caseItem.memberEmails.length > 1 && (
                      <div className="flex items-center gap-1 text-sm text-gray-600" title={caseItem.memberEmails.join(', ')}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                         <span>{caseItem.memberEmails.length}</span>
                      </div>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={handleShare} className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-full" aria-label={`Share case ${caseItem.name}`}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                    </button>
                    {isOwner && (
                        <button
                            onClick={handleDelete}
                            className="text-red-500 font-bold text-2xl hover:text-red-700 transition-colors leading-none px-2 rounded-full"
                            aria-label={`Delete case ${caseItem.name}`}
                        >&times;</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const CaseSelectionView: React.FC<CaseSelectionProps> = ({ user, onSignOut, cases, events }) => {
    const [caseNameInput, setCaseNameInput] = useState('');
    const [sharingCaseId, setSharingCaseId] = useState<string | null>(null);

    const handleAddCase = (e: React.FormEvent) => {
        e.preventDefault();
        const name = caseNameInput.trim();
        if (name) {
            events.onCaseAdd(name);
            setCaseNameInput('');
        }
    };

    const sharingCase = cases.find(c => c.id === sharingCaseId);

    return (
        <>
            <header className="bg-black/70 p-4 text-white shadow-lg z-10 shrink-0 flex items-center justify-between">
                <div className='w-1/3'>
                     <span className="text-sm truncate" title={user.email ?? ''}>ようこそ, {user.displayName} さん</span>
                </div>
                <div className="w-1/3 text-center">
                    <h1 className="font-display text-4xl text-shadow">考察ボード一覧</h1>
                </div>
                <div className='w-1/3 flex justify-end'>
                    <button onClick={onSignOut} className="py-2 px-4 border-none bg-red-600/80 text-white font-display text-base cursor-pointer rounded-md transition-colors hover:bg-red-700/80">ログアウト</button>
                </div>
            </header>
             <div className="bg-black/50 p-4 text-center shadow-md z-10 shrink-0">
                <form onSubmit={handleAddCase} className="flex justify-center gap-2.5">
                    <input 
                        type="text" 
                        value={caseNameInput}
                        onChange={(e) => setCaseNameInput(e.target.value)}
                        placeholder="新しいボード名 (作品名など)" 
                        autoComplete="off" 
                        required 
                        className="w-[300px] py-2.5 px-4 border border-gray-300 rounded-md text-base font-body focus:ring-2 focus:ring-[#5a3a22] focus:outline-none text-slate-800"
                    />
                    <button type="submit" className="py-2.5 px-5 border-none bg-[#5a3a22] text-white font-display text-base cursor-pointer rounded-md transition-colors hover:bg-[#7b5b43]">新しいボードを作成</button>
                </form>
            </div>
            <main className="p-8 overflow-y-auto flex-grow">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {cases.map(caseItem => (
                        <CaseCard 
                            key={caseItem.id} 
                            caseItem={caseItem} 
                            user={user}
                            onSelect={events.onCaseSelect}
                            onDelete={events.onCaseDelete}
                            onShare={setSharingCaseId}
                        />
                    ))}
                </div>
                 {cases.length === 0 && (
                    <div className="text-center text-white/70 mt-10 font-display text-2xl">
                        <p>まだ考察ボードがありません。</p>
                        <p>上のフォームから新しいボードを作成しましょう。</p>
                    </div>
                )}
            </main>
            {sharingCase && <ShareModal caseItem={sharingCase} user={user} events={events} onClose={() => setSharingCaseId(null)} />}
        </>
    );
};
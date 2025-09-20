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
};

type CaseSelectionProps = {
    user: PlainUser;
    onSignOut: () => void;
    cases: Case[];
    events: CaseSelectionEvents;
};

type CaseCardProps = {
    caseItem: Case;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
};

const CaseCard: React.FC<CaseCardProps> = ({ caseItem, onSelect, onDelete }) => {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(caseItem.id);
    };

    return (
        <div 
            className="bg-yellow-200/50 p-4 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border-t-8 border-yellow-500/60 flex flex-col justify-between"
            onClick={() => onSelect(caseItem.id)}
        >
            <h3 className="font-display text-xl font-bold mb-2 break-words">{caseItem.name}</h3>
            <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">{`メモ: ${caseItem.notes.length}件`}</p>
                <button
                    onClick={handleDelete}
                    className="text-red-500 font-bold text-2xl hover:text-red-700 transition-colors leading-none px-2 rounded-full"
                    aria-label={`Delete case ${caseItem.name}`}
                >&times;</button>
            </div>
        </div>
    );
};

export const CaseSelectionView: React.FC<CaseSelectionProps> = ({ user, onSignOut, cases, events }) => {
    const [caseNameInput, setCaseNameInput] = useState('');

    const handleAddCase = (e: React.FormEvent) => {
        e.preventDefault();
        const name = caseNameInput.trim();
        if (name) {
            events.onCaseAdd(name);
            setCaseNameInput('');
        }
    };

    return (
        <>
            <header className="bg-black/70 p-4 text-white shadow-lg z-10 shrink-0 flex items-center justify-between">
                <div className='w-1/3'>
                     <span className="text-sm" title={user.email ?? ''}>ようこそ, {user.displayName} さん</span>
                </div>
                <div className="w-1/3 text-center">
                    <h1 className="font-display text-4xl text-shadow">事件ファイル一覧</h1>
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
                        placeholder="新しい事件名..." 
                        autoComplete="off" 
                        required 
                        className="w-[300px] py-2.5 px-4 border border-gray-300 rounded-md text-base font-body focus:ring-2 focus:ring-[#5a3a22] focus:outline-none text-slate-800"
                    />
                    <button type="submit" className="py-2.5 px-5 border-none bg-[#5a3a22] text-white font-display text-base cursor-pointer rounded-md transition-colors hover:bg-[#7b5b43]">新しい事件を作成</button>
                </form>
            </div>
            <main className="p-8 overflow-y-auto flex-grow">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {cases.map(caseItem => (
                        <CaseCard 
                            key={caseItem.id} 
                            caseItem={caseItem} 
                            onSelect={events.onCaseSelect}
                            onDelete={events.onCaseDelete}
                        />
                    ))}
                </div>
                 {cases.length === 0 && (
                    <div className="text-center text-white/70 mt-10 font-display text-2xl">
                        <p>事件ファイルはまだありません。</p>
                        <p>上のフォームから新しい事件を作成しましょう。</p>
                    </div>
                )}
            </main>
        </>
    );
};
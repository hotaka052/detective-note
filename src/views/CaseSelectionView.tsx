/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import type { Case, PlainUser } from "../types/index.ts"

const { useState, useEffect } = React;

type CaseSelectionEvents = {
  onCaseAdd: (bookTitle: string, authorName: string, isPublic: boolean) => void;
  onCaseDelete: (caseId: string) => void;
  onCaseSelect: (caseId: string) => void;
  onUpdateVisibility: (caseId: string, isPublic: boolean) => void;
  onSearchPublic: (searchTerm: string) => void;
};

type CaseSelectionProps = {
    user: PlainUser;
    onSignOut: () => void;
    myCases: Case[];
    publicCases: Case[];
    events: CaseSelectionEvents;
};

const SettingsModal = ({ caseItem, events, onClose }: { caseItem: Case, events: CaseSelectionEvents, onClose: () => void }) => {
    const [isPublic, setIsPublic] = useState(caseItem.isPublic);

    const handleVisibilityToggle = () => {
        const newVisibility = !isPublic;
        setIsPublic(newVisibility);
        events.onUpdateVisibility(caseItem.id, newVisibility);
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[#f5eeda] text-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <h3 className="font-display text-2xl mb-1">ボード設定</h3>
                <p className="font-body text-sm mb-4 truncate" title={caseItem.bookTitle}>ボード: {caseItem.bookTitle}</p>
                
                <div className="mb-4 bg-white/50 p-3 rounded">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-display text-lg">ボードを公開する</span>
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={isPublic} onChange={handleVisibilityToggle} />
                            <div className={`block w-14 h-8 rounded-full ${isPublic ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isPublic ? 'translate-x-6' : ''}`}></div>
                        </div>
                    </label>
                     <p className="text-xs text-gray-600 mt-1">公開すると、他のユーザーがこのボードを検索・閲覧できるようになります。</p>
                </div>

                <button onClick={onClose} className="mt-6 w-full py-2 px-5 border-none bg-gray-500 text-white font-display text-base cursor-pointer rounded-md transition-colors hover:bg-gray-600">閉じる</button>
            </div>
        </div>
    );
};


const CaseCard = ({ caseItem, user, onSelect, onDelete, onSettings }: { caseItem: Case, user: PlainUser, onSelect: (id: string) => void, onDelete: (id: string) => void, onSettings: (id: string) => void }) => {
    const isOwner = user.uid === caseItem.ownerId;
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(caseItem.id);
    };
    
    const handleSettings = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSettings(caseItem.id);
    };

    return (
        <div 
            className="bg-yellow-200/50 p-4 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border-t-8 border-yellow-500/60 flex flex-col justify-between"
            onClick={() => onSelect(caseItem.id)}
        >
            <div>
              <div className="flex justify-between items-start">
                  <h3 className="font-display text-xl font-bold mb-1 break-words">{caseItem.bookTitle}</h3>
                  <span title={caseItem.isPublic ? "公開ボード" : "非公開ボード"} className="text-2xl">{caseItem.isPublic ? '🌍' : '🔒'}</span>
              </div>
              <p className="text-sm text-gray-700 font-body mb-2">作者: {caseItem.authorName}</p>
              <p className="text-xs text-gray-600 font-body mb-2 truncate">オーナー: {caseItem.ownerEmail === user.email ? 'あなた' : caseItem.ownerEmail}</p>
            </div>
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-600">{`付箋: ${caseItem.notes.length}枚`}</span>
                <div className="flex items-center gap-1">
                    {isOwner && (
                      <>
                        <button onClick={handleSettings} className="text-gray-600 hover:text-black transition-colors p-1 rounded-full" aria-label={`Settings for ${caseItem.bookTitle}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-red-500 font-bold text-2xl hover:text-red-700 transition-colors leading-none px-2 rounded-full"
                            aria-label={`Delete case ${caseItem.bookTitle}`}
                        >&times;</button>
                      </>
                    )}
                </div>
            </div>
        </div>
    );
};


const AddCaseForm = ({ onAddCase }: { onAddCase: CaseSelectionEvents['onCaseAdd'] }) => {
    const [bookTitle, setBookTitle] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (bookTitle.trim() && authorName.trim()) {
            onAddCase(bookTitle.trim(), authorName.trim(), isPublic);
            setBookTitle('');
            setAuthorName('');
            setIsPublic(false);
        }
    };
    
    return (
        <div className="bg-black/50 p-4 rounded-lg shadow-md z-10 shrink-0">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row justify-center items-center gap-3">
                <input 
                    type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="小説名" required autoComplete="off" 
                    className="w-full md:w-auto flex-grow py-2.5 px-4 border border-gray-300 rounded-md text-base font-body focus:ring-2 focus:ring-[#5a3a22] focus:outline-none text-slate-800"
                />
                 <input 
                    type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="作者名" required autoComplete="off" 
                    className="w-full md:w-auto flex-grow py-2.5 px-4 border border-gray-300 rounded-md text-base font-body focus:ring-2 focus:ring-[#5a3a22] focus:outline-none text-slate-800"
                />
                <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-5 w-5 rounded"/>
                    <span>公開する</span>
                </label>
                <button type="submit" className="w-full md:w-auto py-2.5 px-5 border-none bg-[#5a3a22] text-white font-display text-base cursor-pointer rounded-md transition-colors hover:bg-[#7b5b43]">新しいボードを作成</button>
            </form>
        </div>
    );
};

export const CaseSelectionView: React.FC<CaseSelectionProps> = ({ user, onSignOut, myCases, publicCases, events }) => {
    const [settingsCaseId, setSettingsCaseId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Fetch initial public cases when tab is switched
        if (activeTab === 'public') {
            events.onSearchPublic('');
        }
    }, [activeTab]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        events.onSearchPublic(searchTerm);
    }

    const settingsCase = myCases.find(c => c.id === settingsCaseId);

    const renderCasesGrid = (cases: Case[]) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cases.map(caseItem => (
                <CaseCard 
                    key={caseItem.id} 
                    caseItem={caseItem} 
                    user={user}
                    onSelect={events.onCaseSelect}
                    onDelete={events.onCaseDelete}
                    onSettings={setSettingsCaseId}
                />
            ))}
        </div>
    );

    return (
        <div className="h-screen flex flex-col">
            <header className="bg-black/70 p-4 text-white shadow-lg z-10 shrink-0 flex items-center justify-between">
                <div className='w-1/3'>
                     <span className="text-sm truncate" title={user.email ?? ''}>ようこそ, {user.displayName} さん</span>
                </div>
                <div className="w-1/3 text-center">
                    <h1 className="font-display text-4xl text-shadow">ミステリーボード</h1>
                </div>
                <div className='w-1/3 flex justify-end'>
                    <button onClick={onSignOut} className="py-2 px-4 border-none bg-red-600/80 text-white font-display text-base cursor-pointer rounded-md transition-colors hover:bg-red-700/80">ログアウト</button>
                </div>
            </header>

            <div className="border-b border-gray-600/50 bg-black/30">
                <nav className="flex justify-center -mb-px">
                    <button onClick={() => setActiveTab('my')} className={`py-3 px-6 font-display text-lg border-b-4 ${activeTab === 'my' ? 'border-amber-400 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>マイボード</button>
                    <button onClick={() => setActiveTab('public')} className={`py-3 px-6 font-display text-lg border-b-4 ${activeTab === 'public' ? 'border-amber-400 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>公開ボードを探す</button>
                </nav>
            </div>
             
            {activeTab === 'my' && (
                <div className="p-4">
                  <AddCaseForm onAddCase={events.onCaseAdd} />
                </div>
            )}
             {activeTab === 'public' && (
                <div className="bg-black/50 p-4 shadow-md z-10 shrink-0">
                    <form onSubmit={handleSearch} className="flex justify-center gap-2.5">
                        <input 
                            type="search" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="小説名で検索..." 
                            className="w-[400px] py-2.5 px-4 border border-gray-300 rounded-md text-base font-body focus:ring-2 focus:ring-[#5a3a22] focus:outline-none text-slate-800"
                        />
                        <button type="submit" className="py-2.5 px-5 border-none bg-[#5a3a22] text-white font-display text-base cursor-pointer rounded-md transition-colors hover:bg-[#7b5b43]">検索</button>
                    </form>
                </div>
            )}
            
            <main className="p-8 overflow-y-auto flex-grow">
                {activeTab === 'my' && (
                    myCases.length > 0 ? renderCasesGrid(myCases) : (
                        <div className="text-center text-white/70 mt-10 font-display text-2xl">
                            <p>まだ考察ボードがありません。</p>
                            <p>上のフォームから新しいボードを作成しましょう。</p>
                        </div>
                    )
                )}
                {activeTab === 'public' && (
                    publicCases.length > 0 ? renderCasesGrid(publicCases) : (
                        <div className="text-center text-white/70 mt-10 font-display text-2xl">
                            <p>公開されている考察ボードが見つかりませんでした。</p>
                        </div>
                    )
                )}
            </main>
            {settingsCase && <SettingsModal caseItem={settingsCase} events={events} onClose={() => setSettingsCaseId(null)} />}
        </div>
    );
};
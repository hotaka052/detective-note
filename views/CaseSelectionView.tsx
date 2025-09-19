/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Fix: Import React and the Case type to conform to module standards.
import * as React from 'react';
import type { Case } from "../types.ts"

const { useState } = React;

type CaseSelectionEvents = {
  onCaseAdd: (name: string) => void;
  onCaseDelete: (caseId: number) => void;
  onCaseSelect: (caseId: number) => void;
};

interface CaseSelectionProps {
    cases: Case[];
    events: CaseSelectionEvents;
}

interface CaseCardProps {
    caseItem: Case;
    onSelect: (id: number) => void;
    onDelete: (id: number) => void;
}

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

// Fix: Export the component to make it accessible from other modules.
export const CaseSelectionView: React.FC<CaseSelectionProps> = ({ cases, events }) => {
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
            <header className="bg-black/70 p-5 text-center shadow-lg z-10 shrink-0">
                <h1 className="font-display text-white text-4xl mb-4 text-shadow">事件ファイル一覧</h1>
                <form onSubmit={handleAddCase} className="flex justify-center gap-2.5">
                    <input 
                        type="text" 
                        value={caseNameInput}
                        onChange={(e) => setCaseNameInput(e.target.value)}
                        placeholder="新しい事件名..." 
                        autoComplete="off" 
                        required 
                        className="w-[300px] py-2.5 px-4 border border-gray-300 rounded-md text-base font-body focus:ring-2 focus:ring-[#5a3a22] focus:outline-none"
                    />
                    <button type="submit" className="py-2.5 px-5 border-none bg-[#5a3a22] text-white font-display text-base cursor-pointer rounded-md transition-colors hover:bg-[#7b5b43]">新しい事件を作成</button>
                </form>
            </header>
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
            </main>
        </>
    );
};
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import type { Case, Note, PlainUser } from '../types/index.ts';

const { useState, useEffect, useCallback, useRef } = React;

type AiState = {
  isLoading: boolean;
  result: string | null;
  error: string | null;
};

type NotebookViewEvents = {
  onNoteAdd: (content: string) => void;
  onNoteDelete: (noteId: string) => void;
  onNoteUpdate: (noteId: string, x: number, y: number) => void;
  onBack: () => void;
  onAiAnalysis: (type: 'characters' | 'timeline' | 'mysteries') => void;
};

type NoteProps = {
  note: Note;
  onMouseDown: (e: React.MouseEvent, note: Note) => void;
  onDelete: (noteId: string) => void;
};

const NoteComponent: React.FC<NoteProps> = ({ note, onMouseDown, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(note.id);
  };

  return (
    <div
      className="note torn-paper group absolute w-[250px] min-h-[150px] p-5 bg-[#ffc] shadow-[5px_5px_15px_rgba(0,0,0,0.5)] text-lg cursor-move select-none transition-transform transition-shadow duration-200 ease-out hover:scale-105 hover:shadow-[10px_10px_20px_rgba(0,0,0,0.5)] hover:z-10"
      data-id={note.id}
      style={{ left: `${note.x}px`, top: `${note.y}px`, transform: `rotate(${note.rotation}deg)` }}
      onMouseDown={(e) => onMouseDown(e, note)}
    >
      <div className="w-full h-full whitespace-pre-wrap break-words">
        {note.content}
      </div>
      <button
        className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white border-none rounded-full cursor-pointer flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
        aria-label="Delete note"
        onClick={handleDelete}
      >
        &times;
      </button>
    </div>
  );
};

const AiModal = ({ aiState, onAnalysis, onClose }: { aiState: AiState, onAnalysis: NotebookViewEvents['onAiAnalysis'], onClose: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[#f5eeda] text-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl m-4 flex flex-col" onClick={e => e.stopPropagation()}>
                <h3 className="font-display text-2xl mb-4 flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                    AIアシスタント
                </h3>
                <div className="bg-white/50 p-4 rounded mb-4 min-h-[200px] max-h-[50vh] overflow-y-auto font-body">
                    {aiState.isLoading && <div className="text-center">分析中...</div>}
                    {aiState.error && <p className="text-red-600">{aiState.error}</p>}
                    {aiState.result && <p className="whitespace-pre-wrap">{aiState.result}</p>}
                    {!aiState.isLoading && !aiState.result && !aiState.error && <p className="text-gray-500">上のボタンから分析の種類を選んでください。</p>}
                </div>

                <div className="flex justify-center gap-2 mb-4">
                    <button onClick={() => onAnalysis('characters')} disabled={aiState.isLoading} className="disabled:opacity-50 py-2 px-4 border-none bg-[#5a3a22] text-white font-display text-sm cursor-pointer rounded-md transition-colors hover:bg-[#7b5b43]">登場人物を整理</button>
                    <button onClick={() => onAnalysis('timeline')} disabled={aiState.isLoading} className="disabled:opacity-50 py-2 px-4 border-none bg-[#5a3a22] text-white font-display text-sm cursor-pointer rounded-md transition-colors hover:bg-[#7b5b43]">時系列を整理</button>
                    <button onClick={() => onAnalysis('mysteries')} disabled={aiState.isLoading} className="disabled:opacity-50 py-2 px-4 border-none bg-[#5a3a22] text-white font-display text-sm cursor-pointer rounded-md transition-colors hover:bg-[#7b5b43]">謎・伏線を抽出</button>
                </div>
                <button onClick={onClose} className="mt-2 w-full py-2 px-5 border-none bg-gray-500 text-white font-display text-base cursor-pointer rounded-md transition-colors hover:bg-gray-600">閉じる</button>
            </div>
        </div>
    );
};


type NotebookProps = {
  user: PlainUser;
  onSignOut: () => void;
  activeCase: Case;
  events: NotebookViewEvents;
  aiState: AiState;
};


type DragState = { noteId: string; offsetX: number; offsetY: number } | null;

export const NotebookComponent = ({ user, onSignOut, activeCase, events, aiState }: NotebookProps) => {
  const [noteInput, setNoteInput] = useState('');
  const [activeDrag, setActiveDrag] = useState<DragState>(null);
  const activeElRef = useRef<HTMLElement | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteInput.trim()) {
      events.onNoteAdd(noteInput.trim());
      setNoteInput('');
    }
  };

  const handleDragStart = (e: React.MouseEvent, note: Note) => {
    const element = e.currentTarget as HTMLElement;
    if (!element) return;
    
    element.classList.add('cursor-grabbing', 'shadow-[15px_15px_25px_rgba(0,0,0,0.6)]', 'z-[999]');
    
    const container = document.getElementById('notes-container') as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const rect = element.getBoundingClientRect();

    activeElRef.current = element;

    setActiveDrag({
        noteId: note.id,
        offsetX: e.clientX - rect.left + containerRect.left,
        offsetY: e.clientY - rect.top + containerRect.top,
    });
  };

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!activeDrag || !activeElRef.current) return;
    e.preventDefault();

    const container = document.getElementById('notes-container') as HTMLElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    let newX = e.clientX - activeDrag.offsetX;
    let newY = e.clientY - activeDrag.offsetY;
    
    newX = Math.max(0, Math.min(newX, containerRect.width - activeElRef.current.offsetWidth));
    newY = Math.max(0, Math.min(newY, containerRect.height - activeElRef.current.offsetHeight));
    
    activeElRef.current.style.left = `${newX}px`;
    activeElRef.current.style.top = `${newY}px`;
  }, [activeDrag]);
  
  const handleDragEnd = useCallback(() => {
    if (!activeDrag || !activeElRef.current) return;
    
    activeElRef.current.classList.remove('cursor-grabbing', 'shadow-[15px_15px_25px_rgba(0,0,0,0.6)]', 'z-[999]');
    
    const x = parseInt(activeElRef.current.style.left, 10);
    const y = parseInt(activeElRef.current.style.top, 10);
    events.onNoteUpdate(activeDrag.noteId, x, y);
    
    activeElRef.current = null;
    setActiveDrag(null);
  }, [activeDrag, events]);
  
  useEffect(() => {
    if (activeDrag) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [activeDrag, handleDragMove, handleDragEnd]);


  return (
    <>
      <header className="bg-black/70 p-4 text-white shadow-lg z-10 shrink-0 flex items-center justify-between">
          <div className="w-1/3 flex justify-start">
             <button onClick={events.onBack} className="py-2 px-4 border-none bg-transparent text-white font-display text-lg cursor-pointer transition-colors hover:bg-white/10 rounded-md">&larr; ボード一覧へ</button>
          </div>
          <div className="w-1/3 text-center">
             <h2 className="font-display text-3xl text-shadow truncate" title={activeCase.name}>ボード: {activeCase.name}</h2>
          </div>
          <div className="w-1/3 flex justify-end items-center gap-4">
            <button onClick={() => setIsAiModalOpen(true)} title="AIアシスタント" className="p-2 border-none bg-transparent text-white font-display text-lg cursor-pointer transition-colors hover:bg-white/10 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
            </button>
            <span className="text-sm truncate" title={user.email ?? ''}>{user.displayName}</span>
            <button onClick={onSignOut} className="py-2 px-4 border-none bg-red-600/80 text-white font-display text-base cursor-pointer rounded-md transition-colors hover:bg-red-700/80">ログアウト</button>
          </div>
      </header>
      <div className="bg-black/50 p-3 text-center shadow-md z-10 shrink-0">
          <form onSubmit={handleAddNote} className="flex justify-center gap-2.5">
              <input 
                  type="text" 
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="新しい考察..." 
                  autoComplete="off" 
                  required 
                  className="w-[300px] py-2 px-3 border border-gray-300 rounded-md text-base font-body focus:ring-2 focus:ring-[#5a3a22] focus:outline-none text-slate-800"
              />
              <button type="submit" className="py-2 px-5 border-none bg-[#5a3a22] text-white font-display text-base cursor-pointer rounded-md transition-colors hover:bg-[#7b5b43]">付箋を追加</button>
          </form>
      </div>
      <main id="notes-container" className="relative flex-grow">
          {activeCase.notes.map(note => (
            <NoteComponent 
                key={note.id} 
                note={note} 
                onMouseDown={handleDragStart}
                onDelete={events.onNoteDelete}
            />
          ))}
          {activeCase.notes.length === 0 && (
             <div className="text-center text-slate-500 mt-10 font-display text-2xl">
                 <p>まだ付箋がありません。</p>
                 <p>上のフォームから新しい考察を追加しましょう。</p>
             </div>
          )}
      </main>
      {isAiModalOpen && <AiModal aiState={aiState} onAnalysis={events.onAiAnalysis} onClose={() => setIsAiModalOpen(false)} />}
    </>
  );
};
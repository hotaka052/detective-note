/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import type { Case, Note, PlainUser } from '../types/index.ts';

const { useState, useEffect, useCallback } = React;

type NotebookViewEvents = {
  onNoteAdd: (content: string) => void;
  onNoteDelete: (noteId: string) => void;
  onNoteUpdate: (noteId: string, x: number, y: number) => void;
  onBack: () => void;
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

type NotebookProps = {
  user: PlainUser;
  onSignOut: () => void;
  activeCase: Case;
  events: NotebookViewEvents;
};

export const NotebookComponent = ({ user, onSignOut, activeCase, events }: NotebookProps) => {
  const [noteInput, setNoteInput] = useState('');
  const [activeDrag, setActiveDrag] = useState<{ noteId: string; element: HTMLElement; offsetX: number; offsetY: number } | null>(null);

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
    
    const containerRect = (document.getElementById('notes-container') as HTMLElement).getBoundingClientRect();
    const rect = element.getBoundingClientRect();

    setActiveDrag({
        noteId: note.id,
        element: element,
        offsetX: e.clientX - rect.left + containerRect.left,
        offsetY: e.clientY - rect.top + containerRect.top,
    });
  };

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!activeDrag) return;
    e.preventDefault();

    const container = document.getElementById('notes-container') as HTMLElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    let newX = e.clientX - activeDrag.offsetX;
    let newY = e.clientY - activeDrag.offsetY;
    
    newX = Math.max(0, Math.min(newX, containerRect.width - activeDrag.element.offsetWidth));
    newY = Math.max(0, Math.min(newY, containerRect.height - activeDrag.element.offsetHeight));
    
    activeDrag.element.style.left = `${newX}px`;
    activeDrag.element.style.top = `${newY}px`;
  }, [activeDrag]);
  
  const handleDragEnd = useCallback(() => {
    if (!activeDrag) return;
    
    activeDrag.element.classList.remove('cursor-grabbing', 'shadow-[15px_15px_25px_rgba(0,0,0,0.6)]', 'z-[999]');
    
    const x = parseInt(activeDrag.element.style.left, 10);
    const y = parseInt(activeDrag.element.style.top, 10);
    events.onNoteUpdate(activeDrag.noteId, x, y);
    
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
             <button onClick={events.onBack} className="py-2 px-4 border-none bg-transparent text-white font-display text-lg cursor-pointer transition-colors hover:bg-white/10 rounded-md">&larr; 事件一覧へ</button>
          </div>
          <div className="w-1/3 text-center">
             <h2 className="font-display text-3xl text-shadow truncate" title={activeCase.name}>事件: {activeCase.name}</h2>
          </div>
          <div className="w-1/3 flex justify-end items-center gap-4">
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
                  placeholder="新しい手がかり..." 
                  autoComplete="off" 
                  required 
                  className="w-[300px] py-2 px-3 border border-gray-300 rounded-md text-base font-body focus:ring-2 focus:ring-[#5a3a22] focus:outline-none text-slate-800"
              />
              <button type="submit" className="py-2 px-5 border-none bg-[#5a3a22] text-white font-display text-base cursor-pointer rounded-md transition-colors hover:bg-[#7b5b43]">メモを追加</button>
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
             <div className="text-center text-white/70 mt-10 font-display text-2xl">
                 <p>まだメモがありません。</p>
                 <p>上のフォームから新しい手がかりを追加しましょう。</p>
             </div>
          )}
      </main>
    </>
  );
};
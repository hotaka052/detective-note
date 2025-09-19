/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Fix: Import React and other dependencies to resolve module-related errors.
import * as React from 'react';
import { StorageService } from './storage.ts';
import type { Case, Note } from './types.ts';
import { CaseSelectionView } from './views/CaseSelectionView.tsx';
import { NotebookComponent } from './views/NotebookView.tsx';

const { useState, useEffect, useCallback } = React;

// Fix: Export the App component for use in index.tsx.
export const App = () => {
    const [cases, setCases] = useState<Case[]>([]);
    const [activeCaseId, setActiveCaseId] = useState<number | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Load initial data from storage
    useEffect(() => {
        setCases(StorageService.loadCases());
        setIsInitialLoad(false);
    }, []);

    // Save cases to storage whenever they change
    useEffect(() => {
        if (!isInitialLoad) {
            StorageService.saveCases(cases);
        }
    }, [cases, isInitialLoad]);

    const handleAddCase = (name: string) => {
        const newCase: Case = { id: Date.now(), name, notes: [] };
        setCases(prevCases => [...prevCases, newCase]);
    };

    const handleDeleteCase = (id: number) => {
        if (confirm('この事件ファイルとすべてのメモを完全に削除しますか？')) {
            setCases(prevCases => prevCases.filter(c => c.id !== id));
        }
    };
    
    const handleSelectCase = (id: number) => setActiveCaseId(id);
    const handleBackToCases = () => setActiveCaseId(null);

    const getActiveCase = useCallback(() => {
        return cases.find(c => c.id === activeCaseId);
    }, [cases, activeCaseId]);

    const handleAddNote = (content: string) => {
        const activeCase = getActiveCase();
        if (!activeCase) return;

        const notesContainer = document.getElementById('notes-container');
        // Provide a fallback to window dimensions if container is not rendered yet
        const containerWidth = notesContainer ? notesContainer.clientWidth : window.innerWidth;
        const containerHeight = notesContainer ? notesContainer.clientHeight : window.innerHeight;

        const newNote: Note = {
            id: Date.now(),
            content,
            x: Math.max(0, Math.floor(Math.random() * (containerWidth - 250))),
            y: Math.max(0, Math.floor(Math.random() * (containerHeight - 150))),
            rotation: Math.floor(Math.random() * 20) - 10,
        };
        
        setCases(prevCases => prevCases.map(c => 
            c.id === activeCaseId ? { ...c, notes: [...c.notes, newNote] } : c
        ));
    };

    const handleDeleteNote = (noteId: number) => {
        setCases(prevCases => prevCases.map(c => 
            c.id === activeCaseId ? { ...c, notes: c.notes.filter(n => n.id !== noteId) } : c
        ));
    };
    
    const handleUpdateNotePosition = (noteId: number, x: number, y: number) => {
        setCases(prevCases => prevCases.map(c => 
            c.id === activeCaseId ? { ...c, notes: c.notes.map(n => n.id === noteId ? { ...n, x, y } : n) } : c
        ));
    };

    const activeCase = getActiveCase();

    return (
        activeCase ? (
            <NotebookComponent
                activeCase={activeCase}
                events={{
                    onNoteAdd: handleAddNote,
                    onNoteDelete: handleDeleteNote,
                    onNoteUpdate: handleUpdateNotePosition,
                    onBack: handleBackToCases,
                }}
            />
        ) : (
            <CaseSelectionView
                cases={cases}
                events={{
                    onCaseAdd: handleAddCase,
                    onCaseDelete: handleDeleteCase,
                    onCaseSelect: handleSelectCase,
                }}
            />
        )
    );
};
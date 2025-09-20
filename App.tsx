/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, type User } from 'firebase/auth';
import { auth } from './firebase.ts';
import { StorageService } from './storage.ts';
import type { Case, Note } from './types.ts';
import { CaseSelectionView } from './views/CaseSelectionView.tsx';
import { NotebookComponent } from './views/NotebookView.tsx';
import { LoginView } from './views/LoginView.tsx';

const { useState, useEffect, useCallback } = React;

export const App = () => {
    const [user, setUser] = useState<User | null>(null);
    const [cases, setCases] = useState<Case[]>([]);
    const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const userCases = await StorageService.loadCases(currentUser.uid);
                setCases(userCases);
            } else {
                setCases([]);
                setActiveCaseId(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Authentication error:", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    const handleAddCase = async (name: string) => {
        if (!user) return;
        const newCase = await StorageService.addCase(user.uid, name);
        if (newCase) {
            setCases(prevCases => [...prevCases, newCase]);
        }
    };

    const handleDeleteCase = async (id: string) => {
        if (!user) return;
        if (confirm('この事件ファイルとすべてのメモを完全に削除しますか？')) {
            await StorageService.deleteCase(user.uid, id);
            setCases(prevCases => prevCases.filter(c => c.id !== id));
        }
    };

    const handleSelectCase = (id: string) => setActiveCaseId(id);
    const handleBackToCases = () => setActiveCaseId(null);

    const getActiveCase = useCallback(() => {
        return cases.find(c => c.id === activeCaseId);
    }, [cases, activeCaseId]);

    const handleAddNote = async (content: string) => {
        const activeCase = getActiveCase();
        if (!user || !activeCase) return;

        const notesContainer = document.getElementById('notes-container');
        const containerWidth = notesContainer ? notesContainer.clientWidth : window.innerWidth;
        const containerHeight = notesContainer ? notesContainer.clientHeight : window.innerHeight;

        const newNoteData = {
            content,
            x: Math.max(0, Math.floor(Math.random() * (containerWidth - 250))),
            y: Math.max(0, Math.floor(Math.random() * (containerHeight - 150))),
            rotation: Math.floor(Math.random() * 20) - 10,
        };

        const newNote = await StorageService.addNote(user.uid, activeCase.id, newNoteData);
        if (newNote) {
            setCases(prevCases => prevCases.map(c =>
                c.id === activeCaseId ? { ...c, notes: [...c.notes, newNote] } : c
            ));
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        const activeCase = getActiveCase();
        if (!user || !activeCase) return;
        await StorageService.deleteNote(user.uid, activeCase.id, noteId);
        setCases(prevCases => prevCases.map(c =>
            c.id === activeCaseId ? { ...c, notes: c.notes.filter(n => n.id !== noteId) } : c
        ));
    };

    const handleUpdateNotePosition = async (noteId: string, x: number, y: number) => {
        const activeCase = getActiveCase();
        if (!user || !activeCase) return;
        await StorageService.updateNotePosition(user.uid, activeCase.id, noteId, x, y);
        setCases(prevCases => prevCases.map(c =>
            c.id === activeCaseId ? { ...c, notes: c.notes.map(n => n.id === noteId ? { ...n, x, y } : n) } : c
        ));
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen text-white font-display text-2xl">読み込み中...</div>;
    }

    if (!user) {
        return <LoginView onGoogleSignIn={handleGoogleSignIn} />;
    }

    const activeCase = getActiveCase();

    return (
        activeCase ? (
            <NotebookComponent
                user={user}
                onSignOut={handleSignOut}
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
                user={user}
                onSignOut={handleSignOut}
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
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import {
    onAuthStateChanged,
    signOut,
    type User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    type AuthError
} from 'firebase/auth';
import { auth } from './firebase.ts';
import { 
    loadCases, 
    addCase, 
    deleteCase, 
    addNote, 
    deleteNote, 
    updateNotePosition 
} from './storage.ts';
import type { Case, Note, PlainUser } from './types/index.ts';
import { CaseSelectionView } from './views/CaseSelectionView.tsx';
import { NotebookComponent } from './views/NotebookView.tsx';
import { LoginView } from './views/LoginView.tsx';

const { useState, useEffect, useCallback } = React;

// Fix: The 'AuthError' type from Firebase Auth might not be correctly inferred by TypeScript in all environments.
// Changing the type to 'any' allows access to the 'code' property without a compile-time error.
const getFriendlyAuthError = (error: any): string => {
    switch (error.code) {
        case 'auth/invalid-email':
            return '無効なメールアドレスです。';
        case 'auth/user-disabled':
            return 'このアカウントは無効化されています。';
        case 'auth/user-not-found':
            return 'ユーザーが見つかりません。メールアドレスを確認してください。';
        case 'auth/wrong-password':
            return 'パスワードが間違っています。';
        case 'auth/email-already-in-use':
            return 'このメールアドレスは既に使用されています。';
        case 'auth/weak-password':
            return 'パスワードは6文字以上である必要があります。';
        case 'auth/operation-not-allowed':
             return 'メール・パスワードでのログインは許可されていません。';
        default:
            return 'ログインまたは登録中にエラーが発生しました。';
    }
}


export const App = () => {
    const [user, setUser] = useState<PlainUser | null>(null);
    const [cases, setCases] = useState<Case[]>([]);
    const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const plainUser: PlainUser = {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    email: currentUser.email,
                };
                setUser(plainUser);
                const userCases = await loadCases(currentUser.uid);
                setCases(userCases);
            } else {
                setUser(null);
                setCases([]);
                setActiveCaseId(null);
            }
            setIsLoading(false);
            setAuthError(null); // Clear error on successful auth change
        });
        return () => unsubscribe();
    }, []);

    const handleEmailSignUp = async (displayName: string, email: string, password: string) => {
        if (!displayName.trim()) {
            setAuthError("表示名を入力してください。");
            return;
        }
        try {
            setAuthError(null);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName });
        } catch (error) {
            console.error("Sign up error:", error);
            setAuthError(getFriendlyAuthError(error as AuthError));
        }
    };

    const handleEmailSignIn = async (email: string, password: string) => {
        try {
            setAuthError(null);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Sign in error:", error);
            setAuthError(getFriendlyAuthError(error as AuthError));
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
        const newCase = await addCase(user.uid, name);
        if (newCase) {
            setCases(prevCases => [...prevCases, newCase]);
        }
    };

    const handleDeleteCase = async (id: string) => {
        if (!user) return;
        if (confirm('この事件ファイルとすべてのメモを完全に削除しますか？')) {
            await deleteCase(user.uid, id);
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

        const newNote = await addNote(user.uid, activeCase.id, newNoteData);
        if (newNote) {
            setCases(prevCases => prevCases.map(c =>
                c.id === activeCaseId ? { ...c, notes: [...c.notes, newNote] } : c
            ));
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        const activeCase = getActiveCase();
        if (!user || !activeCase) return;
        await deleteNote(user.uid, activeCase.id, noteId);
        setCases(prevCases => prevCases.map(c =>
            c.id === activeCaseId ? { ...c, notes: c.notes.filter(n => n.id !== noteId) } : c
        ));
    };

    const handleUpdateNotePosition = async (noteId: string, x: number, y: number) => {
        const activeCase = getActiveCase();
        if (!user || !activeCase) return;
        await updateNotePosition(user.uid, activeCase.id, noteId, x, y);
        setCases(prevCases => prevCases.map(c =>
            c.id === activeCaseId ? { ...c, notes: c.notes.map(n => n.id === noteId ? { ...n, x, y } : n) } : c
        ));
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen text-white font-display text-2xl">読み込み中...</div>;
    }

    if (!user) {
        return <LoginView 
            onEmailSignIn={handleEmailSignIn}
            onEmailSignUp={handleEmailSignUp}
            authError={authError}
            />;
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

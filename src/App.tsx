/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { GoogleGenAI } from '@google/genai';
// Fix: Remove modular auth imports as we are using the compat library for authentication.
import { auth } from './firebase.ts';
import { 
    loadCases,
    loadSingleCase,
    searchPublicCases,
    addCase, 
    deleteCase,
    updateCaseVisibility,
    addNote, 
    deleteNote, 
    updateNotePosition 
} from './storage.ts';
import type { Case, Note, PlainUser } from './types/index.ts';
import { CaseSelectionView } from './views/CaseSelectionView.tsx';
import { NotebookComponent } from './views/NotebookView.tsx';
import { LoginView } from './views/LoginView.tsx';

const { useState, useEffect, useCallback } = React;

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


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
    const [myCases, setMyCases] = useState<Case[]>([]);
    const [publicCases, setPublicCases] = useState<Case[]>([]);
    const [activeCase, setActiveCase] = useState<Case | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    // State for AI features
    const [aiIsLoading, setAiIsLoading] = useState(false);
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);


    useEffect(() => {
        // Fix: Use compat version of onAuthStateChanged
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser && currentUser.email) {
                const plainUser: PlainUser = {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    email: currentUser.email,
                };
                setUser(plainUser);
                const userCases = await loadCases(currentUser.email);
                setMyCases(userCases);
            } else {
                setUser(null);
                setMyCases([]);
                setPublicCases([]);
                setActiveCase(null);
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
            // Fix: Use compat version of createUserWithEmailAndPassword and updateProfile
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            if (userCredential.user) {
                await userCredential.user.updateProfile({ displayName });
            }
        } catch (error) {
            console.error("Sign up error:", error);
            // Fix: Remove AuthError type cast as it can no longer be imported.
            setAuthError(getFriendlyAuthError(error));
        }
    };

    const handleEmailSignIn = async (email: string, password: string) => {
        try {
            setAuthError(null);
            // Fix: Use compat version of signInWithEmailAndPassword
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            console.error("Sign in error:", error);
            // Fix: Remove AuthError type cast as it can no longer be imported.
            setAuthError(getFriendlyAuthError(error));
        }
    };


    const handleSignOut = async () => {
        try {
            // Fix: Use compat version of signOut
            await auth.signOut();
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    const handleAddCase = async (bookTitle: string, authorName: string, isPublic: boolean) => {
        if (!user) return;
        const newCase = await addCase(user, bookTitle, authorName, isPublic);
        if (newCase) {
            setMyCases(prevCases => [...prevCases, newCase]);
        }
    };

    const handleDeleteCase = async (id: string) => {
        if (!user) return;
        const caseToDelete = myCases.find(c => c.id === id);
        if (!caseToDelete) return;
        if (caseToDelete.ownerId !== user.uid) {
            alert("このボードのオーナーのみが削除できます。");
            return;
        }

        if (confirm('このボードとすべての付箋を完全に削除しますか？この操作は取り消せません。')) {
            await deleteCase(user.uid, id);
            setMyCases(prevCases => prevCases.filter(c => c.id !== id));
        }
    };

    const handleUpdateVisibility = async (caseId: string, isPublic: boolean) => {
        await updateCaseVisibility(caseId, isPublic);
        setMyCases(prev => prev.map(c => c.id === caseId ? { ...c, isPublic } : c));
    };

    const handleSearchPublicCases = async (searchTerm: string) => {
        const results = await searchPublicCases(searchTerm);
        setPublicCases(results);
    };

    const handleSelectCase = async (id: string) => {
        setIsLoading(true);
        const fullCase = await loadSingleCase(id);
        if (fullCase) {
           setActiveCase(fullCase);
        } else {
            alert("ボードの読み込みに失敗しました。");
        }
        setIsLoading(false);
    };

    const handleBackToCases = () => {
        setActiveCase(null);
        setAiResult(null); // Clear AI result when going back
        setAiError(null);
    };

    const handleAddNote = async (content: string) => {
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

        const newNote = await addNote(activeCase.id, newNoteData);
        if (newNote) {
            setActiveCase(prev => prev ? { ...prev, notes: [...prev.notes, newNote] } : null);
            // Also update the note count in the myCases list if it's there
            setMyCases(prev => prev.map(c => c.id === activeCase.id ? { ...c, notes: [...c.notes, newNote] } : c));
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!user || !activeCase) return;
        await deleteNote(activeCase.id, noteId);
        const updatedNotes = activeCase.notes.filter(n => n.id !== noteId);
        setActiveCase(prev => prev ? { ...prev, notes: updatedNotes } : null);
         // Also update the note count in the myCases list if it's there
        setMyCases(prev => prev.map(c => c.id === activeCase.id ? { ...c, notes: updatedNotes } : c));
    };

    const handleUpdateNotePosition = async (noteId: string, x: number, y: number) => {
        if (!user || !activeCase) return;
        await updateNotePosition(activeCase.id, noteId, x, y);
        const updatedNotes = activeCase.notes.map(n => n.id === noteId ? { ...n, x, y } : n);
        setActiveCase(prev => prev ? { ...prev, notes: updatedNotes } : null);
    };

    const handleAiAnalysis = async (type: 'characters' | 'timeline' | 'mysteries') => {
        if (!activeCase || activeCase.notes.length === 0) {
            setAiError("分析する付箋がありません。");
            setAiResult(null);
            return;
        }

        setAiIsLoading(true);
        setAiResult(null);
        setAiError(null);

        const notesContent = activeCase.notes.map(n => `- ${n.content}`).join('\n');
        let prompt = `あなたは優秀なミステリー分析家です。以下の考察メモを分析してください。\n\n[考察メモ]\n${notesContent}\n\n`;

        switch(type) {
            case 'characters':
                prompt += "分析結果として、これらのメモに登場する人物をリストアップし、わかっている情報を簡潔にまとめてください。";
                break;
            case 'timeline':
                prompt += "分析結果として、これらのメモから読み取れる出来事を時系列に整理してください。";
                break;
            case 'mysteries':
                prompt += "分析結果として、この物語における未解決の謎や、重要だと思われる伏線をリストアップしてください。";
                break;
        }

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setAiResult(response.text);
        } catch (error) {
            console.error("AI analysis error:", error);
            setAiError("AIアシスタントとの通信に失敗しました。しばらくしてから再度お試しください。");
        } finally {
            setAiIsLoading(false);
        }
    };


    if (isLoading) {
        return <div className="flex items-center justify-center h-screen text-slate-600 font-display text-2xl">読み込み中...</div>;
    }

    if (!user) {
        return <LoginView 
            onEmailSignIn={handleEmailSignIn}
            onEmailSignUp={handleEmailSignUp}
            authError={authError}
            />;
    }
    
    const isOwnerOfActiveCase = activeCase ? activeCase.ownerId === user.uid : false;

    return (
        activeCase ? (
            <NotebookComponent
                user={user}
                onSignOut={handleSignOut}
                activeCase={activeCase}
                isOwner={isOwnerOfActiveCase}
                events={{
                    onNoteAdd: handleAddNote,
                    onNoteDelete: handleDeleteNote,
                    onNoteUpdate: handleUpdateNotePosition,
                    onBack: handleBackToCases,
                    onAiAnalysis: handleAiAnalysis,
                }}
                aiState={{
                    isLoading: aiIsLoading,
                    result: aiResult,
                    error: aiError,
                }}
            />
        ) : (
            <CaseSelectionView
                user={user}
                onSignOut={handleSignOut}
                myCases={myCases}
                publicCases={publicCases}
                events={{
                    onCaseAdd: handleAddCase,
                    onCaseDelete: handleDeleteCase,
                    onCaseSelect: handleSelectCase,
                    onUpdateVisibility: handleUpdateVisibility,
                    onSearchPublic: handleSearchPublicCases,
                }}
            />
        )
    );
};
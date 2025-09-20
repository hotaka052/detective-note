/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './firebase.ts';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, writeBatch, query, where, getDoc, arrayUnion, arrayRemove, limit, orderBy } from 'firebase/firestore';
import type { Case, Note, PlainUser } from './types/index.ts';

// Cases are now a top-level collection to facilitate sharing
const casesCollection = collection(db, 'cases');

// Load cases where the user is a member
export async function loadCases(userEmail: string): Promise<Case[]> {
  if (!userEmail) return [];
  try {
    const q = query(casesCollection, where("memberEmails", "array-contains", userEmail));
    const caseSnapshot = await getDocs(q);
    const cases: Case[] = [];
    for (const caseDoc of caseSnapshot.docs) {
      const notesSnapshot = await getDocs(collection(caseDoc.ref, 'notes'));
      const notes = notesSnapshot.docs.map(noteDoc => ({
        id: noteDoc.id,
        ...noteDoc.data()
      } as Note));
      
      cases.push({
        id: caseDoc.id,
        notes: notes,
        ...caseDoc.data()
      } as Case);
    }
    return cases;
  } catch (e) {
    console.error("Error loading cases from Firestore:", e);
    return [];
  }
}

// Search for public cases based on a search term (currently bookTitle)
export async function searchPublicCases(searchTerm: string): Promise<Case[]> {
  try {
    let q;
    if (searchTerm.trim() === '') {
        // If search term is empty, get the 20 most recently created public boards
        q = query(casesCollection, where("isPublic", "==", true), orderBy("createdAt", "desc"), limit(20));
    } else {
        // Simple prefix search on bookTitle
        q = query(casesCollection, 
            where("isPublic", "==", true),
            where("bookTitle", ">=", searchTerm),
            where("bookTitle", "<=", searchTerm + '\uf8ff'),
            limit(20)
        );
    }
    
    const caseSnapshot = await getDocs(q);
    const cases: Case[] = caseSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      notes: [] // Do not load notes for search results to save bandwidth
    } as Case));
    return cases;

  } catch (e) {
    console.error("Error searching public cases:", e);
    return [];
  }
}


// Load a single case with all its notes (useful for viewing public cases)
export async function loadSingleCase(caseId: string): Promise<Case | null> {
    try {
        const caseDocRef = doc(db, 'cases', caseId);
        const caseDoc = await getDoc(caseDocRef);
        if (!caseDoc.exists()) return null;

        const notesSnapshot = await getDocs(collection(caseDocRef, 'notes'));
        const notes = notesSnapshot.docs.map(noteDoc => ({
            id: noteDoc.id,
            ...noteDoc.data()
        } as Note));

        return {
            id: caseDoc.id,
            notes,
            ...caseDoc.data()
        } as Case;

    } catch (e) {
        console.error("Error loading single case:", e);
        return null;
    }
}


// Add a new case, setting the current user as the owner
export async function addCase(user: PlainUser, bookTitle: string, authorName: string, isPublic: boolean): Promise<Case | null> {
   if (!user.email) return null;
  try {
    const newCaseData = {
      bookTitle,
      authorName,
      isPublic,
      ownerId: user.uid,
      ownerEmail: user.email,
      memberEmails: [user.email],
      createdAt: new Date(),
    };
    const docRef = await addDoc(casesCollection, newCaseData);
    return { id: docRef.id, ...newCaseData, notes: [] } as Case;
  } catch (e) {
    console.error("Error adding case to Firestore:", e);
    return null;
  }
}

// Update a case's visibility
export async function updateCaseVisibility(caseId: string, isPublic: boolean): Promise<void> {
    try {
        const caseDocRef = doc(db, 'cases', caseId);
        await updateDoc(caseDocRef, { isPublic });
    } catch(e) {
        console.error("Error updating case visibility:", e);
    }
}


// Delete a case, only if the user is the owner
export async function deleteCase(userId: string, caseId: string): Promise<void> {
  try {
    const caseDocRef = doc(db, 'cases', caseId);
    const caseDoc = await getDoc(caseDocRef);
    if (!caseDoc.exists() || caseDoc.data().ownerId !== userId) {
        console.error("Error: User is not the owner or case does not exist.");
        return;
    }

    const notesCollectionRef = collection(caseDocRef, 'notes');
    const notesSnapshot = await getDocs(notesCollectionRef);
    const batch = writeBatch(db);
    notesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    await deleteDoc(caseDocRef);
  } catch (e) {
    console.error("Error deleting case from Firestore:", e);
  }
}

// Add a member to a case
export async function inviteUserToCase(caseId: string, email: string): Promise<void> {
    try {
        const caseDocRef = doc(db, 'cases', caseId);
        await updateDoc(caseDocRef, {
            memberEmails: arrayUnion(email)
        });
    } catch (e) {
        console.error("Error inviting user:", e);
    }
}

// Remove a member from a case
export async function removeUserFromCase(caseId: string, email: string): Promise<void> {
    try {
        const caseDocRef = doc(db, 'cases', caseId);
        await updateDoc(caseDocRef, {
            memberEmails: arrayRemove(email)
        });
    } catch (e) {
        console.error("Error removing user:", e);
    }
}

// Note functions now only need caseId, not userId
export async function addNote(caseId: string, noteData: Omit<Note, 'id'>): Promise<Note | null> {
  try {
    const notesCollection = collection(db, 'cases', caseId, 'notes');
    const docRef = await addDoc(notesCollection, noteData);
    return { id: docRef.id, ...noteData };
  } catch (e) {
    console.error("Error adding note to Firestore:", e);
    return null;
  }
}

export async function deleteNote(caseId: string, noteId: string): Promise<void> {
  try {
    const noteDocRef = doc(db, 'cases', caseId, 'notes', noteId);
    await deleteDoc(noteDocRef);
  } catch (e) {
    console.error("Error deleting note from Firestore:", e);
  }
}

export async function updateNotePosition(caseId: string, noteId: string, x: number, y: number): Promise<void> {
  try {
    const noteDocRef = doc(db, 'cases', caseId, 'notes', noteId);
    await updateDoc(noteDocRef, { x, y });
  } catch (e) {
    console.error("Error updating note position in Firestore:", e);
  }
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './firebase.ts';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, writeBatch, query } from 'firebase/firestore';
import type { Case, Note } from './types.ts';

// Firestore uses strings for IDs
export class StorageService {
  private static getCasesCollection(userId: string) {
    return collection(db, 'users', userId, 'cases');
  }

  static async loadCases(userId: string): Promise<Case[]> {
    try {
      const casesCollection = this.getCasesCollection(userId);
      const caseSnapshot = await getDocs(casesCollection);
      const cases: Case[] = [];
      for (const caseDoc of caseSnapshot.docs) {
        // We are storing notes as a subcollection, so we need to fetch them separately
        const notesSnapshot = await getDocs(collection(caseDoc.ref, 'notes'));
        const notes = notesSnapshot.docs.map(noteDoc => ({
          id: noteDoc.id,
          ...noteDoc.data()
        } as Note));
        
        cases.push({
          id: caseDoc.id,
          name: caseDoc.data().name,
          notes: notes,
        });
      }
      return cases;
    } catch (e) {
      console.error("Error loading cases from Firestore:", e);
      return [];
    }
  }

  static async addCase(userId: string, name: string): Promise<Case | null> {
    try {
      const casesCollection = this.getCasesCollection(userId);
      const docRef = await addDoc(casesCollection, { name });
      return { id: docRef.id, name, notes: [] };
    } catch (e) {
      console.error("Error adding case to Firestore:", e);
      return null;
    }
  }

  static async deleteCase(userId: string, caseId: string): Promise<void> {
    try {
      const caseDocRef = doc(db, 'users', userId, 'cases', caseId);
      // Also delete subcollection of notes
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

  static async addNote(userId: string, caseId: string, noteData: Omit<Note, 'id'>): Promise<Note | null> {
    try {
      const notesCollection = collection(db, 'users', userId, 'cases', caseId, 'notes');
      const docRef = await addDoc(notesCollection, noteData);
      return { id: docRef.id, ...noteData };
    } catch (e) {
      console.error("Error adding note to Firestore:", e);
      return null;
    }
  }

  static async deleteNote(userId: string, caseId: string, noteId: string): Promise<void> {
    try {
      const noteDocRef = doc(db, 'users', userId, 'cases', caseId, 'notes', noteId);
      await deleteDoc(noteDocRef);
    } catch (e) {
      console.error("Error deleting note from Firestore:", e);
    }
  }
  
  static async updateNotePosition(userId: string, caseId: string, noteId: string, x: number, y: number): Promise<void> {
    try {
      const noteDocRef = doc(db, 'users', userId, 'cases', caseId, 'notes', noteId);
      await updateDoc(noteDocRef, { x, y });
    } catch (e) {
      console.error("Error updating note position in Firestore:", e);
    }
  }
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// This interface represents the data structure of a single note
// as used within the application logic (client-side).
// The 'id' is the Firestore document ID.
export type Note = {
  id: string;
  content: string;
  x: number;
  y: number;
  rotation: number;
};

// This interface represents the data structure of a single case
// as used within the application logic (client-side).
// The 'id' is the Firestore document ID, and 'notes' is an array
// populated from the 'notes' subcollection.
export type Case = {
  id: string;
  name: string;
  notes: Note[];
};
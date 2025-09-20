/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Note {
  id: string;
  content: string;
  x: number;
  y: number;
  rotation: number;
}

export interface Case {
  id: string;
  name: string;
  notes: Note[];
}

// A serializable, plain object representation of a Firebase User.
export interface PlainUser {
  uid: string;
  displayName: string | null;
  email: string | null;
}
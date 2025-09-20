/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Re-export types from other files in this directory
// for easy importing elsewhere.
export * from './firestore.ts';

// A serializable, plain object representation of a Firebase User.
export type PlainUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
};
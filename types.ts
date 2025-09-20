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
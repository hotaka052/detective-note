/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Note {
  id: number;
  content: string;
  x: number;
  y: number;
  rotation: number;
}

export interface Case {
  id: number;
  name: string;
  notes: Note[];
}

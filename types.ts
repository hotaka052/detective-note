/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface Note {
  id: number;
  content: string;
  x: number;
  y: number;
  rotation: number;
}

interface Case {
  id: number;
  name: string;
  notes: Note[];
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Case } from './types';

const STORAGE_KEY = 'detective-app-data';

export class StorageService {
  static loadCases(): Case[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        // Basic data validation
        if (Array.isArray(parsedData)) {
            return parsedData;
        }
      } catch (e) {
        console.error("Failed to parse data from localStorage", e);
        // If parsing fails, fall back to initial data
        return this.getInitialData();
      }
    }
    return this.getInitialData();
  }

  static saveCases(cases: Case[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch (e) {
        console.error("Failed to save data to localStorage", e);
    }
  }
  
  private static getInitialData(): Case[] {
    return [{
      id: Date.now(),
      name: 'サンプル事件',
      notes: [
        { id: Date.now() + 1, content: '事件のタイムラインを整理する。', x: 100, y: 150, rotation: -5 },
        { id: Date.now() + 2, content: '容疑者Xのアリバイを確認。', x: 400, y: 80, rotation: 3 }
      ]
    }];
  }
}

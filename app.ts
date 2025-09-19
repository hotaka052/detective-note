/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StorageService } from './storage';
import { CaseSelectionView } from './views/case-selection-view';
import { NotebookView } from './views/notebook-view';
import type { Case, Note } from './types';

export class App {
  private cases: Case[] = [];
  private activeCaseId: number | null = null;
  
  private caseSelectionView: CaseSelectionView;
  private notebookView: NotebookView;

  constructor() {
    this.caseSelectionView = new CaseSelectionView({
      onCaseAdd: this.addCase.bind(this),
      onCaseDelete: this.deleteCase.bind(this),
      onCaseSelect: this.selectCase.bind(this)
    });
    
    this.notebookView = new NotebookView({
      onNoteAdd: this.addNote.bind(this),
      onNoteDelete: this.deleteNote.bind(this),
      onNoteUpdate: this.updateNotePosition.bind(this),
      onBack: this.showCaseSelectionView.bind(this)
    });
    
    this.init();
  }

  private init() {
    this.cases = StorageService.loadCases();
    this.showCaseSelectionView();
  }
  
  private save() {
    StorageService.saveCases(this.cases);
  }
  
  private getActiveCase(): Case | undefined {
    return this.cases.find(c => c.id === this.activeCaseId);
  }
  
  // --- View Management ---
  private showCaseSelectionView() {
    this.activeCaseId = null;
    this.notebookView.hide();
    this.caseSelectionView.show();
    this.caseSelectionView.render(this.cases);
  }

  private showNotebookView() {
    const activeCase = this.getActiveCase();
    if (!activeCase) return;
    this.caseSelectionView.hide();
    this.notebookView.show();
    this.notebookView.render(activeCase);
  }
  
  // --- Case Management Callbacks ---
  private addCase(name: string) {
    const newCase: Case = {
      id: Date.now(),
      name,
      notes: [],
    };
    
    this.cases.push(newCase);
    this.save();
    this.caseSelectionView.render(this.cases);
  }
  
  private deleteCase(id: number) {
    if (confirm('この事件ファイルとすべてのメモを完全に削除しますか？')) {
        this.cases = this.cases.filter(c => c.id !== id);
        this.save();
        this.caseSelectionView.render(this.cases);
    }
  }
  
  private selectCase(id: number) {
    this.activeCaseId = id;
    this.showNotebookView();
  }
  
  // --- Note Management Callbacks ---
  private addNote(content: string) {
    const activeCase = this.getActiveCase();
    if (!activeCase) return;

    const { clientWidth, clientHeight } = document.getElementById('notes-container') as HTMLElement;
    const newNote: Note = {
      id: Date.now(),
      content,
      x: Math.max(0, Math.floor(Math.random() * (clientWidth - 250))),
      y: Math.max(0, Math.floor(Math.random() * (clientHeight - 150))),
      rotation: Math.floor(Math.random() * 20) - 10,
    };

    activeCase.notes.push(newNote);
    this.save();
    this.notebookView.render(activeCase);
  }
  
  private deleteNote(id: number) {
    const activeCase = this.getActiveCase();
    if (!activeCase) return;
    
    activeCase.notes = activeCase.notes.filter(note => note.id !== id);
    this.save();
    this.notebookView.render(activeCase);
  }

  private updateNotePosition(id: number, x: number, y: number) {
    const activeCase = this.getActiveCase();
    if (!activeCase) return;
    
    const note = activeCase.notes.find(n => n.id === id);
    if (note) {
      note.x = x;
      note.y = y;
      this.save();
    }
  }
}

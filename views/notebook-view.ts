/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Case, Note } from '../types';

type NotebookViewEvents = {
  onNoteAdd: (content: string) => void;
  onNoteDelete: (noteId: number) => void;
  onNoteUpdate: (noteId: number, x: number, y: number) => void;
  onBack: () => void;
};

export class NotebookView {
  private view: HTMLElement;
  private notesContainer: HTMLElement;
  private addNoteForm: HTMLFormElement;
  private noteInput: HTMLInputElement;
  private backToCasesButton: HTMLButtonElement;
  private caseTitleElement: HTMLElement;
  
  private activeNoteElement: HTMLElement | null = null;
  private offsetX = 0;
  private offsetY = 0;
  
  private events: NotebookViewEvents;

  constructor(events: NotebookViewEvents) {
    this.view = document.getElementById('notebook-view') as HTMLElement;
    this.notesContainer = document.getElementById('notes-container') as HTMLElement;
    this.addNoteForm = document.getElementById('add-note-form') as HTMLFormElement;
    this.noteInput = document.getElementById('note-input') as HTMLInputElement;
    this.backToCasesButton = document.getElementById('back-to-cases') as HTMLButtonElement;
    this.caseTitleElement = document.getElementById('case-title') as HTMLElement;
    this.events = events;
    this.bindEventListeners();
  }

  private bindEventListeners() {
    this.addNoteForm.addEventListener('submit', this.handleAddNote.bind(this));
    this.backToCasesButton.addEventListener('click', () => this.events.onBack());
    document.addEventListener('mousemove', this.drag.bind(this));
    document.addEventListener('mouseup', this.dragEnd.bind(this));
  }
  
  public render(activeCase: Case) {
    this.caseTitleElement.textContent = `事件: ${activeCase.name}`;
    this.notesContainer.innerHTML = '';
    activeCase.notes.forEach(note => {
      const noteElement = this.createNoteElement(note);
      this.notesContainer.appendChild(noteElement);
    });
  }

  public show() { this.view.classList.remove('hidden'); }
  public hide() { this.view.classList.add('hidden'); }
  
  private handleAddNote(event: Event) {
    event.preventDefault();
    const content = this.noteInput.value.trim();
    if (content) {
      this.events.onNoteAdd(content);
      this.noteInput.value = '';
      this.noteInput.focus();
    }
  }

  private createNoteElement(note: Note): HTMLElement {
    const noteElement = document.createElement('div');
    noteElement.className = 'note torn-paper group absolute w-[250px] min-h-[150px] p-5 bg-[#ffc] shadow-[5px_5px_15px_rgba(0,0,0,0.5)] text-lg cursor-move select-none transition-transform transition-shadow duration-200 ease-out hover:scale-105 hover:shadow-[10px_10px_20px_rgba(0,0,0,0.5)] hover:z-10';
    noteElement.dataset.id = note.id.toString();
    noteElement.style.left = `${note.x}px`;
    noteElement.style.top = `${note.y}px`;
    noteElement.style.transform = `rotate(${note.rotation}deg)`;

    const contentElement = document.createElement('div');
    contentElement.className = 'w-full h-full whitespace-pre-wrap break-words';
    contentElement.textContent = note.content;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white border-none rounded-full cursor-pointer flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600';
    deleteButton.innerHTML = '&times;';
    deleteButton.setAttribute('aria-label', 'Delete note');
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.events.onNoteDelete(note.id);
    });

    noteElement.appendChild(contentElement);
    noteElement.appendChild(deleteButton);
    
    noteElement.addEventListener('mousedown', this.dragStart.bind(this));

    return noteElement;
  }
  
  // --- Drag and Drop Logic ---
  private dragStart(event: MouseEvent) {
    const target = event.target as HTMLElement;
    this.activeNoteElement = target.closest('.note');
    if (!this.activeNoteElement) return;

    this.activeNoteElement.classList.add('cursor-grabbing', 'shadow-[15px_15px_25px_rgba(0,0,0,0.6)]', 'z-[999]');
    
    const rect = this.activeNoteElement.getBoundingClientRect();
    const containerRect = this.notesContainer.getBoundingClientRect();
    this.offsetX = event.clientX - rect.left + containerRect.left;
    this.offsetY = event.clientY - rect.top + containerRect.top;
  }

  private drag(event: MouseEvent) {
    if (!this.activeNoteElement) return;
    event.preventDefault();

    const containerRect = this.notesContainer.getBoundingClientRect();
    let newX = event.clientX - this.offsetX;
    let newY = event.clientY - this.offsetY;
    
    newX = Math.max(0, Math.min(newX, containerRect.width - this.activeNoteElement.offsetWidth));
    newY = Math.max(0, Math.min(newY, containerRect.height - this.activeNoteElement.offsetHeight));
    
    this.activeNoteElement.style.left = `${newX}px`;
    this.activeNoteElement.style.top = `${newY}px`;
  }
  
  private dragEnd() {
    if (!this.activeNoteElement) return;
    
    this.activeNoteElement.classList.remove('cursor-grabbing', 'shadow-[15px_15px_25px_rgba(0,0,0,0.6)]', 'z-[999]');
    
    const id = parseInt(this.activeNoteElement.dataset.id || '0');
    if (id) {
        const x = parseInt(this.activeNoteElement.style.left, 10);
        const y = parseInt(this.activeNoteElement.style.top, 10);
        this.events.onNoteUpdate(id, x, y);
    }
    
    this.activeNoteElement = null;
  }
}

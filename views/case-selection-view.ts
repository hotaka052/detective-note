/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Case } from '../types';

type CaseSelectionEvents = {
  onCaseAdd: (name: string) => void;
  onCaseDelete: (caseId: number) => void;
  onCaseSelect: (caseId: number) => void;
};

export class CaseSelectionView {
  private view: HTMLElement;
  private addCaseForm: HTMLFormElement;
  private caseNameInput: HTMLInputElement;
  private caseListContainer: HTMLElement;
  private events: CaseSelectionEvents;

  constructor(events: CaseSelectionEvents) {
    this.view = document.getElementById('case-selection-view') as HTMLElement;
    this.addCaseForm = document.getElementById('add-case-form') as HTMLFormElement;
    this.caseNameInput = document.getElementById('case-name-input') as HTMLInputElement;
    this.caseListContainer = document.getElementById('case-list') as HTMLElement;
    this.events = events;
    this.bindEventListeners();
  }

  private bindEventListeners() {
    this.addCaseForm.addEventListener('submit', this.handleAddCase.bind(this));
  }
  
  public render(cases: Case[]) {
    this.caseListContainer.innerHTML = '';
    cases.forEach(caseItem => {
      const caseElement = this.createCaseElement(caseItem);
      this.caseListContainer.appendChild(caseElement);
    });
  }

  public show() { this.view.classList.remove('hidden'); }
  public hide() { this.view.classList.add('hidden'); }

  private handleAddCase(event: Event) {
    event.preventDefault();
    const name = this.caseNameInput.value.trim();
    if (name) {
      this.events.onCaseAdd(name);
      this.caseNameInput.value = '';
      this.caseNameInput.focus();
    }
  }

  private createCaseElement(caseItem: Case): HTMLElement {
    const caseCard = document.createElement('div');
    caseCard.className = 'bg-yellow-200/50 p-4 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border-t-8 border-yellow-500/60 flex flex-col justify-between';
    caseCard.addEventListener('click', () => this.events.onCaseSelect(caseItem.id));

    const caseName = document.createElement('h3');
    caseName.className = 'font-display text-xl font-bold mb-2 break-words';
    caseName.textContent = caseItem.name;
    
    const footer = document.createElement('div');
    footer.className = 'flex justify-between items-center mt-4';
    
    const noteCount = document.createElement('p');
    noteCount.className = 'text-sm text-gray-600';
    noteCount.textContent = `メモ: ${caseItem.notes.length}件`;
    
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '&times;';
    deleteButton.className = 'text-red-500 font-bold text-2xl hover:text-red-700 transition-colors leading-none px-2 rounded-full';
    deleteButton.setAttribute('aria-label', `Delete case ${caseItem.name}`);
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.events.onCaseDelete(caseItem.id);
    });
    
    footer.appendChild(noteCount);
    footer.appendChild(deleteButton);
    
    caseCard.appendChild(caseName);
    caseCard.appendChild(footer);
    
    return caseCard;
  }
}

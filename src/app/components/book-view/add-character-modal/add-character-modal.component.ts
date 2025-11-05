// src/app/components/book-view/add-character-modal/add-character-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, effect, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import type { ICharacter, IRelationship } from '../../../../types/data';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { FocusTrapDirective } from '../../../directives/focus-trap.directive';

@Component({
  selector: 'app-add-character-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, FocusTrapDirective],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
      [class.opacity-100]="show()"
      [class.opacity-0]="!show()"
      [class.pointer-events-none]="!show()"
      (click)="close()" 
      aria-modal="true"
      role="dialog"
    >
      <div 
        appFocusTrap
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()" 
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-200">
            {{ characterToEdit() ? 'Edit Character' : 'Add New Character' }}
          </h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-200 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500 rounded">
            <app-icon name="outline-x-mark-24" class="w-6 h-6" />
          </button>
        </div>

        <form [formGroup]="characterForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label for="charName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Character Name
            </label>
            <input
              type="text"
              id="charName"
              formControlName="name" 
              class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                     text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 
                     focus:outline-none focus:ring-2 focus:ring-accent-600 dark:focus:ring-accent-500"
              placeholder="e.g., Andra, Bima..."
              required
            />
            @if (characterForm.controls['name'].invalid && (characterForm.controls['name'].dirty || characterForm.controls['name'].touched)) {
              <div class="text-red-400 text-xs mt-1"> Name cannot be empty. </div>
            }
          </div>

          <div class="mb-4">
             <label for="charDesc" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
               Short Description (Optional)
             </label>
             <textarea
               id="charDesc"
               formControlName="description" 
               rows="3"
               class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                      text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 
                      focus:outline-none focus:ring-2 focus:ring-accent-600 dark:focus:ring-accent-500"
               placeholder="Traits, role, or short notes..."
             ></textarea>
          </div>

          <!-- Hubungan Karakter Section -->
          <div class="mb-6 border-t border-gray-300 dark:border-gray-700 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-3">Character Relationships</h3>
            
            <div formArrayName="relationships" class="space-y-3 max-h-40 overflow-y-auto pr-2">
              @for (relGroup of relationshipsArray.controls; track $index) {
                <div [formGroupName]="$index" class="bg-gray-100 dark:bg-gray-700 p-3 rounded-md flex gap-3 items-center">
                  
                  <select formControlName="targetId" class="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md 
                                                            text-gray-900 dark:text-white text-sm 
                                                            focus:outline-none focus:ring-2 focus:ring-accent-600 dark:focus:ring-accent-500">
                    <option [ngValue]="null" disabled>Select Character</option>
                    @for (target of availableTargets(); track target.id) {
                      <option [ngValue]="target.id">{{ target.name }}</option>
                    }
                  </select>
                  
                  <input type="text" formControlName="type" placeholder="Type (Rival, Friend, etc.)" 
                         class="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md 
                                text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500
                                focus:outline-none focus:ring-2 focus:ring-accent-600 dark:focus:ring-accent-500">
                  
                  <button type="button" (click)="removeRelationship($index)" class="text-red-400 hover:text-red-300 p-1 flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Delete Relationship">
                     <app-icon name="solid-trash-20" class="w-5 h-5" />
                  </button>
                </div>
              }
               @if (relationshipsArray.controls.length === 0) {
                  <p class="text-sm text-center text-gray-500 py-2">No relationships added yet.</p>
               }
            </div>

            <button type="button" (click)="addRelationship()" class="mt-3 px-3 py-1.5 text-sm 
                                                                    bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 
                                                                    text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-150
                                                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500">
              + Add Relationship
            </button>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 
                     text-gray-800 dark:text-gray-200 rounded-md transition duration-150
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="characterForm.invalid || isLoading()" 
              class="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md 
                     disabled:opacity-50 disabled:cursor-not-allowed transition duration-150
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
            >
              {{ isLoading() ? 'Saving...' : (characterToEdit() ? 'Save Changes' : 'Save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCharacterModalComponent {
  show = input.required<boolean>();
  characterToEdit = input<ICharacter | null>(null);
  closeModal = output<void>();

  private fb = inject(FormBuilder);
  private bookState = inject(CurrentBookStateService); 

  isLoading = signal(false);

  readonly availableTargets = computed<ICharacter[]>(() => {
    const characters = this.bookState.characters();
    const currentId = this.characterToEdit()?.id;
    return currentId ? characters.filter(char => char.id !== currentId) : characters;
  });
  
  characterForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    relationships: this.fb.array<FormGroup>([])
  });
  
  get relationshipsArray(): FormArray<FormGroup> {
    return this.characterForm.get('relationships') as FormArray<FormGroup>;
  }

  constructor() {
    effect(() => {
      const character = this.characterToEdit();
      const isVisible = this.show();

      if (character && isVisible) {
        this.characterForm.patchValue({
          name: character.name,
          description: character.description
        });
        this.setRelationshipsFormArray(character.relationships || []); 
      } else if (isVisible) {
        this.characterForm.reset({ name: '', description: '' });
        this.setRelationshipsFormArray([]); 
      }
    });
  }
  
  private createRelationshipFormGroup(rel?: IRelationship): FormGroup {
    return this.fb.group({
      targetId: [rel?.targetId || null, Validators.required],
      type: [rel?.type || '', Validators.required],
    });
  }

  private setRelationshipsFormArray(relationships: IRelationship[]): void {
    const formArray = this.fb.array(
        (relationships || []).map(rel => this.createRelationshipFormGroup(rel))
    );
    this.characterForm.setControl('relationships', formArray);
  }

  addRelationship(): void {
    this.relationshipsArray.push(this.createRelationshipFormGroup());
  }

  removeRelationship(index: number): void {
    this.relationshipsArray.removeAt(index);
  }

  async onSubmit(): Promise<void> {
    if (this.characterForm.invalid || this.isLoading()) {
      this.characterForm.markAllAsTouched();
      return;
    }

    const { name, description, relationships } = this.characterForm.value;
    const character = this.characterToEdit();
    
    const validRelationships: IRelationship[] = (relationships || [])
      .filter((rel: any) => rel && rel.targetId != null && rel.type && rel.type.trim() !== '')
      .map((rel: any) => ({ targetId: Number(rel.targetId), type: rel.type.trim() }));

    this.isLoading.set(true);
    try {
      if (character && character.id) {
        await this.bookState.updateCharacter(character.id, { 
            name: name!, 
            description: description!, 
            relationships: validRelationships
        });
      } else {
        await this.bookState.addCharacter(name!, description!, validRelationships);
      }
      this.close();
    } catch (error) {
      console.error("Failed to save character:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}

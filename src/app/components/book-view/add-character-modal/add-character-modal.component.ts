// src/app/components/book-view/add-character-modal/add-character-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, effect, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import type { ICharacter, IRelationship } from '../../../../types/data';
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-add-character-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
      [class.opacity-100]="show()"
      [class.opacity-0]="!show()"
      [class.pointer-events-none]="!show()"
      (click)="close()" 
      aria-modal="true"
      role="dialog"
    >
      <div 
        class="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()" 
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-white">
            {{ characterToEdit() ? 'Edit Karakter' : 'Tambah Karakter Baru' }}
          </h2>
          <button (click)="close()" class="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <form [formGroup]="characterForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label for="charName" class="block text-sm font-medium text-gray-300 mb-1">
              Nama Karakter
            </label>
            <input
              type="text"
              id="charName"
              formControlName="name" 
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Misal: Andra, Bima..."
              required
            />
            @if (characterForm.controls['name'].invalid && (characterForm.controls['name'].dirty || characterForm.controls['name'].touched)) {
              <div class="text-red-400 text-xs mt-1"> Nama tidak boleh kosong. </div>
            }
          </div>

          <div class="mb-4">
             <label for="charDesc" class="block text-sm font-medium text-gray-300 mb-1">
               Deskripsi Singkat (Opsional)
             </label>
             <textarea
               id="charDesc"
               formControlName="description" 
               rows="3"
               class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
               placeholder="Ciri-ciri, peran, atau catatan singkat..."
             ></textarea>
          </div>

          <!-- Hubungan Karakter Section -->
          <div class="mb-6 border-t border-gray-700 pt-4">
            <h3 class="text-lg font-semibold text-gray-300 mb-3">Hubungan Karakter</h3>
            
            <div formArrayName="relationships" class="space-y-3 max-h-40 overflow-y-auto pr-2">
              @for (relGroup of relationshipsArray.controls; track $index) {
                <div [formGroupName]="$index" class="bg-gray-700 p-3 rounded-md flex gap-3 items-center">
                  
                  <select formControlName="targetId" class="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option [ngValue]="null" disabled>Pilih Karakter</option>
                    @for (target of availableTargets(); track target.id) {
                      <option [ngValue]="target.id">{{ target.name }}</option>
                    }
                  </select>
                  
                  <input type="text" formControlName="type" placeholder="Tipe (Rival, Teman, etc.)" class="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  
                  <button type="button" (click)="removeRelationship($index)" class="text-red-400 hover:text-red-300 p-1 flex-shrink-0" aria-label="Hapus Hubungan">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              }
               @if (relationshipsArray.controls.length === 0) {
                  <p class="text-sm text-center text-gray-500 py-2">Belum ada hubungan yang ditambahkan.</p>
               }
            </div>

            <button type="button" (click)="addRelationship()" class="mt-3 px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md text-white transition-colors duration-150">
              + Tambah Hubungan
            </button>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white transition duration-150"
            >
              Batal
            </button>
            <button
              type="submit"
              [disabled]="characterForm.invalid || isLoading()" 
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white disabled:opacity-50 transition duration-150"
            >
              {{ isLoading() ? 'Menyimpan...' : (characterToEdit() ? 'Simpan Perubahan' : 'Simpan') }}
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
      console.error("Gagal menyimpan karakter:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}
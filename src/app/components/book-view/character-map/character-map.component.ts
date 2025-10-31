// src/app/components/book-view/character-map/character-map.component.ts
import { Component, ChangeDetectionStrategy, inject, OnDestroy, ElementRef, ViewChild, effect, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import type { ICharacter } from '../../../../types/data';
import * as d3 from 'd3';
import { CharacterDetailModalComponent } from '../character-detail-modal/character-detail-modal.component'; 
import { FormsModule } from '@angular/forms'; 
import { SettingsService } from '../../../state/settings.service';

// Definisikan tipe data untuk node dan link D3
interface Node extends d3.SimulationNodeDatum {
  id: number;
  name: string;
}

type Link = d3.SimulationLinkDatum<Node> & {
  type: string;
};

@Component({
  selector: 'app-character-map',
  standalone: true,
  imports: [CommonModule, CharacterDetailModalComponent, FormsModule], 
  template: `
    <div class="p-4 rounded-lg bg-white dark:bg-gray-800/50 min-h-[60vh] relative overflow-hidden">
      <div class="mb-4 flex-shrink-0 relative z-10">
          <label for="filterChar" class="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Sorot Karakter:</label>
          <select id="filterChar" 
                  [ngModel]="selectedNodeId()" 
                  (ngModelChange)="selectNode($event)"
                  class="px-3 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                         text-gray-900 dark:text-gray-200 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-accent-600 dark:focus:ring-accent-500">
             <option [ngValue]="null">-- Semua Karakter --</option>
             @for (char of bookState.characters(); track char.id) {
               <option [ngValue]="char.id">{{ char.name }}</option>
             }
          </select>
      </div>

      <div #container class="w-full h-full min-h-[60vh] absolute top-0 left-0"></div>
      
      @if (bookState.isLoadingCharacters()) {
        <div class="absolute inset-0 flex justify-center items-center bg-white/50 dark:bg-gray-800/50 z-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600 dark:border-accent-400"></div>
        </div>
      } @else if (bookState.characters().length === 0) {
         <div class="absolute inset-0 flex justify-center items-center z-20">
            <p class="text-center text-gray-500">
                Tambah karakter untuk melihat visualisasi hubungan mereka.
            </p>
         </div>
      }
    </div>

    @if (showDetailModal()) {
        <app-character-detail-modal
            [show]="showDetailModal()"
            [character]="viewingCharacter()"
            (closeModal)="closeDetailModal()">
        </app-character-detail-modal>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
    /* Pastikan SVG mengisi kontainer div */
    :host ::ng-deep svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterMapComponent implements OnDestroy, AfterViewInit {
  public bookState = inject(CurrentBookStateService);
  private settingsService = inject(SettingsService);

  @ViewChild('container') private container!: ElementRef<HTMLDivElement>;
  private svg: any;
  private viewport: any; // Grup <g> untuk menampung zoom/pan
  private zoom: any; // Behavior D3 Zoom
  private simulation: d3.Simulation<Node, Link> | undefined;
  
  private resizeObserver!: ResizeObserver;
  private linkedByIndex: { [key: string]: boolean } = {}; 

  // State Modal
  showDetailModal = signal(false);
  viewingCharacter = signal<ICharacter | null>(null);

  // State Filter
  selectedNodeId = signal<number | null>(null);

  constructor() {
    effect(() => {
      // Efek ini akan berjalan saat karakter ATAU warna aksen berubah
      this.settingsService.accentColor(); // Lacak warna aksen
      const characters = this.bookState.characters();
      if (this.container && this.container.nativeElement.clientWidth > 0) {
          if (characters.length > 0) {
            this.createGraph(characters);
            this.updateHighlight(this.selectedNodeId()); 
          } else {
            this.clearGraph();
          }
      }
    });
  }
  
  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
        this.updateGraphSize();
    });
    this.resizeObserver.observe(this.container.nativeElement);
    
    // Panggilan manual awal
    const characters = this.bookState.characters();
    if (this.container.nativeElement.clientWidth > 0) {
      if (characters.length > 0) {
        this.createGraph(characters);
      } else {
        this.clearGraph();
      }
    }
  }

  ngOnDestroy(): void {
      this.simulation?.stop(); 
      if (this.resizeObserver) {
          this.resizeObserver.disconnect();
      }
  }
  
  private updateGraphSize(): void {
    if (!this.svg || !this.simulation || !this.container) return;
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;
    
    this.svg.attr('width', width).attr('height', height);
    this.simulation.force('center', d3.forceCenter(width / 2, height / 2));
    
    if (this.zoom) {
      this.svg.call(this.zoom.transform, d3.zoomIdentity);
    }
    
    this.simulation.alpha(0.3).restart(); 
  }

  private clearGraph(): void {
    if (!this.container) return;
    d3.select(this.container.nativeElement).selectAll('*').remove();
    this.svg = null;
    this.viewport = null;
    this.simulation = undefined;
    this.linkedByIndex = {};
  }
  
  private getLinkColor(type: string): string {
    const isDark = document.documentElement.classList.contains('dark');
    const colorMap: { [key: string]: string } = {
        'Rival': '#ef4444', // Red-500
        'Musuh': '#ef4444', 
        'Ally': '#22c55e', // Green-500
        'Sekutu': '#22c55e',
        'Family': '#3b82f6', // Blue-500
        'Keluarga': '#3b82f6',
        'Lover': '#ec4899', // Pink-500
        'Kekasih': '#ec4899',
        'Mentor': '#f59e0b', // Amber-500
    };
    return colorMap[type] || (isDark ? '#6b7280' : '#9ca3af'); // gray-500 / gray-400
  }

  selectNode(nodeId: number | null): void {
      this.selectedNodeId.set(nodeId);
      this.updateHighlight(nodeId);
  }

  viewCharacterDetails(nodeId: number): void {
      const character = this.bookState.characters().find(c => c.id === nodeId);
      if (character) {
          this.viewingCharacter.set(character);
          this.showDetailModal.set(true);
      }
  }

  closeDetailModal(): void {
      this.showDetailModal.set(false);
  }
  
  private isConnected(a: number, b: number): boolean {
    return this.linkedByIndex[`${a},${b}`] || this.linkedByIndex[`${b},${a}`] || a === b;
  }
  
  private updateHighlight(selectedId: number | null): void {
      if (!this.svg || !this.viewport) return;

      const link = this.viewport.selectAll('.link');
      const node = this.viewport.selectAll('.node-group');

      if (selectedId === null) {
          link.transition().duration(200).style('opacity', 0.6).attr('stroke', (d: any) => this.getLinkColor(d.type));
          node.transition().duration(200).style('opacity', 1).attr('fill-opacity', 1);
      } else {
          link.transition().duration(200).style('opacity', (d: any) => {
              const sourceId = d.source.id;
              const targetId = d.target.id;
              return (sourceId === selectedId || targetId === selectedId) ? 1.0 : 0.1;
          }).attr('stroke-width', (d: any) => {
              const sourceId = d.source.id;
              const targetId = d.target.id;
              return (sourceId === selectedId || targetId === selectedId) ? 3 : 2;
          });
          
          node.transition().duration(200).style('opacity', (d: any) => {
              return this.isConnected(d.id, selectedId) ? 1 : 0.2;
          }).attr('fill-opacity', (d: any) => {
              return this.isConnected(d.id, selectedId) ? 1 : 0.2;
          });
      }
  }

  private createGraph(characters: ICharacter[]): void {
    this.clearGraph();
    
    if (characters.length === 0 || !this.container) return;

    // Baca warna dari variabel CSS
    const style = getComputedStyle(document.documentElement);
    const accentColor = style.getPropertyValue('--accent-500').trim() || '#a855f7';
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#d1d5db' : '#374151';

    const nodes: Node[] = characters.map(c => ({ id: c.id!, name: c.name }));
    const links: Link[] = [];
    this.linkedByIndex = {};
    
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    characters.forEach(c => {
      if (c.relationships) {
        c.relationships.forEach(rel => {
          if (nodeMap.has(c.id!) && nodeMap.has(rel.targetId)) {
            const link: Link = { source: c.id!, target: rel.targetId, type: rel.type };
            links.push(link);
            this.linkedByIndex[`${c.id!},${rel.targetId}`] = true;
            this.linkedByIndex[`${rel.targetId},${c.id!}`] = true; 
          }
        });
      }
    });

    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight || 600; 

    this.svg = d3.select(this.container.nativeElement).append('svg')
      .attr('width', width).attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    this.viewport = this.svg.append('g').attr('class', 'viewport');

    this.simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = this.viewport.append('g')
      .attr('stroke-opacity', 0.6).attr('class', 'links') 
      .selectAll('line').data(links).join('line')
      .attr('class', 'link').attr('stroke-width', 2)
      .attr('stroke', (d: any) => this.getLinkColor(d.type)); 
      
    const node = this.viewport.append('g')
      .attr('class', 'nodes').selectAll('g').data(nodes).join('g')
      .attr('class', 'node-group').attr('cursor', 'pointer') 
      .on('click', (event: any, d: any) => { this.viewCharacterDetails(d.id); })
      .on('mouseover', (event: any, d: any) => { this.updateHighlight(d.id); })
      .on('mouseout', () => { this.updateHighlight(this.selectedNodeId()); })
      .call(this.drag(this.simulation));

    node.append('circle').attr('r', 10)
      .attr('fill', accentColor) // Gunakan warna aksen
      .append('title') 
      .text((d: any) => {
          const char = this.bookState.characters().find(c => c.id === d.id);
          return `${d.name}\n\n${char?.description || 'Tidak ada deskripsi.'}`;
      });

    node.append('text').text((d: any) => d.name)
      .attr('x', 15).attr('y', 5)
      .attr('fill', textColor) // Gunakan warna teks dinamis
      .style('text-shadow', isDark ? '0 0 3px #000' : 'none')
      .attr('font-size', '12px');

    this.simulation.on('tick', () => {
      link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    this.zoom = d3.zoom().scaleExtent([0.1, 8]).on('zoom', (event) => {
      this.viewport.attr('transform', event.transform);
    });
    
    this.svg.call(this.zoom);
  }
  
  private drag(simulation: d3.Simulation<Node, Link>): any {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
  }
}

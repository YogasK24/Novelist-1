// src/app/components/book-view/character-map/character-map.component.ts
import { Component, ChangeDetectionStrategy, inject, OnDestroy, ElementRef, ViewChild, effect, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import type { ICharacter } from '../../../../types/data';
import * as d3 from 'd3';
import { CharacterDetailModalComponent } from '../character-detail-modal/character-detail-modal.component'; // <-- Import Modal Detail
import { FormsModule } from '@angular/forms'; // <-- Import Forms Module untuk ngModel di select

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
  imports: [CommonModule, CharacterDetailModalComponent, FormsModule], // <-- Daftarkan Modal & FormsModule
  template: `
    <div class="p-4 rounded-lg bg-white dark:bg-slate-800 min-h-[60vh] relative border border-slate-200 dark:border-slate-700">
      
      <div class="mb-4 flex-shrink-0">
          <label for="filterChar" class="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">Sorot Karakter:</label>
          <select id="filterChar" 
                  [ngModel]="selectedNodeId()" 
                  (ngModelChange)="selectNode($event)"
                  class="px-3 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
             <option [ngValue]="null">-- Semua Karakter --</option>
             @for (char of bookState.characters(); track char.id) {
               <option [ngValue]="char.id">{{ char.name }}</option>
             }
          </select>
      </div>

      <div #container class="w-full h-full min-h-[60vh]"></div>
      
      @if (bookState.isLoadingChildren().characters) {
        <div class="absolute inset-0 flex justify-center items-center bg-white/50 dark:bg-slate-800/50">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 dark:border-purple-400"></div>
        </div>
      } @else if (bookState.characters().length === 0) {
         <div class="absolute inset-0 flex justify-center items-center">
            <p class="text-center text-slate-500">
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterMapComponent implements OnDestroy, AfterViewInit {
  public bookState = inject(CurrentBookStateService);

  @ViewChild('container') private container!: ElementRef<HTMLDivElement>;
  private svg: any;
  private simulation: d3.Simulation<Node, Link> | undefined;
  
  private resizeObserver!: ResizeObserver;
  private linkedByIndex: { [key: string]: boolean } = {}; // Untuk highlighting
  private textColor = signal('#e2e8f0'); // slate-200 (dark mode)
  private nodeColor = signal('#c084fc'); // purple-400 (dark mode)

  // State Modal
  showDetailModal = signal(false);
  viewingCharacter = signal<ICharacter | null>(null);

  // State Filter BARU
  selectedNodeId = signal<number | null>(null);

  constructor() {
    effect(() => {
      const characters = this.bookState.characters();
      const selectedId = this.selectedNodeId(); 
      if (this.container && this.container.nativeElement.clientWidth > 0) {
          if (characters.length > 0) {
            this.createGraph(characters);
            if (this.simulation) {
              this.updateHighlight(selectedId); 
            }
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
    this.simulation.alpha(0.3).restart(); 
  }

  private clearGraph(): void {
    if (!this.container) return;
    d3.select(this.container.nativeElement).selectAll('*').remove();
    this.svg = null;
    this.simulation = undefined;
    this.linkedByIndex = {};
  }
  
  private getLinkColor(type: string): string {
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
    return colorMap[type] || '#475569'; // slate-600
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
      if (!this.svg || !this.simulation) return;

      const link = this.svg.selectAll('.link');
      const node = this.svg.selectAll('.node-group');

      if (selectedId === null) {
          link.transition().duration(200).style('opacity', 0.6).attr('stroke', (d: any) => this.getLinkColor(d.type));
          node.transition().duration(200).style('opacity', 1).attr('fill-opacity', 1);
      } else {
          link.style('opacity', (d: any) => {
              const sourceId = d.source.id;
              const targetId = d.target.id;
              return (sourceId === selectedId || targetId === selectedId) ? 1.0 : 0.1;
          }).attr('stroke-width', (d: any) => {
              const sourceId = d.source.id;
              const targetId = d.target.id;
              return (sourceId === selectedId || targetId === selectedId) ? 3 : 2;
          });
          
          node.style('opacity', (d: any) => {
              return this.isConnected(d.id, selectedId) ? 1 : 0.2;
          }).attr('fill-opacity', (d: any) => {
              return this.isConnected(d.id, selectedId) ? 1 : 0.2;
          });
      }
  }

  private createGraph(characters: ICharacter[]): void {
    this.clearGraph();
    
    if (characters.length === 0 || !this.container) return;

    const nodes: Node[] = characters.map(c => ({ id: c.id!, name: c.name }));
    const links: Link[] = [];
    this.linkedByIndex = {};
    
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    characters.forEach(c => {
      if (c.relationships) {
        c.relationships.forEach(rel => {
          if (nodeMap.has(c.id!) && nodeMap.has(rel.targetId)) {
            const link: Link = {
              source: c.id!,
              target: rel.targetId,
              type: rel.type
            };
            links.push(link);
            
            const sourceId = c.id!;
            const targetId = rel.targetId;
            this.linkedByIndex[`${sourceId},${targetId}`] = true;
            this.linkedByIndex[`${targetId},${sourceId}`] = true; 
          }
        });
      }
    });

    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight || 600; 

    this.svg = d3.select(this.container.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    this.simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = this.svg.append('g')
      .attr('stroke-opacity', 0.6)
      .attr('class', 'links') 
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'link') 
      .attr('stroke-width', 2)
      .attr('stroke', (d: any) => this.getLinkColor(d.type)); 
      
    const node = this.svg.append('g')
      .attr('class', 'nodes') 
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node-group') 
      .attr('cursor', 'pointer') 
      .on('click', (event: any, d: any) => { 
          this.viewCharacterDetails(d.id);
      })
      .call(this.drag(this.simulation));

    node.append('circle')
      .attr('r', 10)
      .attr('fill', this.nodeColor())
      .append('title')
      .text((d: any) => {
          const char = this.bookState.characters().find(c => c.id === d.id);
          return `${d.name}\\n\\n${char?.description || 'Tidak ada deskripsi.'}`;
      });

    node.append('text')
      .text((d: any) => d.name)
      .attr('x', 15)
      .attr('y', 5)
      .attr('fill', this.textColor()) 
      .style('text-shadow', '0 0 3px rgba(0,0,0,0.5)')
      .attr('font-size', '12px');

    this.simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
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
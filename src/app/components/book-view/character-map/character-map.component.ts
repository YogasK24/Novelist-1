// src/app/components/book-view/character-map/character-map.component.ts
import { Component, ChangeDetectionStrategy, inject, OnDestroy, ElementRef, ViewChild, effect, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import type { ICharacter } from '../../../../types/data';
import * as d3 from 'd3';

// Definisikan tipe data untuk node dan link D3
interface Node extends d3.SimulationNodeDatum {
  id: number;
  name: string;
}

// FIX: Changed interface with 'extends' to a type alias with an intersection.
// This can resolve complex type inference issues. In this case, TypeScript was
// incorrectly reporting that the 'source' property did not exist on the Link type,
// even though it's part of d3.SimulationLinkDatum.
type Link = d3.SimulationLinkDatum<Node> & {
  type: string;
};

@Component({
  selector: 'app-character-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 rounded-lg bg-gray-800/50 min-h-[60vh] relative">
      <!-- Kontainer untuk render D3 -->
      <div #container class="w-full h-full min-h-[60vh]"></div>
      
      <!-- Tampilan Loading -->
      @if (bookState.isLoadingChildren().characters) {
        <div class="absolute inset-0 flex justify-center items-center bg-gray-800/50">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        </div>
      } @else if (bookState.characters().length === 0) {
         <!-- Tampilan jika tidak ada karakter -->
         <div class="absolute inset-0 flex justify-center items-center">
            <p class="text-center text-gray-500">
                Tambah karakter untuk melihat visualisasi hubungan mereka.
            </p>
         </div>
      }
    </div>
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

  constructor() {
    // Gunakan effect untuk bereaksi terhadap perubahan data karakter
    effect(() => {
      const characters = this.bookState.characters();
      if (this.container && this.container.nativeElement.clientWidth > 0) {
          if (characters.length > 0) {
            this.createGraph(characters);
          } else {
            this.clearGraph();
          }
      }
    });
  }
  
  ngAfterViewInit(): void {
    // Amati perubahan ukuran kontainer untuk membuat grafik responsif
    this.resizeObserver = new ResizeObserver(() => {
        this.updateGraphSize();
    });
    this.resizeObserver.observe(this.container.nativeElement);
    
    // Panggil pembuatan grafik secara manual sekali setelah view init,
    // karena effect mungkin sudah berjalan sebelum `this.container` siap.
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
      this.simulation?.stop(); // Hentikan simulasi saat komponen dihancurkan
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
    this.simulation.alpha(0.3).restart(); // "Bangunkan" simulasi
  }

  private clearGraph(): void {
    if (!this.container) return;
    d3.select(this.container.nativeElement).selectAll('*').remove();
    this.svg = null;
    this.simulation = undefined;
  }

  private createGraph(characters: ICharacter[]): void {
    this.clearGraph();
    
    if (characters.length === 0 || !this.container) return;

    // Transformasi data aplikasi menjadi data untuk D3
    const nodes: Node[] = characters.map(c => ({ id: c.id!, name: c.name }));
    const links: Link[] = [];
    
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    characters.forEach(c => {
      if (c.relationships) {
        c.relationships.forEach(rel => {
          if (nodeMap.has(c.id!) && nodeMap.has(rel.targetId)) {
            links.push({
              source: c.id!,
              target: rel.targetId,
              type: rel.type
            });
          }
        });
      }
    });

    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight || 600; // Fallback

    this.svg = d3.select(this.container.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Konfigurasi simulasi fisika
    this.simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Render elemen link (garis)
    const link = this.svg.append('g')
      .attr('stroke', '#9ca3af') // gray-400
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 2);
      
    // Render elemen node (lingkaran + teks)
    const node = this.svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(this.drag(this.simulation));

    node.append('circle')
      .attr('r', 10)
      .attr('fill', '#a855f7'); // purple-500

    node.append('text')
      .text((d: any) => d.name)
      .attr('x', 15)
      .attr('y', 5)
      .attr('fill', '#d1d5db') // gray-300
      .style('text-shadow', '0 0 3px #000')
      .attr('font-size', '12px');

    // Update posisi elemen pada setiap "tick" simulasi
    this.simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }
  
  // Fungsi untuk mengaktifkan drag & drop pada node
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
// src/app/components/book-view/character-map/character-map.component.ts
import { Component, AfterViewInit, OnDestroy, inject, ElementRef, ChangeDetectionStrategy, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import type { ICharacter } from '../../../../types/data';

// Asumsi global D3 tersedia melalui CDN
declare var d3: any; 

// Interface untuk data D3.js
// FIX: Redefined Node and Link interfaces to remove dependency on the 'd3' namespace,
// which was causing compilation errors. Added properties that are dynamically attached
// by the D3 simulation to ensure type safety.
interface Node {
    id: number;
    name: string;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
}

interface Link {
    source: any; 
    target: any;
    type: string; 
}

@Component({
  selector: 'app-character-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full min-h-[70vh]">
        <h3 class="text-xl font-semibold mb-3">Peta Hubungan Karakter</h3>
        @if (bookState.characters().length < 2) {
             <div class="text-center py-10 text-gray-500 bg-gray-800/50 ring-1 ring-white/10 rounded-lg">
                <p>Tambahkan minimal dua karakter dan definisikan hubungan mereka untuk melihat peta.</p>
             </div>
        } @else {
             <div #mapContainer class="flex-grow bg-gray-800/50 ring-1 ring-white/10 rounded-lg shadow-inner overflow-hidden relative">
             </div>
        }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterMapComponent implements AfterViewInit, OnDestroy {
  public bookState = inject(CurrentBookStateService);
  
  @ViewChild('mapContainer') private mapContainer!: ElementRef<HTMLDivElement>;
  
  private svg: any;
  private simulation: any;
  private resizeObserver!: ResizeObserver;

  constructor() {
    effect(() => {
        const characters = this.bookState.characters();
        if (this.svg && this.simulation) {
            this.updateMap(characters);
        }
    });
  }

  ngAfterViewInit(): void {
    if (typeof d3 === 'undefined') {
        console.error("D3.js library is not loaded. Check index.html CDN.");
        return;
    }
    
    // Hanya setup observer jika container ada
    if (this.mapContainer?.nativeElement) {
      this.resizeObserver = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
            // Jika SVG belum ada, inisialisasi. Jika sudah ada, resize.
            if (!this.svg) {
                this.initializeMap(width, height);
                this.updateMap(this.bookState.characters());
            } else {
                this.resizeMap(width, height);
            }
        }
      });
      this.resizeObserver.observe(this.mapContainer.nativeElement);
    }
  }
  
  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.simulation?.stop();
  }
  
  private resizeMap(width: number, height: number): void {
      this.svg.attr("width", width).attr("height", height);
      this.simulation.force("center", d3.forceCenter(width / 2, height / 2));
      this.simulation.alpha(0.3).restart(); // Beri sedikit 'dorongan' pada simulasi
  }

  private initializeMap(width: number, height: number): void {
      if (!this.mapContainer?.nativeElement) return;
      
      d3.select(this.mapContainer.nativeElement).select("svg").remove();

      this.svg = d3.select(this.mapContainer.nativeElement).append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [0, 0, width, height])
          .attr("style", "max-width: 100%; height: auto;");

      this.simulation = d3.forceSimulation()
          .force("link", d3.forceLink().id((d: any) => d.id).distance(150).strength(0.5))
          .force("charge", d3.forceManyBody().strength(-400))
          .force("center", d3.forceCenter(width / 2, height / 2));
          
      // Definisikan grup untuk link dan node agar node berada di atas link
      this.svg.append("g").attr("class", "links");
      this.svg.append("g").attr("class", "nodes");
  }
  
  private updateMap(characters: ICharacter[]): void {
      if (!this.svg || !this.simulation || characters.length < 1) {
          this.svg?.selectAll("*").remove(); 
          this.simulation?.nodes([]);
          return;
      }
      
      const nodes: Node[] = characters.map(char => ({ id: char.id!, name: char.name, x: char.id, y: char.id }));
      const links: Link[] = [];
      const charIdSet = new Set(characters.map(c => c.id));

      characters.forEach(char => {
          (char.relationships || []).forEach(rel => {
              if (charIdSet.has(rel.targetId) && char.id! < rel.targetId) {
                  links.push({
                      source: char.id!,
                      target: rel.targetId,
                      type: rel.type
                  });
              }
          });
      });

      const old = new Map(this.svg.select(".nodes").selectAll("g").data().map((d: any) => [d.id, d]));
      const updatedNodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));

      // Update link
      const link = this.svg.select(".links").selectAll("line")
          .data(links, (d: Link) => `${d.source}-${d.target}`);
      link.exit().remove();
      const linkEnter = link.enter().append("line")
          .attr("stroke", "#4b5563") // gray-600
          .attr("stroke-opacity", 0.7)
          .attr("stroke-width", 1.5);
      
      // Update node
      const node = this.svg.select(".nodes").selectAll("g")
          .data(updatedNodes, (d: Node) => d.id);
      node.exit().remove();
      const nodeEnter = node.enter().append("g")
          .call(this.drag(this.simulation));

      nodeEnter.append("circle")
          .attr("r", 18)
          .attr("fill", "#6d28d9") // violet-700
          .attr("stroke", "#a78bfa") // violet-400
          .attr("stroke-width", 2);
      
      nodeEnter.append("text")
          .text((d: Node) => d.name)
          .attr("x", 24)
          .attr("y", 6)
          .attr("fill", "#e5e7eb") // gray-200
          .style("font-size", "14px")
          .style("text-shadow", "0 1px 3px #000");

      this.simulation.nodes(updatedNodes);
      this.simulation.force("link").links(links);
      
      this.simulation.on("tick", () => {
          link.merge(linkEnter)
              .attr("x1", (d: any) => d.source.x)
              .attr("y1", (d: any) => d.source.y)
              .attr("x2", (d: any) => d.target.x)
              .attr("y2", (d: any) => d.target.y);
          node.merge(nodeEnter)
              .attr("transform", (d: Node) => `translate(${d.x}, ${d.y})`);
      });

      this.simulation.alpha(1).restart();
  }
  
  private drag = (simulation: any) => {
    const dragstarted = (event: any, d: any) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };
    
    const dragged = (event: any, d: any) => {
      d.fx = event.x;
      d.fy = event.y;
    };
    
    const dragended = (event: any, d: any) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = d.x; // Pin node
      d.fy = d.y; // Pin node
    };
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
  }
}
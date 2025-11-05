// src/app/components/statistics/heatmap-calendar/heatmap-calendar.component.ts
import { 
  Component, 
  ChangeDetectionStrategy, 
  input, 
  ElementRef, 
  viewChild, 
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

type HeatmapData = Map<string, number>;

@Component({
  selector: 'app-heatmap-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full text-gray-700 dark:text-gray-300">
      <h3 class="font-semibold mb-2">Aktivitas 1 Tahun Terakhir</h3>
      <div #svgContainer class="w-full overflow-x-auto overflow-y-hidden"></div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .day {
      stroke: #ccc;
      stroke-width: 0.5px;
    }
    :host ::ng-deep .month-label {
      font-size: 10px;
      fill: currentColor;
    }
    :host ::ng-deep .day-label {
      font-size: 9px;
      fill: currentColor;
    }
    /* Definisi warna heatmap */
    :host ::ng-deep .color-0 { fill: #ebedf0; } /* Abu-abu (dark: #374151) */
    :host ::ng-deep .color-1 { fill: #9be9a8; } /* Hijau (dark: #166534) */
    :host ::ng-deep .color-2 { fill: #40c463; } /* ... */
    :host ::ng-deep .color-3 { fill: #30a14e; } /* ... */
    :host ::ng-deep .color-4 { fill: #216e39; } /* Hijau tua (dark: #a7f3d0) */

    /* Override untuk Dark Mode (jika diperlukan, atau biarkan hijau) */
    :host-context(html.dark) ::ng-deep .color-0 { fill: #374151; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatmapCalendarComponent implements AfterViewInit, OnChanges {
  data = input<HeatmapData>(new Map());
  svgContainer = viewChild.required<ElementRef<HTMLDivElement>>('svgContainer');
  
  private svg: any;
  private isRendered = false;

  ngAfterViewInit(): void {
    this.drawChart();
    this.isRendered = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isRendered && changes['data']) {
      this.updateChart(); // Panggil update jika data berubah
    }
  }

  private drawChart(): void {
    const dataMap = this.data();
    
    // --- 1. Pengaturan Ukuran ---
    const cellSize = 12;
    const cellMargin = 2;
    const width = 720;
    const height = (cellSize + cellMargin) * 7;
    const monthLabelOffset = 20;
    const dayLabelOffset = 20;

    d3.select(this.svgContainer().nativeElement).selectAll("*").remove(); // Hapus SVG lama

    this.svg = d3.select(this.svgContainer().nativeElement)
      .append("svg")
      .attr("width", width + dayLabelOffset)
      .attr("height", height + monthLabelOffset)
      .append("g")
      .attr("transform", `translate(${dayLabelOffset}, ${monthLabelOffset})`);

    // --- 2. Perhitungan Rentang Tanggal (1 Tahun Terakhir) ---
    const endDate = new Date();
    const startDate = d3.timeDay.offset(endDate, -365);
    const dates = d3.timeDay.range(startDate, endDate);
    
    // --- 3. Skala Warna ---
    const maxWords = d3.max(Array.from(dataMap.values())) || 1;
    const colorScale = d3.scaleQuantize<string>()
      .domain([0, maxWords])
      .range(["color-1", "color-2", "color-3", "color-4"]);

    // --- 4. Render Kotak (Sel) ---
    this.svg.append("g")
      .selectAll(".day")
      .data(dates)
      .enter().append("rect")
      .attr("class", "day")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("rx", 2) // rounded corner
      .attr("ry", 2)
      .attr("x", (d: any) => d3.timeWeek.count(d3.timeYear(d), d) * (cellSize + cellMargin))
      .attr("y", (d: any) => d.getUTCDay() * (cellSize + cellMargin))
      .attr("data-date", (d: any) => d.toISOString().split('T')[0])
      .attr("fill", (d: any) => {
        const dateStr = d.toISOString().split('T')[0];
        const count = dataMap.get(dateStr);
        return count ? colorScale(count) : "color-0";
      })
      .append("title")
      .text((d: any) => {
        const dateStr = d.toISOString().split('T')[0];
        const count = dataMap.get(dateStr) || 0;
        return `${dateStr}: ${count} kata`;
      });

    // --- 5. Render Label Bulan ---
    this.svg.append("g")
      .selectAll(".month-label")
      .data(d3.timeMonth.range(d3.timeYear(startDate), endDate))
      .enter().append("text")
      .attr("class", "month-label")
      .attr("x", (d: any) => d3.timeWeek.count(d3.timeYear(d), d3.timeMonth.floor(d)) * (cellSize + cellMargin))
      .attr("y", -8)
      .text((d: any) => d3.timeFormat("%b")(d));
      
    // --- 6. Render Label Hari (Sen, Rab, Jum) ---
    const dayLabels = ['Mon', 'Wed', 'Fri'];
    this.svg.append("g")
      .selectAll(".day-label")
      .data([1, 3, 5]) // Indeks untuk Mon, Wed, Fri
      .enter().append("text")
      .attr("class", "day-label")
      .attr("x", -dayLabelOffset + 5)
      .attr("y", (d: any) => d * (cellSize + cellMargin) + (cellSize / 1.5))
      .text((d: any, i: number) => dayLabels[i]);
  }
  
  // Fungsi update (mirip dengan draw, tapi menggunakan transisi)
  private updateChart(): void {
    const dataMap = this.data();
    const maxWords = d3.max(Array.from(dataMap.values())) || 1;
    const colorScale = d3.scaleQuantize<string>()
      .domain([0, maxWords])
      .range(["color-1", "color-2", "color-3", "color-4"]);

    this.svg.selectAll(".day")
      .transition()
      .duration(500)
      .attr("fill", (d: any) => {
        const dateStr = d.toISOString().split('T')[0];
        const count = dataMap.get(dateStr);
        return count ? colorScale(count) : "color-0";
      })
      .select("title")
      .text((d: any) => {
        const dateStr = d.toISOString().split('T')[0];
        const count = dataMap.get(dateStr) || 0;
        return `${dateStr}: ${count} kata`;
      });
  }
}

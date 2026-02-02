import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChargeService } from './services/charge.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  currentKwh: number | null = null;
  chargeRate: number = 0.20;
  totals: any = null;
  chargeDate: string = new Date().toISOString().split('T')[0]; 
  rangeStart: string = '';
  rangeEnd: string = '';
  showTotals: boolean = false;
  // Visual effects state
  strobeActive: boolean = false;
  showSparks: boolean = false;
  // Lightning strike SVG (branching bolt)
  currentBoltSvg: SafeHtml | null = null;
  boltVisible: boolean = false;

  private _strobeTimer: any = null;
  private _strobeOffTimer: any = null;
  private _sparkTimer: any = null;
  private _boltTimer: any = null;
  private _boltHideTimer: any = null;
  constructor(private chargeService: ChargeService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.startStrobeLoop();
  }

  ngOnDestroy(): void {
    if (this._strobeTimer) clearTimeout(this._strobeTimer);
    if (this._strobeOffTimer) clearTimeout(this._strobeOffTimer);
    if (this._sparkTimer) clearTimeout(this._sparkTimer);
  }

  // Start a loop that triggers a short strobe/flash at random intervals
  private startStrobeLoop() {
    const ms = 2000 + Math.floor(Math.random() * 8000); // 2-10s
    this._strobeTimer = setTimeout(() => {
      // quick flash
      this.strobeActive = true;
      // sometimes trigger a spark cluster with the strobe
      if (Math.random() > 0.35) this.triggerSparkBurst(700 + Math.floor(Math.random() * 600));
      // sometimes show a branching bolt during the flash
      if (Math.random() > 0.45) this.triggerBoltStrike(120 + Math.floor(Math.random() * 400));

      // turn off the strobe after a short, realistic flash length
      this._strobeOffTimer = setTimeout(() => {
        this.strobeActive = false;
        // schedule the next flash
        this.startStrobeLoop();
      }, 80 + Math.floor(Math.random() * 240)); // 80-320ms flash
    }, ms);
  }

  // Show sparks for a short burst (used on strobe or when user submits a charge)
  private triggerSparkBurst(duration = 800) {
    if (this._sparkTimer) clearTimeout(this._sparkTimer);
    this.showSparks = true;
    this._sparkTimer = setTimeout(() => {
      this.showSparks = false;
    }, duration);
  }

  // Inline entry message when a charge is logged (replaces alert)
  entryMessageVisible: boolean = false;
  private _entryTimer: any = null;

  private showEntryMessage(duration = 3000) {
    if (this._entryTimer) clearTimeout(this._entryTimer);
    this.entryMessageVisible = true;
    // small bolt/spark celebration
    this.triggerBoltStrike(300 + Math.floor(Math.random() * 400));
    this.triggerSparkBurst(600);
    this._entryTimer = setTimeout(() => {
      this.entryMessageVisible = false;
    }, duration);
  }

  // Generate and show a single branching bolt SVG for `duration` ms
  private triggerBoltStrike(duration = 500) {
    if (this._boltTimer) clearTimeout(this._boltTimer);
    if (this._boltHideTimer) clearTimeout(this._boltHideTimer);

    const svg = this.generateBoltSvg(520, 680);
    this.currentBoltSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
    this.boltVisible = true;

    // hide after duration
    this._boltHideTimer = setTimeout(() => {
      this.boltVisible = false;
      // clear svg after fade
      this._boltTimer = setTimeout(() => this.currentBoltSvg = null, 300);
    }, duration);
  }

  // Returns an SVG string containing a main trunk and random branches
  private generateBoltSvg(width = 520, height = 680) {
    // Trunk: generate a series of points from near-top to lower area
    const segments = 7;
    const centerX = width / 2 + (Math.random() - 0.5) * 80;
    const startY = 20 + Math.random() * 40;
    const endY = height - 60;
    const points: {x:number,y:number}[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = startY + t * (endY - startY) + (Math.random() - 0.5) * 20;
      const x = centerX + (Math.random() - 0.5) * (80 * (1 - Math.abs(0.5 - t)));
      points.push({x, y});
    }

    // Build path for trunk
    const trunkPath = points.map((p, idx) => (idx === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)).join(' ');

    // Generate 2-4 random branches originating from trunk points
    const branches: string[] = [];
    const branchCount = 2 + Math.floor(Math.random() * 3);
    for (let b = 0; b < branchCount; b++) {
      const idx = 1 + Math.floor(Math.random() * (points.length - 2));
      const origin = points[idx];
      const length = 40 + Math.random() * 120;
      const angle = (Math.random() * Math.PI * 2) - Math.PI;
      const midX = origin.x + Math.cos(angle) * (length * 0.6);
      const midY = origin.y + Math.sin(angle) * (length * 0.6);
      const endX = origin.x + Math.cos(angle) * length;
      const endY = origin.y + Math.sin(angle) * length;
      const branchPath = `M ${origin.x.toFixed(1)} ${origin.y.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;
      branches.push(branchPath);
    }

    // Create SVG with multiple stroke layers for glow and core
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="boltGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform="translate(0,0)">
          <path class="bolt-trunk glow" d="${trunkPath}" fill="none" stroke="#ffd86a" stroke-width="18" stroke-linejoin="round" stroke-linecap="round" filter="url(#boltGlow)" />
          <path class="bolt-trunk fill" d="${trunkPath}" fill="none" stroke="#ffda00" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" />
          <path class="bolt-trunk core" d="${trunkPath}" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="1000" stroke-dashoffset="1000" />
          ${branches.map(b => `<path class=\"bolt-branch core\" d=\"${b}\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-dasharray=\"500\" stroke-dashoffset=\"500\" />`).join('\n')}
        </g>
      </svg>
    `;
    return svg;
  }

submitCharge() {
  if (this.currentKwh && this.chargeDate) {
    const [year, month, day] = this.chargeDate.split('-');
    const formattedDate = `${month}/${day}/${year}`;
    
    // We only send date and kWh; cost is calculated client-side from totals and rate
    this.chargeService.logCharge(this.currentKwh, formattedDate).subscribe(() => {
      // Show inline flashy confirmation instead of alert popup
      this.showEntryMessage(3000);
      this.currentKwh = null;
    });
  }
}

  fetchTotals() {
    // Now passing BOTH start and end dates to the service
    this.chargeService.getHistory(this.rangeStart, this.rangeEnd).subscribe((data) => {
      this.totals = data;
    });
  }
}
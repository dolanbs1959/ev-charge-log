import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChargeService } from './services/charge.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentKwh: number | null = null;
  chargeRate: number = 0.20;
  totals: any = null;
  chargeDate: string = new Date().toISOString().split('T')[0]; 
  rangeStart: string = '';
  rangeEnd: string = '';
  showTotals: boolean = false;
  constructor(private chargeService: ChargeService) {}

submitCharge() {
  if (this.currentKwh && this.chargeDate) {
    const [year, month, day] = this.chargeDate.split('-');
    const formattedDate = `${month}/${day}/${year}`;
    
    // We send '0' or null for cost because we aren't calculating it yet
    this.chargeService.logCharge(this.currentKwh, 0, formattedDate).subscribe(() => {
      alert('⚡ Charge Logged!');
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
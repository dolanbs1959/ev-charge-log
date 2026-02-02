import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChargeService {
  // PASTE YOUR WEB APP URL FROM STEP 3 BETWEEN THE QUOTES BELOW
  private readonly apiUrl = 'https://script.google.com/macros/s/AKfycbwBSitPVVKpcRIn0Rg13sVhb8XWHAOAwuAuGGugq4yuWpQMrkTjTRavo_n4XwZazB2Q/exec';
//
  constructor(private http: HttpClient) { }

// Update your logCharge and getHistory functions in charge.service.ts
logCharge(kwh: number, cost: number, date: string) {
  const payload = {
    date: date,
    kwh: kwh,
    cost: cost 
  };
  return this.http.post(this.apiUrl, JSON.stringify(payload));
}

getHistory(start: string, end: string) {
  // This sends the start and end dates to Google Sheets to filter the sum
  return this.http.get(`${this.apiUrl}?start=${start}&end=${end}`);
}
}
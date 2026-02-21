import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ChargeService } from './charge.service';

describe('ChargeService', () => {
  let service: ChargeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ChargeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

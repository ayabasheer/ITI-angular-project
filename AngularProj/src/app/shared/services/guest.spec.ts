import { TestBed } from '@angular/core/testing';

import { GuestService } from './guest';

describe('GuestService', () => {
  let service: GuestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { Guest } from './guest';

describe('Guest', () => {
  let service: Guest;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Guest);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

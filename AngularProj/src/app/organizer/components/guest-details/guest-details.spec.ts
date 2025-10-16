import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestDetails } from './guest-details';

describe('GuestDetails', () => {
  let component: GuestDetails;
  let fixture: ComponentFixture<GuestDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerFeedback } from './feedback';

describe('OrganizerFeedback', () => {
  let component: OrganizerFeedback;
  let fixture: ComponentFixture<OrganizerFeedback>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizerFeedback]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizerFeedback);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

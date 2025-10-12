import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEvents } from './manage-events';

describe('ManageEvents', () => {
  let component: ManageEvents;
  let fixture: ComponentFixture<ManageEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageEvents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageEvents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

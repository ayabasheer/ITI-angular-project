import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetails } from './task-details';

describe('TaskDetails', () => {
  let component: TaskDetails;
  let fixture: ComponentFixture<TaskDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

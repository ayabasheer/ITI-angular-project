import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Guests } from './guest';

describe('Guest', () => {
  let component: Guests;
  let fixture: ComponentFixture<Guests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Guests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Guests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

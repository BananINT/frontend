import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnhancedClicker } from './enhanced-clicker';

describe('EnhancedClicker', () => {
  let component: EnhancedClicker;
  let fixture: ComponentFixture<EnhancedClicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnhancedClicker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnhancedClicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

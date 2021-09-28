import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFootComponent } from './dashboard-foot.component';

describe('DashboardFootComponent', () => {
  let component: DashboardFootComponent;
  let fixture: ComponentFixture<DashboardFootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardFootComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardFootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

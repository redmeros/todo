import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mainview } from './mainview';

describe('Mainview', () => {
  let component: Mainview;
  let fixture: ComponentFixture<Mainview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mainview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mainview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StringGroup } from './string-group';

describe('StringGroup', () => {
  let component: StringGroup;
  let fixture: ComponentFixture<StringGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StringGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StringGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

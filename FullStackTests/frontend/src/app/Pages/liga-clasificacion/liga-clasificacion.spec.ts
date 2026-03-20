import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LigaClasificacion } from './liga-clasificacion';

describe('LigaClasificacion', () => {
  let component: LigaClasificacion;
  let fixture: ComponentFixture<LigaClasificacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LigaClasificacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LigaClasificacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

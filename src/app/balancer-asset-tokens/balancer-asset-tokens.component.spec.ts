import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BalancerAssetTokensComponent } from './balancer-asset-tokens.component';

describe('BalancerAssetTokensComponent', () => {
  let component: BalancerAssetTokensComponent;
  let fixture: ComponentFixture<BalancerAssetTokensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BalancerAssetTokensComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BalancerAssetTokensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

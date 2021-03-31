import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BalancerAssetTokensListComponent } from './balancer-asset-tokens-list.component';

describe('BalancerAssetTokensListComponent', () => {
  let component: BalancerAssetTokensListComponent;
  let fixture: ComponentFixture<BalancerAssetTokensListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BalancerAssetTokensListComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BalancerAssetTokensListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

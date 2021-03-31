import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '@app/home/home.component';
import { TvChartContainerComponent } from '@app/tv-chart-container/tv-chart-container.component';
import { BalancerAssetTokensComponent } from '@app/balancer-asset-tokens/balancer-asset-tokens.component';
import { BalancerAssetTokensListComponent } from '@app/balancer-asset-tokens-list/balancer-asset-tokens-list.component';
import { UserGuideComponent } from '@app/user-guide/user-guide.component';

const routes: Routes = [
  { path: '', component: HomeComponent, data: { reuseRoute: true }, },
  { path: 'price-volume-chart', component: TvChartContainerComponent, data: { symbolsType: 'blank', reuseRoute: true }, },
  { path: 'price-volume-chart/pair/:originTokenSymbol/:destinationTokenSymbol', component: TvChartContainerComponent, data: { symbolsType: 'pair', reuseRoute: true }, },
  { path: 'price-volume-chart/pool/:poolId', component: TvChartContainerComponent, data: { symbolsType: 'pool', reuseRoute: true }, },
  { path: 'balancer-asset-tokens', component: BalancerAssetTokensComponent, data: { reuseRoute: true }, },
  { path: 'balancer-asset-tokens/list', component: BalancerAssetTokensListComponent, data: { reuseRoute: true }, },
  { path: 'user-guide', component: UserGuideComponent, data: { reuseRoute: true }, },
  { path: '**', redirectTo: '/home' },  // Wildcard redirect to home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

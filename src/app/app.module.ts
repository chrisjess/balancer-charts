import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from '@app/library/custom-reuse-strategy';

import { ContextMenuModule } from 'ngx-contextmenu';
import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { TvChartContainerComponent } from '@app/tv-chart-container/tv-chart-container.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TypeaheadPopupDirective } from '@app/library/typeahead-popup.directive';
import { OrderModule } from 'ngx-order-pipe';

import { DataService } from '@app/library/data.service';
import { MessageService } from '@app/library/message.service';

import { BalancerAssetTokensComponent } from '@app/balancer-asset-tokens/balancer-asset-tokens.component';
import { BalancerAssetTokensListComponent } from '@app/balancer-asset-tokens-list/balancer-asset-tokens-list.component';

import { HomeComponent } from '@app/home/home.component';
import { UserGuideComponent } from '@app/user-guide/user-guide.component';

export function appInit(dataService: DataService) {
  return () => dataService.initialPopulate();
}

@NgModule({
  declarations: [
    AppComponent,
    TvChartContainerComponent,
    BalancerAssetTokensComponent,
    BalancerAssetTokensListComponent,
    TypeaheadPopupDirective,
    HomeComponent,
    UserGuideComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    FontAwesomeModule,
    NgxBootstrapSliderModule,
    ContextMenuModule.forRoot({
      useBootstrap4: true,
    }),
    OrderModule
  ],
  providers: [
    [DataService,
      {
        provide: APP_INITIALIZER,
        useFactory: appInit,
        multi: true,
        deps: [DataService]
      }],
    [{ provide: RouteReuseStrategy, useClass: CustomReuseStrategy }],
    MessageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

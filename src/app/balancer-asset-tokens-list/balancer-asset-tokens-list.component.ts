import { Component, OnInit, ViewChild } from '@angular/core';

import { Observable } from 'rxjs';

import { ContextMenuComponent } from 'ngx-contextmenu';

import { DataService } from '@app/library/data.service';
import { MessageService } from '@app/library/message.service';

import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

import { Token, Pool } from '@app/library/models';

@Component({
  selector: 'app-balancer-asset-tokens-list',
  templateUrl: './balancer-asset-tokens-list.component.html',
  styleUrls: ['./balancer-asset-tokens-list.component.css']
})
export class BalancerAssetTokensListComponent implements OnInit {

  faSortUp = faSortUp;
  faSortDown = faSortDown;

  @ViewChild(ContextMenuComponent)
  public originDestinationMenu: ContextMenuComponent;

  public originToken: Token;
  public destinationToken: Token;

  public tokens: Token[] = [];
  public pools: Pool[] = [];
  public coinGeckoCoins: Token[] = [];

  public balancerAssetTokensList: Observable<Token[]>;
  public balancerPoolList: Observable<Pool[]>;

  public sortFields = [['Symbol', 'symbol'], ['Name', 'name']]; // Caption, Actual Field
  public sortField: string = this.sortFields[0][1];
  public sortUp: boolean = true;

  constructor(private dataService: DataService, private messageService: MessageService) {

  }

  ngOnInit(): void {
    this.balancerAssetTokensList = this.dataService.balancerAssetTokens$;
    this.balancerPoolList = this.dataService.balancerPools$;
  }

  public setToken(s: string[]) {
    this.messageService.updateMessage(s);
  }

  public sortClicked(item: string) {
    if (this.sortField == item) {
      this.sortUp = !this.sortUp;
    } else {
      this.sortField = item;
      this.sortUp = true;
    }
  }

}

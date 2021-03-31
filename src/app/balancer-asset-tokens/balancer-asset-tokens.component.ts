import { Component, OnInit } from '@angular/core';

import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, filter } from 'rxjs/operators';

import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap/typeahead/typeahead';
import { ContextMenuComponent } from 'ngx-contextmenu';

import { faChartLine, faExchangeAlt, faExternalLinkAlt, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

import { Token, Pool } from '@app/library/models';

import { DataService } from '@app/library/data.service';
import { MessageService } from '@app/library/message.service';

type TokenPoolFilter = {
  originTokenAddress: string;
  destinationTokenAddress: string;
  originPercentRange: number[];
  destinationPercentRange: number[];
};

@Component({
  selector: 'app-balancer-asset-tokens',
  templateUrl: './balancer-asset-tokens.component.html',
  styleUrls: ['./balancer-asset-tokens.component.css']
})
export class BalancerAssetTokensComponent implements OnInit {

  faExternalLinkAlt = faExternalLinkAlt;
  faExchangeAlt = faExchangeAlt;
  faChartLine = faChartLine;
  faSortUp = faSortUp;
  faSortDown = faSortDown;

  public originDestinationMenu: ContextMenuComponent;

  public originToken: Token;
  public destinationToken: Token;

  // Populated once clicked
  public selectedOriginToken: Token;
  public selectedDestinationToken: Token;

  public originPercentRange: number[] = [0, 100];
  public destinationPercentRange: number[] = [0, 100];

  public originMinPercentEnabled: boolean = true;
  public destinationMinPercentEnabled: boolean = true;

  public balancerAssetTokensList: Observable<Token[]>;
  public balancerPoolList: Observable<Pool[]>;

  public balancerPools$: Observable<Pool[]>;
  public balancerPoolsFiltered$: Observable<Pool[]>;

  private tokenPoolFilter$: BehaviorSubject<TokenPoolFilter>;

  public sortFields = [['Fee', 'swapFee'], ['# Tokens', 'tokenCount'], ['Address', 'address']]; // Caption, Actual Field
  public sortField: string = this.sortFields[0][1];
  public sortUp: boolean = false;

  constructor(private dataService: DataService, private messageService: MessageService) {
  }

  ngOnInit(): void {

    let tokenPoolFilter: TokenPoolFilter = {
      originTokenAddress: '',
      destinationTokenAddress: '',
      originPercentRange: this.originPercentRange,
      destinationPercentRange: this.destinationPercentRange,
    }
    this.tokenPoolFilter$ = new BehaviorSubject(tokenPoolFilter)

    this.balancerPools$ = this.dataService.balancerPools$;

    // Create a new stream based on the two input
    // streams we defined
    this.balancerPoolsFiltered$ = this.createFilterBalancerPools(
      this.tokenPoolFilter$,
      this.balancerPools$
    );

    // On first load, check incase already set.
    if (this.messageService.originToken) {
      this.selectedOriginToken = this.dataService.getBalancerVettedToken(this.messageService.originToken);
    }

    if (this.messageService.destinationToken) {
      this.selectedDestinationToken = this.dataService.getBalancerVettedToken(this.messageService.destinationToken);
    }

    if (this.messageService.originToken || this.messageService.destinationToken) {
      this.filterChanged();
    }

    // Get messages from the main list component to populate Origin & Destination
    this.messageService.getMessage().subscribe(message => {

      if (message[0] == 'origin') {
        this.selectedOriginToken = this.dataService.getBalancerVettedToken(this.messageService.originToken);
      } else if (message[0] == 'destination') {
        this.selectedDestinationToken = this.dataService.getBalancerVettedToken(this.messageService.destinationToken);
      }

      this.filterChanged();

    });

  }

  public sortClicked(item: string) {
    if (this.sortField == item) {
      this.sortUp = !this.sortUp;
    } else {
      this.sortField = item;
      this.sortUp = true;
    }
  }

  public setToken(s: string[]) {
    this.messageService.updateMessage(s);
  }

  // When values relating to the filter are changed (token lookup/content %), refilter
  // Otherwise this is called far too muhch.
  filterChanged() {
    let tokenPoolFilter: TokenPoolFilter = {
      originTokenAddress: this.selectedOriginToken?.address.toLowerCase(),
      destinationTokenAddress: this.selectedDestinationToken?.address.toLowerCase(),
      originPercentRange: this.originPercentRange,
      destinationPercentRange: this.destinationPercentRange,
    }
    this.tokenPoolFilter$.next(tokenPoolFilter);
  };

  // We combine both of the input streams using the combineLatest
  // operator. Every time one of the two streams we are combining
  // here changes value, the project function is re-executed and
  // the result stream will get a new value. In our case this is
  // a new array with all the filtered characters.
  public createFilterBalancerPools(
    filter$: Observable<TokenPoolFilter>,
    balancerPools$: Observable<Pool[]>) {

    return combineLatest([balancerPools$, filter$]).pipe(
      map(([balancerPools, filter]) => {

        if (!filter.originTokenAddress && !filter.destinationTokenAddress) {
          return;
        }

        return balancerPools.filter(balancerPool => {

          if (!balancerPool.tokens) {
            return;
          }

          // Find where the pool tokens contain origin/destination
          let origin = balancerPool.tokens.some(token =>
            token.address.toLowerCase() === filter.originTokenAddress
            &&
            (token.poolWeight >= filter.originPercentRange[0])
            &&
            (token.poolWeight <= filter.originPercentRange[1])
          );
          let destination = balancerPool.tokens.some(token =>
            token.address.toLowerCase() === filter.destinationTokenAddress
            &&
            (token.poolWeight >= filter.destinationPercentRange[0])
            &&
            (token.poolWeight <= filter.destinationPercentRange[1])
          );

          return ((!filter.originTokenAddress || origin) && (!filter.destinationTokenAddress || destination));
        })
      })
    )

  }

  public sliderChanged() {
    this.filterChanged()
  }

  get originDestinationSymbolPair(): string {

    if (this.selectedOriginToken && this.selectedDestinationToken) {
      return `${this.selectedOriginToken.symbol}/${this.selectedDestinationToken.symbol}`;
    }

    return '';

  }

  public swapOriginDestinationTokens() {
    const tmpdestinationToken: Token = this.selectedDestinationToken;
    this.destinationToken = this.selectedOriginToken;
    this.selectedDestinationToken = this.selectedOriginToken;
    this.originToken = tmpdestinationToken;
    this.selectedOriginToken = tmpdestinationToken;
    this.filterChanged();
  }


  selectedItem(originDestination: string, item: NgbTypeaheadSelectItemEvent) {
    if (originDestination == 'origin') {
      this.selectedOriginToken = <Token>item.item;
    } else {
      this.selectedDestinationToken = <Token>item.item;
    }
    this.filterChanged()
  }

  public formatter(token: Token) {
    //formatter = (token: Token) => token.symbol + token.name;
    return '';
  }

  search = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    //filter(term => term.length >= 1),
    map(term => this.dataService.tokensDataStore.filter(token => new RegExp(term, 'mi').test(token.symbol + token.name + token.address)).slice(0, 10))
  );


  public getTokenSymbol(address: string): string {

    let symbol = this.dataService.getBalancerVettedToken(address)?.symbol;

    if (!symbol) {
      symbol = "???";
    }

    return symbol;
  }

  // Format text
  get symbolsLabel(): string {

    let description: string[] = [];

    if (this.selectedOriginToken?.symbol) {
      description.push(this.selectedOriginToken?.symbol);
    }

    if (this.selectedDestinationToken?.symbol) {
      description.push(this.selectedDestinationToken?.symbol);
    }

    if (description.length == 1) {
      return `${description[0]}`;
    } else if (description.length == 2) {
      return `${description[0]} & ${description[1]}`;
    } else {
      return '';
    }
  }



}

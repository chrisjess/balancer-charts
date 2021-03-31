import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';

import { DataService } from '@app/library/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public title = 'balancer-charts';

  public recentTokenPairs$: Observable<any>;
  public recentTokenPairs: string[][];

  // Hardcoded currently, can lookup based on real world popularity.
  public popularTokenPairs: string[][] = [
    ['WBTC', 'USDC'],
    ['WBTC', 'WETH'],
    ['BAL', 'WETH'],
    ['LINK', 'WETH'],
  ]

  constructor(private dataService: DataService, private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.recentTokenPairs$ = this.dataService.recentTokenPairs$;
  }

}

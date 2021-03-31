import { Component, OnInit } from '@angular/core';

import { faUserGraduate, faWallet, faSwimmingPool, faBalanceScale, faCoffee, faChartLine, faCoins, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  faCoffee = faCoffee;
  faChartLine = faChartLine;
  faCoins = faCoins;
  faExternalLinkAlt = faExternalLinkAlt;
  faBalanceScale = faBalanceScale;
  faSwimmingPool = faSwimmingPool;
  faWallet = faWallet;
  faUserGraduate = faUserGraduate;

  constructor() { }

  ngOnInit(): void {
  }

}

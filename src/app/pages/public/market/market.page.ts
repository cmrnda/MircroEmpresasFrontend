import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PublicMarketFacade } from './market.facade';

@Component({
  standalone: true,
  selector: 'app-public-market-page',
  imports: [CommonModule, RouterModule],
  providers: [PublicMarketFacade],
  templateUrl: './market.page.html'
})
export class PublicMarketPage {
  public constructor(public readonly vm: PublicMarketFacade) {}

  public ngOnInit(): void {
    this.vm.loadInit();
  }

  public img(u: string | null): string | null {
    return this.vm.normalizeImageUrl(u);
  }

  public fmt(n: number): string {
    const x = Number(n || 0);
    return String(x.toFixed(2));
  }
}

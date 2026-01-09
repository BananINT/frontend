import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { NgxGlobeComponent } from '@omnedia/ngx-globe';
import { NgxAuroraComponent } from '@omnedia/ngx-aurora';
import { NgxShinyTextComponent } from '@omnedia/ngx-shiny-text';
import { NgxLavaLampComponent } from '@omnedia/ngx-lava-lamp';
import { NgxNumberTickerComponent } from '@omnedia/ngx-number-ticker';
import { NgxOrbComponent } from '@omnedia/ngx-orb';
import { NgxGradientTextComponent } from '@omnedia/ngx-gradient-text';

import { Header } from '@common/header/header';
import { Footer } from "@common/footer/footer";

interface totBanRes {
  total_bananas: number;
}

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    MatIconModule,
    MatListModule,
    NgxGlobeComponent,
    NgxAuroraComponent,
    NgxShinyTextComponent,
    NgxLavaLampComponent,
    NgxNumberTickerComponent,
    NgxOrbComponent,
    NgxGradientTextComponent,
    Header,
    Footer
],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private breakpointObserver = inject(BreakpointObserver);
  private http = inject(HttpClient);

  bananas = signal<number>(0);
  isMobile = signal<boolean>(false);

  constructor() {
    this.breakpointObserver
      .observe(['(orientation: portrait)'])
      .subscribe((state: BreakpointState) => {
        this.isMobile.set(state.matches);
      });

    this.http.get<totBanRes>('/api/game/total-bananas').subscribe(dict => {
      this.bananas.set(dict.total_bananas);
    });
  }
}
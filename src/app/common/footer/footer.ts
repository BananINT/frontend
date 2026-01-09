import { Component } from '@angular/core';
import { NgxRetroGridComponent } from '@omnedia/ngx-retro-grid';
import { NgxGradientTextComponent } from '@omnedia/ngx-gradient-text';
import { NgxNeonUnderlineComponent } from '@omnedia/ngx-neon-underline';

@Component({
  selector: 'app-footer',
  imports: [NgxRetroGridComponent, NgxGradientTextComponent, NgxNeonUnderlineComponent],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {

}

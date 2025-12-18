import { Component } from '@angular/core';
import { NgxRetroGridComponent } from '@omnedia/ngx-retro-grid';
import { NgxGradientTextComponent } from '@omnedia/ngx-gradient-text';

@Component({
  selector: 'app-footer',
  imports: [NgxRetroGridComponent, NgxGradientTextComponent],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {

}

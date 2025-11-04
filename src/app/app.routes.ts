import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Clicker } from './pages/clicker/clicker';

export const routes: Routes = [
  { path: '', component: Home },
  // { path: 'clicker', component: Clicker },
  { path: '**', redirectTo: '' }
];
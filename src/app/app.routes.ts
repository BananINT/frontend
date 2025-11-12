import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Clicker } from './pages/clicker/clicker';
import { EnhancedClicker } from './pages/enhanced-clicker/enhanced-clicker';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'clicker', component: Clicker },
  { path: 'enhanced-clicker', component: EnhancedClicker },
  { path: '**', redirectTo: '' }
];
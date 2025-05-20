import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./player-count/player-count.component').then((m) => m.PlayerCountComponent),
  },
  {
    path: 'game',
    loadComponent: () => import('./playing-field/playing-field.component').then((m) => m.PlayingFieldComponent),
  },
  {
    path: '**', pathMatch: 'full',
    redirectTo: ''
  },
];

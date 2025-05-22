import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./player-count/start-page.component').then((m) => m.StartPageComponent),
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

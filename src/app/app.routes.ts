import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'products',
    loadChildren: () => import('./features/products').then((m) => m.PRODUCTS_ROUTES),
  },
];

import { Routes } from '@angular/router';
import { ProductsPageComponent } from 'features/products/pages/products-page/products-page.component';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: ProductsPageComponent,
  },
];

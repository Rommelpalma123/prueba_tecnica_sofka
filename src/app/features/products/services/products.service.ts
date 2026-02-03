import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product } from '../models/product.model';
import { ProductsResponse } from '../models/products-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly API_URL = 'http://localhost:3002/bp/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(this.API_URL);
  }

  createProduct(product: Product): Observable<{ message: string; data: Product }> {
    return this.http.post<{ message: string; data: Product }>(this.API_URL, product);
  }

  updateProduct(id: string, product: Product): Observable<{ message: string; data: Product }> {
    return this.http.put<{ message: string; data: Product }>(`${this.API_URL}/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`);
  }
}

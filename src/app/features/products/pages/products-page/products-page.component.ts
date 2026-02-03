import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';

// Components
import { ProductsTableComponent } from 'features/products/components/product-list/products-table.component';
import { ProductModalComponent } from 'features/products/components/product-form-modal/product-form-modal.component';
import { ConfirmDeleteModalComponent } from 'features/products/components/confirm-delete-modal/confirm-delete-modal.component';

// Services
import { ProductsService } from 'features/products/services/products.service';

// Models
import { Product } from 'features/products/models/product.model';

@Component({
  standalone: true,
  selector: 'app-products-page',
  imports: [
    CommonModule,
    ProductModalComponent,
    ProductsTableComponent,
    ConfirmDeleteModalComponent,
  ],
  templateUrl: './products-page.component.html',
})
export class ProductsPageComponent implements OnInit {
  products = signal<Product[]>([]);

  productToDelete = signal<Product | null>(null);

  showModal = signal(false);
  productToEdit = signal<Product | null>(null);

  constructor(private store: ProductsService) {}

  ngOnInit(): void {
    // ngOnInit
    this.store.getProducts().subscribe((res) =>
      this.products.set(
        res.data.map((p) => ({
          ...p,
          date_release: new Date(p.date_release),
          date_revision: new Date(p.date_revision),
        })),
      ),
    );
  }

  onEdit(product: Product): void {
    console.log('edit', product);
  }

  onRemove(product: Product): void {
    this.productToDelete.set(product);
  }

  confirmDelete() {
    const product = this.productToDelete();

    if (!product) return;

    this.store.deleteProduct(String(product.id)).subscribe({
      next: () => {
        this.products.update((list) => list.filter((p) => p.id !== product.id));

        this.productToDelete.set(null);
      },
      error: (err) => {
        console.error('error deleting product', err);
      },
    });
  }

  cancelDelete() {
    this.productToDelete.set(null);
  }

  openCreateModal() {
    this.productToEdit.set(null);
    this.showModal.set(true);
  }

  openEditModal(product: Product) {
    this.productToEdit.set(product);
    this.showModal.set(true);
  }

  saveProduct(product: Product) {
    const productToSend: Product = {
      ...product,
      date_release: new Date(product.date_release),
      date_revision: new Date(product.date_revision),
    };

    if (this.productToEdit()) {
      this.store.updateProduct(String(product.id), productToSend).subscribe({
        next: (res) => {
          const updatedProduct = {
            ...res.data,
            date_release: new Date(res.data.date_release),
            date_revision: new Date(res.data.date_revision),
          };

          this.products.update((list) =>
            list.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
          );
          this.showModal.set(false);
        },
        error: (err) => console.error('Error updating product', err),
      });
    } else {
      this.store.createProduct(productToSend).subscribe({
        next: (res) => {
          const newProduct = {
            ...res.data,
            date_release: new Date(res.data.date_release),
            date_revision: new Date(res.data.date_revision),
          };

          this.products.update((list) => [...list, newProduct]);
          this.showModal.set(false);
        },
        error: (err) => console.error('Error creating product', err),
      });
    }
  }
}

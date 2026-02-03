import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, signal, computed, Signal } from '@angular/core';
import { Product } from 'features/products/models/product.model';

@Component({
  standalone: true,
  selector: 'app-products-table',
  imports: [CommonModule],
  templateUrl: './products-table.component.html',
})
export class ProductsTableComponent {
  @Input({ required: true }) products!: Signal<Product[]>;

  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Product>();
  @Output() remove = new EventEmitter<Product>();

  search = signal('');
  page = signal(1);
  pageSize = signal(5);
  rowsOptions = [5, 10, 20, 50];

  imageError: Record<string, boolean> = {};

  openMenuId = signal<string | null>(null);

  filteredProducts = computed(() => {
    const term = this.search().toLowerCase();
    return this.products().filter((p) => p.name.toLowerCase().includes(term));
  });

  totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.pageSize()));

  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  paginatedProducts = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredProducts().slice(start, start + this.pageSize());
  });

  changePageSize(value: number) {
    this.pageSize.set(+value);
    this.page.set(1);
  }

  changePage(p: number) {
    this.page.set(p);
  }

  onSearch(value: string) {
    this.search.set(value);
    this.page.set(1);
  }

  toggleMenu(id: string | number) {
    const key = String(id);
    this.openMenuId.set(this.openMenuId() === key ? null : key);
  }

  onEdit(product: Product) {
    this.edit.emit(product);
    this.openMenuId.set(null);
  }

  onRemove(product: Product) {
    this.remove.emit(product);
    this.openMenuId.set(null);
  }

  onAdd() {
    this.add.emit();
  }

  onImageError(id: string) {
    this.imageError[id] = true;
  }
}

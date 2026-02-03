import moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, signal } from '@angular/core';

// Services
import { ProductsService } from 'features/products/services/products.service';

// Models
import { Product } from 'features/products/models/product.model';

@Component({
  standalone: true,
  selector: 'app-product-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form-modal.component.html',
})
export class ProductModalComponent implements OnChanges {
  @Input() product: Product | null = null;
  @Output() onSave = new EventEmitter<Product>();
  @Output() onCancel = new EventEmitter<void>();

  form: Product = {
    id: '',
    name: '',
    description: '',
    logo: '',
    date_release: new Date(),
    date_revision: new Date(),
  };

  errors = signal({
    id: '',
    name: '',
    description: '',
    logo: '',
    date_release: '',
    date_revision: '',
  });

  inputDateRelease: string = '';
  inputDateRevision: string = '';

  constructor(private store: ProductsService) {}

  formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  parseDateFromInput(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  ngOnChanges() {
    if (this.product) {
      this.form = { ...this.product };
      this.inputDateRelease = this.formatDateForInput(this.product.date_release);
      this.inputDateRevision = this.formatDateForInput(this.product.date_revision);
    } else {
      const today = new Date();
      this.form = {
        id: '',
        name: '',
        description: '',
        logo: '',
        date_release: today,
        date_revision: today,
      };
      this.inputDateRelease = this.formatDateForInput(today);
      this.inputDateRevision = this.formatDateForInput(today);
    }

    this.resetErrors();
  }

  resetErrors() {
    this.errors.set({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: '',
    });
  }

  async validate(): Promise<boolean> {
    let valid = true;
    const errs = { ...this.errors() };

    if (!this.form.id.trim() || this.form.id.length < 3 || this.form.id.length > 10) {
      errs.id = 'Id inválido (3-10 caracteres)';
      valid = false;
    } else {
      try {
        const product = await firstValueFrom(this.store.getProduct(this.form.id));
        if (product && product.id !== (this.product?.id || '')) {
          errs.id = 'Id ya existe';
          valid = false;
        } else {
          errs.id = '';
        }
      } catch (error: any) {
        if (error.status === 404) {
          errs.id = '';
        } else {
          console.error('Error validando ID', error);
          valid = false;
          errs.id = 'Error validando ID';
        }
      }
    }

    if (!this.form.name.trim() || this.form.name.length < 5 || this.form.name.length > 100) {
      errs.name = 'Nombre inválido (5-100 caracteres)';
      valid = false;
    } else {
      errs.name = '';
    }

    if (
      !this.form.description.trim() ||
      this.form.description.length < 10 ||
      this.form.description.length > 200
    ) {
      errs.description = 'Descripción inválida (10-200 caracteres)';
      valid = false;
    } else {
      errs.description = '';
    }

    // Logo
    if (!this.form.logo.trim()) {
      errs.logo = 'Logo requerido';
      valid = false;
    } else {
      errs.logo = '';
    }

    const release = moment(this.inputDateRelease, 'YYYY-MM-DD', true);
    const revision = moment(this.inputDateRevision, 'YYYY-MM-DD', true);
    const today = moment().startOf('day');

    if (!release.isValid()) {
      errs.date_release = 'Fecha de liberación inválida';
      valid = false;
    } else if (release.isBefore(today, 'day')) {
      errs.date_release = 'Fecha de liberación no puede ser anterior a hoy';
      valid = false;
    } else {
      errs.date_release = '';
    }

    if (!revision.isValid()) {
      errs.date_revision = 'Fecha de revisión inválida';
      valid = false;
    } else {
      const minRevision = release.clone().add(1, 'year');
      if (revision.isBefore(minRevision, 'day')) {
        errs.date_revision = 'Fecha de revisión debe ser al menos 1 año después de liberación';
        valid = false;
      } else {
        errs.date_revision = '';
      }
    }

    this.errors.set(errs);
    return valid;
  }

  canConfirm() {
    return (
      this.form.id.trim() &&
      this.form.name.trim() &&
      this.form.description.trim() &&
      this.form.logo.trim() &&
      this.inputDateRelease &&
      this.inputDateRevision
    );
  }

  async confirm() {
    const isValid = await this.validate();
    if (!isValid) return;
    if (!this.canConfirm()) return;

    const productToEmit: Product = {
      ...this.form,
      date_release: this.parseDateFromInput(this.inputDateRelease),
      date_revision: this.parseDateFromInput(this.inputDateRevision),
    };

    this.onSave.emit(productToEmit);
  }
}

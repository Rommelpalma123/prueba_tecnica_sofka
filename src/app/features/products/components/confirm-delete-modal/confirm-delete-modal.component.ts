import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-confirm-delete-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-delete-modal.component.html',
})
export class ConfirmDeleteModalComponent {
  @Input({ required: true }) title!: string;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  typedValue = '';

  onConfirm() {
    if (this.typedValue.trim() === this.title) {
      this.confirm.emit();
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}

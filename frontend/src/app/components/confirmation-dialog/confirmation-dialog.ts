import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirmation-overlay" (click)="onCancel()">
      <div
        class="confirmation-dialog"
        [class]="getDialogClass()"
        (click)="$event.stopPropagation()"
      >
        <div class="dialog-header">
          <div class="dialog-icon">
            @if (config.type === 'danger') {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="32px"
                viewBox="0 -960 960 960"
                width="32px"
                fill="currentColor"
              >
                <path
                  d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z"
                />
              </svg>
            }
            @if (config.type === 'warning') {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="32px"
                viewBox="0 -960 960 960"
                width="32px"
                fill="currentColor"
              >
                <path
                  d="M479.79-288q15.21 0 25.71-10.29t10.5-25.5q0-15.21-10.29-25.71t-25.5-10.5q-15.21 0-25.71 10.29t-10.5 25.5q0 15.21 10.29 25.71t25.5 10.5ZM444-432h72v-240h-72v240Zm36.28 336Q401-96 331-126t-122.5-82.5Q156-261 126-330.96t-30-149.5Q96-560 126-629.5q30-69.5 82.5-122T330.96-834q69.96-30 149.5-30t149.04 30q69.5 30 122 82.5T834-629.28q30 69.73 30 149Q864-401 834-331t-82.5 122.5Q699-156 629.28-126q-69.73 30-149 30Zm-.28-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"
                />
              </svg>
            }
            @if (config.type === 'info') {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="32px"
                viewBox="0 -960 960 960"
                width="32px"
                fill="currentColor"
              >
                <path
                  d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"
                />
              </svg>
            }
          </div>
          <h2>{{ config.title }}</h2>
        </div>

        <div class="dialog-content">
          <p>{{ config.message }}</p>
        </div>

        <div class="dialog-actions">
          <button class="btn btn-secondary" (click)="onCancel()">
            {{ config.cancelText || 'Abbrechen' }}
          </button>
          <button
            class="btn"
            [class]="getConfirmButtonClass()"
            (click)="onConfirm()"
          >
            {{ config.confirmText || 'Bestätigen' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .confirmation-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.2s ease-out;
      }

      .confirmation-dialog {
        background: var(--surface);
        border-radius: var(--radius-lg);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        max-width: 400px;
        width: 90%;
        overflow: hidden;
        animation: slideIn 0.3s ease-out;
        border: 1px solid var(--border);
      }

      .dialog-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem 1.5rem 1rem;
      }

      .dialog-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dialog-danger .dialog-icon {
        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        color: #dc2626;
      }

      .dialog-warning .dialog-icon {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        color: #d97706;
      }

      .dialog-info .dialog-icon {
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        color: #2563eb;
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .dialog-content {
        padding: 0 1.5rem 1.5rem;
      }

      .dialog-content p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.6;
      }

      .dialog-actions {
        display: flex;
        gap: 0.75rem;
        padding: 1rem 1.5rem 1.5rem;
        justify-content: flex-end;
        border-top: 1px solid var(--border);
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 80px;
      }

      .btn-secondary {
        background: var(--surface);
        color: var(--text-primary);
        border: 1px solid var(--border);
      }

      .btn-secondary:hover {
        background: var(--surface-hover);
        border-color: var(--secondary-color);
      }

      .btn-danger {
        background: linear-gradient(
          135deg,
          var(--danger-color) 0%,
          #f87171 100%
        );
        color: white;
      }

      .btn-danger:hover {
        background: linear-gradient(
          135deg,
          var(--danger-hover) 0%,
          #ef4444 100%
        );
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
      }

      .btn-warning {
        background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
        color: white;
      }

      .btn-warning:hover {
        background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
      }

      .btn-info {
        background: linear-gradient(
          135deg,
          var(--primary-color) 0%,
          #6366f1 100%
        );
        color: white;
      }

      .btn-info:hover {
        background: linear-gradient(
          135deg,
          var(--primary-hover) 0%,
          #5b21b6 100%
        );
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      @media (max-width: 480px) {
        .confirmation-dialog {
          margin: 1rem;
          width: calc(100% - 2rem);
        }

        .dialog-header {
          padding: 1.25rem 1.25rem 0.75rem;
          flex-direction: column;
          text-align: center;
          gap: 0.75rem;
        }

        .dialog-content {
          padding: 0 1.25rem 1.25rem;
          text-align: center;
        }

        .dialog-actions {
          flex-direction: column-reverse;
          padding: 1rem 1.25rem 1.25rem;
        }

        .btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class ConfirmationDialogComponent {
  @Input() config!: ConfirmationConfig;
  @Output() confirmed = new EventEmitter<boolean>();

  getDialogClass(): string {
    return `dialog-${this.config.type || 'info'}`;
  }

  getConfirmButtonClass(): string {
    return `btn-${this.config.type || 'info'}`;
  }

  onConfirm(): void {
    this.confirmed.emit(true);
  }

  onCancel(): void {
    this.confirmed.emit(false);
  }
}

import { Injectable, ComponentRef, ViewContainerRef } from '@angular/core';
import {
  ConfirmationDialogComponent,
  ConfirmationConfig,
} from '../confirmation-dialog/confirmation-dialog';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private viewContainerRef?: ViewContainerRef;

  setViewContainerRef(viewContainerRef: ViewContainerRef): void {
    this.viewContainerRef = viewContainerRef;
  }

  confirm(config: ConfirmationConfig): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.viewContainerRef) {
        console.error(
          'ViewContainerRef not set. Call setViewContainerRef first.',
        );
        resolve(false);
        return;
      }

      const componentRef: ComponentRef<ConfirmationDialogComponent> =
        this.viewContainerRef.createComponent(ConfirmationDialogComponent);

      componentRef.instance.config = config;

      componentRef.instance.confirmed.subscribe((result: boolean) => {
        componentRef.destroy();
        resolve(result);
      });
    });
  }
}

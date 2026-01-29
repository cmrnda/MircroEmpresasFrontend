import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { TenantPosFacade } from './tenant-pos.facade';
import { AuthStateService } from '../../../core/auth/auth-state.service';
import {PosHeaderFiltersComponent} from './components/pos-header-filters/pos-header-filters.component';
import {PosCatalogComponent} from './components/pos-catalog/pos-catalog.component';
import {PosCheckoutComponent} from './components/pos-checkout/pos-checkout.component';


@Component({
  standalone: true,
  selector: 'app-tenant-pos-page',
  imports: [CommonModule, PosHeaderFiltersComponent, PosCatalogComponent, PosCheckoutComponent],
  templateUrl: './pos.page.html'
})
export class TenantPosPage {
  private readonly _authState = inject(AuthStateService);
  public readonly vm = inject(TenantPosFacade);

  public readonly empresaId = this._authState.empresaId;

  private _loadedEmpresaId: number | null = null;

  public constructor() {
    effect(() => {
      const empresa_id = Number(this.empresaId() ?? 0);
      if (!Number.isFinite(empresa_id) || empresa_id <= 0) return;
      if (this._loadedEmpresaId === empresa_id) return;

      this._loadedEmpresaId = empresa_id;
      this.vm.setEmpresaId(empresa_id);
      this.vm.loadInit();
    });
  }

  public fmt(n: number): string {
    const x = Number(n || 0);
    return String(x.toFixed(2));
  }

  public downloadReceipt(): void {
    const ventaId = Number(this.vm.successVentaId() ?? 0);
    if (!Number.isFinite(ventaId) || ventaId <= 0) return;

    this.vm.downloadReceipt(ventaId).subscribe({
      next: (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo_venta_${ventaId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  public shareReceipt(): void {
    const ventaId = Number(this.vm.successVentaId() ?? 0);
    if (!Number.isFinite(ventaId) || ventaId <= 0) return;

    this.vm.downloadReceipt(ventaId).subscribe({
      next: async (blob) => {
        if (!blob) return;

        const file = new File([blob], `recibo_venta_${ventaId}.pdf`, { type: 'application/pdf' });
        const nav: any = navigator as any;

        const canShareFiles = !!nav?.share && !!nav?.canShare && nav.canShare({ files: [file] });

        if (canShareFiles) {
          await nav.share({
            title: `Recibo #${ventaId}`,
            text: `Recibo de venta #${ventaId}`,
            files: [file]
          });
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo_venta_${ventaId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }
}

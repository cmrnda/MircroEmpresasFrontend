import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { TenantPosFacade } from './tenant-pos.facade';
import { AuthStateService } from '../../../core/auth/auth-state.service';

@Component({
  standalone: true,
  selector: 'app-tenant-pos-page',
  imports: [CommonModule],
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
    },
    error: () => {
      // opcional: muestra un error bonito si quieres
      // console.error('receipt_failed');
      }
    });
  }
}

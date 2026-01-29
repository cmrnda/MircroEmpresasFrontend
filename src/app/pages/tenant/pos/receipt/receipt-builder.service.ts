import { Injectable } from '@angular/core';
import { TenantPosFacade } from '../tenant-pos.facade';


type BuildOpts = {
  empresaId: number;
  ventaId: number;
};

class ReceiptData {
}

@Injectable({ providedIn: 'root' })
export class ReceiptBuilderService {
  buildFromPos(vm: TenantPosFacade, opts: BuildOpts): ReceiptData {
    const now = new Date();
    const fechaHora = this.fmtDateTime(now);

    const clienteNombre = String(vm.clientForm().nombre_razon || '').trim() || 'S/N';
    const clienteNit = String(vm.clientForm().nit_ci || '').trim() || '0';

    const items = (vm.ticketItems() || []).map((x) => {
      const qty = Number(x.qty || 0);
      const unit = Number(x.precio || 0);
      const amount = Number(qty * unit);
      return {
        qty,
        concept: String(x.descripcion || '').trim() || `ID ${x.producto_id}`,
        unitPrice: unit,
        amount
      };
    });

    const total = Number(vm.total() || 0);

    const pagado = String(vm.payment().metodo || '').toUpperCase() === 'EFECTIVO' ? Number(vm.payment().monto || 0) : Number(vm.payment().monto || 0);
    const devuelto = String(vm.payment().metodo || '').toUpperCase() === 'EFECTIVO' ? Number(vm.cambio() || 0) : 0;

    const qrText = this.buildQrText({
      empresaId: opts.empresaId,
      ventaId: opts.ventaId,
      total,
      fechaHora,
      clienteNit,
      clienteNombre
    });

    const data: ReceiptData = {
      empresa: {
        nombre: 'MI EMPRESA',
        nit: String(opts.empresaId || ''),
        direccion: '',
        telefono: '',
        ciudad: ''
      },
      factura: {
        titulo: 'FACTURA ORIGINAL',
        nroFactura: String(opts.ventaId),
        nroAutorizacion: '',
        fechaHora,
        sucursal: '',
        actividad: '',
        codigoControl: '',
        fechaLimiteEmision: ''
      },
      cliente: {
        nombreRazon: clienteNombre,
        nitCi: clienteNit
      },
      items,
      totals: {
        total,
        literal: `Son: Bs ${total.toFixed(2)}`,
        montoPagado: pagado,
        montoDevuelto: devuelto
      },
      qrText
    };

    return data;
  }

  private fmtDateTime(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${day}/${m}/${y} ${hh}:${mm}:${ss}`;
  }

  private buildQrText(x: any): string {
    const payload = {
      empresa_id: Number(x.empresaId || 0),
      venta_id: Number(x.ventaId || 0),
      fecha_hora: String(x.fechaHora || ''),
      cliente_nit_ci: String(x.clienteNit || ''),
      cliente_nombre: String(x.clienteNombre || ''),
      total: Number(x.total || 0).toFixed(2)
    };
    return JSON.stringify(payload);
  }
}

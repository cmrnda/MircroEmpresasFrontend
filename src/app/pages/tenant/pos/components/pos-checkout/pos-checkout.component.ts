import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

type TicketItem = {
  producto_id: number;
  descripcion: string;
  precio: number;
  primary_image_url: string | null;
  qty: number;
  max_qty: number | null;
};

type ClientForm = { nit_ci: string; nombre_razon: string; telefono: string; email: string };
type PaymentForm = { metodo: string; monto: number; referencia_qr: string; descuento_total: number };

@Component({
  standalone: true,
  selector: 'app-pos-checkout',
  imports: [CommonModule],
  templateUrl: './pos-checkout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PosCheckoutComponent {
  @Input({ required: true }) placing!: boolean;
  @Input({ required: true }) placeError!: string | null;
  @Input({ required: true }) successVentaId!: number | null;

  @Input({ required: true }) ticketItems!: TicketItem[];
  @Input({ required: true }) ticketCount!: number;
  @Input({ required: true }) ticketSubtotal!: number;

  @Input({ required: true }) total!: number;
  @Input({ required: true }) cambio!: number;

  @Input({ required: true }) clientMode!: 'idle' | 'found' | 'new';
  @Input({ required: true }) clientLoading!: boolean;
  @Input({ required: true }) clientError!: string | null;
  @Input({ required: true }) clientForm!: ClientForm;

  @Input({ required: true }) payment!: PaymentForm;

  @Input({ required: true }) fmtFn!: (n: number) => string;

  @Output() inc = new EventEmitter<number>();
  @Output() dec = new EventEmitter<number>();
  @Output() setQty = new EventEmitter<{ producto_id: number; qty: any }>();
  @Output() remove = new EventEmitter<number>();

  @Output() lookupClient = new EventEmitter<void>();
  @Output() createClient = new EventEmitter<void>();
  @Output() clearClient = new EventEmitter<void>();
  @Output() setClientField = new EventEmitter<{ key: keyof ClientForm; value: any }>();

  @Output() setPaymentField = new EventEmitter<{ key: keyof PaymentForm; value: any }>();

  @Output() confirmSale = new EventEmitter<void>();
  @Output() downloadReceipt = new EventEmitter<void>();
  @Output() shareReceipt = new EventEmitter<void>();

  public setQtySafe(producto_id: number, v: any): void {
    this.setQty.emit({ producto_id, qty: v });
  }

  public saleReady(): boolean {
    return (this.ticketItems?.length ?? 0) > 0 && !this.placing;
  }

  public clientTitle(): string {
    if (this.clientMode === 'found') return 'Seleccionado';
    if (this.clientMode === 'new') return 'Crear';
    return 'Buscar';
  }
}

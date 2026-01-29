import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

type PosCategory = { categoria_id: number; nombre: string };

@Component({
  standalone: true,
  selector: 'app-pos-header-filters',
  imports: [CommonModule],
  templateUrl: './pos-header-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PosHeaderFiltersComponent {
  @Input({ required: true }) empresaId!: number | null;
  @Input({ required: true }) loading!: boolean;
  @Input({ required: true }) error!: string | null;

  @Input({ required: true }) q!: string;
  @Input({ required: true }) categoriaId!: number | null;
  @Input({ required: true }) categories!: PosCategory[];

  @Input({ required: true }) ticketCount!: number;

  @Output() qChange = new EventEmitter<string>();
  @Output() categoriaChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<void>();
  @Output() reload = new EventEmitter<void>();
  @Output() clearTicket = new EventEmitter<void>();

  public onEnter(e: KeyboardEvent): void {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    this.search.emit();
  }
}

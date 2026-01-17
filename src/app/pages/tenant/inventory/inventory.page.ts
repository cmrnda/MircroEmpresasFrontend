import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TenantInventoryFacade } from './tenant-inventory.facade';

@Component({
  standalone: true,
  selector: 'app-tenant-inventory-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory.page.html'
})
export class TenantInventoryPage {
  private readonly _fb = inject(FormBuilder);
  public readonly vm = inject(TenantInventoryFacade);

  public readonly adjustId = signal<number | null>(null);

  public readonly adjustForm = this._fb.group({
    delta: [0, [Validators.required]]
  });

  public ngOnInit(): void {
    this.vm.load(1);
  }

  public openAdjust(producto_id: number): void {
    this.adjustId.set(producto_id);
    this.adjustForm.setValue({ delta: 0 });
  }

  public closeAdjust(): void {
    this.adjustId.set(null);
  }

  public submitAdjust(): void {
    const id = this.adjustId();
    if (!id) return;
    if (this.adjustForm.invalid) return;

    const delta = Number(this.adjustForm.value.delta || 0);
    this.vm.adjust(id, delta);
    this.adjustId.set(null);
  }

  public prev(): void {
    const p = this.vm.data().page;
    if (p <= 1) return;
    this.vm.load(p - 1);
  }

  public next(): void {
    const d = this.vm.data();
    const maxPage = Math.max(1, Math.ceil(d.total / d.page_size));
    if (d.page >= maxPage) return;
    this.vm.load(d.page + 1);
  }
}

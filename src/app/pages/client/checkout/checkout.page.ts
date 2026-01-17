import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { ClientCheckoutFacade } from './client-checkout.facade';

@Component({
  standalone: true,
  selector: 'app-client-checkout-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.page.html'
})
export class ClientCheckoutPage {
  private readonly _fb = inject(FormBuilder);

  public readonly cart = inject(CartService);
  public readonly vm = inject(ClientCheckoutFacade);

  public readonly form = this._fb.group({
    departamento: ['', [Validators.required]],
    ciudad: ['', [Validators.required]],
    direccion_linea: ['', [Validators.required]],
    zona_barrio: [''],
    referencia: [''],
    telefono_receptor: [''],
    costo_envio: [0]
  });

  public submit(): void {
    if (this.cart.items().length === 0) return;

    if (this.form.invalid) {
      this.vm.checkout(null);
      return;
    }

    const v = this.form.value;

    this.vm.checkout({
      departamento: String(v.departamento || '').trim(),
      ciudad: String(v.ciudad || '').trim(),
      direccion_linea: String(v.direccion_linea || '').trim(),
      zona_barrio: String(v.zona_barrio || '').trim() || null,
      referencia: String(v.referencia || '').trim() || null,
      telefono_receptor: String(v.telefono_receptor || '').trim() || null,
      costo_envio: Number(v.costo_envio || 0)
    });
  }
}

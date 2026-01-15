import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-forbidden-page',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mx-auto max-w-xl py-16">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          <span class="material-symbols-outlined">lock</span>
        </div>
        <div class="text-xl font-semibold">Acceso denegado</div>
        <div class="mt-1 text-sm text-slate-500">
          No tienes permisos para ver esta pagina.
        </div>

        <div class="mt-6 flex justify-center gap-2">
          <a class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
             routerLink="/login/platform">
            <span class="material-symbols-outlined text-base">login</span>
            Ir al login
          </a>
        </div>
      </div>
    </div>
  `
})
export class ForbiddenPage {}

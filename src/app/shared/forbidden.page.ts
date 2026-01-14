import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-forbidden-page',
  imports: [CommonModule],
  template: `<div style="max-width:600px;margin:40px auto;">forbidden</div>`
})
export class ForbiddenPage {}

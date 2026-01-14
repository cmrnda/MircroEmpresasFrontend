import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-client-home',
  imports: [CommonModule],
  template: `<div style="max-width:600px;margin:40px auto;">client home</div>`
})
export class ClientHomePage {}

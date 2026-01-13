import { Component } from '@angular/core';
import { JsonTreeComponent } from './components/json-tree/json-tree.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JsonTreeComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}

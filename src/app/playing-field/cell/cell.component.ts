import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'cell',
  imports: [],
  templateUrl: './cell.component.html',
  styleUrl: './cell.component.css',
  standalone: true
})
export class CellComponent {

  @Input() selected: boolean = false
  @Input() backgroundColor: string = "#fff"
  @Input() value: number = 0

  @Output() clicked = new EventEmitter<void>()

  onClick() {
    this.clicked.emit()
  }



}

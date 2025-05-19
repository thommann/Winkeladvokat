import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CellState} from "../../cell-state/CellState";
import {NgIf} from "@angular/common";

@Component({
  selector: 'cell',
  imports: [
    NgIf
  ],
  templateUrl: './cell.component.html',
  styleUrl: './cell.component.css'
})
export class CellComponent {
  @Input({required: true }) cellState!: CellState

  @Output() clicked = new EventEmitter<void>()

  onClick() {
    this.clicked.emit()
  }

  advocateColor(): string {
    if (this.cellState.advocate == undefined) {
      return "transparent"
    }
    return this.cellState.advocate.color
  }


}

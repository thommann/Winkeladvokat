import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Player} from "../../Player";
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

  @Input() selected: boolean = false
  @Input() backgroundColor: string = "#fff"
  @Input() value: number = 0
  @Input() advocate?: Player = undefined

  @Output() clicked = new EventEmitter<void>()

  onClick() {
    this.clicked.emit()
  }

  advocateColor(): string {
    if (this.advocate == undefined) {
      return "transparent"
    }
    return this.advocate.color
  }


}

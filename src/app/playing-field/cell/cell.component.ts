import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Cell} from '../../cell/cell.model';
import {NgIf} from '@angular/common';

@Component({
  selector: 'cell',
  imports: [NgIf],
  templateUrl: './cell.component.html',
  styleUrl: './cell.component.css',
  standalone: true,
})
export class CellComponent {
  @Input({ required: true }) cellState!: Cell;
  @Input() backgroundColor: string = "white"
  @Input() isSelected: boolean = false;

  @Output() clicked = new EventEmitter<void>();

  onClick() {
    this.clicked.emit();
  }

  advocateColor(): string {
    if (this.cellState.advocate == undefined) {
      return 'transparent';
    }
    return this.cellState.advocate.color;
  }

  paragraphColor(): string {
    if (this.cellState.paragraph == undefined) {
      return 'transparent';
    }
    return this.cellState.paragraph.color;
  }
}

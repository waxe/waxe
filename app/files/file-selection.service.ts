import { Injectable } from '@angular/core';

import { File } from './file';


@Injectable()
export class FileSelectionService {

  // All the files displayed: we need to have it to select until the last
  // selected file.
  files: File[] = [];
  // Store the selected files here.
  selected: File[] = [];
  // Store the temporary selected files here. It's used when we make the
  // selection with the mouse-selection directive.
  tmpSelected: File[] = [];

  destroy(): void {
    this.files = [];
    this.reset();
    this.tmpReset();
  }

  reset(): void {
    this.selected = [];
  }

  isSelected(file: File): boolean {
    return (this.selected.indexOf(file) !== -1)
  }

  add(file: File): void {
    this.selected.push(file);
  }

  select(file: File): void {
    this.reset();
    if (this.isSelected(file)) {
      return;
    }
    this.add(file);
  }

  toggleSelect(file: File): void {
    if (this.isSelected(file)) {
        const index: number = this.selected.indexOf(file);
        this.selected.splice(index, 1);
    }
    else {
      this.add(file);
    }
  }

  selectUntil(file: File): void {
    if (this.selected.length) {
      const lastSelected: File = this.selected[this.selected.length - 1];
      const positionLastSelected = this.files.indexOf(lastSelected);
      const position = this.files.indexOf(file);

      let start = Math.min(positionLastSelected, position);
      let end = Math.max(positionLastSelected, position);

      if (position < positionLastSelected) {
        start -= 1;
      }
      else {
        end += 1;
      }

      this.files.map((f: File, index: number) => {
        if (start < index && index < end) {
          if (!this.isSelected(f)) {
            this.add(f);
          }
        }
      });
    }
    else {
      this.select(file);
    }
  }

  selectAll(): void {
    this.reset();
    this.files.map((file:File) => this.add(file));
  }

  deselectAll(): void {
    this.reset();
  }

  tmpAdd(file: File): void {
    this.tmpSelected.push(file);
  }

  concatTmp(): void {
    this.tmpSelected.map((file: File) => {
      if (!this.isSelected(file)) {
        this.add(file);
      }
    });
    this.tmpSelected = [];
  }

  selectTmp(): void {
    this.reset();
    this.tmpSelected.map((file: File) => {
        this.add(file);
    });
    this.tmpSelected = [];
  }

  tmpReset(): void {
    this.tmpSelected = [];
  }

  shouldHighlight(file: File): boolean {
    return (this.selected.indexOf(file) !== -1 || this.tmpSelected.indexOf(file) !== -1)
  }

}

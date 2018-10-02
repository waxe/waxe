import { ContentChildren, Directive, ElementRef, Input, OnInit, QueryList, Renderer } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { ContextMenuComponent } from 'angular2-contextmenu';

import { FileComponent } from './file.component';
import { FileSelectionService } from './file-selection.service';


@Directive({
  selector: 'waxe-file[mouseSelectable]'
})
export class MouseSelectableDirective {

  public nativeElement: HTMLElement;

  constructor(private elementRef: ElementRef, public fileComponent: FileComponent) {
    this.nativeElement = this.elementRef.nativeElement;
  }

}


@Directive({
  selector: '[mouseSelection]'
})
export class MouseSelectionDirective implements OnInit {

  @ContentChildren(MouseSelectableDirective) private selectables: QueryList<MouseSelectableDirective>;
  @Input('mouseSelection') fileMenu: ContextMenuComponent;

  private startX: number;
  private startY: number;
  private endX: number;
  private endY: number;

  private helper: HTMLElement;

  private mouseMoveListener: Function;
  private mouseUpListener: Function;


  constructor(private elementRef: ElementRef, private renderer: Renderer, private fileSelectionService: FileSelectionService) {}

  ngOnInit() {
    this.initMouseEvent();
  }

  private getBox() {
    const refBox: any = this.getElementBox(this.elementRef.nativeElement);
    let box: any = {};
    box.startX = Math.max(refBox.startX, Math.min(this.startX, this.endX));
    box.endX = Math.min(refBox.endX, Math.max(this.startX, this.endX));
    box.startY = Math.max(refBox.startY, Math.min(this.startY, this.endY));
    box.endY = Math.min(refBox.endY, Math.max(this.startY, this.endY));
    return box;
  }

  private getElementBox(element: HTMLElement) {
    const rect: any = element.getBoundingClientRect();
    let box: any = {};
    box.startX = rect.left + window.scrollX;
    box.endX = rect.right + window.scrollX;
    box.startY = rect.top + window.scrollY;
    box.endY = rect.bottom + window.scrollY;
    return box;
  }

  private matchBoxes(box1: any, box2: any) {
    return (box1.startX <= box2.endX && box2.startX <= box1.endX && box1.startY <= box2.endY && box2.startY <= box1.endY)
  }

  private findMatchingSelectable() {
    this.fileSelectionService.tmpReset();
    this.selectables.map((selectable: MouseSelectableDirective) => {
      const elementBox: any = this.getElementBox(selectable.nativeElement);
      if (this.matchBoxes(this.getBox(), elementBox)) {
        this.fileSelectionService.tmpAdd(selectable.fileComponent.file);
      }
    });
  }

  private setHelperPosition() {
    const box = this.getBox();
    this.helper.style.top = box.startY + "px";
    this.helper.style.left = box.startX + "px";
    this.helper.style.width = (box.endX - box.startX) + "px";
    this.helper.style.height = (box.endY - box.startY) + "px";
  }


  private attachSelectionEvents() {
    this.mouseMoveListener = this.renderer.listen(document, 'mousemove', (event: any) => {
      // Don't block the drap & drop here since we want to let the scroll
      // working when selecting file. The drag & drap of the element is
      // blocked using 'user-select: none' in the css.
      // event.preventDefault();
      this.endX = event.pageX;
      this.endY = event.pageY;
      this.findMatchingSelectable();
      this.setHelperPosition();
    });

    this.mouseUpListener = this.renderer.listen(document, 'mouseup', (event: any) => {
      this.fileSelectionService.concatTmp();
      this.helper.remove();
      this.detachSelectionEvents();
    });
  }

  private detachSelectionEvents() {
    this.mouseMoveListener();
    this.mouseUpListener();
  }

  private initMouseEvent() {
    this.helper = document.createElement('div');
    this.helper.classList.add('mouse-helper');
    const body = document.querySelector('body');

    this.elementRef.nativeElement.addEventListener('mousedown', (event: any) => {

      if (this.fileMenu) {
        // Make sure the context menu we close the context menu.
        this.fileMenu.hideMenu();
      }

      if (event.which !== 1 || event.target.tagName.toLowerCase() === 'a') {
        // Avoid default behaviour of drag and drop
        // We don't block it for all mousedown event since we want to let the
        // scroll working when selecting files.
        event.preventDefault();
        // * It's not a left click
        // * we are on the link: we want to keep click and dblclick working
        return true;
      }

      if (!event.ctrlKey) {
        // We don't want to concatenate the selection
        this.fileSelectionService.reset();
      }
      this.attachSelectionEvents();
      this.startX = event.pageX;
      this.startY = event.pageY;
      this.endX = event.pageX;
      this.endY = event.pageY;
      this.setHelperPosition();
      // We add the helper to the body because it's easier to calculate the position.
      body.appendChild(this.helper);
    });

  }

}

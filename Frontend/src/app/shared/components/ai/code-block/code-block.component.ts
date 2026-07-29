import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import Prism from 'prismjs';
import { TooltipDirective } from '../../../directive/tooltip.directive';

@Component({
  selector: 'app-code-block',
  imports: [
    CommonModule,
    TooltipDirective
  ],
  templateUrl: './code-block.component.html',
  styles: ``
})
export class CodeBlockComponent {

  @Input() code: string = '';
  @Input() language: string = 'javascript';
  @Input() title: string = '';
  @Input() showLineNumbers: boolean = false;
  @Input() className: string = '';

  @Output() edit = new EventEmitter<void>();

  @ViewChild('codeElement') codeElement!: ElementRef<HTMLElement>;

  copied = false;

  ngAfterViewInit() {
    this.highlightCode();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['code'] || changes['language']) {
      this.highlightCode();
    }
  }

  highlightCode() {
    if (this.codeElement) {
      Prism.highlightElement(this.codeElement.nativeElement);
    }
  }

  handleCopy() {
    navigator.clipboard.writeText(this.code).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    });
  }
}

import { Directive, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FileIOService } from '../services/filesystem.service';

@Directive({ selector: '[bh-download]' })
export class BHDownloadDirective {
  @Input() downloadOptions;
  @Output() onsuccess: EventEmitter<any> = new EventEmitter();
  @Output() onerror: EventEmitter<any> = new EventEmitter();

  constructor(private fsv: FileIOService) { }

  @HostListener('click') methodToHandleMouseClickAction() {
    this.downloadFile()
      .subscribe(res => this.onsuccess.emit(res),
      err => this.onerror.emit(err));
  }

  downloadFile() {
    return this.fsv.downloadFile(this.downloadOptions);
  }
}

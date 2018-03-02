import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { FileIOService } from '../services/filesystem.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'bh-file-upload',
  styleUrls: ['./file-upload.component.scss'],
  templateUrl: './file-upload.component.html',
})
export class BHFileUploadComponent {
  @ViewChild('fileInput') fileInput;
  isUploadDone = false;
  file: File;
  fileName;

  @Input('uploadOptions') options: any;

  @Output('onsuccess') onSuccess: EventEmitter<any> = new EventEmitter<any>();

  @Output('onerror') onError: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private fileIOService: FileIOService,
    private _renderer: Renderer2,
    private _changeDetectorRef: ChangeDetectorRef) { }

  /**
   * Method executed when upload button is clicked.
   */
  handleUpload(): void {
    if (this.file && this.options && this.options.entityName && this.options.metadata) {
      this.fileIOService.uploadFile({ files: this.file, entityName: this.options.entityName, metadata: this.options.metadata })
        .subscribe(res => {
          this.onSuccess.emit(res);
        }, err => this.onError.emit(err),
        () => {
          this.isUploadDone = true;
          this._changeDetectorRef.markForCheck();
        });
    } else {
      this.onError.emit(new Error('Upload options missing'));
    }
  }

  /**
   * Method executed when a file is selected.
   */
  handleSelect(fileInput: any): void {
    if (fileInput.target.files && fileInput.target.files[0]) {
      this.file = fileInput.target.files[0];
      this.fileName = this.file.name;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Methods executed when cancel button is clicked.
   * Clears files.
   */
  cancel(): void {
    this.file = null;
    this.fileName = null;
    this.isUploadDone = false;
    // check if the file input is rendered before clearing it
    if (this.fileInput) {
      this._renderer.setProperty(this.fileInput, 'value', '');
    }
  }

}

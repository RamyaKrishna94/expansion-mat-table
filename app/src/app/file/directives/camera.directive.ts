import { Directive, Input, Output, EventEmitter } from '@angular/core';
import { HostListener } from '@angular/core';
import { FileIOService } from '../services/filesystem.service';

declare const navigator: any;

export interface CameraOptions {
  quality?: 50;
  destinationType?: 1 | 2;
  EncodingType?: 0 | 1;
  MediaType?: 0 | 1 | 2;
  PictureSourceType?: 0 | 1 | 2;
}

@Directive({
  selector: '[bh-camera]'
})
export class BHCameraDirective {
  @Input() cameraOptions;
  @Output() onsuccess: EventEmitter<any> = new EventEmitter();
  @Output() onerror: EventEmitter<any> = new EventEmitter();

  constructor(private fsv: FileIOService) { }

  @HostListener('click') methodToHandleMouseClickAction() {
    this.getPicture()
      .then((sucess) => this.onsuccess.emit(sucess))
      .catch((error) => this.onerror.emit(error));
  }

  getPicture(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fsv.getPicture(this.cameraOptions).then(res => {
        const options = {
          'formData': res,
          'entityName': this.cameraOptions.entityName,
          'metadata': this.cameraOptions.metadata
        };
        this.fsv.uploadFile(options).subscribe(uri => {
          resolve(uri);
        }, err => reject(err));
      }).catch((err) => {
        return reject(err);
      });
    });
  }
}

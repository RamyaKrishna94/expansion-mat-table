import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpProgressEvent, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Subject } from 'rxjs/Subject';
import { SystemService } from 'app/service/system.service';

declare const window: any;
declare const cordova: any;
declare const navigator: any;

@Injectable()
export class FileIOService {
  private _progressSubject: Subject<number> = new Subject<number>();
  private _progressObservable: Observable<number>;
  systemService;
  appProperties;

  /**
   * Gets progress observable to keep track of the files being downloaded.
   * Needs to be supported by backend.
   */
  get progress(): Observable<number> {
    return this._progressObservable;
  }

  constructor(private http: HttpClient) {
    this._progressObservable = this._progressSubject.asObservable();
    this.systemService = new SystemService();
    this.appProperties = this.systemService.getVal('properties');
  }

  private getFileInfo(options): Observable<any> {
    let dataModelURL;
    if (options.metadata) {
      dataModelURL = this.systemService.getDataModelUrl() + `${this.appProperties.appName}_${options.entityName}.files?filter={"metadata.key": "${options.metadata.key}"}`;
    } else {
      dataModelURL = this.systemService.getDataModelUrl() + `${this.appProperties.appName}_${options.entityName}.files/${options.fileId}`;
    }
    return this.http.get(dataModelURL);
  }

  private getFormData(fileUri: string): Promise<FormData> {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(fileUri, (fileEntry) => {
        fileEntry.file((file) => {
          const reader = new FileReader();
          reader.onerror = evt => {
            return reject(evt);
          };
          reader.onloadend = evt => {
            const formData = new FormData();
            const blob = new Blob([new Uint8Array(reader.result)], { type: file.type });
            formData.append('file', blob, file.name);
            return resolve(formData);
          };
          reader.readAsArrayBuffer(file);
        });
      }, (error) => {
        return reject(error);
      });
    });
  }

  public getPicture(cameraOptions) {
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', () => {
        navigator.camera.getPicture((imageUri) => {
          this.getFormData(imageUri).then(res => {
            return resolve(res);
          }).catch(err => reject(err));
        }, (error) => {
          return reject(error);
        }, cameraOptions);
      }, false);
    });
  }

  public uploadFile(options): Observable<any> {
    return new Observable<any>((subscriber: Subscriber<any>) => {
      let body: FormData = new FormData();
      if (window['cordova']) {
        if (options.formData) {
          body = options.formData;
        } else if (options.files) {
          body.append('file', options.files);
        } else {
          subscriber.error('No file selected!');
        }
      } else {
        if (!options.files) {
          subscriber.error('No file selected!');
        } else {
          body.append('file', options.files);
        }
      }

      if (options.metadata) {
        body.append('metadata', JSON.stringify(options.metadata));
      }

      const headers = { 'Content-Type': 'null' };

      const url = this.systemService.getFileIOUrl() + `${options.entityName}`;

      const req = new HttpRequest('POST', url, body, { headers: this.setHeaders(headers), reportProgress: true });

      this.http.request(req).subscribe((event: HttpProgressEvent) => {
        let progress = 0;
        if (event.type === HttpEventType.UploadProgress) {
          progress = Math.round(100 * event.loaded / event.total);
          this._progressSubject.next(progress);
        } else if (event instanceof HttpResponse) {
          subscriber.next(event);
          subscriber.complete();
        }
      }, err => subscriber.error(err));
    });
  }

  public downloadFile(options: any): Observable<any> {
    this._progressSubject.next(0);
    return new Observable<any>((subscriber: Subscriber<any>) => {
      if (options.entityName && (options.metadata || options.fileId)) {
        this.getFileInfo(options).subscribe((res) => {
          if (options.metadata) {
            res = res[0];
          } else {
            res = res.result;
          }
          const fileInfo = {
            contentType: '',
            contentLength: 0,
            filename: ''
          };
          if (res && res['contentType'] && res['filename'] && res['length']) {
            fileInfo['contentType'] = res['contentType'];
            fileInfo['filename'] = res['filename'];
            fileInfo['contentLength'] = res['length'];
            let fileIOURL;

            if (options.metadata) {
              fileIOURL = this.systemService.getFileIOUrl() + `${options.entityName}?metadataFilter={"metadata.key": "${options.metadata.key}"}`;
            } else {
              fileIOURL = this.systemService.getFileIOUrl() + `${options.entityName}/${options.fileId}`;
            }
            const headers = {
              'Accept': fileInfo.contentType
            };
            
            const req = new HttpRequest('GET', fileIOURL, { headers: this.setHeaders(headers), reportProgress: true, responseType: 'blob' });
            this.http.request(req).subscribe((event: HttpProgressEvent) => {
              let progress = 0;
              if (event.type === HttpEventType.DownloadProgress) {
                event.total = event.total || fileInfo.contentLength;
                progress = Math.round(100 * event.loaded / event.total);
                this._progressSubject.next(progress);
              } else if (event instanceof HttpResponse) {
                const blob = new Blob([event.body], { type: fileInfo.contentType });
                this.saveFile(blob, fileInfo.filename).then((resp) => {
                  subscriber.next(resp);
                  subscriber.complete();
                }).catch(err => subscriber.error(err));
              }
            }, err => subscriber.error(err));
          } else {
            subscriber.error('fileInfo not exit');
          }
        }, err => subscriber.error(err));
      } else {
        subscriber.error('download options not found');
      }
    });
  }

  private saveFile(data: Blob, filename: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.systemService.checkDevice() == 'mobile') {
        const path = cordova.file.dataDirectory;
        this.checkFileExist(path, filename, 0, (newFileName) => {
          let directory;
          if(this.systemService.isAndroid()){
            directory = 'file:///storage/emulated/0/Download';
          } else {
            directory = cordova.file.documentsDirectory;
          }
          window.resolveLocalFileSystemURL(directory, (fs) => {
            fs.getFile(newFileName, { create: true, exclusive: false }, (fileEntry) => {
              fileEntry.createWriter((fileWriter) => {
                fileWriter.onwriteend = () => {
                  resolve(fileEntry.toURL());
                };

                fileWriter.onerror = (err) => {
                  reject(err);
                };
                fileWriter.write(data);
              });
            });
          });
        });
      } else {
        const downloadURL = window.URL.createObjectURL(data);
        const anchor = document.createElement('a');
        anchor.style.display = 'none';
        anchor.download = filename;
        anchor.href = downloadURL;
        anchor.click();
        window.URL.revokeObjectURL(downloadURL);
        anchor.remove();
        resolve(downloadURL);
      }
    });
  }

  private checkFileExist = (path: string, fileName: string, i: number, callback) => {
    return window.resolveLocalFileSystemURL(path + fileName, () => {
      i += 1;
      if (i > 1) {
        fileName = fileName.slice(0, (fileName.lastIndexOf('.') - 1)) + fileName.slice(fileName.lastIndexOf('.'));
      }
      fileName = fileName.slice(0, fileName.lastIndexOf('.')) + i + fileName.slice(fileName.lastIndexOf('.'));
      return this.checkFileExist(path, fileName, i, callback);
    }, () => {
      return callback(fileName);
    });
  }

  private setHeaders(headerJSON: Object): HttpHeaders {
    let headers = new HttpHeaders();
    for (const key in headerJSON) {
      if (key) {
        headers = headers.set(key, headerJSON[key]);
      }
    }
    return headers;
  }

}

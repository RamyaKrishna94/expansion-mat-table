import { Injectable } from '@angular/core';
import { AlertComponent } from '../alertComponent/alert.component';
import { MatDialog, MatSnackBar } from '@angular/material';


@Injectable()
export class BAppService {

  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) { }

  alert(message, title, data?) {
    AlertComponent.message = message;
    AlertComponent.title = title;
    return this.dialog.open(AlertComponent, data);
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'close', { duration: 3000 });
  }
}
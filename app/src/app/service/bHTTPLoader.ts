import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BAppService } from './bApp.service';
import { BLogoutService } from './bLogout.service';
import { Router } from '@angular/router';

@Injectable()
export class BHTTPLoader {
  private _isHTTPRequestInProgress = new Subject<boolean>();
  _isHTTPRequestInProgress$ = this._isHTTPRequestInProgress.asObservable();

  constructor(private bAppService: BAppService, private bLogoutService: BLogoutService, private router: Router) {
  }

  isHTTPRequestInProgress(bool) {
    this._isHTTPRequestInProgress.next(bool);
  }

  alertError(error) {
    if (error.status < 200 || error.status > 500) {
      if (error.status === 0) {
        this.bAppService.openSnackBar('Connectivity issue');
      } else {
        this.bAppService.openSnackBar('Response failure');
      }
    } else if (error.status === 401) {
      this.bLogoutService.logout();
      this.router.navigate(['unauthorized']);
    } else if (error.error) {
      if (error.error instanceof Object) {
        this.bAppService.openSnackBar(error.error.message)
      } else {
        this.bAppService.openSnackBar(error.error);
      }
    } else {
      this.bAppService.openSnackBar('Response failure');
    }
  }
}

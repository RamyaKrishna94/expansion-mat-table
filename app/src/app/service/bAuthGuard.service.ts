import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';
import { BLoginService } from './bLogin.service';

@Injectable()
export class BAuthGuard implements CanActivate {

  constructor(private bLoginService: BLoginService, private router: Router) {}

  canActivate() {
    if(this.bLoginService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['unauthorized']);
      return false;
    }
  }
}
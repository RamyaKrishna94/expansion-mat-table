import { Injectable } from '@angular/core';
import { BSessionStorage } from './bSessionStorage.service';
import { BLocalStorageService } from './bLocalStorage.service';

  
@Injectable()
export class BLogoutService {

  bSessionStorage = new BSessionStorage();
  bLocalStorageService = new BLocalStorageService();
  constructor() { }

  logout() {
    this.bSessionStorage.clearSessionStorage();
    this.bLocalStorageService.clear();
    return true;
  }
}
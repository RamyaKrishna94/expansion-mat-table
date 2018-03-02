import { Injectable, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SystemService } from './system.service';
import { BTokenService } from './bToken.service';
import { PubSubService } from './pubSub.service';
import { BSessionStorage } from './bSessionStorage.service';
import { BLocalStorageService } from './bLocalStorage.service';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';


@Injectable()
export class BLoginService {
  loginUrl;
  appProperties;
  systemService;
  bTokenService;
  bSessionStorage;
  bLocalStorageService;
  @Output() loginCompleted = new EventEmitter();
  constructor(private http: HttpClient, private pubSubService: PubSubService, private router: Router, private notificationService: NotificationService) {
    this.systemService = new SystemService();
    this.bTokenService = new BTokenService();
    this.bSessionStorage = new BSessionStorage();
    this.bLocalStorageService = new BLocalStorageService();
  }


  login(userName, password, isRemember?) {
    this.appProperties = this.systemService.getVal('properties');
    this.loginUrl = this.systemService.getAuthUrl() + this.appProperties.appDataSource + '/' + this.appProperties.appName;
    const uuid = this.systemService.deviceUUID;
    return this.http.post(this.loginUrl, { username: userName, password: password, uuid: uuid }).map(result => {
      const tokensObj = result;
      if (tokensObj) {
        this.bTokenService.updateTokens(tokensObj, isRemember);
      }
      if (this.systemService.getVal('firebaseSenderId') != 'FIREBASE_SENDER_ID' && this.systemService.getVal('firebaseAuthKey') != 'FIREBASE_AUTH_KEY') {
        this.pubSubService.$pub('loginComplete');
      }
      return (result);
    }, error => {
      return (error);
    });
  }

  isLoggedIn() {
    if (this.bSessionStorage.getValue('accessToken') && this.bSessionStorage.getValue('refreshToken') && this.bSessionStorage.getValue('accessToken') != 'null' && this.bSessionStorage.getValue('refreshToken') != 'null') {
      return true;
    }
    return false;
  }


  logout() {
    this.bSessionStorage.clearSessionStorage();
    this.bLocalStorageService.clearLocalStorage();
    return true;
  }

}

import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { SystemService } from './system.service';
import { Observable } from 'rxjs/Observable';
declare var PushNotification: any;
import { BLocalStorageService } from 'app/service/bLocalStorage.service';
import * as firebase from 'firebase';
import { PubSubService } from './pubSub.service';
import { HttpClient } from '@angular/common/http';
import { BSessionStorage } from './bSessionStorage.service';
import { Router } from '@angular/router';
import { BHTTPLoader } from './bHTTPLoader';
import { environment } from '../../environments/environment.prod';

@Injectable()
export class NotificationService implements OnInit, OnDestroy {
  private static instance: NotificationService;
  private systemService: SystemService = SystemService.getInstance();
  private firebaseSenderId: string;
  private isNotificationEnabled: boolean;
  private deviceType; string;
  private resDetails;
  private deviceUUID: string;
  loginSubscribe;
  sessionStorage: BSessionStorage;
  appName;
  constructor(private localStorageService: BLocalStorageService, private pubSubService: PubSubService,
    private http: HttpClient, private router: Router, private bHttpLoader: BHTTPLoader) {
    this.firebaseSenderId = this.systemService.getVal('firebaseSenderId');
    this.isNotificationEnabled = this.systemService.getVal('isNotificationEnabled');
    this.appName = this.systemService.getVal('appName');
    this.deviceType = this.systemService.deviceType;
    this.sessionStorage = new BSessionStorage();
    this.loginSubscribe = this.pubSubService.$sub('loginComplete', () => {
      this.enableNotification();
    })
  }

  ngOnInit() {
  }


  enableNotification() {
    document.addEventListener('deviceready', event => {
      if (this.isNotificationEnabled) {
        if (this.deviceType && this.deviceType != 'browser') {
          this.deviceType = this.systemService.deviceType;
          this.checkPermission().then(res => {
            if (res) {
              this.initializeNotifications();
            }
            // });
          });
        }
      }
    });
    if (this.isNotificationEnabled) {
      if (this.deviceType && this.deviceType == 'browser' && window['Notification']) {
        this.initialiseWebPush();

      }

    }

  }

  initialiseWebPush() {
    const __this = this;
    const messaging = firebase.messaging();

    messaging.requestPermission()
      .then(function () {
        return messaging.getToken();
      })
      .then(function (token) {
        if (token) {
          __this.sendRegDetails(token);
        }
      })
      .catch(function (err) {
        __this.bHttpLoader.alertError(err);
        // console.log('Error Occured.', err);
      });

    messaging.onMessage(function (payload) {
      if (payload['notification']) {
        let notificationObj = payload['notification'];
        let options = {
          body: notificationObj.body,
          icon: notificationObj.icon
        }
        // console.log('deviceType', this.deviceType);
        // creating a native browser message
        let notificationUI = new Notification(notificationObj.title, options);
        notificationUI.onclick = function () {
          window.focus(); // window is focused when the user clicks the notification using this
        }
      }

    });
  }

  checkPermission() {
    // Android & iOS only
    // Checks whether the push notification permission has been granted.
    return new Promise((resolve) => {
      if (this.deviceType === 'Android' || this.deviceType === 'iOS') {
        PushNotification.hasPermission(function (data) {
          return resolve(data.isEnabled);
        });
      } else {
        return resolve(true);
      }
    });
  }

  initializeNotifications() {

    const push = window['PushNotification'].init({
      android: {
        senderID: this.firebaseSenderId
      },
      ios: {
        alert: "true",
        badge: "true",
        sound: "true",
        senderID: this.firebaseSenderId
      },
    });

    push.on('registration', (data) => {
      // data.registrationId
      // console.log(data.registrationId);
      this.sendRegDetails(data.registrationId);
    });

    push.on('notification', (data) => {
      // data.message,
      // data.title,
      // data.count,
      // data.sound,
      // data.image,
      // data.additionalData
      window['cordova'].plugins.notification.local.schedule({
        title: data.title,
        text: data.message,
        sound: data.sound,
        at: new Date().getTime()
      });
    });

    push.on('error', (e) => {
      // e.message
      console.error(e);
    });
  }

  sendRegDetails(registrationId) {
    this.localStorageService.setValue('registrationId', registrationId);
    var url = this.systemService.getTenantUrl() + 'notification/' + this.systemService.getVal('appName') + '/register';
    this.http.post(url, {
      'key': this.sessionStorage.getValue('userObj')['userKey'],
      'uuid': this.localStorageService.getValue('uuid'), 'fbregid': registrationId
    }).subscribe(result => {
      // this.pubSubService.$pub('FBRegComp');
    }, error => {
      console.log(error);
    })
  }

  ngOnDestroy() {
    this.loginSubscribe.unSubscribe();
  }

}

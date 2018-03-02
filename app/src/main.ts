import { firebaseInitForServiceWorker } from './libConfig/firebaseInitForServiceWorker';
import { environment } from './environments/environment.prod';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as firebase from 'firebase';
import { AppModule } from './app/app.module';
import { initChartJS } from './libConfig/initChartJS';
import { SystemService } from './app/service/system.service';
import { BLocalStorageService } from 'app/service/bLocalStorage.service';
// import { SystemService } from 'app/service/system.service.ts';

let bSystemService: SystemService = SystemService.getInstance();
const deviceType = bSystemService.deviceType;
let bLocalStorageService = new BLocalStorageService();

if (environment.properties.production) {
  enableProdMode();
}



function bootstrapNow() {
  platformBrowserDynamic().bootstrapModule(AppModule).then((data) => {
    if (window['navigator'] && window['navigator']['splashscreen']) {
      // hide splash screen
      window['navigator']['splashscreen'].hide();
    }
    if (environment.properties.isNotificationEnabled) {
      firebaseInitForServiceWorker();
    }
    initChartJS();
  });
}

function isCordovaBrowser() {
  return deviceType === 'cordova_browser';
}

function isBrowser() {
  return deviceType === 'browser';
}

/**
 * deviceready will only be triggered by a cordova app
 * and since we are not using cordova browser to server files.
 * However, if cordova browser would be used then the app will
 * get bootstrapped
 */
document.addEventListener('deviceready', function () {
  bootstrapNow();
});



if (isBrowser() && !isCordovaBrowser()) {
  bootstrapNow();
}

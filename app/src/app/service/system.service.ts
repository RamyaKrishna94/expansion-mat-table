import { environment } from '../../environments/environment';
import { Utility } from '../util';
import { BLocalStorageService } from './bLocalStorage.service';

export class SystemService {
  private static instance: SystemService;

  private _deviceType: string;
  private _deviceUUID;
  uuid;
  properties;
  bLocalStorageService = new BLocalStorageService();

  static getInstance() {
    if (!this.instance) {
      this.instance = new SystemService();
    }
    return this.instance;
  }

  constructor() {
    this._deviceType = this.checkDevice();
    this._deviceUUID = this.checkDeviceId();
    this.properties = this.getVal('properties');
  }
 
  /**
   * Returna 'mobile' or 'browser' based on the platform
   */
  private checkDevice(): string {
    if (window['device'] && (window['device']['platform'] != 'browser' || window['device']['platform'] != 'Browser')) {
      return 'mobile';
    } else if (window['device'] && (window['device']['platform'] == 'browser' || window['device']['platform'] == 'Browser')) {
      return 'cordova_browser';
    } else {
      return 'browser';
    }
  }

   checkDeviceId() {
    if (this.checkDevice() === 'browser') {
      this._deviceUUID = this.bLocalStorageService.getValue('uuid');
      if (!this._deviceUUID) {
        this._deviceUUID = new Utility().generateUUID();
        this.bLocalStorageService.setValue('uuid', this._deviceUUID);
      }
    } else {
      this._deviceUUID = window['device'].uuid;
      this.bLocalStorageService.setValue('uuid', this._deviceUUID);
    }
    return this._deviceUUID;
  }

  public get deviceType() {
    return this._deviceType;
  }

  public get deviceUUID() {
    return this._deviceUUID;
  }

  public getVal(key) {
    if (key == 'properties') {
      return environment.properties;
    } else {
      return environment.properties[key];
    }

  }

  public isAndroid() {
    if (window['device'] && window['device']['platform'] == 'Android') {
      return true;
    } else {
      return false;
    }
  }

  public isIOS() {
    if (window['device'] && window['device']['platform'] == 'iOS') {
      return true;
    } else {
      return false;
    }
  }
  
  public getAndroidVersion() {
    if (this.isAndroid()) {
      return window['device']['version'];
    } else {
      return '';
    }
  }
  
  public getAuthUrl() {
    return this.properties.baseUrl + this.properties.tenantName + '/auth/';
  }
  public getTenantUrl() {
    return this.properties.baseUrl + this.properties.tenantName + '/';
  }

  public getAppUrl() {
    return this.properties.baseUrl + this.properties.tenantName + '/proxy/' + this.properties.appName + '/';
  }

  public getProxyUrl() {
    return this.properties.baseUrl + this.properties.tenantName + '/proxy/';
  }

  public getDataModelUrl() {
    return this.properties.baseUrl + this.properties.tenantName + '/datamodel/' + this.properties.appDataSource + '/' + this.properties.appName + '/';
  }

  public getFileIOUrl() {
    return this.properties.baseUrl + this.properties.tenantName + '/fileio/' +
      this.properties.appDataSource + '/' + this.properties.appName + '/';
  }
}

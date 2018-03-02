import { SystemService } from './system.service';
import { Injectable } from '@angular/core';
import * as localforage from 'localforage';

@Injectable()
export class BLocalStorageService {

  static storageCache: any = {};
  // private ss: SystemService;
  static nativeStorageI;
  // private localForageService: BLocalStorageService;
  constructor() {
    // this.ss = new SystemService();
    // this.localForageService = new BLocalStorageService();
    // this.pluginCheck()
  }

  /**
   * Initialize storage cache before app bootstap.
   * 1. Check if browser - use localforage service
   * 2. If mobile use cordova-nativestorage plugin
   */
  initStorage(): Promise<any> {
    // console.log('init storage');
    if (!window['cordova']) {
      return new Promise((resolve, reject) => {
        BLocalStorageService.storageCache = localStorage;
        resolve()
      })
    } else {
      // console.log('before bootstrap');
      return localforage.iterate((value, key, iterationNumber) => {
        BLocalStorageService.storageCache[key] = value;
      })
      // return new Promise((resolve, reject) => {
      //   const keyPromiseArr = [];
      //   console.log(BLocalStorageService.nativeStorageI)
      //   BLocalStorageService.nativeStorageI.keys((keysArr) => {
      //     for (let i = 0; i < keysArr.length; i++) {
      //       keyPromiseArr.push(this.getItemNs(keysArr[i]));
      //     }
      //     Promise.all(keyPromiseArr.map(this.promiseReflect)).then(valuesArr => {
      //       let resolveArr = valuesArr.filter((results) => results.status === 'resolved');
      //       for (let i = 0; i < keyPromiseArr.length; i++) {
      //         const key = keysArr[i];
      //         console.log(resolveArr[i]['v']);
      //         BLocalStorageService.storageCache[key] = resolveArr[i]['v']
      //       }
      //       resolve(BLocalStorageService.storageCache);
      //     }).catch(error => {
      //       reject(error);
      //     })
      //   }, error => {
      //     reject(error);
      //   })
      // });
    }
  }

  getStorage() {
    return BLocalStorageService.storageCache;
  }

  setValue(key, value) {
    if (!window['cordova']) {
      BLocalStorageService.storageCache[key] = value;
      localStorage.setItem(key, value);
    } else {
      BLocalStorageService.storageCache[key] = value;
      this.initLocalForage();
      localforage.setItem(key, value).then(result => {
      }, error => {
        console.error(error);
      })
    }
  }

  getValue(key): any | Promise<any> {
    if (!BLocalStorageService.storageCache[key]) {
      return null;
    } try {
      const obj = BLocalStorageService.storageCache[key]
      return JSON.parse(obj);
    } catch (error) {
      return BLocalStorageService.storageCache[key];
    }
  }

  remove(key) {
    delete BLocalStorageService.storageCache[key];
    if (!window['cordova']) {
      localStorage.remove(key);
    } else {
      this.initLocalForage();
      localforage.removeItem(key).then(fulfilled => {
      }).catch(error => {
        console.error('Could not remove', key);
      })
    }
  }

  clear() {
    BLocalStorageService.storageCache = {};
    if (!window['cordova']) {
      localStorage.clear();
    } else {
      localforage.clear();
    }
  }

  private pluginCheck() {
    if (window['cordova'] && window['NativeStorage']) {
      BLocalStorageService.nativeStorageI = window['NativeStorage'];
      // return true;
    }
    // this.initStorage();
  }

  private getItemNs(key) {
    return new Promise((resolve, reject) => {
      BLocalStorageService.nativeStorageI.getItem(key, result => {
        // console.log('inside getItem NS', result);
        resolve(result);
      }, error => {
        // console.log('inside getItem NS error', error);
        reject(error);
      })
    })
  }

  private setItemNs(key, value) {
    return new Promise((resolve, reject) => {
      BLocalStorageService.nativeStorageI.setItem(key, value, result => {
        resolve(result);
      }, error => {
        reject(error);
      })
    })
  }

  private removeItemNs(key) {
    return new Promise((resolve, reject) => {
      BLocalStorageService.nativeStorageI.remove(key, (result) => {
        resolve(result);
      }, (error) => {
        reject(error);
      });
    })
  }

  private clearNs() {
    return new Promise((resolve, reject) => {
      BLocalStorageService.nativeStorageI.clear(result => {
        resolve(result);
      }, error => {
        reject(error);
      })
    })
  }

  private initLocalForage() {
    // console.log('init local forage');
    localforage.config({
      name: 'localforage',
      driver: localforage.WEBSQL, // Force WebSQL; same as using setDriver()
    });
  }

  private promiseReflect(promise) {
    return promise.then(resolved => { return { v: resolved, status: 'resolved' } }, error => { return { e: error, status: 'rejected' } })
  }
}

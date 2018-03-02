import { Injectable } from '@angular/core';

@Injectable()
export class BSessionStorage {
  static sessionStorageCache: any = {};
  constructor() {
    BSessionStorage.sessionStorageCache = sessionStorage;
  }

  getSessionStorage() {
    return BSessionStorage.sessionStorageCache;
  }

  setValue(key, value) {
    BSessionStorage.sessionStorageCache[key] = value;
    sessionStorage.setItem(key, value)
  }

  getValue(key) {
    if (!BSessionStorage.sessionStorageCache[key]) {
      return null;
    }
    try {
      const obj = BSessionStorage.sessionStorageCache[key];
      return JSON.parse(obj);
    } catch (error) {
      return BSessionStorage.sessionStorageCache[key];
    }
  }

  remove(key) {
    if (BSessionStorage.sessionStorageCache.hasOwnProperty(key)) {
      delete BSessionStorage.sessionStorageCache[key];
      sessionStorage.removeItem(key);
    }
  }

  clearSessionStorage() {
    BSessionStorage.sessionStorageCache = {};
    sessionStorage.clear();
  }

}
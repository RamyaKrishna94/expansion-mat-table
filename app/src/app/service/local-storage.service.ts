import { Injectable } from '@angular/core';
import localForage from 'localforage';

@Injectable()
export class LocalStorageService {

  setValue(key, value) {
    return localForage.setItem(key, JSON.stringify(value));
  }

  getValue(key) {
    return localForage.getItem(key);
  }

  remove(key) {
    return localForage.removeItem(key);
  }
}

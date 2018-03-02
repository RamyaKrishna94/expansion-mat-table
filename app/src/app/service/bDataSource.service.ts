import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable()
export class BDataSourceService {

  constructor(private http: HttpClient) { }


  getDataSource() {
    return this.http.get('constants/app.const.json').map(res => {
      if (res && res.hasOwnProperty('_body')) {
        return res['_body'];
      }
    })
  }

}

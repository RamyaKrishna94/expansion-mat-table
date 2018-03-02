import { Injectable, Injector } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpHeaders,
  HttpResponse,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { BHTTPLoader } from './bHTTPLoader';
import { SystemService } from './system.service';
import { BSessionStorage } from './bSessionStorage.service';
import { BLocalStorageService } from './bLocalStorage.service';
import { BTokenService } from './bToken.service';

@Injectable()
export class BHttp implements HttpInterceptor {
  timeout = 90000;
  systemService;
  bSessionStorage;
  bLocalStorageService;
  appProperties;
  bTokenService;
  isRefreshingToken = false;
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(private bHTTPLoader: BHTTPLoader, private inj: Injector) {
    this.systemService = new SystemService();
    this.bSessionStorage = new BSessionStorage();
    this.bLocalStorageService = new BLocalStorageService();
    this.bTokenService = new BTokenService();
    this.appProperties = this.systemService.getVal('properties');
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.requestInterceptor();

    // Pass on the cloned request instead of the original request.
    return next.handle(this.requestOptions(req))
      .timeout(this.timeout)
      .catch(error => this.onCatch(error, req, next))
      .finally(() => {
        this.onFinally();
      });
  };

  updateToken(error: HttpErrorResponse, req: HttpRequest<any>, next: HttpHandler): any {
    if (this.appProperties.appAuthenticationStrategy === 'activeDirectory' ||
      this.appProperties.appAuthenticationStrategy === 'localAuth') {
      if (!this.isRefreshingToken) {
        this.isRefreshingToken = true;

        // Reset here so that the following requests wait until the token
        // comes back from the refreshToken call.
        this.tokenSubject.next(null);

        return this.refreshToken()
          .switchMap((tokensObj: Object) => {
            if (tokensObj) {
              this.bTokenService.updateTokens(tokensObj);
              const newToken = tokensObj['accessToken'];
              this.tokenSubject.next(newToken);
              return next.handle(this.requestOptions(req));
            }
            return Observable.throw(new Error('Can\'t refresh the token'));
          })
          .catch(err => this.onCatchError(err))
          .finally(() => this.isRefreshingToken = false)
      } else {
        return this.tokenSubject
          .filter(token => token != null)
          .take(1)
          .switchMap(token => next.handle(this.requestOptions(req)));
      }
    } else {
      return this.onCatchError(error);
    }
  }

  refreshToken() {
    const http = this.inj.get(HttpClient);
    const appProperties = this.systemService.getVal('properties');
    const refreshUrl = this.systemService.getAuthUrl() +
      appProperties.appDataSource + '/' + appProperties.appName + '/refresh';
    const body = {
      'uuid': this.bLocalStorageService.getValue('uuid'),
      'userKey': this.bSessionStorage.getValue('userObj')['userKey'],
      'refreshToken': this.bSessionStorage.getValue('refreshToken')
    };
    return http.post(refreshUrl, body);
  }


  /**
   * Request options.
   * @param options
   * @returns {HttpRequest}
   */
  private requestOptions(req?: HttpRequest<any>) {
    let headers = req.headers;
    if (req.headers == null) {
      headers = new HttpHeaders();
    }
    req = req.clone({
      url: this.getFullUrl(req.url),
      headers: headers
    });
    return this.addDefaultHeaders(req);
  }


  /**
  * Default options.
  * @param options
  * @returns {HttpHeadedrs}
  */
  private addDefaultHeaders(req: any) {
    /**
     * TODO: Add all default Headers over here
     */

    if (!req.headers.has('Access-Control-Allow-Origin')) {
      req.headers = req.headers.set('Access-Control-Allow-Origin', '*');
    }

    if (!req.headers.has('Content-Type')) {
      req.headers = req.headers.set('Content-Type', 'application/json');
    } else if (req.headers.has('Content-Type') && (req.headers.get('Content-Type') === 'null')) {
      req.headers = req.headers.delete('Content-Type');
    }

    if (!req.headers.has('Accept')) {
      req.headers = req.headers.set('Accept', 'application/json');
    }

    if (!req.headers.has('Authorization')) {
      if (this.appProperties.appAuthenticationStrategy === 'basicAuth') {
        // user id and password hardcoded
        req.headers = req.headers.set('Authorization', 'Basic YmhpdmUtYXJ0LXByb3h5dXNlcjphcnRwcm94eUAxMzU3OSEjJSYoKQ==');
      } else if (this.appProperties.appAuthenticationStrategy === 'activeDirectory' ||
        this.appProperties.appAuthenticationStrategy === 'localAuth') {
        if (this.bSessionStorage.getValue('accessToken')) {
          req.headers = req.headers.set('Authorization', 'Bearer ' + this.bSessionStorage.getValue('accessToken'));
        }
      }
    }
    return req;
  }

  /**
   * Build API url.
   * @param url
   * @returns {string}
   */
  private getFullUrl(url: string): string {
    // return full URL to API here
    return url;
  }

  /**
   * Request interceptor.
   */
  private requestInterceptor(): void {
    this.bHTTPLoader.isHTTPRequestInProgress(true);
  }

  /**
   * Response interceptor.
   */
  private responseInterceptor(): void {
    this.bHTTPLoader.isHTTPRequestInProgress(false);
  }

  /**
    * Error handler.
    * @param error
    * @param caught
    * @returns {ErrorObservable}
    */
  private onCatch(error: HttpErrorResponse, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    console.log(error)
    if (error instanceof HttpErrorResponse) {
      if ((<HttpErrorResponse>error).status === 403 && (<HttpErrorResponse>error).error.message === 'jwt expired') {
        return this.updateToken(error, req, next);
      } else {
        return this.onSubscribeError(error);
      }
    } else {
      return this.onSubscribeError(error);
    }
  }

  /**
   * onSubscribeError
   * @param error
   */
  private onSubscribeError(err: HttpErrorResponse): Observable<any> {
    this.bHTTPLoader.alertError(err);
    return this.onCatchError(err);
  }
  /**
   * onFinally
   */
  private onFinally(): void {
    this.responseInterceptor();
  }

  private onCatchError(error: HttpErrorResponse): Observable<any> {
    return Observable.throw(error);
  }
}

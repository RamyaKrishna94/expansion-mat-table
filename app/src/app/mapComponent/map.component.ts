import { Component, AfterContentInit, ViewChild, HostListener, Input, Output, OnInit, EventEmitter} from '@angular/core';
import { MarkerOptions } from '@agm/core/services/google-maps-types';
import { AgmMap } from '@agm/core';
import { SystemService } from '../service/system.service';
declare var google;
@Component({
  selector: 'bhive-google-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class bhiveMapComponent implements AfterContentInit, OnInit {
  iconConfiguration;
  label;
  imageurl
  formattedAddress;
  geolocationPosition;
  systemService = new SystemService();
  @Output() gMapClick = new EventEmitter<any>();
  @Output() gMarkerClick = new EventEmitter<any>();
  @ViewChild(AgmMap) myMap: any;
  @Input('iconUrl') iconUrl: any;
  @Input('lat') lat;
  @Input('lng') lng;
  @Input('hideMarker') hideMarker;
  @Input('enableHighAccuracy') enableHighAccuracy;
  @Input('mapTimedout') mapTimedout;
  @Input('mapZoom') mapZoom;
  @Input('markerSize') markerSize;
  @Input('markerTraggerble') markerTraggerble;
  @Input('usePanning') usePanning;

  @ViewChild('infoWindow') infoWindow: any;
  @HostListener('window:resize')
  onWindowResize() {
    this.myMap.triggerResize().then(() => {
      if (this.lat && this.lng)
        this.myMap._mapsWrapper.setCenter({ lat: this.lat, lng: this.lng })
    });
  }
  ngOnInit() {
    this.hideMarker = this.hideMarker ? this.hideMarker : false;
    this.enableHighAccuracy = this.enableHighAccuracy ? this.enableHighAccuracy : false;
    this.mapTimedout = this.mapTimedout ? this.mapTimedout : 10000;
    this.mapZoom = this.mapZoom ? this.mapZoom : 20;
    this.markerSize = this.markerSize ? this.markerSize : 40;
    this.usePanning = this.usePanning ? this.usePanning : false;
    this.markerTraggerble = this.markerTraggerble ? this.markerTraggerble : false;
    this.getLocation();
  }
  constructor() {
  }
  markerEventEmitter(event) {
    this.gMarkerClick.emit(event);
  }
  getLocation() {
    const _this = this
    if (this.systemService.deviceType == 'browser') {
      navigator.geolocation.getCurrentPosition(locationSuccess);
    } else {
      getCurrentLocation();
    }
    function getCurrentLocation() {
      navigator.geolocation.getCurrentPosition(locationSuccess, locationError, { enableHighAccuracy: this.enableHighAccuracy, timeout: _this.mapTimedout });
    }
    function locationSuccess(position) {
      _this.lat = position.coords.latitude;
      _this.lng = position.coords.longitude;
      _this.getGeoLocation(_this.lat, _this.lng);
    }
    function locationError(error) {
      window['cordova'].plugins.diagnostic.isLocationEnabled(function (enabled) {
        if (enabled) {
        } else {
          window['cordova'].plugins.diagnostic.switchToLocationSettings();
          window['cordova'].plugins.diagnostic.registerLocationStateChangeHandler(function () {
            getCurrentLocation();
          });
        }
      }, function () {
      });
    }
  }
  ngAfterContentInit() {
    if (this.iconUrl) {
      this.imageDetect(this.iconUrl).then((url) => {
        this.updateImageUrl(url);
      }).catch(error => {
        //this.updateImageUrl(error);
      })
    } else {
      //this.updateImageUrl(null);
    }
  }
  marker(event) {
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;
    this.getGeoLocation(this.lat, this.lng);
  }
  getGeoLocation(lat: number, lng: number) {
    const _this = this;
    const latlng = new google.maps.LatLng(lat, lng);
    var geocoder = geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          _this.formattedAddress = true;
          _this.formattedAddress = results[1].formatted_address;
        } else {
          _this.formattedAddress = false;
        }
      } else {
        _this.formattedAddress = false;
      }
    });
  }
  mapClicked(event) {
    this.gMapClick.emit(event);
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;
    this.getGeoLocation(this.lat, this.lng);
  }
  imageDetect(url): Promise<any> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = url;
      image.onload = function () {
        resolve(url);
      }
      image.onerror = function () {
        reject(false);
      }
    })
  }
  updateImageUrl(url) {
    this.iconConfiguration = {
      url: url,
      scaledSize: {
        height: this.markerSize,
        width: this.markerSize
      }
    }
  }
}

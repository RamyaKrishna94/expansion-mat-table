import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { appRoutes } from './declarations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import 'hammerjs';
import { ChartsModule } from 'ng2-charts';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { BhiveFileModule } from 'app/file/file.module';
import { AgmCoreModule } from '@agm/core';
import { environment } from '../../environments/environment'


import {
  MatMenuModule, MatDialogModule, MatTabsModule, MatInputModule,
  MatSnackBarModule, MatTooltipModule, MatIconModule, MatToolbarModule, MatListModule,
  MatCardModule, MatSidenavModule, MatButtonModule, MatSelectModule, MatSlideToggleModule,
  MatButtonToggleModule, MatFormFieldModule, MatCheckboxModule, MatAutocompleteModule, MatDatepickerModule,
  MatRadioModule, MatSliderModule, MatStepperModule, MatExpansionModule, MatChipsModule, MatProgressSpinnerModule,
  MatProgressBarModule, MatTableModule, MatSortModule, MatPaginatorModule, MatGridListModule, MatNativeDateModule
} from '@angular/material';

/**
*imports for @NgModule
*/
export const appImportModules: any = [
  BrowserModule,
  FormsModule,
  BrowserAnimationsModule,
  FlexLayoutModule,
  RouterModule.forRoot(appRoutes),
  NgxChartsModule,
  ChartsModule,
  HttpModule,
  HttpClientModule,
  BhiveFileModule,
  /**
   * Angular material components
   */
  MatMenuModule,
  MatDialogModule,
  MatSnackBarModule,
  MatTooltipModule,
  MatIconModule,
  MatToolbarModule,
  MatCardModule,
  MatSidenavModule,
  MatTabsModule,
  MatInputModule,
  MatButtonModule,
  MatListModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatButtonToggleModule,
  MatFormFieldModule,
  MatCheckboxModule,
  MatAutocompleteModule,
  MatDatepickerModule,
  MatRadioModule,
  MatSliderModule,
  MatStepperModule,
  MatExpansionModule,
  MatChipsModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatGridListModule,
  MatNativeDateModule,

  AgmCoreModule.forRoot({
    apiKey: environment.properties.googleMapKey
  })
];

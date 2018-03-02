import { Type } from '@angular/core';
import { NgModule, ModuleWithProviders } from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { MatIconModule, MatButtonModule } from '@angular/material';

import { BHCameraDirective } from './directives/camera.directive';
import { BHDownloadDirective } from './directives/download.directive';
import { BHFileUploadComponent } from './file-upload/file-upload.component';
import { FileIOService } from './services/filesystem.service';

const BH_FILE: Type<any>[] = [
  BHCameraDirective,
  BHDownloadDirective,
  BHFileUploadComponent,
];

@NgModule({
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  declarations: [
    BH_FILE,
  ],
  exports: [
    BH_FILE,
  ],
  providers: [
    FileIOService
  ],
})
export class BhiveFileModule {

}

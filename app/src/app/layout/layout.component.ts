import { Component } from '@angular/core';
import { NotificationService } from '../service/notification.service';
import { SystemService } from '../service/system.service';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`
})
export class LayoutComponent {

  private systemService: SystemService = SystemService.getInstance();

  constructor(private notificationService: NotificationService) {
    if (this.systemService.deviceType != 'browser') {
      this.notificationService.enableNotification();
    }
  }
}

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'alert-dialog',
  templateUrl: './alert.template.html',
  styleUrls: ['./alert.style.scss']
})

export class AlertComponent {
  static title = '';
  static message = '';
  messageContent;
  titleContent;
  constructor(public dialogRef?: MatDialogRef<AlertComponent>) {
    this.messageContent = AlertComponent.message;
    this.titleContent = AlertComponent.title;
  }

}

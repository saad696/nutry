import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-alert-message',
  templateUrl: './alert-message.component.html',
  styleUrls: ['./alert-message.component.css'],
})
export class AlertMessageComponent implements OnInit {
  isVisiblle = true;

  @Input() alertType: number;
  @Input() alertMsg: string;
  // duration should be passed in miliseconds.
  @Input() set duration(value: number) {
    setTimeout(() => {
      this.isVisiblle = false;
    }, value);
  }

  //error types
  //  1: info
  //  2: success
  // 3: warning
  // 4: error

  constructor() {}

  ngOnInit(): void {}
}

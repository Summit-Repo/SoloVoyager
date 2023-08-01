import { Component } from '@angular/core';
import { Location } from '@angular/common';


@Component({
  selector: 'app-pagenotfound',
  templateUrl: './pagenotfound.component.html',
  styleUrls: ['./pagenotfound.component.scss']
})
export class PagenotfoundComponent {

  constructor(private location: Location) { }

  goBack() {
    this.location.back();
  }

  reLogin() {
    sessionStorage.removeItem('token')
  }
}

import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals'
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(private globals: Globals) { }

  ngOnInit() {
  }
  bookTicket() {
    var ticketId = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (var i = 0; i < 8; i++) {
      ticketId += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    sessionStorage.setItem('cruiseUserName', this.globals.userFirstName + ' ' + this.globals.userLastName);
    sessionStorage.setItem('cruiseTicketId', ticketId);
    sessionStorage.setItem('cruisePassport', this.globals.userPassport);
    return true;
  }
}

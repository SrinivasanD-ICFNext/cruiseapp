import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {
  journeyId: string;
  journeyFromDate: string;
  journeyUpTo: string;
  journeyCruise: string;
  journeyPrice: string;
  journeyTraveller: string;
  journeyTravellerPassport: string;
  expiryAlert: number;

  constructor() {
    this.journeyFromDate = sessionStorage.getItem('cruisePlanSt');
    this.journeyUpTo = sessionStorage.getItem('cruisePlanEd');
    this.journeyCruise = sessionStorage.getItem('cruisePlanShip');
    this.journeyPrice = sessionStorage.getItem('cruisePlanPrice');
    this.journeyId = sessionStorage.getItem('cruiseTicketId');
    this.journeyTraveller = sessionStorage.getItem('cruiseUserName');
    this.journeyTravellerPassport = sessionStorage.getItem('cruisePassport');
    this.expiryAlert = parseInt(sessionStorage.getItem('cruisePassportExpiry'));
  }

  ngOnInit() {
  }

}

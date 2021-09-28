import { Component, OnInit } from '@angular/core';
declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-dashboard-head',
  templateUrl: './dashboard-head.component.html',
  styleUrls: ['./dashboard-head.component.scss']
})
export class DashboardHeadComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    $("body").removeClass("sidebar-toggled");
    $(".sidebar").addClass("toggled");
    $('html, body').animate({
      scrollTop: 0
    }, 1000);
  }
  toggleTitle() {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
  }
}

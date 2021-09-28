import { Component, OnInit } from '@angular/core';

declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  showCruises: boolean;
  constructor() {
    (function (d) { d.fn.shuffle = function (c) { c = []; return this.each(function () { c.push(d(this).clone(true)) }).each(function (a, b) { d(b).replaceWith(c[a = Math.floor(Math.random() * c.length)]); c.splice(a, 1) }) }; d.shuffle = function (a) { return d(a).shuffle() } })($);
  }

  ngOnInit() {
    if($('body').hasClass('bg-dark')==false)
      $('body').addClass('bg-dark');
      console.log($('body').hasClass('bg-dark'))
    $("#dtBox").DateTimePicker(
      {
        dateFormat: "dd-MMM-yyyy",
        afterShow() {
          $(".dtpicker-buttonCont a").css('color', 'white');
        },
        settingValueOfElement(sInputValue, dDateTime, oInputElement) {
          /*if ($(oInputElement).attr('id') == 'fromDate') {
            sessionStorage.setItem('cruisePlanSt', sInputValue)
          } else if ($(oInputElement).attr('id') == 'fromDate') {
            sessionStorage.setItem('cruisePlanEd', sInputValue)
          }*/
        }
      });
  }
  selectCruise($event, $this){

    var datePattern = /([0-2][0-9]|(3)[0-1])(-)(((0)[0-9])|((1)[0-2]))(-)(\d{4})(\s)([0-5][0-9])(:)([0-5][0-9])/i;
    var stDate = $('#fromDate').val().match(datePattern);
    var edDate = $('#toDate').val().match(datePattern);
    if (stDate && edDate) {
      var shipName = "";
      var tripCost ="";
      if($($event.srcElement).hasClass('card-footer')){
        shipName = $($event.srcElement).prev(".card-body").find('.trip-name').text();
        tripCost = $($event.srcElement).prev(".card-body").find('.trip-price').text();
      }else{
        shipName = $($event.srcElement).parent().prev(".card-body").find('.trip-name').text();
        tripCost = $($event.srcElement).parent().prev(".card-body").find('.trip-price').text();
      }
      sessionStorage.setItem('cruisePlanShip', shipName);
      sessionStorage.setItem('cruisePlanPrice', tripCost);
      sessionStorage.setItem('cruisePlanSt', $('#fromDate').val());
      sessionStorage.setItem('cruisePlanEd', $('#toDate').val());
      return true;
    }else{
      $('#errorBody').text('Please choose your Journey Dates');
      $('#errorModal').modal('show');
    }
  }
  filterCruise() {
    var datePattern = /([0-2][0-9]|(3)[0-1])(-)(((0)[0-9])|((1)[0-2]))(-)(\d{4})(\s)([0-5][0-9])(:)([0-5][0-9])/i;
    var stDate = $('#fromDate').val().match(datePattern);
    var edDate = $('#toDate').val().match(datePattern);
    if (stDate && edDate) {
      this.showCruises = true;
      $(".cruiseList .row .col-xl-3").shuffle("slow");
      $(".cruiseList .row").each(function () {
        if ($(this).find(".col-xl-3").length > 3) {
          $(this).find(".col-xl-3").eq($(this).index()).fadeOut("slow", function () {
            $(this).remove();
          });
        }
      });
    }else{
      $('#errorBody').text('Please choose your Journey Dates');
      $('#errorModal').modal('show');
    }
  }
}

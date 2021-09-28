import { element } from 'protractor';
import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { Globals } from '../globals';

declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss']
})
export class ScannerComponent implements OnInit {
  selectedFile: File[];
  percentDone: number;
  percentDoneStr: string;
  uploadSuccess: boolean;
  scanStatus: boolean;
  loadProfile: boolean;
  abortProcess: boolean;
  showProgress: boolean;
  imgPreview: boolean;
  fileReader: FileReader;
  base64Encoded: string;
  xhr: XMLHttpRequest;
  OCRParseText: string;
  journeyFromDate:string;
  journeyUpTo:string;
  journeyCruise:string;
  journeyPrice:string;
  
  constructor(private globals: Globals, private http: HttpClient) {
    this.journeyFromDate = sessionStorage.getItem('cruisePlanSt');
    this.journeyUpTo = sessionStorage.getItem('cruisePlanEd');
    this.journeyCruise = sessionStorage.getItem('cruisePlanShip');
    this.journeyPrice = sessionStorage.getItem('cruisePlanPrice');
    this.percentDone = 0;
    this.percentDoneStr = "0%";
  }

  ngOnInit() { }

  onFileChanged(event) {
    this.selectedFile = event.target.files;
    $(".passport").parents('.input-group').find(':text').val(event.target.files[0].name);
  }

  checkMyDatesAllowed(startDate, endDate,  expiry) {
    if (expiry >= startDate && expiry >= endDate) {
      return true;
    }
    else     
     return false;
  }

  onUpload($event) {
    $event.preventDefault();
    if (typeof this.selectedFile != "undefined") {
      this.showProgress = true;
      this.abortProcess = true;
      this.uploadSuccess = false;
      $("#uploadButton").prepend('<i class="fa fa-spinner fa-spin"></i>&nbsp;');
      $("#uploadButton").prop('disabled', 'true');
      $('html, body').animate({
        scrollTop: $("#progressTop").offset().top
      }, 2000);
      this.uploadAndProgress(this.selectedFile);
    } else {
      $('#errorBody').text('Please select the file to upload');
      $('#errorModal').modal('show');
    }
  }
  resetUpload(msgbypass) {
    this.abortProcess = false;
    this.showProgress = false;
    this.uploadSuccess = false;
    this.percentDone = 0;
    this.percentDoneStr = "0%";
    this.scanStatus = false
    $('#uploadButton').text("Upload");
    $('#uploadButton i').remove();
    $("#uploadButton").removeAttr("disabled");
    if (!msgbypass) {
      $('#errorBody').text('Unable to process this action now, please try again later.');
      $('#errorModal').modal('show');
    }
  }
  uploadAndProgress(files: File[]) {
    var formData = new FormData();
    Array.from(files).forEach(f => formData.append('file', f))
    formData.append('upload_preset', 'ocr-images');
    formData.append('cloud_name', 'srinivasand-icf');
    var _this = this;
    this.http.post('https://api.cloudinary.com/v1_1/srinivasand-icf/image/upload', formData, { reportProgress: true, observe: 'events' })
      .subscribe(
        (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.percentDone = Math.round(100 * event.loaded / event.total);
            this.percentDoneStr = this.percentDone.toString() + "%";
            $('#progressMeter').css("width", _this.percentDoneStr);
            if(this.percentDone ==100)
              this.percentDoneStr = "Almost done..";
          } else if (event instanceof HttpResponse) {
            var result = event.body;
            if (String(event['ok']) == 'true') {
              var xhr = new XMLHttpRequest();
              xhr.onload = function () {
                var reader = new FileReader();
                reader.onloadend = function () {
                  _this.base64Encoded = reader.result.toString();
                  _this.percentDone = 100;
                  _this.percentDoneStr = _this.percentDone.toString() + "%";
                  $('#progressMeter').css("width", _this.percentDoneStr);
                  _this.imgPreview = true;
                  _this.scanStatus = true;
                  _this.uploadSuccess = true;
                  $('#uploadButton i').remove();
                  $('#uploadButton').text("Recognizing Data");
                  $("#uploadButton").append('&nbsp;<i class="fa fa-cog fa-spin"></i>');
                  $('html, body').animate({
                    scrollTop: $("#previewTop").offset().top
                  }, 2000);
                  console.log('call OCR');
                  _this.getOCRData();
                }
                reader.readAsDataURL(xhr.response);
              };
              xhr.open('GET', result['url']);
              xhr.responseType = 'blob';
              xhr.send();
            }
          }
        },
        (err) => {
          this.resetUpload(true);
          console.log(err)
        });
  }
  getOCRData() {
    var formData = new FormData();
    //formData.append('apikey', '273ed2d3bf88957');
    formData.append('apikey', '2b3c7276dd88957');
    formData.append('language', 'eng')
    formData.append('isOverlayRequired', 'true')
    formData.append('base64Image', this.base64Encoded)
    this.http.post("https://api.ocr.space/parse/image", formData)
      .subscribe((res) => {
        console.log(res);
        if (res) {
          if (res['ParsedResults'] != null) {
            console.log(res['ParsedResults']);
            console.log(res['ParsedResults'][0]);
            console.log(res['ParsedResults'][0]['ParsedText']);
            this.OCRParseText = res['ParsedResults'][0]['ParsedText'];
            this.scanStatus = false;
            var verified = this.verifyDocument();
            this.resetUpload(true);
            if(verified){
              this.loadProfile = true;
              $('html, body').animate({
                scrollTop: $("#profileTop").offset().top -150
              }, 2000);
            }
          } else {
            this.resetUpload(false);
          }
        } else {
          this.resetUpload(false);
          console.log('OCR failed to detect text.Please try again');
        }
      },
        (err) => {
          this.resetUpload(false);
          console.log(err);
        });
  }
  verifyDocument() {
    /* passport expiry flag*/
    sessionStorage.setItem('cruisePassportExpiry','0');
    var status;
    var parsedText = this.OCRParseText.toString();
    /****** DL verfification  *******/
    var dl_verify1 = parsedText.toString().match(/driv/i);
    var pass_verify1 = parsedText.toString().match(/republic/i);
    var pass_intl = parsedText.toString().match(/INTERNATIONAL PASSPORT/i);
    var _this = this;
    if (pass_intl) {
      console.log("International Passport verified")
      var array = parsedText.split("\n");
      var passFNfound = false;
      var passLNfound = false;
      var passAddressFound = false;
      var passDOBFound = false;
      var passNumFound = false;
      var passExpFound = false;

      
      array.forEach(function (element, key) {
        var passFN = element.toString().match(/S.R NAME/i);
        var passLN = element.toString().match(/GIVEN NAMES/i);
        var passExpiry = element.toString().match(/DATE OF EXPIRY/i);
        var passNum = element.toString().match(/PASSPORT No./i);
        var passDOB = element.toString().match(/DATE OF BIRTH/i);
        var passAddress = element.toString().match(/PLACE OF BIRTH/i);
        if (passFN && !passFNfound) {
          _this.globals.userFirstName = array[key + 1].trim();
          console.log("PFN " + _this.globals.userFirstName);
          passFNfound = true;
        }
        if (passLN && !passLNfound) {
          _this.globals.userLastName = array[key + 1].trim();
          console.log("PLN " + _this.globals.userLastName);
          passLNfound = true;
        }
        if (passNum && !passNumFound) {
          _this.globals.userPassport = array[key + 1].replace(" ","");
          console.log("PN " + _this.globals.userPassport);
          passNumFound = true;
        }
        if (passDOB && !passDOBFound) {
          _this.globals.userDOB = array[key + 1].replace(" ","");
          console.log("PDOB " + _this.globals.userDOB);
          passDOBFound = true;
        }
        if(passExpiry && !passExpFound){
          var expiry = _this.convertDate(array[key + 1].replace(" ",""));
          var sDate = _this.convertDate(sessionStorage.getItem('cruisePlanSt'));
          var eDate = _this.convertDate(sessionStorage.getItem('cruisePlanEd'));
          if(!_this.checkMyDatesAllowed(sDate,eDate,expiry))
          {
            sessionStorage.setItem('cruisePassportExpiry','1');
            $('#errorBody').text('Please renew your passport, before journey');
            $('#errorModal').modal('show');
          }
          console.log("PExp " + sDate);
          console.log("PExp " + eDate);
          console.log("PExp " + expiry);
          passExpFound = true;
        }
        if (passAddress && !passAddressFound) {
          _this.globals.userAddress = array[key + 1].trim();
          console.log("PAd " + _this.globals.userAddress);
          passAddressFound =true;
        }
      });
      status = true;
    }
    else if (dl_verify1) {
      console.log("DL verified")
      var array = parsedText.split("\n");
      //console.log(array);
      /*array.forEach(element => {
        var str = element.replace(/[^0-9]/g, "");
        //console.log(str.length);
        if (str.length == 9) {
          //if (!isNaN(str))
            this.globals.userLicense = str;
            console.log("DL "+this.globals.userLicense);
        }
      });*/
      var dlNumKey = -1;
      var dlAddressStKey = -1;
      var dlAddressEdKey = -1;
      var dlFNfound = false;
      var dlLNfound = false;
      var dlAddressFound = false;
      var dlDOBFound = false;
      var dlNumFound = false;
      array.forEach(function (element, key) {
        var dlNum = element.replace(/[^0-9]/g, "");
        var dlLname = element.toString().match(/S\/D\/W/i);
        var dlAddress = element.toString().match(/Address/i);
        var dlDOB = element.toString().match(/D\.O\.B/i);
        if (dlLname && !dlLNfound) {
          _this.globals.userLastName = element.substr(element.lastIndexOf(":") + 1).toString().trim();
          console.log("LN " + _this.globals.userLastName);
          dlLNfound = true;
        }
        if (dlAddress) {
          dlAddressStKey = key+1;
        }
        if (dlDOB && !dlDOBFound) {
          dlAddressEdKey = key;
          _this.globals.userDOB = element.substr(element.lastIndexOf(":") + 1).toString().trim();
          console.log("DOB " + _this.globals.userDOB);
          dlDOBFound = true;
        }
        if (dlNum.length == 9 && !dlNumFound) {
          //if (!isNaN(str))
          _this.globals.userLicense = dlNum;
          dlNumKey = key;
          console.log("DL " + _this.globals.userLicense);
          dlNumFound = true;
        }
        if (dlNumKey != -1 && !dlFNfound) {
          _this.globals.userFirstName = array[key + 1].trim();
          console.log("FN " + _this.globals.userFirstName);
          dlFNfound = true;
        }
        if (dlAddressStKey != -1 && dlAddressEdKey != -1 && dlAddressStKey < dlAddressEdKey && !dlAddressFound) {
          var pointer = dlAddressStKey;
          var AdString = "";
          while (pointer < dlAddressEdKey) {
            AdString += array[pointer].toString().trim();
            pointer++;
          }
          _this.globals.userAddress = AdString;
          console.log("Ad " + _this.globals.userAddress);
          dlAddressFound = true;
        }
      });
      status = true;
    }
    else if (pass_verify1) {
      console.log("Passport verified")
      var array = parsedText.split("\n");
      var passNamesfound = false;
      var passAddressFound = false;
      var passDOBFound = false;
      var passNumFound = false;
      /*array.forEach(element => {
        var str = element.replace(/[^0-9]/g, "");
        console.log(element)
        //console.log(str);
        //console.log(str.length);
        if (str.length == 7) {
          this.globals.userPassport = element[0].toUpperCase() + ' ' + str;
          console.log("PN "+this.globals.userPassport);
        }
      });*/
      
      array.forEach(function (element, key) {
        var passNum = element.replace(/[^0-9]/g, "");
        var passDOB = element.toString().match(/expiry/i);
        var passAddress = element.toString().match(/p.ace of birth/i);
        var passNation = element.toString().match(/indian/i);
        //console.log(str);
        //console.log(str.length);
        if (passNum.length == 7 && !passNumFound) {
          _this.globals.userPassport = element[0].toUpperCase() + ' ' + passNum;
          console.log("PN " + _this.globals.userPassport);
          passNumFound =true;
        }
        if (passDOB && !passDOBFound) {
          _this.globals.userDOB = array[key - 1].trim();
          var expiry = _this.convertDate(array[key + 1].trim());
          var sDate = _this.convertDate(sessionStorage.getItem('cruisePlanSt'));
          var eDate = _this.convertDate(sessionStorage.getItem('cruisePlanEd'));
          if(!_this.checkMyDatesAllowed(sDate,eDate,expiry))
          {
            sessionStorage.setItem('cruisePassportExpiry','1');
            $('#errorBody').text('Please renew your passport, before journey');
            $('#errorModal').modal('show');
          }
          console.log("PDOB " + _this.globals.userDOB);
          console.log("PExp " + expiry);
          passDOBFound =true;
        }
        if (passAddress && !passAddressFound) {
          _this.globals.userAddress = array[key + 1].trim();
          console.log("PAd " + _this.globals.userAddress);
          passAddressFound =true;
        }
        if (passNation && !passNamesfound) {
          _this.globals.userFirstName = array[key -1].trim();
          _this.globals.userLastName = array[key -2].trim();
          console.log("PFN " + _this.globals.userFirstName);
          console.log("PLN " + _this.globals.userLastName);
          passNamesfound =true;
        }
      });
      status = true;
    }
    else {
      $('#errorBody').text('We not able to recognize your document, please try with different.');
      $('#errorModal').modal('show');
      status =false;
    }
    return status;
  }
  convertDate(dateStr){
    var dateStrArr = dateStr.split("");
    var date = parseInt(dateStrArr[0]+dateStrArr[1]);
    var month = parseInt(dateStrArr[3]+dateStrArr[4]);
    var year = parseInt(dateStrArr[6]+dateStrArr[7]+dateStrArr[8]+dateStrArr[9]);
    return new Date(year,month-1,date);
  }
}

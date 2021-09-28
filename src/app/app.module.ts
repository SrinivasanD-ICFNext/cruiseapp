import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { DashboardHeadComponent } from './dashboard-head/dashboard-head.component';
import { DashboardFootComponent } from './dashboard-foot/dashboard-foot.component';
import { ScannerComponent } from './scanner/scanner.component';
import { HttpClientModule } from '@angular/common/http';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RegisterComponent } from './register/register.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { ProfileComponent } from './profile/profile.component';
import { TicketComponent } from './ticket/ticket.component';
import { Globals } from './globals';
declare var jquery: any;
declare var $: any;
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    DashboardHeadComponent,
    DashboardFootComponent,
    ScannerComponent,
    ResetPasswordComponent,
    RegisterComponent,
    WelcomeComponent,
    ProfileComponent,
    TicketComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule
  ],
  providers: [Globals],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(){
    if(!$('body').hasClass('bg-dark'))
      $('body').addClass('bg-dark');
  }
}
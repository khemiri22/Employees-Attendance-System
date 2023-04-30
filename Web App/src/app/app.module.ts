import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';
import { environment } from 'src/environments/environment';


import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ForgetPAsswordComponent } from './forget-password/forget-password.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HomeComponent } from './home/home.component';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';
import { HeaderComponent } from './header/header.component';
import { RegisterComponent } from './register/register.component';
import { VerifyMailComponent } from './verify-mail/verify-mail.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AttendanceHistoryComponent } from './attendance-history/attendance-history.component';
import { WorkStateComponent } from './work-state/work-state.component';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { ProfileComponent } from './profile/profile.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { AttendanceReportComponent } from './attendance-report/attendance-report.component';
import { OrderModule } from 'ngx-order-pipe';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { ToastrModule } from 'ngx-toastr';
import { EmployeesManagerComponent } from './employees-manager/employees-manager.component';





@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ForgetPAsswordComponent,
    SideBarComponent,
    HomeComponent,
    DashboardMainComponent,
    HeaderComponent,
    RegisterComponent,
    VerifyMailComponent,
    NotFoundComponent,
    AttendanceHistoryComponent,
    WorkStateComponent,
    ProfileComponent,
    AttendanceReportComponent,
    EmployeesManagerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    OrderModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

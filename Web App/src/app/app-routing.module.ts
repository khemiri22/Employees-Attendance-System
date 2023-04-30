import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceHistoryComponent } from './attendance-history/attendance-history.component';
import { AttendanceReportComponent } from './attendance-report/attendance-report.component';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';
import { EmployeesManagerComponent } from './employees-manager/employees-manager.component';
import { ForgetPAsswordComponent } from './forget-password/forget-password.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuardService } from './services/guard/authGuard.service';
import { NoAuthGuardService } from './services/guard/no-auth-guard.service';
import { VerifyMailComponent } from './verify-mail/verify-mail.component';
import { WorkStateComponent } from './work-state/work-state.component';

const routes: Routes = [
  {path:'',redirectTo:'login',pathMatch:'full'},
  {path:'login',component:LoginComponent,canActivate:[NoAuthGuardService]},
  {path:'forgetPass',component:ForgetPAsswordComponent,canActivate:[NoAuthGuardService]},
  {path:'home',component:HomeComponent},
  {path:'register',component:RegisterComponent,canActivate:[NoAuthGuardService]},
  {path:'verify-mail',component:VerifyMailComponent,canActivate:[NoAuthGuardService]},
  {path:'home',component:HomeComponent,canActivate:[AuthGuardService],children:[
    {path:'dashboard-main',component:DashboardMainComponent},
    {path:'attendance-history',component:AttendanceHistoryComponent},
    {path:'work-state',component:WorkStateComponent},
    {path:'profile',component:ProfileComponent},
    {path:'attendance-report',component:AttendanceReportComponent},
    {path:'employees-manager',component:EmployeesManagerComponent}

  ]},
  {path:'**',component:NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

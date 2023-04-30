import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuardService {


  constructor(private as:AuthService,private route:Router,private fa:AngularFireAuth) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> 
  {
    return new Promise(resolve=>{
      this.as.user.subscribe(async user=>{
        if(!user){
          resolve(true)
        }else{
          this.route.navigate(['home/dashboard-main'])
          resolve(false)
        }
      })
    })
  }
}

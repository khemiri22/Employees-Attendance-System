import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private as:AuthService,private route:Router,private fa:AngularFireAuth) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> 
  {
    return new Promise(resolve=>{
      this.as.user.subscribe(async user=>{
        if(user){
          resolve(true)
        }
        else{
          this.route.navigate([''])
          resolve(false)
        }
      
    })
  }
    )
}
}

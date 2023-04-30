import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user:Observable<any>
  constructor(private fa:AngularFireAuth,private route:Router) { 
    this.user=this.fa.user
  }

  signUp(email:any,password:any){

    return this.fa.createUserWithEmailAndPassword(email,password)

  }

  signIn(email:any,password:any){
    return this.fa.signInWithEmailAndPassword(email,password)
  }

  forgetPassword(email:any){
     return this.fa.sendPasswordResetEmail(email)
  
  }
  async verifEmail(){
    return (await this.fa.currentUser)?.sendEmailVerification()
   }
}

import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  passwordType:string='password'
  messageError:any
  verifyNeed:any
  constructor(private sa:AuthService,private route:Router,private fa:AngularFireAuth) { }

  ngOnInit(): void {
  }

  login(f:any){
    let data =f.value
    this.sa.signIn(data.email,data.password).then(async (user:any)=>{
      if((await this.fa.currentUser)?.emailVerified==true){ 
      localStorage.setItem('connectedUser',user.user?.uid)
      this.route.navigate(['home'])
      }
      else{
        this.verifyNeed='You need to verify your email before '
        this.logout()
      }
    })
    .catch(()=>{
      this.messageError="Incorrect email or password !"
    })
  }

  logout(){
    this.fa.signOut().then(()=>{
      localStorage.removeItem("connectedUser")
      //this.route.navigate([''])
    }).catch(()=>{
    })
  }





  showPassword($event:any){
    if($event.target.checked)
    {
      this.passwordType='text'

    } 
    else{
      this.passwordType='password'
    }

  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPAsswordComponent implements OnInit {
  messageError:string=''
  messagePassed:string=''
  constructor(private sa:AuthService,private route:Router) { }

  ngOnInit(): void {
  }


  forgetPassword(f:any){
    let email=f.value.email
    this.sa.forgetPassword(email).then(()=>{
      email=''
      this.messagePassed='Check your email now !'
      this.messageError=''
      setTimeout(()=>{this.route.navigate([''])}, 3000)
      
       
    })
    .catch(()=>{
      this.messageError="Please verify your email !"
      this.messagePassed=''
    })
    
    
  }
}

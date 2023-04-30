import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-mail',
  templateUrl: './verify-mail.component.html',
  styleUrls: ['./verify-mail.component.css']
})
export class VerifyMailComponent implements OnInit{

  constructor(private route:Router,private fa:AngularFireAuth) { }

  ngOnInit(): void {
    //setTimeout(()=>{this.logout()}, 5000)
  }


  logout(){
    this.fa.signOut().then(()=>{
      localStorage.removeItem("connectedUser")
    })
  }
}

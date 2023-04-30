import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  constructor(private route:Router,private af:AngularFireAuth) { }

  ngOnInit(): void {
  }

  logout(){
    this.af.signOut().then(()=>{
      localStorage.removeItem("connectedUser")
      //this.route.navigate([''])
    })
  }
}

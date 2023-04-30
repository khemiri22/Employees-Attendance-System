import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user:any
  companyName:any
  constructor(private fs:AngularFirestore) { 
    this.user=localStorage.getItem('connectedUser')
  }
  ngOnInit(): void {
    this.fs.collection('Admin').ref.doc(this.user).get().then((data:any)=>{
      this.companyName=data.data()['company'].toUpperCase()
    })
  }

}

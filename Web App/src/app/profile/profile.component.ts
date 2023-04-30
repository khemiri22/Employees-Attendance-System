import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user:any
  successUpdate:any
  profileObject={
    firstName:'',
    lastName:'',
    email:'',
    phone:'',
    company:'',
    birthDay:'',
    entryTime1:'',
    entryTime2:'',
    exitTime1:'',
    exitTime2:''
  }
  constructor(private fs:AngularFirestore,private route:Router) { 
    this.user=localStorage.getItem('connectedUser')
  }

  ngOnInit(): void {
    this.getProfile()
  }

  getProfile(){
    this.fs.collection('Admin').ref.doc(this.user).get().then((data:any)=>{
      this.profileObject.firstName=data.data()['firstName']
      this.profileObject.lastName=data.data()['lastName']
      this.profileObject.email=data.data()['email']
      this.profileObject.phone=data.data()['phone'].substring(5)
      this.profileObject.company=data.data()['company']
      this.profileObject.birthDay=data.data()['birthDay']
      this.profileObject.entryTime1=data.data()['entryTime1']
      this.profileObject.entryTime2=data.data()['entryTime2']
      this.profileObject.exitTime1=data.data()['exitTime1']
      this.profileObject.exitTime2=data.data()['exitTime2']
      
    })
  }


  updateProfile(){
    if(this.profileObject.firstName.length!=0){this.fs.collection('Admin').doc(this.user).update({firstName:this.profileObject.firstName})}
    if(this.profileObject.lastName.length!=0){this.fs.collection('Admin').doc(this.user).update({lastName:this.profileObject.lastName})}
    if(this.profileObject.phone.length==8){this.fs.collection('Admin').doc(this.user).update({phone:"+216 "+this.profileObject.phone})}
    if(this.profileObject.company.length!=0){this.fs.collection('Admin').doc(this.user).update({company:this.profileObject.company})}
    this.fs.collection('Admin').doc(this.user).update(
      {
      entryTime1:this.profileObject.entryTime1,
      entryTime2:this.profileObject.entryTime2,
      exitTime1:this.profileObject.exitTime1,
      exitTime2:this.profileObject.exitTime2,

    })
    this.route.navigate(['home'])
  }

  numberOnly(event:any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  
  }

}

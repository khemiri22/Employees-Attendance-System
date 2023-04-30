import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit ,OnDestroy{
  alreadyExist:any=''
  constructor(private sa:AuthService,private fs:AngularFirestore,private route:Router,private fa:AngularFireAuth) { }
  ngOnDestroy(): void {
    this.logout()
  }

  ngOnInit(): void {
  }


  register(f:any){
    let data =f.value
    this.sa.signUp(data.email,data.password).then((user:any)=>{
      this.sa.verifEmail().then(()=>{
        this.fs.collection("Admin").doc(user.user?.uid).set({
          admin_id:user.user?.uid,
          phone:'+216 '+data.phone,
          firstName:data.firstName,
          lastName:data.lastName,
          company:data.company,
          birthDay:data.birthDay,
          email:data.email,
          entryTime1:data.entryTime1,
          entryTime2:data.entryTime2,
          exitTime1:data.exitTime1,
          exitTime2:data.exitTime2
        }).then((user:any)=>{
          this.route.navigate(['/verify-mail'])
          
        })
      }
      )
      
    }
    ).catch(()=>{
      this.alreadyExist='This account is already exist, login !'

    }
    )

    
  }

  numberOnly(event:any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }


  logout(){
    this.fa.signOut().then(()=>{
      localStorage.removeItem("connectedUser")
    })
  }
}

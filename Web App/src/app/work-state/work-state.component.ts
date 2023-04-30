import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {AngularFireDatabase} from '@angular/fire/compat/database'
import { ToastrService } from 'ngx-toastr';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-work-state',
  templateUrl: './work-state.component.html',
  styleUrls: ['./work-state.component.css']
})
export class WorkStateComponent implements OnInit,OnDestroy {
  workTimeObject={
    entry1:'',
    entry2:'',
    exit1:'',
    exit2:''
  }
  getEmployeesObservable:Subscription | undefined
  EmplyeesNowList:any
  currentDate = new Date();
  user:any
  constructor(private db:AngularFireDatabase,private toastr:ToastrService,private fs:AngularFirestore ) {
    this.user=localStorage.getItem('connectedUser')
   }
  ngOnDestroy(): void {
    this.getEmployeesObservable?.unsubscribe()
  }

  ngOnInit(): void {
    this.getAllEmployeesNew()
  }


  getAllEmployeesNew(){
    this.getWorkTime().then(()=>{
      this.getEmployeesObservable=this.db.list("Employees").snapshotChanges().subscribe(data=>{
        this.EmplyeesNowList=data.map((e:any)=>{
          let nowentry1:string=e.payload.val()['dateEntry1']
          let nowentry2:string=e.payload.val()['dateEntry2']
          let nowexit1:string=e.payload.val()['dateExit1']
          let nowexit2:string=e.payload.val()['dateExit2']
          let LATE1:String
          let LATE2:String
          let EARLY1:String
          let EARLY2:String
          LATE1=this.lateCalcul(nowentry1,this.workTimeObject.entry1)
          LATE2=this.lateCalcul(nowentry2,this.workTimeObject.entry2)
          EARLY1=this.earlyCalcul(nowexit1,this.workTimeObject.exit1)
          EARLY2=this.earlyCalcul(nowexit2,this.workTimeObject.exit2)
          return{
            cin:e.key,
            name:e.payload.val()['name'],
            entry1:e.payload.val()['dateEntry1'],
            entry2:e.payload.val()['dateEntry2'],
            exit1:e.payload.val()['dateExit1'],
            exit2:e.payload.val()['dateExit2'],
            late1:LATE1,
            late2:LATE2,
            early1:EARLY1,
            early2:EARLY2
          }
        })
      })
    })
  }

  getWorkTime(){

    return this.fs.collection('Admin').ref.doc(this.user).get().then((data:any)=>{
      this.workTimeObject.entry1=data.data()['entryTime1'],
      this.workTimeObject.entry2=data.data()['entryTime2'],
      this.workTimeObject.exit1=data.data()['exitTime1'],
      this.workTimeObject.exit2=data.data()['exitTime2']
    })
  }

  lateCalcul(now:any,workTime:any):string{
    let nowHours:number=+now.substring(0,2)
    let nowMinutes:number=+now.substring(3,5)
    let workTimeHours:number=+workTime.substring(0,2)
    let workTimeMinutes:number=+workTime.substring(3,5)
    let late :number=((nowHours*60)+nowMinutes)-((workTimeHours*60)+workTimeMinutes)
    if (late>59){
      let hours:number=late/60
      let minutes:number=late%60
      if(hours.toString().charAt(1)!='.'){
      return hours.toString().substring(0,2)+"H&"+minutes.toString()+"Minutes" }
      
      else{
        return hours.toString().substring(0,1)+"H&"+minutes.toString()+"Minutes"
      }
    }
    else{
      return late.toString()+"Minutes"
    }
  }


  earlyCalcul(now:any,workTime:any):string{
    let nowHours:number=+now.substring(0,2)
    let nowMinutes:number=+now.substring(3,5)
    let workTimeHours:number=+workTime.substring(0,2)
    let workTimeMinutes:number=+workTime.substring(3,5)
    let early :number=((workTimeHours*60)+workTimeMinutes)-((nowHours*60)+nowMinutes)
    if (early>59){
      let hours:number=early/60
      let minutes:number=early%60
      if(hours.toString().charAt(1)!='.'){
      return hours.toString().substring(0,2)+"H&"+minutes.toString()+"Minutes" }
      else{
        return hours.toString().substring(0,1)+"H&"+minutes.toString()+"Minutes"
      }
    }
    else{
      return early.toString()+"Minutes"
    }
  }
}

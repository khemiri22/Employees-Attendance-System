import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireDatabaseModule, DatabaseSnapshot, SnapshotAction } from '@angular/fire/compat/database';
import { AngularFirestore, AngularFirestoreDocument, DocumentData } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit,OnDestroy {
  getEmployeesCardObservable:Subscription | undefined
  whoComes={
    cin:'',
    name:'',
    img:''
  }
  user:any
  workTimeObject={
    entry1:'',
    entry2:'',
    exit1:'',
    exit2:''
  }
  getDoneMessageObservable:Subscription | undefined
  getEmployeesStatusObservable:Subscription | undefined
  constructor(private route:Router,private toastr: ToastrService,private db:AngularFireDatabase,private fs:AngularFirestore) {
    this.user=localStorage.getItem('connectedUser')
   }
  ngOnDestroy(): void {
    this.getDoneMessageObservable?.unsubscribe()
    this.getEmployeesStatusObservable?.unsubscribe()
    this.getEmployeesCardObservable?.unsubscribe()
  }

  ngOnInit(): void {
    this.route.navigate(['home/dashboard-main'])
    this.employeesStatus()
    this.lastMarkedAttendanceCard()
    this.doneTrainingModelObserve()
    
  }

  doneTrainingModelObserve(){
    this.getDoneMessageObservable=this.db.object("sync/done").snapshotChanges().subscribe(e=>{
      if(e.payload.val()==1){
        this.toastr.success("YOU CAN ADD OR DELETE OTHER EMLOYEES NOW !",'UPDATED !',{
          timeOut:10000,
          positionClass:'toast-bottom-right',
        })
        this.db.object('sync').update({done:0})
        
      }
      
    })
  }


  employeesStatus(){
    this.getWorkTime().then(()=>{
      this.getEmployeesStatusObservable=this.db.list("Employees").snapshotChanges().subscribe(data=>{
        data.forEach((e:any)=>{
          let textToToastLate:any
          let textToToastEarly:any
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
          if(LATE1.charAt(0)!=='-' && LATE1.charAt(0)!=='0' && nowentry1!=='' && nowentry2==='' && nowexit1==='' && nowexit2!=='' )
          {
            textToToastLate=LATE1
          }
          else if(LATE2.charAt(0)!=='-' && LATE2.charAt(0)!=='0' && nowentry1!=='' && nowentry2!=='' && nowexit1!=='' && nowexit2==='' )
          {
            textToToastLate=LATE2
          }
          else if(EARLY1.charAt(0)!=='-' && EARLY1.charAt(0)!=='0' && nowentry1!=='' && nowentry2==='' && nowexit1!=='' && nowexit2==='' )
          {
            textToToastEarly=EARLY1
          }
          else if(EARLY2.charAt(0)!=='-' && EARLY2.charAt(0)!=='0' && nowentry1!=='' && nowentry2!=='' && nowexit1!=='' && nowexit2!=='' )
          {
            textToToastEarly=EARLY2
          }
          if(textToToastEarly){
          this.toastr.warning(e.payload.val()['name'].toUpperCase()+" EARLY EXIT TODAY FOR "+textToToastEarly+" !",'EARLY !',{
            timeOut:6000,
            positionClass:'toast-bottom-right'
          })}
          if(textToToastLate){
          this.toastr.warning(e.payload.val()['name'].toUpperCase()+" IS LATE TODAY FOR "+textToToastLate+" !",'LATE !',{
            timeOut:6000,
            positionClass:'toast-bottom-right'
          })}
  
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












lastMarkedAttendanceCard(){
  this.getEmployeesCardObservable=this.db.list("Employees").stateChanges().subscribe(async (data:any)=>{
    let id=data.payload.key
   await this.fs.collection('Employees').ref.doc(id).get().then((e:any)=>{
      this.whoComes.cin=e.id
      this.whoComes.name=e.data()['name']
      this.whoComes.img=e.data()['image']
    })
  })

  
 
}

}

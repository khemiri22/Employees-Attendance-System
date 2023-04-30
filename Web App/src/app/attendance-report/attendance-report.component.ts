import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Subscription } from 'rxjs';
import * as XLSX from "xlsx"

@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.css']
})
export class AttendanceReportComponent implements OnInit,OnDestroy {
  workTimeObject={
    entry1:'',
    entry2:'',
    exit1:'',
    exit2:''
  }
  logCin:any
  logReportArray:any
  exist:any
  day:any
  user:any
  getAttendanceReportObservable:Subscription | undefined
  constructor(private fs:AngularFirestore) { 
    this.user=localStorage.getItem('connectedUser')
  }


  ngOnDestroy(): void {
    this.getAttendanceReportObservable?.unsubscribe()
  }

  
  ngOnInit(): void {
    this.getWorkTime()
  }


  getDateLog($event:any){
    let date=$event.target.value
    if(date.length==10){
      this.fs.collection("AttendanceHistory").ref.doc(date).get().then((data:any)=>{
        this.day=data.data()['date']
        this.exist=true
         this.getAttendanceReportObservable=this.fs.collection('AttendanceHistory/'+this.day+'/LOG').snapshotChanges().subscribe(res=>{
         this.logReportArray=res.map((e:any)=>{
          let LATE1:String
          let LATE2:String
          let EARLY1:String
          let EARLY2:String
          LATE1=this.lateCalcul(e.payload.doc.data()['dateEntry1'],this.workTimeObject.entry1)
          LATE2=this.lateCalcul(e.payload.doc.data()['dateEntry2'],this.workTimeObject.entry2)
          EARLY1=this.earlyCalcul(e.payload.doc.data()['dateExit1'],this.workTimeObject.exit1)
          EARLY2=this.earlyCalcul(e.payload.doc.data()['dateExit2'],this.workTimeObject.exit2)
           return{
             cin:e.payload.doc.id,
             name:e.payload.doc.data()['name'],
             entry1:e.payload.doc.data()['dateEntry1'],
             entry2:e.payload.doc.data()['dateEntry2'],
             exit1:e.payload.doc.data()['dateExit1'],
             exit2:e.payload.doc.data()['dateExit2'],
             late1:LATE1,
             late2:LATE2,
             early1:EARLY1,
             early2:EARLY2
             
           }
         })
       })
      }).catch(()=>{
        this.exist=false
      })
    
     
    } 

    
  }


  exportAttendanceReportToExcel():void{
    //table id is passed over here
    let element = document.getElementById("logReportTable");
    const ws :XLSX.WorkSheet=XLSX.utils.table_to_sheet(element);

    //generate workbook and add the worksheet
    const wb:XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"sheet1");

    //save to file
    XLSX.writeFile(wb,"Attendance-Report for "+this.day+".xlsx")
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

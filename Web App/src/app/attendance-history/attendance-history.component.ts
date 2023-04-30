import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Subscription } from 'rxjs';
import * as XLSX from "xlsx"
@Component({
  selector: 'app-attendance-history',
  templateUrl: './attendance-history.component.html',
  styleUrls: ['./attendance-history.component.css']
})
export class AttendanceHistoryComponent implements OnInit ,OnDestroy{
  workTimeObject={
    entry1:'',
    entry2:'',
    exit1:'',
    exit2:''
  }
  dataLogArray:any
  dataInfoArray:any
  testArray:any
  exist:any
  name:any
  id:any
  logDate:any
  getEmployeesObservable:Subscription | undefined
  user: any
  constructor(private fs:AngularFirestore) { 
    this.user=localStorage.getItem('connectedUser')
    
    
  }
  ngOnDestroy(): void {
    this.getEmployeesObservable?.unsubscribe()
  }
  ngOnInit(): void {
    this.getWorkTime()
    this.getEmployeesInfo()
    
  }
ShowAttendanceLog($event:any){
  this.id=$event.target.value
  if(this.id.length==8)
  {
  this.fs.collection("Employees").ref.doc(this.id).get().then((data:any)=>{
    this.exist=true
    this.name=data.data()['name']
    this.getEmployeesObservable= this.fs.collection("Employees/"+this.id+"/AttendanceHistory").snapshotChanges().subscribe(res=>{
      this.dataLogArray=res.map((e:any)=>{
        let LATE1:String
        let LATE2:String
        let EARLY1:String
        let EARLY2:String
        LATE1=this.lateCalcul(e.payload.doc.data()['dateEntry1'],this.workTimeObject.entry1)
        LATE2=this.lateCalcul(e.payload.doc.data()['dateEntry2'],this.workTimeObject.entry2)
        EARLY1=this.earlyCalcul(e.payload.doc.data()['dateExit1'],this.workTimeObject.exit1)
        EARLY2=this.earlyCalcul(e.payload.doc.data()['dateExit2'],this.workTimeObject.exit2)
        return{
          day:e.payload.doc.id,
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


getEmployeesInfo(){
  this.fs.collection('Employees').snapshotChanges().subscribe(res=>{
    this.dataInfoArray=res.map((e:any)=>{
      return{
        cin:e.payload.doc.id,
        name:e.payload.doc.data()['name'],
        phone:e.payload.doc.data()['phone'].substring(5),
        position:e.payload.doc.data()['position']
      }
    })
  })
}


getWorkTime(){
  this.fs.collection('Admin').ref.doc(this.user).get().then((data:any)=>{
    this.workTimeObject.entry1=data.data()['entryTime1'],
    this.workTimeObject.entry2=data.data()['entryTime2'],
    this.workTimeObject.exit1=data.data()['exitTime1'],
    this.workTimeObject.exit2=data.data()['exitTime2']
  })
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












numberOnly(event:any): boolean {
  const charCode = (event.which) ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;

}













exportAttendanceReportToExcel():void{
  
  //table id is passed over here
  let element = document.getElementById("logHistoryTable");
  const ws :XLSX.WorkSheet=XLSX.utils.table_to_sheet(element);

  //generate workbook and add the worksheet
  const wb:XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"sheet1");

  //save to file
  XLSX.writeFile(wb,"Attendance-log of "+this.id+" for "+this.logDate+".xlsx")
}


}



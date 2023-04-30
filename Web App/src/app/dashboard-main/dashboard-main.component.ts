import { Component, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as Chart from 'chart.js';
import { Subscription } from 'rxjs';
import { HomeComponent } from '../home/home.component';
@Component({
  selector: 'app-dashboard-main',
  templateUrl: './dashboard-main.component.html',
  styleUrls: ['./dashboard-main.component.css']
})
export class DashboardMainComponent implements OnInit,OnDestroy {
  /*whoComes={
    cin:'',
    name:'',
    img:''
  }*/
  workTimeObject={
    entry1:'',
    entry2:'',
    exit1:'',
    exit2:''
  }
  user:any
  totalEmpNumber:number=0
  totalPresentsNumber:number=0
  presentPercent:number=0
  totalLeftNumber:number=0
  leftPercent:number=0
  totalAbsentNumber:number=0
  totalLates:number=0
  totalEarly:number=0
  EmplyeesNowList:any
  getEmployeesObservable:Subscription | undefined
  //getEmployeesCardObservable:Subscription | undefined
  constructor(private db:AngularFireDatabase,private fs:AngularFirestore,public home:HomeComponent) { 
    this.user=localStorage.getItem('connectedUser')
  }

  ngOnDestroy(): void {
    this.getEmployeesObservable?.unsubscribe()
  }

  ngOnInit(): void {
    this.getAllEmployees()
  }


  async getAllEmployees(){
  await this.getWorkTime().then(()=>{
      this.getEmployeesObservable=this.db.list("Employees",limit=>limit.limitToLast(10)).snapshotChanges().subscribe(data=>{
        this.totalPresentsNumber=0
        this.totalLeftNumber=0
        this.totalAbsentNumber=0
        this.totalEmpNumber=0
        this.totalLates=0
        this.totalEarly=0
        this.EmplyeesNowList=data.map((e:any)=>{
          let nowentry1:String=e.payload.val()['dateEntry1']
          let nowentry2:String=e.payload.val()['dateEntry2']
          let nowexit1:String=e.payload.val()['dateExit1']
          let nowexit2:String=e.payload.val()['dateExit2']
          let LATE1:String
          let LATE2:String
          let EARLY1:String
          let EARLY2:String
          LATE1=this.lateCalcul(nowentry1,this.workTimeObject.entry1)
          LATE2=this.lateCalcul(nowentry2,this.workTimeObject.entry2)
          EARLY1=this.earlyCalcul(nowexit1,this.workTimeObject.exit1)
          EARLY2=this.earlyCalcul(nowexit2,this.workTimeObject.exit2)
          this.totalEmpNumber++
          if((e.payload.val()['dateEntry1']!='' && e.payload.val()['dateExit1']=='' && e.payload.val()['dateEntry2']=='' && e.payload.val()['dateExit2']=='' )  || (e.payload.val()['dateEntry2']!='' && e.payload.val()['dateExit2']=='' && e.payload.val()['dateEntry1']!='' && e.payload.val()['dateExit1']!=''))
          {
            this.totalPresentsNumber++
            

          }
          else if((e.payload.val()['dateEntry1']!='' && e.payload.val()['dateExit1']!='' && e.payload.val()['dateEntry2']=='' && e.payload.val()['dateExit2']=='')  || (e.payload.val()['dateEntry2']!='' && e.payload.val()['dateExit2']!='' && e.payload.val()['dateEntry1']!='' && e.payload.val()['dateExit1']!=''))
          {
            this.totalLeftNumber++
            

          }
          else if(e.payload.val()['dateEntry1']=='' && e.payload.val()['dateExit1']=='' && e.payload.val()['dateEntry2']=='' && e.payload.val()['dateExit2']=='')
          {
            this.totalAbsentNumber++

          }



          if(LATE1.charAt(0)!=='-' && LATE1.charAt(0)!=='0' && nowentry1!=='' && nowentry2==='' && nowexit1==='' && nowexit2!=='' )
          {
            this.totalLates++
            
          }
          else if(LATE2.charAt(0)!=='-' && LATE2.charAt(0)!=='0' && nowentry1!=='' && nowentry2!=='' && nowexit1!=='' && nowexit2==='' )
          {
            this.totalLates++
          }
          else if(EARLY1.charAt(0)!=='-' && EARLY1.charAt(0)!=='0' && nowentry1!=='' && nowentry2==='' && nowexit1!=='' && nowexit2==='' )
          {
            this.totalEarly++
          }
          else if(EARLY2.charAt(0)!=='-' && EARLY2.charAt(0)!=='0' && nowentry1!=='' && nowentry2!=='' && nowexit1!=='' && nowexit2!=='' )
          {
            this.totalEarly++
          }
          

          this.presentPercent=Math.round((this.totalPresentsNumber*100)/this.totalEmpNumber)
          this.leftPercent=Math.round((this.totalLeftNumber*100)/this.totalEmpNumber)
          return{
            cin:e.key,
            name:e.payload.val()['name'],
            entry1:e.payload.val()['dateEntry1'],
            entry2:e.payload.val()['dateEntry2'],
            exit1:e.payload.val()['dateExit1'],
            exit2:e.payload.val()['dateExit2'],
          }
          
          
        }
        
        
        )
        this.workshopChart(this.totalAbsentNumber,this.totalPresentsNumber,this.totalLeftNumber,this.totalLates,this.totalEarly)

      })


  })
}



workshopChart(abs:number,pre:number,left:number,late:number,early:number){
    new Chart('workshopChart', {
      type: 'doughnut',
      data : {
        labels: [
          'Absent',
          'Present',
          'Left',
          'Late',
          'Early-Exit'
        ],
        datasets: [{
          label: 'workshop Report',
          data: [abs, pre,left,late,early],
          backgroundColor: [
            'rgb(210, 37, 37)',
            'rgb(25, 185, 94)',
            'rgb(68, 203, 230)',
            'rgb(236,145,66)',
            'rgb(196,163,52)'

          ],
          borderWidth: 1
        }]
      },
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


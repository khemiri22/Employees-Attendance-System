import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employees-manager',
  templateUrl: './employees-manager.component.html',
  styleUrls: ['./employees-manager.component.css']
})
export class EmployeesManagerComponent implements OnInit,OnDestroy {
  employeesCinArray:String[]=[]
  disableUploadImages:any
  alreadyExist:any
  permissionChanging:any
  task:AngularFireUploadTask | undefined
  ref:AngularFireStorageReference | undefined
  empCin:any
  employeeToDeleteCin:any
  successMessage:any
  successUploadImages:any
  employeeImageRef:any
  getEmployeesObservable:Subscription | undefined
  getbusyStatusObservable:Subscription | undefined
  deleteImagesObservable:Subscription | undefined
  employeesDataArray:any
  dataObject={
    cin:'',
    fullName:'',
    address:'',
    phone:'',
    position:'',
  }
  numberImagesToUpload:any
  constructor(private fs:AngularFirestore,private fst:AngularFireStorage,private route:Router,private toastr: ToastrService,private db:AngularFireDatabase) { }
  ngOnDestroy(): void {
    this.getEmployeesObservable?.unsubscribe()
    this.getbusyStatusObservable?.unsubscribe()
  }

  ngOnInit(): void {
    this.getAllEmployees()
    this.busyStatus()
    
  }


  getAllEmployees(){
    this.getEmployeesObservable= this.fs.collection('Employees').snapshotChanges().subscribe( data =>{
      this.employeesDataArray=data.map( (e:any,i:number=0)=>{
        this.employeesCinArray[i]=e.payload.doc.id
        i++
        return {
          cin :e.payload.doc.id,
          name :e.payload.doc.data()['name'],
          position :e.payload.doc.data()['position'],
          image :e.payload.doc.data()['image'],
          phone : e.payload.doc.data()['phone']
        }
      })
    })
  }
  




  addEmployee(f:any){
    let data = f.value
    this.empCin=data.cin
    this.fs.collection("Employees/").doc(data.cin).set({
      cin:data.cin,
      name:data.fullName,
      birthday:data.birthday,
      address:data.address,
      phone:"+216 "+data.phone,
      position:data.position,
      image:this.employeeImageRef
    }).then(()=>{
      this.route.navigate(['home/dashboard-main'])
      this.db.object('sync').update({busy:1})
      this.db.object('sync').update({newEmp:data.cin})
      this.successMessage='Employee Added Successfully !'
    })
  
    
    }
  
  


  deleteEmployee(){
        this.fs.collection('Employees').doc(this.employeeToDeleteCin).delete().then(()=>{
          this.successMessage='Deleted Successfully'
          this.fst.storage.ref("Employees").child(this.employeeToDeleteCin).list().then((items)=>{
            items.items.map(async item=>{
             await item.delete()
            })
          }).then(()=>{
            this.route.navigate(['home/dashboard-main'])
            this.db.object('sync').update({busy:1})
            this.db.object('sync').update({deleteEmp:this.employeeToDeleteCin})
          })
          

        })
      
    }

  


  getEmployeeDataToUpdate(cin:any){
    this.fs.collection('Employees').ref.doc(cin).get().then((data:any)=>{
      this.dataObject.cin=data.id
      this.dataObject.fullName=data.data()['name']
      this.dataObject.address=data.data()['address']
      this.dataObject.phone=data.data()['phone'].substring(5)
      this.dataObject.position=data.data()['position']

    })
  }

  updateEmployee(){
    if(this.dataObject.fullName.length!=0){
      this.fs.collection('Employees').doc(this.dataObject.cin).update({
        name:this.dataObject.fullName
      })}
    if(this.dataObject.address.length!=0){
        this.fs.collection('Employees').doc(this.dataObject.cin).update({
          address:this.dataObject.address
        })}
    if(this.dataObject.phone.length==8){
          this.fs.collection('Employees').doc(this.dataObject.cin).update({
            phone:"+216 "+this.dataObject.phone
          })}
    if(this.dataObject.position.length!=0){
            this.fs.collection('Employees').doc(this.dataObject.cin).update({
              position:this.dataObject.position
          })}

    
    

  }



 async uploadImages($event:any){
    if(this.employeesCinArray.indexOf(this.empCin)==-1){
      this.alreadyExist=false
    if($event.target.files.length==5){
      this.numberImagesToUpload=true
      for (let index = 0; index < 5; index++) {
        let id =this.empCin +" ("+ index+")"
       await this.fst.ref("Employees/"+this.empCin+"/"+id).put($event.target.files[index]).then(data=>{
          if(index===4) {
          data.ref.getDownloadURL().then(url=>{
              this.successUploadImages="success upload image"
              this.employeeImageRef=url
            }).then(()=>this.disableUploadImages=true)
          }
          
        })
        
      }
    
  }
  else{
    this.numberImagesToUpload=false
    $event.target.value=""
  }
    
}
else
{
  this.alreadyExist=true
  $event.target.value=""
}



  }



busyStatus(){
  this.getbusyStatusObservable=this.db.object('sync/busy').snapshotChanges().subscribe(e=>{
    this.permissionChanging=e.payload.val()
  })
}

checkBusy(){
  if(this.permissionChanging===1){
    this.toastr.error("ATTENDANCE SYSTEM IS UPDATING ,PLEASE WAIT TILL IT COMPLETE !",'ALERT !',{
      timeOut:5000,
      positionClass:'toast-bottom-right',
    })
  }
}



  numberOnly(event:any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

}

from datetime import *
def initAttendanceTable(fs,db):
  try:
    docs = fs.collection('Employees').get()
    ids=[]
    names=[]
    for doc in docs:
      id=doc.id
      name=doc.to_dict()['name']
      ids.append(id)
      names.append(name)
    for id,name in zip(ids,names):
      data={'name':name,'dateEntry1':'','dateExit1':'','dateEntry2':'','dateExit2':''}
      db.child("Employees/"+id).set(data)
  except:
    pass

def markAttendance(db,id):
  try:
    today=datetime.today().strftime('%Y-%m-%d')
    dateEntry1=db.child("Employees/"+id+"/dateEntry1").get().val()
    dateExit1=db.child("Employees/"+id+"/dateExit1").get().val()
    dateEntry2=db.child("Employees/"+id+"/dateEntry2").get().val()
    dateExit2=db.child("Employees/"+id+"/dateExit2").get().val()
    if(dateEntry1==''):
      now = datetime.now()
      dateString = now.strftime('%H:%M:%S')
      db.child("Employees/"+id).update({"dateEntry1":dateString})
    elif(dateEntry1!='' and dateExit1==''):
      now = datetime.now()
      dateString = now.strftime('%H:%M:%S')
      db.child("Employees/"+id).update({"dateExit1":dateString})
    elif(dateEntry1!='' and dateExit1!='' and dateEntry2==''):
      now = datetime.now()
      dateString = now.strftime('%H:%M:%S')
      db.child("Employees/"+id).update({"dateEntry2":dateString})
    elif(dateEntry1!='' and dateExit1!='' and dateEntry2!='' and dateExit2==''):
      now = datetime.now()
      dateString = now.strftime('%H:%M:%S')
      db.child("Employees/"+id).update({"dateExit2":dateString})
  except:
    pass
  



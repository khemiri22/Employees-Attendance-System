import pyrebase
import random
from imutils import paths
import face_recognition
import pickle
import cv2
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore,storage
from datetime import *
from time import *
import shutil
config={
  "apiKey": "AIzaSyAcr7tLJ93xib6Xl4I98XPLfd0Qqjnj6CI",
  "authDomain": "pfeiot-67806.firebaseapp.com",
  "databaseURL": "https://pfeiot-67806-default-rtdb.firebaseio.com",
  "projectId": "pfeiot-67806",
  "storageBucket": "pfeiot-67806.appspot.com",
  "messagingSenderId": "270993395904",
  "appId": "1:270993395904:web:c72ce815c6236b201f5d25",
  "measurementId": "G-4P3HB3SQM7",
  "serviceAccount" : "serviceAccountKey.json"
  }

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred,{"databaseURL": "https://pfeiot-67806-default-rtdb.firebaseio.com","storageBucket": "pfeiot-67806.appspot.com"})
fs=firestore.client()
firebase=pyrebase.initialize_app(config)
db=firebase.database()
def trainModel():
  print("[INFO] start processing faces...")
  imagePaths = list(paths.list_images("dataset"))
  knownEncodings = []
  knownNames = []
  try:
    for (i, imagePath) in enumerate(imagePaths):
        print("[INFO] processing image {}/{}".format(i + 1,len(imagePaths)))
        name = imagePath.split(os.path.sep)[-2]
        image = cv2.imread(imagePath)
        image = cv2.resize(image, (512,512))
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        boxes = face_recognition.face_locations(rgb,model="hog")
        encodings = face_recognition.face_encodings(rgb, boxes)
        for encoding in encodings:
          knownEncodings.append(encoding)
          knownNames.append(name)
  except:
    pass
  print("[INFO] serializing encodings...")
  data = {"encodings": knownEncodings, "names": knownNames}
  f = open("encodings.pickle", "wb")
  f.write(pickle.dumps(data))
  f.close()
  print("Model Trained Successfully !")



def DownloadAll(EmpName):
  global config
  parentDir="dataset/"
  pathLocal=os.path.join(parentDir,EmpName)
  os.mkdir(pathLocal)
  firebase = pyrebase.initialize_app(config)
  storage = firebase.storage()
  i=str(1)
  all_files=storage.child("Employees/"+EmpName).list_files()
  for file in all_files:
    pathCloud=file.name
    pathCloud=pathCloud.split("/")
    if(len(pathCloud)>2):
      if(pathCloud[1]==EmpName):
        if pathCloud[2]!='':
          print(pathCloud[2])
          firebase = pyrebase.initialize_app(config)
          storage = firebase.storage()
          storage.download("Employees/{}/{}".format(EmpName,pathCloud[2]),"{}/{} ({}).jpg".format(pathLocal,EmpName,i))
          x=int(i)
          i=str(x+1)
  print("Data Downloaded Successfully !")

def DeleteEmployee(EmpName):
  parentDir="dataset/"
  pathLocal=os.path.join(parentDir,EmpName)
  shutil.rmtree(pathLocal,ignore_errors=True)
  print("Data Deleted Successfully !")

def uploadModel():
  global config
  firebase = pyrebase.initialize_app(config)
  storage = firebase.storage()
  path_on_cloud = "Model/encodings.pickle"
  path_local="encodings.pickle"
  storage.child(path_on_cloud).put(path_local)
  print("Model Uploaded Succesfully !") 



def saveAttendaceHistory():
  global fs,db
  today=datetime.today().strftime('%Y-%m-%d')
  docs=fs.collection('Employees').get()
  for doc in docs:
    id=doc.id
    dateEntry1=db.child("Employees").child(id).child("dateEntry1").get().val()
    dateExit1=db.child("Employees").child(id).child("dateExit1").get().val()
    dateEntry2=db.child("Employees").child(id).child("dateEntry2").get().val()
    dateExit2=db.child("Employees").child(id).child("dateExit2").get().val()
    name=db.child("Employees").child(id).child("name").get().val()
    fs.collection('Employees').document(id).collection('AttendanceHistory').document(today).set({"dateEntry1":dateEntry1,"dateExit1":dateExit1,"dateEntry2":dateEntry2,"dateExit2":dateExit2})
    fs.collection('AttendanceHistory').document(today).set({"date":today})
    fs.collection('AttendanceHistory').document(today).collection('LOG').document(id).set({'name':name,"dateEntry1":dateEntry1,"dateExit1":dateExit1,"dateEntry2":dateEntry2,"dateExit2":dateExit2})
    


if __name__=='__main__':
  while True:
    newEmp=db.child("sync/newEmp").get().val()
    deleteEmp=db.child("sync/deleteEmp").get().val()
    saveAttendanceHistory=db.child("sync/saveAttendanceHistory").get().val()
    if(newEmp!=""):
      DownloadAll(str(newEmp))
      trainModel()
      uploadModel()
      name=fs.collection("Employees").document(str(newEmp)).get().to_dict()['name']
      data={'name':name,'dateEntry1':'','dateExit1':'','dateEntry2':'','dateExit2':''}
      db.child("Employees/"+str(newEmp)).set(data)
      db.child("sync").update({"newEmp":""})
      db.child("sync").update({"updateModel":1})
    if(deleteEmp!=""):
      DeleteEmployee(str(deleteEmp))
      trainModel()
      uploadModel()
      db.child("Employees").child(str(deleteEmp)).remove()
      db.child("sync").update({"deleteEmp":""})
      db.child("sync").update({"updateModel":1})
    if(saveAttendanceHistory!=0):
      saveAttendaceHistory()
      db.child("sync").update({"saveAttendanceHistory":0})
      print("Saving Attendance History Done.........")
    
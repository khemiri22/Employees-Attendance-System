import tkinter as tk
from tkinter import *
from tkinter.ttk import *
import os
import cv2
import sys
from time import sleep
from PIL import Image, ImageTk
import numpy as np
import mediapipe as mp
from faceRecognitionModule import RecognitionCNN
from maskDetectionModule import detect_and_predict_mask
from datetime import *
from tensorflow.keras.models import load_model
from faceDistanceModule import faceDistance
from cvzone.FaceMeshModule import FaceMeshDetector
from checkInternetConnectionModule import connect
import pyrebase
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore,storage
from firebaseModules import *
import threading
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred,{"databaseURL": "https://pfeiot-67806-default-rtdb.firebaseio.com","storageBucket": "pfeiot-67806.appspot.com"})
firebaseConfig={
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
firebase=pyrebase.initialize_app(firebaseConfig)
fs=firestore.client()
db=firebase.database()
cap = cv2.VideoCapture(0)
cap.set(3, 640)
cap.set(4, 480)
cap.set(5,32)
Faces=False
title="WELCOME TO INNOVUP ATTENDANCE SYSTEM"
secondCheck=''
chance=0
prototxtPath = "face_detector/deploy.prototxt"
weightsPath = "face_detector/res10_300x300_ssd_iter_140000.caffemodel"
faceNet = cv2.dnn.readNet(prototxtPath, weightsPath)
maskNet = load_model("mask_detector.model")
mpFaceDetection = mp.solutions.face_detection
faceDetection = mpFaceDetection.FaceDetection(min_detection_confidence=0.75)
endApp=0
def show_frame():
    global Faces,title,faceDetection,lmain
    _,frame=cap.read()
    frame_rgb=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    faces = faceDetection.process(frame_rgb)
    if faces.detections:
        for id,detection in enumerate(faces.detections):
                bboxc=detection.location_data.relative_bounding_box
                ih,iw,ic = frame.shape
                bbox= int(bboxc.xmin * iw),int(bboxc.ymin * ih),int(bboxc.width * iw),int(bboxc.height * ih)
                cv2.rectangle(frame, bbox, (0,255,0),2)
        if(len(faces.detections)==1):
            Faces=1
        elif(len(faces.detections)>1):
            Faces=2
    else:
        Faces=False
    cv2.putText(frame, title, (30,410), cv2.FONT_HERSHEY_TRIPLEX, 0.45, (255,255,255),2)

    cv2image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGBA)
    #cv2image=cv2.resize(cv2image, (800,600))
    prevImg = Image.fromarray(cv2image)
    imgtk = ImageTk.PhotoImage(image=prevImg)
    lmain.imgtk = imgtk
    lmain.configure(image=imgtk)
    lmain.after(1, show_frame)

def controlAttendance():

    global Faces,title,secondCheck,faceNet,maskNet,detector,fs,db,chance
    if Faces==False:
      title="WELCOME TO INNOVUP ATTENDANCE SYSTEM"
    elif Faces==1:
       _,frame=cap.read()
       distanceFromCam=faceDistance(frame)
       if(distanceFromCam>50 and distanceFromCam<75):
           mask=detect_and_predict_mask(frame, faceNet, maskNet)
           if(mask==True and secondCheck==''):
               title="REMOVE MASK FOR DETECTION"
               
           elif (mask==False and secondCheck==''):
               who=RecognitionCNN(frame)
               if(who==False):
                   title="ACCESS DENIED ! "
                   
               else:
                   name=db.child("Employees/"+who+"/name").get().val()
                   title="WELCOME MR "+name.upper()+", WEAR MASK TO MARK ATTENDANCE"
                   
                   secondCheck=who
           elif (mask==True and secondCheck != ''):
               dateEntry1=db.child("Employees/"+secondCheck+"/dateEntry1").get().val()
               dateExit1=db.child("Employees/"+secondCheck+"/dateExit1").get().val()
               dateEntry2=db.child("Employees/"+secondCheck+"/dateEntry2").get().val()
               dateExit2=db.child("Employees/"+secondCheck+"/dateExit2").get().val()
               name=db.child("Employees/"+secondCheck+"/name").get().val()
               chance=0
               if(dateEntry1==''):
                   markAttendance(db, secondCheck)
                   title='ATTENDANCE MARKED, MR '+name.upper()+' PLEASE ENTER !'
                   secondCheck = ''
                   
               elif (dateEntry1!='' and dateExit1==''):
                   markAttendance(db, secondCheck)
                   title='ATTENDANCE MARKED, SEE YOU MR '+name.upper()
                   secondCheck = ''
                   
               elif (dateEntry1!='' and dateExit1!='' and dateEntry2==''):
                   markAttendance(db, secondCheck)
                   title='ATTENDANCE MARKED, WELCOME BACK '+name.upper()
                   secondCheck = ''
                   
               elif(dateEntry1!='' and dateExit1!='' and dateEntry2!='' and dateExit2==''):
                   markAttendance(db, secondCheck)
                   title='ATTENDANCE MARKED, GOODBYE MR '+name.upper()
                   secondCheck = ''
           elif (mask==False and secondCheck != ''):
               name=db.child("Employees/"+secondCheck+"/name").get().val()
               title="MR "+name.upper()+", PLEASE WEAR MASK TO MARK ATTENDANCE !"
               chance=chance+1
       elif (distanceFromCam<40):
           title="MOVE AWAY TO PROPERLY DETECT YOUR FACE !"
       elif (distanceFromCam>60):
           title="MOVE FORWARD TO PROPERLY DETECT YOUR FACE !"


    elif Faces==2:
       title="WE CAN'T DETECT 2 FACES TOGETHER SORRY "



def MainAppThread():
    global endApp,lmain,fs,db
    initAttendanceTable(fs, db)
    mainWindow = Tk()
    mainWindow.geometry('640x480')
    #mainWindow.attributes("-fullscreen", True)
    #mainWindow.resizable(width=False, height=False)
    style=Style()
    style.configure('TButton', font =('calibri', 18, 'bold'),foreground = '#2A689F')
    mainWindow.bind('<Escape>', lambda e: mainWindow.quit())
    lmain = Label(mainWindow, compound=tk.CENTER, anchor=tk.CENTER, relief=tk.RAISED)
    button = Button(mainWindow, text="Mark Attendance",style='TButton',command=controlAttendance)
    lmain.pack()
    button.place(bordermode=tk.INSIDE, relx=0.5, rely=0.95, anchor=tk.CENTER, width=200, height=50)
    button.focus()
    show_frame()
    mainWindow.mainloop()
    cap.release()
    db.child("sync").update({"saveAttendanceHistory":1})
    endApp=1

def GetUpdatedModelThread():
    global endApp,db,secondCheck,title,chance
    while True:
      update=db.child("sync/updateModel").get().val()
      if(chance==2):
          secondCheck=''
          title="WELCOME TO INNOVUP ATTENDANCE SYSTEM"
          chance=0
      if(update==1):
          sg=storage.bucket()
          path_on_cloud=sg.blob("Model/encodings.pickle")
          path_local="encodings.pickle"
          path_on_cloud.download_to_filename(path_local)
          print("Model Downloaded !")
          db.child("sync").update({"updateModel":0})
          db.child("sync").update({"busy":0})
          db.child("sync").update({"done":1})
      if(endApp==1):
          break

tApp=threading.Thread(target=MainAppThread)
tUpdate=threading.Thread(target=GetUpdatedModelThread)
if __name__=='__main__':
    while connect()==False:
        print('PLEASE CHECK THE INTERNET CONNECTION !')
        sleep(2)
    print('CONNECTED !!')
    tApp.start()
    tUpdate.start()
    tApp.join()
    tUpdate.join()
    print("GOOD BYE :)")
    #sleep(10)
    #os.system("sudo shutdown -h now")  #SHUTDOWN RASPBERRY Pi
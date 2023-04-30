import face_recognition
import pickle
import cv2
import numpy as np
import os
def RecognitionCNN(frame):
        currentname = "unknown"
        encodingsP = "encodings.pickle"
        try:
                data = pickle.loads(open(encodingsP, "rb").read())
                frame_rgb=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                boxes=face_recognition.face_locations(frame_rgb,model="hog")
                encodings = face_recognition.face_encodings(frame_rgb, boxes)
                matches = face_recognition.compare_faces(data["encodings"],encodings[0])
                faceDis = face_recognition.face_distance(data["encodings"], encodings[0])
                matchIndex = np.argmin(faceDis)
                if faceDis[matchIndex]<0.42:
                        name = data['names'][matchIndex]
                        dis = round((faceDis[matchIndex] *100),1)
                        return name
                else:
                        return False
        except:
                return False                
        os.close(encodingsP)
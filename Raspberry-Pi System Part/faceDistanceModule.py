import cv2
import cvzone
from cvzone.FaceMeshModule import FaceMeshDetector
def faceDistance(frame):
    try:
        detector=FaceMeshDetector(maxFaces=1)
        frame, faces = detector.findFaceMesh(frame, draw=False)
        if faces:
            face = faces[0]
            pointLeft = face[145]
            pointRight = face[374]
            w, _ = detector.findDistance(pointLeft, pointRight)
            W = 6.3
            f = 840
            d = (W * f) / w
            return int(d)
    except:
        pass
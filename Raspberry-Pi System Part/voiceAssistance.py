from gtts import gTTS
from playsound import playsound
import os
import pyttsx3
def text2speachEN(words):
    engine=pyttsx3.init()
    engine.setProperty("rate", 130)
    engine.say(words)
    engine.runAndWait()
if __name__=="__main__":
    text2speachEN("tada ya tada!")
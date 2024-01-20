#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>
 
const char* ssid = "D LINK";
const char* password =  "anupam1234";
int buttonState = 0;
int wifiConnectionOP=18;
int fireSensorIP=19;
int BuzzerOP=22;
int relay1=21;
int relay2=23;
String sensorReadings;

void setup() {
 
  Serial.begin(921600);
  delay(1000);   //Delay needed before calling the WiFi.begin
  pinMode(wifiConnectionOP,OUTPUT);
  pinMode(BuzzerOP,OUTPUT);
  pinMode(fireSensorIP,INPUT);
  pinMode(relay1,OUTPUT);
  pinMode(relay2,OUTPUT);
  WiFi.begin(ssid, password); 
 
  while (WiFi.status() != WL_CONNECTED) { //Check for the connection
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");
  digitalWrite(wifiConnectionOP,HIGH);
}

void loop() {
  
 if(WiFi.status()== WL_CONNECTED){   //Check WiFi connection status

   String serverPath = "https://node-mysqllite.onrender.com/switch";

   
    WiFiClientSecure client;
    HTTPClient https;
    client.setInsecure();
  // Your Domain name with URL path or IP address with path
    https.begin(client, serverPath);
    https.addHeader("Content-Type", "application/json");      
  
     int httpResponseCode = https.GET();
  
     String payload = "{}"; 
  
    if (httpResponseCode>0) {
         Serial.print("HTTP Response code: ");
         Serial.println(httpResponseCode);
        payload = https.getString();
     }
     else {
         Serial.print("Error code: ");
        Serial.println(httpResponseCode);
     }
  // Free resources
  https.end();

  //return payload;
    Serial.println(payload);
    JSONVar myObject = JSON.parse(payload);
  
      // JSON.typeof(jsonVar) can be used to get the type of the var
      if (JSON.typeof(myObject) == "undefined") {
        Serial.println("Parsing input failed!");
        return;
      }
       Serial.println(myObject[0]["status"]);
       Serial.println(myObject[0]["Id"]);
       int x=myObject[0]["Id"];
       if(x ==1){
         Serial.println("=====relay1");
         int y=myObject[0]["status"];
        if(y==1){
          Serial.println("=====HIGH");
            digitalWrite(relay1, HIGH);  
        }else{
          Serial.println("=====LOW");
          digitalWrite(relay1, LOW);  
        }
       }
       x=myObject[1]["Id"];
       if(x ==2){
         Serial.println("=====relay2");
         int y=myObject[1]["status"];
        if(y==1){
          Serial.println("=====HIGH");
            digitalWrite(relay2, HIGH);  
        }else{
          Serial.println("=====LOW");
          digitalWrite(relay2, LOW);  
        }
       }
      // JSONVar keys = myObject.keys();
      // for (int i = 0; i < keys.length(); i++) {
      //   JSONVar value = myObject[keys[i]];
      //   Serial.print(keys[i]);
      //   Serial.print(" = ");
      //   Serial.println(value);
      //   //sensorReadingsArr[i] = double(value);
      // }
  
 }else{
  
    Serial.println("Error in WiFi connection");   
  
 }
  
  delay(1000);  //Send a request every 10 seconds

 buttonState= digitalRead(fireSensorIP);
 if (buttonState == HIGH) {
    // turn LED on
   // digitalWrite(ledPin, HIGH);
    Serial.println("NOO..."); 
    digitalWrite(BuzzerOP, LOW);  
  } else {
    // turn LED off
    digitalWrite(BuzzerOP, HIGH);
    Serial.println("YES...");   
  }
  
}


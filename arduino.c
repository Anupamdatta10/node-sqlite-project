#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>
 
const char* ssid = "D LINK";
const char* password =  "anupam1234";
String baseUrl = "https://iot-project-fax3.onrender.com";
int buttonState = 0;
int wifiConnectionOP=18;
int fireSensorIP=19;
int BuzzerOP=22;
int acDetection1=26;
int acDetection2=27;
int acStatus1=0;
int acStatus2=0;
int relay1=21;
int relay2=23;
int initialStatus1=0;
int initialStatus2=0;
String sensorReadings;


void setup() {
 
  Serial.begin(921600);
  delay(1000);   //Delay needed before calling the WiFi.begin
  pinMode(wifiConnectionOP,OUTPUT);
  pinMode(BuzzerOP,OUTPUT);
  pinMode(fireSensorIP,INPUT);
  pinMode(relay1,OUTPUT);
  pinMode(relay2,OUTPUT);
  pinMode(acDetection1,INPUT);
  pinMode(acDetection2,INPUT);

  WiFi.begin(ssid, password); 
 
  while (WiFi.status() != WL_CONNECTED) { //Check for the connection
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");
  digitalWrite(wifiConnectionOP,HIGH);//led on for wifi connection success
   
    WiFiClientSecure client;
    HTTPClient https;
    client.setInsecure();
    acStatus1=digitalRead(acDetection1);
    acStatus2=digitalRead(acDetection2);
  // Your Domain name with URL path or IP address with path
    Serial.print(baseUrl+"/status-update?x="+acStatus1+"&y="+acStatus2);
    https.begin(client, baseUrl+"/status-update?x="+acStatus1+"&y="+acStatus2);
    https.addHeader("Content-Type", "application/json");      
  
     int httpResponseCode = https.GET();
      String payload = "{}"; 
  
    if (httpResponseCode>0) {
         Serial.print("HTTP Response code: ");
         Serial.println(httpResponseCode);
        payload = https.getString();
        JSONVar myObject = JSON.parse(payload);
        int x=myObject[0]["Id"];
        if(x ==1){
          initialStatus1=myObject[0]["status"];
        }
        x=myObject[1]["Id"];
        if(x ==2){
          initialStatus2=myObject[1]["status"];
        }

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

}

void loop() {
  
  if(WiFi.status()== WL_CONNECTED){   //Check WiFi connection status

    String serverPath = baseUrl + "/switch";

    
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
        int x=myObject[0]["Id"];
        if(x ==1){
          int y=myObject[0]["status"];
          if(y==1){
              digitalWrite(relay1, HIGH);  
          }else{
            digitalWrite(relay1, LOW);  
          }
        }
        x=myObject[1]["Id"];
        if(x ==2){
          int y=myObject[1]["status"];
          if(y==1){
              digitalWrite(relay2, HIGH);  
          }else{
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
  
    delay(1000);  //Send a request every 1 seconds
    acStatus1=digitalRead(acDetection1);
    acStatus2=digitalRead(acDetection2);
    Serial.println("ac detedt1=====>strat");
    Serial.println(acStatus1);
    Serial.println("ac detedt2=====>strat");
    Serial.println(acStatus2);
    if(WiFi.status()== WL_CONNECTED){
      Serial.print("- x :1 ");
      if(initialStatus1!=acStatus1){
          initialStatus1=acStatus1;
          String serverPath = "https://iot-project-fax3.onrender.com/status-update?x="+acStatus1; 
          WiFiClientSecure client;
          HTTPClient https;
          client.setInsecure();
          https.begin(client, serverPath);
          https.addHeader("Content-Type", "application/json");      
    
          int httpResponseCode = https.GET();
          String payload = "{}"; 
          if (httpResponseCode>0) {
            Serial.print("HTTP Response code fire alarm: ");
            Serial.println(httpResponseCode);
            payload = https.getString();
            Serial.println(payload);
          }
          else {
              Serial.print("Error code:fire alarm ");
              Serial.println(httpResponseCode);
          }
        }

        // for 2nd led change status
        Serial.print("- y :1 ");
      if(initialStatus2!=acStatus2){
          initialStatus2=acStatus2;
          String serverPath = "https://iot-project-fax3.onrender.com/status-update?y="+acStatus2; 
          WiFiClientSecure client;
          HTTPClient https;
          client.setInsecure();
          https.begin(client, serverPath);
          https.addHeader("Content-Type", "application/json");      
    
          int httpResponseCode = https.GET();
          String payload = "{}"; 
          if (httpResponseCode>0) {
            Serial.print("HTTP Response code fire alarm: ");
            Serial.println(httpResponseCode);
            payload = https.getString();
            Serial.println(payload);
          }
          else {
              Serial.print("Error code:fire alarm ");
              Serial.println(httpResponseCode);
          }
        }
      
    }


  Serial.println("ac detedt=====>end");
//  buttonState= digitalRead(fireSensorIP);
//  if (buttonState == HIGH) {
//     // turn LED on
//    // digitalWrite(ledPin, HIGH);
//     Serial.println("NOO..."); 
//     digitalWrite(BuzzerOP, LOW);  
//   } else {
//     // turn LED off
//     digitalWrite(BuzzerOP, HIGH);
//     Serial.println("YES...");   
//     if(WiFi.status()== WL_CONNECTED){
//       Serial.print("- fire alarm: ");
//       String serverEmailPath = "https://iot-project-fax3.onrender.com/send-mail"; 
//       WiFiClientSecure client;
//       HTTPClient https;
//       client.setInsecure();
//   // Your Domain name with URL path or IP address with path
//       https.begin(client, serverEmailPath);
//       https.addHeader("Content-Type", "application/json");      
  
//       int httpResponseCode = https.GET();
//       if (httpResponseCode>0) {
//          Serial.print("HTTP Response code fire alarm: ");
//          Serial.println(httpResponseCode);
//         //payload = https.getString();
//      }
//      else {
//          Serial.print("Error code:fire alarm ");
//         Serial.println(httpResponseCode);
//      }
//     }
//   }
  
}


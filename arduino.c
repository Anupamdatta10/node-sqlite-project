#include <WiFi.h>
#include <HTTPClient.h>
 
const char* ssid = "D LINK";
const char* password =  "anupam1234";
int buttonState = 0;

void setup() {
 
  Serial.begin(921600);
  delay(4000);   //Delay needed before calling the WiFi.begin
  pinMode(18,OUTPUT);
  pinMode(22,OUTPUT);
  pinMode(19,INPUT);
  WiFi.begin(ssid, password); 
 
  while (WiFi.status() != WL_CONNECTED) { //Check for the connection
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");
  digitalWrite(18,HIGH);
}

void loop() {
  
 if(WiFi.status()== WL_CONNECTED){   //Check WiFi connection status
  
   HTTPClient http;   
  
   http.begin("http://jsonplaceholder.typicode.com/posts");  //Specify destination for HTTP request
   http.addHeader("Content-Type", "text/plain");             //Specify content-type header
  
   int httpResponseCode = http.POST("POSTING from ESP32");   //Send the actual POST request
  
   if(httpResponseCode>0){
  
    String response = http.getString();                       //Get the response to the request
  
    Serial.println(httpResponseCode);   //Print return code
    Serial.println(response);           //Print request answer
  
   }else{
  
    Serial.print("Error on sending POST: ");
    Serial.println(httpResponseCode);
  
   }
  
   http.end();  //Free resources
  
 }else{
  
    Serial.println("Error in WiFi connection");   
  
 }
  
  delay(1000);  //Send a request every 10 seconds

 buttonState= digitalRead(19);
 if (buttonState == HIGH) {
    // turn LED on
   // digitalWrite(ledPin, HIGH);
    Serial.println("NOO..."); 
    digitalWrite(22, LOW);  
  } else {
    // turn LED off
    digitalWrite(22, HIGH);
    Serial.println("YES...");   
  }
  
}
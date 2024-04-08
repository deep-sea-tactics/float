//Headers for DS3231 RTC
#include <RTClib.h>
#include <Wire.h>

//Headers for XBee
#include <SoftwareSerial.h>

//Motor and solenoid relay pins
#define PUMP_INPUT_1 A1
#define PUMP_INPUT_2 A0
#define SOLENOID_RELAY_1 A1
#define SOLENOID_RELAY_2 A0

//Into external bladder
#define FORWARD true 
//Into internal bladder
#define BACKWARD false

//Pump time (ms)
#define PUMP_TIME 9500

//Profile delay (ms)
#define PROFILE_DELAY 8000

//Initialize RTC
DS3231 Rtc;
char buf[20];

//Initialize XBee
SoftwareSerial XBee(9, 10);

bool writetime;
bool profile;

String XBeeData;
int a;

void send_xbee(char* message) {
  XBee.write(message);
  XBee.write('\n');
}

void pump_on(bool direction){
  if(direction){
    //Forward
    digitalWrite(PUMP_INPUT_1, LOW);
    digitalWrite(PUMP_INPUT_2, HIGH);
  }
  else{
    //Backwards
    digitalWrite(PUMP_INPUT_1, HIGH);
    digitalWrite(PUMP_INPUT_2, LOW);
  }
}

void pump_off(){
  digitalWrite(PUMP_INPUT_1, LOW);
  digitalWrite(PUMP_INPUT_2, LOW);
}

void serial_flush(){
  char dummy;
  while(XBee.available() > 0){
    dummy = XBee.read();
  }
}

void pump_delay(int delay_time, bool direct, bool transmit){
  int b;
  for(int i = 0; i < PUMP_TIME; i++){
    if(transmit){
      if(!(i % 1000)){
        DateTime current = Rtc.now();
        send_xbee("Company number: R1");
        send_xbee(current.tostr(buf));
      }
    }
    if(!(i % 200)){
      b++;
    }
    if(!(b % 2)){
      pump_on(direct);
    }
    else{
      pump_off();
    }
    delay(1);
  }
  pump_off();
}

void setup() {
  pinMode(PUMP_INPUT_1, OUTPUT);
  pinMode(PUMP_INPUT_2, OUTPUT);
  digitalWrite(SOLENOID_RELAY_1, LOW);
  digitalWrite(SOLENOID_RELAY_2, LOW);
  digitalWrite(PUMP_INPUT_1, LOW);
  digitalWrite(PUMP_INPUT_2, LOW);
  //Initalize FTDI
  Serial.begin(9600);
  XBee.begin(9600);
  //Initialize RTC
  Wire.begin();
  Rtc.begin();
  send_xbee("Current time: ");
  send_xbee((Rtc.now()).tostr(buf));
  send_xbee('\n');
  DateTime compiled = DateTime(__DATE__, __TIME__);
  DateTime newtime = DateTime(compiled.year(), compiled.month(), compiled.day(), compiled.hour() + 4, compiled.minute(), compiled.second() + 5);
  if (!Rtc.isrunning()) {
    Serial.println("Setting RTC to compiled time");
    send_xbee("Setting RTC to compiled time");
    Rtc.adjust(newtime);
  }
  if(Rtc.now() < newtime){
    Serial.println("Current time less than compiled time");
    Rtc.adjust(newtime);
  }
  send_xbee("Type anything to start filling");
  while(true){
    if(XBee.available() > 0){
      break;
    }
  }
  serial_flush();
  send_xbee("Beginning filling in 5 seconds");
  for(int i = 5; i >= 0; i--){
    XBee.print("Filling in ");
    XBee.print(i+1);
    XBee.print(" seconds\n");
    delay(1000);
  }
  send_xbee("Beginning filling");
  pump_on(BACKWARD);
  delay(PUMP_TIME);
  pump_delay(PROFILE_DELAY, BACKWARD, false);
  send_xbee("Type anything to exhaust");
  serial_flush();
  while(true){
    if(XBee.available() > 0){
      break;
    }
  }
  serial_flush();
  send_xbee("Beginning exhaust in 5 seconds");
  for(int i = 5; i >= 0; i--){
    XBee.print("Exhausting in ");
    XBee.print(i+1);
    XBee.print(" seconds\n");
    delay(1000);
  }
  send_xbee("Beginning exhaust");
  pump_on(FORWARD);
  delay(PUMP_TIME+4000);
  pump_delay(PROFILE_DELAY, FORWARD, false);
  serial_flush();
  send_xbee("Type anything to start profiles");
  while(true){
    if(!(a % 2)){
      pump_on(FORWARD);
    }
    else{
      pump_off();
    }
    if(XBee.available() > 0){
      break;
    }
    DateTime current = Rtc.now();
    send_xbee("R1");
    send_xbee(current.tostr(buf));
    delay(1000);
    a++;
  }
  serial_flush();
  pump_off();
  send_xbee("Beginning profiles in 10 seconds");
  for(int i = 9; i >= 0; i--){
    XBee.print("Diving in ");
    XBee.print(i+1);
    XBee.print(" seconds\n");
    delay(1000);
  }
  send_xbee("Beginning profile 1");
  //Descend
  //solenoidopen(); 
  pump_on(BACKWARD);
  delay(PUMP_TIME);
  //solenoidclose();
  pump_off();
  delay(PROFILE_DELAY);
  //pumpdelay(PROFILE_DELAY, BACKWARD, false);
  pump_off();
  //Ascent
  pump_on(FORWARD);
  //solenoidopen();
  delay(PUMP_TIME+4000);
  //solenoidclose();
  pump_off();
  //Report time + team number
  pump_delay(PUMP_TIME+6000, FORWARD, false);
  for(int i = 0; i < 10; i++){
    if(!(i % 2)){
      pump_on(FORWARD);
    }
    else{
      pump_off();
    }
    DateTime current = Rtc.now();
    send_xbee("Company number: R1");
    send_xbee(current.tostr(buf));
    delay(1000);
  }
  serial_flush();
  send_xbee("Type anything to start second profile");
  pump_on(FORWARD);
  while(true){
    if(XBee.available() > 0){
      break;
    }
  }
  serial_flush();
  pump_off();
  send_xbee("Beginning profile 2");
  //Descend
  pump_on(BACKWARD);
  delay(PUMP_TIME);
  pump_off();
  //pumpdelay(PROFILE_DELAY, BACKWARD, false);
  //pumpoff();
  delay(PROFILE_DELAY);
  //Ascent
  pump_on(FORWARD+4000);
  delay(PUMP_TIME+4000);
  //
  pump_off();
  pump_delay(PUMP_TIME+8000, FORWARD, false);
  pump_off();
  a=0;
}

void loop() {
  if(!(a % 2)){
      pump_on(FORWARD);
    }
    else{
      pump_off();
    }
  //Report time + team number
  DateTime current = Rtc.now();
  send_xbee("Company number: R1");
  send_xbee(current.tostr(buf));
  delay(1000);
  a++;
}

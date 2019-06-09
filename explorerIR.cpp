#include "pxt.h"
#include <map>
#include <vector>
#include "ReceiverIR.h"
using namespace pxt;
typedef vector<Action> vA;



enum class Pins{
  P0=  3,
  P1=  2,
  P2=  1,
  P3=  4,
  P4=  5,
  P5=  17,
  P6=  12,
  P7=  11,
  P8=  18,
  P9=  10,
  P10= 6,
  P11= 26,
  P12= 20,
  P13= 23,
  P14= 22,
  P15= 21,
  P16= 16,
  P19= 0,
  P20= 30
};

enum class RemoteButton
{
  One = 69,
  Two = 70,
  Three = 71,
  Four = 68,
  Five = 64,
  Six = 67,
  Seven = 7,
  Eight = 21,
  Nine = 9,
  Zero = 25,
  Asterisk = 22,
  Sharp = 13,
  Up = 24,
  Down = 82,
  Left = 8,
  Right = 90,
  Ok = 28
};

//% color=50 weight=80
//% icon="\uf1eb"
namespace explorerIR { 
  map<RemoteButton, vA> actions;
  map<RemoteButton, uint32_t> lastact;
  Timer tsb; 
  uint8_t buf[32];
  uint32_t now;
  ReceiverIR *rx;
  RemoteIR::Format fmt = RemoteIR::UNKNOWN;
  int msg;
  int IRcallbackNum;

  /**
  * button pushed.
  */
  //% blockId=ir_received_left_event
  //% block="on |%btn| button pressed"
  void onPressEvent(RemoteButton btn, Action body) {
    if(actions.find(btn) == actions.end()) {
        vector<Action> act;
        actions[btn] = act;
    } 
    actions[btn].push_back(body);
  }

  void cA(vA runner){for(int i=0;i<runner.size();i++){runAction0(runner[i]);} }

  void onReceivable(){
    int x = rx->getData(&fmt, buf, 32 * 8);
/*    
    uBit.serial.send(".");
    uBit.serial.send(buf[0]);
    uBit.serial.send(".");
    uBit.serial.send(buf[1]);
    uBit.serial.send(".");
    uBit.serial.send(buf[2]);
    uBit.serial.send(".");
    uBit.serial.send(buf[3]);
    uBit.serial.send(".");
    uBit.serial.send(buf[4]);
    uBit.serial.send(".");
    uBit.serial.send(buf[5]);
    uBit.serial.send(".");
    uBit.serial.send(buf[6]);
    uBit.serial.send(".");
    uBit.serial.send(buf[7]);
    uBit.serial.send(".");
    uBit.serial.send(buf[8]);
    uBit.serial.send(".");
    uBit.serial.send(buf[9]);
    uBit.serial.send(".");
    uBit.serial.send(buf[10]);
    uBit.serial.send(".");
    uBit.serial.send(buf[11]);
    uBit.serial.send(".");
    uBit.serial.send(buf[12]);
    uBit.serial.send(".");
    uBit.serial.send(buf[13]);
    uBit.serial.send(".");
    uBit.serial.send(buf[14]);
    uBit.serial.send(".");
    uBit.serial.send(buf[15]);
    uBit.serial.send(".");
    uBit.serial.send(buf[16]);
    uBit.serial.send(".");
    uBit.serial.send(buf[17]);
    uBit.serial.send(".");
    uBit.serial.send(buf[18]);
    uBit.serial.send(".");
    uBit.serial.send(buf[19]);
    uBit.serial.send(".");
    uBit.serial.send(buf[20]);
    uBit.serial.send(".");
    uBit.serial.send(buf[21]);
    uBit.serial.send(".");
    uBit.serial.send(buf[22]);
    uBit.serial.send(".");
    uBit.serial.send(buf[23]);
    uBit.serial.send(".");
    uBit.serial.send(buf[24]);
    uBit.serial.send(".");
    uBit.serial.send(buf[25]);
    uBit.serial.send(".");
    uBit.serial.send(buf[26]);
    uBit.serial.send(".");
    uBit.serial.send(buf[27]);
    uBit.serial.send(".");
    uBit.serial.send(buf[28]);
    uBit.serial.send(".");
    uBit.serial.send(buf[29]);
    uBit.serial.send(".");
    uBit.serial.send(buf[30]);
    uBit.serial.send(".");
    uBit.serial.send(buf[31]);
    uBit.serial.send(".");
    uBit.serial.send(buf[32]);
    uBit.serial.send(".");
    uBit.serial.send(buf[33]);
    uBit.serial.send(".");
    uBit.serial.send(buf[34]);
    uBit.serial.send(".");
    uBit.serial.send(buf[35]);
    uBit.serial.send(".end");
*/
    if(actions.find((RemoteButton)buf[2]) == actions.end()) 
        return;
    now = tsb.read_ms();
    if(now - lastact[(RemoteButton)buf[2]] < 100) return;
    lastact[(RemoteButton)buf[2]] = now;
    msg=(int)buf[2];
    cA(actions[(RemoteButton)msg]);  
  }

  void monitorIR(){
    while(1){
      while(rx->getState() != ReceiverIR::Received){ 
        uBit.sleep(50);
      }
      onReceivable();
    }
  }

  /**
  * initialises local variablesssss
  */
  //% blockId=ir_init
  //% block="connect ir receiver to %pin"
  void initIR(Pins pin){
    rx = new ReceiverIR((PinName)pin);
    tsb.start(); //interrupt timer for debounce
    create_fiber(monitorIR);
  }
  //% 
  int getParam(){
    return msg;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
}
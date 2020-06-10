# Introduction

The MoDou Robot package for BBC micro:bit extension is developed by DIDABOT co.ltd.

The Modou Robot Kit is designed for students and geeks who can use it for creative activities.
The robot has two wheels to move, a chargeable battery for power and many sensors to detect 
enviroment. Let us explore the world with Modou Robot. enjoy it!!!

![](https://github.com/ttrobotics/pxt-Modou/blob/master/icon.png)

# Basic usage

1. Open [Microsoft Makecode/microbit](https://pxt.microbit.org) and create a new project 
2. Search and add the `Modou` package
3. Use the drawers in the editor to drag out and arrange the blocks
4. Use `Modou_IR` drawer in the editor to control your robot remotely
5. Use `Modou_Sensor` drawer to get sense from the enviroment
6. Use `Modou_Light` drawer to control the brightness and colors of your robot lights.
7. use `Modou_Motion` drawer to move your robot forward, backward, turn left(right) .etc
8. Click `Download` to move your program to the micro:bit

# Examples

## IR Remote Control 
set event handler on IR remote control button pressed
```blocks
Modou_IR.onPressEvent(RemoteButton.One, function () {
    basic.showNumber(1)
})

Modou_IR.onPressEvent(RemoteButton.Two, function () {
    basic.showNumber(2)
})
```
## Sensors

### Ultrasonic Sensor
move ultrasonic sensor to a angle 
```blocks
basic.forever(function () {
    Modou_Sensor.SetUltraAngle(0)
    basic.pause(200)
    Modou_Sensor.SetUltraAngle(-80)
    basic.pause(200)
    Modou_Sensor.SetUltraAngle(80)
})
```
measure distance with ultrasonic sensor

```
basic.forever(function () {
    basic.pause(100)
    basic.showNumber(Modou_Sensor.Ultrasonic())
})
```
### Line Tracking Sensor
get line tracking state
```
basic.forever(function () {
    if (Modou_Sensor.trackingState(Modou_Sensor.TrackingState.State_0)) {
        basic.showString("go forward")
    } else if (Modou_Sensor.trackingState(Modou_Sensor.TrackingState.State_1)) {
        basic.showString("turn right")
    } else if (Modou_Sensor.trackingState(Modou_Sensor.TrackingState.State_2)) {
        basic.showString("turn left")
    } else if (Modou_Sensor.trackingState(Modou_Sensor.TrackingState.State_3)) {
        basic.showString("go backward")
    } else {
    	
    }
})
```

## Lights

### Base Color Lights
change color of base light
```
basic.forever(function () {
    Modou_Lights.setBaseLightColor(Modou_Lights.BaseLight.Front, Modou_Lights.LightColors.Red)
    basic.pause(500)
    Modou_Lights.setBaseLightColor(Modou_Lights.BaseLight.Front, Modou_Lights.LightColors.Yellow)
    basic.pause(500)
    Modou_Lights.setBaseLightColor(Modou_Lights.BaseLight.Front, Modou_Lights.LightColors.Green)
    basic.pause(500)
})
```

### Car Lights
set brightness of car lights
```
Modou_Lights.SetCarLightBrightness(Modou_Lights.CarLight.HeadLeft, 50)
Modou_Lights.SetCarLightBrightness(Modou_Lights.CarLight.HeadRight, 50)
Modou_Lights.SetCarLightBrightness(Modou_Lights.CarLight.TailLeft, 100)
Modou_Lights.SetCarLightBrightness(Modou_Lights.CarLight.TailRight, 100)

```

## Motion

run forward at full speed
```
Modou_Motion.runForward()
```
run backward at full speed
```
Modou_Motion.runBackward()
```
turn left
```
Modou_Motion.turnLeft()
```
turn right
```
Modou_Motion.turnRight()
```
brake the car
```
Modou_Motion.brake()
```
set wheel speed and direction by your need
```
Modou_Motion.runWheel(Modou_Motion.Wheel.left, 55, Modou_Motion.Direction.forward)
Modou_Motion.runWheel(Modou_Motion.Wheel.right, 66, Modou_Motion.Direction.forward)
```

# License

MIT


# Supported targets

* for PXT/microbit

```package
Modou=github:/ttrobotics/pxt-Modou
```

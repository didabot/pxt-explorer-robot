# Introduction

The Explorer Robot package for BBC micro:bit extension is developed by tangtu robot co.ltd.

The Explorer Robot Kit is designed for students and geeks who can use it for creative activities.
The robot has two wheels to move, a chargeable battery for power and many sensors to detect 
enviroment. Let us explore the world with Explorer Robot. enjoy it!!!

![](https://github.com/ttrobotics/pxt-explorer/blob/master/icon.png)

# Basic usage

1. Open [Microsoft Makecode/microbit](https://pxt.microbit.org) and create a new project 
2. Search and add the `explorer` package
3. Use the drawers in the editor to drag out and arrange the blocks
4. Use `Explorer_IR` drawer in the editor to control your robot remotely
5. Use `Explorer_Sensor` drawer to get sense from the enviroment
6. Use `Explorer_Light` drawer to control the brightness and colors of your robot lights.
7. use `Explorer_Motion` drawer to move your robot forward, backward, turn left(right) .etc
8. Click `Download` to move your program to the micro:bit

# Examples

## IR Remote Control 
set event handler on IR remote control button pressed
```blocks
Explorer_IR.onPressEvent(RemoteButton.One, function () {
    basic.showNumber(1)
})

Explorer_IR.onPressEvent(RemoteButton.Two, function () {
    basic.showNumber(2)
})
```
## Sensors

### Ultrasonic Sensor
move ultrasonic sensor to a angle 
```blocks
basic.forever(function () {
    Explorer_Sensor.SetUltraAngle(0)
    basic.pause(200)
    Explorer_Sensor.SetUltraAngle(-80)
    basic.pause(200)
    Explorer_Sensor.SetUltraAngle(80)
})
```
measure distance with ultrasonic sensor

```
basic.forever(function () {
    basic.pause(100)
    basic.showNumber(Explorer_Sensor.Ultrasonic())
})
```
### Line Tracking Sensor
get line tracking state
```
basic.forever(function () {
    if (Explorer_Sensor.trackingState(Explorer_Sensor.TrackingState.State_0)) {
        basic.showString("go forward")
    } else if (Explorer_Sensor.trackingState(Explorer_Sensor.TrackingState.State_1)) {
        basic.showString("turn right")
    } else if (Explorer_Sensor.trackingState(Explorer_Sensor.TrackingState.State_2)) {
        basic.showString("turn left")
    } else if (Explorer_Sensor.trackingState(Explorer_Sensor.TrackingState.State_3)) {
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
    Explorer_Lights.setBaseLightColor(Explorer_Lights.BaseLight.Front, Explorer_Lights.LightColors.Red)
    basic.pause(500)
    Explorer_Lights.setBaseLightColor(Explorer_Lights.BaseLight.Front, Explorer_Lights.LightColors.Yellow)
    basic.pause(500)
    Explorer_Lights.setBaseLightColor(Explorer_Lights.BaseLight.Front, Explorer_Lights.LightColors.Green)
    basic.pause(500)
})
```

### Car Lights
set brightness of car lights
```
Explorer_Lights.SetCarLightBrightness(Explorer_Lights.CarLight.HeadLeft, 50)
Explorer_Lights.SetCarLightBrightness(Explorer_Lights.CarLight.HeadRight, 50)
Explorer_Lights.SetCarLightBrightness(Explorer_Lights.CarLight.TailLeft, 100)
Explorer_Lights.SetCarLightBrightness(Explorer_Lights.CarLight.TailRight, 100)

```

## Motion

run forward at full speed
```
Explorer_Motion.runForward()
```
run backward at full speed
```
Explorer_Motion.runBackward()
```
turn left
```
Explorer_Motion.turnLeft()
```
turn right
```
Explorer_Motion.turnRight()
```
brake the car
```
Explorer_Motion.brake()
```
set wheel speed and direction by your need
```
Explorer_Motion.runWheel(Explorer_Motion.Wheel.left, 55, Explorer_Motion.Direction.forward)
Explorer_Motion.runWheel(Explorer_Motion.Wheel.right, 66, Explorer_Motion.Direction.forward)
```

# License

MIT


# Supported targets

* for PXT/microbit

```package
explorer=github:/ttrobotics/pxt-explorer
```

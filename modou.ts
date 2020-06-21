
namespace PCA9685_Drive {
    // definitions for PCA9685 chip
    let initialized = false
    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09
    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE)
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE)
        return val
    }

    function i2ccmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    export function initPCA9685(): void {
        if (!initialized) {
            i2cwrite(PCA9685_ADDRESS, MODE1, 0x00)
            setFreq(50); //1s / 20ms
            for (let idx = 0; idx < 16; idx++) {
                setPwm(idx, 0, 0);
            }
            initialized = true
        }
    }

    export function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000
        prescaleval /= 4096
        prescaleval /= freq
        prescaleval = prescaleval * 25 / 24  // 0.915
        prescaleval -= 1
        let prescale = prescaleval //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADDRESS, MODE1)
        let newmode = (oldmode & 0x7F) | 0x10 // sleep
        i2cwrite(PCA9685_ADDRESS, MODE1, newmode) // go to sleep
        i2cwrite(PCA9685_ADDRESS, PRESCALE, prescale) // set the prescaler
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode)
        basic.pause(1)
        //control.waitMicros(5000);
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1)  //1010 0001
    }

    export function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5)
        buf[0] = LED0_ON_L + 4 * channel
        buf[1] = on & 0xff
        buf[2] = (on >> 8) & 0xff
        buf[3] = off & 0xff
        buf[4] = (off >> 8) & 0xff
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf)
    }
}

//% color=#009ede icon="\uf0ee"
namespace Modou_Sensor {
    let ultraTrigPin = DigitalPin.P14
    let ultraEchoPin = DigitalPin.P15
    let leftLinePin = DigitalPin.P16
    let rightLinePin = DigitalPin.P8

    export enum TrackingState {
        //% block="● ●" enumval=0
        State_0,
        //% block="● ◌" enumval=1
        State_1,
        //% block="◌ ●" enumval=2
        State_2,
        //% block="◌ ◌" enumval=3
        State_3
    }

    /**
     * set ultrasonic sensor angle
     * @param degree [-80-80] degree of servo; eg: -80, 0, 80
    */
    //% blockId=modou_set_ultra_sensor_angle block="set ultrasonic sensor angle to |%angle| degree"
    //% weight=100
    //% angle.min=-80 angle.max=80
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function SetUltraAngle(angle: number) {
        let servoChanel = 6
        let angleDevice = (angle + 90) * -1 + 180 - 3;
        if (angleDevice < 0)
            angleDevice = 0
        if (angleDevice > 180)
            angleDevice = 180
        console.log("angle : " + angle)
        SetServoAngle(servoChanel, angleDevice)
    }

    /**
	 * get ultrasonic distance
	*/
    //% blockId=modou_get_ultrasonic_distance block="ultrasonic distance (cm)"
    //% weight=10
    export function Ultrasonic(): number {
        // send pulse
        pins.setPull(ultraTrigPin, PinPullMode.PullNone);
        pins.digitalWritePin(ultraTrigPin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(ultraTrigPin, 1);
        control.waitMicros(10);
        pins.digitalWritePin(ultraTrigPin, 0);

        // read pulse
        let d = pins.pulseIn(ultraEchoPin, PulseValue.High, 23000);  // 8 / 340 = 
        //return d * 5 / 3 / 58;
        console.log("Distance: " + d / 42);
        return d / 42;
    }

    function SetServoAngle(index: number, degree: number): void {
        PCA9685_Drive.initPCA9685()
        // 50hz: 20,000 us
        let v_us = (degree * 1800 / 180 + 600) // 0.6 ~ 2.4
        let value = v_us * 4096 / 20000
        PCA9685_Drive.setPwm(index, 0, value)
    }

    /**
     * get tracking state
     */
    //% blockid=modou_get_tracking_state 
    //% block="tracking state is %state"
    //% weight=10
    export function trackingState(state: TrackingState): boolean {
        let left_sensor = pins.digitalReadPin(leftLinePin)
        let right_sensor
            = pins.digitalReadPin(rightLinePin)

        console.log("left sensor : " + left_sensor);
        console.log("right sensor : " + right_sensor);

        if ((state == TrackingState.State_0) && (left_sensor == 0)
            && (right_sensor == 0)) {
            return true;
        } else if ((state == TrackingState.State_1) && (left_sensor == 0)
            && (right_sensor == 1)) {
            return true;
        } else if ((state == TrackingState.State_2) && (left_sensor == 1)
            && (right_sensor == 0)) {
            return true;
        } else if ((state == TrackingState.State_3) && (left_sensor == 1)
            && (right_sensor == 1)) {
            return true;
        }

        return false;
    }
}

//% color=#009ede icon="\uf110"
namespace Modou_Lights {
    let neoStrip: neopixel.Strip = neopixel.create(DigitalPin.P1, 3, NeoPixelMode.RGB)
    export enum BaseLight {
        //%block=Front
        Front = 0,
        //%block=Left
        Left = 1,
        //%block=Right
        Right = 2
    }

    export enum CarLight {
        //%block="left head"
        HeadLeft = 8,
        //%block="right head"
        HeadRight = 9,
        //%block="left tail"
        TailLeft = 7,
        //%block="right tail"
        TailRight = 5
    }

    export enum LightColors {
        //% block=red
        Red = 0xFF0000,
        //% block=orange
        Orange = 0xFFA500,
        //% block=yellow
        Yellow = 0xFFFF00,
        //% block=green
        Green = 0x00FF00,
        //% block=blue
        Blue = 0x0000FF,
        //% block=indigo
        Indigo = 0x4b0082,
        //% block=violet
        Violet = 0x8a2be2,
        //% block=purple
        Purple = 0xFF00FF,
        //% block=white
        White = 0xFFFFFF,
        //% block=black
        Black = 0x000000
    }

    // set car light brightness
    //% blockId=modou_set_car_light_brightness 
    //% block="set |%light| light brightness to |%level"
    //% weight=10
    //% level.min=0 level.max=100
    export function SetCarLightBrightness(light: CarLight, level: number): void {
        PCA9685_Drive.initPCA9685()
        level = level * 40; // map 100 to 4096
        if (level >= 4096) {
            level = 4095
        }
        PCA9685_Drive.setPwm(light, 0, level);
    }

    // set all car lights brightness
    //% blockId=modou_set_all_car_lights_brightness block="set all car lights brightness to %level"
    //% weight=10
    //% level.min=0 level.max=100
    export function SetAllCarLightsBrightness(level: number): void {
        SetCarLightBrightness(CarLight.HeadLeft, level)
        SetCarLightBrightness(CarLight.HeadRight, level)
        SetCarLightBrightness(CarLight.TailLeft, level)
        SetCarLightBrightness(CarLight.TailRight, level)
    }

    // turn off car light
    //% blockId=modou_turn_off_car_light block="turn |%light| light off"
    //% weight=10
    export function TurnCarLightOff(light: CarLight): void {
        SetCarLightBrightness(light, 0);
    }

    // turn all car lights off
    //% blockId=modou_turn_all_car_lights_off block="turn all car lights off"
    //% weight=10
    export function TurnAllCarLightsOff(): void {
        TurnCarLightOff(CarLight.HeadLeft);
        TurnCarLightOff(CarLight.HeadRight);
        TurnCarLightOff(CarLight.TailLeft);
        TurnCarLightOff(CarLight.TailRight);
    }

    /**
     * set base light to a given color. 
    */
    //% blockId="modou_set_base_light_color" block="set |%led| base light to |%color"
    //% weight=10
    export function setBaseLightColor(light: BaseLight, color: LightColors): void {
        neoStrip.setPixelColor(light, color)
        neoStrip.show()
    }

    /**
     * set all base lights to a given color. 
    */
    //% blockId="modou_set_all_base_lights_color" block="set all base lights to %color"
    //% weight=10
    export function setAllBaseLightsColor(color: LightColors): void {
        neoStrip.setPixelColor(BaseLight.Front, color)
        neoStrip.setPixelColor(BaseLight.Left, color)
        neoStrip.setPixelColor(BaseLight.Right, color)
        neoStrip.show()
    }

    /**
     * clear all base lights. 
    */
    //% blockId=modou_clear_all_base_lights block="clear all base lights"
    //% weight=10
    export function ClearAllBaseLights(): void {
        neoStrip.clear()
        neoStrip.show()
    }
}

//% color=#009ede icon="\uf207"
namespace Modou_Motion {
    export enum Wheel {
        //% block="right wheel"
        right = 0x1,
        //% block="left wheel"
        left = 0x2
    }

    export enum Direction {
        //% block="forward"
        forward,
        //% block="backward"
        backward
    }

    export enum ClockDir {
        //% block="clockwise"
        cw,
        //% block="counter clockwise"
        ccw
    }

    // run wheel at a given speed
    //% blockId=modou_run_wheel block="run |%w| at speed |%speed| %dir" blockGap=8
    //% weight=50
    //% speed.min=0 speed.max=100
    export function runWheel(w: Wheel, speed: number, dir: Direction): void {
        PCA9685_Drive.initPCA9685()

        speed = speed * 40.96; // scaling 100 to 4096 
        if (speed > 4095) {
            speed = 4095
        }

        if (w > 2 || w <= 0)
            return

        let pp = (w - 1) * 2
        let pn = (w - 1) * 2 + 1

        if (w == Wheel.right) {
            if (dir == Direction.forward) {
                PCA9685_Drive.setPwm(pp, 0, 0)
                PCA9685_Drive.setPwm(pn, 0, speed)
            } else {
                PCA9685_Drive.setPwm(pp, 0, speed)
                PCA9685_Drive.setPwm(pn, 0, 0)
            }
        } else if (w == Wheel.left) {
            if (dir == Direction.forward) {
                PCA9685_Drive.setPwm(pp, 0, speed)
                PCA9685_Drive.setPwm(pn, 0, 0)
            } else {
                PCA9685_Drive.setPwm(pp, 0, 0)
                PCA9685_Drive.setPwm(pn, 0, speed)
            }
        }
    }

    // run forward at a specified speed
    //% blockId=modou_run_forward_specified_speed block="run forward at speed |%speed" blockGap=8
    //% weight=90
    //% speed.min=0 speed.max=100
    export function runForwardAtSpecifiedSpeed(speed: number): void {
        runWheel(Wheel.left, speed, Direction.forward);
        runWheel(Wheel.right, speed, Direction.forward)
    }

    // run backward at a specified speed
    //% blockId=modou_run_backward_specified_speed block="run backward at speed |%speed" blockGap=8
    //% weight=80
    //% speed.min=0 speed.max=100
    export function runBackwardAtSpecifiedSpeed(speed: number): void {
        runWheel(Wheel.left, speed, Direction.backward);
        runWheel(Wheel.right, speed, Direction.backward)
    }

    // turn left at specified speed
    //% blockId=modou_turn_left_specified_speed block="turn left at speed |%speed|" blockGap=8
    //% weight=70
    //% speed.min=0 speed.max=100
    export function turnLeftAtSpecifiedSpeed(speed: number): void {
        runWheel(Wheel.left, 0, Direction.backward);
        runWheel(Wheel.right, speed, Direction.forward)
    }

    // turn right at specified speed
    //% blockId=modou_turn_right_specified_speed block="turn right at speed |%speed|" blockGap=8
    //% weight=60
    //% speed.min=0 speed.max=100
    export function turnRightAtSpecifiedSpeed(speed: number): void {
        runWheel(Wheel.left, speed, Direction.forward);
        runWheel(Wheel.right, 0, Direction.backward)
    }

    // brake and stop move
    //% blockId=modou_brake block="brake" blockGap=8
    //% weight=50
    export function brake(): void {
        runWheel(Wheel.left, 0, Direction.forward);
        runWheel(Wheel.right, 0, Direction.forward)
    }

    // spin at a speed
    //% blockId=modou_spin_specified_speed block="spin |%dir| at speed |%speed|" blockGap=8
    //% weight=40
    //% speed.min=0 speed.max=100
    export function spin(speed: number, dir: ClockDir): void {
        if (dir == ClockDir.cw) {
            runWheel(Wheel.left, speed, Direction.forward);
            runWheel(Wheel.right, speed, Direction.backward)
        }
        else {
            runWheel(Wheel.left, speed, Direction.backward);
            runWheel(Wheel.right, speed, Direction.forward)
        }
    }
}
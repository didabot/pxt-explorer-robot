//% color=#0fbc11 weight=10 icon="\uf013"
namespace explorer {

    let ultraTrigPin = DigitalPin.P14
    let ultraEchoPin = DigitalPin.P15
    let leftLinePin = DigitalPin.P16
    let rightLinePin = DigitalPin.P19
    let neoStrip: neopixel.Strip = neopixel.create(DigitalPin.P1, 3, NeoPixelMode.RGB)

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

    export enum Motors {
        //% block="M1"
        M1 = 0x1,
        //% block="M2"
        M2 = 0x2,
    }

    export enum LineSensor {
        //% block="Left"
        Left = 0x1,
        //% block="Right"
        Right = 0x2
    }

    export enum ColorLeds {
        //%block=FrontLed
        FrontLed = 0,
        //%block=LeftLed
        LeftLed = 1,
        //%block=RightLed
        RightLed = 2
    }

    export enum CarLight {
        //%block=HeadLeft
        HeadLeft = 8,
        //%block=HeadRight
        HeadRight = 9,
        //%block=TailLeft
        TailLeft = 7,
        //%block=TailRight
        TailRight = 5,
    }

    /**
     * Well known colors for a NeoPixel strip
    */
    export enum LedColors {
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

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADDRESS, MODE1, 0x00)
        setFreq(50); //1s / 20ms
        for (let idx = 0; idx < 16; idx++) {
            setPwm(idx, 0, 0);
        }
        initialized = true
    }

    function setFreq(freq: number): void {
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

    function setPwm(channel: number, on: number, off: number): void {
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

    function stopMotor(index: number) {
        setPwm((index - 1) * 2, 0, 0)
        setPwm((index - 1) * 2 + 1, 0, 0)
    }

    // Run single motor
    //% blockId=explorer_motor_run block="Motor Speed|%index|Speed %speed "
    //% weight=85
    //% speed.min=-100 speed.max=100
    //% advanced=true
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function MotorRun(index: Motors, speed: number): void {
        if (!initialized) {
            initPCA9685()
        }
        speed = speed * 40; // map 100 to 4096
        if (speed >= 4096) {
            speed = 4095
        }
        if (speed <= -4096) {
            speed = -4095
        }
        if (index > 2 || index <= 0)
            return
        let pp = (index - 1) * 2
        let pn = (index - 1) * 2 + 1
        if (speed >= 0) {
            setPwm(pp, 0, speed)
            setPwm(pn, 0, 0)
        } else {
            setPwm(pp, 0, 0)
            setPwm(pn, 0, -speed)
        }
    }

    /**
	 * Run two motors at the same time
	 * @param speedL [-100-100] speed of motor; eg: 50
	 * @param speedR [-100-100] speed of motor; eg: 50
	*/
    //% blockId=explorer_motor_dual block="Motor Speed |Left %speedL|Right %speedR"
    //% weight=84
    //% speedL.min=-100 speedL.max=100
    //% speedR.min=-100 speedR.max=100
    export function MotorRunDual(speedL: number, speedR: number): void {
        //speedL = -speedL
        let motor_left = Motors.M1
        let motor_right = Motors.M2
        MotorRun(motor_left, speedL);   //100 map to 255
        MotorRun(motor_right, speedR);
    }

    //% blockId=explorer_stop block="Motor Stop|%index|"
    //% weight=80
    export function MotorStop(index: Motors): void {
        MotorRun(index, 0);
    }

    //% blockId=explorer_stop_all block="Motor Stop All"
    //% weight=79
    //% blockGap=50
    export function MotorStopAll(): void {
        for (let idx = 1; idx <= 2; idx++) {
            stopMotor(idx);
        }
    }

    function SetServoAngle(index: number, degree: number): void {
        if (!initialized) {
            initPCA9685()
        }
        // 50hz: 20,000 us
        let v_us = (degree * 1800 / 180 + 600) // 0.6 ~ 2.4
        let value = v_us * 4096 / 20000
        setPwm(index, 0, value)
    }

    /**
     * Set Ultrasonic Sensor Angle
     * @param degree [0-180] degree of servo; eg: 0, 90, 180
    */
    //% blockId=explorer_set_ultra_angle block="Move Ultrasonic|Angle %angle"
    //% weight=100
    //% angle.min=0 angle.max=180
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function SetUltraAngle(angle: number) {
        let servoChanel = 6
        SetServoAngle(servoChanel, angle)
    }

    // Set car light brightness
    //% blockId=set_car_light_brightness block="Set Car Light|Light|%index|Brightness %level "
    //% weight=85
    //% level.min=0 level.max=100
    //% advanced=true
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function SetCarLightBrightness(index: CarLight, level: number): void {
        if (!initialized) {
            initPCA9685()
        }

        level = level * 40; // map 100 to 4096
        if (level >= 4096) {
            level = 4095
        }
        
        setPwm(index, 0, level);
    }

    // Set all car lights brightness
    //% blockId=set_all_car_lights_brightness block="Set All Car Lights|Brightness %level "
    //% weight=85
    //% level.min=0 level.max=100
    //% advanced=true
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function SetAllCarLightsBrightness(level: number): void {
        SetCarLightBrightness(CarLight.HeadLeft, level)
        SetCarLightBrightness(CarLight.HeadRight, level)
        SetCarLightBrightness(CarLight.TailLeft, level)
        SetCarLightBrightness(CarLight.TailRight, level)
    }

    // Turn off car light
    //% blockId=turn_off_car_light block="Turn Off Car Light|Light|%index"
    //% weight=85
    //% advanced=true
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function TurnOffCarLight(index: CarLight): void {
        SetCarLightBrightness(index, 0);
    }

    // Turn off all car lights
    //% blockId=turn_off_all_car_lights block="Turn Off All Car Lights"
    //% weight=85
    //% advanced=true
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function TurnOffAllCarLights(): void {
        TurnOffCarLight(CarLight.HeadLeft);
        TurnOffCarLight(CarLight.HeadRight);
        TurnOffCarLight(CarLight.TailLeft);
        TurnOffCarLight(CarLight.TailRight);
    }
    
    /**
	 * Get Ultrasonic Distance
	*/
    //% blockId=explorer_ultrasonic block="Ultrasonic Distance"
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

    /**
	 * line follow left
	*/
    //% blockId=explorer_line_state block="Line Sensor State|sensor %sensor|"
    //% weight=10
    export function lineSensorState(sensor: LineSensor): number {

        let pin = leftLinePin
        if (sensor == LineSensor.Left) {
            pin = leftLinePin;
        }
        else {
            pin = rightLinePin;
        }

        let state = 0
        if (pins.digitalReadPin(pin) == 1) {
            state = 1
        }
        else {
            state = 0;
        }

        return state
    }

    /**
     * Set LED to a given color (range 0-255 for r, g, b). 
     * @param led position of the NeoPixel in the strip
     * @param rgb RGB color of the LED
    */
    //% blockId="explorer_set_pixel_color" block="set led color at %led|to %rgb"
    //% blockGap=8
    //% weight=80
    export function setLedColor(led: ColorLeds, rgb: LedColors): void {
        neoStrip.setPixelColor(led, rgb)
        neoStrip.show()
    }

    /**
     * Set All LEDs to a given color (range 0-255 for r, g, b). 
     * @param rgb RGB color of the LEDs
    */
    //% blockId="explorer_set_all_pixel_color" block="set all leds color to %rgb"
    //% blockGap=8
    //% weight=80
    export function setAllLedColor(rgb: LedColors): void {
        neoStrip.setPixelColor(ColorLeds.FrontLed, rgb)
        neoStrip.setPixelColor(ColorLeds.LeftLed, rgb)
        neoStrip.setPixelColor(ColorLeds.RightLed, rgb)
        neoStrip.show()
    }

    /**
     * Clear All LEDs(turn off all leds). 
    */
    //% blockId=explorer_clear_all_leds block="Clear All LEDs"
    //% weight=80
    //% blockGap=8
    export function ClearAllLeds(): void {
        neoStrip.clear()
        neoStrip.show()
    }
}

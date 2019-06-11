// Auto-generated. Do not edit.



    //% color=50 weight=80
    //% icon="\uf1eb"
declare namespace explorerIR {

    /**
     * initialises local variablesssss
     */
    //% blockId=ir_init
    //% block="connect ir receiver to %pin" shim=explorerIR::initIR
    function initIR(pin: Pins): void;

    /**
     * button pushed.
     */
    //% blockId=ir_received_left_event
    //% block="on |%btn| button pressed" shim=explorerIR::onPressEvent
    function onPressEvent(btn: RemoteButton, body: () => void): void;
}

// Auto-generated. Do not edit. Really.

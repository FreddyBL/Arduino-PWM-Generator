

export const commands = {
    digital_write_high: 0,
    digital_write_low: 1,
    toggle:2,
    turn_on:3,
    pinmode_input:4,
    pinmode_input_pullup:5,
    pinmode_output:6,
    digital_read:7,
    analog_read:8,
    analog_write:9,
    turn_off:10,
    pwm:11,
    pwm_period:12,
    blink_enable:13,
    blink_disable:14,
    sync:15,
    set_unit:16,
    reset: 17
};

export const pinModes = {
    in: 0,
    out: 1
};

export const units = {
    'ms': 0,
    'μs': 1
};

export const sendCommand = (socket, pin, cmd, args = [2, 0]) => {
    let msg = {
        pin: pin,
        cmd: cmd,
        args: args
    }
    socket.send(JSON.stringify(msg));
}

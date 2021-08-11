/*
MIT License

Copyright (c) 2021 Freddy Borja

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


*/

#include "AsyncReader.h"
#include "binBuffer.h"

AsyncReader aReader;

#define BAUD_RATE       9600
#define TOTAL_PINS      20
#define READY_SIGNAL   "READY"
#define TIMEOUT         100
bool isReady = false;
constexpr int ERROR = -1;


enum class Units{
    millisecs = 0,
    microsecs = 1
};
enum Commands
{
    DIGITAL_WRITE_HIGH,//
    DIGITAL_WRITE_LOW,//
    TOGGLE,
    TURN_ON,
    PINMODE_INPUT,
    PINMODE_INPUT_PULLUP,//
    PINMODE_OUTPUT,
    DIGITAL_READ,
    ANALOG_READ,
    ANALOG_WRITE,
    TURN_OFF,
    PWM,
    PWM_PERIOD,
    BLINK_ENABLE,
    BLINK_DISABLE,
    SYNC,
    SET_UNIT,
    RESET_SETTINGS,
};

struct cmdData{
    uint8_t pin;
    uint16_t val1;
    int val2;
    uint16_t cmd;
};

struct Data
{
    int pin;
    bool blinkOn;
    int pinMode;
    int blinkTimeMs;
    int startTimeMs;
    int periodMs;
    int onTimeNs;
    int endTimeMs;
    int dutyCycle;
    bool dwriteCalled;
    Units unit;
};
Data PinData[TOTAL_PINS];

void reset(int pin, int mode=OUTPUT)
{
    PinData[pin].blinkOn = false;
    PinData[pin].blinkTimeMs = 0;
    PinData[pin].startTimeMs = 0;
    PinData[pin].dwriteCalled = false;
    setPinMode(pin, mode);
}
void initializePins()
{
    for(int i = 0; i < TOTAL_PINS; i++)
    {
        PinData[i].unit = Units::millisecs;
        reset(i, OUTPUT);
        digitalWrite(i, LOW);
    }
}
bool is_digital(int pin){
    return (pin >= 0 && pin <= 13);
}
bool is_analog(int pin)
{
    return (pin >= A0 && pin <= A5);
}
bool is_pwm(int pin){
    return (pin == 11 | pin == 10 || pin == 9 || pin == 6 || pin == 5 || pin == 3);
}
bool is_out(int pin)
{
    return PinData[pin].pinMode == OUTPUT;
}

void setPinMode(int pin, int mode)
{
    pinMode(pin, mode);
    PinData[pin].pinMode = mode;
}

bool blink_all(int delay)
{
    //Only digital PINs
    for(int i = 0; i < 13; i++){
        blink(i, delay);
    }
}
bool toggle(int pin)
{
    if(is_out(pin))
    {
        bool state = static_cast<bool>(digitalRead(pin));
        digitalWrite(pin, !state);
        return true;
    }
    return false;
}


void pwm_with_duty_T(int pin, int period, int dutyCycle)
{
    reset(pin, OUTPUT);
    PinData[pin].periodMs = period;
    PinData[pin].dutyCycle = dutyCycle;
    PinData[pin].startTimeMs = time(pin);
    float duty_factor = static_cast<float>(dutyCycle) / 100.0f;
    PinData[pin].onTimeNs = static_cast<int>(period * duty_factor);
    PinData[pin].blinkOn = true;

}

void blink(int pin, int delay)
{
    reset(pin, OUTPUT);
    pwm_with_duty_T(pin, 2*delay, 50); // 50 percent duty cycle
}
void setAllMode(int mode)
{
    for(int i = 0; i < TOTAL_PINS; i++){
        reset(i, OUTPUT);
        setPinMode(i, mode);
    }
}
bool turnOnAll()
{
    for(int i = 0; i < TOTAL_PINS; i++)
    {
        reset(i, OUTPUT);
        turn_on(i);
    }
}


unsigned long time(int pin)
{
    return (PinData[pin].unit == Units::millisecs) ? millis() : micros();
}

void refresh()
{
    for(int i = 0; i < TOTAL_PINS; i++)
    {
        if(PinData[i].blinkOn)
        {
            int delta = time(i) - PinData[i].startTimeMs;
            const int endTime = PinData[i].periodMs;
            const int onTime = PinData[i].onTimeNs;
            if(delta < onTime)
            {
                if(!PinData[i].dwriteCalled){
                    digitalWrite(i, HIGH);
                    PinData[i].dwriteCalled = true;
                }
            }
            else if(delta >= onTime && delta < endTime)
            {
                if(PinData[i].dwriteCalled){
                    digitalWrite(i, LOW);
                    PinData[i].dwriteCalled = false;
                }
            }
            else{
                PinData[i].startTimeMs = time(i);
            }
        }
    }
}
bool turn_on(int pin)
{
    if(is_digital(pin))
    {
        reset(pin, OUTPUT);
        digitalWrite(pin, HIGH);
        return true;
    }
    return false;
}
bool turn_off(int pin)
{
    if(is_digital(pin))
    {
        reset(pin, OUTPUT);
        digitalWrite(pin, LOW);
        return true;
    }
    return false;
}

bool pwm(int pin, int value)
{
    if(is_pwm(pin)){
        reset(pin, OUTPUT);
        analogWrite(pin, value);
        return true;
    }
    return false;
}
int executeCmd(int pin, int cmd, int val1, int val2)
{
    switch(cmd)
    {
        case PINMODE_INPUT:
        {
            reset(pin, INPUT);
            setPinMode(pin, INPUT);
            break;
        }
        case PINMODE_INPUT_PULLUP:
        {
            reset(pin, INPUT_PULLUP);
            setPinMode(pin, INPUT_PULLUP);
            break;
        }
        case PINMODE_OUTPUT:
        {
            reset(pin, OUTPUT);
            setPinMode(pin, OUTPUT);
            break;
        }
        case DIGITAL_WRITE_HIGH:
        {
            reset(pin, OUTPUT);
            digitalWrite(pin, HIGH);
            break;
        }
        case DIGITAL_WRITE_LOW:
        {
            reset(pin, OUTPUT);
            digitalWrite(pin, LOW);
            break;
        }
        case ANALOG_READ:
        {
            int value = analogRead(pin);
            break;
        }
        case ANALOG_WRITE:
        {
            analogWrite(pin, val1);
            break;
        }
        case TURN_ON:
        {
            turn_on(pin);
            break;
        }
        case TURN_OFF:
        {
            turn_off(pin);
            break;
        }
        case TOGGLE:
        {
            toggle(pin);
            break;
        }
        case PWM:
        {
            pwm(pin, val1);
            break;
        }
        case PWM_PERIOD:
        {
            pwm_with_duty_T(pin, val1, val2);
            break;
        }
        case BLINK_ENABLE:
        {
            blink(pin, val1);
            break;
        }
        case BLINK_DISABLE:
        {
            reset(pin);
            break;
        }
        case SYNC:
        {
            for(int i = 0; i < TOTAL_PINS; i++)
            {
                if(PinData[i].blinkOn)
                {
                    pwm_with_duty_T(i, PinData[i].periodMs, PinData[i].dutyCycle);
                }
            }
            break;       
        }
        case SET_UNIT:
        {
            PinData[pin].unit = (val1 == static_cast<int>(Units::millisecs)) ? Units::millisecs : Units::microsecs;
            if(PinData[pin].blinkOn)
            {
                PinData[pin].startTimeMs = time(pin);
                PinData[pin].dwriteCalled = false;
            }
            break;
        }
        case RESET_SETTINGS:
        {
            initializePins();
            break;

        }
        default:
        {
            return ERROR;
        }
    }
}



void setup()
{
	Serial.begin(BAUD_RATE);
    initializePins();

}

void loop()
{
    if(!isReady){
        Serial.write(READY_SIGNAL);
        isReady = true;
    }
    aReader.read();
    if(aReader.done())
    {   
        const byte* bytes = aReader.data();
        uint8_t size = aReader.size();
        binBuffer bf (&(bytes[0]), size);
        const uint8_t pin = bf.readUInt8();
        const uint8_t cmd = bf.readUInt8();
        const uint32_t arg1 = bf.readUInt32();
        const uint32_t arg2 = bf.readUInt32();
        executeCmd(pin, cmd, arg1, arg2);
        aReader.restart();
    }
    refresh();
    
}
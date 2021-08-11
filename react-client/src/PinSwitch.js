

import { FormControlLabel } from '@material-ui/core'
import React from 'react'
import Switch from '@material-ui/core/Switch';

export default function PinSwitch({pin, wsocket, pinEnable, setPinEnable, disable}) {

    return (
        <div>
            <FormControlLabel
                control={
                <Switch
                    disabled={disable}
                    name="checkedB"
                    color="primary" 
                    checked={pinEnable} 
                    onChange={(event)=>{
                        //sendCommand(wsocket, pin, commands.toggle);
                        setPinEnable(event.target.checked);
                    }}
                />
                }
                label="Switch"
            />
        </div>
    )
}

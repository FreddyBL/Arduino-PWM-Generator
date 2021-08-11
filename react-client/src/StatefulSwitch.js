

import { FormControlLabel } from '@material-ui/core'
import React from 'react'
import { sendCommand } from './arduino'
import Switch from '@material-ui/core/Switch';

export default function StatefulSwitch({pin, wsocket, checked, setChecked, disable, label, args=[2, 0], cmdOnChecked, cmdOnUnchecked, callback}) {
    return (
        <div>
            <FormControlLabel
                control={
                <Switch
                    disabled={disable}
                    color="primary" 
                    checked={checked} 
                    onChange={(event)=>{
                        event.target.checked ? sendCommand(wsocket, pin, cmdOnChecked, args): sendCommand(wsocket, pin, cmdOnUnchecked, args);
                        setChecked((prevState) => {
                            if(callback != null){
                                callback(prevState);
                            }
                            return event.target.checked;
                        });
                    }}
                />
                }
                label={label}
            />
        </div>
    )
}

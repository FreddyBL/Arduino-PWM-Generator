import React, { useState } from "react";
import { commands, pinModes, sendCommand, units } from "./arduino";
import StatefulSwitch from "./StatefulSwitch";
import Slider from "./Slider";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import HighlightIcon from "@material-ui/icons/Highlight";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from '@material-ui/core/CardContent';
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    flexDirection: "row"
  },
  dividerFullWidth: {
    margin: `5px 0 0 ${theme.spacing(2)}px`,
  },
  dividerInset: {
    margin: `5px 0 0 ${theme.spacing(9)}px`,
  },
  Card:{
    borderRadius: '20px'
  },
  colorOff:{
    background: "#8e9aad"
  },
  colorOn: {
    background: "#60db67"
  },
  colorPWM:{
    background: "radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(119,255,80,1) 30%, rgba(0,212,255,1) 100%)"
  }
}));

const PinController = ({ pin, wsocket }) => {
  const [pinmode] = useState(pinModes.out);
  const [pinEnable, setPinEnable] = useState(false);
  const [pwmEnabled, setPwmEnabled] = useState(false);
  const [periodMinValue] = useState(0);
  const [periodMaxValue] = useState(1000);
  const [periodSliderVal, setPeriodSliderVal] = useState(500);
  const [dutyCycleVal, setDutyCycleVal] = useState(50);
  const [unit, setUnit] = useState("ms");
  const classes = useStyles();
  const [avatarColor, setAvatarColor] = useState(classes.colorOff);

  const onPeriodChange = (value) => {
    sendCommand(wsocket, pin, commands.pwm_period, [value, dutyCycleVal]);
  };

  const onDutyCycleChange = (value) => {
    sendCommand(wsocket, pin, commands.pwm_period, [periodSliderVal, value]);
  };

  const onUnitChanged = (event) => {
    setUnit(event.target.value);
    sendCommand(wsocket, pin, commands.set_unit, [units[event.target.value], 0]);
  };

  const PWMEnabledHandler = (oldPWMState) => {
    setPinEnable(false);

    setAvatarColor(oldPWMState ? classes.colorOff : classes.colorPWM);
  }
  const ToggleHandler = (oldToggleState) => {
    setAvatarColor(oldToggleState ? classes.colorOff : classes.colorOn);
  }
  return (
    <Card className={classes.Card}>
      <CardHeader
        avatar={
          <Avatar className={avatarColor}>
            <IconButton>
              <HighlightIcon />
            </IconButton>
          </Avatar>
        }
        title={`Pin ${pin}`}
        subheader="Digital Pin"
      />
      <CardContent>
        <List>
          <ListItem>
            <ListItemText primary="Toggle" />
            <StatefulSwitch
              pin={pin}
              wsocket={wsocket}
              checked={pinEnable}
              setChecked={setPinEnable}
              disable={pwmEnabled || pinmode === pinModes.in}
              label=""
              cmdOnChecked={commands.turn_on}
              cmdOnUnchecked={commands.turn_off}
              callback={ToggleHandler}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="PWM" />
            <StatefulSwitch
              pin={pin}
              wsocket={wsocket}
              checked={pwmEnabled}
              setChecked={setPwmEnabled}
              disable={pinmode === pinModes.in}
              label=""
              cmdOnChecked={commands.pwm_period}
              cmdOnUnchecked={commands.turn_off}
              args={[periodSliderVal, dutyCycleVal]}
              callback={PWMEnabledHandler}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Time unit" />
            <RadioGroup
              aria-label="unit"
              name="unit"
              value={unit}
              onChange={onUnitChanged}
              className={classes.root}
            >
              <FormControlLabel value="ms" control={<Radio />} label="ms" />
              <FormControlLabel value="μs" control={<Radio />} label="μs" />
            </RadioGroup>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary={`Period`} />
            <Slider
              style={{ textAlign: "center" }}
              min={periodMinValue}
              max={periodMaxValue}
              step={10}
              size={6}
              disabled={!pwmEnabled}
              label=""
              unit={unit}
              value={periodSliderVal}
              setValue={setPeriodSliderVal}
              onChange={onPeriodChange}
            ></Slider>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Duty Cycle" />
            <Slider
              style={{ textAlign: "center" }}
              min={0}
              max={100}
              step={10}
              size={3}
              disabled={!pwmEnabled}
              unit="%"
              label=""
              value={dutyCycleVal}
              setValue={setDutyCycleVal}
              onChange={onDutyCycleChange}
            ></Slider>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default PinController;

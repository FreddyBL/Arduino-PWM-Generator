import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
import Input from "@material-ui/core/Input";
import InputAdornment from '@material-ui/core/InputAdornment';
const useStyles = makeStyles({
  root: {
    width: 250
  },
  input: {
    textAlign: "center"
  }
});

export default function InputSlider(props) 
{
  const classes = useStyles();
  const {
    min,
    max,
    step,
    label,
    value,
    setValue,
    children,
    size,
    unit,
    disabled,
    onChange,
  } = props;

  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
    onChange(newValue);
  };

  const handleInputChange = (event) => {
    setValue(event.target.value === "" ? "" : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < min) {
      setValue(min);
    } else if (value > max) {
      setValue(max);
    }
  };

  return (
    <div className={classes.root}>
      <Typography id="input-slider" gutterBottom>
        {label}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          {children}
        </Grid>
        <Grid item xs>
          <Slider
            value={typeof value === "number" ? value : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            min={min}
            max={max}
            disabled={disabled}
            step={step}

          />
        </Grid>
        <Grid item>
          <Input
            className={classes.input}
            value={value}
            margin="dense"
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            fullWidth={true}
            endAdornment={<InputAdornment position="end">{unit}</InputAdornment>}
            inputProps={{
              step: step,
              min: min,
              max: max,
              
              type: "number",
              size: size,
              "aria-labelledby": "input-slider"
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
}
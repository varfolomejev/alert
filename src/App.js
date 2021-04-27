import './App.css';
import { Input, InputLabel, MenuItem, FormControl, Select, Button, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles((theme) => ({
  form: {
    display: 'block',
    width: '90%',
  },
  formControl: {
    background: '#fff',
    marginBottom: 15,
    borderRadius: '5px',
  },
  input: {
    textAlign: 'center',
  }
}));

function App() {
  const classes = useStyles();
  const [settings, setSettings] = useState({
    selectedHour: undefined,
    selectedMinute: undefined,
    interval: undefined,
  });

  const hours = [];
  const minutes = [];
  for(let i = 1; i <= 60; i++) {
    if(i < 25) {
      hours.push(i);
    }
    minutes.push(i);
  }

  ipcRenderer.on('UPDATE_SETTINGS', (event, settings) => {
    console.log('setSettings(settings);', settings)
    setSettings(settings);
  });

  const onSubmitHandler = (event) => {
    event.preventDefault();
    ipcRenderer.send('SAVE_SETTINGS_AND_RUN', {
      selectedHour: parseInt(event.target.elements.selectedHour.value),
      selectedMinute: parseInt(event.target.elements.selectedMinute.value),
      interval: parseInt(event.target.elements.interval.value),
    });
  }

  return (
    <>
      {(!settings.selectedHour || !settings.selectedMinute || !settings.interval) && <CircularProgress />}
      {(settings.selectedHour || settings.selectedMinute || settings.interval) && <>
        <div className="App">
          <header className="App-header">
            <h1>Settings</h1>
            <form className={classes.form} onSubmit={onSubmitHandler}>
              <FormControl fullWidth={true} className={classes.formControl}>
                <InputLabel>Start Hour</InputLabel>
                <Select name='selectedHour' defaultValue={settings.selectedHour}>
                  {hours.map((hour) => <MenuItem key={hour} value={hour}>{hour}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth={true} className={classes.formControl}>
                <InputLabel>Start Minute</InputLabel>
                <Select name='selectedMinute' defaultValue={settings.selectedMinute}>
                  {minutes.map((minute) => <MenuItem key={minute} value={minute}>{minute}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth={true} className={classes.formControl}>
                <InputLabel>Interval (minutes)</InputLabel>
                <Input name='interval' type="number" defaultValue={settings.interval}/>
              </FormControl>
              <FormControl fullWidth={true} className={classes.formControl}>
                <Button variant="contained" color="primary" type="submit">
                  Save and run
                </Button>
              </FormControl>
            </form>
          </header>
        </div>
      </>}
    </>
  );
}

export default App;

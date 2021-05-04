const fs = require('fs');
const homedir = require('os').homedir();
const configFilePath = `${homedir}/.alert.config.json`;
const defaultConfig = {
  notification: {
    title: 'Alert',
    description: 'let\'s rest'
  },
  selectedHour: 8,
  selectedMinute: 30,
  interval: 180,
};

class Settings {
  get() {
    let savedConfig = {};
    if (fs.existsSync(configFilePath)) {
      try {
        savedConfig = JSON.parse(fs.readFileSync(configFilePath).toString());
      } catch (e) {
        console.log('config parsing error');
      }
    }
    return {
      ...defaultConfig,
      ...savedConfig,
    };
  }
  save(newConfig, cb) {
    fs.writeFile(configFilePath, JSON.stringify(newConfig), cb);
  }
}

module.exports = new Settings();
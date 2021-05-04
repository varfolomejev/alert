const CronJob = require('cron').CronJob;

class Ticker {
  run(config, cb) {
    this.config = config;
    this.stop();
    this.setNextTick();
    this.startNewJob(cb);
  }

  stop() {
    if (this.job) {
      this.job.stop();
    }
    this.nextTick = null;
  }

  startNewJob(cb) {
    this.job = new CronJob('*/5 * * * * *', () => {
      const curTime = this.getDate();
      if(curTime > this.nextTick) {
        cb();
      }
    });
    this.job.start();
  }

  setNextTick() {
    const curTime = this.getDate();
    const dateString = `${curTime.getFullYear()}-${`0${curTime.getMonth() + 1}`.substr(-2)}-${`0${curTime.getDate()}`.substr(-2)} ${this.config.selectedHour}:${this.config.selectedMinute}:00`;
    let startTime = new Date(dateString);
    while (startTime < curTime) {
      startTime = new Date(startTime.getTime() + this.config.interval * 60000);
    }
    this.nextTick = startTime;
  }

  getDate() {
    const curTime = new Date();
    return new Date(curTime.getTime());
  }
}

module.exports = new Ticker();
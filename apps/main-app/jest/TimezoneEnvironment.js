const { TestEnvironment: NodeEnvironment } = require("jest-environment-node");

/**
 * Pins `process.env.TZ` for the whole test file.
 *
 * V8 only refreshes its date cache when `TZ` is assigned in the worker process,
 * so it must be set before the sandbox globals exist — assigning it from inside
 * a test has no effect. Workers are reused, hence the restore on teardown.
 */
class TimezoneEnvironment extends NodeEnvironment {
  constructor(config, context) {
    const timezone = config.projectConfig.testEnvironmentOptions?.timezone;
    const previous = process.env.TZ;
    if (timezone) {
      process.env.TZ = timezone;
    }
    super(config, context);
    this.previousTimezone = previous;
  }

  async teardown() {
    process.env.TZ = this.previousTimezone;
    await super.teardown();
  }
}

module.exports = TimezoneEnvironment;

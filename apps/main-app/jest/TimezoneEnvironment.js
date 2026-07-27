const { TestEnvironment: NodeEnvironment } = require("jest-environment-node");

/**
 * Test environment that pins `process.env.TZ` for the whole test file.
 *
 * Jest workers are reused across files, and V8 only refreshes its date cache
 * when `process.env.TZ` is assigned in the worker process itself — assigning it
 * from inside a test has no effect. Setting it before the sandbox globals are
 * created is therefore the only way to control the zone per file, and the
 * previous value must be restored on teardown so the next file in the same
 * worker is not affected.
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

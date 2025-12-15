const notifee = {
  onForegroundEvent: jest.fn(),
  onBackgroundEvent: jest.fn(),
  createChannel: jest.fn(),
  displayNotification: jest.fn(),
  cancelNotification: jest.fn(),
  getTriggerType: jest.fn()
};

const TriggerType = {
  TIMESTAMP: "timestamp",
  EVENT: "event"
};

const AndroidImportance = {
  HIGH: "high",
  DEFAULT: "default"
};

export default notifee;
export { TriggerType, AndroidImportance };

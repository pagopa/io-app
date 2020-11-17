/**
 * A mocked version of the instabug-reactnative package.
 */

const BugReporting = {
  onSDKDismissedHandler: jest.fn(),
  setReportTypes: jest.fn(),
  reportType: {},
  showWithOptions: jest.fn(),
  option: {}
};

const Replies = {
  setInAppNotificationsEnabled: jest.fn(),
  setOnNewReplyReceivedCallback: jest.fn(() => null),
  show: jest.fn(),
  hasChats: jest.fn(),
  getUnreadRepliesCount: jest.fn(() => Promise.resolve(0))
};

const Chats = {
  setEnabled: jest.fn(),
  show: jest.fn()
};

export { BugReporting, Replies, Chats };

export default {
  startWithToken: jest.fn(),
  locale: jest.fn(),
  setChatNotificationEnabled: jest.fn(),
  invocationEvent: {},
  BugReporting,
  Replies,
  Chats
};

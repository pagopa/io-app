/**
 * A mocked version of the instabug-reactnative package.
 */

enum reportType {
  bug,
  feedback,
  question
}

const BugReporting = {
  onSDKDismissedHandler: jest.fn(),
  setReportTypes: jest.fn(),
  showWithOptions: jest.fn(),
  option: {},
  reportType
};

const Replies = {
  setInAppNotificationsEnabled: jest.fn(),
  setOnNewReplyReceivedCallback: jest.fn(() => null),
  show: jest.fn(),
  getUnreadRepliesCount: jest.fn(() => Promise.resolve(0)),
  hasChats: jest.fn()
};

const Chats = {
  setEnabled: jest.fn(),
  show: jest.fn()
};

export { BugReporting, Replies, Chats };

export default {
  invocationEvent: {},
  instabugLog: jest.fn(),
  locale: jest.fn(),
  logDebug: jest.fn(),
  logError: jest.fn(),
  logInfo: jest.fn(),
  logVerbose: jest.fn(),
  logWarn: jest.fn(),
  openInstabugReplies: jest.fn(),
  openInstabugQuestionReport: jest.fn(),
  removeUserAttribute: jest.fn(),
  setChatNotificationEnabled: jest.fn(),
  setEnabledAttachmentTypes: jest.fn(),
  setInstabugSupportTokenAttribute: jest.fn(),
  setInstabugUserAttribute: jest.fn(),
  setUserAttribute: jest.fn(),
  startWithToken: jest.fn(),
  BugReporting,
  Replies,
  Chats
};

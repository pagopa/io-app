/**
 * A mocked version of io-react-native-zendesk
 */

export default {
  init: jest.fn(),
  setUserIdentity: jest.fn(),
  openTicket: jest.fn(),
  showTickets: jest.fn(),
  resetCustomFields: jest.fn(),
  resetLog: jest.fn(),
  resetTags: jest.fn(),
  addTicketCustomField: jest.fn(),
  appendLog: jest.fn(),
  hasOpenedTickets: jest.fn(),
  addTicketTag: jest.fn(),
  dismiss: jest.fn(),
  zendeskCategoryId: jest.fn(),
  zendeskSendCategory: jest.fn()
};

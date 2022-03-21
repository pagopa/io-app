/**
 * A mocked version of io-react-native-zendesk
 */

export default {
  init: jest.fn(),
  setUserIdentity: jest.fn(),
  openTicket: jest.fn(),
  showTickets: jest.fn(),
  addTicketCustomField: jest.fn(),
  addTicketTag: jest.fn(),
  appendLog: jest.fn()
};

import {
  anonymousAssistanceAddressWithSubject,
  canShowHelp,
  handleSendAssistanceLog
} from "../supportAssistance";
import { ToolEnum } from "../../../definitions/content/AssistanceToolConfig";
import * as configureInstabug from "../../boot/configureInstabug";
import MockZendesk from "../../__mocks__/io-react-native-zendesk";

jest.mock("../../config", () => ({ zendeskEnabled: true }));
describe("anonymousAssistanceAddress", () => {
  it("if the subcategory is undefined should return the email link with only the category as subject", () => {
    const mockedEmailLink = "mailto:io@assistenza.pagopa.it?subject=";
    const mockedCategory = "mockedCategory";

    expect(anonymousAssistanceAddressWithSubject(mockedCategory)).toBe(
      mockedEmailLink + mockedCategory
    );
  });
  it("if the subcategory is defined should return the email link with the category and the subcategory as subject", () => {
    const mockedEmailLink = "mailto:io@assistenza.pagopa.it?subject=";
    const mockedCategory = "mockedCategory";
    const mockedSubcategory = "mockedSubcategory";

    expect(
      anonymousAssistanceAddressWithSubject(mockedCategory, mockedSubcategory)
    ).toBe(`${mockedEmailLink}${mockedCategory}: ${mockedSubcategory}`);
  });
});

describe("canShowHelp", () => {
  it("if assistanceTool is Instabug, should return true", () => {
    expect(canShowHelp(ToolEnum.instabug, true)).toBeTruthy();
    expect(canShowHelp(ToolEnum.instabug, false)).toBeTruthy();
  });
  it("if assistanceTool is Zendesk, should return true if the email is validated", () => {
    expect(canShowHelp(ToolEnum.zendesk, true)).toBeTruthy();
    expect(canShowHelp(ToolEnum.zendesk, false)).toBeFalsy();
  });
  it("if assistanceTool is web or none, should return false", () => {
    expect(canShowHelp(ToolEnum.web, true)).toBeFalsy();
    expect(canShowHelp(ToolEnum.none, true)).toBeFalsy();
    expect(canShowHelp(ToolEnum.web, false)).toBeFalsy();
    expect(canShowHelp(ToolEnum.none, false)).toBeFalsy();
  });
});

describe("handleSendAssistanceLog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("if the assistanceTool is Instabug should call the instabugLog function", () => {
    const instabugLogSpy = jest
      .spyOn(configureInstabug, "instabugLog")
      .mockImplementation();
    handleSendAssistanceLog(ToolEnum.instabug, "mockedLog");
    expect(instabugLogSpy).toBeCalled();
    expect(MockZendesk.appendLog).not.toBeCalled();
  });
  it("if the assistanceTool is Zendesk should call the appendLog function", () => {
    const instabugLogSpy = jest
      .spyOn(configureInstabug, "instabugLog")
      .mockImplementation();
    handleSendAssistanceLog(ToolEnum.zendesk, "mockedLog");
    expect(instabugLogSpy).not.toBeCalled();
    expect(MockZendesk.appendLog).toBeCalled();
  });
});

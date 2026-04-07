import { ToolEnum } from "../../../definitions/content/AssistanceToolConfig";
import MockZendesk from "../../__mocks__/io-react-native-zendesk";
import {
  anonymousAssistanceAddressWithSubject,
  canShowHelp,
  handleSendAssistanceLog,
  zendeskCategoryId,
  zendeskSendCategory
} from "../supportAssistance";

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
  it("if assistanceTool is Zendesk, should return true if the email is validated", () => {
    expect(canShowHelp(ToolEnum.zendesk)).toBeTruthy();
  });
  it("if assistanceTool is instabug, web or none, should return false", () => {
    expect(canShowHelp(ToolEnum.instabug)).toBeFalsy();
    expect(canShowHelp(ToolEnum.web)).toBeFalsy();
    expect(canShowHelp(ToolEnum.none)).toBeFalsy();
  });
});

describe("handleSendAssistanceLog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("if the assistanceTool is Zendesk should call the appendLog function", () => {
    handleSendAssistanceLog(ToolEnum.zendesk, "mockedLog");
    expect(MockZendesk.appendLog).toBeCalled();
  });
});
describe("snapshots", () => {
  it("zendeskSendCategory", () => {
    expect(zendeskSendCategory).toMatchSnapshot();
  });
});

describe("zendeskCategoryId", () => {
  it("should match the right value", () => {
    expect(zendeskCategoryId).toBe("1900004702053");
  });
});

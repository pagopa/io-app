import { Body, IOToast, MdH1, MdH2, MdH3 } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import * as URL from "../../../../../utils/url";
import { testable } from "../customRules";

describe("customRules", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("DEFAULT_HEADING_MARGINS", () => {
    it("should match default values", () => {
      const defaultHeadingMargins = testable!.DEFAULT_HEADING_MARGINS;
      expect(defaultHeadingMargins).toEqual({
        marginStart: 8,
        marginEnd: 4
      });
    });
  });
  describe("HEADINGS_MAP", () => {
    it("should match default values", () => {
      const headersMap = testable!.HEADINGS_MAP;
      expect(headersMap).toEqual({
        1: MdH1,
        2: MdH2,
        3: MdH3,
        4: Body,
        5: Body,
        6: Body
      });
    });
  });
  describe("SPACER_VALUES", () => {
    it("should match default values", () => {
      const spacerValues = testable!.SPACER_VALUES;
      expect(spacerValues).toEqual({
        1: { marginStart: 16, marginEnd: 4 },
        2: { marginStart: 16, marginEnd: 8 }
      });
    });
  });
  describe("handleOpenLink", () => {
    const linkToMock = jest.fn();
    it("should call input function for ioit:// protocol", () => {
      testable!.handleOpenLink(linkToMock, "ioit://whatever");
      expect(linkToMock).toHaveBeenCalledWith("/whatever");
    });
    ["http://", "https://"].forEach(protocol =>
      it(`should call 'openWebUrl' for ${protocol} protocol`, () => {
        const spyOnMockedOpenWebUrl = jest
          .spyOn(URL, "openWebUrl")
          .mockImplementation((_url, _onError) => undefined);
        const spyOnIOToastError = jest.spyOn(IOToast, "error");
        testable!.handleOpenLink(linkToMock, `${protocol}whatever`);
        expect(spyOnMockedOpenWebUrl.mock.calls.length).toBe(1);
        expect(spyOnMockedOpenWebUrl.mock.calls[0].length).toBe(2);
        expect(spyOnMockedOpenWebUrl.mock.calls[0][0]).toBe(
          `${protocol}whatever`
        );
        expect(spyOnMockedOpenWebUrl.mock.calls[0][1]).toBeDefined();
        const errorFunction = spyOnMockedOpenWebUrl.mock
          .calls[0][1] as () => void;
        errorFunction();
        expect(spyOnIOToastError).toHaveBeenCalledWith(
          I18n.t("global.jserror.title")
        );
      })
    );
    [
      "iosso://",
      "iohandledlink://",
      "clipboard://",
      "clipboard:",
      "sms://",
      "sms:",
      "tel://",
      "tel:",
      "mailto://",
      "mailto:",
      "copy://",
      "copy:"
    ].forEach(protocol => {
      it(`should display a warning toast for ${protocol} protocol`, () => {
        const spyOnIOToastError = jest.spyOn(IOToast, "warning");
        testable!.handleOpenLink(linkToMock, `${protocol}whatever`);
        expect(spyOnIOToastError).toHaveBeenCalledWith(
          I18n.t("messageDetails.markdownLinkUnsupported")
        );
      });
    });
  });
  describe("replaceBrWithNewline", () => {
    [
      ["Hello<br>World", "Hello\nWorld"],
      ["Hello<br/>World", "Hello\nWorld"],
      ["Hello<br />World", "Hello\nWorld"],
      ["Hello<br    />World", "Hello\nWorld"],
      ["Hello<br    >World", "Hello\nWorld"],
      ["Line1<br>Line2<br>Line3", "Line1\nLine2\nLine3"],
      ["Line1<br/>Line2<br/>Line3", "Line1\nLine2\nLine3"],
      ["Line1<br />Line2<br />Line3", "Line1\nLine2\nLine3"],
      ["Line1<br  />Line2<br    />Line3", "Line1\nLine2\nLine3"],
      ["Mix<br>of<br/><br />types", "Mix\nof\n\ntypes"],
      ["Uppercase<BR>test", "Uppercase\ntest"],
      ["Mixedcase<bR>test", "Mixedcase\ntest"],
      ["Nothing to replace", "Nothing to replace"],
      ["", ""],
      ["<br>Only BR", "\nOnly BR"],
      ["<br>", "\n"],
      ["<br/>", "\n"],
      ["<br />", "\n"],
      ["<br   />", "\n"],
      ["Weird<brstyle='color:red;'>case", "Weird<brstyle='color:red;'>case"]
    ].forEach(testCase => {
      it(`should replace 'br' tag with newline character for input ${testCase[0]}`, () => {
        const output = testable!.replaceBrWithNewline(testCase[0]);
        expect(output).toBe(testCase[1]);
      });
    });
  });
});

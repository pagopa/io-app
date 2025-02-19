import { IOToast } from "@pagopa/io-app-design-system";
import * as URL from "../../../../../utils/url";
import { testable } from "../customRules";
import I18n from "../../../../../i18n";

describe("customRules", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("handleOpenLink", () => {
    const linkToMock = jest.fn();
    it("should call input function for ioit:// protocol", () => {
      testable!.handleOpenLink(linkToMock, "ioit://whatever");
      expect(linkToMock).toHaveBeenCalledWith("/whatever");
    });
    it("should call 'openWebUrl' for https:// protocol", () => {
      const spyOnMockedOpenWebUrl = jest
        .spyOn(URL, "openWebUrl")
        .mockImplementation((_url, _onError) => undefined);
      const spyOnIOToastError = jest.spyOn(IOToast, "error");
      testable!.handleOpenLink(linkToMock, "https://whatever");
      expect(spyOnMockedOpenWebUrl.mock.calls.length).toBe(1);
      expect(spyOnMockedOpenWebUrl.mock.calls[0].length).toBe(2);
      expect(spyOnMockedOpenWebUrl.mock.calls[0][0]).toBe("https://whatever");
      expect(spyOnMockedOpenWebUrl.mock.calls[0][1]).toBeDefined();
      const errorFunction = spyOnMockedOpenWebUrl.mock
        .calls[0][1] as () => void;
      errorFunction();
      expect(spyOnIOToastError).toHaveBeenCalledWith(
        I18n.t("global.jserror.title")
      );
    });
    [
      "http://",
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
});

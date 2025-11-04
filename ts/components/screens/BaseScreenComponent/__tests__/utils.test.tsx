import { Linking } from "react-native";
import * as utilsUrl from "../../../../utils/url";
import * as markdownUtils from "../../../ui/Markdown/handlers/link";
import { handleOnLinkClicked } from "../utils";

jest
  .spyOn(Linking, "openURL")
  .mockImplementation(jest.fn(() => Promise.resolve()));

describe("handleOnLinkClicked", () => {
  const spy_deriveCustomHandledLink = jest.spyOn(
    markdownUtils,
    "deriveCustomHandledLink"
  );
  const spy_handleItemOnPress = jest.spyOn(utilsUrl, "handleItemOnPress");

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should handle IO internal links", () => {
    const hideHelp = jest.fn();
    handleOnLinkClicked(hideHelp)(`ioit://link`);
    expect(hideHelp).toHaveBeenCalledTimes(1);
    expect(spy_deriveCustomHandledLink).not.toHaveBeenCalled();
    expect(spy_handleItemOnPress).not.toHaveBeenCalled();
  });

  it("should handle non-IO internal links", () => {
    const hideHelp = jest.fn();
    const link = "iohandledlink://https://www.google.com";
    handleOnLinkClicked(hideHelp)(link);
    expect(hideHelp).not.toHaveBeenCalled();
    expect(spy_deriveCustomHandledLink).toHaveBeenCalledWith(link);
    expect(spy_handleItemOnPress).toHaveBeenCalled();
  });
});

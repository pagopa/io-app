import { BugReporting } from "instabug-reactnative";

import { RequestAssistancePayload } from "../../../ContextualHelp";
import {
  remoteReady,
  remoteUndefined
} from "../../../../features/bonus/bpd/model/RemoteValue";
import * as configureInstabugModule from "../../../../boot/configureInstabug";
import { TypeLogs } from "../../../../boot/configureInstabug";
import * as utilsUrl from "../../../../utils/url";
import * as markdownUtils from "../../../ui/Markdown/handlers/link";
import { handleOnContextualHelpDismissed, handleOnLinkClicked } from "../utils";

// Linking.openURL doesn't work properly in test mode
jest.mock("react-native/Libraries/Linking/Linking", () => ({
  openURL: jest.fn(() => Promise.resolve())
}));

const defaultAttachmentTypeConfiguration = {
  screenshot: true,
  extraScreenshot: true,
  galleryImage: true,
  screenRecording: true
};
const supportToken = {
  access_token: "support-token",
  expires_in: 1000
};
const basePayload: RequestAssistancePayload = {
  supportType: BugReporting.reportType.bug,
  supportToken: remoteReady(supportToken),
  deviceUniqueId: undefined,
  shouldSendScreenshot: false
};

describe("handleOnContextualHelpDismissed", () => {
  describe("when support type is a Bug", () => {
    it("should call `openInstabugQuestionReport` with the attachment configuration", () => {
      const spy = jest.spyOn(
        configureInstabugModule,
        "openInstabugQuestionReport"
      );
      handleOnContextualHelpDismissed(
        basePayload,
        defaultAttachmentTypeConfiguration
      );
      expect(spy).toHaveBeenLastCalledWith(defaultAttachmentTypeConfiguration);
    });

    describe("and the support token is ready", () => {
      it("should call `instabugLog` with the support token", () => {
        const spy = jest.spyOn(configureInstabugModule, "instabugLog");
        handleOnContextualHelpDismissed(
          basePayload,
          defaultAttachmentTypeConfiguration
        );
        expect(spy).toHaveBeenCalledWith(
          JSON.stringify(supportToken),
          TypeLogs.INFO,
          "support-token"
        );
      });
      it("should call `setInstabugSupportTokenAttribute` with the support token", () => {
        const spy = jest.spyOn(
          configureInstabugModule,
          "setInstabugSupportTokenAttribute"
        );
        handleOnContextualHelpDismissed(
          basePayload,
          defaultAttachmentTypeConfiguration
        );
        expect(spy).toHaveBeenCalledWith(supportToken);
      });
    });

    describe("and the support token is not ready", () => {
      it("should call `setInstabugSupportTokenAttribute` without the support token", () => {
        const spy = jest.spyOn(
          configureInstabugModule,
          "setInstabugSupportTokenAttribute"
        );
        handleOnContextualHelpDismissed(
          { ...basePayload, supportToken: remoteUndefined },
          defaultAttachmentTypeConfiguration
        );
        expect(spy).toHaveBeenCalledWith(undefined);
      });
    });

    describe("and the device UUID is present", () => {
      it("should call `setInstabugDeviceIdAttribute` with the UUID", () => {
        const spy = jest.spyOn(
          configureInstabugModule,
          "setInstabugDeviceIdAttribute"
        );
        handleOnContextualHelpDismissed(
          { ...basePayload, deviceUniqueId: "aaa-bbb-ccc" },
          defaultAttachmentTypeConfiguration
        );
        expect(spy).toHaveBeenLastCalledWith("aaa-bbb-ccc");
      });
    });
  });

  describe("and the device UUID is not defined", () => {
    it("should call `setInstabugDeviceIdAttribute` without the UUID", () => {
      const spy = jest.spyOn(
        configureInstabugModule,
        "setInstabugDeviceIdAttribute"
      );
      handleOnContextualHelpDismissed(
        basePayload,
        defaultAttachmentTypeConfiguration
      );
      expect(spy).toHaveBeenLastCalledWith(undefined);
    });
  });

  describe("when support type is a Question", () => {
    it("should call `openInstabugReplies`", () => {
      const spy = jest.spyOn(configureInstabugModule, "openInstabugReplies");
      handleOnContextualHelpDismissed(
        { ...basePayload, supportType: BugReporting.reportType.question },
        defaultAttachmentTypeConfiguration
      );
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});

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

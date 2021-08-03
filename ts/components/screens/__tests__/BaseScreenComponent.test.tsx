import { BugReporting } from "instabug-reactnative";

import { RequestAssistancePayload } from "../../ContextualHelp/ContextualHelpModal";
import {
  remoteReady,
  remoteUndefined
} from "../../../features/bonus/bpd/model/RemoteValue";
import * as configureInstabugModule from "../../../boot/configureInstabug";
import { TypeLogs } from "../../../boot/configureInstabug";
import { test_handleOnContextualHelpDismissed as handleOnContextualHelpDismissed } from "../BaseScreenComponent";

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
      it("should call `setInstabugUserAttribute` with the UUID", () => {
        const spy = jest.spyOn(
          configureInstabugModule,
          "setInstabugUserAttribute"
        );
        handleOnContextualHelpDismissed(
          { ...basePayload, deviceUniqueId: "aaa-bbb-ccc" },
          defaultAttachmentTypeConfiguration
        );
        expect(spy).toHaveBeenLastCalledWith("deviceUniqueID", "aaa-bbb-ccc");
      });
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

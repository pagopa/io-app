import { Alert, VSpacer } from "@io-app/design-system";
import I18n from "i18next";

export const MessageAttachmentsAlert = () => (
  <>
    <Alert
      content={I18n.t("features.messages.attachmentsExpirationAlert.body")}
      testID="message-attachments-alert"
      variant="info"
    />
    <VSpacer size={8} />
  </>
);

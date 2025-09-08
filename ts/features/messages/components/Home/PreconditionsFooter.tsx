import { useCallback } from "react";
import { View } from "react-native";
import { FooterActions } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOSelector, useIOStore } from "../../../../store/hooks";
import {
  preconditionsCategoryTagSelector,
  preconditionsFooterSelector,
  preconditionsMessageIdSelector
} from "../../store/reducers/messagePrecondition";
import { openAppStoreUrl } from "../../../../utils/url";
import { trackNotificationRejected, trackUxConversion } from "../../analytics";

export type PreconditionsFooterProps = {
  onNavigation: (messageId: string) => void;
  onDismiss: () => void;
  onFooterHeightAvailable: (height: number) => void;
};

export const PreconditionsFooter = ({
  onNavigation,
  onDismiss,
  onFooterHeightAvailable
}: PreconditionsFooterProps) => {
  const footerContent = useIOSelector(preconditionsFooterSelector);
  switch (footerContent) {
    case "content":
      return (
        <PreconditionsFooterContent
          onNavigation={onNavigation}
          onDismiss={onDismiss}
          onFooterHeightAvailable={onFooterHeightAvailable}
        />
      );
    case "update":
      return <PreconditionsFooterUpdate onDismiss={onDismiss} />;
    case "view":
      return <View />;
  }
  return null;
};

const PreconditionsFooterContent = ({
  onNavigation,
  onDismiss,
  onFooterHeightAvailable
}: PreconditionsFooterProps) => {
  const store = useIOStore();

  const onCancelCallback = useCallback(() => {
    const state = store.getState();
    const categoryTag = preconditionsCategoryTagSelector(state);
    if (categoryTag) {
      trackNotificationRejected(categoryTag);
    }
    onDismiss();
  }, [onDismiss, store]);
  const onContinueCallback = useCallback(() => {
    const state = store.getState();
    const categoryTag = preconditionsCategoryTagSelector(state);
    if (categoryTag) {
      trackUxConversion(categoryTag);
    }
    const messageId = preconditionsMessageIdSelector(state);
    if (messageId) {
      onNavigation(messageId);
    }
    onDismiss();
  }, [onDismiss, onNavigation, store]);

  return (
    <FooterActions
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t("global.buttons.continue"),
          onPress: onContinueCallback,
          testID: "message_preconditions_footer_continue"
        },
        secondary: {
          label: I18n.t("global.buttons.cancel"),
          onPress: onCancelCallback,
          testID: "message_preconditions_footer_cancel"
        }
      }}
      onMeasure={measurements =>
        onFooterHeightAvailable(measurements.actionBlockHeight)
      }
    />
  );
};

type PreconditionsFooterUpdateProps = {
  onDismiss: () => void;
};

const PreconditionsFooterUpdate = ({
  onDismiss
}: PreconditionsFooterUpdateProps) => (
  <FooterActions
    actions={{
      type: "TwoButtons",
      primary: {
        label: I18n.t("global.buttons.updateIO"),
        onPress: () => openAppStoreUrl(),
        testID: "message_preconditions_footer_update"
      },
      secondary: {
        label: I18n.t("global.buttons.cancel"),
        onPress: onDismiss,
        testID: "message_preconditions_footer_update_cancel"
      }
    }}
  />
);

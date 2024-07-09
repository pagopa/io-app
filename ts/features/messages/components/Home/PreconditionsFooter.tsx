import React, { useCallback } from "react";
import { View } from "react-native";
import { useIOSelector, useIOStore } from "../../../../store/hooks";
import {
  preconditionsCategoryTagSelector,
  preconditionsFooterSelector,
  preconditionsMessageIdSelector
} from "../../store/reducers/messagePrecondition";
import { FooterActions } from "../../../../components/ui/FooterActions";
import I18n from "../../../../i18n";
import { openAppStoreUrl } from "../../../../utils/url";
import { trackNotificationRejected, trackUxConversion } from "../../analytics";
import { UIMessageId } from "../../types";

export type PreconditionsFooterProps = {
  onNavigation: (messageId: UIMessageId) => void;
  onDismiss: () => void;
};

export const PreconditionsFooter = ({
  onNavigation,
  onDismiss
}: PreconditionsFooterProps) => {
  const footerContent = useIOSelector(preconditionsFooterSelector);
  switch (footerContent) {
    case "content":
      return (
        <PreconditionsFooterContent
          onNavigation={onNavigation}
          onDismiss={onDismiss}
        />
      );
    case "update":
      return <PreconditionsFooterUpdate onDismiss={onDismiss} />;
    case "view":
      return <View></View>;
  }
  return null;
};

const PreconditionsFooterContent = ({
  onNavigation,
  onDismiss
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

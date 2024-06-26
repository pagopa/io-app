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
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { MESSAGES_ROUTES } from "../../navigation/routes";

type PreconditionsFooterProps = {
  onDismiss: () => void;
};

export const PreconditionsFooter = ({
  onDismiss
}: PreconditionsFooterProps) => {
  const footerContent = useIOSelector(preconditionsFooterSelector);
  switch (footerContent) {
    case "content":
      return <PreconditionsFooterContent onDismiss={onDismiss} />;
    case "update":
      return <PreconditionsFooterUpdate onDismiss={onDismiss} />;
    case "view":
      return <View></View>;
  }
  return null;
};

const PreconditionsFooterContent = ({
  onDismiss
}: PreconditionsFooterProps) => {
  const store = useIOStore();
  const navigation = useIONavigation();

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
      navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: MESSAGES_ROUTES.MESSAGE_ROUTER,
        params: {
          messageId,
          fromNotification: false
        }
      });
    }
    onDismiss();
  }, [navigation, onDismiss, store]);

  return (
    <FooterActions
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t("global.buttons.cancel"),
          onPress: onCancelCallback
        },
        secondary: {
          label: I18n.t("global.buttons.continue"),
          onPress: onContinueCallback
        }
      }}
    />
  );
};

const PreconditionsFooterUpdate = ({ onDismiss }: PreconditionsFooterProps) => (
  <FooterActions
    actions={{
      type: "TwoButtons",
      primary: {
        label: I18n.t("global.buttons.updateIO"),
        onPress: () => openAppStoreUrl()
      },
      secondary: {
        label: I18n.t("global.buttons.cancel"),
        onPress: onDismiss
      }
    }}
  />
);

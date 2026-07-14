import I18n from "i18next";
import { useMemo } from "react";

import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import { GlobalState } from "../../../../store/reducers/types";
import { isTestEnv } from "../../../../utils/environment";
import {
  MessageRouterScreenErrorVariant,
  messageRouterScreenErrorVariantSelector
} from "../../store/reducers/messageGetStatus";

export const MessageRouterScreenErrorComponent = ({
  onRetry,
  onCancel,
  messageId
}: {
  messageId: string;
  onCancel: () => void;
  onRetry: () => void;
}) => {
  const errorVariant = useIOSelector((state: GlobalState) =>
    messageRouterScreenErrorVariantSelector(state, messageId)
  );
  const errorMap = useMemo(
    () => getMessageRouterErrorMap(onRetry, onCancel),
    [onRetry, onCancel]
  );
  const componentProps = errorMap[errorVariant];

  return <OperationResultScreenContent {...componentProps} />;
};

// -------------- Selector and utils for error handling --------------

const getMessageRouterErrorMap = (
  onRetry: () => void,
  onCancel: () => void
): {
  [key in MessageRouterScreenErrorVariant]: OperationResultScreenContentProps;
} => ({
  messageNotFound: {
    pictogram: "empty",
    title: I18n.t("messageDetails.notFound.title"),
    subtitle: I18n.t("messageDetails.notFound.subtitle"),
    action: {
      label: I18n.t("global.buttons.close"),
      onPress: onCancel,
      testID: "messageRouterError-close-button"
    }
  },
  thirdPartyError: {
    pictogram: "umbrella",
    title: I18n.t("messageDetails.remoteContentError.title"),
    subtitle: I18n.t("messageDetails.remoteContentError.body"),
    action: {
      label: I18n.t("global.buttons.retry"),
      onPress: onRetry,
      testID: "messageRouterError-retry-button"
    },
    secondaryAction: {
      label: I18n.t("global.buttons.cancel"),
      onPress: onCancel,
      testID: "messageRouterError-cancel-button"
    }
  },
  genericError: {
    pictogram: "umbrella",
    title: I18n.t("global.genericError"),
    action: {
      label: I18n.t("global.buttons.retry"),
      onPress: onRetry,
      testID: "messageRouterError-retry-button"
    },
    secondaryAction: {
      label: I18n.t("global.buttons.cancel"),
      onPress: onCancel,
      testID: "messageRouterError-cancel-button"
    }
  }
});
export const testable = isTestEnv
  ? {
      getMessageRouterErrorMap
    }
  : undefined;

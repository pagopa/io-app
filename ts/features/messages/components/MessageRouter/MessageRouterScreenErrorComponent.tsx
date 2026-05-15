import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { useMemo } from "react";
import { createSelector } from "reselect";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import { GlobalState } from "../../../../store/reducers/types";
import { messageGetStatusErrorPhaseSelector } from "../../store/reducers/messageGetStatus";
import { getPaginatedMessageById } from "../../store/reducers/paginatedById";

export const MessageRouterScreenErrorComponent = ({
  onRetry,
  onCancel,
  messageId
}: {
  onRetry: () => void;
  onCancel: () => void;
  messageId: string;
}) => {
  const errorVariant = useIOSelector((state: GlobalState) =>
    messageRouterErrorVariantSelector(state, messageId)
  );
  const errorMap = useMemo(
    () => getMessageRouterErrorMap(onRetry, onCancel),
    [onRetry, onCancel]
  );
  const componentProps = errorMap[errorVariant];

  return <OperationResultScreenContent {...componentProps} />;
};

// -------------- Selector and utils for error handling --------------

type MessageRouterErrorVariant =
  | "messageNotFound"
  | "thirdPartyError"
  | "genericError";

const messageRouterErrorVariantSelector = createSelector(
  messageGetStatusErrorPhaseSelector,
  (state: GlobalState, messageId: string) => {
    const messagePot = getPaginatedMessageById(state, messageId);
    return pot.isError(messagePot) ? messagePot.error.kind : undefined;
  },
  (messageGetErrorPhase, paginatedErrorKind): MessageRouterErrorVariant => {
    if (
      messageGetErrorPhase === "paginatedMessage" &&
      paginatedErrorKind === "messageNotFound"
    ) {
      return "messageNotFound";
    }
    if (messageGetErrorPhase === "thirdPartyMessageDetails") {
      return "thirdPartyError";
    }
    return "genericError";
  }
);

const getMessageRouterErrorMap = (
  onRetry: () => void,
  onCancel: () => void
): {
  [key in MessageRouterErrorVariant]: OperationResultScreenContentProps;
} => ({
  messageNotFound: {
    pictogram: "empty",
    title: I18n.t("messageDetails.notFound.title"),
    subtitle: I18n.t("messageDetails.notFound.subtitle"),
    action: {
      label: I18n.t("global.buttons.close"),
      onPress: onCancel
    }
  },
  thirdPartyError: {
    pictogram: "umbrella",
    title: I18n.t("messageDetails.remoteContentError.title"),
    subtitle: I18n.t("messageDetails.remoteContentError.body"),
    action: {
      label: I18n.t("global.buttons.retry"),
      onPress: onRetry
    },
    secondaryAction: {
      label: I18n.t("global.buttons.cancel"),
      onPress: onCancel
    }
  },
  genericError: {
    pictogram: "umbrella",
    title: I18n.t("global.genericError"),
    action: {
      label: I18n.t("global.buttons.retry"),
      onPress: onRetry
    },
    secondaryAction: {
      label: I18n.t("global.buttons.cancel"),
      onPress: onCancel
    }
  }
});

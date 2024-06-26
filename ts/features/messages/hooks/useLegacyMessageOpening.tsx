import * as React from "react";
import { View } from "react-native";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { FooterWithButtons } from "@pagopa/io-app-design-system";
import { UIMessage } from "../types";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { legacyMessagePreconditionSelector } from "../store/reducers/legacyMessagePrecondition";
import { RemoteValue, fold } from "../../../common/model/RemoteValue";
import I18n from "../../../i18n";
import { ThirdPartyMessagePrecondition } from "../../../../definitions/backend/ThirdPartyMessagePrecondition";
import { trackDisclaimerOpened } from "../analytics";
import {
  isPnAppVersionSupportedSelector,
  pnMinAppVersionSelector
} from "../../../store/reducers/backendStatus";
import { MessageFeedback } from "../components/Home/PreconditionsFeedback";
import { openAppStoreUrl } from "../../../utils/url";
import {
  LegacyPreconditionHeader,
  LegacyPreconditionHeaderSkeleton
} from "../components/PreconditionBottomSheet/LegacyPreconditionHeader";
import {
  LegacyPreconditionContent,
  LegacyPreconditionContentSkeleton
} from "../components/PreconditionBottomSheet/LegacyPreconditionContent";
import { LegacyPreconditionFooter } from "../components/PreconditionBottomSheet/LegacyPreconditionFooter";
import { MESSAGES_ROUTES } from "../navigation/routes";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import {
  clearLegacyMessagePrecondition,
  getLegacyMessagePrecondition
} from "../store/actions/preconditions";

const renderPreconditionHeader = (
  content: RemoteValue<ThirdPartyMessagePrecondition, Error>
) =>
  fold(
    content,
    constNull,
    () => <LegacyPreconditionHeaderSkeleton />,
    ({ title }) => <LegacyPreconditionHeader title={title} />,
    () => <View />
  );

const renderPreconditionContent = (
  content: RemoteValue<ThirdPartyMessagePrecondition, Error>,
  onLoadEnd: (value: boolean) => void
) =>
  fold(
    content,
    constNull,
    () => <LegacyPreconditionContentSkeleton />,
    ({ markdown }) => (
      <LegacyPreconditionContent
        markdown={markdown}
        onLoadEnd={() => onLoadEnd(true)}
      />
    ),
    () => (
      <MessageFeedback
        pictogram="umbrella"
        title={I18n.t("global.genericError")}
      />
    )
  );

const renderPreconditionFooter = (
  messageId: string,
  isContentLoadCompleted: boolean,
  onDismiss: () => void,
  navigationAction: (message: UIMessage) => void
) => {
  // We don't render the footer until the markdown is loaded
  if (!isContentLoadCompleted) {
    return <></>;
  }

  return (
    <LegacyPreconditionFooter
      messageId={messageId}
      onDismiss={() => onDismiss()}
      navigationAction={navigationAction}
    />
  );
};

export const useLegacyMessageOpening = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const pnSupported = useIOSelector(isPnAppVersionSupportedSelector);
  const pnMinAppVersion = useIOSelector(pnMinAppVersionSelector);

  const { messageId: maybeMessageId, content } = useIOSelector(
    legacyMessagePreconditionSelector
  );
  const [isContentLoadCompleted, setIsContentLoadCompleted] =
    React.useState<boolean>(false);

  const openAppStore = React.useCallback(() => openAppStoreUrl(), []);

  const navigate = React.useCallback(
    (message: UIMessage) => {
      navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: MESSAGES_ROUTES.MESSAGE_ROUTER,
        params: {
          messageId: message.id,
          fromNotification: false
        }
      });
    },
    [navigation]
  );

  const getTitleModal = () => {
    if (!pnSupported) {
      return <View />;
    }

    return renderPreconditionHeader(content);
  };

  const getContentModal = () => {
    if (!pnSupported) {
      return (
        <MessageFeedback
          pictogram="umbrella"
          title={I18n.t("features.messages.updateBottomSheet.title")}
          subtitle={I18n.t("features.messages.updateBottomSheet.subtitle", {
            value: pnMinAppVersion
          })}
        />
      );
    }

    return renderPreconditionContent(content, setIsContentLoadCompleted);
  };

  const getFooterModal = () => {
    if (!pnSupported) {
      return (
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          primary={{
            type: "Outline",
            buttonProps: {
              label: I18n.t("global.buttons.cancel"),
              onPress: () => modal.dismiss()
            }
          }}
          secondary={{
            type: "Solid",
            buttonProps: {
              label: I18n.t("global.buttons.updateIO"),
              onPress: openAppStore
            }
          }}
        />
      );
    }

    return pipe(
      maybeMessageId,
      O.fold(
        () => <></>,
        messageId =>
          renderPreconditionFooter(
            messageId,
            isContentLoadCompleted,
            () => modal.dismiss(),
            navigate
          )
      )
    );
  };

  const getCallbackModal = () => {
    if (!pnSupported) {
      return;
    }

    return () => {
      setIsContentLoadCompleted(false);
      dispatch(clearLegacyMessagePrecondition());
    };
  };

  const modal = useIOBottomSheetModal({
    snapPoint: [500],
    title: getTitleModal(),
    component: getContentModal(),
    footer: getFooterModal(),
    onDismiss: getCallbackModal()
  });

  const present = (message: UIMessage) => {
    if (!message.hasPrecondition) {
      navigate(message);
      return;
    }

    trackDisclaimerOpened(message.category.tag);
    dispatch(
      getLegacyMessagePrecondition.request({
        id: message.id,
        categoryTag: message.category.tag
      })
    );
    modal.present();
  };

  return { ...modal, present };
};

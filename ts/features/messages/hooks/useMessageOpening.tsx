import * as React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { IOColors } from "@pagopa/io-app-design-system";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { UIMessage } from "../types";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  getMessagePrecondition,
  clearMessagePrecondition
} from "../store/actions";
import { messagePreconditionSelector } from "../store/reducers/messagePrecondition";
import { RemoteValue, fold } from "../../../common/model/RemoteValue";
import I18n from "../../../i18n";
import { ThirdPartyMessagePrecondition } from "../../../../definitions/backend/ThirdPartyMessagePrecondition";
import { trackDisclaimerOpened } from "../analytics";
import {
  isPnSupportedSelector,
  pnMinAppVersionSelector
} from "../../../store/reducers/backendStatus";
import { MessageFeedback } from "../components/MessageFeedback";
import { openAppStoreUrl } from "../../../utils/url";
import {
  PreconditionHeader,
  PreconditionHeaderSkeleton
} from "../components/PreconditionBottomSheet/PreconditionHeader";
import {
  PreconditionContent,
  PreconditionContentSkeleton
} from "../components/PreconditionBottomSheet/PreconditionContent";
import { PreconditionFooter } from "../components/PreconditionBottomSheet/PreconditionFooter";
import { MESSAGES_ROUTES } from "../navigation/routes";

const renderPreconditionHeader = (
  content: RemoteValue<ThirdPartyMessagePrecondition, Error>
) =>
  fold(
    content,
    constNull,
    () => <PreconditionHeaderSkeleton />,
    ({ title }) => <PreconditionHeader title={title} />,
    () => <View />
  );

const renderPreconditionContent = (
  content: RemoteValue<ThirdPartyMessagePrecondition, Error>,
  onLoadEnd: (value: boolean) => void
) =>
  fold(
    content,
    constNull,
    () => <PreconditionContentSkeleton />,
    ({ markdown }) => (
      <PreconditionContent
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
    <PreconditionFooter
      messageId={messageId}
      onDismiss={() => onDismiss()}
      navigationAction={navigationAction}
    />
  );
};

export const useMessageOpening = () => {
  const navigation = useNavigation();
  const dispatch = useIODispatch();

  const pnSupported = useIOSelector(isPnSupportedSelector);
  const pnMinAppVersion = useIOSelector(pnMinAppVersionSelector);

  const { messageId: maybeMessageId, content } = useIOSelector(
    messagePreconditionSelector
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
          leftButton={{
            bordered: true,
            labelColor: IOColors.blue,
            title: I18n.t("global.buttons.cancel"),
            onPressWithGestureHandler: true,
            onPress: () => modal.dismiss()
          }}
          rightButton={{
            primary: true,
            labelColor: IOColors.white,
            title: I18n.t("global.buttons.updateIO"),
            onPressWithGestureHandler: true,
            onPress: openAppStore
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
      dispatch(clearMessagePrecondition());
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
      getMessagePrecondition.request({
        id: message.id,
        categoryTag: message.category.tag
      })
    );
    modal.present();
  };

  return { ...modal, present };
};

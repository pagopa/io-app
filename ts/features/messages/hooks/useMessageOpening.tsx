import * as pot from "@pagopa/ts-commons/lib/pot";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import HeaderImage from "../../../../img/features/pn/pn_alert_header.svg";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import customVariables from "../../../theme/variables";
import { useLegacyIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  getMessagePrecondition,
  clearMessagePrecondition
} from "../../../store/actions/messages";
import { messagePreconditionSelector } from "../../../store/reducers/entities/messages/messagePrecondition";
import { getPaginatedMessageById } from "../../../store/reducers/entities/messages/paginatedById";
import MessageMarkdown from "../../../components/messages/MessageDetail/MessageMarkdown";
import { RemoteValue, fold } from "../../bonus/bpd/model/RemoteValue";
import { Pictogram } from "../../../components/core/pictograms";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { MessageCategoryPN } from "../../../../definitions/backend/MessageCategoryPN";
import I18n from "../../../i18n";
import { IOColors } from "../../../components/core/variables/IOColors";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H2 } from "../../../components/core/typography/H2";
import { H3 } from "../../../components/core/typography/H3";
import { ThirdPartyMessagePrecondition } from "../../../../definitions/backend/ThirdPartyMessagePrecondition";
import ROUTES from "../../../navigation/routes";
import {
  trackPNDisclaimerAccepted,
  trackPNDisclaimerRejected,
  trackPNDisclaimerShowSuccess
} from "../../pn/analytics";

const BOTTOM_SHEET_HEIGHT = 500;

type MessagePreconditionProps = {
  content: RemoteValue<ThirdPartyMessagePrecondition, Error>;
};

type MessagePreconditionContentProps = MessagePreconditionProps & {
  onLoadEnd: () => void;
};

type MessagePreconditionFooterProps = {
  isContentLoadCompleted: boolean;
  messageId: string;
  onDismiss: () => void;
  navigationAction: (message: UIMessage) => void;
};

const MessagePreconditionFooter = (props: MessagePreconditionFooterProps) => {
  const message = useIOSelector(state =>
    getPaginatedMessageById(state, props.messageId)
  );

  const handleCancelPress = () => {
    trackPNDisclaimerRejected();
    props.onDismiss();
  };

  const handleContinuePress = () => {
    props.onDismiss();

    pipe(
      message,
      pot.toOption,
      O.map(message => {
        pipe(
          message.category,
          MessageCategoryPN.decode,
          O.fromEither,
          O.chainNullableK(category => category.original_receipt_date),
          O.map(originalReceiptDate => {
            const messageCreatedAt = message.createdAt;
            trackPNDisclaimerAccepted(messageCreatedAt, originalReceiptDate);
          })
        );
        props.navigationAction(message);
      })
    );
  };

  // if the markdown is not loaded yet
  // we don't render the footer
  if (!props.isContentLoadCompleted) {
    return <></>;
  }

  return (
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={{
        bordered: true,
        labelColor: IOColors.blue,
        title: I18n.t("global.buttons.cancel"),
        onPressWithGestureHandler: true,
        onPress: handleCancelPress
      }}
      rightButton={{
        primary: true,
        labelColor: IOColors.white,
        title: I18n.t("global.buttons.continue"),
        onPressWithGestureHandler: true,
        onPress: handleContinuePress
      }}
    />
  );
};

const MessagePreconditionContentSkeleton = () => (
  <View style={{ marginTop: customVariables.spacerWidth }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <View key={i}>
        <Placeholder.Box
          width={"100%"}
          animate={"fade"}
          height={21}
          radius={4}
        />
        <VSpacer size={8} />
        <Placeholder.Box
          width={"100%"}
          animate={"fade"}
          height={21}
          radius={4}
        />
        <VSpacer size={8} />
        <Placeholder.Box
          width={"90%"}
          animate={"fade"}
          height={21}
          radius={4}
        />
        <VSpacer size={8} />
      </View>
    ))}
  </View>
);

const MessagePreconditionContent = ({
  content,
  onLoadEnd
}: MessagePreconditionContentProps) => {
  const [isLoaded, setLoaded] = useState(false);

  const handleOnLoadEnd = () => {
    setLoaded(true);
    onLoadEnd();
  };

  return fold(
    content,
    constNull,
    () => <MessagePreconditionContentSkeleton />,
    ({ markdown }) => (
      <>
        {!isLoaded && <MessagePreconditionContentSkeleton />}
        <View
          style={{
            display: isLoaded ? "flex" : "none",
            marginTop: customVariables.spacerWidth
          }}
        >
          <MessageMarkdown onLoadEnd={handleOnLoadEnd}>
            {markdown}
          </MessageMarkdown>
        </View>
      </>
    ),
    () => <ErrorComponent />
  );
};

const ErrorComponent = () => (
  <View style={[IOStyles.flex, IOStyles.alignCenter]}>
    <VSpacer size={24} />
    <Pictogram name="error" />
    <VSpacer size={24} />
    <H2 accessible>{I18n.t("global.genericError")}</H2>
    <VSpacer size={16} />
  </View>
);

const MessagePreconditionHeaderSkeleton = () => (
  <View style={[IOStyles.flex, IOStyles.row, IOStyles.alignCenter]}>
    <View style={{ marginRight: customVariables.spacerWidth }}>
      <Placeholder.Box animate={"fade"} width={32} height={32} radius={32} />
    </View>
    <Placeholder.Box animate="fade" width={150} height={21} radius={4} />
  </View>
);

const MessagePreconditionHeader = ({ content }: MessagePreconditionProps) =>
  fold(
    content,
    constNull,
    () => <MessagePreconditionHeaderSkeleton />,
    ({ title }) => (
      <View style={[IOStyles.flex, IOStyles.row, IOStyles.alignCenter]}>
        <HeaderImage
          width={32}
          height={32}
          fill={IOColors.blue}
          style={{ marginRight: customVariables.spacerWidth }}
        />
        <H3>{title}</H3>
      </View>
    ),
    () => <View />
  );

export const useMessageOpening = () => {
  const navigation = useNavigation();
  const dispatch = useIODispatch();
  const { messageId: maybeMessageId, content } = useIOSelector(
    messagePreconditionSelector
  );
  const [isContentLoadCompleted, setIsContentLoadCompleted] =
    useState<boolean>(false);

  const navigate = useCallback(
    (message: UIMessage) => {
      navigation.navigate(ROUTES.MESSAGES_NAVIGATOR, {
        screen: ROUTES.MESSAGE_ROUTER,
        params: {
          messageId: message.id,
          fromNotification: false
        }
      });
    },
    [navigation]
  );

  const modal = useLegacyIOBottomSheetModal(
    <MessagePreconditionContent
      content={content}
      onLoadEnd={() => setIsContentLoadCompleted(true)}
    />,
    <MessagePreconditionHeader content={content} />,
    BOTTOM_SHEET_HEIGHT,
    pipe(
      maybeMessageId,
      O.fold(
        () => <></>,
        messageId => (
          <MessagePreconditionFooter
            isContentLoadCompleted={isContentLoadCompleted}
            messageId={messageId}
            onDismiss={() => modal.dismiss()}
            navigationAction={navigate}
          />
        )
      )
    ),
    () => {
      setIsContentLoadCompleted(false);
      dispatch(clearMessagePrecondition());
    }
  );

  const present = (message: UIMessage) => {
    if (message.hasPrecondition) {
      trackPNDisclaimerShowSuccess();
      dispatch(getMessagePrecondition.request(message.id));
      modal.present();
      return;
    }

    navigate(message);
  };

  return { ...modal, present };
};

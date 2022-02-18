import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { euCovidCertificateEnabled } from "../../config";
import { LoadingErrorComponent } from "../../features/bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { navigateToEuCovidCertificateDetailScreen } from "../../features/euCovidCert/navigation/actions";
import { EUCovidCertificateAuthCode } from "../../features/euCovidCert/types/EUCovidCertificate";
import I18n from "../../i18n";
import { mixpanelTrack } from "../../mixpanel";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { MessagesParamsList } from "../../navigation/params/MessagesParamsList";
import { DEPRECATED_loadMessages as loadMessages } from "../../store/actions/messages";
import {
  navigateBack,
  navigateToMessageDetailScreenAction
} from "../../store/actions/navigation";
import { messagesAllIdsSelector } from "../../store/reducers/entities/messages/messagesAllIds";
import { messageStateByIdSelector } from "../../store/reducers/entities/messages/messagesById";
import { GlobalState } from "../../store/reducers/types";
import { isStrictSome } from "../../utils/pot";
import { MessageDetailScreenNavigationParams } from "./MessageDetailScreen";

export type MessageRouterScreenNavigationParams =
  MessageDetailScreenNavigationParams;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  IOStackNavigationRouteProps<MessagesParamsList, "MESSAGE_ROUTER">;

/**
 * In order to have the final CreatedMessageWithContentAndAttachments, these conditions should be verified:
 * - props.allMessages should be pot.some (it means messages are refreshed: loadMessages triggers the loading of the single message in that list)
 * - messageId should be in props.allMessages (the specific message should be loaded)
 * - props.messageState(messageId) should be defined and pot.some (we have the details)
 * @param props
 */
const getLoadingState = (
  props: Props
): pot.Pot<
  CreatedMessageWithContentAndAttachments | undefined,
  string | undefined
> => {
  const messageId = props.route.params.messageId;
  if (!isStrictSome(props.allMessages)) {
    void mixpanelTrack("MESSAGE_ROUTING_FAILURE", {
      reason: "all Messages is not some"
    });
    return pot.map(props.allMessages, _ => undefined);
  }
  if (!props.allMessages.value.some(id => id === messageId)) {
    void mixpanelTrack("MESSAGE_ROUTING_FAILURE", {
      reason: "id not in list"
    });
    return pot.noneError(`Cannot found ${messageId} in messages list`);
  }
  const messageState = props.messageState(messageId);
  if (messageState === undefined) {
    void mixpanelTrack("MESSAGE_ROUTING_FAILURE", {
      reason: "MessageState is undefined"
    });
    return pot.noneError("MessageState is undefined");
  }
  return messageState.message;
};

/**
 * Choose the screen where to navigate, based on the message.content.eu_covid_cert
 * @param message
 */
const navigateToScreenHandler = (
  message: CreatedMessageWithContentAndAttachments
) => {
  const navigateToEuCovidCertificate = (
    authCode: EUCovidCertificateAuthCode,
    messageId: string
  ) => {
    navigateBack();
    navigateToEuCovidCertificateDetailScreen({ authCode, messageId });
  };

  const navigateToDetails = (messageId: string) => {
    navigateBack();
    navigateToMessageDetailScreenAction({ messageId });
  };

  if (
    euCovidCertificateEnabled &&
    message.content.eu_covid_cert !== undefined
  ) {
    navigateToEuCovidCertificate(
      message.content.eu_covid_cert.auth_code as EUCovidCertificateAuthCode,
      message.id
    );
  } else {
    navigateToDetails(message.id);
  }
};

const MessageRouterScreen = (props: Props): React.ReactElement => {
  // used to automatically dispatch loadMessages if the pot is not some at the first rendering
  // (avoid displaying error at the first frame)
  const firstRendering = useRef(true);
  const loadingState = getLoadingState(props);
  const isLoading = !pot.isError(loadingState);
  const { loadMessages } = props;

  useEffect(() => {
    // all the messages data are ready, exit condition, navigate to the right screen
    if (isStrictSome(loadingState) && loadingState.value !== undefined) {
      navigateToScreenHandler(loadingState.value);
      return;
    }
    if (firstRendering.current) {
      loadMessages();
      // eslint-disable-next-line functional/immutable-data
      firstRendering.current = false;
    }
  }, [loadingState, loadMessages]);

  return (
    <LoadingErrorComponent
      isLoading={isLoading}
      loadingCaption={I18n.t("messageDetails.loadingText")}
      onAbort={props.cancel}
      onRetry={props.loadMessages}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => navigateBack(),
  loadMessages: () => dispatch(loadMessages.request())
});
const mapStateToProps = (state: GlobalState) => ({
  messageState: (messageId: string) =>
    messageStateByIdSelector(messageId)(state),
  allMessages: messagesAllIdsSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageRouterScreen);

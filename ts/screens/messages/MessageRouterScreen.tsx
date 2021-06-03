import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { useEffect, useState } from "react";
import { NavigationActions, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { LoadingErrorComponent } from "../../features/bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { navigateToEuCovidCertificateDetailScreen } from "../../features/euCovidCert/navigation/actions";
import { EUCovidCertificateAuthCode } from "../../features/euCovidCert/types/EUCovidCertificate";
import I18n from "../../i18n";
import { loadMessages } from "../../store/actions/messages";
import { navigateToMessageDetailScreenAction } from "../../store/actions/navigation";
import { messagesAllIdsSelector } from "../../store/reducers/entities/messages/messagesAllIds";
import { messageStateByIdSelector } from "../../store/reducers/entities/messages/messagesById";
import { GlobalState } from "../../store/reducers/types";
import { InferNavigationParams } from "../../types/react";
import { isStrictSome } from "../../utils/pot";
import { MessageDetailScreen } from "./MessageDetailScreen";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps<InferNavigationParams<typeof MessageDetailScreen>>;

const getLoadingState = (
  props: Props
): pot.Pot<
  CreatedMessageWithContentAndAttachments | undefined,
  string | undefined
> => {
  const messageId = props.navigation.getParam("messageId");
  // const messageId = "wrong";
  if (!isStrictSome(props.allMessages)) {
    return pot.map(props.allMessages, _ => undefined);
  }
  if (!props.allMessages.value.some(id => id === messageId)) {
    return pot.noneError(`Cannot found ${messageId} in messages list`);
  }
  const messageState = props.messageState(messageId);
  if (messageState === undefined) {
    return pot.noneError("MessageState is undefined");
  }
  return messageState.message;
};

const navigateToScreenHandler = (
  message: CreatedMessageWithContentAndAttachments,
  props: Props
) => {
  if (message.content.eu_covid_cert !== undefined) {
    props.navigateToEuCovidCertificate(
      message.content.eu_covid_cert.auth_code as EUCovidCertificateAuthCode,
      message.id
    );
  } else {
    props.navigateToDetails(message.id);
  }
};

const MessageRouterScreen = (props: Props): React.ReactElement => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstRendering, setFirstRendering] = useState(true);
  const loadingState = getLoadingState(props);

  useEffect(() => {
    // all the messages data are ready, no need to reload
    if (isStrictSome(loadingState) && loadingState.value !== undefined) {
      navigateToScreenHandler(loadingState.value, props);
    }
    if (isFirstRendering) {
      props.loadMessages();
      setIsLoading(true);
      setFirstRendering(false);
      return;
    }

    pot.fold(
      loadingState,
      () => setIsLoading(true),
      () => setIsLoading(true),
      _ => setIsLoading(true),
      _ => setIsLoading(false),
      _ => setIsLoading(false),
      _ => setIsLoading(true),
      (_, __) => setIsLoading(true),
      _ => setIsLoading(false)
    );
  }, [loadingState]);

  return (
    <LoadingErrorComponent
      isLoading={isLoading}
      loadingCaption={I18n.t("messageDetails.loadingText")}
      onAbort={props.cancel}
      onRetry={() => {
        setIsLoading(true);
        props.loadMessages();
      }}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(NavigationActions.back()),
  loadMessages: () => dispatch(loadMessages.request()),
  navigateToDetails: (messageId: string) => {
    dispatch(NavigationActions.back());
    dispatch(navigateToMessageDetailScreenAction({ messageId }));
  },
  navigateToEuCovidCertificate: (
    authCode: EUCovidCertificateAuthCode,
    messageId: string
  ) => {
    dispatch(NavigationActions.back());
    dispatch(navigateToEuCovidCertificateDetailScreen(authCode, messageId));
  }
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

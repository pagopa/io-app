import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { pipe } from "fp-ts/lib/function";
import { TagEnum as TagEnumPN } from "../../../definitions/backend/MessageCategoryPN";

import BaseScreenComponent from "../../components/screens/BaseScreenComponent";

import { euCovidCertificateEnabled } from "../../config";
import { LoadingErrorComponent } from "../../features/bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { navigateToEuCovidCertificateDetailScreen } from "../../features/euCovidCert/navigation/actions";
import { EUCovidCertificateAuthCode } from "../../features/euCovidCert/types/EUCovidCertificate";
import { navigateToPnMessageDetailsScreen } from "../../features/pn/navigation/actions";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { MessagesParamsList } from "../../navigation/params/MessagesParamsList";
import ROUTES from "../../navigation/routes";
import {
  loadMessageById,
  loadMessageDetails,
  upsertMessageStatusAttributes
} from "../../store/actions/messages";
import {
  navigateBack,
  navigateToPaginatedMessageDetailScreenAction
} from "../../store/actions/navigation";
import { loadServiceDetail } from "../../store/actions/services";
import { useIOSelector } from "../../store/hooks";
import { isPnEnabledSelector } from "../../store/reducers/backendStatus";
import { getDetailsByMessageId } from "../../store/reducers/entities/messages/detailsById";
import { getMessageById } from "../../store/reducers/entities/messages/paginatedById";
import {
  UIMessage,
  UIMessageDetails,
  UIMessageId
} from "../../store/reducers/entities/messages/types";
import { serviceByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { isStrictSome } from "../../utils/pot";
import { isLoadingOrUpdatingInbox } from "../../store/reducers/entities/messages/allPaginated";
import { trackPNPushOpened } from "../../features/pn/analytics";

export type MessageRouterScreenPaginatedNavigationParams = {
  messageId: UIMessageId;
  fromNotification: boolean;
};

type NavigationProps = IOStackNavigationRouteProps<
  MessagesParamsList,
  "MESSAGE_ROUTER_PAGINATED"
>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationProps;

/**
 * Choose the screen where to navigate, based on the message content.
 * TODO: refactor to return an action for _dispatch_
 * @param message
 * @param messageDetails
 */
const navigateToScreenHandler =
  (
    message: UIMessage,
    messageDetails: UIMessageDetails,
    isPnEnabled: boolean
  ) =>
  (dispatch: Props["navigation"]["dispatch"]) => {
    if (euCovidCertificateEnabled && messageDetails.euCovidCertificate) {
      navigateBack();
      navigateToEuCovidCertificateDetailScreen({
        authCode: messageDetails.euCovidCertificate
          .authCode as EUCovidCertificateAuthCode,
        messageId: message.id
      });
    } else if (isPnEnabled && message.category.tag === TagEnumPN.PN) {
      navigateBack();
      dispatch(
        navigateToPnMessageDetailsScreen({
          messageId: message.id,
          serviceId: message.serviceId
        })
      );
    } else {
      navigateBack();
      dispatch(
        navigateToPaginatedMessageDetailScreenAction({
          messageId: message.id,
          serviceId: message.serviceId
        })
      );
    }
  };

/**
 * Component for the message details.
 * Handle routing based on message type and reload if necessary.
 */
const MessageRouterScreen = ({
  cancel,
  isServiceAvailable,
  loadMessageById,
  loadMessageDetails,
  loadServiceDetail,
  maybeMessage,
  maybeMessageDetails,
  messageId,
  setMessageReadState,
  fromNotification,
  isSynchronizingInbox
}: Props): React.ReactElement => {
  const navigation = useNavigation();
  // used to automatically dispatch loadMessages if the pot is not some at the first rendering
  // (avoid displaying error at the first frame)
  const firstRendering = useRef(true);

  // used to avoid multiple navigations dispatch
  const [didNavigateToScreenHandler, setDidNavigateToScreenHandler] =
    useState(false);

  const isLoading = !pot.isError(maybeMessageDetails);

  const isPnEnabled = useIOSelector(isPnEnabledSelector);

  const tryLoadMessageDetails = useCallback(() => {
    if (maybeMessage === undefined) {
      loadMessageById(messageId);
    }
    loadMessageDetails(messageId);
  }, [maybeMessage, messageId, loadMessageById, loadMessageDetails]);

  useEffect(() => {
    if (!isServiceAvailable && maybeMessage) {
      loadServiceDetail(maybeMessage.serviceId);
    }
  }, [isServiceAvailable, loadServiceDetail, maybeMessage]);

  useEffect(() => {
    if (didNavigateToScreenHandler) {
      return;
    }

    // message in the list and its details loaded: green light
    if (isStrictSome(maybeMessageDetails) && maybeMessage !== undefined) {
      // TODO: this is a mitigation to prevent user from opening
      // a PN message without a confirmation. If the user taps on
      // a push notification from PN, she will navigate to the inbox
      // instead of the message details. A better solution with a good
      // UX will come later.
      //
      // https://pagopa.atlassian.net/browse/IA-917
      const isPNDetailsFromNotification =
        fromNotification && maybeMessage.category.tag === "PN";

      // This check is needed when opening from a notification tapped with
      // stopped/killed application. In that case, we must be sure that
      // `setMessageReadState` is called after any update on the message
      // list has ended, otherwise we may change the local "read" state of
      // a message and later have it been rewritten by a server delayed
      // response to the concurrent message list retrieval. This does not
      // happen when not coming from a push notification, since at this
      // point, the message list is already retrieved and saved in the
      // local state
      const isNotOpeningFromBackgroundNotificationWhileSynchronizingInbox =
        !fromNotification || !isSynchronizingInbox;

      if (isPNDetailsFromNotification) {
        trackPNPushOpened();
        navigation.navigate(ROUTES.MAIN, {
          screen: ROUTES.MESSAGES_HOME
        });
        setDidNavigateToScreenHandler(true);
      } else if (
        isNotOpeningFromBackgroundNotificationWhileSynchronizingInbox
      ) {
        setMessageReadState(maybeMessage);
        navigateToScreenHandler(
          maybeMessage,
          maybeMessageDetails.value,
          isPnEnabled
        )(navigation.dispatch);
        setDidNavigateToScreenHandler(true);
      }
      return;
    }
    if (firstRendering.current) {
      tryLoadMessageDetails();
      // eslint-disable-next-line functional/immutable-data
      firstRendering.current = false;
    }
  }, [
    didNavigateToScreenHandler,
    fromNotification,
    isSynchronizingInbox,
    isPnEnabled,
    maybeMessage,
    maybeMessageDetails,
    navigation,
    setMessageReadState,
    tryLoadMessageDetails
  ]);

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <LoadingErrorComponent
        errorText={I18n.t("global.genericError")}
        isLoading={isLoading}
        loadingCaption={I18n.t("messageDetails.loadingText")}
        onAbort={cancel}
        onRetry={tryLoadMessageDetails}
      />
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => navigateBack(),
  loadMessageById: (id: UIMessageId) => {
    dispatch(loadMessageById.request({ id }));
  },
  loadMessageDetails: (id: UIMessageId) => {
    dispatch(loadMessageDetails.request({ id }));
  },
  loadServiceDetail: (serviceId: string) =>
    dispatch(loadServiceDetail.request(serviceId)),
  setMessageReadState: (message: UIMessage) =>
    dispatch(
      upsertMessageStatusAttributes.request({
        message,
        update: { tag: "reading" }
      })
    )
});

const mapStateToProps = (state: GlobalState, ownProps: NavigationProps) => {
  const messageId = ownProps.route.params.messageId;
  const fromNotification = ownProps.route.params.fromNotification;
  const maybeMessage = pot.toUndefined(getMessageById(state, messageId));
  const isServiceAvailable = pipe(
    maybeMessage?.serviceId,
    O.fromNullable,
    O.map(serviceId => serviceByIdSelector(serviceId)(state) || pot.none),
    O.map(_ => Boolean(pot.toUndefined(_))),
    O.getOrElse(() => false)
  );
  const maybeMessageDetails = getDetailsByMessageId(state, messageId);
  const isSynchronizingInbox = isLoadingOrUpdatingInbox(state);
  return {
    isServiceAvailable,
    maybeMessage,
    maybeMessageDetails,
    messageId,
    fromNotification,
    isSynchronizingInbox
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageRouterScreen);

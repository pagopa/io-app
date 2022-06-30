import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import React, { useCallback, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { TagEnum as TagEnumBase } from "../../../../definitions/backend/MessageCategoryBase";
import { TagEnum as TagEnumPN } from "../../../../definitions/backend/MessageCategoryPN";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

import {
  euCovidCertificateEnabled,
  mvlEnabled,
  pnEnabled
} from "../../../config";
import { LoadingErrorComponent } from "../../../features/bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { navigateToEuCovidCertificateDetailScreen } from "../../../features/euCovidCert/navigation/actions";
import { EUCovidCertificateAuthCode } from "../../../features/euCovidCert/types/EUCovidCertificate";
import { navigateToMvlDetailsScreen } from "../../../features/mvl/navigation/actions";
import I18n from "../../../i18n";
import NavigationService from "../../../navigation/NavigationService";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { MessagesParamsList } from "../../../navigation/params/MessagesParamsList";
import {
  loadMessageById,
  loadMessageDetails,
  upsertMessageStatusAttributes
} from "../../../store/actions/messages";
import {
  navigateBack,
  navigateToPaginatedMessageDetailScreenAction
} from "../../../store/actions/navigation";
import { loadServiceDetail } from "../../../store/actions/services";
import { getDetailsByMessageId } from "../../../store/reducers/entities/messages/detailsById";
import {
  UIMessage,
  UIMessageDetails,
  UIMessageId
} from "../../../store/reducers/entities/messages/types";
import { serviceByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../../store/reducers/types";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { isStrictSome } from "../../../utils/pot";
import { getMessageById } from "../../../store/reducers/entities/messages/paginatedById";
import { navigateToPnMessageDetailsScreen } from "../../../features/pn/navigation/actions";

export type MessageRouterScreenPaginatedNavigationParams = {
  messageId: UIMessageId;
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
  (message: UIMessage, messageDetails: UIMessageDetails) =>
  (dispatch: Props["navigation"]["dispatch"]) => {
    if (euCovidCertificateEnabled && messageDetails.euCovidCertificate) {
      navigateBack();
      navigateToEuCovidCertificateDetailScreen({
        authCode: messageDetails.euCovidCertificate
          .authCode as EUCovidCertificateAuthCode,
        messageId: message.id
      });
    } else if (
      mvlEnabled &&
      message.category.tag === TagEnumBase.LEGAL_MESSAGE
    ) {
      navigateBack();
      dispatch(navigateToMvlDetailsScreen({ id: message.id }));
    } else if (pnEnabled && message.category.tag === TagEnumPN.PN) {
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
  setMessageReadState
}: Props): React.ReactElement => {
  const navigation = useNavigation();
  // used to automatically dispatch loadMessages if the pot is not some at the first rendering
  // (avoid displaying error at the first frame)
  const firstRendering = useRef(true);
  const isLoading = !pot.isError(maybeMessageDetails);

  const tryLoadMessageDetails = useCallback(() => {
    if (maybeMessage === undefined) {
      loadMessageById(messageId);
    }
    loadMessageDetails(messageId);
  }, [maybeMessage, messageId, loadMessageById, loadMessageDetails]);

  useOnFirstRender(() => {
    if (maybeMessage !== undefined && !maybeMessage.isRead) {
      setMessageReadState(maybeMessage);
    }
  });

  useEffect(() => {
    if (!isServiceAvailable && maybeMessage) {
      loadServiceDetail(maybeMessage.serviceId);
    }
  }, [isServiceAvailable, loadServiceDetail, maybeMessage]);

  useEffect(() => {
    // message in the list and its details loaded: green light
    if (isStrictSome(maybeMessageDetails) && maybeMessage !== undefined) {
      navigateToScreenHandler(
        maybeMessage,
        maybeMessageDetails.value
      )(navigation.dispatch);
      return;
    }
    if (firstRendering.current) {
      tryLoadMessageDetails();
      // eslint-disable-next-line functional/immutable-data
      firstRendering.current = false;
    }
  }, [
    loadMessageDetails,
    maybeMessage,
    maybeMessageDetails,
    messageId,
    navigation,
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
  const maybeMessage = pot.toUndefined(getMessageById(state, messageId));
  const isServiceAvailable = O.fromNullable(maybeMessage?.serviceId)
    .map(serviceId => serviceByIdSelector(serviceId)(state) || pot.none)
    .map(_ => Boolean(pot.toUndefined(_)))
    .getOrElse(false);
  const maybeMessageDetails = getDetailsByMessageId(state, messageId);
  return {
    isServiceAvailable,
    maybeMessage,
    maybeMessageDetails,
    messageId
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageRouterScreen);

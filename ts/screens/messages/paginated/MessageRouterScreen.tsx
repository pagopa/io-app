import React, { useCallback, useEffect, useRef } from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";

import {
  euCovidCertificateEnabled,
  maximumItemsFromAPI,
  pageSize
} from "../../../config";
import { LoadingErrorComponent } from "../../../features/bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { navigateToEuCovidCertificateDetailScreen } from "../../../features/euCovidCert/navigation/actions";
import { EUCovidCertificateAuthCode } from "../../../features/euCovidCert/types/EUCovidCertificate";
import I18n from "../../../i18n";
import {
  loadMessageDetails,
  loadPreviousPageMessages,
  reloadAllMessages
} from "../../../store/actions/messages";
import {
  navigateBack,
  navigateToPaginatedMessageDetailScreenAction
} from "../../../store/actions/navigation";
import { GlobalState } from "../../../store/reducers/types";
import { isStrictSome } from "../../../utils/pot";
import {
  UIMessage,
  UIMessageDetails,
  UIMessageId
} from "../../../store/reducers/entities/messages/types";
import { getDetailsByMessageId } from "../../../store/reducers/entities/messages/detailsById";
import * as allPaginated from "../../../store/reducers/entities/messages/allPaginated";
import {
  Cursor,
  getCursors
} from "../../../store/reducers/entities/messages/allPaginated";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";

type OwnProps = NavigationInjectedProps<{ messageId: UIMessageId }>;
type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Choose the screen where to navigate, based on the message content.
 * TODO: refactor to return an action for _dispatch_
 * @param message
 * @param messageDetails
 */
const navigateToScreenHandler =
  (message: UIMessage, messageDetails: UIMessageDetails) =>
  (dispatch: OwnProps["navigation"]["dispatch"]) => {
    if (euCovidCertificateEnabled && messageDetails.euCovidCertificate) {
      navigateBack();
      navigateToEuCovidCertificateDetailScreen({
        authCode: messageDetails.euCovidCertificate
          .authCode as EUCovidCertificateAuthCode,
        messageId: message.id
      });
    } else {
      navigateBack();
      dispatch(
        navigateToPaginatedMessageDetailScreenAction({
          message,
          messageDetails
        })
      );
    }
  };

const MessageRouterScreen = ({
  cancel,
  cursors,
  loadMessageDetails,
  loadPreviousPage,
  reloadPage,
  maybeMessage,
  maybeMessageDetails,
  messageId
}: Props): React.ReactElement => {
  const navigation = useNavigationContext();
  // used to automatically dispatch loadMessages if the pot is not some at the first rendering
  // (avoid displaying error at the first frame)
  const firstRendering = useRef(true);
  const isLoading = !pot.isError(maybeMessageDetails);

  const tryLoadMessageDetails = useCallback(() => {
    if (maybeMessage === undefined) {
      if (pot.isNone(cursors)) {
        // nothing in the collection, refresh
        reloadPage();
      } else if (pot.isSome(cursors)) {
        // something in the collection, get the new ones only
        loadPreviousPage(cursors.value.previous);
      }
    }
    loadMessageDetails(messageId);
  }, [
    maybeMessage,
    cursors,
    messageId,
    loadMessageDetails,
    loadPreviousPage,
    reloadPage
  ]);

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
    <LoadingErrorComponent
      errorText={I18n.t("global.genericError")}
      isLoading={isLoading}
      loadingCaption={I18n.t("messageDetails.loadingText")}
      onAbort={cancel}
      onRetry={tryLoadMessageDetails}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => navigateBack(),
  loadMessageDetails: (id: UIMessageId) => {
    dispatch(loadMessageDetails.request({ id }));
  },
  loadPreviousPage: (cursor?: Cursor) =>
    dispatch(
      loadPreviousPageMessages.request({
        cursor,
        pageSize: maximumItemsFromAPI
      })
    ),
  reloadPage: () => dispatch(reloadAllMessages.request({ pageSize }))
});
const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
  const messageId = ownProps.navigation.getParam("messageId");
  const maybeMessage = allPaginated.getById(state, messageId);
  const maybeMessageDetails = getDetailsByMessageId(state, messageId);
  const cursors = getCursors(state);
  return {
    cursors,
    maybeMessage,
    maybeMessageDetails,
    messageId
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageRouterScreen);

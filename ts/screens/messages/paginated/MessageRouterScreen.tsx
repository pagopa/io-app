import * as pot from "@pagopa/ts-commons/lib/pot";
import { CompatNavigationProp } from "@react-navigation/compat/src/types";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { TagEnum } from "../../../../definitions/backend/MessageCategoryBase";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

import {
  euCovidCertificateEnabled,
  maximumItemsFromAPI,
  mvlEnabled,
  pageSize
} from "../../../config";
import { LoadingErrorComponent } from "../../../features/bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { navigateToEuCovidCertificateDetailScreen } from "../../../features/euCovidCert/navigation/actions";
import { EUCovidCertificateAuthCode } from "../../../features/euCovidCert/types/EUCovidCertificate";
import { navigateToMvlDetailsScreen } from "../../../features/mvl/navigation/actions";
import I18n from "../../../i18n";
import NavigationService from "../../../navigation/NavigationService";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { MessagesParamsList } from "../../../navigation/params/MessagesParamsList";
import {
  loadMessageDetails,
  loadPreviousPageMessages,
  reloadAllMessages,
  upsertMessageStatusAttributes
} from "../../../store/actions/messages";
import {
  navigateBack,
  navigateToPaginatedMessageDetailScreenAction
} from "../../../store/actions/navigation";
import * as allPaginated from "../../../store/reducers/entities/messages/allPaginated";
import {
  Cursor,
  getCursors
} from "../../../store/reducers/entities/messages/allPaginated";
import { getDetailsByMessageId } from "../../../store/reducers/entities/messages/detailsById";
import {
  UIMessage,
  UIMessageDetails,
  UIMessageId
} from "../../../store/reducers/entities/messages/types";
import { GlobalState } from "../../../store/reducers/types";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { isStrictSome } from "../../../utils/pot";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";

export type MessageRouterScreenPaginatedNavigationParams = {
  messageId: UIMessageId;
  isArchived: boolean;
};

type OwnProps = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<MessagesParamsList, "MESSAGE_ROUTER_PAGINATED">
  >;
};
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
    } else if (mvlEnabled && message.category.tag === TagEnum.LEGAL_MESSAGE) {
      navigateBack();
      NavigationService.dispatchNavigationAction(
        navigateToMvlDetailsScreen({ id: message.id })
      );
    } else {
      navigateBack();
      dispatch(
        navigateToPaginatedMessageDetailScreenAction({
          message
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
  cursors,
  loadMessageDetails,
  loadPreviousPage,
  reloadPage,
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

  useOnFirstRender(() => {
    if (maybeMessage !== undefined && !maybeMessage.isRead) {
      setMessageReadState(maybeMessage.id);
    }
  });

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

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) => {
  const isArchived = Boolean(ownProps.navigation.getParam("isArchived"));
  const filter = { getArchived: isArchived };

  return {
    cancel: () => navigateBack(),
    loadMessageDetails: (id: UIMessageId) => {
      dispatch(loadMessageDetails.request({ id }));
    },
    loadPreviousPage: (cursor?: Cursor) =>
      dispatch(
        loadPreviousPageMessages.request({
          cursor,
          pageSize: maximumItemsFromAPI,
          filter
        })
      ),
    reloadPage: () => dispatch(reloadAllMessages.request({ pageSize, filter })),
    setMessageReadState: (messageId: string) =>
      dispatch(
        upsertMessageStatusAttributes.request({
          id: messageId,
          update: { tag: "reading" }
        })
      )
  };
};

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
  const messageId = ownProps.navigation.getParam("messageId");
  const isArchived = Boolean(ownProps.navigation.getParam("isArchived"));
  const maybeMessage = allPaginated.getById(state, messageId);
  const maybeMessageDetails = getDetailsByMessageId(state, messageId);
  const { archive, inbox } = getCursors(state);
  return {
    cursors: isArchived ? archive : inbox,
    maybeMessage,
    maybeMessageDetails,
    messageId
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageRouterScreen);

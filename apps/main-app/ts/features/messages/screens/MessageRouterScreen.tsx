import I18n from "i18next";
import { ReactElement, useCallback, useEffect, useRef } from "react";

import LoadingScreenContent from "../../../components/screens/LoadingScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import PN_ROUTES from "../../pn/navigation/routes";
import { trackOpenMessage } from "../analytics";
import { MessageRouterScreenErrorComponent } from "../components/MessageRouter/MessageRouterScreenErrorComponent";
import { MessagesParamsList } from "../navigation/params";
import { MESSAGES_ROUTES } from "../navigation/routes";
import {
  cancelGetMessageDataAction,
  getMessageDataAction,
  SuccessGetMessageDataActionType
} from "../store/actions";
import {
  blockedFromPushNotificationSelector,
  messageSuccessDataSelector,
  showSpinnerFromMessageGetStatusSelector
} from "../store/reducers/messageGetStatus";

export type MessageRouterScreenRouteParams = {
  fromNotification: boolean;
  messageId: string;
};

type NavigationProps = IOStackNavigationRouteProps<
  MessagesParamsList,
  "MESSAGE_ROUTER"
>;

export const MessageRouterScreen = (props: NavigationProps): ReactElement => {
  const messageId = props.route.params.messageId;
  const fromPushNotification = props.route.params.fromNotification;
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const isFirstRendering = useRef(true);
  const isLoading = useIOSelector(showSpinnerFromMessageGetStatusSelector);

  const messageSuccessDataOrUndefined = useIOSelector(
    messageSuccessDataSelector
  );
  const shouldNavigateBackAfterPushNotificationInteraction = useIOSelector(
    blockedFromPushNotificationSelector
  );

  const getMessageDataCallback = useCallback(() => {
    dispatch(
      getMessageDataAction.request({
        messageId,
        fromPushNotification
      })
    );
  }, [dispatch, fromPushNotification, messageId]);

  const onCancelCallback = useCallback(() => {
    dispatch(cancelGetMessageDataAction());
    navigation.goBack();
  }, [dispatch, navigation]);

  const onNavigateHomeCallback = useCallback(() => {
    navigation.navigate(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
  }, [navigation]);

  const navigateForwardCallback = useCallback(
    (data: SuccessGetMessageDataActionType) => {
      trackOpenMessage(
        data.serviceId,
        data.serviceName,
        data.organizationName,
        data.organizationFiscalCode,
        data.firstTimeOpening,
        data.containsPayment,
        data.hasRemoteContent,
        data.containsAttachments,
        fromPushNotification,
        data.hasFIMSCTA,
        data.createdAt,
        data.fciMessageType,
        data.fciResult
      );

      if (data.isLegacyGreenPass) {
        navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: MESSAGES_ROUTES.MESSAGE_GREEN_PASS
        });
      } else if (data.isPNMessage) {
        navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.MESSAGE_DETAILS,
            params: {
              messageId: data.messageId,
              serviceId: data.serviceId,
              firstTimeOpening: data.firstTimeOpening,
              sendOpeningSource: "message",
              sendUserType: "not_set"
            }
          }
        });
      } else {
        navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: MESSAGES_ROUTES.MESSAGE_DETAIL,
          params: {
            messageId: data.messageId,
            serviceId: data.serviceId
          }
        });
      }
    },
    [fromPushNotification, navigation]
  );

  useEffect(() => {
    if (isFirstRendering.current) {
      // eslint-disable-next-line functional/immutable-data
      isFirstRendering.current = false;
      getMessageDataCallback();
    } else if (messageSuccessDataOrUndefined) {
      navigateForwardCallback(messageSuccessDataOrUndefined);
    } else if (shouldNavigateBackAfterPushNotificationInteraction) {
      onNavigateHomeCallback();
    }
  }, [
    getMessageDataCallback,
    messageSuccessDataOrUndefined,
    navigateForwardCallback,
    onNavigateHomeCallback,
    shouldNavigateBackAfterPushNotificationInteraction
  ]);

  useHeaderSecondLevel({
    headerShown: isLoading,
    goBack: onCancelCallback,
    supportRequest: true,
    title: ""
  });
  if (isLoading) {
    return (
      <LoadingScreenContent
        headerVisible
        subtitle={I18n.t("messageDetails.pleaseWait")}
        testID="routerScreen-loading"
        title={I18n.t("messageDetails.loadingText")}
      />
    );
  }
  return (
    <MessageRouterScreenErrorComponent
      messageId={messageId}
      onCancel={onCancelCallback}
      onRetry={getMessageDataCallback}
    />
  );
};

import { StackActions, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef } from "react";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { LoadingErrorComponent } from "../../features/bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { MessagesParamsList } from "../../navigation/params/MessagesParamsList";
import ROUTES from "../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { UIMessageId } from "../../store/reducers/entities/messages/types";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { trackOpenMessage } from "../../features/messages/analytics";
import {
  blockedFromPushNotificationSelector,
  messageSuccessDataSelector,
  showSpinnerFromMessageGetStatusSelector,
  thirdPartyMessageDetailsErrorSelector
} from "../../store/reducers/entities/messages/messageGetStatus";
import {
  cancelGetMessageDataAction,
  getMessageDataAction,
  SuccessGetMessageDataActionType
} from "../../features/messages/actions";
import EUCOVIDCERT_ROUTES from "../../features/euCovidCert/navigation/routes";
import PN_ROUTES from "../../features/pn/navigation/routes";

export type MessageRouterScreenNavigationParams = {
  messageId: UIMessageId;
  fromNotification: boolean;
};

type NavigationProps = IOStackNavigationRouteProps<
  MessagesParamsList,
  "MESSAGE_ROUTER"
>;

export const MessageRouterScreen = (
  props: NavigationProps
): React.ReactElement => {
  const messageId = props.route.params.messageId;
  const fromPushNotification = props.route.params.fromNotification;
  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const isFirstRendering = useRef(true);
  const showSpinner = useIOSelector(showSpinnerFromMessageGetStatusSelector);
  const thirdPartyMessageDetailsError = useIOSelector(
    thirdPartyMessageDetailsErrorSelector
  );
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
      screen: ROUTES.MESSAGES_HOME
    });
  }, [navigation]);

  const navigateForwardCallback = useCallback(
    (data: SuccessGetMessageDataActionType) => {
      trackOpenMessage(
        data.organizationName,
        data.serviceName,
        data.firstTimeOpening,
        data.containsPayment,
        data.hasRemoteContent,
        data.containsAttachments,
        fromPushNotification
      );

      if (data.euCovidCerficateAuthCode) {
        navigation.dispatch(
          StackActions.replace(ROUTES.MESSAGES_NAVIGATOR, {
            screen: EUCOVIDCERT_ROUTES.MAIN,
            params: {
              screen: EUCOVIDCERT_ROUTES.CERTIFICATE,
              params: {
                authCode: data.euCovidCerficateAuthCode,
                messageId: data.messageId
              }
            }
          })
        );
      } else if (data.isPNMessage) {
        navigation.dispatch(
          StackActions.replace(ROUTES.MESSAGES_NAVIGATOR, {
            screen: PN_ROUTES.MAIN,
            params: {
              screen: PN_ROUTES.MESSAGE_DETAILS,
              params: {
                messageId: data.messageId,
                serviceId: data.serviceId,
                firstTimeOpening: data.firstTimeOpening
              }
            }
          })
        );
      } else {
        navigation.dispatch(
          StackActions.replace(ROUTES.MESSAGE_DETAIL, {
            messageId: data.messageId,
            serviceId: data.serviceId
          })
        );
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

  return (
    <BaseScreenComponent
      goBack={onCancelCallback}
      contextualHelp={emptyContextualHelp}
    >
      <LoadingErrorComponent
        errorText={
          thirdPartyMessageDetailsError
            ? I18n.t("messageDetails.remoteContentError.title")
            : I18n.t("global.genericError")
        }
        errorSubText={
          thirdPartyMessageDetailsError
            ? I18n.t("messageDetails.remoteContentError.body")
            : undefined
        }
        isLoading={showSpinner}
        loadingCaption={I18n.t("messageDetails.loadingText")}
        onAbort={onCancelCallback}
        onRetry={getMessageDataCallback}
      />
    </BaseScreenComponent>
  );
};

import { ReactElement, useCallback, useEffect, useRef } from "react";
import { View } from "react-native";
import { StackActions } from "@react-navigation/native";
import { Body, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { MessagesParamsList } from "../navigation/params";
import ROUTES from "../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { trackOpenMessage } from "../analytics";
import {
  blockedFromPushNotificationSelector,
  messageSuccessDataSelector,
  showSpinnerFromMessageGetStatusSelector,
  thirdPartyMessageDetailsErrorSelector
} from "../store/reducers/messageGetStatus";
import {
  cancelGetMessageDataAction,
  getMessageDataAction,
  SuccessGetMessageDataActionType
} from "../store/actions";
import PN_ROUTES from "../../pn/navigation/routes";
import { MESSAGES_ROUTES } from "../navigation/routes";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import LoadingScreenContent from "../../../components/screens/LoadingScreenContent";

export type MessageRouterScreenRouteParams = {
  messageId: string;
  fromNotification: boolean;
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
        data.createdAt
      );

      if (data.isLegacyGreenPass) {
        navigation.dispatch(
          StackActions.replace(MESSAGES_ROUTES.MESSAGE_GREEN_PASS)
        );
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
        navigation.dispatch(
          StackActions.replace(MESSAGES_ROUTES.MESSAGE_DETAIL, {
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

  useHeaderSecondLevel({
    goBack: onCancelCallback,
    supportRequest: true,
    title: ""
  });

  if (isLoading) {
    return (
      <LoadingScreenContent
        contentTitle={I18n.t("messageDetails.loadingText")}
        headerVisible
      >
        <View style={{ alignItems: "center" }}>
          <VSpacer size={8} />
          <Body>{I18n.t("messageDetails.pleaseWait")}</Body>
        </View>
      </LoadingScreenContent>
    );
  }

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("global.buttons.retry"),
        onPress: getMessageDataCallback
      }}
      pictogram="umbrella"
      secondaryAction={{
        label: I18n.t("global.buttons.cancel"),
        onPress: onCancelCallback
      }}
      subtitle={
        thirdPartyMessageDetailsError
          ? I18n.t("messageDetails.remoteContentError.body")
          : undefined
      }
      title={
        thirdPartyMessageDetailsError
          ? I18n.t("messageDetails.remoteContentError.title")
          : I18n.t("global.genericError")
      }
    />
  );
};

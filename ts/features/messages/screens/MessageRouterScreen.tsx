import { StackActions } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ContentWrapper,
  H4,
  LoadingSpinner,
  VSpacer
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "../../../i18n";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { MessagesParamsList } from "../navigation/params";
import ROUTES from "../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { UIMessageId } from "../types";
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
import EUCOVIDCERT_ROUTES from "../../euCovidCert/navigation/routes";
import PN_ROUTES from "../../pn/navigation/routes";
import { MESSAGES_ROUTES } from "../navigation/routes";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";

const styles = StyleSheet.create({
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  loaderSpinner: {
    alignSelf: "center"
  },
  loaderText: {
    textAlign: "center"
  }
});

export type MessageRouterScreenRouteParams = {
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
  const navigation = useIONavigation();
  const isFirstRendering = useRef(true);
  const safeAreaInsets = useSafeAreaInsets();
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
          StackActions.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
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
          StackActions.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
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
      <View
        style={[
          styles.loaderContainer,
          { paddingBottom: safeAreaInsets.bottom }
        ]}
      >
        <ContentWrapper>
          <View style={styles.loaderSpinner}>
            <LoadingSpinner size={48} />
          </View>
          <VSpacer size={16} />
          <H4 style={styles.loaderText}>
            {I18n.t("messageDetails.loadingText")}
          </H4>
        </ContentWrapper>
      </View>
    );
  }

  return (
    <OperationResultScreenContent
      action={{
        fullWidth: true,
        label: I18n.t("global.buttons.retry"),
        onPress: getMessageDataCallback
      }}
      pictogram="umbrellaNew"
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

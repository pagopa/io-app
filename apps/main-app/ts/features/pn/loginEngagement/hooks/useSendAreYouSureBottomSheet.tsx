import {
  FeatureInfo,
  IOButton,
  IOMarkdownLite,
  VSpacer,
  VStack
} from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import i18n from "i18next";
import { useCallback, useRef } from "react";
import { View } from "react-native";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { pnPrivacyUrlsSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { setSecurityAdviceReadyToShow } from "../../../authentication/fastLogin/store/actions/securityAdviceActions";
import { NotificationModalFlow } from "../../../pushNotifications/analytics";
import {
  trackSendActivationAccepted,
  trackSendActivationDeclined,
  trackSendNurturingDialogClosure
} from "../../analytics/send";
import { setSendEngagementScreenHasBeenDismissed } from "../store/actions";
import { useSendActivationFlow } from "./useSendActivationFlow";

export const flow: NotificationModalFlow = "access";

export const useSendAreYouSureBottomSheet = () => {
  const ctaPressed = useRef(false);
  const { privacy, tos } = useIOSelector(pnPrivacyUrlsSelector);
  const dispatch = useIODispatch();
  const { pop } = useIONavigation();
  const { isActivating, requestSendActivation } = useSendActivationFlow();
  const {
    bottomSheet: areYouSureBottomSheet,
    present: presentAreYouSureBottomSheet,
    dismiss
  } = useIOBottomSheetModal({
    title: i18n.t(
      "features.pn.loginEngagement.send.areYouSureBottomSheet.title"
    ),
    component: (
      <VStack space={24}>
        <FeatureInfo
          body={
            <IOMarkdownLite
              content={i18n.t(
                "features.pn.loginEngagement.send.areYouSureBottomSheet.content.features.savingMoney"
              )}
            />
          }
          pictogramProps={{ name: "savingMoney", pictogramStyle: "default" }}
        />
        <FeatureInfo
          body={
            <IOMarkdownLite
              content={i18n.t(
                "features.pn.loginEngagement.send.areYouSureBottomSheet.content.features.notification"
              )}
            />
          }
          pictogramProps={{ name: "message", pictogramStyle: "default" }}
        />
        <IOMarkdownLite
          content={i18n.t(
            "features.pn.loginEngagement.send.areYouSureBottomSheet.content.privacyAndTos",
            { privacyUrl: privacy, tosUrl: tos }
          )}
        />
        <VStack space={16} style={{ alignItems: "center" }}>
          <IOButton
            fullWidth
            label={i18n.t(
              "features.pn.loginEngagement.send.areYouSureBottomSheet.action"
            )}
            loading={isActivating}
            onPress={() => {
              // eslint-disable-next-line functional/immutable-data
              ctaPressed.current = true;
              trackSendActivationAccepted("nurturing_bottomsheet", flow);
              requestSendActivation();
            }}
            testID="sendActivationID"
          />
          <View>
            <IOButton
              label={i18n.t(
                "features.pn.loginEngagement.send.areYouSureBottomSheet.secondaryAction"
              )}
              onPress={() => {
                // eslint-disable-next-line functional/immutable-data
                ctaPressed.current = true;
                trackSendActivationDeclined(flow);
                dispatch(setSendEngagementScreenHasBeenDismissed());
                dispatch(setSecurityAdviceReadyToShow(true));
                pop();
              }}
              testID="sendDismissalID"
              textAlign="center"
              variant="link"
            />
          </View>
          <VSpacer size={8} />
        </VStack>
      </VStack>
    ),
    onDismiss: () => {
      /**
       * This is a workaround that allows us to track the bottom-sheet close
       * event only when the closing action is direct and not the result of
       * another action
       */
      if (!ctaPressed.current) {
        trackSendNurturingDialogClosure(flow);
      }
    }
  });

  useFocusEffect(
    // eslint-disable-next-line arrow-body-style
    useCallback(() => {
      return dismiss;
    }, [dismiss])
  );

  return {
    areYouSureBottomSheet,
    presentAreYouSureBottomSheet
  };
};

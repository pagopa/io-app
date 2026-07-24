import { IOButton, IOMarkdownLite, VStack } from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import i18n from "i18next";
import { useCallback, useRef } from "react";
import { View } from "react-native";

import { useIOSelector } from "../../../../store/hooks";
import { pnPrivacyUrlsSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { NotificationModalFlow } from "../../../pushNotifications/analytics";
import {
  trackSendAcceptanceDialogClosure,
  trackSendActivationAccepted
} from "../../analytics/send";
import { useSendActivationFlow } from "./useSendActivationFlow";

export const flow: NotificationModalFlow = "access";

export const useSendActivationBottomSheet = () => {
  const ctaPressed = useRef(false);
  const { privacy, tos } = useIOSelector(pnPrivacyUrlsSelector);
  const { isActivating, requestSendActivation } = useSendActivationFlow();

  const {
    bottomSheet: activationBottomSheet,
    present: presentActivationBottomSheet,
    dismiss
  } = useIOBottomSheetModal({
    title: i18n.t(
      "features.pn.loginEngagement.send.activationBottomSheet.title"
    ),
    component: (
      <VStack space={24}>
        <IOMarkdownLite
          content={i18n.t(
            "features.pn.loginEngagement.send.activationBottomSheet.content",
            { privacyUrl: privacy, tosUrl: tos }
          )}
        />
        <IOButton
          label={i18n.t(
            "features.pn.loginEngagement.send.activationBottomSheet.action"
          )}
          loading={isActivating}
          onPress={() => {
            // eslint-disable-next-line functional/immutable-data
            ctaPressed.current = true;
            trackSendActivationAccepted("tos_bottomsheet", flow);
            requestSendActivation();
          }}
          testID="sendActivationID"
        />
        {/* This empty View is used to add the bottom space */}
        <View />
      </VStack>
    ),
    onDismiss: () => {
      /**
       * This is a workaround that allows us to track the bottom-sheet close event only when
       * the closing action is direct and not the result of another action
       */
      if (!ctaPressed.current) {
        trackSendAcceptanceDialogClosure(flow);
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
    activationBottomSheet,
    presentActivationBottomSheet
  };
};

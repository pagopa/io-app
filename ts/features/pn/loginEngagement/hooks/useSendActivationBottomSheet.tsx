import { View } from "react-native";
import i18n from "i18next";
import { IOButton, VStack } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { pnPrivacyUrlsSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { useIOSelector } from "../../../../store/hooks";
import { useSendActivationFlow } from "./useSendActivationFlow";

export const useSendActivationBottomSheet = () => {
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
        <IOMarkdown
          content={i18n.t(
            "features.pn.loginEngagement.send.activationBottomSheet.content",
            { privacyUrl: privacy, tosUrl: tos }
          )}
        />
        <IOButton
          label={i18n.t(
            "features.pn.loginEngagement.send.activationBottomSheet.action"
          )}
          onPress={requestSendActivation}
          loading={isActivating}
        />
        {/* This empty View is used to add the bottom space */}
        <View />
      </VStack>
    )
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

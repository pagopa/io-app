import { View } from "react-native";
import i18next from "i18next";
import { IOButton, VStack } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useSendActivationFlow } from "./useSendActivationFlow";

const FAKE_URL = "https://www.google.com";

export const useSendActivationBottomSheet = () => {
  const { isActivating, requestSendActivation } = useSendActivationFlow();

  const {
    bottomSheet: activationBottomSheet,
    present: presentActivationBottomSheet,
    dismiss
  } = useIOBottomSheetModal({
    title: i18next.t(
      "features.pn.loginEngagement.send.activationBottomSheet.title"
    ),
    component: (
      <VStack space={24}>
        <IOMarkdown
          content={i18next.t(
            "features.pn.loginEngagement.send.activationBottomSheet.content",
            { privacyUrl: FAKE_URL, tosUrl: FAKE_URL }
          )}
        />
        <IOButton
          label={i18next.t(
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

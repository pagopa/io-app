import { View } from "react-native";
import i18next from "i18next";
import { IOButton, VStack } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";

const FAKE_URL = "https://www.google.com";

export const useSendActivationBottomSheet = () => {
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
          onPress={constNull} // TODO: Define action
          loading={false} // TODO: Define loading
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

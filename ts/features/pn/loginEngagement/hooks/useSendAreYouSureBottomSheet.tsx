import { View } from "react-native";
import {
  VStack,
  FeatureInfo,
  IOButton,
  VSpacer
} from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import i18next from "i18next";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";

const FAKE_URL = "https://www.google.com";

export const useSendAreYouSureBottomSheet = () => {
  const {
    bottomSheet: areYouSureBottomSheet,
    present: presentAreYouSureBottomSheet,
    dismiss
  } = useIOBottomSheetModal({
    title: i18next.t(
      "features.pn.loginEngagement.send.areYouSureBottomSheet.title"
    ),
    component: (
      <VStack space={24}>
        <FeatureInfo
          pictogramProps={{ name: "savingMoney", pictogramStyle: "default" }}
          body={
            <IOMarkdown
              content={i18next.t(
                "features.pn.loginEngagement.send.areYouSureBottomSheet.content.features.savingMoney"
              )}
            />
          }
        />
        <FeatureInfo
          pictogramProps={{ name: "message", pictogramStyle: "default" }}
          body={
            <IOMarkdown
              content={i18next.t(
                "features.pn.loginEngagement.send.areYouSureBottomSheet.content.features.notification"
              )}
            />
          }
        />
        <IOMarkdown
          content={i18next.t(
            "features.pn.loginEngagement.send.areYouSureBottomSheet.content.privacyAndTos",
            { privacyUrl: FAKE_URL, tosUrl: FAKE_URL }
          )}
        />
        <VStack space={16} style={{ alignItems: "center" }}>
          <IOButton
            label={i18next.t(
              "features.pn.loginEngagement.send.areYouSureBottomSheet.action"
            )}
            fullWidth
            onPress={constNull} // TODO: Define action
            loading={false} // TODO: Define loading
          />
          <View>
            <IOButton
              label={i18next.t(
                "features.pn.loginEngagement.send.areYouSureBottomSheet.secondaryAction"
              )}
              variant="link"
              textAlign="center"
              onPress={constNull} // TODO: Define action
            />
          </View>
          <VSpacer size={8} />
        </VStack>
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
    areYouSureBottomSheet,
    presentAreYouSureBottomSheet
  };
};

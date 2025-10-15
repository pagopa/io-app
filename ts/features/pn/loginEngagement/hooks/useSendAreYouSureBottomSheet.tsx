import { View } from "react-native";
import {
  VStack,
  FeatureInfo,
  IOButton,
  VSpacer
} from "@pagopa/io-app-design-system";
import i18n from "i18next";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { setSendEngagementScreenHasBeenDismissed } from "../store/actions";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { pnPrivacyUrlsSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { setSecurityAdviceReadyToShow } from "../../../authentication/fastLogin/store/actions/securityAdviceActions";
import { useSendActivationFlow } from "./useSendActivationFlow";

export const useSendAreYouSureBottomSheet = () => {
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
          pictogramProps={{ name: "savingMoney", pictogramStyle: "default" }}
          body={
            <IOMarkdown
              content={i18n.t(
                "features.pn.loginEngagement.send.areYouSureBottomSheet.content.features.savingMoney"
              )}
            />
          }
        />
        <FeatureInfo
          pictogramProps={{ name: "message", pictogramStyle: "default" }}
          body={
            <IOMarkdown
              content={i18n.t(
                "features.pn.loginEngagement.send.areYouSureBottomSheet.content.features.notification"
              )}
            />
          }
        />
        <IOMarkdown
          content={i18n.t(
            "features.pn.loginEngagement.send.areYouSureBottomSheet.content.privacyAndTos",
            { privacyUrl: privacy, tosUrl: tos }
          )}
        />
        <VStack space={16} style={{ alignItems: "center" }}>
          <IOButton
            label={i18n.t(
              "features.pn.loginEngagement.send.areYouSureBottomSheet.action"
            )}
            fullWidth
            onPress={requestSendActivation}
            loading={isActivating}
          />
          <View>
            <IOButton
              label={i18n.t(
                "features.pn.loginEngagement.send.areYouSureBottomSheet.secondaryAction"
              )}
              variant="link"
              textAlign="center"
              onPress={() => {
                dispatch(setSendEngagementScreenHasBeenDismissed());
                dispatch(setSecurityAdviceReadyToShow(true));
                pop();
              }}
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

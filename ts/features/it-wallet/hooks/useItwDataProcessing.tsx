import * as React from "react";
import { View } from "react-native";
import { Body, H6, VSpacer } from "@pagopa/io-app-design-system";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import I18n from "../../../i18n";

/**
 * A hook that returns a function to present an info bottom sheet
 * related to the data processing of the credentials issuing
 * @deprecated
 */
export const useItwDataProcessing = () => {
  const BottomSheetBody = () => (
    <View style={IOStyles.flex}>
      <H6>
        {I18n.t(
          "features.itWallet.issuing.credentialsIssuingInfoScreen.infoBottomSheet.body.firstHeaderTitle"
        )}
      </H6>
      <VSpacer size={8} />
      <Body>
        {I18n.t(
          "features.itWallet.issuing.credentialsIssuingInfoScreen.infoBottomSheet.body.firstBodyContent"
        )}
      </Body>
      <VSpacer size={24} />
      <H6>
        {I18n.t(
          "features.itWallet.issuing.credentialsIssuingInfoScreen.infoBottomSheet.body.secondHeaderTitle"
        )}
      </H6>
      <VSpacer size={8} />
      <Body>
        {I18n.t(
          "features.itWallet.issuing.credentialsIssuingInfoScreen.infoBottomSheet.body.secondBodyContent"
        )}
      </Body>
    </View>
  );
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.issuing.credentialsIssuingInfoScreen.infoBottomSheet.title"
    ),
    component: <BottomSheetBody />,
    snapPoint: [350]
  });

  return {
    dismiss,
    present,
    bottomSheet
  };
};

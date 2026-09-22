import { IOMarkdown, VStack } from "@io-app/design-system";
import I18n from "i18next";
import { Platform, View } from "react-native";

import { renderActionButtons } from "../../../../../components/ui/IOScrollView";
import { helpCenterHowToReadCieUrl } from "../../../../../config";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../../utils/url";

/**
 * Hook to display a bottom sheet explaining how the CIE NFC reading works, with
 * a link to the related Help Center article.
 *
 * @returns The bottom sheet component
 */
export const useCieNfcInfoBottomSheet = () => {
  const bottomSheet = useIOBottomSheetModal({
    title: I18n.t("features.itWallet.identification.cie.bottomSheet.nfc.title"),
    component: (
      <VStack space={24}>
        <IOMarkdown
          content={I18n.t(
            Platform.OS === "ios"
              ? "features.itWallet.identification.cie.bottomSheet.nfc.content.ios"
              : "features.itWallet.identification.cie.bottomSheet.nfc.content.android"
          )}
        />
        <View>
          {renderActionButtons(
            {
              type: "TwoButtons",
              primary: {
                label: I18n.t(
                  "features.itWallet.identification.cie.bottomSheet.nfc.primaryAction"
                ),
                onPress: () => bottomSheet.dismiss()
              },
              secondary: {
                label: I18n.t(
                  "features.itWallet.identification.cie.bottomSheet.nfc.secondaryAction"
                ),
                onPress: () => openWebUrl(helpCenterHowToReadCieUrl)
              }
            },
            16
          )}
        </View>
      </VStack>
    )
  });

  return bottomSheet;
};

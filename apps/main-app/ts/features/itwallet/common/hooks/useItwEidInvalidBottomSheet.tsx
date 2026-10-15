import { IOButton, VStack } from "@io-app/design-system";
import I18n from "i18next";

import IOMarkdown from "../../../../components/IOMarkdown";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";

/**
 * Bottom sheet explaining why the eID is invalid and how to update it.
 *
 * The content is static for now: it will be provided by the IPZS catalogue once
 * it supports messages for the PID statuses.
 *
 * @param onUpdatePress Called after the bottom sheet is dismissed, when the
 *   user chooses to update the eID
 */
export const useItwEidInvalidBottomSheet = (onUpdatePress: () => void) => {
  const bottomSheet = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.presentation.bottomSheets.eidInvalid.title"
    ),
    component: (
      <VStack space={24}>
        <IOMarkdown
          content={I18n.t(
            "features.itWallet.presentation.bottomSheets.eidInvalid.content"
          )}
        />
        <IOButton
          fullWidth
          label={I18n.t(
            "features.itWallet.presentation.bottomSheets.eidInvalid.cta"
          )}
          onPress={() => {
            bottomSheet.dismiss();
            onUpdatePress();
          }}
          testID="itwEidInvalidBottomSheetUpdateButtonTestID"
          variant="solid"
        />
      </VStack>
    )
  });

  return bottomSheet;
};

import { IOButton, IOMarkdownLite, VStack } from "@io-app/design-system";
import I18n from "i18next";

import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useCredentialStatusMessage } from "../../credentials/hooks/useCredentialStatusMessage";
import { CredentialType } from "../utils/itwMocksUtils";

/**
 * Bottom sheet explaining why the eID is invalid and how to update it.
 *
 * The content is resolved from the credentials catalogue status message.
 *
 * @param onUpdatePress Called after the bottom sheet is dismissed, when the
 *   user chooses to update the eID
 */
export const useItwEidInvalidBottomSheet = (onUpdatePress: () => void) => {
  const message = useCredentialStatusMessage(CredentialType.PID);
  const bottomSheet = useIOBottomSheetModal({
    title: message?.title ?? I18n.t("features.itWallet.card.status.unknown"),
    component: (
      <VStack space={24}>
        <IOMarkdownLite
          content={
            message?.description ??
            I18n.t("features.itWallet.card.status.unknown")
          }
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

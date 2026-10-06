import { IOButton, IOMarkdown, VStack } from "@io-app/design-system";
import I18n from "i18next";
import { View } from "react-native";

import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { trackCredentialRenewStart } from "../../../analytics";
import { getMixPanelCredential } from "../../../analytics/utils";
import { CREDENTIAL_STATUS_MAP } from "../../../analytics/utils/types";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import { useItwRemoveCredentialWithConfirm } from "./useItwRemoveCredentialWithConfirm";

type UseItwExpiredDocumentBottomSheetParams = {
  actionsShown?: boolean;
  credential: CredentialMetadata;
  localizedMessage: { description: string; title: string };
};

/**
 * Hook to manage the bottom sheet content for expired physical documents.
 *
 * TODO: [SIW-5214] Given the similarities with
 * `useItwIssuerDynamicErrorBottomSheet` consider refactoring both hooks.
 *
 * @param credential - The credential for which the bottom sheet is shown
 * @param localizedMessage - The localized message to show in the bottom sheet
 * @returns The bottom sheet modal object
 */
export const useItwExpiredDocumentBottomSheet = ({
  actionsShown = true,
  credential,
  localizedMessage
}: UseItwExpiredDocumentBottomSheetParams) => {
  const navigation = useIONavigation();
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const { confirmAndRemoveCredential } = useItwRemoveCredentialWithConfirm(
    credential,
    "bottom_sheet"
  );

  const handleUpdateCredential = () => {
    trackCredentialRenewStart(
      getMixPanelCredential(credential.credentialType, isItwL3),
      {
        credential_status: CREDENTIAL_STATUS_MAP.expired,
        position: "bottom_sheet"
      }
    );
    bottomSheet.dismiss();
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER,
      params: {
        credentialType: credential.credentialType,
        mode: "reissuance"
      }
    });
  };

  const bottomSheet = useIOBottomSheetModal({
    title: localizedMessage.title,
    component: (
      <VStack space={24}>
        <IOMarkdown content={localizedMessage.description} />
        {actionsShown ? (
          <VStack space={16}>
            <IOButton
              fullWidth
              label={I18n.t(
                "features.itWallet.presentation.credentialDetails.actions.updateDigitalCredential"
              )}
              onPress={handleUpdateCredential}
              variant="solid"
            />
            <View style={{ alignSelf: "center" }}>
              <IOButton
                color="danger"
                label={I18n.t(
                  "features.itWallet.presentation.credentialDetails.actions.removeFromWallet"
                )}
                onPress={confirmAndRemoveCredential}
                textAlign="center"
                variant="link"
              />
            </View>
          </VStack>
        ) : (
          <IOButton
            fullWidth
            label={I18n.t(
              "features.itWallet.presentation.bottomSheets.generic.expired.cta"
            )}
            onPress={() => bottomSheet.dismiss()}
            variant="solid"
          />
        )}
      </VStack>
    )
  });

  return bottomSheet;
};

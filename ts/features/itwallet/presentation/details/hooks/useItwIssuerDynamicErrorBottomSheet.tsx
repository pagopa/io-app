import { IOButton, VStack } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";
import IOMarkdown from "../../../../../components/IOMarkdown";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { trackCredentialRenewStart } from "../../../analytics";
import { getMixPanelCredential } from "../../../analytics/utils";
import { CREDENTIAL_STATUS_MAP } from "../../../analytics/utils/types";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import {
  CredentialMetadata,
  ItwCredentialStatus
} from "../../../common/utils/itwTypesUtils";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import { shouldShowMdlUpdateDigitalCredential } from "../utils";
import { useItwRemoveCredentialWithConfirm } from "./useItwRemoveCredentialWithConfirm";

type IssuerDynamicErrorBottomSheetActionMode =
  | "none"
  | "removeOnly"
  | "updateAndRemove";

type IssuerDynamicErrorBottomSheetContentConfig = {
  actionMode: IssuerDynamicErrorBottomSheetActionMode;
  showDrivingLicenseExtraContent: boolean;
};

type UseItwIssuerDynamicErrorBottomSheetParams = {
  credential: CredentialMetadata;
  localizedMessage: { title: string; description: string };
  status?: ItwCredentialStatus;
};

/**
 * Maps the issuer dynamic error state to the additional mDL-only content/actions
 * shown in the bottom sheet.
 *
 * - non-mDL credentials never render extra CTAs here
 * - expired mDL credentials show both update and remove actions
 * - invalid mDL credentials show both update and remove actions only when
 *   the issuer error code is `credential_invalid`
 * - any other mDL status falls back to the single remove action
 */
export const getIssuerDynamicErrorBottomSheetContentConfig = (
  credential: CredentialMetadata,
  status?: ItwCredentialStatus
): IssuerDynamicErrorBottomSheetContentConfig => {
  const { credentialType } = credential;

  if (credentialType !== CredentialType.DRIVING_LICENSE) {
    return {
      actionMode: "none",
      showDrivingLicenseExtraContent: false
    };
  }

  if (status === "expired") {
    return {
      actionMode: "updateAndRemove",
      showDrivingLicenseExtraContent: true
    };
  }

  if (shouldShowMdlUpdateDigitalCredential(credential, status)) {
    return {
      actionMode: "updateAndRemove",
      showDrivingLicenseExtraContent: false
    };
  }

  return {
    actionMode: "removeOnly",
    showDrivingLicenseExtraContent: false
  };
};

export const useItwIssuerDynamicErrorBottomSheet = ({
  credential,
  localizedMessage,
  status
}: UseItwIssuerDynamicErrorBottomSheetParams) => {
  const navigation = useIONavigation();
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const { confirmAndRemoveCredential } = useItwRemoveCredentialWithConfirm(
    credential,
    "bottom_sheet"
  );
  const contentConfig = getIssuerDynamicErrorBottomSheetContentConfig(
    credential,
    status
  );

  const handleUpdateCredential = () => {
    if (status) {
      trackCredentialRenewStart(
        getMixPanelCredential(credential.credentialType, isItwL3),
        {
          credential_status: CREDENTIAL_STATUS_MAP[status],
          position: "bottom_sheet"
        }
      );
    }
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
        {contentConfig.showDrivingLicenseExtraContent && (
          <IOMarkdown
            content={I18n.t(
              "features.itWallet.presentation.bottomSheets.mDL.expired.content"
            )}
          />
        )}
        {contentConfig.actionMode === "updateAndRemove" && (
          <VStack space={16}>
            <IOButton
              variant="solid"
              fullWidth
              label={I18n.t(
                "features.itWallet.presentation.credentialDetails.actions.updateDigitalCredential"
              )}
              onPress={handleUpdateCredential}
            />
            <View style={{ alignSelf: "center" }}>
              <IOButton
                variant="link"
                color="danger"
                textAlign="center"
                label={I18n.t(
                  "features.itWallet.presentation.credentialDetails.actions.removeFromWallet"
                )}
                onPress={confirmAndRemoveCredential}
              />
            </View>
          </VStack>
        )}
        {contentConfig.actionMode === "removeOnly" && (
          <View style={{ marginBottom: 16 }}>
            <IOButton
              variant="solid"
              fullWidth
              label={I18n.t(
                "features.itWallet.presentation.alerts.mdl.invalid.cta"
              )}
              onPress={confirmAndRemoveCredential}
            />
          </View>
        )}
      </VStack>
    )
  });

  return bottomSheet;
};

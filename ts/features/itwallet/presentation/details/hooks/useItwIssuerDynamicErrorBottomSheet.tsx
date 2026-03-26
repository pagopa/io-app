import { IOButton, VStack } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";
import IOMarkdown from "../../../../../components/IOMarkdown";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import {
  ItwCredentialStatus,
  StoredCredential
} from "../../../common/utils/itwTypesUtils";
import { ITW_ROUTES } from "../../../navigation/routes";
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
  credential: StoredCredential;
  localizedMessage: { title: string; description: string };
  onTrackPressCta: () => void;
  status?: ItwCredentialStatus;
};

/**
 * Maps the issuer dynamic error state to the additional mDL-only content/actions
 * shown in the bottom sheet.
 *
 * - non-mDL credentials never render extra CTAs here
 * - expired/invalid mDL credentials show both update and remove actions
 * - any other mDL status falls back to the single remove action
 */
export const getIssuerDynamicErrorBottomSheetContentConfig = (
  credentialType: StoredCredential["credentialType"],
  status?: ItwCredentialStatus
): IssuerDynamicErrorBottomSheetContentConfig => {
  if (credentialType !== CredentialType.DRIVING_LICENSE) {
    return {
      actionMode: "none",
      showDrivingLicenseExtraContent: false
    };
  }

  switch (status) {
    case "expired":
      return {
        actionMode: "updateAndRemove",
        showDrivingLicenseExtraContent: true
      };
    case "invalid":
      return {
        actionMode: "updateAndRemove",
        showDrivingLicenseExtraContent: false
      };
    default:
      return {
        actionMode: "removeOnly",
        showDrivingLicenseExtraContent: false
      };
  }
};

export const useItwIssuerDynamicErrorBottomSheet = ({
  credential,
  localizedMessage,
  onTrackPressCta,
  status
}: UseItwIssuerDynamicErrorBottomSheetParams) => {
  const navigation = useIONavigation();
  const { confirmAndRemoveCredential } =
    useItwRemoveCredentialWithConfirm(credential);
  const contentConfig = getIssuerDynamicErrorBottomSheetContentConfig(
    credential.credentialType,
    status
  );

  const handleUpdateCredential = () => {
    onTrackPressCta();
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

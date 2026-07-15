import { Body, FooterActions, VStack } from "@io-app/design-system";
import I18n from "i18next";

import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useItwAuthSourceName } from "../../common/hooks/useItwAuthSourceName";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";

type Props = {
  credential: CredentialMetadata;
};

/**
 * Bottom sheet informing the user how to report wrong or inconsistent data
 * found in the credential preview. It names the authentic source responsible
 * for the credential data, when available.
 */
export const useItwSomethingWrongBottomSheet = ({ credential }: Props) => {
  const authSource = useItwAuthSourceName(
    credential.credentialType,
    credential
  );

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.issuance.credentialPreview.bottomSheet.somethingWrong.title"
    ),
    component: (
      <VStack space={16}>
        <Body>
          {I18n.t(
            "features.itWallet.issuance.credentialPreview.bottomSheet.somethingWrong.body"
          )}
        </Body>
        {authSource && (
          <Body>
            {I18n.t(
              "features.itWallet.issuance.credentialPreview.bottomSheet.somethingWrong.bodyAuthSource",
              { authSource }
            )}
          </Body>
        )}
        <Body>
          {I18n.t(
            "features.itWallet.issuance.credentialPreview.bottomSheet.somethingWrong.bodyFooter"
          )}
        </Body>
      </VStack>
    ),
    footer: (
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t(
              "features.itWallet.issuance.credentialPreview.bottomSheet.somethingWrong.primaryAction"
            ),
            onPress: () => dismiss()
          }
        }}
      />
    )
  });

  return { present, bottomSheet, dismiss };
};

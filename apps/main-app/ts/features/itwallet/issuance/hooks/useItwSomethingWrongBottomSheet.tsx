import { FooterActions, IOMarkdown, VSpacer } from "@io-app/design-system";
import I18n from "i18next";

import { useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useItwAuthSourceName } from "../../common/hooks/useItwAuthSourceName";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { itwAuthenticSourceContactsSelector } from "../../credentialsCatalogue/store/selectors";
import { getAuthSourceContactsMarkdown } from "../utils/authSourceContacts";

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
  const authSourceContacts = useIOSelector(
    itwAuthenticSourceContactsSelector(credential.credentialType)
  );

  const markdownContent = I18n.t(
    "features.itWallet.issuance.credentialPreview.bottomSheet.somethingWrong.bodyMarkdown",
    {
      contacts: getAuthSourceContactsMarkdown({
        authSource,
        contacts: authSourceContacts,
        websiteLabel: I18n.t(
          "features.itWallet.issuance.credentialPreview.bottomSheet.somethingWrong.contactUrl"
        )
      })
    }
  );

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.issuance.credentialPreview.bottomSheet.somethingWrong.title"
    ),
    component: (
      <>
        <IOMarkdown content={markdownContent} />
        <VSpacer size={32} />
      </>
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

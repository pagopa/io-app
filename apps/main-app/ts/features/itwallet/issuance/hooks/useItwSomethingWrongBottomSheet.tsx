import {
  Body,
  FooterActions,
  IOMarkdown,
  VSpacer,
  VStack
} from "@io-app/design-system";
import I18n from "i18next";
import { useMemo } from "react";

import { useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useItwAuthSourceName } from "../../common/hooks/useItwAuthSourceName";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { itwAuthenticSourceContactsSelector } from "../../credentialsCatalogue/store/selectors";

type AuthSourceContact = { type: string; value: string };

type Props = {
  credential: CredentialMetadata;
};

// Contacts that link to websites must be displayed on top.
const sortContactsByUrl = (contacts: Array<AuthSourceContact>) =>
  [...contacts].sort((a, b) => {
    if (a.type === "url" && b.type !== "url") {
      return -1;
    }
    if (a.type !== "url" && b.type === "url") {
      return 1;
    }
    return 0;
  });

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

  const contactsText = useMemo(() => {
    if (!authSourceContacts || authSourceContacts.length === 0) {
      return I18n.t(
        "features.itWallet.issuance.credentialPreview.bottomSheet.somethingWrong.bodyAuthSource",
        { contacts: `- ${authSource}` }
      );
    }
    const sorted = sortContactsByUrl(authSourceContacts);
    const urlPrefixLabel = I18n.t(
      "features.itWallet.issuance.credentialPreview.bottomSheet.somethingWrong.contactUrl"
    );

    const mapContactTypeToListItem = (contact: AuthSourceContact) => {
      switch (contact.type) {
        case "email":
          return `- [${contact.value}](mailto:${contact.value})`;
        case "url":
          return `- [${urlPrefixLabel} ${authSource}](${contact.value})`;
        default:
          return `- [${contact.value}](${contact.value})`;
      }
    };

    return I18n.t(
      "features.itWallet.issuance.credentialPreview.bottomSheet.somethingWrong.bodyAuthSource",
      { contacts: sorted.map(mapContactTypeToListItem).join("\n") }
    );
  }, [authSource, authSourceContacts]);

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.issuance.credentialPreview.bottomSheet.somethingWrong.title"
    ),
    component: (
      <>
        <VStack space={16}>
          <Body>
            {I18n.t(
              "features.itWallet.issuance.credentialPreview.bottomSheet.somethingWrong.body"
            )}
          </Body>
          <Body>
            {I18n.t(
              "features.itWallet.issuance.credentialPreview.bottomSheet.somethingWrong.bodyFooter"
            )}
          </Body>
          <IOMarkdown content={contactsText} />
        </VStack>
        <VSpacer size={48} />
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

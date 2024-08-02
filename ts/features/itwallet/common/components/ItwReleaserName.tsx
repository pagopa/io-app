import { ListItemInfo } from "@pagopa/io-app-design-system";
import React, { useMemo } from "react";
import I18n from "../../../../i18n";
import { useItwInfoBottomSheet } from "../hooks/useItwInfoBottomSheet";
import { StoredCredential } from "../utils/itwTypesUtils";

type Props = {
  credential: StoredCredential;
  isPreview?: boolean;
};

/**
 * Renders the releaser name with an info button that opens the bottom sheet.
 * This is not part of the claims list because it's not a claim.
 * Thus it's rendered separately.
 * @param releaserName - the releaser name.
 * @param isPreview - whether the component is rendered in preview mode which hides the info button.
 * @returns the list item with the releaser name.
 */
export const ItwReleaserName = ({ credential, isPreview }: Props) => {
  const releaserName =
    credential.issuerConf.federation_entity.organization_name;
  const label = I18n.t(
    "features.itWallet.verifiableCredentials.claims.releasedBy"
  );
  const releasedByBottomSheet = useItwInfoBottomSheet({
    title:
      releaserName ??
      I18n.t("features.itWallet.generic.placeholders.organizationName"),
    content: [
      {
        title: I18n.t(
          "features.itWallet.issuance.credentialPreview.bottomSheet.about.title"
        ),
        body: I18n.t(
          "features.itWallet.issuance.credentialPreview.bottomSheet.about.subtitle"
        )
      }
    ]
  });
  const endElement: ListItemInfo["endElement"] = useMemo(() => {
    if (isPreview) {
      return;
    }

    return {
      type: "iconButton",
      componentProps: {
        icon: "info",
        accessibilityLabel: "test",
        onPress: () => releasedByBottomSheet.present()
      }
    };
  }, [isPreview, releasedByBottomSheet]);

  if (!releaserName) {
    return null;
  }

  return (
    <>
      <ListItemInfo
        endElement={endElement}
        label={label}
        value={releaserName}
        accessibilityLabel={`${label} ${releaserName}`}
      />
      {releasedByBottomSheet.bottomSheet}
    </>
  );
};

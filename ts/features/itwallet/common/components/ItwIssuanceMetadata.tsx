import { Divider, ListItemInfo } from "@pagopa/io-app-design-system";
import React, { useMemo } from "react";
import { pipe } from "fp-ts/lib/function";
import {} from "lodash";
import * as O from "fp-ts/lib/Option";
import I18n from "../../../../i18n";
import { useItwInfoBottomSheet } from "../hooks/useItwInfoBottomSheet";
import { StoredCredential } from "../utils/itwTypesUtils";

type Props = {
  credential: StoredCredential;
  isPreview?: boolean;
};

const getAuthSource = (credential: StoredCredential) =>
  pipe(
    credential.issuerConf.openid_credential_issuer
      .credential_configurations_supported[credential.credentialType],
    O.fromNullable,
    // @ts-expect-error update io-react-native-wallet
    O.map(config => config.authentic_source),
    O.toUndefined
  );

/**
 * Renders additional issuance-related metadata, i.e. releaser and auth source.
 * They are not part of the claims list, thus they're rendered separately.
 * @param credential - the credential with the issuer configuration
 * @param isPreview - whether the component is rendered in preview mode which hides the info button.
 * @returns the list items with the metadata.
 */
export const ItwIssuanceMetadata = ({ credential, isPreview }: Props) => {
  const releaserName =
    credential.issuerConf.federation_entity.organization_name;
  const authSource = getAuthSource(credential) ?? "Italia IO";

  const releaserNameLabel = I18n.t(
    "features.itWallet.verifiableCredentials.claims.releasedBy"
  );
  const authSourceLabel = I18n.t(
    "features.itWallet.verifiableCredentials.claims.authenticSource"
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

  return (
    <>
      {authSource && (
        <ListItemInfo
          label={authSourceLabel}
          value={authSource}
          accessibilityLabel={`${authSourceLabel} ${authSource}`}
        />
      )}
      {authSource && releaserName && <Divider />}
      {releaserName && (
        <>
          <ListItemInfo
            endElement={endElement}
            label={releaserNameLabel}
            value={releaserName}
            accessibilityLabel={`${releaserNameLabel} ${releaserName}`}
          />
          {releasedByBottomSheet.bottomSheet}
        </>
      )}
    </>
  );
};

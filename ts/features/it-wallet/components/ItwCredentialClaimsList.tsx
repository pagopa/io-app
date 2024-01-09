import React from "react";
import { ListItemInfo } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { SdJwt } from "@pagopa/io-react-native-wallet";
import { useNavigation } from "@react-navigation/native";
import I18n from "../../../i18n";
import { useItwInfoBottomSheet } from "../hooks/useItwInfoBottomSheet";
import { StoredCredential } from "../utils/itwTypesUtils";
import { parseClaims, sortClaims } from "../utils/itwClaimsUtils";
import { CredentialType, mapAssuranceLevel } from "../utils/itwMocksUtils";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../navigation/ItwParamsList";
import ItwCredentialClaim from "./ItwCredentialClaim";

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param data - the {@link StoredCredential} of the credential.
 */
const ItwCredentialClaimsList = ({
  data: {
    parsedCredential,
    displayData,
    issuerConf,
    credential,
    credentialType
  }
}: {
  data: StoredCredential;
}) => {
  const claims = parseClaims(sortClaims(displayData.order, parsedCredential));
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();

  /**
   * Renders the releaser name with an info button that opens the bottom sheet.
   * This is not part of the claims list because it's not a claim.
   * Thus it's rendered separately.
   * @param releaserName - the releaser name.
   * @returns the list item with the releaser name.
   */
  const RenderReleaserName = () => {
    const releaserName = issuerConf.federation_entity.organization_name;
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
            "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.about.title"
          ),
          body: I18n.t(
            "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.about.subtitle"
          )
        },
        {
          title: I18n.t(
            "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.data.title"
          ),
          body: I18n.t(
            "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.data.subtitle"
          )
        }
      ]
    });

    return (
      <>
        {releaserName ? (
          <>
            <ListItemInfo
              endElement={{
                type: "iconButton",
                componentProps: {
                  icon: "info",
                  accessibilityLabel: "test",
                  onPress: () => releasedByBottomSheet.present()
                }
              }}
              label={label}
              value={releaserName}
              accessibilityLabel={`${label} ${releaserName}`}
            />
            {releasedByBottomSheet.bottomSheet}
          </>
        ) : null}
      </>
    );
  };

  /**
   * Renders the PID assurance level with an info button that currenlt navigates to a not available screen.
   * If the credential is not a PID credential, it returns null.
   * This is not part of the claims list because it's not a claim.
   * Thus it's rendered separately.
   * @returns the list item with the PID assurance level.
   */
  const RenderPidAssuranceLevel = () => {
    if (credentialType === CredentialType.PID) {
      const { sdJwt } = SdJwt.decode(credential, SdJwt.SdJwt4VC);
      const assuranceLevel = mapAssuranceLevel(
        sdJwt.payload.verified_claims.verification.assurance_level
      );
      return (
        <ListItemInfo
          label={I18n.t(
            "features.itWallet.verifiableCredentials.claims.securityLevel"
          )}
          value={assuranceLevel}
          endElement={{
            type: "iconButton",
            componentProps: {
              icon: "info",
              onPress: () => navigation.navigate("ITW_GENERIC_NOT_AVAILABLE"),
              accessibilityLabel: ""
            }
          }}
        />
      );
    } else {
      return null;
    }
  };

  return (
    <>
      {claims.map((elem, index) => (
        <View key={index}>
          <ItwCredentialClaim claim={elem} />
        </View>
      ))}
      <RenderReleaserName />
      <RenderPidAssuranceLevel />
    </>
  );
};

export default ItwCredentialClaimsList;

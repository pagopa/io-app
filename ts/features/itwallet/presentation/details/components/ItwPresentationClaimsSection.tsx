import {
  Divider,
  H6,
  IconButton,
  useIOTheme
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Fragment, useMemo } from "react";
import { View } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks.ts";
import { ItwCredentialClaim } from "../../../common/components/ItwCredentialClaim.tsx";
import { ItwIssuanceMetadata } from "../../../common/components/ItwIssuanceMetadata.tsx";
import { ItwQrCodeClaimImage } from "../../../common/components/ItwQrCodeClaimImage.tsx";
import { itwSetClaimValuesHidden } from "../../../common/store/actions/preferences.ts";
import { itwIsClaimValueHiddenSelector } from "../../../common/store/selectors/preferences.ts";
import {
  parseClaims,
  WellKnownClaim
} from "../../../common/utils/itwClaimsUtils.ts";
import { getCredentialStatus } from "../../../common/utils/itwCredentialStatusUtils.ts";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils.ts";

type ItwPresentationClaimsSectionProps = {
  credential: CredentialMetadata;
};

export const ItwPresentationClaimsSection = ({
  credential
}: ItwPresentationClaimsSectionProps) => {
  const theme = useIOTheme();
  const dispatch = useIODispatch();

  const credentialStatus = useMemo(
    () => getCredentialStatus(credential),
    [credential]
  );

  const claims = parseClaims(credential.parsedCredential, {
    exclude: [WellKnownClaim.unique_id, WellKnownClaim.content]
  });

  const valuesHidden = useIOSelector(itwIsClaimValueHiddenSelector);

  const handleToggleClaimVisibility = () => {
    dispatch(itwSetClaimValuesHidden(!valuesHidden));
  };

  const renderHideValuesToggle = () => (
    <View
      accessible={true}
      accessibilityLabel={I18n.t(
        "features.itWallet.presentation.credentialDetails.actions.hideClaimValues"
      )}
      accessibilityRole="switch"
      accessibilityState={{ checked: valuesHidden }}
    >
      <IconButton
        testID="toggle-claim-visibility"
        icon={valuesHidden ? "eyeHide" : "eyeShow"}
        onPress={handleToggleClaimVisibility}
        accessibilityLabel={I18n.t(
          "features.itWallet.presentation.credentialDetails.actions.hideClaimValues"
        )}
      />
    </View>
  );

  return (
    <View>
      {
        // If do not have claims, we should not render the title and the toggle
        claims.length > 0 && (
          <>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <H6 color={theme["textHeading-tertiary"]}>
                {I18n.t(
                  "features.itWallet.presentation.credentialDetails.documentDataTitle"
                )}
              </H6>
              {renderHideValuesToggle()}
            </View>
          </>
        )
      }
      {claims.map((claim, index) => {
        if (claim.id === WellKnownClaim.link_qr_code) {
          // Since the `link_qr_code` claim  difficult to distinguish from a generic image claim, we need to manually
          // check for the claim and render it accordingly
          return <ItwQrCodeClaimImage key={index} claim={claim} />;
        }

        return (
          <Fragment key={index}>
            {index !== 0 && <Divider />}
            <ItwCredentialClaim
              claim={claim}
              isPreview={false}
              hidden={valuesHidden}
              credentialStatus={credentialStatus}
              credentialType={credential.credentialType}
            />
          </Fragment>
        );
      })}
      {claims.length > 0 && <Divider />}
      <ItwIssuanceMetadata credential={credential} isPreview={false} />
    </View>
  );
};

import { Divider, ListItemHeader } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { Fragment } from "react/jsx-runtime";
import { useRoute } from "@react-navigation/native";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { ItwCredentialClaim } from "../../../common/components/ItwCredentialClaim";
import { ItwEidLifecycleAlert } from "../../../common/components/ItwEidLifecycleAlert";
import { ItwIssuanceMetadata } from "../../../common/components/ItwIssuanceMetadata";
import {
  parseClaims,
  WellKnownClaim
} from "../../../common/utils/itwClaimsUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";

type Props = {
  credential: CredentialMetadata;
};

export const ItwPresentationPidDetail = ({ credential }: Props) => {
  const [claimsHidden, setClaimsHidden] = useState(false);
  const navigation = useIONavigation();
  const { name: currentScreenName } = useRoute();

  const listItemHeaderLabel = I18n.t(
    "features.itWallet.presentation.itWalletId.listItemHeader"
  );
  const claims = useMemo(
    () =>
      parseClaims(credential.parsedCredential, {
        exclude: [WellKnownClaim.unique_id, WellKnownClaim.content]
      }),
    [credential.parsedCredential]
  );

  const endElement = useMemo<ListItemHeader["endElement"]>(
    () => ({
      type: "iconButton",
      componentProps: {
        icon: claimsHidden ? "eyeHide" : "eyeShow",
        accessibilityLabel: listItemHeaderLabel,
        onPress: () => setClaimsHidden(state => !state)
      }
    }),
    [claimsHidden, listItemHeaderLabel]
  );

  return (
    <View>
      <ItwEidLifecycleAlert
        navigation={navigation}
        currentScreenName={currentScreenName}
        lifecycleStatus={["jwtExpiring", "jwtExpired"]}
        skipViewTracking={false}
      />
      {claims.length > 0 && (
        <ListItemHeader label={listItemHeaderLabel} endElement={endElement} />
      )}
      {claims.map((claim, index) => (
        <Fragment key={claim.id}>
          {index !== 0 && <Divider />}
          <ItwCredentialClaim claim={claim} isPreview hidden={claimsHidden} />
        </Fragment>
      ))}
      {claims.length > 0 && <Divider />}
      <ItwIssuanceMetadata credential={credential} />
    </View>
  );
};

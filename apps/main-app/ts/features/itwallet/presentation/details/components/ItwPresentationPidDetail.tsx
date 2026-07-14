import { Divider, ListItemHeader } from "@io-app/design-system";
import { useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { Fragment } from "react/jsx-runtime";

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
        currentScreenName={currentScreenName}
        lifecycleStatus={["jwtExpiring", "jwtExpired"]}
        navigation={navigation}
        skipViewTracking={false}
      />
      {claims.length > 0 && (
        <ListItemHeader endElement={endElement} label={listItemHeaderLabel} />
      )}
      {claims.map((claim, index) => (
        <Fragment key={claim.id}>
          {index !== 0 && <Divider />}
          <ItwCredentialClaim claim={claim} hidden={claimsHidden} isPreview />
        </Fragment>
      ))}
      {claims.length > 0 && <Divider />}
      <ItwIssuanceMetadata credential={credential} />
    </View>
  );
};

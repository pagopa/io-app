import { H6, IconButton } from "@pagopa/io-app-design-system";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { ItwCredentialClaimsList } from "../../common/components/ItwCredentialClaimList";
import { ItwQrCodeClaimImage } from "../../common/components/ItwQrCodeClaimImage";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

type Props = {
  title: string;
  data: StoredCredential;
  canHideValues?: boolean;
};

export const ItwPresentationClaimsSection = ({
  title,
  canHideValues,
  data
}: Props) => {
  const [valuesHidden, setValuesHidden] = useState(false);

  const renderHideValuesToggle = () => (
    <IconButton
      testID="toggle-claim-visibility"
      icon={valuesHidden ? "eyeHide" : "eyeShow"}
      onPress={() => setValuesHidden(x => !x)}
      accessibilityLabel={I18n.t(
        valuesHidden
          ? "features.itWallet.presentation.credentialDetails.actions.showClaimValues"
          : "features.itWallet.presentation.credentialDetails.actions.hideClaimValues"
      )}
    />
  );

  return (
    <View>
      <View style={styles.header}>
        <H6 color="grey-700">{title}</H6>
        {canHideValues && renderHideValuesToggle()}
      </View>
      <ItwQrCodeClaimImage
        claim={data.parsedCredential.link_qr_code}
        isHidden={valuesHidden}
      />
      <ItwCredentialClaimsList data={data} isHidden={valuesHidden} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    justifyContent: "space-between",
    flexDirection: "row"
  }
});

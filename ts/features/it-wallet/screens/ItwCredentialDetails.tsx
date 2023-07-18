import React from "react";
import { View } from "native-base";
import { SafeAreaView, ScrollView } from "react-native";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import PidCredential from "../components/PidCredential";
import ClaimsList from "../components/ClaimsList";
import { useIOSelector } from "../../../store/hooks";
import { ItwWalletVcsSelector } from "../store/reducers/itwCredentials";

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 * This screen should be generalized for any verifiable crediential but for now it's only used for the PID.
 */
const ItwCredentialDetails = () => {
  const pid = useIOSelector(ItwWalletVcsSelector)[0];
  const clamis = pid.verified_claims.claims;
  const spacerSize = 32;

  const presentationButton = {
    title: I18n.t(
      "features.itWallet.presentation.credentialDetails.buttons.qrCode"
    ),
    iconName: "io-qr",
    iconColor: "white",
    onPress: () => null
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t(
        "features.itWallet.verifiableCredentials.type.digitalCredential"
      )}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={{ ...IOStyles.flex }}>
        <ScrollView>
          <VSpacer />
          <View style={IOStyles.horizontalContentPadding}>
            <PidCredential
              name={`${clamis.given_name} ${clamis.family_name}`}
              fiscalCode={clamis.tax_id_number}
            />
            <VSpacer />
            <ClaimsList claims={pid} />
            <VSpacer size={spacerSize} />
          </View>
        </ScrollView>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={presentationButton}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwCredentialDetails;

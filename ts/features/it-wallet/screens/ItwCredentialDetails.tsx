import React from "react";
import { View } from "native-base";
import { SafeAreaView, ScrollView } from "react-native";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import PidCredential from "../components/PidCredential";
import ClaimsList from "../components/ClaimsList";
import { useIOSelector } from "../../../store/hooks";
import { itwDecodedPidValueSelector } from "../store/reducers/itwPidDecode";

export type ContentViewParams = {
  decodedPid: PidWithToken;
};

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 * This screen should be generalized for any verifiable crediential but for now it's only used for the PID.
 */
const ItwCredentialDetails = () => {
  const decodedPid = useIOSelector(itwDecodedPidValueSelector);
  const spacerSize = 32;

  const presentationButton = {
    title: I18n.t(
      "features.itWallet.presentation.credentialDetails.buttons.qrCode"
    ),
    iconName: "io-qr",
    iconColor: "white",
    onPress: () => null
  };

  const ContentView = ({ decodedPid }: ContentViewParams) => (
    <ScrollView>
      <VSpacer />
      <View style={IOStyles.horizontalContentPadding}>
        <PidCredential
          name={`${decodedPid.pid.claims.givenName} ${decodedPid.pid.claims.familyName}`}
          fiscalCode={decodedPid.pid.claims.taxIdCode as string}
        />
        <VSpacer />
        <ClaimsList decodedPid={decodedPid} />
        <VSpacer size={spacerSize} />
      </View>
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={presentationButton}
      />
    </ScrollView>
  );

  const DecodedPidOrErrorView = () =>
    pipe(
      decodedPid,
      O.fold(
        () => <> </>, // TODO: https://pagopa.atlassian.net/browse/SIW-364
        decodedPid => <ContentView decodedPid={decodedPid} />
      )
    );

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t(
        "features.itWallet.verifiableCredentials.type.digitalCredential"
      )}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={{ ...IOStyles.flex }}>
        <DecodedPidOrErrorView />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwCredentialDetails;

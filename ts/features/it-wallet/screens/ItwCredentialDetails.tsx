import React, { useState } from "react";
import { View } from "native-base";
import { SafeAreaView, ScrollView } from "react-native";
import { PID } from "@pagopa/io-react-native-wallet";
import * as O from "fp-ts/lib/Option";
import { VerifyResult } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import PidCredential from "../components/PidCredential";
import ClaimsList from "../components/ClaimsList";
import { useIOSelector } from "../../../store/hooks";
import { ItwCredentialsPidSelector } from "../store/reducers/itwCredentials";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 * This screen should be generalized for any verifiable crediential but for now it's only used for the PID.
 */
const ItwCredentialDetails = () => {
  const pid = useIOSelector(ItwCredentialsPidSelector);
  const [decodedPid, setDecodedPid] = useState<VerifyResult>();
  const spacerSize = 32;

  useOnFirstRender(() => {
    if (O.isSome(pid)) {
      try {
        const decoded = PID.SdJwt.decode(pid.value.credential);
        setDecodedPid(decoded);
      } catch {
        setDecodedPid(undefined);
      }
    }
  });

  const presentationButton = {
    title: I18n.t(
      "features.itWallet.presentation.credentialDetails.buttons.qrCode"
    ),
    iconName: "io-qr",
    iconColor: "white",
    onPress: () => null
  };

  const LoadingView = () => <LoadingSpinnerOverlay isLoading />;

  const ContentView = () => (
    <ScrollView>
      <VSpacer />
      <View style={IOStyles.horizontalContentPadding}>
        <PidCredential
          name={`${decodedPid?.pid.claims.givenName} ${decodedPid?.pid.claims.familyName}`}
          fiscalCode={decodedPid?.pid.claims.taxIdCode as string}
        />
        <VSpacer />
        <ClaimsList decodedPid={decodedPid as VerifyResult} />
        <VSpacer size={spacerSize} />
      </View>
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={presentationButton}
      />
    </ScrollView>
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
        {decodedPid ? <ContentView /> : <LoadingView />}
      </SafeAreaView>
    </BaseScreenComponent>
  );
  <></>;
};

export default ItwCredentialDetails;

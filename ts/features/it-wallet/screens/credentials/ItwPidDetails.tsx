import React from "react";
import { View } from "native-base";
import { SafeAreaView, ScrollView } from "react-native";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useNavigation } from "@react-navigation/native";
import { PidIssuerEntityConfiguration } from "@pagopa/io-react-native-wallet/lib/typescript/pid/metadata";
import { sequenceS } from "fp-ts/lib/Apply";
import I18n from "../../../../i18n";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOSelector } from "../../../../store/hooks";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import PidCredential from "../../components/PidCredential";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { itwDecodedPidValueSelector } from "../../store/reducers/itwPidDecodeReducer";
import { cancelButtonProps } from "../../utils/itwButtonsUtils";
import ItwErrorView from "../../components/ItwErrorView";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import ItwPidClaimsList from "../../components/ItwPidClaimsList";
import { itwPidIssuerEntityConfigSelector } from "../../store/reducers/itwPidReducer";

export type ContentViewParams = {
  decodedPid: PidWithToken;
  pidIssuerEntityConfig: PidIssuerEntityConfiguration;
};

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 * This screen should be generalized for any verifiable crediential but for now it's only used for the PID.
 */
const ItwPidDetails = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const decodedPid = useIOSelector(itwDecodedPidValueSelector);
  const pidIssuerEntityConfig = useIOSelector(itwPidIssuerEntityConfigSelector);
  const spacerSize = 32;

  const presentationButton = {
    title: I18n.t(
      "features.itWallet.presentation.credentialDetails.buttons.qrCode"
    ),
    iconName: "io-qr",
    iconColor: "white",
    onPress: () => null
  };

  const ContentView = ({
    decodedPid,
    pidIssuerEntityConfig
  }: ContentViewParams) => (
    <>
      <ScrollView>
        <VSpacer />
        <View style={IOStyles.horizontalContentPadding}>
          <PidCredential
            name={`${decodedPid.pid.claims.givenName} ${decodedPid.pid.claims.familyName}`}
            fiscalCode={decodedPid.pid.claims.taxIdCode as string}
          />
          <VSpacer />
          <ItwPidClaimsList
            decodedPid={decodedPid}
            pidIssuerEntityConfig={pidIssuerEntityConfig}
            claims={["givenName", "familyName", "taxIdCode"]}
            expiryDate
            securityLevel
            onLinkPress={() => null}
            issuerInfo
          />
          <VSpacer size={spacerSize} />
        </View>
      </ScrollView>
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={presentationButton}
      />
    </>
  );

  const DecodedPidOrErrorView = () =>
    pipe(
      sequenceS(O.Applicative)({ decodedPid, pidIssuerEntityConfig }),
      O.fold(
        () => (
          <ItwErrorView
            type="SingleButton"
            leftButton={cancelButtonProps(navigation.goBack)}
          />
        ),
        some => (
          <ContentView
            decodedPid={some.decodedPid}
            pidIssuerEntityConfig={some.pidIssuerEntityConfig}
          />
        )
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

export default ItwPidDetails;

import React from "react";
import { View } from "native-base";
import { SafeAreaView, ScrollView } from "react-native";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useNavigation } from "@react-navigation/native";
import { VSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOSelector } from "../../../../store/hooks";
import PidCredential from "../../components/PidCredential";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { itwDecodedPidValueSelector } from "../../store/reducers/itwPidDecodeReducer";
import { cancelButtonProps } from "../../utils/itwButtonsUtils";
import ItwErrorView from "../../components/ItwErrorView";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import ItwPidClaimsList from "../../components/ItwPidClaimsList";
import { BlockButtonProps } from "../../../../components/ui/BlockButtons";

export type ContentViewParams = {
  decodedPid: PidWithToken;
};

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 * This screen should be generalized for any verifiable crediential but for now it's only used for the PID.
 */
const ItwPidDetails = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const decodedPid = useIOSelector(itwDecodedPidValueSelector);
  const spacerSize = 32;

  const presentationButton: BlockButtonProps = {
    title: I18n.t(
      "features.itWallet.presentation.credentialDetails.buttons.qrCode"
    ),
    iconName: "qrCode",
    iconColor: "white",
    onPress: () => null
  };

  const ContentView = ({ decodedPid }: ContentViewParams) => (
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
      decodedPid,
      O.fold(
        () => (
          <ItwErrorView
            type="SingleButton"
            leftButton={cancelButtonProps(navigation.goBack)}
          />
        ),
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

export default ItwPidDetails;

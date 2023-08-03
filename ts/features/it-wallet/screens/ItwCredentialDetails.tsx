import React from "react";
import { View } from "native-base";
import { SafeAreaView, ScrollView } from "react-native";
import * as O from "fp-ts/lib/Option";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import PidCredential from "../components/PidCredential";
import ClaimsList from "../components/ClaimsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { ItwCredentialsPidSelector } from "../store/reducers/itwCredentials";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import { itwDecodePid } from "../store/actions/credentials";
import { ItwDecodedPidPotSelector } from "../store/reducers/itwPidDecode";
import { InfoScreenComponent } from "../../fci/components/InfoScreenComponent";
import { ItWalletError } from "../utils/errors/itwErrors";
import { mapRequirementsError } from "../utils/errors/itwErrorsMapping";
import { Pictogram } from "../../../components/core/pictograms";

type ContentViewProps = {
  decodedPid: PidWithToken;
};

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 * This screen should be generalized for any verifiable crediential but for now it's only used for the PID.
 */
const ItwCredentialDetails = () => {
  const pid = useIOSelector(ItwCredentialsPidSelector);
  const decodedPid = useIOSelector(ItwDecodedPidPotSelector);
  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const spacerSize = 32;

  useOnFirstRender(() => {
    dispatch(itwDecodePid.request(pid));
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

  const ContentView = ({ decodedPid }: ContentViewProps) => (
    <ScrollView>
      <VSpacer />
      <View style={IOStyles.horizontalContentPadding}>
        <PidCredential
          name={`${decodedPid?.pid.claims.givenName} ${decodedPid?.pid.claims.familyName}`}
          fiscalCode={decodedPid?.pid.claims.taxIdCode as string}
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

  /**
   * Renders the error view.
   */
  const ErrorView = (error: ItWalletError) => {
    const mappedError = mapRequirementsError(error);
    const cancelButtonProps = {
      block: true,
      light: false,
      bordered: true,
      onPress: navigation.goBack,
      title: I18n.t("features.itWallet.generic.close")
    };
    return (
      <>
        <InfoScreenComponent
          title={mappedError.title}
          body={mappedError.body}
          image={<Pictogram name="error" />}
        />
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={cancelButtonProps}
        />
      </>
    );
  };

  const RenderMask = () =>
    pot.fold(
      decodedPid,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <LoadingView />,
      err => ErrorView(err),
      some =>
        pipe(
          some.decodedPid,
          O.fold(
            () => <> </>, // TODO: https://pagopa.atlassian.net/browse/SIW-364
            decodedPid => <ContentView decodedPid={decodedPid} />
          )
        ),
      () => <LoadingView />,
      () => <LoadingView />,
      (_, err) => ErrorView(err)
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
        <RenderMask />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwCredentialDetails;

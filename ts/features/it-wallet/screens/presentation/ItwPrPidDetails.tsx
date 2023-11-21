import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useNavigation } from "@react-navigation/native";
import {
  Banner,
  BlockButtonProps,
  FooterWithButtons,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOSelector } from "../../../../store/hooks";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { itwDecodedPidValueSelector } from "../../store/reducers/itwPidDecodeReducer";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import ItwPidClaimsList from "../../components/ItwPidClaimsList";
import { getPidDisplayData } from "../../utils/mocks";
import ItwClaimsWrapper from "../../components/ItwClaimsWrapper";
import { ITW_ROUTES } from "../../navigation/ItwRoutes";
import ItwKoView from "../../components/ItwKoView";
import { getItwGenericMappedError } from "../../utils/errors/itwErrorsMapping";

export type ContentViewParams = {
  decodedPid: PidWithToken;
};

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 * This screen should be generalized for any verifiable crediential but for now it's only used for the PID.
 */
const ItwPrPidDetails = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const decodedPid = useIOSelector(itwDecodedPidValueSelector);
  const pidDisplayData = getPidDisplayData();
  const bannerViewRef = React.createRef<View>();
  const spacerSize = 32;

  const presentationButton: BlockButtonProps = {
    type: "Solid",
    buttonProps: {
      label: I18n.t(
        "features.itWallet.presentation.credentialDetails.buttons.qrCode"
      ),
      accessibilityLabel: I18n.t(
        "features.itWallet.presentation.credentialDetails.buttons.qrCode"
      ),
      icon: "qrCode",
      iconPosition: "end",
      onPress: () => navigation.navigate(ITW_ROUTES.GENERIC.NOT_AVAILABLE)
    }
  };

  const ContentView = ({ decodedPid }: ContentViewParams) => (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={{ ...IOStyles.flex }}>
        <ScrollView>
          <View style={IOStyles.horizontalContentPadding}>
            <ItwClaimsWrapper displayData={pidDisplayData}>
              <ItwPidClaimsList
                decodedPid={decodedPid}
                claims={["givenName", "familyName", "taxIdCode"]}
                expiryDate
                securityLevel
                onLinkPress={() => null}
                issuerInfo
              />
            </ItwClaimsWrapper>
            <VSpacer size={spacerSize} />
            <Banner
              testID={"ItwBannerTestID"}
              viewRef={bannerViewRef}
              color={"neutral"}
              size="big"
              title={I18n.t(
                "features.itWallet.issuing.credentialPreviewScreen.banner.title"
              )}
              content={I18n.t(
                "features.itWallet.issuing.credentialPreviewScreen.banner.content"
              )}
              pictogramName={"security"}
              action={I18n.t(
                "features.itWallet.issuing.credentialPreviewScreen.banner.actionTitle"
              )}
              onPress={() =>
                navigation.navigate(ITW_ROUTES.GENERIC.NOT_AVAILABLE)
              }
            />
          </View>
          <VSpacer size={spacerSize} />
        </ScrollView>
        <FooterWithButtons type={"SingleButton"} primary={presentationButton} />
      </SafeAreaView>
    </BaseScreenComponent>
  );

  const ErrorView = () => {
    const error = getItwGenericMappedError(navigation.goBack);
    return <ItwKoView {...error} />;
  };

  const DecodedPidOrErrorView = () =>
    pipe(
      decodedPid,
      O.fold(
        () => <ErrorView />,
        decodedPid => <ContentView decodedPid={decodedPid} />
      )
    );

  return <DecodedPidOrErrorView />;
};

export default ItwPrPidDetails;

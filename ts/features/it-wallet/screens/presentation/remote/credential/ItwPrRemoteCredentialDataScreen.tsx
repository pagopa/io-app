import * as React from "react";
import { View, SafeAreaView, Image, StyleSheet } from "react-native";
import {
  Body,
  FeatureInfo,
  FooterWithButtons,
  H1,
  H6,
  HSpacer,
  IOStyles,
  Icon,
  IconContained,
  LabelLink,
  VSpacer
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useNavigation } from "@react-navigation/native";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import interno from "../../../../../../../img/features/it-wallet/interno.png";
import { useIOSelector } from "../../../../../../store/hooks";
import { itwDecodedPidValueSelector } from "../../../../store/reducers/itwPidDecodeReducer";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import ROUTES from "../../../../../../navigation/routes";
import I18n from "../../../../../../i18n";
import ItwBulletList from "../../../../components/ItwBulletList";
import ItwFooterInfoBox from "../../../../components/ItwFooterInfoBox";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import ItwOptionalClaimsList from "../../../../components/ItwOptionalClaimsList";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import { useItwInfoBottomSheet } from "../../../../hooks/useItwInfoBottomSheet";
import { getRpMock } from "../../../../utils/mocks";
import { showCancelAlert } from "../../../../utils/alert";
import ItwKoView from "../../../../components/ItwKoView";
import { getItwGenericMappedError } from "../../../../utils/errors/itwErrorsMapping";
import { ForceScrollDownView } from "../../../../../../components/ForceScrollDownView";

type ContentViewParams = {
  decodedPid: PidWithToken;
};

/**
 * This screen displays the information about the credential that is going to be shared
 * with the issuer.
 */
const ItwPrRemoteCredentialDataScreen = () => {
  const decodedPid = useIOSelector(itwDecodedPidValueSelector);
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const rpMock = getRpMock();
  const { present, bottomSheet } = useItwInfoBottomSheet({
    title: rpMock.organizationName,
    content: [
      {
        title: I18n.t(
          "features.itWallet.presentation.dataScreen.infoBottomSheet.body.firstHeader"
        ),
        body: I18n.t(
          "features.itWallet.presentation.dataScreen.infoBottomSheet.body.firstBody"
        )
      },
      {
        title: I18n.t(
          "features.itWallet.presentation.dataScreen.infoBottomSheet.body.secondHeader"
        ),
        body: I18n.t(
          "features.itWallet.presentation.dataScreen.infoBottomSheet.body.secondBody"
        )
      }
    ]
  });

  /**
   * Callback to be used in case of cancel button press alert to navigate to the home screen.
   */
  const alertOnPress = () => {
    navigation.navigate(ROUTES.MAIN, {
      screen: ROUTES.MESSAGES_HOME
    });
  };

  const ContentView = ({ decodedPid }: ContentViewParams) => (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <ForceScrollDownView>
          <View style={IOStyles.horizontalContentPadding}>
            <VSpacer size={32} />
            {/* SECOND HEADER */}
            <View style={styles.secondHeader}>
              {/* LEFT */}
              <View style={styles.secondHeaderLeft}>
                <IconContained
                  icon={"device"}
                  color={"neutral"}
                  variant={"tonal"}
                />
                <HSpacer size={8} />
                <Icon name={"transactions"} color={"grey-450"} size={24} />
                <HSpacer size={8} />
                <IconContained
                  icon={"institution"}
                  color={"neutral"}
                  variant={"tonal"}
                />
              </View>
              {/* RIGHT */}
              <Image
                source={interno}
                resizeMode={"contain"}
                style={{ width: "100%", height: 32 }}
              />
            </View>
            <VSpacer size={24} />
            {/* TITLE */}
            <H1>{I18n.t("features.itWallet.presentation.dataScreen.title")}</H1>
            <VSpacer />
            {/* BODY */}
            <Body>
              {I18n.t("features.itWallet.presentation.dataScreen.subtitle", {
                organizationName: rpMock.organizationName
              })}
            </Body>
            <VSpacer />
            {/* INFO LINK */}
            <LabelLink onPress={() => present()}>
              {I18n.t("features.itWallet.presentation.dataScreen.why")}
            </LabelLink>
            <VSpacer size={24} />
            {/* REQUIRED DATA SECTION */}
            <View style={styles.requireDataSection}>
              <Icon name="security" color="grey-300" />
              <HSpacer size={8} />
              <H6 color="grey-700">
                {I18n.t(
                  "features.itWallet.presentation.dataScreen.requiredClaims"
                )}
              </H6>
            </View>
            <VSpacer size={24} />
            <ItwBulletList data={rpMock.requestedClaims(decodedPid)} />
            <VSpacer size={24} />
            {/* OPTIONAL DATA SECTION */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon name="option" color="grey-300" />
              <HSpacer size={8} />
              <H6 color="grey-700">
                {I18n.t(
                  "features.itWallet.presentation.dataScreen.optionalClaims"
                )}
              </H6>
            </View>
            <VSpacer size={24} />
            <ItwOptionalClaimsList claims={rpMock.optionalClaims} />
            <VSpacer size={32} />
            <VSpacer size={8} />
            <VSpacer size={32} />
            {/* PRIVACY SECTION */}
            <FeatureInfo
              pictogramName="passcode"
              body={I18n.t(
                "features.itWallet.presentation.dataScreen.privacy.usage"
              )}
            />
            <VSpacer />
            <FeatureInfo
              pictogramName="trash"
              body={I18n.t(
                "features.itWallet.presentation.dataScreen.privacy.deletion"
              )}
            />
            <VSpacer size={32} />
            {/* TOS SECTION */}
            {/* TODO: replace with ItwTextInfo component */}
            <ItwFooterInfoBox
              content={I18n.t("features.itWallet.presentation.dataScreen.tos")}
            />
            <VSpacer size={32} />
          </View>
          <FooterWithButtons
            primary={{
              type: "Outline",
              buttonProps: {
                color: "primary",
                accessibilityLabel: I18n.t("global.buttons.cancel"),
                onPress: () => showCancelAlert(alertOnPress),
                label: I18n.t("global.buttons.cancel")
              }
            }}
            secondary={{
              type: "Solid",
              buttonProps: {
                color: "primary",
                icon: "security",
                iconPosition: "end",
                accessibilityLabel: I18n.t("global.buttons.continue"),
                onPress: () =>
                  navigation.navigate(
                    ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.RESULT
                  ),
                label: I18n.t("global.buttons.continue")
              }
            }}
            type="TwoButtonsInlineHalf"
          />
        </ForceScrollDownView>
      </SafeAreaView>
    </BaseScreenComponent>
  );

  const ErrorView = () => {
    const onPress = () => navigation.goBack();
    const mappedError = getItwGenericMappedError(onPress);
    return <ItwKoView {...mappedError} />;
  };

  const DecodedPidOrErrorView = () =>
    pipe(
      decodedPid,
      O.fold(
        () => <ErrorView />,
        some => <ContentView decodedPid={some} />
      )
    );

  return (
    <>
      <DecodedPidOrErrorView />
      {bottomSheet}
    </>
  );
};

const styles = StyleSheet.create({
  secondHeader: {
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center"
  },
  secondHeaderLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  requireDataSection: {
    flexDirection: "row",
    alignItems: "center"
  }
});

export default ItwPrRemoteCredentialDataScreen;

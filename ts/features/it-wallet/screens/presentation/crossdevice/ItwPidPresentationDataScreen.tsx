import React from "react";
import { useNavigation } from "@react-navigation/native";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { View } from "native-base";
import { Image, StyleSheet } from "react-native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useIOSelector } from "../../../../../store/hooks";
import { itwDecodedPidValueSelector } from "../../../store/reducers/itwPidDecodeReducer";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import I18n from "../../../../../i18n";
import { showCancelAlert } from "../../../utils/alert";
import ItwTextInfo from "../../../components/ItwTextInfo";
import ItwBulletList from "../../../components/ItwBulletList";
import { rpPidMock } from "../../../utils/mocks";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import interno from "../../../../../../img/features/it-wallet/interno.png";
import { useItwInfoBottomSheet } from "../../../hooks/useItwInfoBottomSheet";
import ItwKoView from "../../../components/ItwKoView";
import { getItwGenericMappedError } from "../../../utils/errors/itwErrorsMapping";
import ROUTES from "../../../../../navigation/routes";
import { ForceScrollDownView } from "../../../../../components/ForceScrollDownView";

const ItwPidPresentationDataScreen = () => {
  const decodedPid = useIOSelector(itwDecodedPidValueSelector);
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const { present, bottomSheet } = useItwInfoBottomSheet({
    title: rpPidMock.organizationName,
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

  const RpPreviewView = ({ decodedPid }: { decodedPid: PidWithToken }) => (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t(
        "features.itWallet.presentation.pidAttributesScreen.headerTitle"
      )}
      contextualHelp={emptyContextualHelp}
    >
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
                organizationName: rpPidMock.organizationName
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
            <ItwBulletList data={rpPidMock.requestedClaims(decodedPid)} />
            <VSpacer size={24} />
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
            <ItwTextInfo
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
                    ITW_ROUTES.PRESENTATION.CROSS_DEVICE.RESULT
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

  const DecodePidOrErrorView = () =>
    pipe(
      decodedPid,
      O.fold(
        () => <ErrorView />,
        some => <RpPreviewView decodedPid={some} />
      )
    );

  return (
    <>
      <DecodePidOrErrorView />
      {bottomSheet}
    </>
  );
};

export default ItwPidPresentationDataScreen;

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

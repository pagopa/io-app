import * as React from "react";
import { View, SafeAreaView, Image, ScrollView } from "react-native";
import {
  Body,
  FooterWithButtons,
  H1,
  HSpacer,
  IOStyles,
  Icon,
  IconContained,
  LabelLink,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useNavigation } from "@react-navigation/native";
import interno from "../../../../../../img/features/it-wallet/interno.png";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { useIOSelector } from "../../../../../store/hooks";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import I18n from "../../../../../i18n";
import ItwBulletList from "../../../components/ItwBulletList";
import { getRequestedClaims } from "../../../utils/mocks";
import { showCancelAlert } from "../../../utils/alert";
import ROUTES from "../../../../../navigation/routes";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import ItwKoView from "../../../components/ItwKoView";
import { getItwGenericMappedError } from "../../../utils/itwErrorsUtils";
import ItwTextInfo from "../../../components/ItwTextInfo";
import { useItwInfoBottomSheet } from "../../../hooks/useItwInfoBottomSheet";
// import { itwIssuanceChecksDataSelector } from "../../../store/reducers/new/itwIssuanceReducer";
import { itwCredentialsPidSelector } from "../../../store/reducers/itwCredentialsReducer";
import { StoredCredential } from "../../../utils/types";
import { itwIssuanceChecksDataSelector } from "../../../store/reducers/new/itwIssuanceReducer";
import { getEvidenceOrganizationName } from "../../../utils/itwClaimsUtils";

/**
 * This screen displays the information about the credential that is going to be shared
 * with the issuer.
 */
const ItwIssuingCredentialAuthScreen = () => {
  const pid = useIOSelector(itwCredentialsPidSelector);
  const checks = useIOSelector(itwIssuanceChecksDataSelector);
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const toast = useIOToast();
  const organization = pipe(
    checks,
    O.fold(
      () => I18n.t("features.itWallet.generic.placeholders.organizationName"),
      some =>
        some.issuerConf.federation_entity.organization_name ??
        I18n.t("features.itWallet.generic.placeholders.organizationName")
    )
  );
  const { present, bottomSheet } = useItwInfoBottomSheet({
    title: I18n.t(
      "features.itWallet.issuing.credentialsIssuingInfoScreen.infoBottomSheet.title"
    ),
    content: [
      {
        title: I18n.t(
          "features.itWallet.issuing.credentialsIssuingInfoScreen.infoBottomSheet.body.firstHeaderTitle"
        ),
        body: I18n.t(
          "features.itWallet.issuing.credentialsIssuingInfoScreen.infoBottomSheet.body.firstBodyContent"
        )
      },
      {
        title: I18n.t(
          "features.itWallet.issuing.credentialsIssuingInfoScreen.infoBottomSheet.body.secondHeaderTitle"
        ),
        body: I18n.t(
          "features.itWallet.issuing.credentialsIssuingInfoScreen.infoBottomSheet.body.secondBodyContent"
        )
      }
    ]
  });

  /**
   * Callback to be used in case of cancel button press alert to navigate to the home screen and show a toast.
   */
  const alertOnPress = () => {
    toast.info(
      I18n.t("features.itWallet.issuing.credentialsChecksScreen.toast.cancel")
    );
    navigation.navigate(ROUTES.MAIN, { screen: ROUTES.MESSAGES_HOME });
  };

  const ContentView = ({ pid }: { pid: StoredCredential }) => (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <VSpacer size={32} />
          {/* SECOND HEADER */}
          <View
            style={{
              flexDirection: "row",
              alignContent: "center",
              alignItems: "center"
            }}
          >
            {/* LEFT */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center"
              }}
            >
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
          <H1>
            {I18n.t(
              "features.itWallet.issuing.credentialsIssuingInfoScreen.title"
            )}
          </H1>
          <Body>
            {I18n.t(
              "features.itWallet.issuing.credentialsIssuingInfoScreen.subtitle",
              {
                authsource: getEvidenceOrganizationName(pid.parsedCredential),
                organization
              }
            )}
          </Body>
          <VSpacer size={16} />
          <LabelLink onPress={() => present()}>
            {I18n.t(
              "features.itWallet.issuing.credentialsIssuingInfoScreen.readMore"
            )}
          </LabelLink>
          <VSpacer size={24} />

          {/* Render a list of claims that will be shared with the credential issuer */}
          <ItwBulletList data={getRequestedClaims(pid.displayData.title)} />
          <VSpacer size={32} />
          <ItwTextInfo
            content={I18n.t(
              "features.itWallet.issuing.credentialsIssuingInfoScreen.tos"
            )}
          />
          <VSpacer size={32} />
        </ScrollView>
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
              accessibilityLabel: I18n.t("global.buttons.continue"),
              onPress: () =>
                navigation.navigate(ITW_ROUTES.ISSUING.CREDENTIAL.PREVIEW),
              label: I18n.t("global.buttons.continue")
            }
          }}
          type="TwoButtonsInlineHalf"
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );

  const ErrorView = () => {
    const onPress = () => navigation.goBack();
    const mappedError = getItwGenericMappedError(onPress);
    return <ItwKoView {...mappedError} />;
  };

  const PidOrErrorView = () =>
    pipe(
      pid,
      O.fold(
        () => <ErrorView />,
        pid => <ContentView pid={pid} />
      )
    );

  return (
    <>
      <PidOrErrorView />
      {bottomSheet}
    </>
  );
};
export default ItwIssuingCredentialAuthScreen;

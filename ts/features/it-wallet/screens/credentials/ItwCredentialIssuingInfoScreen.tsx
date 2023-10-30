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
import { sequenceS } from "fp-ts/lib/Apply";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import interno from "../../../../../img/features/it-wallet/interno.png";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOSelector } from "../../../../store/hooks";
import { itwDecodedPidValueSelector } from "../../store/reducers/itwPidDecodeReducer";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import ItwFooterInfoBox from "../../components/ItwFooterInfoBox";
import I18n from "../../../../i18n";
import ItwBulletList from "../../components/ItwBulletList";
import { useItwDataProcessing } from "../../hooks/useItwDataProcessing";
import { CREDENTIAL_ISSUER, CredentialCatalogItem } from "../../utils/mocks";
import { ItwCredentialsCheckCredentialSelector } from "../../store/reducers/itwCredentialsChecksReducer";
import { showCancelAlert } from "../../utils/alert";
import ROUTES from "../../../../navigation/routes";
import { ITW_ROUTES } from "../../navigation/ItwRoutes";
import ItwKoView from "../../components/ItwKoView";
import { getItwGenericMappedError } from "../../utils/errors/itwErrorsMapping";

type ContentViewParams = {
  decodedPid: PidWithToken;
  credential: CredentialCatalogItem;
};

/**
 * This screen displays the information about the credential that is going to be shared
 * with the issuer.
 */
const ItwCredentialIssuingInfoScreen = () => {
  const decodedPid = useIOSelector(itwDecodedPidValueSelector);
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const credential = useIOSelector(ItwCredentialsCheckCredentialSelector);
  const { present, bottomSheet } = useItwDataProcessing();
  const toast = useIOToast();

  /**
   * Callback to be used in case of cancel button press alert to navigate to the home screen and show a toast.
   */
  const alertOnPress = () => {
    toast.info(
      I18n.t("features.itWallet.issuing.credentialsChecksScreen.toast.cancel")
    );
    navigation.navigate(ROUTES.MAIN, { screen: ROUTES.MESSAGES_HOME });
  };

  const ContentView = ({ decodedPid, credential }: ContentViewParams) => (
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
              authsource:
                decodedPid.pid.verification.evidence[0].record.source
                  .organization_name,
              organization: CREDENTIAL_ISSUER
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
        <ItwBulletList data={credential.requestedClaims(decodedPid)} />

        {/* ItwFooterInfoBox should be replaced with a more ligth component */}
        <ItwFooterInfoBox content={I18n.t("features.itWallet.tos")} />
        <VSpacer size={48} />
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
            onPress: () => navigation.navigate(ITW_ROUTES.CREDENTIALS.PREVIEW),
            label: I18n.t("global.buttons.continue")
          }
        }}
        type="TwoButtonsInlineHalf"
      />
    </SafeAreaView>
  );

  const ErrorView = () => {
    const onPress = () => navigation.goBack();
    const mappedError = getItwGenericMappedError(onPress);
    return <ItwKoView {...mappedError} />;
  };

  const DecodedPidOrErrorView = () =>
    pipe(
      sequenceS(O.Applicative)({ decodedPid, credential }),
      O.fold(
        () => <ErrorView />,
        some => <ContentView {...some} />
      )
    );

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <DecodedPidOrErrorView />
      {bottomSheet}
    </BaseScreenComponent>
  );
};
export default ItwCredentialIssuingInfoScreen;

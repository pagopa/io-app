import React from "react";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  BlockButtonProps,
  Body,
  FooterWithButtons,
  H2,
  H6,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native";
import ItwCredentialCard from "../../components/ItwCredentialCard";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import ItwErrorView from "../../components/ItwErrorView";
import { cancelButtonProps } from "../../utils/itwButtonsUtils";
import { ItwCredentialsCheckCredentialSelector } from "../../store/reducers/itwCredentialsChecksReducer";
import { CredentialCatalogItem } from "../../utils/mocks";
import ItwCredentialClaimsList from "../../components/ItwCredentialClaimsList";
import { useItwInfoFlow } from "../../hooks/useItwInfoFlow";
import { showCancelAlert } from "../../utils/alert";
import ROUTES from "../../../../navigation/routes";

/**
 * Type for the content view component props.
 */
type ContentViewProps = {
  credential: CredentialCatalogItem;
};

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the credential.
 */
const ItwCredentialPreviewScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const credential = useIOSelector(ItwCredentialsCheckCredentialSelector);
  const toast = useIOToast();
  const { present, bottomSheet } = useItwInfoFlow({
    title: pipe(
      credential,
      O.map(some => some.claims.issuedByNew),
      O.getOrElse(() => "")
    ),
    content: [
      {
        title: I18n.t(
          "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.about.title"
        ),
        body: I18n.t(
          "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.about.subtitle"
        )
      },
      {
        title: I18n.t(
          "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.data.title"
        ),
        body: I18n.t(
          "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.data.subtitle"
        )
      }
    ]
  });

  const alertOnPress = () => {
    toast.info(
      I18n.t("features.itWallet.issuing.credentialsChecksScreen.toast.cancel")
    );
    navigation.navigate(ROUTES.MAIN, { screen: ROUTES.MESSAGES_HOME });
  };

  /**
   * Renders the content of the screen if the credential is some.
   * @param credential - credential to be displayed
   */
  const ContentView = ({ credential }: ContentViewProps) => {
    /**
     * Button props for the FooterWithButtons component which opens the PIN screen.
     */
    const confirmButtonProps: BlockButtonProps = {
      type: "Solid",
      buttonProps: {
        label: I18n.t("global.buttons.add"),
        accessibilityLabel: I18n.t("global.buttons.add"),
        onPress: () => null // TODO(SIW-449): Add navigation to the PIN screen
      }
    };

    /**
     * Button props for the FooterWithButtons component which opens an alert screen.
     */
    const cancelButtonProps: BlockButtonProps = {
      type: "Outline",
      buttonProps: {
        label: I18n.t("global.buttons.cancel"),
        accessibilityLabel: I18n.t("global.buttons.cancel"),
        onPress: () => showCancelAlert(alertOnPress)
      }
    };

    const title = credential.title;
    const name =
      credential.claims.givenName + " " + credential.claims.familyName;
    const fiscalCode = credential.claims.taxIdCode;
    return (
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView contentContainerStyle={IOStyles.horizontalContentPadding}>
          <H2>
            {I18n.t("features.itWallet.issuing.credentialPreviewScreen.title")}
          </H2>
          <VSpacer />
          <Body>
            {I18n.t(
              "features.itWallet.issuing.credentialPreviewScreen.subtitle"
            )}
          </Body>
          <VSpacer />
          <ItwCredentialCard
            title={title}
            name={name}
            fiscalCode={fiscalCode}
            textColor={credential.textColor}
            backgroundImage={credential.image}
          />
          <VSpacer />
          <ItwCredentialClaimsList
            credential={credential}
            claims={[
              "issuedByNew",
              "expirationDate",
              "givenName",
              "familyName",
              "taxIdCode",
              "birthdate"
            ]}
            onInfoPress={present}
          />
          <VSpacer size={32} />
          <H6>
            {I18n.t(
              "features.itWallet.issuing.credentialPreviewScreen.somethingWrong.title"
            )}
          </H6>
          <Body>
            {I18n.t(
              "features.itWallet.issuing.credentialPreviewScreen.somethingWrong.subtitle",
              {
                issuer: credential.claims.issuedByNew
              }
            )}
          </Body>
          <VSpacer size={32} />
        </ScrollView>
        <FooterWithButtons
          type="TwoButtonsInlineHalf"
          primary={cancelButtonProps}
          secondary={confirmButtonProps}
        />
      </SafeAreaView>
    );
  };

  /**
   * Checks if credential is some or none and renders the content of the screen or an error view.
   * @returns the content of the screen if the credential is some, an error view otherwise.
   */
  const ContentOrErrorView = () =>
    pipe(
      credential,
      O.fold(
        () => (
          <ItwErrorView
            type="SingleButton"
            leftButton={cancelButtonProps(navigation.goBack)}
          />
        ),
        credential => <ContentView credential={credential} />
      )
    );

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      {ContentOrErrorView()}
      {bottomSheet}
    </BaseScreenComponent>
  );
};

export default ItwCredentialPreviewScreen;

import React from "react";
import { View } from "react-native";
import {
  Badge,
  ButtonLink,
  ButtonSolid,
  ContentWrapper,
  FeatureInfo,
  GradientScrollView,
  H3,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import { useIOBottomSheetAutoresizableModal } from "../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../utils/url";
import ROUTES from "../../navigation/routes";
import { AuthenticationParamsList } from "../../navigation/params/AuthenticationParamsList";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "email.insert.help.title",
  body: "email.insert.help.content"
};

export type ChoosedIdentifier = {
  identifier: "SPID" | "CIE";
};

type Props = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "AUTHENTICATION_OPT_IN"
>;

const NewOptInScreen = (props: Props) => {
  const navigation = useNavigation();

  const navigateToIdpPage = () => {
    // FIXME -> add business logic using selector -> https://pagopa.atlassian.net/browse/IOPID-894 (add navigation to cie or idp screen)
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen:
        props.route.params.identifier === "CIE"
          ? ROUTES.CIE_PIN_SCREEN
          : ROUTES.AUTHENTICATION_IDP_SELECTION
    });
  };

  const dismiss = () => {
    dismissVeryLongAutoresizableBottomSheetWithFooter();
  };

  const ModalContent = () => (
    <>
      <FeatureInfo
        iconName="biomFingerprint"
        body="Per accedere a IO basta il codice o il biometrico, non condividerli con nessuno."
      />
      <VSpacer size={16} />
      <FeatureInfo
        iconName="logout"
        body="Se perdi il dispositivo, esci da IO da"
        actionLabel="ioapp.it."
        actionOnPress={() => openWebUrl("https://ioapp.it/it/accedi")}
      />
      <VSpacer size={16} />
      <FeatureInfo
        iconName="locked"
        body="Se pensi che le tue credenziali SPID o CIE siano compromesse, blocca l’accesso a IO da"
        actionLabel="ioapp.it."
        actionOnPress={() => openWebUrl("https://ioapp.it/it/accedi")}
      />
      <VSpacer size={16} />
      <FeatureInfo
        iconName="device"
        body="Se accedi a IO con un dispositivo non tuo, ricordati di uscire dall’app."
      />
    </>
  );

  const defaultFooter = (
    <ContentWrapper>
      <VSpacer size={16} />
      <ButtonSolid
        fullWidth
        accessibilityLabel="Tap to dismiss the bottom sheet"
        label={"Ho capito"}
        onPress={dismiss}
      />
      <VSpacer size={16} />
    </ContentWrapper>
  );

  const {
    present: presentVeryLongAutoresizableBottomSheetWithFooter,
    bottomSheet: veryLongAutoResizableBottomSheetWithFooter,
    dismiss: dismissVeryLongAutoresizableBottomSheetWithFooter
  } = useIOBottomSheetAutoresizableModal(
    {
      title: "Consigli di sicurezza",
      component: <ModalContent />,
      footer: defaultFooter,
      fullScreen: true
    },
    180
  );

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelpMarkdown={contextualHelpMarkdown}
    >
      <GradientScrollView
        primaryAction={
          <ButtonSolid
            fullWidth
            label="Continua con l’accesso rapido"
            accessibilityLabel={"Continua con l’accesso rapido"}
            onPress={navigateToIdpPage}
          />
        }
        secondaryAction={
          <ButtonLink
            label="No, voglio accedere ogni 30 giorni"
            onPress={navigateToIdpPage}
          />
        }
      >
        <ContentWrapper>
          <View style={IOStyles.selfCenter}>
            <Pictogram name="passcode" size={120} />
          </View>
          <VSpacer size={24} />
          <View style={IOStyles.selfCenter}>
            <Badge text="novità" variant="info" />
          </View>
          <VSpacer size={24} />
          <H3 style={{ textAlign: "center", alignItems: "center" }}>
            Da oggi accedi a IO più velocemente
          </H3>
          <VSpacer size={24} />
          <FeatureInfo
            pictogramName="identityCheck"
            body="Ti chiederemo di autenticarti con SPID o CIE solo una volta all’anno o se ti disconnetti dall’app."
            actionLabel="Consigli di sicurezza"
            actionOnPress={presentVeryLongAutoresizableBottomSheetWithFooter}
          />
          <VSpacer size={24} />
          <FeatureInfo
            pictogramName="passcode"
            body="Dopo il primo accesso con SPID o CIE, potrai entrare in app solo con il codice di sblocco o con il biometrico."
          />
          <VSpacer size={24} />
          {/* FIXME -> add pictogram into design system https://pagopa.atlassian.net/browse/IOPID-953 */}
          <FeatureInfo
            pictogramName="identityCheck"
            body="Ogni volta che verrà effettuato un accesso all’app tramite SPID o CIE, verrai avvisato tramite email."
          />
        </ContentWrapper>
        {veryLongAutoResizableBottomSheetWithFooter}
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export default NewOptInScreen;

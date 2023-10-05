/* eslint-disable no-console */
import React, { useState } from "react";
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
import { constVoid } from "fp-ts/lib/function";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "email.insert.help.title",
  body: "email.insert.help.content"
};

const NewOptInScreen = () => {
  const [, setState] = useState(false);

  return (
    <BaseScreenComponent
      goBack={() => constVoid}
      contextualHelpMarkdown={contextualHelpMarkdown}
    >
      <GradientScrollView
        primaryAction={
          <ButtonSolid
            fullWidth
            label="Continua con l’accesso rapido"
            accessibilityLabel={"Continua con l’accesso rapido"}
            onPress={() => setState(true)}
          />
        }
        secondaryAction={
          <ButtonLink
            label="No, voglio accedere ogni 30 giorni"
            onPress={constVoid}
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
            actionOnPress={() => constVoid}
          />
          <VSpacer size={24} />
          <FeatureInfo
            pictogramName="passcode"
            body="Dopo il primo accesso con SPID o CIE, potrai entrare in app solo con il codice di sblocco o con il biometrico."
          />
          <VSpacer size={24} />
          {/* TODO: add pictogram into design system */}
          <FeatureInfo
            pictogramName="identityCheck"
            body="Ogni volta che verrà effettuato un accesso all’app tramite SPID o CIE, verrai avvisato tramite email."
          />
        </ContentWrapper>
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export default NewOptInScreen;

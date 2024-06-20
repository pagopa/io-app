import {
  Avatar,
  Body,
  ContentWrapper,
  FeatureInfo,
  ForceScrollDownView,
  H2,
  HSpacer,
  Icon,
  LabelLink,
  LabelSmall,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ItwRequestedClaimsList } from "../components/ItwRequestedClaimsList";

const ItwIssuanceCredentialAuthScreen = () => {
  const navigation = useIONavigation();

  const handleClosePress = () => {
    navigation.pop();
  };

  const handleContinue = () => {
    navigation.pop();
  };

  const handleTosLinkPress = () => {
    Alert.alert("Not implemented");
  };

  useHeaderSecondLevel({ title: "" });

  return (
    <ForceScrollDownView>
      <ContentWrapper>
        <VSpacer size={24} />
        <View style={styles.header}>
          <Avatar size="small" />
          <HSpacer size={8} />
          <Icon name={"transactions"} color={"grey-450"} size={24} />
          <HSpacer size={8} />
          <Avatar
            size="small"
            logoUri={require("../../../../../img/app/app-logo-inverted.png")}
          />
        </View>
        <VSpacer size={24} />
        <H2>Tessera Sanitaria: dati necessari</H2>
        <Body color="grey-700">
          Saranno condivisi con{" "}
          <Body weight="Bold" color="grey-700">
            Istituto Poligrafico e Zecca dello Stato
          </Body>{" "}
          per il rilascio della credenziale
        </Body>
        <VSpacer size={24} />
        <ListItemHeader
          label="Dati richiesti"
          iconName="security"
          iconColor="grey-700"
        />
        <ItwRequestedClaimsList
          claims={[
            {
              name: "{Given_Name}",
              source: "{Credential.Name}"
            },
            {
              name: "{Family_name}",
              source: "{Credential.Name}"
            },
            {
              name: "{Tax_id_number}",
              source: "{Credential.Name}"
            }
          ]}
        />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="fornitori"
          body="I tuoi dati sono al sicuro e saranno trattati solo per le finalità descritte in informativa Privacy."
        />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="trashcan"
          body="I dati saranno condivisi solo per il tempo necessario al rilascio della credenziale."
        />
        <VSpacer size={32} />
        <LabelSmall weight="Regular" color="grey-700">
          Per maggiori informazioni, leggi{" "}
          <LabelLink fontSize="small" onPress={handleTosLinkPress}>
            l’informativa Privacy e i Termini e Condizioni d’uso
          </LabelLink>
        </LabelSmall>
      </ContentWrapper>
      <FooterActions
        fixed={false}
        actions={{
          type: "TwoButtons",
          primary: {
            label: "Continua",
            onPress: handleContinue
          },
          secondary: {
            label: "Annulla",
            onPress: handleClosePress
          }
        }}
      />
    </ForceScrollDownView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center"
  }
});

export { ItwIssuanceCredentialAuthScreen };

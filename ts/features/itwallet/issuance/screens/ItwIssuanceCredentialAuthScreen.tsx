import {
  Avatar,
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
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ItwMarkdown from "../../common/components/ItwMarkdown";
import {
  ItwRequestedClaimsList,
  RequiredClaim
} from "../components/ItwRequiredClaimsList";

const mockedClaims: ReadonlyArray<RequiredClaim> = [
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
];

const ItwIssuanceCredentialAuthScreen = () => {
  const navigation = useIONavigation();
  // const credential = ItwCredentialsMocks.mdl;

  const handleClosePress = () => {
    navigation.pop();
  };

  const handleContinuePress = () => {
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
        <H2>
          {I18n.t("features.itWallet.issuance.credentialAuth.title", {
            credentialName: "credential.displayData.title" // TODO [SIW-1358]: remove references to displayData
          })}
        </H2>
        <ItwMarkdown>
          {I18n.t("features.itWallet.issuance.credentialAuth.subtitle", {
            organization: "Istituto Poligrafico e Zecca"
          })}
        </ItwMarkdown>
        <VSpacer size={8} />
        <ListItemHeader
          label={I18n.t(
            "features.itWallet.issuance.credentialAuth.requiredClaims"
          )}
          iconName="security"
          iconColor="grey-700"
        />
        <ItwRequestedClaimsList claims={mockedClaims} />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="fornitori"
          body={I18n.t(
            "features.itWallet.issuance.credentialAuth.disclaimer.0"
          )}
        />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="trashcan"
          body={I18n.t(
            "features.itWallet.issuance.credentialAuth.disclaimer.1"
          )}
        />
        <VSpacer size={32} />
        <LabelSmall weight="Regular" color="grey-700">
          {I18n.t("features.itWallet.issuance.credentialAuth.tos.0")}{" "}
          <LabelLink fontSize="small" onPress={handleTosLinkPress}>
            {I18n.t("features.itWallet.issuance.credentialAuth.tos.1")}
          </LabelLink>
        </LabelSmall>
      </ContentWrapper>
      <FooterActions
        fixed={false}
        actions={{
          type: "TwoButtons",
          primary: {
            label: I18n.t("global.buttons.continue"),
            onPress: handleContinuePress
          },
          secondary: {
            label: I18n.t("global.buttons.cancel"),
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

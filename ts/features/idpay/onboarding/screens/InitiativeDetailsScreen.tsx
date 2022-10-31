import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import I18n from "i18n-js";
import * as React from "react";
import { View } from "native-base";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import OrganizationHeader from "../../../../components/OrganizationHeader";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import variables from "../../../../theme/variables";
import Markdown from "../../../../components/ui/Markdown";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { Body } from "../../../../components/core/typography/Body";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { UIService } from "../../../../store/reducers/entities/services/types";
import { useIOSelector } from "../../../../store/hooks";
import { serviceByIdSelector } from "../../../../store/reducers/entities/services/servicesById";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { toUIService } from "../../../../store/reducers/entities/services/transformers";

const InitiativeOrganizationHeader = ({
  name,
  organizationName,
  logoURLs
}: UIService) => (
  <OrganizationHeader
    serviceName={name}
    organizationName={organizationName}
    logoURLs={logoURLs}
  />
);

type BeforeContinueBodyProps = {
  onTOSLinkPress: () => void;
  onPrivacyLinkPress: () => void;
};

const InitiativeBeforeContinueBody = (props: BeforeContinueBodyProps) => (
  <Body accessibilityRole="link" testID="IDPayOnboardingBeforeContinue">
    <LabelSmall weight={"Regular"} color={"bluegrey"}>
      {I18n.t("idpay.onboarding.beforeContinue.text1")}
    </LabelSmall>
    <LabelSmall
      color={"blue"}
      onPress={props.onTOSLinkPress}
      testID="IDPayOnboardingPrivacyLink"
    >
      {I18n.t("idpay.onboarding.beforeContinue.tosLink")}
    </LabelSmall>
    <LabelSmall weight={"Regular"} color={"bluegrey"}>
      {I18n.t("idpay.onboarding.beforeContinue.text2")}
    </LabelSmall>
    <LabelSmall
      color={"blue"}
      onPress={props.onPrivacyLinkPress}
      testID="IDPayOnboardingTOSLink"
    >
      {I18n.t("idpay.onboarding.beforeContinue.privacyLink")}
    </LabelSmall>
  </Body>
);

const InitiativeDetailsScreen = () => {
  const navigation = useNavigation();

  // TODO mocked service Id, remove this when final logic will provide the correct id
  const serviceId = "serviceSv" as ServiceId;

  const service = pipe(
    pot.toOption(useIOSelector(serviceByIdSelector(serviceId)) || pot.none),
    O.map(toUIService),
    O.toUndefined
  );

  // This has been considered just to avoid compiling errors
  // once we navigate from service details screen we always have the service data since they're previously loaded
  if (service === undefined) {
    return null;
  }

  const handleGoBackPress = () => {
    navigation.goBack();
  };

  const handleContinuePress = () => {
    // TODO add continue press logic
  };

  const handlePrivacyLinkPress = () => {
    // TODO add privacy link press logic
  };

  const handleTosLinkPress = () => {
    // TODO add TOS link press logic
  };

  return (
    <BaseScreenComponent
      goBack={handleGoBackPress}
      headerTitle={I18n.t("idpay.onboarding.headerTitle")}
      customRightIcon={{
        iconName: "io-close",
        onPress: handleGoBackPress
      }}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={IOStyles.flex}>
          <View style={styles.padded}>
            <InitiativeOrganizationHeader {...service} />
            <View spacer={true} />
            <Markdown>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </Markdown>
            <View spacer={true} />
            <ItemSeparatorComponent noPadded={true} />
            <View spacer={true} />
            <InitiativeBeforeContinueBody
              onTOSLinkPress={handleTosLinkPress}
              onPrivacyLinkPress={handlePrivacyLinkPress}
            />
          </View>
          <View spacer={true} />
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={{
            bordered: true,
            title: I18n.t("idpay.onboarding.buttons.cancel"),
            onPress: handleGoBackPress,
            testID: "IDPayOnboardingCancel"
          }}
          rightButton={{
            title: I18n.t("idpay.onboarding.buttons.continue"),
            onPress: handleContinuePress,
            testID: "IDPayOnboardingContinue"
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: variables.contentPadding
  }
});

export default InitiativeDetailsScreen;

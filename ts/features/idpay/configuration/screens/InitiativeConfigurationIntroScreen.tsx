import {
  Body,
  FooterWithButtons,
  H1,
  IOColors,
  IOStyles,
  Icon,
  LabelSmall,
  VSpacer
} from "@pagopa/io-app-design-system";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useActor } from "@xstate/react";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import CreditCardIcon from "../../../../../img/features/idpay/creditcard.svg";
import InstitutionIcon from "../../../../../img/features/idpay/institution.svg";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { H3 } from "../../../../components/core/typography/H3";
import { H4 } from "../../../../components/core/typography/H4";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { LOADING_TAG } from "../../../../xstate/utils";
import { IDPayConfigurationParamsList } from "../navigation/navigator";
import { ConfigurationMode } from "../xstate/context";
import { useConfigurationMachineService } from "../xstate/provider";

type InitiativeConfigurationIntroScreenRouteParams = {
  initiativeId: string;
};

type InitiativeConfigurationIntroRouteProps = RouteProp<
  IDPayConfigurationParamsList,
  "IDPAY_CONFIGURATION_INTRO"
>;

type RequiredDataItemProps = {
  icon?: React.ReactNode;
  title: string;
  subTitle: string;
};

const RequiredDataItem = (props: RequiredDataItemProps) => (
  <View style={[IOStyles.row, styles.listItem]}>
    {!!props.icon && <View style={styles.icon}>{props.icon}</View>}
    <View>
      <H4 weight="SemiBold" color="bluegreyDark">
        {props.title}
      </H4>
      <LabelSmall weight="Regular" color="bluegrey">
        {props.subTitle}
      </LabelSmall>
    </View>
  </View>
);

const InitiativeConfigurationIntroScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<InitiativeConfigurationIntroRouteProps>();

  const { initiativeId } = route.params;

  const configurationMachine = useConfigurationMachineService();
  const [state, send] = useActor(configurationMachine);

  const isLoading = state.tags.has(LOADING_TAG);

  const handleContinuePress = () => {
    send({ type: "NEXT" });
  };

  const customGoBack = (
    <TouchableDefaultOpacity onPress={navigation.goBack}>
      <Icon name="closeLarge" />
    </TouchableDefaultOpacity>
  );

  const requiredDataItems: ReadonlyArray<RequiredDataItemProps> = [
    {
      icon: <InstitutionIcon width={24} height={24} />,
      title: I18n.t("idpay.configuration.intro.requiredData.ibanTitle"),
      subTitle: I18n.t("idpay.configuration.intro.requiredData.ibanSubtitle")
    },
    {
      icon: <CreditCardIcon width={24} height={24} />,
      title: I18n.t("idpay.configuration.intro.requiredData.instrumentTitle"),
      subTitle: I18n.t(
        "idpay.configuration.intro.requiredData.instrumentSubtitle"
      )
    }
  ];

  React.useEffect(() => {
    send({
      type: "START_CONFIGURATION",
      initiativeId,
      mode: ConfigurationMode.COMPLETE
    });
  }, [send, initiativeId]);

  return (
    <BaseScreenComponent
      goBack={true}
      customGoBack={customGoBack}
      headerTitle={I18n.t("idpay.configuration.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <LoadingSpinnerOverlay isLoading={isLoading}>
        <SafeAreaView style={IOStyles.flex}>
          <ScrollView style={IOStyles.flex}>
            <View style={IOStyles.horizontalContentPadding}>
              <VSpacer size={16} />
              <H1>{I18n.t("idpay.configuration.intro.title")}</H1>
              <VSpacer size={8} />
              <Body>{I18n.t("idpay.configuration.intro.body")}</Body>
              <VSpacer size={24} />
              <H3 color="bluegrey">
                {I18n.t("idpay.configuration.intro.requiredData.title")}
              </H3>
              <VSpacer size={8} />
              {requiredDataItems.map((item, index) => (
                <RequiredDataItem key={index} {...item} />
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
        <FooterWithButtons
          type="SingleButton"
          primary={{
            type: "Solid",
            buttonProps: {
              label: I18n.t("idpay.configuration.intro.buttons.continue"),
              accessibilityLabel: I18n.t(
                "idpay.configuration.intro.buttons.continue"
              ),
              onPress: handleContinuePress
            }
          }}
        />
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: IOColors["grey-100"]
  },
  icon: {
    marginRight: 16
  }
});

export type { InitiativeConfigurationIntroScreenRouteParams };

export default InitiativeConfigurationIntroScreen;

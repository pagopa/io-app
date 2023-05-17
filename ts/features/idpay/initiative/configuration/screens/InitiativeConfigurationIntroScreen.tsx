import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ListItem } from "native-base";
import React from "react";
import { View, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { useActor } from "@xstate/react";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { H3 } from "../../../../../components/core/typography/H3";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import InstitutionIcon from "../../../../../../img/features/idpay/institution.svg";
import CreditCardIcon from "../../../../../../img/features/idpay/creditcard.svg";
import { IDPayConfigurationParamsList } from "../navigation/navigator";
import { useConfigurationMachineService } from "../xstate/provider";
import { LOADING_TAG } from "../../../../../utils/xstate";
import I18n from "../../../../../i18n";
import { ConfigurationMode } from "../xstate/context";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Icon } from "../../../../../components/core/icons/Icon";

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
  <ListItem>
    {!!props.icon && <View style={styles.icon}>{props.icon}</View>}
    <View>
      <H4 weight="SemiBold" color="bluegreyDark">
        {props.title}
      </H4>
      <LabelSmall weight="Regular" color="bluegrey">
        {props.title}
      </LabelSmall>
    </View>
  </ListItem>
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
      <Icon name="legClose" />
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
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={{
              title: I18n.t("idpay.configuration.intro.buttons.continue"),
              onPress: handleContinuePress
            }}
          />
        </SafeAreaView>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  icon: {
    marginRight: 16
  }
});

export type { InitiativeConfigurationIntroScreenRouteParams };

export default InitiativeConfigurationIntroScreen;

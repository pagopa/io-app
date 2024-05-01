import {
  Body,
  H1,
  IOColors,
  IOStyles,
  Icon,
  LabelSmall,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { H3 } from "../../../../components/core/typography/H3";
import { H4 } from "../../../../components/core/typography/H4";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { isLoadingSelector } from "../../../../xstate/selectors";
import { IdPayConfigurationMachineContext } from "../machine/provider";

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

export const InitiativeConfigurationIntroScreen = () => {
  const { useActorRef, useSelector } = IdPayConfigurationMachineContext;
  const machine = useActorRef();

  const navigation = useNavigation();

  const theme = useIOTheme();

  const isLoading = useSelector(isLoadingSelector);

  const handleContinuePress = () => {
    machine.send({ type: "next" });
  };

  const customGoBack = (
    <TouchableDefaultOpacity onPress={navigation.goBack}>
      <Icon name="closeLarge" />
    </TouchableDefaultOpacity>
  );

  const requiredDataItems: ReadonlyArray<RequiredDataItemProps> = [
    {
      icon: (
        <Icon
          name="institution"
          size={24}
          color={theme["interactiveElem-default"]}
        />
      ),
      title: I18n.t("idpay.configuration.intro.requiredData.ibanTitle"),
      subTitle: I18n.t("idpay.configuration.intro.requiredData.ibanSubtitle")
    },
    {
      icon: (
        <Icon
          name="creditCard"
          size={24}
          color={theme["interactiveElem-default"]}
        />
      ),
      title: I18n.t("idpay.configuration.intro.requiredData.instrumentTitle"),
      subTitle: I18n.t(
        "idpay.configuration.intro.requiredData.instrumentSubtitle"
      )
    }
  ];

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
  listItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: IOColors["grey-100"]
  },
  icon: {
    marginRight: 16
  }
});

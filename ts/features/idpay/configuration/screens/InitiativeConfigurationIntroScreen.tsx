import {
  Body,
  FooterWithButtons,
  H1,
  IOColors,
  IOIcons,
  IOStyles,
  Icon,
  LabelSmall,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { H3 } from "../../../../components/core/typography/H3";
import { H4 } from "../../../../components/core/typography/H4";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { isLoadingSelector } from "../../../../xstate/selectors";
import { IdPayConfigurationMachineContext } from "../machine/provider";
import { ConfigurationMode } from "../types";
import { IdPayConfigurationParamsList } from "../navigation/params";

export type IdPayInitiativeConfigurationIntroScreenParams = {
  initiativeId?: string;
  mode?: ConfigurationMode;
};

type RouteProps = RouteProp<
  IdPayConfigurationParamsList,
  "IDPAY_CONFIGURATION_INTRO"
>;

export const InitiativeConfigurationIntroScreen = () => {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProps>();
  const { initiativeId, mode } = params;
  const { useActorRef, useSelector } = IdPayConfigurationMachineContext;
  const machine = useActorRef();

  const isLoading = useSelector(isLoadingSelector);

  const handleContinuePress = () => {
    machine.send({ type: "next" });
  };

  const customGoBack = (
    <TouchableDefaultOpacity onPress={navigation.goBack}>
      <Icon name="closeLarge" />
    </TouchableDefaultOpacity>
  );

  useFocusEffect(
    React.useCallback(() => {
      if (!!initiativeId && !!mode) {
        machine.send({
          type: "start-configuration",
          initiativeId,
          mode
        });
      }
    }, [machine, initiativeId, mode])
  );

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
              <RequiredDataItem
                icon="creditCard"
                title={I18n.t(
                  "idpay.configuration.intro.requiredData.ibanTitle"
                )}
                subTitle={I18n.t(
                  "idpay.configuration.intro.requiredData.ibanSubtitle"
                )}
              />
              <RequiredDataItem
                icon="institution"
                title={I18n.t(
                  "idpay.configuration.intro.requiredData.instrumentTitle"
                )}
                subTitle={I18n.t(
                  "idpay.configuration.intro.requiredData.instrumentSubtitle"
                )}
              />
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

type RequiredDataItemProps = {
  icon?: IOIcons;
  title: string;
  subTitle: string;
};

const RequiredDataItem = (props: RequiredDataItemProps) => {
  const theme = useIOTheme();
  return (
    <View style={[IOStyles.row, styles.listItem]}>
      {!!props.icon && (
        <View style={styles.icon}>
          <Icon
            name={props.icon}
            size={24}
            color={theme["interactiveElem-default"]}
          />
        </View>
      )}
      <View>
        <H4 weight="Semibold" color="bluegreyDark">
          {props.title}
        </H4>
        <LabelSmall weight="Regular" color="bluegrey">
          {props.subTitle}
        </LabelSmall>
      </View>
    </View>
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

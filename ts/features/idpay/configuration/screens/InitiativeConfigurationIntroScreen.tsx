import {
  BodySmall,
  H6,
  IOColors,
  IOIcons,
  IOStyles,
  Icon,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { isLoadingSelector } from "../../common/machine/selectors";
import { IdPayConfigurationMachineContext } from "../machine/provider";
import { IdPayConfigurationParamsList } from "../navigation/params";
import { ConfigurationMode } from "../types";

export type IdPayInitiativeConfigurationIntroScreenParams = {
  initiativeId?: string;
  mode?: ConfigurationMode;
};

type RouteProps = RouteProp<
  IdPayConfigurationParamsList,
  "IDPAY_CONFIGURATION_INTRO"
>;

export const InitiativeConfigurationIntroScreen = () => {
  const { params } = useRoute<RouteProps>();
  const { initiativeId, mode } = params;
  const { useActorRef, useSelector } = IdPayConfigurationMachineContext;
  const machine = useActorRef();

  const isLoading = useSelector(isLoadingSelector);

  const handleContinuePress = () => {
    machine.send({ type: "next" });
  };

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
    <IOScrollViewWithLargeHeader
      contextualHelp={emptyContextualHelp}
      headerActionsProp={{
        showHelp: true
      }}
      title={{
        label: I18n.t("idpay.configuration.intro.title"),
        section: I18n.t("idpay.configuration.headerTitle")
      }}
      description={I18n.t("idpay.configuration.intro.body")}
      includeContentMargins
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("idpay.configuration.intro.buttons.continue"),
          onPress: handleContinuePress
        }
      }}
    >
      <LoadingSpinnerOverlay isLoading={isLoading}>
        <H6 color="bluegrey">
          {I18n.t("idpay.configuration.intro.requiredData.title")}
        </H6>
        <VSpacer size={8} />
        <RequiredDataItem
          icon="creditCard"
          title={I18n.t("idpay.configuration.intro.requiredData.ibanTitle")}
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
      </LoadingSpinnerOverlay>
    </IOScrollViewWithLargeHeader>
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
        <H6 color="bluegreyDark">{props.title}</H6>
        <BodySmall weight="Regular" color="bluegrey">
          {props.subTitle}
        </BodySmall>
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

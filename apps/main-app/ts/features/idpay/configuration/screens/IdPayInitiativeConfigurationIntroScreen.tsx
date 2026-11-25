import {
  BodySmall,
  H6,
  Icon,
  IOIcons,
  useIOColors,
  VSpacer
} from "@io-app/design-system";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import { View } from "react-native";

import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
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

export const IdPayInitiativeConfigurationIntroScreen = () => {
  const { params } = useRoute<RouteProps>();
  const { initiativeId, mode } = params;
  const { useActorRef, useSelector } = IdPayConfigurationMachineContext;
  const machine = useActorRef();

  const isLoading = useSelector(isLoadingSelector);

  const handleContinuePress = () => {
    machine.send({ type: "next" });
  };

  useFocusEffect(
    useCallback(() => {
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
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("idpay.configuration.intro.buttons.continue"),
          onPress: handleContinuePress
        }
      }}
      description={I18n.t("idpay.configuration.intro.body")}
      headerActionsProp={{
        showHelp: true
      }}
      includeContentMargins
      title={{
        label: I18n.t("idpay.configuration.intro.title"),
        section: I18n.t("idpay.configuration.headerTitle")
      }}
    >
      <LoadingSpinnerOverlay isLoading={isLoading}>
        <H6>{I18n.t("idpay.configuration.intro.requiredData.title")}</H6>
        <VSpacer size={8} />
        <RequiredDataItem
          icon="creditCard"
          subTitle={I18n.t(
            "idpay.configuration.intro.requiredData.ibanSubtitle"
          )}
          title={I18n.t("idpay.configuration.intro.requiredData.ibanTitle")}
        />
        <RequiredDataItem
          icon="institution"
          subTitle={I18n.t(
            "idpay.configuration.intro.requiredData.instrumentSubtitle"
          )}
          title={I18n.t(
            "idpay.configuration.intro.requiredData.instrumentTitle"
          )}
        />
      </LoadingSpinnerOverlay>
    </IOScrollViewWithLargeHeader>
  );
};

type RequiredDataItemProps = {
  icon?: IOIcons;
  subTitle: string;
  title: string;
};

const RequiredDataItem = (props: RequiredDataItemProps) => {
  const colors = useIOColors();

  return (
    <View
      style={{
        flexDirection: "row",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.stroke.divider
      }}
    >
      {!!props.icon && (
        <View style={{ marginEnd: 16 }}>
          <Icon color={colors.icon.action} name={props.icon} size={24} />
        </View>
      )}
      <View>
        <H6 color={colors.text.content.secondary}>{props.title}</H6>
        <BodySmall weight="Regular">{props.subTitle}</BodySmall>
      </View>
    </View>
  );
};

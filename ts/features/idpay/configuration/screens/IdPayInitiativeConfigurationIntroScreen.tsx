import {
  BodySmall,
  H6,
  IOColors,
  IOIcons,
  Icon,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import { useCallback } from "react";
import { View } from "react-native";
import I18n from "i18next";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { emptyContextualHelp } from "../../../../utils/help";
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
        <H6>{I18n.t("idpay.configuration.intro.requiredData.title")}</H6>
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
    <View
      style={{
        flexDirection: "row",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: IOColors[theme["divider-default"]]
      }}
    >
      {!!props.icon && (
        <View style={{ marginEnd: 16 }}>
          <Icon
            name={props.icon}
            size={24}
            color={theme["interactiveElem-default"]}
          />
        </View>
      )}
      <View>
        <H6 color={theme["textBody-secondary"]}>{props.title}</H6>
        <BodySmall weight="Regular">{props.subTitle}</BodySmall>
      </View>
    </View>
  );
};

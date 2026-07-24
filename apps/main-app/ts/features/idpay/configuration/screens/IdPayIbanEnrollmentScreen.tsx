import { FeatureInfo, RadioGroup, VSpacer } from "@io-app/design-system";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { ComponentProps, useCallback, useEffect, useState } from "react";

import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import {
  isLoadingSelector,
  isUpsertingSelector
} from "../../common/machine/selectors";
import { IdPayConfigurationMachineContext } from "../machine/provider";
import {
  ibanListSelector,
  selectEnrolledIban,
  selectIsIbanOnlyMode
} from "../machine/selectors";
import { IdPayConfigurationParamsList } from "../navigation/params";
import { ConfigurationMode } from "../types";

export type IdPayIbanEnrollmentScreenParams = {
  initiativeId?: string;
};

type RouteProps = RouteProp<
  IdPayConfigurationParamsList,
  "IDPAY_CONFIGURATION_IBAN_ENROLLMENT"
>;

export const IdPayIbanEnrollmentScreen = () => {
  const { params } = useRoute<RouteProps>();
  const { initiativeId } = params;
  const machine = IdPayConfigurationMachineContext.useActorRef();

  const isLoading =
    IdPayConfigurationMachineContext.useSelector(isLoadingSelector);
  const ibanList =
    IdPayConfigurationMachineContext.useSelector(ibanListSelector);
  const isIbanOnly =
    IdPayConfigurationMachineContext.useSelector(selectIsIbanOnlyMode);
  const isUpsertingIban =
    IdPayConfigurationMachineContext.useSelector(isUpsertingSelector);
  const enrolledIban =
    IdPayConfigurationMachineContext.useSelector(selectEnrolledIban);

  const [selectedIban, setSelectedIban] = useState<string | undefined>();

  useFocusEffect(
    useCallback(() => {
      if (initiativeId !== undefined) {
        machine.send({
          type: "start-configuration",
          initiativeId,
          mode: ConfigurationMode.IBAN
        });
      }
    }, [machine, initiativeId])
  );

  useEffect(() => {
    if (enrolledIban) {
      setSelectedIban(enrolledIban.iban);
    }
  }, [enrolledIban]);

  const handleSelectIban = useCallback(
    (iban: string) => {
      setSelectedIban(iban);

      if (isIbanOnly) {
        const ibanObject = ibanList.find(el => el.iban === iban);
        if (ibanObject) {
          machine.send({ type: "enroll-iban", iban: ibanObject });
        }
      }
    },
    [ibanList, isIbanOnly, machine]
  );

  const handleBackPress = () => {
    machine.send({ type: "back" });
  };

  const handleContinuePress = () => {
    if (selectedIban !== undefined) {
      const selectedIbanObject = ibanList.find(el => el.iban === selectedIban);
      if (selectedIbanObject) {
        machine.send({ type: "enroll-iban", iban: selectedIbanObject });
      }
    }
  };

  const handleAddNewIbanPress = () => {
    machine.send({ type: "new-iban-onboarding" });
  };

  const renderActionProps = (): ComponentProps<
    typeof IOScrollView
  >["actions"] => {
    if (isIbanOnly) {
      return {
        type: "SingleButton",
        primary: {
          label: I18n.t("idpay.configuration.iban.button.addNew"),
          disabled: isUpsertingIban,
          onPress: handleAddNewIbanPress,
          testID: "addIbanButtonTestID"
        }
      };
    }

    return {
      type: "TwoButtons",
      primary: {
        label: I18n.t("idpay.configuration.iban.button.addNew"),
        disabled: isUpsertingIban,
        onPress: handleAddNewIbanPress,
        testID: "addIbanButtonTestID"
      },
      secondary: {
        label: I18n.t("global.buttons.continue"),
        disabled: !selectedIban || isUpsertingIban,
        // loading: isUpsertingIban,
        onPress: handleContinuePress,
        testID: "continueButtonTestID"
      }
    };
  };

  return (
    <IOScrollViewWithLargeHeader
      actions={renderActionProps()}
      contextualHelp={emptyContextualHelp}
      description={I18n.t("idpay.configuration.iban.enrollment.subTitle")}
      goBack={handleBackPress}
      headerActionsProp={{
        showHelp: true
      }}
      includeContentMargins
      title={{
        label: I18n.t("idpay.configuration.iban.enrollment.header"),
        section: isIbanOnly ? "" : I18n.t("idpay.configuration.headerTitle"),
        accessibilityLabel: isIbanOnly
          ? ""
          : I18n.t("idpay.configuration.headerTitle")
      }}
    >
      <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={1}>
        <RadioGroup<string>
          items={Array.from(ibanList, el => ({
            ...el,
            id: el.iban,
            value: el.iban,
            description: el.description
          }))}
          key="check_income"
          onPress={iban => handleSelectIban(iban)}
          selectedItem={selectedIban}
          type="radioListItem"
        />
        <VSpacer size={16} />
        <FeatureInfo
          body={I18n.t("idpay.configuration.iban.enrollment.footer")}
          iconName="profile"
        />
      </LoadingSpinnerOverlay>
    </IOScrollViewWithLargeHeader>
  );
};

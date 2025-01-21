import { FeatureInfo, RadioGroup, VSpacer } from "@pagopa/io-app-design-system";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { IbanDTO } from "../../../../../definitions/idpay/IbanDTO";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
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

export const IbanEnrollmentScreen = () => {
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

  const [selectedIban, setSelectedIban] = useState<IbanDTO | undefined>();

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
      setSelectedIban(enrolledIban);
    }
  }, [enrolledIban]);

  const handleSelectIban = useCallback(
    (iban: IbanDTO) => {
      setSelectedIban(iban);

      if (isIbanOnly) {
        machine.send({ type: "enroll-iban", iban });
      }
    },
    [isIbanOnly, machine]
  );

  const handleBackPress = () => {
    machine.send({ type: "back" });
  };

  const handleContinuePress = () => {
    if (selectedIban !== undefined) {
      machine.send({ type: "enroll-iban", iban: selectedIban });
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
      includeContentMargins
      title={{
        label: I18n.t("idpay.configuration.iban.enrollment.header"),
        section: isIbanOnly ? "" : I18n.t("idpay.configuration.headerTitle"),
        accessibilityLabel: isIbanOnly
          ? ""
          : I18n.t("idpay.configuration.headerTitle")
      }}
      goBack={handleBackPress}
      headerActionsProp={{
        showHelp: true
      }}
      contextualHelp={emptyContextualHelp}
      actions={renderActionProps()}
      description={I18n.t("idpay.configuration.iban.enrollment.subTitle")}
    >
      <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={1}>
        <RadioGroup<IbanDTO>
          type="radioListItem"
          key="check_income"
          items={Array.from(ibanList, el => ({
            ...el,
            id: el,
            value: el.iban,
            description: el.description
          }))}
          selectedItem={selectedIban}
          onPress={iban => handleSelectIban(iban)}
        />
        <VSpacer size={16} />
        <FeatureInfo
          iconName="profile"
          body={I18n.t("idpay.configuration.iban.enrollment.footer")}
        />
      </LoadingSpinnerOverlay>
    </IOScrollViewWithLargeHeader>
  );
};

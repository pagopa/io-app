import {
  FooterWithButtons,
  HSpacer,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { IbanDTO } from "../../../../../definitions/idpay/IbanDTO";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../components/screens/ListItemComponent";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { isSettingsVisibleAndHideProfileSelector } from "../../../../store/reducers/backendStatus";
import customVariables from "../../../../theme/variables";
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

  const isSettingsVisibleAndHideProfile = useIOSelector(
    isSettingsVisibleAndHideProfileSelector
  );

  const [selectedIban, setSelectedIban] = React.useState<IbanDTO | undefined>();

  useFocusEffect(
    React.useCallback(() => {
      if (initiativeId !== undefined) {
        machine.send({
          type: "start-configuration",
          initiativeId,
          mode: ConfigurationMode.IBAN
        });
      }
    }, [machine, initiativeId])
  );

  React.useEffect(() => {
    if (enrolledIban) {
      setSelectedIban(enrolledIban);
    }
  }, [enrolledIban]);

  const handleSelectIban = React.useCallback(
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

  const renderFooter = () => {
    if (isIbanOnly) {
      return (
        <FooterWithButtons
          type="SingleButton"
          primary={{
            type: "Solid",
            buttonProps: {
              label: I18n.t("idpay.configuration.iban.button.addNew"),
              disabled: isUpsertingIban,
              onPress: handleAddNewIbanPress,
              testID: "addIbanButtonTestID"
            }
          }}
        />
      );
    }

    return (
      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("idpay.configuration.iban.button.addNew"),
            disabled: isUpsertingIban,
            onPress: handleAddNewIbanPress,
            testID: "addIbanButtonTestID"
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            label: I18n.t("global.buttons.continue"),
            disabled: !selectedIban || isUpsertingIban,
            loading: isUpsertingIban,
            onPress: handleContinuePress,
            testID: "continueButtonTestID"
          }
        }}
      />
    );
  };

  const renderIbanList = () =>
    ibanList.map(iban => {
      const isSelected = iban.iban === selectedIban?.iban;

      return (
        <ListItemComponent
          key={iban.iban}
          title={iban.description}
          subTitle={iban.iban}
          iconName={isSelected ? "legRadioOn" : "legRadioOff"}
          smallIconSize={true}
          accessible={true}
          accessibilityRole={"radiogroup"}
          accessibilityState={{ checked: true }}
          onPress={() => !isSelected && handleSelectIban(iban)}
        />
      );
    });

  return (
    <BaseScreenComponent
      goBack={handleBackPress}
      headerTitle={I18n.t(
        isIbanOnly
          ? "idpay.configuration.iban.title"
          : "idpay.configuration.headerTitle"
      )}
      contextualHelp={emptyContextualHelp}
    >
      <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={1}>
        <ScrollView style={styles.container}>
          <H1>{I18n.t("idpay.configuration.iban.enrollment.header")}</H1>
          <VSpacer size={8} />
          <Body>{I18n.t("idpay.configuration.iban.enrollment.subTitle")}</Body>
          <VSpacer size={24} />
          {renderIbanList()}
          <VSpacer size={16} />
          {/*  TODO:: AdviceComponent goes here once implemented @dmnplb */}
          <View style={styles.bottomSection}>
            <Icon name="profile" color="bluegrey" />
            <HSpacer size={8} />
            <LabelSmall
              color="bluegrey"
              weight="Regular"
              style={IOStyles.flex} // required for correct wrapping
            >
              {isSettingsVisibleAndHideProfile
                ? I18n.t("idpay.configuration.iban.enrollment.footer")
                : I18n.t("idpay.configuration.iban.enrollment.legacyFooter")}
            </LabelSmall>
          </View>
          {/* TODO:: end AdviceComponent  */}
        </ScrollView>
        <SafeAreaView>{renderFooter()}</SafeAreaView>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: customVariables.contentPadding
  },
  bottomSection: {
    flexDirection: "row",
    alignItems: "center"
  }
});

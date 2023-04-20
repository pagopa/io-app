import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import React from "react";
import { View, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { IbanDTO } from "../../../../../../definitions/idpay/IbanDTO";
import { Icon } from "../../../../../components/core/icons";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../../components/screens/ListItemComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IDPayConfigurationParamsList } from "../navigation/navigator";
import { ConfigurationMode } from "../xstate/context";
import { useConfigurationMachineService } from "../xstate/provider";
import {
  ibanListSelector,
  isLoadingSelector,
  isUpsertingIbanSelector,
  selectEnrolledIban,
  selectIsIbanOnlyMode
} from "../xstate/selectors";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import customVariables from "../../../../../theme/variables";

type IbanEnrollmentScreenRouteParams = {
  initiativeId?: string;
};

type IbanEnrollmentScreenRouteProps = RouteProp<
  IDPayConfigurationParamsList,
  "IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT"
>;

const IbanEnrollmentScreen = () => {
  const route = useRoute<IbanEnrollmentScreenRouteProps>();
  const { initiativeId } = route.params;

  const configurationMachine = useConfigurationMachineService();

  const isLoading = useSelector(configurationMachine, isLoadingSelector);
  const ibanList = useSelector(configurationMachine, ibanListSelector);
  const isIbanOnly = useSelector(configurationMachine, selectIsIbanOnlyMode);

  const enrolledIban = useSelector(configurationMachine, selectEnrolledIban);
  const [selectedIban, setSelectedIban] = React.useState<IbanDTO | undefined>();

  React.useEffect(() => {
    if (enrolledIban) {
      setSelectedIban(enrolledIban);
    }
  }, [enrolledIban]);

  const isUpsertingIban = useSelector(
    configurationMachine,
    isUpsertingIbanSelector
  );

  const handleSelectIban = React.useCallback(
    (iban: IbanDTO) => {
      setSelectedIban(iban);

      if (isIbanOnly) {
        configurationMachine.send({ type: "ENROLL_IBAN", iban });
      }
    },
    [isIbanOnly, configurationMachine]
  );

  const handleBackPress = () => {
    configurationMachine.send({ type: "BACK" });
  };

  const handleContinuePress = () => {
    if (selectedIban !== undefined) {
      configurationMachine.send({ type: "ENROLL_IBAN", iban: selectedIban });
    }
  };

  const handleAddNewIbanPress = () => {
    configurationMachine.send({ type: "NEW_IBAN_ONBOARDING" });
  };

  const renderFooter = () => {
    if (isIbanOnly) {
      return (
        <FooterWithButtons
          type="SingleButton"
          leftButton={{
            title: I18n.t("idpay.configuration.iban.button.addNew"),
            disabled: isUpsertingIban,
            onPress: handleAddNewIbanPress,
            testID: "addIbanButtonTestID"
          }}
        />
      );
    }

    return (
      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        leftButton={{
          title: I18n.t("idpay.configuration.iban.button.addNew"),
          disabled: isUpsertingIban,
          bordered: true,
          onPress: handleAddNewIbanPress,
          testID: "addIbanButtonTestID"
        }}
        rightButton={{
          title: isUpsertingIban ? "" : I18n.t("global.buttons.continue"),
          disabled: !selectedIban || isUpsertingIban,
          isLoading: isUpsertingIban,
          onPress: handleContinuePress,
          testID: "continueButtonTestID"
        }}
      />
    );
  };

  /**
   * If when navigating to this screen we have an initiativeId, we set the configuration machine to
   * show only the IBAN related screens and not the whole configuration flow.
   */
  React.useEffect(() => {
    if (initiativeId) {
      configurationMachine.send({
        type: "START_CONFIGURATION",
        initiativeId,
        mode: ConfigurationMode.IBAN
      });
    }
  }, [configurationMachine, initiativeId]);

  const renderIbanList = () =>
    ibanList.map(iban => {
      const isSelected = iban.iban === selectedIban?.iban;

      return (
        <ListItemComponent
          key={iban.iban}
          title={iban.description}
          subTitle={iban.iban}
          iconName={isSelected ? "io-radio-on" : "io-radio-off"}
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
            <Icon name="profileAlt" color="bluegrey" />
            <HSpacer size={8} />
            <LabelSmall
              color="bluegrey"
              weight="Regular"
              style={IOStyles.flex} // required for correct wrapping
            >
              {I18n.t("idpay.configuration.iban.enrollment.footer")}
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

export type { IbanEnrollmentScreenRouteParams };

export default IbanEnrollmentScreen;

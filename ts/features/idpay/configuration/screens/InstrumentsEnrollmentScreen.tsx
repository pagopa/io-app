import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { IOColors, Icon, HSpacer, VSpacer } from "@pagopa/io-app-design-system";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { useNavigationSwipeBackListener } from "../../../../hooks/useNavigationSwipeBackListener";
import I18n from "../../../../i18n";
import { Wallet } from "../../../../types/pagopa";
import customVariables from "../../../../theme/variables";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { InstrumentEnrollmentSwitch } from "../components/InstrumentEnrollmentSwitch";
import { IDPayConfigurationParamsList } from "../navigation/navigator";
import { ConfigurationMode } from "../xstate/context";
import { InitiativeFailureType } from "../xstate/failure";
import { useConfigurationMachineService } from "../xstate/provider";
import {
  failureSelector,
  initiativeInstrumentsByIdWalletSelector,
  isLoadingSelector,
  isUpsertingInstrumentSelector,
  selectInitiativeDetails,
  selectIsInstrumentsOnlyMode,
  selectWalletInstruments
} from "../xstate/selectors";

type InstrumentsEnrollmentScreenRouteParams = {
  initiativeId?: string;
};

type InstrumentsEnrollmentScreenRouteProps = RouteProp<
  IDPayConfigurationParamsList,
  "IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT"
>;

const InstrumentsEnrollmentScreen = () => {
  const route = useRoute<InstrumentsEnrollmentScreenRouteProps>();
  const { initiativeId } = route.params;

  const [stagedWalletId, setStagedWalletId] = React.useState<number>();

  const configurationMachine = useConfigurationMachineService();

  const isLoading = useSelector(configurationMachine, isLoadingSelector);
  const failure = useSelector(configurationMachine, failureSelector);

  const initiativeDetails = useSelector(
    configurationMachine,
    selectInitiativeDetails
  );
  const isInstrumentsOnlyMode = useSelector(
    configurationMachine,
    selectIsInstrumentsOnlyMode
  );

  const walletInstruments = useSelector(
    configurationMachine,
    selectWalletInstruments
  );

  const isUpserting = useSelector(
    configurationMachine,
    isUpsertingInstrumentSelector
  );

  const initiativeInstrumentsByIdWallet = useSelector(
    configurationMachine,
    initiativeInstrumentsByIdWalletSelector
  );

  const hasSelectedInstruments =
    Object.keys(initiativeInstrumentsByIdWallet).length > 0;

  React.useEffect(() => {
    if (initiativeId) {
      configurationMachine.send({
        type: "START_CONFIGURATION",
        initiativeId,
        mode: ConfigurationMode.INSTRUMENTS
      });
    }
  }, [configurationMachine, initiativeId]);

  React.useEffect(() => {
    if (
      failure === InitiativeFailureType.INSTRUMENT_ENROLL_FAILURE ||
      failure === InitiativeFailureType.INSTRUMENT_DELETE_FAILURE
    ) {
      setStagedWalletId(undefined);
    }
  }, [failure]);

  const handleBackPress = () => configurationMachine.send({ type: "BACK" });

  const handleSkipButton = () => configurationMachine.send({ type: "SKIP" });

  const handleContinueButton = () =>
    configurationMachine.send({ type: "NEXT" });

  const handleAddPaymentMethodButton = () =>
    configurationMachine.send({ type: "ADD_PAYMENT_METHOD" });

  const handleEnrollConfirm = () => {
    if (stagedWalletId) {
      configurationMachine.send({
        type: "ENROLL_INSTRUMENT",
        walletId: stagedWalletId.toString()
      });
      setStagedWalletId(undefined);
    }
  };

  const enrollmentBottomSheetModal = useIOBottomSheetAutoresizableModal(
    {
      component: (
        <Body>
          {I18n.t("idpay.configuration.instruments.enrollmentSheet.bodyFirst")}
          <Body weight="SemiBold">
            {I18n.t(
              "idpay.configuration.instruments.enrollmentSheet.bodyBold"
            ) + "\n"}
          </Body>
          {I18n.t("idpay.configuration.instruments.enrollmentSheet.bodyLast")}
        </Body>
      ),
      title: I18n.t("idpay.configuration.instruments.enrollmentSheet.header"),
      footer: (
        <FooterWithButtons
          type="TwoButtonsInlineThird"
          rightButton={{
            onPress: handleEnrollConfirm,
            block: true,
            bordered: false,
            labelColor: IOColors.white,
            title: I18n.t(
              "idpay.configuration.instruments.enrollmentSheet.buttons.activate"
            )
          }}
          leftButton={{
            onPress: () => {
              enrollmentBottomSheetModal.dismiss();
            },
            block: true,
            bordered: true,
            labelColor: IOColors.blue,
            title: I18n.t(
              "idpay.configuration.instruments.enrollmentSheet.buttons.cancel"
            )
          }}
        />
      ),
      onDismiss: () => {
        setStagedWalletId(undefined);
      }
    },
    150
  );

  React.useEffect(() => {
    if (stagedWalletId) {
      enrollmentBottomSheetModal.present();
    } else {
      enrollmentBottomSheetModal.dismiss();
    }
  }, [enrollmentBottomSheetModal, stagedWalletId]);

  const renderFooterButtons = () => {
    if (isInstrumentsOnlyMode) {
      return (
        <FooterWithButtons
          type="SingleButton"
          leftButton={{
            title: I18n.t("idpay.configuration.instruments.buttons.addMethod"),
            onPress: handleAddPaymentMethodButton,
            disabled: isUpserting
          }}
        />
      );
    }

    return (
      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        leftButton={{
          title: I18n.t("idpay.configuration.instruments.buttons.skip"),
          bordered: true,
          disabled: isUpserting,
          onPress: handleSkipButton
        }}
        rightButton={{
          title: !isUpserting
            ? I18n.t("idpay.configuration.instruments.buttons.continue")
            : "",
          disabled: isUpserting || !hasSelectedInstruments,
          labelColor: IOColors.white,
          onPress: handleContinueButton,
          isLoading: isUpserting
        }}
      />
    );
  };

  useNavigationSwipeBackListener(() => {
    configurationMachine.send({ type: "BACK", skipNavigation: true });
  });

  const handleInstrumentValueChange = (wallet: Wallet) => (value: boolean) => {
    if (value) {
      setStagedWalletId(wallet.idWallet);
    } else {
      const instrument = initiativeInstrumentsByIdWallet[wallet.idWallet];
      configurationMachine.send({
        type: "DELETE_INSTRUMENT",
        instrumentId: instrument.instrumentId,
        walletId: wallet.idWallet.toString()
      });
    }
  };

  return (
    <>
      <BaseScreenComponent
        goBack={handleBackPress}
        headerTitle={I18n.t(
          isInstrumentsOnlyMode
            ? "idpay.configuration.instruments.title"
            : "idpay.configuration.headerTitle"
        )}
        contextualHelp={emptyContextualHelp}
      >
        <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={1}>
          <ScrollView style={styles.container}>
            <H1>{I18n.t("idpay.configuration.instruments.header")}</H1>
            <VSpacer size={8} />
            <Body>
              {I18n.t("idpay.configuration.instruments.body", {
                initiativeName: initiativeDetails?.initiativeName ?? ""
              })}
            </Body>
            <VSpacer size={24} />
            {walletInstruments.map(walletInstrument => (
              <InstrumentEnrollmentSwitch
                key={walletInstrument.idWallet}
                wallet={walletInstrument}
                isStaged={stagedWalletId === walletInstrument.idWallet}
                onValueChange={handleInstrumentValueChange(walletInstrument)}
              />
            ))}
            <VSpacer size={16} />
            {/*  TODO:: AdviceComponent goes here once implemented @dmnplb */}
            <View style={styles.bottomSection}>
              <Icon name="navWallet" color="bluegrey" />
              <HSpacer size={8} />
              <LabelSmall
                color="bluegrey"
                weight="Regular"
                style={IOStyles.flex} // required for correct wrapping
              >
                {I18n.t("idpay.configuration.instruments.footer")}
              </LabelSmall>
            </View>
            {/* TODO:: end AdviceComponent  */}
          </ScrollView>
          <SafeAreaView>{renderFooterButtons()}</SafeAreaView>
        </LoadingSpinnerOverlay>
      </BaseScreenComponent>
      {enrollmentBottomSheetModal.bottomSheet}
    </>
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

export type { InstrumentsEnrollmentScreenRouteParams };

export default InstrumentsEnrollmentScreen;

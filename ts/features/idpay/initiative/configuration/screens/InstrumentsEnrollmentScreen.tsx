import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import { List as NBList, Text as NBText } from "native-base";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { Icon } from "../../../../../components/core/icons";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { Wallet } from "../../../../../types/pagopa";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { InstrumentEnrollmentSwitch } from "../components/InstrumentEnrollmentSwitch";
import { IDPayConfigurationParamsList } from "../navigation/navigator";
import { ConfigurationMode } from "../xstate/context";
import { InitiativeFailureType } from "../xstate/failure";
import { useConfigurationMachineService } from "../xstate/provider";
import {
  failureSelector,
  initiativeInstrumentsByIdWalletSelector,
  isLoadingSelector,
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

  const [stagedInstrument, setStagedInstrument] = React.useState<Wallet>();

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
      setStagedInstrument(undefined);
    }
  }, [failure]);

  const handleBackPress = () => configurationMachine.send({ type: "BACK" });

  const handleSkipButton = () => configurationMachine.send({ type: "SKIP" });

  const handleContinueButton = () =>
    configurationMachine.send({ type: "NEXT" });

  const handleAddPaymentMethodButton = () =>
    configurationMachine.send({ type: "ADD_PAYMENT_METHOD" });

  const handleEnrollConfirm = () => {
    if (stagedInstrument) {
      configurationMachine.send({
        type: "ENROLL_INSTRUMENT",
        instrument: stagedInstrument
      });
      setStagedInstrument(undefined);
    }
  };

  const enrollmentBottomSheetModal = useIOBottomSheetModal(
    <Body>
      {I18n.t("idpay.configuration.instruments.enrollmentSheet.bodyFirst")}
      <Body weight="SemiBold">
        {I18n.t("idpay.configuration.instruments.enrollmentSheet.bodyBold") +
          "\n"}
      </Body>
      {I18n.t("idpay.configuration.instruments.enrollmentSheet.bodyLast")}
    </Body>,

    I18n.t("idpay.configuration.instruments.enrollmentSheet.header"),
    270,

    <FooterWithButtons
      type="TwoButtonsInlineThird"
      rightButton={{
        onPress: handleEnrollConfirm,
        block: true,
        bordered: false,
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
        title: I18n.t(
          "idpay.configuration.instruments.enrollmentSheet.buttons.cancel"
        )
      }}
    />,
    () => {
      setStagedInstrument(undefined);
    }
  );

  React.useEffect(() => {
    if (stagedInstrument) {
      enrollmentBottomSheetModal.present();
    } else {
      enrollmentBottomSheetModal.dismiss();
    }
  }, [enrollmentBottomSheetModal, stagedInstrument]);

  const renderFooterButtons = () => {
    if (isInstrumentsOnlyMode) {
      return (
        <FooterWithButtons
          type="SingleButton"
          leftButton={{
            title: I18n.t("idpay.configuration.instruments.buttons.addMethod"),
            onPress: handleAddPaymentMethodButton
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
          onPress: handleSkipButton
        }}
        rightButton={{
          title: I18n.t("idpay.configuration.instruments.buttons.continue"),
          disabled: !hasSelectedInstruments,
          onPress: handleContinueButton
        }}
      />
    );
  };

  const handleInstrumentValueChange = (wallet: Wallet) => (value: boolean) => {
    if (value) {
      setStagedInstrument(wallet);
    } else {
      const instrument = initiativeInstrumentsByIdWallet[wallet.idWallet];
      configurationMachine.send({
        type: "DELETE_INSTRUMENT",
        instrument
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
          <VSpacer />
          <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
            <H1>{I18n.t("idpay.configuration.instruments.header")}</H1>
            <VSpacer size={8} />
            <NBText>
              {I18n.t("idpay.configuration.instruments.body", {
                initiativeName: initiativeDetails?.initiativeName ?? ""
              })}
            </NBText>
            <VSpacer />
            <ScrollView>
              <NBList>
                {walletInstruments.map(walletInstrument => (
                  <InstrumentEnrollmentSwitch
                    key={walletInstrument.idWallet}
                    wallet={walletInstrument}
                    isStaged={stagedInstrument === walletInstrument}
                    onValueChange={handleInstrumentValueChange(
                      walletInstrument
                    )}
                  />
                ))}
              </NBList>
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
          </View>
          <SafeAreaView>{renderFooterButtons()}</SafeAreaView>
        </LoadingSpinnerOverlay>
      </BaseScreenComponent>
      {enrollmentBottomSheetModal.bottomSheet}
    </>
  );
};

const styles = StyleSheet.create({
  bottomSection: {
    flexDirection: "row",
    alignItems: "center"
  }
});

export type { InstrumentsEnrollmentScreenRouteParams };

export default InstrumentsEnrollmentScreen;

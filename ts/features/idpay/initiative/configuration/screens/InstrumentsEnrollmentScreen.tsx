import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import { List as NBList, Text as NBText } from "native-base";
import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import AdviceComponent from "../../../../../components/AdviceComponent";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
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
  selectInstrumentToEnroll,
  selectIsInstrumentsOnlyMode,
  selectIsUpsertingInstrument,
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

  const enrollingInstrument = useSelector(
    configurationMachine,
    selectInstrumentToEnroll
  );

  const isUpserting = useSelector(
    configurationMachine,
    selectIsUpsertingInstrument
  );

  const hasSelectedInstruments =
    Object.keys(initiativeInstrumentsByIdWallet).length > 0;

  const handleBackPress = () => {
    configurationMachine.send({ type: "BACK" });
  };

  const handleSkipButton = () => {
    configurationMachine.send({ type: "SKIP" });
  };

  const handleContinueButton = () => {
    configurationMachine.send({ type: "NEXT" });
  };

  const handleAddPaymentMethodButton = () => {
    configurationMachine.send({ type: "ADD_PAYMENT_METHOD" });
  };

  const handleEnrollConfirm = () => {
    configurationMachine.send({ type: "ENROLL_INSTRUMENT" });
    enrollmentBottomSheetModal.dismiss();
  };

  React.useEffect(() => {
    if (initiativeId) {
      configurationMachine.send({
        type: "START_CONFIGURATION",
        initiativeId,
        mode: ConfigurationMode.INSTRUMENTS
      });
    }
  }, [configurationMachine, initiativeId]);

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
      revertInstrumentSwitch();
    }
  );

  React.useEffect(() => {
    if (enrollingInstrument) {
      enrollmentBottomSheetModal.present();
    }
  }, [enrollmentBottomSheetModal, enrollingInstrument]);

  /** Resets the switch linked to the given walletId to its previous state */
  const revertInstrumentSwitch = React.useCallback(() => {
    configurationMachine.send({
      type: "STAGE_INSTRUMENT",
      instrument: undefined
    });
  }, [configurationMachine]);

  React.useEffect(() => {
    if (
      failure === InitiativeFailureType.INSTRUMENT_ENROLL_FAILURE ||
      failure === InitiativeFailureType.INSTRUMENT_DELETE_FAILURE
    ) {
      revertInstrumentSwitch();
    }
  }, [failure, revertInstrumentSwitch]);

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
          disabled: isUpserting,
          onPress: handleSkipButton
        }}
        rightButton={{
          title: I18n.t("idpay.configuration.instruments.buttons.continue"),
          disabled: isUpserting || !hasSelectedInstruments,
          onPress: handleContinueButton
        }}
      />
    );
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
                    instrument={
                      initiativeInstrumentsByIdWallet[walletInstrument.idWallet]
                    }
                  />
                ))}
              </NBList>
              <VSpacer />

              <AdviceComponent
                text={I18n.t("idpay.configuration.instruments.footer")}
                iconName="io-portafoglio"
                iconColor={IOColors.bluegrey}
              />
            </ScrollView>
          </View>
          <SafeAreaView>{renderFooterButtons()}</SafeAreaView>
        </LoadingSpinnerOverlay>
      </BaseScreenComponent>
      {enrollmentBottomSheetModal.bottomSheet}
    </>
  );
};

export type { InstrumentsEnrollmentScreenRouteParams };

export default InstrumentsEnrollmentScreen;

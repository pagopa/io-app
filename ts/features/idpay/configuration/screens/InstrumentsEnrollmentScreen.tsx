import {
  FooterWithButtons,
  IOColors,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import AdviceComponent from "../../../../components/AdviceComponent";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import LegacyFooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { useNavigationSwipeBackListener } from "../../../../hooks/useNavigationSwipeBackListener";
import I18n from "../../../../i18n";
import { Wallet } from "../../../../types/pagopa";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { InstrumentEnrollmentSwitch } from "../components/InstrumentEnrollmentSwitch";
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
import { IDPayConfigurationParamsList } from "../navigation/navigator";

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
          primary={{
            type: "Solid",
            buttonProps: {
              label: I18n.t(
                "idpay.configuration.instruments.enrollmentSheet.buttons.activate"
              ),
              accessibilityLabel: I18n.t(
                "idpay.configuration.instruments.enrollmentSheet.buttons.activate"
              ),
              onPress: handleEnrollConfirm
            }
          }}
          secondary={{
            type: "Outline",
            buttonProps: {
              label: I18n.t(
                "idpay.configuration.instruments.enrollmentSheet.buttons.cancel"
              ),
              accessibilityLabel: I18n.t(
                "idpay.configuration.instruments.enrollmentSheet.buttons.cancel"
              ),
              onPress: () => {
                enrollmentBottomSheetModal.dismiss();
              }
            }
          }}
        />
      ),
      onDismiss: () => {
        setStagedWalletId(undefined);
      }
    },
    175
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
        <LegacyFooterWithButtons
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
      <LegacyFooterWithButtons
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
          <ScrollView
            style={[IOStyles.flex, IOStyles.horizontalContentPadding]}
          >
            <VSpacer size={16} />
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
            <AdviceComponent
              iconName="navWallet"
              iconColor="bluegrey"
              text={I18n.t("idpay.configuration.instruments.footer")}
            />
            <VSpacer size={16} />
          </ScrollView>
          <SafeAreaView>{renderFooterButtons()}</SafeAreaView>
        </LoadingSpinnerOverlay>
      </BaseScreenComponent>
      {enrollmentBottomSheetModal.bottomSheet}
    </>
  );
};

export type { InstrumentsEnrollmentScreenRouteParams };

export default InstrumentsEnrollmentScreen;

import {
  Body,
  FeatureInfo,
  FooterActions,
  FooterActionsInline,
  H2,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useState, useCallback, useEffect } from "react";
import { ScrollView } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { Wallet } from "../../../../types/pagopa";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { PaymentsOnboardingRoutes } from "../../../payments/onboarding/navigation/routes";
import { isLoadingSelector } from "../../common/machine/selectors";
import { InstrumentEnrollmentSwitch } from "../components/InstrumentEnrollmentSwitch";
import { IdPayConfigurationMachineContext } from "../machine/provider";
import {
  failureSelector,
  initiativeInstrumentsByIdWalletSelector,
  isUpsertingInstrumentSelector,
  selectInitiativeDetails,
  selectIsInstrumentsOnlyMode,
  selectWalletInstruments
} from "../machine/selectors";
import { IdPayConfigurationParamsList } from "../navigation/params";
import { ConfigurationMode } from "../types";
import { InitiativeFailureType } from "../types/failure";

export type IdPayInstrumentsEnrollmentScreenParams = {
  initiativeId?: string;
};

type RouteProps = RouteProp<
  IdPayConfigurationParamsList,
  "IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT"
>;

export const InstrumentsEnrollmentScreen = () => {
  const navigation = useIONavigation();
  const { params } = useRoute<RouteProps>();
  const { initiativeId } = params;

  const { useActorRef, useSelector } = IdPayConfigurationMachineContext;
  const machine = useActorRef();

  const [stagedWalletId, setStagedWalletId] = useState<number>();

  const isLoading = useSelector(isLoadingSelector);
  const failure = useSelector(failureSelector);

  const initiativeDetails = useSelector(selectInitiativeDetails);
  const isInstrumentsOnlyMode = useSelector(selectIsInstrumentsOnlyMode);
  const walletInstruments = useSelector(selectWalletInstruments);

  const isUpserting = useSelector(isUpsertingInstrumentSelector);

  const initiativeInstrumentsByIdWallet = useSelector(
    initiativeInstrumentsByIdWalletSelector
  );

  const hasSelectedInstruments =
    Object.keys(initiativeInstrumentsByIdWallet).length > 0;

  useFocusEffect(
    useCallback(() => {
      if (initiativeId) {
        machine.send({
          type: "start-configuration",
          initiativeId,
          mode: ConfigurationMode.INSTRUMENTS
        });
      }
    }, [machine, initiativeId])
  );

  useEffect(() => {
    pipe(
      failure,
      O.filter(
        failure =>
          failure === InitiativeFailureType.INSTRUMENT_ENROLL_FAILURE ||
          failure === InitiativeFailureType.INSTRUMENT_DELETE_FAILURE
      ),
      O.map(() => setStagedWalletId(undefined))
    );
  }, [failure]);

  const handleBackPress = () => machine.send({ type: "back" });

  const handleSkipButton = () => machine.send({ type: "skip-instruments" });

  const handleContinueButton = () => machine.send({ type: "next" });

  const handleAddPaymentMethodButton = () =>
    navigation.replace(PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR, {
      screen: PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD
    });

  const handleEnrollConfirm = () => {
    if (stagedWalletId) {
      machine.send({
        type: "enroll-instrument",
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
          <Body weight="Semibold">
            {I18n.t(
              "idpay.configuration.instruments.enrollmentSheet.bodyBold"
            ) + "\n"}
          </Body>
          {I18n.t("idpay.configuration.instruments.enrollmentSheet.bodyLast")}
        </Body>
      ),
      title: I18n.t("idpay.configuration.instruments.enrollmentSheet.header"),
      footer: (
        <FooterActionsInline
          startAction={{
            color: "primary",
            label: I18n.t(
              "idpay.configuration.instruments.enrollmentSheet.buttons.cancel"
            ),
            onPress: () => {
              enrollmentBottomSheetModal.dismiss();
            }
          }}
          endAction={{
            color: "primary",
            label: I18n.t(
              "idpay.configuration.instruments.enrollmentSheet.buttons.activate"
            ),
            onPress: handleEnrollConfirm
          }}
        />
      ),
      onDismiss: () => {
        setStagedWalletId(undefined);
      }
    },
    175
  );

  useEffect(() => {
    if (stagedWalletId) {
      enrollmentBottomSheetModal.present();
    } else {
      enrollmentBottomSheetModal.dismiss();
    }
  }, [enrollmentBottomSheetModal, stagedWalletId]);

  const renderFooterButtons = () => {
    if (isInstrumentsOnlyMode) {
      return (
        <FooterActions
          actions={{
            type: "SingleButton",
            primary: {
              label: I18n.t(
                "idpay.configuration.instruments.buttons.addMethod"
              ),
              onPress: handleAddPaymentMethodButton,
              disabled: isUpserting
            }
          }}
        />
      );
    }

    return (
      <FooterActionsInline
        startAction={{
          color: "primary",
          label: I18n.t("idpay.configuration.instruments.buttons.skip"),
          onPress: handleSkipButton,
          disabled: isUpserting
        }}
        endAction={{
          color: "primary",
          label: !isUpserting
            ? I18n.t("idpay.configuration.instruments.buttons.continue")
            : "",
          disabled: isUpserting || !hasSelectedInstruments,
          onPress: handleContinueButton,
          loading: isUpserting
        }}
      />
    );
  };

  const handleInstrumentValueChange = (wallet: Wallet) => (value: boolean) => {
    if (value) {
      setStagedWalletId(wallet.idWallet);
    } else {
      const instrument = initiativeInstrumentsByIdWallet[wallet.idWallet];
      machine.send({
        type: "delete-instrument",
        instrumentId: instrument.instrumentId,
        walletId: wallet.idWallet.toString()
      });
    }
  };

  const initiativeName = pipe(
    initiativeDetails,
    O.map(i => i.initiativeName),
    O.toUndefined
  );

  useHeaderSecondLevel({
    title: I18n.t(
      isInstrumentsOnlyMode
        ? "idpay.configuration.instruments.title"
        : "idpay.configuration.headerTitle"
    ),
    goBack: handleBackPress,
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

  return (
    <>
      <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={1}>
        <ScrollView style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
          <VSpacer size={16} />
          <H2>{I18n.t("idpay.configuration.instruments.header")}</H2>
          <VSpacer size={8} />
          <Body>
            {I18n.t("idpay.configuration.instruments.body", {
              initiativeName
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
          <FeatureInfo
            iconName="navWallet"
            body={I18n.t("idpay.configuration.instruments.footer")}
          />
          <VSpacer size={16} />
        </ScrollView>
        {renderFooterButtons()}
      </LoadingSpinnerOverlay>
      {enrollmentBottomSheetModal.bottomSheet}
    </>
  );
};

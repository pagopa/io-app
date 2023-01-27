import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import { List, Text as NBText } from "native-base";
import React, { useRef } from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import {
  InstrumentEnrollmentSwitch,
  InstrumentEnrollmentSwitchRef
} from "../components/InstrumentEnrollmentSwitch";
import { IDPayConfigurationParamsList } from "../navigation/navigator";
import { ConfigurationMode } from "../xstate/context";
import { InitiativeFailureType } from "../xstate/failure";
import { useConfigurationMachineService } from "../xstate/provider";
import {
  failureSelector,
  isLoadingSelector,
  selectIsUpsertingInstrument,
  selectorIDPayInstrumentsByIdWallet,
  selectorPagoPAIntruments
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

  // See more in the docs: https://beta.reactjs.org/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback
  const instrumentItemsRef = useRef<Map<number, InstrumentEnrollmentSwitchRef>>(
    new Map<number, InstrumentEnrollmentSwitchRef>()
  );
  const getInstrumentItemsMap = () => {
    if (!instrumentItemsRef.current) {
      // eslint-disable-next-line functional/immutable-data
      instrumentItemsRef.current = new Map<
        number,
        InstrumentEnrollmentSwitchRef
      >();
    }
    return instrumentItemsRef.current;
  };

  const selectedInstrumentIdRef = useRef<number | undefined>(undefined);
  const selectedInstrumentWasSetRef = useRef<boolean>(false);

  const isLoading = useSelector(configurationMachine, isLoadingSelector);
  const failure = useSelector(configurationMachine, failureSelector);

  const pagoPAInstruments = useSelector(
    configurationMachine,
    selectorPagoPAIntruments
  );

  const idPayInstrumentsByIdWallet = useSelector(
    configurationMachine,
    selectorIDPayInstrumentsByIdWallet
  );

  const isUpserting = useSelector(
    configurationMachine,
    selectIsUpsertingInstrument
  );

  const hasSelectedInstruments =
    Object.keys(idPayInstrumentsByIdWallet).length > 0;

  const handleBackPress = () => {
    configurationMachine.send({ type: "BACK" });
  };

  const handleContinueButton = () => {
    configurationMachine.send({
      type: "NEXT"
    });
  };

  const sendEnrollInstrument = (walletId: number): void => {
    // eslint-disable-next-line functional/immutable-data
    selectedInstrumentWasSetRef.current = true;
    configurationMachine.send("ENROLL_INSTRUMENT", {
      instrumentId: walletId
    });
  };

  const sendDeleteInstrument = (walletId: number): void => {
    const instrument = idPayInstrumentsByIdWallet[walletId];

    if (instrument === undefined) {
      return;
    }

    configurationMachine.send("DELETE_INSTRUMENT", {
      instrumentId: instrument.instrumentId
    });
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
      {I18n.t("idpay.initiative.configuration.bottomSheet.bodyFirst")}
      <Body weight="SemiBold">
        {I18n.t("idpay.initiative.configuration.bottomSheet.bodyBold") + "\n"}
      </Body>
      {I18n.t("idpay.initiative.configuration.bottomSheet.bodyLast")}
    </Body>,

    I18n.t("idpay.initiative.configuration.bottomSheet.header"),
    270,

    <FooterWithButtons
      type="TwoButtonsInlineThird"
      rightButton={{
        onPress: () => {
          sendEnrollInstrument(selectedInstrumentIdRef.current as number);
          enrollmentBottomSheetModal.dismiss();
        },
        block: true,
        bordered: false,
        title: I18n.t(
          "idpay.initiative.configuration.bottomSheet.footer.buttonActivate"
        )
      }}
      leftButton={{
        onPress: () => {
          enrollmentBottomSheetModal.dismiss();
        },
        block: true,
        bordered: true,
        title: I18n.t(
          "idpay.initiative.configuration.bottomSheet.footer.buttonCancel"
        )
      }}
    />,
    () => {
      if (!selectedInstrumentWasSetRef.current) {
        // Resets the state of the switch only if the modal was closed without continuing
        revertInstrumentSwitch(selectedInstrumentIdRef.current as number);
      }
    }
  );

  /** Resets the switch linked to the given walletId to its previous state */
  const revertInstrumentSwitch = React.useCallback((walletId: number): void => {
    const node = getInstrumentItemsMap().get(walletId);
    if (node) {
      node.setSwitchStatus(!node.switchStatus);
    }
  }, []);

  React.useEffect(() => {
    if (
      failure === InitiativeFailureType.INSTRUMENT_ENROLL_FAILURE ||
      failure === InitiativeFailureType.INSTRUMENT_DELETE_FAILURE
    ) {
      const walletId = selectedInstrumentIdRef.current as number;
      revertInstrumentSwitch(walletId);

      // eslint-disable-next-line functional/immutable-data
      selectedInstrumentWasSetRef.current = false;
    }
  }, [failure, revertInstrumentSwitch]);

  const handleInstrumentSwitch = (
    walletId: number,
    isEnrolling: boolean
  ): void => {
    if (isEnrolling) {
      // eslint-disable-next-line functional/immutable-data
      selectedInstrumentIdRef.current = walletId;
      // eslint-disable-next-line functional/immutable-data
      selectedInstrumentWasSetRef.current = false;
      enrollmentBottomSheetModal.present();
    } else {
      sendDeleteInstrument(walletId);
    }
  };

  return (
    <>
      <BaseScreenComponent
        goBack={handleBackPress}
        headerTitle={I18n.t("idpay.configuration.headerTitle")}
      >
        <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={1}>
          <VSpacer size={16} />
          <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
            <H1>{I18n.t("idpay.initiative.configuration.header")}</H1>
            <VSpacer size={8} />
            <NBText>
              {I18n.t("idpay.initiative.configuration.subHeader", {
                initiativeName: "18app"
              })}
            </NBText>
            <VSpacer size={16} />
            <ScrollView>
              <List>
                {pagoPAInstruments.map(pagoPAInstrument => (
                  <InstrumentEnrollmentSwitch
                    ref={node => {
                      const map = getInstrumentItemsMap();
                      if (node) {
                        map.set(pagoPAInstrument.idWallet, node);
                      } else {
                        map.delete(pagoPAInstrument.idWallet);
                      }
                    }}
                    key={pagoPAInstrument.idWallet}
                    wallet={pagoPAInstrument}
                    status={
                      idPayInstrumentsByIdWallet[pagoPAInstrument.idWallet]
                        ?.status
                    }
                    isDisabled={isUpserting}
                    onSwitch={handleInstrumentSwitch}
                  />
                ))}
              </List>
              <NBText>{I18n.t("idpay.initiative.configuration.footer")}</NBText>
            </ScrollView>
          </View>
          <SafeAreaView>
            <FooterWithButtons
              type="TwoButtonsInlineHalf"
              leftButton={{
                title: I18n.t(
                  "idpay.initiative.configuration.buttonFooter.noneCta"
                ),
                bordered: true,
                disabled: true
              }}
              rightButton={{
                title: I18n.t(
                  "idpay.initiative.configuration.buttonFooter.continueCta"
                ),
                disabled: isUpserting || !hasSelectedInstruments,
                onPress: handleContinueButton
              }}
            />
          </SafeAreaView>
        </LoadingSpinnerOverlay>
      </BaseScreenComponent>
      {enrollmentBottomSheetModal.bottomSheet}
    </>
  );
};
export type { InstrumentsEnrollmentScreenRouteParams };

export default InstrumentsEnrollmentScreen;

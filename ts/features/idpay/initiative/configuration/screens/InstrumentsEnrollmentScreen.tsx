import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import { List, Text, View } from "native-base";
import React, { useRef } from "react";
import { SafeAreaView, ScrollView } from "react-native";
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
import { useConfigurationMachineService } from "../xstate/provider";
import {
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

  const isLoading = useSelector(configurationMachine, isLoadingSelector);

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
          revertInstrumentSwitch(selectedInstrumentIdRef.current as number);
          enrollmentBottomSheetModal.dismiss();
        },
        block: true,
        bordered: true,
        title: I18n.t(
          "idpay.initiative.configuration.bottomSheet.footer.buttonCancel"
        )
      }}
    />
  );

  const revertInstrumentSwitch = (walletId: number): void => {
    const node = getInstrumentItemsMap().get(walletId);
    if (node) {
      node.setSwitchStatus(false);
    }
  };

  const handleInstrumentSwitch = (
    walletId: number,
    isEnrolling: boolean
  ): void => {
    if (isEnrolling) {
      // eslint-disable-next-line functional/immutable-data
      selectedInstrumentIdRef.current = walletId;
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
          <View spacer />
          <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
            <H1>{I18n.t("idpay.initiative.configuration.header")}</H1>
            <View spacer small />
            <Text>
              {I18n.t("idpay.initiative.configuration.subHeader", {
                initiativeName: "18app"
              })}
            </Text>
            <View spacer />
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
              <Text>{I18n.t("idpay.initiative.configuration.footer")}</Text>
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

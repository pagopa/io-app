import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import { List, Text, View } from "native-base";
import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { InstrumentEnrollmentSwitch } from "../components/InstrumentEnrollmentSwitch";
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

  React.useEffect(() => {
    if (initiativeId) {
      configurationMachine.send({
        type: "START_CONFIGURATION",
        initiativeId,
        mode: ConfigurationMode.INSTRUMENTS
      });
    }
  }, [configurationMachine, initiativeId]);

  return (
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
                  key={pagoPAInstrument.idWallet}
                  wallet={pagoPAInstrument}
                  instrument={
                    idPayInstrumentsByIdWallet[pagoPAInstrument.idWallet]
                  }
                  isDisabled={isUpserting}
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
  );
};
export type { InstrumentsEnrollmentScreenRouteParams };

export default InstrumentsEnrollmentScreen;

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import React from "react";
import { H1 } from "@pagopa/io-app-design-system";
import { ScrollView, StyleSheet } from "react-native";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { Wallet } from "../../../../../types/pagopa";
import customVariables from "../../../../../theme/variables";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { InstrumentEnrollmentSwitch } from "../components/InstrumentEnrollmentSwitch";
import { IDPayConfigurationParamsList } from "../navigation/navigator";
import { useConfigurationMachineService } from "../xstate/provider";
import {
  failureSelector,
  initiativeInstrumentsByIdWalletSelector,
  isLoadingSelector,
  isUpsertingInstrumentSelector,
  selectWalletInstruments
} from "../xstate/selectors";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";

type InstrumentsPaymentMehtodsScreenRouteParams = {
  initiative?: InitiativeDTO;
};

type InstrumentsPaymentMethodsScreenRouteProps = RouteProp<
  IDPayConfigurationParamsList,
  "IDPAY_CONFIGURATION_INSTRUMENTS_PAYMENT_METHODS"
>;

const InstrumentsPaymentMethodsScreen = () => {
  const route = useRoute<InstrumentsPaymentMethodsScreenRouteProps>();
  const navigation =
    useNavigation<IOStackNavigationProp<IDPayConfigurationParamsList>>();
  const { initiative } = route.params;

  const [stagedWalletId, setStagedWalletId] = React.useState<number>();

  const configurationMachine = useConfigurationMachineService();

  const isLoading = useSelector(configurationMachine, isLoadingSelector);
  const failure = useSelector(configurationMachine, failureSelector);

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

  // React.useEffect(() => {
  //   if (initiativeId) {
  //     configurationMachine.send({
  //       type: "START_CONFIGURATION",
  //       initiativeId,
  //       mode: ConfigurationMode.PAYMENT_METHODS
  //     });
  //   }
  // }, [configurationMachine, initiativeId]);

  const handleBackPress = () => navigation.goBack();

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
        contextualHelp={emptyContextualHelp}
      >
        <LoadingSpinnerOverlay isLoading={false} loadingOpacity={1}>
          <ScrollView style={styles.container}>
            <H1>
              {I18n.t("idpay.configuration.instruments.paymentMethods.header")}
            </H1>
            <VSpacer size={8} />
            <Body>
              {I18n.t("idpay.configuration.instruments.paymentMethods.body", {
                initiativeName: initiative?.initiativeName ?? ""
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
          </ScrollView>
        </LoadingSpinnerOverlay>
      </BaseScreenComponent>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: customVariables.contentPadding
  }
});

export type { InstrumentsPaymentMehtodsScreenRouteParams };

export default InstrumentsPaymentMethodsScreen;

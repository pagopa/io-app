import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React from "react";

import { H1 } from "@pagopa/io-app-design-system";
import { ScrollView, StyleSheet } from "react-native";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import customVariables from "../../../../../theme/variables";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IDPayConfigurationParamsList } from "../navigation/navigator";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { idpayInitiativePaymentMethodsGet } from "../store/actions";
import {
  idpayInitiativePaymentMethodsInstrumentsSelector,
  isLoadingPaymentMethodsSelector
} from "../store";
import { IDPayConfigurationPaymentMethods } from "../types";
import { InstrumentPaymentMethodSwitch } from "../components/InstrumentPaymentMethodSwitch";
import { useInfoIDPayCIEBottomSheet } from "../components/InfoIDPayCIEBottomSheet";

type InstrumentsPaymentMehtodsScreenRouteParams = {
  initiative?: InitiativeDTO;
};

type InstrumentsPaymentMethodsScreenRouteProps = RouteProp<
  IDPayConfigurationParamsList,
  "IDPAY_CONFIGURATION_INSTRUMENTS_PAYMENT_METHODS"
>;

const InstrumentsPaymentMethodsScreen = () => {
  const dispatch = useIODispatch();
  const route = useRoute<InstrumentsPaymentMethodsScreenRouteProps>();
  const navigation =
    useNavigation<IOStackNavigationProp<IDPayConfigurationParamsList>>();
  const { initiative } = route.params;

  const initiativePaymentMethods = useIOSelector(
    idpayInitiativePaymentMethodsInstrumentsSelector
  );
  const isLoadingPaymentMethods = useIOSelector(
    isLoadingPaymentMethodsSelector
  );

  const { bottomSheet, present: presentCIEBottomSheet } =
    useInfoIDPayCIEBottomSheet();

  React.useEffect(() => {
    if (initiative) {
      dispatch(
        idpayInitiativePaymentMethodsGet.request({
          initiativeId: initiative.initiativeId
        })
      );
    }
  }, [initiative, dispatch]);

  const handleBackPress = () => navigation.goBack();

  const handlePaymentMethodValueChange = (
    paymentMethodType: IDPayConfigurationPaymentMethods,
    value: boolean
  ) => {
    // if (value) {
    //   navigation.navigate(
    //     IDPayConfigurationParamsList.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT,
    //     {
    //       initiative,
    //       paymentMethodType
    //     }
    //   );
    // }
    // console.log(paymentMethodType, value);
  };

  const handlePressActionButton = (
    paymentMethodType: IDPayConfigurationPaymentMethods
  ) => {
    if (paymentMethodType === IDPayConfigurationPaymentMethods.CIE) {
      presentCIEBottomSheet();
    }
  };

  return (
    <>
      <BaseScreenComponent
        goBack={handleBackPress}
        contextualHelp={emptyContextualHelp}
      >
        <LoadingSpinnerOverlay
          isLoading={isLoadingPaymentMethods}
          loadingOpacity={1}
        >
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
            {initiativePaymentMethods.map(paymentMethod => (
              <InstrumentPaymentMethodSwitch
                key={paymentMethod.idWallet}
                instrumentPaymentMethod={paymentMethod}
                onValueChange={handlePaymentMethodValueChange}
                onPressAction={handlePressActionButton}
              />
            ))}
            <VSpacer size={16} />
          </ScrollView>
        </LoadingSpinnerOverlay>
        {bottomSheet}
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

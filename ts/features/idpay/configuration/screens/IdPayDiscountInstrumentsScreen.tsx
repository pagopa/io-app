import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React from "react";

import { H1, VSpacer } from "@pagopa/io-app-design-system";
import { ScrollView, StyleSheet } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { Body } from "../../../../components/core/typography/Body";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { InitiativeDTO } from "../../../../../definitions/idpay/InitiativeDTO";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { idpayDiscountInitiativeInstrumentsGet } from "../store/actions";
import {
  idpayDiscountInitiativeInstrumentsSelector,
  isLoadingDiscountInitiativeInstrumentsSelector
} from "../store";
import { IDPayDiscountInitiativeInstruments } from "../types";
import { IdPayDiscountInstrumentEnrollmentSwitch } from "../components/IdPayDiscountInstrumentEnrollmentSwitch";
import { useInfoIDPayCIEBottomSheet } from "../../code/components/InfoIDPayCIEBottomSheet";
import { IDPayConfigurationParamsList } from "../navigation/navigator";

type IdPayDiscountInstrumentsScreenRouteParams = {
  initiative?: InitiativeDTO;
};

type IdPayDiscountInstrumentsScreenRouteProps = RouteProp<
  IDPayConfigurationParamsList,
  "IDPAY_CONFIGURATION_DISCOUNT_INSTRUMENTS"
>;

const IdPayDiscountInstrumentsScreen = () => {
  const dispatch = useIODispatch();
  const route = useRoute<IdPayDiscountInstrumentsScreenRouteProps>();
  const navigation =
    useNavigation<IOStackNavigationProp<IDPayConfigurationParamsList>>();
  const { initiative } = route.params;

  const initiativePaymentMethods = useIOSelector(
    idpayDiscountInitiativeInstrumentsSelector
  );
  const isLoadingPaymentMethods = useIOSelector(
    isLoadingDiscountInitiativeInstrumentsSelector
  );

  const { bottomSheet, present: presentCIEBottomSheet } =
    useInfoIDPayCIEBottomSheet();

  React.useEffect(() => {
    if (initiative) {
      dispatch(
        idpayDiscountInitiativeInstrumentsGet.request({
          initiativeId: initiative.initiativeId
        })
      );
    }
  }, [initiative, dispatch]);

  const handleBackPress = () => navigation.goBack();

  const handlePaymentMethodValueChange = (
    paymentMethodType: IDPayDiscountInitiativeInstruments,
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
    paymentMethodType: IDPayDiscountInitiativeInstruments
  ) => {
    if (paymentMethodType === IDPayDiscountInitiativeInstruments.CIE) {
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
              <IdPayDiscountInstrumentEnrollmentSwitch
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

export type { IdPayDiscountInstrumentsScreenRouteParams };

export default IdPayDiscountInstrumentsScreen;

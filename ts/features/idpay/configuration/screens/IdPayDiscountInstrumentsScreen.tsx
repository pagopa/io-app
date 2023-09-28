import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React from "react";

import { H1, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";

import { ScrollView, StyleSheet } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { Body } from "../../../../components/core/typography/Body";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { idpayDiscountInitiativeInstrumentsGet } from "../store/actions";
import {
  idpayDiscountInitiativeInstrumentsSelector,
  isLoadingDiscountInitiativeInstrumentsSelector
} from "../store";
import { IdPayDiscountInstrumentEnrollmentSwitch } from "../components/IdPayDiscountInstrumentEnrollmentSwitch";
import { IDPayConfigurationParamsList } from "../navigation/navigator";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import { useIdPayInfoCieBottomSheet } from "../../code/components/IdPayInfoCieBottomSheet";
import { InstrumentTypeEnum } from "../../../../../definitions/idpay/InstrumentDTO";
import { idpayInitiativesInstrumentDelete } from "../../wallet/store/actions";
import { IdPayCodeRoutes } from "../../code/navigation/routes";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { IdPayCodeParamsList } from "../../code/navigation/params";
import { idPayInitiativeFromInstrumentPotSelector } from "../../wallet/store/reducers";

type IdPayDiscountInstrumentsScreenRouteParams = {
  initiativeId: string;
  initiativeName: string;
};

type IdPayDiscountInstrumentsScreenRouteProps = RouteProp<
  IDPayConfigurationParamsList,
  "IDPAY_CONFIGURATION_DISCOUNT_INSTRUMENTS"
>;

const IdPayDiscountInstrumentsScreen = () => {
  const dispatch = useIODispatch();
  const route = useRoute<IdPayDiscountInstrumentsScreenRouteProps>();
  const navigation =
    useNavigation<IOStackNavigationProp<IdPayCodeParamsList>>();
  const { initiativeId, initiativeName } = route.params;

  const initiativePaymentMethods = useIOSelector(
    idpayDiscountInitiativeInstrumentsSelector
  );
  const isLoadingDiscountInstruments = useIOSelector(
    isLoadingDiscountInitiativeInstrumentsSelector
  );
  const switchValue = useIOSelector(state =>
    idPayInitiativeFromInstrumentPotSelector(state, initiativeId)
  );

  const idPayCodeInitiative = React.useMemo(
    () =>
      initiativePaymentMethods.find(
        initiative => initiative.instrumentType === InstrumentTypeEnum.IDPAYCODE
      ),
    [initiativePaymentMethods]
  );

  const { bottomSheet, present: presentCieBottomSheet } =
    useIdPayInfoCieBottomSheet();

  React.useEffect(() => {
    if (initiativeId) {
      dispatch(
        idpayDiscountInitiativeInstrumentsGet.request({
          initiativeId
        })
      );
    }
  }, [initiativeId, dispatch]);

  const handleCieValueChange = (value: boolean) => {
    if (value) {
      navigation.navigate(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
        screen: IdPayCodeRoutes.IDPAY_CODE_ONBOARDING,
        params: { initiativeId }
      });
    } else {
      if (idPayCodeInitiative && initiativeId) {
        dispatch(
          idpayInitiativesInstrumentDelete.request({
            initiativeId,
            instrumentId: idPayCodeInitiative.instrumentId
          })
        );
      }
    }
  };

  return (
    <>
      <TopScreenComponent goBack contextualHelp={emptyContextualHelp}>
        <LoadingSpinnerOverlay
          isLoading={isLoadingDiscountInstruments}
          loadingOpacity={1}
        >
          <ScrollView style={styles.container}>
            <H1>
              {I18n.t("idpay.configuration.instruments.paymentMethods.header")}
            </H1>
            <VSpacer size={8} />
            <Body>
              {I18n.t("idpay.configuration.instruments.paymentMethods.body", {
                initiativeName: initiativeName ?? ""
              })}
            </Body>
            <VSpacer size={24} />
            <IdPayDiscountInstrumentEnrollmentSwitch
              instrumentType={InstrumentTypeEnum.IDPAYCODE}
              onValueChange={handleCieValueChange}
              onPressAction={presentCieBottomSheet}
              status={idPayCodeInitiative?.status}
              isLoading={pot.isLoading(switchValue)}
              value={idPayCodeInitiative ? true : false}
            />
            <IdPayDiscountInstrumentEnrollmentSwitch
              instrumentType={InstrumentTypeEnum.QRCODE}
            />
            <VSpacer size={16} />
          </ScrollView>
        </LoadingSpinnerOverlay>
        {bottomSheet}
      </TopScreenComponent>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: customVariables.contentPadding
  }
});

export type { IdPayDiscountInstrumentsScreenRouteParams };

export default IdPayDiscountInstrumentsScreen;

import { Divider, H1, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { InstrumentTypeEnum } from "../../../../../definitions/idpay/InstrumentDTO";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { Body } from "../../../../components/core/typography/Body";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import I18n from "../../../../i18n";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import customVariables from "../../../../theme/variables";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIdPayInfoCieBottomSheet } from "../../code/components/IdPayInfoCieBottomSheet";
import { IdPayCodeParamsList } from "../../code/navigation/params";
import { IdPayCodeRoutes } from "../../code/navigation/routes";
import { IdPayDiscountInstrumentEnrollmentSwitch } from "../components/IdPayDiscountInstrumentEnrollmentSwitch";
import { IdPayConfigurationParamsList } from "../navigation/params";
import {
  idPayIsLoadingInitiativeInstrumentSelector,
  idpayDiscountInitiativeInstrumentsSelector,
  isLoadingDiscountInitiativeInstrumentsSelector
} from "../store";
import {
  idPayInitiativeInstrumentsRefreshStart,
  idPayInitiativeInstrumentsRefreshStop,
  idpayInitiativeInstrumentDelete
} from "../store/actions";

export type IdPayDiscountInstrumentsScreenRouteParams = {
  initiativeId: string;
  initiativeName?: string;
};

type IdPayDiscountInstrumentsScreenRouteProps = RouteProp<
  IdPayConfigurationParamsList,
  "IDPAY_CONFIGURATION_DISCOUNT_INSTRUMENTS"
>;

/**
 * Screen that shows the list of available instruments for a discount initiative which has been selected
 * Actually are available only the CIE and the QRCode
 */
export const IdPayDiscountInstrumentsScreen = () => {
  const dispatch = useIODispatch();
  const route = useRoute<IdPayDiscountInstrumentsScreenRouteProps>();
  const navigation =
    useNavigation<IOStackNavigationProp<IdPayCodeParamsList>>();
  const { initiativeId, initiativeName } = route.params;

  const initiativeInstruments = useIOSelector(
    idpayDiscountInitiativeInstrumentsSelector
  );
  const isLoadingInstruments = useIOSelector(
    isLoadingDiscountInitiativeInstrumentsSelector
  );

  const idPayCodeInstrument = React.useMemo(
    () =>
      initiativeInstruments.find(
        initiative => initiative.instrumentType === InstrumentTypeEnum.IDPAYCODE
      ),
    [initiativeInstruments]
  );

  const isLoadingIdPayCodeInstrument = useIOSelector(state =>
    idPayIsLoadingInitiativeInstrumentSelector(
      state,
      idPayCodeInstrument?.instrumentId || ""
    )
  );

  const { bottomSheet, present: presentCieBottomSheet } =
    useIdPayInfoCieBottomSheet();

  const getInstruments = React.useCallback(() => {
    dispatch(
      idPayInitiativeInstrumentsRefreshStart({
        initiativeId
      })
    );
    return () => {
      dispatch(idPayInitiativeInstrumentsRefreshStop());
    };
  }, [initiativeId, dispatch]);

  useFocusEffect(getInstruments);

  const handleCieValueChange = (value: boolean) => {
    if (value) {
      navigation.navigate(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
        screen: IdPayCodeRoutes.IDPAY_CODE_ONBOARDING,
        params: { initiativeId }
      });
    } else {
      if (idPayCodeInstrument && initiativeId) {
        dispatch(
          idpayInitiativeInstrumentDelete.request({
            initiativeId,
            instrumentId: idPayCodeInstrument.instrumentId
          })
        );
      }
    }
  };

  return (
    <>
      <TopScreenComponent goBack contextualHelp={emptyContextualHelp}>
        <LoadingSpinnerOverlay
          isLoading={isLoadingInstruments}
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
              status={idPayCodeInstrument?.status}
              isLoading={pot.isLoading(isLoadingIdPayCodeInstrument)}
              value={idPayCodeInstrument ? true : false}
            />
            <Divider />
            <IdPayDiscountInstrumentEnrollmentSwitch
              instrumentType={InstrumentTypeEnum.APP_IO_PAYMENT}
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

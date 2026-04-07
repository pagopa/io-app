import { Divider } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";

import { InstrumentTypeEnum } from "../../../../../definitions/idpay/InstrumentDTO";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { useIdPayInfoCieBottomSheet } from "../../code/components/IdPayInfoCieBottomSheet";
import { IdPayCodeParamsList } from "../../code/navigation/params";
import { IdPayCodeRoutes } from "../../code/navigation/routes";
import { IdPayDiscountInstrumentEnrollmentSwitch } from "../components/IdPayDiscountInstrumentEnrollmentSwitch";
import { IdPayConfigurationParamsList } from "../navigation/params";
import {
  idpayDiscountInitiativeInstrumentsSelector,
  idPayIsLoadingInitiativeInstrumentSelector,
  isLoadingDiscountInitiativeInstrumentsSelector
} from "../store";
import {
  idpayInitiativeInstrumentDelete,
  idPayInitiativeInstrumentsRefreshStart,
  idPayInitiativeInstrumentsRefreshStop
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

  const idPayCodeInstrument = useMemo(
    () =>
      initiativeInstruments.find(
        initiative => initiative.instrumentType === InstrumentTypeEnum.IDPAYCODE
      ),
    [initiativeInstruments]
  );

  const isLoadingIdPayCodeInstrument = useIOSelector(state =>
    idPayIsLoadingInitiativeInstrumentSelector(
      state,
      idPayCodeInstrument?.instrumentId ?? ""
    )
  );

  const { bottomSheet, present: presentCieBottomSheet } =
    useIdPayInfoCieBottomSheet();

  const getInstruments = useCallback(() => {
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
    } else if (idPayCodeInstrument && initiativeId) {
      dispatch(
        idpayInitiativeInstrumentDelete.request({
          initiativeId,
          instrumentId: idPayCodeInstrument.instrumentId
        })
      );
    }
  };

  return (
    <IOScrollViewWithLargeHeader
      contextualHelp={emptyContextualHelp}
      description={I18n.t(
        "idpay.configuration.instruments.paymentMethods.body",
        {
          initiativeName: initiativeName ?? ""
        }
      )}
      headerActionsProp={{ showHelp: true }}
      includeContentMargins
      title={{
        label: I18n.t("idpay.configuration.instruments.paymentMethods.header")
      }}
    >
      <LoadingSpinnerOverlay
        isLoading={isLoadingInstruments}
        loadingOpacity={1}
      >
        <IdPayDiscountInstrumentEnrollmentSwitch
          instrumentType={InstrumentTypeEnum.IDPAYCODE}
          isLoading={pot.isLoading(isLoadingIdPayCodeInstrument)}
          onPressAction={presentCieBottomSheet}
          onValueChange={handleCieValueChange}
          status={idPayCodeInstrument?.status}
          value={!!idPayCodeInstrument}
        />
        <Divider />
        <IdPayDiscountInstrumentEnrollmentSwitch
          instrumentType={InstrumentTypeEnum.APP_IO_PAYMENT}
        />
      </LoadingSpinnerOverlay>
      {bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

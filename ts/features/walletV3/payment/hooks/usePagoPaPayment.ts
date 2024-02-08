import {
  RptId as PagoPaRptId,
  RptIdFromString as PagoPaRptIdFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { NavigatorScreenParams, useRoute } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import {
  AppParamsList,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { WalletPaymentRoutes } from "../navigation/routes";
import { walletPaymentInitState } from "../store/actions/orchestration";
import { PaymentStartOrigin, PaymentStartRoute } from "../types";

type PaymentConfiguration = {
  startOrigin?: PaymentStartOrigin;
};

const usePagoPaPayment = () => {
  const route = useRoute();
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const initPaymentState = ({ startOrigin }: PaymentConfiguration) => {
    const startRoute: PaymentStartRoute = {
      routeName: route.name as keyof AppParamsList,
      routeKey:
        route.key as keyof NavigatorScreenParams<AppParamsList>["screen"]
    };
    dispatch(
      walletPaymentInitState({
        startRoute,
        startOrigin
      })
    );
  };

  const startPaymentFlow = (
    rptId: RptId,
    configuration: PaymentConfiguration = {}
  ) => {
    initPaymentState(configuration);
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_DETAIL,
      params: {
        rptId
      }
    });
  };

  const startPaymentFlowWithRptId = (
    rptId: PagoPaRptId,
    configuration: PaymentConfiguration = {}
  ) => {
    pipe(
      O.fromNullable(rptId),
      O.map(PagoPaRptIdFromString.encode),
      O.map(RptId.decode),
      O.chain(O.fromEither),
      O.map(rptIdString => startPaymentFlow(rptIdString, configuration))
    );
  };

  const startPaymentFlowWithData = (
    data: {
      paymentNoticeNumber: string;
      organizationFiscalCode: string;
    },
    configuration: PaymentConfiguration = {}
  ) => {
    pipe(
      PagoPaRptIdFromString.decode(data),
      E.chain(RptId.decode),
      E.map(rptIdString => startPaymentFlow(rptIdString, configuration))
    );
  };

  return {
    startPaymentFlow,
    startPaymentFlowWithRptId,
    startPaymentFlowWithData
  };
};

export { usePagoPaPayment };

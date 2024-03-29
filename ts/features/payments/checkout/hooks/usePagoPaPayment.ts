import {
  RptId as PagoPaRptId,
  RptIdFromString as PagoPaRptIdFromString,
  PaymentNoticeNumberFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { NavigatorScreenParams, useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import {
  AppParamsList,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import {
  PaymentInitStateParams,
  initPaymentStateAction
} from "../store/actions/orchestration";
import { PaymentStartRoute } from "../types";

type PagoPaPaymentParams = Omit<PaymentInitStateParams, "startRoute">;

/**
 * A hook for initiating a PagoPA payment flow.
 * This hook provides functions to start a payment flow using various input methods.
 * @returns An object containing functions to start different types of payment flows.
 */
const usePagoPaPayment = () => {
  const route = useRoute();
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  /**
   * Initializes the payment state based on the provided parameters.
   * The initialization includes the store of the current route which allows the app to
   * return to it when the payment flow is finished.
   * @param {PagoPaPaymentParams} params - Parameters for initializing the payment state.
   */
  const initPaymentState = ({ startOrigin }: PagoPaPaymentParams) => {
    const startRoute: PaymentStartRoute = {
      routeName: route.name as keyof AppParamsList,
      routeKey:
        route.key as keyof NavigatorScreenParams<AppParamsList>["screen"]
    };
    dispatch(
      initPaymentStateAction({
        startRoute,
        startOrigin
      })
    );
  };

  /**
   * Initiates the payment flow using the provided RptId string and additional parameters.
   * @param {RptId} rptId - The RptId for the payment flow.
   * @param {PagoPaPaymentParams} params - Additional parameters for the payment flow.
   */
  const startPaymentFlow = (rptId: RptId, params: PagoPaPaymentParams = {}) => {
    initPaymentState(params);
    navigation.navigate(PaymentsCheckoutRoutes.PAYMENTS_CHECKOUT_NAVIGATOR, {
      screen: PaymentsCheckoutRoutes.PAYMENTS_CHECKOUT_DETAIL,
      params: {
        rptId
      }
    });
  };

  /**
   * Initiates the payment flow using the provided PagoPA RptId and additional parameters.
   * @param {PagoPaRptId} rptId - The PagoPA RptId for the payment flow.
   * @param {PagoPaPaymentParams} params - Additional parameters for the payment flow.
   */
  const startPaymentFlowWithRptId = (
    rptId: PagoPaRptId,
    params: PagoPaPaymentParams = {}
  ) => {
    pipe(
      O.fromNullable(rptId),
      O.map(PagoPaRptIdFromString.encode),
      O.map(RptId.decode),
      O.chain(O.fromEither),
      O.map(rptIdString => startPaymentFlow(rptIdString, params))
    );
  };

  /**
   * Initiates the payment flow using the provided payment data and additional parameters.
   * @param {Object} data - Payment data containing the payment notice number and an organization fiscal code.
   * @param {PagoPaPaymentParams} params - Additional parameters for the payment flow.
   */
  const startPaymentFlowWithData = (
    data: {
      paymentNoticeNumber: string;
      organizationFiscalCode: string;
    },
    params: PagoPaPaymentParams = {}
  ) => {
    pipe(
      sequenceS(E.Monad)({
        paymentNoticeNumber: PaymentNoticeNumberFromString.decode(
          data.paymentNoticeNumber
        ),
        organizationFiscalCode: OrganizationFiscalCode.decode(
          data.organizationFiscalCode
        )
      }),
      E.map(PagoPaRptIdFromString.encode),
      E.chain(RptId.decode),
      E.map(rptIdString => startPaymentFlow(rptIdString, params))
    );
  };

  return {
    startPaymentFlow,
    startPaymentFlowWithRptId,
    startPaymentFlowWithData
  };
};

export { usePagoPaPayment };

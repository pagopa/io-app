import {
  RptId as PagoPaRptId,
  RptIdFromString as PagoPaRptIdFromString,
  PaymentNoticeNumberFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { sequenceS } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import {
  PaymentInitStateParams,
  initPaymentStateAction
} from "../store/actions/orchestration";

type PagoPaPaymentParams = Omit<PaymentInitStateParams, "startRoute">;

const DEFAULT_PAYMENT_PARAMS: PagoPaPaymentParams = {};

type PaymentData = {
  paymentNoticeNumber: string;
  organizationFiscalCode: string;
};

type UsePagoPaPayment = {
  startPaymentFlow: (rptId: RptId, params?: PagoPaPaymentParams) => void;
  startPaymentFlowWithRptId: (
    rptId: PagoPaRptId,
    params?: PagoPaPaymentParams
  ) => void;
  startPaymentFlowWithData: (
    data: PaymentData,
    params?: PagoPaPaymentParams
  ) => void;
};

/**
 * A hook for initiating a PagoPA payment flow.
 * This hook provides functions to start a payment flow using various input methods.
 * @returns An object containing functions to start different types of payment flows.
 */
const usePagoPaPayment = (): UsePagoPaPayment => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  /**
   * Initializes the payment state based on the provided parameters.
   * The initialization includes the store of the current route which allows the app to
   * return to it when the payment flow is finished.
   * @param {PagoPaPaymentParams} params - Parameters for initializing the payment state.
   */
  const initPaymentState = (params: PagoPaPaymentParams) => {
    dispatch(initPaymentStateAction(params));
  };

  /**
   * Initiates the payment flow using the provided RptId string and additional parameters.
   * @param {RptId} rptId - The RptId for the payment flow.
   * @param {PagoPaPaymentParams} params - Additional parameters for the payment flow.
   */
  const startPaymentFlow = (
    rptId: RptId,
    params: PagoPaPaymentParams = DEFAULT_PAYMENT_PARAMS
  ) => {
    initPaymentState(params);
    navigation.navigate(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
      screen: PaymentsCheckoutRoutes.PAYMENT_NOTICE_SUMMARY,
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
    params: PagoPaPaymentParams = DEFAULT_PAYMENT_PARAMS
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
    data: PaymentData,
    params: PagoPaPaymentParams = DEFAULT_PAYMENT_PARAMS
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

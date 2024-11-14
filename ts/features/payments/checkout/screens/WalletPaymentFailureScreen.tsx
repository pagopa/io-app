import React from "react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { RouteProp, useRoute } from "@react-navigation/native";

import { NetworkError } from "../../../../utils/errors";
import { WalletPaymentFailure } from "../types/WalletPaymentFailure";
import { WalletPaymentFailureDetail } from "../components/WalletPaymentFailureDetail";
import { FaultCodeCategoryEnum } from "../../../../../definitions/pagopa/ecommerce/GatewayFaultPaymentProblemJson";
import { PaymentsCheckoutParamsList } from "../navigation/params";

const GENERIC_ERROR_FAULT_CODE_DETAIL = "GENERIC_ERROR";

export type WalletPaymentFailureScreenNavigationParams = {
  error: NetworkError | WalletPaymentFailure;
};

type WalletPaymentFailureRouteProps = RouteProp<
  PaymentsCheckoutParamsList,
  "PAYMENT_CHECKOUT_FAILURE"
>;

const WalletPaymentFailureScreen = () => {
  const { params } = useRoute<WalletPaymentFailureRouteProps>();
  const { error } = params;

  const failure = pipe(
    error,
    WalletPaymentFailure.decode,
    O.fromEither,
    // NetworkError is transformed to GENERIC_ERROR only for display purposes
    O.getOrElse<WalletPaymentFailure>(() => ({
      faultCodeCategory: FaultCodeCategoryEnum.GENERIC_ERROR,
      faultCodeDetail:
        (error as WalletPaymentFailure)?.faultCodeDetail ||
        GENERIC_ERROR_FAULT_CODE_DETAIL
    }))
  );
  return <WalletPaymentFailureDetail failure={failure} />;
};

export { WalletPaymentFailureScreen };

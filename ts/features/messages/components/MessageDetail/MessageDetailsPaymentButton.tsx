import { IOButton, useIOToast } from "@pagopa/io-app-design-system";
import { PaymentData } from "../../types";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import I18n from "../../../../i18n";
import {
  getRptIdStringFromPaymentData,
  initializeAndNavigateToWalletForPayment
} from "../../utils";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { computeAndTrackPaymentStart } from "./detailsUtils";

type MessageDetailsPaymentButtonProps = {
  paymentData: PaymentData;
  canNavigateToPayment: boolean;
  isLoading: boolean;
  serviceId: ServiceId;
};

export const MessageDetailsPaymentButton = ({
  paymentData,
  canNavigateToPayment,
  isLoading,
  serviceId
}: MessageDetailsPaymentButtonProps) => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const toast = useIOToast();

  return (
    <IOButton
      fullWidth
      variant="solid"
      loading={isLoading}
      label={I18n.t("features.messages.payments.pay")}
      onPress={() =>
        initializeAndNavigateToWalletForPayment(
          getRptIdStringFromPaymentData(paymentData),
          false,
          canNavigateToPayment,
          dispatch,
          () => computeAndTrackPaymentStart(serviceId, store.getState()),
          () => toast.error(I18n.t("genericError"))
        )
      }
    />
  );
};

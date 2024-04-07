import React from "react";
import { PnParamsList } from "../navigation/params";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import I18n from "../../../i18n";

export type PaidPaymentScreenRouteParams = {
  noticeCode: string;
  creditorTaxId?: string;
};

type PaidPaymentScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  "PN_CANCELLED_MESSAGE_PAID_PAYMENT"
>;

export const PaidPaymentScreen = (_: PaidPaymentScreenProps) => {
  const navigation = useIONavigation();
  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });
  return (
    <OperationResultScreenContent
      title={I18n.t("wallet.payment.failure.PAYMENT_DUPLICATED.title")}
      pictogram={"moneyCheck"}
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: () => navigation.pop()
      }}
    />
  );
};

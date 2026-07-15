import I18n from "i18next";

import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { PnParamsList } from "../navigation/params";

export type PaidPaymentScreenRouteParams = {
  creditorTaxId?: string;
  noticeCode: string;
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
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: () => navigation.pop()
      }}
      pictogram={"moneyCheck"}
      title={I18n.t("wallet.payment.failure.PAYMENT_DUPLICATED.title")}
    />
  );
};

import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { paymentsGetMethodDetailsAction } from "../store/actions";

type Props = {
  walletId: string;
};

const PaymentsMethodDetailsErrorContent = ({ walletId }: Props) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const handleOnRetry = () => {
    dispatch(paymentsGetMethodDetailsAction.request({ walletId }));
  };

  return (
    <OperationResultScreenContent
      testID="PaymentsMethodDetailsErrorContent"
      title={I18n.t("wallet.methodDetails.error.title")}
      subtitle={I18n.t("wallet.methodDetails.error.subtitle")}
      pictogram="umbrella"
      action={{
        label: I18n.t("wallet.methodDetails.error.primaryButton"),
        accessibilityLabel: I18n.t("wallet.methodDetails.error.primaryButton"),
        onPress: () => navigation.pop()
      }}
      secondaryAction={{
        label: I18n.t("wallet.methodDetails.error.secondaryButton"),
        accessibilityLabel: I18n.t(
          "wallet.methodDetails.error.secondaryButton"
        ),
        onPress: handleOnRetry
      }}
    />
  );
};

export { PaymentsMethodDetailsErrorContent };

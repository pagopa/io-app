import I18n from "i18next";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

const PaymentsMethodDetailsErrorContent = () => {
  const navigation = useIONavigation();

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("wallet.methodDetails.error.primaryButton"),
        accessibilityLabel: I18n.t("wallet.methodDetails.error.primaryButton"),
        onPress: () => navigation.pop()
      }}
      pictogram="umbrella"
      subtitle={I18n.t("wallet.methodDetails.error.subtitle")}
      testID="PaymentsMethodDetailsErrorContent"
      title={I18n.t("wallet.methodDetails.error.title")}
    />
  );
};

export { PaymentsMethodDetailsErrorContent };

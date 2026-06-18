import { ListItemAction } from "@pagopa/io-app-design-system";

import I18n from "i18next";
import { useCgnUnsubscribe } from "../../hooks/useCgnUnsubscribe";

const CgnUnsubscribe = () => {
  const { requestUnsubscription } = useCgnUnsubscribe();
  return (
    <ListItemAction
      accessibilityLabel={I18n.t("bonus.cgn.cta.deactivateBonus")}
      variant="danger"
      label={I18n.t("bonus.cgn.cta.deactivateBonus")}
      testID="service-cgn-deactivate-bonus-button"
      onPress={requestUnsubscription}
      icon="trashcan"
    />
  );
};

export default CgnUnsubscribe;

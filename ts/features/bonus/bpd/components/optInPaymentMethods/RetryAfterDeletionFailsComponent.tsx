import React from "react";
import { SafeAreaView } from "react-native";
import { useDispatch } from "react-redux";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import Error from "../../../../../../img/wallet/errors/generic-error-icon.svg";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import {
  optInPaymentMethodsCompleted,
  optInPaymentMethodsDeletionChoice
} from "../../store/actions/optInPaymentMethods";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";

const RetryAfterDeletionFailsComponent = () => {
  const dispatch = useDispatch();

  return (
    <SafeAreaView
      style={IOStyles.flex}
      testID={"RetryAfterDeletionFailsComponent"}
    >
      <InfoScreenComponent
        image={<Error width={120} height={120} />}
        title={I18n.t(
          "bonus.bpd.optInPaymentMethods.thankYouPage.retryAfterDeletion.title"
        )}
        body={I18n.t(
          "bonus.bpd.optInPaymentMethods.thankYouPage.retryAfterDeletion.body"
        )}
      />
      <FooterWithButtons
        type={"TwoButtonsInlineHalf"}
        leftButton={confirmButtonProps(
          () => dispatch(optInPaymentMethodsDeletionChoice()),
          I18n.t("bonus.bpd.optInPaymentMethods.thankYouPage.cta.retry"),
          undefined,
          "retryButton"
        )}
        rightButton={cancelButtonProps(
          () => dispatch(optInPaymentMethodsCompleted()),
          I18n.t("bonus.bpd.optInPaymentMethods.thankYouPage.cta.goToWallet"),
          undefined,
          "goToWalletButton"
        )}
      />
    </SafeAreaView>
  );
};

export default RetryAfterDeletionFailsComponent;

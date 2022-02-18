import React from "react";
import { useDispatch } from "react-redux";
import { SafeAreaView } from "react-native";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import Completed from "../../../../../../img/pictograms/payment-completed.svg";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { cancelButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { optInPaymentMethodsCompleted } from "../../store/actions/optInPaymentMethods";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";

const ThankYouSuccessComponent = () => {
  const dispatch = useDispatch();
  return (
    <SafeAreaView style={IOStyles.flex} testID={"ThankYouSuccessComponent"}>
      <InfoScreenComponent
        image={<Completed width={80} height={80} />}
        title={I18n.t(
          "bonus.bpd.optInPaymentMethods.thankYouPage.success.title"
        )}
        body={I18n.t("bonus.bpd.optInPaymentMethods.thankYouPage.success.body")}
      />
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={cancelButtonProps(
          () => dispatch(optInPaymentMethodsCompleted()),
          I18n.t("bonus.bpd.optInPaymentMethods.thankYouPage.cta.goToWallet"),
          undefined,
          "goToWalletButton"
        )}
      />
    </SafeAreaView>
  );
};

export default ThankYouSuccessComponent;

import { useNavigation } from "@react-navigation/native";
import React from "react";
import { SafeAreaView } from "react-native";
import Completed from "../../../../../../img/pictograms/payment-completed.svg";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import ROUTES from "../../../../../navigation/routes";
import { useIODispatch } from "../../../../../store/hooks";
import { cancelButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import {
  optInPaymentMethodsCompleted,
  optInPaymentMethodsShowChoice
} from "../../store/actions/optInPaymentMethods";

const ThankYouSuccessComponent = () => {
  const navigation = useNavigation();
  const dispatch = useIODispatch();
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
          () => {
            dispatch(optInPaymentMethodsCompleted());
            dispatch(optInPaymentMethodsShowChoice.success(false));
            navigation.navigate(ROUTES.WALLET_HOME);
          },
          I18n.t("bonus.bpd.optInPaymentMethods.thankYouPage.cta.goToWallet"),
          undefined,
          "goToWalletButton"
        )}
      />
    </SafeAreaView>
  );
};

export default ThankYouSuccessComponent;

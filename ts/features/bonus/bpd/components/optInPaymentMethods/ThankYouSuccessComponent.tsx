import React from "react";
import { useDispatch } from "react-redux";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import Completed from "../../../../../../img/pictograms/payment-completed.svg";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { SafeAreaView } from "react-native";
import { cancelButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { optInPaymentMethodsCompleted } from "../../store/actions/optInPaymentMethods";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";

const ThankYouSuccessComponent = () => {
  const dispatch = useDispatch();
  return (
    <SafeAreaView
      style={IOStyles.flex}
      testID={"OptInPaymentMethodsThankYouDeleteMethodsScreen"}
    >
      <InfoScreenComponent
        image={<Completed width={80} height={80} />}
        title={"Fatto!"}
        body={"Abbiamo salvato la tua scelta."}
      />
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={cancelButtonProps(
          () => dispatch(optInPaymentMethodsCompleted()),
          "Vai al Portafoglio"
        )}
      />
    </SafeAreaView>
  );
};

export default ThankYouSuccessComponent;

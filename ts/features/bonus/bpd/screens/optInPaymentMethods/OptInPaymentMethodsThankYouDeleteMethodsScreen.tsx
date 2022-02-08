import { SafeAreaView } from "react-native";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ThankYouComponent from "../../components/optInPaymentMethods/ThankYouComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { cancelButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { useIOSelector } from "../../../../../store/hooks";
import { deleteAllPaymentMethodsByFunctionSelector } from "../../../../../store/reducers/wallet/wallets";
import { isError } from "../../model/RemoteValue";
import Completed from "../../../../../../img/pictograms/payment-completed.svg";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import { optInPaymentMethodsDeletionChoice } from "../../store/actions/optInPaymentMethods";

const OptInPaymentMethodsThankYouDeleteMethodsScreen = () => {
  const dispatch = useDispatch();
  const deleteAllPaymentMethodsByFunctionStatus = useIOSelector(
    deleteAllPaymentMethodsByFunctionSelector
  );
  useEffect(() => {
    // dispatch saga that delete payment methods and update opt-in field
    dispatch(optInPaymentMethodsDeletionChoice());
  }, [dispatch]);

  // if one of the

  // if the payment methods deletion fails show the retry component
  if (isError(deleteAllPaymentMethodsByFunctionStatus)) {
    return (
      <InfoScreenComponent
        image={<Completed width={80} height={80} />}
        title={"Errore!"}
        body={"Abbiamo salvato la tua scelta."}
      />
    );
  }

  // if the opt-in choice fails complete the workunit and show an error toast to the user

  // both the payment methods deletion and the opt-in update succeed, show the thank you page
  return (
    <SafeAreaView
      style={IOStyles.flex}
      testID={"OptInPaymentMethodsThankYouDeleteMethodsScreen"}
    >
      <ThankYouComponent />
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={cancelButtonProps(() => true, "Test")}
      />
    </SafeAreaView>
  );
};

export default OptInPaymentMethodsThankYouDeleteMethodsScreen;

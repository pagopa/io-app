import { SafeAreaView } from "react-native";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ThankYouComponent from "../../components/optInPaymentMethods/ThankYouComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { cancelButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { useIOSelector } from "../../../../../store/hooks";
import { deleteAllPaymentMethodsByFunctionSelector } from "../../../../../store/reducers/wallet/wallets";
import { isError, isLoading, isUndefined } from "../../model/RemoteValue";
import Completed from "../../../../../../img/pictograms/payment-completed.svg";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import {
  optInPaymentMethodsCompleted,
  optInPaymentMethodsDeletionChoice
} from "../../store/actions/optInPaymentMethods";
import { showToast } from "../../../../../utils/showToast";
import I18n from "../../../../../i18n";
import { optInStatusSelector } from "../../store/reducers/details/activation";
import * as pot from "italia-ts-commons/lib/pot";
import { CitizenOptInStatusEnum } from "../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { RTron } from "../../../../../boot/configureStoreAndPersistor";

const OptInPaymentMethodsThankYouDeleteMethodsScreen = () => {
  const dispatch = useDispatch();
  const deleteAllPaymentMethodsByFunctionStatus = useIOSelector(
    deleteAllPaymentMethodsByFunctionSelector
  );
  const optInStatus = useIOSelector(optInStatusSelector);

  useEffect(() => {
    // dispatch saga that delete payment methods and update opt-in field
    dispatch(optInPaymentMethodsDeletionChoice());
  }, [dispatch]);

  const isOptInStatusLoading = pot.fold(
    optInStatus,
    () => true,
    () => true,
    _ => true,
    _ => false,
    _ => false,
    _ => true,
    _ => true,
    _ => false
  );

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

  // if one between deleteAllPaymentMethodsByFunctionStatus and optInStatus is on loading state show loading component
  if (
    isUndefined(deleteAllPaymentMethodsByFunctionStatus) ||
    isLoading(deleteAllPaymentMethodsByFunctionStatus) ||
    isOptInStatusLoading
  ) {
    return (
      <LoadingErrorComponent
        isLoading={true}
        loadingCaption={"sto loadanod"}
        onRetry={() => true}
      />
    );
  }

  // if the opt-in choice fails complete the workunit and show an error toast to the user
  if (pot.isError(optInStatus)) {
    showToast(I18n.t("msgErrorUpdateApp"));
    dispatch(optInPaymentMethodsCompleted());
    return null;
  }

  // both the payment methods deletion and the opt-in update succeed, show the thank you page
  return (
    <SafeAreaView
      style={IOStyles.flex}
      testID={"OptInPaymentMethodsThankYouDeleteMethodsScreen"}
    >
      <ThankYouComponent />
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

export default OptInPaymentMethodsThankYouDeleteMethodsScreen;

import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import I18n from "../../../../../i18n";
import ROUTES from "../../../../../navigation/routes";
import { useIOSelector } from "../../../../../store/hooks";
import { deleteAllPaymentMethodsByFunctionSelector } from "../../../../../store/reducers/wallet/wallets";
import { showToast } from "../../../../../utils/showToast";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import RetryAfterDeletionFailsComponent from "../../components/optInPaymentMethods/RetryAfterDeletionFailsComponent";
import ThankYouSuccessComponent from "../../components/optInPaymentMethods/ThankYouSuccessComponent";
import {
  isError,
  isLoading,
  isReady,
  isUndefined
} from "../../model/RemoteValue";
import { optInPaymentMethodsDeletionChoice } from "../../store/actions/optInPaymentMethods";
import { optInStatusSelector } from "../../store/reducers/details/activation";

const OptInPaymentMethodsThankYouDeleteMethodsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const deleteAllPaymentMethodsByFunctionStatus = useIOSelector(
    deleteAllPaymentMethodsByFunctionSelector
  );
  const optInStatus = useIOSelector(optInStatusSelector);

  useEffect(() => {
    // dispatch saga that delete payment methods and update opt-in field
    dispatch(optInPaymentMethodsDeletionChoice());
  }, [dispatch]);

  useEffect(() => {
    // if the opt-in choice fails complete the workunit and show an error toast to the user
    if (
      pot.isError(optInStatus) &&
      isReady(deleteAllPaymentMethodsByFunctionStatus)
    ) {
      showToast(I18n.t("bonus.bpd.optInPaymentMethods.thankYouPage.toast"));
      navigation.navigate(ROUTES.WALLET_HOME);
    }
  }, [
    optInStatus,
    deleteAllPaymentMethodsByFunctionStatus,
    dispatch,
    navigation
  ]);

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
    return <RetryAfterDeletionFailsComponent />;
  }

  // if one between deleteAllPaymentMethodsByFunctionStatus and optInStatus is on loading (or undefined) state show loading component
  if (
    isUndefined(deleteAllPaymentMethodsByFunctionStatus) ||
    isLoading(deleteAllPaymentMethodsByFunctionStatus) ||
    isOptInStatusLoading
  ) {
    return (
      <LoadingErrorComponent
        isLoading={true}
        loadingCaption={I18n.t("global.remoteStates.loading")}
        onRetry={() => true}
        testID={"loadingComponent"}
      />
    );
  }

  if (pot.isError(optInStatus)) {
    return null;
  }
  // both the payment methods deletion and the opt-in update succeed, show the thank you page
  return <ThankYouSuccessComponent />;
};

export default OptInPaymentMethodsThankYouDeleteMethodsScreen;

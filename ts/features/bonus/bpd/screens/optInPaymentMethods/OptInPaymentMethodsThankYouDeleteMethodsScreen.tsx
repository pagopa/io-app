import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import * as pot from "italia-ts-commons/lib/pot";
import ThankYouSuccessComponent from "../../components/optInPaymentMethods/ThankYouSuccessComponent";
import { useIOSelector } from "../../../../../store/hooks";
import { deleteAllPaymentMethodsByFunctionSelector } from "../../../../../store/reducers/wallet/wallets";
import { isError, isLoading, isUndefined } from "../../model/RemoteValue";
import {
  optInPaymentMethodsCompleted,
  optInPaymentMethodsDeletionChoice
} from "../../store/actions/optInPaymentMethods";
import { showToast } from "../../../../../utils/showToast";
import I18n from "../../../../../i18n";
import { optInStatusSelector } from "../../store/reducers/details/activation";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import RetryAfterDeletionFailsComponent from "../../components/optInPaymentMethods/RetryAfterDeletionFailsComponent";

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

  // if the opt-in choice fails complete the workunit and show an error toast to the user
  if (pot.isError(optInStatus)) {
    showToast(I18n.t("bonus.bpd.optInPaymentMethods.thankYouPage.toast"));
    dispatch(optInPaymentMethodsCompleted());
    return null;
  }

  // both the payment methods deletion and the opt-in update succeed, show the thank you page
  return <ThankYouSuccessComponent />;
};

export default OptInPaymentMethodsThankYouDeleteMethodsScreen;

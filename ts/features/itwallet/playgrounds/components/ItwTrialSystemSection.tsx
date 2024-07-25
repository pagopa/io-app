import {
  ButtonSolid,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import * as React from "react";
import { SubscriptionStateEnum } from "../../../../../definitions/trial_system/SubscriptionState";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  trialSystemActivationStatus,
  trialSystemActivationStatusReset,
  trialSystemActivationStatusUpsert
} from "../../../trialSystem/store/actions";
import {
  isLoadingTrialStatusSelector,
  isUpdatingTrialStatusSelector,
  trialStatusSelector
} from "../../../trialSystem/store/reducers";
import { itwTrialId } from "../../../../config";

export const ItwTrialSystemSection = () => {
  const dispatch = useIODispatch();
  const status = useIOSelector(trialStatusSelector(itwTrialId));
  const isLoading = useIOSelector(isLoadingTrialStatusSelector(itwTrialId));
  const isUpdating = useIOSelector(isUpdatingTrialStatusSelector(itwTrialId));

  const subscribe = () => {
    dispatch(trialSystemActivationStatusUpsert.request(itwTrialId));
  };

  const refresh = () => {
    dispatch(trialSystemActivationStatus.request(itwTrialId));
  };

  const reset = () => {
    dispatch(trialSystemActivationStatusReset(itwTrialId));
  };

  return (
    <>
      <ListItemHeader label="Trial" />
      <ListItemInfo label="Current status" value={status ?? "Not present"} />
      <VSpacer size={8} />
      <>
        {status === undefined ||
        status === SubscriptionStateEnum.UNSUBSCRIBED ? (
          <ButtonSolid
            loading={isUpdating}
            disabled={isLoading}
            fullWidth={true}
            label={I18n.t("profile.main.trial.titleSection")}
            onPress={subscribe}
          />
        ) : (
          <ButtonSolid
            disabled={isLoading}
            fullWidth={true}
            color="danger"
            label={"Unsubscribe"}
            onPress={constNull}
          />
        )}
      </>
      <VSpacer size={8} />
      <ButtonSolid
        loading={isUpdating}
        disabled={isLoading}
        fullWidth={true}
        label={"Refresh"}
        onPress={refresh}
      />
      <VSpacer size={8} />
      <ButtonSolid
        loading={isUpdating}
        disabled={isLoading}
        fullWidth={true}
        label={"Reset"}
        onPress={reset}
      />
    </>
  );
};

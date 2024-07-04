import {
  ButtonSolid,
  ListItemHeader,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import * as React from "react";
import { SubscriptionStateEnum } from "../../../../../definitions/trial_systwem/SubscriptionState";
import I18n from "../../../../i18n";
import { useTrialSystemStatus } from "../../../trialSystem/hooks/useTrialSystemStatus";
import { ITW_TRIAL_ID } from "../../common/utils/itwTrialUtils";

export const ItwTrialSystemSection = () => {
  const { status, isLoading, isUpdating, subscribe } =
    useTrialSystemStatus(ITW_TRIAL_ID);

  return (
    <>
      <ListItemHeader label="F&F Trial" />
      <ListItemInfo label="Current status" value={status ?? "Not present"} />
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
    </>
  );
};

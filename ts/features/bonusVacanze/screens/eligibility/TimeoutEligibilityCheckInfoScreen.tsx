import * as React from "react";
import I18n from "../../../../i18n";
import { BaseTimeoutScreen } from "../../components/BaseTimeoutScreen";

/**
 * This screen informs that checking eligibility is taking too long and
 * will be notified when the operation is completed.
 * @constructor
 */

export const TimeoutEligibilityCheckInfoScreen: React.FunctionComponent = () => {
  const title = I18n.t("bonus.bonusVacanza.eligibility.timeout.title");
  const body = I18n.t("bonus.bonusVacanza.eligibility.timeout.description");
  return <BaseTimeoutScreen title={title} body={body} />;
};

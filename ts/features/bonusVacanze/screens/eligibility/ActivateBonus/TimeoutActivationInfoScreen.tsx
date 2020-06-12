import * as React from "react";
import I18n from "../../../../../i18n";
import { BaseTimeoutScreen } from "../../../components/BaseTimeoutScreen";

/**
 * This screen informs that the bonus activation is taking too long and
 * will be notified when the operation is completed.
 * @constructor
 */

export const TimeoutActivationInfoScreen: React.FunctionComponent = () => {
  const title = I18n.t("bonus.bonusVacanza.eligibility.activate.timeout.title");
  const body = I18n.t(
    "bonus.bonusVacanza.eligibility.activate.timeout.description"
  );
  return (
    <BaseTimeoutScreen title={title} body={body} onExit={() => undefined} />
  );
};

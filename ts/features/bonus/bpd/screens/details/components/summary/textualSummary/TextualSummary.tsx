import * as React from "react";
import { BpdPeriodWithInfo } from "../../../../../store/reducers/details/periods";
import { ActiveTextualSummary } from "./ActiveTextualSummary";
import { ClosedTextualSummary } from "./ClosedTextualSummary";
import { InactiveTextualSummary } from "./InactiveTextualSummary";

type Props = {
  period: BpdPeriodWithInfo;
  name: string | undefined;
};

/**
 * Render additional text information for the user, related to the transactions and cashback amount
 * Choose the textual infobox based on period and amount values
 * @param props
 * @constructor
 */
export const TextualSummary = (props: Props): React.ReactElement => {
  switch (props.period.status) {
    case "Inactive":
      return <InactiveTextualSummary period={props.period} />;
    case "Closed":
      return <ClosedTextualSummary period={props.period} name={props.name} />;
    case "Active":
      return <ActiveTextualSummary period={props.period} name={props.name} />;
  }
};

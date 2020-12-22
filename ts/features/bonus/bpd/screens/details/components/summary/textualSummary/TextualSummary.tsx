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
 * Choose the textual infobox based on period and amount values
 * @param props
 */
const chooseTextualInfoBox = (props: Props) => {
  switch (props.period.status) {
    case "Inactive":
      return <InactiveTextualSummary period={props.period} />;
    case "Closed":
      return <ClosedTextualSummary period={props.period} name={props.name} />;
    case "Active":
      return <ActiveTextualSummary period={props.period} name={props.name} />;
  }
  return null;
};

/**
 * Render additional text information for the user, related to the transactions and cashback amount
 * @param props
 * @constructor
 */
export const TextualSummary: React.FunctionComponent<Props> = props =>
  chooseTextualInfoBox(props);

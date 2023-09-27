import * as React from "react";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import { WithTestID } from "../../../types/WithTestID";
import ErrorComponent from "./ErrorComponent";

type Props = WithTestID<{
  onPress: () => void;
  title: string;
  subTitle: string;
  email?: EmailString;
  retry?: boolean;
  assistance?: boolean;
}>;

const GenericErrorComponent = (props: Props) => (
  <ErrorComponent
    title={props.title}
    subTitle={props.subTitle}
    pictogram={"umbrella"}
    testID={props.testID}
    onPress={props.onPress}
    retry={props.retry}
    email={props.email}
    assistance={props.assistance}
  />
);

export default GenericErrorComponent;

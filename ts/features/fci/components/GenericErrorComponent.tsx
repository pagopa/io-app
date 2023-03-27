import * as React from "react";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import genericError from "../../../../img/wallet/errors/generic-error-icon.png";
import { WithTestID } from "../../../types/WithTestID";
import ErrorComponent from "./ErrorComponent";

type Props = WithTestID<{
  onPress: () => void;
  title: string;
  subTitle: string;
  email?: EmailString;
  retry?: boolean;
}>;

const GenericErrorComponent = (props: Props) => (
  <ErrorComponent
    title={props.title}
    subTitle={props.subTitle}
    image={genericError}
    testID={props.testID}
    onPress={props.onPress}
    retry={props.retry}
    email={props.email}
  />
);

export default GenericErrorComponent;

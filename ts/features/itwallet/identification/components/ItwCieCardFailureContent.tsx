import { Body } from "@pagopa/io-app-design-system";
import { ItwCieMachineContext } from "../machine/cie/provider";
import { selectFailure } from "../machine/cie/selectors";

export const ItwCieCardFailureContent = () => {
  const failure = ItwCieMachineContext.useSelector(selectFailure);

  return <Body>{JSON.stringify(failure)}</Body>;
};

import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import LoadingScreenContent from "../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { FimsParamsList } from "../navigation";
import {
  fimsGetConsentsListAction,
  fimsGetRedirectUrlAndOpenIABAction
} from "../store/actions";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { fimsConsentsDataSelector } from "../store/reducers";

export type FimsFlowHandlerScreenRouteParams = { ctaUrl: string };

type FimsFlowHandlerScreenRouteProps = IOStackNavigationRouteProps<
  FimsParamsList,
  "FIMS_CONSENTS"
>;

export const FimsFlowHandlerScreen = (
  props: FimsFlowHandlerScreenRouteProps
) => {
  const { ctaUrl } = props.route.params;
  const dispatch = useIODispatch();
  useHeaderSecondLevel({ title: "", supportRequest: true });

  const consents = pot.getOrElse(
    useIOSelector(fimsConsentsDataSelector),
    undefined
  );
  const navigation = useIONavigation();

  React.useEffect(() => {
    if (ctaUrl) {
      dispatch(fimsGetConsentsListAction.request({ ctaUrl }));
    }
  }, [ctaUrl, dispatch]);
  if (consents === undefined) {
    return <LoadingScreenContent contentTitle="loading..." />;
  }
  // TODO:: will be handled somewhere else
  const parsedGrants: Array<string> = JSON.parse(consents.body).grants;
  return (
    <OperationResultScreenContent
      title={`grant ${parsedGrants.join(",")} ?`}
      action={{
        label: "accept",
        onPress: () =>
          dispatch(
            fimsGetRedirectUrlAndOpenIABAction.request({
              acceptUrl: consents.headers["confirm-url"] as string // TODO:: error handle this
            })
          )
      }}
      secondaryAction={{
        label: "deny",
        onPress: () => navigation.goBack() // TODO::: clear store on back nav
      }}
    />
  );
};

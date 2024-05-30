import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as React from "react";
import LoadingScreenContent from "../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
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
import {
  fimsConsentsDataSelector,
  fimsErrorStateSelector
} from "../store/reducers";

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
  const errorState = useIOSelector(fimsErrorStateSelector);

  React.useEffect(() => {
    if (ctaUrl) {
      dispatch(fimsGetConsentsListAction.request({ ctaUrl }));
    }
  }, [ctaUrl, dispatch]);

  return pipe(
    errorState,
    O.fold(
      () => <FimsFlowSuccessBody />,
      err => (
        <OperationResultScreenContent
          pictogram="umbrellaNew"
          title={err.message}
          isHeaderVisible={true}
        />
      )
    )
  );
};

const FimsFlowSuccessBody = () => {
  useHeaderSecondLevel({ title: "", supportRequest: true });

  const dispatch = useIODispatch();

  const consents = pot.getOrElse(
    useIOSelector(fimsConsentsDataSelector),
    undefined
  );
  const navigation = useIONavigation();

  if (consents === undefined) {
    return <LoadingScreenContent contentTitle="loading..." />;
  }

  return (
    <OperationResultScreenContent
      title={`grant ${consents.claims
        .map(item => item.display_name)
        .join(",")} ?`}
      action={{
        label: "accept",
        onPress: () =>
          dispatch(
            fimsGetRedirectUrlAndOpenIABAction.request({
              // eslint-disable-next-line no-underscore-dangle
              acceptUrl: consents._links.confirm.href
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

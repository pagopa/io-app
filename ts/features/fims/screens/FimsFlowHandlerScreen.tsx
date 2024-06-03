import { IOStyles, LabelSmall } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as React from "react";
import { View } from "react-native";
import LoadingScreenContent from "../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import I18n from "../../../i18n";
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
  fimsErrorStateSelector,
  fimsLoadingStateSelector
} from "../store/reducers";
import { ConsentData } from "../types";

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

  React.useEffect(() => {
    if (ctaUrl) {
      dispatch(fimsGetConsentsListAction.request({ ctaUrl }));
    }
  }, [ctaUrl, dispatch]);

  const loadingState = useIOSelector(fimsLoadingStateSelector);
  const consentsPot = useIOSelector(fimsConsentsDataSelector);
  const errorState = useIOSelector(fimsErrorStateSelector);

  if (errorState !== undefined) {
    return <FimsErrorBody title={errorState} />;
  }
  if (loadingState !== undefined) {
    const subtitle =
      loadingState === "in-app-browser" ? (
        <View style={IOStyles.alignCenter}>
          <LabelSmall color="grey-650" weight="Regular">
            {I18n.t("FIMS.loadingScreen.in-app-browser.subtitle")}
          </LabelSmall>
        </View>
      ) : (
        <></>
      );
    const title = I18n.t(`FIMS.loadingScreen.${loadingState}.title`);

    return (
      <LoadingScreenContent contentTitle={title}>
        {subtitle}
      </LoadingScreenContent>
    );
  }

  return pipe(
    consentsPot,
    pot.toOption,
    O.fold(
      () => <FimsErrorBody title="generic error" />,
      consents => <FimsFlowSuccessBody consents={consents} />
    )
  );
};

type FimsErrorBodyProps = { title: string };
const FimsErrorBody = ({ title }: FimsErrorBodyProps) => (
  <OperationResultScreenContent
    pictogram="umbrellaNew"
    title={title}
    isHeaderVisible={true}
  />
);

type FimsSuccessBodyProps = { consents: ConsentData };
const FimsFlowSuccessBody = ({ consents }: FimsSuccessBodyProps) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

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

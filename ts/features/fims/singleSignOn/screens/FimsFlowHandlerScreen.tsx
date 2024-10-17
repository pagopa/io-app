import { Body, IOStyles } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as React from "react";
import { View } from "react-native";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fimsRequiresAppUpdateSelector } from "../../../../store/reducers/backendStatus";
import { trackAuthenticationError } from "../../common/analytics";
import { FimsUpdateAppAlert } from "../../common/components/FimsUpdateAppAlert";
import { FimsParamsList } from "../../common/navigation";
import { FimsSSOFullScreenError } from "../components/FimsFullScreenErrors";
import { FimsFlowSuccessBody } from "../components/FimsSuccessBody";
import {
  fimsCancelOrAbortAction,
  fimsGetConsentsListAction
} from "../store/actions/";
import {
  fimsConsentsDataSelector,
  fimsErrorTagSelector,
  fimsLoadingStateSelector
} from "../store/selectors";

export type FimsFlowHandlerScreenRouteParams = {
  ctaText: string;
  ctaUrl: string;
};

type FimsFlowHandlerScreenRouteProps = IOStackNavigationRouteProps<
  FimsParamsList,
  "FIMS_SSO_CONSENTS"
>;

export const FimsFlowHandlerScreen = (
  props: FimsFlowHandlerScreenRouteProps
) => {
  const { ctaText, ctaUrl } = props.route.params;
  const dispatch = useIODispatch();

  const requiresAppUpdate = useIOSelector(fimsRequiresAppUpdateSelector);
  const loadingState = useIOSelector(fimsLoadingStateSelector);
  const consentsPot = useIOSelector(fimsConsentsDataSelector);
  const errorTag = useIOSelector(fimsErrorTagSelector);

  const handleCancelOrAbort = React.useCallback(() => {
    if (loadingState !== "abort") {
      dispatch(fimsCancelOrAbortAction());
    }
  }, [dispatch, loadingState]);

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    goBack: handleCancelOrAbort
  });

  useHardwareBackButton(() => {
    handleCancelOrAbort();
    return true;
  });

  React.useEffect(() => {
    if (ctaUrl && !requiresAppUpdate) {
      dispatch(fimsGetConsentsListAction.request({ ctaText, ctaUrl }));
    } else if (requiresAppUpdate) {
      trackAuthenticationError(
        undefined,
        undefined,
        undefined,
        undefined,
        "update_required"
      );
    }
  }, [ctaText, ctaUrl, dispatch, requiresAppUpdate]);

  if (requiresAppUpdate) {
    return <FimsUpdateAppAlert />;
  }

  if (errorTag !== undefined) {
    return <FimsSSOFullScreenError errorTag={errorTag} />;
  }
  if (loadingState !== undefined) {
    const subtitle =
      loadingState === "in-app-browser-loading" || loadingState === "abort" ? (
        <View style={IOStyles.alignCenter}>
          <Body color="grey-650">{I18n.t(`FIMS.loadingScreen.subtitle`)}</Body>
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
      () => <FimsSSOFullScreenError errorTag="GENERIC" />,
      consents => (
        <FimsFlowSuccessBody
          consents={consents}
          onAbort={handleCancelOrAbort}
        />
      )
    )
  );
};

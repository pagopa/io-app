import { Body, IOStyles } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { constTrue, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as React from "react";
import { View } from "react-native";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fimsRequiresAppUpdateSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
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
  fimsAuthenticationFailedSelector,
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
  const authenticationFailed = useIOSelector(fimsAuthenticationFailedSelector);

  const handleCancelOrAbort = React.useCallback(() => {
    if (loadingState !== "abort") {
      dispatch(fimsCancelOrAbortAction());
    }
  }, [dispatch, loadingState]);

  const consentsMaybe = pot.toOption(consentsPot);
  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    canGoBack:
      !authenticationFailed &&
      !requiresAppUpdate &&
      (loadingState !== undefined || O.isSome(consentsMaybe)),
    goBack: handleCancelOrAbort
  });

  // Force users on Android to use UI buttons to go back, since
  // there are cases where a modal may be displayed on top of
  // the screen (like the assistance one) and the hardware back
  // button event is not stopped by such screen but is instead
  // propagated to this UI, causing a back loop
  useHardwareBackButton(constTrue);

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

  if (authenticationFailed) {
    return <FimsSSOFullScreenError />;
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
      <LoadingScreenContent headerVisible contentTitle={title}>
        {subtitle}
      </LoadingScreenContent>
    );
  }

  return pipe(
    consentsMaybe,
    O.fold(
      () => <FimsSSOFullScreenError />,
      consents => (
        <FimsFlowSuccessBody
          consents={consents}
          onAbort={handleCancelOrAbort}
        />
      )
    )
  );
};

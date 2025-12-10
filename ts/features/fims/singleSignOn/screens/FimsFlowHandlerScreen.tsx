import { Body } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { constTrue, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import I18n from "i18next";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fimsRequiresAppUpdateSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  trackAuthenticationError,
  trackAuthenticationStart
} from "../../common/analytics";
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
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

export type FimsFlowHandlerScreenRouteParams = {
  /* The label on the button that started the FIMS flow */
  ctaText: string;
  /* The Relying Party's url that starts the FIMS flow,
   * without the iosso:// protocol prefix */
  ctaUrl: string;
  /* A Relying Party is always associated with a service.
   * This is the fiscal code of the service organization */
  organizationFiscalCode: string | undefined;
  /* A Relying Party is always associated with a service.
   * This is the name of the service organization */
  organizationName: string | undefined;
  /* A Relying Party is always associated with a service.
   * This is service id */
  serviceId: ServiceId;
  /* A Relying Party is always associated with a service.
   * This is service name */
  serviceName: string | undefined;
  /* This is the entry point from which the FIMS's flow
   * has been starded (e.g., the screen's route name) */
  source: string;
  /* This indicates if the in-app browser on iOS must
   * share the cookies. If true, a native popup will appear to the user. */
  ephemeralSessionOniOS: boolean;
};

type FimsFlowHandlerScreenRouteProps = IOStackNavigationRouteProps<
  FimsParamsList,
  "FIMS_SSO_CONSENTS"
>;

export const FimsFlowHandlerScreen = (
  props: FimsFlowHandlerScreenRouteProps
) => {
  const {
    ctaText,
    ctaUrl,
    organizationFiscalCode,
    organizationName,
    serviceId,
    serviceName,
    source,
    ephemeralSessionOniOS
  } = props.route.params;
  const dispatch = useIODispatch();

  const requiresAppUpdate = useIOSelector(fimsRequiresAppUpdateSelector);
  const loadingState = useIOSelector(fimsLoadingStateSelector);
  const consentsPot = useIOSelector(fimsConsentsDataSelector);
  const authenticationFailed = useIOSelector(fimsAuthenticationFailedSelector);

  const handleCancelOrAbort = useCallback(() => {
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

  useEffect(() => {
    if (ctaUrl && !requiresAppUpdate) {
      trackAuthenticationStart(
        serviceId,
        serviceName,
        organizationName,
        organizationFiscalCode,
        ctaText,
        source,
        ephemeralSessionOniOS
      );
      dispatch(
        fimsGetConsentsListAction.request({
          ctaText,
          ctaUrl,
          ephemeralSessionOniOS
        })
      );
    } else if (requiresAppUpdate) {
      trackAuthenticationError(
        undefined,
        undefined,
        undefined,
        undefined,
        "update_required"
      );
    }
  }, [
    ctaText,
    ctaUrl,
    dispatch,
    organizationFiscalCode,
    organizationName,
    requiresAppUpdate,
    serviceId,
    serviceName,
    source,
    ephemeralSessionOniOS
  ]);

  if (requiresAppUpdate) {
    return <FimsUpdateAppAlert />;
  }

  if (authenticationFailed) {
    return <FimsSSOFullScreenError />;
  }
  if (loadingState !== undefined) {
    const subtitle =
      loadingState === "in-app-browser-loading" ||
      loadingState === "abort" ||
      loadingState === "idle" ? (
        <View style={{ alignItems: "center" }}>
          {/* TODO: Dark mode: Replace with theme values */}
          <Body color="grey-650">{I18n.t(`FIMS.loadingScreen.subtitle`)}</Body>
        </View>
      ) : (
        <></>
      );
    const title = I18n.t(`FIMS.loadingScreen.${loadingState}.title`);

    return (
      <LoadingScreenContent headerVisible title={title}>
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

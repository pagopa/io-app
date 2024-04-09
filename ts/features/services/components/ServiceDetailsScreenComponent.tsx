import React, { useCallback, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  IOSpacingScale,
  IOVisualCostants,
  buttonSolidHeight
} from "@pagopa/io-app-design-system";
import { useLinkTo } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../store/hooks";
import { CTA, CTAS } from "../../messages/types/MessageCTA";
import { getServiceCTA, handleCtaAction } from "../../messages/utils/messages";
import {
  serviceMetadataByIdSelector,
  serviceMetadataInfoSelector
} from "../store/reducers/servicesById";
import { ServiceDetailsFooterActions } from "./ServiceDetailsFooterActions";
import { ServiceStandardActions } from "./ServiceStandardActions";
import { ServiceSpecialAction } from "./ServiceSpecialAction";

const scrollTriggerOffsetValue: number = 88;
const gradientSafeArea: IOSpacingScale = 16;

const styles = StyleSheet.create({
  scrollContentContainer: {
    flexGrow: 1
  }
});

type StandardActionsProps = {
  props: React.ComponentProps<typeof ServiceStandardActions> | undefined;
  offset: number;
};

type SpecialActionProps = {
  props: React.ComponentProps<typeof ServiceSpecialAction> | undefined;
  offset: number;
};

type ServiceDetailsScreenComponentProps = {
  children: React.ReactNode;
  serviceId: ServiceId;
  activate?: boolean;
  isLoading?: boolean;
  title?: string;
};

export const ServiceDetailsScreenComponent = ({
  children,
  serviceId,
  activate,
  isLoading = false,
  title = ""
}: ServiceDetailsScreenComponentProps) => {
  const linkTo = useLinkTo();

  const safeBottomAreaHeight = useRef(0);
  const safeAreaInsets = useSafeAreaInsets();

  const gradientOpacity = useSharedValue(1);
  const scrollTranslationY = useSharedValue(0);

  const bottomMargin: number = useMemo(
    () =>
      safeAreaInsets.bottom === 0
        ? IOVisualCostants.appMarginDefault
        : safeAreaInsets.bottom,
    [safeAreaInsets]
  );

  useHeaderSecondLevel({
    title,
    supportRequest: true,
    transparent: true,
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    }
  });

  const footerGradientOpacityTransition = useAnimatedStyle(() => ({
    opacity: withTiming(gradientOpacity.value, {
      duration: 200,
      easing: Easing.ease
    })
  }));

  const scrollHandler = useAnimatedScrollHandler(
    ({ contentOffset, layoutMeasurement, contentSize }) => {
      // eslint-disable-next-line functional/immutable-data
      scrollTranslationY.value = contentOffset.y;

      const isEndReached =
        Math.floor(layoutMeasurement.height + contentOffset.y) >=
        Math.floor(contentSize.height);

      // eslint-disable-next-line functional/immutable-data
      gradientOpacity.value = isEndReached ? 0 : 1;
    }
  );

  const serviceMetadata = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );

  const serviceMetadataInfo = useIOSelector(state =>
    serviceMetadataInfoSelector(state, serviceId)
  );

  const maybeServiceCtas = useMemo(
    () => getServiceCTA(serviceMetadata),
    [serviceMetadata]
  );

  const handlePressCta = useCallback(
    (cta: CTA) => handleCtaAction(cta, linkTo, serviceId),
    [linkTo, serviceId]
  );

  const getPropsForStandardActions = useCallback(
    (
      ctas: CTAS,
      isCustomCtaVisible: boolean = false
    ): StandardActionsProps | undefined => {
      if (isCustomCtaVisible && ctas.cta_1 && ctas.cta_2) {
        const { cta_1, cta_2 } = ctas;

        return {
          offset: buttonSolidHeight * 2,
          props: {
            type: "TwoCtasWithCustomFlow",
            primaryActionProps: {
              label: cta_1.text,
              accessibilityLabel: cta_1.text,
              onPress: () => handlePressCta(cta_1)
            },
            secondaryActionProps: {
              label: cta_2.text,
              accessibilityLabel: cta_2.text,
              onPress: () => handlePressCta(cta_2)
            }
          }
        };
      }

      if (isCustomCtaVisible && ctas.cta_1) {
        const { cta_1 } = ctas;

        return {
          offset: buttonSolidHeight,
          props: {
            type: "SingleCtaWithCustomFlow",
            primaryActionProps: {
              label: cta_1.text,
              accessibilityLabel: cta_1.text,
              onPress: () => handlePressCta(cta_1)
            }
          }
        };
      }

      if (ctas.cta_1 && ctas.cta_2) {
        const { cta_1, cta_2 } = ctas;

        return {
          offset: buttonSolidHeight * 2,
          props: {
            type: "TwoCtas",
            primaryActionProps: {
              label: cta_1.text,
              accessibilityLabel: cta_1.text,
              onPress: () => handlePressCta(cta_1)
            },
            secondaryActionProps: {
              label: cta_2.text,
              accessibilityLabel: cta_2.text,
              onPress: () => handlePressCta(cta_2)
            }
          }
        };
      }

      if (ctas.cta_1) {
        return {
          offset: buttonSolidHeight,
          props: {
            type: "SingleCta",
            primaryActionProps: {
              label: ctas.cta_1.text,
              accessibilityLabel: ctas.cta_1.text,
              onPress: () => handlePressCta(ctas.cta_1)
            }
          }
        };
      }

      return undefined;
    },
    [handlePressCta]
  );

  const footerComponent = () => {
    const standardActions = pipe(
      maybeServiceCtas,
      O.chain(ctas =>
        pipe(
          getPropsForStandardActions(
            ctas,
            serviceMetadataInfo?.isSpecialService
          ),
          O.fromNullable
        )
      ),
      O.getOrElse<StandardActionsProps>(() => ({
        offset: 0,
        props: undefined
      }))
    );

    const specialAction = pipe(
      serviceMetadataInfo?.isSpecialService,
      O.fromNullable,
      O.map(() => ({
        offset: buttonSolidHeight,
        props: {
          serviceId,
          customSpecialFlowOpt: serviceMetadataInfo?.customSpecialFlow,
          activate
        }
      })),
      O.getOrElse<SpecialActionProps>(() => ({
        offset: 0,
        props: undefined
      }))
    );

    // eslint-disable-next-line functional/immutable-data
    safeBottomAreaHeight.current =
      standardActions.offset + specialAction.offset + gradientSafeArea;

    return (
      <ServiceDetailsFooterActions
        dimensions={{
          bottomMargin,
          safeBottomAreaHeight: safeBottomAreaHeight.current
        }}
        specialActionProps={specialAction.props}
        standardActionsProps={standardActions.props}
        transitionAnimStyle={footerGradientOpacityTransition}
      />
    );
  };

  return (
    <>
      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContentContainer,
          {
            paddingBottom: bottomMargin + safeBottomAreaHeight.current
          }
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        snapToOffsets={[0, scrollTriggerOffsetValue]}
        snapToEnd={false}
        decelerationRate="normal"
      >
        {children}
      </Animated.ScrollView>
      {!isLoading && footerComponent()}
    </>
  );
};

import {
  ButtonSolidProps,
  FooterActions,
  HeaderSecondLevel,
  useFooterActionsMeasurements
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Fragment, ReactNode, useLayoutEffect } from "react";
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useOfflineToastGuard } from "../../../../../hooks/useOfflineToastGuard.ts";
import { useStartSupportRequest } from "../../../../../hooks/useStartSupportRequest.ts";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useItwFeaturesEnabled } from "../../../common/hooks/useItwFeaturesEnabled.ts";
import { useNotAvailableToastGuard } from "../../../common/hooks/useNotAvailableToastGuard.ts";
import { getHeaderPropsByCredentialType } from "../../../common/utils/itwStyleUtils.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";

export type CredentialCtaProps = Omit<ButtonSolidProps, "fullWidth">;

export type ItwPresentationDetailsScreenBaseProps = {
  credential: StoredCredential;
  children?: ReactNode;
  ctaProps?: CredentialCtaProps;
};

const scrollTriggerOffsetValue: number = 88;

const ItwPresentationDetailsScreenBase = ({
  credential,
  children,
  ctaProps
}: ItwPresentationDetailsScreenBaseProps) => {
  const navigation = useIONavigation();
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const itwFeaturesEnabled = useItwFeaturesEnabled(credential);

  const scrollTranslationY = useSharedValue(0);
  const startSupportRequest = useOfflineToastGuard(useStartSupportRequest({}));
  const onIconPress = useNotAvailableToastGuard(startSupportRequest);

  const { footerActionsMeasurements, handleFooterActionsMeasurements } =
    useFooterActionsMeasurements();

  const headerProps = getHeaderPropsByCredentialType(
    credential.credentialType,
    itwFeaturesEnabled
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          {...headerProps}
          enableDiscreteTransition
          animatedRef={animatedScrollViewRef}
          type="singleAction"
          goBack={navigation.goBack}
          backAccessibilityLabel={I18n.t("global.buttons.back")}
          firstAction={{
            icon: "help",
            onPress: onIconPress,
            accessibilityLabel: I18n.t(
              "global.accessibility.contextualHelp.open.label"
            )
          }}
        />
      ),
      headerShown: true
    });
  }, [
    animatedScrollViewRef,
    headerProps,
    itwFeaturesEnabled,
    navigation,
    onIconPress,
    startSupportRequest
  ]);

  const scrollHandler = useAnimatedScrollHandler(({ contentOffset }) => {
    // eslint-disable-next-line functional/immutable-data
    scrollTranslationY.value = contentOffset.y;
  });

  return (
    <Fragment>
      <Animated.ScrollView
        ref={animatedScrollViewRef}
        contentContainerStyle={{
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight || 24
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={8}
        snapToOffsets={[0, scrollTriggerOffsetValue]}
        snapToEnd={false}
        decelerationRate="normal"
      >
        {children}
      </Animated.ScrollView>
      {ctaProps && (
        <FooterActions
          onMeasure={handleFooterActionsMeasurements}
          actions={{
            type: "SingleButton",
            primary: ctaProps
          }}
        />
      )}
    </Fragment>
  );
};

export { ItwPresentationDetailsScreenBase };

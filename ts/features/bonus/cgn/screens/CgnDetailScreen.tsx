import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View } from "react-native";
import { connect } from "react-redux";
import {
  GradientBottomActions,
  IOSpacer,
  IOSpacingScale,
  IOToast,
  IOVisualCostants,
  VSpacer,
  IOStyles,
  Alert,
  buttonSolidHeight
} from "@pagopa/io-app-design-system";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedScrollHandler
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusEnum } from "../../../../../definitions/cgn/CardActivated";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import GenericErrorComponent from "../../../../components/screens/GenericErrorComponent";
import SectionStatusComponent from "../../../../components/SectionStatus";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import I18n from "../../../../i18n";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { Dispatch } from "../../../../store/actions/types";
import {
  cgnMerchantVersionSelector,
  isCGNEnabledSelector
} from "../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import { useActionOnFocus } from "../../../../utils/hooks/useOnFocus";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { ID_CGN_TYPE } from "../../common/utils";
import { isLoading } from "../../../../common/model/RemoteValue";
import CgnCardComponent from "../components/detail/CgnCardComponent";
import CgnOwnershipInformation from "../components/detail/CgnOwnershipInformation";
import CgnStatusDetail from "../components/detail/CgnStatusDetail";
import CgnUnsubscribe from "../components/detail/CgnUnsubscribe";
import EycaDetailComponent from "../components/detail/eyca/EycaDetailComponent";
import {
  navigateToCgnMerchantsList,
  navigateToCgnMerchantsTabs
} from "../navigation/actions";
import { CgnDetailsParamsList } from "../navigation/params";
import CGN_ROUTES from "../navigation/routes";
import { cgnDetails } from "../store/actions/details";
import { cgnEycaStatus } from "../store/actions/eyca/details";
import { cgnUnsubscribe } from "../store/actions/unsubscribe";
import {
  cgnDetailSelector,
  cgnDetailsInformationSelector,
  isCgnDetailsLoading
} from "../store/reducers/details";
import { eycaDetailSelector } from "../store/reducers/eyca/details";
import { cgnUnsubscribeSelector } from "../store/reducers/unsubscribe";
import { canEycaCardBeShown } from "../utils/eyca";
import { availableBonusTypesSelectorFromId } from "../../common/store/selectors";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { openWebUrl } from "../../../../utils/url";
import { EYCA_WEBSITE_DISCOUNTS_PAGE_URL } from "../utils/constants";
import { CardRevoked } from "../../../../../definitions/cgn/CardRevoked";
import { CardExpired } from "../../../../../definitions/cgn/CardExpired";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const HEADER_BACKGROUND_COLOR = "#8F84B7";
const scrollTriggerOffsetValue: number = 88;

const gradientSafeArea: IOSpacingScale = 80;
const contentEndMargin: IOSpacingScale = 32;
const spaceBetweenActions: IOSpacer = 24;

/**
 * Screen to display all the information about the active CGN
 */
const CgnDetailScreen = (props: Props): React.ReactElement => {
  const [cardLoading, setCardLoading] = useState(true);
  const navigation =
    useNavigation<IOStackNavigationProp<CgnDetailsParamsList, "CGN_DETAILS">>();
  const safeAreaInsets = useSafeAreaInsets();

  const gradientOpacity = useSharedValue(1);
  const scrollTranslationY = useSharedValue(0);

  const bottomMargin: number = React.useMemo(
    () =>
      safeAreaInsets.bottom === 0
        ? IOVisualCostants.appMarginDefault
        : safeAreaInsets.bottom,
    [safeAreaInsets]
  );

  const safeBottomAreaHeight: number = React.useMemo(
    () => bottomMargin + buttonSolidHeight + contentEndMargin,
    [bottomMargin]
  );

  const gradientAreaHeight: number = React.useMemo(
    () => bottomMargin + buttonSolidHeight + gradientSafeArea,
    [bottomMargin]
  );

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

  useHeaderSecondLevel({
    title: I18n.t("bonus.cgn.name"),
    goBack: navigation.goBack,
    transparent: true,
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    },
    supportRequest: true
  });

  const loadCGN = () => {
    props.loadCgnDetails();
    props.loadEycaDetails();
  };

  useActionOnFocus(loadCGN);

  const onCardLoadEnd = () => setCardLoading(false);

  useHardwareBackButton(() => {
    navigation.goBack();
    return true;
  });

  // to display EYCA info component the CGN initiative needs to be enabled by remote
  const canDisplayEycaDetails =
    canEycaCardBeShown(props.eycaDetails) && props.isCgnEnabled;

  const onPressShowCgnDiscounts = () => {
    if (props.isMerchantV2Enabled) {
      props.navigateToMerchantsTabs();
    } else {
      navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.CATEGORIES);
    }
  };

  return (
    <LoadingSpinnerOverlay
      isLoading={
        props.isCgnInfoLoading ||
        (props.cgnDetails && cardLoading) ||
        isLoading(props.unsubscriptionStatus)
      }
    >
      <FocusAwareStatusBar
        backgroundColor={HEADER_BACKGROUND_COLOR}
        barStyle={"light-content"}
      />
      {pot.isError(props.potCgnDetails) ? ( // subText is a blank space to avoid default value when it is undefined
        <GenericErrorComponent
          subText={" "}
          onRetry={loadCGN}
          onCancel={navigation.goBack}
        />
      ) : (
        <>
          <Animated.ScrollView
            contentContainerStyle={{
              paddingBottom: safeBottomAreaHeight
            }}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            snapToOffsets={[0, scrollTriggerOffsetValue]}
            snapToEnd={false}
            decelerationRate="normal"
          >
            <View
              style={{ height: 260, backgroundColor: HEADER_BACKGROUND_COLOR }}
            />
            {props.cgnDetails && (
              <>
                <VSpacer size={48} />
                <VSpacer size={40} />
                <CgnCardComponent
                  cgnDetails={props.cgnDetails}
                  onCardLoadEnd={onCardLoadEnd}
                />
              </>
            )}
            <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
              {CardRevoked.is(props.cgnDetails) && (
                <Alert
                  variant="error"
                  content={props.cgnDetails.revocation_reason}
                />
              )}
              {CardExpired.is(props.cgnDetails) && (
                <Alert
                  variant="error"
                  content={props.cgnDetails.expiration_date.toUTCString()}
                />
              )}
              {/* Ownership block rendering owner's fiscal code */}
              <CgnOwnershipInformation />
              <VSpacer size={16} />
              {props.cgnDetails && (
                // Renders status information including activation and expiring date and a badge that represents the CGN status
                // ACTIVATED - EXPIRED - REVOKED
                <CgnStatusDetail cgnDetail={props.cgnDetails} />
              )}
              {canDisplayEycaDetails && <EycaDetailComponent />}
              <VSpacer size={24} />
              <CgnUnsubscribe />
              <VSpacer size={40} />
            </View>
          </Animated.ScrollView>
          <SectionStatusComponent sectionKey={"cgn"} />
          {props.isCgnEnabled &&
            props.cgnDetails?.status === StatusEnum.ACTIVATED && (
              <GradientBottomActions
                primaryActionProps={{
                  label: I18n.t("bonus.cgn.detail.cta.buyers"),
                  accessibilityLabel: I18n.t("bonus.cgn.detail.cta.buyers"),
                  onPress: onPressShowCgnDiscounts
                }}
                secondaryActionProps={
                  canDisplayEycaDetails
                    ? {
                        label: I18n.t(
                          "bonus.cgn.detail.cta.eyca.showEycaDiscounts"
                        ),
                        accessibilityLabel: I18n.t(
                          "bonus.cgn.detail.cta.eyca.showEycaDiscounts"
                        ),
                        onPress: () =>
                          openWebUrl(EYCA_WEBSITE_DISCOUNTS_PAGE_URL, () =>
                            IOToast.error(I18n.t("bonus.cgn.generic.linkError"))
                          )
                      }
                    : undefined
                }
                transitionAnimStyle={footerGradientOpacityTransition}
                dimensions={{
                  bottomMargin,
                  extraBottomMargin: 0,
                  gradientAreaHeight,
                  spaceBetweenActions,
                  safeBackgroundHeight: bottomMargin
                }}
              />
            )}
        </>
      )}
    </LoadingSpinnerOverlay>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  potCgnDetails: cgnDetailSelector(state),
  cgnDetails: cgnDetailsInformationSelector(state),
  isCgnEnabled: isCGNEnabledSelector(state),
  isCgnInfoLoading: isCgnDetailsLoading(state),
  isMerchantV2Enabled: cgnMerchantVersionSelector(state),
  cgnBonusInfo: availableBonusTypesSelectorFromId(ID_CGN_TYPE)(state),
  eycaDetails: eycaDetailSelector(state),
  unsubscriptionStatus: cgnUnsubscribeSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  unsubscribe: () => dispatch(cgnUnsubscribe.request()),
  loadEycaDetails: () => dispatch(cgnEycaStatus.request()),
  loadCgnDetails: () => dispatch(cgnDetails.request()),
  navigateToMerchantsList: () => navigateToCgnMerchantsList(),
  navigateToMerchantsTabs: () => navigateToCgnMerchantsTabs()
});

export default connect(mapStateToProps, mapDispatchToProps)(CgnDetailScreen);

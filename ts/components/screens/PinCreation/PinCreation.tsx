/* eslint-disable functional/immutable-data */
import {
  ButtonLink,
  ButtonOutline,
  ContentWrapper,
  IOStyles,
  NumberPad,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import React, { useCallback, useRef, useState } from "react";
import { View, Alert as NativeAlert } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { defaultPin } from "../../../config";
import { isValidPinNumber } from "../../../features/fastLogin/utils/pinPolicy";
import I18n from "../../../i18n";
import {
  trackPinError,
  trackPinScreen
} from "../../../screens/profile/analytics";
import { useIOSelector } from "../../../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../../../store/reducers/profile";
import { PinString } from "../../../types/PinString";
import { getFlowType } from "../../../utils/analytics";
import { isDevEnv } from "../../../utils/environment";
import { useCreatePin } from "../../../hooks/useCreatePin";
import { Carousel } from "../../Carousel";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useOnboardingAbortAlert } from "../../../utils/hooks/useOnboardingAbortAlert";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { ContextualHelpPropsMarkdown } from "../BaseScreenComponent";
import { PIN_LENGTH_SIX } from "../../../utils/constants";
import usePinValidationBottomSheet from "./usePinValidationBottomSheet";
import { PinCaouselItemProps, PinCarouselItem } from "./PinCarouselItem";

const CREATION_INDEX = 0;
const CONFIRMATION_INDEX = 1;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.unlockCode.contextualHelpTitle",
  body: "onboarding.unlockCode.contextualHelpContent"
};

export type Props = {
  isOnboarding?: boolean;
};

type PinMode = "creation" | "confirmation";
/**
 * The Pin Creation component is used in both the onboarding
 * process and the profile settings.
 *
 * This component will allow the user to create a new pin or change the existing one.
 */
export const PinCreation = ({ isOnboarding = false }: Props) => {
  const navigation = useIONavigation();
  const [pin, setPin] = useState("");
  const [pinConfirmation, setPinConfirmation] = useState("");
  const pinModeRef = useRef<PinMode>("creation");
  const { handleSubmit } = useCreatePin({ isOnboarding });
  const pinRef = useRef<string | null>(null);
  const carouselRef = useRef<FlatList>(null);
  const titleCreationRef = useRef<View>(null);
  const titleConfirmationRef = useRef<View>(null);
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const { present, bottomSheet } = usePinValidationBottomSheet();
  const { showAlert } = useOnboardingAbortAlert();

  useOnFirstRender(() => {
    trackPinScreen(getFlowType(isOnboarding, isFirstOnBoarding));
  });

  const scrollToCreation = useCallback(() => {
    setPin("");

    pinModeRef.current = "creation";
    carouselRef.current?.scrollToIndex({
      animated: true,
      index: CREATION_INDEX
    });
    setAccessibilityFocus(titleCreationRef, 1000 as Millisecond);
  }, []);
  const scrollToConfirmation = useCallback(() => {
    setPinConfirmation("");
    pinModeRef.current = "confirmation";
    carouselRef.current?.scrollToIndex({
      animated: true,
      index: CONFIRMATION_INDEX
    });
    setAccessibilityFocus(titleConfirmationRef, 1000 as Millisecond);
  }, []);

  const goBack = useCallback(() => {
    if (pinModeRef.current === "confirmation") {
      /**
       * Scrolls back to pin creation section
       */
      scrollToCreation();
    } else if (isOnboarding) {
      showAlert();
    } else {
      navigation.goBack();
    }
  }, [navigation, isOnboarding, showAlert, scrollToCreation]);

  const getCurrentSetState = useCallback(
    (updateValue: (prev: string) => string) =>
      pinModeRef.current === "creation"
        ? setPin(updateValue)
        : setPinConfirmation(updateValue),
    []
  );

  const handlePinChange = useCallback(
    (value: number) =>
      getCurrentSetState((prev: string) =>
        prev.length < PIN_LENGTH_SIX ? `${prev}${value}` : prev
      ),
    [getCurrentSetState]
  );

  const onDeletePress = useCallback(
    () => getCurrentSetState((prev: string) => prev.slice(0, -1)),
    [getCurrentSetState]
  );

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    contextualHelpMarkdown,
    goBack
  });

  const insertValidPin = useCallback(() => {
    if (pinModeRef.current === "creation") {
      setPin(defaultPin);
    } else {
      setPinConfirmation(defaultPin);
    }
  }, []);

  const handlePinCreation = useCallback(
    (v: string) => {
      const isValid = isValidPinNumber(v);

      if (isValid) {
        /**
         * pinRef is used to avoid having to pass pin as a dependency of useCallback around `handlePinConfirmation`.
         */

        pinRef.current = v;
        scrollToConfirmation();
      } else {
        trackPinError("creation", getFlowType(isOnboarding, isFirstOnBoarding));

        NativeAlert.alert(
          I18n.t("onboarding.pin.errors.invalid.title"),
          I18n.t("onboarding.pin.errors.invalid.description"),
          [
            {
              text: I18n.t("onboarding.pin.errors.invalid.cta")
            }
          ]
        );
      }

      return isValid;
    },
    [isFirstOnBoarding, isOnboarding, scrollToConfirmation]
  );

  const handlePinConfirmation = useCallback(
    (v: string) => {
      const isValid = v === pinRef.current;

      if (isValid) {
        handleSubmit(v as PinString);
      } else {
        trackPinError("confirm", getFlowType(isOnboarding, isFirstOnBoarding));
        NativeAlert.alert(
          I18n.t("onboarding.pinConfirmation.errors.match.title"),
          undefined,
          [
            {
              text: I18n.t("onboarding.pinConfirmation.errors.match.cta"),
              onPress: scrollToCreation
            }
          ]
        );
      }

      return isValid;
    },
    [isFirstOnBoarding, isOnboarding, handleSubmit, scrollToCreation]
  );

  const data: Array<PinCaouselItemProps> = [
    {
      title: I18n.t("onboarding.pin.title"),
      titleRef: titleCreationRef,
      description: I18n.t("onboarding.pin.subTitle"),
      value: pin,
      testID: "create-pin-carousel-item",
      handleOnValidate: handlePinCreation,
      onValueChange: setPin,
      maxLength: PIN_LENGTH_SIX
    },
    {
      title: I18n.t("onboarding.pinConfirmation.title"),
      titleRef: titleConfirmationRef,
      value: pinConfirmation,
      testID: "confirm-pin-carousel-item",
      handleOnValidate: handlePinConfirmation,
      onValueChange: setPinConfirmation,
      maxLength: PIN_LENGTH_SIX
    }
  ];

  return (
    <View testID="pin-creation-screen" style={IOStyles.flex}>
      <View style={[IOStyles.flex, IOStyles.centerJustified]}>
        <VSpacer size={8} />
        <View style={IOStyles.alignCenter}>
          <Pictogram name="key" size={64} />
        </View>
        <VSpacer size={8} />
        <Carousel
          ref={carouselRef}
          testID="pin-creation-carousel"
          style={{ flexGrow: 0 }}
          data={data}
          Component={PinCarouselItem}
          scrollEnabled={false}
        />
        <VSpacer size={40} />
        <ContentWrapper>
          <NumberPad
            onNumberPress={handlePinChange}
            onDeletePress={onDeletePress}
            variant="light"
            deleteAccessibilityLabel={I18n.t("global.buttons.delete")}
          />
          <VSpacer />
          <View style={{ alignSelf: "center" }}>
            <ButtonLink
              onPress={present}
              label={I18n.t("onboarding.pin.policy.title")}
            />
          </View>
          {bottomSheet}
        </ContentWrapper>
      </View>
      {isDevEnv && (
        <View style={{ alignSelf: "center" }}>
          <ButtonOutline
            label={`Enter Pin: ${defaultPin} (DevEnv Only)`}
            accessibilityLabel=""
            onPress={insertValidPin}
          />
        </View>
      )}
    </View>
  );
};

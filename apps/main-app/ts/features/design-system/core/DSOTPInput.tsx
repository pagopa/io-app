import {
  Body,
  ContentWrapper,
  H4,
  H5,
  HStack,
  IconButton,
  IOButton,
  IOVisualCostants,
  OTPInput,
  OTPInputAccessibilityValueText,
  RadioGroup,
  RadioItem,
  useIOTheme,
  VStack
} from "@io-app/design-system";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { RefObject, useCallback, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import { useScreenEndMargin } from "../../../hooks/useScreenEndMargin";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";

const OTP_LENGTH_8 = 8;
const OTP_COMPARE_8 = "12345678";
const OTP_LENGTH_6 = 6;
const OTP_COMPARE_6 = "123456";

type OtpID = typeof OTP_LENGTH_6 | typeof OTP_LENGTH_8;

type WrapperProps = {
  autoFocus?: boolean;
  otpCompare: string;
  otpLength: number;
  secret?: boolean;
  validation?: boolean;
};

const radioButtons: ReadonlyArray<RadioItem<OtpID>> = [
  {
    id: OTP_LENGTH_8,
    value: `OTP length ${OTP_LENGTH_8}`
  },
  {
    id: OTP_LENGTH_6,
    value: `OTP length ${OTP_LENGTH_6}`
  }
];

const otpConfigMap: Record<
  OtpID,
  Pick<WrapperProps, "otpCompare" | "otpLength">
> = {
  [OTP_LENGTH_8]: {
    otpLength: OTP_LENGTH_8,
    otpCompare: OTP_COMPARE_8
  },
  [OTP_LENGTH_6]: {
    otpLength: OTP_LENGTH_6,
    otpCompare: OTP_COMPARE_6
  }
};

const OTPWrapper = ({
  secret = false,
  validation = false,
  autoFocus = false,
  otpLength,
  otpCompare
}: WrapperProps) => {
  const [value, setValue] = useState("");
  const onValueChange = useCallback(
    (v: string) => {
      if (v.length <= otpLength) {
        setValue(v);
      }
    },
    [otpLength]
  );

  const onValidate = useCallback(
    (v: string) => !validation || v === otpCompare,
    [validation, otpCompare]
  );

  const secretAccessibilityValueText: OTPInputAccessibilityValueText = ({
    valueLength,
    length
  }) => `${valueLength} of ${length} digits entered`;

  return useMemo(
    () => (
      <VStack space={16}>
        <OTPInput
          accessibilityLabel={"OTP Input"}
          length={otpLength}
          onValueChange={onValueChange}
          value={value}
          {...(secret === true
            ? {
                secret: true as const,
                accessibilityValueText: secretAccessibilityValueText
              }
            : {
                accessibilityValueText: secretAccessibilityValueText
              })}
          autoFocus={autoFocus}
          errorMessage={"Wrong OTP"}
          onValidate={onValidate}
        />
        <IOButton
          label={"Pulisci valore"}
          onPress={() => setValue("")}
          variant="solid"
        />
      </VStack>
    ),
    [value, onValueChange, secret, onValidate, autoFocus, otpLength]
  );
};

const scrollVerticallyToView = (
  scrollViewRef: RefObject<null | ScrollView>,
  targetViewRef: RefObject<null | View>
) => {
  if (targetViewRef.current && scrollViewRef.current) {
    targetViewRef.current.measureLayout(
      scrollViewRef.current.getInnerViewNode(),
      (_: number, y: number, __: number) => {
        scrollViewRef.current?.scrollTo({ y, animated: true });
      }
    );
  }
};

/**
 * This Screen is used to test components in isolation while developing.
 * @returns a screen with a flexed view where you can test components
 */
export const DSOTPInput = () => {
  const theme = useIOTheme();
  const [selectedItem, setSelectedItem] = useState(radioButtons[0].id);

  const { present, dismiss, bottomSheet } = useIOBottomSheetModal({
    title: "OTP settings",
    component: (
      <RadioGroup<OtpID>
        items={radioButtons}
        onPress={setSelectedItem}
        selectedItem={selectedItem}
        type="radioListItem"
      />
    )
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const autofocusableOTPViewRef = useRef<View>(null);
  const [showAutofocusableOTP, setShowAutofocusableOTP] = useState(false);
  const headerHeight = useHeaderHeight();

  const { screenEndMargin } = useScreenEndMargin();

  const sectionTitleMargin = 16;
  const blockMargin = 40;

  useFocusEffect(
    // eslint-disable-next-line arrow-body-style
    useCallback(() => {
      return () => {
        // Dismiss bottom-sheet when navigating out of this screen
        dismiss();
      };
    }, [dismiss])
  );

  const otpConfig = otpConfigMap[selectedItem];

  return (
    <View style={{ flexGrow: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.select({
          ios: "padding",
          android: undefined
        })}
        contentContainerStyle={{
          flex: 1,
          paddingBottom: 100 + screenEndMargin
        }}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView ref={scrollViewRef}>
          <ContentWrapper>
            <HStack
              style={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <H4
                color={theme["textHeading-default"]}
                style={{ marginVertical: IOVisualCostants.appMarginDefault }}
              >
                OTP Input with length of {otpConfig.otpLength}
              </H4>
              <IconButton
                accessibilityLabel="open settings"
                color="neutral"
                icon="coggle"
                onPress={present}
              />
            </HStack>

            <VStack space={blockMargin}>
              <VStack space={sectionTitleMargin}>
                <H5 color={theme["textHeading-default"]}>Default</H5>
                <OTPWrapper {...otpConfig} />
              </VStack>

              <VStack space={sectionTitleMargin}>
                <H5 color={theme["textHeading-default"]}>Secret</H5>
                <OTPWrapper secret {...otpConfig} />
              </VStack>

              <VStack space={sectionTitleMargin}>
                <View>
                  <H5 color={theme["textHeading-default"]}>
                    {"Validation + Secret"}
                  </H5>
                  <Body>Correct OTP {otpConfig.otpCompare}</Body>
                </View>
                <OTPWrapper secret validation {...otpConfig} />
              </VStack>
              <VStack space={sectionTitleMargin}>
                <H5 color={theme["textHeading-default"]}>Autofocus</H5>
                <IOButton
                  label={`${
                    showAutofocusableOTP ? "Hide" : "Show"
                  } Autofocusable OTP`}
                  onPress={() => {
                    setShowAutofocusableOTP(!showAutofocusableOTP);
                    setTimeout(() => {
                      scrollVerticallyToView(
                        scrollViewRef,
                        autofocusableOTPViewRef
                      );
                    }, 100);
                  }}
                  variant={showAutofocusableOTP ? "solid" : "outline"}
                />
                {showAutofocusableOTP && (
                  <View ref={autofocusableOTPViewRef}>
                    <OTPWrapper autoFocus {...otpConfig} />
                  </View>
                )}
              </VStack>
            </VStack>
          </ContentWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
      {bottomSheet}
    </View>
  );
};

import {
  Body,
  ContentWrapper,
  H4,
  H5,
  IOButton,
  IOVisualCostants,
  OTPInput,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useHeaderHeight } from "@react-navigation/elements";

import { RefObject, useCallback, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useScreenEndMargin } from "../../../hooks/useScreenEndMargin";

const OTP_LENGTH = 8;
const OTP_COMPARE = "12345678";

type WrapperProps = {
  secret?: boolean;
  validation?: boolean;
  autoFocus?: boolean;
};

const OTPWrapper = ({
  secret = false,
  validation = false,
  autoFocus = false
}: WrapperProps) => {
  const [value, setValue] = useState("");
  const onValueChange = useCallback((v: string) => {
    if (v.length <= OTP_LENGTH) {
      setValue(v);
    }
  }, []);

  const onValidate = useCallback(
    (v: string) => !validation || v === OTP_COMPARE,
    [validation]
  );

  return useMemo(
    () => (
      <VStack space={16}>
        <OTPInput
          value={value}
          accessibilityLabel={"OTP Input"}
          onValueChange={onValueChange}
          length={OTP_LENGTH}
          secret={secret}
          onValidate={onValidate}
          errorMessage={"Wrong OTP"}
          autoFocus={autoFocus}
        />
        <IOButton
          variant="solid"
          onPress={() => setValue("")}
          label={"Pulisci valore"}
        />
      </VStack>
    ),
    [value, onValueChange, secret, onValidate, autoFocus]
  );
};

const scrollVerticallyToView = (
  scrollViewRef: RefObject<ScrollView | null>,
  targetViewRef: RefObject<View | null>
) => {
  if (targetViewRef.current && scrollViewRef.current) {
    targetViewRef.current.measureLayout(
      scrollViewRef.current.getInnerViewNode(),
      (_: number, y: number, __: number) => {
        scrollViewRef.current?.scrollTo({ y, animated: true });
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );
  }
};

/**
 * This Screen is used to test components in isolation while developing.
 * @returns a screen with a flexed view where you can test components
 */
export const DSOTPInput = () => {
  const theme = useIOTheme();

  const scrollViewRef = useRef<ScrollView>(null);
  const autofocusableOTPViewRef = useRef<View>(null);
  const [showAutofocusableOTP, setShowAutofocusableOTP] = useState(false);
  const headerHeight = useHeaderHeight();

  const { screenEndMargin } = useScreenEndMargin();

  const sectionTitleMargin = 16;
  const blockMargin = 40;

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
            <H4
              color={theme["textHeading-default"]}
              style={{ marginVertical: IOVisualCostants.appMarginDefault }}
            >
              OTP Input
            </H4>

            <VStack space={blockMargin}>
              <VStack space={sectionTitleMargin}>
                <H5 color={theme["textHeading-default"]}>Default</H5>
                <OTPWrapper />
              </VStack>

              <VStack space={sectionTitleMargin}>
                <H5 color={theme["textHeading-default"]}>Secret</H5>
                <OTPWrapper secret />
              </VStack>

              <VStack space={sectionTitleMargin}>
                <View>
                  <H5 color={theme["textHeading-default"]}>
                    {"Validation + Secret"}
                  </H5>
                  <Body>Correct OTP {`${OTP_COMPARE}`}</Body>
                </View>
                <OTPWrapper secret validation />
              </VStack>

              <VStack space={sectionTitleMargin}>
                <H5 color={theme["textHeading-default"]}>Autofocus</H5>
                <IOButton
                  variant={showAutofocusableOTP ? "solid" : "outline"}
                  onPress={() => {
                    setShowAutofocusableOTP(!showAutofocusableOTP);
                    setTimeout(() => {
                      scrollVerticallyToView(
                        scrollViewRef,
                        autofocusableOTPViewRef
                      );
                    }, 100);
                  }}
                  label={`${
                    showAutofocusableOTP ? "Hide" : "Show"
                  } Autofocusable OTP`}
                />
                {showAutofocusableOTP && (
                  <View ref={autofocusableOTPViewRef}>
                    <OTPWrapper autoFocus />
                  </View>
                )}
              </VStack>
            </VStack>
          </ContentWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

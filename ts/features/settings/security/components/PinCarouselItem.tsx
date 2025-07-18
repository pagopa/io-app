import {
  Body,
  CodeInput,
  ContentWrapper,
  H4,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import { RefObject, memo } from "react";
import { useWindowDimensions, View } from "react-native";
import { useDetectSmallScreen } from "../../../../hooks/useDetectSmallScreen";

export type PinCaouselItemProps = WithTestID<{
  title: string;
  titleRef?: RefObject<View | null>;
  description?: string;
  value: string;
  maxLength: number;
  handleOnValidate: (val: string) => boolean;
  onValueChange: (val: string) => void;
}>;

export const PinCarouselItem = memo(
  ({
    title,
    description,
    value,
    testID,
    titleRef,
    maxLength,
    handleOnValidate,
    onValueChange
  }: PinCaouselItemProps) => {
    const { isDeviceScreenSmall } = useDetectSmallScreen();
    const { width: screenWidth } = useWindowDimensions();

    return (
      <ContentWrapper
        style={{
          width: screenWidth,
          justifyContent: "space-between",
          alignItems: "center",
          flexGrow: 1
        }}
        testID={testID}
      >
        <H4
          ref={titleRef}
          accessible
          testID={`${testID}_title`}
          style={{ textAlign: "center" }}
        >
          {title}
        </H4>
        {description && (
          <Body
            accessible
            testID={`${testID}_description`}
            style={{ textAlign: "center" }}
          >
            {description}
          </Body>
        )}

        {/* Decrease the margin when the device screen is smaller.
            The best way should be refactoring the entire screen using flex logic */}
        {isDeviceScreenSmall ? <VSpacer size={16} /> : <VSpacer size={32} />}

        <CodeInput
          length={maxLength}
          onValidate={handleOnValidate}
          onValueChange={onValueChange}
          variant="neutral"
          value={value}
        />
      </ContentWrapper>
    );
  }
);

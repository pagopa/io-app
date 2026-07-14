import {
  Body,
  CodeInput,
  ContentWrapper,
  H4,
  VSpacer,
  WithTestID
} from "@io-app/design-system";
import { memo, RefObject } from "react";
import { useWindowDimensions, View } from "react-native";

import { useDetectSmallScreen } from "../../../../hooks/useDetectSmallScreen";

export type PinCaouselItemProps = WithTestID<{
  description?: string;
  handleOnValidate: (val: string) => boolean;
  maxLength: number;
  onValueChange: (val: string) => void;
  title: string;
  titleRef?: RefObject<null | View>;
  value: string;
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
          accessible
          ref={titleRef}
          style={{ textAlign: "center" }}
          testID={`${testID}_title`}
        >
          {title}
        </H4>
        {description && (
          <Body
            accessible
            style={{ textAlign: "center" }}
            testID={`${testID}_description`}
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
          value={value}
          variant="neutral"
        />
      </ContentWrapper>
    );
  }
);

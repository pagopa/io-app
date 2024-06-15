import {
  IOStyles,
  H4,
  VSpacer,
  CodeInput,
  Body,
  WithTestID
} from "@pagopa/io-app-design-system";
import React, { RefObject, memo } from "react";
import { Dimensions, View } from "react-native";

const { width } = Dimensions.get("screen");

export type PinCaouselItemProps = WithTestID<{
  title: string;
  titleRef?: RefObject<View>;
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
  }: PinCaouselItemProps) => (
    <View
      style={[
        IOStyles.horizontalContentPadding,
        IOStyles.alignCenter,
        {
          height: 128,
          justifyContent: "space-between",
          width
        }
      ]}
      testID={testID}
    >
      <View>
        <H4 ref={titleRef} accessible testID={`${testID}_title`}>
          {title}
        </H4>
      </View>
      {description && (
        <Body
          accessible
          testID={`${testID}_description`}
          style={{ textAlign: "center" }}
        >
          {description}
        </Body>
      )}
      <VSpacer size={32} />
      <CodeInput
        length={maxLength}
        onValidate={handleOnValidate}
        onValueChange={onValueChange}
        variant="dark"
        value={value}
      />
    </View>
  )
);

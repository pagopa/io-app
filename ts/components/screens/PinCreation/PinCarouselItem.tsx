import {
  IOStyles,
  H4,
  VSpacer,
  CodeInput,
  Body
} from "@pagopa/io-app-design-system";
import React, { memo } from "react";
import { Dimensions, View } from "react-native";
import { PIN_LENGTH_SIX } from "../../../utils/constants";

const { width } = Dimensions.get("screen");

export type PinCaouselItemProps = {
  title: string;
  description?: string;
  value: string;
  handleOnValidate: (val: string) => boolean;
  onValueChange: (val: string) => void;
};

export const PinCarouselItem = memo(
  ({
    title,
    description,
    value,
    handleOnValidate,
    onValueChange
  }: PinCaouselItemProps) => (
    <View
      style={[
        IOStyles.horizontalContentPadding,
        IOStyles.alignCenter,
        {
          height: 120,
          justifyContent: "space-between",
          width
        }
      ]}
    >
      <View>
        <H4 accessible testID="pin-creation-form-title">
          {title}
        </H4>
      </View>
      {description && (
        <Body style={{ textAlign: "center" }}>{description}</Body>
      )}
      <VSpacer size={32} />
      <CodeInput
        length={PIN_LENGTH_SIX}
        onValidate={handleOnValidate}
        onValueChange={onValueChange}
        variant="dark"
        value={value}
      />
    </View>
  )
);

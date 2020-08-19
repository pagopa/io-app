/***
 * A default function used to calculate the weight and color for a class of typography, in order to support
 * the default values if some fields are not specified.
 * @param defaultWeight the default weight value to use if weight is not defined
 * @param defaultColor the default color value to use if color is not defined
 * @param weight the optional weight value
 * @param color the optzional color value
 */
import React, { useMemo } from "react";
import { RequiredAll } from "../../../types/utils";
import { IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { BaseTypography, BaseTypographyProps } from "./BaseTypography";

export function calculateWeightColor<WeightPropsType, ColorsPropsType>(
  defaultWeight: WeightPropsType,
  defaultColor: ColorsPropsType,
  weight?: WeightPropsType,
  color?: ColorsPropsType
): RequiredTypographyProps<WeightPropsType, ColorsPropsType> {
  const newWeight = weight !== undefined ? weight : defaultWeight;
  const newColor = color !== undefined ? color : defaultColor;
  return {
    weight: newWeight,
    color: newColor
  };
}

export type TypographyProps<WeightPropsType, ColorsPropsType> = {
  weight?: WeightPropsType;
  color?: ColorsPropsType;
};

export type RequiredTypographyProps<
  WeightPropsType,
  ColorsPropsType
> = RequiredAll<TypographyProps<WeightPropsType, ColorsPropsType>>;

type FactoryProps<WeightPropsType, ColorsPropsType> = TypographyProps<
  WeightPropsType,
  ColorsPropsType
> & {
  defaultWeight: WeightPropsType;
  defaultColor: ColorsPropsType;
} & Omit<BaseTypographyProps, "weight" | "color">;

export function typographyFactory<
  WeightPropsType extends IOFontWeight,
  ColorsPropsType extends IOColorType
>(props: FactoryProps<WeightPropsType, ColorsPropsType>) {
  const { weight, color } = useMemo(
    () =>
      calculateWeightColor<WeightPropsType, ColorsPropsType>(
        props.defaultWeight,
        props.defaultColor,
        props.weight,
        props.color
      ),
    [props.weight, props.color]
  );

  return <BaseTypography weight={weight} color={color} {...props} />;
}

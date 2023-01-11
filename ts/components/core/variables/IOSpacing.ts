/*
Generic spacing scale.
Every margin/padding used by different components 
should use a value defined in the following array.
*/

export const IOSpacingScale = [
  4, 8, 12, 16, 20, 24, 28, 36, 40, 48, 56, 64, 72
] as const;

type IOSpacingScaleType = typeof IOSpacingScale[number];

type IOSpacerValuesType = Record<string, IOSpacingScaleType>;

/*
Values used in the new `<Spacer>` component
*/
export const IOSpacer: IOSpacerValuesType = {
  xsm: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xlg: 40
};

export type IOSpacerType = keyof typeof IOSpacer;

/*
SPACING SCALE
Every margin/padding used by different components 
should use a value defined in the following scale.
*/

export const IOSpacingScale = [
  4, 8, 12, 16, 20, 24, 28, 36, 40, 48, 56, 64, 72
] as const;

type IOSpacingScale = typeof IOSpacingScale[number];

// Values used in the new `<Spacer>` component
export type IOSpacer = Extract<IOSpacingScale, 4 | 8 | 16 | 24 | 40>;
export const IOSpacer: ReadonlyArray<IOSpacer> = [4, 8, 16, 24, 40] as const;
// Values used in the `<Alert>` component
export type IOAlertSpacing = Extract<IOSpacingScale, 16 | 24>;
export const IOAlertSpacing: ReadonlyArray<IOAlertSpacing> = [16, 24] as const;

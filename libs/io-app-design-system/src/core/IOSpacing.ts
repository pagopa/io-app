/*
SPACING SCALE
Every margin/padding used by different components 
should use a value defined in the following scale.
*/

export const IOSpacingScale = [
  4, 6, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 96
] as const;
export type IOSpacingScale = (typeof IOSpacingScale)[number];

// Values used in the new `<Spacer>` and `<Stack>` components
export const IOSpacer = [
  4, 8, 12, 16, 24, 32, 40, 48
] as const satisfies ReadonlyArray<IOSpacingScale>;
export type IOSpacer = (typeof IOSpacer)[number];

// Margin values used in the new `<ContentWrapper>` component
export const IOAppMargin = [
  8, 16, 24, 32, 48
] as const satisfies ReadonlyArray<IOSpacingScale>;
export type IOAppMargin = (typeof IOAppMargin)[number];

// Values used in the `<Alert>` component
export const IOAlertSpacing = [
  16, 24
] as const satisfies ReadonlyArray<IOSpacingScale>;
export type IOAlertSpacing = (typeof IOAlertSpacing)[number];

// Values used in the `<Banner>` component
export type IOBannerSpacing = Extract<IOSpacingScale, 12 | 16>;
export const IOBannerBigSpacing: IOBannerSpacing = 16;

// Values used in the `<Tag>` component
export type IOTagSpacing = Extract<IOSpacingScale, 6 | 8>;
export const IOTagHSpacing: IOTagSpacing = 8;
export const IOTagVSpacing: IOTagSpacing = 6;

// Values used in the `<Badge>` component
export type IOBadgeSpacing = Extract<IOSpacingScale, 4 | 8>;
export const IOBadgeHSpacing: IOBadgeSpacing = 8;
export const IOBadgeVSpacing: IOBadgeSpacing = 4;

// Values used in the `<ModuleIDP>` component
export type IOModuleIDPSpacing = Extract<IOSpacingScale, 8 | 16 | 24>;
export const IOModuleIDPHSpacing: IOModuleIDPSpacing = 16;
export const IOModuleIDPVSpacing: IOModuleIDPSpacing = 16;
export const IOModuleIDPSavedVSpacing: IOModuleIDPSpacing = 24;
export const IOListItemLogoMargin: IOModuleIDPSpacing = 8;

/*
░░░ SPACING CONSTANTS ░░░
*/

const spacingConstantKeys = ["screenEndMargin"] as const;

export type IOSpacingConstants = {
  [K in (typeof spacingConstantKeys)[number]]: IOSpacingScale;
};

export const IOSpacing = {
  screenEndMargin: 32
} as const satisfies IOSpacingConstants;

/*
SPACING SCALE
Every margin/padding used by different components 
should use a value defined in the following scale.
*/

export const IOSpacingScale = [
  4, 6, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80
] as const;

export type IOSpacingScale = typeof IOSpacingScale[number];

// Values used in the new `<Spacer>` component
export type IOSpacer = Extract<IOSpacingScale, 4 | 8 | 16 | 24 | 32 | 40 | 48>;
export const IOSpacer: ReadonlyArray<IOSpacer> = [
  4, 8, 16, 24, 32, 40, 48
] as const;

// Margin values used in the new `<ContentWrapper>` component
export type IOAppMargin = Extract<IOSpacingScale, 8 | 16 | 24 | 32>;
export const IOAppMargin: ReadonlyArray<IOAppMargin> = [8, 16, 24, 32] as const;

// Values used in the `<Alert>` component
export type IOAlertSpacing = Extract<IOSpacingScale, 16 | 24>;
export const IOAlertSpacing: ReadonlyArray<IOAlertSpacing> = [16, 24] as const;

// Values used in the `<Banner>` component
export type IOBannerSpacing = Extract<IOSpacingScale, 12 | 16>;
export const IOBannerBigSpacing: IOBannerSpacing = 16 as const;
export const IOBannerSmallHSpacing: IOBannerSpacing = 16 as const;
export const IOBannerSmallVSpacing: IOBannerSpacing = 12 as const;

// Values used in the `<Tag>` component
export type IOTagSpacing = Extract<IOSpacingScale, 6 | 8>;
export const IOTagHSpacing: IOTagSpacing = 8 as const;
export const IOTagVSpacing: IOTagSpacing = 6 as const;

// Values used in the `<Badge>` component
export type IOBadgeSpacing = Extract<IOSpacingScale, 4 | 8>;
export const IOBadgeHSpacing: IOBadgeSpacing = 8 as const;
export const IOBadgeVSpacing: IOBadgeSpacing = 4 as const;

// Values used in the `<ListItemIDP>` component
export type IOListItemIDPSpacing = Extract<IOSpacingScale, 8 | 16 | 24>;
export const IOListItemIDPHSpacing: IOListItemIDPSpacing = 16 as const;
export const IOListItemIDPVSpacing: IOListItemIDPSpacing = 16 as const;
export const IOListItemIDPSavedVSpacing: IOListItemIDPSpacing = 24 as const;
export const IOListItemLogoMargin: IOListItemIDPSpacing = 8 as const;

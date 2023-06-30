/*
RADIUS SCALE
Every shape used by different components 
should use a value defined in the following scale.
*/

export const IORadiusScale = [8, 16, 24] as const;
type IORadiusScale = typeof IORadiusScale[number];

const IODefaultRadius: IORadiusScale = 8;

/*
Values used in the various components
*/
export const IOAlertRadius: IORadiusScale = IODefaultRadius;
export const IOBannerRadius: IORadiusScale = IODefaultRadius;
export const IOBottomSheetHeaderRadius: IORadiusScale = 24;
export const IOBadgeRadius: IORadiusScale = 24;

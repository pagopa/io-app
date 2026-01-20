import { ActionType, createStandardAction } from "typesafe-actions";
import { ItwBannerId } from "../reducers/banners";

export const itwCloseBanner =
  createStandardAction("ITW_CLOSE_BANNER")<ItwBannerId>();

export const itwShowBanner =
  createStandardAction("ITW_SHOW_BANNER")<ItwBannerId>();

export type ItwBannersActions =
  | ActionType<typeof itwCloseBanner>
  | ActionType<typeof itwShowBanner>;

import { PaymentsNoticeCartItemDetailsScreenParams } from "../screens/NoticeCartItemDetailsScreen";
import { NoticeDetailsScreenParams } from "../screens/NoticeDetailsScreen";
import { PaymentsNoticeRoutes } from "./routes";

export type PaymentsNoticeParamsList = {
  [PaymentsNoticeRoutes.PAYMENT_NOTICE_NAVIGATOR]: undefined;
  [PaymentsNoticeRoutes.PAYMENT_NOTICE_DETAILS]: NoticeDetailsScreenParams;
  [PaymentsNoticeRoutes.PAYMENT_NOTICE_CART_ITEM_DETAILS]: PaymentsNoticeCartItemDetailsScreenParams;
  [PaymentsNoticeRoutes.PAYMENT_NOTICE_LIST_SCREEN]: undefined;
  [PaymentsNoticeRoutes.PAYMENT_NOTICE_PREVIEW_SCREEN]: undefined;
  [PaymentsNoticeRoutes.PAYMENT_NOTICE_LOADING_SCREEN]: undefined;
};

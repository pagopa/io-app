import SHOWROOM_ROUTES from "./routes";

type DesignSystemRoute = {
  route: string;
  title: string;
};

export type ShowroomParamsList = {
  [SHOWROOM_ROUTES.MAIN]: undefined;
  [SHOWROOM_ROUTES.FOUNDATION.COLOR.route]: DesignSystemRoute;
  [SHOWROOM_ROUTES.FOUNDATION.TYPOGRAPHY.route]: DesignSystemRoute;
  [SHOWROOM_ROUTES.FOUNDATION.ICONS.route]: DesignSystemRoute;
  [SHOWROOM_ROUTES.FOUNDATION.PICTOGRAMS.route]: DesignSystemRoute;
  [SHOWROOM_ROUTES.FOUNDATION.LOGOS.route]: DesignSystemRoute;
  [SHOWROOM_ROUTES.COMPONENTS.BUTTONS.route]: DesignSystemRoute;
  [SHOWROOM_ROUTES.COMPONENTS.SELECTION.route]: DesignSystemRoute;
  [SHOWROOM_ROUTES.COMPONENTS.ADVICE.route]: DesignSystemRoute;
  [SHOWROOM_ROUTES.COMPONENTS.ACCORDION.route]: DesignSystemRoute;
  [SHOWROOM_ROUTES.COMPONENTS.TEXT_FIELDS.route]: DesignSystemRoute;
  [SHOWROOM_ROUTES.COMPONENTS.LIST_ITEMS.route]: DesignSystemRoute;
  [SHOWROOM_ROUTES.COMPONENTS.TOASTS.route]: DesignSystemRoute;
  [SHOWROOM_ROUTES.LEGACY.PICTOGRAMS.route]: DesignSystemRoute;
  [SHOWROOM_ROUTES.LEGACY.ILLUSTRATIONS.route]: DesignSystemRoute;
};

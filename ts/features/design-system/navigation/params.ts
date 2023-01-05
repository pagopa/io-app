import DESIGN_SYSTEM_ROUTES from "./routes";

type DesignSystemRoute = {
  route: string;
  title: string;
};

export type DesignSystemParamsList = {
  [DESIGN_SYSTEM_ROUTES.MAIN]: undefined;
  [DESIGN_SYSTEM_ROUTES.FOUNDATION.COLOR.route]: DesignSystemRoute;
  [DESIGN_SYSTEM_ROUTES.FOUNDATION.TYPOGRAPHY.route]: DesignSystemRoute;
  [DESIGN_SYSTEM_ROUTES.FOUNDATION.ICONS.route]: DesignSystemRoute;
  [DESIGN_SYSTEM_ROUTES.FOUNDATION.PICTOGRAMS.route]: DesignSystemRoute;
  [DESIGN_SYSTEM_ROUTES.FOUNDATION.LOGOS.route]: DesignSystemRoute;
  [DESIGN_SYSTEM_ROUTES.COMPONENTS.BUTTONS.route]: DesignSystemRoute;
  [DESIGN_SYSTEM_ROUTES.COMPONENTS.SELECTION.route]: DesignSystemRoute;
  [DESIGN_SYSTEM_ROUTES.COMPONENTS.ADVICE.route]: DesignSystemRoute;
  [DESIGN_SYSTEM_ROUTES.COMPONENTS.ACCORDION.route]: DesignSystemRoute;
  [DESIGN_SYSTEM_ROUTES.COMPONENTS.TEXT_FIELDS.route]: DesignSystemRoute;
  [DESIGN_SYSTEM_ROUTES.COMPONENTS.LIST_ITEMS.route]: DesignSystemRoute;
  [DESIGN_SYSTEM_ROUTES.COMPONENTS.TOASTS.route]: DesignSystemRoute;
  [DESIGN_SYSTEM_ROUTES.LEGACY.PICTOGRAMS.route]: DesignSystemRoute;
  [DESIGN_SYSTEM_ROUTES.LEGACY.ILLUSTRATIONS.route]: DesignSystemRoute;
};

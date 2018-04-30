declare module "native-base-shoutem-theme" {
  export interface IConnectStyleOptions {
    withRef?: boolean;
  }

  export type MapPropsToStyleNames = (
    styleNames: string[],
    props: {}
  ) => string[];

  export function connectStyle(
    componentStyleName: string,
    componentStyle = {},
    mapPropsToStyleNames: MapPropsToStyleNames,
    options?: IConnectStyleOptions
  );
}

declare module "native-base/src/Utils/mapPropsToStyleNames" {
  export default function(styleNames: string[], props: {}): string[];
}

declare module "native-base/src/theme/components" {
  type Variables = {};
  type Theme = {};
  export default function(variables: Variables): Theme;
}

declare module "native-base/src/theme/variables/material" {
  export default {};
}

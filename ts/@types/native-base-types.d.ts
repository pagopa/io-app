/**
 * Declare some types for native-base related modules.
 * Note: these declarations are quite incomplete, right now we just have
 * types that make the build pass.
 */

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

declare module "native-base/src/utils/mapPropsToStyleNames" {
  export default function(styleNames: string[], props: {}): string[];
}

declare module "native-base/src/theme/components" {
  type Variables = any;
  type Theme = any;
  export default function(variables: Variables): Theme;
}

declare module "native-base/src/theme/variables/material" {
  export default {
    borderWidth: number,
    inputBorderColor: string
  };
}

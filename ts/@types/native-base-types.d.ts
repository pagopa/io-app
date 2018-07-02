/**
 * Declare some types for native-base related modules.
 * Note: these declarations are quite incomplete, right now we just have
 * types that make the build pass.
 */

declare module "native-base-shoutem-theme" {
  import * as React from "react";

  export interface IConnectStyleOptions {
    withRef?: boolean;
  }

  export type MapPropsToStyleNames<P> = (
    styleNames: string[],
    props: P
  ) => ReadonlyArray<string>;

  export function connectStyle<P, E = {}>(
    componentStyleName: string,
    componentStyle = {},
    mapPropsToStyleNames: MapPropsToStyleNames<P>,
    options?: IConnectStyleOptions
  ): <S>(c: React.ComponentClass<P, S>) => React.ComponentClass<P & E, S>;
}

declare module "native-base/src/utils/mapPropsToStyleNames" {
  export default function<P>(
    styleNames: ReadonlyArray<string>,
    props: P
  ): ReadonlyArray<string>;
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

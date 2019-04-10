/**
 * Declare some types for native-base related modules.
 * Note: these declarations are quite incomplete, right now we just have
 * types that make the build pass.
 */

// TODO: Add proper Props typing
declare module "native-base" {
  export class DefaultTabBar extends React.Component<any, any> {}
}

declare module "native-base-shoutem-theme" {
  export interface IConnectStyleOptions {
    withRef?: boolean;
  }

  export type MapPropsToStyleNames = <P>(
    styleNames: string[],
    props: P
  ) => ReadonlyArray<string>;

  /**
   * The connectStyle function does not use forwardRef.
   * To get a ref to the wrapped component you have to use _root.
   *
   * RT = _root Type
   */
  export function connectStyle<RT = {}>(
    componentStyleName: string,
    componentStyle = {},
    mapPropsToStyleNames: MapPropsToStyleNames,
    options?: IConnectStyleOptions
  ): <C, O = C>(c: C) => O & { _root: RT };
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
    btnDisabledBg: number,
    borderWidth: number,
    inputBorderColor: string,

    // input
    inputFontSize: number,
    inputColor: string,
    inputHeightBase: number
  };
}

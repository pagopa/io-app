/**
 * See {@link https://github.com/greatbsky/react-native-pull }
 * This module exposes 3 component to implements scrollable view with a custom pull-to-refresh animation,
 * it's possible create a custom refresh-control with a view instead the default progress-indicator.
 *
 * 1 - PullView: the parent is a ScrollView
 * 2 - PullList: create a custom ListView
 * 3 - PullSectionList: create a custom SectionList (added by a patch)
 *
 *
 */
// eslint-disable-next-line max-classes-per-file
declare module "react-native-pull" {
  import * as React from "react";
  import {
    ListViewProps,
    ScrollViewProps,
    SectionListProps
  } from "react-native";

  export type PullProps = {
    topIndicatorRender: () => void;
    topIndicatorHeight: number;
    onPulling?: () => void;
    onPullOk?: () => void;
    onPullRelease?: () => void;
    isPullEnd?: () => void;
    sectionsLength?: number;
    loadMoreData?: () => void;
  };

  export class PullView extends React.Component<PullProps & ScrollViewProps> {}
  export class PullList extends React.Component<PullProps & ListViewProps> {}
  export class PullSectionList<IT> extends React.Component<
    PullProps & SectionListProps<IT>
  > {}
}

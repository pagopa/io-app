/**
 * See {@link https://github.com/greatbsky/react-native-pull}
 * This module exposes 3 component to implements scrollable view with a custom pull-to-refresh animation,
 * it's possible create a custom refresh-control with a view instead the default progress-indicator.
 * 
 * 1 - PullView: the parent is a ScrollView
 * 2 - PullList: create a custom ListView
 * 3 - PullSectionList: create a custom SectionList (added by a patch)
 * 
 * 
 */
declare module "react-native-pull" {
    export type Props = Readonly<{
        topIndicatorRender: () => void;
        topIndicatorHeight: number;
        onPulling?: () => void;
        onPullOk?: () => void;
        onPullRelease?: () => void;
        isPullEnd?: () => void;
        sectionsLength?: number;
        loadMoreData?: () => void;
    }>;
    
    export class PullView extends React.Component<Props & ScrollView.Props> {}
    export class PullList extends React.Component<Props & ListView.Props> {}
    export class PullSectionList extends React.Component<Props & SectionList.Props> {}
}

declare module "react-native-sectioned-multi-select" {
    export type Props = Readonly<{
        items?: ReadonlyArray<any>;
        uniqueKey: string;
        subKey?: string;
        selectText?: string;
        showDropDowns?: boolean;
        readOnlyHeadings?: boolean;
        onSelectedItemsChange: (selectedItems: ReadonlyArray<any>) => void;
        selectedItems?: ReadonlyArray<any>;
        hideConfirm?: boolean;
        stickyFooterComponent?: (() => object) | object;
    }>;

    export default class SectionedMultiSelect extends React.PureComponent<Props> {
        _cancelSelection: () => void;
        _submitSelection: () => void;
    }
}

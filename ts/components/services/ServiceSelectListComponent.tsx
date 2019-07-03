import I18n from "i18n-js";
import { View } from "native-base";
import * as React from "react";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import FooterWithButtons from "../ui/FooterWithButtons";

const items: ReadonlyArray<any> = [
  // this is the parent or 'item'
  {
    name: "Fruits",
    id: 0,
    // these are the children or 'sub items'
    children: [
      {
        name: "Apple",
        id: 10
      },
      {
        name: "Strawberry",
        id: 17
      },
      {
        name: "Pineapple",
        id: 13
      },
      {
        name: "Banana",
        id: 14
      },
      {
        name: "Watermelon",
        id: 15
      },
      {
        name: "Kiwi fruit",
        id: 16
      },
      {
        name: "Apple",
        id: 20
      },
      {
        name: "Strawberry",
        id: 21
      },
      {
        name: "Pineapple",
        id: 22
      },
      {
        name: "Banana",
        id: 23
      },
      {
        name: "Watermelon",
        id: 24
      },
      {
        name: "Kiwi fruit",
        id: 25
      },
      {
        name: "Apple",
        id: 26
      },
      {
        name: "Strawberry",
        id: 27
      },
      {
        name: "Pineapple",
        id: 28
      },
      {
        name: "Banana",
        id: 29
      },
      {
        name: "Watermelon",
        id: 30
      },
      {
        name: "Kiwi fruit",
        id: 31
      }
    ]
  },
  {
    name: "Fruits 2",
    id: 1,
    // these are the children or 'sub items'
    children: [
      {
        name: "Passion Fruit",
        id: 40
      }
    ]
  }
];

type Props = {
  test?: string;
};

type State = {
  selectedItems: ReadonlyArray<any>;
};

export class ServiceSelectListComponent extends React.PureComponent<
  Props,
  State
> {
  private sectionedMultiSelect = React.createRef<SectionedMultiSelect>();

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedItems: []
    };
  }
  public onSelectedItemsChange = (selectedItems: ReadonlyArray<any>) => {
    this.setState({ selectedItems });
  };

  private onPressCancel = () => {
    if (this.sectionedMultiSelect.current !== null) {
      this.sectionedMultiSelect.current._cancelSelection();
    }
  };

  private onPressSave = () => {
    if (this.sectionedMultiSelect.current !== null) {
      this.sectionedMultiSelect.current._submitSelection();
    }
  };

  private footerButtons() {
    const cancelButtonProps = {
      block: true,
      light: true,
      onPress: this.onPressCancel,
      title: I18n.t("global.buttons.cancel")
    };
    const saveButtonProps = {
      block: true,
      primary: true,
      onPress: this.onPressSave,
      title: I18n.t("global.buttons.saveSelection")
    };

    return (
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        leftButton={cancelButtonProps}
        rightButton={saveButtonProps}
      />
    );
  }

  public render() {
    return (
      <View>
        <SectionedMultiSelect
          ref={this.sectionedMultiSelect}
          items={items}
          uniqueKey="id"
          subKey="children"
          selectText="Choose some things..."
          showDropDowns={false}
          readOnlyHeadings={true}
          onSelectedItemsChange={this.onSelectedItemsChange}
          selectedItems={this.state.selectedItems}
          hideConfirm={true}
          stickyFooterComponent={this.footerButtons()}
        />
      </View>
    );
  }
}

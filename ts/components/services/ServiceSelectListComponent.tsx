import I18n from "i18n-js";
import { View } from "native-base";
import * as React from "react";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import FooterWithButtons from "../ui/FooterWithButtons";

const items: ReadonlyArray<any> = [
  // this is the parent or 'item'
  {
    name: "Categoria 1",
    id: 0,
    // these are the children or 'sub items'
    children: [
      {
        name: "Servizio 1",
        id: 1
      },
      {
        name: "Servizio 2",
        id: 2
      },
      {
        name: "Servizio 3",
        id: 3
      },
      {
        name: "Servizio 4",
        id: 4
      },
      {
        name: "Servizio 5",
        id: 5
      },
      {
        name: "Servizio 6",
        id: 6
      },
      {
        name: "Servizio 7",
        id: 7
      },
      {
        name: "Servizio 8",
        id: 8
      },
      {
        name: "Servizio 9",
        id: 9
      },
      {
        name: "Servizio 10",
        id: 10
      },
      {
        name: "Servizio 11",
        id: 11
      },
      {
        name: "Servizio 12",
        id: 12
      },
      {
        name: "Servizio 13",
        id: 13
      },
      {
        name: "Servizio 14",
        id: 14
      },
      {
        name: "Servizio 15",
        id: 15
      },
      {
        name: "Servizio 16",
        id: 16
      },
      {
        name: "Servizio 17",
        id: 17
      },
      {
        name: "Servizio 18",
        id: 18
      }
    ]
  },
  {
    name: "Categoria 2",
    id: 1,
    // these are the children or 'sub items'
    children: [
      {
        name: "Servizio 19",
        id: 19
      },
      {
        name: "Servizio 20",
        id: 20
      },
      {
        name: "Servizio 21",
        id: 21
      },
      {
        name: "Servizio 22",
        id: 22
      }
    ]
  }
];

type Props = {
  services?: ReadonlyArray<any>;
};

type State = {
  selectedItems: ReadonlyArray<any>;
};

export class ServiceSelectListComponent extends React.PureComponent<
  Props,
  State
> {
  private sectionedMultiSelect: any;

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
    if (this.sectionedMultiSelect !== null) {
      this.sectionedMultiSelect._cancelSelection();
    }
  };

  private onPressSave = () => {
    if (this.sectionedMultiSelect !== null) {
      this.sectionedMultiSelect._submitSelection();
    }
  };

  private footerButtons() {
    const cancelButtonProps = {
      block: true,
      light: true,
      bordered: true,
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
          // tslint:disable-next-line: no-object-mutation
          ref={component => (this.sectionedMultiSelect = component)}
          items={items}
          uniqueKey="id"
          subKey="children"
          selectText="Aggiungi le tue aree di interesse"
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

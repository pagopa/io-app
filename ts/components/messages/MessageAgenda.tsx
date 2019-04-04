import { format } from "date-fns";
import { View } from "native-base";
import React, { ComponentProps } from "react";
import {
  SectionList,
  SectionListData,
  SectionListRenderItem,
  StyleSheet
} from "react-native";

import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { MessageWithContentAndDueDatePO } from "../../types/MessageWithContentAndDueDatePO";
import H5 from "../ui/H5";
import MessageAgendaItem from "./MessageAgendaItem";

const styles = StyleSheet.create({
  sectionHeader: {
    height: 50,
    paddingHorizontal: customVariables.contentPadding,
    paddingVertical: customVariables.contentPadding / 2,
    backgroundColor: customVariables.brandLightGray
  },
  itemSeparator: {
    height: 1,
    backgroundColor: customVariables.brandLightGray
  }
});

const keyExtractor = (_: MessageWithContentAndDueDatePO) => _.id;

const ItemSeparatorComponent = () => <View style={styles.itemSeparator} />;

const SECTION_HEADER_HEIGHT = 50;

const ITEM_SEPARATOR_HEIGHT = 1;

const ITEM_HEIGHT = 100;

export type MessageAgendaSection = SectionListData<
  MessageWithContentAndDueDatePO
>;

// tslint:disable-next-line: readonly-array
export type Sections = MessageAgendaSection[];

export type ItemLayout = {
  length: number;
  offset: number;
  index: number;
};

type SelectedSectionListProps = Pick<
  ComponentProps<SectionList<MessageAgendaSection>>,
  "refreshing" | "onRefresh" | "onContentSizeChange"
>;

type OwnProps = {
  sections: Sections;
  onPressItem: (id: string) => void;
};

type Props = OwnProps & SelectedSectionListProps;

type State = {
  prevSections?: Sections;
  itemLayouts: ReadonlyArray<ItemLayout>;
};

/**
 * Generate item layouts from sections.
 * The VirtualizedSectionList react-native component create cells for:
 * - SECTION_HEADER
 * - ITEM + ITEM_SEPARATOR (NOTE: A single cell for both)
 * - SECTION_FOOTER
 *
 * Here we calculate the ItemLayout for each cell.
 */
const generateItemLayouts = (sections: Sections) => {
  // tslint:disable-next-line: no-let
  let offset = 0;
  // tslint:disable-next-line: no-let
  let index = 0;
  // tslint:disable-next-line: readonly-array
  const itemLayouts: ItemLayout[] = [];
  sections.forEach(section => {
    // Push the info about the SECTION_HEADER cell.
    itemLayouts.push({
      length: SECTION_HEADER_HEIGHT,
      offset,
      index
    });

    offset += SECTION_HEADER_HEIGHT;
    index++;

    section.data.forEach((_, dataIndex, data) => {
      // Push the info about the ITEM + ITEM_SEPARATOR cell.
      const heightAndOffset =
        dataIndex === data.length - 1
          ? ITEM_HEIGHT
          : ITEM_HEIGHT + ITEM_SEPARATOR_HEIGHT;
      itemLayouts.push({
        length: heightAndOffset,
        offset,
        index
      });

      offset += heightAndOffset;
      index++;
    });

    // Push the info about the SECTION_FOOTER cell.
    // NOTE: Also if not rendered the VirtualizedSectionList component create a cell.
    itemLayouts.push({
      length: 0,
      offset,
      index
    });

    offset += 0;
    index++;
  });

  return itemLayouts;
};

/**
 * A component to render messages with due_date in a agenda like form.
 */
class MessageAgenda extends React.PureComponent<Props, State> {
  private sectionListRef = React.createRef<any>();

  constructor(props: Props) {
    super(props);
    this.state = {
      itemLayouts: []
    };
  }

  public static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): Partial<State> | null {
    const { sections } = nextProps;
    const { prevSections } = prevState;
    if (sections !== prevSections) {
      return {
        prevSections: sections,
        itemLayouts: generateItemLayouts(sections)
      };
    }

    return null;
  }

  public render() {
    const { sections, refreshing, onRefresh, onContentSizeChange } = this.props;
    return (
      <SectionList
        ref={this.sectionListRef}
        // Forwarded props
        sections={sections}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onContentSizeChange={onContentSizeChange}
        stickySectionHeadersEnabled={true}
        alwaysBounceVertical={false}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparatorComponent}
        renderSectionHeader={this.renderSectionHeader}
        renderItem={this.renderItem}
        getItemLayout={this.getItemLayout}
      />
    );
  }

  private renderSectionHeader = (info: { section: MessageAgendaSection }) => {
    return (
      <View style={styles.sectionHeader}>
        <H5>
          {format(
            info.section.title,
            I18n.t("global.dateFormats.dayAndMonth")
          ).toUpperCase()}
        </H5>
      </View>
    );
  };

  private renderItem: SectionListRenderItem<
    MessageWithContentAndDueDatePO
  > = info => {
    const message = info.item;
    return (
      <MessageAgendaItem
        id={message.id}
        subject={message.content.subject}
        due_date={message.content.due_date}
        onPress={this.props.onPressItem}
      />
    );
  };

  private getItemLayout = (_: Sections | null, index: number) =>
    this.state.itemLayouts[index];

  public scrollToSectionsIndex = (sectionsIndex: number) => {
    if (this.sectionListRef.current !== null) {
      this.sectionListRef.current.scrollToLocation({
        sectionIndex: sectionsIndex,
        itemIndex: 0,
        viewOffset: 50,
        viewPosition: 1,
        animated: true
      });
    }
  };
}

export default MessageAgenda;

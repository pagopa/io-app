import { format } from "date-fns";
import { Text, View } from "native-base";
import React, { ComponentProps } from "react";
import {
  SectionList,
  SectionListData,
  SectionListRenderItem,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent
} from "react-native";

import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { MessageWithContentAndDueDatePO } from "../../types/MessageWithContentAndDueDatePO";
import MessageAgendaItem from "./MessageAgendaItem";

const styles = StyleSheet.create({
  sectionHeaderWrapper: {
    height: 48,
    paddingTop: 8 * 2.5,
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: customVariables.colorWhite
  },
  sectionHeaderText: {
    paddingBottom: 8 * 1.5,
    fontSize: 18,
    lineHeight: 20,
    color: customVariables.brandDarkestGray,
    borderBottomWidth: 1,
    borderBottomColor: customVariables.brandLightGray
  },

  itemSeparator: {
    backgroundColor: customVariables.brandLightGray,
    height: 1,
    marginHorizontal: customVariables.contentPadding
  }
});

const keyExtractor = (_: MessageWithContentAndDueDatePO) => _.id;

const ItemSeparatorComponent = () => <View style={styles.itemSeparator} />;

// Used to calculate the cell item layouts.
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
  isRefreshButtonVisible: boolean;
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
    // NOTE: VirtualizedSectionList component creates a cell instance for
    // the SECTION_FOOTER even when not rendered.
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
  private canShowRefreshButton = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      itemLayouts: [],
      isRefreshButtonVisible: false
    };
  }

  private handleScrollBeginDrag = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    this.canShowRefreshButton = true;
  };

  private handleOnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    this.canShowRefreshButton = false;
    const { isRefreshButtonVisible } = this.state;

    if (
      isRefreshButtonVisible &&
      event.nativeEvent.velocity &&
      event.nativeEvent.velocity.y > 0
    ) {
      this.setState({
        isRefreshButtonVisible: false
      });
    }
  };

  private handleMomentumScrollBegin = () => {
    if (this.canShowRefreshButton) {
      this.setState({ isRefreshButtonVisible: true });
    }
  };

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

  private renderSectionHeader = (info: { section: MessageAgendaSection }) => {
    return (
      <View style={styles.sectionHeaderWrapper}>
        <Text style={styles.sectionHeaderText}>
          {format(info.section.title, I18n.t("global.dateFormats.dayAndMonth"))}
        </Text>
      </View>
    );
  };

  public render() {
    const { sections, refreshing, onRefresh, onContentSizeChange } = this.props;
    const { isRefreshButtonVisible } = this.state;
    return (
      <View>
        {isRefreshButtonVisible && <Text>Refresh</Text>}
        <SectionList
          ref={this.sectionListRef}
          scrollEventThrottle={16}
          onScrollBeginDrag={this.handleScrollBeginDrag}
          onScroll={this.handleOnScroll}
          onMomentumScrollBegin={this.handleMomentumScrollBegin}
          // Forwarded props
          sections={sections}
          refreshing={refreshing}
          onContentSizeChange={onContentSizeChange}
          stickySectionHeadersEnabled={true}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={ItemSeparatorComponent}
          renderSectionHeader={this.renderSectionHeader}
          renderItem={this.renderItem}
          getItemLayout={this.getItemLayout}
          overScrollMode="always"
        />
      </View>
    );
  }

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

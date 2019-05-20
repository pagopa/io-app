import { format } from "date-fns";
import { Button, Text, View } from "native-base";
import React, { ComponentProps } from "react";
import {
  Platform,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  SectionListScrollParams,
  StyleSheet
} from "react-native";

import I18n from "../../i18n";
import { makeFontStyleObject } from "../../theme/fonts";
import customVariables from "../../theme/variables";
import { MessageWithContentAndDueDatePO } from "../../types/MessageWithContentAndDueDatePO";
import MessageAgendaItem from "./MessageAgendaItem";

const styles = StyleSheet.create({
  listHeaderWrapper: {
    height: 70,
    paddingHorizontal: customVariables.contentPadding,
    paddingTop: 24,
    paddingBottom: 8
  },

  listHeaderButtonText: {
    ...makeFontStyleObject(Platform.select)
  },

  sectionHeaderWrapper: {
    height: 48,
    paddingTop: 19,
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: customVariables.colorWhite
  },
  sectionHeaderText: {
    paddingBottom: 9,
    fontSize: 18,
    lineHeight: 20,
    color: customVariables.brandDarkestGray,
    borderBottomWidth: 1,
    borderBottomColor: customVariables.brandLightGray
  },

  itemEmptyWrapper: {
    height: 100,
    paddingHorizontal: customVariables.contentPadding,
    justifyContent: "center"
  },

  itemSeparator: {
    backgroundColor: customVariables.brandLightGray,
    height: 1,
    marginHorizontal: customVariables.contentPadding
  }
});

// Used to calculate the cell item layouts.
const SECTION_HEADER_HEIGHT = 50;
const ITEM_SEPARATOR_HEIGHT = 1;
const ITEM_HEIGHT = 100;

export type FakeItem = {
  fake: true;
};

export type MessageAgendaSection = SectionListData<
  MessageWithContentAndDueDatePO | FakeItem
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
  "refreshing" | "onContentSizeChange"
>;

type OwnProps = {
  sections: Sections;
  onPressItem: (id: string) => void;
  onMoreDataRequest: () => void;
};

type Props = OwnProps & SelectedSectionListProps;

type State = {
  prevSections?: Sections;
  itemLayouts: ReadonlyArray<ItemLayout>;
  isRefreshButtonVisible: boolean;
};

const isFakeItem = (item: any): item is FakeItem => {
  return item.fake;
};

const keyExtractor = (
  _: MessageWithContentAndDueDatePO | FakeItem,
  index: number
) => (isFakeItem(_) ? `item-${index}` : _.id);

const ItemSeparatorComponent = () => <View style={styles.itemSeparator} />;

const FakeItemComponent = (
  <View style={styles.itemEmptyWrapper}>
    <Text>{I18n.t("reminders.emptyMonth")}</Text>
  </View>
);

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
  let offset = 70;
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
      const isLastItem = dataIndex === data.length - 1;
      const height = isLastItem
        ? ITEM_HEIGHT
        : ITEM_HEIGHT + ITEM_SEPARATOR_HEIGHT;
      itemLayouts.push({
        length: height,
        offset,
        index
      });

      offset += height;
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
      itemLayouts: [],
      isRefreshButtonVisible: false
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

  private renderListHeader = () => {
    const { onMoreDataRequest } = this.props;

    return (
      <View style={styles.listHeaderWrapper}>
        <Button
          block={true}
          primary={true}
          small={true}
          onPress={onMoreDataRequest}
        >
          <Text style={styles.listHeaderButtonText}>
            carica le scadenze del periodo precedente
          </Text>
        </Button>
      </View>
    );
  };

  private renderSectionHeader = (info: { section: MessageAgendaSection }) => {
    const isFake = info.section.fake;
    return (
      <View style={styles.sectionHeaderWrapper}>
        <Text style={styles.sectionHeaderText}>
          {format(
            info.section.title,
            I18n.t(
              isFake
                ? "global.dateFormats.month"
                : "global.dateFormats.dayAndMonth"
            )
          )}
        </Text>
      </View>
    );
  };

  private renderItem: SectionListRenderItem<
    MessageWithContentAndDueDatePO | FakeItem
  > = info => {
    const message = info.item;

    if (isFakeItem(message)) {
      return FakeItemComponent;
    }

    return (
      <MessageAgendaItem
        id={message.id}
        subject={message.content.subject}
        due_date={message.content.due_date}
        onPress={this.props.onPressItem}
      />
    );
  };

  private getItemLayout = (_: Sections | null, index: number) => {
    return this.state.itemLayouts[index];
  };

  public render() {
    const { sections, refreshing, onContentSizeChange } = this.props;
    return (
      <SectionList
        ref={this.sectionListRef}
        // Forwarded props
        ListHeaderComponent={this.renderListHeader}
        renderSectionHeader={this.renderSectionHeader}
        renderItem={this.renderItem}
        ItemSeparatorComponent={ItemSeparatorComponent}
        sections={sections}
        refreshing={refreshing}
        onContentSizeChange={onContentSizeChange}
        stickySectionHeadersEnabled={true}
        keyExtractor={keyExtractor}
        getItemLayout={this.getItemLayout}
      />
    );
  }

  public scrollToLocation = (params: SectionListScrollParams) => {
    if (this.sectionListRef.current !== null) {
      this.sectionListRef.current.scrollToLocation(params);
    }
  };
}

export default MessageAgenda;

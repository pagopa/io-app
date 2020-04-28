import { isSome, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { ITuple2 } from "italia-ts-commons/lib/tuples";
import { Text, View } from "native-base";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  SectionListScrollParams,
  StyleSheet
} from "react-native";
import variables from "../../theme/variables";

import startCase from "lodash/startCase";
import Placeholder from "rn-placeholder";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { makeFontStyleObject } from "../../theme/fonts";
import customVariables from "../../theme/variables";
import { CreatedMessageWithContentAndDueDate } from "../../types/CreatedMessageWithContentAndDueDate";
import { format } from "../../utils/dates";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import { EdgeBorderComponent } from "../screens/EdgeBorderComponent";
import MessageListItem from "./MessageListItem";

// Used to calculate the cell item layouts.
const LIST_HEADER_HEIGHT = 70;
const SECTION_HEADER_HEIGHT = 48;
const ITEM_HEIGHT = 158;
const FAKE_ITEM_HEIGHT = 75;
const ITEM_SEPARATOR_HEIGHT = 1;
const ITEM_WITHOUT_CTABAR_AND_LOADING_HEIGHT = 114;
const MESSAGE_TO_SHOW = 5;

const screenWidth = Dimensions.get("screen").width;

const styles = StyleSheet.create({
  // List
  emptyListWrapper: {
    padding: customVariables.contentPadding,
    alignItems: "center"
  },
  emptyListContentTitle: {
    paddingTop: customVariables.contentPadding
  },
  emptyListContentSubtitle: {
    textAlign: "center",
    fontSize: customVariables.fontSizeSmall
  },

  // ListHeader
  listHeaderWrapper: {
    height: LIST_HEADER_HEIGHT,
    paddingHorizontal: customVariables.contentPadding,
    paddingTop: 24,
    paddingBottom: 8
  },
  listHeaderButtonText: {
    ...makeFontStyleObject(Platform.select)
  },

  // SectionHeader
  sectionHeaderWrapper: {
    height: SECTION_HEADER_HEIGHT,
    paddingTop: 19,
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: customVariables.colorWhite
  },
  sectionHeaderContent: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: customVariables.brandLightGray
  },
  sectionHeaderText: {
    fontSize: 18,
    color: customVariables.brandDarkestGray,
    ...makeFontStyleObject(Platform.select, "600"),
    lineHeight: 20
  },
  sectionHeaderHighlightText: {
    fontSize: 18,
    color: customVariables.brandPrimary,
    ...makeFontStyleObject(Platform.select, "600"),
    lineHeight: 20
  },

  // Items
  itemEmptyWrapper: {
    height: FAKE_ITEM_HEIGHT,
    paddingHorizontal: customVariables.contentPadding,
    justifyContent: "center"
  },
  itemEmptyText: {
    color: customVariables.brandDarkestGray
  },
  itemSeparator: {
    height: ITEM_SEPARATOR_HEIGHT,
    backgroundColor: customVariables.brandLightGray
  },
  button: {
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: variables.contentPadding,
    width: screenWidth - variables.contentPadding * 2
  },
  itemLoadingContainer: {
    height: ITEM_WITHOUT_CTABAR_AND_LOADING_HEIGHT,
    paddingVertical: 16,
    paddingHorizontal: customVariables.contentPadding,
    flex: 1
  },
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  itemLoadingHeaderWrapper: {
    flexDirection: "row",
    marginBottom: 4
  },
  itemLoadingHeaderCenter: {
    flex: 1,
    paddingRight: 55 // Includes right header space
  },
  itemLoadingContentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 42
  },
  itemLoadingContentCenter: {
    flex: 1,
    paddingRight: 32
  }
});

export type MessageAgendaItemMetadata = {
  isRead: boolean;
};

export type MessageAgendaItem = ITuple2<
  CreatedMessageWithContentAndDueDate,
  MessageAgendaItemMetadata
>;

export type MessageAgendaSection = SectionListData<MessageAgendaItem>;

// tslint:disable-next-line: readonly-array
export type Sections = MessageAgendaSection[];

export type ItemLayout = {
  length: number;
  offset: number;
  index: number;
};

type Props = {
  sections: Sections;
  sectionToLoad?: number;
  servicesById: ServicesByIdState;
  paymentsByRptId: PaymentByRptIdState;
  onPressItem: (id: string) => void;
  onLongPressItem: (id: string) => void;
  onMoreDataRequest: () => void;
  refreshing: boolean;
  selectedMessageIds: Option<Set<string>>;
  nextDeadlineId: Option<string>;
};

type State = {
  itemLayouts: ReadonlyArray<ItemLayout>;
  prevSections?: Sections;
  isLoadingProgress: boolean;
  isFirstLoading: boolean;
  isDeadlinesLoaded: boolean;
  isLoadingComplete: boolean;
  numMessagesToRender: number;
  isScrollToActivated: boolean;
};

const keyExtractor = (_: MessageAgendaItem) => _.e1.id;

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
  let offset = LIST_HEADER_HEIGHT;
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
      const isLastItem = dataIndex === data.length - 1;

      const cellHeight = isLastItem
        ? ITEM_HEIGHT
        : ITEM_HEIGHT + ITEM_SEPARATOR_HEIGHT;
      itemLayouts.push({
        length: cellHeight,
        offset,
        index
      });

      offset += cellHeight;
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

const PlaceholderLine = () => (
  <Placeholder.Line
    textSize={customVariables.fontSizeBase}
    color={customVariables.shineColor}
    width={"75%"}
    animate={"shine"}
  />
);

const MessageItemPlaceholder = (
  <View style={[styles.itemLoadingContainer]}>
    <View style={styles.itemLoadingHeaderWrapper}>
      <View style={styles.itemLoadingHeaderCenter}>
        <Placeholder.Paragraph
          textSize={customVariables.fontSizeBase}
          color={customVariables.shineColor}
          lineNumber={2}
          lineSpacing={5}
          width={"100%"}
          firstLineWidth={"100%"}
          lastLineWidth={"55%"}
          animate={"shine"}
          onReady={false}
        />
      </View>
    </View>

    <View style={styles.itemLoadingContentWrapper}>
      <View style={styles.itemLoadingContentCenter}>
        <PlaceholderLine />
      </View>
    </View>
  </View>
);

const SectionHeaderPlaceholder = (
  <View style={styles.sectionHeaderWrapper}>
    <View style={styles.sectionHeaderContent}>
      <PlaceholderLine />
    </View>
  </View>
);
/**
 * A component to render messages with due_date in a agenda like form.
 */
class MessageAgenda extends React.PureComponent<Props, State> {
  // Ref to section list
  private sectionListRef = React.createRef<any>();
  // Scroll to this values when layout is available
  private sectionIndexToScroll = 0;
  private sectionsLengthToScroll = 0;

  constructor(props: Props) {
    super(props);
    this.state = {
      itemLayouts: [],
      isLoadingProgress: false,
      isFirstLoading: true,
      isDeadlinesLoaded: false,
      isLoadingComplete: false,
      numMessagesToRender: 0,
      isScrollToActivated: false
    };
  }

  public componentDidUpdate() {
    if (!this.state.isDeadlinesLoaded) {
      this.isDeadlinesLoadingCompleted();
    }
    if (
      // check that the deadline messages have been loaded
      this.state.isDeadlinesLoaded &&
      // check that the SectionList ref is defined
      this.sectionListRef.current &&
      // check that it is the first loading of the SectionList (the first loading of the screen)
      this.state.isFirstLoading &&
      // check that the Sections are defined and that there are messages
      (this.props.sections && this.props.sections.length > 0)
    ) {
      this.completeLoadingState();
      if (
        /**
         * To scroll to the next deadline we need these 2 conditions to occur:
         * - two or more sections: with one section we have one deadline in evidence
         * - five or more messages: to enable scrollbar
         */
        // check that Sections has more than one message
        this.props.sections.length > 1 &&
        // check that there are more than 5 messages to show in the SectionsList to enable the scroll effect
        this.state.numMessagesToRender > MESSAGE_TO_SHOW &&
        // check that the id of next deadline is defined
        isSome(this.props.nextDeadlineId)
      ) {
        const sectionIndex = this.props.sections.findIndex(this.checkSection);
        if (sectionIndex !== -1) {
          // tslint:disable-next-line: no-object-mutation
          this.sectionIndexToScroll = sectionIndex;
          // tslint:disable-next-line: no-object-mutation
          this.sectionsLengthToScroll = this.props.sections.length - 1;
        }
      }
    }
  }

  private scrollToNextDeadline = () => {
    if (!this.state.isScrollToActivated) {
      this.setState({
        isScrollToActivated: true
      });
      this.scrollToLocation({
        animated: false,
        itemIndex: 0,
        sectionIndex: Platform.select({
          ios: this.sectionIndexToScroll,
          android: this.sectionIndexToScroll
        }),
        viewPosition: 0,
        viewOffset:
          this.sectionIndexToScroll === this.sectionsLengthToScroll
            ? 0
            : ITEM_WITHOUT_CTABAR_AND_LOADING_HEIGHT + 20
      });
    }
  };

  private checkSection = (s: MessageAgendaSection) => {
    const nextDeadlineId = isSome(this.props.nextDeadlineId)
      ? this.props.nextDeadlineId.value
      : undefined;
    const item = s.data[0];
    const sectionId = item.e1.id;

    return sectionId === nextDeadlineId;
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

  private isDeadlinesLoadingCompleted = () => {
    if (
      this.props.sectionToLoad &&
      this.getMessageToLoadFromSections(this.props.sections) ===
        this.props.sectionToLoad
    ) {
      this.setNumMessagesToRender(this.props.sections);
      this.setState({
        isDeadlinesLoaded: true
      });
    }
  };

  private setNumMessagesToRender = (sections: Sections) => {
    const messageToLoadFromSections = sections.reduce(
      (acc, curr) => acc + curr.data.length,
      0
    );
    const numMessagesToRender =
      messageToLoadFromSections + this.state.numMessagesToRender;
    this.setState({
      numMessagesToRender
    });
  };

  private getMessageToLoadFromSections = (sections: Sections) => {
    return sections.reduce((acc, curr) => acc + curr.data.length, 0);
  };

  private completeLoadingState = () => {
    this.setState({
      isLoadingComplete: true
    });
    if (this.state.isFirstLoading) {
      this.setState({
        isFirstLoading: false
      });
    }
  };

  private renderSectionHeader = (info: { section: MessageAgendaSection }) => {
    const nextDeadlineId = isSome(this.props.nextDeadlineId)
      ? this.props.nextDeadlineId.value
      : undefined;

    const item = info.section.data[0];
    const sectionId = item.e1.id;

    if (!this.state.isLoadingComplete) {
      return SectionHeaderPlaceholder;
    }

    return (
      <View style={styles.sectionHeaderWrapper}>
        <View style={styles.sectionHeaderContent}>
          <Text
            style={
              sectionId === nextDeadlineId
                ? styles.sectionHeaderHighlightText
                : styles.sectionHeaderText
            }
          >
            {startCase(
              format(
                info.section.title,
                I18n.t("global.dateFormats.weekdayDayMonthYear")
              )
            )}
          </Text>
        </View>
      </View>
    );
  };

  private renderItem: SectionListRenderItem<MessageAgendaItem> = info => {
    const message = info.item.e1;
    const { isRead } = info.item.e2;
    const {
      paymentsByRptId,
      onPressItem,
      onLongPressItem,
      selectedMessageIds
    } = this.props;

    const potService = this.props.servicesById[message.sender_service_id];

    if (!this.state.isLoadingComplete) {
      return MessageItemPlaceholder;
    }

    const service =
      potService !== undefined
        ? pot.isNone(potService)
          ? ({
              organization_name: I18n.t("messages.errorLoading.senderInfo"),
              department_name: I18n.t("messages.errorLoading.serviceInfo")
            } as ServicePublic)
          : pot.toUndefined(potService)
        : undefined;

    const payment =
      message.content.payment_data !== undefined && service !== undefined
        ? paymentsByRptId[
            `${service.organization_fiscal_code}${
              message.content.payment_data.notice_number
            }`
          ]
        : undefined;

    return (
      <View style={styles.padded}>
        <MessageListItem
          isRead={isRead}
          message={message}
          service={service}
          payment={payment}
          onPress={onPressItem}
          onLongPress={onLongPressItem}
          isSelectionModeEnabled={selectedMessageIds.isSome()}
          isSelected={selectedMessageIds
            .map(_ => _.has(message.id))
            .getOrElse(false)}
        />
      </View>
    );
  };

  private getItemLayout = (_: Sections | null, index: number) => {
    return this.state.itemLayouts[index];
  };

  private ListEmptyComponent = (
    <View style={styles.emptyListWrapper}>
      <ButtonDefaultOpacity
        block={true}
        primary={true}
        small={true}
        bordered={true}
        style={styles.button}
      >
        <Text numberOfLines={1}>{I18n.t("reminders.loadMoreData")}</Text>
      </ButtonDefaultOpacity>
      <View spacer={true} />
      <Image
        source={require("../../../img/messages/empty-due-date-list-icon.png")}
      />
      <Text style={styles.emptyListContentTitle}>
        {I18n.t("messages.deadlines.emptyMessage.title")}
      </Text>
      <Text style={styles.emptyListContentSubtitle}>
        {I18n.t("messages.deadlines.emptyMessage.subtitle")}
      </Text>
    </View>
  );

  // Show this component when the user has not deadlines
  private ListEmptySectionsComponent = (
    <View style={styles.emptyListWrapper}>
      <View spacer={true} large={true} />
      <Image
        source={require("../../../img/messages/empty-due-date-list-icon.png")}
      />
      <Text style={styles.emptyListContentTitle}>
        {I18n.t("messages.deadlines.emptyMessage.title")}
      </Text>
    </View>
  );

  public render() {
    const {
      sections,
      servicesById,
      paymentsByRptId,
      refreshing,
      onMoreDataRequest
    } = this.props;

    const refreshControl = (
      <RefreshControl refreshing={refreshing} onRefresh={onMoreDataRequest} />
    );

    return (
      <View
        style={{
          flex: 1,
          width: screenWidth
        }}
      >
        {this.state.isDeadlinesLoaded ? (
          <SectionList
            // If we not have a final deadline then we not have deadlines
            sections={sections}
            extraData={{ servicesById, paymentsByRptId }}
            initialNumToRender={this.state.numMessagesToRender}
            maxToRenderPerBatch={this.state.numMessagesToRender}
            bounces={true}
            scrollEnabled={true}
            refreshControl={refreshControl}
            keyExtractor={keyExtractor}
            ref={this.sectionListRef}
            onLayout={() => this.scrollToNextDeadline()}
            renderItem={this.renderItem}
            renderSectionHeader={this.renderSectionHeader}
            ItemSeparatorComponent={ItemSeparatorComponent}
            getItemLayout={this.getItemLayout}
            ListHeaderComponent={false}
            ListFooterComponent={sections.length > 0 && <EdgeBorderComponent />}
            ListEmptyComponent={
              sections.length === 0
                ? this.ListEmptySectionsComponent
                : this.ListEmptyComponent
            }
          />
        ) : (
          <SectionList
            sections={sections}
            extraData={{ servicesById, paymentsByRptId }}
            scrollEnabled={false}
            bounces={false}
            keyExtractor={keyExtractor}
            renderItem={this.renderItem}
            renderSectionHeader={this.renderSectionHeader}
            ItemSeparatorComponent={ItemSeparatorComponent}
            ListEmptyComponent={
              sections.length === 0
                ? this.ListEmptySectionsComponent
                : this.ListEmptyComponent
            }
          />
        )}
      </View>
    );
  }

  public scrollToLocation = (params: SectionListScrollParams) => {
    if (
      this.sectionListRef !== undefined &&
      this.sectionListRef.current !== null
    ) {
      this.sectionListRef.current.scrollToLocation(params);
    }
  };
}

export default MessageAgenda;

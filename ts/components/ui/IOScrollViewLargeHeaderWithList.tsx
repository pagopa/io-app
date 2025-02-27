import {
  Body,
  BodyProps,
  BodySmall,
  ComposedBodyFromArray,
  ContentWrapper,
  Divider,
  H2,
  HeaderSecondLevel,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps, useState } from "react";
import { LayoutChangeEvent, RefreshControlProps, View } from "react-native";
import {
  BackProps,
  HeaderActionsProps,
  useHeaderProps
} from "../../hooks/useHeaderProps";
import { SupportRequestParams } from "../../hooks/useStartSupportRequest";
import I18n from "../../i18n";
import { IOScrollView } from "./IOScrollView";
import { LargeHeaderTitleProps } from "./IOScrollViewWithLargeHeader";

export type IOScrollViewLargeHeaderWithListProps<T> = {
  title: LargeHeaderTitleProps;
  subtitle?: string | Array<BodyProps>;
  description?: string | Array<BodyProps>;
  data: Array<T>;
  renderItem: (item: T, index: number) => JSX.Element | null;
  refreshControlProps: RefreshControlProps;
  includeContentMargins?: boolean;
  excludeEndContentMargin?: boolean;
  testID?: string;
  canGoback?: boolean;
  goBack?: BackProps["goBack"];
  ignoreSafeAreaMargin?: ComponentProps<
    typeof HeaderSecondLevel
  >["ignoreSafeAreaMargin"];
  ignoreAccessibilityCheck?: ComponentProps<
    typeof HeaderSecondLevel
  >["ignoreAccessibilityCheck"];
  headerActionsProp?: HeaderActionsProps;
  listEmptyComponent?: JSX.Element;
  listHeaderComponent?: JSX.Element;
  listFooterComponent?: JSX.Element;
  skeleton?: JSX.Element;
} & SupportRequestParams;

const ItemsList = <T,>({
  items,
  renderItem
}: {
  items: Array<T>;
  renderItem: (item: T, index: number) => JSX.Element | null;
}) =>
  items.map((item, index) => (
    <View key={`${index} ${item}`}>
      {renderItem(item, index)}
      {index < items.length - 1 && <Divider />}
    </View>
  ));

export const IOScrollViewLargeHeaderWithList = <T,>({
  title,
  subtitle,
  description,
  excludeEndContentMargin,
  includeContentMargins,
  contextualHelp,
  contextualHelpMarkdown,
  faqCategories,
  testID,
  goBack,
  canGoback = true,
  ignoreSafeAreaMargin = false,
  ignoreAccessibilityCheck = false,
  headerActionsProp = {},
  refreshControlProps,
  skeleton,
  listEmptyComponent,
  listHeaderComponent,
  listFooterComponent,
  data,
  renderItem
}: IOScrollViewLargeHeaderWithListProps<T>) => {
  const [titleHeight, setTitleHeight] = useState(0);

  const navigation = useNavigation();
  const theme = useIOTheme();

  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setTitleHeight(height);
  };

  const headerPropsWithoutGoBack = {
    title: title.label,
    contextualHelp,
    contextualHelpMarkdown,
    faqCategories,
    ...headerActionsProp
  };

  const headerProps: ComponentProps<typeof HeaderSecondLevel> = {
    ignoreSafeAreaMargin,
    ignoreAccessibilityCheck,
    ...useHeaderProps(
      canGoback
        ? {
            ...headerPropsWithoutGoBack,
            backAccessibilityLabel: I18n.t("global.buttons.back"),
            goBack: goBack ?? navigation.goBack
          }
        : headerPropsWithoutGoBack
    )
  };

  const renderListComponent = () => {
    if (refreshControlProps.refreshing && skeleton) {
      return skeleton;
    }
    if (data.length > 0) {
      return <ItemsList items={data} renderItem={renderItem} />;
    }
    return listEmptyComponent;
  };

  return (
    <IOScrollView
      headerConfig={headerProps}
      snapOffset={titleHeight}
      includeContentMargins={includeContentMargins}
      excludeEndContentMargin={excludeEndContentMargin}
      testID={testID}
      refreshControlProps={refreshControlProps}
    >
      <View accessible onLayout={getTitleHeight}>
        {title.section && (
          <BodySmall weight="Semibold" color={theme["textBody-tertiary"]}>
            {title.section}
          </BodySmall>
        )}
        <H2
          color={theme["textHeading-default"]}
          testID={title?.testID}
          accessibilityLabel={title.accessibilityLabel ?? title.label}
          accessibilityRole="header"
        >
          {title.label}
        </H2>
      </View>

      {description && (
        <ContentWrapper>
          <VSpacer size={16} />
          {typeof description === "string" ? (
            <Body color={theme["textBody-tertiary"]}>{description}</Body>
          ) : (
            <ComposedBodyFromArray body={description} textAlign="left" />
          )}
        </ContentWrapper>
      )}
      {subtitle && (
        <>
          <VSpacer size={8} />
          {typeof subtitle === "string" ? (
            <Body>{subtitle}</Body>
          ) : (
            <ComposedBodyFromArray body={subtitle} />
          )}
        </>
      )}
      {listHeaderComponent && (
        <>
          <VSpacer size={16} />
          {listHeaderComponent}
        </>
      )}
      {renderListComponent()}
      {listFooterComponent}
    </IOScrollView>
  );
};

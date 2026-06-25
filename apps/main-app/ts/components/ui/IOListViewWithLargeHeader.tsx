import {
  BodySmall,
  Divider,
  H2,
  HeaderSecondLevel,
  IOMarkdownLite,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { ComponentProps, createRef, JSX, useCallback, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";

import { useHeaderProps } from "../../hooks/useHeaderProps";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { IOListView } from "./IOListView";
import { IOScrollViewWithLargeHeader } from "./IOScrollViewWithLargeHeader";

type Props<T> = ComponentProps<typeof IOListView<T>> &
  ComponentProps<typeof IOScrollViewWithLargeHeader> & {
    subtitle?: string;
  };

/**
 * Special `IOListView` screen with a large title that is hidden by a transition when
 * the user scrolls. It also handles the contextual help and the FAQ.
 * Use of LargeHeader naming is due to similar behavior offered by the native iOS API.
 */
export const IOListViewWithLargeHeader = <T,>({
  ref,
  renderItem,
  data,
  keyExtractor,
  title,
  description,
  subtitle,
  actions,
  goBack,
  canGoback = true,
  contextualHelp,
  contextualHelpMarkdown,
  faqCategories,
  ignoreSafeAreaMargin = false,
  refreshControlProps,
  includeContentMargins = true,
  headerActionsProp = {},
  excludeEndContentMargin,
  skeleton,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  testID,
  ignoreAccessibilityCheck = false,
  loading
}: Props<T>): JSX.Element => {
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

  const titleRef = createRef<View>();

  useFocusEffect(
    useCallback(() => setAccessibilityFocus(titleRef), [titleRef])
  );

  return (
    <IOListView<T>
      actions={actions}
      data={data}
      excludeEndContentMargin={excludeEndContentMargin}
      headerConfig={headerProps}
      includeContentMargins={includeContentMargins}
      ItemSeparatorComponent={Divider}
      keyExtractor={keyExtractor}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={
        <>
          <View onLayout={getTitleHeight}>
            {title.section && (
              <BodySmall color={theme["textBody-tertiary"]} weight="Semibold">
                {title.section}
              </BodySmall>
            )}
            <H2
              accessibilityLabel={title.accessibilityLabel ?? title.label}
              accessibilityRole="header"
              color={theme["textHeading-default"]}
              ref={ref ?? titleRef}
              testID={title?.testID}
            >
              {title.label}
            </H2>
          </View>

          {description && (
            <>
              <VSpacer size={16} />
              <IOMarkdownLite content={description} />
            </>
          )}
          {subtitle && (
            <>
              <VSpacer size={8} />
              <IOMarkdownLite content={subtitle} />
            </>
          )}
          {ListHeaderComponent && (
            <>
              <VSpacer size={16} />
              {ListHeaderComponent}
            </>
          )}
        </>
      }
      loading={loading}
      refreshControlProps={refreshControlProps}
      renderItem={renderItem}
      skeleton={skeleton}
      snapOffset={titleHeight}
      testID={testID}
    />
  );
};

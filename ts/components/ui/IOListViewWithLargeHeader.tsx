import {
  Body,
  BodyProps,
  BodySmall,
  ComposedBodyFromArray,
  Divider,
  H2,
  HeaderSecondLevel,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  ComponentProps,
  createRef,
  forwardRef,
  JSX,
  useCallback,
  useState
} from "react";

import { LayoutChangeEvent, View } from "react-native";
import I18n from "i18next";
import { useHeaderProps } from "../../hooks/useHeaderProps";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { IOListView } from "./IOListView";
import { IOScrollViewWithLargeHeader } from "./IOScrollViewWithLargeHeader";

type Props<T> = ComponentProps<typeof IOListView<T>> &
  ComponentProps<typeof IOScrollViewWithLargeHeader> & {
    subtitle?: string | Array<BodyProps>;
  };

/**
 * Special `IOListView` screen with a large title that is hidden by a transition when
 * the user scrolls. It also handles the contextual help and the FAQ.
 * Use of LargeHeader naming is due to similar behavior offered by the native iOS API.
 */
export const IOListViewWithLargeHeader = forwardRef(
  <T,>(
    {
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
    }: Props<T>,
    ref: React.Ref<View>
  ) => {
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
        ListHeaderComponent={
          <>
            <View onLayout={getTitleHeight}>
              {title.section && (
                <BodySmall weight="Semibold" color={theme["textBody-tertiary"]}>
                  {title.section}
                </BodySmall>
              )}
              <H2
                color={theme["textHeading-default"]}
                testID={title?.testID}
                ref={ref ?? titleRef}
                accessibilityLabel={title.accessibilityLabel ?? title.label}
                accessibilityRole="header"
              >
                {title.label}
              </H2>
            </View>

            {description && (
              <>
                <VSpacer size={16} />
                {typeof description === "string" ? (
                  <Body color={theme["textBody-tertiary"]}>{description}</Body>
                ) : (
                  <ComposedBodyFromArray body={description} textAlign="left" />
                )}
              </>
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
            {ListHeaderComponent && (
              <>
                <VSpacer size={16} />
                {ListHeaderComponent}
              </>
            )}
          </>
        }
        loading={loading}
        skeleton={skeleton}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        ItemSeparatorComponent={Divider}
        refreshControlProps={refreshControlProps}
        renderItem={renderItem}
        data={data}
        keyExtractor={keyExtractor}
        actions={actions}
        headerConfig={headerProps}
        snapOffset={titleHeight}
        includeContentMargins={includeContentMargins}
        excludeEndContentMargin={excludeEndContentMargin}
        testID={testID}
      />
    );
  }
) as <T>(props: Props<T> & { ref?: React.Ref<View> }) => JSX.Element;

import {
  Body,
  BodyProps,
  ComposedBodyFromArray,
  ContentWrapper,
  H2,
  HeaderSecondLevel,
  IOStyles,
  BodySmall,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps, forwardRef, ReactNode, useState } from "react";

import { LayoutChangeEvent, View } from "react-native";
import {
  BackProps,
  HeaderActionsProps,
  useHeaderProps
} from "../../hooks/useHeaderProps";
import { SupportRequestParams } from "../../hooks/useStartSupportRequest";
import I18n from "../../i18n";
import { WithTestID } from "../../types/WithTestID";
import { IOScrollView } from "./IOScrollView";

export type LargeHeaderTitleProps = {
  label: string;
  accessibilityLabel?: string;
  testID?: string;
  section?: string;
};

type Props = WithTestID<
  {
    children?: ReactNode;
    actions?: ComponentProps<typeof IOScrollView>["actions"];
    title: LargeHeaderTitleProps;
    description?: string | Array<BodyProps>;
    goBack?: BackProps["goBack"];
    ignoreSafeAreaMargin?: ComponentProps<
      typeof HeaderSecondLevel
    >["ignoreSafeAreaMargin"];
    includeContentMargins?: boolean;
    headerActionsProp?: HeaderActionsProps;
    canGoback?: boolean;
    excludeEndContentMargin?: boolean;
    ignoreAccessibilityCheck?: ComponentProps<
      typeof HeaderSecondLevel
    >["ignoreAccessibilityCheck"];
  } & SupportRequestParams
>;

/**
 * Special `IOScrollView` screen with a large title that is hidden by a transition when
 * the user scrolls. It also handles the contextual help and the FAQ.
 * Use of LargeHeader naming is due to similar behavior offered by the native iOS API.
 */
export const IOScrollViewWithLargeHeader = forwardRef<View, Props>(
  (
    {
      children,
      title,
      description,
      actions,
      goBack,
      canGoback = true,
      contextualHelp,
      contextualHelpMarkdown,
      faqCategories,
      ignoreSafeAreaMargin = false,
      includeContentMargins = false,
      headerActionsProp = {},
      excludeEndContentMargin,
      testID,
      ignoreAccessibilityCheck = false
    },
    ref
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

    return (
      <IOScrollView
        actions={actions}
        headerConfig={headerProps}
        snapOffset={titleHeight}
        includeContentMargins={false}
        excludeEndContentMargin={excludeEndContentMargin}
        testID={testID}
      >
        <View
          style={IOStyles.horizontalContentPadding}
          onLayout={getTitleHeight}
        >
          {title.section && (
            <BodySmall weight="Semibold" color={theme["textBody-tertiary"]}>
              {title.section}
            </BodySmall>
          )}
          <H2
            color={theme["textHeading-default"]}
            testID={title?.testID}
            ref={ref}
            accessible
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
        {children && (
          <>
            <VSpacer size={16} />
            {includeContentMargins ? (
              <ContentWrapper>{children}</ContentWrapper>
            ) : (
              children
            )}
          </>
        )}
      </IOScrollView>
    );
  }
);

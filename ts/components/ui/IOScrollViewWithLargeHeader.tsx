import {
  Body,
  ContentWrapper,
  H2,
  HeaderSecondLevel,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React, { ComponentProps, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import {
  BackProps,
  HeaderActionProps,
  useHeaderProps
} from "../../hooks/useHeaderProps";
import { SupportRequestParams } from "../../hooks/useStartSupportRequest";
import I18n from "../../i18n";
import { IOScrollView } from "./IOScrollView";

export type LargeHeaderTitleProps = {
  label: string;
  accessibilityLabel?: string;
  testID?: string;
};

type Props = {
  children: React.ReactNode;
  actions?: ComponentProps<typeof IOScrollView>["actions"];
  title: LargeHeaderTitleProps;
  description?: string;
  goBack?: BackProps["goBack"];
  headerActionsProp?: HeaderActionProps;
  canGoback?: boolean;
} & SupportRequestParams;

/**
 * Special `IOScrollView` screen with a large title that is hidden by a transition when
 * the user scrolls. It also handles the contextual help and the FAQ.
 * Use of LargeHeader naming is due to similar behavior offered by the native iOS API.
 */
export const IOScrollViewWithLargeHeader = ({
  children,
  title,
  description,
  actions,
  goBack,
  canGoback = true,
  contextualHelp,
  contextualHelpMarkdown,
  faqCategories,
  headerActionsProp = {}
}: Props) => {
  const [titleHeight, setTitleHeight] = useState(0);

  const navigation = useNavigation();

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

  const headerProps: ComponentProps<typeof HeaderSecondLevel> = useHeaderProps(
    canGoback
      ? {
          ...headerPropsWithoutGoBack,
          backAccessibilityLabel: I18n.t("global.buttons.back"),
          goBack: goBack ?? navigation.goBack
        }
      : headerPropsWithoutGoBack
  );

  return (
    <IOScrollView
      actions={actions}
      headerConfig={headerProps}
      snapOffset={titleHeight}
      includeContentMargins={false}
    >
      <View style={IOStyles.horizontalContentPadding} onLayout={getTitleHeight}>
        <H2
          testID={title.testID}
          accessibilityLabel={title.accessibilityLabel ?? title.label}
          accessibilityRole="header"
        >
          {title.label}
        </H2>
      </View>

      {description && (
        <ContentWrapper>
          <VSpacer size={4} />
          <Body color="grey-700">{description}</Body>
        </ContentWrapper>
      )}

      <VSpacer size={16} />

      {children}
    </IOScrollView>
  );
};

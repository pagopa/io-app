import {
  BodySmall,
  ContentWrapper,
  H2,
  HeaderSecondLevel,
  IOMarkdownLite,
  useIOTheme,
  VSpacer,
  VStack
} from "@io-app/design-system";
import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { ComponentProps, ReactNode, Ref, useMemo, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import Animated, { AnimatedRef } from "react-native-reanimated";

import {
  BackProps,
  HeaderActionsProps,
  useHeaderProps
} from "../../hooks/useHeaderProps";
import { SupportRequestParams } from "../../hooks/useStartSupportRequest";
import { WithTestID } from "../../types/WithTestID";
import { useIOAlertVisible } from "../StatusMessages/IOAlertVisibleContext";
import { IOScrollView } from "./IOScrollView";

export type LargeHeaderTitleProps = {
  accessibilityLabel?: string;
  label: string;
  section?: string;
  testID?: string;
};

type Props = WithTestID<
  SupportRequestParams & {
    actions?: ComponentProps<typeof IOScrollView>["actions"];
    alwaysBounceVertical?: boolean;
    animatedRef?: AnimatedRef<Animated.ScrollView>;
    canGoback?: boolean;
    children?: ReactNode;
    contentContainerStyle?: ComponentProps<
      typeof IOScrollView
    >["contentContainerStyle"];
    description?: string;
    excludeEndContentMargin?: boolean;
    goBack?: BackProps["goBack"];
    headerActionsProp?: HeaderActionsProps;
    ignoreAccessibilityCheck?: ComponentProps<
      typeof HeaderSecondLevel
    >["ignoreAccessibilityCheck"];
    ignoreSafeAreaMargin?: ComponentProps<
      typeof HeaderSecondLevel
    >["ignoreSafeAreaMargin"];
    includeContentMargins?: boolean;
    onDescriptionLinkPress?: (url: string) => void;
    ref?: Ref<View>;
    title: LargeHeaderTitleProps;
    topElement?: ReactNode;
  }
>;

/**
 * Special `IOScrollView` screen with a large title that is hidden by a transition when
 * the user scrolls. It also handles the contextual help and the FAQ.
 * Use of LargeHeader naming is due to similar behavior offered by the native iOS API.
 */
export const IOScrollViewWithLargeHeader = ({
  ref,
  children,
  title,
  description,
  onDescriptionLinkPress,
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
  ignoreAccessibilityCheck = false,
  animatedRef,
  topElement = undefined,
  alwaysBounceVertical,
  contentContainerStyle
}: Props) => {
  const [titleHeight, setTitleHeight] = useState(0);

  const { isAlertVisible } = useIOAlertVisible();

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

  const computeIgnoreSafeAreaMargin = useMemo(() => {
    if (isAlertVisible) {
      return true;
    }
    return ignoreSafeAreaMargin;
  }, [ignoreSafeAreaMargin, isAlertVisible]);

  const headerProps: ComponentProps<typeof HeaderSecondLevel> = {
    ignoreSafeAreaMargin: computeIgnoreSafeAreaMargin,
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
      alwaysBounceVertical={alwaysBounceVertical}
      animatedRef={animatedRef}
      contentContainerStyle={contentContainerStyle}
      excludeEndContentMargin={excludeEndContentMargin}
      headerConfig={headerProps}
      includeContentMargins={false}
      snapOffset={titleHeight}
      testID={testID}
      topElement={topElement}
    >
      <ContentWrapper onLayout={getTitleHeight}>
        <VStack space={8}>
          {title.section && (
            <BodySmall color={theme["textBody-tertiary"]} weight="Semibold">
              {title.section}
            </BodySmall>
          )}
          <H2
            accessibilityLabel={title.accessibilityLabel ?? title.label}
            accessibilityRole="header"
            color={theme["textHeading-default"]}
            ref={ref}
            testID={title?.testID}
          >
            {title.label}
          </H2>
        </VStack>
      </ContentWrapper>

      {description && (
        <ContentWrapper>
          <VSpacer size={16} />
          <IOMarkdownLite
            content={description}
            onLinkPress={onDescriptionLinkPress}
          />
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
};

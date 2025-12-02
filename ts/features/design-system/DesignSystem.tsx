import {
  BodySmall,
  Divider,
  H2,
  IOVisualCostants,
  ListItemNav,
  VSpacer,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { SectionList } from "react-native";
import { useScreenEndMargin } from "../../hooks/useScreenEndMargin";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import DESIGN_SYSTEM_ROUTES from "./navigation/routes";

type SingleSectionProps = {
  title: string;
  description?: string;
  route: string;
};

type RoutesProps = Array<SingleSectionProps>;

const DATA_ROUTES_FOUNDATION: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.FOUNDATION
);
const DATA_ROUTES_COMPONENTS: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.COMPONENTS
);
const DATA_ROUTES_HEADERS: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.HEADERS
);
const DATA_ROUTES_EXPERIMENTAL_LAB: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.EXPERIMENTAL_LAB
);
const DATA_ROUTES_DEBUG: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.DEBUG
);
const DATA_ROUTES_SCREENS: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.SCREENS
);

type SectionDataProps = {
  title: string;
  description?: string;
  data: RoutesProps;
};

const DESIGN_SYSTEM_SECTION_DATA: Array<SectionDataProps> = [
  {
    title: "Foundation",
    data: DATA_ROUTES_FOUNDATION
  },
  {
    title: "Components",
    data: DATA_ROUTES_COMPONENTS
  },
  {
    title: "Headers",
    data: DATA_ROUTES_HEADERS
  },
  {
    title: "Screens",
    data: DATA_ROUTES_SCREENS
  },
  {
    title: "Experimental lab",
    data: DATA_ROUTES_EXPERIMENTAL_LAB
  },
  {
    title: "Debug",
    data: DATA_ROUTES_DEBUG
  }
];

export const DesignSystem = () => {
  const theme = useIOTheme();
  const navigation = useIONavigation();

  const { screenEndMargin } = useScreenEndMargin();

  const renderDSNavItem = ({
    item: { title, route }
  }: {
    item: { title: string; route: string };
  }) => (
    <ListItemNav
      accessibilityLabel={`Go to the ${title} page`}
      value={title}
      onPress={() => navigation.navigate(route as any)}
    />
  );

  const renderDSSection = ({
    section: { title, description }
  }: {
    section: { title: string; description?: string };
  }) => (
    <VStack space={4}>
      <H2 weight="Bold" color={theme["textHeading-default"]}>
        {title}
      </H2>
      {description && (
        <BodySmall weight={"Regular"} color={theme["textBody-tertiary"]}>
          {description}
        </BodySmall>
      )}
    </VStack>
  );

  const renderDSSectionFooter = ({ section }: { section: SectionDataProps }) =>
    /* We exclude the last section because
    we already apply the `screenEndMargin` */
    DESIGN_SYSTEM_SECTION_DATA.indexOf(section) !==
    DESIGN_SYSTEM_SECTION_DATA.length - 1 ? (
      <VSpacer size={32} />
    ) : null;

  return (
    <SectionList
      keyExtractor={(item, index) => `${item.route}-${index}`}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault,
        paddingTop: IOVisualCostants.appMarginDefault,
        paddingBottom: screenEndMargin
      }}
      renderSectionHeader={renderDSSection}
      renderSectionFooter={renderDSSectionFooter}
      SectionSeparatorComponent={() => <VSpacer size={8} />}
      renderItem={renderDSNavItem}
      ItemSeparatorComponent={() => <Divider />}
      sections={DESIGN_SYSTEM_SECTION_DATA}
    />
  );
};

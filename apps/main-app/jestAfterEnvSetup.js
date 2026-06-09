import { configure } from "@testing-library/react-native";

/**
 * Default value for includeHiddenElements query option for all queries.
 * When set to true all queries will match elements hidden from accessibility.
 * Otherwise tests which queries hidden element for accessibility will fail.
 */
configure({ defaultIncludeHiddenElements: true });

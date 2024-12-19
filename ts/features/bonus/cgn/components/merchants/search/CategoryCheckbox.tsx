import {
  IOCategoryIcons,
  ListItemCheckbox
} from "@pagopa/io-app-design-system";

type Props = {
  text: string;
  icon: IOCategoryIcons;
  value: string;
  checked: boolean;
  onPress: (value: string) => void;
};

const CategoryCheckbox = ({ text, icon, checked }: Props) => (
  <ListItemCheckbox value={text.toUpperCase()} icon={icon} selected={checked} />
);

export default CategoryCheckbox;

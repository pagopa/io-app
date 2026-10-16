import { ListItemInfo } from "@io-app/design-system";
import { ComponentProps } from "react";

import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";

type Props = ComponentProps<typeof ListItemInfo> & {
  copyable?: boolean;
  copyableValue?: string;
};

export const PaymentListItemInfo = ({
  copyable = true,
  copyableValue,
  value,
  ...rest
}: Props) => {
  const handleOnCopy = () => {
    if (typeof value === "string" && !copyableValue) {
      clipboardSetStringWithFeedback(value);
    } else if (copyableValue) {
      clipboardSetStringWithFeedback(copyableValue);
    }
  };

  return (
    <ListItemInfo
      onLongPress={copyable ? handleOnCopy : undefined}
      value={value}
      {...rest}
    />
  );
};

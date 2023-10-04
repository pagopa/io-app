import * as React from "react";
import ItwLoadingSpinner from "../ItwLoadingSpinner";
import { ListItemItw } from "./ListItemItw";

type ListItemLoadingView = React.ComponentProps<typeof ListItemItw> & {
  loading: boolean;
};

const ListItemLoadingItw = (props: ListItemLoadingView) =>
  props.loading ? (
    <ListItemItw {...props} rightNode={<ItwLoadingSpinner />} />
  ) : (
    <ListItemItw {...props} />
  );

export default ListItemLoadingItw;

import {
  CollapseIcon,
  Copy01Icon,
  ExpandIcon
} from "@hugeicons/core-free-icons";
import { useState } from "react";

import { IconButton } from "../IconButton";
import { JsonNode } from "./JsonNode";

type Props = {
  initiallyOpen?: boolean;
  toolbar?: boolean;
  value: unknown;
};

const expandedPaths = (
  value: unknown,
  path: Array<string> = []
): Array<string> =>
  typeof value === "object" && value !== null
    ? [
        JSON.stringify(path),
        ...Object.entries(value).flatMap(([key, child]) =>
          expandedPaths(child, [...path, key])
        )
      ]
    : [];

export const JsonTree = ({
  value,
  toolbar = false,
  initiallyOpen = false
}: Props) => {
  const [expanded, setExpanded] = useState(
    () => new Set(initiallyOpen ? [JSON.stringify([])] : [])
  );
  const onToggle = (id: string, open: boolean) =>
    setExpanded(current => {
      if (current.has(id) === open) {
        return current;
      }
      const next = new Set(current);
      if (open) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });

  return (
    <div className="json-root">
      {toolbar && (
        <div className="json-toolbar toolbar">
          <IconButton
            icon={ExpandIcon}
            label="Expand all"
            onClick={() => setExpanded(new Set(expandedPaths(value)))}
          />
          <IconButton
            icon={CollapseIcon}
            label="Collapse all"
            onClick={() => setExpanded(new Set())}
          />
          <IconButton
            icon={Copy01Icon}
            label="Copy JSON"
            onClick={() => {
              void navigator.clipboard.writeText(
                JSON.stringify(value, null, 2) ?? ""
              );
            }}
          />
        </div>
      )}
      <div className="json-tree">
        <JsonNode
          expanded={expanded}
          onToggle={onToggle}
          path={[]}
          value={value}
        />
      </div>
    </div>
  );
};

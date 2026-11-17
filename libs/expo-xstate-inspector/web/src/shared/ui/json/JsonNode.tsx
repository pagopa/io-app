import type { ReactNode } from "react";

type Props = {
  expanded: ReadonlySet<string>;
  name?: string;
  onToggle: (id: string, open: boolean) => void;
  path: Array<string>;
  value: unknown;
};

const PREVIEW_ENTRIES = 5;

const typeOf = (value: unknown) =>
  value === null ? "null" : Array.isArray(value) ? "array" : typeof value;

const Primitive = ({ value }: { value: unknown }) => (
  <span className={`json-${typeOf(value)}`}>
    {value === undefined ? "undefined" : JSON.stringify(value)}
  </span>
);

const nestedPreview = (value: object) =>
  Array.isArray(value)
    ? `Array(${value.length})`
    : Object.keys(value).length
      ? "{…}"
      : "{}";

const preview = (value: object): ReactNode => {
  const isArray = Array.isArray(value);
  const entries = Object.entries(value);
  const shown = entries.slice(0, PREVIEW_ENTRIES).map(([key, child], index) => (
    <span key={key}>
      {index > 0 && ", "}
      {!isArray && <span className="json-key">{key}: </span>}
      {typeof child === "object" && child !== null ? (
        <span className="json-preview">{nestedPreview(child)}</span>
      ) : (
        <Primitive value={child} />
      )}
    </span>
  ));
  const more = entries.length > PREVIEW_ENTRIES ? ", …" : "";
  return isArray ? (
    <>
      <span className="json-preview">({entries.length}) </span>[{shown}
      {more}]
    </>
  ) : (
    <>
      {"{"}
      {shown}
      {more}
      {"}"}
    </>
  );
};

export const JsonNode = ({ name, value, path, expanded, onToggle }: Props) => {
  const entries =
    typeof value === "object" && value !== null ? Object.entries(value) : [];
  const label =
    name === undefined ? null : <span className="json-key">{name}: </span>;
  const id = JSON.stringify(path);
  const open = expanded.has(id);

  return entries.length ? (
    <details
      onToggle={event => onToggle(id, event.currentTarget.open)}
      open={open}
    >
      <summary>
        {label}
        {open ? (
          <span className="json-preview">{nestedPreview(value as object)}</span>
        ) : (
          preview(value as object)
        )}
      </summary>
      {entries.map(([key, child]) => (
        <JsonNode
          expanded={expanded}
          key={key}
          name={key}
          onToggle={onToggle}
          path={[...path, key]}
          value={child}
        />
      ))}
    </details>
  ) : (
    <div>
      {label}
      <Primitive value={value} />
    </div>
  );
};

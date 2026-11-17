type Props = {
  expanded: ReadonlySet<string>;
  name?: string;
  onToggle: (id: string, open: boolean) => void;
  path: Array<string>;
  value: unknown;
};

export const JsonNode = ({ name, value, path, expanded, onToggle }: Props) => {
  const type =
    value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  const entries =
    typeof value === "object" && value !== null ? Object.entries(value) : [];
  const label =
    name === undefined ? null : <span className="json-key">{name}: </span>;
  const id = JSON.stringify(path);

  return entries.length ? (
    <details
      onToggle={event => onToggle(id, event.currentTarget.open)}
      open={expanded.has(id)}
    >
      <summary>
        {label}
        <span className="json-preview">
          {type === "array" ? "Array" : "Object"}({entries.length})
        </span>
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
      <span className={`json-${type}`}>
        {value === undefined ? "undefined" : JSON.stringify(value)}
      </span>
    </div>
  );
};

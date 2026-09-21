import type { ActorNode } from "../types";

export type ActorTreeProps = {
  actors: ReadonlyMap<string, ActorNode>;
  rootId: string;
};

const ActorBranch = ({
  actor,
  actors,
  visited
}: {
  actor: ActorNode;
  actors: ReadonlyMap<string, ActorNode>;
  visited: ReadonlySet<string>;
}) => {
  const nextVisited = new Set(visited).add(actor.id);
  const children = [...actors.values()].filter(
    child => child.parentId === actor.id && !nextVisited.has(child.id)
  );
  return (
    <li>
      <span className="actor-name">{actor.name}</span>
      <span className="actor-state">{actor.state ?? actor.status}</span>
      {children.length > 0 ? (
        <ul>
          {children.map(child => (
            <ActorBranch
              actor={child}
              actors={actors}
              key={child.id}
              visited={nextVisited}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

/** Shows the selected root machine and every actor spawned beneath it. */
export const ActorTree = ({ actors, rootId }: ActorTreeProps) => {
  const root =
    actors.get(rootId) ?? [...actors.values()].find(actor => !actor.parentId);
  if (root === undefined) {
    return <p className="note">{"Waiting for actor registration"}</p>;
  }
  return (
    <aside aria-label="Actor tree" className="actor-tree">
      <h2>{"Actors"}</h2>
      <ul>
        <ActorBranch actor={root} actors={actors} visited={new Set()} />
      </ul>
    </aside>
  );
};

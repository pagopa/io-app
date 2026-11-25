import type { ActorEntry } from "../../shared/inspector/types";

type Props = {
  machines: Array<ActorEntry>;
  onSelect: (sessionId: string) => void;
  selectedId: string | undefined;
};

export const ActorList = ({ machines, selectedId, onSelect }: Props) => (
  <aside
    aria-label="Machines"
    className="flex min-h-0 flex-col border-r border-divider bg-surface"
    id="machine-list"
  >
    <div className="border-b border-divider px-4 py-2">
      <h2 className="text-sm font-semibold">Machines</h2>
    </div>
    <nav
      aria-label="Select a machine"
      className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3"
      id="actors"
    >
      {machines.length ? (
        machines.map(([sessionId, actor]) => (
          <button
            aria-current={sessionId === selectedId}
            className={`machine-button${actor.snapshot?.status === "active" ? "" : " stopped"}`}
            key={sessionId}
            onClick={() => onSelect(sessionId)}
          >
            <span className="machine-name">{actor.name ?? sessionId}</span>
            <span className="machine-session">{sessionId}</span>
          </button>
        ))
      ) : (
        <p className="empty-state">
          Your machines will appear here when the app connects.
        </p>
      )}
    </nav>
    <p className="border-t border-divider px-5 py-4 text-xs leading-relaxed text-muted">
      Select a machine to inspect its states, context, and events.
    </p>
  </aside>
);

import { useState } from 'react';
import { useLibrary } from '../data/LibraryProvider';
import { useUserData } from '../store/UserDataProvider';
import { parseKey } from '../music';
import { Progression } from '../components/Progression';
import { KeyControl } from '../components/KeyControl';
import { FlagList, PageHeader } from '../components/ui';
import { NotationSwitch } from '../components/NotationSwitch';
import { Icon } from '../components/Icon';

export default function AccompanimentPage() {
  const lib = useLibrary();
  const notation = useUserData((d) => d.settings.notation);
  const [keys, setKeys] = useState<Record<string, string | null>>({});

  return (
    <div>
      <PageHeader
        eyebrow="Service Accompaniment"
        title="Prayer & offering"
        subtitle="Progressions for moments in the service that aren’t tied to a song."
        actions={
          <NotationSwitch />
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {lib.accompaniment.map((item) => {
          const k = keys[item.id] ?? item.key;
          return (
            <article key={item.id} className="card flex flex-col p-5">
              <header className="mb-3 flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon name={item.kind === 'reference' ? 'external' : 'service'} size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl font-semibold">{item.title}</h2>
                  <p className="text-xs text-muted">PDF page {item.page} · {item.key ? `Key of ${item.key}` : 'Key not given'}</p>
                </div>
              </header>
              {item.progression ? (
                <>
                  <div className="mb-3">
                    <KeyControl written={item.key} value={keys[item.id] ?? null} onChange={(v) => setKeys((s) => ({ ...s, [item.id]: v }))} />
                  </div>
                  <div className="rounded-xl bg-sunken px-4 py-3">
                    <Progression text={item.progression} keyCtx={parseKey(k)} notation={notation} size="lg" />
                  </div>
                  {notation !== 'nns' && !k && <p className="mt-2 text-xs text-warn">Pick a key to see chord names.</p>}
                </>
              ) : (
                <p className="text-sm italic text-faint">No progression written for this entry.</p>
              )}
              {item.notes.length > 0 && (
                <ul className="mt-3 space-y-1 border-l-2 border-accent/50 pl-3 text-sm">{item.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
              )}
              {item.reference && (
                <a href={item.reference.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                  <Icon name="external" size={15} /> {item.reference.label}
                </a>
              )}
              {item.flags.length > 0 && <div className="mt-4"><FlagList flags={item.flags} /></div>}
            </article>
          );
        })}
      </div>
    </div>
  );
}

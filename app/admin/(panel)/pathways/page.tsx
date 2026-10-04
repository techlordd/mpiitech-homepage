import { loadContent } from '@/lib/site';
import { store } from '@/lib/store';
import { PageHead } from '../../ui';
import PathwaysEditor from './editor';

export const metadata = { title: 'Pathways' };

export default async function PathwaysPage() {
  const [{ pathways }, interest] = await Promise.all([loadContent(), store().listSubmissions({ form: 'programme', limit: 10000 }).catch(() => ({ items: [] }))]);
  const counts: Record<string, number> = {};
  for (const s of interest.items) counts[s.summary] = (counts[s.summary] ?? 0) + 1;
  return <>
    <PageHead title="Pathways" description="The programmes shown in the “Find your starting point” section of the home page. Add, edit, reorder, hide or remove them."/>
    <PathwaysEditor initial={pathways} interest={counts}/>
  </>;
}

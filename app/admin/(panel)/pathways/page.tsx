import { loadContent } from '@/lib/site';
import { portalPage } from '@/lib/content';
import { waitingCounts } from '@/lib/subscribers';
import { PageHead } from '../../ui';
import PathwaysEditor from './editor';

export const metadata = { title: 'Pathways' };

export default async function PathwaysPage() {
  const [{ pathways }, counts] = await Promise.all([loadContent(), waitingCounts().catch(() => ({}))]);
  return <>
    <PageHead title="Pathways" description="The programmes shown in the “Find your starting point” section of the home page. Add, edit, reorder, hide or remove them."/>
    <PathwaysEditor initial={pathways} interest={counts} portalUrl={portalPage('/apply') ?? ''}/>
  </>;
}

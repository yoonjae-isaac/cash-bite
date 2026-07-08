import type { Metadata } from 'next';
import { TOOLS, TOOLS_UI } from '../../src/domain/tools/catalog';
import { pageMetadata, SITE_URL } from '../../src/config/site';
import JsonLd from '../../src/components/app/JsonLd';
import ToolsHub from '../../src/components/tools/ToolsHub';

export const metadata: Metadata = pageMetadata({
  title: TOOLS_UI.hubTitle.ko,
  description: '주린이를 위한 투자 계산기 모음 — 물타기·복리·손절익절·양도세·배당 등 12종. API 없이 바로 계산.',
  path: '/tools',
});

export default function Page() {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: TOOLS_UI.hubTitle.ko,
    itemListElement: TOOLS.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.title.ko,
      url: `${SITE_URL}/tools/${t.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={itemList} />
      <ToolsHub />
    </>
  );
}

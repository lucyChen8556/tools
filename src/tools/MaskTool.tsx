import { useState } from 'react';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { ImageMaskPanel } from './mask/ImageMaskPanel';
import { TextMaskPanel } from './mask/TextMaskPanel';
import { maskToolTabs, type MaskToolTab } from './mask/constants';

function MaskTool() {
  const [tab, setTab] = useState<MaskToolTab>('text');

  return (
    <section className="tool-surface">
      <SegmentedTabs ariaLabel="Mask tool mode" options={maskToolTabs} value={tab} onChange={setTab} />
      {tab === 'text' ? <TextMaskPanel /> : <ImageMaskPanel />}
    </section>
  );
}

export { MaskTool };

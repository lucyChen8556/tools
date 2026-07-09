import { useCallback, useMemo, useState } from 'react';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { ColorContrastSection } from './color/components/ColorContrastSection';
import { ColorConvertSection } from './color/components/ColorConvertSection';
import { ColorGeneratorSection } from './color/components/ColorGeneratorSection';
import { ColorPaletteSection } from './color/components/ColorPaletteSection';
import { colorDefaults, colorToolTabs, type ColorToolTab } from './color/colorUtils';

function ColorTool() {
  const [activeTab, setActiveTab] = useState<ColorToolTab>(colorDefaults.activeTab);
  const [value, setValue] = useState(colorDefaults.value);
  const [foreground, setForeground] = useState(colorDefaults.foreground);
  const [background, setBackground] = useState(colorDefaults.background);
  const [paletteInput, setPaletteInput] = useState(colorDefaults.paletteInput);
  const [generatorColor, setGeneratorColor] = useState(colorDefaults.generatorColor);
  const [generatorCount, setGeneratorCount] = useState(colorDefaults.generatorCount);

  const useColorInConverter = useCallback((hex: string) => {
    setValue(hex);
    setActiveTab('convert');
  }, []);

  const activeTabContent = useMemo(
    () => ({
      convert: <ColorConvertSection value={value} onValueChange={setValue} />,
      palette: <ColorPaletteSection paletteInput={paletteInput} onPaletteInputChange={setPaletteInput} onUseColor={useColorInConverter} />,
      generate: (
        <ColorGeneratorSection
          generatorColor={generatorColor}
          generatorCount={generatorCount}
          onGeneratorColorChange={setGeneratorColor}
          onGeneratorCountChange={setGeneratorCount}
          onUseColor={useColorInConverter}
        />
      ),
      contrast: (
        <ColorContrastSection
          foreground={foreground}
          background={background}
          onForegroundChange={setForeground}
          onBackgroundChange={setBackground}
        />
      ),
    }),
    [background, foreground, generatorColor, generatorCount, paletteInput, useColorInConverter, value],
  );

  return (
    <section className="tool-surface">
      <SegmentedTabs ariaLabel="Color tool mode" options={colorToolTabs} value={activeTab} onChange={setActiveTab} />
      {activeTabContent[activeTab]}
    </section>
  );
}
export { ColorTool };

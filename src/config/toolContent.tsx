import type { ComponentType } from 'react';
import { ColorTool } from '../tools/ColorTool';
import { CssUnitTool } from '../tools/CssUnitTool';
import { CsvTool } from '../tools/CsvTool';
import { DiscountTool } from '../tools/DiscountTool';
import { EncodeTool } from '../tools/EncodeTool';
import { ExpenseTool } from '../tools/ExpenseTool';
import { HashTool } from '../tools/HashTool';
import { ImageTool } from '../tools/ImageTool';
import { InvoiceTool } from '../tools/InvoiceTool';
import { JsonTool } from '../tools/JsonTool';
import { JwtTool } from '../tools/JwtTool';
import { MarkdownTableTool } from '../tools/MarkdownTableTool';
import { MaskTool } from '../tools/MaskTool';
import { NumberTool } from '../tools/NumberTool';
import { RandomizerTool } from '../tools/RandomizerTool';
import { RegexTool } from '../tools/RegexTool';
import { SeasonColorTool } from '../tools/SeasonColorTool';
import { SubscriptionTool } from '../tools/SubscriptionTool';
import { TextCleanerTool } from '../tools/TextCleanerTool';
import { TextDiffTool } from '../tools/TextDiffTool';
import { TextTool } from '../tools/TextTool';
import { TimeTool } from '../tools/TimeTool';
import { UrlTool } from '../tools/UrlTool';
import { WorkdayTool } from '../tools/WorkdayTool';
import type { ToolId } from '../types';

const toolComponents: Record<ToolId, ComponentType> = {
  json: JsonTool,
  'text-diff': TextDiffTool,
  'markdown-table': MarkdownTableTool,
  'text-cleaner': TextCleanerTool,
  mask: MaskTool,
  time: TimeTool,
  workday: WorkdayTool,
  text: TextTool,
  image: ImageTool,
  color: ColorTool,
  'season-color': SeasonColorTool,
  regex: RegexTool,
  jwt: JwtTool,
  hash: HashTool,
  url: UrlTool,
  number: NumberTool,
  'css-unit': CssUnitTool,
  expense: ExpenseTool,
  discount: DiscountTool,
  invoice: InvoiceTool,
  subscription: SubscriptionTool,
  randomizer: RandomizerTool,
  encode: EncodeTool,
  csv: CsvTool,
};

function getToolContent(id: ToolId) {
  const ToolComponent = toolComponents[id];
  return <ToolComponent />;
}

export { getToolContent, toolComponents };

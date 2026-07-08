import type { ColorGroup, PaletteCategory, SeasonKey, SeasonProfile, Subtype } from './seasonColorTypes';

type BaseSeason = {
  name: string;
  label: string;
  description: string;
  guidance: string;
  avoid: string;
  profile: SeasonProfile;
  hero: string[];
  palette: Array<[string, string]>;
};

const seasonData: Record<SeasonKey, BaseSeason> = {
  spring: {
    name: '明亮春季',
    label: 'Spring palette',
    description: '整體偏暖、明亮且彩度清透，適合帶陽光感、活潑但不厚重的顏色。',
    guidance: '以奶油白、杏桃、清亮草綠與珊瑚做臉部附近主色，妝感保持透明、光澤與乾淨邊界。',
    avoid: '灰濁卡其、厚重酒紅、霧面深棕與帶灰感的藍紫。',
    profile: { warmth: 0.72, lightness: 0.72, chroma: 0.76, contrast: 0.42, depth: 0.28 },
    hero: ['#F7C65D', '#FF8F70', '#7AC47F', '#F6E7C8', '#5DB8C6'],
    palette: [
      ['奶油白', '#F7EBCB'],
      ['杏桃粉', '#F7A884'],
      ['珊瑚橘', '#F36F5F'],
      ['向日葵黃', '#F2C84B'],
      ['嫩草綠', '#8BCB74'],
      ['薄荷藍', '#74C7BE'],
      ['暖海軍藍', '#2D5872'],
      ['亮桃紫', '#D36EA3'],
      ['青蘋果', '#9AD66F'],
      ['金盞花', '#ECA23A'],
      ['暖駝', '#C89B61'],
      ['清莓紅', '#D94F70'],
    ],
  },
  summer: {
    name: '柔和夏季',
    label: 'Summer palette',
    description: '整體偏冷、明度柔亮且彩度霧面，適合像晨霧一樣低對比的冷調色。',
    guidance: '以霧粉、灰藍、鼠尾草綠與珍珠白靠近臉部，妝感適合柔焦、低對比與銀色金屬。',
    avoid: '螢光橘、芥末黃、焦糖棕、純黑白高反差與過度暖金色。',
    profile: { warmth: 0.24, lightness: 0.68, chroma: 0.36, contrast: 0.32, depth: 0.32 },
    hero: ['#B9C7D9', '#D9A9B8', '#8FAE9F', '#ECE7E3', '#8D8AAB'],
    palette: [
      ['珍珠白', '#ECE7E3'],
      ['玫瑰霧粉', '#D7A6B4'],
      ['薰衣草', '#B8A8CF'],
      ['灰藍', '#8BA7C2'],
      ['鼠尾草', '#93AA99'],
      ['莓果粉', '#B95F78'],
      ['柔霧海軍', '#4B5F7A'],
      ['冷灰棕', '#8A7E79'],
      ['月光灰', '#C6C8CA'],
      ['冷薄荷', '#A7C9BE'],
      ['柔酒紅', '#713A4A'],
      ['藍莓霧', '#59677F'],
    ],
  },
  autumn: {
    name: '溫暖秋季',
    label: 'Autumn palette',
    description: '整體偏暖、明度較深且彩度柔和，適合帶自然土壤感與成熟深度的顏色。',
    guidance: '以橄欖綠、駝色、陶土、肉桂與暖墨藍做主色，妝感可放在磚紅、棕調玫瑰與古銅金。',
    avoid: '冰白、亮銀、冷粉、螢光色與藍光很明顯的紫紅。',
    profile: { warmth: 0.78, lightness: 0.38, chroma: 0.44, contrast: 0.52, depth: 0.68 },
    hero: ['#A85D36', '#C89A55', '#6E7C45', '#4C332A', '#D6C09A'],
    palette: [
      ['燕麥白', '#E5D6B8'],
      ['駝色', '#B9854D'],
      ['陶土橘', '#B75B36'],
      ['肉桂棕', '#8B4F32'],
      ['橄欖綠', '#6F7C45'],
      ['森林松', '#3F5C4A'],
      ['芥末黃', '#C49B32'],
      ['暖墨藍', '#314D56'],
      ['焦糖', '#B66E2E'],
      ['沙漠玫瑰', '#B87868'],
      ['孔雀綠', '#2F6D66'],
      ['墨茶黑', '#2C2520'],
    ],
  },
  winter: {
    name: '冷冽冬季',
    label: 'Winter palette',
    description: '整體偏冷、深淺對比強且輪廓清楚，適合乾淨、銳利、存在感高的顏色。',
    guidance: '以純白、黑、寶石藍、冷紅、紫莓與祖母綠建立清楚對比，唇色適合莓紅、酒紅與冷調玫瑰。',
    avoid: '霧感米色、灰濁橄欖、焦糖棕、橘棕唇色與低對比粉膚色。',
    profile: { warmth: 0.18, lightness: 0.36, chroma: 0.62, contrast: 0.78, depth: 0.72 },
    hero: ['#101820', '#F7F8FA', '#A0143E', '#184D8B', '#00856F'],
    palette: [
      ['冰白', '#F7F8FA'],
      ['純黑', '#111318'],
      ['寶石藍', '#1458A8'],
      ['冷紅', '#B4123D'],
      ['紫莓', '#6F2C7E'],
      ['祖母綠', '#00856F'],
      ['亮銀灰', '#C8CDD3'],
      ['深葡萄', '#332249'],
      ['皇家藍', '#203A8F'],
      ['洋紅', '#C0007A'],
      ['冰粉', '#F4C9D8'],
      ['墨黑', '#050608'],
    ],
  },
};

const paletteCategories: Array<{ key: PaletteCategory; label: string; note: string }> = [
  { key: 'neutral', label: '基礎中性色', note: '外套、襯衫、褲裙與大面積底色' },
  { key: 'main', label: '主色', note: '上衣、洋裝、針織與靠近臉部的主視覺' },
  { key: 'accent', label: '點綴色', note: '包包、鞋、絲巾、指甲與小面積亮點' },
  { key: 'lip', label: '唇頰色', note: '口紅、腮紅、飾品與妝感重點' },
  { key: 'deep', label: '深色支撐', note: '眼線、外套、皮件與增加輪廓的深色' },
];

const seasonSubtypes: Record<SeasonKey, Subtype[]> = {
  spring: [
    { key: 'lightSpring', name: '淺春 Light Spring', summary: '春季裡最輕盈的一型，適合奶油白、蜜桃、清亮淺綠與水藍。', profile: { warmth: 0.62, lightness: 0.78, chroma: 0.58, contrast: 0.3, depth: 0.22 }, traits: ['明度高', '對比偏低', '暖度柔和'] },
    { key: 'warmSpring', name: '暖春 Warm Spring', summary: '春季裡暖度最明顯，適合陽光感黃、杏桃、珊瑚與暖綠。', profile: { warmth: 0.82, lightness: 0.62, chroma: 0.62, contrast: 0.4, depth: 0.36 }, traits: ['暖度主導', '中等明度', '清透不濁'] },
    { key: 'clearSpring', name: '亮春 Clear Spring', summary: '春季裡最清亮的一型，適合高彩度、乾淨、帶活力的顏色。', profile: { warmth: 0.58, lightness: 0.58, chroma: 0.82, contrast: 0.58, depth: 0.42 }, traits: ['彩度高', '對比中高', '色感清亮'] },
  ],
  summer: [
    { key: 'lightSummer', name: '淺夏 Light Summer', summary: '夏季裡最明亮輕柔的一型，適合霧粉、粉藍、珍珠白與淡紫。', profile: { warmth: 0.28, lightness: 0.78, chroma: 0.34, contrast: 0.26, depth: 0.22 }, traits: ['明度高', '低對比', '冷柔清淡'] },
    { key: 'coolSummer', name: '冷夏 Cool Summer', summary: '夏季裡冷度最明顯，適合灰藍、玫瑰粉、薰衣草與冷灰。', profile: { warmth: 0.16, lightness: 0.58, chroma: 0.38, contrast: 0.34, depth: 0.42 }, traits: ['冷度主導', '中等明度', '柔霧感'] },
    { key: 'softSummer', name: '柔夏 Soft Summer', summary: '夏季裡最柔霧的一型，適合灰粉、鼠尾草、霧藍與低彩度莓色。', profile: { warmth: 0.34, lightness: 0.5, chroma: 0.24, contrast: 0.28, depth: 0.5 }, traits: ['彩度低', '對比低', '灰霧感強'] },
  ],
  autumn: [
    { key: 'softAutumn', name: '柔秋 Soft Autumn', summary: '秋季裡最柔和的一型，適合暖灰褐、柔橄欖、沙漠玫瑰與低彩度土色。', profile: { warmth: 0.62, lightness: 0.5, chroma: 0.28, contrast: 0.34, depth: 0.5 }, traits: ['柔和低彩', '暖中帶灰', '對比不強'] },
    { key: 'warmAutumn', name: '暖秋 Warm Autumn', summary: '秋季裡暖度最明顯，適合駝色、芥末、陶土、南瓜橘與古銅。', profile: { warmth: 0.84, lightness: 0.4, chroma: 0.44, contrast: 0.48, depth: 0.64 }, traits: ['暖度主導', '中深明度', '土壤感'] },
    { key: 'deepAutumn', name: '深秋 Deep Autumn', summary: '秋季裡最深的一型，適合深橄欖、暖酒紅、墨茶黑、咖啡與石油藍。', profile: { warmth: 0.68, lightness: 0.26, chroma: 0.42, contrast: 0.64, depth: 0.76 }, traits: ['深色量高', '對比中高', '暖深色支撐'] },
  ],
  winter: [
    { key: 'deepWinter', name: '深冬 Deep Winter', summary: '冬季裡最深的一型，適合黑、深酒紅、墨藍、深葡萄與高對比配色。', profile: { warmth: 0.28, lightness: 0.22, chroma: 0.54, contrast: 0.76, depth: 0.82 }, traits: ['深色量最高', '高對比', '冷深輪廓'] },
    { key: 'coolWinter', name: '冷冬 Cool Winter', summary: '冬季裡冷度最明顯，適合冰白、冷紅、寶石藍、亮銀與純冷色。', profile: { warmth: 0.1, lightness: 0.36, chroma: 0.58, contrast: 0.72, depth: 0.66 }, traits: ['冷度主導', '清楚對比', '冰冷乾淨'] },
    { key: 'clearWinter', name: '亮冬 Clear Winter', summary: '冬季裡最清亮的一型，適合正紅、鈷藍、祖母綠、洋紅與黑白對比。', profile: { warmth: 0.22, lightness: 0.42, chroma: 0.86, contrast: 0.86, depth: 0.62 }, traits: ['彩度最高', '高對比', '顏色邊界清楚'] },
  ],
};

const groupMeta: Record<ColorGroup, { label: string; weight: number }> = {
  skin: { label: '皮膚', weight: 1.25 },
  eyes: { label: '眼睛', weight: 1.18 },
  sclera: { label: '眼白', weight: 0.82 },
  hair: { label: '頭髮', weight: 1.15 },
  brows: { label: '眉毛', weight: 0.95 },
  lips: { label: '嘴巴', weight: 1.1 },
  manual: { label: '手動', weight: 1 },
  reference: { label: '參考', weight: 1 },
  unknown: { label: '未分類', weight: 1 },
};

const photoEditableGroups: ColorGroup[] = ['skin', 'eyes', 'sclera', 'hair', 'brows', 'lips', 'unknown'];

const quickPalettes: Record<SeasonKey, string[]> = {
  spring: ['#F7C65D', '#FF8F70', '#8BCB74', '#F7EBCB'],
  summer: ['#D7A6B4', '#8BA7C2', '#93AA99', '#ECE7E3'],
  autumn: ['#B75B36', '#6F7C45', '#B9854D', '#314D56'],
  winter: ['#111318', '#F7F8FA', '#B4123D', '#1458A8'],
};

const seasonColorDefaults = {
  bulkInput: '皮膚 #D8B2A6 #C99B8F 眼睛 #4B3A35 #332725 眼白 #D5D8D8 頭髮 #2E2724 眉毛 #4A3C38 嘴巴 #A8666B #8A4A4F',
  color: '#D88C5A',
  status: '會自動辨識皮膚、眼睛、眼白、頭髮、眉毛、嘴巴與 HEX 色碼。',
  photoStatus: '會從照片推測皮膚、眼睛、眼白、頭髮、眉毛與唇色；光線越自然越準。',
};

export { groupMeta, paletteCategories, photoEditableGroups, quickPalettes, seasonColorDefaults, seasonData, seasonSubtypes };

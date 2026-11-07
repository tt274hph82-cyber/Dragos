import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import { STUDIO } from '../studio.config';

// Three faces: a heavy display face for the title card, a mono for on-screen readouts (timers, labels, chips),
// and a handwriting face for chalk and notes. All load from public/fonts (SIL Open Font License), so rendering
// works offline and in sandboxes that can't reach Google Fonts.

const local: [string, string, string][] = [
  ['Bricolage Grotesque', 'BricolageGrotesque-600.woff2', '600'],
  ['Bricolage Grotesque', 'BricolageGrotesque-700.woff2', '700'],
  ['Bricolage Grotesque', 'BricolageGrotesque-800.woff2', '800'],
  ['Fragment Mono', 'FragmentMono-400.woff2', '400'],
  ['Kalam', 'Kalam-400.woff2', '400'],
  ['Kalam', 'Kalam-700.woff2', '700'],
  ['Montserrat', 'Montserrat-800.woff2', '800'],
  ['Montserrat', 'Montserrat-900.woff2', '900'],
];
for (const [family, file, weight] of local) loadFont({ family, url: staticFile(`fonts/${file}`), weight });
if (STUDIO.titleFont) loadFont({ family: STUDIO.titleFont.family, url: staticFile(STUDIO.titleFont.file), weight: STUDIO.titleFont.weight });

export const FONT = {
  title: STUDIO.titleFont ? STUDIO.titleFont.family : 'Bricolage Grotesque',
  ui: 'Fragment Mono',
  hand: 'Kalam',
  /** the gaming Shorts' face (captions and game UI): heavy geometric sans, like the reference */
  game: 'Montserrat',
};

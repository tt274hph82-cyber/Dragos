import { defineStory, Timeline, StoryWord } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import episode from './episode.json';
import { SHOTS, Hud } from './shots';

// "What if your pet swallowed your mom?": a 6-minute 16:9 long-form in the blocky-game What If style.
export const petSwallowed = defineStory('PetSwallowed', { timeline: timeline as Timeline, shots: SHOTS, words: words as StoryWord[], capStyle: 'pop', capColors: (episode as any).captions.colors, snappy: true, capFont: 'Montserrat', overlay: Hud, landscape: true });

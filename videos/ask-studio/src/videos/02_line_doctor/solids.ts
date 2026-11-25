// No street solids in this story (open desert); gates waive nothing yet.
type Box = [number, number, number, number, number, number, string];
export const SOLIDS: Box[] = [];
export const LOGIC_SOLIDS: Box[] = [];
export const GATE_WAIVERS: {key: string; kind: string; why: string}[] = [
  {key: 'modern0', kind: 'OCCL', why: 'the subject is the road; a car driving past in front of it is the point of the shot'},
  {key: 'end2', kind: 'CROP', why: 'mid-whip frame, fully motion-blurred'},
  {key: 'end1', kind: 'CROP', why: 'last frame before the whip starts'},
  {key: 'stretch0', kind: 'CROP', why: 'one frame on the flash cut into the shot; the road fills the frame'},
];

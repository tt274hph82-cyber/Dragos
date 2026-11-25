// The downtown block's solids (the town sits at the origin); other locations are open sets.
import {townSolids} from '../../engine/kits/downtown/townData';
type Box = [number, number, number, number, number, number, string];
export const SOLIDS: Box[] = [...townSolids()];
export const LOGIC_SOLIDS: Box[] = townSolids().filter((b) => b[2] < 1.0 && !b[6].startsWith('far car'));
export const GATE_WAIVERS: {key: string; kind: string; why: string}[] = [];

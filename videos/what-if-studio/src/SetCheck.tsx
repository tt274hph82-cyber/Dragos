import React from 'react';
import { AbsoluteFill } from 'remotion';
import { KitDefs, SetDefs, Outdoor } from './engine';

// Preview a set on its own: npx remotion still src/index.ts SetCheck out/set.png --props='{"kind":"garden"}'
export const SetCheck: React.FC<{ kind: 'field' | 'street' | 'garden' }> = ({ kind }) => (
  <AbsoluteFill style={{ backgroundColor: '#14101C' }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <KitDefs />
      <SetDefs />
      <Outdoor t={20} kind={kind} id="chk" />
    </svg>
  </AbsoluteFill>
);

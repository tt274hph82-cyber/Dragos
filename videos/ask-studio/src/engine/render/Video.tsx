// BASIC render composition for the free kit: simple light rig + characters + set + captions.
// (The premium version adds ink outlines, grading, AO, bloom, depth of field — not included.)
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, Audio, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {LOOK_LIGHT, LOOK_SKY} from '../look/look';
import {TOTAL, warp} from '../core/clock';
import {stage, velocities} from '../core/staging';
import {camAt, applyCam, flashAt, Cam} from '../camera/camera';
import {Character} from '../chars/rig';
import {WORDS, CAPS} from '@story/timeline';
import {AUDIO, SetBefore, SetAfter, useSetData} from '@story/set';
import {moodOf, type Mood} from '@story/look';
import {EffectComposer, Bloom, Vignette, SMAA, BrightnessContrast, HueSaturation} from '@react-three/postprocessing';
export {TOTAL};

const Rig: React.FC<{c: Cam}> = ({c}) => { const {camera} = useThree(); camera.layers.enableAll(); applyCam(camera as THREE.PerspectiveCamera, c); return null; };   // characters live on a separate layer (NOINK)

/** key sun (soft shadows, snapped to shadow texels) + sky/ground fill + ambient; a story may give a mood per location (look.ts moodOf) */
const Lights: React.FC<{at: THREE.Vector3; m: Mood | null}> = ({at, m}) => {
  const L = LOOK_LIGHT, target = React.useMemo(() => new THREE.Object3D(), []);
  const q = 40 / 4096, sx = Math.round(at.x / q) * q, sz = Math.round(at.z / q) * q;   // snap to shadow texels (no edge crawl)
  target.position.set(sx, 0, sz);
  const off = m ? m.sun.map((v) => v * 2.2) : L.sunOff;
  return (<>
    <primitive object={target} />
    <ambientLight intensity={m ? m.ambI : L.ambI} color={m ? m.amb : L.amb} />
    <hemisphereLight args={[m ? m.sky : L.skyFill, m ? m.gnd : L.groundFill, m ? m.hemiI : L.hemiI]} />
    <directionalLight position={[sx + off[0], off[1], sz + off[2]]} target={target} intensity={m ? m.sunI : L.sunI} color={m ? m.sunC : L.sun} castShadow
      shadow-mapSize={[4096, 4096]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-camera-near={1} shadow-camera-far={120} shadow-bias={-0.0003} shadow-normalBias={0.03} />
  </>);
};

/** grade: bloom on glowing things only (threshold above white), soft vignette, a touch of film grain, SMAA */
const Post: React.FC<{m: Mood | null}> = ({m}) => (
  <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType}>
    <Bloom mipmapBlur luminanceThreshold={1.0} luminanceSmoothing={0.2} intensity={m?.bloom ?? 0.7} radius={0.7} />
    <BrightnessContrast brightness={0.0} contrast={0.06} />
    <HueSaturation saturation={0.06} />
    <Vignette eskil={false} offset={0.28} darkness={0.55} />
    <SMAA />
  </EffectComposer>);

/** captions: 1-3 words, white heavy + black outline, centred at 70 % height */
const Caption: React.FC<{f: number; width: number; height: number}> = ({f, width, height}) => {
  const t = f / 30; let ci = -1;
  for (let i = 0; i < CAPS.length; i++) if (WORDS[CAPS[i][0]][1] <= t) ci = i;
  if (ci < 0) return null;
  const [a, b] = CAPS[ci], end = WORDS[b][2] + 0.6, next = CAPS[ci + 1] ? WORDS[CAPS[ci + 1][0]][1] : 1e9;
  if (t > Math.min(end, next)) return null;
  const txt = WORDS.slice(a, b + 1).map((w) => w[0]).join(' ').toLowerCase(), k = width / 1080;
  return <div style={{position: 'absolute', left: 0, right: 0, top: height * 0.62, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: 'Impact, "Arial Black", sans-serif',
    fontSize: 74 * k, color: '#fff', WebkitTextStroke: `${11 * k}px #000`, paintOrder: 'stroke fill', padding: `0 ${50 * k}px`}}>{txt}</div>;
};

export const Video: React.FC = () => {
  const fr = useCurrentFrame(), {width, height} = useVideoConfig(), rt = fr / 30, f = warp(rt) * 30;
  const d = useSetData(), st = stage(f), md = moodOf((st as any).loc ?? '', f), cc = camAt(rt), cam = cc.p, vel = velocities(f, st), fl = flashAt(rt);
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {AUDIO.voice && <Audio src={staticFile(AUDIO.voice)} />}
      {AUDIO.bed && <Audio src={staticFile(AUDIO.bed)} />}
      <ThreeCanvas width={width} height={height} shadows="soft" gl={{toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: md?.exp ?? 1}} camera={{fov: 38, near: 0.12, far: 450}}>
        <color attach="background" args={[md?.fog?.[0] ?? LOOK_SKY.day.cap]} />
        <Rig c={cc} />
        <Lights at={cc.anchor} m={md} />
        {md?.fog && <fog attach="fog" args={md.fog} />}
        <SetBefore d={d} f={f} st={st} cam={cam} vel={vel} tod="day" />
        {st.people.map((p, i) => <Character key={i} c={p} f={f} cam={cam} vel={vel[i]} />)}
        <SetAfter d={d} f={f} st={st} cam={cam} vel={vel} tod="day" />
        <Post m={md} />
      </ThreeCanvas>
      {fl > 0 && <AbsoluteFill style={{backgroundColor: '#fff', opacity: fl}} />}
      <Caption f={fr} width={width} height={height} />
    </AbsoluteFill>
  );
};

import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setCrf(20);
// WebGL in headless Chrome. "swangle" (ANGLE + SwiftShader, software) works on
// GPU-less machines: cloud sandboxes, GitHub Actions. On a Mac/PC with a GPU,
// "angle" is faster: npx remotion render ... --gl=angle
Config.setChromiumOpenGlRenderer("swangle");
Config.setConcurrency(2);

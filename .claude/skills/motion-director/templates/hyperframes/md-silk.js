/*
 * motion-director SILK: a fluid light-ribbon ground in the brand's own
 * colours, drawn with WebGL from TIMELINE time (seekable, deterministic).
 *
 *   <canvas id="silk" class="md-silk"></canvas>
 *   MD.silk(tl, "#silk", { colors: ["#0b1020", "#0075DE", "#9ad8ff"], speed: 1, from: 0, to: 12 })
 *
 * colors: [ground, accent, highlight] as hex. The ribbons are folds of light
 * in the accent with a highlight on their crests; the ground stays the
 * ground. `intensity` 0-1 scales the ribbons (0.35 behind copy, 1 as hero).
 * Noise: Ashima/Stefan Gustavson simplex (MIT).
 */
(function () {
  const MD = (window.MD = window.MD || {});
  const hex3 = (h) => { const n = parseInt(String(h).replace("#", ""), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
  const FS = `precision highp float;
uniform vec2 uRes; uniform float uT; uniform vec3 uG; uniform vec3 uA; uniform vec3 uH; uniform float uI; uniform float uAng;
vec3 m289(vec3 x){return x-floor(x*(1./289.))*289.;} vec4 m289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return m289(((x*34.)+1.)*x);} vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}
float sn(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
i=m289(i);vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 nr=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=nr.x;p1*=nr.y;p2*=nr.z;p3*=nr.w;
vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes; float ar=uRes.x/uRes.y; vec2 p=vec2(uv.x*ar,uv.y); float t=uT*.09;
  vec2 w=p+vec2(sn(vec3(p*1.2,t*.6)),sn(vec3(p*1.2+40.,t*.6)))*.22;
  float r=dot(w,vec2(cos(uAng),sin(uAng)));
  float f1=sin(r*6.5+t*2.2+sn(vec3(w*.9,t))*1.6);
  float f2=sin(r*4.2-t*1.5+sn(vec3(w*1.3+20.,t*.7))*2.1);
  float band=smoothstep(.15,.95,.5+.5*f1)*smoothstep(-.2,.9,.5+.5*f2);
  float crest=pow(1.-abs(f1),7.)*.9+pow(1.-abs(f2),9.)*.5;
  vec3 col=uG;
  col=mix(col,uA,band*.85*uI);
  col+=uH*crest*.55*uI;
  col+=uA*pow(band,3.)*.25*uI;
  float vig=1.-smoothstep(.45,1.35,length((uv-.5)*vec2(1.2,1.)));
  col*=.78+.32*vig;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`;
  const VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";

  MD.silk = (tl, sel, o = {}) => {
    const cv = typeof sel === "string" ? document.querySelector(sel) : sel;
    const root = document.querySelector("[data-composition-id]");
    const W = +root.dataset.width, H = +root.dataset.height;
    cv.width = W; cv.height = H;
    const gl = cv.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
    if (!gl) { cv.style.background = (o.colors || [])[0] || "#000"; return; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(pr, n);
    const [g, ac, hi] = (o.colors || ["#0a0a12", "#3355ff", "#bcd0ff"]).map(hex3);
    gl.uniform2f(U("uRes"), W, H); gl.uniform3fv(U("uG"), g); gl.uniform3fv(U("uA"), ac); gl.uniform3fv(U("uH"), hi);
    gl.uniform1f(U("uAng"), o.angle ?? 0.62);
    const state = { i: o.intensity ?? 1 };
    const draw = (time) => {
      gl.uniform1f(U("uT"), time * (o.speed ?? 1) + (o.seed ?? 3));
      gl.uniform1f(U("uI"), state.i);
      gl.viewport(0, 0, W, H); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    // a carrier tween over the span: the timeline's own time drives the shader
    const from = MD.t ? MD.t(o.from ?? 0) : 0;
    const to = o.to !== undefined ? (MD.t ? MD.t(o.to) : o.to) : (window.MD_BEATS?.length || 20);
    const clock = { t: from };
    tl.fromTo(clock, { t: from }, { t: to, duration: to - from, ease: "none", onUpdate: () => draw(clock.t) }, from);
    draw(from);
    // intensity changes ride the same timeline: MD.silkLevel(tl, silk, at, value)
    return { state, draw, clock };
  };
  MD.silkLevel = (tl, silk, at, value, dur = 0.6) => {
    tl.to(silk.state, { i: value, duration: dur, ease: "power2.inOut", onUpdate: () => silk.draw(silk.clock.t) }, MD.t(at));
  };
})();

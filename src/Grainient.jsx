import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import './Grainient.css';

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);} 
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);} 
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  vec2 warp=vec2(sin(tuv.y*frequency+t*uWarpSpeed)*amplitude,cos(tuv.x*frequency+t*uWarpSpeed)*amplitude)*ws;
  tuv+=warp;

  float blend=uBlendAngle;
  vec2 blurDir=vec2(cos(radians(blend)),sin(radians(blend)));
  float bs=uBlendSoftness;
  float g=pow(abs(tuv.x*blurDir.x-tuv.y*blurDir.y),1.0/bs);

  vec3 col1=mix(uColor2,uColor3,g);
  vec3 col2=mix(uColor1,uColor2,g);
  float balance=uColorBalance;
  vec2 p=tuv*Rot(radians(degree*360.0));
  float interpolator=S(0.0,1.0,sin(p.x*p.y+degree*6.28+t*0.5)*0.5+0.5);
  vec3 col=mix(col1,col2,S(-1.0,1.0,interpolator*2.0-1.0));

  col=pow(abs(col),vec3(1.0/uGamma));
  col=mix(vec3(dot(col,vec3(0.299,0.587,0.114))),col,uSaturation);
  col=clamp((col-0.5)*uContrast+0.5,0.0,1.0);

  if(uGrainAmount>0.0){
    vec2 gv=uv*uGrainScale;
    if(uGrainAnimated<0.5)gv=floor(gv);
    float gNoise=noise(gv+vec2(0.0,uGrainAnimated*t*100.0));
    float gThreshold=mix(1.0-uGrainAmount,1.0,0.5);
    float gSmooth=0.02;
    float grainMask=S(gThreshold-gSmooth,gThreshold+gSmooth,gNoise);
    col=mix(col,clamp(col*1.2,0.0,1.0),grainMask*uGrainAmount);
  }
  o=vec4(col,1.0);
}
void main(){mainImage(fragColor,gl_FragCoord.xy);}
`;

const ctxMap = new WeakMap();

const Grainient = ({
  color1 = '#FF9FFC',
  color2 = '#5227FF',
  color3 = '#B497CF',
  timeSpeed = 0.25,
  colorBalance = 0.0,
  warpStrength = 1.0,
  warpFrequency = 5.0,
  warpSpeed = 2.0,
  warpAmplitude = 50.0,
  blendAngle = 0.0,
  blendSoftness = 0.05,
  rotationAmount = 500.0,
  noiseScale = 2.0,
  grainAmount = 0.1,
  grainScale = 2.0,
  grainAnimated = false,
  contrast = 1.5,
  gamma = 1.0,
  saturation = 1.0,
  centerX = 0.0,
  centerY = 0.0,
  zoom = 0.9,
  className = '',
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false });
    if (!gl) return;

    const renderer = new Renderer(gl);
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution:  { value: new Float32Array([1, 1]) },
        iTime:        { value: 0 },
        uTimeSpeed:   { value: timeSpeed },
        uColorBalance:{ value: colorBalance },
        uWarpStrength:{ value: warpStrength },
        uWarpFrequency:{ value: warpFrequency },
        uWarpSpeed:   { value: warpSpeed },
        uWarpAmplitude:{ value: warpAmplitude },
        uBlendAngle:  { value: blendAngle },
        uBlendSoftness:{ value: blendSoftness },
        uRotationAmount:{ value: rotationAmount },
        uNoiseScale:  { value: noiseScale },
        uGrainAmount: { value: grainAmount },
        uGrainScale:  { value: grainScale },
        uGrainAnimated:{ value: grainAnimated ? 1.0 : 0.0 },
        uContrast:    { value: contrast },
        uGamma:       { value: gamma },
        uSaturation:  { value: saturation },
        uCenterOffset:{ value: new Float32Array([centerX, centerY]) },
        uZoom:        { value: zoom },
        uColor1:      { value: new Float32Array(hexToRgb(color1)) },
        uColor2:      { value: new Float32Array(hexToRgb(color2)) },
        uColor3:      { value: new Float32Array(hexToRgb(color3)) }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctxMap.set(container, { renderer, program, mesh });

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h);
      const res = program.uniforms.iResolution.value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      renderer.render({ scene: mesh });
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    const loop = t => {
      program.uniforms.iTime.value = (t - t0) * 0.001;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };

    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
    };
    const tryStop = () => {
      if (raf !== 0) { cancelAnimationFrame(raf); raf = 0; }
    };

    const io = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; isVisible ? tryStart() : tryStop(); },
      { threshold: 0 }
    );
    io.observe(container);

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      isPageVisible ? tryStart() : tryStop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    tryStart();

    return () => {
      tryStop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      ctxMap.delete(container);
      try { container.removeChild(canvas); } catch { /* ignore */ }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ctx = ctxMap.get(container);
    if (!ctx) return;
    const { program } = ctx;
    const u = program.uniforms;

    u.uTimeSpeed.value      = timeSpeed;
    u.uColorBalance.value   = colorBalance;
    u.uWarpStrength.value   = warpStrength;
    u.uWarpFrequency.value  = warpFrequency;
    u.uWarpSpeed.value      = warpSpeed;
    u.uWarpAmplitude.value  = warpAmplitude;
    u.uBlendAngle.value     = blendAngle;
    u.uBlendSoftness.value  = blendSoftness;
    u.uRotationAmount.value = rotationAmount;
    u.uNoiseScale.value     = noiseScale;
    u.uGrainAmount.value    = grainAmount;
    u.uGrainScale.value     = grainScale;
    u.uGrainAnimated.value  = grainAnimated ? 1.0 : 0.0;
    u.uContrast.value       = contrast;
    u.uGamma.value          = gamma;
    u.uSaturation.value     = saturation;
    u.uCenterOffset.value   = new Float32Array([centerX, centerY]);
    u.uZoom.value           = zoom;
    u.uColor1.value         = new Float32Array(hexToRgb(color1));
    u.uColor2.value         = new Float32Array(hexToRgb(color2));
    u.uColor3.value         = new Float32Array(hexToRgb(color3));
  }, [
    timeSpeed, colorBalance, warpStrength, warpFrequency, warpSpeed,
    warpAmplitude, blendAngle, blendSoftness, rotationAmount, noiseScale,
    grainAmount, grainScale, grainAnimated, contrast, gamma, saturation,
    centerX, centerY, zoom, color1, color2, color3
  ]);

  return <div ref={containerRef} className={`grainient-container ${className}`.trim()} />;
};

export default Grainient;
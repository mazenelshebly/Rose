(() => {
  "use strict";

  const canvas = document.getElementById("roseCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  const stage = document.getElementById("stage");
  const pauseBtn = document.getElementById("pauseBtn");
  const pauseText = document.getElementById("pauseText");
  const pauseIcon = document.getElementById("pauseIcon");
  const paletteSelect = document.getElementById("paletteSelect");
  const speedRange = document.getElementById("speedRange");
  const speedValue = document.getElementById("speedValue");
  const densityRange = document.getElementById("densityRange");
  const densityValue = document.getElementById("densityValue");

  const TAU = Math.PI * 2;
  const CHARS = [" .,:;~=", "*+xX#$0@", "oahkbdpqwm", "Z0OQLCJUYX", "2"];
  const palettes = {
    rose:    { dark:[35,5,16], mid:[190,25,62], bright:[255,142,166], green:[82,166,92], glow:[255,143,91] },
    classic: { dark:[28,2,5], mid:[160,9,28], bright:[255,105,125], green:[69,145,72], glow:[255,171,104] },
    noir:    { dark:[36,37,47], mid:[145,149,164], bright:[250,246,255], green:[104,126,111], glow:[226,210,194] },
    garden:  { dark:[10,27,13], mid:[47,130,58], bright:[151,225,128], green:[68,174,78], glow:[226,191,100] },
    sunset:  { dark:[49,14,7], mid:[197,66,32], bright:[255,174,100], green:[93,145,65], glow:[255,211,121] }
  };

  let points = [];
  let angle = 0, tilt = 0.28, paused = false, speed = 1, density = 2;
  let drag = false, lastX = 0, lastY = 0, zoom = 1;
  let lastFrame = 0, fpsFrames = 0, fpsTime = 0;

  const smooth = (a,b,x) => { const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
  const addPoint = (x,y,z,mat) => points.push({x,y,z,mat});

  function stemPoint(t) {
    const u=1-t;
    return {x:(2*u*t)*.08+(t*t)*-.04, y:(2*u*t)*-.05+(t*t)*.03, z:(2*u*t)*(-.55*1.15)+(t*t)*(-1.15)};
  }

  function buildScene() {
    points = [];
    // Stem: sampled tube surface.
    for(let i=0;i<180;i++) {
      const t=i/179, c=stemPoint(t), r=1.15*(.018-.005*t);
      for(let j=0;j<14;j++) {
        const p=j/14*TAU;
        addPoint(c.x+r*Math.cos(p),c.y+r*Math.sin(p),c.z,1);
      }
    }
    // Leaves and their midrib-like curved surfaces.
    [[.32,1,.30,.11,.28],[.56,-1,.34,.12,-.25],[.76,1,.26,.09,.20]].forEach(([t0,side,len,w,twist])=>{
      const base=stemPoint(t0);
      for(let i=0;i<36;i++) for(let j=0;j<17;j++) {
        const u=i/35,v=j/8-1, width=w*Math.sin(Math.PI*u)*(1-.3*u);
        const serr=.06*w*Math.sin(14*Math.PI*u)*(Math.abs(v)>.7?1:0);
        const lx=u*len, ly=v*(width+serr), lz=-.12*w*Math.abs(v)-.25*len*Math.pow(u,1.8);
        const ry=ly*Math.cos(twist)-lz*Math.sin(twist), rz=ly*Math.sin(twist)+lz*Math.cos(twist);
        const a=side*(.65+.15*u);
        addPoint(base.x+lx*Math.cos(a)-ry*Math.sin(a),base.y+lx*Math.sin(a)+ry*Math.cos(a),base.z+rz,2);
      }
    });
    // Five sepals.
    for(let k=0;k<5;k++) {
      const phi=k*TAU/5+.3;
      for(let i=0;i<24;i++) for(let j=0;j<11;j++) {
        const u=i/23,v=j/5-1,w=.045*Math.sin(Math.PI*u)*(1-.4*u);
        const r=.03+.16*u,z=-.02-.06*Math.pow(u,1.5)+.015*Math.sin(Math.PI*u);
        addPoint(r*Math.cos(phi)-v*w*Math.sin(phi),r*Math.sin(phi)+v*w*Math.cos(phi),z,2);
      }
    }
    // Rose petals arranged on a golden-angle spiral.
    const petalCount=26, golden=Math.PI*(3-Math.sqrt(5));
    for(let k=0;k<petalCount;k++) {
      const frac=k/(petalCount-1), phi0=k*golden;
      const openness=.12+.72*Math.pow(frac,1.35);
      const height=.13+.15*Math.sin(frac*Math.PI*.85);
      const width=.55+.65*frac;
      const mat=frac<.22?3:(frac<.78?4:5);
      for(let i=0;i<31;i++) for(let j=0;j<23;j++) {
        const u=i/30,v=j/11-1;
        const curl=smooth(.55,1,u)*(.04+.11*frac)*Math.cos(v*Math.PI*.5);
        const r=.015+.095*frac+u*openness+curl;
        const lip=.018*u*u*Math.sin(v*Math.PI*1.5)*frac;
        const z=u*height*(1-.38*frac*u)-.035*v*v*u-.45*curl+lip-.015;
        const theta=phi0+v*width*smooth(0,.35,u);
        addPoint(r*Math.cos(theta),r*Math.sin(theta),z,mat);
      }
    }
  }

  function resize() {
    const rect=stage.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.floor(rect.width*dpr); canvas.height=Math.floor(rect.height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function colorFor(mat,lum) {
    const p=palettes[paletteSelect.value];
    let base;
    if(mat===1||mat===2) base=p.green;
    else if(mat===3) base=p.glow;
    else base=p.mid;
    const t=Math.max(0,Math.min(1,lum));
    const dark=p.dark, bright=(mat===1||mat===2)?p.green:p.bright;
    const mix=(a,b,f)=>a.map((v,i)=>Math.round(v+(b[i]-v)*f));
    const c=t<.5?mix(dark,base,t*2):mix(base,bright,(t-.5)*2);
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }

  function render(now) {
    const rect=stage.getBoundingClientRect(), w=rect.width, h=rect.height;
    ctx.clearRect(0,0,w,h);
    const cellW=density===1?10:(density===2?8:6), cellH=density===1?16:(density===2?13:10);
    const cols=Math.floor(w/cellW), rows=Math.floor(h/cellH);
    const cx=cols*.5, cy=rows*.48, fov=Math.min(cols,rows)*.92;
    const ca=Math.cos(angle),sa=Math.sin(angle),ct=Math.cos(tilt),st=Math.sin(tilt);
    const light=[.45,-.60,.66], ll=Math.hypot(...light);
    const projected=[];
    const centerZ=-.38*1.15;
    const step=density===1?2:1;

    for(let n=0;n<points.length;n+=step) {
      const p=points[n], x=p.x, y=p.y, z=p.z-centerZ;
      const rx=x*ca-y*sa, ry0=x*sa+y*ca, rz0=z;
      const ry=ry0*ct-rz0*st, rz=ry0*st+rz0*ct;
      const depth=1.65+ry;
      if(depth<=.2) continue;
      const sx=Math.round(cx+(rx/depth)*fov*zoom), sy=Math.round(cy-(rz/depth)*fov*(w/h)*zoom);
      if(sx<0||sx>=cols||sy<0||sy>=rows) continue;
      const nx0=0, ny0=0, nz0=1;
      const nd=(nx0*light[0]+ny0*light[1]+nz0*light[2])/ll;
      let lum=Math.max(.08,Math.min(1,nd*.55+.45));
      lum*=Math.max(.4,Math.min(1,1.35-.35*depth));
      projected.push({sx,sy,depth,mat:p.mat,lum});
    }
    projected.sort((a,b)=>b.depth-a.depth);
    const grid=new Array(cols*rows);
    for(const p of projected) grid[p.sy*cols+p.sx]=p;

    ctx.textBaseline="top";
    ctx.font=`${density===3?10: density===2?12:14}px "DM Mono", monospace`;
    for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) {
      const p=grid[y*cols+x]; if(!p) continue;
      const row=p.mat===1?0:(p.mat===2?2:(p.mat===3?3:(p.mat===4?1:2)));
      const idx=Math.min(9,Math.floor(p.lum*9.99));
      let ch=CHARS[row].padEnd(10," ")[idx] || ".";
      if(ch===" ") ch=".";
      ctx.fillStyle=colorFor(p.mat,p.lum);
      ctx.fillText(ch,x*cellW,y*cellH);
    }
    if(!paused) angle+=Math.min(.05,(now-lastFrame)/1000||0)*.75*speed;
    lastFrame=now;
    fpsFrames++;
    if(now-fpsTime>1000) { document.getElementById("fpsLabel").textContent=`${fpsFrames} FPS`; fpsFrames=0; fpsTime=now; }
    requestAnimationFrame(render);
  }

  function setPaused(value) {
    paused=value; pauseText.textContent=paused?"Resume bloom":"Pause bloom"; pauseIcon.textContent=paused?"▶":"Ⅱ";
  }
  pauseBtn.addEventListener("click",()=>setPaused(!paused));
  document.getElementById("resetBtn").addEventListener("click",()=>{angle=0;tilt=.28;zoom=1;});
  speedRange.addEventListener("input",()=>{speed=Number(speedRange.value);speedValue.textContent=`${speed.toFixed(1)}×`;});
  densityRange.addEventListener("input",()=>{density=Number(densityRange.value);densityValue.textContent=["","Light","Balanced","Fine"][density];});
  paletteSelect.addEventListener("change",()=>{});
  document.getElementById("randomBtn").addEventListener("click",()=>{
    const keys=Object.keys(palettes); paletteSelect.value=keys[Math.floor(Math.random()*keys.length)];
    speed=+(Math.random()*1.8+.4).toFixed(1);speedRange.value=speed;speedValue.textContent=`${speed.toFixed(1)}×`;
    tilt=(Math.random()-.5)*.9;
  });
  document.getElementById("saveBtn").addEventListener("click",()=>{
    const link=document.createElement("a");link.download="rose-art.png";link.href=canvas.toDataURL("image/png");link.click();
  });
  document.getElementById("fullscreenBtn").addEventListener("click",()=>{
    if(!document.fullscreenElement) stage.requestFullscreen?.(); else document.exitFullscreen?.();
  });
  stage.addEventListener("pointerdown",e=>{drag=true;lastX=e.clientX;lastY=e.clientY;stage.setPointerCapture(e.pointerId);});
  stage.addEventListener("pointermove",e=>{if(!drag)return;angle+=(e.clientX-lastX)*.009;tilt=Math.max(-.9,Math.min(.9,tilt+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY;});
  stage.addEventListener("pointerup",()=>drag=false);
  stage.addEventListener("pointercancel",()=>drag=false);
  stage.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(.65,Math.min(1.6,zoom-e.deltaY*.001));},{passive:false});
  window.addEventListener("resize",resize);

  buildScene(); resize(); requestAnimationFrame(render);
})();

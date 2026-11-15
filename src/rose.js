(() => {
  "use strict";
  const canvas = document.getElementById("roseCanvas");
  const ctx = canvas.getContext("2d");
  const intro = document.getElementById("intro");
  const finalMessage = document.getElementById("finalMessage");
  const replay = document.getElementById("replay");

  // Common, recognizable ways to say "I love you". Some languages have
  // gender, formality, or regional variants; this is an artistic selection.
  const phrases = [
    "I LOVE YOU","أحبك","Je t’aime","Ti amo","Te amo","Ich liebe dich",
    "Я тебя люблю","我爱你","愛してる","사랑해","Seni seviyorum",
    "Eu te amo","Ik hou van je","Kocham cię","Szeretlek","Të dua",
    "Σ’ αγαπώ","אני אוהב אותך","دوستت دارم","मैं तुमसे प्यार करता हूँ",
    "আমি তোমাকে ভালোবাসি","Mahal kita","Aku cinta kamu","Nakupenda",
    "Jeg elsker dig","Jag älskar dig","Minä rakastan sinua",
    "Te iubesc","Volim te","Обичам те","Aš tave myliu",
    "Ma armastan sind","Ég elska þig","Tá grá agam duit",
    "Ngiyakuthanda","Ek is lief vir jou","Mən səni sevirəm",
    "Ana baħibbak","Te quiero","愛してる","我愛你","ฉันรักคุณ",
    "Anh yêu em","Kuv hlub koj","Mi amas vin","Rwy’n dy garu di"
  ];

  const TAU=Math.PI*2;
  let particles=[], start=0, duration=14500, raf=0, dpr=1, width=0, height=0;
  let completed=false;

  const ease = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

  function add(x,y,z,kind,phase,scale=1) {
    const idx=particles.length;
    particles.push({x,y,z,kind,phase,scale,phrase:phrases[idx%phrases.length],seed:Math.sin(idx*12.9898)*43758.5453%1});
  }

  function stemPoint(t){
    const u=1-t;
    return {x:2*u*t*.08+t*t*-.04,y:2*u*t*-.05+t*t*.03,z:2*u*t*(-.63)+t*t*(-1.15)};
  }

  function buildRose(){
    particles=[];
    // Stem is revealed first, from the flower base downward.
    for(let i=0;i<130;i++){
      const t=i/129,c=stemPoint(t),r=.018-.005*t;
      for(let j=0;j<7;j++){
        const a=j/7*TAU;
        add(c.x+r*Math.cos(a),c.y+r*Math.sin(a),c.z,"leaf",.04+t*.22,.8);
      }
    }
    // Leaves and sepals.
    [[.34,1,.32,.115,.25],[.58,-1,.35,.12,-.22],[.78,1,.27,.095,.2]].forEach(([t0,side,len,w,twist],n)=>{
      const base=stemPoint(t0);
      for(let i=0;i<25;i++)for(let j=0;j<11;j++){
        const u=i/24,v=j/5-1,ww=w*Math.sin(Math.PI*u)*(1-.28*u);
        const lx=u*len,ly=v*ww,lz=-.12*w*Math.abs(v)-.22*len*u*u;
        const ry=ly*Math.cos(twist)-lz*Math.sin(twist),rz=ly*Math.sin(twist)+lz*Math.cos(twist);
        const a=side*(.64+.13*u);
        add(base.x+lx*Math.cos(a)-ry*Math.sin(a),base.y+lx*Math.sin(a)+ry*Math.cos(a),base.z+rz,"leaf",.18+n*.035+u*.15,.9);
      }
    });
    for(let k=0;k<5;k++){
      const phi=k*TAU/5+.3;
      for(let i=0;i<15;i++)for(let j=0;j<7;j++){
        const u=i/14,v=j/3-1,w=.04*Math.sin(Math.PI*u),r=.025+.15*u,z=-.02-.055*u;
        add(r*Math.cos(phi)-v*w*Math.sin(phi),r*Math.sin(phi)+v*w*Math.cos(phi),z,"leaf",.37+u*.08,.9);
      }
    }
    // Petals: inner layers open first, outer layers last.
    const count=27,golden=Math.PI*(3-Math.sqrt(5));
    for(let k=0;k<count;k++){
      const frac=k/(count-1),phi0=k*golden;
      const openness=.12+.72*Math.pow(frac,1.35),height=.13+.15*Math.sin(frac*Math.PI*.85),span=.55+.65*frac;
      const layerStart=.43+frac*.35;
      for(let i=0;i<27;i++)for(let j=0;j<19;j++){
        const u=i/26,v=j/9-1;
        const curl=((clamp((u-.55)/.45,0,1))**2)*( .04+.11*frac)*Math.cos(v*Math.PI*.5);
        const r=.015+.095*frac+u*openness+curl;
        const z=u*height*(1-.38*frac*u)-.035*v*v*u-.45*curl+.018*u*u*Math.sin(v*Math.PI*1.5)*frac-.015;
        const theta=phi0+v*span*clamp(u/.35,0,1);
        // The phrase itself becomes the red petal surface.
        add(r*Math.cos(theta),r*Math.sin(theta),z,"petal",layerStart+u*.12,.88+frac*.22);
      }
    }
    // Deterministic tiny glow particles around the bloom.
    for(let i=0;i<170;i++){
      const a=i*2.39996,r=.42+(i%19)*.012;
      add(Math.cos(a)*r,Math.sin(a)*r,.12+((i*17)%31)/100,"spark",.68+(i%10)*.018,.45);
    }
  }

  function resize(){
    const rect=canvas.getBoundingClientRect();
    dpr=Math.min(window.devicePixelRatio||1,2);
    width=rect.width;height=rect.height;
    canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function project(p, t, index){
    const rotation=-.18+Math.sin(t*1.2)*.035;
    const ca=Math.cos(rotation),sa=Math.sin(rotation);
    const x=p.x*ca-p.y*sa,y=p.x*sa+p.y*ca;
    const tilt=.22, ry=y*Math.cos(tilt)-p.z*Math.sin(tilt), rz=y*Math.sin(tilt)+p.z*Math.cos(tilt);
    const depth=1.8+ry;
    const scale=Math.min(width,height)*.56;
    const cx=width*.5,cy=height*.535;
    return {x:cx+(x/depth)*scale,y:cy-(rz/depth)*scale,depth};
  }

  function draw(now){
    const elapsed=now-start;
    const progress=clamp(elapsed/duration,0,1);
    ctx.clearRect(0,0,width,height);

    // A subtle central aura slowly grows with the flower.
    const aura=ctx.createRadialGradient(width*.5,height*.52,2,width*.5,height*.52,Math.min(width,height)*.43);
    aura.addColorStop(0,`rgba(116,17,43,${.10+.11*progress})`);
    aura.addColorStop(1,"rgba(7,5,9,0)");
    ctx.fillStyle=aura;ctx.fillRect(0,0,width,height);

    const visible=[];
    for(let i=0;i<particles.length;i++){
      const p=particles[i];
      const local=clamp((progress-p.phase)/.15,0,1);
      if(local<=0)continue;
      const reveal=ease(local);
      const wobble=Math.sin(now*.0007+i*.17)*.002*(1-reveal);
      const q={x:p.x*(.35+.65*reveal),y:p.y*(.35+.65*reveal),z:p.z+wobble};
      const pos=project(q,progress,i);
      visible.push({p,pos,alpha:clamp(local*1.5,0,1)});
    }
    visible.sort((a,b)=>b.pos.depth-a.pos.depth);

    for(const item of visible){
      const {p,pos,alpha}=item;
      if(p.kind==="spark"){
        const twinkle=.35+.65*(.5+.5*Math.sin(now*.002+p.seed*30));
        ctx.globalAlpha=alpha*twinkle*.7;
        ctx.fillStyle="#ff9caf";
        ctx.beginPath();ctx.arc(pos.x,pos.y,1.1*p.scale,0,TAU);ctx.fill();
        continue;
      }
      const isPetal=p.kind==="petal";
      const fontSize=isPetal?clamp((width<600?5.2:6.4)*p.scale,3.5,7.2):clamp((width<600?5:6)*p.scale,3,6.5);
      ctx.font=`${isPetal?"500":"400"} ${fontSize}px "DM Mono","Noto Sans Arabic",monospace`;
      ctx.textAlign="center";ctx.textBaseline="middle";
      const shade=clamp(.55+(1.8-pos.depth)*.27, .28,1);
      if(isPetal){
        const red=Math.round(145+shade*95),green=Math.round(8+shade*31),blue=Math.round(29+shade*48);
        ctx.fillStyle=`rgba(${red},${green},${blue},${alpha*.94})`;
        ctx.shadowColor="rgba(255,40,82,.22)";ctx.shadowBlur=2.5;
      }else{
        ctx.fillStyle=`rgba(${Math.round(43+shade*40)},${Math.round(112+shade*75)},${Math.round(48+shade*48)},${alpha*.9})`;
        ctx.shadowBlur=0;
      }
      // Cycle the multilingual phrase fragments so the surface reads as a tapestry.
      const phrase=p.phrase;
      const maxChars=isPetal?Math.max(2,Math.floor(9/fontSize*6)):Math.max(2,Math.floor(8/fontSize*6));
      const fragment=phrase.length>maxChars?phrase.slice(0,maxChars):phrase;
      ctx.fillText(fragment,pos.x,pos.y);
    }
    ctx.globalAlpha=1;ctx.shadowBlur=0;

    if(progress>.93&&!completed){
      completed=true;
      intro.classList.add("hide");
      finalMessage.classList.add("show");
      replay.classList.add("show");
    }
    if(progress<1)raf=requestAnimationFrame(draw);
  }

  function play(){
    cancelAnimationFrame(raf);
    completed=false;intro.classList.remove("hide");finalMessage.classList.remove("show");replay.classList.remove("show");
    start=performance.now();raf=requestAnimationFrame(draw);
  }

  buildRose();resize();play();
  window.addEventListener("resize",()=>{resize();});
  replay.addEventListener("click",play);
})();

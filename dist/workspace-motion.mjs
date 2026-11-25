const preference=matchMedia('(prefers-reduced-motion: reduce)');
let lastView='';
let sequence=0;
let context;
let engine;

function loadMotion() {
  engine??=new Promise(resolve=>{
    const script=document.createElement('script');
    script.src=new URL('./vendor/gsap.min.js', import.meta.url).href;
    script.onload=()=>resolve(window.gsap);
    script.onerror=()=>resolve(null);
    document.head.append(script);
  });
  return engine;
}
preference.addEventListener('change',()=>{
  sequence++;
  context?.revert();
});

export async function refreshWorkspaceMotion({route,homeTab,caseFilter,libraryLayout,fileType,overviewStage,scheduleDay}) {
  const host=document.querySelector('[data-display],.case-library');
  const area=host?.dataset.display || (host?'cases':'');
  const stateKey=area==='library'?[caseFilter,libraryLayout,fileType].join('/') :
    area==='project-overview'?overviewStage:area==='task-types'?scheduleDay:area==='cases'?homeTab:'';
  const key=route+'/'+area+'/'+stateKey;
  const previous=lastView;
  lastView=key;
  const tick=++sequence;
  context?.revert();
  context=undefined;
  // A route paints in its final position. Feedback belongs to explicit filter changes.
  if(!host || preference.matches || previous===key || !previous.startsWith(route+'/'+area+'/')) return;
  const gsap=await loadMotion();
  if (!gsap || preference.matches || tick!==sequence || !host.isConnected) return;
  context=gsap.context(()=>{
    const reveal=(selector,vars={})=>{
      const items=[...host.querySelectorAll(selector)].slice(0,10);
      if (items.length) gsap.from(items,{y:4,duration:.26,stagger:.024,ease:'power2.out',clearProps:'transform',...vars});
    };
    if(area==='cases') reveal('.dossier-card',{y:0,duration:.18});
    if(area==='library') reveal('.library-row,.file-tile',{duration:.18,stagger:.014});
    if(area==='project-files') reveal('.file-tile');
    if(area==='project-activity') reveal('.activity-feed article');
    if(area==='project-overview') {
      reveal('.stage-items button',{x:4,y:0});
    }
    if(area==='task-types') {
      reveal('.day-agenda button',{y:4});
    }
  },host);
}

export async function animateEditor(dialog) {
  if(preference.matches) return;
  const form=dialog.querySelector('form');
  const gsap=await loadMotion();
  if(!gsap || !dialog.open || !form?.isConnected || preference.matches) return;
  const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)',()=>{
    gsap.from(form,{y:4,duration:.2,ease:'power2.out',clearProps:'transform'});
  });
  dialog.addEventListener('close',()=>media.revert(),{once:true});
}

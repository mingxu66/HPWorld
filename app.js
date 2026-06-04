'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const STORAGE_KEY='hp_rpg_alpha_state_v13';
const SAVE_KEY='hp_rpg_save_slots_v13';
const API_KEY='hp_rpg_api_settings_v13';
const uid=()=> 'id_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);

const PROVIDER_CONFIG={
  deepseek:{base:'https://api.deepseek.com/v1',model:'deepseek-chat'},
  qwen:{base:'https://dashscope.aliyuncs.com/compatible-mode/v1',model:'qwen-plus'},
  glm:{base:'https://open.bigmodel.cn/api/paas/v4',model:'glm-4-flash'},
  kimi:{base:'https://api.moonshot.cn/v1',model:'moonshot-v1-8k'},
  doubao:{base:'https://ark.cn-beijing.volces.com/api/v3',model:'doubao-lite-32k'},
  openai:{base:'https://api.openai.com/v1',model:'gpt-4o-mini'},
  openrouter:{base:'https://openrouter.ai/api/v1',model:'openai/gpt-4o-mini'},
  siliconflow:{base:'https://api.siliconflow.cn/v1',model:'deepseek-ai/DeepSeek-V3'},
  custom:{base:'',model:''}
};
const ATTRS=[['charm','魅力'],['intelligence','才智'],['courage','勇气'],['ambition','野心'],['empathy','共情'],['resolve','决断'],['fitness','体能'],['talent','天赋']];
const COURSES=[['transfiguration','变形术'],['charms','魔咒学'],['potions','魔药学'],['dada','黑魔法防御术'],['herbology','草药学'],['astronomy','天文学'],['history','魔法史'],['flying','飞行课']];
const CHARACTERS={
  harry:{name:'哈利·波特',yearOpen:1,group:'golden',weight:110}, ron:{name:'罗恩·韦斯莱',yearOpen:1,group:'golden',weight:100}, hermione:{name:'赫敏·格兰杰',yearOpen:1,group:'golden',weight:105},
  draco:{name:'德拉科·马尔福',yearOpen:1,group:'slytherin',weight:110}, blaise:{name:'布雷斯·扎比尼',yearOpen:1,group:'slytherin',weight:25}, theo:{name:'西奥多·诺特',yearOpen:1,group:'slytherin',weight:25},
  fred:{name:'弗雷德·韦斯莱',yearOpen:1,group:'twins',weight:30}, george:{name:'乔治·韦斯莱',yearOpen:1,group:'twins',weight:30}, percy:{name:'珀西·韦斯莱',yearOpen:1,group:'weasley',weight:18},
  cedric:{name:'塞德里克·迪戈里',yearOpen:1,group:'hufflepuff',weight:18}, oliver:{name:'奥利弗·伍德',yearOpen:1,group:'quidditch',weight:18}, cho:{name:'秋·张',yearOpen:1,group:'ravenclaw',weight:12},
  snape:{name:'西弗勒斯·斯内普',yearOpen:1,group:'professor',weight:8,hidden:true}, luna:{name:'卢娜·洛夫古德',yearOpen:2,group:'ravenclaw',weight:0}, ginny:{name:'金妮·韦斯莱',yearOpen:2,group:'weasley',weight:0}, tom:{name:'汤姆·里德尔',yearOpen:2,group:'diary',weight:0,hidden:true},
  sirius:{name:'小天狼星·布莱克',yearOpen:3,group:'marauders',weight:0,hidden:true}, lupin:{name:'莱姆斯·卢平',yearOpen:3,group:'professor',weight:0,hidden:true}, krum:{name:'维克多尔·克鲁姆',yearOpen:4,group:'triwizard',weight:0}
};
const MAINLINE={
 '1991-8':{title:'对角巷',steps:['diagon_arrival','gringotts','robe_shop','bookstore','pet_shop','equipment','ollivanders','leave_diagon'],labels:['进入对角巷','古灵阁','摩金夫人长袍店','丽痕书店','宠物商店','购买其他装备','奥利凡德魔杖店','离开对角巷']},
 '1991-9':{title:'霍格沃茨特快与分院',steps:['platform','train_carriage','sorting','feast','dormitory'],labels:['九又四分之三站台','选择车厢','分院仪式','学院晚宴','第一次宿舍夜晚']},
 '1991-10':{title:'课堂适应',steps:['first_potions','first_flying','first_charms','class_rhythm'],labels:['第一堂魔药课','第一堂飞行课','第一堂魔咒课','适应课程节奏']},
 '1991-11':{title:'万圣节巨怪事件',steps:['halloween_feast','hermione_missing','troll_event','professor_talk'],labels:['万圣节晚宴','赫敏不见了','巨怪事件','教授谈话']},
 '1991-12':{title:'圣诞节与厄里斯魔镜',steps:['xmas_plan','xmas_gifts','xmas_feast','mirror_erised'],labels:['圣诞去留','收到礼物','圣诞晚宴','厄里斯魔镜']},
 '1992-1':{title:'尼可·勒梅调查',steps:['flamel_clue','library_research','quirrell_suspicion','snape_question'],labels:['尼可·勒梅线索','图书馆调查','奇洛异常','斯内普疑点']},
 '1992-2':{title:'魁地奇与学院竞争',steps:['quidditch_watch','stands_conflict','post_match'],labels:['魁地奇观赛','看台冲突','赛后讨论']},
 '1992-3':{title:'禁林边缘',steps:['unicorn_rumor','forest_edge','dark_shadow'],labels:['独角兽传闻','禁林边缘','黑影目击']},
 '1992-4':{title:'考试压力',steps:['review_plan','exam_anxiety','hidden_clue'],labels:['复习计划','考试焦虑','隐藏线索']},
 '1992-5':{title:'魔法石最终事件',steps:['stone_choice','trapdoor','truth_reveal'],labels:['是否参与调查','活板门行动','真相揭露']},
 '1992-6':{title:'学院杯与暑假',steps:['final_exam','house_cup','year_summary'],labels:['期末考试','学院杯','学年总结']}
};
const TALENTS=[
  {name:'魔咒亲和',desc:'你对标准咒语的回应速度更快。',attr:'talent',attrName:'天赋',course:'charms',courseName:'魔咒学'},
  {name:'魔药直觉',desc:'你对气味、火候和材料变化格外敏锐。',attr:'intelligence',attrName:'才智',course:'potions',courseName:'魔药学'},
  {name:'飞行本能',desc:'扫帚离地的瞬间，你比别人更快找到平衡。',attr:'fitness',attrName:'体能',course:'flying',courseName:'飞行课'},
  {name:'守护者气质',desc:'你总是下意识挡在别人前面。',attr:'empathy',attrName:'共情',course:'dada',courseName:'黑魔法防御术'},
  {name:'古代魔文感知',desc:'陌生符号在你眼中并不完全沉默。',attr:'intelligence',attrName:'才智',course:'history',courseName:'魔法史'},
  {name:'冷静判断',desc:'越是紧张的场面，你越能看清下一步。',attr:'resolve',attrName:'决断',course:'charms',courseName:'魔咒学'}
];
const DAILY_EVENTS=[
  {id:'charms',name:'魔咒练习',course:'charms',courseGain:1,stress:1,attr:'talent',attrGain:0},
  {id:'potions',name:'魔药练习',course:'potions',courseGain:1,stress:2,attr:'intelligence',attrGain:0},
  {id:'library',name:'图书馆复习',course:'history',courseGain:1,stress:1,attr:'intelligence',attrGain:0},
  {id:'flying',name:'飞行训练',course:'flying',courseGain:1,stress:1,health:-1,attr:'fitness',attrGain:0},
  {id:'rest',name:'休息',stress:-8,health:5},
  {id:'free',name:'自由行动',stress:0,free:true}
];
const NIGHT_LOCATIONS=['图书馆禁书区','四楼走廊','奖杯陈列室','天文塔','黑湖边','地下走廊','废弃教室','禁林边缘'];
let state=null,baseAttrs={},addedPoints={},freePoints=8,lockedAttr=null,dailyPlan=[],nightDanger='';

function freshState(){ const relations={}; Object.entries(CHARACTERS).forEach(([id,c])=>relations[id]={id,name:c.name,affection:0,familiarity:0,monthlyGain:0,weight:c.weight||0,met:false,trend:'🟰',visible:c.yearOpen<=1,hidden:!!c.hidden,tags:[],trust:0,secretAffection:0}); const courses={1:{}}; COURSES.forEach(([id])=>courses[1][id]=0); return {version:'alpha-v1.3',time:{year:1991,month:8},grade:1,house:'未知',housePoints:0,player:{name:'新生',nickname:'',gender:'女性',avatar:'',appearance:'',personality:'',parents:'父母健在',familyMood:'温暖',bloodStatus:'麻瓜出身',siblingAnchor:'无'},attributes:Object.fromEntries(ATTRS.map(([id])=>[id,6])),talent:null,health:100,stress:0,worldOffset:0,campusReputation:0,courses,relations,importantCharacters:[],memories:[],eventFlags:{},completedSteps:{},letters:[],sentLetters:[],characterAvatars:{},inventory:[{id:'calming_candy',name:'舒缓糖果',desc:'吃下后压力 -20。',type:'消耗品',qty:1},{id:'admission_letter',name:'录取通知书',desc:'霍格沃茨寄来的第一封信。',type:'纪念',qty:1}],achievements:['收到录取通知书'],monthly:{bondUsed:false,nightUsed:false,activeLetterUsed:false},aiCache:{},theme:'pink',customBg:'',bgOpacity:40}; }
function migrateState(){ if(!state)return; state.player=Object.assign(freshState().player,state.player||{}); state.relations=state.relations||freshState().relations; Object.entries(freshState().relations).forEach(([id,r])=>{ if(!state.relations[id]) state.relations[id]=r; }); state.courses=state.courses||{1:{}}; if(!state.courses[state.grade||1]) state.courses[state.grade||1]={}; COURSES.forEach(([id])=>{ if(state.courses[state.grade||1][id]===undefined) state.courses[state.grade||1][id]=0; }); ['letters','sentLetters','memories','importantCharacters','achievements'].forEach(k=>state[k]=state[k]||[]); state.eventFlags=state.eventFlags||{}; state.completedSteps=state.completedSteps||{}; state.monthly=state.monthly||{bondUsed:false,nightUsed:false,activeLetterUsed:false}; state.aiCache=state.aiCache||{}; state.storyThreads=state.storyThreads||{}; state.anchorTurns=state.anchorTurns||{}; state.characterAvatars=state.characterAvatars||{}; state.inventory=state.inventory||freshState().inventory; }
function save(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
function load(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch{return null} }
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function currentKey(){return `${state.time.year}-${state.time.month}`;}
function yearCourseMax(g){return {1:25,2:35,3:45,4:60,5:75,6:90,7:100}[g]||25;}
function attrLabel(id){return ATTRS.find(a=>a[0]===id)?.[1]||id;}
function courseLabel(id){return COURSES.find(c=>c[0]===id)?.[1]||id;}
function stars(v){return '★'.repeat(v)+'☆'.repeat(Math.max(0,10-v));}
function valueDesc(v){if(v<=2)return'略显薄弱'; if(v<=4)return'天资平平'; if(v<=6)return'尚有潜力'; if(v<=8)return'颇为出众'; return'极具天赋';}
function toast(msg){const feed=$('#systemFeed'); if(!feed){console.log(msg);return;} const t=document.createElement('div');t.className='toast';t.textContent='系统提示：'+msg;feed.appendChild(t);setTimeout(()=>t.remove(),4200);}
function go(id){$$('.screen').forEach(s=>s.classList.remove('active')); const el=$('#'+id); if(el)el.classList.add('active'); if(id.startsWith('screen-game')||['screen-achievements','screen-inventory','screen-mainline','screen-bond-event','screen-night','screen-daily'].includes(id))renderGame();}
function getApiSettings(){try{return JSON.parse(localStorage.getItem(API_KEY)||'{}')}catch{return {}}}
function getApiEndpoint(s){const cfg=PROVIDER_CONFIG[s.provider]||PROVIDER_CONFIG.deepseek; const base=(s.base||cfg.base||'').replace(/\/$/,''); return {url:base+'/chat/completions',model:s.model||cfg.model};}
async function callAI(messages,fallback){const s=getApiSettings(); if(!s.key)return fallback; const {url,model}=getApiEndpoint(s); if(!url||!model)return fallback; try{const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+s.key},body:JSON.stringify({model,messages,temperature:.85,max_tokens:900})}); if(!res.ok)throw new Error('HTTP '+res.status); const data=await res.json(); return data.choices?.[0]?.message?.content?.trim()||fallback;}catch(e){console.warn(e); toast('AI 调用失败，已使用本地剧情。'); return fallback;}}
function addMemory(tag){if(!state.memories.includes(tag))state.memories.push(tag);}
function setFlag(f){state.eventFlags[f]=true;}
function hasStep(step){return !!state.completedSteps[currentKey()]?.[step];}
function completeStep(step){state.completedSteps[currentKey()]=state.completedSteps[currentKey()]||{}; state.completedSteps[currentKey()][step]=true; setFlag(step); addMemory(step);}
function addStress(n){state.stress=clamp(state.stress+n,0,100); if(n)toast(`压力 ${n>0?'+':''}${n}`);}
function addHealth(n){state.health=clamp(state.health+n,0,100); if(n)toast(`健康 ${n>0?'+':''}${n}`);}
function addCourse(id,n){const y=state.grade; state.courses[y]=state.courses[y]||{}; state.courses[y][id]=clamp((state.courses[y][id]||0)+n,0,yearCourseMax(y)); if(n)toast(`${courseLabel(id)}熟练度 +${n}`);}
function addAttr(id,n){state.attributes[id]=clamp((state.attributes[id]||0)+n,0,200); if(n)toast(`${attrLabel(id)} +${n}`);}
function meet(id){const r=state.relations[id]; if(!r)return; if(!r.met){r.met=true;r.visible=true;toast(`认识了${r.name}`);} r.familiarity=clamp(r.familiarity+1,0,100); r.weight+=5; updateImportantCharacters();}
function addAffection(id,n){const r=state.relations[id]; if(!r)return; meet(id); const real=Math.max(0,Math.min(n,3-r.monthlyGain)); if(real<=0){toast(`${r.name}本月好感增长已达上限`);return;} r.affection=clamp(r.affection+real,0,100); r.monthlyGain+=real; r.trend='❤️'; r.weight+=real*5; toast(`${r.name} ❤️ +${real}`); checkLetterThreshold(id); updateImportantCharacters();}
function updateImportantCharacters(){state.importantCharacters=Object.values(state.relations).filter(r=>r.met||r.affection||r.familiarity).sort((a,b)=>(b.affection*2+b.familiarity+b.weight/10)-(a.affection*2+a.familiarity+a.weight/10)).slice(0,3).map(r=>r.id);}
function checkLetterThreshold(id){const r=state.relations[id]; [10,20,30,40,50,60,70,80,90,100].forEach(t=>{if(r.affection>=t&&!state.eventFlags[`letter_${id}_${t}`]){setFlag(`letter_${id}_${t}`);receiveLetter(id,t);}});}
function salutationFor(id,threshold){const r=state.relations[id]; if(!r)return state.player.name; if((threshold>=20||r.affection>=20)&&state.player.nickname)return state.player.nickname; if(threshold<20)return state.player.name; const map={draco:'亲爱的',fred:'甜心',george:'甜心',snape:'小姐',cedric:'亲爱的',blaise:'亲爱的小姐',theo:state.player.nickname||state.player.name,harry:state.player.nickname||state.player.name}; return map[id]||state.player.nickname||state.player.name;}
function receiveLetter(id,threshold=10,extra=''){const r=state.relations[id]; if(!r)return; const sal=salutationFor(id,threshold); const content=`致${sal}：\n\n我想你大概不会想到会收到这封信。霍格沃茨的走廊总是很吵，可写信的时候，很多话反而会变得清楚。\n\n最近我确实注意到了你。不是那种所有人都会注意到的方式，而是某个瞬间，忽然觉得你和别人不太一样。也许我们还没有熟到能把话说得太直白，但这封信至少说明，我愿意把这些话写给你。${extra?`\n\n${extra}`:''}\n\n• 你的${r.name}`; state.letters.push({id:uid(),sender:id,senderName:r.name,title:`${r.name}在${state.time.year}年${state.time.month}月寄出`,time:{...state.time},read:false,pinned:false,content,replies:[],threshold}); toast(`猫头鹰为你送来了【${r.name}】的信件，请记得准备好面包块哦~`); save();}
function randomBaseAttrs(){for(let i=0;i<5000;i++){const o=Object.fromEntries(ATTRS.map(([id])=>[id,Math.floor(Math.random()*10)+1])); const sum=Object.values(o).reduce((a,b)=>a+b,0); if(sum>=40&&sum<=64)return o;} return Object.fromEntries(ATTRS.map(([id])=>[id,5]));}
function chooseTalent(){const high=ATTRS.map(([id])=>[id,(baseAttrs[id]||0)+(addedPoints[id]||0)]).sort((a,b)=>b[1]-a[1])[0]?.[0]; return TALENTS.find(t=>t.attr===high)||TALENTS[Math.floor(Math.random()*TALENTS.length)];}
function updateBias(){const sorted=ATTRS.map(([id,n])=>[id,n,(baseAttrs[id]||0)+(addedPoints[id]||0)]).sort((a,b)=>b[2]-a[2]); const a=sorted[0]?.[1],b=sorted[1]?.[1]; const map={'才智+天赋':'天生学者','勇气+决断':'行动派','野心+魅力':'社交棋手','共情+勇气':'守护者','体能+勇气':'魁地奇苗子','野心+才智':'野心家学徒','天赋+野心':'危险新星','共情+才智':'温柔观察者'}; if($('#biasText'))$('#biasText').textContent=map[`${a}+${b}`]||`${a} / ${b}`; if($('#freePoints'))$('#freePoints').textContent=freePoints; renderInlineTalentPreview();}
function renderInlineTalentPreview(){const t=chooseTalent(); $('#talentName')&&($('#talentName').textContent=t.name); $('#talentDesc')&&($('#talentDesc').textContent=t.desc); $('#talentAttrBonus')&&($('#talentAttrBonus').textContent=`${t.attrName} +2`); $('#talentCourseBonus')&&($('#talentCourseBonus').textContent=`${t.courseName}熟练度 +2`);}
function renderAttrList(){const el=$('#attrList'); if(!el)return; const total=()=>ATTRS.reduce((s,[id])=>s+(baseAttrs[id]||0)+(addedPoints[id]||0),0); el.innerHTML=ATTRS.map(([id,n])=>{const v=(baseAttrs[id]||0)+(addedPoints[id]||0); return `<div class="attr-row"><b>${n}</b><span class="stars">${stars(v)}</span><small>${v} · ${valueDesc(v)}</small><button class="lock" data-lock="${id}">${lockedAttr===id?'🔒':'🔓'}</button><button class="plus" data-plus="${id}" ${freePoints<=0||v>=10||total()>=64?'disabled':''}>+</button></div>`}).join(''); updateBias();}
function initCreation(){baseAttrs=randomBaseAttrs(); addedPoints=Object.fromEntries(ATTRS.map(([id])=>[id,0])); freePoints=8; lockedAttr=null; renderAttrList();}
function handleChoiceVisibility(){const p=$('[data-choice="parents"] .selected')?.dataset.value; $('#parentsCustom')?.classList.toggle('hidden',p!=='自定义'); const fm=$('[data-choice="familyMood"] .selected')?.dataset.value; $('#familyMoodCustom')?.classList.toggle('hidden',fm!=='自定义'); const st=$('[data-choice="siblingType"] .selected')?.dataset.value; $('#originalSiblingBox')?.classList.toggle('hidden',st!=='原创兄弟姐妹'); $('#canonSiblingBox')?.classList.toggle('hidden',st!=='原著角色兄弟姐妹');}
function collectPlayer(){const parents=$('[data-choice="parents"] .selected')?.dataset.value||'父母健在'; const mood=$('[data-choice="familyMood"] .selected')?.dataset.value||'温暖'; const blood=$('[data-choice="bloodStatus"] .selected')?.dataset.value||'麻瓜出身'; const sib=$('[data-choice="siblingType"] .selected')?.dataset.value||'没有'; let anchor='无'; if(sib==='原创兄弟姐妹')anchor=`有一位原创${$('[data-choice="originalRelation"] .selected')?.dataset.value||'哥哥'}：${$('#originalSiblingName')?.value||'未命名'}，性格${$('#originalSiblingPersonality')?.value||'温柔可靠'}。`; if(sib==='原著角色兄弟姐妹')anchor=`是${$('#canonSiblingCharacter')?.value||'哈利·波特'}的${$('[data-choice="canonRelation"] .selected')?.dataset.value||'妹妹'}，核心羁绊对象：${$('[data-choice="canonBond"] .selected')?.dataset.value||'是'}。`; return {name:$('#playerName')?.value||'新生',nickname:$('#playerNickname')?.value||'',gender:'女性',avatar:($('#avatarPreview')?.src||'').startsWith('data:')?$('#avatarPreview').src:'',appearance:$('#appearance')?.value||'',personality:$('#personalityDesc')?.value||'',parents:parents==='自定义'?($('#parentsCustom')?.value||'自定义'):parents,familyMood:mood==='自定义'?($('#familyMoodCustom')?.value||'自定义'):mood,bloodStatus:blood,siblingAnchor:anchor};}
function buildSummary(){state=state||freshState(); migrateState(); state.player=collectPlayer(); ATTRS.forEach(([id])=>state.attributes[id]=(baseAttrs[id]||0)+(addedPoints[id]||0)); const t=chooseTalent(); state.talent=t; state.attributes[t.attr]=clamp(state.attributes[t.attr]+2,0,200); state.courses[1][t.course]=clamp((state.courses[1][t.course]||0)+2,0,25); save(); renderInlineTalentPreview();}
function renderSummary(){const el=$('#summaryContent'); if(!el)return; el.innerHTML=`<p><b>姓名：</b>${state.player.name}</p><p><b>昵称：</b>${state.player.nickname||'未设置'}</p><p><b>性别：</b>女性 🔒</p><p><b>外貌：</b>${state.player.appearance||'未填写'}</p><p><b>性格：</b>${state.player.personality||'未填写'}</p><p><b>血统：</b>${state.player.bloodStatus}</p><p><b>家庭：</b>${state.player.parents} / ${state.player.familyMood}</p><p><b>亲缘关系：</b>${state.player.siblingAnchor}</p><p><b>专属天赋：</b>${state.talent?.name||'未生成'}</p><hr>${ATTRS.map(([id,n])=>`<p>${n}：${state.attributes[id]}/200</p>`).join('')}`; if($('#letterName'))$('#letterName').textContent=state.player.name;}
function renderTop(id){const el=$('#'+id); if(!el)return; el.innerHTML=`<div class="top-left-player"><img class="top-avatar" src="${state.player.avatar||''}" onerror="this.style.display='none'"><div><div class="top-name">${state.player.name||'新生'}</div><div class="small">${state.player.nickname||'女性 · 已锁定'}</div></div></div><div class="top-meta"><div>${state.time.year}年${state.time.month}月</div><div>${state.grade}年级</div></div>`;}
function renderGame(){migrateState(); ['Home','Profile','Bonds','Letters','Settings'].forEach(x=>renderTop('gameTop'+x)); renderProfile(); renderBonds(); renderLetters(); renderAchievements(); renderInventory(); renderMainline(); renderBondInvite(); renderNightSetup(); renderDaily(); renderCharacterAvatarSettings();}
function renderProfile(){const el=$('#profileContent'); if(!el)return; const max=yearCourseMax(state.grade); const course=COURSES.map(([id,n])=>{const v=state.courses[state.grade]?.[id]||0;return `<div class="stat-line"><span>${n}</span><b>${v}/${max}</b></div><div class="bar"><i style="width:${v/max*100}%"></i></div>`}).join(''); const attrs=ATTRS.map(([id,n])=>`<div class="stat-line"><span>${n}</span><b>${state.attributes[id]}/200</b></div><div class="bar"><i style="width:${state.attributes[id]/2}%"></i></div>`).join(''); el.innerHTML=`<h2 class="section-title">属性</h2><div class="profile-grid"><div class="game-card"><h3>基础档案</h3><p>学院：${state.house}</p><p>年级：${state.grade}年级</p><p>学院分：${state.housePoints}</p><p>血统：${state.player.bloodStatus}</p><p>外貌：${state.player.appearance||'未填写'}</p><p>性格：${state.player.personality||'未填写'}</p><p>亲缘关系：${state.player.siblingAnchor}</p></div><div class="game-card"><h3>状态</h3><div class="stat-line"><span>健康</span><b>${state.health}/100</b></div><div class="bar"><i style="width:${state.health}%"></i></div><div class="stat-line"><span>压力</span><b>${state.stress}/100</b></div><div class="bar"><i style="width:${state.stress}%"></i></div></div><div class="game-card"><h3>八项属性</h3>${attrs}</div><div class="game-card"><h3>专属天赋</h3><p>${state.talent?.name||'未记录'}</p><p class="hint small">${state.talent?.desc||''}</p></div><div class="game-card"><h3>${state.grade}年级课程熟练度</h3>${course}</div></div>`;}
function stage(v){if(v<10)return'认识'; if(v<20)return'普通朋友'; if(v<40)return'朋友'; if(v<60)return'信任'; if(v<80)return'重要羁绊'; return'特殊羁绊';}
function charInitial(name){return (name||'?').replace(/[·\s]/g,'').slice(0,1).toUpperCase();}
function charAvatar(id){const r=state.relations[id],src=state.characterAvatars[id]; return `<div class="char-avatar">${src?`<img src="${src}">`:charInitial(r?.name||id)}</div>`;}
function renderBonds(){const el=$('#bondList'); if(!el)return; const arr=Object.values(state.relations).filter(r=>r.visible&&(r.met||r.affection||r.familiarity)).sort((a,b)=>b.affection-a.affection); if(!arr.length){el.innerHTML='<div class="empty-card"><p>你还没有与任何可攻略角色产生明显羁绊。</p></div>';return;} el.innerHTML=arr.map(r=>`<div class="bond-card"><div class="bond-card-head">${charAvatar(r.id)}<h3>${r.name} ${r.trend}</h3></div><div class="stat-line"><span>好感</span><b>${r.hidden?'？？':r.affection+'/100'}</b></div><div class="bar"><i style="width:${r.hidden?20:r.affection}%"></i></div><div class="stat-line"><span>熟悉度</span><b>${r.familiarity}/100</b></div><p class="hint small">详情：${r.hidden?'？？？':stage(r.affection)}</p></div>`).join('');}
function renderLetters(){const el=$('#letterList'); if(!el)return; if(!state.letters.length){el.innerHTML='<div class="empty-card"><p>窗台上很安静，今天还没有猫头鹰来过。</p></div>';return;} const arr=[...state.letters].sort((a,b)=>(b.pinned-a.pinned)||((b.time.year*12+b.time.month)-(a.time.year*12+a.time.month))); el.innerHTML=arr.map(l=>`<div class="letter-row ${l.pinned?'pinned':l.read?'read':'unread'}"><h3>${l.title}</h3><p class="small">${l.read?'已读':'未读'}${l.replies?.length?' · 含附件回复':''}</p><div class="letter-actions"><button data-open-letter="${l.id}">打开</button><button data-reply-letter="${l.id}">回信</button><button data-pin-letter="${l.id}">${l.pinned?'取消置顶':'置顶'}</button><button data-delete-letter="${l.id}">删除</button></div></div>`).join('');}
function renderAchievements(){const el=$('#achievementList'); if(!el)return; el.innerHTML=(state.achievements.length?state.achievements:['暂无成就']).map(a=>`<div class="bond-card"><h3>✦ ${a}</h3><p class="hint small">已解锁</p></div>`).join('');}
function renderInventory(){const el=$('#inventoryGrid'); if(!el)return; el.innerHTML=state.inventory.map(i=>`<div class="item-card"><b>${i.name}</b><p class="small">${i.desc}</p><p class="small">数量：${i.qty}</p>${i.id==='calming_candy'?'<button class="btn secondary" id="useCandyBtn">使用</button>':''}</div>`).join('');}
function contextPrompt(type,step,label,charId){
 const rel=charId?state.relations[charId]:null;
 return `你是霍格沃茨女性向竖屏文字RPG的“互动叙事智能体”，不是旁白自嗨写手。你必须回应玩家刚刚输入或选择的行动，并让NPC对玩家行为作出反应。
当前时间：${state.time.year}年${state.time.month}月；年级：一年级；当前锚点：${label||step}；场景类型：${type}。
玩家资料：姓名${state.player.name}，昵称${state.player.nickname||'无'}，外貌${state.player.appearance||'未写'}，性格${state.player.personality||'未写'}，血统${state.player.bloodStatus}，亲缘关系${state.player.siblingAnchor}。
玩家数值：健康${state.health}，压力${state.stress}，学院${state.house}，学院分${state.housePoints}。
已发生事件标签：${state.memories.join('、')||'无'}。
重要角色：${state.importantCharacters.map(id=>state.relations[id]?.name).filter(Boolean).join('、')||'无'}。
${rel?`本次羁绊对象：${rel.name}，好感${rel.affection}，熟悉度${rel.familiarity}。`:''}
硬规则：
1. 一年级只能朋友/同学关系，禁止恋爱告白、亲吻、成人暧昧。
2. 不要引用未发生事件，不要提前分院、密室、三强争霸、战争。
3. 必须承接玩家刚刚的行动，不能忽略玩家输入。
4. 每次只推进一个小片段，不要一口气结束整个锚点。
5. 输出格式固定：先写【旁白】80-160字，可攻略角色台词使用“角色名：台词”，最后写【选项】2-4个A/B/C/D选项。
6. 选项必须是下一步可执行行动，不能只是情绪描写。`;
}
function fallbackStory(step){const text={diagon_arrival:'【旁白】对角巷的砖墙在身后合拢，粉尘和阳光一起落进狭长的街道。你的手还搭在行李箱上，眼前却已经是长袍、猫头鹰、坩埚和会自己翻页的书。这里不像梦，因为每一种气味都太真实了。\n【旁白】古灵阁雪白的建筑立在街道尽头，妖精守在门前，像是在等待你迈出第一步。',gringotts:'【旁白】古灵阁大厅高得吓人，妖精们在柜台后拨动金币、羽毛笔和账簿。你听见金属碰撞的声音，那声音让魔法世界第一次显得不只是奇妙，也有秩序和规则。',robe_shop:'【旁白】摩金夫人的软尺绕着你的肩膀飞快量尺寸。镜子里的人穿着还未改好的黑袍，陌生得像另一个即将去霍格沃茨生活的女孩。',bookstore:'【旁白】丽痕书店挤满了新生。书架上有几本书故意把书脊探出来，像是在偷听你的名字。你抱起课本时，手臂很快被压得发沉。',pet_shop:'【旁白】宠物商店里全是羽毛、爪子和玻璃笼敲出的声音。一只猫头鹰转过头看你，金色眼睛里像藏着比你知道得更多的事。',equipment:'【旁白】坩埚、黄铜天平和水晶小瓶被一件件放进行李。清单上的字逐渐被划掉，你也越来越像一个真正的新生。',ollivanders:'【旁白】奥利凡德魔杖店比街上安静得多。成千上万只细长盒子堆到天花板，老人从阴影里看着你，像是在听某种只有魔杖才懂的声音。',leave_diagon:'【旁白】当最后一件物品被收进箱子，对角巷的喧闹仿佛也一起落进你的口袋。你知道，下一次出发就是九月一日。'}; const opts=mainlineOptions(step).map((o,i)=>`${String.fromCharCode(65+i)}. ${o}`).join('\n'); return `${text[step]||'【旁白】这个月的故事正在展开，某个选择会留下痕迹。'}\n【选项】\n${opts}`;}
function mainlineOptions(step){const m={diagon_arrival:['先去古灵阁','停下观察整条街','寻找看起来同龄的新生'],gringotts:['认真听妖精说明','观察地下金库方向','询问兑换和账务'],robe_shop:['安静配合量尺寸','主动和旁边的新生说话','观察镜中的自己'],bookstore:['认真核对书单','翻开一本会动的书','注意旁边的新生'],pet_shop:['观察猫头鹰','看看猫和蟾蜍','暂时不购买宠物'],equipment:['按清单购买坩埚和天平','询问店员使用方法','悄悄观察其他新生买了什么'],ollivanders:['伸手接过第一根魔杖','询问奥利凡德关于魔杖的事','保持沉默等待魔杖选择你'],leave_diagon:['整理行李准备返程','回头再看一眼对角巷'],train_carriage:['去哈利和罗恩的车厢','寻找赫敏','靠近德拉科所在车厢','找一节安静车厢'],sorting:['希望进入格兰芬多','希望进入斯莱特林','希望进入拉文克劳','希望进入赫奇帕奇'],troll_event:['与哈利罗恩一起行动','独自寻找赫敏','立刻报告教授','先保护自己']};return m[step]||['继续观察','主动询问','保持沉默'];}
function splitStoryText(text){
 const idx=text.lastIndexOf('【选项】');
 if(idx>=0) return {scene:text.slice(0,idx).trim(), optionsText:text.slice(idx+'【选项】'.length).trim()};
 return {scene:text.trim(), optionsText:''};
}
function parseStory(text,targetTextId,targetOptId,type){
 const narr=$('#'+targetTextId),opt=$('#'+targetOptId); if(!narr||!opt)return;
 const parts=splitStoryText(text);
 const options=parts.optionsText.split(/\n+/).map(x=>x.replace(/^[A-D][\.、]\s*/,'').trim()).filter(Boolean).slice(0,4);
 narr.innerHTML='';
 parts.scene.split(/\n+/).filter(Boolean).forEach(line=>{
   let clean=line.replace(/^【旁白】/,'').trim();
   if(!clean)return;
   if(clean.startsWith('玩家行动：')||clean.startsWith('你选择：')){
     narr.insertAdjacentHTML('beforeend',`<div class="player-action-line">${clean}</div>`); return;
   }
   const match=clean.match(/^([^：:]{1,12})[：:](.+)$/);
   if(match){
     const name=match[1].trim(),body=match[2].trim();
     const id=Object.keys(state.relations).find(k=>state.relations[k].name===name||state.relations[k].name.startsWith(name));
     if(id&&state.relations[id].visible){narr.insertAdjacentHTML('beforeend',`<div class="dialog-line">${charAvatar(id)}<div class="speech-bubble"><b>${state.relations[id].name}</b>${body}</div></div>`);} 
     else narr.insertAdjacentHTML('beforeend',`<div class="narrator-line">${clean}</div>`);
   } else narr.insertAdjacentHTML('beforeend',`<div class="narrator-line">${clean}</div>`);
 });
 if(options.length){opt.innerHTML=`<div class="story-options">${options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${o.replace(/"/g,'&quot;')}">${String.fromCharCode(65+i)}. ${o}</button>`).join('')}</div>`;} 
 else opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
 narr.scrollTop=narr.scrollHeight;
}
function threadIdFor(prefix, extra=''){return `${prefix}_${currentKey()}_${extra}`;}
function ensureThread(id, initialText){
 state.storyThreads=state.storyThreads||{};
 if(!state.storyThreads[id]) state.storyThreads[id]={blocks:[{ai:initialText}], turns:0};
 return state.storyThreads[id];
}
function compileThread(th){
 return th.blocks.map((b,i)=>`${b.player?`【旁白】玩家行动：${b.player}\n`:''}${b.ai||''}`).join('\n');
}
function currentMainStep(){const m=MAINLINE[currentKey()]; if(!m)return null; const done=m.steps.filter(hasStep).length; return {m,done,step:m.steps[done],label:m.labels[done]};}
function minTurnsForStep(step){return ['diagon_arrival','gringotts','robe_shop','bookstore','ollivanders','train_carriage','sorting','troll_event','stone_choice'].includes(step)?3:2;}
async function renderMainline(){
 const info=currentMainStep();
 if(!info){$('#mainlineText')&&( $('#mainlineText').innerHTML='<div class="narrator-line">当前月份主线暂未制作。</div>'); return;}
 const {m,done,step,label}=info;
 if(done>=m.steps.length){parseStory('【旁白】本月主线剧情已推进完毕，请玩家返回主页。\n【选项】\nA. 返回主页','mainlineText','mainlineOptions','main');return;}
 const fallback=fallbackStory(step);
 const tid=threadIdFor('main',step);
 const th=ensureThread(tid,fallback);
 parseStory(compileThread(th),'mainlineText','mainlineOptions','main');
 if(th.blocks.length===1 && getApiSettings().key){
   const text=await callAI([{role:'system',content:contextPrompt('main',step,label)},{role:'user',content:'生成当前锚点的开场。注意只开场，不要替玩家行动。'}],fallback);
   th.blocks[0].ai=text; save(); if($('#screen-mainline')?.classList.contains('active'))parseStory(compileThread(th),'mainlineText','mainlineOptions','main');
 }
}
async function renderMainline(){const m=MAINLINE[currentKey()]; if(!m){$('#mainlineText')&&( $('#mainlineText').innerHTML='<div class="narrator-line">当前月份主线暂未制作。</div>'); return;} const done=m.steps.filter(hasStep).length; if(done>=m.steps.length){parseStory('【旁白】本月主线剧情已推进完毕，请玩家返回主页。\n【选项】\nA. 返回主页','mainlineText','mainlineOptions','main');return;} const step=m.steps[done],label=m.labels[done],cache=`main_${currentKey()}_${step}_${state.memories.join('|')}_${state.player.name}`; const fallback=fallbackStory(step); parseStory(state.aiCache[cache]||fallback,'mainlineText','mainlineOptions','main'); if(!state.aiCache[cache]&&getApiSettings().key){const text=await callAI([{role:'system',content:contextPrompt('main',step,label)},{role:'user',content:'生成当前主线锚点剧情。'}],fallback); state.aiCache[cache]=text; save(); if($('#screen-mainline')?.classList.contains('active'))parseStory(text,'mainlineText','mainlineOptions','main');}}
async function resolveMainChoice(idx, customText){
 const info=currentMainStep(); if(!info)return;
 const {m,done,step,label}=info;
 if(!step){go('screen-game-home');return;}
 const options=mainlineOptions(step);
 const action=customText || options[idx] || '继续观察';
 const tid=threadIdFor('main',step);
 const th=ensureThread(tid,fallbackStory(step));
 th.turns=(th.turns||0)+1;
 const history=th.blocks.map(b=>`${b.player?`玩家：${b.player}\n`:''}${b.ai||''}`).join('\n---\n').slice(-5000);
 const fallback=`【旁白】你选择了${action}。这个决定让当前的局面微微改变，周围的声音、目光和细节都随之移动。你能感觉到，魔法世界并不会替你做出选择。\n【选项】\nA. 继续追问细节\nB. 观察身边的人\nC. 暂时按原计划行动`;
 const ai=await callAI([
   {role:'system',content:contextPrompt('main',step,label)},
   {role:'user',content:`历史片段：\n${history}\n\n玩家刚刚的行动/选择：${action}\n请直接回应玩家行为，生成下一段互动。不要总结完本月，不要无视玩家。`}
 ],fallback);
 th.blocks.push({player:action,ai});
 // 每个锚点至少互动数轮后才完成，避免剧情过短。
 if(th.turns>=minTurnsForStep(step)){
   completeStep(step);
   applyMainStepEffects(step,idx,action);
   addMemory(`completed_${step}`);
   th.blocks.push({ai:`【旁白】这一小段经历暂时告一段落，但它已经被写进你的新生档案。\n【选项】\nA. 继续当前月份的下一段主线`});
 }
 save(); renderGame(); parseStory(compileThread(th),'mainlineText','mainlineOptions','main');
}
function applyMainStepEffects(step,idx,action){
 if(['diagon_arrival','gringotts','robe_shop','bookstore','pet_shop','equipment','ollivanders'].includes(step)){ if(step==='ollivanders'){if(!state.achievements.includes('获得魔杖'))state.achievements.push('获得魔杖'); addMemory('got_wand');} }
 if(step==='train_carriage'){ if(idx===0){meet('harry');meet('ron');addAffection('harry',1);addAffection('ron',1);} if(idx===1){meet('hermione');addAffection('hermione',1);} if(idx===2){meet('draco');meet('blaise');meet('theo');addAffection('draco',1);} if(idx===3){meet('cedric');meet('oliver');} }
 if(step==='sorting'){state.house=['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'][idx]||'格兰芬多'; toast(`分院完成：${state.house}`);} 
 if(step.includes('potions')){meet('snape');meet('draco');addCourse('potions',1);addStress(1);} 
 if(step.includes('flying')){meet('harry');meet('oliver');addCourse('flying',1);addStress(1);} 
 if(step.includes('charms')){meet('hermione');addCourse('charms',1);addStress(1);} 
 if(step==='troll_event'){ if(idx===0){addAffection('harry',1);addAffection('ron',1);addAffection('hermione',1);addStress(12);state.worldOffset+=20;} if(idx===1){addAffection('hermione',2);addStress(18);state.worldOffset+=35;} if(idx===2){state.housePoints+=5;addMemory('reported_troll');} if(idx===3){addStress(3);} }
}
function renderBondInvite(){const sel=$('#bondInviteSelect'); if(!sel)return; const arr=Object.values(state.relations).filter(r=>r.visible&&r.met); sel.innerHTML=arr.map(r=>`<option value="${r.id}">${r.name}</option>`).join('')||'<option value="">暂无可邀请角色</option>';}
function renderBondInvite(){const sel=$('#bondInviteSelect'); if(!sel)return; const arr=Object.values(state.relations).filter(r=>r.visible&&r.met); sel.innerHTML=arr.map(r=>`<option value="${r.id}">${r.name}</option>`).join('')||'<option value="">暂无可邀请角色</option>';}
async function startBondEvent(){
 if(state.monthly.bondUsed){toast('本月已经进行过羁绊事件。');return;}
 const id=$('#bondInviteSelect').value; const r=state.relations[id]; if(!r)return;
 state.monthly.bondUsed=true; r.familiarity=clamp(r.familiarity+5,0,100); r.weight+=10;
 $('#bondEventBox').classList.remove('hidden');
 const narr=$('#bondEventBox .story-narrative'), opt=$('#bondEventBox .story-choice-zone'), input=$('#bondEventBox .story-input'), btn=$('#bondEventBox .action-jelly');
 narr.id='bondNarrative'; opt.id='bondOptions'; input.id='bondFreeInput'; btn.id='bondActionBtn';
 const tid=threadIdFor('bond',id);
 const fallback=`【旁白】你邀请${r.name}一起在城堡里走走。今天没有急着上课，也没有非做不可的作业，霍格沃茨的走廊因此显得比平时温和。\n${r.name}：只是走一段路的话，我想我有时间。\n【选项】\nA. 询问最近的课程\nB. 聊聊礼堂里的趣事\nC. 安静地并肩走一会儿`;
 const th=ensureThread(tid,fallback);
 parseStory(compileThread(th),'bondNarrative','bondOptions','bond');
 if(th.blocks.length===1 && getApiSettings().key){
   const text=await callAI([{role:'system',content:contextPrompt('bond','bond_event','羁绊事件',id)},{role:'user',content:'生成一次一年级朋友关系的羁绊事件开场。不要替玩家行动。'}],fallback);
   th.blocks[0].ai=text; save(); parseStory(compileThread(th),'bondNarrative','bondOptions','bond');
 }
 btn.onclick=()=>{const v=input.value.trim(); if(v)handleBondAction(id,v); input.value='';};
 save(); renderGame();
}
async function handleBondAction(id,action){
 const r=state.relations[id]; if(!r)return;
 const tid=threadIdFor('bond',id); const th=ensureThread(tid,''); th.turns=(th.turns||0)+1;
 const history=th.blocks.map(b=>`${b.player?`玩家：${b.player}\n`:''}${b.ai||''}`).join('\n---\n').slice(-5000);
 const fallback=`【旁白】你选择了${action}。${r.name}认真听完，短暂地看向走廊尽头，像是在斟酌该怎样回答。\n${r.name}：我明白你的意思。\n【选项】\nA. 继续聊下去\nB. 换一个轻松的话题\nC. 准备结束这次同行`;
 const ai=await callAI([{role:'system',content:contextPrompt('bond','bond_event','羁绊事件',id)},{role:'user',content:`羁绊事件历史：\n${history}\n\n玩家刚刚说/做：${action}\n请让${r.name}回应玩家。事件内不增加好感，只增加熟悉感。3-6轮后可以用角色口吻自然结束。`}],fallback);
 th.blocks.push({player:action,ai});
 if(th.turns>=4){th.blocks.push({ai:`【旁白】这段同行暂时结束了。它没有立刻改变你们的关系，却让彼此更熟悉了一点。\n【选项】\nA. 返回主页`});}
 save(); parseStory(compileThread(th),'bondNarrative','bondOptions','bond');
}
function renderNightSetup(){const p=$('#nightPartnerList'),l=$('#nightLocationList'); if(!p||!l)return; const arr=Object.values(state.relations).filter(r=>r.visible&&r.met); p.innerHTML=arr.map(r=>`<label><input type="checkbox" value="${r.id}"> ${r.name}</label>`).join('')||'<p class="hint small">暂无可邀请伙伴。</p>'; if(!nightDanger)nightDanger=NIGHT_LOCATIONS[Math.floor(Math.random()*NIGHT_LOCATIONS.length)]; l.innerHTML=NIGHT_LOCATIONS.map(x=>`<button class="choice ${x===nightDanger?'danger':''}" data-night-location="${x}">${x}${x===nightDanger?' · 高危':''}</button>`).join('');}
function startNight(){if(state.monthly.nightUsed){toast('本月已经夜游过一次。');return;} const loc=$('#nightLocationList .selected')?.dataset.nightLocation||NIGHT_LOCATIONS[0]; state.monthly.nightUsed=true; $('#nightSetup').classList.add('hidden'); const box=$('#nightExploreBox'); box.classList.remove('hidden'); let node=0; const next=()=>{node++; if(node>4){box.innerHTML='<h3>夜游结束</h3><p>你赶在天亮前回到休息室。城堡里的秘密似乎更多了，但疲惫也真实地压在肩上。</p><button class="btn primary full" data-go="screen-game-home">返回主页</button>';save();renderGame();return;} const caught=loc===nightDanger&&Math.random()<.35; if(caught){addStress(30);state.housePoints-=10;box.innerHTML=`<h3>节点 ${node}：费尔奇出现</h3><p>洛丽丝夫人的眼睛在黑暗里亮起，费尔奇的脚步声随即逼近。你被发现了。</p><button class="btn primary full" id="nightContinue">继续</button>`;} else {addStress(4);box.innerHTML=`<h3>节点 ${node}：${loc}</h3><p>走廊深处传来细微声响。盔甲的影子被月光拉长，你必须决定继续调查还是及时撤退。</p><div class="story-options"><button>观察四周</button><button>继续前进</button><button>使用荧光闪烁</button></div><button class="btn primary full" id="nightContinue">进入下一节点</button>`;} $('#nightContinue').onclick=next;}; next();}
function renderDaily(){const pool=$('#dailyEventPool'),slots=$('#dailySlots'); if(!pool||!slots)return; pool.innerHTML=DAILY_EVENTS.map(e=>`<button data-daily-id="${e.id}">${e.name}</button>`).join(''); slots.innerHTML=Array.from({length:7},(_,i)=>`<div class="daily-slot"><span>${i+1}. ${dailyPlan[i]?.name||'空白'}</span><button data-clear-slot="${i}">清除</button></div>`).join('');}
function dailyText(ev){const imp=state.importantCharacters.map(id=>state.relations[id]?.name).filter(Boolean)[0]; if(ev.id==='rest')return `你把书本合上，允许自己真正休息一会儿。${imp?`远处似乎传来${imp}和别人说话的声音，但你没有起身。`:''}`; if(ev.id==='free')return '你没有给自己安排明确目标，只是在城堡里随意走动。某些不起眼的角落，也许藏着还未被发现的秘密。'; return `你把时间花在${ev.name}上。课程并不轻松，压力也在一点点积累，但你能感觉到自己正在变得更熟练。`;}
function applyDaily(ev){if(ev.course)addCourse(ev.course,ev.courseGain||1); if(ev.attr&&ev.attrGain)addAttr(ev.attr,ev.attrGain); if(ev.stress)addStress(ev.stress); if(ev.health)addHealth(ev.health);}
function runDaily(){const box=$('#dailyRunBox'),board=$('#dailyBoard'); board.classList.add('hidden'); box.classList.remove('hidden'); box.innerHTML='<h3>本月养成日常</h3><div id="dailyResultList"></div>'; const list=$('#dailyResultList'); let i=0; const next=()=>{if(i>=7){list.insertAdjacentHTML('beforeend','<div class="daily-result-card"><h4>本月养成事件已结束</h4><p>本月也很充实呢，亲爱的小巫师！</p><button class="btn primary full" id="dailyBackHome">返回主页</button></div>'); $('#dailyBackHome').onclick=()=>{advanceMonth();board.classList.remove('hidden');box.classList.add('hidden');go('screen-game-home');};return;} const ev=dailyPlan[i]||DAILY_EVENTS.find(e=>e.id==='rest'); i++; if(ev.free){list.insertAdjacentHTML('beforeend',`<div class="free-action-box"><h4>事件 ${i}/7：自由行动</h4><p>${dailyText(ev)}</p><input id="dailyFreeInput" class="story-input" placeholder="你想自由做些什么？"><button class="action-jelly" id="dailyFreeBtn">行动</button></div>`); $('#dailyFreeBtn').onclick=()=>{const v=$('#dailyFreeInput').value||'随意探索'; addMemory('free_action'); if(Math.random()<.35){addMemory('found_possible_dungeon');toast('你似乎发现了一个副本入口的线索');} list.insertAdjacentHTML('beforeend',`<div class="daily-result-card"><h4>自由行动结果</h4><p>你选择了：${v}。城堡用安静的方式回应了你的好奇。</p></div>`); next();};return;} applyDaily(ev); const gains=[]; if(ev.course)gains.push(`${courseLabel(ev.course)} +${ev.courseGain||1}`); if(ev.stress)gains.push(`压力 ${ev.stress>0?'+':''}${ev.stress}`); if(ev.health)gains.push(`健康 ${ev.health>0?'+':''}${ev.health}`); list.insertAdjacentHTML('beforeend',`<div class="daily-result-card"><h4>事件 ${i}/7：${ev.name}</h4><p>${dailyText(ev)}</p><p class="daily-gains">${gains.join(' · ')||'无数值变化'}</p></div>`); save();renderGame();setTimeout(next,120);}; next();}
function advanceMonth(){state.time.month++; if(state.time.month>12){state.time.month=1;state.time.year++;} Object.values(state.relations).forEach(r=>{r.monthlyGain=0;r.trend='🟰'}); state.monthly={bondUsed:false,nightUsed:false,activeLetterUsed:false}; maybeFamilyLetter(); save(); renderGame();}
function maybeFamilyLetter(){if(/孤儿|父母双亡|无人/.test(state.player.parents||''))return; const content=`致${state.player.nickname||state.player.name}：\n\n新的一月开始了。家里一切照旧，只是你的房间比从前安静了许多。无论霍格沃茨的生活多么新奇，都请记得按时休息。\n\n家里`; state.letters.push({id:uid(),sender:'family',senderName:'家里',title:`家里在${state.time.year}年${state.time.month}月寄出`,time:{...state.time},read:false,pinned:false,content,replies:[]});}
function openLetter(id){const l=state.letters.find(x=>x.id===id); if(!l)return; l.read=true; save(); renderLetters(); $('#letterDialogContent').innerHTML=`<div class="paper"><h3>${l.title}</h3><p>${l.content.replace(/\n/g,'<br>')}</p>${(l.replies||[]).map(r=>`<hr><p><b>附件回复：</b><br>${r.replace(/\n/g,'<br>')}</p>`).join('')}</div>`; $('#letterDialog').showModal();}
async function replyLetter(id){const l=state.letters.find(x=>x.id===id); if(!l)return; $('#letterDialogContent').innerHTML=`<div class="paper"><h3>回信给${l.senderName}</h3><textarea id="replyContent" class="textarea" placeholder="请亲自写下你的回信。"></textarea><button class="btn primary full" id="sendReplyBtn">寄出回信</button></div>`; $('#letterDialog').showModal(); $('#sendReplyBtn').onclick=async()=>{const txt=$('#replyContent').value.trim(); if(!txt)return; const fallback=`我收到你的回信了。读到那些话的时候，我停了很久。也许现在还不能把一切都说清楚，但我会记得你写下的内容。`; const resp=await callAI([{role:'system',content:`你扮演${l.senderName}，写一封约300字以内的附件回复。一年级只保持朋友关系。称呼玩家可用昵称：${state.player.nickname||state.player.name}。`},{role:'user',content:`原信：${l.content}\n玩家回信：${txt}`}],fallback); l.replies=l.replies||[]; l.replies.push(resp); save(); renderLetters(); openLetter(id);};}
function letterMenu(){const met=Object.values(state.relations).filter(r=>r.visible&&r.met); $('#letterDialogContent').innerHTML=`<div class="paper"><h3>猫头鹰邮局</h3><button class="btn primary full" id="writeLetterBtn">写信</button><button class="btn secondary full" id="myLettersBtn">我的信件</button><p class="hint small">每个月只能主动寄出一封信，回信不受限制。</p></div>`; $('#letterDialog').showModal(); $('#writeLetterBtn').onclick=()=>{if(state.monthly.activeLetterUsed){toast('这个月你已经主动寄出过一封信。');return;} $('#letterDialogContent').innerHTML=`<div class="paper"><h3>写信</h3><select id="writeTo" class="input">${met.map(r=>`<option value="${r.id}">${r.name}</option>`).join('')}</select><textarea id="writeContent" class="textarea" placeholder="请亲自写下信件内容。"></textarea><button class="btn primary full" id="sendActiveLetter">寄出信件</button></div>`; $('#sendActiveLetter').onclick=async()=>{const id=$('#writeTo').value,txt=$('#writeContent').value.trim(),r=state.relations[id]; if(!txt||!r)return; state.monthly.activeLetterUsed=true; state.sentLetters.push({id:uid(),to:id,toName:r.name,content:txt,time:{...state.time}}); r.weight+=5; const fallback=`致${salutationFor(id,20)}：\n\n你的信我收到了。说实话，我没想到你会这样写给我。霍格沃茨有太多事情会被人忘记，但信纸上的字不一样，它们会留下来。\n\n我会记得你说的话。\n\n• ${r.name}`; const resp=await callAI([{role:'system',content:`你扮演${r.name}，给一年级女性玩家写一封约300字以内的回信。只保持朋友或同学关系。称呼使用玩家昵称：${state.player.nickname||state.player.name}。`},{role:'user',content:txt}],fallback); state.letters.push({id:uid(),sender:id,senderName:r.name,title:`${r.name}在${state.time.year}年${state.time.month}月回信`,time:{...state.time},read:false,pinned:false,content:resp,replies:[]}); save(); renderLetters(); $('#letterDialog').close(); toast(`${r.name}很快回了信。`);};}; $('#myLettersBtn').onclick=()=>{$('#letterDialogContent').innerHTML=`<div class="paper"><h3>我的信件</h3>${state.sentLetters.map(s=>`<p><b>写给${s.toName}</b><br>${s.content}</p>`).join('')||'<p>你还没有寄出过信。</p>'}</div>`;};}
function renderCharacterAvatarSettings(){const el=$('#characterAvatarSettings'); if(!el)return; const arr=Object.values(state.relations).filter(r=>r.visible&&r.met); el.innerHTML=arr.map(r=>`<div class="char-avatar-row"><span>${charAvatar(r.id)} ${r.name}</span><label>更改头像<input type="file" accept="image/*" data-char-avatar="${r.id}" hidden></label></div>`).join('')||'<p class="hint small">已登场可攻略角色会出现在这里。</p>';}
function applyTheme(t){const themes={pink:{bg:'#ffeaf3',panel:'#fffaf6',primary:'#f58ab2',secondary:'#f7c6d9',accent:'#d7aa57',text:'#5a3d45',muted:'#9d7a84',border:'#f1bfd1',bubble:'#fff'},green:{bg:'#e9f3ee',panel:'#f8fff9',primary:'#5c9275',secondary:'#b8d5c7',accent:'#8eaa72',text:'#30473a',muted:'#66806f',border:'#b8d5c7',bubble:'#fff'},red:{bg:'#fff0ef',panel:'#fffafa',primary:'#b94f5c',secondary:'#edb4aa',accent:'#c39457',text:'#5a3036',muted:'#9a6b70',border:'#edb4aa',bubble:'#fffdfd'},blue:{bg:'#eef4ff',panel:'#fbfdff',primary:'#6d8ecf',secondary:'#c1d2f4',accent:'#8fa8d8',text:'#2d3b58',muted:'#647391',border:'#c1d2f4',bubble:'#fff'},yellow:{bg:'#fff8dd',panel:'#fffdf5',primary:'#d2a84f',secondary:'#f1daa1',accent:'#b88c3c',text:'#5b4625',muted:'#92794b',border:'#f1daa1',bubble:'#fffefa'},night:{bg:'#100c1e',panel:'#1f1933',primary:'#7561b6',secondary:'#3b3158',accent:'#bda46e',text:'#f6eefb',muted:'#bcaed0',border:'#4a3f6b',bubble:'#2a2240'}}; const x=themes[t]||themes.pink; Object.entries(x).forEach(([k,v])=>document.documentElement.style.setProperty('--'+k,v)); state.theme=t; save();}
function applySavedAppearance(){applyTheme(state.theme||'pink'); if($('#themeSelect'))$('#themeSelect').value=state.theme||'pink'; if(state.customBg){$('#app').style.backgroundImage=`url(${state.customBg})`; document.documentElement.style.setProperty('--custom-bg',`url(${state.customBg})`);} const op=Number(state.bgOpacity??40); document.documentElement.style.setProperty('--bg-opacity',String(1-op/100)); if($('#bgOpacity'))$('#bgOpacity').value=op; if($('#bgOpacityLabel'))$('#bgOpacityLabel').textContent=op+'%';}
async function testApiConnection(){const st=$('#apiStatus'); st.className='status-text'; st.textContent='正在测试连接……'; localStorage.setItem(API_KEY,JSON.stringify({provider:$('#apiProvider').value,key:$('#apiKey').value,base:$('#apiBase').value,model:$('#apiModel').value})); const txt=await callAI([{role:'system',content:'只回复 OK。'},{role:'user',content:'测试连接'}],null); if(txt){st.className='status-text api-ok';st.textContent='连接成功：'+txt.slice(0,30);}else{st.className='status-text api-bad';st.textContent='连接失败：请检查密钥、模型或浏览器跨域。';}}
function openSaveLoad(isSave){let slots=JSON.parse(localStorage.getItem(SAVE_KEY)||'[null,null,null,null]'); const draw=()=>{$('#saveDialogContent').innerHTML=`<div class="paper"><h3>${isSave?'存档':'读档'}</h3><div class="save-grid">${slots.map((s,i)=>`<div class="save-slot"><b>存档位 ${i+1}</b><p>${s?`${s.realTime}<br>游戏时间：${s.state.time.year}年${s.state.time.month}月<br>${s.state.player?.name||'新生'}`:'空存档位'}</p><button class="btn secondary" data-slot="${i}">${isSave?'保存到此处':'读取此存档'}</button></div>`).join('')}</div></div>`; $$('[data-slot]',$('#saveDialog')).forEach(b=>b.onclick=()=>{const i=+b.dataset.slot; if(isSave){slots[i]={realTime:new Date().toLocaleString(),state:JSON.parse(JSON.stringify(state))}; localStorage.setItem(SAVE_KEY,JSON.stringify(slots)); toast('存档完成'); draw();}else{if(!slots[i]){toast('这里还没有存档哦。');return;} state=slots[i].state; migrateState(); save(); $('#saveDialog').close(); go('screen-game-home'); renderGame();}});}; draw(); $('#saveDialog').showModal();}
function bindEvents(){document.addEventListener('click',e=>{const g=e.target.closest('[data-go]')?.dataset.go; if(g){if(g==='screen-summary'){buildSummary();renderSummary();} go(g);} const tab=e.target.closest('[data-tab]')?.dataset.tab; if(tab)go(tab); if(e.target.matches('.choice')){const group=e.target.closest('[data-choice]'); if(group){$$('.choice',group).forEach(b=>b.classList.remove('selected')); e.target.classList.add('selected'); handleChoiceVisibility();}} const l=e.target.closest('[data-lock]')?.dataset.lock; if(l){lockedAttr=lockedAttr===l?null:l;renderAttrList();} const p=e.target.closest('[data-plus]')?.dataset.plus; if(p&&freePoints>0){const total=ATTRS.reduce((s,[id])=>s+(baseAttrs[id]||0)+(addedPoints[id]||0),0),v=(baseAttrs[p]||0)+(addedPoints[p]||0); if(total>=64){toast('本次评估无法再增加潜质点。');return;} if(v<10){addedPoints[p]++;freePoints--;renderAttrList();}} const mc=e.target.closest('[data-main-choice]'); if(mc)resolveMainChoice(+mc.dataset.mainChoice, mc.dataset.choiceText); const bc=e.target.closest('[data-bond-choice]'); if(bc){const id=$('#bondInviteSelect')?.value; handleBondAction(id, bc.dataset.choiceText||bc.textContent);} const de=e.target.closest('[data-daily-id]')?.dataset.dailyId; if(de){if(dailyPlan.length<7)dailyPlan.push(DAILY_EVENTS.find(x=>x.id===de));renderDaily();} const clear=e.target.closest('[data-clear-slot]')?.dataset.clearSlot; if(clear!==undefined){dailyPlan.splice(+clear,1);renderDaily();} const loc=e.target.closest('[data-night-location]')?.dataset.nightLocation; if(loc){$$('#nightLocationList .choice').forEach(b=>b.classList.remove('selected')); e.target.classList.add('selected');} const ol=e.target.closest('[data-open-letter]')?.dataset.openLetter; if(ol)openLetter(ol); const rl=e.target.closest('[data-reply-letter]')?.dataset.replyLetter; if(rl)replyLetter(rl); const pl=e.target.closest('[data-pin-letter]')?.dataset.pinLetter; if(pl){const x=state.letters.find(l=>l.id===pl); if(x)x.pinned=!x.pinned;save();renderLetters();} const dl=e.target.closest('[data-delete-letter]')?.dataset.deleteLetter; if(dl){state.letters=state.letters.filter(l=>l.id!==dl);save();renderLetters();}});
 $('#avatarInput')?.addEventListener('change',e=>{const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{$('#avatarPreview').src=r.result;$('#avatarPreview').style.display='block';$('#avatarPlaceholder').style.display='none';}; r.readAsDataURL(f);});
 $('#saveApiBtn')?.addEventListener('click',()=>{localStorage.setItem(API_KEY,JSON.stringify({provider:$('#apiProvider').value,key:$('#apiKey').value,base:$('#apiBase').value,model:$('#apiModel').value})); $('#apiStatus').className='status-text api-ok'; $('#apiStatus').textContent='API 设置已保存。';}); $('#testApiBtn')?.addEventListener('click',testApiConnection);
 $('#continueBtn')?.addEventListener('click',()=>{const s=load(); if(s){state=s;migrateState();applySavedAppearance();go('screen-game-home');}else alert('暂无存档。');});
 $('#rerollBtn')?.addEventListener('click',()=>{const keep=lockedAttr?baseAttrs[lockedAttr]:null;baseAttrs=randomBaseAttrs();if(lockedAttr)baseAttrs[lockedAttr]=keep;addedPoints=Object.fromEntries(ATTRS.map(([id])=>[id,0]));freePoints=8;renderAttrList();}); $('#resetPointsBtn')?.addEventListener('click',()=>{addedPoints=Object.fromEntries(ATTRS.map(([id])=>[id,0]));freePoints=8;renderAttrList();}); $('#goSummaryBtn')?.addEventListener('click',()=>{buildSummary();renderSummary();go('screen-summary');}); $('#finishBtn')?.addEventListener('click',()=>{buildSummary();save();go('screen-mainline');toast('对角巷的砖墙在你身后合拢。');}); $('#submitMainlineAction')?.addEventListener('click',()=>{const v=$('#freeActionInput').value.trim(); if(!v){toast('请先写下你的行动。');return;} addMemory('free_action_'+currentKey()); resolveMainChoice(0,v); $('#freeActionInput').value='';}); $('#startBondEventBtn')?.addEventListener('click',startBondEvent); $('#startNightBtn')?.addEventListener('click',startNight); $('#resetDailyBtn')?.addEventListener('click',()=>{dailyPlan=[];renderDaily();}); $('#confirmDailyBtn')?.addEventListener('click',()=>{while(dailyPlan.length<7)dailyPlan.push(DAILY_EVENTS.find(e=>e.id==='rest'));runDaily();}); $('#letterPlusBtn')?.addEventListener('click',letterMenu); $('#closeLetterDialog')?.addEventListener('click',()=>$('#letterDialog').close()); $('#closeSaveDialog')?.addEventListener('click',()=>$('#saveDialog').close()); $('#homeLoadBtn')?.addEventListener('click',()=>openSaveLoad(false)); $('#openSaveBtn')?.addEventListener('click',()=>openSaveLoad(true)); $('#openLoadBtn')?.addEventListener('click',()=>openSaveLoad(false)); $('#saveNicknameBtn')?.addEventListener('click',()=>{state.player.nickname=$('#nicknameInput').value;save();renderGame();}); $('#themeSelect')?.addEventListener('change',e=>{applyTheme(e.target.value);renderGame();}); $('#bgUpload')?.addEventListener('change',e=>{const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{state.customBg=r.result;applySavedAppearance();save();}; r.readAsDataURL(f);}); $('#bgOpacity')?.addEventListener('input',e=>{state.bgOpacity=+e.target.value;applySavedAppearance();save();}); document.addEventListener('change',e=>{const id=e.target.dataset.charAvatar; if(!id)return; const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{state.characterAvatars[id]=r.result;save();renderGame();}; r.readAsDataURL(f);});}
function boot(){state=load()||freshState();migrateState();initCreation();bindEvents();handleChoiceVisibility();applySavedAppearance();renderGame();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

/* ===== v1.5 persistence + AI database + relationship restrictions patch ===== */
const HP_LORE_DB={
  world:{era:'1991年魔法世界，玩家是一年级女巫，与哈利·波特同届。故事从1991年8月对角巷开始。',hardRules:['一年级不生成恋爱告白或成人暧昧。','AI只能引用state.memories与已完成锚点，不可编造玩家经历。','主线有固定锚点，但呈现给玩家必须是动态互动。','场景切换必须通过选项询问玩家，不可在玩家选择后立刻强制跳场。']},
  playableRoles:Object.fromEntries(Object.entries(CHARACTERS).map(([id,c])=>[id,{name:c.name,openYear:c.yearOpen,group:c.group,hidden:!!c.hidden,baseWeight:c.weight||0}])),
  endings:{year1:['学院杯总结','魔法石参与者','旁观者','被斯内普记住的新生'],longTerm:['角色HE/NE/BE','职业结局','战争结局','世界线偏移结局']},
  relationshipRules:{visibleOnMeet:true,affectionGainPerAction:'1-2',monthlyCap:3,importance:'affection*2+familiarity+weight/10+tags'}
};
const CANON_CHARACTER_ID={'哈利·波特':'harry','德拉科·马尔福':'draco','韦斯莱家族':'ron','赫敏·格兰杰':'hermione','纳威·隆巴顿':'neville','卢娜·洛夫古德':'luna','塞德里克·迪戈里':'cedric','西奥多·诺特':'theo','布雷斯·扎比尼':'blaise','奥利弗·伍德':'oliver'};
const SIBLING_RULES={
  '哈利·波特':['哥哥','弟弟'], '德拉科·马尔福':['哥哥','弟弟'], '赫敏·格兰杰':['姐姐','妹妹'],
  '纳威·隆巴顿':['哥哥','弟弟'], '西奥多·诺特':['哥哥','弟弟'], '布雷斯·扎比尼':['哥哥','弟弟'],
  '卢娜·洛夫古德':['妹妹'], '塞德里克·迪戈里':['哥哥'], '奥利弗·伍德':['哥哥'], '韦斯莱家族':['哥哥','姐姐','弟弟','妹妹']
};
function updateCanonRelationOptions(){
  const sel=$('#canonSiblingCharacter'), box=$('[data-choice="canonRelation"]'); if(!sel||!box)return;
  const allowed=SIBLING_RULES[sel.value]||['哥哥','姐姐','弟弟','妹妹'];
  box.innerHTML=allowed.map((r,i)=>`<button class="choice ${i===0?'selected':''}" data-value="${r}">${r}</button>`).join('');
}
const _oldHandleChoiceVisibility=handleChoiceVisibility;
handleChoiceVisibility=function(){_oldHandleChoiceVisibility(); updateCanonRelationOptions();};
const _oldCollectPlayer=collectPlayer;
collectPlayer=function(){
  const p=_oldCollectPlayer();
  const sib=$('[data-choice="siblingType"] .selected')?.dataset.value||'没有';
  if(sib==='原著角色兄弟姐妹'){
    const cname=$('#canonSiblingCharacter')?.value||'哈利·波特';
    const rel=$('[data-choice="canonRelation"] .selected')?.dataset.value||(SIBLING_RULES[cname]||['妹妹'])[0];
    const bond=$('[data-choice="canonBond"] .selected')?.dataset.value||'是';
    p.siblingAnchor=`${cname}是你的${rel}，核心羁绊对象：${bond}。`;
    p.siblingCharacterName=cname;p.siblingCharacterId=CANON_CHARACTER_ID[cname]||'';p.siblingRelation=rel;p.siblingBond=bond;
  }
  return p;
};
function ensureSiblingBondVisible(){
  const id=state.player?.siblingCharacterId;
  if(id&&state.relations[id]){state.relations[id].visible=true;state.relations[id].met=true;state.relations[id].familiarity=Math.max(state.relations[id].familiarity,20);state.relations[id].weight+=30;addMemory('kinship_'+id);updateImportantCharacters();}
}
const _oldBuildSummary=buildSummary;
buildSummary=function(){_oldBuildSummary(); ensureSiblingBondVisible(); save();};
function enrichContext(){return `\nAI数据库摘要：${JSON.stringify(HP_LORE_DB).slice(0,4500)}\n角色头像与出场：${Object.values(state.relations).filter(r=>r.visible).map(r=>`${r.name}(好感${r.affection},熟悉${r.familiarity},已见${r.met})`).join('；')}`;}
const _oldContextPrompt=contextPrompt;
contextPrompt=function(type,step,label,charId){return _oldContextPrompt(type,step,label,charId)+enrichContext()+`\n叙事连续性规则补充：所有已出现对话必须保留。玩家选择后必须先回应玩家，不得直接换场景；若需要换地点或时间，必须把“去某地/结束此段/天色太晚”作为选项交给玩家。换背景或时间时只输出一条金色分割线提示，不删除之前内容。`;};
function renderThreadToUI(thread,textId,optId,type){parseStory(compileThread(thread),textId,optId,type);}
// 覆盖主线渲染：保留整段线程，不再用缓存单段覆盖
renderMainline=async function(){
  const info=currentMainStep();
  if(!info){$('#mainlineText')&&( $('#mainlineText').innerHTML='<div class="narrator-line">当前月份主线暂未制作。</div>');return;}
  const {m,done,step,label}=info;
  if(done>=m.steps.length){
    const tid=threadIdFor('main','month_done'); const th=ensureThread(tid,'【旁白】本月主线剧情已推进完毕，请玩家返回主页。\n【选项】\nA. 返回主页');
    renderThreadToUI(th,'mainlineText','mainlineOptions','main');return;
  }
  const tid=threadIdFor('main',step); const th=ensureThread(tid,fallbackStory(step));
  renderThreadToUI(th,'mainlineText','mainlineOptions','main');
  if(th.blocks.length===1 && getApiSettings().key && !th.aiOpened){
    th.aiOpened=true;
    const text=await callAI([{role:'system',content:contextPrompt('main',step,label)},{role:'user',content:'生成当前主线锚点开场。只开场，不要替玩家行动；最后给2-4个选项。'}],fallbackStory(step));
    th.blocks[0].ai=text; save(); if($('#screen-mainline')?.classList.contains('active'))renderThreadToUI(th,'mainlineText','mainlineOptions','main');
  }
};
resolveMainChoice=async function(idx, customText){
 const info=currentMainStep(); if(!info)return; const {step,label}=info; if(!step){go('screen-game-home');return;}
 const action=customText || mainlineOptions(step)[idx] || '继续观察';
 const tid=threadIdFor('main',step); const th=ensureThread(tid,fallbackStory(step));
 th.turns=(th.turns||0)+1;
 const history=compileThread(th).slice(-6500);
 const fallback=`【旁白】你选择了${action}。周围的反应没有立刻把你推向下一个地方，而是先停在你眼前：有人看向你，有人等着你的下一句话。\n【选项】\nA. 继续追问细节\nB. 观察身边的人\nC. 去下一个地方再看看吧`;
 const ai=await callAI([{role:'system',content:contextPrompt('main',step,label)},{role:'user',content:`当前连续剧情：\n${history}\n\n玩家刚刚选择/输入：${action}\n必须先回应玩家行为。除非玩家选择“去某地/结束”，否则不得切换场景。输出旁白和角色台词，最后给2-4个选项。`}],fallback);
 th.blocks.push({player:action,ai});
 // 只有当玩家主动选择明显转场/结束类选项，且达到最低轮次，才完成锚点
 if(th.turns>=minTurnsForStep(step) && /(去|前往|离开|结束|下一|继续当前月份的下一段|准备返程|回到|进入|先去)/.test(action)){
   completeStep(step); applyMainStepEffects(step,idx,action); addMemory(`completed_${step}`);
   th.blocks.push({ai:'【旁白】—— 金色的墨迹在页面中间划开一道细线，这段经历被记录下来。\n【选项】\nA. 继续当前月份的下一段主线'});
 }
 save(); renderGame(); renderThreadToUI(th,'mainlineText','mainlineOptions','main');
};
// 覆盖羁绊：选择后弹窗式选择区隐藏，直接进入同样的连续剧情
startBondEvent=async function(){
 if(state.monthly.bondUsed){toast('本月已经进行过羁绊事件。');return;} const id=$('#bondInviteSelect').value; const r=state.relations[id]; if(!r)return;
 state.monthly.bondUsed=true; r.met=true;r.visible=true;r.familiarity=clamp(r.familiarity+5,0,100);r.weight+=10;updateImportantCharacters();
 $('#bondEventBox').classList.remove('hidden'); const setup=$('#screen-bond-event .game-card'); if(setup)setup.classList.add('hidden');
 const narr=$('#bondEventBox .story-narrative'), opt=$('#bondEventBox .story-choice-zone'), input=$('#bondEventBox .story-input'), btn=$('#bondEventBox .action-jelly');
 narr.id='bondNarrative'; opt.id='bondOptions'; input.id='bondFreeInput'; btn.id='bondActionBtn';
 const tid=threadIdFor('bond',id); const fallback=`【旁白】你邀请${r.name}一起待一会儿。现在的你们只是同学或朋友，很多话还不适合说得太满，但霍格沃茨的走廊足够长，能容纳一次慢慢开始的交谈。\n${r.name}：可以。你想去哪儿？\n【选项】\nA. 去礼堂附近走走\nB. 找个安静的角落说话\nC. 只是在走廊里并肩走一会儿`;
 const th=ensureThread(tid,fallback); renderThreadToUI(th,'bondNarrative','bondOptions','bond');
 if(th.blocks.length===1 && getApiSettings().key && !th.aiOpened){th.aiOpened=true; const text=await callAI([{role:'system',content:contextPrompt('bond','bond_event','羁绊事件',id)},{role:'user',content:`生成${r.name}的一年级朋友关系羁绊事件开场。不要替玩家行动。`}],fallback); th.blocks[0].ai=text; save();renderThreadToUI(th,'bondNarrative','bondOptions','bond');}
 btn.onclick=()=>{const v=input.value.trim(); if(v)handleBondAction(id,v); input.value='';}; save(); renderGame();
};
// 夜游改为线程式，保留所有节点
startNight=function(){
 if(state.monthly.nightUsed){toast('本月已经夜游过一次。');return;} const loc=$('#nightLocationList .selected')?.dataset.nightLocation||NIGHT_LOCATIONS[0]; state.monthly.nightUsed=true;
 $('#nightSetup').classList.add('hidden'); const box=$('#nightExploreBox'); box.classList.remove('hidden'); box.className='story-shell'; box.innerHTML='<div id="nightNarrative" class="story-narrative"></div><div id="nightOptions" class="story-choice-zone"></div><div class="story-input-zone"><input id="nightFreeInput" class="story-input" placeholder="你还会怎么做呢？"><button id="nightActionBtn" class="action-jelly">行动</button></div>';
 const tid=threadIdFor('night',loc); const th=ensureThread(tid,`【旁白】夜色压在${loc}附近，城堡白天的热闹被门缝后的风声取代。你知道今晚费尔奇可能在某些地方巡逻得更勤。\n【选项】\nA. 先观察周围\nB. 放轻脚步继续前进\nC. 如果太危险就撤退`);
 th.turns=th.turns||0; renderThreadToUI(th,'nightNarrative','nightOptions','night');
 const act=async(v)=>{th.turns++; const caught=loc===nightDanger&&Math.random()<.25; const fallback=caught?`【旁白】你刚做出“${v}”的决定，洛丽丝夫人的眼睛就在黑暗里亮起。费尔奇的脚步声随即逼近，你不得不立刻躲避。\n【选项】\nA. 赶紧藏起来\nB. 低声念一个转移注意的咒语\nC. 现在似乎太晚了，先回去`:`【旁白】你选择${v}。夜色没有马上吞掉你的声音，反而把每一点细节都放大了：石墙、脚步、远处摇晃的火光。\n【选项】\nA. 调查墙边痕迹\nB. 继续向前\nC. 现在似乎太晚了，先回去`;
    if(caught){addStress(30);state.housePoints-=10;} else addStress(3);
    const ai=await callAI([{role:'system',content:contextPrompt('night','night_explore',loc)},{role:'user',content:`夜游地点：${loc}\n历史：${compileThread(th).slice(-5000)}\n玩家行动：${v}\n请按探索节点回应，不要删除旧对话。`}],fallback);
    th.blocks.push({player:v,ai}); if(th.turns>=4||/回去|撤退|结束|太晚/.test(v)) th.blocks.push({ai:'【旁白】—— 金色分割线划过羊皮纸，今晚的夜游暂时结束。\n【选项】\nA. 返回主页'}); save();renderThreadToUI(th,'nightNarrative','nightOptions','night');};
 $('#nightActionBtn').onclick=()=>{const v=$('#nightFreeInput').value.trim(); if(v)act(v); $('#nightFreeInput').value='';};
 document.querySelectorAll('#nightOptions [data-night-choice]').forEach(()=>{});
};
// 让夜游/主线/羁绊的动态按钮统一可用
document.addEventListener('click',e=>{const nc=e.target.closest('[data-night-choice]'); if(nc&&$('#nightActionBtn')){$('#nightFreeInput').value=nc.dataset.choiceText||nc.textContent; $('#nightActionBtn').click();}});
// parseStory补充夜游选项
const _oldParseStory=parseStory;
parseStory=function(text,targetTextId,targetOptId,type){_oldParseStory(text,targetTextId,targetOptId,type); if(type==='night'){const opt=$('#'+targetOptId); if(opt) $$('button',opt).forEach((b,i)=>{b.setAttribute('data-night-choice',i); b.dataset.choiceText=b.textContent.replace(/^[A-D][\.、]\s*/,'');});}};
// 主题色联动主页四宫格与更多元素
const _oldApplyTheme=applyTheme;
applyTheme=function(t){_oldApplyTheme(t); document.documentElement.dataset.theme=t;};
// 羁绊显示：所有已登场可攻略角色均显示，无论好感是否变化
renderBonds=function(){const el=$('#bondList'); if(!el)return; const arr=Object.values(state.relations).filter(r=>r.visible&&r.met).sort((a,b)=>b.affection-a.affection||b.familiarity-a.familiarity); if(!arr.length){el.innerHTML='<div class="empty-card"><p>已登场的可攻略角色会出现在这里。</p></div>';return;} el.innerHTML=arr.map(r=>`<div class="bond-card"><div class="bond-card-head">${charAvatar(r.id)}<h3>${r.name} ${r.trend}</h3></div><div class="stat-line"><span>好感</span><b>${r.hidden?'？？':r.affection+'/100'}</b></div><div class="bar"><i style="width:${r.hidden?20:r.affection}%"></i></div><div class="stat-line"><span>熟悉度</span><b>${r.familiarity}/100</b></div><p class="hint small">详情：${r.hidden?'？？？':stage(r.affection)}</p></div>`).join('');};
// 初始化时绑定原著兄弟姐妹选择变化
setTimeout(()=>{$('#canonSiblingCharacter')?.addEventListener('change',updateCanonRelationOptions); updateCanonRelationOptions();},0);

/* ===== v1.6 expanded AI database prompt + theme quick buttons ===== */
const HP_EXPANDED_DB = {
  worldSummary: '1991-1998霍格沃茨七学年。玩家是女性一年级新生，与哈利同届。故事必须从1991年8月对角巷入学采购开始。',
  hardRules: [
    '一年级只允许朋友、同学、好奇、信任与保护欲萌芽，禁止恋爱告白、亲吻、成人暧昧。',
    '所有剧情必须回应玩家刚刚输入/选择的行动。',
    'AI不能引用未发生事件；只能引用已完成锚点、state.memories和玩家当前经历。',
    '切换地点/时间必须用选项交给玩家确认，不可直接跳场。',
    '可攻略角色登场即进入羁绊界面，哪怕好感没有变化。',
    '选项必须是可执行行动，不是单纯情绪。'
  ],
  year1Months: {
    '1991-8':'对角巷：古灵阁、长袍店、丽痕书店、宠物店、装备店、奥利凡德、离开对角巷。禁止上课/分院/夜游。',
    '1991-9':'站台、列车、车厢选择、分院、学院晚宴、公共休息室。',
    '1991-10':'第一堂魔药课、飞行课、魔咒课，课堂适应与教授关注。',
    '1991-11':'万圣节与巨怪事件，是第一个大型世界线偏移点。',
    '1991-12':'圣诞节、礼物、厄里斯魔镜，镜中景象根据玩家资料生成。',
    '1992-1':'尼可·勒梅与魔法石调查。',
    '1992-2':'魁地奇与学院竞争。',
    '1992-3':'禁林边缘与独角兽传闻。',
    '1992-4':'考试压力与复习。',
    '1992-5':'魔法石最终事件。',
    '1992-6':'期末、学院杯、暑假前总结。'
  },
  characterNotes: {
    harry:'哈利：勇敢、孤独、真诚、冲动。一年级不知道魂器等未来真相。关系成长靠共同经历。',
    ron:'罗恩：热闹、忠诚、自尊心强，韦斯莱家庭感。说话口语化，嘴快。',
    hermione:'赫敏：聪明、认真、守规则，渴望朋友。前期不擅社交，巨怪事件影响巨大。',
    draco:'德拉科：骄傲、好胜、敏感、纯血教育。带刺、试探、重视体面。一年级主题是偏见与好奇。',
    theo:'西奥多：安静、观察者、慢热、高智商。短句，像在观察。常在图书馆、黑湖、窗边。',
    blaise:'布雷斯：社交、优雅、八卦敏锐，像校园情报中心。',
    fred:'弗雷德：大胆、恶作剧、主动、玩笑多。',
    george:'乔治：幽默但更柔和，更细腻。',
    cedric:'塞德里克：温和、公平、可靠，高年级学长，出现不频繁但印象深。',
    oliver:'奥利弗：魁地奇狂热、责任感强。',
    cho:'秋：拉文克劳学姐，温柔、聪明、魁地奇。',
    snape:'斯内普：隐藏路线。冷淡、克制、刻薄、观察。普通好感不等于隐秘好感，前期只表现教授关注。'
  },
  mechanics: '属性0-200；创建初始4-8；健康0-100；压力0-100；好感0-100，单次+1~2，每月每人最多+3；熟悉度0-100；课程熟练度按学年独立，一年级0-25；学院分可负；存在重要角色、事件标签、世界线偏移。'
};
contextPrompt = function(type,step,label,charId){
 const rel=charId?state.relations[charId]:null;
 const key=`${state.time.year}-${state.time.month}`;
 const visibleRels=Object.values(state.relations||{}).filter(r=>r.visible||r.met).map(r=>`${r.name}(好感${r.affection||0}/熟悉${r.familiarity||0})`).join('、')||'暂无';
 const charNote=charId&&HP_EXPANDED_DB.characterNotes[charId]?HP_EXPANDED_DB.characterNotes[charId]:'';
 return `你是《HPWorld》霍格沃茨女性向竖屏AI文字RPG的互动叙事智能体。你不是自嗨旁白，必须像智能体一样承接玩家行动并回应玩家。
【世界观】${HP_EXPANDED_DB.worldSummary}
【当前月份资料】${HP_EXPANDED_DB.year1Months[key]||'当前月份资料未完全开放，请严格停留在当前锚点。'}
【当前状态】时间${state.time.year}年${state.time.month}月；年级一年级；锚点${label||step}；场景类型${type}。
【玩家】姓名${state.player.name||'未命名'}；昵称${state.player.nickname||'无'}；外貌${state.player.appearance||'未写'}；性格${state.player.personality||'未写'}；血统${state.player.bloodStatus||'未定'}；亲缘关系${state.player.siblingAnchor||'无'}。
【数值】健康${state.health}；压力${state.stress}；学院${state.house}；学院分${state.housePoints}。
【已发生事件标签】${state.memories.join('、')||'无'}。
【已登场/羁绊角色】${visibleRels}。
【重要角色】${state.importantCharacters.map(id=>state.relations[id]?.name).filter(Boolean).join('、')||'无'}。
${rel?`【本次对象】${rel.name}：好感${rel.affection}，熟悉度${rel.familiarity}。${charNote}`:''}
【机制】${HP_EXPANDED_DB.mechanics}
【硬规则】${HP_EXPANDED_DB.hardRules.map((r,i)=>`${i+1}. ${r}`).join('\n')}
【输出规则】
1. 先回应玩家刚刚做了什么，再推进一小步。
2. 可攻略角色台词用“角色名：台词”；普通NPC放旁白，如“奥利凡德对你说……”。
3. 输出格式：若有旁白用【旁白】，最后用【选项】给2-4个A/B/C/D直接行动选项。
4. 不要替玩家行动，不要替玩家决定感受，不要一次性结束锚点。`;
};


/* ===== v1.7 seven-year database expansion for AI prompt ===== */
Object.assign(HP_EXPANDED_DB, {
  sevenYearFramework: {
    year1:'初识魔法世界：对角巷、分院、课程、巨怪、圣诞、魔法石。禁止恋爱与未来剧透。',
    year2:'秘密与怀疑：密室、日记本、金妮、洛哈特、蛇怪。开放卢娜、金妮、汤姆日记本条件线。',
    year3:'自由与真相：摄魂怪、卢平、小天狼星、霍格莫德、活点地图、尖叫棚屋。',
    year4:'成长与死亡：三强争霸、舞会、克鲁姆限定线、塞德里克命运、伏地魔复活。',
    year5:'反抗与选择：乌姆里奇、DA、O.W.L.、阵营、神秘事务司。',
    year6:'秘密与路线锁定：混血王子、德拉科任务、魂器、天文塔。',
    year7:'战争与结局：霍格沃茨被控制、留校/逃亡/家族线、最终大战、结局计算。'
  },
  endingsFull: {
    world:['原著胜利线','轻度偏移胜利线','新时代线','黑暗阵营线','崩坏世界线'],
    careers:['傲罗','治疗师','霍格沃茨教授','魔法部官员','魔法研究者','魁地奇职业选手','自由巫师'],
    relationship:'角色结局至少包含HE/NE/BE，判定读取好感、熟悉度、信任、关键标签、路线锁定、战争选择。'
  },
  schoolSimulation: '地点会影响角色出现权重：礼堂是社交中心，图书馆偏赫敏/西奥多/秋，魁地奇看台偏哈利/奥利弗/塞德里克/秋/德拉科，黑湖偏安静羁绊，休息室按学院加权。天气、季节、流言会改变叙事。',
  characterGrowth: '角色会按年份成长：一年级幼稚与试探，三四年级开始情感与真相，五年级阵营压力，六七年级战争与选择。德拉科有纯血继承人/迷茫者/改革者/共同堕落/逃离分支；哈利有原著/理智/依赖玩家/孤独分支；西奥多有学术/信任/黑暗/守护分支。'
});

const _contextPromptV17 = contextPrompt;
contextPrompt = function(type,step,label,charId){
  return _contextPromptV17(type,step,label,charId) + `\n【七年数据库】${JSON.stringify({sevenYearFramework:HP_EXPANDED_DB.sevenYearFramework,endingsFull:HP_EXPANDED_DB.endingsFull,schoolSimulation:HP_EXPANDED_DB.schoolSimulation,characterGrowth:HP_EXPANDED_DB.characterGrowth}).slice(0,5500)}\n请把这些数据库当作长期规则，不要一次性展示给玩家，只在当前时间允许的范围内调用。`;
};

/* ===== v1.9 mobile/API/persistence/gameplay fixes ===== */
const API_STATUS_KEY='hp_rpg_api_connection_status_v19';
function saveApiStatus(ok,msg=''){
  localStorage.setItem(API_STATUS_KEY, JSON.stringify({ok:!!ok,msg,ts:Date.now()}));
}
function getApiStatus(){try{return JSON.parse(localStorage.getItem(API_STATUS_KEY)||'{"ok":false}')}catch{return {ok:false}}}
function hasAnySaveSlot(){try{return (JSON.parse(localStorage.getItem(SAVE_KEY)||'[null,null,null,null]')).some(Boolean)}catch{return false}}

function isSummerBeforeSchool(){ return state?.grade===1 && state?.time?.year===1991 && state?.time?.month===8; }
function isSummerMonth(){ return [7,8].includes(state?.time?.month); }
function isSchoolOpen(){ return !(isSummerMonth() && !(state.time.year===1991 && state.time.month===9)); }
function blockFeature(msg){ toast(msg); }

// compress uploaded backgrounds before localStorage save; mobile browsers often fail with large base64 images
function resizeImageToDataURL(file, maxSide=1400, quality=.82){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error('read failed'));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error('image failed'));
      img.onload=()=>{
        let {width:w,height:h}=img;
        const scale=Math.min(1, maxSide/Math.max(w,h));
        w=Math.max(1,Math.round(w*scale)); h=Math.max(1,Math.round(h*scale));
        const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
        const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL('image/jpeg',quality));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const _saveSafe=save;
save=function(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
  catch(e){
    console.warn('save failed',e);
    try{
      const light=JSON.parse(JSON.stringify(state));
      // background can be too large; keep visual but do not break entire save
      if((light.customBg||'').length>1200000) light.customBg='';
      localStorage.setItem(STORAGE_KEY,JSON.stringify(light));
      toast('存档已保存，但底图过大，建议换一张小一点的图片。');
    }catch(err){toast('浏览器存储空间不足，保存失败。');}
  }
};

// keep API settings/status across tab switching; never clear automatically
const _callAI_v19 = callAI;
callAI = async function(messages,fallback){
  const s=getApiSettings();
  if(!s.key){
    showMagicError('魔法出错啦 请检查一下吧~');
    saveApiStatus(false,'未填写API密钥');
    return fallback;
  }
  const res = await _callAI_v19(messages,fallback);
  if(res===fallback){ saveApiStatus(false,'连接失败或网络错误'); }
  else { saveApiStatus(true,'连接成功'); }
  return res;
};
function showThinking(targetId){
  const el=targetId?$('#'+targetId):null;
  if(el){
    el.insertAdjacentHTML('beforeend','<div class="narrator-line story-thinking">对话正在勾勒中，请耐心等等~</div>');
    el.scrollTop=el.scrollHeight;
  } else toast('对话正在勾勒中，请耐心等等~');
}
function clearThinking(){ $$('.story-thinking').forEach(x=>x.remove()); }
function showMagicError(msg){ toast(msg||'魔法出错啦 请检查一下吧~'); }

// API buttons with durable status
const _testApiConnection_v19 = testApiConnection;
testApiConnection = async function(){
  const st=$('#apiStatus');
  if(st){st.className='status-text';st.textContent='正在测试连接……';}
  localStorage.setItem(API_KEY,JSON.stringify({provider:$('#apiProvider').value,key:$('#apiKey').value,base:$('#apiBase').value,model:$('#apiModel').value}));
  const txt=await _callAI_v19([{role:'system',content:'只回复 OK。'},{role:'user',content:'测试连接'}],null);
  if(txt){saveApiStatus(true,'连接成功'); if(st){st.className='status-text api-ok';st.textContent='连接成功：'+txt.slice(0,30);}}
  else{saveApiStatus(false,'连接失败'); if(st){st.className='status-text api-bad';st.textContent='连接失败：请检查密钥、模型或网络。';}}
};

// all known romanceable characters should show avatar/dialogue if they speak; speaking also marks them met.
function normalizeNameForChar(s){return (s||'').replace(/[·\s]/g,'').replace(/先生|小姐|教授|学长|学姐/g,'');}
function charIdFromSpeaker(name){
  const n=normalizeNameForChar(name);
  const aliases={哈利:'harry',波特:'harry',罗恩:'ron',赫敏:'hermione',德拉科:'draco',马尔福:'draco',布雷斯:'blaise',扎比尼:'blaise',西奥多:'theo',诺特:'theo',弗雷德:'fred',乔治:'george',珀西:'percy',塞德里克:'cedric',迪戈里:'cedric',奥利弗:'oliver',伍德:'oliver',秋:'cho',张秋:'cho',斯内普:'snape',西弗勒斯:'snape',卢娜:'luna',金妮:'ginny',汤姆:'tom',里德尔:'tom',小天狼星:'sirius',布莱克:'sirius',卢平:'lupin',莱姆斯:'lupin',克鲁姆:'krum',维克多尔:'krum'};
  if(aliases[n]) return aliases[n];
  return Object.keys(state?.relations||{}).find(k=>normalizeNameForChar(state.relations[k].name).includes(n)||n.includes(normalizeNameForChar(state.relations[k].name)));
}
const _oldParseStory_v19=parseStory;
parseStory=function(text,targetTextId,targetOptId,type){
 const narr=$('#'+targetTextId),opt=$('#'+targetOptId); if(!narr||!opt)return;
 const parts=splitStoryText(text||'');
 const options=parts.optionsText.split(/\n+/).map(x=>x.replace(/^[A-D][\.、]\s*/,'').trim()).filter(Boolean).slice(0,4);
 narr.innerHTML='';
 parts.scene.split(/\n+/).filter(Boolean).forEach(line=>{
   let clean=line.replace(/^【旁白】/,'').trim(); if(!clean)return;
   // no label "玩家行动"; player choices are shown as plain player bubbles
   if(clean.startsWith('玩家行动：')||clean.startsWith('你选择：')){
     const v=clean.replace(/^玩家行动：|^你选择：/,'').trim();
     narr.insertAdjacentHTML('beforeend',`<div class="player-action-line">${escapeHtml(v)}</div>`); return;
   }
   const match=clean.match(/^([^：:]{1,14})[：:](.+)$/);
   if(match){
     const name=match[1].trim(),body=match[2].trim();
     const id=charIdFromSpeaker(name);
     if(id&&state.relations[id]){meet(id);narr.insertAdjacentHTML('beforeend',`<div class="dialog-line">${charAvatar(id)}<div class="speech-bubble"><b>${state.relations[id].name}</b>${escapeHtml(body)}</div></div>`);}
     else narr.insertAdjacentHTML('beforeend',`<div class="narrator-line">${escapeHtml(clean)}</div>`);
   } else narr.insertAdjacentHTML('beforeend',`<div class="narrator-line">${escapeHtml(clean)}</div>`);
 });
 if(options.length){opt.innerHTML=`<div class="story-options">${options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${escapeHtml(o)}">${String.fromCharCode(65+i)}. ${escapeHtml(o)}</button>`).join('')}</div>`;}
 else opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
 narr.scrollTop=narr.scrollHeight; save();
};
function escapeHtml(s){return String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}

// compile thread uses unlabeled player bubbles, not "玩家行动"
compileThread=function(th){return (th.blocks||[]).map(b=>`${b.player?`【旁白】你：${b.player}\n`:''}${b.ai||''}`).join('\n');};

// continue game opens load dialog; if no slots, show clear提示
function openLoadOrWarn(){
  if(hasAnySaveSlot()) openSaveLoad(false);
  else alert('暂时没有存档。');
}

// summer / before-school restrictions
const _renderNightSetup_v19=renderNightSetup;
renderNightSetup=function(){
  const p=$('#nightPartnerList'),l=$('#nightLocationList'); if(!p||!l)return;
  if(isSummerMonth()){
    p.innerHTML='<p class="hint small">还没开学呢，暑假不能夜游。</p>'; l.innerHTML='<button class="choice selected">夜游暂未开启</button>'; return;
  }
  _renderNightSetup_v19();
};
const _startNight_v19=startNight;
startNight=function(){ if(isSummerMonth()){blockFeature('还没开学呢，暑假不能夜游。');return;} _startNight_v19(); };

const _renderBondInvite_v19=renderBondInvite;
renderBondInvite=function(){
  const sel=$('#bondInviteSelect'); if(!sel)return;
  if(isSummerBeforeSchool()){ sel.innerHTML='<option value="">还没开学呢</option>'; return; }
  const arr=Object.values(state.relations).filter(r=>r.visible&&r.met);
  sel.innerHTML=arr.map(r=>`<option value="${r.id}">${r.name}${isSummerMonth()?' · 暑假邀约':''}</option>`).join('')||'<option value="">暂无可邀请角色</option>';
};
const _startBondEvent_v19=startBondEvent;
startBondEvent=async function(){
  if(isSummerBeforeSchool()){toast('还没开学呢，1991年8月暂时不能开启羁绊事件。');return;}
  return _startBondEvent_v19();
};

// summer daily pools
const SUMMER_EVENTS=[
 {id:'summer_preview',name:'预习课程',course:'history',courseGain:1,stress:1,summer:true},
 {id:'summer_pack',name:'整理行李',stress:0,summer:true},
 {id:'summer_rest',name:'暑假休息',stress:-8,health:5,summer:true},
 {id:'summer_play',name:'出门散心',stress:-4,summer:true},
 {id:'summer_letter',name:'写信练习',stress:0,summer:true},
 {id:'free',name:'自由行动',stress:0,free:true,summer:true}
];
function activeDailyEvents(){return isSummerMonth()?SUMMER_EVENTS:DAILY_EVENTS;}
renderDaily=function(){
  const pool=$('#dailyEventPool'),slots=$('#dailySlots'); if(!pool||!slots)return;
  const events=activeDailyEvents();
  pool.innerHTML=events.map(e=>`<button data-daily-id="${e.id}">${e.name}</button>`).join('');
  slots.innerHTML=Array.from({length:7},(_,i)=>`<div class="daily-slot"><span>${i+1}. ${dailyPlan[i]?.name||'空白'}</span><button data-clear-slot="${i}">清除</button></div>`).join('');
};
function dailyEventById(id){return activeDailyEvents().find(x=>x.id===id)||DAILY_EVENTS.find(x=>x.id===id)||SUMMER_EVENTS.find(x=>x.id===id);}

const _dailyText_v19=dailyText;
dailyText=function(ev){
  const imp=state.importantCharacters.map(id=>state.relations[id]?.name).filter(Boolean)[0];
  if(ev.summer){
    if(ev.id==='summer_preview')return `暑假的下午比霍格沃茨安静得多。你翻开课本，试图提前理解那些陌生的魔法词汇。${imp?`某个瞬间，你想起了${imp}可能也在准备开学。`:''}`;
    if(ev.id==='summer_pack')return '你把长袍、课本和小瓶子重新放进行李箱。每一样东西都像在提醒你：另一个世界正在等你。';
    if(ev.id==='summer_rest')return '你终于没有逼自己继续看书，而是好好睡了一觉。窗外的光慢慢移过墙面，暑假显得短暂又真实。';
    if(ev.id==='summer_play')return '你出门散了散心。麻瓜世界仍然照常运转，但你已经知道，砖墙之后还有另一条街。';
    if(ev.id==='summer_letter')return '你拿出信纸练习写信，想着以后猫头鹰会不会真的把你的话带到某个人手里。';
  }
  return _dailyText_v19(ev);
};

// ensure event selection uses active pool
// old document handler uses DAILY_EVENTS.find; patch at capturing phase for daily event buttons
// prevent duplicate old handler by manually filling and stopping propagation
// But only if click is on daily button.
document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-daily-id]');
  if(btn){
    e.stopImmediatePropagation();
    if(dailyPlan.length<7) dailyPlan.push(dailyEventById(btn.dataset.dailyId));
    renderDaily();
  }
},true);

// Run daily with summer events and continuous feed. Free action can call AI and then resume.
runDaily=function(){
 const box=$('#dailyRunBox'),board=$('#dailyBoard'); board.classList.add('hidden'); box.classList.remove('hidden');
 box.innerHTML='<h3>本月养成日常</h3><div id="dailyResultList"></div>'; const list=$('#dailyResultList'); let i=0;
 const next=()=>{
   if(i>=7){
     list.insertAdjacentHTML('beforeend','<div class="daily-result-card"><h4>本月养成事件已结束</h4><p>本月也很充实呢，亲爱的小巫师！</p><button class="btn primary full" id="dailyBackHome">返回主页</button></div>');
     $('#dailyBackHome').onclick=()=>{advanceMonth();dailyPlan=[];board.classList.remove('hidden');box.classList.add('hidden');go('screen-game-home');}; return;
   }
   const ev=dailyPlan[i]||activeDailyEvents().find(e=>e.id.includes('rest'))||activeDailyEvents()[0]; i++;
   if(ev.free){
    list.insertAdjacentHTML('beforeend',`<div class="free-action-box"><h4>事件 ${i}/7：自由行动</h4><p>${dailyText(ev)}</p><div id="dailyFreeNarrative_${i}" class="story-narrative mini-free"></div><input id="dailyFreeInput_${i}" class="story-input" placeholder="你想自由做些什么？"><button class="action-jelly" id="dailyFreeBtn_${i}">行动</button></div>`);
    const nId=`dailyFreeNarrative_${i}`;
    $(`#dailyFreeBtn_${i}`).onclick=async()=>{
      const v=$(`#dailyFreeInput_${i}`).value.trim()||'随意探索';
      showThinking(nId);
      const fallback=`【旁白】你选择${v}。这段自由时间没有立刻把你推向任何重大事件，却让你更像真正生活在这个世界里：细节、声音和未完成的念头都悄悄留下。`;
      const resp=await callAI([{role:'system',content:contextPrompt('daily_free','free_action','自由行动')},{role:'user',content:`玩家自由行动：${v}\n请回应玩家，生成短小自由事件，不要跳主线。`}],fallback);
      clearThinking(); parseStory(resp,nId,'dummyFreeOptions','dailyfree');
      addMemory('free_action'); if(Math.random()<.25){addMemory('found_possible_dungeon');toast('你似乎发现了一个副本入口的线索');}
      next();
    }; return;
   }
   applyDaily(ev); const gains=[]; if(ev.course)gains.push(`${courseLabel(ev.course)} +${ev.courseGain||1}`); if(ev.stress)gains.push(`压力 ${ev.stress>0?'+':''}${ev.stress}`); if(ev.health)gains.push(`健康 ${ev.health>0?'+':''}${ev.health}`);
   list.insertAdjacentHTML('beforeend',`<div class="daily-result-card"><h4>事件 ${i}/7：${ev.name}</h4><p>${dailyText(ev)}</p><p class="daily-gains">${gains.join(' · ')||'无数值变化'}</p></div>`);
   save();renderGame();setTimeout(next,180);
 };
 next();
};

// use thinking state and clear old options after player chooses
resolveMainChoice=async function(idx, customText){
 const info=currentMainStep(); if(!info)return; const {step,label}=info; if(!step){go('screen-game-home');return;}
 const action=customText || mainlineOptions(step)[idx] || '继续观察';
 const tid=threadIdFor('main',step); const th=ensureThread(tid,fallbackStory(step)); th.turns=(th.turns||0)+1;
 $('#mainlineOptions').innerHTML=''; th.blocks.push({player:action,ai:''}); renderThreadToUI(th,'mainlineText','mainlineOptions','main'); showThinking('mainlineText');
 const history=compileThread(th).slice(-6500);
 const fallback=`【旁白】你选择${action}。这个决定没有马上把你推到下一个地方，而是让眼前的人和事先回应你。魔法世界像一张刚被写下第一行的羊皮纸，正在等待你的下一笔。\n【选项】\nA. 继续追问细节\nB. 观察身边的人\nC. 去下一个地方再看看吧`;
 const ai=await callAI([{role:'system',content:contextPrompt('main',step,label)},{role:'user',content:`当前连续剧情：\n${history}\n\n玩家刚刚选择/输入：${action}\n必须先回应玩家行为。除非玩家选择“去某地/结束”，否则不得切换场景。输出旁白和角色台词，最后给2-4个选项。`}],fallback);
 clearThinking(); th.blocks[th.blocks.length-1].ai=ai;
 if(th.turns>=minTurnsForStep(step) && /(去|前往|离开|结束|下一|继续当前月份的下一段|准备返程|回到|进入|先去)/.test(action)){
   completeStep(step); applyMainStepEffects(step,idx,action); addMemory(`completed_${step}`);
   th.blocks.push({ai:'【旁白】—— 金色的墨迹在页面中间划开一道细线，这段经历被记录下来。\n【选项】\nA. 继续当前月份的下一段主线'});
 }
 save(); renderGame(); renderThreadToUI(th,'mainlineText','mainlineOptions','main');
};
handleBondAction=async function(id,action){
 const r=state.relations[id]; if(!r)return; const tid=threadIdFor('bond',id); const th=ensureThread(tid,''); th.turns=(th.turns||0)+1;
 $('#bondOptions').innerHTML=''; th.blocks.push({player:action,ai:''}); renderThreadToUI(th,'bondNarrative','bondOptions','bond'); showThinking('bondNarrative');
 const fallback=`【旁白】你选择${action}。${r.name}没有立刻把这段相处变成什么夸张的承诺，只是顺着你的话继续往前走。\n${r.name}：嗯，我听着。\n【选项】\nA. 继续聊下去\nB. 换个轻松的话题\nC. 时间差不多了`;
 const ai=await callAI([{role:'system',content:contextPrompt('bond','bond_event','羁绊事件',id)},{role:'user',content:`历史：${compileThread(th).slice(-5500)}\n玩家行动：${action}\n回应玩家。本事件是一年级朋友关系；不加好感；不要立刻结束，除非玩家选择离开。`}],fallback);
 clearThinking(); th.blocks[th.blocks.length-1].ai=ai;
 if(th.turns>=4||/时间差不多|结束|离开|回去|太晚/.test(action)) th.blocks.push({ai:`【旁白】—— 金色分割线轻轻划过。${r.name}似乎还有自己的事，这段相处暂时结束。\n【选项】\nA. 返回主页`});
 save();renderThreadToUI(th,'bondNarrative','bondOptions','bond');
};

// Night action thinking + old options disappear
startNight=function(){
 if(isSummerMonth()){blockFeature('还没开学呢，暑假不能夜游。');return;}
 if(state.monthly.nightUsed){toast('本月已经夜游过一次。');return;} const loc=$('#nightLocationList .selected')?.dataset.nightLocation||NIGHT_LOCATIONS[0]; state.monthly.nightUsed=true;
 $('#nightSetup').classList.add('hidden'); const box=$('#nightExploreBox'); box.classList.remove('hidden'); box.className='story-shell'; box.innerHTML='<div id="nightNarrative" class="story-narrative"></div><div id="nightOptions" class="story-choice-zone"></div><div class="story-input-zone"><input id="nightFreeInput" class="story-input" placeholder="你还会怎么做呢？"><button id="nightActionBtn" class="action-jelly">行动</button></div>';
 const tid=threadIdFor('night',loc); const th=ensureThread(tid,`【旁白】夜色压在${loc}附近，城堡白天的热闹被门缝后的风声取代。你知道今晚费尔奇可能在某些地方巡逻得更勤。\n【选项】\nA. 先观察周围\nB. 放轻脚步继续前进\nC. 如果太危险就撤退`); th.turns=th.turns||0; renderThreadToUI(th,'nightNarrative','nightOptions','night');
 const act=async(v)=>{th.turns++; $('#nightOptions').innerHTML=''; th.blocks.push({player:v,ai:''});renderThreadToUI(th,'nightNarrative','nightOptions','night');showThinking('nightNarrative'); const caught=loc===nightDanger&&Math.random()<.25; if(caught){addStress(30);state.housePoints-=10;} else addStress(3);
   const fallback=caught?`【旁白】你刚做出选择，洛丽丝夫人的眼睛就在黑暗里亮起。费尔奇的脚步声随即逼近，你不得不立刻压低呼吸。\n【选项】\nA. 赶紧藏起来\nB. 低声念一个转移注意的咒语\nC. 现在似乎太晚了，先回去`:`【旁白】你选择${v}。夜色没有马上吞掉你的声音，反而把每一点细节都放大了：石墙、脚步、远处摇晃的火光。\n【选项】\nA. 调查墙边痕迹\nB. 继续向前\nC. 现在似乎太晚了，先回去`;
   const ai=await callAI([{role:'system',content:contextPrompt('night','night_explore',loc)},{role:'user',content:`夜游地点：${loc}\n历史：${compileThread(th).slice(-5000)}\n玩家行动：${v}\n请按探索节点回应，不要删除旧对话。`}],fallback);
   clearThinking(); th.blocks[th.blocks.length-1].ai=ai; if(th.turns>=4||/回去|撤退|结束|太晚/.test(v)) th.blocks.push({ai:'【旁白】—— 金色分割线划过羊皮纸，今晚的夜游暂时结束。\n【选项】\nA. 返回主页'}); save();renderThreadToUI(th,'nightNarrative','nightOptions','night');};
 $('#nightActionBtn').onclick=()=>{const v=$('#nightFreeInput').value.trim(); if(v)act(v); $('#nightFreeInput').value='';};
};

// override continue + file upload handlers after old bindEvents attaches too
setTimeout(()=>{
 const c=$('#continueBtn'); if(c){c.onclick=(e)=>{e.preventDefault();e.stopImmediatePropagation();openLoadOrWarn();};}
 const bg=$('#bgUpload'); if(bg){bg.onchange=async(e)=>{const f=e.target.files[0]; if(!f)return; try{toast('正在整理底图，请稍等。'); const data=await resizeImageToDataURL(f); state.customBg=data; applySavedAppearance(); save(); toast('底图已更换。');}catch(err){console.warn(err);toast('底图更换失败，请换一张更小的图片。');}};}
 const status=getApiStatus(); const apiStatus=$('#apiStatus'); if(apiStatus&&status.msg){apiStatus.className='status-text '+(status.ok?'api-ok':'api-bad'); apiStatus.textContent=status.ok?'已连接：'+status.msg:'未连接：'+status.msg;}
},200);

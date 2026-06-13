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

/* ===== v1.10 new character isolation patch =====
   Rule: starting a new character always creates a clean new game state.
   Old story/bond/night/daily conversations are not carried forward unless
   the player explicitly saved them to a save slot and later loads that slot.
*/
function resetCreationFormForNewGame(){
  const setVal=(sel,val='')=>{const el=$(sel); if(el)el.value=val;};
  setVal('#playerName','');
  setVal('#playerNickname','');
  setVal('#appearance','');
  setVal('#personalityDesc','');
  setVal('#parentsCustom','');
  setVal('#familyMoodCustom','');
  setVal('#originalSiblingName','');
  setVal('#originalSiblingPersonality','');
  const avatar=$('#avatarPreview'), ph=$('#avatarPlaceholder');
  if(avatar){avatar.removeAttribute('src'); avatar.style.display='none';}
  if(ph) ph.style.display='block';
  $$('.choice.selected').forEach(x=>x.classList.remove('selected'));
  const firstInGroups=['parents','familyMood','bloodStatus','siblingType','originalRelation','originalWizard','originalHouse','canonBond'];
  firstInGroups.forEach(g=>{const el=$(`[data-choice="${g}"] .choice`); if(el)el.classList.add('selected');});
  const cr=$('[data-choice="canonRelation"] .choice'); if(cr)cr.classList.add('selected');
  const cc=$('#canonSiblingCharacter'); if(cc){cc.selectedIndex=0; updateCanonRelationChoices();}
  handleChoiceVisibility();
  lockedAttr=null; baseAttrs=randomBaseAttrs(); addedPoints=Object.fromEntries(ATTRS.map(([id])=>[id,0])); freePoints=8; renderAttrList();
}
function startBrandNewGame(){
  const prevTheme=state?.theme||'pink';
  const prevBg=state?.customBg||'';
  const prevOpacity=state?.bgOpacity??40;
  state=freshState();
  state.theme=prevTheme;
  state.customBg=prevBg;
  state.bgOpacity=prevOpacity;
  dailyPlan=[];
  nightDanger='';
  resetCreationFormForNewGame();
  applySavedAppearance();
  save();
  go('screen-basic');
  toast('新的录取信已经展开，这是一个全新的故事。');
}
setTimeout(()=>{
  const startBtn=$('#screen-home [data-go="screen-basic"]');
  if(startBtn){
    startBtn.onclick=(e)=>{e.preventDefault();e.stopImmediatePropagation();startBrandNewGame();};
  }
},350);

/* ===== v1.11 romance avatar + family letter + title patch ===== */
const ROMANCE_ROLE_IDS = ['harry','ron','draco','blaise','theo','fred','george','percy','cedric','oliver','snape','hermione','cho','luna','ginny','tom','sirius','lupin','krum'];
const ROLE_ALIASES = {
  '哈利':'harry','哈利·波特':'harry','波特':'harry',
  '罗恩':'ron','罗恩·韦斯莱':'ron',
  '赫敏':'hermione','赫敏·格兰杰':'hermione',
  '德拉科':'draco','德拉科·马尔福':'draco','马尔福':'draco',
  '布雷斯':'blaise','布雷斯·扎比尼':'blaise',
  '西奥多':'theo','西奥多·诺特':'theo','诺特':'theo',
  '弗雷德':'fred','弗雷德·韦斯莱':'fred',
  '乔治':'george','乔治·韦斯莱':'george',
  '珀西':'percy','珀西·韦斯莱':'percy',
  '塞德里克':'cedric','塞德里克·迪戈里':'cedric',
  '奥利弗':'oliver','奥利弗·伍德':'oliver','伍德':'oliver',
  '西弗勒斯':'snape','斯内普':'snape','西弗勒斯·斯内普':'snape',
  '秋':'cho','秋·张':'cho',
  '卢娜':'luna','卢娜·洛夫古德':'luna',
  '金妮':'ginny','金妮·韦斯莱':'ginny',
  '汤姆':'tom','汤姆·里德尔':'tom','里德尔':'tom',
  '小天狼星':'sirius','小天狼星·布莱克':'sirius',
  '卢平':'lupin','莱姆斯':'lupin','莱姆斯·卢平':'lupin',
  '克鲁姆':'krum','维克多尔':'krum','维克多尔·克鲁姆':'krum'
};
function roleIdFromSpeakerName(name){
  const n=String(name||'').replace(/[\s「」“”]/g,'').trim();
  if(!n)return '';
  if(ROLE_ALIASES[n])return ROLE_ALIASES[n];
  return Object.keys(state?.relations||{}).find(k=>{
    const full=state.relations[k]?.name||'';
    return full===n || full.startsWith(n) || n.startsWith(full.split('·')[0]);
  })||'';
}
function markRoleMentioned(line){
  if(!state?.relations)return;
  Object.entries(ROLE_ALIASES).forEach(([alias,id])=>{
    if(line.includes(alias) && state.relations[id]) meet(id);
  });
}
function syncRelationSurfaces(){
  try{ renderBonds(); renderBondInvite(); renderNightSetup(); renderCharacterAvatarSettings(); }catch(e){console.warn('syncRelationSurfaces',e);}
}
const _meet_v111 = meet;
meet=function(id){
  const before=!!state?.relations?.[id]?.met;
  _meet_v111(id);
  if(state?.relations?.[id]) state.relations[id].visible=true;
  if(!before) setTimeout(syncRelationSurfaces,0);
};

parseStory=function(text,targetTextId,targetOptId,type){
 const narr=$('#'+targetTextId),opt=$('#'+targetOptId); if(!narr||!opt)return;
 const parts=splitStoryText(text||'');
 const options=parts.optionsText.split(/\n+/).map(x=>x.replace(/^[A-D][\.、]\s*/,'').trim()).filter(Boolean).slice(0,4);
 narr.innerHTML='';
 parts.scene.split(/\n+/).filter(Boolean).forEach(line=>{
   let clean=line.replace(/^【旁白】/,'').trim();
   if(!clean)return;
   markRoleMentioned(clean);
   if(clean.startsWith('你：')){narr.insertAdjacentHTML('beforeend',`<div class="player-action-line">${escapeHtml(clean.replace(/^你：/,''))}</div>`);return;}
   const match=clean.match(/^([^：:]{1,16})[：:](.+)$/);
   if(match){
     const name=match[1].trim(), body=match[2].trim();
     if(/韦斯莱双子|双子/.test(name)){
       meet('fred'); meet('george');
       narr.insertAdjacentHTML('beforeend',`<div class="dialog-line twins-line">${charAvatar('fred')}${charAvatar('george')}<div class="speech-bubble"><b>弗雷德与乔治</b>${escapeHtml(body)}</div></div>`);
       return;
     }
     const id=roleIdFromSpeakerName(name);
     if(id&&state.relations[id]){meet(id);narr.insertAdjacentHTML('beforeend',`<div class="dialog-line">${charAvatar(id)}<div class="speech-bubble"><b>${state.relations[id].name}</b>${escapeHtml(body)}</div></div>`);}
     else narr.insertAdjacentHTML('beforeend',`<div class="narrator-line">${escapeHtml(clean)}</div>`);
   } else narr.insertAdjacentHTML('beforeend',`<div class="narrator-line">${escapeHtml(clean)}</div>`);
 });
 if(options.length){opt.innerHTML=`<div class="story-options">${options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${escapeHtml(o)}">${String.fromCharCode(65+i)}. ${escapeHtml(o)}</button>`).join('')}</div>`;}
 else opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
 narr.scrollTop=narr.scrollHeight; save(); syncRelationSurfaces();
};

const FAMILY_LETTER_DB = {
  noSummer:true,
  examples:{
    warmMuggleSep:'我们都很想你，不知道你在那个陌生的世界是不是一切都好？如果有些事我们听不懂，也请你慢慢写给我们。',
    strictPureOct:'我希望你确实有在学校学到东西，不要让自己的姓氏在教授面前失去体面。'
  },
  mood:{
    '温暖':'语气温柔、想念、关心玩家适应情况。',
    '严格':'语气克制、要求成绩和体面，但可以有隐藏关心。',
    '冷淡':'简短、疏离、像通知。',
    '复杂':'关心与压力并存。',
    '压抑':'控制欲较强，强调不要惹麻烦。',
    '富裕但疏离':'物质关怀多，情感表达少。',
    '普通但安全':'朴素、日常、稳定。'
  },
  blood:{
    '麻瓜出身':'家人对魔法世界陌生，会担心和好奇。',
    '混血巫师':'理解两个世界的差异。',
    '普通纯血':'熟悉魔法世界，关心学院和课程。',
    '古老纯血家族':'强调家族名声、礼仪和体面。',
    '身世不明':'可带谜团或监护人语气。'
  }
};
function familyLetterFallback(){
  const m=state.time.month, mood=state.player.familyMood||'温暖', blood=state.player.bloodStatus||'麻瓜出身', name=state.player.nickname||state.player.name;
  const open=`致${name}：`;
  const monthLine={9:'这是你离家后的第一个月。',10:'十月的天气应该已经冷下来了。',11:'听说学校最近并不完全平静。',12:'圣诞节快到了，家里也开始准备过节。',1:'新的一年开始了。',2:'冬天还没有完全过去。',3:'春天快来了。',4:'考试似乎越来越近了。',5:'期末已经不远了。',6:'这一学年终于要结束了。'}[m]||'这个月家里一切照旧。';
  let body='';
  if(/麻瓜/.test(blood)&&/温暖|普通/.test(mood)) body=`${monthLine}我们都很想你，不知道你在那个陌生的世界是不是一切都好。我们也许听不懂猫头鹰、魔杖和课程的细节，但只要是你写来的话，我们都会认真读。`;
  else if(/纯血/.test(blood)&&/严格|压抑|富裕/.test(mood)) body=`${monthLine}我希望你在学校确实有学到东西，也记得自己的言行会被别人看在眼里。不要让家族的名字因为一时轻率而蒙羞。`;
  else if(/冷淡/.test(mood)) body=`${monthLine}家里无事。若缺少钱或物品，写信说明。课程方面，希望你至少保持体面。`;
  else if(/复杂|压抑/.test(mood)) body=`${monthLine}我们当然希望你一切顺利，但你也该明白，霍格沃茨不是让人胡闹的地方。照顾好自己，也别惹出让家里为难的麻烦。`;
  else body=`${monthLine}家里还算平静。我们想知道你在学校过得怎么样，是否认识了新朋友，课程是否困难。无论如何，请记得照顾自己。`;
  return `${open}\n\n${body}\n\n家里`;
}
maybeFamilyLetter=function(){
  if([7,8].includes(state.time.month)) return;
  if(/孤儿|父母双亡|无人|无监护人/.test(state.player.parents||''))return;
  const flag=`family_letter_${state.time.year}_${state.time.month}`; if(state.eventFlags[flag])return; state.eventFlags[flag]=true;
  const id=uid();
  const fallback=familyLetterFallback();
  state.letters.push({id,sender:'family',senderName:'家里',title:`家里在${state.time.year}年${state.time.month}月寄出`,time:{...state.time},read:false,pinned:false,content:fallback,replies:[],family:true});
  toast('猫头鹰为你送来了家里的信。'); save(); renderLetters();
  if(getApiSettings().key){
    callAI([{role:'system',content:`你负责为《HP乙游模拟器》生成家书。7月8月不生成；当前已允许生成。请写一封180-260字的中文家书，不要写剧情旁白。称呼玩家：${state.player.nickname||state.player.name}。家庭氛围：${state.player.familyMood}。父母情况：${state.player.parents}。血统：${state.player.bloodStatus}。月份：${state.time.year}年${state.time.month}月。规则数据库：${JSON.stringify(FAMILY_LETTER_DB)}`},{role:'user',content:'请根据玩家家庭设定生成本月家书，语气每个月不同。'}],fallback).then(txt=>{const l=state.letters.find(x=>x.id===id); if(l&&txt){l.content=txt; save(); renderLetters();}});
  }
};
advanceMonth=function(){
  state.time.month++; if(state.time.month>12){state.time.month=1;state.time.year++;}
  Object.values(state.relations).forEach(r=>{r.monthlyGain=0;r.trend='🟰'});
  state.monthly={bondUsed:false,nightUsed:false,activeLetterUsed:false};
  maybeFamilyLetter(); save(); renderGame();
};

const _contextPrompt_v111=contextPrompt;
contextPrompt=function(type,step,label,charId){
  return _contextPrompt_v111(type,step,label,charId)
    .replace('《HPWorld》','《HP乙游模拟器》')
    + `\n【家书数据库】${JSON.stringify(FAMILY_LETTER_DB).slice(0,2200)}\n【可攻略角色头像规则】凡是可攻略角色发言，必须输出“角色名：台词”，系统会以头像+对话框显示；普通NPC放在旁白里。`;
};

setTimeout(()=>{
  document.title='HP乙游模拟器';
  const h1=$('#screen-home h1'); if(h1)h1.innerHTML='HP乙游<br>模拟器';
  syncRelationSurfaces();
},500);

/* ===== v1.12 start button hard fix =====
   Capture-phase listener prevents the generic data-go handler from swallowing
   the Start/New Game entry on GitHub Pages/mobile browsers. */
(function(){
  function safeStartNewGame(ev){
    const btn = ev.target && ev.target.closest ? ev.target.closest('#screen-home [data-go="screen-basic"]') : null;
    if(!btn) return;
    ev.preventDefault();
    ev.stopPropagation();
    if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
    try{
      if(typeof startBrandNewGame === 'function'){
        startBrandNewGame();
      }else{
        state = typeof freshState === 'function' ? freshState() : state;
        if(typeof initCreation === 'function') initCreation();
        if(typeof go === 'function') go('screen-basic');
      }
    }catch(err){
      console.error('Start new game failed:', err);
      alert('魔法出错啦 请检查一下吧~\n入口已尝试修复，请刷新页面后再试。');
    }
  }
  document.addEventListener('click', safeStartNewGame, true);
  document.addEventListener('touchend', function(ev){
    const btn = ev.target && ev.target.closest ? ev.target.closest('#screen-home [data-go="screen-basic"]') : null;
    if(!btn) return;
    // Let click handler run on most browsers; this is only a mobile fallback.
    setTimeout(()=>{
      const basic = document.querySelector('#screen-basic');
      if(basic && !basic.classList.contains('active')){
        try{ if(typeof startBrandNewGame === 'function') startBrandNewGame(); }catch(e){ console.error(e); }
      }
    },80);
  }, {passive:true});
})();

/* ===== v1.13 start crash fix: canon sibling relation selector ===== */
(function(){
  const canonRelationRules = {
    harry:['哥哥','弟弟'],
    draco:['哥哥','弟弟'],
    ron:['哥哥','弟弟'],
    hermione:['姐姐','妹妹'],
    neville:['哥哥','弟弟'],
    luna:['妹妹','姐姐'],
    cedric:['哥哥'],
    theo:['哥哥','弟弟'],
    blaise:['哥哥','弟弟'],
    oliver:['哥哥'],
    fred:['哥哥'],
    george:['哥哥'],
    percy:['哥哥'],
    ginny:['妹妹'],
    cho:['姐姐'],
    snape:['哥哥']
  };
  window.updateCanonRelationChoices = function(){
    const select = document.querySelector('#canonSiblingCharacter');
    const box = document.querySelector('[data-choice="canonRelation"]');
    if(!select || !box) return;
    const id = select.value || select.selectedOptions?.[0]?.dataset?.id || 'harry';
    const allowed = canonRelationRules[id] || ['哥哥','姐姐','弟弟','妹妹'];
    box.innerHTML = allowed.map((rel,i)=>`<button class="choice ${i===0?'selected':''}" data-value="${rel}">${rel}</button>`).join('');
  };
  setTimeout(()=>{
    const select=document.querySelector('#canonSiblingCharacter');
    if(select){
      select.addEventListener('change', window.updateCanonRelationChoices);
      window.updateCanonRelationChoices();
    }
  },100);
})();

/* ===== v1.14 school calendar + exact player letters patch ===== */
(function(){
  // Calendar helpers: July/August are summer. The very first month is 1991/8, before school.
  window.isSummerMonth = function(){ return state && [7,8].includes(Number(state.time?.month)); };
  window.isFirstPreSchoolMonth = function(){ return state && Number(state.time?.year)===1991 && Number(state.time?.month)===8; };
  window.isSchoolTerm = function(){ return state && !window.isSummerMonth(); };

  function featureClosedMessage(feature){
    if(window.isFirstPreSchoolMonth()) return `还没开学呢，1991年8月你还在对角巷准备入学，暂时不能开启${feature}。`;
    if(window.isSummerMonth()) return `现在是暑假，${feature==='夜游冒险'?'霍格沃茨夜游暂不开放。':'羁绊事件会以暑假邀约的形式开启。'}`;
    return '';
  }

  // Keep Aug 1991 as Diagon Alley mainline start.
  const _finishBtnPatch = ()=>{
    const btn=document.querySelector('#finishBtn');
    if(btn && !btn.dataset.v114){
      btn.dataset.v114='1';
      btn.addEventListener('click',()=>{
        if(state){ state.time={year:1991,month:8}; state.grade=1; save(); }
      }, true);
    }
  };
  setTimeout(_finishBtnPatch,100);

  // Bond events: closed only in the very first pre-school month. Later summers are playable as summer outings.
  const _renderBondInvite_v114 = window.renderBondInvite;
  window.renderBondInvite = function(){
    const sel=document.querySelector('#bondInviteSelect');
    const box=document.querySelector('#bondInviteBox');
    const eventBox=document.querySelector('#bondEventBox');
    if(!sel) return;
    if(window.isFirstPreSchoolMonth()){
      sel.innerHTML='<option value="">还没开学呢</option>';
      if(box) box.querySelector('p') && (box.querySelector('p').textContent='1991年8月还在对角巷准备入学，羁绊事件从9月正式开学后开始。');
      if(eventBox){ eventBox.classList.add('hidden'); }
      return;
    }
    if(typeof _renderBondInvite_v114==='function') _renderBondInvite_v114();
    if(window.isSummerMonth() && sel.innerHTML && !/暑假邀约/.test(sel.innerHTML)){
      Array.from(sel.options).forEach(o=>{ if(o.value) o.textContent=o.textContent+' · 暑假邀约'; });
      if(box) box.querySelector('p') && (box.querySelector('p').textContent='暑假羁绊事件会根据你的身份与对方身份，生成一次外出玩耍或通信邀约。');
    }
  };

  const _startBondEvent_v114 = window.startBondEvent;
  window.startBondEvent = function(){
    if(window.isFirstPreSchoolMonth()){
      toast('还没开学呢，1991年8月暂时不能开启羁绊事件。');
      return;
    }
    return _startBondEvent_v114.apply(this,arguments);
  };

  // Night events: closed for all July/August.
  const _renderNightSetup_v114 = window.renderNightSetup;
  window.renderNightSetup = function(){
    const p=document.querySelector('#nightPartnerList'), l=document.querySelector('#nightLocationList'), box=document.querySelector('#nightExploreBox');
    if(window.isSummerMonth()){
      if(p) p.innerHTML='<p class="hint small">还没开学呢，暑假不能夜游。</p>';
      if(l) l.innerHTML='<div class="empty-card"><p>霍格沃茨的夜晚还离你很远。等正式开学后，再考虑在宵禁后探索城堡吧。</p></div>';
      if(box) box.classList.add('hidden');
      return;
    }
    if(typeof _renderNightSetup_v114==='function') return _renderNightSetup_v114.apply(this,arguments);
  };
  const _startNight_v114 = window.startNight;
  window.startNight = function(){
    if(window.isSummerMonth()){
      toast('还没开学呢，暑假不能夜游。');
      return;
    }
    return _startNight_v114.apply(this,arguments);
  };

  // Summer daily pool: no classes/library in July/August. Use pre-school/summer activities only.
  const SUMMER_STUDY_EVENTS_V114 = [
    {id:'summer_read_magic',name:'阅读魔法书籍',course:'history',courseGain:0.4,stress:1,summer:true},
    {id:'summer_self_charms',name:'自学基础魔咒',course:'charms',courseGain:0.4,stress:1,summer:true},
    {id:'summer_wand_notes',name:'整理魔杖笔记',course:'charms',courseGain:0.3,stress:0,summer:true},
    {id:'summer_pack',name:'整理入学行李',stress:0,summer:true},
    {id:'summer_rest',name:'暑假休息',stress:-8,health:5,summer:true},
    {id:'summer_walk',name:'出门散心',stress:-4,summer:true},
    {id:'free',name:'自由行动',stress:0,free:true,summer:true}
  ];
  window.activeDailyEvents = function(){ return window.isSummerMonth()?SUMMER_STUDY_EVENTS_V114:DAILY_EVENTS; };

  window.renderDaily = function(){
    const pool=document.querySelector('#dailyEventPool'),slots=document.querySelector('#dailySlots'); if(!pool||!slots)return;
    const events=window.activeDailyEvents();
    const title=document.querySelector('#screen-daily .page-header h2'); if(title) title.textContent=window.isSummerMonth()?'暑假养成日常':'养成日常';
    pool.innerHTML=events.map(e=>`<button data-daily-id="${e.id}">${e.name}</button>`).join('');
    slots.innerHTML=Array.from({length:7},(_,i)=>`<div class="daily-slot"><span>${i+1}. ${dailyPlan[i]?.name||'空白'}</span><button data-clear-slot="${i}">清除</button></div>`).join('');
  };

  const _dailyText_v114 = window.dailyText;
  window.dailyText = function(ev){
    if(ev && ev.summer){
      const imp=(state.importantCharacters||[]).map(id=>state.relations[id]?.name).filter(Boolean)[0];
      if(ev.id==='summer_read_magic') return `你翻开刚买来的魔法书籍，陌生的词句像窗外未曾抵达的远方。${imp?`你忽然想到，${imp}也许早已熟悉这些内容。`:''}`;
      if(ev.id==='summer_self_charms') return '你试着在安全的范围内理解基础魔咒的发音与手势。真正施咒还太早，但那些音节已经在心里留下回声。';
      if(ev.id==='summer_wand_notes') return '你把奥利凡德说过的话记在纸上。魔杖安静地躺在一旁，像是在等待九月。';
      if(ev.id==='summer_pack') return '你把长袍、课本和小瓶子重新放进行李箱。每一样东西都在提醒你：另一个世界正在等你。';
      if(ev.id==='summer_rest') return '你终于没有逼自己继续看书，而是好好休息了一会儿。暑假短暂得像一页即将翻过去的羊皮纸。';
      if(ev.id==='summer_walk') return '你出门散了散心。麻瓜世界照常运转，但你已经知道，砖墙之后还有另一条街。';
    }
    return typeof _dailyText_v114==='function'?_dailyText_v114(ev):`你把时间花在${ev?.name||'日常'}上。`;
  };

  window.dailyEventById = function(id){ return window.activeDailyEvents().find(x=>x.id===id)||DAILY_EVENTS.find(x=>x.id===id); };

  // Capture daily selections so summer-specific ids work and no school event leaks into July/August.
  document.addEventListener('click',function(e){
    const btn=e.target.closest('[data-daily-id]');
    if(!btn) return;
    const ev=window.dailyEventById(btn.dataset.dailyId);
    if(!ev) return;
    e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    if(dailyPlan.length<7) dailyPlan.push(ev);
    window.renderDaily();
  },true);

  // Confirm daily fills blanks with the correct active pool rest event.
  const confirm=document.querySelector('#confirmDailyBtn');
  if(confirm && !confirm.dataset.v114){
    confirm.dataset.v114='1';
    confirm.addEventListener('click',function(e){
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      const events=window.activeDailyEvents();
      const rest=events.find(e=>/rest|休息/.test(e.id+e.name))||events[0];
      while(dailyPlan.length<7) dailyPlan.push(rest);
      runDaily();
    },true);
  }

  // Player replies: store exactly what player wrote as the sent reply; AI only generates the other person's attachment response.
  window.openLetter = function(id){
    const l=state.letters.find(x=>x.id===id); if(!l)return;
    l.read=true; save(); renderLetters();
    const replies=(l.replies||[]).map(r=>{
      if(typeof r==='string') return `<hr><p><b>附件回复：</b><br>${r.replace(/\n/g,'<br>')}</p>`;
      if(r.type==='player') return `<hr><p><b>你的回信：</b><br>${String(r.content||'').replace(/\n/g,'<br>')}</p>`;
      return `<hr><p><b>附件回复：</b><br>${String(r.content||'').replace(/\n/g,'<br>')}</p>`;
    }).join('');
    document.querySelector('#letterDialogContent').innerHTML=`<div class="paper"><h3>${l.title}</h3><p>${l.content.replace(/\n/g,'<br>')}</p>${replies}</div>`;
    document.querySelector('#letterDialog').showModal();
  };
  window.replyLetter = async function(id){
    const l=state.letters.find(x=>x.id===id); if(!l)return;
    document.querySelector('#letterDialogContent').innerHTML=`<div class="paper"><h3>回信给${l.senderName}</h3><textarea id="replyContent" class="textarea" placeholder="请亲自写下你的回信。你写什么，就会原样寄出什么。"></textarea><button class="btn primary full" id="sendReplyBtn">寄出回信</button></div>`;
    document.querySelector('#letterDialog').showModal();
    document.querySelector('#sendReplyBtn').onclick=async()=>{
      const txt=document.querySelector('#replyContent').value.trim(); if(!txt)return;
      l.replies=l.replies||[];
      l.replies.push({type:'player',content:txt,time:{...state.time}});
      save(); renderLetters();
      const fallback=`我收到你的回信了。读到你亲手写下的那些话时，我停了很久。也许现在还不能把一切都说清楚，但我会记得。`;
      const resp=await callAI([{role:'system',content:`你扮演${l.senderName}，玩家刚刚已经亲自写了回信。不要改写玩家回信，只能以${l.senderName}的口吻写一封300字以内的附件回复。一年级只保持朋友关系。称呼玩家：${state.player.nickname||state.player.name}。`},{role:'user',content:`原信：${l.content}\n玩家亲手写下的回信：${txt}`}],fallback);
      l.replies.push({type:'attachment',content:resp,time:{...state.time}});
      save(); renderLetters(); window.openLetter(id);
    };
  };

  // Re-render when arriving on these screens, using patched rules.
  const _go_v114=window.go;
  window.go=function(id){
    _go_v114(id);
    if(id==='screen-bond-event') window.renderBondInvite();
    if(id==='screen-night') window.renderNightSetup();
    if(id==='screen-daily') window.renderDaily();
  };

  // Context prompt calendar rules for AI.
  const _contextPrompt_v114=window.contextPrompt;
  window.contextPrompt=function(type,step,label,charId){
    return _contextPrompt_v114(type,step,label,charId)+`\n【校历硬规则v1.14】当前时间：${state.time.year}年${state.time.month}月。1991年8月是对角巷入学采购，羁绊事件和夜游均未开放。所有7月/8月都是暑假：不能夜游，养成不能出现上课、图书馆复习、教授课堂，只能出现阅读魔法书籍、自学基础魔咒、整理行李、休息、外出散心等暑假活动。9月正式开学后才可以出现上课、图书馆、宿舍、夜游。玩家回信必须保持玩家原文，AI不得替玩家改写。`;
  };

  setTimeout(()=>{ try{ window.renderDaily(); window.renderBondInvite(); window.renderNightSetup(); }catch(e){console.warn(e);} },300);
})();

/* ===== v1.15 strict dialogue continuity patch =====
   Rules:
   1) No dialogue/history is cleared except new game or loading a save.
   2) AI must respond to player's latest action first.
   3) Scene/time/location changes are not allowed inside narration unless the player selected a transition option.
   4) If a transition is needed, AI must offer it as an option, e.g. “去别的地方看看吧”.
*/
(function(){
  const TRANSITION_RE = /(去|前往|离开|结束|下一|继续当前月份的下一段|准备返程|回到|进入|先去|换个地方|别的地方|太晚|返回主页)/;
  const SCENE_JUMP_RE = /(你们?来到|你们?走进|你们?离开|转眼|第二天|几天后|片刻后你已经|忽然来到了|回到.*休息室|进入.*教室)/;
  const CONTINUITY_RULE = `\n【连续对话硬规则 v1.15】\n- 本段对话历史必须完整保留，除非玩家新建角色或读取存档。\n- 玩家做出选择或输入后，你必须先回应玩家刚刚的具体行为，不允许跳过回应。\n- 禁止擅自替玩家更换地点、时间、场景，也禁止用一句旁白直接把玩家带到别处。\n- 如果剧情需要换场景，只能把它写成选项，例如：“去别的地方看看吧”“现在似乎有些太晚了”“前往下一家店”。\n- 只有当玩家选择了这类转场选项，系统才可以加入金色分割线并进入下一场景。\n- 旧选项可以消失，但旧对话、旧旁白、旧角色气泡不可删除。`;

  const oldContext = window.contextPrompt;
  window.contextPrompt = function(type, step, label, charId){
    const base = typeof oldContext === 'function' ? oldContext(type, step, label, charId) : '';
    return base + CONTINUITY_RULE;
  };

  function isTransitionAction(action){ return TRANSITION_RE.test(String(action||'')); }
  function sanitizeNoJump(ai, action){
    const text = String(ai||'');
    if(isTransitionAction(action)) return text;
    if(!SCENE_JUMP_RE.test(text)) return text;
    return text + `\n【旁白】如果你想离开当前场景，请从下面的选项中决定。\n【选项】\nA. 继续留在这里观察\nB. 再和眼前的人说几句话\nC. 去别的地方看看吧`;
  }
  window.isTransitionAction = isTransitionAction;
  window.sanitizeNoJump = sanitizeNoJump;

  function appendDivider(thread, label){
    thread.blocks.push({ai:`【旁白】—— 金色分割线划过羊皮纸，${label||'场景即将切换'}。\n【选项】\nA. 继续当前月份的下一段主线`});
  }

  // Mainline: only transition when player explicitly chooses transition wording.
  window.resolveMainChoice = async function(idx, customText){
    const info=currentMainStep(); if(!info)return;
    const {step,label}=info; if(!step){go('screen-game-home');return;}
    const action=customText || mainlineOptions(step)[idx] || '继续观察';
    const tid=threadIdFor('main',step);
    const th=ensureThread(tid,fallbackStory(step));
    th.turns=(th.turns||0)+1;
    const transition = isTransitionAction(action);
    const optEl=$('#mainlineOptions'); if(optEl) optEl.innerHTML='';
    th.blocks.push({player:action,ai:''});
    renderThreadToUI(th,'mainlineText','mainlineOptions','main');
    showThinking('mainlineText');
    const history=compileThread(th).slice(-7000);
    const fallback=`【旁白】你选择了${action}。眼前的场景没有被突然跳过，周围的人和事先对你的举动作出回应。\n【选项】\nA. 继续追问细节\nB. 观察身边的人\nC. 去别的地方看看吧`;
    let ai=await callAI([
      {role:'system',content:contextPrompt('main',step,label)},
      {role:'user',content:`当前连续剧情（必须保留）：\n${history}\n\n玩家刚刚选择/输入：${action}\n${transition?'玩家选择了转场类行动，可以自然结束当前小场景并给出金色分割线。':'玩家没有选择转场，禁止切换地点/时间/场景；必须留在当前场景内回应玩家。'}\n输出旁白和角色台词，最后给2-4个选项。`}
    ],fallback);
    clearThinking();
    ai=sanitizeNoJump(ai, action);
    th.blocks[th.blocks.length-1].ai=ai;
    if(th.turns>=minTurnsForStep(step) && transition){
      completeStep(step); applyMainStepEffects(step,idx,action); addMemory(`completed_${step}`);
      appendDivider(th,'这段经历被记录下来');
    }
    save(); renderGame(); renderThreadToUI(th,'mainlineText','mainlineOptions','main');
  };

  // Bond: never jump scene unless player says leave/end/too late. History persists.
  window.handleBondAction = async function(id,action){
    const r=state.relations[id]; if(!r)return;
    const tid=threadIdFor('bond',id); const th=ensureThread(tid,'');
    th.turns=(th.turns||0)+1;
    const transition=isTransitionAction(action);
    const optEl=$('#bondOptions'); if(optEl) optEl.innerHTML='';
    th.blocks.push({player:action,ai:''});
    renderThreadToUI(th,'bondNarrative','bondOptions','bond');
    showThinking('bondNarrative');
    const fallback=`【旁白】你选择${action}。${r.name}没有把话题突然带到另一个地方，而是先回应了你。\n${r.name}：嗯，我听着。\n【选项】\nA. 继续聊下去\nB. 换个轻松的话题\nC. 现在似乎有些太晚了`;
    let ai=await callAI([
      {role:'system',content:contextPrompt('bond','bond_event','羁绊事件',id)},
      {role:'user',content:`羁绊事件连续历史：\n${compileThread(th).slice(-6000)}\n\n玩家行动：${action}\n${transition?'玩家选择了结束或离开，可以自然收束。':'玩家没有选择离开，禁止擅自换场；必须继续当前相处。'}\n一年级只保持朋友关系，不加好感。`}
    ],fallback);
    clearThinking();
    ai=sanitizeNoJump(ai, action);
    th.blocks[th.blocks.length-1].ai=ai;
    if((th.turns>=4 && transition) || /时间差不多|结束|离开|回去|太晚/.test(action)){
      th.blocks.push({ai:`【旁白】—— 金色分割线轻轻划过。${r.name}似乎还有自己的事，这段相处暂时结束。\n【选项】\nA. 返回主页`});
    }
    save(); renderThreadToUI(th,'bondNarrative','bondOptions','bond');
  };

  // Night: exploration stays at current location unless player selects retreat/return.
  window.startNight=function(){
    if(isSummerMonth()){blockFeature('还没开学呢，暑假不能夜游。');return;}
    if(state.monthly.nightUsed){toast('本月已经夜游过一次。');return;}
    const loc=$('#nightLocationList .selected')?.dataset.nightLocation||NIGHT_LOCATIONS[0];
    state.monthly.nightUsed=true;
    $('#nightSetup')?.classList.add('hidden');
    const box=$('#nightExploreBox'); box.classList.remove('hidden'); box.className='story-shell';
    box.innerHTML='<div id="nightNarrative" class="story-narrative"></div><div id="nightOptions" class="story-choice-zone"></div><div class="story-input-zone"><input id="nightFreeInput" class="story-input" placeholder="你还会怎么做呢？"><button id="nightActionBtn" class="action-jelly">行动</button></div>';
    const tid=threadIdFor('night',loc);
    const th=ensureThread(tid,`【旁白】夜色压在${loc}附近，城堡白天的热闹被门缝后的风声取代。\n【选项】\nA. 先观察周围\nB. 放轻脚步继续前进\nC. 如果太危险就撤退`);
    th.turns=th.turns||0; renderThreadToUI(th,'nightNarrative','nightOptions','night');
    const act=async(v)=>{
      th.turns++;
      const transition=isTransitionAction(v)||/撤退|回去/.test(v);
      const opt=$('#nightOptions'); if(opt) opt.innerHTML='';
      th.blocks.push({player:v,ai:''}); renderThreadToUI(th,'nightNarrative','nightOptions','night'); showThinking('nightNarrative');
      const caught=loc===nightDanger&&Math.random()<.25;
      if(caught){addStress(30);state.housePoints-=10;} else addStress(3);
      const fallback=caught?`【旁白】你刚做出选择，洛丽丝夫人的眼睛就在黑暗里亮起。费尔奇的脚步声随即逼近，你不得不立刻压低呼吸。\n【选项】\nA. 赶紧藏起来\nB. 低声念一个转移注意的咒语\nC. 现在似乎太晚了，先回去`:`【旁白】你选择${v}。夜色没有马上吞掉你的声音，反而把每一点细节都放大了。\n【选项】\nA. 调查墙边痕迹\nB. 继续向前\nC. 现在似乎太晚了，先回去`;
      let ai=await callAI([
        {role:'system',content:contextPrompt('night','night_explore',loc)},
        {role:'user',content:`夜游地点固定为：${loc}\n历史：${compileThread(th).slice(-6000)}\n玩家行动：${v}\n${transition?'玩家选择了撤退/回去，可以结束夜游。':'玩家没有撤退，禁止切换到其他地点；继续当前地点探索。'}\n请按探索节点回应，不要删除旧对话。`}
      ],fallback);
      clearThinking(); ai=sanitizeNoJump(ai,v); th.blocks[th.blocks.length-1].ai=ai;
      if(th.turns>=4 && transition) th.blocks.push({ai:'【旁白】—— 金色分割线划过羊皮纸，今晚的夜游暂时结束。\n【选项】\nA. 返回主页'});
      save(); renderThreadToUI(th,'nightNarrative','nightOptions','night');
    };
    $('#nightActionBtn').onclick=()=>{const v=$('#nightFreeInput').value.trim(); if(v)act(v); $('#nightFreeInput').value='';};
  };

  // Daily free action: do not move scenes unless player asks; no clearing previous free text.
  const oldRunDaily = window.runDaily;
  // keep existing runDaily; free-action prompt strengthened by contextPrompt override.

  // Visual gold divider rendering: convert divider narration into a dedicated divider line.
  const oldParse = window.parseStory;
  window.parseStory = function(text,targetTextId,targetOptId,type){
    oldParse(text,targetTextId,targetOptId,type);
    const narr=$('#'+targetTextId); if(!narr) return;
    $$('.narrator-line',narr).forEach(el=>{
      if(/金色分割线|划过羊皮纸|划开一道细线/.test(el.textContent||'')){
        el.classList.add('gold-divider-line');
      }
    });
  };
})();

/* ===== v1.16 narrative-zone / option-zone hard lock =====
   - Options are rendered ONLY in the option zone.
   - Narration area keeps narrator, romanceable NPC bubbles, and player replies only.
   - Old options disappear after choice and are never preserved inside narration.
   - Mainline uses one persistent thread across months; only new game/load save changes it.
   - Moving to next anchor is optional and only occurs when player chooses a transition/progress option.
*/
(function(){
  const PROGRESS_RE = /(继续当前月份的下一段主线|进入下一段主线|前往下一家店|去下一个地方|去别的地方|准备返程|离开这里|结束这段|返回主页|现在似乎有些太晚|前往|先去|回到)/;

  function splitSceneOptions(raw){
    const s=String(raw||'');
    const marker='【选项】';
    const idx=s.lastIndexOf(marker);
    if(idx<0) return {scene:s, options:[]};
    const scene=s.slice(0,idx).trim();
    const optText=s.slice(idx+marker.length).trim();
    const options=optText.split(/\n+/)
      .map(x=>x.replace(/^[A-D][\.、]\s*/,'').trim())
      .filter(Boolean)
      .slice(0,4);
    return {scene, options};
  }
  window.__splitSceneOptions = splitSceneOptions;

  function stripOptions(raw){ return splitSceneOptions(raw).scene; }
  window.__stripOptions = stripOptions;

  // Mainline must be one continuous scroll. Step/month changes use gold divider, not clearing.
  const oldThreadIdFor = window.threadIdFor;
  window.threadIdFor = function(prefix, extra=''){
    if(prefix==='main') return 'main_global_persistent_thread';
    return typeof oldThreadIdFor==='function' ? oldThreadIdFor(prefix, extra) : `${prefix}_${currentKey()}_${extra}`;
  };

  // Compile for AI context: no old option lists; player replies are preserved as “你：...”
  window.compileThread = function(th){
    return (th?.blocks||[]).map(b=>{
      const p=b.player ? `【旁白】你：${b.player}\n` : '';
      const ai=stripOptions(b.ai||'');
      return p+ai;
    }).join('\n').trim();
  };

  function renderLine(narr, line){
    let clean=String(line||'').replace(/^【旁白】/,'').trim();
    if(!clean) return;
    if(typeof markRoleMentioned==='function') markRoleMentioned(clean);
    if(clean.startsWith('你：')){
      narr.insertAdjacentHTML('beforeend',`<div class="player-action-line">${escapeHtml(clean.replace(/^你：/,''))}</div>`);
      return;
    }
    const match=clean.match(/^([^：:]{1,18})[：:](.+)$/);
    if(match){
      const name=match[1].trim(), body=match[2].trim();
      if(/韦斯莱双子|双子|弗雷德和乔治|乔治和弗雷德/.test(name)){
        if(typeof meet==='function'){meet('fred');meet('george');}
        narr.insertAdjacentHTML('beforeend',`<div class="dialog-line twins-line">${charAvatar('fred')}${charAvatar('george')}<div class="speech-bubble"><b>弗雷德与乔治</b>${escapeHtml(body)}</div></div>`);
        return;
      }
      const id=typeof roleIdFromSpeakerName==='function' ? roleIdFromSpeakerName(name) : null;
      if(id && state?.relations?.[id]){
        if(typeof meet==='function') meet(id);
        narr.insertAdjacentHTML('beforeend',`<div class="dialog-line">${charAvatar(id)}<div class="speech-bubble"><b>${state.relations[id].name}</b>${escapeHtml(body)}</div></div>`);
        return;
      }
    }
    const divClass=/金色分割线|划过羊皮纸|划开一道细线|——/.test(clean) ? 'narrator-line gold-divider-line' : 'narrator-line';
    narr.insertAdjacentHTML('beforeend',`<div class="${divClass}">${escapeHtml(clean)}</div>`);
  }

  // Thread rendering: narrative area receives all history stripped of option lists.
  // Option zone receives ONLY the latest block's current options.
  window.renderThreadToUI = function(thread,textId,optId,type){
    const narr=$('#'+textId), opt=$('#'+optId); if(!narr||!opt||!thread) return;
    narr.innerHTML='';
    const blocks=thread.blocks||[];
    blocks.forEach(b=>{
      if(b.player) renderLine(narr, '你：'+b.player);
      stripOptions(b.ai||'').split(/\n+/).filter(Boolean).forEach(line=>renderLine(narr,line));
    });
    const lastAi=blocks.length ? (blocks[blocks.length-1].ai||'') : '';
    const options=splitSceneOptions(lastAi).options;
    if(options.length){
      opt.innerHTML=`<div class="story-options">${options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${escapeHtml(o)}">${String.fromCharCode(65+i)}. ${escapeHtml(o)}</button>`).join('')}</div>`;
    }else{
      opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    }
    narr.scrollTop=narr.scrollHeight;
    if(typeof syncRelationSurfaces==='function') syncRelationSurfaces();
  };

  // parseStory is kept for non-thread text, but also obeys option separation strictly.
  window.parseStory = function(text,targetTextId,targetOptId,type){
    const narr=$('#'+targetTextId), opt=$('#'+targetOptId); if(!narr||!opt)return;
    const parts=splitSceneOptions(text||'');
    narr.innerHTML='';
    parts.scene.split(/\n+/).filter(Boolean).forEach(line=>renderLine(narr,line));
    if(parts.options.length){
      opt.innerHTML=`<div class="story-options">${parts.options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${escapeHtml(o)}">${String.fromCharCode(65+i)}. ${escapeHtml(o)}</button>`).join('')}</div>`;
    }else{
      opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    }
    narr.scrollTop=narr.scrollHeight;
    if(typeof syncRelationSurfaces==='function') syncRelationSurfaces();
  };

  function canProgressCurrentStep(step, action, turns){
    return turns>=minTurnsForStep(step) && PROGRESS_RE.test(String(action||''));
  }

  // Override mainline once more so progress is optional, old dialogue never clears, and old options vanish.
  window.renderMainline = async function(){
    const info=currentMainStep();
    if(!info){ $('#mainlineText')&&($('#mainlineText').innerHTML='<div class="narrator-line">当前月份主线暂未制作。</div>'); return; }
    const {m,done,step,label}=info;
    const tid=threadIdFor('main','global');
    const th=ensureThread(tid, step?fallbackStory(step):'【旁白】本月主线剧情已推进完毕。\n【选项】\nA. 返回主页');
    if(!step && !(th.blocks[th.blocks.length-1]?.ai||'').includes('本月主线剧情已推进完毕')){
      th.blocks.push({ai:'【旁白】本月主线剧情已推进完毕。\n【选项】\nA. 返回主页'});
    }
    renderThreadToUI(th,'mainlineText','mainlineOptions','main');
  };

  window.resolveMainChoice = async function(idx, customText){
    const info=currentMainStep(); if(!info)return;
    const {step,label}=info;
    const tid=threadIdFor('main','global');
    const th=ensureThread(tid, step?fallbackStory(step):'');
    const lastOpts=splitSceneOptions(th.blocks[th.blocks.length-1]?.ai||'').options;
    const action=customText || lastOpts[idx] || mainlineOptions(step||'')[idx] || '继续观察';
    const optEl=$('#mainlineOptions'); if(optEl) optEl.innerHTML='';
    th.turns=(th.turns||0)+1;
    th.blocks.push({player:action,ai:''});
    renderThreadToUI(th,'mainlineText','mainlineOptions','main');
    showThinking('mainlineText');

    if(!step){
      clearThinking();
      if(/返回主页/.test(action)) go('screen-game-home');
      return;
    }

    const progress=canProgressCurrentStep(step, action, th.turns||0);
    const fallback= progress
      ? `【旁白】你决定暂时收束眼前这一幕。金色分割线轻轻划过羊皮纸，刚刚发生的一切都被保留下来。\n【选项】\nA. 进入下一段主线\nB. 先留在当前界面继续想想`
      : `【旁白】你选择${action}。眼前的人和事没有被跳过，而是先对你的选择作出回应。\n【选项】\nA. 继续追问细节\nB. 观察身边的人\nC. 去别的地方看看吧`;
    let ai=await callAI([
      {role:'system',content:contextPrompt('main',step,label)+`\n【选项区硬规则】选项只能写在最后的【选项】内；不要把选项写进旁白。叙事区只允许旁白、角色台词、玩家回复。`},
      {role:'user',content:`连续剧情历史（不含旧选项）：\n${compileThread(th).slice(-7000)}\n\n玩家刚刚选择/输入：${action}\n${progress?'玩家选择了推进/转场按钮，可以收束当前锚点，但仍要保留全部旧对话。':'玩家没有选择真正推进主线，禁止完成锚点，必须继续当前场景互动。'}\n最后给2-4个选项；如果剧情需要换场景，必须作为选项给玩家。`}
    ], fallback);
    clearThinking();
    ai=sanitizeNoJump(ai, action);
    // When player picked a progress option, complete the anchor but do not force user away.
    if(progress){
      completeStep(step); applyMainStepEffects(step,idx,action); addMemory(`completed_${step}`);
      ai = stripOptions(ai) + `\n【旁白】—— 金色分割线划过羊皮纸，这段经历已经被记录。\n【选项】\nA. 进入下一段主线\nB. 先留在当前界面继续对话`;
    }
    th.blocks[th.blocks.length-1].ai=ai;
    save(); renderGame(); renderThreadToUI(th,'mainlineText','mainlineOptions','main');
  };

  // Bond: also use latest options only; old options vanish.
  const oldHandleBondAction = window.handleBondAction;
  window.handleBondAction = async function(id, action){
    const r=state.relations[id]; if(!r)return;
    const tid=threadIdFor('bond',id); const th=ensureThread(tid,'');
    const optEl=$('#bondOptions'); if(optEl) optEl.innerHTML='';
    th.turns=(th.turns||0)+1;
    th.blocks.push({player:action,ai:''});
    renderThreadToUI(th,'bondNarrative','bondOptions','bond');
    showThinking('bondNarrative');
    const transition=PROGRESS_RE.test(String(action||''));
    const fallback=`【旁白】你选择${action}。${r.name}先回应了你，而不是把这段相处突然跳到别处。\n${r.name}：嗯，我听着。\n【选项】\nA. 继续聊下去\nB. 换个轻松的话题\nC. 现在似乎有些太晚了`;
    let ai=await callAI([
      {role:'system',content:contextPrompt('bond','bond_event','羁绊事件',id)+`\n选项只能出现在最后【选项】区，不得混入叙事区。`},
      {role:'user',content:`羁绊连续历史：\n${compileThread(th).slice(-6500)}\n玩家行动：${action}\n${transition?'玩家选择了结束或离开，可以自然收束。':'玩家没有离开，继续当前相处，不要换场。'}\n一年级只保持朋友关系，不加好感。`}
    ],fallback);
    clearThinking(); ai=sanitizeNoJump(ai, action);
    if((th.turns>=4 && transition)||/返回主页/.test(action)){
      ai=stripOptions(ai)+`\n【旁白】—— 金色分割线轻轻划过，这段相处暂时停在这里。\n【选项】\nA. 返回主页\nB. 继续留在当前界面`;
    }
    th.blocks[th.blocks.length-1].ai=ai;
    save(); renderThreadToUI(th,'bondNarrative','bondOptions','bond');
  };
})();

/* ===== v1.16 minimal patch: mainline affection gain only ===== */
(function(){
  if(window.__mainlineAffectionPatchV116) return;
  window.__mainlineAffectionPatchV116 = true;
  const previousResolveMainChoice = window.resolveMainChoice;

  function detectMainlineInteractionIds(text){
    const found = new Set();
    const source = String(text || '');
    if(!source) return [];

    // Prefer explicit character speech lines and direct mentions in the player action / AI reply.
    source.split(/\n+/).forEach(line=>{
      const clean = line.replace(/^【[^】]+】/,'').trim();
      const speech = clean.match(/^([^：:]{1,18})[：:]/);
      if(speech && typeof roleIdFromSpeakerName === 'function'){
        const id = roleIdFromSpeakerName(speech[1]);
        if(id && state?.relations?.[id]) found.add(id);
      }
      if(typeof ROLE_ALIASES === 'object'){
        Object.entries(ROLE_ALIASES).forEach(([alias,id])=>{
          if(clean.includes(alias) && state?.relations?.[id]) found.add(id);
        });
      }
    });
    return Array.from(found).filter(id=>state?.relations?.[id] && !state.relations[id].hidden);
  }

  window.resolveMainChoice = async function(idx, customText){
    const tid = (typeof threadIdFor === 'function') ? threadIdFor('main','global') : '';
    const thBefore = tid && state?.threads ? state.threads[tid] : null;
    const beforeLen = thBefore?.blocks?.length || 0;

    await previousResolveMainChoice.call(this, idx, customText);

    const th = tid && state?.threads ? state.threads[tid] : null;
    const block = th?.blocks?.[Math.max(0, (th.blocks.length || 1) - 1)];
    if(!block || (th.blocks.length || 0) <= beforeLen) return;

    const combined = `${block.player || ''}\n${block.ai || ''}`;
    const ids = detectMainlineInteractionIds(combined).slice(0, 2);
    if(!ids.length) return;

    ids.forEach(id=>{
      if(typeof addAffection === 'function') addAffection(id, 1);
    });
    if(typeof save === 'function') save();
    if(typeof renderGame === 'function') renderGame();
  };
})();


/* ===== v1.16.1 patch: bond character detail page with editable player impression ===== */
(function(){
  if(window.__bondCharacterProfilePatchV1161) return;
  window.__bondCharacterProfilePatchV1161 = true;

  const PROFILE_INTROS = {
    harry:'大难不死的男孩，与玩家同届入学。勇敢、真诚，也常常被卷入危险与谜团。',
    ron:'韦斯莱家的男孩，热闹、直率，重视朋友，也会有自己的不安和自尊心。',
    hermione:'聪明认真、守规则的新生。她比大多数同龄人都更努力，也更需要真正理解她的人。',
    draco:'马尔福家族继承人。骄傲、挑剔、好胜，习惯用家族与出身判断世界。',
    blaise:'斯莱特林学生，擅长社交与观察，常常知道一些别人没注意到的校园传闻。',
    theo:'安静的斯莱特林学生，像是总在旁边观察。他不轻易靠近别人，也不轻易表达真实想法。',
    fred:'韦斯莱双子之一，更大胆、更爱冒险，恶作剧时总是冲在前面。',
    george:'韦斯莱双子之一，比弗雷德更细腻些，常常把玩笑收得刚刚好。',
    percy:'韦斯莱家的哥哥，重视规则、责任和秩序，对级长职责十分认真。',
    cedric:'赫奇帕奇高年级学生，温和、优秀、可靠，是许多低年级学生会仰望的学长。',
    oliver:'格兰芬多魁地奇队长，认真、执着，对魁地奇有近乎燃烧般的热情。',
    cho:'拉文克劳学生，安静而温柔，常出现在图书馆、看台与学院活动附近。',
    snape:'霍格沃茨魔药课教授。冷淡、严厉、难以接近，似乎总能看穿学生的错误。',
    luna:'拉文克劳学生，二年级后登场。她看待世界的方式与大多数人都不同。',
    ginny:'韦斯莱家的妹妹，二年级后登场。起初害羞，但内心远比外表坚韧。',
    tom:'只有开启日记本剧情后才会出现的危险人物。他的温和往往带着蛊惑。',
    sirius:'三年级后出现的重要人物，自由、叛逆，也背负着沉重的过去。',
    lupin:'三年级后出现的黑魔法防御术教授，温柔克制，却藏着不愿轻易说出口的秘密。',
    krum:'四年级限定登场的国际学生与魁地奇明星，沉默、专注，带着异国距离感。'
  };

  function ensureProfileFields(){
    if(!state) return;
    state.characterImpressions = state.characterImpressions || {};
    state.characterNotes = state.characterNotes || {};
    state.characterAvatars = state.characterAvatars || {};
  }

  const oldMigrate = window.migrateState || migrateState;
  window.migrateState = function(){
    if(typeof oldMigrate === 'function') oldMigrate();
    ensureProfileFields();
  };

  function relationLabel(r){
    if(!r) return '尚未认识';
    const p = state?.player || {};
    if(p.siblingCharacterId === r.id && p.siblingRelation){
      return `你的${p.siblingRelation}`;
    }
    if(r.hidden) return '你似乎还不了解他。';
    const aff = r.affection || 0, fam = r.familiarity || 0;
    if(aff >= 80 || fam >= 85) return '特殊羁绊';
    if(aff >= 60 || fam >= 65) return '重要的人';
    if(aff >= 40 || fam >= 45) return '信任的朋友';
    if(aff >= 20 || fam >= 25) return '逐渐熟悉的朋友';
    if(r.met) return '已经认识的同学';
    return '尚未正式认识';
  }

  function renderBondDetail(id){
    ensureProfileFields();
    const r = state?.relations?.[id];
    const el = document.querySelector('#bondDetailContent');
    if(!r || !el){ return; }
    const src = state.characterAvatars[id] || '';
    const intro = r.hidden ? '？？？' : (PROFILE_INTROS[id] || '这位角色的资料仍在整理中。');
    const impression = state.characterImpressions[id] || '';
    const visibleStats = r.hidden ? '？？？' : `好感 ${r.affection}/100 · 熟悉度 ${r.familiarity}/100`;
    el.innerHTML = `
      <div class="bond-detail-card">
        <div class="bond-detail-head">
          <div class="bond-detail-avatar">${src ? `<img src="${src}" alt="${r.name}">` : charInitial(r.name)}</div>
          <div class="bond-detail-name">
            <h3>${r.name}</h3>
            <p>${CHARACTERS[id]?.group || '角色'} · ${CHARACTERS[id]?.yearOpen || 1}年级开放</p>
            <p>${visibleStats}</p>
          </div>
        </div>

        <div class="bond-detail-section">
          <h4>角色简介</h4>
          <p>${intro}</p>
        </div>

        <div class="bond-detail-section">
          <h4>目前和玩家的关系</h4>
          <p>${relationLabel(r)}</p>
        </div>

        <div class="bond-detail-section">
          <h4>你对他的印象</h4>
          <p class="${impression ? '' : 'bond-impression-empty'}">${impression || '暂时空白。'}</p>
          <div class="bond-detail-actions">
            <button class="btn secondary" data-edit-impression="${id}">修改</button>
          </div>
        </div>

        <div class="bond-detail-section">
          <h4>角色头像</h4>
          <p class="hint small">这里可以更换头像，会同步到主线剧情、羁绊事件、羁绊界面。</p>
          <input class="input" type="file" accept="image/*" data-detail-avatar-upload="${id}">
        </div>
      </div>
    `;
    go('screen-bond-detail');
  }
  window.renderBondDetail = renderBondDetail;

  function renderBondCardsWithDetail(){
    ensureProfileFields();
    const el=document.querySelector('#bondList');
    if(!el)return;
    const arr=Object.values(state.relations)
      .filter(r=>r.visible&&r.met)
      .sort((a,b)=>b.affection-a.affection||b.familiarity-a.familiarity);
    if(!arr.length){
      el.innerHTML='<div class="empty-card"><p>已登场的可攻略角色会出现在这里。</p></div>';
      return;
    }
    el.innerHTML=arr.map(r=>`
      <div class="bond-card clickable" data-open-bond-detail="${r.id}">
        <div class="bond-card-head">${charAvatar(r.id)}<h3>${r.name} ${r.trend}</h3></div>
        <div class="stat-line"><span>好感</span><b>${r.hidden?'？？':r.affection+'/100'}</b></div>
        <div class="bar"><i style="width:${r.hidden?20:r.affection}%"></i></div>
        <div class="stat-line"><span>熟悉度</span><b>${r.familiarity}/100</b></div>
        <p class="hint small">详情：${r.hidden?'？？？':stage(r.affection)}</p>
      </div>`).join('');
  }
  window.renderBonds = renderBondCardsWithDetail;
  renderBonds = renderBondCardsWithDetail;

  document.addEventListener('click', function(e){
    const open = e.target.closest('[data-open-bond-detail]');
    if(open){
      e.preventDefault();
      renderBondDetail(open.dataset.openBondDetail);
      return;
    }
    const edit = e.target.closest('[data-edit-impression]');
    if(edit){
      e.preventDefault();
      ensureProfileFields();
      const id = edit.dataset.editImpression;
      const r = state.relations[id];
      const current = state.characterImpressions[id] || '';
      const val = prompt(`写下你对${r?.name || '他'}的印象：`, current);
      if(val !== null){
        state.characterImpressions[id] = val.trim();
        save();
        renderBondDetail(id);
      }
      return;
    }
  }, true);

  document.addEventListener('change', function(e){
    const input = e.target.closest('[data-detail-avatar-upload]');
    if(!input || !input.files || !input.files[0]) return;
    const id = input.dataset.detailAvatarUpload;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(){
      ensureProfileFields();
      state.characterAvatars[id] = reader.result;
      save();
      renderBondDetail(id);
      try{ renderBonds(); renderCharacterAvatarSettings(); }catch(err){}
    };
    reader.readAsDataURL(file);
  }, true);

  const oldRenderGame = window.renderGame || renderGame;
  window.renderGame = function(){
    if(typeof oldRenderGame === 'function') oldRenderGame();
    ensureProfileFields();
  };
})();

/* ===== v1.16.2 patch: fix mainline affection gain using storyThreads ===== */
(function(){
  if(window.__mainlineAffectionPatchV1162) return;
  window.__mainlineAffectionPatchV1162 = true;
  const prevResolveMainChoiceV1162 = window.resolveMainChoice;

  function detectMainlineAffectionTargets(text){
    const found = new Set();
    const source = String(text || '');
    if(!source) return [];

    source.split(/\n+/).forEach(line=>{
      const clean = line.replace(/^【[^】]+】/,'').trim();
      const speech = clean.match(/^([^：:]{1,18})[：:]/);
      if(speech && typeof roleIdFromSpeakerName === 'function'){
        const id = roleIdFromSpeakerName(speech[1]);
        if(id && state?.relations?.[id]) found.add(id);
      }
      if(typeof ROLE_ALIASES === 'object'){
        Object.entries(ROLE_ALIASES).forEach(([alias,id])=>{
          if(clean.includes(alias) && state?.relations?.[id]) found.add(id);
        });
      }
    });

    return Array.from(found).filter(id=>{
      const r = state?.relations?.[id];
      return r && !r.hidden;
    });
  }

  window.resolveMainChoice = async function(idx, customText){
    const tid = (typeof threadIdFor === 'function') ? threadIdFor('main','global') : '';
    const beforeThread = tid && state?.storyThreads ? state.storyThreads[tid] : null;
    const beforeLen = beforeThread?.blocks?.length || 0;

    await prevResolveMainChoiceV1162.call(this, idx, customText);

    const afterThread = tid && state?.storyThreads ? state.storyThreads[tid] : null;
    const blocks = afterThread?.blocks || [];
    if(!blocks.length || blocks.length <= beforeLen) return;

    const latest = blocks[blocks.length - 1] || {};
    const combined = `${latest.player || ''}\n${latest.ai || ''}`;
    const ids = detectMainlineAffectionTargets(combined).slice(0, 2);
    if(!ids.length) return;

    ids.forEach(id=>{
      const r = state?.relations?.[id];
      if(!r) return;
      r.met = true;
      r.visible = true;
      if(typeof addAffection === 'function') addAffection(id, 1);
    });
    if(typeof updateImportantCharacters === 'function') updateImportantCharacters();
    if(typeof save === 'function') save();
    if(typeof renderBonds === 'function') renderBonds();
    if(typeof renderGame === 'function') renderGame();
  };
})();

/* ===== v1.16.3 Month Transition Patch =====
   Only changes:
   - completing monthly daily training advances to next month immediately;
   - opening mainline after month change preserves all old dialogue, inserts one gold divider,
     then starts the new month's mainline thread.
*/
(function(){
  if(window.__monthTransitionPatchV1163) return;
  window.__monthTransitionPatchV1163 = true;

  function monthKeyFromState(){ return `${state.time.year}-${state.time.month}`; }
  function monthTitle(){ return `${state.time.year}年${state.time.month}月`; }
  function mainThread(){
    const tid = typeof threadIdFor === 'function' ? threadIdFor('main','global') : 'main_global_persistent_thread';
    return ensureThread(tid, '');
  }
  function monthOpeningFor(key, step){
    const map = {
      '1991-9':'暑假的最后几天似乎过得格外快。九月的风已经有了些凉意，前往国王十字车站的日子越来越近。属于霍格沃茨的新生活，终于要真正开始了。',
      '1991-10':'开学最初的混乱慢慢沉淀下来，十月的城堡开始变冷。课程、楼梯、画像和不同学院的目光，逐渐织成你每天都要面对的生活。',
      '1991-11':'万圣节的南瓜香气开始出现在礼堂，城堡却并不只有节日的热闹。某些危险正悄悄靠近一年级新生的生活。',
      '1991-12':'十二月的雪意落在窗边，霍格沃茨开始被圣诞装饰点亮。热闹背后，你也会第一次认真思考自己真正渴望看见什么。',
      '1992-1':'新年后的城堡恢复了课程与作业的节奏。那些曾经只像传闻一样的线索，开始在图书馆、走廊和低声交谈里露出形状。',
      '1992-2':'魁地奇的欢呼声重新点燃了学院之间的竞争。看台、训练场和课后的议论，让霍格沃茨的日常多了几分紧张。',
      '1992-3':'三月的禁林边缘仍带着寒意。传闻、脚印和夜色中的影子，让人很难相信城堡外的一切都只是普通危险。',
      '1992-4':'考试的压力逐渐压近，书本和羊皮纸堆满桌面。可越是临近期末，越有些线索不合时宜地浮现。',
      '1992-5':'五月的霍格沃茨表面平静，暗处却像被什么拉紧。关于魔法石的怀疑终于走向不得不面对的时刻。',
      '1992-6':'一年级即将结束。考试、学院杯、告别和暑假的来临，把这一年的所有选择都慢慢收束起来。'
    };
    return map[key] || `${monthTitle()}开始了。新的月份翻开，之前发生的一切仍然留在羊皮纸上，而新的故事正在等待你继续书写。`;
  }
  function ensureCurrentMonthMainlineIntro(){
    if(!state || !state.time) return;
    const key = monthKeyFromState();
    // 1991/8 is the initial opening month; keep original v1.16 behavior.
    if(key === '1991-8') return;
    state.eventFlags = state.eventFlags || {};
    const flag = `main_month_intro_${key}`;
    if(state.eventFlags[flag]) return;
    const info = typeof currentMainStep === 'function' ? currentMainStep() : null;
    if(!info || !info.step) return;
    const th = mainThread();
    th.blocks = th.blocks || [];
    th.blocks.push({
      ai: `【旁白】—— 金色分割线划过羊皮纸，${monthTitle()}开始了。\n【旁白】${monthOpeningFor(key, info.step)}\n${fallbackStory(info.step)}`
    });
    state.eventFlags[flag] = true;
    state.pendingMainlineMonthIntro = '';
    save();
  }

  const prevAdvanceMonthV1163 = window.advanceMonth || advanceMonth;
  window.advanceMonth = function(){
    if(typeof prevAdvanceMonthV1163 === 'function') prevAdvanceMonthV1163();
    if(state && state.time){
      state.pendingMainlineMonthIntro = monthKeyFromState();
      save();
    }
  };
  // Also bind global name in non-module script execution.
  try{ advanceMonth = window.advanceMonth; }catch(e){}

  const prevRenderMainlineV1163 = window.renderMainline || renderMainline;
  window.renderMainline = async function(){
    ensureCurrentMonthMainlineIntro();
    return await prevRenderMainlineV1163.apply(this, arguments);
  };
  try{ renderMainline = window.renderMainline; }catch(e){}

  // Override daily runner only to move the month advancement from the “返回主页” button
  // to the moment all 7 daily events have finished. Everything else remains the same.
  window.runDaily = function(){
    const box=$('#dailyRunBox'), board=$('#dailyBoard');
    board.classList.add('hidden'); box.classList.remove('hidden');
    box.innerHTML='<h3>本月养成日常</h3><div id="dailyResultList"></div>';
    const list=$('#dailyResultList'); let i=0; let advanced=false;
    const next=()=>{
      if(i>=7){
        if(!advanced){
          advanced=true;
          advanceMonth();
          dailyPlan=[];
        }
        list.insertAdjacentHTML('beforeend','<div class="daily-result-card"><h4>本月养成事件已结束</h4><p>本月也很充实呢，亲爱的小巫师！</p><button class="btn primary full" id="dailyBackHome">返回主页</button></div>');
        $('#dailyBackHome').onclick=()=>{ board.classList.remove('hidden'); box.classList.add('hidden'); go('screen-game-home'); };
        save(); renderGame();
        return;
      }
      const ev=dailyPlan[i] || (typeof activeDailyEvents==='function' ? (activeDailyEvents().find(e=>/rest|休息/.test(e.id+e.name)) || activeDailyEvents()[0]) : DAILY_EVENTS.find(e=>e.id==='rest'));
      i++;
      if(ev && ev.free){
        list.insertAdjacentHTML('beforeend',`<div class="free-action-box"><h4>事件 ${i}/7：自由行动</h4><p>${dailyText(ev)}</p><div id="dailyFreeNarrative_${i}" class="story-narrative mini-free"></div><input id="dailyFreeInput_${i}" class="story-input" placeholder="你想自由做些什么？"><button class="action-jelly" id="dailyFreeBtn_${i}">行动</button></div>`);
        const nId=`dailyFreeNarrative_${i}`;
        $(`#dailyFreeBtn_${i}`).onclick=async()=>{
          const v=$(`#dailyFreeInput_${i}`).value.trim()||'随意探索';
          showThinking(nId);
          const fallback=`【旁白】你选择${v}。这段自由时间没有立刻把你推向任何重大事件，却让你更像真正生活在这个世界里：细节、声音和未完成的念头都悄悄留下。`;
          const resp=await callAI([{role:'system',content:contextPrompt('daily_free','free_action','自由行动')},{role:'user',content:`玩家自由行动：${v}\n请回应玩家，生成短小自由事件，不要跳主线。`}],fallback);
          clearThinking(); parseStory(resp,nId,'dummyFreeOptions','dailyfree');
          addMemory('free_action');
          if(Math.random()<.25){addMemory('found_possible_dungeon');toast('你似乎发现了一个副本入口的线索');}
          next();
        };
        return;
      }
      applyDaily(ev);
      const gains=[];
      if(ev?.course) gains.push(`${courseLabel(ev.course)} +${ev.courseGain||1}`);
      if(ev?.stress) gains.push(`压力 ${ev.stress>0?'+':''}${ev.stress}`);
      if(ev?.health) gains.push(`健康 ${ev.health>0?'+':''}${ev.health}`);
      list.insertAdjacentHTML('beforeend',`<div class="daily-result-card"><h4>事件 ${i}/7：${ev?.name||'休息'}</h4><p>${dailyText(ev)}</p><p class="daily-gains">${gains.join(' · ')||'无数值变化'}</p></div>`);
      save(); renderGame(); setTimeout(next,180);
    };
    next();
  };
  try{ runDaily = window.runDaily; }catch(e){}
})();

/* ===== v1.16.4 Irreversible Month + Stress Ending Patch =====
   Only changes from v1.16.3:
   - the global month is irreversible after monthly daily training advances it;
   - all AI contexts must treat the current month as authoritative;
   - daily study stress is rebalanced upward;
   - stress reaching 100 triggers the ending page and records the ending in memoir.
*/
(function(){
  if(window.__v1164IrreversibleStressPatch) return;
  window.__v1164IrreversibleStressPatch = true;

  function ensureEndingStorage(){
    state.unlockedEndings = state.unlockedEndings || [];
    state.ended = state.ended || false;
  }
  function gameTimeText(){ return `${state?.time?.year||1991}年${state?.time?.month||8}月`; }

  // Stress balance: only adjust existing daily event data in-place.
  function rebalanceDailyStress(){
    const tune = ev => {
      if(!ev || ev.free) return ev;
      const name = String(ev.name||ev.id||'');
      if(/休息|散心|玩耍|暑假休息/.test(name)) return ev;
      if(/冲刺|考试/.test(name)) ev.stress = Math.max(Number(ev.stress||0), 12);
      else if(/魔药|图书馆|复习|预习|阅读|自学|魔咒|飞行|课程|练习|书籍|笔记/.test(name)) ev.stress = Math.max(Number(ev.stress||0), 5);
      else if(Number(ev.stress||0) > 0) ev.stress = Math.max(Number(ev.stress||0), 5);
      return ev;
    };
    try{ if(Array.isArray(DAILY_EVENTS)) DAILY_EVENTS.forEach(tune); }catch(e){}
    try{ if(Array.isArray(window.SUMMER_DAILY_EVENTS)) window.SUMMER_DAILY_EVENTS.forEach(tune); }catch(e){}
    // In this build summer events were defined in function scope in older patches; activeDailyEvents is patched below too.
  }
  rebalanceDailyStress();

  // Patch activeDailyEvents output without changing its existing filtering logic.
  const prevActiveDailyEventsV1164 = window.activeDailyEvents || (typeof activeDailyEvents==='function' ? activeDailyEvents : null);
  if(prevActiveDailyEventsV1164){
    window.activeDailyEvents = function(){
      const arr = prevActiveDailyEventsV1164.apply(this, arguments) || [];
      arr.forEach(ev=>{
        if(!ev || ev.free) return;
        const name = String(ev.name||ev.id||'');
        if(/休息|散心|玩耍|暑假休息/.test(name)) return;
        if(/冲刺|考试/.test(name)) ev.stress = Math.max(Number(ev.stress||0), 12);
        else if(/魔药|图书馆|复习|预习|阅读|自学|魔咒|飞行|课程|练习|书籍|笔记/.test(name)) ev.stress = Math.max(Number(ev.stress||0), 5);
        else if(Number(ev.stress||0) > 0) ev.stress = Math.max(Number(ev.stress||0), 5);
      });
      return arr;
    };
    try{ activeDailyEvents = window.activeDailyEvents; }catch(e){}
  }

  function endingText(id){
    if(id === 'mental_breakdown'){
      return '霍格沃茨的生活似乎远比你想象得沉重。持续不断的学习、人际关系、陌生世界与未知危险，最终压垮了你。你再也无法若无其事地推开下一扇门，也无法继续假装自己还能承受。于是，你的故事在这里停下了。';
    }
    return '你的故事在这里暂时落下帷幕。那些已经发生过的选择仍然留在羊皮纸上，成为这一次人生的痕迹。';
  }

  function showEnding(id){
    if(!state) return;
    ensureEndingStorage();
    if(state.ended) return;
    const nameMap = { mental_breakdown:'精神崩溃' };
    const name = nameMap[id] || '未知结局';
    const record = { id, name, player: state.player?.name || '新生', time: {...state.time}, realTime:new Date().toLocaleString(), text: endingText(id) };
    state.ended = true;
    state.currentEnding = record;
    state.unlockedEndings.push(record);
    try{
      const all = JSON.parse(localStorage.getItem('hp_rpg_unlocked_endings')||'[]');
      all.push(record);
      localStorage.setItem('hp_rpg_unlocked_endings', JSON.stringify(all));
    }catch(e){}
    save();
    renderEndingPage(record);
  }

  function renderEndingPage(record){
    let screen = document.getElementById('screen-ending');
    if(!screen){
      screen = document.createElement('section');
      screen.id = 'screen-ending';
      screen.className = 'screen';
      screen.innerHTML = `
        <div class="ending-page">
          <div class="ending-top">你的结局</div>
          <div class="ending-card jelly-card">
            <h1 id="endingName"></h1>
            <p id="endingMeta" class="ending-meta"></p>
            <div id="endingText" class="ending-text"></div>
            <button class="btn primary full" id="endingBackCover">返回封面</button>
          </div>
        </div>`;
      document.body.appendChild(screen);
      const css = document.createElement('style');
      css.textContent = `
        #screen-ending{background:var(--bg);color:var(--text);} 
        .ending-page{min-height:100vh;padding:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;position:relative;}
        .ending-top{position:absolute;top:18px;left:0;right:0;text-align:center;font-size:22px;font-weight:800;color:var(--text);letter-spacing:.08em;}
        .ending-card{width:min(92vw,520px);padding:28px 22px;border-radius:28px;background:var(--panel);border:1px solid var(--border);box-shadow:0 20px 60px rgba(0,0,0,.15);text-align:center;}
        .ending-card h1{margin:0 0 10px;font-size:30px;color:var(--primary);}
        .ending-meta{font-size:12px;opacity:.76;margin:0 0 18px;color:var(--muted);}
        .ending-text{font-size:15px;line-height:1.9;text-align:left;white-space:pre-line;margin:18px auto 24px;max-width:420px;color:var(--text);}
      `;
      document.head.appendChild(css);
    }
    document.getElementById('endingName').textContent = record.name;
    document.getElementById('endingMeta').textContent = `${record.player} · ${record.time.year}年${record.time.month}月`;
    document.getElementById('endingText').textContent = record.text;
    document.getElementById('endingBackCover').onclick = ()=> go('screen-cover');
    go('screen-ending');
  }

  // Patch stress only; keep original toast/render behavior, then check ending.
  const prevAddStressV1164 = window.addStress || (typeof addStress==='function' ? addStress : null);
  window.addStress = function(n){
    if(state?.ended) return;
    if(typeof prevAddStressV1164 === 'function') prevAddStressV1164(n);
    if(state && Number(state.stress) >= 100){
      showEnding('mental_breakdown');
    }
  };
  try{ addStress = window.addStress; }catch(e){}

  // Patch context prompt only to enforce irreversible current month. No UI/flow changes.
  const prevContextPromptV1164 = window.contextPrompt || (typeof contextPrompt==='function' ? contextPrompt : null);
  if(prevContextPromptV1164){
    window.contextPrompt = function(type, step, label, charId){
      const base = prevContextPromptV1164.apply(this, arguments);
      return base + `\n【月份不可逆硬规则v1.16.4】当前世界状态已经进入${gameTimeText()}。上个月及更早月份的对话只是历史记录，不能回到过去，不能重演已经发生过的事件。即使玩家提到上个月的事情，也只能作为回忆或谈论处理；所有新对话、新选项、新事件、新状态变化都必须发生在当前月份。若需要推动地点或时间变化，只能用选项邀请玩家选择，不得擅自切换。`;
    };
    try{ contextPrompt = window.contextPrompt; }catch(e){}
  }

  // Memoir: keep existing UI, but if memoir is empty, show unlocked endings from localStorage.
  const prevRenderMemoirV1164 = window.renderMemoir || (typeof renderMemoir==='function' ? renderMemoir : null);
  window.renderMemoir = function(){
    if(typeof prevRenderMemoirV1164 === 'function') prevRenderMemoirV1164.apply(this, arguments);
    const target = document.getElementById('memoirContent') || document.querySelector('#screen-memoir .page-body') || document.querySelector('#screen-memoir');
    if(!target) return;
    let all=[]; try{ all=JSON.parse(localStorage.getItem('hp_rpg_unlocked_endings')||'[]'); }catch(e){}
    if(!all.length) return;
    target.innerHTML = `<h2 class="section-title">回忆录</h2><div class="profile-grid">${all.slice().reverse().map(e=>`<div class="game-card"><h3>${e.name}</h3><p class="small">${e.player} · ${e.time.year}年${e.time.month}月</p><p>${e.text}</p></div>`).join('')}</div>`;
  };
  try{ renderMemoir = window.renderMemoir; }catch(e){}

  // If loaded ended state, restore ending page without touching saves.
  setTimeout(()=>{ if(state?.ended && state.currentEnding) renderEndingPage(state.currentEnding); }, 0);
})();

/* ===== v1.16.5 Critical Bugfix Patch =====
   Fixes only:
   1) irreversible current month after advancement;
   2) option lines stay only in option zone;
   3) night exploration lasts longer;
   4) bond event keeps the originally invited character;
   5) house sorting/manual house change syncs globally;
   6) ended saves cannot continue; endings persist in memoir.
*/
(function(){
  if(window.__v1165CriticalBugfixPatch) return;
  window.__v1165CriticalBugfixPatch = true;

  const HOUSE_NAMES = ['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'];
  const GAME_SCREEN_RE = /^screen-(game|mainline|bond-event|night|daily|profile|inventory|achievements)/;
  const ROMANCEABLE_IDS = Object.keys(CHARACTERS || {});

  function nowKey(){ return `${state?.time?.year || 1991}-${state?.time?.month || 8}`; }
  function monthText(){ return `${state?.time?.year || 1991}年${state?.time?.month || 8}月`; }
  function isAfterSortingOpen(){
    const y=state?.time?.year||1991, m=state?.time?.month||8;
    return y>1991 || (y===1991 && m>=9);
  }
  function html(s){ return typeof escapeHtml==='function' ? escapeHtml(s) : String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }

  function splitLatestOptionsStrict(raw){
    const s=String(raw||'');
    const marker='【选项】';
    const idx=s.lastIndexOf(marker);
    let scene = idx>=0 ? s.slice(0,idx) : s;
    const optText = idx>=0 ? s.slice(idx+marker.length) : '';
    // Remove any orphan option lines that the model accidentally placed into narration.
    scene = scene.split(/\n+/).filter(line=>{
      const x=line.trim();
      if(!x) return true;
      if(/^【?选项】?/.test(x)) return false;
      if(/^[A-D][\.、]\s*/.test(x)) return false;
      if(/^(选项|A选项|B选项|C选项|D选项)[:：]/.test(x)) return false;
      return true;
    }).join('\n');
    const options = optText.split(/\n+/)
      .map(x=>x.replace(/^[A-D][\.、]\s*/,'').trim())
      .filter(Boolean)
      .filter(x=>!/^【?旁白】?/.test(x))
      .slice(0,4);
    return {scene:scene.trim(), options};
  }
  window.__splitSceneOptions = splitLatestOptionsStrict;
  window.__stripOptions = raw => splitLatestOptionsStrict(raw).scene;

  function renderOneLine(narr,line){
    let clean=String(line||'').replace(/^【旁白】/,'').trim();
    if(!clean) return;
    if(/^【?选项】?/.test(clean) || /^[A-D][\.、]\s*/.test(clean)) return;
    if(typeof markRoleMentioned==='function') markRoleMentioned(clean);
    if(clean.startsWith('你：')){
      narr.insertAdjacentHTML('beforeend',`<div class="player-action-line">${html(clean.replace(/^你：/,''))}</div>`);
      return;
    }
    const match=clean.match(/^([^：:]{1,18})[：:](.+)$/);
    if(match){
      const name=match[1].trim(), body=match[2].trim();
      if(/韦斯莱双子|双子|弗雷德和乔治|乔治和弗雷德/.test(name)){
        if(typeof meet==='function'){ meet('fred'); meet('george'); }
        narr.insertAdjacentHTML('beforeend',`<div class="dialog-line twins-line">${charAvatar('fred')}${charAvatar('george')}<div class="speech-bubble"><b>弗雷德与乔治</b>${html(body)}</div></div>`);
        return;
      }
      const id=typeof roleIdFromSpeakerName==='function' ? roleIdFromSpeakerName(name) : null;
      if(id && state?.relations?.[id]){
        if(typeof meet==='function') meet(id);
        narr.insertAdjacentHTML('beforeend',`<div class="dialog-line">${charAvatar(id)}<div class="speech-bubble"><b>${state.relations[id].name}</b>${html(body)}</div></div>`);
        return;
      }
    }
    const cls=/金色分割线|划过羊皮纸|划开一道细线|——|═/.test(clean) ? 'narrator-line gold-divider-line' : 'narrator-line';
    narr.insertAdjacentHTML('beforeend',`<div class="${cls}">${html(clean)}</div>`);
  }

  window.compileThread = function(th){
    return (th?.blocks||[]).map(b=>{
      const p=b.player ? `【旁白】你：${b.player}\n` : '';
      const ai=splitLatestOptionsStrict(b.ai||'').scene;
      return p+ai;
    }).join('\n').trim();
  };

  window.renderThreadToUI = function(thread,textId,optId,type){
    const narr=$('#'+textId), opt=$('#'+optId); if(!narr||!opt||!thread) return;
    narr.innerHTML='';
    const blocks=thread.blocks||[];
    blocks.forEach(b=>{
      if(b.player) renderOneLine(narr,'你：'+b.player);
      splitLatestOptionsStrict(b.ai||'').scene.split(/\n+/).filter(Boolean).forEach(line=>renderOneLine(narr,line));
    });
    const lastAi=blocks.length ? (blocks[blocks.length-1].ai||'') : '';
    const options=splitLatestOptionsStrict(lastAi).options;
    if(options.length){
      opt.innerHTML=`<div class="story-options">${options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${html(o)}">${String.fromCharCode(65+i)}. ${html(o)}</button>`).join('')}</div>`;
    }else{
      opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    }
    narr.scrollTop=narr.scrollHeight;
    if(typeof syncRelationSurfaces==='function') syncRelationSurfaces();
  };

  window.parseStory = function(text,targetTextId,targetOptId,type){
    const narr=$('#'+targetTextId), opt=$('#'+targetOptId); if(!narr||!opt) return;
    const parts=splitLatestOptionsStrict(text||'');
    narr.innerHTML='';
    parts.scene.split(/\n+/).filter(Boolean).forEach(line=>renderOneLine(narr,line));
    if(parts.options.length){
      opt.innerHTML=`<div class="story-options">${parts.options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${html(o)}">${String.fromCharCode(65+i)}. ${html(o)}</button>`).join('')}</div>`;
    }else{
      opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    }
    narr.scrollTop=narr.scrollHeight;
    if(typeof syncRelationSurfaces==='function') syncRelationSurfaces();
  };

  // Hard month lock: all new prompts must use the current global month only.
  const prevContextPromptV1165 = window.contextPrompt || (typeof contextPrompt==='function' ? contextPrompt : null);
  if(prevContextPromptV1165){
    window.contextPrompt = function(type, step, label, charId){
      return prevContextPromptV1165.apply(this, arguments) + `\n【当前月份不可逆锁v1.16.5】当前月份是${monthText()}。旧月份的所有对话只能作为历史记录被提及，绝不能回到旧月份、绝不能重演旧锚点。所有新生成的旁白、角色台词、选项、好感、扣分、信件、夜游、羁绊和养成都必须发生在${monthText()}。如果玩家要求回到上个月，只能让角色以“那已经过去了/只能回忆”的方式回应。`;
    };
    try{ contextPrompt = window.contextPrompt; }catch(e){}
  }

  function setHouse(newHouse, reason=''){
    if(!HOUSE_NAMES.includes(newHouse)) return;
    const manual = /玩家|手动|属性界面/.test(String(reason||''));
    if(state.houseManualLocked && !manual && state.house && state.house !== '未知' && state.house !== newHouse){
      toast(`学院已由玩家锁定为：${state.house}`);
      return;
    }
    if(state.house === newHouse){
      if(manual){ state.houseManualLocked = true; state.houseSource = 'player'; save(); }
      return;
    }
    state.house = newHouse;
    if(manual){ state.houseManualLocked = true; state.houseSource = 'player'; }
    addMemory('house_'+newHouse);
    toast(`学院已更改为：${newHouse}${reason ? '（'+reason+'）' : ''}`);
    save();
    try{ renderGame(); }catch(e){}
  }
  window.setPlayerHouse = setHouse;

  function detectHouseText(text){
    const s=String(text||'');
    return HOUSE_NAMES.find(h=>s.includes(h));
  }

  const prevResolveMainChoiceV1165 = window.resolveMainChoice;
  window.resolveMainChoice = async function(idx, customText){
    if(state?.ended){ toast('这个存档已经进入结局，无法继续。'); go('screen-cover'); return; }
    const beforeKey=nowKey();
    await prevResolveMainChoiceV1165.apply(this, arguments);
    // Do not allow any choice to mutate month backwards. If some old branch tries, restore current key.
    const [by,bm]=beforeKey.split('-').map(Number);
    const currentIndex=(state.time.year*12+state.time.month), beforeIndex=(by*12+bm);
    if(currentIndex < beforeIndex){ state.time.year=by; state.time.month=bm; save(); }
    const tid=typeof threadIdFor==='function' ? threadIdFor('main','global') : 'main_global_persistent_thread';
    const th=state?.storyThreads?.[tid];
    const latest=(th?.blocks||[]).slice(-2).map(b=>`${b.player||''}\n${b.ai||''}`).join('\n');
    const house=detectHouseText(latest);
    if(house && isAfterSortingOpen()) setHouse(house, '玩家分院选择');
  };
  try{ resolveMainChoice = window.resolveMainChoice; }catch(e){}

  // Profile house edit button after September 1991.
  const prevRenderProfileV1165 = window.renderProfile || (typeof renderProfile==='function' ? renderProfile : null);
  window.renderProfile = function(){
    if(typeof prevRenderProfileV1165==='function') prevRenderProfileV1165.apply(this, arguments);
    const container=$('#profileContent'); if(!container || !isAfterSortingOpen()) return;
    const firstCard=container.querySelector('.game-card'); if(!firstCard || firstCard.querySelector('#changeHouseBtn')) return;
    firstCard.insertAdjacentHTML('beforeend',`<button class="btn secondary" id="changeHouseBtn">修改学院</button>`);
    $('#changeHouseBtn').onclick=()=>{
      const h=prompt('请输入学院：格兰芬多 / 斯莱特林 / 拉文克劳 / 赫奇帕奇', state.house||'未知');
      if(!h) return;
      const match=HOUSE_NAMES.find(x=>h.includes(x));
      if(!match){ toast('没有识别到有效学院。'); return; }
      setHouse(match,'玩家手动修改');
    };
  };
  try{ renderProfile = window.renderProfile; }catch(e){}

  // Bond bug fix: lock active invited character; click options must use the locked id, not the select's new value.
  const prevStartBondEventV1165 = window.startBondEvent || (typeof startBondEvent==='function' ? startBondEvent : null);
  window.startBondEvent = async function(){
    const id=$('#bondInviteSelect')?.value || state.activeBondEventId || '';
    state.activeBondEventId = id;
    save();
    return await prevStartBondEventV1165.apply(this, arguments);
  };
  try{ startBondEvent = window.startBondEvent; }catch(e){}

  const prevHandleBondActionV1165 = window.handleBondAction || (typeof handleBondAction==='function' ? handleBondAction : null);
  window.handleBondAction = async function(id, action){
    const fixedId = state.activeBondEventId || id;
    return await prevHandleBondActionV1165.call(this, fixedId, action);
  };
  try{ handleBondAction = window.handleBondAction; }catch(e){}

  document.addEventListener('click', function(e){
    const bc=e.target.closest('[data-bond-choice]');
    if(!bc) return;
    if(!state?.activeBondEventId) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.handleBondAction(state.activeBondEventId, bc.dataset.choiceText || bc.textContent || '继续');
  }, true);

  // Longer night exploration. Uses the same UI and rules, only extends node count.
  window.startNight = function(){
    if(state?.ended){ toast('这个存档已经进入结局，无法继续。'); go('screen-cover'); return; }
    if(state.monthly.nightUsed){toast('本月已经夜游过一次。');return;}
    const loc=$('#nightLocationList .selected')?.dataset.nightLocation||NIGHT_LOCATIONS[0];
    state.monthly.nightUsed=true;
    state.activeNightLocation=loc;
    $('#nightSetup')?.classList.add('hidden');
    const box=$('#nightExploreBox');
    box.classList.remove('hidden');
    box.className='story-shell';
    box.innerHTML='<div id="nightNarrative" class="story-narrative"></div><div id="nightOptions" class="story-choice-zone"></div><div class="story-input-zone"><input id="nightFreeInput" class="story-input" placeholder="你还会怎么做呢？"><button id="nightActionBtn" class="action-jelly">行动</button></div>';
    const tid=threadIdFor('night',loc);
    const th=ensureThread(tid,`【旁白】夜色压在${loc}附近，城堡白天的热闹被门缝后的风声取代。你知道今晚费尔奇可能在某些地方巡逻得更勤。\n【选项】\nA. 先观察周围\nB. 放轻脚步继续前进\nC. 如果太危险就撤退`);
    th.turns=th.turns||0;
    renderThreadToUI(th,'nightNarrative','nightOptions','night');
    const act=async(v)=>{
      if(state?.ended) return;
      th.turns++;
      $('#nightOptions').innerHTML='';
      th.blocks.push({player:v,ai:''});
      renderThreadToUI(th,'nightNarrative','nightOptions','night');
      if(typeof showThinking==='function') showThinking('nightNarrative');
      const caught=loc===nightDanger&&Math.random()<.18;
      if(caught){ addStress(30); state.housePoints-=10; }
      else addStress(3);
      const shouldEnd = th.turns>=7 || /回去|撤退|结束|太晚|返回/.test(String(v));
      const fallback=caught
        ? `【旁白】你刚做出“${v}”的决定，洛丽丝夫人的眼睛就在黑暗里亮起。费尔奇的脚步声随即逼近，你不得不把呼吸放得很轻。\n【选项】\nA. 赶紧藏起来\nB. 低声念一个转移注意的咒语\nC. 现在似乎太晚了，先回去`
        : `【旁白】你选择${v}。夜色没有马上吞掉你的声音，反而把每一点细节都放大了：石墙、脚步、远处摇晃的火光。\n【选项】\nA. 调查墙边痕迹\nB. 继续向前\nC. 现在似乎太晚了，先回去`;
      const ai=await callAI([{role:'system',content:contextPrompt('night','night_explore',loc)},{role:'user',content:`夜游地点：${loc}\n当前节点：${th.turns}/7\n历史：${compileThread(th).slice(-5000)}\n玩家行动：${v}\n请按探索节点回应，夜游应较长，不要过早结束。`}],fallback);
      if(typeof clearThinking==='function') clearThinking();
      th.blocks[th.blocks.length-1].ai= shouldEnd ? (splitLatestOptionsStrict(ai).scene + '\n【旁白】—— 金色分割线划过羊皮纸，今晚的夜游暂时结束。\n【选项】\nA. 返回主页') : ai;
      save();
      renderThreadToUI(th,'nightNarrative','nightOptions','night');
    };
    window.__activeNightAction = act;
    $('#nightActionBtn').onclick=()=>{ const v=$('#nightFreeInput').value.trim(); if(v) act(v); $('#nightFreeInput').value=''; };
  };
  try{ startNight = window.startNight; }catch(e){}

  document.addEventListener('click',function(e){
    const nc=e.target.closest('[data-night-choice]');
    if(!nc || !window.__activeNightAction) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.__activeNightAction(nc.dataset.choiceText || nc.textContent || '继续');
  }, true);

  // Ended save cannot continue; return to cover after viewing ending. Also load guard.
  const prevGoV1165 = window.go || (typeof go==='function' ? go : null);
  window.go = function(id){
    if(state?.ended && GAME_SCREEN_RE.test(String(id||'')) && id!=='screen-ending'){
      toast('这个存档已经进入结局，无法继续。');
      return prevGoV1165 ? prevGoV1165('screen-cover') : undefined;
    }
    return prevGoV1165 ? prevGoV1165(id) : undefined;
  };
  try{ go = window.go; }catch(e){}

  const prevOpenSaveLoadV1165 = window.openSaveLoad || (typeof openSaveLoad==='function' ? openSaveLoad : null);
  window.openSaveLoad = function(isSave){
    let slots=JSON.parse(localStorage.getItem(SAVE_KEY)||'[null,null,null,null]');
    const draw=()=>{
      $('#saveDialogContent').innerHTML=`<div class="paper"><h3>${isSave?'存档':'读档'}</h3><div class="save-grid">${slots.map((s,i)=>`<div class="save-slot"><b>存档位 ${i+1}</b><p>${s?`${s.realTime}<br>游戏时间：${s.state.time.year}年${s.state.time.month}月<br>${s.state.player?.name||'新生'}${s.state.ended?'<br>已达成结局：不可继续':''}`:'空存档位'}</p><button class="btn secondary" data-slot="${i}">${isSave?'保存到此处':'读取此存档'}</button></div>`).join('')}</div></div>`;
      $$('[data-slot]',$('#saveDialog')).forEach(b=>b.onclick=()=>{
        const i=+b.dataset.slot;
        if(isSave){
          slots[i]={realTime:new Date().toLocaleString(),state:JSON.parse(JSON.stringify(state))};
          localStorage.setItem(SAVE_KEY,JSON.stringify(slots)); toast('存档完成'); draw();
        }else{
          if(!slots[i]){toast('这里还没有存档哦。');return;}
          if(slots[i].state?.ended){ toast('这个存档已经进入结局，无法继续。'); return; }
          state=slots[i].state; migrateState(); save(); $('#saveDialog').close(); go('screen-game-home'); renderGame();
        }
      });
    };
    draw(); $('#saveDialog').showModal();
  };
  try{ openSaveLoad = window.openSaveLoad; }catch(e){}

  // If ending page exists, back button always returns cover and keeps save ended.
  setTimeout(()=>{
    const btn=$('#endingBackCover');
    if(btn) btn.onclick=()=>{ save(); go('screen-cover'); };
  },0);
})();

/* ===== v1.16.6 Ending Memoir + House Change Repair Patch =====
   Fixes only:
   1) ending page can always return to cover;
   2) endings are persistently collected and memoir renders them;
   3) house change UI works with buttons after Sept 1991.
*/
(function(){
  if(window.__v1166EndingHouseRepairPatch) return;
  window.__v1166EndingHouseRepairPatch = true;

  const HOUSE_NAMES_V1166 = ['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'];
  const ENDING_STORE_V1166 = 'hp_rpg_unlocked_endings';

  function safeParseJSON(raw, fallback){ try{ return JSON.parse(raw); }catch(e){ return fallback; } }
  function endingKey(e){ return [e?.id||'unknown', e?.player||'新生', e?.time?.year||'', e?.time?.month||'', e?.realTime||''].join('|'); }

  function getMemoirEndings(){
    return safeParseJSON(localStorage.getItem(ENDING_STORE_V1166)||'[]', []);
  }
  function putMemoirEnding(record){
    if(!record) return;
    const all = getMemoirEndings();
    const k = endingKey(record);
    if(!all.some(x=>endingKey(x)===k)) all.push(record);
    localStorage.setItem(ENDING_STORE_V1166, JSON.stringify(all));
    try{
      state.unlockedEndings = state.unlockedEndings || [];
      if(!state.unlockedEndings.some(x=>endingKey(x)===k)) state.unlockedEndings.push(record);
      save();
    }catch(e){}
  }

  // Delegated cover return: even if the ending page was created after boot, this always works.
  document.addEventListener('click', function(e){
    const btn = e.target.closest('#endingBackCover, [data-ending-back-cover]');
    if(!btn) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    try{
      if(state?.currentEnding) putMemoirEnding(state.currentEnding);
      save();
    }catch(err){}
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    const cover = document.getElementById('screen-cover');
    if(cover) cover.classList.add('active');
  }, true);

  // Watch ending screen activation and persist the current ending if a previous patch forgot.
  const prevGoV1166 = window.go || (typeof go==='function' ? go : null);
  window.go = function(id){
    const result = prevGoV1166 ? prevGoV1166.apply(this, arguments) : undefined;
    if(id === 'screen-ending'){
      try{ if(state?.currentEnding) putMemoirEnding(state.currentEnding); }catch(e){}
    }
    if(id === 'screen-memoir'){
      setTimeout(()=>{ try{ window.renderMemoir && window.renderMemoir(); }catch(e){} }, 0);
    }
    return result;
  };
  try{ go = window.go; }catch(e){}

  // Strong memoir renderer. Does not depend on earlier empty-card logic.
  window.renderMemoir = function(){
    const screen = document.getElementById('screen-memoir');
    if(!screen) return;
    let body = screen.querySelector('#memoirContent');
    if(!body){
      const oldEmpty = screen.querySelector('.empty-card');
      if(oldEmpty){
        oldEmpty.id = 'memoirContent';
        body = oldEmpty;
      }else{
        body = document.createElement('div');
        body.id = 'memoirContent';
        body.className = 'scroll-area';
        screen.appendChild(body);
      }
    }
    const all = getMemoirEndings();
    if(!all.length){
      body.className = 'empty-card';
      body.innerHTML = '<div class="empty-icon">✉</div><p>抱歉，这里暂时什么也没有哦~</p>';
      return;
    }
    body.className = 'scroll-area';
    body.innerHTML = `<h2 class="section-title">结局回忆</h2><div class="profile-grid">${all.slice().reverse().map(e=>`
      <div class="game-card memoir-ending-card">
        <h3>${escapeHtml(e.name || '未知结局')}</h3>
        <p class="small">${escapeHtml(e.player || '新生')} · ${e.time?.year || '????'}年${e.time?.month || '?'}月</p>
        <p>${escapeHtml(e.text || '这段故事已经被记录。')}</p>
      </div>`).join('')}</div>`;
  };
  try{ renderMemoir = window.renderMemoir; }catch(e){}

  function isAfterSept1991(){
    const y = state?.time?.year || 1991;
    const m = state?.time?.month || 8;
    return y > 1991 || (y === 1991 && m >= 9);
  }
  function setHouseHard(house, reason){
    if(!HOUSE_NAMES_V1166.includes(house)) return;
    state.house = house;
    state.housePoints = Number(state.housePoints || 0);
    try{ addMemory && addMemory('house_'+house); }catch(e){}
    try{ toast && toast(`学院已更改为：${house}${reason ? '（'+reason+'）' : ''}`); }catch(e){}
    save();
    try{ renderGame(); }catch(e){}
    try{ window.renderProfile && window.renderProfile(); }catch(e){}
  }
  window.setPlayerHouse = setHouseHard;

  function injectHouseButtons(){
    if(!isAfterSept1991()) return;
    const container = document.getElementById('profileContent');
    if(!container) return;
    const firstCard = container.querySelector('.game-card');
    if(!firstCard || firstCard.querySelector('#houseChoiceButtonsV1166')) return;
    const wrap = document.createElement('div');
    wrap.id = 'houseChoiceButtonsV1166';
    wrap.className = 'house-choice-buttons';
    wrap.innerHTML = `<p class="small">修改学院会影响主线、羁绊、夜游扣分、信件和学院相关叙事。</p>
      <div class="mini-choice-grid">${HOUSE_NAMES_V1166.map(h=>`<button class="btn secondary" data-house-v1166="${h}">${h}</button>`).join('')}</div>`;
    firstCard.appendChild(wrap);
  }

  const prevRenderProfileV1166 = window.renderProfile || (typeof renderProfile==='function' ? renderProfile : null);
  window.renderProfile = function(){
    if(typeof prevRenderProfileV1166 === 'function') prevRenderProfileV1166.apply(this, arguments);
    injectHouseButtons();
  };
  try{ renderProfile = window.renderProfile; }catch(e){}

  document.addEventListener('click', function(e){
    const b = e.target.closest('[data-house-v1166]');
    if(!b) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    setHouseHard(b.dataset.houseV1166, '玩家手动修改');
  }, true);

  // Add tiny style for house buttons, safely theme-aware.
  if(!document.getElementById('v1166RepairStyles')){
    const style=document.createElement('style');
    style.id='v1166RepairStyles';
    style.textContent=`.mini-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:8px}.house-choice-buttons{margin-top:12px;padding-top:10px;border-top:1px solid var(--border)}`;
    document.head.appendChild(style);
  }
})();

/* ===== v1.16.7 Current Month Opening + Ending Button Patch =====
   Only fixes:
   1) after a month advances, every new mainline choice belongs to the new month;
   2) the month opening format is “X月到了……” with four current-month choices;
   3) option text is only rendered in the option zone and disappears after selection;
   4) ending page always has a visible Return to Cover button.
*/
(function(){
  if(window.__v1167CurrentMonthOpeningPatch) return;
  window.__v1167CurrentMonthOpeningPatch = true;

  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function esc(s){
    if(typeof escapeHtml === 'function') return escapeHtml(String(s ?? ''));
    return String(s ?? '').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  }
  function monthKey(){ return `${state?.time?.year || 1991}-${state?.time?.month || 8}`; }
  function monthLabel(){ return `${state?.time?.year || 1991}年${state?.time?.month || 8}月`; }
  function monthNumberText(){ return `${state?.time?.month || 8}月到了`; }

  function monthOptions(){
    const y=state?.time?.year||1991, m=state?.time?.month||8;
    const map = {
      '1991-9':['去国王十字车站','和父母告别','再检查一遍行李','在路上回想对角巷'],
      '1991-10':['去上魔药课','去上草药课','去礼堂用早餐','在走廊观察同学'],
      '1991-11':['参加万圣节晚宴','注意赫敏的情绪','和朋友聊聊最近的传闻','先去礼堂看看'],
      '1991-12':['看看圣诞装饰','检查收到的礼物','去礼堂参加晚宴','在城堡里散步'],
      '1992-1':['去图书馆查资料','询问赫敏尼可·勒梅的事','留意斯内普的举动','先完成本月课程'],
      '1992-2':['去看魁地奇训练','和同学讨论比赛','去礼堂听传闻','观察奥利弗伍德'],
      '1992-3':['打听禁林传闻','留意海格的神情','去上黑魔法防御术','先整理最近的线索'],
      '1992-4':['开始期末复习','去上魔咒课','向赫敏借复习建议','安排一次休息'],
      '1992-5':['继续调查魔法石','找哈利谈谈','去找教授报告疑点','独自整理全部线索'],
      '1992-6':['参加期末考试','等待学院杯结果','和朋友告别','收拾行李准备暑假']
    };
    return map[`${y}-${m}`] || ['观察这个月的变化','去礼堂看看','整理自己目前的计划','继续当前主线'];
  }

  function monthOpening(){
    const y=state?.time?.year||1991, m=state?.time?.month||8;
    const map = {
      '1991-9':'暑假的尾声被猫头鹰、行李箱和车票的声音推着往前走。霍格沃茨的新学年近在眼前，国王十字车站、九又四分之三站台，以及你将遇见的第一批同学，都在等待你真正踏入巫师世界。',
      '1991-10':'开学最初的混乱慢慢沉淀下来。十月的城堡开始变冷，课程、楼梯、画像和不同学院的目光，逐渐织成你每天都要面对的生活。',
      '1991-11':'万圣节的南瓜香气开始出现在礼堂，城堡却并不只有节日的热闹。某些危险正悄悄靠近一年级新生的生活，而你已经无法把它当作普通传闻。',
      '1991-12':'雪意落在窗边，霍格沃茨被圣诞装饰点亮。热闹背后，你也第一次开始认真思考，自己真正渴望看见的究竟是什么。',
      '1992-1':'新年后的城堡恢复了课程与作业的节奏。那些曾经只像传闻一样的线索，开始在图书馆、走廊和低声交谈里露出形状。',
      '1992-2':'魁地奇的欢呼声重新点燃了学院竞争。看台、训练场和课后的议论，让霍格沃茨的日常多了几分明亮又紧张的色彩。',
      '1992-3':'三月的禁林边缘仍带着寒意。传闻、脚印和夜色中的影子，让你很难相信城堡外的一切都只是普通危险。',
      '1992-4':'考试的压力逐渐压近，书本和羊皮纸堆满桌面。可越是临近期末，越有些线索不合时宜地浮现。',
      '1992-5':'五月的霍格沃茨表面平静，暗处却像被什么拉紧。关于魔法石的怀疑终于走向不得不面对的时刻。',
      '1992-6':'一年级即将结束。考试、学院杯、告别和暑假的来临，把这一年的所有选择都慢慢收束起来。'
    };
    return map[`${y}-${m}`] || '新的月份翻开了。之前发生的一切仍然留在羊皮纸上，而新的故事正在等待你继续书写。';
  }

  function standardMonthIntroBlock(){
    const opts = monthOptions();
    return `【旁白】—— 金色分割线 · ${monthLabel()} ——\n【旁白】${monthNumberText()}。${monthOpening()}\n【选项】\n${opts.map((o,i)=>`${String.fromCharCode(65+i)}. ${o}`).join('\n')}`;
  }

  function stripSceneAndOptions(raw){
    const s=String(raw||'');
    const idx=s.lastIndexOf('【选项】');
    let scene = idx>=0 ? s.slice(0,idx) : s;
    const opt = idx>=0 ? s.slice(idx+'【选项】'.length) : '';
    // remove any option-looking lines that AI accidentally put into narration
    scene = scene.split(/\n+/).filter(line=>{
      const x=line.trim();
      if(!x) return true;
      if(/^【?选项】?/.test(x)) return false;
      if(/^[A-D][\.、]\s*/.test(x)) return false;
      return true;
    }).join('\n');
    const options = opt.split(/\n+/).map(x=>x.replace(/^[A-D][\.、]\s*/,'').trim()).filter(Boolean).slice(0,4);
    return {scene:scene.trim(), options};
  }

  function renderV1167Line(narr,line){
    let clean=String(line||'').replace(/^【旁白】/,'').trim();
    if(!clean) return;
    if(/^【?选项】?/.test(clean) || /^[A-D][\.、]\s*/.test(clean)) return;
    if(typeof markRoleMentioned==='function') markRoleMentioned(clean);
    if(clean.startsWith('你：')){
      narr.insertAdjacentHTML('beforeend',`<div class="player-action-line">${esc(clean.replace(/^你：/,''))}</div>`);
      return;
    }
    const match=clean.match(/^([^：:]{1,18})[：:](.+)$/);
    if(match){
      const name=match[1].trim(), body=match[2].trim();
      if(/韦斯莱双子|双子|弗雷德和乔治|乔治和弗雷德/.test(name)){
        try{ meet('fred'); meet('george'); }catch(e){}
        narr.insertAdjacentHTML('beforeend',`<div class="dialog-line twins-line">${typeof charAvatar==='function'?charAvatar('fred'):''}${typeof charAvatar==='function'?charAvatar('george'):''}<div class="speech-bubble"><b>弗雷德与乔治</b>${esc(body)}</div></div>`);
        return;
      }
      const id=typeof roleIdFromSpeakerName==='function' ? roleIdFromSpeakerName(name) : null;
      if(id && state?.relations?.[id]){
        try{ meet(id); }catch(e){}
        narr.insertAdjacentHTML('beforeend',`<div class="dialog-line">${typeof charAvatar==='function'?charAvatar(id):''}<div class="speech-bubble"><b>${esc(state.relations[id].name)}</b>${esc(body)}</div></div>`);
        return;
      }
    }
    const cls=/金色分割线|——|═/.test(clean) ? 'narrator-line gold-divider-line' : 'narrator-line';
    narr.insertAdjacentHTML('beforeend',`<div class="${cls}">${esc(clean)}</div>`);
  }

  window.renderThreadToUI = function(thread,textId,optId,type){
    const narr=qs('#'+textId), opt=qs('#'+optId); if(!narr||!opt||!thread) return;
    narr.innerHTML='';
    const blocks=thread.blocks||[];
    blocks.forEach(b=>{
      if(b.player) renderV1167Line(narr,'你：'+b.player);
      stripSceneAndOptions(b.ai||'').scene.split(/\n+/).filter(Boolean).forEach(line=>renderV1167Line(narr,line));
    });
    const lastAi=blocks.length ? (blocks[blocks.length-1].ai||'') : '';
    const options=stripSceneAndOptions(lastAi).options;
    if(options.length){
      opt.innerHTML=`<div class="story-options">${options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${esc(o)}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>`;
    }else{
      opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    }
    narr.scrollTop=narr.scrollHeight;
    try{ syncRelationSurfaces(); }catch(e){}
  };

  window.parseStory = function(text,targetTextId,targetOptId,type){
    const narr=qs('#'+targetTextId), opt=qs('#'+targetOptId); if(!narr||!opt)return;
    const parts=stripSceneAndOptions(text||'');
    narr.innerHTML='';
    parts.scene.split(/\n+/).filter(Boolean).forEach(line=>renderV1167Line(narr,line));
    if(parts.options.length){
      opt.innerHTML=`<div class="story-options">${parts.options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${esc(o)}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>`;
    }else{
      opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    }
    narr.scrollTop=narr.scrollHeight;
    try{ syncRelationSurfaces(); }catch(e){}
  };

  function ensureStandardCurrentMonthIntro(th){
    if(!state || !state.time || !th) return;
    const key=monthKey();
    if(key==='1991-8') return;
    state.eventFlags = state.eventFlags || {};
    const flag=`main_standard_month_intro_v1167_${key}`;
    if(state.eventFlags[flag]) return;
    th.blocks = th.blocks || [];
    th.blocks.push({ai:standardMonthIntroBlock()});
    state.eventFlags[flag]=true;
    // mark older intro flags too, so previous month-intro patches will not insert another old-style intro
    state.eventFlags[`main_month_intro_${key}`]=true;
    save();
  }

  window.renderMainline = async function(){
    const tid = typeof threadIdFor === 'function' ? threadIdFor('main','global') : 'main_global_persistent_thread';
    const info = typeof currentMainStep === 'function' ? currentMainStep() : null;
    let initial='【旁白】当前月份主线暂未制作。';
    if(info && info.step) initial = (typeof fallbackStory==='function' ? fallbackStory(info.step) : '【旁白】新的主线正在展开。\n【选项】\nA. 继续观察');
    const th = ensureThread(tid, initial);
    ensureStandardCurrentMonthIntro(th);
    renderThreadToUI(th,'mainlineText','mainlineOptions','main');
  };
  try{ renderMainline = window.renderMainline; }catch(e){}

  // make sure all future prompts know that the current month is authoritative and irreversible
  const prevContext = window.contextPrompt || (typeof contextPrompt==='function' ? contextPrompt : null);
  if(prevContext && !window.__v1167ContextLockApplied){
    window.__v1167ContextLockApplied = true;
    window.contextPrompt = function(type, step, label, charId){
      return prevContext.apply(this, arguments) + `\n【月份不可逆硬规则v1.16.7】当前游戏时间是${monthLabel()}，所有新旁白、新角色台词、新选项、新状态变化都必须发生在${monthLabel()}。旧月份内容只能作为回忆或已发生记录被提及，禁止回到旧月份，禁止重演旧月份锚点。选项只能出现在最后的【选项】区，严禁把A/B/C/D写入叙事区。`;
    };
    try{ contextPrompt = window.contextPrompt; }catch(e){}
  }

  // Ending page: ensure a visible return button exists and works, even if an older patch created the page.
  document.addEventListener('click', function(e){
    const btn=e.target.closest('#endingBackCover, [data-ending-back-cover]');
    if(!btn) return;
    e.preventDefault(); e.stopImmediatePropagation();
    try{ save(); }catch(err){}
    qsa('.screen').forEach(s=>s.classList.remove('active'));
    const cover=qs('#screen-cover'); if(cover) cover.classList.add('active');
  }, true);
  const prevGo = window.go || (typeof go==='function' ? go : null);
  if(prevGo && !window.__v1167GoPatch){
    window.__v1167GoPatch = true;
    window.go = function(id){
      const result=prevGo.apply(this, arguments);
      if(id==='screen-ending'){
        setTimeout(()=>{
          const card=qs('#screen-ending .ending-card') || qs('#screen-ending');
          if(card && !qs('#endingBackCover')){
            card.insertAdjacentHTML('beforeend','<button class="btn primary full" id="endingBackCover" data-ending-back-cover="1">返回封面</button>');
          }
        },0);
      }
      return result;
    };
    try{ go = window.go; }catch(e){}
  }
})();

/* ===== v1.16.8 night avatar + new life button fix =====
   Minimal patch based on v1.16.7. Only changes:
   1) Night partner list shows romanceable character avatars.
   2) Ending page button text becomes “开启新的魔法人生” and starts character creation.
*/
(function(){
  function romanceVisibleMetCharacters(){
    if(!state || !state.relations) return [];
    const ids = (typeof ROMANCE_ROLE_IDS !== 'undefined' && Array.isArray(ROMANCE_ROLE_IDS)) ? ROMANCE_ROLE_IDS : Object.keys(state.relations);
    return ids.map(id=>state.relations[id]).filter(r=>r && r.visible && r.met);
  }

  const previousRenderNightSetupV1168 = window.renderNightSetup || (typeof renderNightSetup === 'function' ? renderNightSetup : null);
  window.renderNightSetup = function(){
    if(typeof isSummerMonth === 'function' && isSummerMonth()){
      if(previousRenderNightSetupV1168) previousRenderNightSetupV1168.apply(this, arguments);
      return;
    }
    const p = document.querySelector('#nightPartnerList');
    const l = document.querySelector('#nightLocationList');
    if(!p || !l){
      if(previousRenderNightSetupV1168) previousRenderNightSetupV1168.apply(this, arguments);
      return;
    }
    const arr = romanceVisibleMetCharacters();
    p.innerHTML = arr.length ? arr.map(r=>{
      const avatar = (typeof charAvatar === 'function') ? charAvatar(r.id) : `<div class="char-avatar">${(r.name||'?').slice(0,1)}</div>`;
      return `<label class="night-partner-row"><input type="checkbox" value="${r.id}"><span class="night-partner-avatar">${avatar}</span><span>${r.name}</span></label>`;
    }).join('') : '<p class="hint small">暂无可邀请伙伴。</p>';
    if(typeof NIGHT_LOCATIONS !== 'undefined'){
      if(!nightDanger) nightDanger = NIGHT_LOCATIONS[Math.floor(Math.random()*NIGHT_LOCATIONS.length)];
      l.innerHTML = NIGHT_LOCATIONS.map(x=>`<button class="choice ${x===nightDanger?'danger':''}" data-night-location="${x}">${x}${x===nightDanger?' · 高危':''}</button>`).join('');
    }
  };
  try{ renderNightSetup = window.renderNightSetup; }catch(e){}

  // Make night avatar rows readable without touching existing theme logic.
  if(!document.getElementById('night-avatar-v1168-style')){
    const style=document.createElement('style');
    style.id='night-avatar-v1168-style';
    style.textContent=`
      .night-partner-row{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--border);border-radius:14px;background:var(--panel);color:var(--text);margin:6px 0;}
      .night-partner-row input{accent-color:var(--primary);}
      .night-partner-avatar .char-avatar,.night-partner-row .char-avatar{width:30px;height:30px;font-size:13px;flex:0 0 auto;}
      .night-partner-avatar img,.night-partner-row .char-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
    `;
    document.head.appendChild(style);
  }

  function activateNewLifeButton(){
    const btn = document.querySelector('#endingBackCover');
    if(!btn) return;
    btn.textContent = '开启新的魔法人生';
    btn.onclick = function(ev){
      if(ev){ ev.preventDefault(); ev.stopPropagation(); }
      if(typeof startBrandNewGame === 'function') startBrandNewGame();
      else if(typeof go === 'function') go('screen-basic');
    };
  }

  const previousRenderEndingPageV1168 = window.renderEndingPage || (typeof renderEndingPage === 'function' ? renderEndingPage : null);
  window.renderEndingPage = function(record){
    const result = previousRenderEndingPageV1168 ? previousRenderEndingPageV1168.apply(this, arguments) : undefined;
    activateNewLifeButton();
    return result;
  };
  try{ renderEndingPage = window.renderEndingPage; }catch(e){}

  document.addEventListener('click', function(ev){
    const btn = ev.target && ev.target.closest ? ev.target.closest('#endingBackCover') : null;
    if(!btn) return;
    ev.preventDefault();
    ev.stopPropagation();
    if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
    if(typeof startBrandNewGame === 'function') startBrandNewGame();
    else if(typeof go === 'function') go('screen-basic');
  }, true);

  setTimeout(activateNewLifeButton, 300);
})();

/* ===== v1.16.9 house/save/rewind/inventory critical patch =====
   Based on v1.16.8. Adds only requested fixes:
   1) Player house choice is authoritative and persists everywhere.
   2) Save/load works robustly and each slot has a delete button.
   3) Main/bond/night narrative areas get one-step rewind; rollback removes last gains/items.
   4) Items mentioned as gifts/rewards in main/bond/night are added to inventory.
   5) Options are kept out of narrative even if AI writes A/B/C/D in the wrong place.
*/
(function(){
  const HOUSE_LIST = ['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'];
  const $v = (s,root=document)=>root.querySelector(s);
  const $$v = (s,root=document)=>Array.from(root.querySelectorAll(s));
  const cloneState = ()=>JSON.parse(JSON.stringify(state||{}));
  const monthText = ()=> state?.time ? `${state.time.year}年${state.time.month}月` : '';

  function sanitizeHouse(input){
    const t=String(input||'');
    return HOUSE_LIST.find(h=>t.includes(h)) || null;
  }
  function setAuthoritativeHouse(house, reason){
    house = sanitizeHouse(house);
    if(!house || !state) return false;
    state.house = house;
    state.playerHouseLocked = true;
    state.eventFlags = state.eventFlags || {};
    state.eventFlags.player_selected_house = true;
    try{ addMemory && addMemory('player_house_'+house); }catch(e){}
    try{ toast && toast(`学院已确定为：${house}${reason?'（'+reason+'）':''}`); }catch(e){}
    try{ save && save(); }catch(e){}
    try{ renderGame && renderGame(); }catch(e){}
    return true;
  }
  window.setAuthoritativeHouse = setAuthoritativeHouse;

  // Prevent AI text from silently changing house. Only explicit player choice/manual buttons may change it.
  const prevDetectHouseText = (typeof detectHouseText==='function') ? detectHouseText : null;
  window.detectHouseText = function(txt){ return null; };
  try{ detectHouseText = window.detectHouseText; }catch(e){}

  // Sorting options: player house choices must be visible and highest priority.
  const prevMainlineOptions = (typeof mainlineOptions==='function') ? mainlineOptions : null;
  window.mainlineOptions = function(step){
    if(step==='sorting'){
      return ['选择格兰芬多','选择斯莱特林','选择拉文克劳','选择赫奇帕奇','听听分院帽的建议，但最终由我决定'];
    }
    return prevMainlineOptions ? prevMainlineOptions.apply(this, arguments) : ['继续观察','和身边的人说话','去别的地方看看吧'];
  };
  try{ mainlineOptions = window.mainlineOptions; }catch(e){}

  // AI prompt: house is locked once selected.
  const prevContextPromptV1169 = (typeof contextPrompt==='function') ? contextPrompt : null;
  if(prevContextPromptV1169){
    window.contextPrompt = function(){
      const base = prevContextPromptV1169.apply(this, arguments);
      return base + `\n【学院最高优先级规则】当前玩家学院为：${state?.house||'未知'}。如果玩家已选择学院或在属性页手动修改学院，你必须永远承认该学院；禁止AI自行把玩家分到其它学院。夜游扣分、信件、羁绊、主线称呼都必须使用这个学院。`;
    };
    try{ contextPrompt = window.contextPrompt; }catch(e){}
  }

  // Stronger options stripper: removes A/B/C/D lines from narrative no matter where AI placed them.
  window.stripSceneAndOptions = function(text){
    const lines=String(text||'').split(/\n+/);
    const scene=[]; const options=[]; let inOptions=false;
    for(const raw of lines){
      let line=raw.trim(); if(!line) continue;
      if(/^【\s*选项\s*】/.test(line)){ inOptions=true; continue; }
      const m=line.match(/^([A-D])\s*[\.、．:]\s*(.+)$/i);
      if(m){ options.push(m[2].trim()); continue; }
      if(inOptions){
        // If AI writes bare option lines after 【选项】 without A/B prefix, treat short imperative lines as options.
        if(line.length<=38 && !/^【/.test(line)){ options.push(line.replace(/^[-•]\s*/,'')); continue; }
      }
      scene.push(line);
    }
    return {scene:scene.join('\n'), options:options.slice(0,4)};
  };
  try{ stripSceneAndOptions = window.stripSceneAndOptions; }catch(e){}

  // Make profile house buttons use authoritative house setter.
  document.addEventListener('click', function(e){
    const b=e.target.closest('[data-house-v1166], [data-house-v1169]');
    if(!b) return;
    const h=b.dataset.houseV1166 || b.dataset.houseV1169;
    if(!h) return;
    e.preventDefault(); e.stopImmediatePropagation();
    setAuthoritativeHouse(h,'玩家手动修改');
  }, true);

  // Apply sorting choice immediately and authoritatively.
  const prevApplyMainStepEffects = (typeof applyMainStepEffects==='function') ? applyMainStepEffects : null;
  window.applyMainStepEffects = function(step, idx, action){
    if(step==='sorting'){
      const chosen = sanitizeHouse(action) || HOUSE_LIST[idx] || null;
      if(chosen) setAuthoritativeHouse(chosen,'分院选择');
      // Do not allow older effects to override with a different house.
      try{ addMemory && addMemory('sorting_complete'); }catch(e){}
      return;
    }
    return prevApplyMainStepEffects ? prevApplyMainStepEffects.apply(this, arguments) : undefined;
  };
  try{ applyMainStepEffects = window.applyMainStepEffects; }catch(e){}

  // Also guard after main choices in case an older handler set house by index.
  const prevResolveMainChoiceV1169 = (typeof resolveMainChoice==='function') ? resolveMainChoice : null;
  if(prevResolveMainChoiceV1169){
    window.resolveMainChoice = async function(idx, customText){
      prepareUndo('main');
      const info = (typeof currentMainStep==='function') ? currentMainStep() : null;
      const step = info?.step;
      const actionText = customText || ((typeof mainlineOptions==='function' && step) ? mainlineOptions(step)[idx] : '') || '';
      const res = await prevResolveMainChoiceV1169.apply(this, arguments);
      if(step==='sorting'){
        const h = sanitizeHouse(actionText) || HOUSE_LIST[idx] || null;
        if(h) setAuthoritativeHouse(h,'分院选择');
      }
      scanLatestDialogueForItems('main');
      return res;
    };
    try{ resolveMainChoice = window.resolveMainChoice; }catch(e){}
  }

  // Robust save/load with delete buttons.
  function getSlots(){
    try{ const a=JSON.parse(localStorage.getItem(SAVE_KEY)||'[null,null,null,null]'); return Array.from({length:4},(_,i)=>a[i]||null); }
    catch(e){ return [null,null,null,null]; }
  }
  function setSlots(slots){ localStorage.setItem(SAVE_KEY, JSON.stringify(Array.from({length:4},(_,i)=>slots[i]||null))); }
  window.openSaveLoad = function(isSave=true){
    const dlg=$v('#saveDialog'), content=$v('#saveDialogContent');
    if(!dlg || !content) return;
    const slots=getSlots();
    const html = `<div class="paper"><h3>${isSave?'存档':'读档'}</h3><div class="save-grid">${slots.map((s,i)=>{
      const label=s ? `${s.realTime}<br>游戏时间：${s.state?.time?.year||1991}年${s.state?.time?.month||8}月<br>${s.state?.player?.name||'新生'}${s.state?.ended?'<br>已达成结局：不可继续':''}` : '空存档位';
      return `<div class="save-slot"><b>存档位 ${i+1}</b><p>${label}</p><div class="slot-actions"><button class="btn secondary" data-slot-action="${isSave?'save':'load'}" data-slot-index="${i}">${isSave?'保存到此处':'读取此存档'}</button><button class="btn danger small" data-slot-action="delete" data-slot-index="${i}">删除</button></div></div>`;
    }).join('')}</div></div>`;
    content.innerHTML=html;
    $$v('[data-slot-action]',content).forEach(btn=>btn.onclick=()=>{
      const act=btn.dataset.slotAction, i=+btn.dataset.slotIndex;
      const now=getSlots();
      if(act==='save'){
        now[i]={realTime:new Date().toLocaleString(), state:cloneState()}; setSlots(now); try{ toast('存档完成'); }catch(e){} window.openSaveLoad(true); return;
      }
      if(act==='load'){
        if(!now[i]){ try{ toast('这里还没有存档哦。'); }catch(e){} return; }
        if(now[i].state?.ended){ try{ toast('这个存档已经进入结局，无法继续。'); }catch(e){} return; }
        state=now[i].state; try{ migrateState(); }catch(e){} try{ save(); }catch(e){} dlg.close(); try{ go('screen-game-home'); renderGame(); }catch(e){} return;
      }
      if(act==='delete'){
        now[i]=null; setSlots(now); try{ toast('存档已删除'); }catch(e){} window.openSaveLoad(isSave); return;
      }
    });
    try{ dlg.showModal(); }catch(e){ dlg.setAttribute('open',''); }
  };
  try{ openSaveLoad = window.openSaveLoad; }catch(e){}

  // One-step rewind system.
  function prepareUndo(type){
    if(!state) return;
    state._lastUndo = {type, snapshot: cloneState(), time: Date.now()};
    try{ save(); }catch(e){}
  }
  window.prepareDialogueUndo = prepareUndo;

  function restoreUndo(){
    const u=state?._lastUndo;
    if(!u || !u.snapshot){ try{ toast('暂无可回溯内容。'); }catch(e){} return; }
    const type=u.type;
    state = u.snapshot;
    state._lastUndo = null;
    try{ migrateState(); save(); toast('已回溯上一句。'); }catch(e){}
    try{ renderGame(); }catch(e){}
    if(type==='main'){ try{ go('screen-mainline'); renderMainline(); }catch(e){} }
    else if(type==='bond'){ try{ go('screen-bond-event'); if(state.activeBondEventId && typeof startBondEvent==='function'){ /* keep screen only; thread already restored */ } }catch(e){} }
    else if(type==='night'){ try{ go('screen-night'); }catch(e){} }
  }

  function ensureRewindButtons(){
    const map=[['screen-mainline','main'],['screen-bond-event','bond'],['screen-night','night']];
    map.forEach(([screen,type])=>{
      const root=$v('#'+screen); if(!root) return;
      const shell=root.querySelector('.story-shell'); if(!shell || shell.querySelector('.rewind-btn-v1169')) return;
      shell.style.position='relative';
      const b=document.createElement('button'); b.className='rewind-btn-v1169'; b.textContent='回溯'; b.dataset.rewindType=type;
      shell.insertAdjacentElement('afterbegin', b);
    });
  }
  document.addEventListener('click', function(e){
    const b=e.target.closest('[data-rewind-type]'); if(!b) return;
    e.preventDefault(); e.stopImmediatePropagation(); restoreUndo();
  }, true);
  const prevRenderGameV1169 = (typeof renderGame==='function') ? renderGame : null;
  if(prevRenderGameV1169){
    window.renderGame = function(){ const r=prevRenderGameV1169.apply(this,arguments); setTimeout(ensureRewindButtons,0); return r; };
    try{ renderGame = window.renderGame; }catch(e){}
  }
  setInterval(ensureRewindButtons, 1200);

  // Wrap bond action to support rewind and inventory extraction.
  const prevHandleBondActionV1169 = (typeof handleBondAction==='function') ? handleBondAction : null;
  if(prevHandleBondActionV1169){
    window.handleBondAction = async function(id, action){
      prepareUndo('bond');
      const res = await prevHandleBondActionV1169.apply(this, arguments);
      scanLatestDialogueForItems('bond');
      return res;
    };
    try{ handleBondAction = window.handleBondAction; }catch(e){}
  }

  // Capture night actions before they mutate state.
  document.addEventListener('click', function(e){
    if(e.target.closest('#nightActionBtn, [data-night-choice]')) prepareUndo('night');
  }, true);

  // Inventory extraction from latest AI dialogue.
  function addInventoryItem(name, desc){
    if(!state) return;
    name = String(name||'').replace(/[，。；：:！!？?\n\r]/g,'').trim();
    if(!name || name.length<2 || name.length>18) return;
    if(/选择|选项|旁白|继续|观察|前往|回去|行动|东西|什么/.test(name)) return;
    state.inventory = state.inventory || [];
    const existing=state.inventory.find(x=>x.name===name);
    if(existing) existing.qty=(existing.qty||1)+1;
    else state.inventory.push({id:'story_item_'+Date.now()+'_'+Math.random().toString(36).slice(2,6), name, desc:desc||'剧情中获得的物品。', type:'剧情物品', qty:1});
    try{ toast(`获得物品：${name}`); }catch(e){}
  }
  function latestAITextFor(type){
    const threads=state?.storyThreads||{};
    const keys=Object.keys(threads).filter(k=>k.includes(type));
    let latest='';
    keys.forEach(k=>{
      const blocks=threads[k]?.blocks||[];
      const ai=[...blocks].reverse().find(b=>b.ai)?.ai;
      if(ai) latest=ai;
    });
    return latest;
  }
  function scanLatestDialogueForItems(type){
    const text=latestAITextFor(type); if(!text) return;
    const patterns=[
      /(?:送给你|递给你|交给你|塞给你|递过来|交到你手里)(?:一枚|一个|一本|一封|一张|一条|一只|一瓶|一块)?([^，。；\n]{2,18})/g,
      /你(?:获得|得到|收下|拿到|捡起)(?:了一枚|了一个|了一本|了一封|了一张|了一条|了一只|了一瓶|了一块|了)?([^，。；\n]{2,18})/g
    ];
    patterns.forEach(re=>{ let m; while((m=re.exec(text))){ addInventoryItem(m[1]); } });
    try{ save(); renderInventory && renderInventory(); }catch(e){}
  }
  window.scanLatestDialogueForItems = scanLatestDialogueForItems;

  // Style rewind and delete buttons, theme-aware.
  if(!document.getElementById('v1169-style')){
    const st=document.createElement('style'); st.id='v1169-style';
    st.textContent=`.rewind-btn-v1169{position:absolute;right:10px;top:10px;z-index:5;border:1px solid var(--border);background:var(--panel);color:var(--primary);border-radius:999px;padding:5px 10px;font-size:12px;box-shadow:0 4px 12px rgba(0,0,0,.08)}.slot-actions{display:flex;gap:6px;flex-wrap:wrap}.btn.danger{border-color:#d98b8b;color:#9d3333;background:rgba(255,255,255,.55)}.btn.small{padding:6px 10px;font-size:12px}`;
    document.head.appendChild(st);
  }

  // Ensure house buttons exist after renderProfile patches.
  setInterval(function(){
    if(!$v('#screen-profile.active')) return;
    const first=$v('#profileContent .game-card');
    if(!first || $v('#houseChoiceButtonsV1169', first)) return;
    const afterSept = state?.time && (state.time.year>1991 || (state.time.year===1991 && state.time.month>=9));
    if(!afterSept) return;
    const wrap=document.createElement('div'); wrap.id='houseChoiceButtonsV1169'; wrap.className='house-choice-buttons';
    wrap.innerHTML=`<p class="small">修改学院会影响主线、羁绊、夜游扣分、信件和学院相关叙事。</p><div class="mini-choice-grid">${HOUSE_LIST.map(h=>`<button class="btn secondary" data-house-v1169="${h}">${h}</button>`).join('')}</div>`;
    first.appendChild(wrap);
  },1000);
})();


/* ===== v1.16.10 house priority + parenthetical narration patch =====
   1) Player selected house is authoritative. AI must treat current state.house as the player's real house.
   2) Text inside （） or () in player input is narration/action, not spoken dialogue.
   Only display/context rules are patched; story history and option-zone rules are preserved.
*/
(function(){
  const HOUSE_NAMES_V11610 = ['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'];
  const $one = sel => document.querySelector(sel);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const splitOpts = window.__splitSceneOptions || function(raw){
    const s=String(raw||''); const idx=s.lastIndexOf('【选项】');
    const scene=idx>=0?s.slice(0,idx):s; const opt=idx>=0?s.slice(idx+4):'';
    const options=opt.split(/\n+/).map(x=>x.replace(/^[A-D][\.、]\s*/,'').trim()).filter(Boolean).slice(0,4);
    return {scene, options};
  };

  function markHouseManualIfNeeded(){
    if(!window.state) return;
    if(state.house && state.house !== '未知' && !('houseManualLocked' in state)){
      state.houseManualLocked = false;
      state.houseSource = state.houseSource || 'story';
    }
  }

  // Stronger AI context: current house is player-authored state and cannot be overridden by narration.
  const prevContext = window.contextPrompt || (typeof contextPrompt==='function' ? contextPrompt : null);
  if(prevContext && !window.__v11610HouseContextApplied){
    window.__v11610HouseContextApplied = true;
    window.contextPrompt = function(type, step, label, charId){
      markHouseManualIfNeeded();
      const h = state?.house || '未知';
      const lock = state?.houseManualLocked ? '这是玩家手动设定/选择的学院，优先级最高。' : '如果分院尚未完成，不要擅自指定学院；如果已完成则服从当前学院。';
      return prevContext.apply(this, arguments) + `\n【学院最高优先级v1.16.10】当前玩家学院=${h}。${lock}所有新剧情、宿舍、公共休息室、学院长桌、夜游扣分、信件称呼和NPC反应都必须以“玩家是${h}学生”为准。AI绝对不能把玩家写成其他学院学生，不能让玩家回到其他学院寝室/公共休息室。若玩家提到旧学院或AI历史中出现旧学院，只能视为回忆或错误传闻，不改变当前学院。\n【玩家输入括号规则v1.16.10】玩家输入中的中文括号（……）或英文括号(...)内容是旁白/动作/心理描写，不是玩家开口说的话。角色应把括号内容当作看见的动作、场景补充或内心旁白来回应，不能当作玩家台词引用。`;
    };
    try{ contextPrompt = window.contextPrompt; }catch(e){}
  }

  // If any future code uses window.setPlayerHouse, keep manual lock semantics.
  const prevSetHouse = window.setPlayerHouse;
  window.setPlayerHouse = function(newHouse, reason='玩家手动修改'){
    if(!HOUSE_NAMES_V11610.includes(newHouse)) return;
    state.houseManualLocked = /玩家|手动|属性|分院选择/.test(String(reason||''));
    state.houseSource = state.houseManualLocked ? 'player' : (state.houseSource || 'story');
    if(typeof prevSetHouse === 'function') return prevSetHouse(newHouse, reason);
    state.house = newHouse;
    if(typeof addMemory==='function') addMemory('house_'+newHouse);
    if(typeof toast==='function') toast(`学院已更改为：${newHouse}`);
    if(typeof save==='function') save();
    try{ renderGame(); }catch(e){}
  };

  function splitPlayerNarration(text){
    const raw=String(text||'');
    const parts=[];
    let last=0; const re=/（([^）]*)）|\(([^)]*)\)/g; let m;
    while((m=re.exec(raw))){
      const before=raw.slice(last,m.index).trim();
      if(before) parts.push({type:'speech', text:before});
      const inside=(m[1]||m[2]||'').trim();
      if(inside) parts.push({type:'narration', text:inside});
      last=re.lastIndex;
    }
    const tail=raw.slice(last).trim();
    if(tail) parts.push({type:'speech', text:tail});
    if(!parts.length && raw.trim()) parts.push({type:'speech', text:raw.trim()});
    return parts;
  }
  window.splitPlayerNarration = splitPlayerNarration;

  function renderPlayerInput(narr, text){
    const parts=splitPlayerNarration(text);
    parts.forEach(p=>{
      if(p.type==='narration') narr.insertAdjacentHTML('beforeend', `<div class="narrator-line">${esc(p.text)}</div>`);
      else narr.insertAdjacentHTML('beforeend', `<div class="player-action-line">${esc(p.text)}</div>`);
    });
  }

  function roleLine(narr, clean){
    if(typeof markRoleMentioned==='function') markRoleMentioned(clean);
    const match=clean.match(/^([^：:]{1,18})[：:](.+)$/);
    if(match){
      const name=match[1].trim(), body=match[2].trim();
      if(/韦斯莱双子|双子|弗雷德和乔治|乔治和弗雷德/.test(name)){
        try{ meet('fred'); meet('george'); }catch(e){}
        narr.insertAdjacentHTML('beforeend',`<div class="dialog-line twins-line">${typeof charAvatar==='function'?charAvatar('fred'):''}${typeof charAvatar==='function'?charAvatar('george'):''}<div class="speech-bubble"><b>弗雷德与乔治</b>${esc(body)}</div></div>`);
        return true;
      }
      const id=typeof roleIdFromSpeakerName==='function' ? roleIdFromSpeakerName(name) : null;
      if(id && state?.relations?.[id]){
        try{ meet(id); }catch(e){}
        narr.insertAdjacentHTML('beforeend',`<div class="dialog-line">${typeof charAvatar==='function'?charAvatar(id):''}<div class="speech-bubble"><b>${esc(state.relations[id].name)}</b>${esc(body)}</div></div>`);
        return true;
      }
    }
    return false;
  }

  function renderPatchedLine(narr,line){
    let clean=String(line||'').replace(/^【旁白】/,'').trim();
    if(!clean) return;
    if(/^【?选项】?/.test(clean) || /^[A-D][\.、]\s*/.test(clean)) return;
    if(clean.startsWith('你：')){ renderPlayerInput(narr, clean.replace(/^你：/,'')); return; }
    if(roleLine(narr, clean)) return;
    const cls=/金色分割线|——|═/.test(clean) ? 'narrator-line gold-divider-line' : 'narrator-line';
    narr.insertAdjacentHTML('beforeend', `<div class="${cls}">${esc(clean)}</div>`);
  }

  function compilePlayerForAI(text){
    const parts=splitPlayerNarration(text);
    return parts.map(p=> p.type==='narration' ? `【旁白】${p.text}` : `【玩家说】${p.text}`).join('\n');
  }

  window.compileThread = function(th){
    return (th?.blocks||[]).map(b=>{
      const p=b.player ? compilePlayerForAI(b.player)+'\n' : '';
      const ai=splitOpts(b.ai||'').scene;
      return p+ai;
    }).join('\n').trim();
  };

  function renderThreadPatched(thread,textId,optId,type){
    const narr=$one('#'+textId), opt=$one('#'+optId); if(!narr||!opt||!thread) return;
    narr.innerHTML='';
    const blocks=thread.blocks||[];
    blocks.forEach(b=>{
      if(b.player) renderPatchedLine(narr,'你：'+b.player);
      splitOpts(b.ai||'').scene.split(/\n+/).filter(Boolean).forEach(line=>renderPatchedLine(narr,line));
    });
    const lastAi=blocks.length ? (blocks[blocks.length-1].ai||'') : '';
    const options=splitOpts(lastAi).options;
    if(options.length){
      opt.innerHTML=`<div class="story-options">${options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${esc(o)}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>`;
    }else opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    narr.scrollTop=narr.scrollHeight;
    try{ syncRelationSurfaces(); }catch(e){}
  }
  window.renderThreadToUI = renderThreadPatched;
  try{ renderThreadToUI = window.renderThreadToUI; }catch(e){}

  window.parseStory = function(text,targetTextId,targetOptId,type){
    const narr=$one('#'+targetTextId), opt=$one('#'+targetOptId); if(!narr||!opt) return;
    const parts=splitOpts(text||'');
    narr.innerHTML='';
    parts.scene.split(/\n+/).filter(Boolean).forEach(line=>renderPatchedLine(narr,line));
    if(parts.options.length){
      opt.innerHTML=`<div class="story-options">${parts.options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${esc(o)}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>`;
    }else opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    narr.scrollTop=narr.scrollHeight;
    try{ syncRelationSurfaces(); }catch(e){}
  };

  // Migrate existing active state field without changing any story data.
  try{ markHouseManualIfNeeded(); save(); }catch(e){}
})();

/* ===== v1.16.11 authoritative house + dialogue avatar bugfix =====
   Minimal patch on v1.16.10:
   1) Player-selected/manual house is the single source of truth. Story/AI cannot overwrite it.
   2) Romanceable character speech is rendered with avatar bubbles more reliably.
*/
(function(){
  const HOUSE_LIST = ['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'];
  const qs = (s, r=document)=>r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const oldSave = window.save || (typeof save === 'function' ? save : null);
  const oldRenderGame = window.renderGame || (typeof renderGame === 'function' ? renderGame : null);

  const SPEAKER_ALIASES = {
    harry:['哈利','哈利·波特','波特'],
    ron:['罗恩','罗恩·韦斯莱'],
    hermione:['赫敏','赫敏·格兰杰','格兰杰'],
    draco:['德拉科','德拉科·马尔福','马尔福'],
    blaise:['布雷斯','布雷斯·扎比尼','扎比尼'],
    theo:['西奥多','西奥多·诺特','诺特'],
    fred:['弗雷德','弗雷德·韦斯莱'],
    george:['乔治','乔治·韦斯莱'],
    percy:['珀西','珀西·韦斯莱'],
    cedric:['塞德里克','塞德里克·迪戈里','迪戈里'],
    oliver:['奥利弗','奥利弗·伍德','伍德'],
    cho:['秋','秋·张','张秋'],
    snape:['斯内普','西弗勒斯','西弗勒斯·斯内普','教授斯内普'],
    luna:['卢娜','卢娜·洛夫古德','洛夫古德'],
    ginny:['金妮','金妮·韦斯莱'],
    tom:['汤姆','汤姆·里德尔','里德尔'],
    sirius:['小天狼星','西里斯','西里斯·布莱克','小天狼星·布莱克'],
    lupin:['卢平','莱姆斯','莱姆斯·卢平'],
    krum:['克鲁姆','维克多尔·克鲁姆','维克多尔']
  };

  function normalizeHouse(h){
    const t = String(h || '');
    return HOUSE_LIST.find(x => t.includes(x)) || null;
  }

  function setLockedHouse(house, reason='玩家选择'){
    house = normalizeHouse(house);
    if(!house || !window.state) return false;
    state.house = house;
    state.houseOverride = house;
    state.houseManualLocked = true;
    state.houseSource = 'player';
    state.eventFlags = state.eventFlags || {};
    state.eventFlags.player_selected_house = true;
    if(typeof addMemory === 'function') addMemory('player_authoritative_house_'+house);
    if(typeof toast === 'function') toast(`学院已确定为：${house}`);
    if(oldSave) oldSave();
    if(oldRenderGame) oldRenderGame();
    return true;
  }

  function enforceHouseLock(){
    if(!window.state) return;
    const locked = normalizeHouse(state.houseOverride || (state.houseManualLocked ? state.house : ''));
    if(locked && state.house !== locked){
      state.house = locked;
      state.houseManualLocked = true;
      state.houseSource = 'player';
    }
  }

  window.setAuthoritativeHouse = setLockedHouse;
  window.setPlayerHouse = setLockedHouse;
  window.setHouseHard = setLockedHouse;

  if(oldSave){
    window.save = function(){ enforceHouseLock(); return oldSave.apply(this, arguments); };
    try{ save = window.save; }catch(e){}
  }
  if(oldRenderGame){
    window.renderGame = function(){ enforceHouseLock(); return oldRenderGame.apply(this, arguments); };
    try{ renderGame = window.renderGame; }catch(e){}
  }

  // Do not let old text detection or AI output switch houses.
  window.detectHouseText = function(){ return null; };
  try{ detectHouseText = window.detectHouseText; }catch(e){}

  // Sorting and house modification buttons: always lock to player-selected house.
  document.addEventListener('click', function(e){
    const b = e.target.closest('[data-house-v1166], [data-house-v1169], [data-house-v11611]');
    if(!b) return;
    const h = b.dataset.houseV1166 || b.dataset.houseV1169 || b.dataset.houseV11611;
    if(!h) return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    setLockedHouse(h, '玩家手动修改');
  }, true);

  const oldMainlineOptions = window.mainlineOptions || (typeof mainlineOptions === 'function' ? mainlineOptions : null);
  window.mainlineOptions = function(step){
    if(step === 'sorting') return ['选择格兰芬多','选择斯莱特林','选择拉文克劳','选择赫奇帕奇','先听听分院帽怎么说，但最终由我决定'];
    return oldMainlineOptions ? oldMainlineOptions.apply(this, arguments) : ['继续观察','和身边的人说话','去别的地方看看吧'];
  };
  try{ mainlineOptions = window.mainlineOptions; }catch(e){}

  const oldApply = window.applyMainStepEffects || (typeof applyMainStepEffects === 'function' ? applyMainStepEffects : null);
  window.applyMainStepEffects = function(step, idx, action){
    if(step === 'sorting'){
      const chosen = normalizeHouse(action) || HOUSE_LIST[idx] || null;
      if(chosen) setLockedHouse(chosen, '分院选择');
      if(typeof addMemory === 'function') addMemory('sorting_complete');
      return;
    }
    const before = state ? (state.houseOverride || (state.houseManualLocked ? state.house : null)) : null;
    const res = oldApply ? oldApply.apply(this, arguments) : undefined;
    if(before) state.house = before;
    enforceHouseLock();
    return res;
  };
  try{ applyMainStepEffects = window.applyMainStepEffects; }catch(e){}

  const oldResolve = window.resolveMainChoice || (typeof resolveMainChoice === 'function' ? resolveMainChoice : null);
  if(oldResolve){
    window.resolveMainChoice = async function(idx, customText){
      const stepInfo = (typeof currentMainStep === 'function') ? currentMainStep() : null;
      const step = stepInfo && stepInfo.step;
      const opts = (typeof mainlineOptions === 'function' && step) ? mainlineOptions(step) : [];
      const action = customText || opts[idx] || '';
      if(step === 'sorting'){
        const h = normalizeHouse(action) || HOUSE_LIST[idx];
        if(h) setLockedHouse(h, '分院选择');
      }
      const res = await oldResolve.apply(this, arguments);
      enforceHouseLock();
      if(oldSave) oldSave();
      return res;
    };
    try{ resolveMainChoice = window.resolveMainChoice; }catch(e){}
  }

  const oldContext = window.contextPrompt || (typeof contextPrompt === 'function' ? contextPrompt : null);
  if(oldContext){
    window.contextPrompt = function(){
      enforceHouseLock();
      const h = (state && state.house) || '未知';
      return oldContext.apply(this, arguments) + `\n【玩家学院绝对锁定 v1.16.11】当前玩家学院是：${h}。这是玩家选择/修改后的最高优先级设定。所有剧情必须承认玩家是${h}学生。禁止把玩家写回旧学院、其他学院寝室、其他学院公共休息室或其他学院长桌。若历史对话中有旧学院，只能当作过去记录或错误传闻，不改变现在。`;
    };
    try{ contextPrompt = window.contextPrompt; }catch(e){}
  }

  function roleIdFromSpeakerNameFixed(name){
    const n = String(name || '').replace(/[“”"'‘’\s]/g,'');
    if(/韦斯莱双子|双子|弗雷德和乔治|乔治和弗雷德/.test(n)) return 'twins';
    for(const [id, arr] of Object.entries(SPEAKER_ALIASES)){
      if(arr.some(a => n.includes(a.replace(/\s/g,'')) || a.replace(/\s/g,'').includes(n))) return id;
    }
    // fallback: use relation names from state
    if(window.state && state.relations){
      for(const [id, r] of Object.entries(state.relations)){
        const rn = String(r.name || '').replace(/[\s·]/g,'');
        if(rn && (n.includes(rn) || rn.includes(n))) return id;
      }
    }
    return null;
  }
  window.roleIdFromSpeakerName = roleIdFromSpeakerNameFixed;
  try{ roleIdFromSpeakerName = window.roleIdFromSpeakerName; }catch(e){}

  function splitSceneOptions(raw){
    if(window.stripSceneAndOptions){
      const x = window.stripSceneAndOptions(raw);
      return {scene:x.scene||'', options:x.options||[]};
    }
    const s=String(raw||''); const idx=s.lastIndexOf('【选项】');
    const scene=idx>=0?s.slice(0,idx):s; const opt=idx>=0?s.slice(idx+4):'';
    const options=opt.split(/\n+/).map(x=>x.replace(/^[A-D][\.、．:]\s*/,'').trim()).filter(Boolean).slice(0,4);
    return {scene, options};
  }

  function lineAsSpeaker(line){
    let clean = String(line||'').trim();
    clean = clean.replace(/^【旁白】/,'').trim();
    if(!clean) return null;
    if(/^【?选项】?/.test(clean) || /^[A-D][\.、．:]\s*/.test(clean)) return null;

    // Standard: Name: speech / Name：speech
    let m = clean.match(/^([^：:]{1,24})[：:](.+)$/);
    if(m) return {speaker:m[1].trim(), body:m[2].trim()};

    // Chinese novel style: 德拉科说：“……” / 德拉科低声问：“……”
    m = clean.match(/^([^“”：:，,。！？]{1,18})(?:轻声|低声|冷冷地|慢慢|忽然|突然|小声|认真|平静|皱眉|抬头|看着你)?(?:说|问|开口|说道|提醒|嘀咕|回答|笑道|低语|补充|反问)[：，,]?\s*[“"](.+?)[”"]?$/);
    if(m) return {speaker:m[1].trim(), body:m[2].trim()};

    // “……”德拉科说 / “……”德拉科问
    m = clean.match(/^[“"](.+?)[”"]\s*([^，,。！？]{1,18})(?:说|问|说道|回答|低语|补充)/);
    if(m) return {speaker:m[2].trim(), body:m[1].trim()};

    return null;
  }

  function renderSpeakerLine(narr, speaker, body){
    const id = roleIdFromSpeakerNameFixed(speaker);
    if(!id) return false;
    if(id === 'twins'){
      try{ meet('fred'); meet('george'); }catch(e){}
      narr.insertAdjacentHTML('beforeend', `<div class="dialog-line twins-line">${typeof charAvatar==='function'?charAvatar('fred'):''}${typeof charAvatar==='function'?charAvatar('george'):''}<div class="speech-bubble"><b>弗雷德与乔治</b>${esc(body)}</div></div>`);
      return true;
    }
    if(!state.relations || !state.relations[id]) return false;
    try{ meet(id); }catch(e){}
    narr.insertAdjacentHTML('beforeend', `<div class="dialog-line">${typeof charAvatar==='function'?charAvatar(id):`<div class="char-avatar">${esc((state.relations[id].name||'?').slice(0,1))}</div>`}<div class="speech-bubble"><b>${esc(state.relations[id].name)}</b>${esc(body)}</div></div>`);
    return true;
  }

  function renderPlayerLine(narr, text){
    const raw=String(text||'');
    const parts=[]; let last=0; const re=/（([^）]*)）|\(([^)]*)\)/g; let m;
    while((m=re.exec(raw))){
      const before=raw.slice(last,m.index).trim();
      if(before) parts.push({type:'speech', text:before});
      const inside=(m[1]||m[2]||'').trim();
      if(inside) parts.push({type:'narration', text:inside});
      last=re.lastIndex;
    }
    const tail=raw.slice(last).trim();
    if(tail) parts.push({type:'speech', text:tail});
    if(!parts.length && raw.trim()) parts.push({type:'speech', text:raw.trim()});
    parts.forEach(p=>{
      narr.insertAdjacentHTML('beforeend', p.type==='narration' ? `<div class="narrator-line">${esc(p.text)}</div>` : `<div class="player-action-line">${esc(p.text)}</div>`);
    });
  }

  function renderLine(narr,line){
    let clean=String(line||'').replace(/^【旁白】/,'').trim();
    if(!clean) return;
    if(/^【?选项】?/.test(clean) || /^[A-D][\.、．:]\s*/.test(clean)) return;
    if(clean.startsWith('你：')){ renderPlayerLine(narr, clean.replace(/^你：/,'')); return; }
    const sp=lineAsSpeaker(clean);
    if(sp && renderSpeakerLine(narr, sp.speaker, sp.body)) return;
    if(typeof markRoleMentioned === 'function') markRoleMentioned(clean);
    const cls=/金色分割线|——|═/.test(clean) ? 'narrator-line gold-divider-line' : 'narrator-line';
    narr.insertAdjacentHTML('beforeend', `<div class="${cls}">${esc(clean)}</div>`);
  }

  function compileThreadFixed(th){
    return (th?.blocks||[]).map(b=>{
      const p=b.player ? `你：${b.player}\n` : '';
      const ai=splitSceneOptions(b.ai||'').scene;
      return p+ai;
    }).join('\n').trim();
  }
  window.compileThread = compileThreadFixed;
  try{ compileThread = window.compileThread; }catch(e){}

  function renderThreadFixed(thread,textId,optId,type){
    const narr=qs('#'+textId), opt=qs('#'+optId); if(!narr||!opt||!thread) return;
    narr.innerHTML='';
    const blocks=thread.blocks||[];
    blocks.forEach(b=>{
      if(b.player) renderLine(narr,'你：'+b.player);
      splitSceneOptions(b.ai||'').scene.split(/\n+/).filter(Boolean).forEach(line=>renderLine(narr,line));
    });
    const lastAi=blocks.length ? (blocks[blocks.length-1].ai||'') : '';
    const options=splitSceneOptions(lastAi).options;
    if(options.length){
      opt.innerHTML=`<div class="story-options">${options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${esc(o)}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>`;
    }else{
      opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    }
    narr.scrollTop=narr.scrollHeight;
    try{ syncRelationSurfaces && syncRelationSurfaces(); }catch(e){}
  }
  window.renderThreadToUI = renderThreadFixed;
  try{ renderThreadToUI = window.renderThreadToUI; }catch(e){}

  window.parseStory = function(text,targetTextId,targetOptId,type){
    const narr=qs('#'+targetTextId), opt=qs('#'+targetOptId); if(!narr||!opt) return;
    const parts=splitSceneOptions(text||'');
    narr.innerHTML='';
    parts.scene.split(/\n+/).filter(Boolean).forEach(line=>renderLine(narr,line));
    if(parts.options.length){
      opt.innerHTML=`<div class="story-options">${parts.options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${esc(o)}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>`;
    }else{
      opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    }
    narr.scrollTop=narr.scrollHeight;
    try{ syncRelationSurfaces && syncRelationSurfaces(); }catch(e){}
  };

  // Upgrade profile house buttons if rendered after this patch.
  setInterval(function(){
    const first = qs('#profileContent .game-card');
    if(!first || qs('#houseChoiceButtonsV11611', first)) return;
    const wrap=document.createElement('div');
    wrap.id='houseChoiceButtonsV11611';
    wrap.className='house-choice-buttons';
    wrap.innerHTML=`<p class="small">当前学院以玩家选择为准。修改后，所有后续剧情都会把你当成该学院学生。</p><div class="mini-choice-grid">${HOUSE_LIST.map(h=>`<button class="btn secondary" data-house-v11611="${h}">${h}</button>`).join('')}</div>`;
    first.appendChild(wrap);
  }, 1000);

  enforceHouseLock();
  if(oldSave) oldSave();
})();

/* ===== v1.16.12 House Confirm + Robust Save Patch =====
   Minimal requested fixes:
   1) Attribute page house change requires selecting a house then clicking Confirm.
   2) Confirming house change appends narrator line to mainline and locks house globally.
   3) Save/load slots are more robust and keep delete buttons.
*/
(function(){
  if(window.__v11612HouseConfirmSavePatch) return;
  window.__v11612HouseConfirmSavePatch = true;
  const HOUSE_LIST_V11612 = ['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'];
  const $q=(s,r=document)=>r.querySelector(s);
  const $$q=(s,r=document)=>Array.from(r.querySelectorAll(s));
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function afterSept(){const y=state?.time?.year||1991,m=state?.time?.month||8; return y>1991 || (y===1991 && m>=9);}
  function ensureArrays(){ if(!state) return; state.memories=state.memories||[]; state.storyThreads=state.storyThreads||{}; }
  function currentMainThread(){
    ensureArrays();
    const id = (typeof threadIdFor==='function') ? threadIdFor('main','global') : 'main_global_persistent_thread';
    if(typeof ensureThread==='function') return ensureThread(id,'');
    state.storyThreads[id]=state.storyThreads[id]||{id,blocks:[]};
    return state.storyThreads[id];
  }
  function lockHouse(house){
    if(!HOUSE_LIST_V11612.includes(house) || !state) return false;
    state.house = house;
    state.houseOverride = house;
    state.playerHouseLocked = true;
    state.houseManualLocked = true;
    state.houseSource = 'player';
    state.memories = state.memories || [];
    if(!state.memories.includes('house_'+house)) state.memories.push('house_'+house);
    return true;
  }
  function appendHouseNarration(house){
    const th = currentMainThread();
    th.blocks = th.blocks || [];
    const line = `【旁白】邓布利多接受了你更改学院的要求，从现在开始，你便是${house}的学生了。`;
    const last = th.blocks[th.blocks.length-1];
    if(last && last.ai === line) return;
    th.blocks.push({ai:line, houseChange:true, time:{...(state.time||{})}});
  }
  function confirmHouseChange(house){
    if(!lockHouse(house)) return;
    appendHouseNarration(house);
    try{ toast(`学院已确认：${house}`); }catch(e){}
    try{ save(); }catch(e){}
    try{ renderGame(); }catch(e){}
    if($q('#screen-mainline.active')){
      try{ renderThreadToUI(currentMainThread(),'mainlineText','mainlineOptions','main'); }catch(e){}
    }
  }
  window.setAuthoritativeHouse = function(house, reason='玩家确认修改'){
    if(!lockHouse(house)) return false;
    if(/确认|手动|属性|玩家/.test(String(reason||''))) appendHouseNarration(house);
    try{ save(); renderGame(); }catch(e){}
    return true;
  };
  window.setPlayerHouse = window.setAuthoritativeHouse;
  window.setHouseHard = window.setAuthoritativeHouse;

  // Strongest AI house context: locked house cannot be overwritten.
  const prevContext = window.contextPrompt || (typeof contextPrompt==='function'?contextPrompt:null);
  if(prevContext && !window.__v11612ContextHouseLock){
    window.__v11612ContextHouseLock = true;
    window.contextPrompt = function(type, step, label, charId){
      const base = prevContext.apply(this, arguments);
      const h = state?.houseOverride || state?.house || '未知';
      return base + `\n【玩家学院锁定v1.16.12】玩家当前学院=${h}。这是玩家属性界面/分院选择确认后的最高优先级事实。所有宿舍、公共休息室、学院长桌、夜游扣分、信件、羁绊、NPC称呼、教授评价都必须以玩家是${h}学生为准。AI禁止把玩家写回任何旧学院；若历史文本里出现旧学院，只能当作已废弃的过去记录或错误传闻。`;
    };
    try{ contextPrompt = window.contextPrompt; }catch(e){}
  }

  // Replace old immediate house-change widgets with select + confirm.
  function buildHouseConfirmUI(root){
    if(!root || !afterSept()) return;
    const oldWrappers = $$q('#houseChoiceButtonsV1166,#houseChoiceButtonsV1169,#houseChoiceButtonsV11611,#houseChoiceButtonsV11612', root);
    let holder = oldWrappers[0];
    if(!holder){
      const first = root.querySelector('.game-card'); if(!first) return;
      holder = document.createElement('div'); holder.id='houseChoiceButtonsV11612'; holder.className='house-choice-buttons'; first.appendChild(holder);
    }
    oldWrappers.slice(1).forEach(x=>x.remove());
    holder.id='houseChoiceButtonsV11612';
    holder.innerHTML = `<p class="small">修改学院会影响主线、羁绊、夜游扣分、信件和学院相关叙事。请选择后点击确认。</p>
      <div class="mini-choice-grid house-confirm-grid-v11612">${HOUSE_LIST_V11612.map(h=>`<button class="btn secondary" data-house-pending-v11612="${h}">${h}</button>`).join('')}</div>
      <button class="btn primary full" id="confirmHouseV11612">确认</button>`;
    state._pendingHouseChange = state._pendingHouseChange || state.house || '格兰芬多';
    $$q('[data-house-pending-v11612]', holder).forEach(btn=>{ if(btn.dataset.housePendingV11612===state._pendingHouseChange) btn.classList.add('selected'); });
  }
  const prevRenderProfile = window.renderProfile || (typeof renderProfile==='function'?renderProfile:null);
  window.renderProfile = function(){
    if(prevRenderProfile) prevRenderProfile.apply(this, arguments);
    const root=$q('#profileContent'); if(root) buildHouseConfirmUI(root);
  };
  try{ renderProfile = window.renderProfile; }catch(e){}
  document.addEventListener('click',function(e){
    const pending = e.target.closest('[data-house-pending-v11612]');
    if(pending){ e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); state._pendingHouseChange=pending.dataset.housePendingV11612; $$q('[data-house-pending-v11612]').forEach(b=>b.classList.remove('selected')); pending.classList.add('selected'); return; }
    const confirm = e.target.closest('#confirmHouseV11612');
    if(confirm){ e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); confirmHouseChange(state._pendingHouseChange || state.house || '格兰芬多'); return; }
  }, true);
  setInterval(()=>{ const root=$q('#screen-profile.active #profileContent'); if(root) buildHouseConfirmUI(root); }, 800);

  // Robust save/load slots with delete; strips oversized background/cache from slot copy to avoid localStorage quota issues.
  function safeCloneForSlot(){
    const copy = JSON.parse(JSON.stringify(state||{}));
    if((copy.customBg||'').length > 250000) copy.customBg = '';
    if(copy.aiCache) copy.aiCache = {}; // can be regenerated; keeps saves small and prevents loss.
    return copy;
  }
  function getSlots(){
    try{ const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'[null,null,null,null]'); return Array.from({length:4},(_,i)=>raw[i]||null); }
    catch(e){ return [null,null,null,null]; }
  }
  function setSlots(slots){ localStorage.setItem(SAVE_KEY, JSON.stringify(Array.from({length:4},(_,i)=>slots[i]||null))); }
  window.openSaveLoad = function(isSave=true){
    const dlg=$q('#saveDialog'), content=$q('#saveDialogContent'); if(!dlg||!content) return;
    const slots=getSlots();
    content.innerHTML = `<div class="paper"><h3>${isSave?'存档':'读档'}</h3><div class="save-grid">${slots.map((s,i)=>{
      const label=s?`${esc(s.realTime)}<br>游戏时间：${s.state?.time?.year||1991}年${s.state?.time?.month||8}月<br>${esc(s.state?.player?.name||'新生')}${s.state?.ended?'<br>已达成结局：不可继续':''}`:'空存档位';
      return `<div class="save-slot"><b>存档位 ${i+1}</b><p>${label}</p><div class="slot-actions"><button class="btn secondary" data-slot-savefix="${isSave?'save':'load'}" data-slot-index="${i}">${isSave?'保存到此处':'读取此存档'}</button><button class="btn danger small" data-slot-savefix="delete" data-slot-index="${i}">删除</button></div></div>`;
    }).join('')}</div></div>`;
    $$q('[data-slot-savefix]', content).forEach(btn=>btn.onclick=()=>{
      const act=btn.dataset.slotSavefix, i=+btn.dataset.slotIndex, now=getSlots();
      if(act==='save'){
        try{ now[i]={realTime:new Date().toLocaleString(), state:safeCloneForSlot()}; setSlots(now); toast('存档完成'); window.openSaveLoad(true); }
        catch(e){ console.warn(e); toast('保存失败：浏览器存储空间不足，请删除旧存档或更换较小底图。'); }
        return;
      }
      if(act==='load'){
        if(!now[i]){ toast('这里还没有存档哦。'); return; }
        if(now[i].state?.ended){ toast('这个存档已经进入结局，无法继续。'); return; }
        state=now[i].state; try{ migrateState(); }catch(e){} try{ save(); }catch(e){} try{ dlg.close(); }catch(e){} try{ go('screen-game-home'); renderGame(); }catch(e){} return;
      }
      if(act==='delete'){
        now[i]=null; try{ setSlots(now); toast('存档已删除'); window.openSaveLoad(isSave); }catch(e){ toast('删除失败，请刷新后再试。'); }
      }
    });
    try{ dlg.showModal(); }catch(e){ dlg.setAttribute('open',''); }
  };
  try{ openSaveLoad = window.openSaveLoad; }catch(e){}
})();

/* ===== v1.16.13 House Display + Durable Asset Save Patch =====
   Minimal requested fixes:
   1) After player confirms house change, attribute page and all future context keep that house until player changes it again.
   2) Background/avatar uploads are compressed and saved safely. Save slots do not duplicate huge background data, so saves/loads do not disappear.
*/
(function(){
  if(window.__v11613HouseAssetsPatch) return;
  window.__v11613HouseAssetsPatch = true;

  const HOUSE_LIST = ['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'];
  const VISUAL_KEY = 'hp_rpg_visual_assets_v11613';
  const q = (s,r=document)=>r.querySelector(s);
  const qa = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function normalizeHouse(h){
    const t = String(h || '');
    return HOUSE_LIST.find(x => t.includes(x)) || null;
  }

  function currentLockedHouse(){
    if(!window.state) return null;
    return normalizeHouse(state.houseOverride) || normalizeHouse(state.lockedHouse) || (state.houseManualLocked ? normalizeHouse(state.house) : null) || normalizeHouse(state.house);
  }

  function enforcePlayerHouse(){
    if(!window.state) return null;
    const h = normalizeHouse(state.houseOverride) || normalizeHouse(state.lockedHouse) || (state.houseManualLocked ? normalizeHouse(state.house) : null);
    if(h){
      state.house = h;
      state.houseOverride = h;
      state.lockedHouse = h;
      state.houseManualLocked = true;
      state.houseSource = 'player';
      state.eventFlags = state.eventFlags || {};
      state.eventFlags.player_selected_house = true;
    }
    return h || normalizeHouse(state.house);
  }

  function setHousePermanent(house, reason='玩家确认'){
    const h = normalizeHouse(house);
    if(!h || !window.state) return false;
    state.house = h;
    state.houseOverride = h;
    state.lockedHouse = h;
    state.houseManualLocked = true;
    state.houseSource = 'player';
    state.eventFlags = state.eventFlags || {};
    state.eventFlags.player_selected_house = true;
    state.memories = state.memories || [];
    if(!state.memories.includes('player_house_locked_'+h)) state.memories.push('player_house_locked_'+h);
    try{ toast && toast(`学院已确认：${h}`); }catch(e){}
    return true;
  }

  // Replace all public house setters with one authoritative setter.
  window.setAuthoritativeHouse = function(house, reason='玩家确认'){
    const ok = setHousePermanent(house, reason);
    if(ok){ try{ save(); renderGame(); }catch(e){} }
    return ok;
  };
  window.setPlayerHouse = window.setAuthoritativeHouse;
  window.setHouseHard = window.setAuthoritativeHouse;
  try{ setAuthoritativeHouse = window.setAuthoritativeHouse; setPlayerHouse = window.setPlayerHouse; setHouseHard = window.setHouseHard; }catch(e){}

  // Make the profile card text reflect the locked house even if older renderers wrote an old value.
  function patchProfileHouseText(){
    const h = enforcePlayerHouse();
    const root = q('#profileContent');
    if(!root || !h) return;
    qa('.game-card p', root).forEach(p=>{
      if(/^学院：/.test((p.textContent||'').trim())) p.textContent = `学院：${h}`;
    });
  }

  const prevRenderProfile = window.renderProfile || (typeof renderProfile === 'function' ? renderProfile : null);
  if(prevRenderProfile){
    window.renderProfile = function(){
      enforcePlayerHouse();
      const res = prevRenderProfile.apply(this, arguments);
      patchProfileHouseText();
      return res;
    };
    try{ renderProfile = window.renderProfile; }catch(e){}
  }

  const prevRenderGame = window.renderGame || (typeof renderGame === 'function' ? renderGame : null);
  if(prevRenderGame){
    window.renderGame = function(){
      enforcePlayerHouse();
      const res = prevRenderGame.apply(this, arguments);
      patchProfileHouseText();
      return res;
    };
    try{ renderGame = window.renderGame; }catch(e){}
  }

  // Confirm button: make selected house permanent, then append the Dumbledore narration if existing code did not.
  document.addEventListener('click', function(e){
    const pending = e.target.closest('[data-house-pending-v11612], [data-house-v11611], [data-house-v1169], [data-house-v1166]');
    if(pending){
      const h = pending.dataset.housePendingV11612 || pending.dataset.houseV11611 || pending.dataset.houseV1169 || pending.dataset.houseV1166;
      if(h) state._pendingHouseChange = h;
    }
    const confirm = e.target.closest('#confirmHouseV11612');
    if(confirm){
      const h = normalizeHouse(state?._pendingHouseChange) || normalizeHouse(state?.house) || '格兰芬多';
      setTimeout(()=>{
        setHousePermanent(h, '属性界面确认');
        patchProfileHouseText();
        try{ save(); renderGame(); }catch(err){}
      },0);
    }
  }, true);

  // Do not allow AI/story effects to rewrite the locked house.
  const prevApplyEffects = window.applyMainStepEffects || (typeof applyMainStepEffects === 'function' ? applyMainStepEffects : null);
  if(prevApplyEffects){
    window.applyMainStepEffects = function(){
      const before = enforcePlayerHouse();
      const res = prevApplyEffects.apply(this, arguments);
      if(before) setHousePermanent(before, '保持玩家学院');
      enforcePlayerHouse();
      return res;
    };
    try{ applyMainStepEffects = window.applyMainStepEffects; }catch(e){}
  }

  const prevContext = window.contextPrompt || (typeof contextPrompt === 'function' ? contextPrompt : null);
  if(prevContext){
    window.contextPrompt = function(){
      enforcePlayerHouse();
      const base = prevContext.apply(this, arguments);
      const h = state?.houseOverride || state?.lockedHouse || state?.house || '未知';
      return base + `\n【学院最终锁定】玩家现在是${h}学生。此为玩家手动选择/确认后的事实，优先级高于分院帽、AI叙事、历史旧文本和任何自动判断。后续主线、羁绊、夜游、扣分、寝室、公共休息室、学院长桌、信件称呼必须全部按照${h}处理，除非玩家再次在属性界面确认修改学院。`;
    };
    try{ contextPrompt = window.contextPrompt; }catch(e){}
  }

  // Visual assets are global appearance settings. Save slots reference them instead of duplicating huge background strings.
  function getVisualStore(){
    try{return JSON.parse(localStorage.getItem(VISUAL_KEY)||'{}') || {};}catch(e){return {};}
  }
  function setVisualStore(v){
    try{ localStorage.setItem(VISUAL_KEY, JSON.stringify(v||{})); }catch(e){ console.warn('visual store failed', e); }
  }
  function saveVisualAssets(){
    if(!window.state) return;
    const v = getVisualStore();
    v.theme = state.theme || v.theme || 'pink';
    v.customBg = state.customBg || v.customBg || '';
    v.bgOpacity = state.bgOpacity ?? v.bgOpacity ?? 40;
    setVisualStore(v);
  }
  function mergeVisualAssetsIntoState(){
    if(!window.state) return;
    const v = getVisualStore();
    if(v.theme) state.theme = v.theme;
    if(v.customBg) state.customBg = v.customBg;
    if(v.bgOpacity !== undefined) state.bgOpacity = v.bgOpacity;
  }

  async function compressImage(file, maxSide=900, quality=.82){
    if(typeof resizeImageToDataURL === 'function') return resizeImageToDataURL(file, maxSide, quality);
    return new Promise((resolve,reject)=>{
      const reader=new FileReader(); reader.onerror=reject; reader.onload=()=>resolve(reader.result); reader.readAsDataURL(file);
    });
  }

  // Compress player avatar and character avatars before saving.
  document.addEventListener('change', async function(e){
    const avatarInput = e.target.closest('#avatarInput');
    const charInput = e.target.closest('[data-char-avatar], [data-detail-avatar-upload]');
    if(!avatarInput && !charInput) return;
    const file=e.target.files && e.target.files[0];
    if(!file) return;
    try{
      const data = await compressImage(file, avatarInput ? 700 : 500, .82);
      if(avatarInput){
        const preview=q('#avatarPreview'), ph=q('#avatarPlaceholder');
        if(preview){ preview.src=data; preview.style.display='block'; }
        if(ph) ph.style.display='none';
        if(state?.player) state.player.avatar = data;
      }else{
        const id = charInput.dataset.charAvatar || charInput.dataset.detailAvatarUpload;
        state.characterAvatars = state.characterAvatars || {};
        state.characterAvatars[id] = data;
      }
      try{ save(); renderGame(); }catch(err){}
    }catch(err){ console.warn(err); toast('头像保存失败，请换一张小一点的图片。'); }
  }, true);

  // Store background globally and keep it after loading a save slot.
  const bg = q('#bgUpload');
  if(bg){
    bg.addEventListener('change', async function(e){
      const f=e.target.files && e.target.files[0]; if(!f) return;
      try{
        toast('正在整理底图，请稍等。');
        const data = await compressImage(f, 1600, .82);
        state.customBg = data;
        saveVisualAssets();
        if(typeof applySavedAppearance === 'function') applySavedAppearance();
        save();
        toast('底图已更换。');
      }catch(err){ console.warn(err); toast('底图更换失败，请换一张小一点的图片。'); }
    }, true);
  }
  const op = q('#bgOpacity');
  if(op){
    op.addEventListener('input', function(){
      state.bgOpacity = +op.value;
      saveVisualAssets();
    }, true);
  }
  const theme = q('#themeSelect');
  if(theme){
    theme.addEventListener('change', function(){
      state.theme = theme.value;
      saveVisualAssets();
    }, true);
  }

  function slimStateForStorage(){
    const copy = JSON.parse(JSON.stringify(state || {}));
    // Background is global; do not duplicate it into every slot or current save.
    copy.customBg = '';
    copy.aiCache = {};
    return copy;
  }

  const prevSave = window.save || (typeof save === 'function' ? save : null);
  window.save = function(){
    enforcePlayerHouse();
    saveVisualAssets();
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(slimStateForStorage())); }
    catch(e){
      console.warn('save failed', e);
      toast('保存失败：浏览器空间不足。请删除旧存档，或更换更小的头像/底图。');
      return;
    }
  };
  try{ save = window.save; }catch(e){}

  function getSlots(){ try{ return Array.from({length:4},(_,i)=>(JSON.parse(localStorage.getItem(SAVE_KEY)||'[null,null,null,null]')||[])[i]||null); }catch(e){ return [null,null,null,null]; } }
  function setSlots(slots){ localStorage.setItem(SAVE_KEY, JSON.stringify(Array.from({length:4},(_,i)=>slots[i]||null))); }
  function slotCopy(){ const c=slimStateForStorage(); return c; }

  window.openSaveLoad = function(isSave=true){
    const dlg=q('#saveDialog'), content=q('#saveDialogContent'); if(!dlg||!content) return;
    const slots=getSlots();
    content.innerHTML=`<div class="paper"><h3>${isSave?'存档':'读档'}</h3><div class="save-grid">${slots.map((s,i)=>{
      const label=s?`${esc(s.realTime)}<br>游戏时间：${s.state?.time?.year||1991}年${s.state?.time?.month||8}月<br>${esc(s.state?.player?.name||'新生')}${s.state?.ended?'<br>已达成结局：不可继续':''}`:'空存档位';
      return `<div class="save-slot"><b>存档位 ${i+1}</b><p>${label}</p><div class="slot-actions"><button class="btn secondary" data-v11613-slot="${isSave?'save':'load'}" data-slot-index="${i}">${isSave?'保存到此处':'读取此存档'}</button><button class="btn danger small" data-v11613-slot="delete" data-slot-index="${i}">删除</button></div></div>`;
    }).join('')}</div></div>`;
    qa('[data-v11613-slot]',content).forEach(btn=>btn.onclick=()=>{
      const act=btn.dataset.v11613Slot, i=+btn.dataset.slotIndex, now=getSlots();
      if(act==='save'){
        try{ enforcePlayerHouse(); saveVisualAssets(); now[i]={realTime:new Date().toLocaleString(), state:slotCopy()}; setSlots(now); toast('存档完成'); window.openSaveLoad(true); }
        catch(e){ console.warn(e); toast('保存失败：浏览器空间不足。请删除旧存档，或更换更小的头像/底图。'); }
        return;
      }
      if(act==='load'){
        if(!now[i]){ toast('这里还没有存档哦。'); return; }
        if(now[i].state?.ended){ toast('这个存档已经进入结局，无法继续。'); return; }
        state = now[i].state;
        try{ migrateState(); }catch(e){}
        mergeVisualAssetsIntoState();
        enforcePlayerHouse();
        try{ save(); }catch(e){}
        try{ dlg.close(); }catch(e){}
        try{ go('screen-game-home'); renderGame(); if(typeof applySavedAppearance==='function') applySavedAppearance(); }catch(e){}
        return;
      }
      if(act==='delete'){
        now[i]=null; try{ setSlots(now); toast('存档已删除'); window.openSaveLoad(isSave); }catch(e){ toast('删除失败，请刷新后再试。'); }
      }
    });
    try{ dlg.showModal(); }catch(e){ dlg.setAttribute('open',''); }
  };
  try{ openSaveLoad = window.openSaveLoad; }catch(e){}

  // On boot / patch load: restore global appearance and enforce house once.
  mergeVisualAssetsIntoState();
  enforcePlayerHouse();
  try{ if(typeof applySavedAppearance==='function') applySavedAppearance(); if(typeof renderGame==='function') renderGame(); }catch(e){}
})();

/* ===== v1.16.14 ABSOLUTE HOUSE BINDING PATCH =====
   Purpose: player's confirmed house is a hard source of truth across UI and story.
   No other logic may silently change it unless player confirms another house.
*/
(function(){
  if(window.__v11614AbsoluteHouseBindingPatch) return;
  window.__v11614AbsoluteHouseBindingPatch = true;

  const HOUSE_LIST = ['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'];
  const HOUSE_KEY = 'hp_rpg_absolute_player_house_v11614';

  const $p = (sel, root=document)=>root.querySelector(sel);
  const $$p = (sel, root=document)=>Array.from(root.querySelectorAll(sel));

  function normalizeHouseName(v){
    const s = String(v || '').trim();
    return HOUSE_LIST.find(h => s.includes(h)) || '';
  }

  function getLockedHouse(){
    const fromState = normalizeHouseName(
      state?.playerHouseLockedValue ||
      state?.houseOverride ||
      state?.lockedHouse ||
      state?.house
    );
    const fromLocal = normalizeHouseName(localStorage.getItem(HOUSE_KEY));
    return fromState || fromLocal || '';
  }

  function writeLockedHouse(house, reason=''){
    const h = normalizeHouseName(house);
    if(!h || !window.state) return '';
    state.house = h;
    state.houseOverride = h;
    state.lockedHouse = h;
    state.playerHouseLockedValue = h;
    state.playerHouseLocked = true;
    state.houseManualLocked = true;
    state.houseSource = 'player';
    state.eventFlags = state.eventFlags || {};
    state.eventFlags.player_selected_house = true;
    state.eventFlags.house_locked_v11614 = true;
    try{ localStorage.setItem(HOUSE_KEY, h); }catch(e){}
    try{ addMemory && addMemory('player_house_'+h); }catch(e){}
    if(reason) try{ toast && toast(`学院已锁定为：${h}`); }catch(e){}
    return h;
  }

  function enforceHouseEverywhere(){
    const h = getLockedHouse();
    if(!h || !window.state) return '';
    if(state.house !== h || state.houseOverride !== h || state.lockedHouse !== h || state.playerHouseLockedValue !== h){
      state.house = h;
      state.houseOverride = h;
      state.lockedHouse = h;
      state.playerHouseLockedValue = h;
      state.playerHouseLocked = true;
      state.houseManualLocked = true;
      state.houseSource = 'player';
      state.eventFlags = state.eventFlags || {};
      state.eventFlags.player_selected_house = true;
      state.eventFlags.house_locked_v11614 = true;
    }
    return h;
  }

  function patchHouseTextInProfile(){
    const h = enforceHouseEverywhere();
    if(!h) return;
    const root = $p('#profileContent');
    if(!root) return;
    $$p('p, .stat-line span, .stat-line b, h3', root).forEach(node=>{
      const t = (node.textContent || '').trim();
      if(/^学院：/.test(t)) node.textContent = `学院：${h}`;
    });
  }

  window.getPlayerHouseAbsolute = function(){ return enforceHouseEverywhere() || '未知'; };
  window.setAuthoritativeHouse = function(house, reason='玩家确认'){
    const h = writeLockedHouse(house, reason);
    if(!h) return false;
    patchHouseTextInProfile();
    try{ save && save(); }catch(e){}
    try{ renderGame && renderGame(); }catch(e){}
    return true;
  };
  window.setPlayerHouse = window.setAuthoritativeHouse;

  // Any older direct house setters are overridden through click capture.
  document.addEventListener('click', function(e){
    const candidate = e.target.closest('[data-house-pending-v11612], [data-house-v11611], [data-house-v1169], [data-house-v1166]');
    if(candidate){
      const h = normalizeHouseName(candidate.dataset.housePendingV11612 || candidate.dataset.houseV11611 || candidate.dataset.houseV1169 || candidate.dataset.houseV1166 || candidate.textContent);
      if(h) state._pendingHouseChange = h;
    }
    const confirm = e.target.closest('#confirmHouseV11612, [data-confirm-house], .confirm-house, #confirmHouseBtn');
    if(confirm){
      const h = normalizeHouseName(state?._pendingHouseChange || state?.house || confirm.textContent);
      if(h){
        e.preventDefault();
        e.stopPropagation();
        window.setAuthoritativeHouse(h, '属性界面确认');
        try{
          const th = state.storyThreads && state.storyThreads.main;
          if(th && Array.isArray(th.blocks)){
            th.blocks.push({system:`邓布利多接受了你更改学院的要求，从现在开始，你便是${h}的学生了。`});
          }
        }catch(err){}
        return false;
      }
    }
  }, true);

  // Guard old effects, main choice effects, and random AI parsing from rewriting house.
  ['applyMainStepEffects','applyMainChoiceEffects','applyChoiceEffects','afterAIResponse','renderGame','renderProfile','save'].forEach(name=>{
    const fn = window[name] || (typeof globalThis[name] === 'function' ? globalThis[name] : null);
    if(typeof fn !== 'function' || fn.__houseLockedV11614) return;
    const wrapped = function(){
      const before = enforceHouseEverywhere();
      const res = fn.apply(this, arguments);
      if(before) writeLockedHouse(before);
      patchHouseTextInProfile();
      return res;
    };
    wrapped.__houseLockedV11614 = true;
    window[name] = wrapped;
    try{ globalThis[name] = wrapped; }catch(e){}
  });

  // Strengthen AI context: every prompt receives the locked house as non-negotiable truth.
  const oldContext = window.contextPrompt || (typeof contextPrompt === 'function' ? contextPrompt : null);
  if(oldContext && !oldContext.__houseContextV11614){
    const wrappedContext = function(){
      const h = enforceHouseEverywhere() || '未知';
      const base = oldContext.apply(this, arguments);
      return base + `\n【学院绝对事实 v1.16.14】玩家当前学院=${h}。这是玩家亲自确认的设定，优先级最高。任何分院帽、AI剧情、旧对话、自动判定、NPC台词都不得改动此事实。玩家现在就是${h}学生；宿舍、公共休息室、学院长桌、同院同学、夜游扣分、家书、信件、羁绊、教授称呼、课堂分组全部必须按${h}处理。除非玩家再次在属性界面点击确认修改学院，否则禁止把玩家写成其他学院。`;
    };
    wrappedContext.__houseContextV11614 = true;
    window.contextPrompt = wrappedContext;
    try{ contextPrompt = wrappedContext; }catch(e){}
  }

  // If any generated text says the player belongs to an old house, keep state locked anyway.
  const oldRenderThread = window.renderThreadToUI || (typeof renderThreadToUI === 'function' ? renderThreadToUI : null);
  if(oldRenderThread && !oldRenderThread.__houseRenderV11614){
    const wrappedRenderThread = function(){
      enforceHouseEverywhere();
      const res = oldRenderThread.apply(this, arguments);
      patchHouseTextInProfile();
      return res;
    };
    wrappedRenderThread.__houseRenderV11614 = true;
    window.renderThreadToUI = wrappedRenderThread;
    try{ renderThreadToUI = wrappedRenderThread; }catch(e){}
  }

  // Re-enforce after load/page return because several older patches re-render asynchronously.
  ['visibilitychange','pageshow','focus'].forEach(evt=>{
    window.addEventListener(evt, ()=>{ enforceHouseEverywhere(); patchHouseTextInProfile(); }, true);
  });
  setInterval(()=>{ enforceHouseEverywhere(); patchHouseTextInProfile(); }, 1500);

  enforceHouseEverywhere();
  patchHouseTextInProfile();
  try{ save && save(); }catch(e){}
})();

/* ===== v1.16.15 FINAL HOUSE BIND + ASSET STORAGE EXPANSION PATCH =====
   1) A confirmed house is canonical and controls UI + AI context until the player confirms another house.
   2) Uploaded backgrounds/avatars are compressed and stored in IndexedDB, while save slots keep only refs.
*/
(function(){
  if(window.__v11615HouseAssetPatch) return;
  window.__v11615HouseAssetPatch = true;

  const HOUSE_LIST = ['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'];
  const HOUSE_KEY = 'hp_rpg_canonical_house_v11615';
  const DB_NAME = 'hp_rpg_assets_v11615';
  const STORE = 'assets';
  const STATE_KEY = 'hp_rpg_state';
  const LEGACY_STATE_KEY = 'HP_RPG_STATE';

  const q = (s,r=document)=>r.querySelector(s);
  const qa = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc = s => String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const normHouse = v => HOUSE_LIST.find(h=>String(v||'').includes(h)) || '';

  function nowState(){ return window.state || (typeof state!=='undefined' ? state : null); }

  function getCanonicalHouse(){
    const st = nowState();
    const candidates = [
      st?.playerHouseLockedValue,
      st?.houseOverride,
      st?.lockedHouse,
      st?.houseManualLocked ? st?.house : '',
      localStorage.getItem(HOUSE_KEY)
    ];
    for(const c of candidates){ const h=normHouse(c); if(h) return h; }
    return '';
  }

  function setCanonicalHouse(house, opts={}){
    const h = normHouse(house);
    const st = nowState();
    if(!h || !st) return false;
    st.house = h;
    st.houseOverride = h;
    st.lockedHouse = h;
    st.playerHouseLockedValue = h;
    st.playerHouseLocked = true;
    st.houseManualLocked = true;
    st.houseSource = 'player';
    st.eventFlags = st.eventFlags || {};
    st.eventFlags.player_selected_house = true;
    st.eventFlags.house_locked_v11615 = true;
    st.memories = st.memories || [];
    if(!st.memories.includes('canonical_house_'+h)) st.memories.push('canonical_house_'+h);
    try{ localStorage.setItem(HOUSE_KEY,h); }catch(e){}
    if(opts.narrate) appendHouseNarration(h);
    updateProfileHouseText(h);
    try{ if(typeof toast==='function' && opts.toast!==false) toast(`学院已确认：${h}`); }catch(e){}
    try{ save && save(); }catch(e){}
    return true;
  }

  function enforceCanonicalHouse(){
    const h = getCanonicalHouse();
    const st = nowState();
    if(!h || !st) return '';
    if(st.house!==h || st.houseOverride!==h || st.lockedHouse!==h || st.playerHouseLockedValue!==h){
      st.house = h;
      st.houseOverride = h;
      st.lockedHouse = h;
      st.playerHouseLockedValue = h;
      st.playerHouseLocked = true;
      st.houseManualLocked = true;
      st.houseSource = 'player';
      st.eventFlags = st.eventFlags || {};
      st.eventFlags.player_selected_house = true;
      st.eventFlags.house_locked_v11615 = true;
    }
    return h;
  }

  function currentMainThreadSafe(){
    const st = nowState(); if(!st) return null;
    st.storyThreads = st.storyThreads || {};
    let id = 'main_global_persistent_thread';
    try{ if(typeof threadIdFor==='function') id = threadIdFor('main','global'); }catch(e){}
    if(typeof ensureThread==='function') return ensureThread(id,'');
    st.storyThreads[id] = st.storyThreads[id] || {id,blocks:[]};
    return st.storyThreads[id];
  }

  function appendHouseNarration(house){
    const th = currentMainThreadSafe(); if(!th) return;
    th.blocks = th.blocks || [];
    const line = `【旁白】邓布利多接受了你更改学院的要求，从现在开始，你便是${house}的学生了。`;
    const last = th.blocks[th.blocks.length-1];
    if(last && (last.ai===line || last.system===line)) return;
    th.blocks.push({ai:line, houseChange:true, time:{...(nowState()?.time||{})}});
  }

  function updateProfileHouseText(house=getCanonicalHouse()){
    const root = q('#profileContent'); if(!root || !house) return;
    qa('p,span,b,div', root).forEach(node=>{
      const t=(node.textContent||'').trim();
      if(/^学院：/.test(t)) node.textContent = `学院：${house}`;
    });
    const buttons = qa('[data-house-v11615]', root);
    buttons.forEach(btn=>btn.classList.toggle('selected', btn.dataset.houseV11615===house));
  }

  function renderHouseControl(){
    const root = q('#profileContent'); if(!root) return;
    // remove old confusing controls so there is only one authoritative control
    qa('#houseChoiceButtonsV1166,#houseChoiceButtonsV1169,#houseChoiceButtonsV11611,#houseChoiceButtonsV11612,#houseChoiceButtonsV11614,#houseChoiceButtonsV11615', root).forEach(x=>x.remove());
    const first = root.querySelector('.game-card'); if(!first) return;
    const st = nowState();
    const h = getCanonicalHouse() || normHouse(st?.house) || '格兰芬多';
    st._pendingHouseChange = normHouse(st?._pendingHouseChange) || h;
    const holder = document.createElement('div');
    holder.id = 'houseChoiceButtonsV11615';
    holder.className = 'house-choice-buttons';
    holder.innerHTML = `<p class="small">修改学院会强制同步到主线、羁绊、夜游扣分、信件、宿舍与公共休息室。请选择后点击确认。</p>
      <div class="mini-choice-grid house-confirm-grid-v11615">${HOUSE_LIST.map(x=>`<button class="btn secondary ${x===st._pendingHouseChange?'selected':''}" data-house-v11615="${x}">${x}</button>`).join('')}</div>
      <button class="btn primary full" id="confirmHouseV11615">确认</button>`;
    first.appendChild(holder);
    updateProfileHouseText(h);
  }

  function bindHouseControls(){
    document.addEventListener('click', function(e){
      const b = e.target.closest('[data-house-v11615]');
      if(b){
        e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation();
        const st=nowState(); if(st) st._pendingHouseChange = b.dataset.houseV11615;
        qa('[data-house-v11615]').forEach(x=>x.classList.remove('selected'));
        b.classList.add('selected');
        return false;
      }
      const c = e.target.closest('#confirmHouseV11615');
      if(c){
        e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation();
        const st=nowState();
        const h = normHouse(st?._pendingHouseChange) || getCanonicalHouse() || '格兰芬多';
        setCanonicalHouse(h,{narrate:true,toast:true});
        try{ renderGame && renderGame(); }catch(err){}
        try{
          if(q('#screen-mainline.active')) renderThreadToUI(currentMainThreadSafe(),'mainlineText','mainlineOptions','main');
        }catch(err){}
        return false;
      }
    }, true);
  }

  // Override house setters and guard older effects
  window.getPlayerHouseAbsolute = function(){ return enforceCanonicalHouse() || normHouse(nowState()?.house) || '未知'; };
  window.setAuthoritativeHouse = function(house, reason='玩家确认'){
    return setCanonicalHouse(house,{narrate:/确认|属性|手动|玩家/.test(String(reason||'')),toast:true});
  };
  window.setPlayerHouse = window.setAuthoritativeHouse;
  window.setHouseHard = window.setAuthoritativeHouse;

  ['renderProfile','renderGame','save'].forEach(name=>{
    const old = window[name] || (typeof globalThis[name]==='function' ? globalThis[name] : null);
    if(typeof old==='function' && !old.__v11615Wrapped){
      const wrapped = function(){
        enforceCanonicalHouse();
        const res = old.apply(this, arguments);
        if(name==='renderProfile' || name==='renderGame'){
          setTimeout(()=>{ enforceCanonicalHouse(); renderHouseControl(); updateProfileHouseText(); },0);
        }
        return res;
      };
      wrapped.__v11615Wrapped = true;
      window[name]=wrapped; try{ globalThis[name]=wrapped; }catch(e){}
    }
  });

  const oldApply = window.applyMainStepEffects || (typeof applyMainStepEffects==='function'?applyMainStepEffects:null);
  if(oldApply && !oldApply.__v11615HouseGuard){
    const wrapped = function(){
      const before = enforceCanonicalHouse();
      const res = oldApply.apply(this, arguments);
      if(before) setCanonicalHouse(before,{toast:false});
      return res;
    };
    wrapped.__v11615HouseGuard=true;
    window.applyMainStepEffects=wrapped; try{ applyMainStepEffects=wrapped; }catch(e){}
  }

  const oldContext = window.contextPrompt || (typeof contextPrompt==='function'?contextPrompt:null);
  if(oldContext && !oldContext.__v11615HouseContext){
    const wrapped = function(){
      const h = enforceCanonicalHouse() || normHouse(nowState()?.house) || '未知';
      return oldContext.apply(this, arguments) + `\n【玩家学院强绑定 v1.16.15】玩家当前学院=${h}。这是玩家亲自确认的事实，优先级高于分院帽、旧剧情、AI推测和NPC台词。后续所有主线、羁绊、夜游、信件、宿舍、公共休息室、学院长桌、扣分、教授评价都必须把玩家视为${h}学生。除非玩家再次在属性界面选择并确认新学院，否则禁止改变。`;
    };
    wrapped.__v11615HouseContext=true;
    window.contextPrompt=wrapped; try{ contextPrompt=wrapped; }catch(e){}
  }

  // -------- IndexedDB image asset storage + compression --------
  function openDB(){
    return new Promise((resolve,reject)=>{
      const req = indexedDB.open(DB_NAME,1);
      req.onupgradeneeded = ()=>{ const db=req.result; if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE); };
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error);
    });
  }
  async function idbSet(key,val){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(STORE,'readwrite'); tx.objectStore(STORE).put(val,key); tx.oncomplete=res; tx.onerror=()=>rej(tx.error); }); }
  async function idbGet(key){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(STORE,'readonly'); const r=tx.objectStore(STORE).get(key); r.onsuccess=()=>res(r.result||''); r.onerror=()=>rej(r.error); }); }

  async function compressImageFile(file, maxSide=1200, quality=.72){
    const data = await new Promise((resolve,reject)=>{ const fr=new FileReader(); fr.onload=()=>resolve(fr.result); fr.onerror=reject; fr.readAsDataURL(file); });
    const img = await new Promise((resolve,reject)=>{ const im=new Image(); im.onload=()=>resolve(im); im.onerror=reject; im.src=data; });
    let {width:w,height:h}=img;
    const ratio = Math.min(1, maxSide/Math.max(w,h));
    w = Math.max(1, Math.round(w*ratio)); h = Math.max(1, Math.round(h*ratio));
    const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
    canvas.getContext('2d').drawImage(img,0,0,w,h);
    return canvas.toDataURL('image/jpeg', quality);
  }

  function stripAssetsForLocalStorage(copy){
    copy.assetRefs = copy.assetRefs || {};
    if(copy.customBg && String(copy.customBg).startsWith('data:')){ copy.assetRefs.customBg='customBg'; copy.customBg=''; }
    if(copy.player?.avatar && String(copy.player.avatar).startsWith('data:')){ copy.assetRefs.playerAvatar='playerAvatar'; copy.player.avatar=''; }
    if(copy.characterAvatars){
      copy.assetRefs.characterAvatars = copy.assetRefs.characterAvatars || {};
      for(const id of Object.keys(copy.characterAvatars)){
        if(String(copy.characterAvatars[id]||'').startsWith('data:')){ copy.assetRefs.characterAvatars[id]='char_'+id; copy.characterAvatars[id]=''; }
      }
    }
    return copy;
  }

  async function hydrateAssets(){
    const st=nowState(); if(!st) return;
    st.assetRefs = st.assetRefs || {};
    try{
      if(st.assetRefs.customBg && !st.customBg){ const v=await idbGet(st.assetRefs.customBg); if(v) st.customBg=v; }
      if(st.assetRefs.playerAvatar && st.player && !st.player.avatar){ const v=await idbGet(st.assetRefs.playerAvatar); if(v) st.player.avatar=v; }
      if(st.assetRefs.characterAvatars){
        st.characterAvatars = st.characterAvatars || {};
        for(const [id,key] of Object.entries(st.assetRefs.characterAvatars)){
          if(!st.characterAvatars[id]){ const v=await idbGet(key); if(v) st.characterAvatars[id]=v; }
        }
      }
      try{ applySavedAppearance && applySavedAppearance(); renderGame && renderGame(); }catch(e){}
    }catch(e){ console.warn('hydrate assets failed', e); }
  }

  const oldSave2 = window.save || (typeof save==='function'?save:null);
  if(oldSave2 && !oldSave2.__v11615AssetSave){
    const wrappedSave = function(){
      enforceCanonicalHouse();
      try{
        const st=nowState();
        if(st){
          const slim = stripAssetsForLocalStorage(JSON.parse(JSON.stringify(st)));
          try{ localStorage.setItem(STATE_KEY, JSON.stringify(slim)); }catch(e1){ try{ localStorage.setItem(LEGACY_STATE_KEY, JSON.stringify(slim)); }catch(e2){ throw e2; } }
        }
      }catch(e){ console.warn('v11615 slim save failed, fallback old save', e); try{ oldSave2.apply(this, arguments); }catch(err){ try{ toast && toast('保存失败：图片过大，系统已尝试压缩，请重新上传较小图片。'); }catch(_){} } }
    };
    wrappedSave.__v11615AssetSave=true;
    window.save=wrappedSave; try{ save=wrappedSave; }catch(e){}
  }

  document.addEventListener('change', async function(e){
    const input = e.target;
    const file = input?.files?.[0];
    if(!file) return;
    const st=nowState(); if(!st) return;
    const isBg = input.matches('#bgUpload');
    const isAvatar = input.matches('#avatarInput');
    const charId = input.dataset?.charAvatar || input.dataset?.detailAvatarUpload;
    if(!isBg && !isAvatar && !charId) return;
    e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    try{
      try{ toast && toast('正在压缩并保存图片，请稍等。'); }catch(_){}
      const data = await compressImageFile(file, isBg ? 1400 : 520, isBg ? .68 : .74);
      st.assetRefs = st.assetRefs || {};
      if(isBg){
        await idbSet('customBg', data);
        st.assetRefs.customBg='customBg'; st.customBg=data;
        try{ applySavedAppearance && applySavedAppearance(); }catch(_){}
      }else if(isAvatar){
        await idbSet('playerAvatar', data);
        st.assetRefs.playerAvatar='playerAvatar';
        st.player = st.player || {}; st.player.avatar=data;
        const preview=q('#avatarPreview'), ph=q('#avatarPlaceholder');
        if(preview){ preview.src=data; preview.style.display='block'; }
        if(ph) ph.style.display='none';
      }else if(charId){
        await idbSet('char_'+charId, data);
        st.assetRefs.characterAvatars = st.assetRefs.characterAvatars || {};
        st.assetRefs.characterAvatars[charId]='char_'+charId;
        st.characterAvatars = st.characterAvatars || {};
        st.characterAvatars[charId]=data;
      }
      try{ save && save(); renderGame && renderGame(); }catch(_){}
      try{ toast && toast('图片已保存。'); }catch(_){}
    }catch(err){ console.warn(err); try{ toast && toast('图片保存失败，请换一张更小的图片。'); }catch(_){} }
    return false;
  }, true);

  bindHouseControls();
  setInterval(()=>{ enforceCanonicalHouse(); renderHouseControl(); updateProfileHouseText(); },1000);
  enforceCanonicalHouse();
  setTimeout(()=>{ hydrateAssets(); renderHouseControl(); updateProfileHouseText(); },0);
})();

/* ===== v1.16.16 hard sorting + core house field + image storage fix =====
   1) Sorting is no longer decided by AI. If the current mainline step is sorting, the option zone must show exactly four house choices.
   2) House is treated like name/gender/bloodStatus: state.house + state.player.house + a canonical persisted key. AI/story cannot overwrite it.
   3) Uploaded images are compressed and stored once in IndexedDB; save slots store only lightweight references so saves do not disappear.
*/
(function(){
  if(window.__v11616HardHouseAndStorage) return;
  window.__v11616HardHouseAndStorage = true;

  const HOUSE_LIST = ['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'];
  const CANON_HOUSE_KEY = 'hp_rpg_player_house_canonical_v11616';
  const DB_NAME = 'hp_rpg_asset_db_v11616';
  const STORE = 'assets';
  const META_SAVE_KEY = 'hp_rpg_save_slots_v11616_meta';
  const SLOT_PREFIX = 'save_slot_';

  const q = (s,r=document)=>r.querySelector(s);
  const qa = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function normHouse(v){ const t=String(v||''); return HOUSE_LIST.find(h=>t.includes(h)) || null; }
  function stateNow(){ return (typeof state !== 'undefined' && state) ? state : null; }
  function storageGetHouse(){ try{return normHouse(localStorage.getItem(CANON_HOUSE_KEY)||'');}catch(e){return null;} }
  function storageSetHouse(h){ try{ if(h) localStorage.setItem(CANON_HOUSE_KEY,h); }catch(e){} }

  function canonicalHouse(){
    const st=stateNow();
    return storageGetHouse() || normHouse(st?.player?.house) || normHouse(st?.house) || normHouse(st?.houseOverride) || normHouse(st?.lockedHouse) || null;
  }

  function writeHouse(h, opts={}){
    h = normHouse(h);
    const st=stateNow();
    if(!h || !st) return false;
    st.house = h;
    st.player = st.player || {};
    st.player.house = h;
    st.houseOverride = h;
    st.lockedHouse = h;
    st.houseManualLocked = true;
    st.houseSource = 'player';
    st.eventFlags = st.eventFlags || {};
    st.eventFlags.player_selected_house = true;
    st.memories = st.memories || [];
    if(!st.memories.includes('player_house_'+h)) st.memories.push('player_house_'+h);
    storageSetHouse(h);
    if(opts.narrate) appendHouseNarrationV11616(h);
    if(opts.toast && typeof toast==='function') toast(`学院已确认：${h}`);
    try{ save && save(); }catch(e){}
    try{ renderGame && renderGame(); }catch(e){}
    return true;
  }

  function enforceHouse(){
    const h=canonicalHouse();
    const st=stateNow();
    if(h && st){
      st.house=h; st.player=st.player||{}; st.player.house=h; st.houseOverride=h; st.lockedHouse=h;
      st.houseManualLocked=true; st.houseSource='player';
      st.eventFlags=st.eventFlags||{}; st.eventFlags.player_selected_house=true;
    }
    return h;
  }

  function getMainThreadV11616(){
    const st=stateNow(); if(!st) return null;
    st.storyThreads = st.storyThreads || {};
    let id='main_global_persistent_thread';
    try{ if(typeof threadIdFor==='function') id=threadIdFor('main','global'); }catch(e){}
    if(typeof ensureThread==='function') return ensureThread(id,'');
    st.storyThreads[id]=st.storyThreads[id]||{id,blocks:[]};
    return st.storyThreads[id];
  }

  function appendHouseNarrationV11616(h){
    const th=getMainThreadV11616(); if(!th) return;
    th.blocks=th.blocks||[];
    const line=`【旁白】邓布利多接受了你更改学院的要求，从现在开始，你便是${h}的学生了。`;
    const last=th.blocks[th.blocks.length-1];
    if(last && (last.ai===line || last.system===line)) return;
    th.blocks.push({ai:line, houseChange:true, time: JSON.parse(JSON.stringify(stateNow()?.time||{}))});
  }

  // Public API: every older patch eventually calls one of these names. Make them all hard setters.
  window.setAuthoritativeHouse = function(h, reason='玩家确认'){ return writeHouse(h,{narrate:/确认|属性|手动|玩家|分院/.test(String(reason||'')),toast:true}); };
  window.setPlayerHouse = window.setAuthoritativeHouse;
  window.setHouseHard = window.setAuthoritativeHouse;
  window.getPlayerHouseAbsolute = function(){ return enforceHouse() || '未知'; };
  try{ setAuthoritativeHouse=window.setAuthoritativeHouse; setPlayerHouse=window.setPlayerHouse; setHouseHard=window.setHouseHard; }catch(e){}

  // Sorting must always be explicit player choice.
  const oldMainlineOptions = window.mainlineOptions || (typeof mainlineOptions==='function'?mainlineOptions:null);
  window.mainlineOptions = function(step){
    if(step==='sorting') return ['选择格兰芬多','选择斯莱特林','选择拉文克劳','选择赫奇帕奇'];
    return oldMainlineOptions ? oldMainlineOptions.apply(this, arguments) : ['继续观察','主动询问','保持沉默'];
  };
  try{ mainlineOptions=window.mainlineOptions; }catch(e){}

  function forceSortingOptionsIfNeeded(){
    let step=''; try{ step=(typeof currentMainStep==='function' && currentMainStep())?.step || ''; }catch(e){}
    if(step!=='sorting') return;
    const opt=q('#mainlineOptions'); if(!opt) return;
    opt.innerHTML = `<div class="story-options">${HOUSE_LIST.map((h,i)=>`<button data-main-choice="${i}" data-choice-text="选择${h}" data-house-sort-v11616="${h}">${String.fromCharCode(65+i)}. 选择${h}</button>`).join('')}</div>`;
  }

  const oldRenderMainline = window.renderMainline || (typeof renderMainline==='function'?renderMainline:null);
  if(oldRenderMainline){
    window.renderMainline = async function(){
      enforceHouse();
      const res = await oldRenderMainline.apply(this, arguments);
      enforceHouse();
      forceSortingOptionsIfNeeded();
      patchProfileHouseText();
      return res;
    };
    try{ renderMainline=window.renderMainline; }catch(e){}
  }

  const oldResolveMainChoice = window.resolveMainChoice || (typeof resolveMainChoice==='function'?resolveMainChoice:null);
  if(oldResolveMainChoice){
    window.resolveMainChoice = async function(idx, customText){
      let step=''; try{ step=(typeof currentMainStep==='function' && currentMainStep())?.step || ''; }catch(e){}
      const actionText = customText || (step==='sorting' ? `选择${HOUSE_LIST[idx]||'格兰芬多'}` : '');
      if(step==='sorting'){
        const h = normHouse(actionText) || HOUSE_LIST[idx] || null;
        if(h){
          writeHouse(h,{narrate:false,toast:true});
          // Let the existing resolver keep the thread/step progression, but guard the house before and after.
          const res = await oldResolveMainChoice.call(this, idx, `我选择${h}`);
          writeHouse(h,{narrate:false,toast:false});
          try{ if(typeof completeStep==='function') completeStep('sorting'); }catch(e){}
          try{ save && save(); renderGame && renderGame(); }catch(e){}
          return res;
        }
      }
      const before = enforceHouse();
      const res = await oldResolveMainChoice.apply(this, arguments);
      if(before) writeHouse(before,{narrate:false,toast:false}); else enforceHouse();
      return res;
    };
    try{ resolveMainChoice=window.resolveMainChoice; }catch(e){}
  }

  // If the player taps a house sorting option, lock immediately before any old handler runs.
  document.addEventListener('click', function(e){
    const sortBtn=e.target.closest('[data-house-sort-v11616]');
    if(sortBtn){ writeHouse(sortBtn.dataset.houseSortV11616,{narrate:false,toast:true}); return; }
  }, true);

  // Attribute page: one canonical house field, like name/gender/bloodStatus.
  function patchProfileHouseText(){
    const h=enforceHouse();
    const root=q('#profileContent'); if(!root) return;
    qa('.game-card p', root).forEach(p=>{ if(/^学院：/.test((p.textContent||'').trim())) p.textContent=`学院：${h||'未知'}`; });
    qa('[data-house-core-v11616]', root).forEach(b=>b.classList.toggle('selected', b.dataset.houseCoreV11616===(h||'')));
  }

  function renderCoreHouseControl(){
    const root=q('#profileContent'); if(!root) return;
    qa('#houseChoiceButtonsV1166,#houseChoiceButtonsV1169,#houseChoiceButtonsV11611,#houseChoiceButtonsV11612,#houseChoiceButtonsV11614,#houseChoiceButtonsV11615,#houseCoreFieldV11616', root).forEach(x=>x.remove());
    const first=root.querySelector('.game-card'); if(!first) return;
    const h=enforceHouse() || '未知';
    const wrap=document.createElement('div');
    wrap.id='houseCoreFieldV11616';
    wrap.className='house-choice-buttons';
    wrap.innerHTML=`<p class="small">学院是核心角色属性，和姓名、性别、血统一样由玩家确认保存。确认后，除非你再次修改，否则剧情和 AI 都不能改动。</p>
      <div class="mini-choice-grid house-confirm-grid-v11616">${HOUSE_LIST.map(x=>`<button class="btn secondary ${x===h?'selected':''}" data-house-core-v11616="${x}">${x}</button>`).join('')}</div>
      <button class="btn primary full" id="confirmHouseCoreV11616">确认学院</button>`;
    first.appendChild(wrap);
  }

  const oldRenderProfile = window.renderProfile || (typeof renderProfile==='function'?renderProfile:null);
  if(oldRenderProfile){
    window.renderProfile = function(){
      enforceHouse();
      const res=oldRenderProfile.apply(this, arguments);
      renderCoreHouseControl();
      patchProfileHouseText();
      return res;
    };
    try{ renderProfile=window.renderProfile; }catch(e){}
  }

  document.addEventListener('click', function(e){
    const b=e.target.closest('[data-house-core-v11616]');
    if(b){
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      const st=stateNow(); if(st) st._pendingHouseChange=b.dataset.houseCoreV11616;
      qa('[data-house-core-v11616]').forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected');
      return false;
    }
    const c=e.target.closest('#confirmHouseCoreV11616');
    if(c){
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      const st=stateNow(); const h=normHouse(st?._pendingHouseChange) || canonicalHouse() || '格兰芬多';
      writeHouse(h,{narrate:true,toast:true});
      patchProfileHouseText();
      try{ if(q('#screen-mainline.active')) renderThreadToUI(getMainThreadV11616(),'mainlineText','mainlineOptions','main'); }catch(e){}
      return false;
    }
  }, true);

  // Guard all old effect functions from changing the house after the player has selected one.
  ['applyMainStepEffects','applyMainChoiceEffects','applyChoiceEffects','afterAIResponse'].forEach(name=>{
    const old = window[name] || (typeof globalThis[name]==='function'?globalThis[name]:null);
    if(typeof old==='function' && !old.__v11616HouseGuard){
      const wrapped=function(){ const before=enforceHouse(); const res=old.apply(this, arguments); if(before) writeHouse(before,{narrate:false,toast:false}); return res; };
      wrapped.__v11616HouseGuard=true; window[name]=wrapped; try{ globalThis[name]=wrapped; }catch(e){}
    }
  });

  const oldContext = window.contextPrompt || (typeof contextPrompt==='function'?contextPrompt:null);
  if(oldContext && !oldContext.__v11616CoreHousePrompt){
    const wrapped=function(){
      const h=enforceHouse() || '未知';
      return oldContext.apply(this, arguments) + `\n【核心角色属性：学院】玩家学院=${h}。学院是与姓名、性别、血统一样的代码记录核心属性。分院剧情必须给玩家四个明确学院选项，由玩家选择；AI不得动态判断、不得擅自改学院、不得把玩家写进旧学院寝室/长桌/公共休息室。后续所有剧情必须把玩家作为${h}学生处理，除非玩家再次在属性界面确认修改。`;
    };
    wrapped.__v11616CoreHousePrompt=true; window.contextPrompt=wrapped; try{ contextPrompt=wrapped; }catch(e){}
  }

  // IndexedDB asset storage. This does not literally enlarge browser quotas, but uses the larger browser database area and stores compressed images once.
  function openAssetDB(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{ const db=req.result; if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE); };
      req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
    });
  }
  async function dbSet(key,val){ const db=await openAssetDB(); return new Promise((res,rej)=>{ const tx=db.transaction(STORE,'readwrite'); tx.objectStore(STORE).put(val,key); tx.oncomplete=res; tx.onerror=()=>rej(tx.error); }); }
  async function dbGet(key){ const db=await openAssetDB(); return new Promise((res,rej)=>{ const tx=db.transaction(STORE,'readonly'); const r=tx.objectStore(STORE).get(key); r.onsuccess=()=>res(r.result||''); r.onerror=()=>rej(r.error); }); }
  async function compress(file, maxSide=1100, quality=.66){
    const data=await new Promise((res,rej)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(file); });
    const img=await new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=data; });
    let w=img.width,h=img.height; const scale=Math.min(1,maxSide/Math.max(w,h)); w=Math.max(1,Math.round(w*scale)); h=Math.max(1,Math.round(h*scale));
    const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h; canvas.getContext('2d').drawImage(img,0,0,w,h);
    return canvas.toDataURL('image/jpeg',quality);
  }
  function slimState(st){
    const copy=JSON.parse(JSON.stringify(st||{}));
    copy.assetRefs=copy.assetRefs||{};
    if(copy.customBg && String(copy.customBg).startsWith('data:')){ copy.assetRefs.customBg='customBg'; copy.customBg=''; }
    if(copy.player?.avatar && String(copy.player.avatar).startsWith('data:')){ copy.assetRefs.playerAvatar='playerAvatar'; copy.player.avatar=''; }
    if(copy.characterAvatars){
      copy.assetRefs.characterAvatars=copy.assetRefs.characterAvatars||{};
      Object.keys(copy.characterAvatars).forEach(id=>{ if(String(copy.characterAvatars[id]||'').startsWith('data:')){ copy.assetRefs.characterAvatars[id]='char_'+id; copy.characterAvatars[id]=''; } });
    }
    if(copy.aiCache) copy.aiCache={};
    return copy;
  }
  async function hydrateAssetsToState(){
    const st=stateNow(); if(!st) return;
    st.assetRefs=st.assetRefs||{};
    try{
      if(st.assetRefs.customBg && !st.customBg){ const v=await dbGet(st.assetRefs.customBg); if(v) st.customBg=v; }
      if(st.assetRefs.playerAvatar && st.player && !st.player.avatar){ const v=await dbGet(st.assetRefs.playerAvatar); if(v) st.player.avatar=v; }
      if(st.assetRefs.characterAvatars){ st.characterAvatars=st.characterAvatars||{}; for(const [id,key] of Object.entries(st.assetRefs.characterAvatars)){ if(!st.characterAvatars[id]){ const v=await dbGet(key); if(v) st.characterAvatars[id]=v; } } }
      try{ applySavedAppearance && applySavedAppearance(); renderGame && renderGame(); }catch(e){}
    }catch(e){ console.warn('hydrate asset failed', e); }
  }

  const oldSave = window.save || (typeof save==='function'?save:null);
  if(oldSave && !oldSave.__v11616SlimSave){
    const wrapped=function(){
      enforceHouse();
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(slimState(stateNow()))); }
      catch(e){ console.warn('slim save failed', e); try{ toast && toast('保存失败：图片过大。系统已压缩图片，请重新尝试保存。'); }catch(_){} }
    };
    wrapped.__v11616SlimSave=true; window.save=wrapped; try{ save=wrapped; }catch(e){}
  }

  window.openSaveLoad = function(isSave=true){
    const dlg=q('#saveDialog'), content=q('#saveDialogContent'); if(!dlg||!content) return;
    function meta(){ try{return JSON.parse(localStorage.getItem(META_SAVE_KEY)||'[null,null,null,null]');}catch(e){return [null,null,null,null];} }
    function setMeta(m){ localStorage.setItem(META_SAVE_KEY, JSON.stringify(Array.from({length:4},(_,i)=>m[i]||null))); }
    const m=meta();
    content.innerHTML=`<div class="paper"><h3>${isSave?'存档':'读档'}</h3><div class="save-grid">${Array.from({length:4},(_,i)=>{
      const s=m[i]; const txt=s?`${esc(s.realTime)}<br>游戏时间：${s.year}年${s.month}月<br>${esc(s.name||'新生')}${s.ended?'<br>已达成结局：不可继续':''}`:'空存档位';
      return `<div class="save-slot"><b>存档位 ${i+1}</b><p>${txt}</p><div class="slot-actions"><button class="btn secondary" data-slot-v11616="${isSave?'save':'load'}" data-slot-index="${i}">${isSave?'保存到此处':'读取此存档'}</button><button class="btn danger small" data-slot-v11616="delete" data-slot-index="${i}">删除</button></div></div>`;
    }).join('')}</div></div>`;
    qa('[data-slot-v11616]', content).forEach(btn=>btn.onclick=async()=>{
      const act=btn.dataset.slotV11616, i=+btn.dataset.slotIndex, mm=meta();
      if(act==='save'){
        try{ enforceHouse(); const st=slimState(stateNow()); await dbSet(SLOT_PREFIX+i, st); mm[i]={realTime:new Date().toLocaleString(),year:st.time?.year||1991,month:st.time?.month||8,name:st.player?.name||'新生',ended:!!st.ended}; setMeta(mm); toast('存档完成'); window.openSaveLoad(true); }
        catch(e){ console.warn(e); toast('存档失败：请重新上传较小的图片或删除旧存档。'); }
      }else if(act==='load'){
        if(!mm[i]){ toast('这里还没有存档哦。'); return; }
        const st=await dbGet(SLOT_PREFIX+i); if(!st){ toast('存档数据缺失。'); return; }
        if(st.ended){ toast('这个存档已经进入结局，无法继续。'); return; }
        state=st; try{ migrateState(); }catch(e){} enforceHouse(); try{ save(); }catch(e){} try{ dlg.close(); }catch(e){} try{ await hydrateAssetsToState(); }catch(e){} try{ go('screen-game-home'); renderGame(); }catch(e){}
      }else if(act==='delete'){
        try{ await dbSet(SLOT_PREFIX+i, null); }catch(e){} mm[i]=null; setMeta(mm); toast('存档已删除'); window.openSaveLoad(isSave);
      }
    });
    try{ dlg.showModal(); }catch(e){ dlg.setAttribute('open',''); }
  };
  try{ openSaveLoad=window.openSaveLoad; }catch(e){}

  document.addEventListener('change', async function(e){
    const input=e.target; const file=input?.files?.[0]; if(!file) return;
    const isBg=input.matches('#bgUpload'); const isPlayer=input.matches('#avatarInput'); const charId=input.dataset?.charAvatar || input.dataset?.detailAvatarUpload;
    if(!isBg && !isPlayer && !charId) return;
    e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    try{
      toast && toast('正在压缩并保存图片，请稍等。');
      const data=await compress(file, isBg?1300:520, isBg?.66:.72);
      const st=stateNow(); if(!st) return;
      st.assetRefs=st.assetRefs||{};
      if(isBg){ await dbSet('customBg', data); st.assetRefs.customBg='customBg'; st.customBg=data; try{ applySavedAppearance && applySavedAppearance(); }catch(_){} }
      else if(isPlayer){ await dbSet('playerAvatar', data); st.assetRefs.playerAvatar='playerAvatar'; st.player=st.player||{}; st.player.avatar=data; const pre=q('#avatarPreview'), ph=q('#avatarPlaceholder'); if(pre){pre.src=data;pre.style.display='block';} if(ph)ph.style.display='none'; }
      else if(charId){ await dbSet('char_'+charId, data); st.assetRefs.characterAvatars=st.assetRefs.characterAvatars||{}; st.assetRefs.characterAvatars[charId]='char_'+charId; st.characterAvatars=st.characterAvatars||{}; st.characterAvatars[charId]=data; }
      try{ save && save(); renderGame && renderGame(); }catch(_){}
      toast && toast('图片已压缩并保存。');
    }catch(err){ console.warn(err); toast && toast('图片保存失败，请换一张更小的图片。'); }
    return false;
  }, true);

  const oldLoad = window.load || (typeof load==='function'?load:null);
  if(oldLoad && !oldLoad.__v11616HydrateNotice){
    window.load=function(){ const st=oldLoad.apply(this, arguments); setTimeout(()=>{ try{ hydrateAssetsToState(); enforceHouse(); }catch(e){} },0); return st; };
    try{ load=window.load; }catch(e){}
  }

  setInterval(()=>{ enforceHouse(); patchProfileHouseText(); if(q('#screen-profile.active #profileContent')) renderCoreHouseControl(); forceSortingOptionsIfNeeded(); },800);
  enforceHouse();
  setTimeout(()=>{ hydrateAssetsToState(); try{ renderCoreHouseControl(); patchProfileHouseText(); forceSortingOptionsIfNeeded(); }catch(e){} },0);
})();

/* ===== v1.16.17 HARD PLAYER HOUSE CORE PATCH =====
   Fixes: house is a core player property, not an AI-derived value.
   - Attribute page change writes directly to state.player.house / state.house and all previous canonical keys.
   - Profile display reads ONLY the hard player house after it exists.
   - Sorting step presents exactly four explicit options, and choosing one completes sorting with that house.
*/
(function(){
  if(window.__v11617HardPlayerHouseCorePatch) return;
  window.__v11617HardPlayerHouseCorePatch = true;

  const HOUSES = ['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'];
  const HARD_KEY = 'hp_rpg_player_house_CORE_v11617';
  const LEGACY_KEYS = [
    'hp_rpg_absolute_player_house_v11614',
    'hp_rpg_canonical_house_v11615',
    'hp_rpg_player_house_canonical_v11616'
  ];
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function norm(v){ const t=String(v||''); return HOUSES.find(h=>t.includes(h)) || null; }
  function st(){ return (typeof state!=='undefined' && state) ? state : null; }
  function getCoreHouse(){
    const S=st();
    const candidates=[S?.player?.house, S?.houseCore, S?.house, S?.houseOverride, S?.lockedHouse, localStorage.getItem(HARD_KEY)];
    for(const c of candidates){ const h=norm(c); if(h) return h; }
    return null;
  }
  function persistHouseKeys(h){
    try{ localStorage.setItem(HARD_KEY,h); }catch(e){}
    LEGACY_KEYS.forEach(k=>{try{localStorage.setItem(k,h);}catch(e){}});
  }
  function setCoreHouse(h, opts={}){
    h=norm(h); const S=st(); if(!h||!S) return false;
    S.player=S.player||{};
    S.player.house=h;             // 核心字段：像姓名、性别、血统一样
    S.house=h;
    S.houseCore=h;
    S.houseOverride=h;
    S.lockedHouse=h;
    S.playerHouseLockedValue=h;
    S.playerHouseLocked=true;
    S.houseManualLocked=true;
    S.houseSource='player';
    S.eventFlags=S.eventFlags||{};
    S.eventFlags.player_selected_house=true;
    S.eventFlags.house_core_locked_v11617=true;
    S.memories=S.memories||[];
    if(!S.memories.includes('core_house_'+h)) S.memories.push('core_house_'+h);
    persistHouseKeys(h);
    if(opts.narrate) appendHouseNarration(h);
    try{ if(opts.toast!==false && typeof toast==='function') toast(`学院已确认：${h}`); }catch(e){}
    try{ if(typeof save==='function') save(); }catch(e){}
    patchProfileHouseDisplay();
    return true;
  }
  function enforceCoreHouse(){
    const h=getCoreHouse(); const S=st(); if(!h||!S) return h;
    S.player=S.player||{};
    if(S.player.house!==h || S.house!==h || S.houseCore!==h || S.houseOverride!==h || S.lockedHouse!==h){
      S.player.house=h; S.house=h; S.houseCore=h; S.houseOverride=h; S.lockedHouse=h;
      S.playerHouseLockedValue=h; S.playerHouseLocked=true; S.houseManualLocked=true; S.houseSource='player';
    }
    persistHouseKeys(h);
    return h;
  }
  function mainThread(){
    const S=st(); if(!S) return null;
    S.storyThreads=S.storyThreads||{};
    let id='main_global_persistent_thread';
    try{ if(typeof threadIdFor==='function') id=threadIdFor('main','global'); }catch(e){}
    if(typeof ensureThread==='function') return ensureThread(id,'');
    S.storyThreads[id]=S.storyThreads[id]||{id,blocks:[]};
    return S.storyThreads[id];
  }
  function appendHouseNarration(h){
    const th=mainThread(); if(!th) return;
    th.blocks=th.blocks||[];
    const line=`【旁白】邓布利多接受了你更改学院的要求，从现在开始，你便是${h}的学生了。`;
    const last=th.blocks[th.blocks.length-1];
    if(last && last.ai===line) return;
    th.blocks.push({ai:line, time:JSON.parse(JSON.stringify(st()?.time||{})), houseChange:true});
  }
  function patchProfileHouseDisplay(){
    const h=enforceCoreHouse();
    const root=q('#profileContent'); if(!root) return;
    qa('p,span,div,b',root).forEach(el=>{
      const txt=(el.textContent||'').trim();
      if(/^学院：/.test(txt)) el.textContent=`学院：${h||'未知'}`;
    });
    qa('[data-house-core-v11617]',root).forEach(btn=>btn.classList.toggle('selected', btn.dataset.houseCoreV11617===h));
  }
  function renderCoreHouseUI(){
    const root=q('#profileContent'); if(!root) return;
    // 删除所有旧学院控件，避免旧补丁抢状态
    qa('#houseChoiceButtonsV1166,#houseChoiceButtonsV1169,#houseChoiceButtonsV11611,#houseChoiceButtonsV11612,#houseChoiceButtonsV11614,#houseChoiceButtonsV11615,#houseCoreFieldV11616,#houseCoreFieldV11617',root).forEach(x=>x.remove());
    const card=root.querySelector('.game-card'); if(!card) return;
    const h=getCoreHouse()||norm(st()?.house)||'未知';
    const S=st(); if(S && !norm(S._pendingHouseChange)) S._pendingHouseChange = h==='未知' ? '格兰芬多' : h;
    const pending=norm(S?._pendingHouseChange)||'格兰芬多';
    const box=document.createElement('div');
    box.id='houseCoreFieldV11617';
    box.className='house-choice-buttons';
    box.innerHTML=`<p class="small">学院是角色核心属性。请选择学院并点击确认；确认后，剧情、宿舍、公共休息室、信件、夜游扣分都必须以这个学院为准。</p>
      <div class="mini-choice-grid house-confirm-grid-v11617">${HOUSES.map(x=>`<button class="btn secondary ${x===pending?'selected':''}" data-house-core-v11617="${x}">${x}</button>`).join('')}</div>
      <button class="btn primary full" id="confirmHouseCoreV11617">确认学院</button>`;
    card.appendChild(box);
    patchProfileHouseDisplay();
  }

  // 公共 API 覆盖：所有旧代码调用这些名字时，最终都写入核心字段
  window.setAuthoritativeHouse = function(h, reason='玩家确认'){ return setCoreHouse(h,{narrate:/确认|属性|手动|玩家|分院/.test(String(reason||'')), toast:true}); };
  window.setPlayerHouse = window.setAuthoritativeHouse;
  window.setHouseHard = window.setAuthoritativeHouse;
  window.getPlayerHouseAbsolute = function(){ return enforceCoreHouse() || '未知'; };
  try{ setAuthoritativeHouse=window.setAuthoritativeHouse; setPlayerHouse=window.setPlayerHouse; setHouseHard=window.setHouseHard; }catch(e){}

  // 属性界面点击：只认这个控件
  document.addEventListener('click',function(e){
    const choose=e.target.closest('[data-house-core-v11617]');
    if(choose){
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      const S=st(); if(S) S._pendingHouseChange=choose.dataset.houseCoreV11617;
      qa('[data-house-core-v11617]').forEach(b=>b.classList.remove('selected'));
      choose.classList.add('selected');
      return false;
    }
    const confirm=e.target.closest('#confirmHouseCoreV11617');
    if(confirm){
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      const h=norm(st()?._pendingHouseChange)||getCoreHouse()||'格兰芬多';
      setCoreHouse(h,{narrate:true,toast:true});
      try{ if(typeof renderGame==='function') renderGame(); }catch(err){}
      try{ if(q('#screen-mainline.active') && typeof renderThreadToUI==='function') renderThreadToUI(mainThread(),'mainlineText','mainlineOptions','main'); }catch(err){}
      return false;
    }
  },true);

  // 分院帽正式提出分院时：只在 currentMainStep().step === 'sorting' 这个正式分院锚点显示四个选项
  function sortingActive(){
    try{ const info=(typeof currentMainStep==='function') ? currentMainStep() : null; return info && info.step==='sorting'; }catch(e){ return false; }
  }
  function renderSortingHouseOptions(){
    if(!sortingActive()) return;
    const opt=q('#mainlineOptions'); if(!opt) return;
    opt.innerHTML=`<div class="story-options">${HOUSES.map((h,i)=>`<button data-main-choice="${i}" data-choice-text="选择${h}" data-sort-house-v11617="${h}">${String.fromCharCode(65+i)}. 选择${h}</button>`).join('')}</div>`;
  }
  const oldMainlineOptions = window.mainlineOptions || (typeof mainlineOptions==='function'?mainlineOptions:null);
  window.mainlineOptions=function(step){
    if(step==='sorting') return HOUSES.map(h=>`选择${h}`);
    return oldMainlineOptions ? oldMainlineOptions.apply(this,arguments) : ['继续观察','主动询问','保持沉默'];
  };
  try{ mainlineOptions=window.mainlineOptions; }catch(e){}

  const oldResolve=window.resolveMainChoice || (typeof resolveMainChoice==='function'?resolveMainChoice:null);
  if(oldResolve){
    window.resolveMainChoice=async function(idx, customText){
      if(sortingActive()){
        const action=customText||'';
        const h=norm(action)||HOUSES[idx]||null;
        if(h){
          const th=mainThread();
          if(th){
            th.blocks=th.blocks||[];
            th.blocks.push({player:`我选择${h}`});
            th.blocks.push({ai:`【旁白】分院帽在你头顶沉默了片刻，随后高声宣布：“${h}！”从这一刻起，你便是${h}的学生了。`, time:JSON.parse(JSON.stringify(st()?.time||{})), sorting:true});
          }
          setCoreHouse(h,{narrate:false,toast:true});
          try{ if(typeof completeStep==='function') completeStep('sorting'); }catch(e){}
          try{ if(typeof save==='function') save(); if(typeof renderGame==='function') renderGame(); }catch(e){}
          try{ if(typeof renderThreadToUI==='function') renderThreadToUI(th,'mainlineText','mainlineOptions','main'); }catch(e){}
          return;
        }
      }
      const before=enforceCoreHouse();
      const res=await oldResolve.apply(this,arguments);
      if(before) setCoreHouse(before,{toast:false,narrate:false}); else enforceCoreHouse();
      return res;
    };
    try{ resolveMainChoice=window.resolveMainChoice; }catch(e){}
  }
  document.addEventListener('click',function(e){
    const b=e.target.closest('[data-sort-house-v11617]');
    if(!b) return;
    // 不在这里直接阻止，让 resolveMainChoice 统一完成线程和锚点；这里只提前写状态防止旧处理覆盖
    setCoreHouse(b.dataset.sortHouseV11617,{toast:false,narrate:false});
  },true);

  // 守卫：旧效果函数/AI不得改学院
  ['applyMainStepEffects','applyMainChoiceEffects','applyChoiceEffects','afterAIResponse','renderGame','renderProfile','save'].forEach(name=>{
    const fn=window[name] || (typeof globalThis[name]==='function'?globalThis[name]:null);
    if(typeof fn==='function' && !fn.__v11617HouseCoreGuard){
      const wrapped=function(){ const before=enforceCoreHouse(); const res=fn.apply(this,arguments); if(before) setCoreHouse(before,{toast:false,narrate:false}); patchProfileHouseDisplay(); return res; };
      wrapped.__v11617HouseCoreGuard=true; window[name]=wrapped; try{ globalThis[name]=wrapped; }catch(e){}
    }
  });
  const oldContext=window.contextPrompt || (typeof contextPrompt==='function'?contextPrompt:null);
  if(oldContext && !oldContext.__v11617HouseCoreContext){
    const wrapped=function(){
      const h=enforceCoreHouse() || '未知';
      return oldContext.apply(this,arguments)+`\n【学院核心属性强制规则 v1.16.17】玩家当前学院=${h}。学院与姓名、性别、血统一样是代码记录的核心属性。只有玩家在分院四选项或属性界面确认按钮中选择学院时才能更改。AI、分院帽旧文本、NPC、剧情推测都不得改变。后续宿舍、公共休息室、学院长桌、课堂同院关系、夜游扣分、信件称呼、羁绊剧情必须全部承认玩家是${h}学生。`;
    };
    wrapped.__v11617HouseCoreContext=true; window.contextPrompt=wrapped; try{ contextPrompt=wrapped; }catch(e){}
  }

  // 周期性刷新：防止旧补丁延迟重绘覆盖属性页控件
  setInterval(()=>{ enforceCoreHouse(); patchProfileHouseDisplay(); if(q('#screen-profile.active #profileContent')) renderCoreHouseUI(); if(q('#screen-mainline.active')) renderSortingHouseOptions(); },700);
  setTimeout(()=>{ enforceCoreHouse(); renderCoreHouseUI(); patchProfileHouseDisplay(); renderSortingHouseOptions(); },0);
})();

/* ===== v1.16.18 Durable Save Storage + Upload Compression Patch =====
   Stores save slots in IndexedDB and stores uploaded images once as compressed assets.
   This prevents large backgrounds/avatars from making save slots disappear.
*/
(function(){
  if(window.__v11618DurableSavePatch) return;
  window.__v11618DurableSavePatch = true;

  const DB_NAME='hp_rpg_durable_storage_v11618';
  const SAVE_STORE='saves';
  const ASSET_STORE='assets';
  const META_KEY='hp_rpg_save_meta_v11618';
  const SLOT_PREFIX='slot_';
  const ASSET_BG='global_background';
  const ASSET_PLAYER='player_avatar';
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function curState(){ return (typeof state!=='undefined' && state) ? state : null; }
  function notify(msg){ try{ toast(msg); }catch(e){ console.log(msg); } }

  function openDB(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window)){ reject(new Error('IndexedDB unavailable')); return; }
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{
        const db=req.result;
        if(!db.objectStoreNames.contains(SAVE_STORE)) db.createObjectStore(SAVE_STORE);
        if(!db.objectStoreNames.contains(ASSET_STORE)) db.createObjectStore(ASSET_STORE);
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error || new Error('IndexedDB open failed'));
    });
  }
  async function idbPut(store,key,val){
    const db=await openDB();
    return new Promise((res,rej)=>{
      const tx=db.transaction(store,'readwrite');
      tx.objectStore(store).put(val,key);
      tx.oncomplete=()=>res(true);
      tx.onerror=()=>rej(tx.error || new Error('IndexedDB put failed'));
    });
  }
  async function idbGet(store,key){
    const db=await openDB();
    return new Promise((res,rej)=>{
      const tx=db.transaction(store,'readonly');
      const r=tx.objectStore(store).get(key);
      r.onsuccess=()=>res(r.result);
      r.onerror=()=>rej(r.error || new Error('IndexedDB get failed'));
    });
  }
  async function idbDel(store,key){
    const db=await openDB();
    return new Promise((res,rej)=>{
      const tx=db.transaction(store,'readwrite');
      tx.objectStore(store).delete(key);
      tx.oncomplete=()=>res(true);
      tx.onerror=()=>rej(tx.error || new Error('IndexedDB delete failed'));
    });
  }

  async function storageHint(){
    try{
      if(navigator.storage?.persist) await navigator.storage.persist();
      if(navigator.storage?.estimate){
        const e=await navigator.storage.estimate();
        const used=e.usage||0, quota=e.quota||0;
        if(quota){
          const pct=Math.round(used/quota*100);
          return `浏览器存储：已用 ${Math.round(used/1024/1024)}MB / ${Math.round(quota/1024/1024)}MB（${pct}%）`;
        }
      }
    }catch(e){}
    return '浏览器存储：可用容量由当前设备决定。';
  }

  async function compressImageSource(src,maxSide=1000,quality=.58){
    const img=await new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=src; });
    let w=img.naturalWidth||img.width, h=img.naturalHeight||img.height;
    const scale=Math.min(1,maxSide/Math.max(w,h));
    w=Math.max(1,Math.round(w*scale)); h=Math.max(1,Math.round(h*scale));
    const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
    canvas.getContext('2d').drawImage(img,0,0,w,h);
    return canvas.toDataURL('image/jpeg',quality);
  }
  function readFileData(file){ return new Promise((res,rej)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(file); }); }
  async function compressUpload(file,type){
    const original=await readFileData(file);
    let data=await compressImageSource(original, type==='background'?1200:460, type==='background'?.58:.66);
    if(type==='background' && data.length>1800000) data=await compressImageSource(data,900,.46);
    if(type!=='background' && data.length>800000) data=await compressImageSource(data,360,.56);
    return data;
  }

  function getMeta(){
    try{ const m=JSON.parse(localStorage.getItem(META_KEY)||'[null,null,null,null]'); return Array.from({length:4},(_,i)=>m[i]||null); }
    catch(e){ return [null,null,null,null]; }
  }
  function setMeta(m){ localStorage.setItem(META_KEY, JSON.stringify(Array.from({length:4},(_,i)=>m[i]||null))); }

  async function storeAssetsFromState(s){
    if(!s) return;
    s.assetRefs=s.assetRefs||{};
    if(s.customBg && String(s.customBg).startsWith('data:')){
      let data=s.customBg;
      if(data.length>1800000) data=await compressImageSource(data,900,.45);
      await idbPut(ASSET_STORE,ASSET_BG,data);
      s.assetRefs.customBg=ASSET_BG;
    }
    if(s.player?.avatar && String(s.player.avatar).startsWith('data:')){
      let data=s.player.avatar;
      if(data.length>800000) data=await compressImageSource(data,360,.56);
      await idbPut(ASSET_STORE,ASSET_PLAYER,data);
      s.assetRefs.playerAvatar=ASSET_PLAYER;
    }
    if(s.characterAvatars){
      s.assetRefs.characterAvatars=s.assetRefs.characterAvatars||{};
      for(const [id,val] of Object.entries(s.characterAvatars)){
        if(String(val||'').startsWith('data:')){
          let data=val;
          if(data.length>800000) data=await compressImageSource(data,360,.56);
          const key='char_'+id;
          await idbPut(ASSET_STORE,key,data);
          s.assetRefs.characterAvatars[id]=key;
        }
      }
    }
  }

  function slimForSave(s){
    const copy=JSON.parse(JSON.stringify(s||{}));
    copy.assetRefs=copy.assetRefs||{};
    if(copy.customBg && String(copy.customBg).startsWith('data:')){ copy.assetRefs.customBg=ASSET_BG; copy.customBg=''; }
    if(copy.player?.avatar && String(copy.player.avatar).startsWith('data:')){ copy.assetRefs.playerAvatar=ASSET_PLAYER; copy.player.avatar=''; }
    if(copy.characterAvatars){
      copy.assetRefs.characterAvatars=copy.assetRefs.characterAvatars||{};
      for(const id of Object.keys(copy.characterAvatars)){
        if(String(copy.characterAvatars[id]||'').startsWith('data:')){ copy.assetRefs.characterAvatars[id]='char_'+id; copy.characterAvatars[id]=''; }
      }
    }
    if(copy.aiCache) copy.aiCache={};
    return copy;
  }

  async function hydrateAssets(s){
    if(!s) return s;
    s.assetRefs=s.assetRefs||{};
    if(s.assetRefs.customBg && !s.customBg){ const v=await idbGet(ASSET_STORE,s.assetRefs.customBg); if(v) s.customBg=v; }
    if(s.assetRefs.playerAvatar && s.player && !s.player.avatar){ const v=await idbGet(ASSET_STORE,s.assetRefs.playerAvatar); if(v) s.player.avatar=v; }
    if(s.assetRefs.characterAvatars){
      s.characterAvatars=s.characterAvatars||{};
      for(const [id,key] of Object.entries(s.assetRefs.characterAvatars)){
        if(!s.characterAvatars[id]){ const v=await idbGet(ASSET_STORE,key); if(v) s.characterAvatars[id]=v; }
      }
    }
    return s;
  }

  async function saveSlot(index){
    const s=curState();
    if(!s){ notify('没有可保存的游戏数据。'); return; }
    try{
      if(navigator.storage?.persist) await navigator.storage.persist();
      await storeAssetsFromState(s);
      const slim=slimForSave(s);
      await idbPut(SAVE_STORE,SLOT_PREFIX+index,slim);
      const m=getMeta();
      m[index]={realTime:new Date().toLocaleString(),year:slim.time?.year||1991,month:slim.time?.month||8,name:slim.player?.name||'新生',ended:!!slim.ended};
      setMeta(m);
      notify('存档完成。');
      window.openSaveLoad(true);
    }catch(e){
      console.warn('save slot failed',e);
      const hint=await storageHint();
      notify('存档失败：浏览器容量不足或当前设备限制。'+hint+' 请删除旧存档、清理浏览器缓存，或换一张更小的底图。');
    }
  }
  async function loadSlot(index){
    try{
      const m=getMeta();
      if(!m[index]){ notify('这里还没有存档哦。'); return; }
      const loaded=await idbGet(SAVE_STORE,SLOT_PREFIX+index);
      if(!loaded){ notify('存档数据缺失。'); return; }
      if(loaded.ended){ notify('这个存档已经进入结局，无法继续。'); return; }
      state=await hydrateAssets(loaded);
      try{ migrateState(); }catch(e){}
      try{ if(typeof enforceCoreHouse==='function') enforceCoreHouse(); }catch(e){}
      try{ if(typeof enforceHouse==='function') enforceHouse(); }catch(e){}
      try{ save(); }catch(e){}
      const dlg=q('#saveDialog'); try{ dlg&&dlg.close(); }catch(e){}
      try{ applySavedAppearance&&applySavedAppearance(); renderGame&&renderGame(); go&&go('screen-game-home'); }catch(e){}
      notify('读档完成。');
    }catch(e){ console.warn('load slot failed',e); notify('读档失败，请刷新后再试。'); }
  }
  async function deleteSlot(index,isSave){
    try{ await idbDel(SAVE_STORE,SLOT_PREFIX+index); }catch(e){}
    const m=getMeta(); m[index]=null; setMeta(m);
    notify('存档已删除。');
    window.openSaveLoad(isSave);
  }

  window.openSaveLoad=async function(isSave=true){
    const dlg=q('#saveDialog'), content=q('#saveDialogContent'); if(!dlg||!content) return;
    const m=getMeta();
    const hint=await storageHint();
    content.innerHTML=`<div class="paper"><h3>${isSave?'存档':'读档'}</h3><p class="hint small">${esc(hint)}。图片会自动压缩并单独保存，存档不会重复塞入大图片。</p><div class="save-grid">${Array.from({length:4},(_,i)=>{
      const s=m[i];
      const txt=s?`${esc(s.realTime)}<br>游戏时间：${esc(s.year)}年${esc(s.month)}月<br>${esc(s.name||'新生')}${s.ended?'<br>已达成结局：不可继续':''}`:'空存档位';
      return `<div class="save-slot"><b>存档位 ${i+1}</b><p>${txt}</p><div class="slot-actions"><button class="btn secondary" data-save-v11618="${isSave?'save':'load'}" data-slot-index="${i}">${isSave?'保存到此处':'读取此存档'}</button><button class="btn danger small" data-save-v11618="delete" data-slot-index="${i}">删除</button></div></div>`;
    }).join('')}</div></div>`;
    qa('[data-save-v11618]',content).forEach(btn=>btn.onclick=()=>{
      const i=+btn.dataset.slotIndex, act=btn.dataset.saveV11618;
      if(act==='save') saveSlot(i);
      else if(act==='load') loadSlot(i);
      else if(act==='delete') deleteSlot(i,isSave);
    });
    try{ dlg.showModal(); }catch(e){ dlg.setAttribute('open',''); }
  };
  try{ openSaveLoad=window.openSaveLoad; }catch(e){}

  const oldSave=window.save || (typeof save==='function'?save:null);
  if(oldSave && !oldSave.__v11618SlimAutosave){
    const wrapped=function(){
      try{
        const s=curState();
        if(s){ localStorage.setItem(STORAGE_KEY,JSON.stringify(slimForSave(s))); return; }
      }catch(e){ console.warn('autosave slim failed',e); }
      try{ oldSave.apply(this,arguments); }catch(e2){ console.warn('legacy save failed',e2); }
    };
    wrapped.__v11618SlimAutosave=true;
    window.save=wrapped; try{ save=wrapped; }catch(e){}
  }

  // Final upload handler: compress first, store in IndexedDB, then keep data in current state for immediate display.
  document.addEventListener('change',async function(e){
    const input=e.target, file=input?.files?.[0]; if(!file) return;
    const isBg=input.matches('#bgUpload');
    const isPlayer=input.matches('#avatarInput');
    const charId=input.dataset?.charAvatar || input.dataset?.detailAvatarUpload;
    if(!isBg && !isPlayer && !charId) return;
    e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    try{
      notify('正在压缩并保存图片，请稍等。');
      const data=await compressUpload(file,isBg?'background':'avatar');
      const s=curState(); if(!s) return;
      s.assetRefs=s.assetRefs||{};
      if(isBg){ await idbPut(ASSET_STORE,ASSET_BG,data); s.assetRefs.customBg=ASSET_BG; s.customBg=data; try{ applySavedAppearance&&applySavedAppearance(); }catch(e){} }
      else if(isPlayer){ await idbPut(ASSET_STORE,ASSET_PLAYER,data); s.assetRefs.playerAvatar=ASSET_PLAYER; s.player=s.player||{}; s.player.avatar=data; const pre=q('#avatarPreview'), ph=q('#avatarPlaceholder'); if(pre){pre.src=data;pre.style.display='block';} if(ph) ph.style.display='none'; }
      else if(charId){ const key='char_'+charId; await idbPut(ASSET_STORE,key,data); s.assetRefs.characterAvatars=s.assetRefs.characterAvatars||{}; s.assetRefs.characterAvatars[charId]=key; s.characterAvatars=s.characterAvatars||{}; s.characterAvatars[charId]=data; }
      try{ save(); renderGame&&renderGame(); }catch(e){}
      notify('图片已压缩并保存。');
    }catch(err){
      console.warn('upload compression/storage failed',err);
      const hint=await storageHint();
      notify('图片保存失败：容量不足或图片过大。'+hint+' 请换一张更小的图片。');
    }
    return false;
  },true);

  setTimeout(async()=>{
    try{ const s=curState(); if(s){ await hydrateAssets(s); applySavedAppearance&&applySavedAppearance(); renderGame&&renderGame(); } }catch(e){}
  },0);
})();

/* ===== v1.16.19 Dean House Notice + Avatar + Continue Fix =====
   Requested fixes only:
   1) Changing house no longer relies on AI remembering; the corresponding Head of House appears/sends notice in mainline and informs everyone.
   2) Romanceable character dialogue in mainline/bond/night keeps avatar bubbles.
   3) Cover Continue button reliably opens load dialog.
   Save system from v1.16.18 is intentionally left unchanged.
*/
(function(){
  if(window.__v11619DeanAvatarContinueFix) return;
  window.__v11619DeanAvatarContinueFix = true;

  const HOUSE_LIST=['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'];
  const HOUSE_HEAD={
    '格兰芬多':'麦格教授',
    '斯莱特林':'斯内普教授',
    '拉文克劳':'弗立维教授',
    '赫奇帕奇':'斯普劳特教授'
  };
  const $q=(s,r=document)=>r.querySelector(s);
  const $$q=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function st(){ return window.state || (typeof state!=='undefined'?state:null); }
  function houseNorm(h){ const t=String(h||''); return HOUSE_LIST.find(x=>t.includes(x)) || ''; }
  function toastSafe(msg){ try{ toast(msg); }catch(e){ console.log(msg); } }
  function saveSafe(){ try{ save(); }catch(e){} }
  function renderSafe(){ try{ renderGame(); }catch(e){} }

  function ensurePlayerHouseCore(house){
    const s=st(); if(!s) return '';
    const h=houseNorm(house) || houseNorm(s.player?.house) || houseNorm(s.houseOverride) || houseNorm(s.lockedHouse) || houseNorm(s.house) || '未知';
    if(h && h!=='未知'){
      s.player=s.player||{};
      s.player.house=h;
      s.house=h;
      s.houseOverride=h;
      s.lockedHouse=h;
      s.playerHouseLockedValue=h;
      s.houseCore=h;
      s.houseManualLocked=true;
      s.houseSource='player';
      s.eventFlags=s.eventFlags||{};
      s.eventFlags.player_selected_house=true;
      try{ localStorage.setItem('hp_rpg_absolute_player_house_v11614', h); }catch(e){}
    }
    return h;
  }

  function mainThreadForNotice(){
    const s=st(); if(!s) return null;
    s.storyThreads=s.storyThreads||{};
    const key=`main_${s.time?.year||1991}-${s.time?.month||8}_house_change_notice`;
    if(!s.storyThreads[key]) s.storyThreads[key]={blocks:[],turns:0};
    return s.storyThreads[key];
  }

  function appendDeanNotice(house){
    const s=st(); if(!s) return;
    const h=ensurePlayerHouseCore(house);
    if(!h || h==='未知') return;
    const head=HOUSE_HEAD[h] || '邓布利多';
    const th=mainThreadForNotice(); if(!th) return;
    const token=`dean_notice_${h}_${Date.now()}`;
    const line=`【旁白】${head}出现在你面前，正式通知你和在场的所有人：从现在开始，${s.player?.name||'你'}便是${h}的学生了。你的宿舍、公共休息室、学院长桌、扣分与学院相关信件，都将按照${h}处理。`;
    th.blocks.push({ai:line, system:true, houseChange:true, token, time:{...(s.time||{})}});
    s.memories=s.memories||[];
    s.memories.push(`house_dean_notice_${h}_${s.time?.year||1991}_${s.time?.month||8}`);
    saveSafe();
    if($q('#screen-mainline')?.classList.contains('active')){
      try{ renderThreadToUI(th,'mainlineText','mainlineOptions','main'); }catch(e){}
    }
  }

  // Final authoritative house setter. Other old setters may exist; this one runs last and writes every known field.
  window.setPlayerHouseFinal = function(house, opts={}){
    const h=ensurePlayerHouseCore(house);
    if(!h || h==='未知') return false;
    if(opts.notice!==false) appendDeanNotice(h);
    toastSafe(`学院已确认：${h}`);
    saveSafe(); renderSafe();
    return true;
  };
  window.setAuthoritativeHouse = function(house, reason='玩家确认'){
    return window.setPlayerHouseFinal(house,{notice:/确认|手动|属性|分院|玩家/.test(String(reason||''))});
  };
  try{ setAuthoritativeHouse=window.setAuthoritativeHouse; }catch(e){}

  // Profile page: remove conflicting old house widgets and use one final control.
  function installFinalHouseControl(){
    const root=$q('#profileContent'); if(!root) return;
    const h=ensurePlayerHouseCore();
    // Fix displayed text even if old render wrote older value.
    $$q('.game-card p',root).forEach(p=>{ if(/^学院：/.test((p.textContent||'').trim())) p.textContent=`学院：${h||'未知'}`; });
    // Remove old duplicated house controls but keep current final control.
    $$q('#houseChoiceButtonsV1166,#houseChoiceButtonsV1169,#houseChoiceButtonsV11611,#houseChoiceButtonsV11612,#houseChoiceButtonsV11614,#houseChoiceButtonsV11615,#houseCoreFieldV11616,#houseFinalControlV11619',root).forEach(x=>x.remove());
    const first=root.querySelector('.game-card'); if(!first) return;
    const wrap=document.createElement('div');
    wrap.id='houseFinalControlV11619';
    wrap.className='house-choice-buttons';
    const pending=houseNorm(st()?._pendingHouseFinal) || h || '格兰芬多';
    wrap.innerHTML=`<p class="small">学院是角色核心属性。选择后点击确认，对应学院院长会在主线中正式通知所有人。</p>
      <div class="mini-choice-grid house-confirm-grid-v11619">${HOUSE_LIST.map(x=>`<button class="btn secondary ${x===pending?'selected':''}" data-house-final-v11619="${x}">${x}</button>`).join('')}</div>
      <button class="btn primary full" id="confirmHouseFinalV11619">确认学院</button>`;
    first.appendChild(wrap);
  }

  const prevRenderProfile=window.renderProfile || (typeof renderProfile==='function'?renderProfile:null);
  if(prevRenderProfile){
    window.renderProfile=function(){
      ensurePlayerHouseCore();
      const res=prevRenderProfile.apply(this,arguments);
      installFinalHouseControl();
      return res;
    };
    try{ renderProfile=window.renderProfile; }catch(e){}
  }
  const prevRenderGame=window.renderGame || (typeof renderGame==='function'?renderGame:null);
  if(prevRenderGame){
    window.renderGame=function(){ ensurePlayerHouseCore(); const res=prevRenderGame.apply(this,arguments); installFinalHouseControl(); return res; };
    try{ renderGame=window.renderGame; }catch(e){}
  }

  document.addEventListener('click',function(e){
    const pick=e.target.closest('[data-house-final-v11619]');
    if(pick){
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      const s=st(); if(s) s._pendingHouseFinal=pick.dataset.houseFinalV11619;
      $$q('[data-house-final-v11619]').forEach(b=>b.classList.remove('selected'));
      pick.classList.add('selected');
      return false;
    }
    const confirm=e.target.closest('#confirmHouseFinalV11619');
    if(confirm){
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      const s=st(); const h=houseNorm(s?._pendingHouseFinal)||houseNorm(s?.player?.house)||houseNorm(s?.house)||'格兰芬多';
      window.setPlayerHouseFinal(h,{notice:true});
      installFinalHouseControl();
      return false;
    }
  },true);

  // Ensure all prompts always use the final player house.
  const oldContext=window.contextPrompt || (typeof contextPrompt==='function'?contextPrompt:null);
  if(oldContext && !oldContext.__v11619HousePrompt){
    const wrapped=function(){
      const h=ensurePlayerHouseCore()||'未知';
      return oldContext.apply(this,arguments)+`\n【最终学院硬规则v1.16.19】玩家当前学院=${h}。这是玩家手动确认的核心属性，与姓名/性别/血统一样，不是AI可判断内容。所有宿舍、公共休息室、学院长桌、夜游扣分、院长、信件、羁绊、NPC称呼都必须以${h}为准。若历史文本出现旧学院，只能视为过去记录或传闻，不得让玩家回到旧学院。`;
    };
    wrapped.__v11619HousePrompt=true;
    window.contextPrompt=wrapped; try{ contextPrompt=wrapped; }catch(e){}
  }

  // Robust romanceable dialogue parser. Also handles “某角色说/问/低声说……” without colon.
  function normName(s){return String(s||'').replace(/[·\s]/g,'').replace(/先生|小姐|教授|学长|学姐|同学/g,'');}
  const alias={
    '哈利':'harry','哈利波特':'harry','波特':'harry','罗恩':'ron','罗恩韦斯莱':'ron','赫敏':'hermione','赫敏格兰杰':'hermione','格兰杰':'hermione',
    '德拉科':'draco','德拉科马尔福':'draco','马尔福':'draco','布雷斯':'blaise','布雷斯扎比尼':'blaise','扎比尼':'blaise','西奥多':'theo','西奥多诺特':'theo','诺特':'theo',
    '弗雷德':'fred','弗雷德韦斯莱':'fred','乔治':'george','乔治韦斯莱':'george','珀西':'percy','珀西韦斯莱':'percy','塞德里克':'cedric','塞德里克迪戈里':'cedric','迪戈里':'cedric',
    '奥利弗':'oliver','奥利弗伍德':'oliver','伍德':'oliver','秋':'cho','秋张':'cho','张秋':'cho','斯内普':'snape','西弗勒斯':'snape','西弗勒斯斯内普':'snape',
    '卢娜':'luna','卢娜洛夫古德':'luna','金妮':'ginny','金妮韦斯莱':'ginny','汤姆':'tom','汤姆里德尔':'tom','里德尔':'tom','小天狼星':'sirius','小天狼星布莱克':'sirius',
    '卢平':'lupin','莱姆斯':'lupin','莱姆斯卢平':'lupin','克鲁姆':'krum','维克多尔':'krum','维克多尔克鲁姆':'krum'
  };
  function idFromSpeaker(name){
    const s=st(); const n=normName(name);
    if(alias[n]) return alias[n];
    for(const [id,r] of Object.entries(s?.relations||{})){
      const rn=normName(r.name);
      if(n===rn || rn.includes(n) || n.includes(rn)) return id;
    }
    return '';
  }
  function markMet(id){ const s=st(); const r=s?.relations?.[id]; if(r){ r.met=true; r.visible=true; } }
  function avatarHTML(id){ try{return charAvatar(id);}catch(e){ const r=st()?.relations?.[id]; return `<div class="char-avatar">${safe((r?.name||id).slice(0,1))}</div>`; } }
  function splitText(text){
    if(typeof splitStoryText==='function') return splitStoryText(text||'');
    const idx=String(text||'').lastIndexOf('【选项】');
    return idx>=0?{scene:String(text).slice(0,idx).trim(),optionsText:String(text).slice(idx+4).trim()}:{scene:String(text||'').trim(),optionsText:''};
  }
  window.parseStory=function(text,targetTextId,targetOptId,type){
    const narr=$q('#'+targetTextId), opt=$q('#'+targetOptId); if(!narr||!opt) return;
    const parts=splitText(text||'');
    const rawLines=parts.scene.split(/\n+/).filter(Boolean);
    const options=parts.optionsText.split(/\n+/).map(x=>x.replace(/^[A-D][\.、]\s*/,'').trim()).filter(Boolean).slice(0,4);
    narr.innerHTML='';
    for(let line of rawLines){
      let clean=String(line).replace(/^【旁白】/,'').trim(); if(!clean) continue;
      if(/^【选项】/.test(clean) || /^[A-D][\.、]/.test(clean)) continue;
      if(clean.startsWith('玩家行动：')||clean.startsWith('你选择：')||clean.startsWith('你：')){
        const v=clean.replace(/^玩家行动：|^你选择：|^你：/,'').trim();
        narr.insertAdjacentHTML('beforeend',`<div class="player-action-line">${safe(v)}</div>`); continue;
      }
      let m=clean.match(/^([^：:]{1,18})[：:](.+)$/);
      if(!m){
        // e.g. “德拉科低声说：……” or “哈利问你，要不要……”
        m=clean.match(/^(.{1,18}?)(?:低声说|轻声说|说道|说|问道|问|喊道|笑着说|皱眉说|冷冷地说)[，,：:「“\"]?(.+?)[」”\"]?$/);
      }
      if(m){
        const id=idFromSpeaker(m[1]);
        if(id && st()?.relations?.[id]){
          markMet(id);
          narr.insertAdjacentHTML('beforeend',`<div class="dialog-line">${avatarHTML(id)}<div class="speech-bubble"><b>${safe(st().relations[id].name)}</b>${safe(m[2].trim())}</div></div>`);
          continue;
        }
      }
      narr.insertAdjacentHTML('beforeend',`<div class="narrator-line">${safe(clean)}</div>`);
    }
    if(options.length){
      opt.innerHTML=`<div class="story-options">${options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${safe(o)}">${String.fromCharCode(65+i)}. ${safe(o)}</button>`).join('')}</div>`;
    }else opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    narr.scrollTop=narr.scrollHeight;
    saveSafe();
  };
  try{ parseStory=window.parseStory; }catch(e){}

  // Cover Continue button: always open load dialog or warn. Use capture and late binding to beat old handlers.
  function bindContinue(){
    const btn=$q('#continueBtn'); if(!btn) return;
    btn.onclick=function(e){
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      try{ if(typeof openSaveLoad==='function') openSaveLoad(false); else window.openSaveLoad(false); }catch(err){ alert('暂时无法打开读档界面，请刷新后再试。'); }
      return false;
    };
  }
  document.addEventListener('click',function(e){
    const btn=e.target.closest('#continueBtn'); if(!btn) return;
    e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    try{ if(typeof openSaveLoad==='function') openSaveLoad(false); else window.openSaveLoad(false); }catch(err){ alert('暂时无法打开读档界面，请刷新后再试。'); }
    return false;
  },true);

  setInterval(()=>{ ensurePlayerHouseCore(); bindContinue(); if($q('#screen-profile.active #profileContent')) installFinalHouseControl(); },700);
  setTimeout(()=>{ ensurePlayerHouseCore(); bindContinue(); renderSafe(); },100);
})();

/* ===== v1.16.20 Hard Dean Narrative + Robust Avatar Rendering Patch =====
   Fixes only:
   1) Attribute-page house confirmation immediately inserts a fixed, coded dean notice into the active mainline thread.
   2) Romanceable character lines in mainline/bond/night render as avatar + speech bubble, including “角色说/问/低声说...” forms.
   Save/storage logic is untouched.
*/
(function(){
  if(window.__v11620DeanNarrativeAvatarPatch) return;
  window.__v11620DeanNarrativeAvatarPatch = true;

  const HOUSE_LIST=['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'];
  const HOUSE_HEAD={
    '格兰芬多':'麦格教授',
    '斯莱特林':'斯内普教授',
    '拉文克劳':'弗立维教授',
    '赫奇帕奇':'斯普劳特教授'
  };
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const S=()=>window.state || (typeof state!=='undefined'?state:null);
  const normHouse=h=>HOUSE_LIST.find(x=>String(h||'').includes(x)) || '';
  const safeSave=()=>{try{save();}catch(e){console.warn('save failed',e);}};
  const safeRender=()=>{try{renderGame();}catch(e){console.warn('render failed',e);}};

  function writeCoreHouse(house){
    const s=S(); if(!s) return '';
    const h=normHouse(house); if(!h) return '';
    s.player=s.player||{};
    s.player.house=h;
    s.house=h;
    s.houseCore=h;
    s.houseOverride=h;
    s.lockedHouse=h;
    s.playerHouseLockedValue=h;
    s.playerHouseLocked=true;
    s.houseManualLocked=true;
    s.houseSource='player';
    s.eventFlags=s.eventFlags||{};
    s.eventFlags.player_selected_house=true;
    s.eventFlags.house_core_locked_v11620=true;
    s.memories=s.memories||[];
    if(!s.memories.includes('player_core_house_'+h)) s.memories.push('player_core_house_'+h);
    try{ localStorage.setItem('hp_rpg_player_house_CORE_v11620', h); }catch(e){}
    try{ localStorage.setItem('hp_rpg_player_house_CORE_v11617', h); }catch(e){}
    try{ localStorage.setItem('hp_rpg_player_house_canonical_v11616', h); }catch(e){}
    try{ localStorage.setItem('hp_rpg_canonical_house_v11615', h); }catch(e){}
    try{ localStorage.setItem('hp_rpg_absolute_player_house_v11614', h); }catch(e){}
    return h;
  }

  function getCoreHouse(){
    const s=S();
    const h=normHouse(s?.player?.house)||normHouse(s?.houseCore)||normHouse(s?.house)||normHouse(localStorage.getItem('hp_rpg_player_house_CORE_v11620'))||normHouse(localStorage.getItem('hp_rpg_player_house_CORE_v11617'))||'';
    if(h) writeCoreHouse(h);
    return h || '未知';
  }
  window.getPlayerHouseAbsolute = getCoreHouse;
  window.getCorePlayerHouse = getCoreHouse;

  function mainGlobalThread(){
    const s=S(); if(!s) return null;
    s.storyThreads=s.storyThreads||{};
    let id='main_global_persistent_thread';
    try{ if(typeof threadIdFor==='function') id=threadIdFor('main','global'); }catch(e){}
    if(!s.storyThreads[id]) s.storyThreads[id]={blocks:[],turns:0};
    return s.storyThreads[id];
  }

  function appendDeanNoticeFixed(house){
    const s=S(); if(!s) return;
    const h=writeCoreHouse(house); if(!h) return;
    const head=HOUSE_HEAD[h]||'邓布利多';
    const th=mainGlobalThread(); if(!th) return;
    const stamp=`${h}_${s.time?.year||1991}_${s.time?.month||8}_${Date.now()}`;
    const text = `【旁白】一阵轻微的脚步声打断了周围的谈话。${head}走到你面前，目光平静而郑重。\n${head}：我已经确认了你的申请。从现在开始，${s.player?.name||'你'}便是${h}的学生。\n【旁白】这句话也清楚地传达给了在场的其他人。你的宿舍、公共休息室、学院长桌、课程记录、夜游扣分与之后寄来的学院相关信件，都将从这一刻起按照${h}处理。`;
    th.blocks.push({ai:text, system:true, houseChange:true, token:'dean_notice_v11620_'+stamp, time:{...(s.time||{})}});
    s.memories=s.memories||[];
    s.memories.push(`dean_confirmed_house_${h}`);
    safeSave();
    if(q('#screen-mainline')?.classList.contains('active')){
      try{ renderThreadToUI(th,'mainlineText','mainlineOptions','main'); }catch(e){ console.warn(e); }
    }else{
      try{ toast(`学院已确认：${h}。院长通知已写入主线。`); }catch(e){}
    }
  }

  // Override final house setter used by the profile confirm button.
  window.setPlayerHouseFinal = function(house, opts={}){
    const h=writeCoreHouse(house);
    if(!h) return false;
    if(opts.notice!==false) appendDeanNoticeFixed(h);
    safeSave(); safeRender();
    try{toast(`学院已确认：${h}`);}catch(e){}
    return true;
  };
  window.setAuthoritativeHouse = function(house, reason='玩家确认'){
    return window.setPlayerHouseFinal(house,{notice:/确认|手动|属性|分院|玩家/.test(String(reason||''))});
  };
  try{ setAuthoritativeHouse=window.setAuthoritativeHouse; }catch(e){}

  // Keep profile display synced with the hard core field.
  const oldRenderProfile=window.renderProfile || (typeof renderProfile==='function'?renderProfile:null);
  if(oldRenderProfile && !oldRenderProfile.__v11620HouseProfile){
    const rp=function(){
      const result=oldRenderProfile.apply(this,arguments);
      const h=getCoreHouse();
      const root=q('#profileContent');
      if(root){
        qa('.game-card p',root).forEach(p=>{ if(/^学院：/.test((p.textContent||'').trim())) p.textContent='学院：'+h; });
      }
      return result;
    };
    rp.__v11620HouseProfile=true;
    window.renderProfile=rp; try{renderProfile=rp;}catch(e){}
  }

  // Robust avatar renderer for all story thread rendering.
  const aliasMap={
    '哈利':'harry','波特':'harry','哈利波特':'harry',
    '罗恩':'ron','罗恩韦斯莱':'ron',
    '赫敏':'hermione','格兰杰':'hermione','赫敏格兰杰':'hermione',
    '德拉科':'draco','马尔福':'draco','德拉科马尔福':'draco',
    '布雷斯':'blaise','扎比尼':'blaise','布雷斯扎比尼':'blaise',
    '西奥多':'theo','诺特':'theo','西奥多诺特':'theo',
    '弗雷德':'fred','乔治':'george','弗雷德韦斯莱':'fred','乔治韦斯莱':'george',
    '珀西':'percy','珀西韦斯莱':'percy','塞德里克':'cedric','迪戈里':'cedric','塞德里克迪戈里':'cedric',
    '奥利弗':'oliver','伍德':'oliver','奥利弗伍德':'oliver',
    '秋':'cho','秋张':'cho','张秋':'cho',
    '斯内普':'snape','西弗勒斯':'snape','西弗勒斯斯内普':'snape',
    '卢娜':'luna','卢娜洛夫古德':'luna','金妮':'ginny','金妮韦斯莱':'ginny',
    '汤姆':'tom','里德尔':'tom','汤姆里德尔':'tom',
    '小天狼星':'sirius','布莱克':'sirius','小天狼星布莱克':'sirius',
    '卢平':'lupin','莱姆斯':'lupin','莱姆斯卢平':'lupin',
    '克鲁姆':'krum','维克多尔':'krum','维克多尔克鲁姆':'krum'
  };
  function normalizeName(n){return String(n||'').replace(/[·\s]/g,'').replace(/教授|先生|小姐|学长|学姐|同学/g,'').trim();}
  function roleId(name){
    const s=S(); const n=normalizeName(name);
    if(aliasMap[n]) return aliasMap[n];
    for(const [id,r] of Object.entries(s?.relations||{})){
      const rn=normalizeName(r?.name);
      if(n===rn || rn.includes(n) || n.includes(rn)) return id;
    }
    return '';
  }
  function meetRole(id){const s=S(); const r=s?.relations?.[id]; if(r){r.met=true;r.visible=true;}}
  function avatar(id){try{return charAvatar(id);}catch(e){const r=S()?.relations?.[id]; return `<div class="char-avatar">${esc((r?.name||id).slice(0,1))}</div>`;}}
  function bubbleLine(id, body){
    const s=S(); if(!s?.relations?.[id]) return '';
    meetRole(id);
    return `<div class="dialog-line">${avatar(id)}<div class="speech-bubble"><b>${esc(s.relations[id].name)}</b>${esc(String(body||'').trim())}</div></div>`;
  }
  function splitOptions(text){
    if(typeof splitLatestOptionsStrict==='function') return splitLatestOptionsStrict(text||'');
    const raw=String(text||''); const idx=raw.lastIndexOf('【选项】');
    if(idx<0) return {scene:raw,options:[]};
    return {scene:raw.slice(0,idx),options:raw.slice(idx+4).split(/\n+/).map(x=>x.replace(/^[A-D][\.、]\s*/,'').trim()).filter(Boolean).slice(0,4)};
  }
  function renderRobustLine(narr,line){
    let clean=String(line||'').replace(/^【旁白】/,'').trim();
    if(!clean) return;
    if(/^【?选项】?/.test(clean) || /^[A-D][\.、]\s*/.test(clean)) return;
    if(typeof markRoleMentioned==='function') markRoleMentioned(clean);
    if(clean.startsWith('你：')){
      narr.insertAdjacentHTML('beforeend',`<div class="player-action-line">${esc(clean.replace(/^你：/,''))}</div>`); return;
    }
    let m=clean.match(/^([^：:]{1,22})[：:](.+)$/);
    if(!m){
      m=clean.match(/^(.{1,22}?)(?:低声说|轻声说|说道|说|问道|问|喊道|笑着说|皱眉说|冷冷地说|平静地说|提醒道|补充道)[，,：:「“\s]*(.+?)[」”]?$/);
    }
    if(m){
      const speaker=m[1].trim(); const body=m[2].trim();
      if(/韦斯莱双子|双子|弗雷德和乔治|乔治和弗雷德/.test(speaker)){
        meetRole('fred'); meetRole('george');
        narr.insertAdjacentHTML('beforeend',`<div class="dialog-line twins-line">${avatar('fred')}${avatar('george')}<div class="speech-bubble"><b>弗雷德与乔治</b>${esc(body)}</div></div>`); return;
      }
      const id=roleId(speaker);
      if(id && S()?.relations?.[id]){ narr.insertAdjacentHTML('beforeend',bubbleLine(id,body)); return; }
    }
    const cls=/金色分割线|划过羊皮纸|划开一道细线|——|═/.test(clean) ? 'narrator-line gold-divider-line' : 'narrator-line';
    narr.insertAdjacentHTML('beforeend',`<div class="${cls}">${esc(clean)}</div>`);
  }

  window.renderThreadToUI=function(thread,textId,optId,type){
    const narr=q('#'+textId), opt=q('#'+optId); if(!narr||!opt||!thread) return;
    narr.innerHTML='';
    const blocks=thread.blocks||[];
    blocks.forEach(b=>{
      if(b.player) renderRobustLine(narr,'你：'+b.player);
      splitOptions(b.ai||'').scene.split(/\n+/).filter(Boolean).forEach(line=>renderRobustLine(narr,line));
    });
    const lastAi=blocks.length?(blocks[blocks.length-1].ai||''):'';
    const options=splitOptions(lastAi).options;
    if(options.length){
      opt.innerHTML=`<div class="story-options">${options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${esc(o)}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>`;
    }else{
      opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    }
    narr.scrollTop=narr.scrollHeight;
    try{syncRelationSurfaces&&syncRelationSurfaces();}catch(e){}
  };
  try{renderThreadToUI=window.renderThreadToUI;}catch(e){}

  window.parseStory=function(text,targetTextId,targetOptId,type){
    const narr=q('#'+targetTextId), opt=q('#'+targetOptId); if(!narr||!opt) return;
    const parts=splitOptions(text||''); narr.innerHTML='';
    parts.scene.split(/\n+/).filter(Boolean).forEach(line=>renderRobustLine(narr,line));
    if(parts.options.length){
      opt.innerHTML=`<div class="story-options">${parts.options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${esc(o)}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>`;
    }else opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    narr.scrollTop=narr.scrollHeight;
  };
  try{parseStory=window.parseStory;}catch(e){}

  // Final prompt guarantee: hard house is not narrative suggestion; it is data.
  const oldContext=window.contextPrompt || (typeof contextPrompt==='function'?contextPrompt:null);
  if(oldContext && !oldContext.__v11620HouseContext){
    const wrapped=function(){
      const h=getCoreHouse();
      return oldContext.apply(this,arguments)+`\n【代码硬设定v1.16.20】玩家当前学院=${h}。这是player.house核心字段，不是推测，也不是可被剧情改变的内容。任何宿舍、公共休息室、学院长桌、院长、夜游扣分、信件、羁绊、NPC称呼都必须以${h}为准。`;
    };
    wrapped.__v11620HouseContext=true;
    window.contextPrompt=wrapped; try{contextPrompt=wrapped;}catch(e){}
  }

  setInterval(()=>{try{getCoreHouse();}catch(e){}},1000);
})();

/* ===== v1.16.21 Clean Markdown + Perfect Save Patch =====
   Adds only:
   1) Remove meaningless Markdown ** from narrative and option text.
   2) Settings > 完美存档: choose year/month/heart character/house, keep character setup, adjust values and jump to month.
*/
(function(){
  if(window.__v11621CleanPerfectSavePatch) return;
  window.__v11621CleanPerfectSavePatch = true;

  const $p=(s,r=document)=>r.querySelector(s);
  const $$p=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const HOUSES=['格兰芬多','斯莱特林','拉文克劳','赫奇帕奇'];
  const YEARS=[1991,1992,1993,1994,1995,1996,1997];
  const MONTHS=[1,2,3,4,5,6,7,8,9,10,11,12];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const cleanMd=s=>String(s??'')
    .replace(/\*\*/g,'')
    .replace(/^[\s\-•]*\*\s*/gm,'')
    .replace(/\n{3,}/g,'\n\n')
    .trim();
  const S=()=>window.state || (typeof state!=='undefined'?state:null);
  const safeSave=()=>{ try{ if(typeof save==='function') save(); }catch(e){ console.warn(e); } };
  const safeRender=()=>{ try{ if(typeof renderGame==='function') renderGame(); }catch(e){ console.warn(e); } };
  const safeToast=msg=>{ try{ toast(msg); }catch(e){ console.log(msg); } };

  const aliasMap={
    '哈利':'harry','波特':'harry','哈利波特':'harry',
    '罗恩':'ron','罗恩韦斯莱':'ron',
    '赫敏':'hermione','格兰杰':'hermione','赫敏格兰杰':'hermione',
    '德拉科':'draco','马尔福':'draco','德拉科马尔福':'draco',
    '布雷斯':'blaise','扎比尼':'blaise','布雷斯扎比尼':'blaise',
    '西奥多':'theo','诺特':'theo','西奥多诺特':'theo',
    '弗雷德':'fred','乔治':'george','弗雷德韦斯莱':'fred','乔治韦斯莱':'george',
    '珀西':'percy','珀西韦斯莱':'percy',
    '塞德里克':'cedric','迪戈里':'cedric','塞德里克迪戈里':'cedric',
    '奥利弗':'oliver','伍德':'oliver','奥利弗伍德':'oliver',
    '秋':'cho','秋张':'cho','张秋':'cho',
    '斯内普':'snape','西弗勒斯':'snape','西弗勒斯斯内普':'snape',
    '卢娜':'luna','卢娜洛夫古德':'luna','金妮':'ginny','金妮韦斯莱':'ginny',
    '汤姆':'tom','里德尔':'tom','汤姆里德尔':'tom',
    '小天狼星':'sirius','布莱克':'sirius','小天狼星布莱克':'sirius',
    '卢平':'lupin','莱姆斯':'lupin','莱姆斯卢平':'lupin',
    '克鲁姆':'krum','维克多尔':'krum','维克多尔克鲁姆':'krum'
  };
  function normalizeName(n){return String(n||'').replace(/[·\s]/g,'').replace(/教授|先生|小姐|学长|学姐|同学/g,'').trim();}
  function roleId(name){
    const st=S(); const n=normalizeName(name);
    if(aliasMap[n]) return aliasMap[n];
    for(const [id,r] of Object.entries(st?.relations||{})){
      const rn=normalizeName(r?.name);
      if(n===rn || rn.includes(n) || n.includes(rn)) return id;
    }
    return '';
  }
  function meetRole(id){const st=S(); const r=st?.relations?.[id]; if(r){r.met=true;r.visible=true;}}
  function avatar(id){
    try{return charAvatar(id);}catch(e){
      const r=S()?.relations?.[id];
      const initial=String(r?.name||id||'?').replace(/[·\s]/g,'').slice(0,1).toUpperCase();
      return `<div class="char-avatar">${esc(initial)}</div>`;
    }
  }
  function bubbleLine(id,body){
    const st=S(); if(!st?.relations?.[id]) return '';
    meetRole(id);
    return `<div class="dialog-line">${avatar(id)}<div class="speech-bubble"><b>${esc(st.relations[id].name)}</b>${esc(cleanMd(body))}</div></div>`;
  }
  function splitOptionsClean(text){
    const raw=cleanMd(text||'');
    const idx=raw.lastIndexOf('【选项】');
    if(idx<0) return {scene:raw,options:[]};
    const scene=raw.slice(0,idx);
    const options=raw.slice(idx+'【选项】'.length)
      .split(/\n+/)
      .map(x=>cleanMd(x.replace(/^[A-D][\.、]\s*/,'')))
      .filter(Boolean)
      .slice(0,4);
    return {scene,options};
  }
  function renderCleanLine(narr,line){
    let clean=cleanMd(String(line||'').replace(/^【旁白】/,'').trim());
    if(!clean) return;
    if(/^【?选项】?/.test(clean) || /^[A-D][\.、]\s*/.test(clean)) return;
    try{ if(typeof markRoleMentioned==='function') markRoleMentioned(clean); }catch(e){}
    if(clean.startsWith('你：')){
      narr.insertAdjacentHTML('beforeend',`<div class="player-action-line">${esc(clean.replace(/^你：/,''))}</div>`); return;
    }
    let m=clean.match(/^([^：:]{1,22})[：:](.+)$/);
    if(!m){
      m=clean.match(/^(.{1,22}?)(?:低声说|轻声说|说道|说|问道|问|喊道|笑着说|皱眉说|冷冷地说|平静地说|提醒道|补充道)[，,：:「“\s]*(.+?)[」”]?$/);
    }
    if(m){
      const speaker=m[1].trim(), body=m[2].trim();
      if(/韦斯莱双子|双子|弗雷德和乔治|乔治和弗雷德/.test(speaker)){
        meetRole('fred'); meetRole('george');
        narr.insertAdjacentHTML('beforeend',`<div class="dialog-line twins-line">${avatar('fred')}${avatar('george')}<div class="speech-bubble"><b>弗雷德与乔治</b>${esc(cleanMd(body))}</div></div>`); return;
      }
      const id=roleId(speaker);
      if(id && S()?.relations?.[id]){ narr.insertAdjacentHTML('beforeend',bubbleLine(id,body)); return; }
    }
    const cls=/金色分割线|划过羊皮纸|划开一道细线|——|═/.test(clean) ? 'narrator-line gold-divider-line' : 'narrator-line';
    narr.insertAdjacentHTML('beforeend',`<div class="${cls}">${esc(clean)}</div>`);
  }
  window.renderThreadToUI=function(thread,textId,optId,type){
    const narr=$p('#'+textId), opt=$p('#'+optId); if(!narr||!opt||!thread) return;
    narr.innerHTML='';
    const blocks=thread.blocks||[];
    blocks.forEach(b=>{
      if(b.player) renderCleanLine(narr,'你：'+b.player);
      const scene=splitOptionsClean(b.ai||'').scene;
      scene.split(/\n+/).filter(Boolean).forEach(line=>renderCleanLine(narr,line));
    });
    const lastAi=blocks.length?(blocks[blocks.length-1].ai||''):'';
    const options=splitOptionsClean(lastAi).options;
    if(options.length){
      opt.innerHTML=`<div class="story-options">${options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${esc(o)}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>`;
    }else opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    narr.scrollTop=narr.scrollHeight;
    try{syncRelationSurfaces&&syncRelationSurfaces();}catch(e){}
    safeSave();
  };
  try{renderThreadToUI=window.renderThreadToUI;}catch(e){}
  window.parseStory=function(text,targetTextId,targetOptId,type){
    const narr=$p('#'+targetTextId), opt=$p('#'+targetOptId); if(!narr||!opt) return;
    const parts=splitOptionsClean(text||''); narr.innerHTML='';
    parts.scene.split(/\n+/).filter(Boolean).forEach(line=>renderCleanLine(narr,line));
    if(parts.options.length){
      opt.innerHTML=`<div class="story-options">${parts.options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${esc(o)}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>`;
    }else opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    narr.scrollTop=narr.scrollHeight;
  };
  try{parseStory=window.parseStory;}catch(e){}

  function ensurePerfectSaveUI(){
    const settings=$p('#screen-game-settings .scroll-area'); if(!settings || $p('#perfectSaveCard')) return;
    const card=document.createElement('div');
    card.className='game-card stack perfect-save-card';
    card.id='perfectSaveCard';
    const roleOptions=Object.entries(CHARACTERS||{}).map(([id,c])=>`<option value="${esc(id)}">${esc(c.name)}</option>`).join('');
    card.innerHTML=`
      <h3>完美存档</h3>
      <p class="hint small">保留当前角色设定，只调整年份、月份、学院、基础属性与一位心动角色好感。适合快速进入后续剧情测试。</p>
      <label class="field-label">年份</label>
      <select id="perfectYear" class="input">${YEARS.map(y=>`<option value="${y}">${y}年</option>`).join('')}</select>
      <label class="field-label">月份</label>
      <select id="perfectMonth" class="input">${MONTHS.map(m=>`<option value="${m}">${m}月</option>`).join('')}</select>
      <label class="field-label">心动角色</label>
      <select id="perfectRole" class="input">${roleOptions}</select>
      <label class="field-label">学院</label>
      <select id="perfectHouse" class="input">${HOUSES.map(h=>`<option value="${h}">${h}</option>`).join('')}</select>
      <button class="btn primary full" id="applyPerfectSaveBtn">进入完美存档</button>
    `;
    const saveCard=$p('#openSaveBtn')?.closest('.game-card');
    if(saveCard) settings.insertBefore(card, saveCard); else settings.appendChild(card);
    $p('#applyPerfectSaveBtn')?.addEventListener('click',applyPerfectSave);
  }
  function relationValueForYear(year){return Math.min(100, Math.max(15,(Number(year)-1990)*15));}
  function attrValueForYear(year){return Math.min(200, Math.max(20,(Number(year)-1990)*20));}
  function gradeForYear(year){return Math.min(7, Math.max(1, Number(year)-1990));}
  function setCoreHouseForPerfect(h){
    const st=S(); if(!st) return;
    st.player=st.player||{};
    st.player.house=h; st.house=h; st.houseCore=h; st.houseOverride=h; st.lockedHouse=h; st.playerHouseLockedValue=h;
    st.playerHouseLocked=true; st.houseManualLocked=true; st.houseSource='perfect_save';
    try{ localStorage.setItem('hp_rpg_player_house_CORE_v11620',h); }catch(e){}
    try{ if(typeof window.setPlayerHouseFinal==='function') window.setPlayerHouseFinal(h,{notice:false}); }catch(e){}
  }
  function monthOpeningText(year,month,house,roleName){
    return `【旁白】${month}月到了……羊皮纸上的日期被重新写下，新的时间线在你面前展开。现在是${year}年${month}月，你已被记录为${house}的学生。${roleName?`你与${roleName}之间已经留下了足够多的熟悉感，新的故事会从这份关系继续生长。`:''}\n【选项】\nA. 查看这个月的主线\nB. 去${house}公共休息室看看\nC. 给重要的人写一封信\nD. 先观察周围发生了什么`;
  }
  function setCurrentMainThreadOpening(text){
    const st=S(); if(!st) return;
    st.storyThreads=st.storyThreads||{};
    let tid='main_global_persistent_thread';
    try{ if(typeof threadIdFor==='function') tid=threadIdFor('main','global'); }catch(e){}
    if(!st.storyThreads[tid]) st.storyThreads[tid]={blocks:[],turns:0};
    st.storyThreads[tid].blocks.push({ai:'【旁白】—— 金色分割线划过羊皮纸，一个由完美存档开启的新月份被记录下来。',system:true,time:{...(st.time||{})}});
    st.storyThreads[tid].blocks.push({ai:text,system:true,time:{...(st.time||{})},perfectSave:true});
  }
  function applyPerfectSave(){
    const st=S(); if(!st){safeToast('请先创建角色。');return;}
    const year=Number($p('#perfectYear')?.value||1991);
    const month=Number($p('#perfectMonth')?.value||8);
    const roleId=$p('#perfectRole')?.value||'harry';
    const house=$p('#perfectHouse')?.value||'格兰芬多';
    const attrVal=attrValueForYear(year);
    const affVal=relationValueForYear(year);
    st.time={year,month};
    st.grade=gradeForYear(year);
    st.health=100;
    st.stress=0;
    st.attributes=st.attributes||{};
    (ATTRS||[]).forEach(([id])=>{st.attributes[id]=attrVal;});
    setCoreHouseForPerfect(house);
    st.monthly={bondUsed:false,nightUsed:false,activeLetterUsed:false};
    st.relations=st.relations||{};
    const r=st.relations[roleId];
    if(r){
      r.met=true; r.visible=true; r.affection=affVal; r.familiarity=Math.max(r.familiarity||0,affVal); r.trend='❤️'; r.weight=Math.max(r.weight||0,100+affVal*2);
      st.importantCharacters=[roleId].concat((st.importantCharacters||[]).filter(x=>x!==roleId)).slice(0,3);
    }
    st.memories=st.memories||[];
    st.memories.push(`perfect_save_${year}_${month}`);
    st.memories.push(`perfect_save_house_${house}`);
    st.memories.push(`perfect_save_heart_${roleId}`);
    setCurrentMainThreadOpening(monthOpeningText(year,month,house,r?.name||''));
    safeSave(); safeRender();
    safeToast(`完美存档已进入：${year}年${month}月，${house}，心动角色：${r?.name||'未记录'}`);
    try{ go('screen-mainline'); }catch(e){}
    try{
      const th=st.storyThreads?.[typeof threadIdFor==='function'?threadIdFor('main','global'):'main_global_persistent_thread'];
      if(th && typeof renderThreadToUI==='function') renderThreadToUI(th,'mainlineText','mainlineOptions','main');
    }catch(e){}
  }

  // If a selected year/month has no handcrafted mainline yet, still show a playable current-month opening instead of a blank page.
  const oldRenderMainline = window.renderMainline || (typeof renderMainline==='function'?renderMainline:null);
  if(oldRenderMainline && !oldRenderMainline.__v11621PerfectFallback){
    const wrapped=async function(){
      try{
        const key = typeof currentKey==='function'?currentKey():`${S()?.time?.year}-${S()?.time?.month}`;
        if(typeof MAINLINE!=='undefined' && MAINLINE && MAINLINE[key]) return oldRenderMainline.apply(this,arguments);
        const st=S();
        const h=st?.player?.house || st?.house || '未知学院';
        const tid=typeof threadIdFor==='function'?threadIdFor('main','global'):'main_global_persistent_thread';
        st.storyThreads=st.storyThreads||{};
        if(!st.storyThreads[tid]) st.storyThreads[tid]={blocks:[{ai:monthOpeningText(st.time.year,st.time.month,h,'')}],turns:0};
        renderThreadToUI(st.storyThreads[tid],'mainlineText','mainlineOptions','main');
      }catch(e){ return oldRenderMainline.apply(this,arguments); }
    };
    wrapped.__v11621PerfectFallback=true;
    window.renderMainline=wrapped; try{renderMainline=wrapped;}catch(e){}
  }

  const oldRenderGame = window.renderGame || (typeof renderGame==='function'?renderGame:null);
  if(oldRenderGame && !oldRenderGame.__v11621PerfectUI){
    const rg=function(){ const ret=oldRenderGame.apply(this,arguments); setTimeout(ensurePerfectSaveUI,0); return ret; };
    rg.__v11621PerfectUI=true;
    window.renderGame=rg; try{renderGame=rg;}catch(e){}
  }
  document.addEventListener('click',function(e){
    const btn=e.target.closest('#applyPerfectSaveBtn');
    if(btn){ e.preventDefault(); applyPerfectSave(); }
  },true);
  setTimeout(ensurePerfectSaveUI,300);
  setInterval(ensurePerfectSaveUI,1500);
})();

/* ===== v1.16.22 Perfect Save Dialogue Choice Fix =====
   Problem: 完美存档可跳转到 1992+ 年/月，但旧 resolveMainChoice 在没有手写 MAINLINE 锚点时直接 return，
   导致选项/输入看起来点不了。这里不改已有主线；只给“无手写锚点月份”增加动态对话处理。 */
(function(){
  const qs = (s)=>document.querySelector(s);
  const esc = (s)=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function getState(){ try{return window.state || state;}catch(e){return null;} }
  function threadId(){ try{return typeof threadIdFor==='function'?threadIdFor('main','global'):'main_global_persistent_thread';}catch(e){return 'main_global_persistent_thread';} }
  function ensureMainThread(){
    const st=getState(); if(!st) return null;
    st.storyThreads=st.storyThreads||{};
    const tid=threadId();
    if(!st.storyThreads[tid]) st.storyThreads[tid]={blocks:[],turns:0};
    return st.storyThreads[tid];
  }
  function splitOpts(text){
    if(typeof splitSceneOptions==='function') return splitSceneOptions(text||'');
    if(typeof window.stripSceneAndOptions==='function') return window.stripSceneAndOptions(text||'');
    const s=String(text||''); const idx=s.lastIndexOf('【选项】');
    const scene=idx>=0?s.slice(0,idx):s;
    const opt=idx>=0?s.slice(idx+4):'';
    const options=opt.split(/\n+/).map(x=>x.replace(/^[A-D][\.、．:]\s*/,'').trim()).filter(Boolean).slice(0,4);
    return {scene, options};
  }
  function renderMain(th){
    try{ if(typeof renderThreadToUI==='function') return renderThreadToUI(th,'mainlineText','mainlineOptions','main'); }catch(e){}
    const narr=qs('#mainlineText'), opt=qs('#mainlineOptions'); if(!narr||!opt||!th) return;
    narr.innerHTML=(th.blocks||[]).map(b=>`${b.player?`<div class="player-action-line">${esc(b.player)}</div>`:''}<div class="narrator-line">${esc(splitOpts(b.ai||'').scene)}</div>`).join('');
    const last=(th.blocks||[]).slice(-1)[0]?.ai||''; const opts=splitOpts(last).options;
    opt.innerHTML=opts.length?`<div class="story-options">${opts.map((o,i)=>`<button data-main-choice="${i}" data-choice-text="${esc(o)}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>`:'<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
  }
  function dynamicMonthFallback(action){
    const st=getState()||{}; const y=st.time?.year||1991, m=st.time?.month||8;
    const h=st.player?.house || st.house || '未知学院';
    return `【旁白】你选择${action||'继续观察'}。${y}年${m}月的霍格沃茨生活继续向前展开，眼前的回应围绕着你刚刚的选择慢慢浮现。你现在仍是${h}的学生，过去的记录不会改变，但新的选择会写在当前月份里。\n【选项】\nA. 继续追问细节\nB. 观察身边的人\nC. 按当前月份的安排继续行动\nD. 先停下来整理思绪`;
  }
  function noAnchor(){
    try{ const info=typeof currentMainStep==='function'?currentMainStep():null; return !info || !info.step; }catch(e){ return true; }
  }
  const oldResolve = window.resolveMainChoice || (typeof resolveMainChoice==='function'?resolveMainChoice:null);
  async function resolveMainChoiceV11622(idx, customText){
    // If current month has a handcrafted anchor, keep all old behavior unchanged.
    if(!noAnchor() && oldResolve){ return oldResolve.apply(this, arguments); }
    const th=ensureMainThread(); if(!th) return;
    const last=(th.blocks||[]).slice(-1)[0]?.ai||'';
    const opts=splitOpts(last).options;
    const action=customText || opts[idx] || '继续观察';
    const optEl=qs('#mainlineOptions'); if(optEl) optEl.innerHTML='';
    th.turns=(th.turns||0)+1;
    th.blocks.push({player:action, ai:''});
    renderMain(th);
    try{ if(typeof showThinking==='function') showThinking('mainlineText'); }catch(e){}
    const st=getState()||{};
    let ai;
    try{
      const prompt = typeof contextPrompt==='function' ? contextPrompt('main','dynamic_month','动态月份') : '';
      const history = typeof compileThread==='function' ? compileThread(th).slice(-7000) : JSON.stringify((th.blocks||[]).slice(-10));
      ai = await callAI([
        {role:'system', content:`${prompt}\n【动态月份对话修复】当前没有手写锚点，但必须继续回应玩家。必须围绕当前年月 ${st.time?.year||1991}年${st.time?.month||8}月、当前学院 ${st.player?.house||st.house||'未知学院'} 生成；禁止回到过去月份；选项只写在最后【选项】区。`},
        {role:'user', content:`连续对话历史：\n${history}\n\n玩家刚刚选择/输入：${action}\n请先回应玩家刚刚的行动，再给2-4个新选项。`}
      ], dynamicMonthFallback(action));
    }catch(e){
      ai = dynamicMonthFallback(action);
      try{ if(typeof toast==='function') toast('魔法出错啦 请检查一下吧~'); }catch(_e){}
    }
    try{ if(typeof clearThinking==='function') clearThinking(); }catch(e){}
    th.blocks[th.blocks.length-1].ai = ai || dynamicMonthFallback(action);
    try{ if(typeof save==='function') save(); }catch(e){}
    try{ if(typeof renderGame==='function') renderGame(); }catch(e){}
    renderMain(th);
  }
  window.resolveMainChoice = resolveMainChoiceV11622;
  try{ resolveMainChoice = window.resolveMainChoice; }catch(e){}

  // Also make the free-action button usable in dynamic months even if old handlers were bound before this patch.
  document.addEventListener('click', function(e){
    const btn=e.target.closest('#submitMainlineAction');
    if(!btn || !noAnchor()) return;
    e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    const input=qs('#freeActionInput'); const v=(input?.value||'').trim();
    if(!v){ try{toast('请先写下你的行动。');}catch(_e){} return; }
    if(input) input.value='';
    resolveMainChoiceV11622(0,v);
  }, true);
})();

/* ===== v1.16.23 Rewind + Avatar + Clean Text Hard Fix =====
   Fixes only:
   1) 回溯按钮失灵：所有主线/羁绊/夜游行动前强制记录一份轻量快照；回溯只撤回上一句AI及其状态变化。
   2) 主线/羁绊/夜游可攻略角色台词强制渲染头像气泡。
   3) 叙事区和选项区清理多余 Markdown ** 标记；选项仍只出现在选项区。
*/
(function(){
  if(window.__v11623RewindAvatarCleanFix) return;
  window.__v11623RewindAvatarCleanFix = true;

  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const ST=()=>{try{return window.state || state;}catch(e){return window.state||null;}};
  function setST(v){try{window.state=v; state=v;}catch(e){window.state=v;}}
  function saveSafe(){try{ if(typeof save==='function') save(); }catch(e){console.warn(e);}}
  function toastSafe(t){try{ if(typeof toast==='function') toast(t); else console.log(t); }catch(e){console.log(t);}}
  function cleanText(s){
    return String(s??'')
      .replace(/\*\*/g,'')
      .replace(/^[\s\-•]*\*\s*/gm,'')
      .replace(/[ \t]+$/gm,'')
      .replace(/\n{3,}/g,'\n\n')
      .trim();
  }
  const aliasEntries=[
    ['哈利·波特','harry'],['哈利波特','harry'],['哈利','harry'],['波特','harry'],
    ['罗恩·韦斯莱','ron'],['罗恩韦斯莱','ron'],['罗恩','ron'],
    ['赫敏·格兰杰','hermione'],['赫敏格兰杰','hermione'],['赫敏','hermione'],['格兰杰','hermione'],
    ['德拉科·马尔福','draco'],['德拉科马尔福','draco'],['德拉科','draco'],['马尔福','draco'],
    ['布雷斯·扎比尼','blaise'],['布雷斯扎比尼','blaise'],['布雷斯','blaise'],['扎比尼','blaise'],
    ['西奥多·诺特','theo'],['西奥多诺特','theo'],['西奥多','theo'],['诺特','theo'],
    ['弗雷德·韦斯莱','fred'],['弗雷德韦斯莱','fred'],['弗雷德','fred'],
    ['乔治·韦斯莱','george'],['乔治韦斯莱','george'],['乔治','george'],
    ['珀西·韦斯莱','percy'],['珀西韦斯莱','percy'],['珀西','percy'],
    ['塞德里克·迪戈里','cedric'],['塞德里克迪戈里','cedric'],['塞德里克','cedric'],['迪戈里','cedric'],
    ['奥利弗·伍德','oliver'],['奥利弗伍德','oliver'],['奥利弗','oliver'],['伍德','oliver'],
    ['秋·张','cho'],['秋张','cho'],['张秋','cho'],['秋','cho'],
    ['西弗勒斯·斯内普','snape'],['西弗勒斯斯内普','snape'],['西弗勒斯','snape'],['斯内普','snape'],
    ['卢娜·洛夫古德','luna'],['卢娜洛夫古德','luna'],['卢娜','luna'],
    ['金妮·韦斯莱','ginny'],['金妮韦斯莱','ginny'],['金妮','ginny'],
    ['汤姆·里德尔','tom'],['汤姆里德尔','tom'],['汤姆','tom'],['里德尔','tom'],
    ['小天狼星·布莱克','sirius'],['小天狼星布莱克','sirius'],['小天狼星','sirius'],
    ['莱姆斯·卢平','lupin'],['莱姆斯卢平','lupin'],['莱姆斯','lupin'],['卢平','lupin'],
    ['维克多尔·克鲁姆','krum'],['维克多尔克鲁姆','krum'],['维克多尔','krum'],['克鲁姆','krum']
  ].sort((a,b)=>b[0].length-a[0].length);
  function normalize(s){return String(s||'').replace(/[·\s]/g,'').replace(/教授|先生|小姐|学长|学姐|同学/g,'');}
  function findRoleInText(text){
    const st=ST(); const raw=String(text||''); const n=normalize(raw);
    for(const [name,id] of aliasEntries){ if(n.includes(normalize(name)) && st?.relations?.[id]) return id; }
    for(const [id,r] of Object.entries(st?.relations||{})){
      const rn=normalize(r?.name||'');
      if(rn && (n.includes(rn)||rn.includes(n))) return id;
    }
    return '';
  }
  function markMet(id){const r=ST()?.relations?.[id]; if(r){r.met=true;r.visible=true;}}
  function avatar(id){
    try{ if(typeof charAvatar==='function') return charAvatar(id); }catch(e){}
    const r=ST()?.relations?.[id];
    return `<div class="char-avatar">${esc((r?.name||id||'?').replace(/[·\s]/g,'').slice(0,1).toUpperCase())}</div>`;
  }
  function speechHTML(id,body){
    const st=ST(); if(!id || !st?.relations?.[id]) return '';
    markMet(id);
    try{ if(typeof markRoleMentioned==='function') markRoleMentioned(st.relations[id].name||id); }catch(e){}
    return `<div class="dialog-line">${avatar(id)}<div class="speech-bubble"><b>${esc(st.relations[id].name)}</b>${esc(cleanText(body))}</div></div>`;
  }
  function extractSpeech(line){
    const clean=cleanText(line).replace(/^【旁白】/,'').trim();
    if(!clean) return null;
    if(/韦斯莱双子|双子|弗雷德和乔治|乔治和弗雷德/.test(clean)){
      let body=clean;
      const c=clean.match(/^[^：:]{1,28}[：:](.+)$/) || clean.match(/(?:说|问|喊道|笑着说|低声说|轻声说|说道)[，,：:「“\s]*(.+?)[」”"]?$/);
      if(c) body=c[1];
      markMet('fred'); markMet('george');
      return {twins:true, body:cleanText(body)};
    }
    let m=clean.match(/^([^：:]{1,32})[：:](.+)$/);
    if(m){
      const id=findRoleInText(m[1]);
      if(id) return {id,body:cleanText(m[2])};
    }
    m=clean.match(/^[“"](.+?)[”"]\s*([^，,。！？]{1,30})(?:低声说|轻声说|说道|说|问道|问|喊道|笑着说|皱眉说|冷冷地说|平静地说|提醒道|补充道|回答)/);
    if(m){
      const id=findRoleInText(m[2]);
      if(id) return {id,body:cleanText(m[1])};
    }
    const head=clean.slice(0,45);
    const id=findRoleInText(head);
    if(id && /(低声说|轻声说|说道|说|问道|问|喊道|笑着说|皱眉说|冷冷地说|平静地说|提醒道|补充道|回答|开口)/.test(head)){
      let body=clean.replace(/^.*?(?:低声说|轻声说|说道|说|问道|问|喊道|笑着说|皱眉说|冷冷地说|平静地说|提醒道|补充道|回答|开口)[，,：:「“\s]*/,'').replace(/[」”"]$/,'');
      if(body && body!==clean) return {id,body:cleanText(body)};
    }
    return null;
  }
  function splitOptions(text){
    const raw=cleanText(text||'');
    const lines=raw.split(/\n+/);
    const scene=[]; const options=[]; let optMode=false;
    for(const line0 of lines){
      let line=cleanText(line0); if(!line) continue;
      if(/^【\s*选项\s*】/.test(line)){ optMode=true; continue; }
      const m=line.match(/^[A-D][\.、．:]\s*(.+)$/i);
      if(m){ options.push(cleanText(m[1])); continue; }
      if(optMode && line.length<=50 && !/^【/.test(line)){ options.push(line.replace(/^[-•]\s*/,'')); continue; }
      scene.push(line);
    }
    return {scene:scene.join('\n'), options:options.map(cleanText).filter(Boolean).slice(0,4)};
  }
  function renderLine(narr,line){
    let clean=cleanText(String(line||'').replace(/^【旁白】/,'').trim());
    if(!clean) return;
    if(/^【?选项】?/.test(clean) || /^[A-D][\.、．:]\s*/.test(clean)) return;
    if(clean.startsWith('你：')){narr.insertAdjacentHTML('beforeend',`<div class="player-action-line">${esc(cleanText(clean.replace(/^你：/,'')))}</div>`);return;}
    const sp=extractSpeech(clean);
    if(sp){
      if(sp.twins){narr.insertAdjacentHTML('beforeend',`<div class="dialog-line twins-line">${avatar('fred')}${avatar('george')}<div class="speech-bubble"><b>弗雷德与乔治</b>${esc(sp.body)}</div></div>`);return;}
      narr.insertAdjacentHTML('beforeend',speechHTML(sp.id,sp.body));return;
    }
    try{ if(typeof markRoleMentioned==='function') markRoleMentioned(clean); }catch(e){}
    const cls=/金色分割线|划过羊皮纸|划开一道细线|——|═/.test(clean)?'narrator-line gold-divider-line':'narrator-line';
    narr.insertAdjacentHTML('beforeend',`<div class="${cls}">${esc(clean)}</div>`);
  }
  function renderThread(thread,textId,optId,type){
    const narr=qs('#'+textId), opt=qs('#'+optId); if(!narr||!opt||!thread) return;
    narr.innerHTML='';
    (thread.blocks||[]).forEach(b=>{
      if(b.player) renderLine(narr,'你：'+b.player);
      const scene=splitOptions(b.ai||'').scene;
      scene.split(/\n+/).filter(Boolean).forEach(line=>renderLine(narr,line));
    });
    const last=(thread.blocks||[]).slice(-1)[0]?.ai||'';
    const opts=splitOptions(last).options;
    opt.innerHTML=opts.length?`<div class="story-options">${opts.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${esc(o)}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>`:'<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    narr.scrollTop=narr.scrollHeight;
    try{ if(typeof syncRelationSurfaces==='function') syncRelationSurfaces(); }catch(e){}
  }
  window.renderThreadToUI=renderThread; try{renderThreadToUI=renderThread;}catch(e){}
  window.parseStory=function(text,targetTextId,targetOptId,type){
    const narr=qs('#'+targetTextId), opt=qs('#'+targetOptId); if(!narr||!opt) return;
    const parts=splitOptions(text||''); narr.innerHTML='';
    parts.scene.split(/\n+/).filter(Boolean).forEach(line=>renderLine(narr,line));
    opt.innerHTML=parts.options.length?`<div class="story-options">${parts.options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${esc(o)}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>`:'<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    narr.scrollTop=narr.scrollHeight;
  };
  try{parseStory=window.parseStory;}catch(e){}

  // Rewind hard fix.
  function cloneForUndo(){
    return JSON.parse(JSON.stringify(ST()||{},(k,v)=>k==='_lastUndo'?undefined:v));
  }
  function prepare(type){
    const st=ST(); if(!st) return;
    st._lastUndo={type,snapshot:cloneForUndo(),time:Date.now()};
    try{window.state=st;}catch(e){}
  }
  window.prepareDialogueUndo=prepare;
  function restore(){
    const st=ST(); const u=st?._lastUndo;
    if(!u||!u.snapshot){toastSafe('暂无可回溯内容。');return;}
    const restored=u.snapshot; restored._lastUndo=null; setST(restored);
    try{ if(typeof migrateState==='function') migrateState(); }catch(e){}
    saveSafe(); toastSafe('已回溯上一句。');
    try{ if(typeof renderGame==='function') renderGame(); }catch(e){}
    if(u.type==='main'){try{ if(typeof go==='function') go('screen-mainline'); if(typeof renderMainline==='function') renderMainline(); }catch(e){}}
    if(u.type==='bond'){try{ if(typeof go==='function') go('screen-bond-event'); const id=ST()?.activeBondEventId; if(id && typeof renderBondEventThread==='function') renderBondEventThread(id); }catch(e){}}
    if(u.type==='night'){try{ if(typeof go==='function') go('screen-night'); }catch(e){}}
  }
  function ensureBtns(){
    [['screen-mainline','main'],['screen-bond-event','bond'],['screen-night','night']].forEach(([sid,type])=>{
      const root=qs('#'+sid); if(!root) return;
      const shell=root.querySelector('.story-shell')||root.querySelector('.paper')||root;
      if(shell.querySelector('[data-rewind-type="'+type+'"]')) return;
      shell.style.position='relative';
      const b=document.createElement('button'); b.className='rewind-btn-v1169'; b.textContent='回溯'; b.dataset.rewindType=type;
      shell.insertAdjacentElement('afterbegin',b);
    });
  }
  document.addEventListener('click',function(e){
    const rb=e.target.closest('[data-rewind-type]'); if(rb){e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); restore(); return;}
  },true);
  // Prepare snapshots at the latest possible moment before existing handlers mutate state.
  const prevResolve=window.resolveMainChoice || (typeof resolveMainChoice==='function'?resolveMainChoice:null);
  if(prevResolve && !prevResolve.__v11623UndoWrapped){
    const wrapped=async function(){prepare('main'); return prevResolve.apply(this,arguments);};
    wrapped.__v11623UndoWrapped=true; window.resolveMainChoice=wrapped; try{resolveMainChoice=wrapped;}catch(e){}
  }
  const prevBond=window.handleBondAction || (typeof handleBondAction==='function'?handleBondAction:null);
  if(prevBond && !prevBond.__v11623UndoWrapped){
    const wrapped=async function(){prepare('bond'); return prevBond.apply(this,arguments);};
    wrapped.__v11623UndoWrapped=true; window.handleBondAction=wrapped; try{handleBondAction=wrapped;}catch(e){}
  }
  document.addEventListener('click',function(e){
    if(e.target.closest('[data-main-choice], #submitMainlineAction')) prepare('main');
    if(e.target.closest('[data-bond-choice], #submitBondAction, .bond-action-jelly')) prepare('bond');
    if(e.target.closest('[data-night-choice], #nightActionBtn')) prepare('night');
  },true);
  const oldRG=window.renderGame || (typeof renderGame==='function'?renderGame:null);
  if(oldRG && !oldRG.__v11623RewindBtns){
    const rg=function(){const r=oldRG.apply(this,arguments); setTimeout(ensureBtns,0); return r;};
    rg.__v11623RewindBtns=true; window.renderGame=rg; try{renderGame=rg;}catch(e){}
  }
  setTimeout(ensureBtns,300); setInterval(ensureBtns,1500);

  // Final clean options safety: if any old renderer wrote ** into buttons, clean it in place.
  setInterval(()=>{
    qsa('.story-options button').forEach(b=>{const t=cleanText(b.textContent); if(t!==b.textContent)b.textContent=t; if(b.dataset.choiceText)b.dataset.choiceText=cleanText(b.dataset.choiceText);});
    qsa('.narrator-line,.speech-bubble,.player-action-line').forEach(el=>{ if(el.childElementCount===0){ const t=cleanText(el.textContent); if(t!==el.textContent) el.textContent=t; } });
  },800);
})();

/* ==========================================================
   v1.17 Backend Save Bridge
   - 不破坏原本本地存档逻辑。
   - 如果通过 Node 后端运行（/api/health 可访问），存档/读档优先走后端。
   - 如果部署在 GitHub Pages，无后端时自动回退原本本地存档。
   ========================================================== */
(function(){
  const CLOUD_USER_KEY = 'hp_rpg_cloud_user_id_v1';
  let backendStatusCache = null;
  const originalOpenSaveLoad = typeof openSaveLoad === 'function' ? openSaveLoad : null;

  function cloudUserId(){
    let id = localStorage.getItem(CLOUD_USER_KEY);
    if(!id){
      id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : ('user_' + Date.now() + '_' + Math.random().toString(16).slice(2));
      localStorage.setItem(CLOUD_USER_KEY, id);
    }
    return id;
  }

  async function backendAvailable(){
    if(backendStatusCache && Date.now() - backendStatusCache.ts < 10000) return backendStatusCache.ok;
    try{
      const res = await fetch('/api/health', { cache:'no-store' });
      const ok = res.ok && (await res.json()).ok;
      backendStatusCache = { ok, ts:Date.now() };
      return ok;
    }catch(e){
      backendStatusCache = { ok:false, ts:Date.now() };
      return false;
    }
  }

  function cloneForBackendSave(src){
    const copy = JSON.parse(JSON.stringify(src || {}));
    // AI缓存可由API重新生成，不塞进后端存档，避免存档膨胀。
    if(copy.aiCache) copy.aiCache = {};
    return copy;
  }

  async function fetchCloudSaves(){
    const id = encodeURIComponent(cloudUserId());
    const res = await fetch(`/api/users/${id}/saves`, { cache:'no-store' });
    if(!res.ok) throw new Error('LOAD_CLOUD_SAVES_FAILED');
    const data = await res.json();
    return data.saves || [null,null,null,null];
  }

  async function putCloudSave(slot, gameState){
    const id = encodeURIComponent(cloudUserId());
    const body = {
      realTime: new Date().toLocaleString(),
      state: cloneForBackendSave(gameState),
      meta: {
        playerName: gameState?.player?.name || '新生',
        gameTime: `${gameState?.time?.year || ''}年${gameState?.time?.month || ''}月`,
        house: gameState?.player?.house || gameState?.house || '未知'
      }
    };
    const res = await fetch(`/api/users/${id}/saves/${slot}`, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    if(!res.ok){
      const data = await res.json().catch(()=>({}));
      throw new Error(data.message || data.error || 'SAVE_FAILED');
    }
    return await res.json();
  }

  async function deleteCloudSave(slot){
    const id = encodeURIComponent(cloudUserId());
    const res = await fetch(`/api/users/${id}/saves/${slot}`, { method:'DELETE' });
    if(!res.ok) throw new Error('DELETE_SAVE_FAILED');
    return await res.json();
  }

  function renderCloudSaveDialog(isSave, slots){
    const content = document.querySelector('#saveDialogContent');
    const dlg = document.querySelector('#saveDialog');
    if(!content || !dlg) return;
    content.innerHTML = `<div class="paper"><h3>${isSave?'后端存档':'后端读档'}</h3><p class="hint small">当前为后端存档模式。玩家数据会保存到服务器，不再只依赖浏览器容量。</p><div class="save-grid">${slots.map((s,i)=>{
      const st = s?.state;
      return `<div class="save-slot"><b>存档位 ${i+1}</b><p>${st?`${s.realTime || ''}<br>游戏时间：${st.time?.year||''}年${st.time?.month||''}月<br>${st.player?.name||'新生'} · ${st.player?.house||st.house||'未知'}${st.ended?'<br>已达成结局：不可继续':''}`:'空存档位'}</p><button class="btn secondary" data-cloud-slot="${i}">${isSave?'保存到此处':'读取此存档'}</button><button class="btn ghost" data-cloud-delete="${i}">删除</button></div>`;
    }).join('')}</div></div>`;

    content.querySelectorAll('[data-cloud-slot]').forEach(btn=>{
      btn.onclick = async ()=>{
        const idx = Number(btn.dataset.cloudSlot);
        if(isSave){
          try{
            btn.disabled = true;
            btn.textContent = '保存中…';
            await putCloudSave(idx, state);
            toast('后端存档完成。');
            renderCloudSaveDialog(isSave, await fetchCloudSaves());
          }catch(e){
            console.warn(e);
            alert('后端存档失败：' + (e.message || '未知错误'));
            btn.disabled = false;
            btn.textContent = '保存到此处';
          }
        }else{
          const save = slots[idx];
          if(!save || !save.state){ toast('这里还没有存档哦。'); return; }
          if(save.state.ended){ toast('这个存档已经进入结局，无法继续。'); return; }
          state = save.state;
          if(typeof migrateState === 'function') migrateState();
          if(typeof save === 'function') save(); // 同步一份到本地，方便离线兜底
          dlg.close();
          if(typeof go === 'function') go('screen-game-home');
          if(typeof renderGame === 'function') renderGame();
          toast('后端读档完成。');
        }
      };
    });

    content.querySelectorAll('[data-cloud-delete]').forEach(btn=>{
      btn.onclick = async ()=>{
        const idx = Number(btn.dataset.cloudDelete);
        if(!confirm(`确定删除存档位 ${idx+1} 吗？`)) return;
        try{
          await deleteCloudSave(idx);
          toast('后端存档已删除。');
          renderCloudSaveDialog(isSave, await fetchCloudSaves());
        }catch(e){
          console.warn(e);
          alert('删除失败：' + (e.message || '未知错误'));
        }
      };
    });

    dlg.showModal();
  }

  window.openSaveLoad = async function(isSave){
    if(await backendAvailable()){
      const dlg = document.querySelector('#saveDialog');
      const content = document.querySelector('#saveDialogContent');
      if(content) content.innerHTML = '<div class="paper"><h3>正在读取后端存档……</h3><p>请稍等。</p></div>';
      if(dlg && !dlg.open) dlg.showModal();
      try{
        const slots = await fetchCloudSaves();
        renderCloudSaveDialog(isSave, slots);
      }catch(e){
        console.warn('backend save failed, fallback local', e);
        toast('后端暂时不可用，已切回本地存档。');
        if(dlg?.open) dlg.close();
        if(originalOpenSaveLoad) originalOpenSaveLoad(isSave);
      }
      return;
    }
    if(originalOpenSaveLoad) originalOpenSaveLoad(isSave);
  };
})();

/* ===== v1.17.1 STRICT SPEECH BUBBLE FORMAT PATCH =====
   Requirement:
   - Romanceable character dialogue renders as: avatar + name + speech bubble.
   - Speech bubble may contain ONLY what the character says, wrapped in Chinese quotes “”.
   - Character actions / psychology / surrounding description go to narrator lines.
   - Narration and options keep removing meaningless Markdown **.
*/
(function(){
  if(window.__v1171StrictSpeechBubblePatch) return;
  window.__v1171StrictSpeechBubblePatch = true;

  const $q=(s,r=document)=>r.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const S=()=>window.state || (typeof state!=='undefined'?state:null);
  function cleanText(s){
    return String(s??'')
      .replace(/\*\*/g,'')
      .replace(/^[\s\-•]*\*\s*/gm,'')
      .replace(/^[\s>]+/gm,'')
      .replace(/\n{3,}/g,'\n\n')
      .trim();
  }
  const alias={
    '哈利':'harry','波特':'harry','哈利波特':'harry',
    '罗恩':'ron','罗恩韦斯莱':'ron',
    '赫敏':'hermione','格兰杰':'hermione','赫敏格兰杰':'hermione',
    '德拉科':'draco','马尔福':'draco','德拉科马尔福':'draco',
    '布雷斯':'blaise','扎比尼':'blaise','布雷斯扎比尼':'blaise',
    '西奥多':'theo','诺特':'theo','西奥多诺特':'theo',
    '弗雷德':'fred','乔治':'george','弗雷德韦斯莱':'fred','乔治韦斯莱':'george',
    '珀西':'percy','珀西韦斯莱':'percy',
    '塞德里克':'cedric','迪戈里':'cedric','塞德里克迪戈里':'cedric',
    '奥利弗':'oliver','伍德':'oliver','奥利弗伍德':'oliver',
    '秋':'cho','秋张':'cho','张秋':'cho',
    '斯内普':'snape','西弗勒斯':'snape','西弗勒斯斯内普':'snape',
    '卢娜':'luna','卢娜洛夫古德':'luna','金妮':'ginny','金妮韦斯莱':'ginny',
    '汤姆':'tom','里德尔':'tom','汤姆里德尔':'tom',
    '小天狼星':'sirius','布莱克':'sirius','小天狼星布莱克':'sirius',
    '卢平':'lupin','莱姆斯':'lupin','莱姆斯卢平':'lupin',
    '克鲁姆':'krum','维克多尔':'krum','维克多尔克鲁姆':'krum'
  };
  function norm(n){return String(n||'').replace(/[·\s]/g,'').replace(/教授|先生|小姐|学长|学姐|同学/g,'').trim();}
  function roleId(name){
    const st=S(); const n=norm(name);
    if(alias[n]) return alias[n];
    for(const [id,r] of Object.entries(st?.relations||{})){
      const rn=norm(r?.name);
      if(n===rn || (n.length>=2 && rn.includes(n)) || (rn.length>=2 && n.includes(rn))) return id;
    }
    return '';
  }
  function meet(id){const r=S()?.relations?.[id]; if(r){r.met=true;r.visible=true;}}
  function avatar(id){
    try{return typeof charAvatar==='function'?charAvatar(id):'';}catch(e){}
    const r=S()?.relations?.[id];
    return `<div class="char-avatar">${esc((r?.name||id||'?').replace(/[·\s]/g,'').slice(0,1))}</div>`;
  }
  function normalizeQuoteSpeech(s){
    let t=cleanText(s).replace(/^「(.+)」$/,'“$1”').replace(/^"(.+)"$/,'“$1”');
    t=t.replace(/[「『]/g,'“').replace(/[」』]/g,'”');
    t=t.replace(/^“\s*/,'').replace(/\s*”$/,'');
    t=t.replace(/^['"]|['"]$/g,'').trim();
    return `“${t}”`;
  }
  function splitSpeechAndNarration(rawBody, displayName){
    let body=cleanText(rawBody);
    const narr=[];
    if(!body) return {speech:'……',narr};

    // Move explicit bracketed actions/psychology out of the speech bubble.
    body=body.replace(/[（(]([^（）()]{1,80})[）)]/g,(_,a)=>{ const x=cleanText(a); if(x) narr.push(`${displayName}${x}`); return ' '; });

    // If the body contains Chinese/English quotes, treat quoted text as speech only.
    const quoteMatches=[];
    body.replace(/[“"]([^”"]{1,500})[”"]/g,(_,q)=>{ quoteMatches.push(cleanText(q)); return _; });
    if(quoteMatches.length){
      const without=cleanText(body.replace(/[“"]([^”"]{1,500})[”"]/g,' '));
      if(without){
        const n=without.replace(/^[，,。；;：:\s]+|[，,。；;：:\s]+$/g,'');
        if(n) narr.push(n.includes(displayName)?n:`${displayName}${n}`);
      }
      return {speech:quoteMatches.join('……'),narr};
    }

    // If body is mostly narration plus a final unquoted utterance after colon/comma after saying verb.
    const said=body.match(/^(.*?(?:说|问|道|开口|回答|提醒|补充|低语|反问|嘀咕|喊|笑道)[，,：:\s]+)(.+)$/);
    if(said && said[2]){
      const n=cleanText(said[1]).replace(/[，,：:\s]+$/,'');
      if(n && !/^(说|问|道)$/.test(n)) narr.push(n.includes(displayName)?n:`${displayName}${n}`);
      return {speech:said[2],narr};
    }

    return {speech:body,narr};
  }
  function narratorLine(htmlText, cls=''){
    const c=cls || (/金色分割线|划过羊皮纸|划开一道细线|——|═/.test(htmlText)?'narrator-line gold-divider-line':'narrator-line');
    return `<div class="${c}">${esc(cleanText(htmlText))}</div>`;
  }
  function bubbleLine(id, rawBody){
    const st=S(); const r=st?.relations?.[id]; if(!r) return '';
    meet(id);
    const name=r.name || id;
    const parts=splitSpeechAndNarration(rawBody,name);
    const before=parts.narr.map(x=>narratorLine(x)).join('');
    return before + `<div class="dialog-line">${avatar(id)}<div class="dialog-content"><div class="speaker-name">${esc(name)}</div><div class="speech-bubble dialogue-only">${esc(normalizeQuoteSpeech(parts.speech))}</div></div></div>`;
  }
  function twinsLine(rawBody){
    meet('fred'); meet('george');
    const parts=splitSpeechAndNarration(rawBody,'弗雷德与乔治');
    const before=parts.narr.map(x=>narratorLine(x)).join('');
    return before + `<div class="dialog-line twins-line">${avatar('fred')}${avatar('george')}<div class="dialog-content"><div class="speaker-name">${esc('弗雷德与乔治')}</div><div class="speech-bubble dialogue-only">${esc(normalizeQuoteSpeech(parts.speech))}</div></div></div>`;
  }
  function parseLineToHTML(line){
    let clean=cleanText(String(line||'').replace(/^【旁白】/,'').trim());
    if(!clean) return '';
    if(/^【?选项】?/.test(clean) || /^[A-D][\.、．:]\s*/.test(clean)) return '';
    try{ if(typeof markRoleMentioned==='function') markRoleMentioned(clean); }catch(e){}
    if(clean.startsWith('你：') || clean.startsWith('玩家行动：') || clean.startsWith('你选择：')){
      const v=clean.replace(/^你：|^玩家行动：|^你选择：/,'').trim();
      return `<div class="player-action-line">${esc(v)}</div>`;
    }

    // Pattern 1: 角色：内容
    let m=clean.match(/^([^：:]{1,24})[：:](.+)$/);
    // Pattern 2: 角色低声说/问……内容
    if(!m){
      m=clean.match(/^(.{1,24}?)(?:低声说|轻声说|说道|说|问道|问|喊道|笑着说|皱眉说|冷冷地说|平静地说|提醒道|补充道|开口|回答|低语|反问|嘀咕)[，,：:「“\s]*(.+?)[」”]?$/);
    }
    // Pattern 3: “内容”角色说
    if(!m){
      const q=clean.match(/^[“"](.+?)[”"]\s*([^，,。！？]{1,24})(?:低声说|轻声说|说道|说|问道|问|回答|低语|补充|反问)/);
      if(q) m=[q[0],q[2],q[1]];
    }
    if(m){
      const speaker=m[1].trim(); const body=m[2].trim();
      if(/韦斯莱双子|双子|弗雷德和乔治|乔治和弗雷德/.test(speaker)) return twinsLine(body);
      const id=roleId(speaker);
      if(id && S()?.relations?.[id]) return bubbleLine(id,body);
    }
    return narratorLine(clean);
  }
  function splitOptions(text){
    const raw=cleanText(text||'');
    const idx=raw.lastIndexOf('【选项】');
    if(idx<0) return {scene:raw,options:[]};
    const scene=raw.slice(0,idx);
    const options=raw.slice(idx+'【选项】'.length).split(/\n+/)
      .map(x=>cleanText(x.replace(/^[A-D][\.、．:]\s*/,'')))
      .filter(Boolean).slice(0,4);
    return {scene,options};
  }
  function renderLinesInto(narr, scene){
    scene.split(/\n+/).filter(Boolean).forEach(line=>narr.insertAdjacentHTML('beforeend',parseLineToHTML(line)));
  }
  function setOptions(opt, options, type){
    if(options.length){
      opt.innerHTML=`<div class="story-options">${options.map((o,i)=>`<button data-${type}-choice="${i}" data-choice-text="${esc(o)}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>`;
    }else{
      opt.innerHTML='<p class="destiny-placeholder">你的命运会怎样发展？都掌握在你的手中。</p>';
    }
  }

  window.renderThreadToUI=function(thread,textId,optId,type){
    const narr=$q('#'+textId), opt=$q('#'+optId); if(!narr||!opt||!thread) return;
    narr.innerHTML='';
    const blocks=thread.blocks||[];
    blocks.forEach(b=>{
      if(b.player) narr.insertAdjacentHTML('beforeend',parseLineToHTML('你：'+b.player));
      const scene=splitOptions(b.ai||'').scene;
      renderLinesInto(narr,scene);
    });
    const lastAi=blocks.length?(blocks[blocks.length-1].ai||''):'';
    setOptions(opt,splitOptions(lastAi).options,type);
    narr.scrollTop=narr.scrollHeight;
    try{ if(typeof syncRelationSurfaces==='function') syncRelationSurfaces(); }catch(e){}
    try{ if(typeof save==='function') save(); }catch(e){}
  };
  try{renderThreadToUI=window.renderThreadToUI;}catch(e){}

  window.parseStory=function(text,targetTextId,targetOptId,type){
    const narr=$q('#'+targetTextId), opt=$q('#'+targetOptId); if(!narr||!opt) return;
    const parts=splitOptions(text||'');
    narr.innerHTML='';
    renderLinesInto(narr,parts.scene);
    setOptions(opt,parts.options,type);
    narr.scrollTop=narr.scrollHeight;
  };
  try{parseStory=window.parseStory;}catch(e){}

  // Clean already-rendered wrong bubbles after any render/update.
  function normalizeExistingBubbles(){
    document.querySelectorAll('.speech-bubble').forEach(b=>{
      const txt=cleanText(b.textContent||'');
      if(!b.classList.contains('dialogue-only')) return;
      b.textContent=normalizeQuoteSpeech(txt.replace(/^“|”$/g,''));
    });
    document.querySelectorAll('.story-options button').forEach(btn=>{btn.textContent=cleanText(btn.textContent||'');});
  }
  const oldRenderGame=window.renderGame || (typeof renderGame==='function'?renderGame:null);
  if(oldRenderGame){
    window.renderGame=function(){ const r=oldRenderGame.apply(this,arguments); setTimeout(normalizeExistingBubbles,0); return r; };
    try{renderGame=window.renderGame;}catch(e){}
  }
})();

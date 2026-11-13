(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const keys = new Set();
  const creatures = [
    { name:'Mossprout', kind:'leaf', type:'GROVE', color:'#a9e77d', accent:'#508b56', line:'#d9ffa4', move:'Vine Shuffle' },
    { name:'Embercub', kind:'fire', type:'EMBER', color:'#ff9d70', accent:'#d25458', line:'#ffd18b', move:'Comet Claw' },
    { name:'Tidefin', kind:'water', type:'TIDE', color:'#80d9ee', accent:'#438cba', line:'#c1f5ff', move:'Ripple Rush' }
  ];
  const game = { scene:'title', starter:0, player:{x:4,y:5}, wildCount:0, won:0, sound:true, time:0, text:'', textUntil:0, battle:null };
  const colors = { ink:'#f8f6ff', muted:'#a7aec9', mint:'#b6f27d', pink:'#ff91b5', gold:'#ffd477', deep:'#171b31' };
  const rand = (a,b) => a + Math.random()*(b-a);
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  function rounded(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
  function text(str,x,y,size=16,color=colors.ink,weight=700,align='left',font='Nunito'){ctx.fillStyle=color;ctx.font=`${weight} ${size}px '${font}', sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(str,x,y)}
  function line(x1,y1,x2,y2,color='#fff',width=1){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
  function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
  function pill(label,x,y,w,color='#26324a'){rounded(x,y,w,24,12,color);text(label,x+w/2,y+12,10,'#e1e9ff',900,'center','DM Mono')}
  function button(label,x,y,w,h,primary=false,sub=''){rounded(x,y,w,h,13,primary?'#b8f17d':'#232942',primary?'#d8ffac':'#404867');text(label,x+w/2,y+(sub? h*.43:h/2),primary?15:13,primary?'#1a2630':'#f3f2ff',900,'center');if(sub)text(sub,x+w/2,y+h*.72,9,primary?'#466242':'#9da6c2',700,'center','DM Mono')}
  function drawBackground(top='#a6d9cd',bottom='#d8edc8'){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(1,bottom);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // soft clouds
    ctx.globalAlpha=.35;for(let i=0;i<5;i++){const x=((i*237+game.time*5)%1200)-100,y=72+(i%3)*32;circle(x,y,22,'#fff');circle(x+22,y-6,29,'#fff');circle(x+52,y+3,20,'#fff')}ctx.globalAlpha=1;
  }
  function drawCreature(c,x,y,s=1,flip=false,pose=0){
    ctx.save();ctx.translate(x,y+Math.sin(game.time*4+pose)*2);ctx.scale((flip?-1:1)*s,s);
    // shadow
    ctx.globalAlpha=.18;ctx.beginPath();ctx.ellipse(0,35,38,10,0,0,Math.PI*2);ctx.fillStyle='#18273a';ctx.fill();ctx.globalAlpha=1;
    if(c.kind==='leaf'){
      // leaf ears
      ctx.fillStyle=c.accent;ctx.beginPath();ctx.ellipse(-22,-29,10,24,-.7,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(20,-32,10,24,.7,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=c.color;ctx.beginPath();ctx.ellipse(0,0,37,35,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d5f4b7';ctx.beginPath();ctx.ellipse(2,15,23,16,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#8cce76';ctx.beginPath();ctx.moveTo(-2,-30);ctx.quadraticCurveTo(-28,-53,-6,-58);ctx.quadraticCurveTo(10,-48,-2,-30);ctx.fill();
    } else if(c.kind==='fire'){
      ctx.fillStyle='#ffcb73';ctx.beginPath();ctx.moveTo(-20,-17);ctx.quadraticCurveTo(-51,-43,-34,-65);ctx.quadraticCurveTo(-19,-50,-15,-40);ctx.quadraticCurveTo(-3,-74,15,-58);ctx.quadraticCurveTo(40,-39,19,-18);ctx.fill();
      ctx.fillStyle=c.color;ctx.beginPath();ctx.ellipse(0,0,36,35,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffe0b0';ctx.beginPath();ctx.ellipse(0,15,22,17,0,0,Math.PI*2);ctx.fill();
    } else {
      ctx.fillStyle=c.color;ctx.beginPath();ctx.ellipse(0,1,37,34,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(23,0);ctx.quadraticCurveTo(56,-28,59,-4);ctx.quadraticCurveTo(48,21,24,15);ctx.fill();ctx.fillStyle='#dafbff';ctx.beginPath();ctx.ellipse(-2,15,24,16,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#4aa0cb';ctx.beginPath();ctx.moveTo(-8,-28);ctx.lineTo(-2,-49);ctx.lineTo(9,-27);ctx.fill();ctx.beginPath();ctx.moveTo(2,-28);ctx.lineTo(20,-43);ctx.lineTo(16,-23);ctx.fill();
    }
    // feet
    rounded(-24,22,18,16,8,c.accent);rounded(8,22,18,16,8,c.accent);
    // eyes + glints
    circle(-12,-5,5,'#18273a');circle(12,-5,5,'#18273a');circle(-13,-7,1.5,'#fff');circle(11,-7,1.5,'#fff');
    ctx.strokeStyle='#405d53';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,5,5,.25,Math.PI-.25);ctx.stroke();
    circle(-27,5,4,'#ffb3a5');circle(27,5,4,'#ffb3a5');
    ctx.restore();
  }
  function drawPlayer(x,y){
    ctx.save();ctx.translate(x,y);
    circle(0,18,15,'#2c354e');rounded(-12,-13,24,28,8,'#f7d8b5');rounded(-17,5,34,33,10,'#7787cf');rounded(-19,4,38,11,6,'#ffbe75');
    ctx.fillStyle='#26334c';ctx.beginPath();ctx.arc(0,-14,15,Math.PI,0);ctx.lineTo(15,-9);ctx.quadraticCurveTo(0,-18,-15,-7);ctx.closePath();ctx.fill();rounded(-12,-19,24,7,4,'#ff91b5');
    circle(-5,-1,1.7,'#25304a');circle(5,-1,1.7,'#25304a');rounded(-12,33,10,8,4,'#f1f0e8');rounded(2,33,10,8,4,'#f1f0e8');ctx.restore();
  }
  function drawTitle(){
    drawBackground('#b7e5df','#e8f0d1');
    // distant mountains and field
    ctx.fillStyle='#8bb9a8';ctx.beginPath();ctx.moveTo(0,315);ctx.quadraticCurveTo(160,213,322,315);ctx.quadraticCurveTo(470,208,655,311);ctx.quadraticCurveTo(825,220,1000,296);ctx.lineTo(1000,600);ctx.lineTo(0,600);ctx.fill();
    ctx.fillStyle='#75ac7f';ctx.beginPath();ctx.moveTo(0,390);ctx.quadraticCurveTo(250,320,500,394);ctx.quadraticCurveTo(770,325,1000,381);ctx.lineTo(1000,600);ctx.lineTo(0,600);ctx.fill();
    // path
    ctx.strokeStyle='#d8c99a';ctx.lineWidth=72;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(170,600);ctx.bezierCurveTo(300,505,160,452,365,393);ctx.bezierCurveTo(570,330,458,295,678,257);ctx.stroke();ctx.strokeStyle='#f0dfa9';ctx.lineWidth=58;ctx.stroke();
    for(let i=0;i<10;i++){let x=35+i*102,y=390+(i%3)*48;ctx.fillStyle=i%2?'#477a5b':'#548864';ctx.beginPath();ctx.arc(x,y,23+(i%2)*8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#91c37d';ctx.beginPath();ctx.arc(x-7,y-8,14,0,Math.PI*2);ctx.fill()}
    drawCreature(creatures[0],735,344,1.45,false,1);drawCreature(creatures[2],824,400,.78,true,2);drawPlayer(626,433);
    rounded(54,58,443,449,24,'#171b31eF','#ffffff38');
    pill('A RHYTHM MONSTER ADVENTURE',82,88,225,'#29344a');
    text('POCKET',82,166,55,'#f8f6ff',900);text('PULSE',82,223,55,'#b6f27d',900);
    text('Where every battle has a beat.',84,273,17,'#d7ddf1',700);
    text('Meet a buddy. Find your rhythm. Make a little noise.',84,302,12,'#a9b1cb',600);
    button('START YOUR JOURNEY',82,352,242,58,true,'ENTER THE GROVE  →');
    text('A / ENTER',84,449,10,'#8e98b5',700,'left','DM Mono');
    rounded(342,351,126,58,13,'#212840','#3b4463');text('HOW TO PLAY',405,373,11,'#e3e7f7',900,'center');text('Move  ·  Rhythm  ·  Befriend',405,391,9,'#a5acc6',600,'center','DM Mono');
    text('01',942,555,12,'#f7f5ff',800,'right','DM Mono');
  }
  function drawSelect(){
    drawBackground('#a9d8d1','#e6edcc');
    ctx.fillStyle='#83b99a';ctx.beginPath();ctx.moveTo(0,345);ctx.quadraticCurveTo(250,270,500,350);ctx.quadraticCurveTo(790,270,1000,340);ctx.lineTo(1000,600);ctx.lineTo(0,600);ctx.fill();
    rounded(76,45,848,510,24,'#171b31ed','#ffffff38');pill('YOUR FIRST PARTNER',106,76,164,'#29344a');
    text('Pick your rhythm buddy',106,127,30,colors.ink,900);text('Every little legend starts with one.',107,157,13,'#aab2cb',600);
    creatures.forEach((c,i)=>{
      const x=106+i*264, y=195, w=238,h=270, selected=game.starter===i;
      rounded(x,y,w,h,20,selected?'#2a3644':'#20253b',selected?'#b6f27d':'#383f5d');
      circle(x+w/2,y+75,57,selected?'#394d45':'#2b304b');drawCreature(c,x+w/2,y+84,.85,false,i);
      pill(c.type,x+16,y+147,64,selected?'#435943':'#303753');text(c.name,x+w/2,y+185,20,colors.ink,900,'center');
      text(['A sprout with a brave little heart.','A spark that never sits still.','Cool-headed, quick as a ripple.'][i],x+w/2,y+214,10,'#adb5cd',600,'center');
      if(selected)text('✦  YOUR BUDDY',x+w/2,y+243,10,'#c7f694',900,'center','DM Mono');else text('CLICK TO CHOOSE',x+w/2,y+243,9,'#747d9b',700,'center','DM Mono');
    });
    button('LET’S GO',730,489,164,45,true,'');text('← → to browse  ·  ENTER to pick',108,511,10,'#aab2cb',600,'left','DM Mono');
  }
  function drawMap(){
    drawBackground('#a5d9d4','#dbedc7');
    // land and rolling hills
    ctx.fillStyle='#76b583';ctx.beginPath();ctx.moveTo(0,270);ctx.quadraticCurveTo(235,215,465,286);ctx.quadraticCurveTo(730,217,1000,277);ctx.lineTo(1000,600);ctx.lineTo(0,600);ctx.fill();
    ctx.fillStyle='#91c887';ctx.beginPath();ctx.moveTo(0,365);ctx.quadraticCurveTo(230,315,500,369);ctx.quadraticCurveTo(760,317,1000,370);ctx.lineTo(1000,600);ctx.lineTo(0,600);ctx.fill();
    // winding path
    ctx.lineCap='round';ctx.strokeStyle='#d7ca9e';ctx.lineWidth=84;ctx.beginPath();ctx.moveTo(0,508);ctx.bezierCurveTo(190,477,160,389,371,407);ctx.bezierCurveTo(577,425,570,324,777,354);ctx.bezierCurveTo(850,364,924,329,1000,310);ctx.stroke();ctx.strokeStyle='#f1dfa9';ctx.lineWidth=68;ctx.stroke();
    // grove patches
    for(let y=300;y<590;y+=25){for(let x=12;x<270;x+=20){if((x+y)%3!==0){ctx.fillStyle=(x+y)%2?'#62a962':'#70b96b';ctx.beginPath();ctx.ellipse(x,y,7,15,-.2,0,Math.PI*2);ctx.fill();}}}
    for(let i=0;i<8;i++){const x=210+i*105,y=305+(i%3)*52;circle(x,y,30,'#528868');circle(x-10,y-12,22,'#68a878');circle(x+13,y-8,21,'#78b986')}
    // signpost, sparkle
    rounded(690,276,14,53,4,'#815f45');rounded(660,267,95,34,8,'#f1dfa9','#997c53');text('MEADOW',707,284,10,'#365441',900,'center','DM Mono');
    for(let i=0;i<7;i++){const x=735+i*19,y=465+Math.sin(i*2)*8;circle(x,y,5,'#fff5b0');circle(x,y,2,'#fff')}
    drawPlayer(185+game.player.x*55,375+game.player.y*27);
    // top UI
    rounded(24,22,302,72,16,'#171b31dc','#ffffff30');circle(58,58,24,'#2d3d39');drawCreature(creatures[game.starter],58,61,.38,false);text(creatures[game.starter].name,93,49,15,colors.ink,900);text(`${creatures[game.starter].type} buddy  ·  Lv. 1`,93,69,10,'#a9b4c6',700,'left','DM Mono');
    pill(`✦ ${game.won} WINS`,847,35,126,'#253148');text('SUNNYGROVE MEADOW',500,42,10,'#eff7d7',900,'center','DM Mono');
    rounded(24,501,362,75,15,'#171b31e8','#ffffff30');text(game.won>=2?'NOVA IS WAITING…':'THE GROVE IS HUMMING…',44,523,10,'#c4f18e',900,'left','DM Mono');text(game.won>=2?'Find the rival at the north trail.':'Wander into the tall grass to find a wild buddy.',44,546,11,'#edf0e3',700);
    text('WASD / ARROWS TO WANDER',959,560,9,'#f2f6df',800,'right','DM Mono');
    if(game.textUntil>game.time){rounded(387,487,275,45,13,'#171b31ed','#ffffff45');text(game.text,524,510,12,'#fff',800,'center')}
  }
  function drawBattle(){
    const b=game.battle;if(!b)return;
    drawBackground('#9fc5d0','#bbdbcf');
    // moonlit arena bands
    ctx.fillStyle='#7798aa';ctx.beginPath();ctx.moveTo(0,255);ctx.quadraticCurveTo(180,192,365,254);ctx.quadraticCurveTo(650,165,1000,250);ctx.lineTo(1000,600);ctx.lineTo(0,600);ctx.fill();
    ctx.fillStyle='#557d78';ctx.beginPath();ctx.moveTo(0,354);ctx.quadraticCurveTo(270,301,510,363);ctx.quadraticCurveTo(765,295,1000,351);ctx.lineTo(1000,600);ctx.lineTo(0,600);ctx.fill();
    ctx.fillStyle='#83a66f';ctx.beginPath();ctx.ellipse(734,405,240,85,-.03,0,Math.PI*2);ctx.fill();ctx.fillStyle='#91b77c';ctx.beginPath();ctx.ellipse(258,451,245,80,.02,0,Math.PI*2);ctx.fill();
    for(let i=0;i<18;i++){const x=(i*89+game.time*9)%1000;ctx.fillStyle='#deefab';ctx.globalAlpha=.4;circle(x,320+(i%4)*19,2,'#deefab');ctx.globalAlpha=1}
    // header
    rounded(26,21,948,70,17,'#171b31ed','#ffffff32');pill(b.trainer?'RHYTHM RIVAL':'WILD ENCOUNTER',47,36,139,b.trainer?'#553c5d':'#2e4a4b');text(b.trainer?'NOVA':'A WILD BUDDY',207,48,13,'#f5f4ff',900);text(b.enemy.name,207,69,11,'#bdc4da',700,'left','DM Mono');
    text('YOU',753,47,10,'#c7f694',900,'right','DM Mono');text(creatures[game.starter].name,753,68,12,'#f4f4ff',900,'right');
    // health bars
    rounded(786,41,160,12,6,'#343951');rounded(786,41,160*(b.enemyHp/100),6,6,'#ff91b5');rounded(786,65,160,8,4,'#343951');rounded(786,65,160*(b.playerHp/100),4,4,'#b6f27d');
    // creatures
    drawCreature(b.enemy,734,218,1.08,true,b.enemyHit);drawCreature(creatures[game.starter],263,339,1.32,false,b.playerHit);
    // rhythm console
    rounded(329,171,342,385,22,'#171b31ed','#73809a');rounded(342,184,316,355,15,'#202640','#3a4260');
    text('FEEL THE BEAT',500,205,10,'#b9c5e1',900,'center','DM Mono');
    const laneX=[381,460,539,618], laneColors=['#84d8fa','#f6acdf','#b9ef86','#ffd27e'];
    laneX.forEach((x,i)=>{
      rounded(x-28,222,56,260,12,'#171b31a8','#3a4462');
      // receptor
      rounded(x-25,411,50,48,12,'#313b58',b.flashLane===i&&game.time-b.flashTime<.14?laneColors[i]:'#5b6584');
      text(['←','↓','↑','→'][i],x,435,25,b.flashLane===i&&game.time-b.flashTime<.14?'#fff':laneColors[i],900,'center');
      for(const note of b.notes){if(note.lane!==i||note.hit||note.missed)continue;const dt=note.target-game.time;if(dt>1.55||dt<-.25)continue;const y=435-dt*178;ctx.save();ctx.shadowColor=laneColors[i];ctx.shadowBlur=14;rounded(x-19,y-19,38,38,11,laneColors[i]);ctx.shadowBlur=0;text(['←','↓','↑','→'][i],x,y,22,'#182134',900,'center');ctx.restore()}
    });
    // score area
    text(String(b.score).padStart(5,'0'),500,510,15,'#eff3ff',900,'center','DM Mono');text('SCORE',500,529,8,'#929cb8',700,'center','DM Mono');
    rounded(28,462,257,93,15,'#171b31e6','#ffffff28');text(b.status||'LISTEN FOR THE BEAT',46,483,10,b.statusColor||'#c6f396',900,'left','DM Mono');
    text(`${b.combo} COMBO`,46,509,18,'#fff',900);text(`${b.hits} / ${b.notes.length} NOTES HIT`,46,534,9,'#aab2cb',700,'left','DM Mono');
    if(b.countIn>game.time){const n=Math.ceil((b.countIn-game.time)/.58);circle(500,314,48,'#171b31db','#b6f27d');text(n>0?String(n):'GO!',500,314,29,'#c6f396',900,'center','DM Mono')}
    if(b.finished){rounded(350,257,300,91,18,'#171b31ed','#b6f27d');text(b.playerHp<=0?'OUT OF RHYTHM':'BEAT COMPLETE!',500,284,19,b.playerHp<=0?'#ff91b5':'#c6f396',900,'center');text('Your final score is '+b.score,500,316,11,'#d3d9ec',700,'center','DM Mono')}
  }
  function drawResult(){
    drawBackground('#b7e5df','#e8f0d1');ctx.fillStyle='#76b583';ctx.fillRect(0,330,1000,270);
    for(let i=0;i<7;i++){const x=120+i*130,y=420+Math.sin(i*2)*28;ctx.fillStyle='#518967';circle(x,y,33,ctx.fillStyle);circle(x-9,y-12,24,'#77b77c')}
    rounded(222,60,556,480,26,'#171b31ed','#ffffff42');
    if(game.battle?.playerHp>0){
      const rival=game.battle.trainer;
      pill(rival?'MEADOW CHAMPION':'A NEW BUDDY!',rival?410:400,91,rival?180:200,rival?'#4c3b5a':'#354c3c');drawCreature(game.battle.enemy,500,232,1.22,false,game.won);
      text(rival?'You outplayed Nova!':'You found your rhythm!',500,302,26,'#fff',900,'center');text(rival?'The grove is yours to explore, beat and all.':`${game.battle.enemy.name} wants to join your little team.`,500,334,13,'#bbc4d9',700,'center');
      rounded(315,370,370,61,13,'#252b43','#424966');text(rival?'✦  RIVAL BEAT  ·  MEADOW CHAMPION':`✦  ${game.won} ${game.won===1?'buddy':'buddies'} befriended`,500,392,13,'#c6f396',900,'center');text(rival?'Keep wandering. There is always another song.':'Good things grow one beat at a time.',500,412,10,'#aab2ca',600,'center');
      button('BACK TO THE MEADOW',364,458,272,52,true,'KEEP EXPLORING  →');
    } else {
      pill('A LITTLE RESET',420,91,160,'#4e3447');drawCreature(creatures[game.starter],500,232,1.15,false,0);
      text('The beat got away from you.',500,302,24,'#fff',900,'center');text('Take a breath, then try that rhythm again.',500,334,13,'#bbc4d9',700,'center');button('TRY AGAIN',410,405,180,52,true,'');
    }
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    if(game.scene==='title')drawTitle();else if(game.scene==='select')drawSelect();else if(game.scene==='map')drawMap();else if(game.scene==='battle')drawBattle();else if(game.scene==='result')drawResult();
  }
  let audioCtx=null;
  function beep(freq=440,duration=.08,volume=.04,wave='sine'){
    if(!game.sound)return;
    try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=wave;osc.frequency.value=freq;gain.gain.setValueAtTime(volume,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+duration)}catch(_){/* sound is optional */}
  }
  function beginBattle(enemy,trainer=false){
    const now=game.time;const notes=[];const pattern=[0,2,1,3,2,0,3,1,0,2,3,1];
    for(let i=0;i<12;i++)notes.push({lane:pattern[(i+game.wildCount)%pattern.length],target:now+2.6+i*.58,hit:false,missed:false});
    game.battle={enemy,trainer,enemyHp:100,playerHp:100,notes,score:0,combo:0,hits:0,perfect:0,status:'LISTEN FOR THE BEAT',statusColor:'#c6f396',countIn:now+1.9,finished:false,finishAt:0,flashLane:-1,flashTime:0,lastPulse:-1};
    game.scene='battle';beep(330,.16,.025,'triangle');
  }
  function endBattle(){
    const b=game.battle;if(!b||b.finished)return;
    b.finished=true;b.finishAt=game.time+1.15;
    if(b.enemyHp<=0||b.playerHp>0){
      if(!b.trainer)game.won++;
      b.playerHp=Math.max(1,b.playerHp);b.status=b.trainer?'RIVAL DEFEATED!':'BUDDY BEFRIENDED!';b.statusColor='#c6f396';beep(660,.25,.05,'triangle');
    }else{b.playerHp=0;b.status='NEED A RESET…';b.statusColor='#ff91b5';beep(150,.35,.04,'sawtooth')}
  }
  function hitLane(lane){
    const b=game.battle;if(game.scene!=='battle'||!b||b.finished)return;
    const candidates=b.notes.filter(n=>!n.hit&&!n.missed&&n.lane===lane&&Math.abs(n.target-game.time)<=.2);
    b.flashLane=lane;b.flashTime=game.time;
    if(!candidates.length){beep(110,.04,.012,'square');return}
    const note=candidates.reduce((a,n)=>Math.abs(a.target-game.time)<Math.abs(n.target-game.time)?a:n);
    const delta=Math.abs(note.target-game.time);note.hit=true;b.combo++;b.hits++;
    const grade=delta<=.065?'PERFECT!':delta<=.13?'GREAT!':'GOOD!';const damage=delta<=.065?14:delta<=.13?11:9;
    b.enemyHp=Math.max(0,b.enemyHp-damage);b.score+=Math.round((delta<=.065?1000:delta<=.13?650:400)*(1+Math.min(b.combo,20)*.04));
    if(delta<=.065)b.perfect++;
    b.status=grade;b.statusColor=delta<=.065?'#c6f396':delta<=.13?'#8be2f2':'#ffd477';b.statusUntil=game.time+.4;
    beep([523,659,784,988][lane],.1,.035,'triangle');
    if(b.enemyHp<=0)endBattle();
  }
  function advanceMap(dx,dy){
    if(game.scene!=='map')return;
    game.player.x=clamp(game.player.x+dx,0,10);game.player.y=clamp(game.player.y+dy,0,7);beep(260,.035,.01,'sine');
    if(game.won>=2&&game.player.x>=9&&game.player.y<=1){beginBattle({name:'Nova’s Beatfox',kind:'fire',color:'#ffad7b',accent:'#df6780',line:'#ffe0a2'},true);return}
    if(game.player.x<=1&&game.player.y>=3){
      game.wildCount++;
      if(Math.random()<.42||game.wildCount%3===0){const pool=creatures.filter((_,i)=>i!==game.starter);const enemy=pool[Math.floor(Math.random()*pool.length)];beginBattle(enemy,false);return}
      game.text='The grass rustles… keep looking!';game.textUntil=game.time+1.7;
    }
  }
  function pointer(event){
    const r=canvas.getBoundingClientRect();const x=(event.clientX-r.left)*W/r.width,y=(event.clientY-r.top)*H/r.height;
    if(game.scene==='title'){
      if(x<500&&y>330&&y<430){game.scene='select';beep(520,.1,.03,'triangle')}
    } else if(game.scene==='select'){
      if(y>180&&y<475){const i=clamp(Math.floor((x-106)/264),0,2);game.starter=i;beep(550+i*90,.1,.025,'triangle')}
      if(y>475&&x>700){game.player={x:4,y:5};game.scene='map';game.text='Head left to the tall grass and find a buddy!';game.textUntil=game.time+4;beep(660,.16,.03,'triangle')}
    } else if(game.scene==='map'){
      const dx=x<420?-1:x>600?1:0,dy=y<270?-1:y>430?1:0;if(dx||dy)advanceMap(dx,dy);
    } else if(game.scene==='battle'){
      if(x<328&&y>440)hitLane(0);else if(x<490&&y>440)hitLane(1);else if(x<570&&y>440)hitLane(2);else if(y>440)hitLane(3);
    } else if(game.scene==='result'){
      if(game.battle?.playerHp>0){game.scene='map';game.text=game.won>=2?'Nova is waiting at the north trail!':'Your buddy is settling in. Keep exploring!';game.textUntil=game.time+3.4;game.player={x:4,y:5}}
      else beginBattle(game.battle.enemy,game.battle.trainer);
    }
  }
  canvas.addEventListener('pointerdown',event=>{event.preventDefault();pointer(event)});
  const laneKeys={ArrowLeft:0,KeyA:0,ArrowDown:1,KeyS:1,ArrowUp:2,KeyW:2,ArrowRight:3,KeyD:3};
  window.addEventListener('keydown',event=>{
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(event.code))event.preventDefault();
    if(keys.has(event.code))return;keys.add(event.code);
    if(game.scene==='battle'&&laneKeys[event.code]!==undefined){hitLane(laneKeys[event.code]);return}
    if(game.scene==='title'&&(event.code==='Enter'||event.code==='Space'||event.code==='KeyA'))game.scene='select';
    else if(game.scene==='select'){
      if(event.code==='ArrowLeft'||event.code==='KeyA')game.starter=(game.starter+2)%3;
      if(event.code==='ArrowRight'||event.code==='KeyD')game.starter=(game.starter+1)%3;
      if(event.code==='Enter'||event.code==='Space'){game.player={x:4,y:5};game.scene='map';game.text='Head left to the tall grass and find a buddy!';game.textUntil=game.time+4}
    } else if(game.scene==='map'){
      if(event.code==='ArrowLeft'||event.code==='KeyA')advanceMap(-1,0);else if(event.code==='ArrowRight'||event.code==='KeyD')advanceMap(1,0);else if(event.code==='ArrowUp'||event.code==='KeyW')advanceMap(0,-1);else if(event.code==='ArrowDown'||event.code==='KeyS')advanceMap(0,1);
    } else if(game.scene==='result'&&(event.code==='Enter'||event.code==='Space')){
      if(game.battle?.playerHp>0){game.scene='map';game.player={x:4,y:5};game.text=game.won>=2?'Nova is waiting at the north trail!':'Your buddy is settling in. Keep exploring!';game.textUntil=game.time+3.4}else beginBattle(game.battle.enemy,game.battle.trainer)
    }
  });
  window.addEventListener('keyup',event=>keys.delete(event.code));
  document.getElementById('touchControls').addEventListener('pointerdown',event=>{const btn=event.target.closest('button');if(btn){event.preventDefault();hitLane(Number(btn.dataset.lane))}});
  document.getElementById('soundToggle').addEventListener('click',event=>{game.sound=!game.sound;event.currentTarget.innerHTML=game.sound?'♫ <span>Sound on</span>':'♫ <span>Sound off</span>';if(game.sound)beep(660,.1,.03,'triangle')});
  function frame(ms){
    game.time=ms/1000;
    if(game.scene==='battle'&&game.battle&&!game.battle.finished){
      const b=game.battle;
      b.notes.forEach(n=>{if(!n.hit&&!n.missed&&game.time>n.target+.205){n.missed=true;b.combo=0;b.playerHp=Math.max(0,b.playerHp-9);b.status='MISS';b.statusColor='#ff91b5';b.statusUntil=game.time+.45;beep(120,.08,.025,'square')}});
      const beatIndex=Math.floor((game.time-(b.countIn+.7))/.58);
      if(beatIndex>=0&&beatIndex!==b.lastPulse){b.lastPulse=beatIndex;if(game.sound)beep(beatIndex%4===0?330:220,.055,.012,'sine')}
      if(b.notes.every(n=>n.hit||n.missed)&&game.time>b.notes[b.notes.length-1].target+.3)endBattle();
      if(b.playerHp<=0)endBattle();
    } else if(game.scene==='battle'&&game.battle?.finished&&game.time>=game.battle.finishAt){game.scene='result'}
    draw();requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

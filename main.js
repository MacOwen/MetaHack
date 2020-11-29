var time;
var dt;
var ctx;
var images={};
var buttons={};
var textFields={};
var skillBars={};
var errors={};
var timers={};
var progressBars={};

var prize;
var tasks;
var totalTasks;
var remainingTasks;

var gameWidth;
var gameHeight;
var pixelSize;
var horizontal;
var offset;

var textScaling;

var mouseX;
var mouseY;
//The user's mouse position in-game, adjusted for canvas position
var gameX;
var gameY;
//The user's game position, in pixels
var pixelX;
var pixelY;

var FRONTEND_MULTIPLIER = 1;
var BACKEND_MULTIPLIER = 1;

var BACKGROUND_COLOR = "white";

var states={};
states.inMenu=true;
states.choosingStats=false;
states.choosingHackathon=false;
states.choosingTeam=false;
states.inHackathon=false;
states.prizeScreen=false;;
states.scoreScreen=false;
states.leaderboard=false;

var gameValues={};
gameValues.level = 1;
gameValues.score = 0;


//The player's default stats (unused)
stats={};
stats.stamina=0;
stats.frontend=0;
stats.backend=0;
stats.collaboration=0;
stats.boost=0;

taskManager={}
taskManager.assigning=false;
taskManager.selectedTask=0;
taskManager.firstBusy=false;
taskManager.secondBusy=false;
taskManager.thirdBusy=false;

//The array of extra team members
members=[];
availableMembers=[];

//Name, stamina, frontend, backend, collaboration, % cut
people=[
    ["Arifur Rahman",1, 3, 2, 0, 0.20],
    ["Andrew Chen",3, 1, 2, 1, 0.25],
    ["George Hertz", 4, 4, 5, 1, 0.50],
    ["Patryk Lezon",1,3,3,2,0.33],
    ["Linus Torvalds",2,2,5,5,0.75]
    
];

//Name, Team Size (string), frontend (0-1), backend (0-1), prizes
hackathons=[
    ["N00b Hacking","1-2",0.3,0.15,1000],
    ["Hackionaire?","2-4",0.5,0.4,5500],
    ["BlockchainHacks","4-5",0.8,0.95,12000]
]

//Name, time, type (0=front,1=back)
frontTasks=[
    ["CSS",30,0],
    ["ReactJS integration",30,0],
    ["Site design",30,0],
    ["Canvas animations",30,0]
]
backTasks=[
    ["Blockchain tests",30,1],
    ["Image compression",30,1],
    ["Cloud sync",30,1],
    ["AI Training",30,1]
]


projects=[
    
]


onmousemove = function(obj){
    mouseX=obj.clientX;
    mouseY=obj.clientY;
    gameX = mouseX-offset;
    gameY = mouseY;
    pixelX=gameX/pixelSize;
    pixelY=gameY/pixelSize;
    //console.log("mouse location:", obj.clientX, obj.clientY);
    //console.log("game location:",gameX,gameY);
    //console.log("pixel location:",pixelX,pixelY)
};

onclick = function(){
    clickButtons();
}

class Error{
    constructor(x,y,size,text,ttl){
	this.x=x;
	this.y=y;
	this.size=size;
	this.text=text;
	this.ttl=ttl;
	this.color="red";
	this.enabled=false;
    }
    show(){
	this.enabled=true;
    }
    draw(){
	if(!this.enabled){return;}
	ctx.font = (this.size*textScaling).toString()+"px "+"FFFFORWA";
	ctx.fillStyle = this.color;
	ctx.fillText(this.text,this.x*pixelSize,this.y*pixelSize);
    }
}

class SkillBar{
    constructor(x,y,sizeX,sizeY,progress){
	this.x=x;
	this.y=y;
	this.sizeX=sizeX;
	this.sizeY=sizeY;
	this.progress=progress;
	this.backgroundColor = "grey";
    }
    draw(){
	underline(this.backgroundColor,this.x,this.y,this.sizeX,this.sizeY);
	var topColor;
	if(this.progress<0.33){
	    topColor="lime";
	}
	else if(this.progress<0.66){
	    topColor="yellow";
	}
	else{
	    topColor="red";
	}
	underline(topColor,this.x,this.y,this.sizeX*this.progress,this.sizeY);
    }
}

class ProgressBar{
    constructor(x,y,sizeX,sizeY,seconds){
	this.x = x;
	this.y = y;
	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.timer = new Timer();
	this.timer.seconds=30;
	this.backgroundColor = "grey";
	this.task=0;
    }
    draw(){
	underline(this.backgroundColor,this.x,this.y,this.sizeX,this.sizeY);
	underline("lime",this.x,this.y,this.sizeX*this.timer.progress,this.sizeY);
    }
    reset(){
	this.timer.reset();
    }
    update(){
	this.timer.update();
    }
}

class Timer{
    constructor(){
	this.start=Date.now();
	this.seconds=0;
	this.finished=false;
	this.progress=0;
    }
    update(){
	if(Date.now()>this.start+this.seconds){
	    this.progress=1;
	    this.finished=true;
	    return;
	}
	this.progress=(Date.now()-this.start)/this.seconds;
    }
    reset(){
	this.finished=false;
	this.progress=0;
	this.start=Date.now();
    }
}

//var timr = new Timer(Date.now(),10);

class TextField{
    constructor(x,y,size,text,color){
	this.x=x
	this.y=y
	this.size=size
	this.text=text;
	this.color=color;
    }
    draw(){
	ctx.font = (this.size*textScaling).toString()+"px "+"FFFFORWA";
	ctx.fillStyle = this.color;
	ctx.fillText(this.text,this.x*pixelSize,this.y*pixelSize);
    }
}


class Button{
    constructor(img1,img2,x,y,sizeX,sizeY,onClick,param){
	this.img1=img1;
	this.img2=img2;
	this.x=x;
	this.y=y;
	this.sizeX=sizeX;
	this.sizeY=sizeY;
	this.onClick=onClick;
	this.param=param;
	this.enabled=false;
    }
    inBounds(){
	if(pixelX>this.x && pixelX<this.x+this.sizeX){
	    if(pixelY>this.y && pixelY<this.y+this.sizeY){
		return true;
	    }
	}
	return false;
    }
    draw(){
	var imgToDraw;
	if(this.inBounds()){
	    imgToDraw = this.img2;
	}
	else{
	    imgToDraw = this.img1;
	}
	drawImage(imgToDraw,this.x,this.y,this.sizeX,this.sizeY);
    }
    click(){
	if(!this.enabled){return;}
	if(this.inBounds()){
	    this.onClick(this.param);
	}
    }
}

function shuffleIndices(set){
    var o=[];
    for(i=0;i<set.length;i++){
	o.push(i);
    }
    var output=[];
    for(i=0;i<set.length;i++){
	var memberIndex = Math.floor(Math.random()*o.length);
	output.push(o[memberIndex]);
	o.splice(memberIndex,1);
	
    }
    return output;
}

function getTasks(){
    var output=[];
    var h = hackathons[gameValues.level];
    var frontNum = Math.ceil(h[2]*5);
    var backNum = Math.ceil(h[3]*5);

    var frontShuffled = shuffleIndices(frontTasks);
    var backShuffled = shuffleIndices(backTasks);

    for(var i=0;i<Math.min(frontNum,frontTasks.length);i++){
	output.push(frontTasks[frontShuffled[i]]);
    }
    for(var i=0;i<Math.min(backNum,backTasks.length);i++){
	output.push(backTasks[backShuffled[i]]);
    }
    return output;
}

function totalCut(){
    var total=0;
    for(i=0;i<members.length;i++){
	total+=members[i][5];
    }
    return total;
}

function acceptMember(){
    if(members.length==3){
	errors.teamSize.show();
	return;
    }
    if(totalCut()+people[availableMembers[0]][5]>=1.0){
	errors.teamCut.show();
	return;
    }
    
    members.push(people[availableMembers[0]]);
    availableMembers.shift();

    if(availableMembers.length==0){
	startHackathon();
	return;
    }
    loadMemberData(people[availableMembers[0]]);
}

function rejectMember(){

    availableMembers.shift();

    if(availableMembers.length==0){
	startHackathon();
	return;
    }
    loadMemberData(people[availableMembers[0]]);
}

function selectTask(index){
    taskManager.selectedTask=index;
    taskManager.assigning=true;

    buttons.memberAssign1.enabled=true;
    buttons.memberAssign2.enabled=true;
    buttons.memberAssign3.enabled=true;
}

function assignTask(memberIndex){
    taskManager.assigning = false;
    if(memberIndex==0){
	taskManager.firstBusy=true;
	progressBars.progress1.timer.seconds=10*1000;
	progressBars.progress1.task=taskManager.selectedTask;
	progressBars.progress1.reset();
    }
    else if(memberIndex==1){
	taskManager.secondBusy=true;
	progressBars.progress2.timer.seconds=10*1000;
	progressBars.progress2.task=taskManager.selectedTask;
	progressBars.progress2.reset();
    }
    else if(memberIndex==2){
	taskManager.thirdBusy=true;
	progressBars.progress3.timer.seconds=10*1000;
	progressBars.progress3.task=taskManager.selectedTask;
	progressBars.progress3.reset();
    }
}

function taskFinished(memberIndex){
    remainingTasks-=1;
    tasks.splice(progressBars["progress"+(memberIndex+1).toString()].task,1)
}

function drawImage(img,x,y,sizeX,sizeY){
    var startX=pixelSize*x;
    var startY=pixelSize*y;
    ctx.drawImage(img,startX,startY,pixelSize*sizeX,pixelSize*sizeY);
}

function underline(color,x,y,sizeX,sizeY){
    ctx.beginPath();
    ctx.fillStyle = color;

    var startX=pixelSize*x;
    var startY=pixelSize*y;
    
    ctx.fillRect(startX,startY,pixelSize*sizeX,pixelSize*sizeY)
    ctx.stroke();
}

function loadImages(){
    imgSrcs = ["images/mainmenu.png",
	       "images/desktop.png",
	       "images/buttons/start1.png",
	       "images/buttons/start2.png",
	       "images/buttons/confirm1.png",
	       "images/buttons/confirm2.png",
	       "images/buttons/select1.png",
	       "images/buttons/select2.png",
	       "images/buttons/minus1.png",
	       "images/buttons/minus2.png",
	       "images/buttons/plus1.png",
	       "images/buttons/plus2.png",
	       "images/buttons/accept1.png",
	       "images/buttons/accept2.png",
	       "images/buttons/reject1.png",
	       "images/buttons/reject2.png",
	       "images/buttons/ready1.png",
	       "images/buttons/ready2.png",
	       "images/buttons/assign1.png",
	       "images/buttons/assign2.png",
	       "images/buttons/busy1.png",
	       "images/buttons/busy2.png",
	       "images/buttons/cancel1.png",
	       "images/buttons/cancel2.png"
	      ];
    function addImage(name,src){
	var img = new Image();
	img.src = src;
	images[name]=img;
    }

    addImage("menu",imgSrcs[0]);
    addImage("desktop",imgSrcs[1]);
    addImage("start1",imgSrcs[2]);
    addImage("start2",imgSrcs[3]);
    addImage("confirm1",imgSrcs[4]);
    addImage("confirm2",imgSrcs[5]);
    addImage("select1",imgSrcs[6]);
    addImage("select2",imgSrcs[7]);
    addImage("minus1",imgSrcs[8]);
    addImage("minus2",imgSrcs[9]);
    addImage("plus1",imgSrcs[10]);
    addImage("plus2",imgSrcs[11]);
    addImage("accept1",imgSrcs[12]);
    addImage("accept2",imgSrcs[13]);
    addImage("reject1",imgSrcs[14]);
    addImage("reject2",imgSrcs[15]);
    addImage("ready1",imgSrcs[16]);
    addImage("ready2",imgSrcs[17]);
    addImage("assign1",imgSrcs[18]);
    addImage("assign2",imgSrcs[19]);
    addImage("busy1",imgSrcs[20]);
    addImage("busy2",imgSrcs[21]);
    addImage("cancel1",imgSrcs[22]);
    addImage("cancel2",imgSrcs[23]);
}

function loadButtons(){
    buttons.startButton = new Button(images.start1,images.start2,32,100,64,24,startGame);;

    //Choosing Hackathon
    var buttonIncrement = 7;
    buttons.staminaMinus = new Button(images.minus1,images.minus2,44,48+buttonIncrement*0,5,5,console.log,"ms");
    buttons.staminaPlus = new Button(images.plus1,images.plus2,58,48+buttonIncrement*0,5,5,console.log,"ps");
    buttons.frontendMinus = new Button(images.minus1,images.minus2,44,48+buttonIncrement*1,5,5,console.log,"mf");
    buttons.frontendPlus = new Button(images.plus1,images.plus2,58,48+buttonIncrement*1,5,5,console.log,"pf");
    buttons.backendMinus = new Button(images.minus1,images.minus2,44,48+buttonIncrement*2,5,5,console.log,"mb");
    buttons.backendPlus = new Button(images.plus1,images.plus2,58,48+buttonIncrement*2,5,5,console.log,"pb");
    buttons.collabMinus = new Button(images.minus1,images.minus2,44,48+buttonIncrement*3,5,5,console.log,"mc");
    buttons.collabPlus = new Button(images.plus1,images.plus2,58,48+buttonIncrement*3,5,5,console.log,"pc");
    buttons.hackathonStart = new Button(images.confirm1,images.confirm2,16,70,35,9,chooseTeam);

    //Choosing Team
    buttons.accept = new Button(images.accept1,images.accept2,35,84,27,9,acceptMember);
    buttons.reject = new Button(images.reject1,images.reject2,4,84,27,9,rejectMember);
    buttons.ready = new Button(images.ready1,images.ready2,92,95,23,9,startHackathon);

    //In hackathon
    buttons.taskSelect1 = new Button(images.assign1,images.assign2,45,74,28*0.6,9*0.6,selectTask,0);
    buttons.taskSelect2 = new Button(images.assign1,images.assign2,45,80,28*0.6,9*0.6,selectTask,1);
    buttons.taskSelect3 = new Button(images.assign1,images.assign2,45,86,28*0.6,9*0.6,selectTask,2);
    buttons.memberAssign1 = new Button(images.assign1,images.assign2,110,40,28*0.6,9*0.6,assignTask,0);
    buttons.memberAssign2 = new Button(images.assign1,images.assign2,110,60,28*0.6,9*0.6,assignTask,1);
    buttons.memberAssign3 = new Button(images.assign1,images.assign2,110,80,28*0.6,9*0.6,assignTask,2);

    //Prize Screen
    buttons.prizeAccept = new Button(images.accept1,images.accept2,19,84,27,9,acceptMember);
}

function loadTextFields(){
    

    //Hackathon info
    textFields.hackathonLevel = new TextField(24,54,38,"Level :","black");
    textFields.hackathonInstructions = new TextField(4,65,24,"Press 'confirm' to pick team");
    textFields.hackathonInfoTitle = new TextField(98,34,32,"Info","black");
    textFields.hackathonInfoSkills = new TextField(96,80,32,"Skills","black");   
    textFields.hackathonInfoName = new TextField(80,42,24,"Name: ","black");    
    textFields.hackathonInfoSize = new TextField(80,48,24,"Team Size: ","black");
    textFields.hackathonInfoPrizes = new TextField(80,54,24,"Prizes: ","black");
    textFields.hackathonInfoFront = new TextField(80,88,24,"Frontend:","black");    
    textFields.hackathonInfoBack = new TextField(80,94,24,"Backend:","black");

    //Member info
    textFields.memberName = new TextField(17.5,51,24,"Name:","black");
    textFields.memberStamina = new TextField(12,57,24,"Stamina:","black");
    textFields.memberFront = new TextField(10.5,63,24,"Frontend:","black");
    textFields.memberBack = new TextField(11.5,69,24,"Backend:","black");
    textFields.memberCollab = new TextField(2,75,24,"Collaboration:","black");
    textFields.memberCut = new TextField(21,81,24,"Cut:","black");
    textFields.memberInstructionTitle = new TextField(88,34,32,"Instructions","black");
    textFields.memberInstructions1 = new TextField(80,42,24,"Recruit teammates and","black");
    textFields.memberInstructions2 = new TextField(80,48,24,"click 'ready' to start","black");
    textFields.memberTeamHeader = new TextField(96,59,32,"Team","black");
    textFields.member1 = new TextField(82,68,24,"","black");
    textFields.member2 = new TextField(82,76,24,"","black");
    textFields.member3 = new TextField(82,84,24,"","black");

    //In Hackathon
    textFields.timeRemaining = new TextField(2,51,24,"Seconds Remaining: ","red");
    textFields.tasksComplete = new TextField(2,57,24,"Tasks Complete: ","black");
    textFields.tasksHeader = new TextField(24,68,32,"Tasks","black");
    textFields.task1 = new TextField(4,78,24,"task:","black");
    textFields.task2 = new TextField(4,84,24,"task:","black");
    textFields.task3 = new TextField(4,90,24,"task:","black");
    textFields.memberHeader = new TextField(92,33,32,"Members","black");
    textFields.name1 = new TextField(80,45,24,"name","black");
    textFields.name2 = new TextField(80,65,24,"name","black");
    textFields.name3 = new TextField(80,85,24,"name","black");

    //Prize Screen
    textFields.congratulations = new TextField(10,54,32,"Congratulations!","black");
    textFields.prize = new TextField(14,65,24,"You Won: 1st place");
    textFields.prizeReward = new TextField(24,80,32,"$1000","black");
}

function loadSkillBars(){
    //Hackathon Info
    skillBars.hackathonFront = new SkillBar(100,86,16,2,0.3);
    skillBars.hackathonBack = new SkillBar(100,92,16,2,0.15);

    //Member Info
    skillBars.memberStamina = new SkillBar(30,54.5,16,2,0.1);
    skillBars.memberFront = new SkillBar(30,60.5,16,2,0.5);
    skillBars.memberBack = new SkillBar(30,66.5,16,2,0.9);
    skillBars.memberCollab = new SkillBar(30,72.5,16,2,0.2);
}

function loadErrors(){
    errors.teamSize = new Error(3,15,40,"Teams are limited to a maximum of 3",5);
    errors.teamCut = new Error(3,15,40,"Team cut cannot exceed 100%",5);
}

function loadTimers(){
    timers.hackathonTimer = new Timer();
    timers.progress1 = new Timer();
    timers.progress2 = new Timer();
    timers.progress3 = new Timer();
}

function loadProgressBars(){
    progressBars.progress1 = new ProgressBar(110,42.5,16,2,30);
    progressBars.progress2 = new ProgressBar(110,62.5,16,2,30);
    progressBars.progress3 = new ProgressBar(110,82.5,16,2,30);
    progressBars.progress1.timer.finished = false;
    progressBars.progress2.timer.finished = false;
    progressBars.progress3.timer.finished = false;
}

function clickButtons(){
    buttons.startButton.click();
    buttons.hackathonStart.click();
    buttons.accept.click();
    buttons.reject.click();
    buttons.ready.click();

    buttons.taskSelect1.click();
    buttons.taskSelect2.click();
    buttons.taskSelect3.click();
    buttons.memberAssign1.click();
    buttons.memberAssign2.click();
    buttons.memberAssign3.click();
}

function loadHackathonData(level){
    var hackathon = hackathons[level];
    textFields.hackathonInfoName.text = "Name: "+hackathon[0];
    textFields.hackathonInfoSize.text = "Team Size: "+hackathon[1];
    textFields.hackathonInfoPrizes.text = "Prizes: $"+hackathon[4].toString();

    skillBars.hackathonFront.progress=hackathon[2];
    skillBars.hackathonBack.progress=hackathon[3];
}

function loadMemberData(member){
    textFields.memberName.text = "Name: "+member[0];
    textFields.memberCut.text = "Cut: "+(100*member[5]).toString()+"%";

    skillBars.memberStamina.progress = 0.2*member[1];
    skillBars.memberFront.progress = 0.2*member[2];
    skillBars.memberBack.progress = 0.2*member[3];
    skillBars.memberCollab.progress = 0.2*member[4];

    if(members.length>0){textFields.member1.text=members[0][0];}
    if(members.length>1){textFields.member2.text=members[1][0];}
    if(members.length>2){textFields.member3.text=members[2][0];}
}

function startGame(){
    console.log("Game Started");
    states.inMenu=false;
    buttons.startButton.enabled=false;
    
    
    //For now, stats menu is skipped (not enough time to implement)
    //states.choosingStats=true;
    
    states.choosingHackathon=true;
    loadHackathonData(1);
    buttons.hackathonStart.enabled=true;
    textFields.hackathonLevel.text = "Level "+(gameValues.level+1).toString()+":"
}


function chooseTeam(){
    console.log("Choosing Team");
    members=[];
    availableMembers=shuffleIndices(people);
    
    loadMemberData(people[availableMembers[0]]);
    buttons.hackathonStart.enabled=false;
    buttons.reject.enabled=true;
    buttons.accept.enabled=true;
    buttons.ready.enabled=true;
    
    states.choosingHackathon=false;
    states.choosingTeam=true;
}

function startHackathon(){
    console.log("Starting Hackathon");
    
    buttons.reject.enabled=false;
    buttons.accept.enabled=false;
    buttons.ready.enabled=false;
    buttons.taskSelect1.enabled=true;
    buttons.taskSelect2.enabled=true;
    buttons.taskSelect3.enabled=true;

    tasks = getTasks();
    totalTasks = tasks.length;
    remainingTasks = totalTasks;
    
    states.choosingTeam=false;
    states.inHackathon=true;

    timers.hackathonTimer.seconds = 60*1000;
    timers.hackathonTimer.reset();
}

function finishHackathon(){
    console.log("Finished Hackathon");
    gameValues.level+=1;

    states.inHackathon=false;
    states.prizeScreen=true;
}

function initializeCanvas(){
    var canvas = document.getElementById("canvas1");
    var w = window.innerWidth;
    var h = window.innerHeight;
    if(w>h){
	gameWidth = h;
	gameHeight = h;
	horizontal=true;
	offset=(w-h)/2;
    }
    else{
	gameWidth = w;
	gameHeight = w;
	horizontal=false;
	offset=0;
    }
    pixelSize = gameHeight/128;
    
    canvas.width = gameWidth;
    canvas.height = gameHeight;

    textScaling = gameWidth/1000;
    console.log("textScaling = ",textScaling);
    
    ctx = canvas.getContext("2d");
    time = Date.now();

    loadImages();
    loadButtons();
    loadTextFields();
    loadSkillBars();
    loadErrors();
    loadTimers();
    loadProgressBars();
    
    buttons.startButton.enabled=true;    
    animate();
}

function animate(){
    requestAnimationFrame(animate);

    ctx.clearRect(0,0,gameWidth,gameHeight);
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0,0,gameWidth,gameHeight);

    if(states.inMenu){
	drawImage(images.menu,0,0,128,128);

	buttons.startButton.draw();


	
	return;
    }
    if(states.choosingStats){
	drawImage(images.desktop,0,0,128,128);

	//Draw stat plus/minus buttons
	buttons.staminaMinus.draw();
	buttons.staminaPlus.draw();
	buttons.frontendMinus.draw();
	buttons.frontendPlus.draw();
	buttons.backendMinus.draw();
	buttons.backendPlus.draw();
	buttons.collabMinus.draw();
	buttons.collabPlus.draw();

	return;
    }
    if(states.choosingHackathon){
	//For now, hackathon "choosing" consists of accepting predetermined hackathon
	drawImage(images.desktop,0,0,128,128);

	textFields.hackathonLevel.draw();
	textFields.hackathonInstructions.draw();
	
	textFields.hackathonInfoTitle.draw();
	underline("black",97,35,12,1);
	textFields.hackathonInfoName.draw();
	textFields.hackathonInfoSize.draw();
	textFields.hackathonInfoPrizes.draw();

	textFields.hackathonInfoSkills.draw();
	underline("black",95,81,16,1);

	textFields.hackathonInfoFront.draw();
	textFields.hackathonInfoBack.draw();
	skillBars.hackathonFront.draw();
	skillBars.hackathonBack.draw();
	
	
	buttons.hackathonStart.draw();
	
	
	return;
    }
    if(states.choosingTeam){
	drawImage(images.desktop,0,0,128,128);

	buttons.accept.draw();
	buttons.reject.draw();
	buttons.ready.draw();

	textFields.memberName.draw();
	textFields.memberStamina.draw();
	textFields.memberFront.draw();
	textFields.memberBack.draw();
	textFields.memberCollab.draw();
	textFields.memberCut.draw();

	textFields.memberInstructionTitle.draw();
	underline("black",87.5,35,33,1);
	textFields.memberInstructions1.draw();
	textFields.memberInstructions2.draw();
	textFields.memberTeamHeader.draw();
	underline("black",95.5,60,16,1);

	textFields.member1.draw();
	textFields.member2.draw();
	textFields.member3.draw();

	skillBars.memberStamina.draw();
	skillBars.memberFront.draw();
	skillBars.memberBack.draw();
	skillBars.memberCollab.draw();

	errors.teamSize.draw();
	errors.teamCut.draw();
	
	return;
    }
    if(states.inHackathon){
	drawImage(images.desktop,0,0,128,128);

	//Draw team members
	textFields.memberHeader.draw();
	underline("black",91.5,34,26,1);
	if(members.length>0){
	    textFields.name1.text=members[0][0]+":";
	    if(!taskManager.firstBusy && !taskManager.assigning){
		textFields.name1.text+=" Free";
	    }
	    else if(taskManager.firstBusy){
		progressBars.progress1.draw();
	    }
	    textFields.name1.draw();
	}
	if(members.length>1){
	    textFields.name2.text=members[1][0]+":";
	    if(!taskManager.secondBusy && !taskManager.assigning){
		textFields.name2.text+=" Free";
	    }
	    else if(taskManager.secondBusy){
		progressBars.progress2.draw();
	    }
	    textFields.name2.draw();
	}
	if(members.length>2){
	    textFields.name3.text=members[2][0]+":";
	    if(!taskManager.thirdBusy && !taskManager.assigning){
		textFields.name3.text+=" Free";
	    }
	    else if(taskManager.thirdBusy){
		progressBars.progress3.draw();
	    }
	    textFields.name3.draw();
	}


	//Update Timers
	timers.hackathonTimer.update();
	if(taskManager.firstBusy){
	    progressBars.progress1.update();
	}
	if(taskManager.secondBusy){
	    progressBars.progress2.update();
	}
	if(taskManager.thirdBusy){
	    progressBars.progress3.update();
	}
	
	
	
	if(timers.hackathonTimer.finished){
	    finishHackathon();
	}
	if(progressBars.progress1.timer.finished){
	    taskManager.firstBusy=false;
	    progressBars.progress1.timer.finished=false;

	    //Adjust indices due to list removal
	    progressBars.progress2.task-=1;
	    progressBars.progress3.task-=1;
	    taskFinished(0);
	}
	if(progressBars.progress2.timer.finished){
	    taskManager.secondBusy=false;
	    progressBars.progress2.timer.finished=false;

	    //Adjust indices due to list removal
	    progressBars.progress3.task-=1;
	    taskFinished(1);
	}
	if(progressBars.progress3.timer.finished){
	    taskManager.thirdBusy=false;
	    progressBars.progress3.timer.finished=false;
	    taskFinished(2);
	}

	if(tasks.length==0){
	    finishHackathon();
	    return
	}
	
	//Draw tasks and buttons
	textFields.task1.text = tasks[0][0];
	textFields.task1.draw();
	if(!taskManager.firstBusy){buttons.taskSelect1.draw();}
	if(remainingTasks>1){
	    textFields.task2.text = tasks[1][0];
	    textFields.task2.draw();
	    if(!taskManager.secondBusy){buttons.taskSelect2.draw();}
	}
	if(remainingTasks>2){
	    textFields.task3.text = tasks[2][0];
	    textFields.task3.draw();
	    if(!taskManager.thirdBusy){buttons.taskSelect3.draw();}
	}
	
	
	if(taskManager.assigning){
	    if(members.length>0){
		if(!taskManager.firstBusy){
		    buttons.memberAssign1.draw();
		}
	    }
	    if(members.length>1){
		if(!taskManager.secondBusy){
		    buttons.memberAssign2.draw();
		}
	    }
	    if(members.length>2){
		if(!taskManager.thirdBusy){
		    buttons.memberAssign3.draw();
		}
	    }
	}
	

	
	textFields.timeRemaining.text="Seconds Remaining: "+(Math.floor((1-timers.hackathonTimer.progress)*(timers.hackathonTimer.seconds/1000))).toString();
	textFields.timeRemaining.draw();
	textFields.tasksComplete.text="Tasks Complete: "+(totalTasks-remainingTasks).toString()+"/"+totalTasks.toString();
	textFields.tasksComplete.draw();
	textFields.tasksHeader.draw();
	
	underline("black",23.5,69,17,1);
	
	
	//console.log(timers.hackathonTimer.progress);
	//console.log(Math.floor((1-timers.hackathonTimer.progress)*(timers.hackathonTimer.seconds/1000)));
	return;
    }
    if(states.prizeScreen){
	drawImage(images.desktop,0,0,128,128);

	textFields.congratulations.draw();
	textFields.prize.draw();
	textFields.prizeReward.draw();

	buttons.prizeAccept.draw();
    }
}

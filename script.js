// All Code by Wmtmky, 2022
// Elementary version
version = "alpha-1.0.9";

window.addEventListener('load', loadSaveGame);
window.addEventListener('resize', checkMobile);
window.addEventListener('orientationchange', checkMobile);

var achievementContainer = document.getElementById('achievement-container');
var workspaceContainer = document.getElementById('workspace-container');
var workspaces = new Array();
var workspaceIcon = document.getElementById('workspace-icon');
var items = new Array();
var inventoryContainer = document.getElementById('inventory');
var inventory = new Array();
var achievements = new Array();
var completedAchievements = new Array();
var incompleteAchievements = new Array();

var currentWorkspace;
var particleDiameter = window.innerHeight * 0.08;

function loadSaveGame() {

    document.getElementById('version').innerHTML = version;
    window.scrollTo(0, 1);
    checkMobile();
    
    // first time players
    let pageLoads = localStorage.getItem('--elementary-game-pageloads');
    pageLoads++ || 1;
    localStorage.setItem('--elementary-game-pageloads', pageLoads);
    if(pageLoads <= 1) document.getElementById('helpbox-container').style.display = "flex";
    
    // toolbar
    document.documentElement.style.setProperty('--toolbar-hue', Math.floor(Math.random() * 360))
    
    // load workspace
    workspaces = JSON.parse(localStorage.getItem('--elementary-game-workspaces')) || ['strong'];
    for(let workspace of workspaces) {
        addWorkspace(workspace);
    }
    workspaceContainer.children[0].classList.add('active-workspace');
    workspaceContainer.children[0].style.display = "block";
    workspaceIcon.setAttribute('href','#' + workspaces[0] + '-icon');
    currentWorkspace = workspaces[0];
    
    // load inventory
    inventory = JSON.parse(localStorage.getItem('--elementary-game-inventory')) || ['up','antiup','down','antidown'];
    loadInventory(workspaces[0]);

    // load achievements
    completedAchievements = JSON.parse(localStorage.getItem('--elementary-game-completed-achievements')) || new Array();
    for(let achievement in achievements) if(!completedAchievements.includes(achievement)) incompleteAchievements.push(achievement);

    // dev reminder
    workspaceContainer.children[0].innerHTML = "Please note Elementary is still in early development meaning features may be added or removed at any time.<br>In the event of a bug, the game may be hard-reset by right-clicking and then double-left-clicking the clear-workspace icon.";
    setTimeout(function() {
        workspaceContainer.children[0].style.color = "var(--workspace-colour)";
    }, 10000);

}

function toggleHelpbox() {
    let helpbox = document.getElementById('helpbox-container');
    helpbox.style.display = (helpbox.style.display == 'flex')? 'none': 'flex';
}

function rightClickClear(event) {
    event.preventDefault();
    event.target.addEventListener('dblclick',resetGame)
}

function checkMobile() {
    if (typeof screen.orientation == 'undefined') return; //if desktop, ignore
    document.documentElement.style.setProperty('--usable-height', window.innerHeight + "px");
}

function resetGame() {
    localStorage.clear()
    clearWorkspace()
    console.log('Game Reset')
}


// WORKSPACES

function clearWorkspace() {
    document.getElementsByClassName('active-workspace')[0].replaceChildren(); 
}

function addWorkspace(force) {

    //add to memory
    if(!workspaces.includes(force)) workspaces.push(force);
    localStorage.setItem('--elementary-game-workspaces', JSON.stringify(workspaces));

    //add to html
    let workspaceDiv = document.createElement('div');
    workspaceDiv.setAttribute('id', force);
    workspaceDiv.setAttribute('class','');
    workspaceDiv.style.display = "none";
    workspaceContainer.appendChild(workspaceDiv);
}

function changeWorkspace(num) {

    let newWorkspace = currentWorkspace; //initialization placeholder
    
    // select next workspace in array
    for(let i = 0; i < workspaces.length; i++) {
        if (workspaces[i] == currentWorkspace) {
            newWorkspace = workspaces[(i + num) % workspaces.length];
            break;
        }
    }
    
    // hide old workspace
    for(let workspace of workspaceContainer.children) {
        workspace.style.display = "none";
        workspace.classList.remove('active-workspace');
    }
    
    // show new workspace
    document.getElementById(newWorkspace).style.display = "block";
    document.getElementById(newWorkspace).classList.add('active-workspace');
    workspaceIcon.setAttribute('href','#' + newWorkspace + '-icon');

    loadInventory(newWorkspace);
    currentWorkspace = newWorkspace;

}


// INVENTORY

// sorts inventory into correct order
function loadInventory(workspace) {
    inventoryContainer.replaceChildren();
    for(let item in items[workspace]) {
        if(inventory.includes(item)) {
            addItem(item)
        }
    }
}

function addItems(itemArray) {
    itemArray.forEach(addItem);
}

function addItem(item) {

    //add to memory
    if(!inventory.includes(item)) inventory.push(item);
    localStorage.setItem('--elementary-game-inventory', JSON.stringify(inventory));

    //add to html
    let itemDiv = document.createElement('div');
    itemDiv.innerHTML = "<svg viewbox='0 0 64 64' data-id=" + item + " onmousedown='summonParticle(this,event)' ontouchstart='summonParticle(this,event)'><use href='#" + item + "-particle'/></svg><p>" + items[currentWorkspace][item].displayName + "</p>";
    inventoryContainer.appendChild(itemDiv);
}

// drag particle from list
function summonParticle(item, e) {

    if(e.target.innerHTML) return;
    if(e.touches?.[0]) e = accountForTouch(e);
    
    let particle = item.cloneNode(true);
    particle.classList.add('active-drag');
    particle.setAttribute('onmousedown','selectParticle(this,event)');
    particle.setAttribute('ontouchstart','selectParticle(this,event,true)');
    document.getElementById(currentWorkspace).appendChild(particle);
    particle.style.top = e.clientY - (particleDiameter / 2);
    particle.style.left = e.clientX - (particleDiameter / 2);

    selectParticle(particle, e);

}

function accountForTouch(obj) {
    obj.clientX = obj.touches[0].clientX;
    obj.clientY = obj.touches[0].clientY;
    return obj;
}


// WORKSPACE

//dragging particles
function selectParticle(particle, e) {
    
    if(e.target.innerHTML) return;
    if(e.touches?.[0]) e = accountForTouch(e);
    
    let yOffset = particle.getBoundingClientRect().y - e.clientY;
    let xOffset = particle.getBoundingClientRect().x - e.clientX;
    
    let moveParticle = (event) => {
        if(event.touches?.[0]) event = accountForTouch(event);
        particle.style.top = event.clientY + yOffset;
        particle.style.left = event.clientX + xOffset;
    }
    let stopParticle = (event) => {
        document.removeEventListener('mousemove', moveParticle)
        document.removeEventListener('touchmove', moveParticle)
        document.removeEventListener('mouseup', stopParticle)
        document.removeEventListener('touchend', stopParticle)
        particle.classList.remove('active-drag');
        
        if(event.touches?.[0]) event = accountForTouch(event);
        if ( // if particle mostly off screen
        event.clientY > workspaceContainer.clientHeight - particleDiameter / 2 ||
            event.clientX > workspaceContainer.clientWidth - particleDiameter / 2 ||
            event.clientY < particleDiameter / 2 ||
            event.clientX < particleDiameter / 2
        ) {
            particle.remove();
            return;
        }
        checkOverlap(particle);
    }
    
    particle.classList.add('active-drag');
    document.addEventListener('mousemove', moveParticle)
    document.addEventListener('touchmove', moveParticle)
    document.addEventListener('mouseup', stopParticle)
    document.addEventListener('touchend', stopParticle)

}

//on particle release
function checkOverlap(particle) {

    //bounds for overlap
    let overlap = new Array;
    let top1 = parseInt(particle.style.top, 10) + (particleDiameter * 0.125);
    let bottom1 = top1 + (particleDiameter * 0.75);
    let left1 = parseInt(particle.style.left) + (particleDiameter * 0.125);
    let right1 = left1 + (particleDiameter * 0.75);

    for(let part of document.getElementById(currentWorkspace).children) {
        if (part === particle) continue;
        let top2 = parseInt(part.style.top) + (particleDiameter * 0.125);
        let bottom2 = top2 + (particleDiameter * 0.75);
        let left2 = parseInt(part.style.left) + (particleDiameter * 0.125);
        let right2 = left2 + (particleDiameter * 0.75);

        //check overlap
        if(left1 < right2 && left2 < right1 && top1 < bottom2 && top2 < bottom1) overlap.push(part);
    }
    if(overlap.length < 1) return;
    
    //get type of particles
    let overlapTypes = overlap.map(part => part.dataset.id).sort().toString();
    let recipe = items[currentWorkspace][particle.dataset.id]?.recipes?.[overlapTypes];
    
    if(!recipe) return;
    if(recipe.includes('pickOne')) recipe = eval(recipe);
    
    //become new particle of valid merge
    for(let part of overlap){
        part.style.transform = 'scale(0)';
        setTimeout(function(){
            part.remove();
        }, 200)
    }
    particle.dataset.id = recipe;
    particle.firstChild.setAttribute('href','#'+ recipe + '-particle');
    if(!inventory.includes(recipe)) {
        addItem(recipe);
        checkAchievements();
    }
    
}


// ACHIEVEMENTS

function checkAchievements() {
    for(let achievement of incompleteAchievements) if(eval(achievements[achievement].condition)) {
        let achievementDetails = achievements[achievement];

        // reward
        eval(achievementDetails.reward);
        changeWorkspace(0);

        // show
        document.getElementById('achievement-name').innerText = achievementDetails.title;
        document.getElementById('achievement-desc').innerText = achievementDetails.requirements;
        document.getElementById('achievement-reward').innerText = achievementDetails.unlocks;
        achievementContainer.style.transform = 'translateX(0)';

        // hide
        setTimeout(function(){
            achievementContainer.style.transform = 'translateX(-100%)';
        }, 5000)
        
        // update achievement list
        completedAchievements.push(achievement);
        localStorage.setItem('--elementary-game-completed-achievements', JSON.stringify(completedAchievements));
        incompleteAchievements.splice(incompleteAchievements.indexOf(achievement), 1)
        
        return; // only check one achievement
    }
}

function inventoryIncludes(valuesArray) {
    return valuesArray.every(value => inventory.includes(value))
}

function somethingStrange() {
    let count = 0;
    for(let i of ['pi-zero','eta','eta-prime','rho-zero','omega-meson']) if(inventory.includes(i)) count++;
    if(count > 2 || inventoryIncludes(['pi-plus', 'rho-plus']) || inventoryIncludes(['pi-minus', 'rho-minus'])) return true;
}

achievements = {
    'mesons-1':{
        condition : "somethingStrange()",
        reward : "addItems(['strange','antistrange','charm','anticharm'])",
        title : "Something Strange is Happening...",
        requirements : "Obtain different results from mixing the same particles.",
        unlocks : "Unlocks second generation quarks and antiquarks."
    },
    'mesons-2':{
        condition : "inventoryIncludes(['pi-plus','pi-minus','pi-zero','eta','eta-prime','charmed-eta','rho-plus','rho-minus','rho-zero','omega-meson','K-plus','K-minus','K-zero','anti-K-zero','phi','D-plus','D-minus','D-zero','anti-D-zero','strange-D-plus','strange-D-minus','J-psi'])",
        reward : "addItems(['bottom','antibottom','top','antitop'])",
        title : "Started from the Bottom now we're Here",
        requirements : "Obtain all mesons using first and second generation quark and antiquarks.",
        unlocks : "Unlocks third generation quarks and antiquarks."
    },
    'mesons-3':{
        condition : "inventoryIncludes(['pi-plus','pi-minus','pi-zero','eta','eta-prime','charmed-eta','bottom-eta','rho-plus','rho-minus','rho-zero','omega-meson','K-plus','K-minus','K-zero','anti-K-zero','phi','D-plus','D-minus','D-zero','anti-D-zero','strange-D-plus','strange-D-minus','J-psi','B-plus','B-minus','B-zero','anti-B-zero','strange-B','strange-anti-B','charmed-B-plus','charmed-B-minus','upsilon','theta'])",
        reward : "",
        title : "Mesons",
        requirements : "Obtain all mesons.",
        unlocks : ""
    }
};


// ITEM LIST

function pickOne(options) {
    return options[Math.floor(Math.random() * options.length)];
}

items = {
    'strong':{
        'up':{
            displayName:'Up Quark',
            recipes:{
                'antiup':"pickOne(['pi-zero','eta','eta-prime','rho-zero','omega-meson'])",
                'antidown':"pickOne(['pi-plus','rho-plus'])",
                'antistrange':'K-plus',
                'anticharm':'anti-D-zero',
                'antibottom':'B-plus',
                'down,up':'proton',
                'down,down':'neutron'
            }
        },
        'antiup':{
            displayName:'Antiup Quark',
            recipes:{
                'up':"pickOne(['pi-zero','eta','eta-prime','rho-zero','omega-meson'])",
                'down':"pickOne(['pi-minus','rho-minus'])",
                'strange':'K-minus',
                'charm':'D-zero',
                'bottom':'B-minus'
            }
        },
        'down':{
            displayName:'Down Quark',
            recipes:{
                'antiup':"pickOne(['pi-minus','rho-minus'])",
                'antidown':"pickOne(['pi-zero','eta','eta-prime','rho-zero','omega-meson'])",
                'antistrange':'K-zero',
                'anticharm':'D-minus',
                'antibottom':'B-zero',
                'up,up':'proton',
                'down,up':'neutron'
            }
        },
        'antidown':{
            displayName:'Antidown Quark',
            recipes:{
                'up':"pickOne(['pi-plus','rho-plus'])",
                'down':"pickOne(['pi-zero','eta','eta-prime','rho-zero','omega-meson'])",
                'strange':'anti-K-zero',
                'charm':'D-plus',
                'bottom':'anti-B-zero'
            }
        },
        'strange':{
            displayName:'Strange Quark',
            recipes:{
                'antiup':'K-minus',
                'antidown':'anti-K-zero',
                'antistrange':"pickOne(['eta','eta-prime','phi'])",
                'anticharm':'strange-D-minus',
                'antibottom':'strange-B'
            }
        },
        'antistrange':{
            displayName:'Antistrange Quark',
            recipes:{
                'up':'K-plus',
                'down':'K-zero',
                'strange':"pickOne(['eta','eta-prime','phi'])",
                'charm':'strange-D-plus',
                'bottom':'strange-anti-B'
            }
        },
        'charm':{
            displayName:'Charm Quark',
            recipes:{
                'antiup':'D-zero',
                'antidown':'D-plus',
                'antistrange':'strange-D-plus',
                'anticharm':"pickOne(['charmed-eta','J-psi'])",
                'antibottom':'charmed-B-plus'
            }
        },
        'anticharm':{
            displayName:'Anticharm Quark',
            recipes:{
                'up':'anti-D-zero',
                'down':'D-minus',
                'strange':'strange-D-minus',
                'charm':"pickOne(['charmed-eta','J-psi'])",
                'bottom':'charmed-B-minus'
            }
        },
        'bottom':{
            displayName:'Bottom Quark',
            recipes:{
                'antiup':'B-minus',
                'antidown':'anti-B-zero',
                'antistrange':'strange-anti-B',
                'anticharm':'charmed-B-minus',
                'antibottom':"pickOne(['bottom-eta','upsilon'])"
            }
        },
        'antibottom':{
            displayName:'Antibottom Quark',
            recipes:{
                'up':'B-plus',
                'down':'B-zero',
                'strange':'strange-B',
                'charm':'charmed-B-plus',
                'bottom':"pickOne(['bottom-eta','upsilon'])"
            }
        },
        'top':{
            displayName:'Top Quark',
            recipes:{
                'antitop':'theta'
            }
        },
        'antitop':{
            displayName:'Antitop Quark',
            recipes:{
                'top':'theta'
            }
        },

        'pi-plus':{
            displayName:'Pi Plus Meson (Pion)'
        },
        'pi-minus':{
            displayName:'Pi Minus Meson (Pion)'
        },
        'pi-zero':{
            displayName:'Pi Zero Meson (Pion)'
        },
        'eta':{
            displayName:'Eta Meson'
        },
        'eta-prime':{
            displayName:'Eta Prime Meson'
        },
        'charmed-eta':{
            displayName:'Charmed Eta Meson'
        },
        'bottom-eta':{
            displayName:'Bottom Eta Meson'
        },
        'rho-plus':{
            displayName:'Rho Plus Meson'
        },
        'rho-minus':{
            displayName:'Rho Minus Meson'
        },
        'rho-zero':{
            displayName:'Rho Zero Meson'
        },
        'omega-meson':{
            displayName:'Omega Meson'
        },
        'K-plus':{
            displayName:'K Plus Meson (Kaon)'
        },
        'K-minus':{
            displayName:'K Minus Meson (Kaon)'
        },
        'K-zero':{
            displayName:'K Zero Meson (Kaon)'
        },
        'anti-K-zero':{
            displayName:'Anti K Zero Meson (Kaon)'
        },
        'phi':{
            displayName:'Phi Meson'
        },
        'D-plus':{
            displayName:'D Plus Meson'
        },
        'D-minus':{
            displayName:'D Minus Meson'
        },
        'D-zero':{
            displayName:'D Zero Meson'
        },
        'anti-D-zero':{
            displayName:'Anti D Zero Meson'
        },
        'strange-D-plus':{
            displayName:'Strange D Plus Meson'
        },
        'strange-D-minus':{
            displayName:'Strange D Minus Meson'
        },
        'J-psi':{
            displayName:'J/Psi Meson (Psion)'
        },
        'B-plus':{
            displayName:'B Plus Meson'
        },
        'B-minus':{
            displayName:'B Minus Meson'
        },
        'B-zero':{
            displayName:'B Zero Meson'
        },
        'anti-B-zero':{
            displayName:'Anti B Zero Meson'
        },
        'strange-B':{
            displayName:'Strange B Meson'
        },
        'strange-anti-B':{
            displayName:'Strange Anti B Meson'
        },
        'charmed-B-plus':{
            displayName:'Charmed B Plus Meson'
        },
        'charmed-B-minus':{
            displayName:'Charmed B Minus Meson'
        },
        'upsilon':{
            displayName:'Upsilon Meson'
        },
        'theta':{
            displayName:'Theta Meson'
        },

        'proton':{
            displayName:'Proton'
        },
        'neutron':{
            displayName:'Neutron'
        }
    },
    'electromagnetic':{

    }
};

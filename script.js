// All Code by Wmtmky, 2022
// Elementary version
version = "alpha-1.0.4";

window.addEventListener('load',loadSaveGame);

var achievementContainer = document.getElementById('achievement-container');
var workspaceContainer = document.getElementById('workspace-container');
var workspaces = new Array();
var workspaceIcon = document.getElementById('workspace-icon');
var items = new Array();
var inventoryContainer = document.getElementById('inventory');
var inventory = new Array();

var currentWorkspace;
var particleDiameter = window.innerHeight * 0.08;

function loadSaveGame() {

    document.getElementById('version').innerHTML = version;
    window.scrollTo(0, 1);
    
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
    loadInventory(workspaces[0])

}

function toggleHelpbox() {
    let helpbox = document.getElementById('helpbox-container');
    helpbox.style.display = (helpbox.style.display == 'none')? 'flex': 'none';
}

function rightClickClear(event) {
    event.preventDefault();
    event.target.addEventListener('dblclick',resetGame)
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

}


// ITEM LIST

function pickOne(options) {
    return options[Math.floor(Math.random() * options.length)];
}

items = {
    'strong':{
        'up':{
            displayName:'Up Quark',
            recipes:{
                'antiup':"pickOne(['pi-null','eta','eta-prime','rho-null','omega-meson'])",
                'antidown':"pickOne(['pi-plus','rho-plus'])",
                'antistrange':'K-plus',
                'anticharm':'anti-D-null',
                'antibottom':'B-plus',
                'down,up':'proton'
            }
        },
        'antiup':{
            displayName:'Antiup Quark',
            recipes:{
                'up':"pickOne(['pi-null','eta','eta-prime','rho-null','omega-meson'])",
                'down':"pickOne(['pi-minus','rho-minus'])",
                'strange':'K-minus',
                'charm':'D-null',
                'bottom':'B-minus'
            }
        },
        'down':{
            displayName:'Down Quark',
            recipes:{
                'antiup':"pickOne(['pi-minus','rho-minus'])",
                'antidown':"pickOne(['pi-null','eta','eta-prime','rho-null','omega-meson'])",
                'antistrange':'K-null',
                'anticharm':'D-minus',
                'antibottom':'B-null',
                'up,up':'proton'
            }
        },
        'antidown':{
            displayName:'Antidown Quark',
            recipes:{
                'up':"pickOne(['pi-plus','rho-plus'])",
                'down':"pickOne(['pi-null','eta','eta-prime','rho-null','omega-meson'])",
                'strange':'anti-K-null',
                'charm':'D-plus',
                'bottom':'anti-B-null'
            }
        },
        'strange':{
            displayName:'Strange Quark',
            recipes:{
                'antiup':'K-minus',
                'antidown':'anti-K-null',
                'antistrange':"pickOne(['eta','eta-prime','phi'])",
                'anticharm':'strange-D-minus',
                'antibottom':'strange-B'
            }
        },
        'antistrange':{
            displayName:'Antistrange Quark',
            recipes:{
                'up':'K-plus',
                'down':'K-null',
                'strange':"pickOne(['eta','eta-prime','phi'])",
                'charm':'strange-D-plus',
                'bottom':'strange-anti-B'
            }
        },
        'charm':{
            displayName:'Charm Quark',
            recipes:{
                'antiup':'D-null',
                'antidown':'D-plus',
                'antistrange':'strange-D-plus',
                'anticharm':"pickOne(['charmed-eta','J-psi'])",
                'antibottom':'charmed-B-plus'
            }
        },
        'anticharm':{
            displayName:'Anticharm Quark',
            recipes:{
                'up':'anti-D-null',
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
                'antidown':'anti-B-null',
                'antistrange':'strange-anti-B',
                'anticharm':'charmed-B-minus',
                'antibottom':"pickOne(['bottom-eta','upsilon'])"
            }
        },
        'antibottom':{
            displayName:'Antibottom Quark',
            recipes:{
                'up':'B-plus',
                'down':'B-null',
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
        'pi-null':{
            displayName:'Pi Null Meson (Pion)'
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
        'rho-null':{
            displayName:'Rho Null Meson'
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
        'K-null':{
            displayName:'K Null Meson (Kaon)'
        },
        'anti-K-null':{
            displayName:'Anti K Null Meson (Kaon)'
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
        'D-null':{
            displayName:'D Null Meson'
        },
        'anti-D-null':{
            displayName:'Anti D Null Meson'
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
        'B-null':{
            displayName:'B Null Meson'
        },
        'anti-B-null':{
            displayName:'Anti B Null Meson'
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
        }
    },
    'electromagnetic':{

    }
};

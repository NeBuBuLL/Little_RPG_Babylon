import Mob from "./Mob.js"

let player;
let boss;

let canvas;
let health_bar;
let xp_bar;
let level_of_player;
let engine;
let scene;
let dimPlan = 8000;
let inputStates = {};
let mobs = [];

let life_by_level = [500, 550, 600, 650,700, 750, 800, 850, 1000]; 
let level_xp = [1000, 1300, 1650, 2450, 4575, 6700, 8500, 9000, 11250, 25000];

window.onload = map;

function map(){

    canvas = document.querySelector("#renderCanvas");
    
    create_Player_UI();
    create_Player_XP_UI();
    
    
    health_bar = document.querySelector("#health_bar");
    xp_bar = document.querySelector("#xp_bar");
    level_of_player = document.querySelector("#player_level");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();

    // enable physics
    var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
    var physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);
    

    let cameraset  = false ;
    let checkC = true;

    scene.toRender = () => {

        player = scene.getMeshByName("Jolleen");
        boss = scene.getMeshByName("bossM")

        if (player && boss){
            if (checkC){ //Pour l'appeler que 1 fois
                checkCollisions(player, mobs);
                checkC = false;
            }
            if (!cameraset){
                player = player;
                let followCamera = createFollowCamera(scene, player);
                scene.activeCamera = followCamera;
                cameraset = true;
            }

            showStats(player);

            update_health_bar(health_bar, player);
            update_level(level_of_player, player);
            update_xp_bar(xp_bar, player);
            
            
            player.move();
            player.checkBounderPosition();
            player.shoot();
            boss.shoot(player);
        
            player.changeLevel();
            player.die();
        
            
            //console.log("xp : " + player.getXp() + " lvl : " + player.getLevel());
            //console.log("health : " + player.getHealth());

           /* if (player.getLevel() < 3){
                crabe.Mob.takeDamage(100);
            }*/
        }

        scene.render();
    };
    scene.assetManager.load();

};

function createScene(){

    let scene = new BABYLON.Scene(engine);
    scene.assetManager = configureAssetManager(scene);

    let ground = createGround(scene, dimPlan);
    
    let camera = createCamera(scene);
   

    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:9000}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/Skybox/skybox2", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    var waterMesh = BABYLON.Mesh.CreateGround("sea", dimPlan*2, dimPlan*2, 32, scene, false);
    waterMesh.diffuseColor = new BABYLON.Color3(0,0,0);
    var water = new BABYLON.WaterMaterial("water", scene, BABYLON.Vector2(dimPlan*2,dimPlan*2));

    water.bumpTexture = new BABYLON.Texture("textures/water_bump.png", scene);
    water.windForce = -2;
    water.waterColor = new BABYLON.Color3(0,0.5,0.5);
    water.windDirection = new BABYLON.Vector2(1, 1);
    water.waveHeight = 1.7;
    water.bumpHeight = 0.8;
    water.waveLength = 1.8;
    waterMesh.material = water;
    waterMesh.position.y = -95;
    water.addToRenderList(skybox);
    water.addToRenderList(ground);;

   BABYLON.ParticleHelper.CreateAsync("smoke", scene).then((set) => {
       set.systems.forEach((s) => {
           s.disposeOnStop = true;
           s.minScaleY = 100;
           s.maxScaleY = 100;
           s.minScaleX = 100;
           s.maxScaleX = 100;
           s.minScaleZ = 100;
           s.maxScaleZ = 100;
       });
       set.start();
       set.systems[0].worldOffset = new BABYLON.Vector3(3650,305,3160);
   });

    createLights(scene);
    createTree(scene);
    createMobs(scene);
    createPlayer(scene);
    loadSounds(scene);

    return scene;  
}

function configureAssetManager(scene) {
    let assetsManager = new BABYLON.AssetsManager(scene);

    assetsManager.onProgress = function(remainingCount, totalCount, lastFinishedTask) {
        engine.loadingUIText = 'We are loading the scene. ' + remainingCount + ' out of ' + totalCount + ' items still need to be loaded.';
        engine.loadingUIBackgroundColor = "steelblue";
        console.log('We are loading the scene. ' + remainingCount + ' out of ' + totalCount + ' items still need to be loaded.');
    };

    assetsManager.onFinish = function(tasks) {

        engine.runRenderLoop(function() {
            scene.toRender();
        });
    };
    return assetsManager;
}

function createCamera(scene){
    let camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 50, 0), scene);
    camera.attachControl(canvas);
    // prevent camera to cross ground
    camera.checkCollisions = true; 
    // avoid flying with the camera
    camera.applyGravity = true;

    return camera;
}

function createLights(scene){
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 1), scene);
    light.specular = new BABYLON.Color3(0,0,0);
}


function createGround(scene, dimplan) {
    var assetsManager = scene.assetManager;

    const groundOptions = { width:dimplan, height:dimplan, subdivisions:500, minHeight:-100, maxHeight:250};

    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm","images/hmap20.png",groundOptions, scene);

    var textureTask = assetsManager.addTextureTask("image task", "textures/test/lambert1_Base_Color.png");
    var textureTask2 = assetsManager.addTextureTask("image task2", "textures/test/heightmap_lambert1_Glossiness.png");
    var textureTask3 = assetsManager.addTextureTask("image task3", "textures/test/heightmap_lambert1_normal.png");
    var textureTask4 = assetsManager.addTextureTask("image task4", "textures/test/lambert1_roughness.jpg");
    var textureTask5 = assetsManager.addTextureTask("image task5", "textures/test/heightmap_lambert1_Specular.png");

    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    
    textureTask.onSuccess = function(task) {groundMaterial.diffuseTexture = task.texture;}
    textureTask2.onSuccess = function(task) {groundMaterial.emissiveTexture = task.texture;}
    textureTask3.onSuccess = function(task) {groundMaterial.bumpTexture = task.texture;}
    textureTask4.onSuccess = function(task) {groundMaterial.roughnessTexture = task.texture;}
    textureTask5.onSuccess = function(task) {groundMaterial.specularTexture = task.texture;}
    
    ground.material = groundMaterial;
    ground.checkCollisions = true;

    // for physic engine
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground,
        BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0 }, scene);    
    return ground;
}

function loadSounds(scene){
    var assetsManager = scene.assetManager;

    let binaryTask = assetsManager.addBinaryFileTask(
        "generique",
        "sons/naruto-1-instru.mp3"
    );
    binaryTask.onSuccess = function (task) {
        scene.assets.generique = new BABYLON.Sound(
            "generique",
            task.data,
            scene,
            null,
            {
            loop: true,
            autoplay: true,
            volume : 0.5,
            }
        );
    };
}

let zMovement = 5;
function createPlayer(scene){

    let meshTask = scene.assetManager.addMeshTask("Joleen task", "", "models/Persos/", "Jolleen.babylon");

    meshTask.onSuccess = function (task) {
        onJoleenImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
    }

    function onJoleenImported(meshes, particleSystems, skeletons) {
        let player = meshes[0];
        let default_position = new BABYLON.Vector3(150,162, -1000); 
        let playerMaterial = new BABYLON.StandardMaterial("playerTexture", scene);
        playerMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/Jolleen_Diffuse.png");
        playerMaterial.emissiveTexture = new BABYLON.Texture("models/Persos/Jolleen_Glossiness.png");
        playerMaterial.bumpTexture = new BABYLON.Texture("models/Persos/Jolleen_Normal.png");
        playerMaterial.specularTexture = new BABYLON.Texture("models/Persos/Jolleen_Specular.png");

        player.scaling = new BABYLON.Vector3(1, 1, 1);
        player.death = false;
        player.walk = false;
        player.name = "Jolleen";

        player.position = default_position;

        player.material = playerMaterial;
        
        //Player statistics
        player.health = 500;
        player.level = 1;
        player.xp = 0;
        player.attack = 100;
        player.defense = 80;
        player.speed = 8;
        player.frontVector = new BABYLON.Vector3(0, 0, -1);

        let idleAnim = scene.beginWeightedAnimation(skeletons[0], 73, 195,1.0 ,true, 1);
        let walkAnim = scene.beginWeightedAnimation(skeletons[0], 251, 291,0.0, true, 1);
        let runAnim= scene.beginWeightedAnimation(skeletons[0], 211, 226,0.0, true, 1);
        let deathAnim = scene.beginWeightedAnimation(skeletons[0], 0, 63, 0.0,false, 0.15);

        
        player.getposy = () =>{
            console.log(player.position.y);
        }
        player.changeState = (state) => {
            if (state == "idle"){
                idleAnim.weight = 1.0;
                walkAnim.weight = 0.0;
                runAnim.weight = 0.0;
            } else if (state == "walk"){
                idleAnim.weight = 0.0;
                walkAnim.weight = 1.0;
                runAnim.weight = 0.0;
            }
            else if (state == "run"){
                idleAnim.weight = 0.0;
                walkAnim.weight = 0.0;
                runAnim.weight = 1.0;
            }
            else if (state == "death"){
                idleAnim.weight = 0.0;
                walkAnim.weight = 0.0;
                runAnim.weight = 0.0;
                deathAnim.weight = 1.0;
            }
        }

        player.setHealth = (health) =>{
            player.health = health;
        }
        player.setDefense = (defense) =>{
            player.defense = defense;
        }
        player.setAttack = (attack) =>{
            player.attack = attack;
        }
        player.isDead = () =>{
            return player.health <= 0;
        }
        player.getHealth = () =>{
            if (player.health >=0)
                return player.health;
            else
                return 0;
        }
        player.getDefense= () =>{
            return player.defense;
        }
        player.getAttack = () =>{
            return player.attack;
        }
        player.getLevel = () =>{
            return player.level;
        }
        player.getXp = () =>{
            return player.xp;
        }
        player.setXp = (xp) =>{
            player.xp = xp;
        }
        player.addXp = (xp) =>{
            if(player.xp < level_xp[player.getLevel()-1])
            player.xp +=xp; 
        else
            player.xp = level_xp[player.getLevel()-1];
        }
        player.addLevel = () =>{
            player.level++;
        }

        player.drown = ()=>{
            if (player.position.y <= -88)
                player.takeDamage(life_by_level[player.level] / 25);
        }
        player.getStats= () => {
            console.log("Current Level : " + player.level);
            console.log("Current Health: " + player.health);
            console.log("Current Attack : " + player.attack);
            console.log("CurrentDefense : " + player.defense);

        }

        player.takeDamage = (damage) =>{
            if(player.health >0 && damage >0)  
                player.health -= damage;
            else 
                player.health -= 0;
        }
        player.changeLevel = () =>{
            if (player.level < 10){
                if(player.xp >= level_xp[player.getLevel() - 1]){
                    player.addLevel();
                    player.setXp(0);
                    player.setHealth(life_by_level[player.getLevel() - 1]);
                    player.setDefense(player.defense + 0.075*player.defense);
                    player.setAttack(player.attack + 0.075*player.attack);
                }
            }
        }
        player.attackMob = (mobMesh)=> {
            mobMesh.Mob.takeDamage(Math.floor(player.attack - (-player.attack/2 + Math.random() * player.attack) - 0.25 * mobMesh.Mob.getDefense()));
        }

        player.die = () => {
            player.drown();
            if (player.isDead()){
                player.death = true;
                player.changeState("death");
                player.setXp(0);
                
                // Respawn du joueur
                setTimeout(() => {
                    player.death = false;
                    player.changeState("idle");
                    player.health = life_by_level[player.getLevel() - 1];
                    player.position = new BABYLON.Vector3(150,162, -1000); 
                }, 1000 * 5)
                
            }
        }
    

        player.move= () =>{
            let yMovement = 0;
            if(!player.death){
                followGround(player,20);
                followGround(bounderT,2);
                if (player.position.y > 2) {
                    zMovement = 0;
                    yMovement = -2;
                } 
                if(inputStates.up) {
                    if (inputStates.shift){
                        player.speed = 25;
                        player.changeState("run");
                    }else{
                        player.speed = 8;
                        player.changeState("walk");
                    }
                    player.moveWithCollisions(player.frontVector.multiplyByFloats(player.speed, player.speed, player.speed));
                    bounderT.moveWithCollisions(player.frontVector.multiplyByFloats(player.speed, player.speed, player.speed));
                }    
                if(inputStates.down) {
                    player.speed = 4;
                    player.moveWithCollisions(player.frontVector.multiplyByFloats(-player.speed, -player.speed, -player.speed));
                    bounderT.moveWithCollisions(player.frontVector.multiplyByFloats(-player.speed, -player.speed, -player.speed));
                    player.changeState("walk");
                    player.walk = true;
                }    
                if(inputStates.left) {
                    player.rotation.y -= 0.05;
                    bounderT.rotation.y -= 0.05;
                    player.frontVector = new BABYLON.Vector3(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y));
                }    
                if(inputStates.right) {
                    player.rotation.y += 0.05;
                    bounderT.rotation.y += 0.05;
                    player.frontVector = new BABYLON.Vector3(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y));
                }
                if (!inputStates.up && !inputStates.down)
                    player.changeState("idle");
                    player.walk = false;
            }
        
        } 
        let bounderT = new BABYLON.Mesh.CreateBox("bounder", 10, scene);
        let bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial", scene);
        bounderMaterial.alpha = 0.4;
        bounderT.material = bounderMaterial;
        
        bounderT.position = player.position.clone();

        let bbInfo = player.getBoundingInfo();

        let max = bbInfo.boundingBox.maximum;
        let min = bbInfo.boundingBox.minimum;
        
        bounderT.scaling.x = (max._x - min._x) * player.scaling.x*0.06;
        bounderT.scaling.y = (max._y - min._y) * player.scaling.y*0.12;
        bounderT.scaling.z = (max._z - min._z) * player.scaling.z*0.12;

        bounderT.isVisible = true;
        bounderT.position.y += (max._y - min._y) * player.scaling.y/3;
        bounderT.checkCollisions = true;

        player.bounder = bounderT

        player.checkBounderPosition= () => {
            if (Math.abs(player.bounder.position.x - player.position.x) >= 5 || Math.abs(player.bounder.position.z - player.position.z) >= 5){
                player.bounder.position.x = player.position.x;
                player.bounder.position.z = player.position.z;
            }
        }
        player.canShoot = true;
        player.shootAfter = 0.5; // in seconds

        player.shoot = () => {
            if(!inputStates.space) return;

            if(!player.canShoot) return;
    
            // ok, we fire, let's put the above property to false
            player.canShoot = false;
    
            // let's be able to fire again after a while
            setTimeout(() => {
                player.canShoot = true;
            }, 1000 * player.shootAfter)
    
            // Create a canonball
            let shoot = BABYLON.MeshBuilder.CreateSphere("shoot", {diameter: 15, segments: 32}, scene);
            shoot.material = new BABYLON.StandardMaterial("Fire", scene);
            shoot.material.diffuseTexture = new BABYLON.Texture("assets/coco.jpg", scene);
    
            let pos = player.position;
            // position the cannonball above the tank
            shoot.position = new BABYLON.Vector3(pos.x, pos.y+15, pos.z);
            // move cannonBall position from above the center of the tank to above a bit further than the frontVector end (5 meter s further)
            shoot.position.addInPlace(player.frontVector.multiplyByFloats(10, 10, 10));
    
            // add physics to the cannonball, mass must be non null to see gravity apply
            shoot.physicsImpostor = new BABYLON.PhysicsImpostor(shoot,
                BABYLON.PhysicsImpostor.SphereImpostor, { mass: 2 }, scene);    
    
            // the cannonball needs to be fired, so we need an impulse !
            // we apply it to the center of the sphere
            let powerOfFire = 400;
            let azimuth = 0.2; 
            let aimForceVector = new BABYLON.Vector3(player.frontVector.x*powerOfFire, (player.frontVector.y+azimuth)*powerOfFire,player.frontVector.z*powerOfFire);
            
            shoot.physicsImpostor.applyImpulse(aimForceVector,shoot.getAbsolutePosition());

            setTimeout(() => {
                shoot.dispose();
            }, 3000)

            checkCollisionsC(shoot,mobs);

            const myParticleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
            myParticleSystem.particleTexture = new BABYLON.Texture("assets/Particles/flare.png");

            myParticleSystem.emitRate = 100;
            myParticleSystem.direction1 = new BABYLON.Vector3(-2,Math.random()*3, Math.random());
            myParticleSystem.direction2 = new BABYLON.Vector3(-2,-Math.random()*3, Math.random());

            myParticleSystem.color1 = new BABYLON.Color3(0,128,0);

            myParticleSystem.minEmitPower = 10;
            myParticleSystem.maxEmitPower = 20;

            // Size of each particle (random between...
            myParticleSystem.minSize = 5;
            myParticleSystem.maxSize = 10;

            myParticleSystem.emitter = shoot;

            myParticleSystem.start(); //Starts the emission of particles
        }
    };    

    return player;
}

function createMobs(scene){  

    let meshTaskCr = scene.assetManager.addMeshTask("Crabe task", "", "models/Persos/", "crabe.glb");
    let meshTaskB = scene.assetManager.addMeshTask("Bat task", "", "models/Persos/", "bat.glb");
    let meshTaskCa = scene.assetManager.addMeshTask("Cactus task", "", "models/Persos/", "cactus.glb");
    let meshTaskCh = scene.assetManager.addMeshTask("Chicken task", "", "models/Persos/", "chicken.glb");
    let meshTaskD = scene.assetManager.addMeshTask("Demon task", "", "models/Persos/", "demon.glb");
    let meshTaskM = scene.assetManager.addMeshTask("Monster task", "", "models/Persos/", "monster.glb");
    let meshTaskT = scene.assetManager.addMeshTask("Tree task", "", "models/Persos/", "tree.glb");
    let meshTaskBoss = scene.assetManager.addMeshTask("Boss task", "", "models/Persos/", "monster.glb");


    meshTaskCr.onSuccess = function (task) {
        onCrabeImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
    }
    meshTaskB.onSuccess = function (task) {
        onBatImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
    }
    meshTaskCa.onSuccess = function (task) {
        onCactusImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
    }
    meshTaskCh.onSuccess = function (task) {
        onChickenImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
    }
    meshTaskD.onSuccess = function (task) {
        onDemonImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
    }
    meshTaskM.onSuccess = function (task) {
        onMonsterImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
    }
    meshTaskT.onSuccess = function (task) {
        onTreeImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
    }
    meshTaskBoss.onSuccess = function (task) {
        onBossImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
    }

        
    function onCrabeImported(meshes, particleSystems, skeletons){  
        let crabeM = meshes[0];
        let mobMaterial = new BABYLON.StandardMaterial("mobTexture", scene);
        mobMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/crabe_Texture.png");
        crabeM.scaling = new BABYLON.Vector3(20, 20, 20); 
        crabeM.name ="crabeM";
        crabeM.material = mobMaterial;
        
        let crabe = new Mob(crabeM,"crabe",1,3,75,50,250,25,scene);
        

        crabeM.position.x = 1000 + Math.random()*1000;
        crabeM.position.z = 1000 + Math.random()*1000;
        crabeM.material = mobMaterial;
        mobs.push(crabeM)
        createBox(crabeM)
        cloneMobs(crabeM.name,crabeM,10,1000,1000,1000,1000);
        
    }
   
    function onBatImported(meshes, particleSystems, skeletons) {  
        let batM = meshes[0];
        let mobMaterial = new BABYLON.StandardMaterial("mobTexture", scene);
        mobMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/bat_Texture.png");
        batM.scaling = new BABYLON.Vector3(20, 20, 20); 
        batM.name ="batM";
        batM.position.x = -400 + Math.random()*1000;
        batM.position.z = 2100 + Math.random()*700;
        batM.material = mobMaterial;
        mobs.push(batM)
        let bat = new Mob(batM,"bat",2,3,75,60,400,50,scene);

        createBox(batM);
        cloneMobs(batM.name,batM,15,-400,1000,2100,700);
    };
    
    function onCactusImported(meshes, particleSystems, skeletons) {  
        let cactusM = meshes[0];
        let mobMaterial = new BABYLON.StandardMaterial("mobTexture", scene);
        mobMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/cactus_Texture.png");
        cactusM.scaling = new BABYLON.Vector3(20, 20, 20); 
        cactusM.name ="cactusM";
        cactusM.position.x = -3200 + Math.random()*2200;
        cactusM.position.z = -1500 + Math.random()*1400;
        cactusM.material = mobMaterial;
        mobs.push(cactusM)
        let cactus = new Mob(cactusM,"cactus",3,3,200,75,150,75,scene);

        createBox(cactusM);
        cloneMobs(cactusM.name,cactusM,10, -3200,2200,-1500,1400);
    };

    function onChickenImported(meshes, particleSystems, skeletons) {  
        let chickenM = meshes[0];
        let mobMaterial = new BABYLON.StandardMaterial("mobTexture", scene);
        mobMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/chicken_Texture.png");
        chickenM.scaling = new BABYLON.Vector3(20, 20, 20); 
        chickenM.name ="chickenM";
        chickenM.position.x = -1900 + Math.random()*900;
        chickenM.position.z = 750 + Math.random()*2250;
        chickenM.material = mobMaterial;
        mobs.push(chickenM)
        let chicken = new Mob(chickenM,"chicken",4,3,150,80,300,100,scene);
        createBox(chickenM)
        cloneMobs(chickenM.name,chickenM,20,-1900,-900,750,2250);
    };

    function onDemonImported(meshes, particleSystems, skeletons) {  
        let demonM = meshes[0];
        let mobMaterial = new BABYLON.StandardMaterial("mobTexture", scene);
        mobMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/demon_Texture.png");
        demonM.scaling = new BABYLON.Vector3(20, 20, 20); 
        demonM.name ="demonM";
        demonM.position.x = -1900 + Math.random()*1800;
        demonM.position.z = -3300 + Math.random()*1800;
        demonM.material = mobMaterial;
        mobs.push(demonM)
        let demon = new Mob(demonM,"demon",7,3,250,250,1000,150,scene);
        createBox(demonM);
        cloneMobs(demonM.name,demonM,20,-1900,1800,-3300,1800);
    };

    function onMonsterImported(meshes, particleSystems, skeletons) {  
        let monsterM = meshes[0];
        let mobMaterial = new BABYLON.StandardMaterial("mobTexture", scene);
        mobMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/monster_Texture.png");
        monsterM.scaling = new BABYLON.Vector3(20, 20, 20); 
        monsterM.name ="monsterM";
        monsterM.position.x = 550 + Math.random()*1500;
        monsterM.position.z = -3300 + Math.random()*900;
        monsterM.material = mobMaterial;
        mobs.push(monsterM)
        let monster = new Mob(monsterM,"monster",7,3,100,280,250,175,scene);
        createBox(monsterM);
        cloneMobs(monsterM.name,monsterM,25,550,1500,-3300,900);
    };

    function onTreeImported(meshes, particleSystems, skeletons) {  
        let treeM = meshes[0];
        let mobMaterial = new BABYLON.StandardMaterial("mobTexture", scene);
        mobMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/tree_Texture.png");
        treeM.scaling =new BABYLON.Vector3(20, 20, 20); 
        treeM.name ="treeM";
        treeM.position.x = 2000 + Math.random()*600;
        treeM.position.z = -2100 + Math.random()*2900;
        treeM.material = mobMaterial;
        mobs.push(treeM)
        let tree = new Mob(treeM,"tree",8,3,200,180,4000,200, scene);
        createBox(treeM);
        cloneMobs(treeM.name,treeM,30,2000,600,-2100,2900);
    };

    function onBossImported(meshes, particleSystems, skeletons) {  
        let bossM = meshes[0];
        let bossMaterial = new BABYLON.StandardMaterial("bossTexture", scene);
        bossMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/monster_Texture.png");
        bossM.scaling = new BABYLON.Vector3(100, 100, 100); 
        bossM.name ="bossM";
        bossM.position.x = 2745;
        bossM.position.z = 3495;
        bossM.material = bossMaterial;

        let boss = new Mob(bossM,"boss",12,5,350,400,8000,400,scene);

        createBox(bossM);
        mobs.push(bossM);

        bossM.frontVector1 = new BABYLON.Vector3(0, 0, 1);
        bossM.frontVector2 = new BABYLON.Vector3(0, 0, -1);
        bossM.frontVector3 = new BABYLON.Vector3(1, 0, 0);
        bossM.frontVector4 = new BABYLON.Vector3(-1, 0, 0);
        bossM.canShoot = true;
        bossM.shootAfter = 3; // in seconds

        bossM.shoot = (joueur) => {

            if(!bossM.canShoot) return;
    
            // ok, we fire, let's put the above property to false
            bossM.canShoot = false;
    
            // let's be able to fire again after a while
            setTimeout(() => {
                bossM.canShoot = true;
            }, 1000 * bossM.shootAfter)
            let pos = bossM.position;
            let powerOfFire = 400;
            let azimuth = 0.2; 

            // Create a 4 shoots
            let shoot1 = BABYLON.MeshBuilder.CreateSphere("shoot", {diameter: 20, segments: 32}, scene);
            shoot1.material = new BABYLON.StandardMaterial("Fire", scene);
            shoot1.material.diffuseTexture = new BABYLON.Texture("assets/lave.jpg", scene);
            shoot1.position = new BABYLON.Vector3(pos.x, pos.y+15, pos.z);
            shoot1.position.addInPlace(bossM.frontVector1.multiplyByFloats(10, 10, 10));
            shoot1.physicsImpostor = new BABYLON.PhysicsImpostor(shoot1,BABYLON.PhysicsImpostor.SphereImpostor, { mass: 2 }, scene);    
            let aimForceVector1 = new BABYLON.Vector3(bossM.frontVector1.x*powerOfFire, (bossM.frontVector1.y+azimuth)*powerOfFire,bossM.frontVector1.z*powerOfFire);
            shoot1.physicsImpostor.applyImpulse(aimForceVector1,shoot1.getAbsolutePosition());

            let shoot2 = BABYLON.MeshBuilder.CreateSphere("shoot", {diameter: 20, segments: 32}, scene);
            shoot2.material = new BABYLON.StandardMaterial("Fire", scene);
            shoot2.material.diffuseTexture = new BABYLON.Texture("assets/lave.jpg", scene);
            shoot2.position = new BABYLON.Vector3(pos.x, pos.y+15, pos.z);
            shoot2.position.addInPlace(bossM.frontVector2.multiplyByFloats(10, 10, 10));
            shoot2.physicsImpostor = new BABYLON.PhysicsImpostor(shoot2,BABYLON.PhysicsImpostor.SphereImpostor, { mass: 2 }, scene);    
            let aimForceVector2 = new BABYLON.Vector3(bossM.frontVector2.x*powerOfFire, (bossM.frontVector2.y+azimuth)*powerOfFire,bossM.frontVector2.z*powerOfFire);
            shoot2.physicsImpostor.applyImpulse(aimForceVector2,shoot2.getAbsolutePosition());

            let shoot3 = BABYLON.MeshBuilder.CreateSphere("shoot", {diameter: 20, segments: 32}, scene);
            shoot3.material = new BABYLON.StandardMaterial("Fire", scene);
            shoot3.material.diffuseTexture = new BABYLON.Texture("assets/lave.jpg", scene);
            shoot3.position = new BABYLON.Vector3(pos.x, pos.y+15, pos.z);
            shoot3.position.addInPlace(bossM.frontVector3.multiplyByFloats(10, 10, 10));
            shoot3.physicsImpostor = new BABYLON.PhysicsImpostor(shoot3,BABYLON.PhysicsImpostor.SphereImpostor, { mass: 2 }, scene);    
            let aimForceVector3 = new BABYLON.Vector3(bossM.frontVector3.x*powerOfFire, (bossM.frontVector3.y+azimuth)*powerOfFire,bossM.frontVector3.z*powerOfFire);
            shoot3.physicsImpostor.applyImpulse(aimForceVector3,shoot3.getAbsolutePosition());

            let shoot4 = BABYLON.MeshBuilder.CreateSphere("shoot", {diameter: 20, segments: 32}, scene);
            shoot4.material = new BABYLON.StandardMaterial("Fire", scene);
            shoot4.material.diffuseTexture = new BABYLON.Texture("assets/lave.jpg", scene);
            shoot4.position = new BABYLON.Vector3(pos.x, pos.y+15, pos.z);
            shoot4.position.addInPlace(bossM.frontVector4.multiplyByFloats(10, 10, 10));
            shoot4.physicsImpostor = new BABYLON.PhysicsImpostor(shoot4,BABYLON.PhysicsImpostor.SphereImpostor, { mass: 2 }, scene);    
            let aimForceVector4 = new BABYLON.Vector3(bossM.frontVector4.x*powerOfFire, (bossM.frontVector4.y+azimuth)*powerOfFire,bossM.frontVector4.z*powerOfFire);
            shoot4.physicsImpostor.applyImpulse(aimForceVector4,shoot4.getAbsolutePosition());

            setTimeout(() => {
                shoot1.dispose();
                shoot2.dispose();
                shoot3.dispose();
                shoot4.dispose();
            }, 3000)

            //checkCollisionsC(shoot,joueur);
        }
    };

    return mobs;
}

function createFollowCamera(scene, target) {
    let camera = new BABYLON.FollowCamera("FollowCamera", target.position, scene, target);
    camera.radius = 500; // how far from the object to follow
	camera.heightOffset = 200; // how high above the object to place the camera
	camera.rotationOffset = 180; // the viewing angle
	camera.cameraAcceleration = .1; // how fast to move
	camera.maxCameraSpeed = 100; // speed limit

    return camera;
}

function followGround(meshes,s){
    // adjusts y position depending on ground height...

    // create a ray that starts above the player, and goes down vertically
    let origin = new BABYLON.Vector3(meshes.position.x, 1000, meshes.position.z);
    let direction = new BABYLON.Vector3(0, -1, 0);
    let ray = new BABYLON.Ray(origin, direction, 10000);

    // compute intersection point with the ground
    let pickInfo = scene.pickWithRay(ray, (mesh) => { return(mesh.name === "gdhm"); });

    let groundHeight = pickInfo.pickedPoint.y;
    meshes.position.y = groundHeight;

    let bbInfo = meshes.getBoundingInfo();
    //console.log(bbInfo)

    let max = bbInfo.boundingBox.maximum;
    let min = bbInfo.boundingBox.minimum;

    // Not perfect, but kinda of works...
    // Looks like collisions are computed on a box that has half the size... ?
    //bounder.scaling.y = (max._y - min._y) * this.scaling * 2;

    let lengthY = (max._y - min._y);
    meshes.position.y = groundHeight + lengthY * meshes.scaling.y/s

    return groundHeight;
}

function createBox(meshes){

    let bounder = new BABYLON.Mesh.CreateBox("bounder", 10, scene);
        let bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial", scene);
        bounderMaterial.alpha = 0.4;
        bounder.material = bounderMaterial;
        bounder.checkCollisions = true;
        bounder.position = meshes.position.clone();

        let bbInfo = meshes._children[0]._children[0].getBoundingInfo();

        let max = bbInfo.boundingBox.maximum;
        let min = bbInfo.boundingBox.minimum;
        
        bounder.scaling.x = (max._x - min._x) * meshes.scaling.x*0.1;
        bounder.scaling.y = (max._y - min._y) * meshes.scaling.y*0.12;
        bounder.scaling.z = (max._z - min._z) * meshes.scaling.z*0.12;

        bounder.isVisible = true;
        bounder.position.y += (max._y - min._y) * meshes.scaling.y/3;
        meshes.bounder = bounder;

        return bounder;
}

function checkCollisions(meshes1, liste) {
    meshes1.bounder.actionManager = new BABYLON.ActionManager(scene);    
    for (var a=0;a<liste.length;a++){
        let ennemy = liste[a];
        addActionManager(meshes1, ennemy);
    }
}

function addActionManager(mesh, ennemy) {
    let ennemyBBox = ennemy.bounder;
    mesh.bounder.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            { 
                trigger:BABYLON.ActionManager.OnIntersectionEnterTrigger, 
                parameter: ennemyBBox
            }, 
            function(){ 
                //console.log("COLLISION !!!")
                ennemy.Mob.attackPlayer(mesh);
            }
        )
    );
}

window.addEventListener("resize", () => {
    engine.resize()
});

inputStates.left = false;
inputStates.right = false;
inputStates.up = false;
inputStates.down = false;
inputStates.space = false;
inputStates.shift = false;
inputStates.o = false;

//add the listener to the main, window object, and update the states
window.addEventListener('keydown', (event) => {
    if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
        inputStates.left = true;
    } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
        inputStates.up = true;
    } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
        inputStates.right = true;
    } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
        inputStates.down = true;
    } else if (event.key === " ") {
        inputStates.space = true;
    } else if (event.key === "Shift") {
        inputStates.shift = true;
    } else if (event.key === "i") {
        inputStates.i = true;
    }
}, false);

//if the key will be released, change the states object 
window.addEventListener('keyup', (event) => {
    if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
        inputStates.left = false;
    } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
        inputStates.up = false;
    } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
        inputStates.right = false;
    } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
        inputStates.down = false;
    } else if (event.key === " ") {
        inputStates.space = false;
    } else if (event.key === "Shift") {
        inputStates.shift = false;
    } else if (event.key === "i") {
        inputStates.i = false;
    }
}, false);


function create_Player_UI(){
    var div_progress = document.createElement("div");
    var div_bar = document.createElement("div");
    var div_level = document.createElement("div");
    
    div_progress.id = "health_progress";
    div_bar.id = "health_bar";
    div_level.id = "player_level";
    
    div_progress.style.position = "absolute";
    div_progress.style.top = "10px";
    div_progress.style.left = "10px";
    div_progress.style.width = "500px";
    div_progress.style.height = "30px";
    div_progress.style.border = "solid thin black";
    
    div_bar.style.backgroundColor= "#4CAF50";
    div_bar.style.height = "100%";
    div_bar.style.color=  "black";
    div_bar.style.fontWeight=  "bold";
    div_bar.style.textAlign=  "left"; /* To center it horizontally (if you want) */
    div_bar.style.lineHeight = "30px"; /* To center it vertically */
    

    div_level.style.backgroundColor= "rgba(0,0,0,0.5)";
    div_level.style.position = "absolute";
    div_level.style.top = "41px";
    div_level.style.left = "10px";
    div_level.style.width = "100px";
    div_level.style.height = "30px";

    div_level.style.color=  "black";
    div_level.style.fontWeight= "bold";
    div_level.style.textAlign=  "center";
    div_level.style.lineHeight = "30px"; /* To center it vertically */


    div_level.innerHTML = "LEVEL 1";

    div_progress.appendChild(div_bar);

    document.body.appendChild(div_progress);
    document.body.appendChild(div_level);

}

function create_Player_XP_UI(){
    var div_progress_xp = document.createElement("div");
    var div_bar_xp = document.createElement("div");

    div_progress_xp.id = "xp_progress";
    div_bar_xp.id = "xp_bar";

    div_progress_xp.style.backgroundColor= "grey";
    div_progress_xp.style.position = "absolute";
    div_progress_xp.style.bottom = "0px";
    div_progress_xp.style.left = "20%";
    div_progress_xp.style.right = "20%";
    div_progress_xp.style.width = "60%";
    div_progress_xp.style.height = "30px";
    div_progress_xp.style.border = "solid thin black";
    
    div_bar_xp.style.backgroundColor= "purple";
    div_bar_xp.style.height = "100%";
    div_bar_xp.style.width = "0%";

    div_bar_xp.style.color=  "black";
    div_bar_xp.style.fontWeight=  "bold";
    div_bar_xp.style.textAlign=  "left"; /* To center it horizontally (if you want) */
    div_bar_xp.style.lineHeight = "30px"; /* To center it vertically */
    
    div_progress_xp.appendChild(div_bar_xp);
    document.body.appendChild(div_progress_xp);
}


function update_health_bar(health_bar, playerMesh){
    let max_life = life_by_level[playerMesh.getLevel()-1];
    let percent = playerMesh.getHealth() / max_life *100;
    if (percent <= 25 )
        health_bar.style.backgroundColor= "red";
    else if (percent <= 50 )
        health_bar.style.backgroundColor= "orange";
    else if (percent <= 75 )
        health_bar.style.backgroundColor= "yellow";
    else
        health_bar.style.backgroundColor= "green";

    health_bar.style.width = percent + "%";
    health_bar.innerHTML = playerMesh.getHealth();
}

function update_xp_bar(xp_bar, playerMesh){
    let max_xp = level_xp[playerMesh.getLevel()-1];
    let percent = playerMesh.getXp() / max_xp *100;

    xp_bar.style.width = percent + "%";
    xp_bar.innerHTML = playerMesh.getXp() + "/" + level_xp[playerMesh.getLevel()-1];
}

function update_level(level, playerMesh){
    level.innerHTML = "LEVEL " + playerMesh.getLevel();
}

function createTree(scene){
    let meshTask = scene.assetManager.addMeshTask("Palmier task", "", "assets/Tree/palmier_test/", "palmier.babylon");

    meshTask.onSuccess = function (task) {
        onTreeImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
    }

    function onTreeImported(meshes, particleSystems, skeletons) {
        let tree = meshes[0];
        let treeMaterial = new BABYLON.StandardMaterial("treeTexture", scene);
        treeMaterial.diffuseTexture = new BABYLON.Texture("assets/Tree/palmier_test/10446_Palm_Tree_v1_Diffuse.jpg");
        tree.material = treeMaterial;

        for (let i=0; i<30; i++){
            var palmClone = tree.clone("tree" + i);
            palmClone.position.x = -2000 + Math.random()*4000;
            palmClone.position.z = -3000 + Math.random()*5000;
            followGround(palmClone,50);
        }
    }
}

function checkCollisionsO(meshes1, objet) {
    meshes1.bounder.actionManager.registerAction(
        
            new BABYLON.ExecuteCodeAction(
            { trigger:BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter:objet
            }, 
            function(){ objet.isVisible = false;}
        )
    )
}

function cloneMobs(name,mesh,nombre,minX,maxX,minZ,maxZ){
    for (let i=0; i<nombre; i++){
        console.log();
        var cloneM = mesh.clone(name + i);
        cloneM.position.x = minX + Math.random()*maxX;
        cloneM.position.z = minZ + Math.random()*maxZ;
        
        let clone = new Mob(cloneM,name,mesh.Mob.getLevel(),mesh.Mob.getSpeed(),mesh.Mob.getAttack(),mesh.Mob.getDefense(),mesh.Mob.getHealth(),mesh.Mob.getXpToGive(),scene);
        createBox(cloneM);
        mobs.push(cloneM);
    }
}

function checkCollisionsC(meshes1, liste) {
    meshes1.actionManager = new BABYLON.ActionManager(scene);    
    for (var a=0;a<liste.length;a++){
        let ennemy = liste[a];
        addActionManagerC(meshes1, ennemy);
    }
}

function addActionManagerC(mesh, ennemy) {
    let ennemyBBox = ennemy.bounder;
    mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            { 
                trigger:BABYLON.ActionManager.OnIntersectionEnterTrigger, 
                parameter: ennemy.bounder
            }, 
            function(){ 
                if(!ennemy.Mob.isDead()){
                    player.attackMob(ennemy);
                }
                else {
                    ennemy.Mob.giveXp(player);
                    ennemy.bounder.checkCollisions = false;
                    ennemyBBox.position.y = -150;
                    ennemy.dispose();
                    ennemy.bounder.dispose();
                    
                    console.log(ennemyBBox);
                }
                
            }
        )
    );
}

function showStats(mesh){
    if (inputStates.i){
        mesh.getStats();
    }
}

function attackP(meshe,target) {
    // as move can be called even before the bbox is ready.
    //if (!meshe.bounder) return;
    // let's put the dude at the BBox position. in the rest of this
    // method, we will not move the dude but the BBox instead
    meshe.position = new BABYLON.Vector3(
    meshe.bounder.position.x,
    meshe.bounder.position.y,
    meshe.bounder.position.z
    );
    // follow the tank
    //let jolleen = scene.getMeshByName("Jolleen");
    // let's compute the direction vector that goes from Dude to the tank
    let direction = target.position.subtract(meshe.position);
    let distance = direction.length(); // we take the vector that is not normalized, not the dir vector
    //console.log(distance);
    let dir = direction.normalize();
    // angle between Dude and tank, to set the new rotation.y of the Dude so that he will look towards the tank
    // make a drawing in the X/Z plan to uderstand....
    let alpha = Math.atan2(-dir.x, -dir.z);
    // If I uncomment this, there are collisions. This is strange ?
    //this.bounder.rotation.y = alpha;

    meshe.rotation.y = alpha;

    // let make the Dude move towards the tank
    // first let's move the bounding box mesh
    if (distance > 30) {
      //a.restart();
      // Move the bounding box instead of the dude....
      meshe.bounder.moveWithCollisions(
        dir.multiplyByFloats(meshe.Mob.speed, meshe.Mob.speed, meshe.Mob.speed)
      );
    } else {
      //a.pause();
    }
}
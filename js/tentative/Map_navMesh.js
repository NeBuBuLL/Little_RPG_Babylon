import Mob from "./Mob.js"

let canvas;
let engine;
let scene;
let dimPlan = 300;

window.onload = map;

function map(){
    // Appel des variables nécéssaires
    //this.game = game;
    canvas = document.querySelector("#renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();
    
    // Créons une sphère 
    //var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

    // Remontons le sur l'axe y de la moitié de sa hauteur
    //sphere.position.y = 1;
    

    engine.runRenderLoop(() => {

        let crabe = scene.getMeshByName("crabeM");
        try{
            crabe._children[0]._children[0].showBoundingBox = true
            //console.log(crabe.Mob.vitesse);
        } catch(error){}

        scene.render();
    });

};

function createScene(){

    let navigationPlugin = new BABYLON.RecastJSPlugin();

    let scene = new BABYLON.Scene(engine);
    let ground = createGround(scene, dimPlan, navigationPlugin);
    let camera = createCamera(scene);

    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:9000}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/Skybox/skybox2", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    createLights(scene);
    createMobs(scene);
    

    return scene;  
}

function createCamera(scene){
    let camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0,50,0), scene);
    camera.setTarget(new BABYLON.Vector3(0,0,0));
    camera.attachControl(canvas, true);

    return camera;
}

function createLights(scene){
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 1), scene);
    light.specular = new BABYLON.Color3(0,0,0);
}


function createGround(scene, dimplan, navigationPlugin) {
    const groundOptions = { width:dimplan, height:dimplan, subdivisions:100, minHeight:0, maxHeight:30, onReady: onGroundCreated};
    //scene is optional and defaults to the current scene
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm","images/hmap17.png",groundOptions, scene);
    //const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm", 'images/hmap1.png', groundOptions, scene); 
    
    function onGroundCreated() {

        // ========== DEBUT NAVMESH =========
        var staticMesh = ground;
        var navmeshParameters = {
            cs: 0.2,
            ch: 0.2,
            walkableSlopeAngle: 20,
            walkableHeight: 20,
            walkableClimb: 2.8,
            walkableRadius: 18,
            maxEdgeLen: 12.,
            maxSimplificationError: 1.3,
            minRegionArea: 6,
            mergeRegionArea: 10,
            maxVertsPerPoly: 6,
            detailSampleDist: 6,
            detailSampleMaxError: 1,
            };

        navigationPlugin.createNavMesh([staticMesh], navmeshParameters);

        //debug navmesh (permet de voir la navmesh)
        var navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
        navmeshdebug.position = new BABYLON.Vector3(0, 0.01, 0);
        
        var matdebug = new BABYLON.StandardMaterial('matdebug', scene);
        matdebug.diffuseColor = new BABYLON.Color3(0.1, 0.2, 1);
        matdebug.alpha = 0.2;
        navmeshdebug.material = matdebug;

        // ========== FIN NAVMESH =========
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        
        groundMaterial.diffuseTexture = new BABYLON.Texture("textures/test/lambert1_Base_Color.png");
        groundMaterial.emissiveTexture = new BABYLON.Texture("textures/test/heightmap_lambert1_Glossiness.png");
        
        groundMaterial.bumpTexture = new BABYLON.Texture("textures/test/heightmap_lambert1_normal.png");
        
        groundMaterial.roughnessTexture = new BABYLON.Texture("textures/test/lambert1_roughness.jpg");
        groundMaterial.specularTexture = new BABYLON.Texture("textures/test/heightmap_lambert1_Specular.png");
        
        ground.material = groundMaterial;
        ground.checkCollisions = true;

    }
    return ground;
}

function createMobs(scene){   
    let x = 40 + Math.random()*20;
    let y = 5;
    let z = 50 + Math.random()*20;
        
    BABYLON.SceneLoader.ImportMesh("", "models/Persos/", "crabe.glb", scene, function (meshes) {  
        let crabeM = meshes[0];
        let mobMaterial = new BABYLON.StandardMaterial("mobTexture", scene);
        mobMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/crabe_Texture.png");
        crabeM.scaling = new BABYLON.Vector3(1, 1, 1); 
        crabeM.name ="crabeM";
        crabeM.position.x = 40 + Math.random()*20;;
        crabeM.position.z = 50 + Math.random()*20;;
        crabeM.position.y = 5;
        crabeM.material = mobMaterial;

        let crabe = new Mob(crabeM,"crabe",2,3,20,5,250);
    });
   
    BABYLON.SceneLoader.ImportMesh("", "models/Persos/", "bat.glb", scene, function (meshes) {  
        let batM = meshes[0];
        let mobMaterial = new BABYLON.StandardMaterial("mobTexture", scene);
        mobMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/bat_Texture.png");
        batM.scaling = new BABYLON.Vector3(1, 1, 1); 
        batM.name ="batM";
        batM.position.x = 40 + Math.random()*20;;
        batM.position.z = 50 + Math.random()*20;;
        batM.position.y = 5;
        batM.material = mobMaterial;

        let bat = new Mob(batM,"bat",2,3,20,5,250);
    });
    
    BABYLON.SceneLoader.ImportMesh("", "models/Persos/", "cactus.glb", scene, function (meshes) {  
        let cactusM = meshes[0];
        let mobMaterial = new BABYLON.StandardMaterial("mobTexture", scene);
        mobMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/cactus_Texture.png");
        cactusM.scaling = new BABYLON.Vector3(1, 1, 1); 
        cactusM.name ="cactusM";
        cactusM.position.x = 40 + Math.random()*20;;
        cactusM.position.z = 50 + Math.random()*20;;
        cactusM.position.y = 5;
        cactusM.material = mobMaterial;

        let cactus = new Mob(cactusM,"cactus",2,3,20,5,250);
    });

    BABYLON.SceneLoader.ImportMesh("", "models/Persos/", "chicken.glb", scene, function (meshes) {  
        let chickenM = meshes[0];
        let mobMaterial = new BABYLON.StandardMaterial("mobTexture", scene);
        mobMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/chicken_Texture.png");
        chickenM.scaling = new BABYLON.Vector3(1, 1, 1); 
        chickenM.name ="chickenM";
        chickenM.position.x = 40 + Math.random()*20;;
        chickenM.position.z = 50 + Math.random()*20;;
        chickenM.position.y = 5;
        chickenM.material = mobMaterial;

        let chicken = new Mob(chickenM,"chicken",2,3,20,5,250);
    });

    BABYLON.SceneLoader.ImportMesh("", "models/Persos/", "demon.glb", scene, function (meshes) {  
        let demonM = meshes[0];
        let mobMaterial = new BABYLON.StandardMaterial("mobTexture", scene);
        mobMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/demon_Texture.png");
        demonM.scaling = new BABYLON.Vector3(1, 1, 1); 
        demonM.name ="demonM";
        demonM.position.x = 40 + Math.random()*20;;
        demonM.position.z = 50 + Math.random()*20;;
        demonM.position.y = 5;
        demonM.material = mobMaterial;

        let demon = new Mob(demonM,"demon",2,3,20,5,250);
    });

    BABYLON.SceneLoader.ImportMesh("", "models/Persos/", "monster.glb", scene, function (meshes) {  
        let monsterM = meshes[0];
        let mobMaterial = new BABYLON.StandardMaterial("mobTexture", scene);
        mobMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/monster_Texture.png");
        monsterM.scaling = new BABYLON.Vector3(1, 1, 1); 
        monsterM.name ="monsterM";
        monsterM.position.x = 40 + Math.random()*20;;
        monsterM.position.z = 50 + Math.random()*20;;
        monsterM.position.y = 5;
        monsterM.material = mobMaterial;

        let monster = new Mob(monsterM,"monster",2,3,20,5,250);
    });

    BABYLON.SceneLoader.ImportMesh("", "models/Persos/", "tree.glb", scene, function (meshes) {  
        let treeM = meshes[0];
        let mobMaterial = new BABYLON.StandardMaterial("mobTexture", scene);
        mobMaterial.diffuseTexture = new BABYLON.Texture("models/Persos/tree_Texture.png");
        treeM.scaling = new BABYLON.Vector3(1, 1, 1); 
        treeM.name ="treeM";
        treeM.position.x = 40 + Math.random()*20;;
        treeM.position.z = 50 + Math.random()*20;;
        treeM.position.y = 5;
        treeM.material = mobMaterial;

        let tree = new Mob(treeM,"tree",2,3,20,5,250);
    });
}

window.addEventListener("resize", () => {
    engine.resize()
});
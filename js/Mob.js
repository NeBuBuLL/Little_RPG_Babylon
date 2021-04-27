export default class Mob {
    constructor(mobMeshes,name,level,speed,attack,defense,health, xp_to_give, scene) {
        this.mobMeshes = mobMeshes;
        this.name = name;
        this.level = level;
        this.speed = speed;
        this.attack= attack;
        this.defense = defense;
        this.health = health;
        this.xp_to_give = xp_to_give;
        this.scene = scene;

        
        mobMeshes.Mob = this;
    }

    isDead(){
        return (this.health <= 0);
    }
    getXpToGive(){
        return this.xp_to_give;
    }
    getSpeed(){
        return this.speed;
    }
    getHealth(){
        return this.health;
    }
    getName(){
        return this.speed;
    }
    getLevel(){
        return this.level;
    }
    getDefense(){
        return this.defense;
    }
    getAttack(){
        return this.attack;
    }

    attackPlayer(playerMesh){

        let damage = Math.max(0,Math.floor(this.attack  - (- (this.attack/2) + Math.random() * this.attack) - playerMesh.getDefense()/4));

        console.log(this.attack);
        console.log(playerMesh.getDefense());
        console.log(this.name + " hits you and does " + damage + " damage to you");
        playerMesh.takeDamage(damage);
    }

    takeDamage(damage){
        if (!this.isDead()){
            console.log("You hit a " + this.name + " and make " + damage + " to it");
            if (damage > 0)
                this.health -= damage;
            if(this.health < 0){
                this.health = 0;
            }
        }
        
    }

    giveXp(playerMesh){
        //if (!this.isDead()){
            //ne gagne plus d'xp si le joueur est plus haut niveau d'au moins 3 level
            let diff_level = playerMesh.getLevel() - this.level;
            let xp;
            if (diff_level < 3){
                xp = Math.floor(this.xp_to_give + this.xp_to_give / 10*(this.level - diff_level));
            }
            else if (diff_level >= 3){
                xp = 0;
            }
            console.log(this);

            //console.log("DEBUG " + diff_level + " " + this.xp_give);
            playerMesh.addXp(xp);
            console.log("You earned " + xp + " experience points");
        //}
    }
    
    getStats(){
        console.log("Ennemy name is " + this.name);
        console.log("Ennemy level is " + this.level);
        console.log("Ennemy brut attack is " + this.attack);
        console.log("Ennemy brut defense is " + this.defense);
        console.log("Ennemy remaining health is " + this.health);
    }

    createBoundingBox() {
        let bounder = new BABYLON.Mesh.CreateBox("bounder", 1, this.scene);
        let bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial", this.scene);
        bounderMaterial.alpha = .4;
        bounder.material = bounderMaterial;
        bounder.checkCollisions = true;

        bounder.position = this.mobMeshes.position.clone();

        let bbInfo = Mob.boundingBoxParameters;

        let max = bbInfo.boundingBox.maximum;
        let min = bbInfo.boundingBox.minimum;

        // Not perfect, but kinda of works...
        // Looks like collisions are computed on a box that has half the size... ?
        bounder.scaling.x = (max._x - min._x) * this.scaling;
        bounder.scaling.y = (max._y - min._y) * this.scaling*2;
        bounder.scaling.z = (max._z - min._z) * this.scaling*3;

        bounder.isVisible = true;

        return bounder;
    }

    moveM(mesh,target) {
        // as move can be called even before the bbox is ready.
        //if (!meshe.bounder) return;
        // let's put the dude at the BBox position. in the rest of this
        // method, we will not move the dude but the BBox instead
        this.mobMeshes.position = new BABYLON.Vector3(
        mesh.bounder.position.x,
        mesh.bounder.position.y-20,
        mesh.bounder.position.z
        );
        // follow the tank
        //let jolleen = scene.getMeshByName("Jolleen");
        // let's compute the direction vector that goes from Dude to the tank
        let direction = target.position.subtract(this.mobMeshes.position);
        let distance = direction.length(); // we take the vector that is not normalized, not the dir vector
        //console.log(distance);
        let dir = direction.normalize();
        // angle between Dude and tank, to set the new rotation.y of the Dude so that he will look towards the tank
        // make a drawing in the X/Z plan to uderstand....
        let alpha = Math.atan2(-dir.x, -dir.z);
        // If I uncomment this, there are collisions. This is strange ?
        //this.bounder.rotation.y = alpha;
    
        this.mobMeshes.rotation.y = alpha;
    
        // let make the Dude move towards the tank
        // first let's move the bounding box mesh
        if (distance < 200 && distance > 50) {
          //a.restart();
          // Move the bounding box instead of the dude....
          mesh.bounder.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        } else {
          //a.pause();
        }
    }
}
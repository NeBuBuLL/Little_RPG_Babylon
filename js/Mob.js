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

        let damage = Math.max(0,Math.floor(this.attack - playerMesh.getDefense()/4));

        console.log(this.attack);
        console.log(playerMesh.getDefense());
        console.log(this.name + " hits you and does " + damage + " damage to you");
        playerMesh.takeDamage(damage);
    }

    takeDamage(damage){
        console.log("You hit a " + this.name + " and make " + damage + "to it");
        if (!this.isDead() && damage >0){
            this.health -= damage;
        }
    }

    giveXp(playerMesh){
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
}
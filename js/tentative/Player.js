export default class Player {
    constructor(playerMesh,nom,niveau,vitesse,attaque,defense,vie) {
        this.playerMesh = playerMesh;
        this.nom = nom;
        this.niveau = niveau;
        this.vitesse = vitesse;
        this.attaque = attaque;
        this.defense = defense;
        this.vie = vie;

        playerMesh.Player = this;
    }

    move() { 
        let yMovementV = 0;

       
        if (this.position.y > 42) {
            zMovementV = 0;
            yMovementV = 0;
        } else {
            if(inputStates.up) {
                this.moveWithCollisions(this.frontVector.multiplyByFloats(this.speed, this.speed, this.speed));
            }    
            if(inputStates.down) {
                this.moveWithCollisions(this.frontVector.multiplyByFloats(-this.speed, -this.speed, -this.speed));
            }    
            if(inputStates.left) {
                this.rotation.y -= 0.02;
                this.frontVector = new BABYLON.Vector3(Math.sin(this.rotation.y), 0, Math.cos(this.rotation.y));
            }    
            if(inputStates.right) {
                this.rotation.y += 0.02;
                this.frontVector = new BABYLON.Vector3(Math.sin(this.rotation.y), 0, Math.cos(this.rotation.y));
            }
    }

    inputStates.left = false;
    inputStates.right = false;
    inputStates.up = false;
    inputStates.down = false;
    inputStates.space = false;
    
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
        }  else if (event.key === " ") {
           inputStates.space = true;
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
        }  else if (event.key === " ") {
           inputStates.space = false;
        }
    }, false);
}
}

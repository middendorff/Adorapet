class bird extends PetBaseClass{
    constructor(){
        super();
        this.name = "bird";
        this.image = "";
        this.imageRight = "";
    }

    constructor(xCoord,yCoord,xVel,yVel,hungerLevel,happinessLevel){
        super(xCoord,yCoord,xVel,yVel,hungerLevel,happinessLevel);
        this.name = "bird";
        this.image = "";
        this.imageRight = "";
    }
}

class dog extends PetBaseClass{
    constructor(){
        super();
        this.name = "dog";
        this.image = "";
        this.imageRight = "";
    }

    constructor(xCoord,yCoord,xVel,yVel,hungerLevel,happinessLevel){
        super(xCoord,yCoord,xVel,yVel,hungerLevel,happinessLevel);
        this.name = "dog";
        this.image = "";
        this.imageRight = "";
    }
}

class cat extends PetBaseClass{
    constructor(){
        super();
        this.name = "cat";
        this.imageLeft = "";
        this.imageRight = "";
    }
    constructor(xCoord,yCoord,xVel,yVel,hungerLevel,happinessLevel){
        super(xCoord,yCoord,xVel,yVel,hungerLevel,happinessLevel);
        this.name = "cat";
        this.image = "";
        this.imageRight = "";
    }
}


//add any other pets and modify attributes
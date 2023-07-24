// deno-lint-ignore-file no-unused-vars
import { Constructable, mix } from "./mod.ts";

interface Position {
    xPos: number;
    yPos: number;
}

class AirForce implements Position {
    xPos = 0;
    yPos = 0;
}

class GroundForce implements Position {
    xPos = 0;
    yPos = 0;
}

const bomber = <c extends Constructable>(s : c) => class extends s {
    bomb() { }
}

const shooter = <c extends Constructable>(s : c)=> class extends s {
    shoot() { }
}

//Notice that this takes a 'Position' type since 
//it needs to refer back to its super class (which implements Position)
const spawner = <c extends Constructable<Position>>(s : c) => class extends s {
    spawn() {
        //spawn logic for things that spawn
        this.yPos = Math.random() * 100;
        this.xPos = Math.random() * 100;
    }
}

//airplanes spawn, shoot, and bomb
class Airplane extends mix(AirForce).with(spawner, shooter, bomber) { }
//helicopters spawn and shoot
class Helicopter extends mix(AirForce).with(spawner, shooter) { }
//tanks spawn and shoot
class Tank extends mix(GroundForce).with(spawner, shooter) { }
//fortifications don't spawn in, but do shoot
class fortification extends mix(GroundForce).with(shooter) { }

// You can also skip the final class definition, but intent is less clear
const myJetFighter = new (mix(AirForce).with(spawner, shooter))

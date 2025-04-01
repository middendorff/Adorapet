import Cat from "./animals/Cat";
import Fox from "./animals/Fox";
import neko from "../../static/cat.png";
import fox from "../../static/fox.png";
import image from "../static/clip.png";
import Engine from "./engine/Engine";
import "./styles.css";

const engine = new Engine();
engine.load(neko, fox).then((engine) => {
  // Setup the 🐈
  engine.addThing(new Cat(engine));
  engine.addThing(new Fox(engine));

  // Start the loop
  engine.fire();
});

// Adorapet
//
//    |\      _,,,---,,_
//    /,`.-'`'    -.  ;-;;,_
//   |,4-  ) )-,_..;\ (  `'-'
//  '---''(_/--'  `-'\_)
//
//  ____
// (.   \
//   \  |
//    \ |___(\--/)
//  __/    (  . . )
// "'._.    '-.O.'
//      '-.  \ "|\
//         '.,,/'.,,mrf
//
// look at todo.md

document.getElementById("extension").src = image;

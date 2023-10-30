import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js"
import { FRUITS } from "./fruits";
const engine = Engine.create();
const render = Render.create({
  engine,
  element : document.body,
  options: {
  wireframes: false,
  background: "#F7F4C8",
  width: 620,
  height: 850,
}}
);

const world = engine.world;

// rectangle 중앙을 기준으로 계산됨 왼쪽쪽부터 15만큼, 위쪽부터 395만큼... 떨어져있다. )
const leftWall = Bodies.rectangle(15,395,30, 790, {
  isStatic: true,
  render: {fillStyle: "#E6B143"}
})

const rightWall = Bodies.rectangle(605,395,30, 790, {
  isStatic: true,
  render: {fillStyle: "#E6B143"}
})

const ground = Bodies.rectangle(310,820,620, 60, {
  isStatic: true,
  render: {fillStyle: "#E6B143"}
})

const topLine = Bodies.rectangle(310,150,620, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: {fillStyle: "#E6B143"}
})

World.add(world,[leftWall,rightWall,ground,topLine])

Render.run(render);
Runner.run(engine);

let currentBody: Body | any = null;
let currentFruit: typeof FRUITS | any = null;
let disableAction = false;
let interval: Number | undefined | any = null;

function addFruits(){
  const index = Math.floor(Math.random() * 5);
  const fruits = FRUITS[index];

  const body = Bodies.circle(300, 50 , fruits.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: {texture : `${fruits.name}.png`}
    },
    restitution: 0.2,
  });

  currentBody = body;
  currentFruit = fruits;

  World.add(world,body)
};

window.onkeydown= (e) => {
  if(disableAction){
    return;
  }
  switch(e.code){
    case "ArrowLeft":
      if(interval) return;
      interval = setInterval(() => {
        if(currentBody.position.x - currentFruit.radius > 30){
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 10,
            y: currentBody.position.y,
          })
        }
      },5)
    break;
    case "ArrowRight":
      if(interval) return;
      interval = setInterval(() => {
        if(currentBody.position.x + currentFruit.radius < 590){
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 10,
            y: currentBody.position.y,
          })
        }
      },5)
    break;
    case "ArrowDown":
      currentBody.isSleeping = false;
      disableAction = true;
      setTimeout(() => {
        addFruits();
        disableAction = false;
      }, 800);
    break;
  }
}

window.onkeyup = (e) => {
  switch(e.code){
    case "ArrowLeft":
    case "ArrowRight":
      clearInterval(interval);
      interval = null;
  }
}

Events.on(engine, "collisionStart", (e) => {
  e.pairs.forEach((collision) => {
    if(collision.bodyA.index === collision.bodyB.index){
      const index = collision.bodyA.index;
      console.log(collision.bodyA.index,collision.bodyB.index)
      if(index === FRUITS.length -1){
        return;
      }

      World.remove(world,[collision.bodyA, collision.bodyB]);
    
      const newFruit = FRUITS[index + 1];
      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render : { 
            sprite: { texture: `${newFruit.name}.png`}
          },
          index: index + 1
        }
      );

      World.add(world,newBody);
    }
    if(
      !disableAction && 
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")){
      alert("Game Over");
    }
  });
})


addFruits();
import { Blocka } from "./main.js";

const options = {
  targetId: 'game-container',
  images: [
    new URL('../assets/imgs/Bombadirocrocodilo.jpg', import.meta.url).href, 
    new URL('../assets/imgs/Chimpancinibananini.jpg', import.meta.url).href, 
    new URL('../assets/imgs/DONDONDONDONSATUR.jpg', import.meta.url).href,
    new URL('../assets/imgs/TRALALEROTRALALA.jpg', import.meta.url).href,
    new URL('../assets/imgs/TUNTUNTUNTUNSAHUR.jpg', import.meta.url).href
  ], //Al agregar las imagenes, agregar los links RELATIVOS porfis
  defaultPieces: 4,
  allowHelp: true
};

const game = new Blocka(options);

document.getElementById("btn-play").addEventListener('click', ()=>{
    console.log("Iniciando juego blocka");
    game.init();
})


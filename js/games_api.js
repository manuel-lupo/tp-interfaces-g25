/*
Ejemplo de un juego en la respuesta de la API
{
  "id": 3498,
  "name": "Grand Theft Auto V",
  "released": "2013-09-17",
  "background_image": "https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg",
  "background_image_low_res": "https://media.rawg.io/media/crop/600/400/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg",
  "rating": 4.47,
  "description": "Rockstar Games went bigger, since their previous installment of the series. You get the complicated and realistic world-building from Liberty City of GTA4 in the setting of lively and diverse Los Santos, from an old fan favorite GTA San Andreas. 561 different vehicles (including every transport you can operate) and the amount is rising with every update...",
  "platforms": [
    {
      "id": 1,
      "name": "PC"
    },
    {
      "id": 2,
      "name": "PlayStation"
    },
    {
      "id": 3,
      "name": "Xbox"
    }
  ],
  "genres": [
    {
      "id": 4,
      "name": "Action"
    }
  ]
}
  */

const BASE_URL = "https://vj.interfaces.jima.com.ar/api/v2"

/**
 * Funcion asincrona que devuelve una lista de juegos, en caso de fallar la llamada devuelve un nulo
*/
async function getGames(){
  try{  
    const response = await fetch(BASE_URL)
    const games = await response.json()
    console.log(`Fetched games: ${games}`)
    return games
  } catch (err) { throw err }
}

export { getGames }
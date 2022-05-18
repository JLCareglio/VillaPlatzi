var byId = function (id) {
  return document.getElementById(id);
};
// Recuperamos y aplicamos ajustes guardados:
byId("optionMusic").checked = JSON.parse(
  localStorage.getItem("optionMusic") || true
);
byId("optionShowButtons").checked = JSON.parse(
  localStorage.getItem("optionShowButtons") || true
);
var finalesConseguidos = JSON.parse(
  localStorage.getItem("finalesConseguidos") || "[]"
);
actualizarFinalesConseguidos();

// Declaramos variables para usar en cualquier parte del script:
var canvasVilla = byId("villaPlatzi").getContext("2d");
var elementosDibujables = new Array();
var juegoTerminado = false;
// Estos elementos son los que dibujaremos en sus respectivas coordenadas
var fondo = { url: "imagenes/tile.png", cargar: false, x: 0, y: 0 };
var cerdo = { url: "imagenes/cerdo.png", cargar: false, x: 0, y: 0 };
var lobo = { url: "imagenes/lobo.png", cargar: false, x: 200, y: 0 };
var arrowUp = {
  url: "imagenes/arrowUp.png",
  cargar: false,
  xL: [250, 410, 250, 90],
  yL: [90, 250, 410, 250],
  alpha: 0.4,
};
// Las vacas y pollos tendran varias coordenadas para colocarlas a todas
var vaca = {
  url: "imagenes/vaca.png",
  cargar: false,
  xL: new Array(),
  yL: new Array(),
  cant: byId("cantVacas").value,
};
var pollo = {
  url: "imagenes/pollo.png",
  cargar: false,
  xL: new Array(),
  yL: new Array(),
  cant: byId("cantGallinas").value,
};

// Orden en que se dibujaran los elementos:
elementosDibujables.push(fondo);
elementosDibujables.push(vaca);
elementosDibujables.push(pollo);
elementosDibujables.push(cerdo);
elementosDibujables.push(lobo);
elementosDibujables.push(arrowUp);

setRandomPosAnimals();
for (const key in elementosDibujables) {
  if (elementosDibujables.hasOwnProperty(key)) {
    const element = elementosDibujables[key];
    element.imagen = new Image();
    element.imagen.src = element.url;
    element.imagen.addEventListener("load", function () {
      element.cargar = true;
      dibujar();
    });
  }
}

function dibujar() {
  for (const key in elementosDibujables) {
    if (elementosDibujables.hasOwnProperty(key)) {
      const element = elementosDibujables[key];
      if (element.cargar) {
        if (element == vaca || element == pollo)
          for (let i = 0; i < element.cant; i++)
            canvasVilla.drawImage(element.imagen, element.xL[i], element.yL[i]);
        else if (byId("optionShowButtons").checked && element == arrowUp) {
          for (let i = 0; i < 4; i++) {
            canvasVilla.save();
            canvasVilla.globalAlpha = element.alpha;
            canvasVilla.translate(element.xL[i], element.yL[i]);
            canvasVilla.rotate((i * 90 * Math.PI) / 180);
            canvasVilla.drawImage(
              element.imagen,
              -element.imagen.width / 2,
              -element.imagen.height / 2
            );
            canvasVilla.restore();
          }
        } else if (!(!byId("optionShowButtons").checked && element == arrowUp))
          canvasVilla.drawImage(element.imagen, element.x, element.y);
      }
    }
  }
}
function playerMove(direccion) {
  if (!juegoTerminado) {
    playPauseMusic();
    let sizeCanvas = 500;
    let sizeCuadrante = 25;
    let movJugador = sizeCuadrante * 2;
    let movLobo = sizeCuadrante;

    //Posibles desplazamientos del jugador y sus repercusiones
    switch (direccion) {
      case "up":
        console.log("playerMove -> up");
        if (cerdo.y > -sizeCuadrante) {
          cerdo.y -= movJugador;
          lobo.y += movLobo;
          lobo.x += movLobo;
        } else if (cerdo.x >= sizeCanvas - sizeCuadrante * 4) {
          cerdo.y = sizeCanvas * -2;
          cerdo.x = sizeCanvas * 2;
          secreto(
            "🐖 La granja no te intereso nada, y te fuiste de vacaciones a Miami 🏖️ (?.",
            "👻Final Secreto <strong style='color: hsl(28, 100%, 52%);'>2/2</strong>👻"
          );
          finalConseguido(5);
          return;
        }
        break;
      case "down":
        console.log("playerMove -> down");
        if (cerdo.y < sizeCanvas - sizeCuadrante * 4) {
          cerdo.y += movJugador;
          lobo.y += movLobo;
          lobo.x += movLobo;
        }
        break;
      case "left":
        console.log("playerMove -> left");
        if (cerdo.x > -sizeCuadrante) {
          cerdo.x = cerdo.x - movJugador;
          lobo.y += movLobo;
          lobo.x += movLobo;
        }
        break;
      case "right":
        console.log("playerMove -> right");
        if (cerdo.x < sizeCanvas - sizeCuadrante * 3) {
          cerdo.x = cerdo.x + movJugador;
          if (lobo.y < 200) {
            lobo.y += movLobo;
            lobo.x -= movLobo;
          } else {
            lobo.y += movLobo;
            lobo.x += movLobo;
          }
          if (cerdo.y == 0 && cerdo.x == 150 && lobo.y == 75) {
            lobo.y = 0;
            lobo.x = 150;
          }
        } else if (cerdo.y <= sizeCuadrante) {
          cerdo.y = sizeCanvas * -2;
          cerdo.x = sizeCanvas * 2;
          secreto(
            "🐖 La granja no te intereso nada, y te fuiste de vacaciones a Disneyland 🏰 (?.",
            "👻Final Secreto <strong style='color: hsl(28, 100%, 52%);'>2/2</strong>👻"
          );
          finalConseguido(5);
          return;
        }
        break;
    }
    // Si el lobo llega a un borde afectamos su movimiento y evitamos que salga:
    if (lobo.y >= 400) lobo.x += movLobo;
    if (lobo.x >= 400) lobo.y += movLobo;
    lobo.x = Math.min(Math.max(0, lobo.x), 400);
    lobo.y = Math.min(Math.max(0, lobo.y), 400);

    console.log("posCerdito -> x=" + cerdo.x + " y=" + cerdo.y);
    console.log("posLobito -> x=" + lobo.x + " y=" + lobo.y);
    dibujar();

    // Otros finales posibles luego de evaluar posiciones del lobo y cerdito.
    if (cerdo.y == lobo.y && cerdo.x == lobo.x) {
      // Cerdo y Lobo en mismo lugar
      if (cerdo.y >= 400 && cerdo.x >= 400) {
        secreto(
          "🐺🐖 Las gallinas ven que llegas junto con el lobo, creen que es un buen sujeto y por alguna razón todos terminaron de fiesta (?.",
          "👻Final Secreto <strong style='color: hsl(28, 100%, 52%);'>1/2</strong>👻"
        );
        finalConseguido(4);
      } else {
        perdiste(
          "🐺 Perdiste 🐺<br>El lobo te devoró",
          "🥓 Final <strong style='color: hsl(28, 100%, 52%);'>1/4</strong> 🥓"
        );
        finalConseguido(0);
      }
    } else if (
      cerdo.y >= 400 &&
      cerdo.x >= 400 &&
      400 - lobo.x <= sizeCuadrante &&
      400 - lobo.y <= sizeCuadrante
    ) {
      //
      ganaste(
        "😨 Ganaste pero solo por poco! 😨<br>Llegaste al granero apenas antes que el lobo y entre varios lo ahuyentaron",
        "⚔️ Final <strong style='color: hsl(28, 100%, 52%);'>3/4</strong> ⚔️"
      );
      finalConseguido(2);
    } else if (cerdo.y >= 400 && cerdo.x >= 400) {
      lobo.x = 325;
      lobo.y = 325;
      dibujar();
      ganaste(
        "😎🥳 VICTORIA APLASTANTE!! 🥳😎<br>Llegaste al granero mucho antes que el lobo",
        "✌️ Final <strong style='color: hsl(28, 100%, 52%);'>4/4</strong> 👍"
      );
      finalConseguido(3);
    } else if (lobo.x >= 400 && lobo.y >= 400) {
      lobo.x = 400;
      lobo.y = 400;
      dibujar();
      perdiste(
        "🥺 Perdiste 🥺<br>El lobo llego antes al granero y se comió todos los animales<br>😤 Juraste venganza 😠",
        "👊 Final <strong style='color: hsl(28, 100%, 52%);'>2/4</strong> 👊"
      );
      finalConseguido(1);
    }
  } else {
    // En caso de que el juego ya termino y el jugador tratase de moverse esto es evitado y también acomodamos el scroll para que vea mejor el botón de reinicio.
    // location.href = "index.html#canvasJuego";
  }
}

function ganaste(msj, fn = "") {
  dibujarLinea("#90EE90", 35, 30, 250, 470, canvasVilla, 70);
  dibujarLinea("#90EE90", 465, 30, 250, 470, canvasVilla, 70);
  byId("mensaje").innerHTML = msj;
  byId("mensaje").style.color = "#99ff99";
  byId("final").style.color = "hsl(120, 100%, 70%)";
  byId("final").innerHTML = fn;
  byId("btnReset").className = "unselectable btn";
  juegoTerminado = true;
}
function perdiste(msj, fn = "") {
  dibujarLinea("red", 100, 100, 400, 400, canvasVilla, 75);
  dibujarLinea("red", 100, 400, 400, 100, canvasVilla, 75);
  byId("mensaje").innerHTML = msj;
  byId("mensaje").style.color = "#ff9999";
  byId("final").style.color = "hsl(0, 100%, 70%)";
  byId("final").innerHTML = fn;
  byId("btnReset").className = "unselectable btn red";
  juegoTerminado = true;
}
function secreto(msj, fn = "") {
  dibujarLinea("blue", 250, 450, 250, 275, canvasVilla, 50);
  dibujarLinea("blue", 250, 275, 375, 275, canvasVilla, 50);
  dibujarLinea("blue", 375, 275, 375, 75, canvasVilla, 50);
  dibujarLinea("blue", 375, 75, 150, 75, canvasVilla, 50);
  dibujarLinea("blue", 150, 75, 150, 200, canvasVilla, 50);
  byId("mensaje").innerHTML = msj;
  byId("mensaje").style.color = "#9999ff";
  byId("final").style.color = "hsl(240, 100%, 70%)";
  byId("final").innerHTML = fn;
  byId("btnReset").className = "unselectable btn blue";
  juegoTerminado = true;
}
function reiniciarJuego() {
  cerdo.x = 0;
  cerdo.y = 0;
  lobo.x = 200;
  lobo.y = 0;
  byId("mensaje").innerHTML =
    '🏞️ Eres el <strong style="color: hsl(145, 100%, 49%);">cerdito</strong> 🐖<br><br>Llega <strong style="color: hsl(28, 100%, 52%);">rápido</strong> al  <strong style="color: hsl(145, 100%, 49%);">gallinero</strong> 🐔 y <strong style="color: hsl(28, 100%, 52%);">antes que</strong> el <strong style="color: hsl(6, 100%, 57%);">lobo</strong> 🐺<br><br>🐾 <strong style="color: hsl(185, 100%, 42%);">¡Salva ésas gallinas!</strong> 🐾';
  byId("final").innerHTML =
    '🎮🕹️⌨️🖱️👉<br>Usa <strong style="color: hsl(28, 100%, 52%);">↕️↔️</strong> para <strong style="color: hsl(28, 100%, 52%);">moverte</strong>';
  byId("mensaje").style.color = "white";
  byId("final").style.color = "white";
  byId("btnReset").className = "unselectable btn orange";
  setRandomPosAnimals();
  dibujar();
  juegoTerminado = false;
  //location.href = "index.html#mensajes";
}

function finalConseguido(nFinal) {
  finalesConseguidos[nFinal] = true;
  localStorage.setItem(
    "finalesConseguidos",
    JSON.stringify(finalesConseguidos)
  );
  actualizarFinalesConseguidos();
}
function actualizarFinalesConseguidos() {
  let count = 0;
  let cantFinales = 6;
  let tercio = cantFinales / 3;
  finalesConseguidos.forEach((v) => (v ? count++ : v));
  byId("contadorFinales").value = count + "/" + cantFinales;
  byId("medalla").innerHTML =
    count >= tercio * 3 ? "🏆🏆🏆" : count >= tercio * 2 ? "🏆🏆" : "🏆";
}

// Input para movimiento detectado con clicks
document
  .getElementById("villaPlatzi")
  .addEventListener("mousedown", function (e) {
    detectarClick(byId("villaPlatzi"), e);
  });
function detectarClick(canvas, event) {
  let sizeCanvas = 500;
  let padding = sizeCanvas / 3.3333;
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  console.log("click en -> x=" + x, " y=" + y);
  if (x > padding && x < sizeCanvas - padding && y < padding) playerMove("up");
  else if (x > padding && x < sizeCanvas - padding && y > sizeCanvas - padding)
    playerMove("down");
  else if (x < padding && y > padding && y < sizeCanvas - padding)
    playerMove("left");
  else if (x > sizeCanvas - padding && y > padding && y < sizeCanvas - padding)
    playerMove("right");
}
// Input para movimiento detectado con teclado
document.addEventListener("keydown", function (event) {
  switch (event.keyCode) {
    case 38:
      event.preventDefault();
    case 87:
    case 73:
    case 104:
      playerMove("up");
      break;
    case 40:
      event.preventDefault();
    case 83:
    case 75:
    case 98:
      playerMove("down");
      break;
    case 37:
    case 65:
    case 74:
    case 100:
      playerMove("left");
      break;
    case 39:
    case 68:
    case 76:
    case 102:
      playerMove("right");
      break;
    //ReiniciarJuego
    case 32:
      event.preventDefault();
    case 13:
      reiniciarJuego();
  }
});

function setRandomPosAnimals() {
  vaca.cant = byId("cantVacas").value;
  pollo.cant = byId("cantGallinas").value;
  for (var i = 0; i < vaca.cant; i++) {
    var x = getRandomInt(0, 9) * 50;
    var y = getRandomInt(0, 9) * 50;
    vaca.xL[i] = x;
    vaca.yL[i] = y;
  }
  for (var i = 0; i < pollo.cant; i++) {
    var x = getRandomInt(16, 19);
    var y = getRandomInt(16, 19);
    x = x * 25;
    y = y * 25;
    pollo.xL[i] = x;
    pollo.yL[i] = y;
  }
}

function dibujarLinea(
  color,
  xinicial,
  yinicial,
  xfinal,
  yfinal,
  lienzo,
  grueso
) {
  lienzo.beginPath();
  lienzo.strokeStyle = color;
  lienzo.lineWidth = grueso;
  lienzo.moveTo(xinicial, yinicial);
  lienzo.lineTo(xfinal, yfinal);
  lienzo.stroke();
  lienzo.closePath();
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function preguntarSiTeGusto() {
  let r = prompt("¿Te sirvió este aporte? (Yes/No)").toUpperCase();
  if (r == "YES" || r == "Y" || r == "SI" || r == "S")
    alert("Genial 😄, Dale like 👍 y deja un comentario 😄");
  else alert("Deja un comentario y dime como puedo mejorar 😄");
}

function playPauseMusic() {
  byId("optionMusic").checked ? byId("music").play() : byId("music").pause();
  localStorage.setItem("optionMusic", byId("optionMusic").checked);
}

function showHideButtons() {
  localStorage.setItem("optionShowButtons", byId("optionShowButtons").checked);
  dibujar();
}

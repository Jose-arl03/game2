let filas, columnas, minas, matriz, visible;
let primeraCeldaSeleccionada = false;

function iniciarJuego(filasInput, columnasInput, minasInput) {
    filas = filasInput;
    columnas = columnasInput;
    minas = minasInput;

    document.getElementById('inicio').style.display = 'none';
    document.getElementById('tablero').style.display = 'block';
    crearTablero(filas, columnas, minas);
}

function mostrarFormularioPersonalizado() {
    document.getElementById('modal-personalizado').style.display = 'block';
}

function cerrarFormularioPersonalizado() {
    document.getElementById('modal-personalizado').style.display = 'none';
}

function iniciarJuegoPersonalizado() {
    const renglones = parseInt(document.getElementById('renglones').value);
    const columnas = parseInt(document.getElementById('columnas').value);

    if (renglones >= 5 && columnas >= 5) {
        iniciarJuego(renglones, columnas, Math.floor(renglones * columnas * 0.15));
        cerrarFormularioPersonalizado();
    } else {
        alert("Las dimensiones deben ser al menos de 5x5.");
    }
}

function crearTablero(filas, columnas, minas) {
    const tablero = document.getElementById('tablero');
    tablero.innerHTML = '';

    matriz = Array.from({ length: filas }, () => Array(columnas).fill(0));
    visible = Array.from({ length: filas }, () => Array(columnas).fill(false));

    let minasColocadas = 0;
    while (minasColocadas < minas) {
        const fila = Math.floor(Math.random() * filas);
        const columna = Math.floor(Math.random() * columnas);
        if (matriz[fila][columna] !== '💣') {
            matriz[fila][columna] = '💣';
            minasColocadas++;
        }
    }

    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            if (matriz[i][j] !== '💣') {
                matriz[i][j] = contarMinasAdyacentes(i, j);
            }
        }
    }

    for (let i = 0; i < filas; i++) {
        const filaDiv = document.createElement('div');
        filaDiv.classList.add('fila');
        for (let j = 0; j < columnas; j++) {
            const celda = document.createElement('div');
            celda.classList.add('celda');
            celda.setAttribute('data-fila', i);
            celda.setAttribute('data-columna', j);
            celda.innerHTML = '';

            celda.addEventListener('click', () => manejarClick(celda, i, j));
            celda.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                marcarBandera(celda);
            });

            filaDiv.appendChild(celda);
        }
        tablero.appendChild(filaDiv);
    }
}

function contarMinasAdyacentes(fila, columna) {
    let contador = 0;
    const direcciones = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (const [dx, dy] of direcciones) {
        const nuevaFila = fila + dx;
        const nuevaColumna = columna + dy;
        if (nuevaFila >= 0 && nuevaColumna >= 0 && nuevaFila < filas && nuevaColumna < columnas) {
            if (matriz[nuevaFila][nuevaColumna] === '💣') contador++;
        }
    }
    return contador;
}

function manejarClick(celda, fila, columna) {
    if (!primeraCeldaSeleccionada) {
        if (matriz[fila][columna] === '💣') moverMina(fila, columna);
        primeraCeldaSeleccionada = true;
    }

    if (matriz[fila][columna] === '💣') {
        alert("¡Boom! Has perdido.");
        revelarMinas();
        reiniciarJuego();
    } else {
        despejarCelda(celda, fila, columna);
    }
}

function moverMina(fila, columna) {
    let nuevaFila, nuevaColumna;
    do {
        nuevaFila = Math.floor(Math.random() * filas);
        nuevaColumna = Math.floor(Math.random() * columnas);
    } while (matriz[nuevaFila][nuevaColumna] === '💣' || (nuevaFila === fila && nuevaColumna === columna));

    matriz[nuevaFila][nuevaColumna] = '💣';
    matriz[fila][columna] = contarMinasAdyacentes(fila, columna);
}

function despejarCelda(celda, fila, columna) {
    if (visible[fila][columna]) return;

    visible[fila][columna] = true;
    const valor = matriz[fila][columna];
    celda.innerHTML = valor > 0 ? valor : '';
    celda.style.backgroundColor = '#d3d3d3';

    if (valor === 0) {
        const direcciones = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dx, dy] of direcciones) {
            const nuevaFila = fila + dx;
            const nuevaColumna = columna + dy;
            if (nuevaFila >= 0 && nuevaColumna >= 0 && nuevaFila < filas && nuevaColumna < columnas) {
                const nuevaCelda = document.querySelector(`[data-fila="${nuevaFila}"][data-columna="${nuevaColumna}"]`);
                despejarCelda(nuevaCelda, nuevaFila, nuevaColumna);
            }
        }
    }

    verificarVictoria();
}

function verificarVictoria() {
    const celdasDescubiertas = visible.flat().filter(v => v).length;
    const totalCeldas = filas * columnas;

    if (celdasDescubiertas === totalCeldas - contarMinas(matriz)) {
        alert("¡Felicidades! Has ganado el juego.");
        revelarMinas();
        reiniciarJuego();
    }
}

function contarMinas(matriz) {
    return matriz.flat().filter(celda => celda === '💣').length;
}

function revelarMinas() {
    const celdas = document.querySelectorAll('.celda');
    celdas.forEach(celda => {
        const fila = parseInt(celda.getAttribute('data-fila'), 10);
        const columna = parseInt(celda.getAttribute('data-columna'), 10);
        if (matriz[fila][columna] === '💣') {
            celda.innerHTML = '💣';
            celda.style.backgroundColor = '#f44336';
        }
    });
}

function marcarBandera(celda) {
    celda.innerHTML = celda.innerHTML === '🚩' ? '' : '🚩';
}

function reiniciarJuego() {
    primeraCeldaSeleccionada = false;
    document.getElementById('tablero').style.display = 'none';
    document.getElementById('inicio').style.display = 'block';
}

document.querySelectorAll('.nivel-btn').forEach(button => {
    button.addEventListener('click', function() {
        const nivel = this.getAttribute('data-nivel');
        switch (nivel) {
            case 'facil': iniciarJuego(5, 5, 3); break;
            case 'medio': iniciarJuego(8, 8, 10); break;
            case 'dificil': iniciarJuego(10, 10, 15); break;
            case 'muy_dificil': iniciarJuego(12, 12, 20); break;
            case 'hardcore': iniciarJuego(15, 15, 30); break;
            case 'leyenda': iniciarJuego(20, 20, 50); break;
            case 'personalizado': mostrarFormularioPersonalizado(); break;
        }
    });
});

document.getElementById('iniciar-juego').addEventListener('click', iniciarJuegoPersonalizado);

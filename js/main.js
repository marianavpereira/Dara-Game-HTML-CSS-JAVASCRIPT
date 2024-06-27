//JOGADOR 1 = EU
//JOGADOR 2 = AI

var board;
var pecas;
var selected;
var remover;
var ratual;
var catual;
var ls1;
var ls2;
var vencedor;
var jogAtual;
var began = false;
var fase1;
var vsAI = false;
var diff;
var tempoInicio;
var movimentosJogador1 = 0;
var movimentosJogador2 = 0;
var rows;
var columns;

players = ["Rosa", "Branco"];
playerClassNames = ["pink-piece", "white-piece"];
selectedClassNames = ["pink-selected", "white-selected"];

//variaveis para a leaderboard
lbr = 0
lbb = 0

var pontosai = 0;
var pontosjogador = 0;

function iniciarJogo() {

    if(began){
        return;
    }

    primjog = document.getElementById("primeiracor").value;
    startingPlayer = primjog;

    // ir buscar o número de linhas e colunas ao form
    tamTab = document.getElementById("tamanhotabuleiro").value;
    if (tamTab == 5) {
        rows = 5;
        columns = 6;
    } else {
        rows = 6;
        columns = 6;
    }

    // ir buscar o número de jogadores ao form
    numJogadores = document.getElementById("jogadores").value;
    if (numJogadores == 1) {
        vsAI = true;
        showGame();
    } else {
        vsAI = false;
        //ir para a fila aguardar por outro jogador
        join(tamTab);
        if (logged == false){
            document.getElementById('msg').style.display = 'block';
            info = document.getElementById("info");
            info.innerText = "Dê login para jogar online.";
            return;
        }
    }

    if (!began) {
        began = true;
    }

    //ir buscar a dificuldade
    diff = document.getElementById("niveldificuldade").value;
    ////console.log("dficuldade: " + diff);

    win = document.getElementById("vencedor");
    win.innerText = "";
    board = [];
    jogAtual = startingPlayer;

    // o index 0 representa o número de peças do jogador 1 e o index 1 representa o número de peças do jogador 2
    pecas = [0, 0];

    // última jogada do jogador 1 e do jogador 2 [r, c, ratual, catual]
    ls1 = [-1, -1, -1, -1];
    ls2 = [-1, -1, -1, -1];

    vencedor = 0;
    fase1 = true;
    selected = false;
    remover = false;

    for (r = 0; r < rows; r++) {
        row = [];
        for (c = 0; c < columns; c++) {
            // guardar o valor 0 em cada posição do tabuleiro
            row.push(0);

            // criar um div para cada posição do tabuleiro
            tile = document.createElement("div");

            // definir um par de coordenadas para cada div (row-column)
            tile.id = r.toString() + "," + c.toString();

            // dar lhe a tile class
            tile.classList.add("tile");
            tile.addEventListener("click", onClick);
            document.getElementById("board").append(tile);
        }
        board.push(row);
    }
    atualizarTab();

    info = document.getElementById("info");
    //info.innerText = players[jogAtual - 1] + ": selecione uma peça";

}

function showGame() {
    document.getElementById('formgrande').style.display = 'none';
    document.getElementById('miniboards').style.display = 'block';
    document.getElementById('msg').style.display = 'block';

    document.getElementById('desistirjogo').style.fontWeight = 'bold';
    document.getElementById('comecarjogo').style.fontWeight = 'normal';
}

function formatarTempo(tempoEmMilissegundos) {
    var segundos = Math.floor(tempoEmMilissegundos / 1000);
    var minutos = Math.floor(segundos / 60);

    segundos = segundos % 60;

    return minutos + " min " + segundos + " seg";
}

function desistir() {
    if(began==false){
        return;
    }

    if(!vsAI){
        leave();
        vsPerson=true;
        document.querySelector("#desistirjogo").innerHTML = "Desistir do jogo";
        document.querySelector("#desistirjogo").innerText = "Desistir do jogo";
        document.querySelector("#desistirjogo").textContent = "Desistir do jogo";
    }

    ////console.log("desistir called");
    for (r = 0; r < rows; r++) {
        for (c = 0; c < columns; c++) {
            tile = document.getElementById(r.toString() + "," + c.toString());
            if (tile != null) {
                tile.remove();
            }
        }
    }
    info = document.getElementById("info");
    s = "";
    info.innerText = s;
    document.getElementById('formgrande').style.display = 'block';
    document.getElementById('miniboards').style.display = 'none';
    document.getElementById('msg').style.display = 'none';
    document.getElementById('desistirjogo').style.fontWeight = 'normal';
    document.getElementById('comecarjogo').style.fontWeight = 'bold';

    // reset the mini boards
    for (i = 1; i <= 12; i++) {
        document.getElementById("1" + i.toString()).style.display = "block";
        document.getElementById("2" + i.toString()).style.display = "block";
    }

    began = false;
}

function contarPecas() {
    ////console.log("contarPecas chamada");
    pecas1 = [0, 0];
    for (r = 0; r < rows; r++) {
        for (c = 0; c < columns; c++) {
            if (board[r][c] == 1) {
                pecas1[0]++;
            }
            if (board[r][c] == 2) {
                pecas1[1]++;
            }
        }
    }
    //console.log("pecas: " + pecas1[0] + " " + pecas1[1]);
    return;
}


// muda o jogador
function trocaJogador() {
    if (jogAtual == 1) {
        jogAtual = 2;
        movimentosJogador1++;
    } else {
        jogAtual = 1;
        movimentosJogador2++;
    }
    ////console.log("jogador " + jogAtual + " selecionado");
}

// retorna o valor do jogador não atual
function outroJogador() {
    if (jogAtual == 1) {
        return 2;
    } else {
        return 1;
    }
}


function PodeColocar(r, c, jogAtual, ratual, catual, board) {
    ////console.log("PodeColocar chamada");
    linhas = board.length;
    colunas = board[0].length;

    //verificar se a posição está vazia
    if (board[r][c] != 0) {
        ////console.log("Posição não vazia");
        return false;
    }
    // caso seja a fase 2, removemos a peça que está na posição atual temporariamente
    if (!fase1) {
        board[ratual][catual] = 0;
    }

    //e colocamos a peça na posição que queremos
    board[r][c] = jogAtual;

    directions = [[0, 1], [1, 0]];

    for ([dr, dc] of directions) {
        count = 1; // Initialize a counter for the current direction

        // Check for possible 3 in the positive directions
        for (i = 1; i <= 3; i++) {
            row = r + dr * i;
            col = c + dc * i;
            if (row >= 0 && row < linhas && col >= 0 && col < colunas && board[row][col] === jogAtual) {
                count++;
            } else {
                break;
            }
        }

        for (i = 1; i <= 3; i++) {
            row = r - dr * i;
            col = c - dc * i;
            if (row >= 0 && row < linhas && col >= 0 && col < colunas && board[row][col] === jogAtual) {
                count++;
            } else {
                break;
            }
        }
        // Reset the counter if we don't have a "3 in a row" in the current direction and remove the "fake piece"
        board[r][c] = 0;

        if (count >= 3) {
            // A "3 in a row" is found in one of the directions
            ////console.log("3 em linha encontrados");
            return false;
        }
    }

    board[r][c] = 0;

    if (!fase1) {
        board[ratual][catual] = jogAtual;
    }

    // If no "3 in a row" is found in any direction, it's a valid move
    ////console.log("Movimento válido");
    return true;
}

function podeEscolher(r, c, jogAtual) {
    ////console.log("podeEscolher chamada");
    return board[r][c] == jogAtual;
}

function PodeMover(r, c, ratual, catual) {
    //console.log("PodeMover chamada");
    //console.log("pecas totais")
    rd = Math.abs(r - ratual);
    cd = Math.abs(c - catual);

    // caso a distância entre as coordenadas seja 1, a peça pode mover-se
    if (!((rd === 1 && cd === 0) || (rd === 0 && cd === 1))) {
        return false;
    }
    board[ratual][catual] = 0;
    // check if there is a line with more than 3 pieces
    for ([dr, dc] of directions) {
        count = 1; // Initialize a counter for the current direction

        // Check for possible 3 in the positive directions
        for (i = 1; i <= 3; i++) {
            row = r + dr * i;
            col = c + dc * i;
            if (row >= 0 && row < linhas && col >= 0 && col < colunas && board[row][col] === jogAtual) {
                count++;
                //console.log("peça encontrada em " + row + " " + col);
            } else {
                break;
            }
        }

        for (i = 1; i <= 3; i++) {
            row = r - dr * i;
            col = c - dc * i;
            if (row >= 0 && row < linhas && col >= 0 && col < colunas && board[row][col] === jogAtual) {
                count++;
                //console.log("peça encontrada em " + row + " " + col);
            } else {
                break;
            }
        }

        if (count > 3) {
            // A "3 in a row" is found in one of the directions
            //console.log(count + " em linha encontrados");
            board[ratual][catual] = jogAtual;
            return false;
        }
    }
    board[ratual][catual] = jogAtual;
    return true;
}

function verLinhas(r, c, jogAtual, board) {
    ////console.log("verLinhas chamada");
    const linhas = board.length;
    const colunas = board[0].length;

    directions = [[0, 1], [1, 0]];

    for ([dr, dc] of directions) {
        count = 1; // Initialize a counter for the current direction

        // Check for possible 3 in the positive directions
        for (i = 1; i <= 3; i++) {
            row = r + dr * i;
            col = c + dc * i;
            if (row >= 0 && row < linhas && col >= 0 && col < colunas && board[row][col] === jogAtual) {
                count++;
            } else {
                break;
            }
        }

        for (i = 1; i <= 3; i++) {
            row = r - dr * i;
            col = c - dc * i;
            if (row >= 0 && row < linhas && col >= 0 && col < colunas && board[row][col] === jogAtual) {
                count++;
            } else {
                break;
            }
        }

        if (count >= 3) {
            // A "3 in a row" is found in one of the directions
            ////console.log("3 em linha encontrados");
            return true;
        }
    }
    return false;
}

function MovimentoRepetido(ls1, ls2, r, c, ratual, catual, jogAtual) {
    ////console.log("MovimentoRepetido chamada");
    lst = ls1;
    if (jogAtual == 2) {
        lst = ls2;
    }

    if (lst[0] == ratual && lst[1] == catual && lst[2] == r && lst[3] == c)
        return true;
    return false;
}

function temJogadas(jooj, ls1, ls2) { // idk wth is up with this function, it makes the AI create pieces out of nowhere and steal pieces from the other player

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            if (board[i][j] == jooj) {
                for (let ia = i - 1; ia <= i + 1; ia++) {
                    for (let ja = j - 1; ja <= j + 1; ja++) {
                        if (ia >= 0 && ia < rows && ja >= 0 && ja < columns && board[ia][ja] == 0) {
                            if (!MovimentoRepetido(ls1, ls2, ia, ja, i, j, jooj)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
    return false;

}

function atualizarTab() {
    //console.log("atualizarTab chamada");
    for (r = 0; r < rows; r++) {
        for (c = 0; c < columns; c++) {
            tile = document.getElementById(r.toString() + "," + c.toString());
            if (board[r][c] == 1) {
                tile.classList.add("pink-piece");
            }
            if (board[r][c] == 2) {
                tile.classList.add("white-piece");
            }
            if (board[r][c] == 0) {
                tile.classList.remove("pink-selected");
                tile.classList.remove("white-selected");
                tile.classList.remove("pink-piece");
                tile.classList.remove("white-piece");
            }
        }
    }
    ////console.log("Tabuleiro atualizado");
}

function verVitoria() {
    //console.log("verVitoria called");

    if (pecas[0] <= 2) {
        //console.log("vencedor: branc");
        anunciarVencedor(2);
        return;
    }
    if (pecas[1] <= 2) {
        //console.log("vencedor: pink");
        anunciarVencedor(1);
        return;
    }

    if (!temJogadas(1, ls1, ls2)) {
        anunciarVencedor(2);
        return
    }
    if (!temJogadas(2, ls1, ls2)) {
        anunciarVencedor(1);
        return;
    }

    return;
}

function anunciarVencedor(ganhou) {
    ////console.log("anunciarVencedor called");
    s = document.getElementById("vencedor");
    if (ganhou == 1) {
        s.innerText = "ROSA";
        // atualizar lista da leaderboard
        if (typeof (Storage) !== "undefined") {
            if(localStorage.getItem("pontosjogador") != null){
                pontosjogador = parseInt(localStorage.getItem("pontosjogador"));
                localStorage.setItem("pontosjogador", pontosjogador + 1);
            }
            else{
                pontosjogador = 0;
                localStorage.setItem("pontosjogador", pontosjogador + 1);
            }
        }
    } else {
        s.innerText = "BRANCO";
        // atualizar lista da leaderboard
        if (typeof (Storage) !== "undefined") {
            if(localStorage.getItem("pontosai") != null){
                pontosai = parseInt(localStorage.getItem("pontosai"));
                localStorage.setItem("pontosai", pontosai + 1);
            }
            else{
                pontosai = 0;
                localStorage.setItem("pontosai", pontosai + 1);
            }
        }
    }

    var estatisticasDiv = document.getElementById('estatisticas');
    estatisticasDiv.style.display = 'block';
    document.getElementById("formgrande").style.display = 'none';
    document.getElementById("miniboards").style.display = 'none';
}   


function tabelaoffline() {   

    //fazer a tabela
    var playerscore = parseInt(localStorage.getItem("pontosjogador"));
    var aiscore = parseInt(localStorage.getItem("pontosai"));

    var njogos = playerscore + aiscore;

    const rankingContainer = document.getElementById('resultadosubmit');

    rankingContainer.innerHTML = "";
    rankingContainer.innerHTML="Nota: independente do tamanho do tabuleiro.";

    // criar tabela
    const table = document.createElement('table');
    table.id = "tabelaresultados";

    // primeira linha
    const headerRow = document.createElement('tr');
    const headers = ['Nick', 'Games', 'Victories'];

    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });

    table.appendChild(headerRow);

    //outras duas linhas
    const row1 = document.createElement('tr');

        const nickpCell = document.createElement('td');
        nickpCell.id = "nickp";
        nickpCell.textContent = "Player";

        const gamesCell = document.createElement('td');
        gamesCell.id = "gamesp";
        gamesCell.textContent = njogos;

        const victoriespCell = document.createElement('td');
        victoriespCell.id = "victoriesp";
        victoriespCell.textContent = playerscore;

        //console.log(playerscore);

        // Append cells to the row
        row1.appendChild(nickpCell);
        row1.appendChild(gamesCell);
        row1.appendChild(victoriespCell);

        // Append the row to the table
    table.appendChild(row1);

    const row2 = document.createElement('tr');

        const nickaiCell = document.createElement('td');
        nickaiCell.id = "nickai";
        nickaiCell.textContent = "AI";

        const gamesCell2 = document.createElement('td');
        gamesCell2.id = "gamesai";
        gamesCell2.textContent = njogos;

        const victoriesaiCell = document.createElement('td');
        victoriesaiCell.id = "victoriesai";	
        victoriesaiCell.textContent = aiscore;

        // Append cells to the row
        row2.appendChild(nickaiCell);
        row2.appendChild(gamesCell2);
        row2.appendChild(victoriesaiCell);

        // Append the row to the table
    table.appendChild(row2);

    rankingContainer.appendChild(table);

}



function onClick() {
    if (vencedor != 0) {
        return;
    }

    //converter id para par de coordenadas
    coords = this.id.split(",");
    r = parseInt(coords[0]);
    c = parseInt(coords[1]);

    info = document.getElementById("info");
    s = "";


    // senão, o jogo é contra outro jogador
    //fase de por as peças

    // se o número total de peças for 24, a fase de por peças acaba
    ////console.log("pecas: " + pecas[0] + " " + pecas[1]);
    if (pecas[0] + pecas[1] == 24) {
        fase1 = false;
    }

    if(!vsAI){
        if(turn == nome){
            notify(r,c);
        }
    }

    if (vsAI && jogAtual == 2) {

        if (diff == 0) {
            randomAI();
        }
        if (diff == 1) {
            //console.log("antes da AI jogar: " + contarPecas());
            AI2();
            //console.log("depois da AI jogar: " + contarPecas());
        }
        if (diff == 2) {
            AI3();
        }
    }

    if (vsAI){
        if (fase1) {
            ////console.log("fase1: " + fase1 + "do jogador: " + jogAtual);
            // se a jogada for válida
            ////console.log("numero de peças antes de podecolocar: " + pecas[0] + " " + pecas[1]);
            if (PodeColocar(r, c, jogAtual, 0, 0, board)) {
    
    
                // colocar a peça
                board[r][c] = parseInt(jogAtual.toString());
    
                // atualizar o número de peças do jogador
                pecas[jogAtual - 1]++;
    
                // remover peça do lado
                document.getElementById(jogAtual.toString() + (13 - pecas[jogAtual - 1]).toString()).style.display = "none";
    
                // trocar de jogador
                trocaJogador();
    
                // atualizar aspeto do tabuleiro
                atualizarTab();
    
    
    
                // se o número total de peças for 24, a fase de por peças acaba
                ////console.log("pecas: " + pecas[0] + " " + pecas[1]);
                if (pecas[0] + pecas[1] == 24) {
                    fase1 = false;
                    // primeiro prompt para selecionar uma peça e começar a move phase
                    s = players[jogAtual - 1] + ": selecione uma peça";
                } else {
                    // se não, continua a fase de por peças
                    s = players[jogAtual - 1] + ": insira uma peça";
                }
    
            } else {
                s = "Jogada inválida"
            }
        }
    
        //fase de mover as peças
        else {
    
            // se nenhuma peça estiver selecionada
            if (!selected) {
    
                //seleciona uma peça para mover
                if (podeEscolher(r, c, jogAtual)) {
                    selected = true;
                    ratual = r;
                    catual = c;
                    tile = document.getElementById(r.toString() + "," + c.toString());
    
                    // troca o aspeto da peça selecionada
                    if (board[r][c] === 1 || board[r][c] === 2) {
                        playerIndex = board[r][c] - 1;
    
                        // remove a classe da peça e adiciona a classe da peça selecionada
                        tile.classList.remove(playerClassNames[playerIndex]);
                        tile.classList.add(selectedClassNames[playerIndex]);
                    }
                    s = players[jogAtual - 1] + ": mova a peça";
                } else {
                    s += "Não pode selecionar essa peça (jogador errado ou casa vazia)";
                }
    
                // se uma peça estiver selecionada
            } else {
    
                // caso a jogada anterior tenha levado a uma remoção de peça
                if (remover) {
    
                    //remover a peça
                    if (board[r][c] == outroJogador()) {
                        board[r][c] = 0;
    
                        trocaJogador();
    
                        // subtrair uma peça ao número total de peças do jogador
                        pecas[jogAtual - 1]--;
    
                        document.getElementById(jogAtual.toString() + (13 - pecas[jogAtual - 1]).toString()).style.display = "block";
                        selected = false;
                        remover = false;
                        atualizarTab();
                        s = players[jogAtual - 1] + ": selecione uma peça";
                        verVitoria();
                    } else {
                        s += "Não pode remover essa peça";
                    }
                } else {
                    // mover a peça
                    if (r == ratual && c == catual) {
    
                        //descelecionar a peça atual
                        selected = false;
                        tile = document.getElementById(r.toString() + "," + c.toString());
    
    
                        if (board[r][c] === 1 || board[r][c] === 2) {
                            playerIndex = board[r][c] - 1;
                            tile.classList.remove(selectedClassNames[playerIndex]);
                            tile.classList.add(playerClassNames[playerIndex]);
                        }
    
                        s = players[jogAtual - 1] + ": selecione uma peça";
    
                    } else {
    
                        if (
                            board[r][c] == 0 &&
                            !MovimentoRepetido(ls1, ls2, r, c, ratual, catual, jogAtual) && PodeMover(r, c, ratual, catual)
                        ) {
                            board[r][c] = jogAtual;
    
                            rwtf = r; // vou ser honesto
                            cwtf = c; // por algum motivo sem estes dois
    
                            ////console.log("a peça foi para " + r + " " + c);
                            board[ratual][catual] = 0;
                            if (jogAtual == 1) {
                                ls1[0] = r;
                                ls1[1] = c;
                                ls1[2] = ratual;
                                ls1[3] = catual;
                            } else {
                                ls2[0] = r;
                                ls2[1] = c;
                                ls2[2] = ratual;
                                ls2[3] = catual;
                            }
    
                            rwtf = r; // o JS passa para a função verLinhas
                            cwtf = c; // os valores 5 e 6, sempre
    
                            atualizarTab();
    
                            if (verLinhas(rwtf, cwtf, jogAtual, board)) {
                                s = players[jogAtual - 1] + ": remova uma peça";
                                remover = true;
                            } else {
                                trocaJogador();
                                selected = false;
                                verVitoria();
                                s = players[jogAtual - 1] + ": selecione uma peça";
                            }
                        } else {
                            s += "Não pode mover a peça para essa casa (casa ocupada ou jogada inválida)";
                        }
                    }
                }
            }
        }
    
    
    
        if (vencedor == 0) {
            info.innerText = s;
            var tempoAtual = Date.now() - tempoInicio;
            document.getElementById("tempo").innerText = formatarTempo(tempoAtual);
            document.getElementById("pecasRecolhidas1").innerText = 12 - pecas[0];
            document.getElementById("pecasRecolhidas2").innerText = 12 - pecas[1];
            document.getElementById("movimentosJogador1").innerText = movimentosJogador1;
            document.getElementById("movimentosJogador2").innerText = movimentosJogador2;
        } else {
            info.innerText = "";
        }
    }

}




//Programaçao das AI

function randomAI() {
    if (fase1) {
        validmoves = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (PodeColocar(i, j, jogAtual, 0, 0, board)) {
                    validmoves.push([i, j]);
                    ////console.log("valid move: " + i + " " + j);
                }
            }
        }
        ////console.log("valid moves: " + validmoves);
        move = validmoves[Math.floor(Math.random() * validmoves.length)];
        ////console.log("move: " + move);
        r = move[0];
        c = move[1];
        board[r][c] = parseInt(jogAtual.toString());
        pecas[jogAtual - 1]++;
        document.getElementById(jogAtual.toString() + (13 - pecas[jogAtual - 1]).toString()).style.display = "none";
        atualizarTab();
        trocaJogador();
        ////console.log("jogador trocado");
        if (pecas[0] + pecas[1] == 24) {
            fase1 = false;
            s = players[jogAtual - 1] + ": selecione uma peça";
        } else {
            s = players[jogAtual - 1] + ": insira uma peça";
        }

    } else {

        if (remover) {

            //remover a peça
            validmoves = [];
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    if (board[i][j] == outroJogador()) {
                        validmoves.push([i, j]);
                        ////console.log("valid removes: " + i + " " + j);
                    }
                }
            }

            move = validmoves[Math.floor(Math.random() * validmoves.length)];
            board[move[0]][move[1]] = 0;
            trocaJogador();

            // subtrair uma peça ao número total de peças do jogador
            pecas[jogAtual - 1]--;

            document.getElementById(jogAtual.toString() + (13 - pecas[jogAtual - 1]).toString()).style.display = "block";
            remover = false;
            atualizarTab();
            verVitoria();
            s = players[jogAtual - 1] + ": selecione uma peça";

        } else {
            validmoves = [];
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    for (let ia = 0; ia < rows; ia++) {
                        for (let ja = 0; ja < columns; ja++) {
                            if (
                                board[i][j] == jogAtual &&
                                board[ia][ja] == 0 &&
                                !MovimentoRepetido(ls1, ls2, ia, ja, i, j, jogAtual) &&
                                PodeMover(ia, ja, i, j)
                            ) {
                                validmoves.push([i, j, ia, ja]);
                                ////console.log("valid removes: de " + i + " " + j + " para " + ia + " " + ja);
                            }
                        }
                    }
                }
            }
            move = validmoves[Math.floor(Math.random() * validmoves.length)];

            board[move[2]][move[3]] = jogAtual;
            board[move[0]][move[1]] = 0;

            ////console.log("remover peça de " + move[0] + " " + move[1]);
            ////console.log("a peça foi para " + move[2] + " " + move[3]);

            ls2[0] = move[2];
            ls2[1] = move[3];
            ls2[2] = move[0];
            ls2[3] = move[1];

            atualizarTab();

            if (verLinhas(move[2], move[3], jogAtual, board)) {
                s = players[jogAtual - 1] + ": remova uma peça";
                remover = true;
            } else {
                trocaJogador();
                verVitoria();
                s = players[jogAtual - 1] + ": selecione uma peça";
            }
        }
    }
    document.getElementById("info").innerText = s;
}


function AI2() {

    if (fase1) {
        move = [];
        pontos = -1;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (PodeColocar(i, j, jogAtual, 0, 0, board)) {
                    a = heuristica(i, j);
                    if (a > pontos) {
                        move = [i, j];
                        pontos = a;
                    }
                }
            }
        }

        ////console.log("move: " + move);
        r = move[0];
        c = move[1];
        board[r][c] = parseInt(jogAtual.toString());
        pecas[jogAtual - 1]++;
        document.getElementById(jogAtual.toString() + (13 - pecas[jogAtual - 1]).toString()).style.display = "none";
        atualizarTab();
        jogAtual = 1;
        ////console.log("jogador trocado");
        if (pecas[0] + pecas[1] == 24) {
            fase1 = false;
            s = players[jogAtual - 1] + ": selecione uma peça";
        }
        else {
            s = players[jogAtual - 1] + ": insira uma peça";
        }

    } else {

        if (remover) {

            //remover a peça
            move = [];
            pontos = -1;
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    if (board[i][j] == outroJogador()) {
                        a = heuristica(i, j);
                        if (a > pontos) {
                            move = [i, j];
                            pontos = a;
                        }
                    }
                }
            }

            board[move[0]][move[1]] = 0;
            trocaJogador();

            // subtrair uma peça ao número total de peças do jogador
            pecas[jogAtual - 1]--;

            document.getElementById(jogAtual.toString() + (13 - pecas[jogAtual - 1]).toString()).style.display = "block";
            remover = false;
            atualizarTab();
            verVitoria();
            s = players[jogAtual - 1] + ": selecione uma peça";

        } else {
            move = [];
            points = -1;
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    for (let ia = 0; ia < rows; ia++) {
                        for (let ja = 0; ja < columns; ja++) {
                            if (
                                board[i][j] == jogAtual &&
                                board[ia][ja] == 0 &&
                                !MovimentoRepetido(ls1, ls2, ia, ja, i, j, jogAtual) &&
                                PodeMover(ia, ja, i, j)
                            ) {
                                a = heuristica(ia, ja);
                                if (a > points) {
                                    move = [i, j, ia, ja];
                                    points = a;
                                }
                            }
                        }
                    }
                }
            }

            board[move[2]][move[3]] = jogAtual;
            board[move[0]][move[1]] = 0;

            ////console.log("remover peça de " + move[0] + " " + move[1]);
            ////console.log("a peça foi para " + move[2] + " " + move[3]);

            ls2[0] = move[2];
            ls2[1] = move[3];
            ls2[2] = move[0];
            ls2[3] = move[1];

            atualizarTab();

            if (verLinhas(move[2], move[3], jogAtual, board)) {
                s = players[jogAtual - 1] + ": remova uma peça";
                remover = true;


                //se for ai tem de remover sem ser preciso clicar
                if (jogAtual == 2) {
                    //console.log("E A AI A REMOVER UMA PEÇA")
                    AI2();
                }

            } else {
                trocaJogador();
                verVitoria();
                s = players[jogAtual - 1] + ": selecione uma peça";
            }
        }
    }
    document.getElementById("info").innerText = s;
}

function AI3() {
    // its minmax time AHAHAHHAHA
    //console.log("AI3 called");
    depth = 3;
    move = [];
    points = -1;
    if (fase1) {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {

                if (PodeColocar(i, j, jogAtual, 0, 0, board)) {
                    board[i][j] = jogAtual;
                    val = minmax(board, depth, false);
                    board[i][j] = 0;
                    if (val > points) {
                        points = val;
                        move = [i, j];
                    }
                }
            }
        }
        r = move[0];
        c = move[1];
        board[r][c] = parseInt(jogAtual.toString());
        pecas[jogAtual - 1]++;
        document.getElementById(jogAtual.toString() + (13 - pecas[jogAtual - 1]).toString()).style.display = "none";
        atualizarTab();
        trocaJogador();
        if (pecas[0] + pecas[1] == 24) {
            fase1 = false;
            s = players[jogAtual - 1] + ": selecione uma peça";
        }
        else {
            s = players[jogAtual - 1] + ": insira uma peça";
        }
    } else {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {

                for (let ia = 0; ia < rows; ia++) {
                    for (let ja = 0; ja < columns; ja++) {
                        if (
                            board[i][j] == jogAtual &&
                            board[ia][ja] == 0 &&
                            !MovimentoRepetido(ls1, ls2, ia, ja, i, j, jogAtual) &&
                            PodeMover(ia, ja, i, j)
                        ) {
                            board[ia][ja] = jogAtual;
                            board[i][j] = 0;
                            val = minmax(board, depth, false);
                            board[ia][ja] = 0;
                            board[i][j] = jogAtual;
                            if (val > points) {
                                points = val;
                                move = [i, j, ia, ja];
                            }
                        }
                    }
                }
            }
        }
        board[move[2]][move[3]] = jogAtual;
        board[move[0]][move[1]] = 0;

        ////console.log("remover peça de " + move[0] + " " + move[1]);
        ////console.log("a peça foi para " + move[2] + " " + move[3]);

        ls2[0] = move[2];
        ls2[1] = move[3];
        ls2[2] = move[0];
        ls2[3] = move[1];

        atualizarTab();

        if (verLinhas(move[2], move[3], jogAtual, board)) {
            s = players[jogAtual - 1] + ": remova uma peça";
            remover = true;
        } else {
            trocaJogador();
            verVitoria();
            s = players[jogAtual - 1] + ": selecione uma peça";
        }
    }
    document.getElementById("info").innerText = s;

}

function copyBoard(board) {
    //console.log("copyBoard called");
    newBoard = [];
    for (let i = 0; i < rows; i++) {
        row = [];
        for (let j = 0; j < columns; j++) {
            row.push(board[i][j]);
        }
        newBoard.push(row);
    }
    return newBoard;
}

function minmax(board, depth, maximizingPlayer) {
    move = [];
    //console.log("minmax called");
    if (depth == 0) {
        return heuristica(rwtf, cwtf);
    }
    if (fase1) {
        if (maximizingPlayer) {
            maxEval = -Infinity;
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {

                    if (PodeColocar(i, j, jogAtual, 0, 0, board)) {
                        board[i][j] = jogAtual;
                        val = minmax(board, depth - 1, false);
                        board[i][j] = 0;
                        if (val > maxEval) {
                            maxEval = val;
                            move = [i, j];
                        }
                    }
                }
            }
            return maxEval;
        } else {
            minEval = Infinity;
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {

                    if (PodeColocar(i, j, outroJogador(), 0, 0, board)) {
                        board[i][j] = outroJogador();
                        val = minmax(board, depth - 1, true);
                        if (val < minEval) {
                            minEval = val;
                            move = [i, j];
                        }
                        board[i][j] = 0;
                    }
                }
            }
            return minEval;
        }
    } else {
        if (maximizingPlayer) {
            maxEval = -Infinity;
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {

                    for (let ia = 0; ia < rows; ia++) {
                        for (let ja = 0; ja < columns; ja++) {
                            if (
                                board[i][j] == jogAtual &&
                                board[ia][ja] == 0 &&
                                !MovimentoRepetido(ls1, ls2, ia, ja, i, j, jogAtual) &&
                                PodeMover(ia, ja, i, j)
                            ) {
                                board[ia][ja] = jogAtual;
                                board[i][j] = 0;
                                val = minmax(board, depth - 1, false);
                                board[ia][ja] = 0;
                                board[i][j] = jogAtual;
                                if (val > maxEval) {
                                    maxEval = val;
                                    move = [i, j, ia, ja]; // de ij, para ia ja
                                }
                            }
                        }
                    }
                }
            }
            return maxEval;
        } else {
            minEval = Infinity;
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {

                    for (let ia = 0; ia < rows; ia++) {
                        for (let ja = 0; ja < columns; ja++) {
                            if (
                                board[i][j] == outroJogador() &&
                                board[ia][ja] == 0 &&
                                !MovimentoRepetido(ls1, ls2, ia, ja, i, j, outroJogador()) &&
                                PodeMover(ia, ja, i, j)
                            ) {
                                board[ia][ja] = outroJogador();
                                board[i][j] = 0;
                                val = minmax(board, depth - 1, true);
                                board[ia][ja] = 0;
                                board[i][j] = outroJogador();
                                if (val < minEval) {
                                    minVal = val;
                                    move = [i, j, ia, ja]; // de ij, para ia ja
                                }
                            }
                        }
                    }
                }
            }
            return minEval;
        }
    }
}

function heuristica(r, c) {
    var pontos = 0;
    ////console.log("heuristica chamada");
    ////console.log("a ver: " + jogAtual + " em " + r + c);
    // se faz um 3 em linha, ganha 100 pontos
    if (verLinhas(r, c, jogAtual, board)) {
        pontos += 100;
    }

    moves = [
        [-1, 0], // Move up
        [1, 0],  // Move down
        [0, -1], // Move left
        [0, 1]   // Move right
    ];

    for ([dx, dy] of moves) {
        newRow = r + dx;
        newCol = c + dy;

        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < columns) {

            // compare the ls2 with the new position
            if (MovimentoRepetido(ls1, ls2, newRow, newCol, ratual, catual, jogAtual)) {
                pontos -= 100;
            }


            // se for peça do jogador, ganha 10 pontos
            if (board[newRow][newCol] == jogAtual) {
                pontos += 10;
            }

            // se for peça do adversário, ganha 10 pontos

            if (board[newRow][newCol] == outroJogador()) {
                pontos += 5;
            }

        }
    }
    ////console.log("em " + r + c + " heuristica: " + pontos);

    ////console.log("em " + r + c + " heuristica: " + pontos);
    return pontos;

}

function jogarnovamente() {
    document.getElementById('estatisticas').style.display = 'none';
    if(vsAI){
        console.log("desistir chamado");
        desistir();
    }    
}
// const url = "http://localhost:8008/";
const url = "https://twserver.alunos.dcc.fc.up.pt:8008/";

// alterar url consoante segunda ou terceira parte do trabalho

var nome;
var pass;
var logged = false;
var ingame = false;
var idjogo;
var turn;
var phase;
var color;
var pecasmnb = [0,0];

var eventSrc = null; // event source para o update durante o jogo, é fechado no leave

if (self.fetch) {
    console.log("tem suporte")
}
else {
    console.log("nao tem suporte")
}


function login() {
    let tipoerro;
    var loginresponse = document.getElementById("loginmessage");

    if (logged) {
        loginresponse.innerText = "You are already logged in!"
        return;
    }

    // Get values from the form
    nome = document.getElementById("uname").value;
    pass = document.getElementById("psw").value;

    // Create an object with the login data
    const loginData = {
        nick: nome,
        password: pass
    };


    if (nome == "" || pass == "") {
        loginresponse.innerText = "Please insert a nick and the password";
        //document.body.appendChild(loginresponse);
        return;
    }




    // Make a POST request to the server
    fetch(url + "register", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    })


        .then(response => {
            //promessa = response.json();
            //console.log(promessa);

            if (response.ok) {
                // Login successful
                console.log('Login successful');
                loginresponse.innerText = "Sucessul login";
                //document.body.appendChild(loginresponse);
                logged = true;
                return response.json();
            } else {
                // Login failed
                console.log('Login failed');
                return response.json().then(errorData => {
                    throw new Error(errorData.error || 'Login failed');
                });
            }

        }
        )

        .then(data => {
            // Handle the successful response data
            console.log(data);
        })

        .catch(error => {
            // Handle errors
            tipoerro = error.message
            console.log('Error:' + tipoerro);
            loginresponse.innerText = tipoerro;
            //document.body.appendChild(loginresponse);
        });

}




//FAZER FUNCAO DE LOGOUT E TROCAR logged=false

async function join() {
    var joinmessages = document.getElementById("info");
    console.log("join chamado");

    if (logged == false) {
        joinmessages.innerText = "Please login first.";
        return false;
    }

    if (ingame == true) {
        joinmessages.innerText = "You are already in a game.";
        return false;
    }

    const size = {
        rows: rows,
        columns: columns
    };

    const joinData = {
        group: 2,
        nick: nome,
        password: pass,
        size
    };


    try {
        const response = await fetch(url + "join", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(joinData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        else {
            joinmessages.innerText = "Waiting for opponent."
        }

        const { game } = await response.json();
        idjogo = game;
        console.log(game);
        showGame();
        update(nome, game);
        


    } catch (error) {
        console.error('Error:', error);
        joinmessages.innerText = error.message;
    }

}

async function update(nome, token) {

    if (eventSrc == null) {
        eventSrc = new EventSource(url + "update?nick=" + nome + "&game=" + token);
    }
    

    eventSrc.onmessage = function (event) {
        const data = JSON.parse(event.data);
        console.log(data);

        phase = data.phase;
        turn = data.turn;

        if (data.hasOwnProperty("winner")) {
            console.log("winner");
            if (data.winner == nome) {
                document.getElementById("info").innerText = "Ganhaste!";
            }
            else {
                document.getElementById("info").innerText = "Perdeste!";
            }
            document.querySelector("#desistirjogo").innerHTML = "Voltar";
            document.querySelector("#desistirjogo").innerText = "Voltar";
            document.querySelector("#desistirjogo").textContent = "Voltar";
            document.getElementById('formgrande').style.display = 'block';
            document.getElementById('miniboards').style.display = 'none';
            leave();
            
            return;
        }

        colors = data.players;
        // save the color of the nick player
        for (i = 0; i < colors.length; i++) {
            if (colors[i].nick === nome) {
                color = colors[i].color;
            }
        }
        if (data.turn == nome) {
            document.getElementById("info").innerText = "É a tua vez!";
            document.getElementById("hourglasscanvas").style.display = "none";
        } else {
            document.getElementById("info").innerText = "É a vez do adversário!";
            document.getElementById("hourglasscanvas").style.display = "block";
        }

        aboard = data.board;

        // reset miniboards
        for (i = 1; i <= 12; i++) {
            document.getElementById("1" + i.toString()).style.display = "block";
            document.getElementById("2" + i.toString()).style.display = "block";
        }

        ib = 0;
        iw = 0;

        for (r = 0; r < aboard.length; r++) {
            for (c = 0; c < aboard[0].length; c++) {

                str = aboard[r][c].toString();
                //console.log(str);
                if (str == "black") {
                    ib = ib + 1;
                    board[r][c] = 1;
                    document.getElementById("1" + (13 - ib).toString()).style.display = "none";
                }
                if (str == "white") {
                    board[r][c] = 2;
                    iw = iw + 1;
                    document.getElementById("2" + (13 - iw).toString()).style.display = "none";
                }
                if (str == "empty") {
                    board[r][c] = 0;
                }
            }
        }

        atualizarTab();

    }
}

async function notify(r, c) {
    console.log("notify chamado");
    const notifyData = {
        nick: nome,
        password: pass,
        game: idjogo,
        move: { "row": r, "column": c }
    };

    console.log(notifyData);

    try {
        const response = await fetch(url + "notify", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notifyData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

    }

    catch (error) {
        console.error('Error:', error);

    }
}

async function leave() {
    leavemessages = document.getElementById("info");
    console.log("leave chamado");

    if (logged == false) {
        leavemessages.innerText = "Please login first.";
        document.body.appendChild(leavemessages);
        return;
    }

    if (eventSrc != null) {
        eventSrc.close();
        eventSrc = null;
        console.log("event fechado")
    }

    if(ingame==true){
        var estatisticasDiv = document.getElementById('estatisticas');
        estatisticasDiv.style.display = 'block';
    }
    
    ingame=false;

    const leaveData = {
        nick: nome,
        password: pass,
        game: idjogo
    };


    try {
        const response = await fetch(url + "leave", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leaveData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        else {
            idjogo = null;
            ingame=false;
            
        }
        console.log("ingame = "+ingame);
    }

    catch (error) {
        //console.log("o erro vem do leave");
        console.error('Error:', error);

    }
   }



async function ranking() {

    console.log("ranking chamado")

    var tam = document.getElementById("classificacoes").value;

    const rankData = {
        "group": 2,
        "size": {
            "rows": parseInt(tam),
            "columns": 6
        }
    };

    console.log(rankData);

    try {
        const response = await fetch(url + "ranking", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rankData),
        });

        //promessa = response.json();
        //console.log(promessa);

        if (response.ok) {
            const { ranking } = await response.json();
            console.log("rankings:" + ranking);
            construirtabela(ranking);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'failed');
        }


    } catch (error) {
        var errorank = error.message
        console.log('Error: ' + errorank);
    }

}

function construirtabela(ranking) {
    const rankingContainer = document.getElementById('resultadosubmit');
    rankingContainer.style.display = 'none';
    rankingContainer.style.display = 'block';

    // limpar tabela
    rankingContainer.innerHTML = "";

    // criar tabela
    const table = document.createElement('table');
    table.id = 'tabelaresultados';

    // primeira linha
    const headerRow = document.createElement('tr');
    const headers = ['Nick', 'Games', 'Victories'];

    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });

    table.appendChild(headerRow);

    // criar as outras linhas
    ranking.forEach(item => {
        const row = document.createElement('tr');

        const nickCell = document.createElement('td');
        nickCell.textContent = item.nick;

        const gamesCell = document.createElement('td');
        gamesCell.textContent = item.games;

        const victoriesCell = document.createElement('td');
        victoriesCell.textContent = item.victories;

        // Append cells to the row
        row.appendChild(nickCell);
        row.appendChild(gamesCell);
        row.appendChild(victoriesCell);

        // Append the row to the table
        table.appendChild(row);
    });

    // Append the table to the container
    rankingContainer.appendChild(table);
}


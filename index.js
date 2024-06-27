const http = require('http');
const url = require('url');
const fs = require('fs');
require('./server/criptography.js'); // modulo de metodos de encriptação
require('./server/global.js'); // modulo de variáveis globais e headers

function resetNotifyTimer() {
	if (notifyTimer) {
		clearTimeout(notifyTimer);
	}
	notifyTimer= setTimeout (() => {
		//enviar ao cliente o update de quem ganhou
	}, 12000);
}

const server = http.createServer(function (request, response) {

	const parsedUrl = url.parse(request.url, true);
	const path = parsedUrl.path;
	const query = parsedUrl.query;

	// console.log(request.method);
	// console.log(path);

	resetNotifyTimer();

	switch (request.method) {

		case 'OPTIONS':
			// console.log("entrei no options");
			response.writeHead(200, HeaderOptions);
			response.end();
			break;

		case 'OPTIONS':
			// console.log("entrei no options");
			response.writeHead(200, HeaderOptions);
			response.end();
			break;

		case 'GET': // método GET para o SSE
			response.writeHead(200, HeadersSSE);

			switch (path) {
				case '/update':

					// aqui viria o código para atualizar os clientes quanto ao estado do jogo
					// ...

					break;
			}
			break;

		case 'POST':
			let body = '';
			switch (path) {

				case '/register':
					// console.log("entrei no register");
					request
						.on('data', (chunk) => { body += chunk; })
						.on('end', () => {
							try {
								let dados = JSON.parse(body);
								let nick = dados.nick;
								let password = dados.password;
								// console.log("data: " + nick + " " + password)
								const usersFilePath = './data/users.json';

								// ler o ficheiro de users e guardar os users num dicionário
								fs.readFile(usersFilePath, 'utf8', (err, data) => {
									// console.log("entrei no readfile");
									if (err) {
										if (err.code === 'ENOENT') {
											// se o ficheiro não existir, criar um novo com o formato correto
											fs.writeFile(usersFilePath, JSON.stringify(users), (err) => {
												if (err) {
													console.error('Error creating file:', err);
												}
											});
										}
									} else {
										// o file já existe, ler os users
										users = JSON.parse(data);
										if (users == (null || undefined)) users = {};
										// console.log("users:" + users);
									}

									let exists = users.hasOwnProperty(nick);
									let encodedPass = "null";

									// encriptar a password do user antes de a usar para comprarar
									// provavelmente não é a maneira mais segura de fazer isto
									if (exists) {
										encodedPass = encrypt(password);
									}

									let correctPassword = exists && users[nick] === encodedPass;
									// console.log("correctPassword: " + correctPassword);

									if (exists && correctPassword) {
										console.log("User " + nick + " already registered, logging in");
										response.writeHead(200, HeaderOptions);
										response.write(JSON.stringify({}));
										response.end();
									} else if (exists && !correctPassword) {
										console.log("User " + nick + " already registered with a different password, login denied");
										response.writeHead(400, HeaderOptions);
										response.write(JSON.stringify({ "error": "User registered with a different password" }));
										response.end();
									} else if (!exists) {
										console.log("User " + nick + " not registered, registering");
										users[nick] = encodedPass;
										fs.writeFile(usersFilePath, JSON.stringify(users), (err) => {
											if (err) {
												console.error('Error writing file:', err);
											}
										});
										response.writeHead(200, HeaderOptions);
										response.write(JSON.stringify({}));
										response.end();
									}



								});

							} catch (err) {
								console.log(err);
							}
						})
						.on('error', (err) => {
							console.log(err.message);
						});
					break;

				case "/join":
					request
						.on('data', (chunk) => { body += chunk; })
						.on('end', () => {
							try {
								let dados = JSON.parse(body);
								let nick = dados.nick;
								let password = dados.password;
								let size = JSON.stringify(dados.size).toString();
								// console.log(size);

								if (users[nick] != encrypt(password)) {
									response.writeHead(400, HeadersSSE);
									response.write(JSON.stringify({ "error": "User registered with a different password" }));
									response.end();
									return;

								}
								if ((size in gameQueue)) { // se já houver alguém à espera de um jogo com o mesmo tamanho

									if (gameQueue[size].length > 0) {

										let gameQueued = gameQueue[size].pop();

										let gameid = gameQueued.game;
										let encodedid = encrypt(gameid);

										console.log("User " + nick + " joined game " + encodedid);

										response.writeHead(200, HeadersSSE); // cors headers porque é  com SSE
										response.write(JSON.stringify({ 'game': encodedid }));
										response.end();

										ingame[encodedid] = [ingame[encodedid][0],nick];

										// ir buscar o jogo à lista de jogos
										// ...
										// lógica para iniciar o jogo com o player1 e o player2
										// ...

										return;
									}
									else { // não há ninguém à espera de um jogo com o mesmo tamanho

										let gameid = 'daraGame' + gamesCreated; // crio id para o jogo
										gamesCreated++;

										gameQueue[size].push({ 'game': gameid, 'nick': nick }); // adiciono o jogo à fila de espera
										let encodedid = encrypt(gameid); // encripto o id do jogo

										console.log("User " + nick + " created game " + encodedid);

										ingame[encodedid] = [nick,undefined];

										// lógica para criar um jogo novo
										// ...

										response.writeHead(200, HeadersSSE);
										response.write(JSON.stringify({ 'game': encodedid })); // envio o id do jogo para o cliente
										response.end();
										return;
									}
								}
								else { // se não houver ninguém à espera de um jogo de QUALQUER tamanho
									let gameid = 'daraGame' + gamesCreated; // crio id para o jogo
									gamesCreated++;

									gameQueue[size].push({ 'game': gameid, 'nick': nick }); // adiciono o jogo à fila de espera
									let encodedid = encrypt(gameid); // encripto o id do jogo

									console.log("User " + nick + " created game " + encodedid);

									// lógica para criar um jogo novo
									// ...

									response.writeHead(200, HeadersSSE);
									response.write(JSON.stringify({ 'game': encodedid })); // envio o id do jogo para o cliente
									response.end();
									return;
								}
							}
							catch (err) {
								console.log(err);
							}
						})
					break;

				case "/ranking":
					request
						.on('data', (chunk) => { body += chunk; })
						.on('end', () => {
							try {
								let dados = JSON.parse(body);
								let size = dados.size;
								let rows = size.rows;
								let columns = size.columns;
								let group = dados.group;

								let board = rows + "x" + columns;

								let games;
								const path = './data/rankings/'+ group + '.json';

								try {
									// ler o ficheiro de rankings do grupo dado
										const data = fs.readFileSync(path, 'utf8');
									games = JSON.parse(data);
									// console.log(games);

								} catch (err) {
									if (err.code === 'ENOENT') {
											// caso o ficheiro não exista, criar um novo com o formato correto
										games = {
											"5x6": {
												rankings: []
											},
											"6x6": {
												rankings: []
											}
										}
										fs.writeFileSync(path, JSON.stringify(games), 'utf8');
									}
								}

								let rankings = games[board];

								console.log("User checking rankings for " + path );
								// console.log(rankings);

								rankings = Object.keys(rankings).map(function (key) {
									return rankings[key];
								}); // remover as keys do objecto e ficar só com o array de rankings

								rankings = rankings[0]; // como o array vem dentro de outro array, ficar só com o primeiro elemento

									rankings.sort(function (a, b) {
									return b["victories"] - a["victories"];
								}); // ordenar por vitórias

									rankings = rankings.slice(0, 10); // ficar só com os 10 primeiros para enviar para o cliente

								// console.log(rankings);

								response.writeHead(200, HeaderOptions);
								response.write(JSON.stringify({ "ranking": rankings }));
								response.end();
							}
							catch (err) { console.log(err); }
						})
					break;

				case "/leave":
						request
						.on('data', (chunk) => { body += chunk; })
						.on('end', () => {
							try{
								let dados = JSON.parse(body);
								let nick = dados.nick;
								let password = dados.password;
								let gameid = dados.game;

								if (users[nick] != encrypt(password)) { //se password/nick errados
									response.writeHead(400, HeadersSSE);
									response.write(JSON.stringify({ "error": "User registered with a different password" }));
									response.end();
									return;

								}

								if(!ingame.hasOwnProperty(encrypt(gameid))){ //se nao existe esse jogo
									response.writeHead(200, HeadersSSE);
									response.write(JSON.stringify({ "error": "Invalid game" }));
									response.end();
									return;
								}

								if(ingame[encrypt(gameid)][1]===undefined){ //se o jogo nao esta em curso (pessoa à espera)
									//apagar esta key do dicionario
									delete ingame[encrypt(gameid)];

									response.writeHead(200, HeadersSSE);
									response.write(JSON.stringify({}));
									response.end();
									return;
								} else{ //estao em jogo
									delete ingame[encrypt(gameid)];

									response.writeHead(200, HeadersSSE);
									response.write(JSON.stringify({}));
									response.end();
									return;
								}
						}
							catch (err) { console.log(err); }
						})

					break;

				case "/notify":										
						request
						.on('data',(chunk) => {
							body += chunk;
							gameUdpade= true;
						})
						.on('end',()=> {
							try{
								if (gameUpdate) { //chama o xxxx se não for enviado novo notify em 2min
									resetNotifyTimer();
								}

								// lógica para receber jogadas do cliente e atualizar o estado do jogo
								// ...
							} catch(err) {
								console.log(err);
							}
						})
					break;
			}
			break;

		default:
			response.writeHead(501, HeaderOptions); // 501 Not Implemented
			response.end();
	}
});


server.listen(8008);
function AbrirPopUp(event) {
    document.getElementById("myPopup").style.display = 'block';
}


function AparecerPergunta() {
    event.preventDefault();
    var x = document.getElementById('jogadores').value;
    if (x == 1) {
        document.getElementById('contracomputadorDiv').style.display = 'block'; // Show question 
    } else {
        document.getElementById('contracomputadorDiv').style.display = 'none'; // Hide question 
    }
}


function abrir(event){
    document.getElementById('painel').style.display = 'block';
}

function fechar(){
        document.getElementById('painel').style.display = 'none';
    
}

function fecharclass(){
    document.getElementById('myPopup').style.display = 'none';
}

async function mostrarvalores(event){
    event.preventDefault();
    
    if (document.getElementById("modojogo").value=="online"){
        ranking();
    }
    else{
        tabelaoffline();
    }
}


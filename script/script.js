let userName;
let participantSelected;
let participantSelectedClass;
let typeMessage;

startScreen();

function startScreen() {
    document.querySelector("body").innerHTML = `
        <main class="login-screen">
            <img src="./assets/logo_login.png" alt="logo">
            <input id="userName" type="text" placeholder="Digite seu nome" data-identifier="enter-name">
            <p class="error-message"></p>
            <button type="button" onclick="enterChat()" data-identifier="start">Entrar</button>
        </main>
    `;
    sendWithEnter();
}

function enterChat() {
    userName = document.getElementById("userName").value;
    
    if ((userName === "Todos") || (userName === "Todos "))
        errorMessage(userName);

    const promise = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants", {name:userName});
    loadingScreen();
    promise.then(chatScreen);
    promise.catch(errorMessage);
}

function loadingScreen() {
    document.querySelector("body").innerHTML = `
        <main class="loading-screen hidden">
            <img src="./assets/loading.gif" alt="carregando...">
            <p>carregando...</p>
        </main>
    `;
}

function chatScreen() {
    document.querySelector("body").innerHTML = `
        <main class="chat-screen">
            <header>
                <img src="./assets/logo_uol.png" alt="logo_uol" onclick="location.reload()">
                <ion-icon name="people-sharp" onclick="expandMenu()"></ion-icon>
            </header>

            <section class="messages">
            </section>

            <footer>
                <input id="userMessage" type="text" placeholder="Escreva aqui...">
                <button type="button" onclick="sendMessage()" data-identifier="send-message"><ion-icon name="paper-plane-outline"></ion-icon></button>
                <div class="private"></div>
            </footer>
        </main>

        <span class="overlay-screen hidden" onclick="expandMenu()"></span>
        <nav class="menu hidden">
            <h1>Escolha um contato para enviar mensagem:</h1>
            <ul class="participants"></ul>
            <h1>Escolha a visibilidade:</h1>
            <ul class="visibilities">
                <li class="visibility" data-identifier="visibility">
                    <div>
                        <ion-icon name="lock-open"></ion-icon>
                        Público
                    </div>
                    <ion-icon name="checkmark-sharp" class="hidden check"></ion-icon>
                </li>
                <li class="visibility" data-identifier="visibility">
                    <div>
                        <ion-icon name="lock-open"></ion-icon>
                        Reservadamente
                    </div>
                    <ion-icon name="checkmark-sharp" class="hidden"></ion-icon>
                </li>
            </ul>
        </nav>
    `;
    sendWithEnter();
    setInterval(keepConnection, 5000);
    fetchMessages();
    setInterval(fetchMessages, 3000);
    fetchParticipants();
    setInterval(fetchParticipants, 10000);
}

function errorMessage() {
    startScreen();
    document.querySelector(".error-message").innerHTML = `O nome de usuário já existe na sala ou não é válido. Tente outro!`;
}

function keepConnection(){
    const promise = axios.post("https://mock-api.driven.com.br/api/v4/uol/status", {name:userName});
}

function fetchMessages(){
    const promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");
    promise.then(showMessages);
}

function showMessages(response) {
    document.querySelector(".messages").innerHTML = "";
    response.data.forEach( participant => {
        if(participant.type === "status"){
            document.querySelector(".messages").innerHTML += `
                <article class="status-message" data-identifier="message">
                    <em>(${participant.time})</em> <strong>${participant.from}</strong> ${participant.text}
                </article>
            `;
        } else if ((participant.type === "message") && (participant.to === "Todos")) {
            document.querySelector(".messages").innerHTML += `
                <article class="displayed-message" data-identifier="message">
                    <em>(${participant.time})</em> <strong>${participant.from}</strong> para <strong>${participant.to}</strong>: ${participant.text}
                </article>
            `;
        } else if ((participant.type === "private_message") && ((participant.to === userName) || (participant.from === userName))) {
            document.querySelector(".messages").innerHTML += `
                <article class="private-message" data-identifier="message">
                    <em>(${participant.time})</em> <strong>${participant.from}</strong> reservadamente para <strong>${participant.to}</strong>: ${participant.text}
                </article>
            `;
        } 
    });
    document.querySelector(".messages").childNodes[document.querySelector(".messages").childNodes.length - 2].scrollIntoView();
}

function sendMessage() {
    const promise = axios.post("https://mock-api.driven.com.br/api/v4/uol/messages", { from: userName, to: participantSelected, text: document.getElementById("userMessage").value, type: typeMessage});
    document.getElementById("userMessage").value = "";
    promise.then(fetchMessages);
    promise.catch(() => location.reload());
}

function sendWithEnter() {
    document.querySelector("input").onkeydown = (e) => {
        if ((e.code === "Enter") && (document.querySelector("input").attributes[0].value === "userName")) {
            enterChat();
        }else if ((e.code === "Enter") && (document.querySelector("input").attributes[0].value === "userMessage")) {
            sendMessage();
        }
    };
}

function expandMenu() {
    document.querySelector(".overlay-screen").classList.toggle("hidden");
    document.querySelector(".menu").classList.toggle("hidden");
}

function fetchParticipants() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants");
    promise.then(showParticipants);
}

function showParticipants(response) {
    document.querySelector("ul").innerHTML = `
        <li class="participant" data-identifier="participant" onclick="selectParticipant(this)">
            <div>
                <ion-icon name="people-sharp"></ion-icon>
                <p class="all-participants">Todos</p>
            </div>
            <ion-icon name="checkmark-sharp" class="hidden check"></ion-icon>
        </li>
    `;

    response.data.forEach( participant => {
        document.querySelector("ul").innerHTML += `
            <li class="participant" data-identifier="participant" onclick="selectParticipant(this)">
                <div>
                    <ion-icon name="person-circle-sharp"></ion-icon>
                    <p class="private-participant">${participant.name}</p>
                </div>
                <ion-icon name="checkmark-sharp" class="hidden"></ion-icon>
            </li>
        `;
    });
    disableClick(response.data);
    checkActivity(response.data);
}

function selectParticipant(selected) {
    participantSelected = selected.childNodes[1].childNodes[3].innerText;
    participantSelectedClass = selected.childNodes[1].childNodes[3].attributes[0].value;

    if ((document.querySelector(".participant .check") !== null)) {
        document.querySelector(".participant .check").classList.remove("check");
        selected.childNodes[3].classList.add("check");

        if (participantSelectedClass == "private-participant"){
            document.querySelector(".visibilities").childNodes[1].childNodes[3].classList.remove("check");
            document.querySelector(".visibilities").childNodes[3].childNodes[3].classList.add("check");
            document.querySelector(".private").innerHTML = `Enviando para ${participantSelected} (reservadamente)`;
            typeMessage = "private_message";
        } else {
            document.querySelector(".visibilities").childNodes[3].childNodes[3].classList.remove("check");
            document.querySelector(".visibilities").childNodes[1].childNodes[3].classList.add("check");
            document.querySelector(".private").innerHTML = "";
            typeMessage = "message";
        }
    }
}

function checkActivity(participants) {
    let index = participants.findIndex(participant => participant.name === participantSelected);

    if (index !== -1) {
        selectParticipant(document.querySelector(".participants").childNodes[(index*2)+3]);
    } else {
        selectParticipant(document.querySelector(".participants").childNodes[1]);
    }
}

function disableClick(participants) {
    let index = participants.findIndex(participant => participant.name === userName);

    if (index !== -1)
        document.querySelector(".participants").childNodes[(index*2)+3].classList.add("disable-click");
}
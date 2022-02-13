let userName = undefined;
let userPrivate = undefined;

loginScreen();

function loginScreen() {
    document.querySelector('body').innerHTML = `
        <main class="login-screen">
            <img src="./assets/logo_login.png" alt="logo">
            <input id="userName" type="text" placeholder="Digite seu nome" data-identifier="enter-name">
            <button type="button" onclick="enterChat()" data-identifier="start">Entrar</button>
        </main>
    `;
    sendWithEnter();
}

function enterChat() {
    userName = document.getElementById("userName").value;
    const promise = axios.post('https://mock-api.driven.com.br/api/v4/uol/participants', {name:userName});
    loadingScreen();
    promise.then(chatScreen);
    promise.catch(errorMessage);
}

function loadingScreen() {
    document.querySelector('body').innerHTML = `
        <main class="loading-screen">
            <img src="./assets/loading.gif" alt="carregando...">
            <p>carregando...</p>
        </main>
    `;
}

function errorMessage() {
    document.querySelector('body').innerHTML = `
        <main class="login-screen">
            <img src="./assets/logo_login.png" alt="logo">

            <form>
                <input id="userName" type="text" placeholder="Digite seu nome" data-identifier="enter-name">
                <p>Digite outro nome, esse já está em uso!</p>
                <button type="button" onclick="enterChat()" data-identifier="start"> Entrar</button>
            </form>
        </main>
    `;
    sendWithEnter();

}

function chatScreen() {
    setInterval(keepConnection, 5000);

    document.querySelector('body').innerHTML = `
        <main class="chat-screen">
            <header>
                <img src="./assets/logo_uol.png" alt="logo_uol">
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
                <li class="visibility" data-identifier="visibility" onclick="selectContact(this)">
                    <div>
                        <ion-icon name="lock-open"></ion-icon>
                        Público
                    </div>
                    <ion-icon name="checkmark-sharp" class="hidden check"></ion-icon>
                </li>
                <li class="visibility" data-identifier="visibility" onclick="selectContact(this)">
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
    fetchMessages();
    fetchContact();
    setInterval(fetchMessages, 3000);
    setInterval(fetchContact, 10000);

}

function keepConnection(){
    const promise = axios.post('https://mock-api.driven.com.br/api/v4/uol/status', {name:userName});
}

function fetchMessages(){
    const promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");
    promise.then(filterMessages);
}

function filterMessages(response) {
    const messages = document.querySelector(".messages");
    messages.innerHTML = "";

    for (let i = 0; i < response.data.length; i++) {
        let from = response.data[i].from;
        let to = response.data[i].to;
        let text = response.data[i].text;
        let type = response.data[i].type;
        let time = response.data[i].time;

        if(type === "status"){
            messages.innerHTML += `
                <article class="status-message" data-identifier="message">
                    <em>(${time})</em> <strong>${from}</strong> ${text}
                </article>
            `;
        } else if ((type === "message") && (to === "Todos")) {
            messages.innerHTML += `
                <article class="displayed-message" data-identifier="message">
                    <em>(${time})</em> <strong>${from}</strong> para <strong>${to}</strong>: ${text}
                </article>
            `;
        } else if ((type === "private_message") && ((to === userName) || (from === userName))) {
            messages.innerHTML += `
                <article class="private-message" data-identifier="message">
                    <em>(${time})</em> <strong>${from}</strong> reservadamente para <strong>${to}</strong>: ${text}
                </article>
            `;
        } else {
            continue;
        }
    }
    messages.childNodes[messages.childNodes.length - 2].scrollIntoView();

}

function sendMessage() {    
    let typeMessage = "";
    if(userPrivate !== "Todos") {
        typeMessage = "private_message";
    } else {
        typeMessage = "message;"
    }

    const promise = axios.post('https://mock-api.driven.com.br/api/v4/uol/messages', { from: userName, to: userPrivate, text: document.getElementById("userMessage").value, type: typeMessage});

    document.getElementById("userMessage").value = "";

    promise.then(fetchMessages);
    promise.catch(() => {location.reload()});
}

function sendWithEnter() {
    document.querySelector("input").onkeydown =
    (e) => {
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

function fetchContact() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants");
    promise.then(filterContact);
}

function filterContact(response) {
    let participant = document.querySelector("ul");
    participant.innerHTML = `
        <li class="participant" data-identifier="participant" onclick="selectContact(this)">
            <div>
                <ion-icon name="people-sharp"></ion-icon>
                <p>Todos</p>
            </div>
            <ion-icon name="checkmark-sharp" class="hidden check"></ion-icon>
        </li>
    `;

    for (let i = 0; i < response.data.length; i++) {
        participant.innerHTML += `
            <li class="participant" data-identifier="participant" onclick="selectContact(this)">
                <div>
                    <ion-icon name="person-circle-sharp"></ion-icon>
                    <p>${response.data[i].name}</p>
                </div>
                <ion-icon name="checkmark-sharp" class="hidden"></ion-icon>
            </li>
        `
    }
    desativarClickEmMim(response);
    checkUserPrivateActivity(response);

}

function selectContact(selected) {
    const participantIsSelected = document.querySelector(".participant .check");
    const visibilityIsSelected = document.querySelector(".visibility .check");
    const check =  selected.childNodes[3];
    const textoDentro = selected.childNodes[1].childNodes[3].innerText;
    const iconTodos = document.querySelector(".visibilities").childNodes[1].childNodes[3];
    const iconQualquer = document.querySelector(".visibilities").childNodes[3].childNodes[3];

    if ((participantIsSelected !== null)) {
        participantIsSelected.classList.remove("check");
        check.classList.add("check");
        userPrivate = selected.childNodes[1].childNodes[3].innerText;
    }

    if ((textoDentro !== "Todos") && (iconTodos !== null)){
        iconTodos.classList.remove("check");
        iconQualquer.classList.add("check");
        alterarHTMLPrivada();
    } else if ((textoDentro === "Todos") && (iconQualquer !== null)) {
        iconQualquer.classList.remove("check");
        iconTodos.classList.add("check");
        limparHTML();
    }
}

function checkUserPrivateActivity(response) {
    let index = response.data.findIndex(filterUserPrivate);
    const selected = document.querySelector(".participants").childNodes[(index*2)+3];
    const selectEveryone =  document.querySelector(".participants").childNodes[1];


    if (index !== -1) {
        selectContact(selected);
    } else {
        selectContact(selectEveryone);
    }

}

function filterUserPrivate(participant) {
    return participant.name === userPrivate;
}

function filterUserName(user) {
    return user.name === userName;
}

function desativarClickEmMim(response) {
    let index = response.data.findIndex(filterUserName);
    const selectedUser = document.querySelector(".participants").childNodes[(index*2)+3];

    if (index !== -1) {
        selectedUser.classList.add("desativa-click");
    }
}

function alterarHTMLPrivada() {
    document.querySelector(".private").innerHTML = `
        Enviando para ${userPrivate} (reservadamente)    
    `;
}

function limparHTML() {
    document.querySelector(".private").innerHTML = "";
}
let userName = undefined;

loginScreen();

function loginScreen() {
    document.querySelector('body').innerHTML = `
        <main class="login-screen">
            <img src="./assets/logo_login.png" alt="logo">
            <input id="userName" type="text" placeholder="Digite seu nome">
            <button type="button" onclick="enterChat()" onfo>Entrar</button>
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
                <input id="userName" type="text" placeholder="Digite seu nome">
                <p>Digite outro nome, esse já está em uso!</p>
                <button type="button" onclick="enterChat()">Entrar</button>
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
                <ion-icon name="people-sharp"></ion-icon>
            </header>

            <section class="messages">
            </section>

            <footer>
                <input id="userMessage" type="text" placeholder="Escreva aqui...">
                <button type="button" onclick="sendMessage()"><ion-icon name="paper-plane-outline"></ion-icon></button>
            </footer>
        </main>
    `;
    sendWithEnter();
    fetchMessages();
    setInterval(fetchMessages, 3000);

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
                <article class="status-message">
                    <em>(${time})</em> <strong>${from}</strong> ${text}
                </article>
            `;
        } else if ((type === "message") && (to === "Todos")) {
            messages.innerHTML += `
                <article class="displayed-message">
                    <em>(${time})</em> <strong>${from}</strong> para <strong>${to}</strong>: ${text}
                </article>
            `;
        } else if ((type === "private_message") && (to === userName)) {
            messages.innerHTML += `
                <article class="private-message">
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
    const promise = axios.post('https://mock-api.driven.com.br/api/v4/uol/messages', { from: userName, to: "Todos", text: document.getElementById("userMessage").value, type: "message"});

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
function loginScreen() {
    document.querySelector('body').innerHTML = `
        <main class="login-screen">
            <img src="./assets/logo_login.png" alt="logo">

            <form>
                <input type="text" placeholder="Digite seu nome">
                <button>Entrar</button>
            </form>
        </main>
    `;
}

function loadingScreen() {
    document.querySelector('body').innerHTML = `
        <main class="loading-screen">
            <img src="./assets/loading.gif" alt="carregando...">
            <p>carregando...</p>
        </main>
    `;

}

function chatScreen() {
    document.querySelector('body').innerHTML = `
        <main class="chat-screen">
            <header>
                <img src="./assets/logo_uol.png" alt="logo_uol">
                <ion-icon name="people-sharp"></ion-icon>
            </header>

            <section class="messages">
                <article class="status-message">
                    <p class="time">(09:21:45)</p>
                    <p class="status"><strong>João</strong> entra na sala...<p>
                </article>

                <article class="displayed-message">
                    <p class="time">(09:21:45)</p>
                    <p class="sender-to-receiver"><strong>João</strong> para <strong>Todos</strong> : </p>
                    <p class="message-tex"> blah blah blah</p>
                </article>

                <article class="private-message">
                    <p class="time">(09:21:45)</p>
                    <p class="sender-to-receiver"><strong>João</strong> para <strong>Maria</strong> : </p>
                    <p class="message-tex"> blah blah blah</p>
                </article>
            </section>

            <footer>
                <form>
                    <input type="text" placeholder="Escreva aqui...">
                    <button><ion-icon name="paper-plane-outline"></ion-icon></button>
                </form>
            </footer>
        </main>
    `;

}
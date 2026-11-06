import "./style.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8787";
const app = document.querySelector("#app");

app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <a class="brand" href="#"><span class="brand-mark">N</span><span>NOREXA</span></a>
      <span class="status"><i></i> KI-ASSISTENT</span>
    </header>
    <section class="hero">
      <div class="eyebrow">DEIN KI-WEBASSISTENT</div>
      <h1>Das Internet verstehen.<br><span>Mit Norexa.</span></h1>
      <p class="sub">Stelle Fragen, recherchiere im Web und erhalte verständliche Antworten mit Quellen.</p>
    </section>
    <section class="chat-card">
      <div id="messages" class="messages" aria-live="polite">
        <article class="message assistant">
          <div class="avatar">N</div>
          <div class="bubble"><strong>Hallo! Ich bin Norexa.</strong><br>Was möchtest du im Internet herausfinden?</div>
        </article>
      </div>
      <form id="chat-form" class="composer">
        <textarea id="question" rows="2" maxlength="5000" placeholder="Frag Norexa etwas ..." required></textarea>
        <div class="composer-bottom">
          <span class="hint"><span class="spark">✦</span> Websuche kann verwendet werden</span>
          <button id="send" type="submit">Senden <span>↗</span></button>
        </div>
      </form>
    </section>
    <footer> Norexa AI <span>•</span> Antworten können Fehler enthalten. Prüfe wichtige Informationen anhand der Quellen.</footer>
  </main>
`;

const form = document.querySelector("#chat-form");
const question = document.querySelector("#question");
const messages = document.querySelector("#messages");
const send = document.querySelector("#send");

function addMessage(kind, content, isText = true) {
  const article = document.createElement("article");
  article.className = `message ${kind}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = kind === "assistant" ? "N" : "Du";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (isText) bubble.textContent = content;
  else bubble.innerHTML = content;
  article.append(avatar, bubble);
  messages.append(article);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = question.value.trim();
  if (!text) return;
  addMessage("user", text);
  question.value = "";
  send.disabled = true;
  const pending = addMessage("assistant", "Norexa recherchiert ...");
  try {
    const response = await fetch(`${API}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Anfrage fehlgeschlagen.");
    pending.textContent = data.answer;
  } catch (error) {
    pending.textContent = `Fehler: ${error.message}. Läuft der Norexa-Server?`;
  } finally {
    send.disabled = false;
    question.focus();
    messages.scrollTop = messages.scrollHeight;
  }
});

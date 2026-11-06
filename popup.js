const API = "http://localhost:8787";
const question = document.querySelector("#question");
const ask = document.querySelector("#ask");
const status = document.querySelector("#status");

ask.addEventListener("click", async () => {
  const prompt = question.value.trim();
  if (!prompt) {
    status.textContent = "Bitte gib zuerst eine Frage ein.";
    return;
  }
  ask.disabled = true;
  status.textContent = "Lese den sichtbaren Text der aktuellen Seite ...";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("Kein aktiver Tab gefunden.");

    const [page] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        title: document.title,
        text: (document.body?.innerText || "").slice(0, 18000)
      })
    });

    status.textContent = "Norexa denkt nach ...";
    const response = await fetch(`${API}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt, pageContext: page.result })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Serveranfrage fehlgeschlagen.");
    status.textContent = data.answer || "Keine Antwort erhalten.";
  } catch (error) {
    status.textContent = `Fehler: ${error.message}\n\nPrüfe, ob der Norexa-Server läuft. Manche Browser-Systemseiten erlauben keinen Zugriff.`;
  } finally {
    ask.disabled = false;
  }
});

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

let chatHistory = [];
let serverBase = null;

// Configure marked.js to render single newlines as line breaks
marked.setOptions({
  breaks: true,  // Convert \n to <br>
  gfm: true      // Enable GitHub Flavored Markdown
});

// Auto-resize textarea to fit content
function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

// Fetch runtime config (port) from the server. If this page is served by the
// same Express server, /config will return { port: "<port>" } from .env.
// We fetch once at startup and fall back to window.location.origin on error.
async function loadConfig() {
  try {
    const res = await fetch("/config");
    if (!res.ok) throw new Error("no config");
    const cfg = await res.json();
    if (cfg && cfg.port) {
      serverBase = `${window.location.protocol}//${window.location.hostname}:${cfg.port}`;
    } else {
      serverBase = window.location.origin;
    }
  } catch (err) {
    serverBase = window.location.origin;
  }
}

// Start loading config immediately
loadConfig();

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  input.value = "";

  appendMessage("user", text);

  try {
    // Ensure we have a base URL. If loadConfig hasn't finished yet, fall back to
    // using the same origin.
    const base = serverBase || window.location.origin;

    const response = await fetch(base + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: chatHistory }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    appendMessage("assistant", data.reply);

    chatHistory.push({ role: "user", content: text });
    chatHistory.push({ role: "assistant", content: data.reply });
  } catch (error) {
    console.error("Error sending message:", error);
    appendMessage(
      "assistant",
      `❌ **Error:** ${error.message}\n\nPlease check:\n- Server is running\n- API key is configured\n- Internet connection is active`
    );
  }
}

// Appends a message to the chat history
function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = role;
  div.innerHTML = DOMPurify.sanitize(marked.parse(text));

  // Store the original markdown text as a data attribute for editing
  div.dataset.originalText = text;

  div.addEventListener("click", () => startEditing(div));

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function startEditing(div) {
  // Prevent multiple edits at once
  if (div.classList.contains("editing")) return;

  div.classList.add("editing");
  const oldText = div.dataset.originalText || div.textContent;

  // Replace text with input box
  const input = document.createElement("textarea");
  input.type = "text";
  input.value = oldText;
  input.style.width = "80%";
  input.style.padding = "5px";
  input.style.resize = "none";
  input.style.overflow = "hidden";
  input.style.minHeight = "40px";
  input.style.boxSizing = "border-box";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.style.marginLeft = "5px";

  // Replace message content with edit UI
  div.textContent = "";
  div.appendChild(input);
  div.appendChild(saveBtn);

  // Auto-resize the edit textarea as user types
  input.addEventListener("input", () => autoResize(input));

  // Set initial height based on content
  autoResize(input);
  input.focus();

  saveBtn.onclick = (e) => {
    e.stopPropagation();
    finishEditing(div, oldText, input.value);
  };
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.stopPropagation();
      finishEditing(div, oldText, input.value);
    }
  });
}

function finishEditing(div, oldText, newText) {
  div.classList.remove("editing");
  
  // Render the new text as Markdown
  div.innerHTML = DOMPurify.sanitize(marked.parse(newText));
  div.dataset.originalText = newText;

  // Find and update the message in chatHistory
  const index = chatHistory.findIndex(
    (msg) => msg.content === oldText
  );
  if (index !== -1) chatHistory[index].content = newText;
}

sendBtn.onclick = sendMessage;
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();  // Prevent newline insertion
    sendMessage();
  }
});

// Add auto-resize functionality to main input
input.addEventListener("input", () => autoResize(input));
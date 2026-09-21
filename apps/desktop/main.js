import { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, screen, session } from "electron";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "../..");

function loadEnvFile() {
  const envPath = join(projectRoot, ".env");
  if (!existsSync(envPath)) return;

  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

let win;
let tray;
let quitting = false;

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { x, y, width } = display.workArea;
  const panelWidth = 430;
  const panelHeight = 680;

  win = new BrowserWindow({
    width: panelWidth,
    height: panelHeight,
    x: x + width - panelWidth - 18,
    y: y + 24,
    minWidth: 360,
    minHeight: 520,
    show: true,
    frame: false,
    resizable: true,
    alwaysOnTop: false,
    backgroundColor: "#0b0d10",
    webPreferences: {
      preload: join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  win.loadFile(join(__dirname, "index.html"));

  win.on("close", (event) => {
    if (!quitting) {
      event.preventDefault();
      win.hide();
    }
  });
}

function createTray() {
  const iconData = "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA6ElEQVR4nO1XSQ6DMAw0qD+BQ/v/x8AheUt7SmVR2xknuFCVOSHF9kzGWQjRv2NoSZqm+1Mby3l11YSDLdIeMWMUOZpnKmwllqC5oTqwJ7lVTxSwN7lVF1oDBSktlNLSHWMK0GbPi2oESMy2/mgNRoHzuFoQAVjAPD/Eb2/MFu+9+S37OXJeh99pwSXgEhAuwPp58J7vSE7hO48DFsqphrpQ4pDT8MN260TkAqTitfEC3m6x76gIDSg5EdGtWk0pLglBLyAOdeVHXE7STlMXofeB0UJOBD5MetyoTQTahq1uIHmHvw0PxwsZ8nTRYt7SawAAAABJRU5ErkJggg==";
  const icon = nativeImage.createFromBuffer(Buffer.from(iconData, "base64"));
  tray = new Tray(icon);
  tray.setToolTip("Roby OS");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Abrir Roby", click: () => win?.show() },
      { label: "Ocultar", click: () => win?.hide() },
      { type: "separator" },
      {
        label: "Sair",
        click: () => {
          quitting = true;
          app.quit();
        },
      },
    ])
  );
  tray.on("double-click", () => win?.show());
}

async function createLiveSession(offerSdp) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurada no arquivo .env.");
  }

  const liveModel = process.env.ROBY_LIVE_MODEL || "gpt-live-1";
  const backendModel = process.env.ROBY_BACKEND_MODEL || "gpt-5.6-terra";
  const voice = process.env.ROBY_LIVE_VOICE || "tempo";

  const body = {
    session: {
      model: liveModel,
      instructions: [
        "Você é a interface de voz do Roby, um assistente pessoal agêntico.",
        "Fale em português brasileiro natural, com presença, clareza e frases curtas.",
        "Não fale como atendente de call center.",
        "Seja direto, didático e humano.",
        "O usuário pode interromper você; aceite a interrupção naturalmente.",
        "Para perguntas substanciais, informações atuais ou tarefas que exijam raciocínio/ferramentas, delegue ao backend.",
        "Nunca diga que uma ação externa foi concluída se o backend não confirmou.",
      ].join(" "),
      audio: {
        output: {
          voice,
        },
      },
      delegation: {
        type: "responses",
        responses: {
          model: backendModel,
          instructions: [
            "Você é o backend cognitivo do Roby.",
            "Responda em português brasileiro.",
            "Pesquise quando a informação atual puder mudar a resposta.",
            "Seja conciso o suficiente para uma conversa falada.",
            "Não invente execução de ferramentas.",
          ].join(" "),
          tools: [{ type: "web_search" }],
          tool_choice: "auto",
        },
      },
    },
    transport: {
      type: "webrtc",
      sdp: offerSdp,
    },
  };

  const response = await fetch("https://api.openai.com/v1/live/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await response.json();
  if (!response.ok) {
    const message = json?.error?.message || json?.error || "Falha ao criar sessão Live.";
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return {
    sessionId: json.session?.id,
    sdp: json.transport?.sdp,
  };
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const local = webContents.getURL().startsWith("file://");
    callback(local && permission === "media");
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    const local = webContents?.getURL()?.startsWith("file://") ?? false;
    return local && permission === "media";
  });

  ipcMain.handle("roby:create-live-session", async (_event, offerSdp) => {
    if (typeof offerSdp !== "string" || !offerSdp.trim()) {
      throw new Error("SDP inválido.");
    }
    return createLiveSession(offerSdp);
  });

  ipcMain.handle("roby:show-window", () => {
    win?.show();
    win?.focus();
  });

  ipcMain.handle("roby:hide-window", () => {
    win?.hide();
  });

  ipcMain.handle("roby:get-runtime-config", () => ({
    wakeMode: process.env.ROBY_WAKE_MODE || "hybrid",
    doubleClapMode: process.env.ROBY_DOUBLE_CLAP_MODE || "wake-only",
    liveVoice: process.env.ROBY_LIVE_VOICE || "tempo",
  }));

  createWindow();
  createTray();
});

app.on("window-all-closed", (event) => {
  event.preventDefault?.();
});

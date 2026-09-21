const orb = document.getElementById("orb");
const status = document.getElementById("status");
const stateText = document.getElementById("stateText");
const hint = document.getElementById("hint");
const micStatus = document.getElementById("micStatus");
const conversation = document.getElementById("conversation");
const remoteAudio = document.getElementById("remoteAudio");
const hideButton = document.getElementById("hide");

let micStream;
let audioContext;
let analyser;
let sampleBuffer;
let livePeer;
let liveChannel;
let liveSessionId;
let monitorTimer;
let localState = "sleeping";
let lastClapAt;
let firstClapAt;
let userRollingTranscript = "";
let currentUserBubble;
let currentAssistantBubble;
let closing = false;

const CLAP = {
  minPeak: 0.58,
  minRms: 0.03,
  minCrest: 4.6,
  refractoryMs: 110,
  minGapMs: 130,
  maxGapMs: 850,
};

const sleepPhrases = [
  "roby pode dormir",
  "roby dorme",
  "roby encerra a conversa",
  "roby pode encerrar",
  "tchau roby",
  "boa noite roby",
];

const hidePhrases = [
  "roby pode fechar",
  "roby fecha a janela",
  "roby pode sumir",
];

hideButton.addEventListener("click", () => window.roby.hideWindow());

function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsPhrase(text, phrases) {
  const normalized = normalize(text);
  return phrases.some((phrase) => normalized.includes(normalize(phrase)));
}

function setState(state, detail = "") {
  localState = state;
  orb.className = `orb ${state}`;

  const labels = {
    sleeping: ["Dormindo", "Duas palmas para acordar."],
    connecting: ["Acordando…", "Abrindo uma conversa de voz contínua."],
    listening: ["Ouvindo", "Pode falar normalmente. Sem botão."],
    speaking: ["Falando", "Pode me interromper quando quiser."],
    error: ["Falha", "A presença local continua ativa."],
  };

  const [title, subtitle] = labels[state] || [state, ""];
  stateText.textContent = title;
  hint.textContent = detail || subtitle;
  status.textContent = detail || subtitle;
}

function addMessage(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  bubble.textContent = text;
  conversation.appendChild(bubble);
  conversation.scrollTop = conversation.scrollHeight;
  return bubble;
}

function appendTranscript(role, delta) {
  if (!delta) return;

  if (role === "user") {
    if (!currentUserBubble) {
      currentUserBubble = addMessage("user", "");
      currentAssistantBubble = undefined;
    }
    currentUserBubble.textContent += delta;
    userRollingTranscript = (userRollingTranscript + delta).slice(-300);

    if (containsPhrase(userRollingTranscript, hidePhrases)) {
      void closeLive("voice-hide", true);
      userRollingTranscript = "";
      return;
    }

    if (containsPhrase(userRollingTranscript, sleepPhrases)) {
      void closeLive("voice-sleep", false);
      userRollingTranscript = "";
      return;
    }
  } else {
    if (!currentAssistantBubble) {
      currentAssistantBubble = addMessage("assistant", "");
      currentUserBubble = undefined;
    }
    currentAssistantBubble.textContent += delta;
  }

  conversation.scrollTop = conversation.scrollHeight;
}

function audioMetrics(buffer) {
  let peak = 0;
  let square = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    const value = Math.abs(buffer[i]);
    if (value > peak) peak = value;
    square += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(square / buffer.length);
  const crest = rms > 0 ? peak / rms : 0;
  return { peak, rms, crest };
}

function processClapFrame(now) {
  if (!analyser || localState !== "sleeping") return;
  analyser.getFloatTimeDomainData(sampleBuffer);
  const { peak, rms, crest } = audioMetrics(sampleBuffer);
  const transient = peak >= CLAP.minPeak && rms >= CLAP.minRms && crest >= CLAP.minCrest;
  if (!transient) return;

  if (lastClapAt && now - lastClapAt < CLAP.refractoryMs) return;
  lastClapAt = now;

  if (!firstClapAt) {
    firstClapAt = now;
    status.textContent = "uma palma detectada…";
    return;
  }

  const gap = now - firstClapAt;
  if (gap >= CLAP.minGapMs && gap <= CLAP.maxGapMs) {
    firstClapAt = undefined;
    void startLive();
  } else {
    firstClapAt = now;
  }
}

async function initLocalPresence() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });

    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(micStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0;
    sampleBuffer = new Float32Array(analyser.fftSize);
    source.connect(analyser);

    micStatus.textContent = "microfone: presença local ativa";
    setState("sleeping");

    monitorTimer = window.setInterval(() => {
      processClapFrame(performance.now());
      if (firstClapAt && performance.now() - firstClapAt > CLAP.maxGapMs) {
        firstClapAt = undefined;
      }
    }, 35);
  } catch (error) {
    micStatus.textContent = "microfone: sem permissão";
    setState("error", error.message || "Não foi possível acessar o microfone.");
  }
}

function waitForIceGathering(pc) {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    const handler = () => {
      if (pc.iceGatheringState === "complete") {
        pc.removeEventListener("icegatheringstatechange", handler);
        resolve();
      }
    };
    pc.addEventListener("icegatheringstatechange", handler);
  });
}

function sendLive(event) {
  if (liveChannel?.readyState === "open") {
    liveChannel.send(JSON.stringify(event));
  }
}

function requestGreeting() {
  sendLive({
    type: "session.commentary.append",
    event_id: `roby_wake_${Date.now()}`,
    delegation_id: null,
    content: "A sessão acabou de ser ativada. Cumprimente o usuário de forma bem curta e diga que está ouvindo.",
  });
}

function onLiveEvent(event) {
  switch (event.type) {
    case "session.started":
      setState("listening");
      requestGreeting();
      break;

    case "session.input_transcript.delta":
      setState("listening");
      appendTranscript("user", event.delta);
      break;

    case "session.output_transcript.delta":
      setState("speaking");
      appendTranscript("assistant", event.delta);
      break;

    case "session.closed":
      cleanupLive();
      if (closing) closing = false;
      break;

    case "error":
      console.error("GPT-Live event error", event);
      setState("error", event.error?.message || "Erro na sessão de voz.");
      break;
  }
}

async function startLive() {
  if (localState !== "sleeping" || !micStream) return;
  setState("connecting");
  await window.roby.showWindow();

  try {
    livePeer = new RTCPeerConnection();
    remoteAudio.srcObject = new MediaStream();

    livePeer.ontrack = (event) => {
      const stream = event.streams?.[0] || new MediaStream([event.track]);
      remoteAudio.srcObject = stream;
      remoteAudio.play().catch(() => {});
    };

    for (const track of micStream.getAudioTracks()) {
      livePeer.addTrack(track, micStream);
    }

    liveChannel = livePeer.createDataChannel("oai-events");
    liveChannel.addEventListener("message", (message) => {
      try {
        onLiveEvent(JSON.parse(message.data));
      } catch (error) {
        console.warn("Evento Live inválido", error);
      }
    });

    liveChannel.addEventListener("close", () => {
      if (!closing) cleanupLive();
    });

    const offer = await livePeer.createOffer();
    await livePeer.setLocalDescription(offer);
    await waitForIceGathering(livePeer);

    const localSdp = livePeer.localDescription?.sdp;
    if (!localSdp) throw new Error("Não consegui criar a oferta de áudio.");

    const result = await window.roby.createLiveSession(localSdp);
    if (!result?.sdp) throw new Error("A sessão Live não retornou resposta de áudio.");

    liveSessionId = result.sessionId;
    await livePeer.setRemoteDescription({ type: "answer", sdp: result.sdp });
  } catch (error) {
    console.error(error);
    cleanupLive();
    setState("error", error.message || "Não consegui acordar o Roby.");
    window.setTimeout(() => setState("sleeping"), 3500);
  }
}

async function closeLive(reason, hideAfter) {
  if (!livePeer || closing) {
    if (hideAfter) await window.roby.hideWindow();
    return;
  }

  closing = true;
  status.textContent = "encerrando conversa…";

  sendLive({
    type: "session.close",
    event_id: `roby_close_${Date.now()}`,
  });

  window.setTimeout(() => {
    if (livePeer) cleanupLive();
  }, 3500);

  if (hideAfter) {
    window.setTimeout(() => window.roby.hideWindow(), 400);
  }
}

function cleanupLive() {
  try {
    liveChannel?.close();
  } catch {}
  try {
    livePeer?.close();
  } catch {}

  liveChannel = undefined;
  livePeer = undefined;
  liveSessionId = undefined;
  remoteAudio.srcObject = null;
  userRollingTranscript = "";
  currentUserBubble = undefined;
  currentAssistantBubble = undefined;
  closing = false;
  setState("sleeping");
}

window.addEventListener("beforeunload", () => {
  if (monitorTimer) clearInterval(monitorTimer);
  for (const track of micStream?.getTracks?.() || []) track.stop();
  audioContext?.close?.();
  livePeer?.close?.();
});

await initLocalPresence();

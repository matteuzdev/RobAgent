const DEFAULT_SLEEP_PHRASES = [
  "roby pode dormir",
  "roby dorme",
  "roby encerra a conversa",
  "roby pode encerrar",
  "tchau roby",
  "boa noite roby",
];

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export class VoiceCommandDetector {
  private readonly sleepPhrases: string[];

  constructor(sleepPhrases = DEFAULT_SLEEP_PHRASES) {
    this.sleepPhrases = sleepPhrases.map(normalize);
  }

  isSleepCommand(transcript: string): boolean {
    const normalized = normalize(transcript);
    return this.sleepPhrases.some(
      (phrase) => normalized === phrase || normalized.includes(phrase)
    );
  }
}

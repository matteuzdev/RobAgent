import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export interface MemoryRecord {
  id: string;
  namespace: string;
  text: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MemoryStore {
  put(record: MemoryRecord): Promise<void>;
  get(id: string): Promise<MemoryRecord | undefined>;
  search(query: string, namespace?: string): Promise<MemoryRecord[]>;
}

type MemoryFile = { records: MemoryRecord[] };

export class JsonMemoryStore implements MemoryStore {
  constructor(private readonly filePath: string) {}

  async put(record: MemoryRecord): Promise<void> {
    const db = await this.load();
    const index = db.records.findIndex((item) => item.id === record.id);
    if (index >= 0) db.records[index] = record;
    else db.records.push(record);
    await this.save(db);
  }

  async get(id: string): Promise<MemoryRecord | undefined> {
    const db = await this.load();
    return db.records.find((record) => record.id === id);
  }

  async search(query: string, namespace?: string): Promise<MemoryRecord[]> {
    const needle = query.trim().toLocaleLowerCase("pt-BR");
    const db = await this.load();
    return db.records
      .filter((record) => !namespace || record.namespace === namespace)
      .map((record) => ({
        record,
        score:
          record.text.toLocaleLowerCase("pt-BR").includes(needle) ? 2 :
          record.tags.some((tag) => tag.toLocaleLowerCase("pt-BR").includes(needle)) ? 1 : 0,
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.record);
  }

  private async load(): Promise<MemoryFile> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as MemoryFile;
      return { records: Array.isArray(parsed.records) ? parsed.records : [] };
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT") return { records: [] };
      throw error;
    }
  }

  private async save(db: MemoryFile): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.tmp`;
    await writeFile(tempPath, JSON.stringify(db, null, 2), "utf8");
    await rename(tempPath, this.filePath);
  }
}

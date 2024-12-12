import { Table } from 'dexie';

export interface Knowledge {
  id?: number;
  topic: string;
  content: string;
  confidence: number;
  source: string;
  timestamp: number;
  lastUsed?: number;
  useCount: number;
}

export interface KnowledgeTable extends Table<Knowledge> {
  where: any;
}
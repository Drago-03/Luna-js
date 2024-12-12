import Dexie from 'dexie';
import { Conversation } from '../types';
import { Knowledge } from './models/Knowledge';
import { logger } from '../utils/logger';

export class LunaDatabase extends Dexie {
  conversations!: Dexie.Table<Conversation, number>;
  knowledge!: Dexie.Table<Knowledge, number>;

  constructor() {
    super('LunaDB');
    
    this.version(1).stores({
      conversations: '++id, timestamp',
      knowledge: '++id, topic, confidence, timestamp, lastUsed'
    });

    // Log database events
    this.on('ready', () => logger.info('Database initialized'));
    this.on('versionchange', () => logger.info('Database version changed'));
  }

  async addKnowledge(knowledge: Omit<Knowledge, 'id'>) {
    try {
      const id = await this.knowledge.add(knowledge);
      logger.info(`Added new knowledge: ${knowledge.topic}`);
      return id;
    } catch (error) {
      logger.error('Error adding knowledge', error as Error);
      throw error;
    }
  }

  async findRelatedKnowledge(topic: string): Promise<Knowledge[]> {
    return await this.knowledge
      .where('topic')
      .startsWithIgnoreCase(topic)
      .or('content')
      .startsWithIgnoreCase(topic)
      .toArray();
  }

  async updateKnowledgeUsage(id: number) {
    const knowledge = await this.knowledge.get(id);
    if (knowledge) {
      await this.knowledge.update(id, {
        lastUsed: Date.now(),
        useCount: (knowledge.useCount || 0) + 1
      });
    }
  }
}

export const db = new LunaDatabase();
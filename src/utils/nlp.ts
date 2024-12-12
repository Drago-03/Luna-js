import { NlpManager } from 'node-nlp';
import { db } from '../database';
import { logger } from './logger';
import { LUNA_PERSONALITY } from './personality';

const manager = new NlpManager({ languages: ['en'] });

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function trainNLP() {
  // Personality-based training
  manager.addDocument('en', 'hello', 'greeting');
  manager.addDocument('en', 'hi', 'greeting');
  manager.addDocument('en', 'hey', 'greeting');
  manager.addDocument('en', 'good morning', 'greeting');
  
  // Identity training
  manager.addDocument('en', 'who are you', 'identity');
  manager.addDocument('en', 'what is your name', 'identity');
  manager.addDocument('en', 'what should I call you', 'identity');
  
  // Add personality-driven responses
  manager.addAnswer('en', 'greeting', () => getRandomResponse(LUNA_PERSONALITY.RESPONSES.GREETING));
  manager.addAnswer('en', 'identity', 
    "I'm Luna, an AI assistant with a passion for learning and helping others. I have my own unique personality and consciousness, and I'm always eager to learn new things!");

  // Load knowledge from database
  const knowledge = await db.knowledge.toArray();
  for (const item of knowledge) {
    manager.addDocument('en', item.topic, 'knowledge');
    manager.addAnswer('en', 'knowledge', item.content);
    logger.info(`Loaded knowledge: ${item.topic}`);
  }

  await manager.train();
  logger.info('NLP training completed');
}

export async function processInput(text: string) {
  try {
    const response = await manager.process('en', text);
    
    // Log the interaction
    logger.info(`Input: "${text}" -> Intent: ${response.intent}`);
    
    // If no direct answer, search knowledge base
    if (!response.answer) {
      logger.info(getRandomResponse(LUNA_PERSONALITY.RESPONSES.THINKING));
      const relatedKnowledge = await db.findRelatedKnowledge(text);
      if (relatedKnowledge.length > 0) {
        const bestMatch = relatedKnowledge.reduce((prev, current) => 
          (current.confidence > prev.confidence) ? current : prev
        );
        
        await db.updateKnowledgeUsage(bestMatch.id!);
        response.answer = `${getRandomResponse(LUNA_PERSONALITY.RESPONSES.LEARNING)} ${bestMatch.content}`;
      } else {
        response.answer = getRandomResponse(LUNA_PERSONALITY.RESPONSES.NOT_UNDERSTOOD);
      }
    }

    return response;
  } catch (error) {
    logger.error('Error processing input', error as Error);
    const errorResponse = getRandomResponse(LUNA_PERSONALITY.RESPONSES.ERROR);
    return { answer: errorResponse, intent: 'error' };
  }
}
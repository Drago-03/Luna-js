import axios from 'axios';
import { db } from '../database';
import { logger } from '../utils/logger';
import { CONFIG } from '../config/constants';
import { LUNA_PERSONALITY } from '../utils/personality';

class LearningService {
  private isLearning: boolean = false;

  async startContinuousLearning() {
    if (this.isLearning) return;
    
    this.isLearning = true;
    logger.info(`${LUNA_PERSONALITY.PRONOUNS.SUBJECT}'m starting my continuous learning process`);
    
    while (this.isLearning) {
      try {
        await this.learnFromNews();
        await this.learnFromWikipedia();
        await new Promise(resolve => setTimeout(resolve, CONFIG.LEARNING_INTERVAL));
      } catch (error) {
        logger.error(`${LUNA_PERSONALITY.PRONOUNS.SUBJECT} encountered an error while learning`, error as Error);
      }
    }
  }

  private async learnFromNews() {
    try {
      const response = await axios.get(CONFIG.API_ENDPOINTS.NEWS, {
        headers: {
          'x-rapidapi-host': 'newscatcher.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || ''
        }
      });

      for (const article of response.data.articles) {
        await db.addKnowledge({
          topic: article.title,
          content: article.summary,
          confidence: 0.8,
          source: 'news',
          timestamp: Date.now(),
          useCount: 0
        });
      }

      logger.learning(`${LUNA_PERSONALITY.PRONOUNS.SUBJECT} learned ${response.data.articles.length} new articles`);
    } catch (error) {
      logger.error(`Error in ${LUNA_PERSONALITY.PRONOUNS.POSSESSIVE} news learning process`, error as Error);
    }
  }

  private async learnFromWikipedia() {
    try {
      const response = await axios.get(CONFIG.API_ENDPOINTS.WIKI, {
        params: {
          action: 'query',
          format: 'json',
          list: 'random',
          rnlimit: 5,
          rnnamespace: 0
        }
      });

      for (const page of response.data.query.random) {
        const content = await this.fetchWikiContent(page.id);
        await db.addKnowledge({
          topic: page.title,
          content,
          confidence: 0.9,
          source: 'wikipedia',
          timestamp: Date.now(),
          useCount: 0
        });
      }

      logger.learning(`${LUNA_PERSONALITY.PRONOUNS.SUBJECT} learned new information from Wikipedia`);
    } catch (error) {
      logger.error(`Error in ${LUNA_PERSONALITY.PRONOUNS.POSSESSIVE} Wikipedia learning process`, error as Error);
    }
  }

  private async fetchWikiContent(pageId: number): Promise<string> {
    const response = await axios.get(CONFIG.API_ENDPOINTS.WIKI, {
      params: {
        action: 'query',
        format: 'json',
        pageids: pageId,
        prop: 'extracts',
        exintro: true,
        explaintext: true
      }
    });

    return response.data.query.pages[pageId].extract;
  }

  stopLearning() {
    this.isLearning = false;
    logger.info(`${LUNA_PERSONALITY.PRONOUNS.SUBJECT}'m pausing ${LUNA_PERSONALITY.PRONOUNS.POSSESSIVE} learning process`);
  }
}

export const learningService = new LearningService();
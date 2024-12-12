import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config/constants';

class Logger {
  private logFile: string;
  private learningFile: string;
  private errorFile: string;

  constructor() {
    const timestamp = new Date().toISOString().split('T')[0];
    this.logFile = path.join(CONFIG.LOG_DIRECTORY, `luna_${timestamp}.log`);
    this.learningFile = path.join(CONFIG.LOG_DIRECTORY, `learning_${timestamp}.log`);
    this.errorFile = path.join(CONFIG.LOG_DIRECTORY, `error_${timestamp}.log`);
    
    // Ensure log directory exists
    if (!fs.existsSync(CONFIG.LOG_DIRECTORY)) {
      fs.mkdirSync(CONFIG.LOG_DIRECTORY, { recursive: true });
    }
  }

  private writeLog(file: string, message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    fs.appendFileSync(file, logEntry);
    
    // Rotate logs if they get too large
    this.rotateLogIfNeeded(file);
  }

  private rotateLogIfNeeded(file: string) {
    try {
      const stats = fs.statSync(file);
      if (stats.size > CONFIG.MAX_LOGS_SIZE) {
        const archiveFile = `${file}.${Date.now()}.archive`;
        fs.renameSync(file, archiveFile);
      }
    } catch (error) {
      console.error('Error rotating log file:', error);
    }
  }

  info(message: string) {
    this.writeLog(this.logFile, `INFO: ${message}`);
  }

  error(message: string, error?: Error) {
    const errorMessage = error ? `${message}: ${error.stack}` : message;
    this.writeLog(this.errorFile, `ERROR: ${errorMessage}`);
  }

  learning(message: string) {
    this.writeLog(this.learningFile, `LEARNING: ${message}`);
  }
}

export const logger = new Logger();
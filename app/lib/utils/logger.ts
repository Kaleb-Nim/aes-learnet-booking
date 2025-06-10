export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  userId?: string;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  private constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createLogEntry(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
    return {
      timestamp: this.formatTimestamp(),
      level,
      message,
      context,
      data,
      userId: this.getCurrentUserId()
    };
  }

  private getCurrentUserId(): string | undefined {
    // In a real app, you'd get this from auth context
    return undefined;
  }

  private addToMemory(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }
  }

  private consoleLog(entry: LogEntry) {
    const { timestamp, level, message, context, data } = entry;
    const contextStr = context ? `[${context}]` : '';
    const logMessage = `${timestamp} ${contextStr} ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, data);
        break;
      case LogLevel.INFO:
        console.info(logMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, data);
        break;
    }
  }

  debug(message: string, context?: string, data?: any) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, data);
    this.addToMemory(entry);
    this.consoleLog(entry);
  }

  info(message: string, context?: string, data?: any) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const entry = this.createLogEntry(LogLevel.INFO, message, context, data);
    this.addToMemory(entry);
    this.consoleLog(entry);
  }

  warn(message: string, context?: string, data?: any) {
    if (!this.shouldLog(LogLevel.WARN)) return;
    const entry = this.createLogEntry(LogLevel.WARN, message, context, data);
    this.addToMemory(entry);
    this.consoleLog(entry);
  }

  error(message: string, context?: string, data?: any) {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, data);
    this.addToMemory(entry);
    this.consoleLog(entry);
  }

  // API specific logging methods
  apiRequest(method: string, url: string, data?: any) {
    this.info(`API Request: ${method} ${url}`, 'API', data);
  }

  apiResponse(method: string, url: string, status: number, data?: any) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `API Response: ${method} ${url} - ${status}`;
    
    if (level === LogLevel.ERROR) {
      this.error(message, 'API', data);
    } else {
      this.info(message, 'API', data);
    }
  }

  userAction(action: string, details?: any) {
    this.info(`User Action: ${action}`, 'USER', details);
  }

  validationError(field: string, error: string, data?: any) {
    this.warn(`Validation Error: ${field} - ${error}`, 'VALIDATION', data);
  }

  // Get logs for debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs for support
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience exports for common patterns
export const logError = (error: Error, context?: string, additionalData?: any) => {
  logger.error(error.message, context, {
    name: error.name,
    stack: error.stack,
    ...additionalData
  });
};

export const logApiCall = async <T>(
  operation: string,
  apiCall: () => Promise<T>,
  context?: string
): Promise<T> => {
  const startTime = Date.now();
  logger.info(`Starting ${operation}`, context);
  
  try {
    const result = await apiCall();
    const duration = Date.now() - startTime;
    logger.info(`Completed ${operation} in ${duration}ms`, context);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Failed ${operation} after ${duration}ms`, context, error);
    throw error;
  }
};
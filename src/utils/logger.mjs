const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  constructor(level = 'INFO') {
    this.level = LOG_LEVELS[level] || LOG_LEVELS.INFO;
  }

  _log(level, message, meta = {}) {
    if (LOG_LEVELS[level] <= this.level) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        message,
        ...meta,
      };

      console.log(JSON.stringify(logEntry));
    }
  }

  error(message, error = null) {
    const meta = {};
    if (error) {
      meta.error = {
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
      };
    }
    this._log('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this._log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this._log('INFO', message, meta);
  }

  debug(message, meta = {}) {
    this._log('DEBUG', message, meta);
  }
}

export const logger = new Logger(process.env.LOG_LEVEL || 'INFO');

//TODO: this is a basic logger system
const { log, warn, error, info } = console;

function wrapper(fn: Function): Function {
    return (...args: any) => {
      const startTime = new Date().toISOString();

      return fn(`[${startTime}] `, ...args);
    };
  }

export default Object.freeze({ log: wrapper(log), warn: wrapper(warn), error: wrapper(error), info: wrapper(info) });
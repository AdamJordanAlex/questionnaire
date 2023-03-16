import { saveError } from "./api/API";

var console=(function(oldCons){
  return {
      log: function(text){
        oldCons.log(text);
      },
      info: function (text) {
          oldCons.info(text);
          // Your code
      },
      warn: function (text) {
          oldCons.warn(text);
          // Your code
      },
      error: function (text,...rest) {
          oldCons.error(text,rest);
          saveError(text,rest);
      }
  };
}(window.console));

window.console = console;
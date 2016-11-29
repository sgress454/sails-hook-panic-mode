module.exports = function(sails) {
  
  var panicLevel = 0;

  return {

    defaults: {
      __configKey__: {
        text_message: "Site currently under maintenance.",
        status: 503
      }
    },

    configure: function() {

      // If no view is configured, try to default to views/panic.ejs if it exists
      if ('undefined' == typeof sails.config[this.configKey].view) {
        try {
          if (require('fs').existsSync(require('path').resolve(sails.config.appPath, 'views', 'panic.ejs'))) {
            sails.config[this.configKey].view = 'panic';
          }
        } catch(e) {}
      }

    },

    initialize: function(cb) {

      var self = this;

      // Bind a route that will run before all user and blueprint routes.
      // NOTE -- this will not necessarily run before all other HOOK routes.
      sails.on('router:before', function() {

        // Make this a wildcard route that will match any URL
        sails.router.bind('/*', function(req, res, next) {

          // If the panic level is <= zero, no need for panic mode.
          if (panicLevel <= 0) {
            return next();
          }

          // Set the response status
          res.status(sails.config[self.configKey].status || 200);

          // If the "view" config was explicitly set to false, just show a JSON or text message.
          if (sails.config[self.configKey].view === false || res.wantsJSON) {
            if (sails.config[self.configKey].json_message) {
              return res.json(sails.config[self.configKey].json_message);
            }
            return res.send(sails.config[self.configKey].text_message);              
          }
          // If "view" config was set, then serve that view
          else if (sails.config[self.configKey].view) {
            return res.view(sails.config[self.configKey].view, sails.config[self.configKey].viewLocals || {});
          } 
          // Otherwise if "view" config was left completely blank, serve our default maintenance page
          else {
            return res.view(require('path').resolve(__dirname, 'panic.ejs'), {layout: false});
          }
        }, 'all');

      });

      return cb();
    
    },

    panic: function() {
      panicLevel++;
    },

    chill: function(force) {
      panicLevel--;
      if (panicLevel < 0) {
        sails.log.warn('Panic level dropped to less than zero; resetting to zero.');
        panicLevel = 0;
      }
      return;
    },

    reset: function() {
      panicLevel = 0;
    }

  };

};

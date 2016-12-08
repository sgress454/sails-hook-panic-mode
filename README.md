# sails-hook-panic-mode

[Sails JS](http://sailsjs.org) hook to provide a simple "panic mode" for an app.  In panic mode, all requests receive an "under maintenance" page or message in response.

### Installation

`npm install sails-hook-panic-mode`

### Usage

From within your Sails app, call `sails.hooks['panic-mode'].panic()` to increase the panic level.  Call `sails.hooks['panic-mode'].chill()` to decrease the panic level.  Whenever the panic level is > 1, the site will operate in panic mode, so if you call `panic()` multiple times, you'll need to call `chill()` an equal number of times to get the site out of panic mode.  Call `sails.hooks['panic-mode'].reset()` to instantly set the panic level to zero.

### Configuration

Parameter      | Type                | Default | Details
-------------- | ------------------- | ------- | :---------------------------------:
view | ((string)) | _none_ | View to display in panic mode.  If not provided, the hook will use the `views/panic.ejs` view if your app has one.  Otherwise, it will show a default maintenance page.  Set to `false` to display text or JSON instead of a view (see `text_message` and `json_message` options)
viewLocals | ((dictionary)) | `{}` | Locals and options to use with your panic view.  You can use this to change up the message per environment, or to provide a different layout.
status | ((number)) | 503 (service unavailable) | Status code to respond with in panic mode.
json_message | ((json)) | _none_ | If `view` is set to `false` and `json_message` is provided, the [`res.json`](http://sailsjs.org/documentation/reference/response-res/res-json) method will be used with that value for the response in panic mode.
text_message | ((string)) | _none_ | If `view` is set to `false` and `text_message` is provided (and `json_message` is _not_ provided), the [`res.send`](http://sailsjs.org/documentation/reference/response-res/res-send) method will be used with that value for the response in panic mode.

#### Example

A great use of panic mode is to handle temporary disconnections from a remote session or socket store in Sails v1+.  

```javascript
// [your-sails-app]/config/session.js
module.exports = {
  adapter: 'connect-redis',
  onDisconnect: function() {
    sails.hooks['panic-mode'].panic();
  },
  onReconnect: function() {
    sails.hooks['panic-mode'].chill();
  }
}

// [your-sails-app]/config/sockets.js
module.exports = {
  adapter: 'socket.io-redis',
  adapterOptions: {
    onDisconnect: function() {
      sails.hooks['panic-mode'].panic();
    },
    onReconnect: function() {
      sails.hooks['panic-mode'].chill();
    }
  }
}

```

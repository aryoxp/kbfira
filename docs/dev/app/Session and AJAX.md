# Session

In server-side, session variables are managed by PHP script. CoreFramework provides a wrapper (library) to set and get session variables from and to server-side using Javascript.

Information about user who logged in to the Kit-Build system is stored in the session. Therefore, the system could recognize the user in different application pages. However, the actual session values are stored and managed by PHP in server side. So, Javascript needs to communicate with the server to get and set session variables.



## Initializing Session Library

The CoreFramework session library can be obtained using the following script:

````javascript
var sesslib = Core.instance().session();
````

The following methods are supported by Session library:

- getAll() - get all variables stored in the session. Returns a Promise that yields all sessions variables wrapped in a session object.

  Example:

  ````js
  sesslib.getAll().then(sessions => {
    console.log(sessions);     // get the session object
    console.log(sessions.x);   // get session variable "x"
    console.log(sessions.sum); // get session variable "sum"
  })
  ````

- `get(key)` - get session value specified by `key`. Returns a Promise that yields the session value specified by `key`.

  Example:

  ````js
  sesslib.get("x").then(x => {
    console.log(x); // get the value of x
  })
  ````

- `set(key, value)` - set session `value` specified by `key`. Returns a Promise that set a session value specified by `key`.

  Example:

  ````js
  sesslib.set("x", 2).then(status => {
    console.log(status); 
    // the status of setting the session variable "x" 
    // with a value of 2
  })
  ````

- `unset(key)` - unset a session variable specified by `key`. Returns a Promise that unset a session value specified by `key`.

  Example:

  ````js
  sesslib.unset("x").then(status => {
    console.log(status); 
    // the status of unsetting the session variable "x"
  })
  ````

- `destroy()` - removes all session variables. Returns a Promise that removes all session variables set. 

  Example:

  ````js
  sesslib.destroy().then(status => {
    console.log(status); 
    // the status of destroying the session
  })
  ````

  


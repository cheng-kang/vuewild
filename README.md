# VueWild

> Vue.js bindings for Wilddog

## Install

1. If included as global <script>: will install automatically if global Vue is present.

  ``` html
  <head>
    <!-- Vue -->
    <script src="https://unpkg.com/vue/dist/vue.js"></script>
    <!-- Wilddog -->
    <script src="https://cdn.wilddog.com/sdk/js/2.5.8/wilddog.js"></script>
    <!-- VueWild -->
    <script src="https://unpkg.com/vuewild/dist/vuewild.js"></script>
  </head>
  ```

2. In module environments, e.g CommonJS:

  ``` bash
  npm install vue wilddog vuewild --save
  ```

  ``` js
  var Vue = require('vue')
  var VueWild = require('vuewild')
  var wilddog = require('wilddog')
  
  // explicit installation required in module environments
  Vue.use(VueWild)
  ```

## Usage

``` js
var wilddogApp = wilddog.initializeApp({ ... })
var sync = wilddogApp.sync()
var vm = new Vue({
  el: '#demo',
  wilddog: {
    // simple syntax, bind as an array by default
    anArray: sync.ref('url/to/my/collection'),
    // can also bind to a query
    anotherArray: sync.ref('url/to/my/collection').limitToLast(25),
    // full syntax
    anObject: {
      source: sync.ref('url/to/my/object'),
      // optionally bind as an object
      asObject: true,
      // optionally provide the cancelCallback
      cancelCallback: function () {},
      // this is called once the data has been retrieved from Wilddog
      readyCallback: function () {}
    }
  }
})
```

If you need to access properties from the Vue instance, use the function syntax:

```js
var vm = new Vue({
  el: '#demo',
  wilddog: function () {
    return {
      anArray: sync.ref('url/to/my/collection/')
    }
  }
})
```

⚠️: This function will get executed only once. If you want to have automatic rebind (pretty much like a computed property) use a `$watch` and call `$unbind` and then `$bindAsArray`

**About the cancelCallback**:

> An optional callback that will be notified if your event subscription is ever canceled because your client does not have permission to read this data (or it had permission but has now lost it). This callback will be passed an `Error` object indicating why the failure occurred.

[From Wilddog API Reference](https://docs.wilddog.com/sync/Web/api/Query.html#on)

``` html
<div id="demo">
  <pre>{{ anObject | json }}</pre>
  <ul>
    <li v-for="item in anArray">{{ item.text }}</li>
  </ul>
</div>
```

The above will bind the Vue instance's `anObject` and `anArray` to the respective Wilddog data sources. In addition, the instance also gets the `$wilddogRefs` property, which holds the refs for each binding:

``` js
// add an item to the array
vm.$wilddogRefs.anArray.push({
  text: 'hello'
})
```

Alternatively, you can also manually bind to a Wilddog ref with the `$bindAsObject` or `$bindAsArray` instance methods:

``` js
vm.$bindAsObject('user', myWilddogRef.child('user'))
vm.$bindAsArray('items', myWilddogRef.child('items').limitToLast(25))

// You can also pass cancelCallback and readyCallback callbacks functions as
// a third and fourth arguments. Any of them can be omitted by passing null
vm.$bindAsObject('user', myWilddogRef.child('user'), null, () => console.log('Ready fired!'))

// References are unbound when the component is destroyed but you can manually unbind a reference
// if needed
vm.$unbind('items')
```

To save user-input to your Wilddog database, simply push the data onto `this.$wilddogRefs.items` (instead of `this.items`) within a Vue method to automatically sync with Wilddog.
For example, in your template you could add something simple like

```html
<input v-model="item" placeholder="Add an item"/>
<button @click="addItem">Add item</button>
```

And within your Vue component
```js
export default {
  data () {
    return {
      item: ''
    }
  },
  wilddog: {
    items: sync.ref('items')
  },
  methods: {
    addItem () {
      this.$wilddogRefs.items.push({
        name: this.item
      })
    }
  }
}
```

## Data Normalization

### Array Bindings

Each record in the bound array will contain a `.key` property which specifies the key where the record is stored. So if you have data at `/items/-Jtjl482BaXBCI7brMT8/`, the record for that data will have a `.key` of `"-Jtjl482BaXBCI7brMT8"`.

If an individual record's value in the database is a primitive (boolean, string, or number), the value will be stored in the `.value` property. If the individual record's value is an object, each of the object's properties will be stored as properties of the bound record. As an example, let's assume the `/items/` node you bind to contains the following data:

``` json
{
  "items": {
    "-Jtjl482BaXBCI7brMT8": 100,
    "-Jtjl6tmqjNeAnQvyD4l": {
      "first": "fred",
      "last": "Flintstone"
    },
    "-JtjlAXoQ3VAoNiJcka9": "foo"
  }
}
```

The resulting bound array stored in `vm.items` will be:

``` json
[
  {
    ".key": "-Jtjl482BaXBCI7brMT8",
    ".value": 100
  },
  {
    ".key": "-Jtjl6tmqjNeAnQvyD4l",
    "first": "Fred",
    "last": "Flintstone"
  },
  {
    ".key": "-JtjlAXoQ3VAoNiJcka9",
    ".value": "foo"
  }
]
```

To delete or update an item you can use the `.key` property of a given object. But keep in mind you have to remove the `.key` attribute of the updated object:

``` js
 // Vue instance methods
 deleteItem: function (item) {
   this.$wilddogRefs.items.child(item['.key']).remove()
 },
 updateItem: function (item) { 
   // create a copy of the item
   item = {...item}
   // remove the .key attribute
   delete item['.key']
   this.$wilddogRefs.items.child(item['.key']).set(item)
 } 
```

You can check the full example at [examples/todo-app](examples/todo-app/index.html).

## Contributing

Clone the repo, then:

```bash
$ npm install    # install dependencies
$ npm test       # run test suite with coverage report
$ npm run dev    # watch and build dist/vuewild.js
$ npm run build  # build dist/vuewild.js and vuewild.min.js
```

## License

[MIT](http://opensource.org/licenses/MIT)

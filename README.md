# driveby.js
Simple scroll tracking relative to on-page elements. 

## Function Reference

### `new DriveBy({ options })`

| Option | Description | Type   | Default
|--------|-------------|--------|---------
| **context** | The context; the scrolling parent element | `HTMLElement` | `window`
| **element** | Which element to fire the callbacks on | `HTMLElement`
| **in** | Handler called when the `element` appears on screen (then deferred until `off` is called) | `Function`
| **out** | Handler called when the `element` disappears from the viewport | `Function`
| **handler** | Called as the viewport scrolls through the element | `Function [progress: Object]`

### Instance Methods

```Javascript
var section = document.getElementsByClassName('.section');
var sectionScroll = new DriveBy({
  element: section,
  in: function() {
    console.log('in...');
  },
  out: function() {
    console.log('...out');
  }
});
```

| Function | Arguments | Description
|----------|-----------|-----------
| **remove** | | Unbinds the `onScroll` handler

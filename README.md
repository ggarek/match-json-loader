# Match JSON Loader
Webpack loader to match JSON against given etalon.

# How to use it
It is convenient to use it as preloader for your json files.
Alternatively it can be run before json loader, because match-json-loader does not modify source.

Let assume that you want to verify locales in your app.
If you have a directory hierarchy:

```
src/
  locales/
    en.json
    de.json
    pt.json
```

Then you can add match-json-loader to your webpack config, like this:

```javascript
const config = {
  //...
   module: {
      preLoaders: [
        {
          test: /\.json$/,
          loader: 'match-json-loader?etalon=en',
          include: path.join(__dirname, 'src/locales')),
        },
        // ...
      ]
    }
}
```

And it will match every ``*.json` file under `src/locales/` to match with `en.json`. Thats it.

# Options

## etalon: string
It is mandatory option. The etalon file to use like a... like an etalon! That is to say, any other json will be matched against the etalon.
It must be a file name under same directory as the other files you want to match. May not specify `.json` extension.

## matchTypes: bool
Is `true` by default. If the option is true, the loader will check if the property value type matches the etalon.

## excessKeys: bool
Is `true` by default. If the option is true, the keys that are in matched json, but not in the etalon will be reported.

# Configuration examples

Do not report excess keys and do not match types of properties
`match-json-loader?etalon=en&excessKeys=false&matchTypes=false`

# Leaflet.draw-box
Leaflet Draw support for leaflet.box inspired by [Leaflet.ellipse](https://github.com/haleystorm/Leaflet.draw-ellipse). Check out the [Demo](https://jjwtay.github.io/Leaflet.draw-box/).

# Important
Leaflet.draw-box requires 

+ [Leaflet 0.7](https://github.com/Leaflet/Leaflet/releases/tag/v0.7) or higher
+ [Leaflet.draw 0.2.4](https://github.com/Leaflet/Leaflet.draw/releases/tag/v0.2.4) or higher
+ [leaflet.box](https://github.com/jjwtay/leaflet.box)

## How to

*Traditional*

    Include Leaflet.draw-box.js in your html

    <script src='/path/to/leaflet.box.js'></script>
    <script src='/path/to/Leaflet.draw-box.js'></script>

*Webpack as non es6 module*

    import './path/to/leaflet.box'
    import './path/to/Leaflet.draw-box'

*ES6 module*

    TODO

## Usage

See [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw#using) and [leaflet.box](https://github.com/jjwtay/leaflet.box)

Creating:

    new L.Draw.Box(map, options*).enable()

    new L.Draw.Rect(map, options*).enable()

    * Where options are the same structure as for Leaflet.draw

Toggling:

    myRect.editing.enable()

    myRect.editing.disable()

## Checkout

[leaflet.arc](https://github.com/jjwtay/leaflet.arc) - Leaflet Arc drawing.

[leaflet.draw-arc](https://github.com/jjwtay/leaflet.draw-arc) - Leaflet Draw support for leaflet.arc.

[leaflet.sector](https://github.com/jjwtay/leaflet.sector) - Leaflet Sector drawing.

[leaflet.draw-sector](https://github.com/jjwtay/leaflet.draw-sector) - Leaflet Draw support for leaflet.sector.

## License

This code is provided under the Apache 2.0 license.
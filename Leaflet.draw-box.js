L.DrawToolbar.prototype.options.box = L.DrawToolbar.prototype.options.rectangle;

L.DrawToolbar.prototype.getModeHandlers = function (map) {
    return [{
        enabled: this.options.polyline,
        handler: new L.Draw.Polyline(map, this.options.polyline),
        title: L.drawLocal.draw.toolbar.buttons.polyline
    }, {
        enabled: this.options.polygon,
        handler: new L.Draw.Polygon(map, this.options.polygon),
        title: L.drawLocal.draw.toolbar.buttons.polygon
    }, {
        enabled: this.options.rectangle,
        handler: new L.Draw.Rectangle(map, this.options.rectangle),
        title: L.drawLocal.draw.toolbar.buttons.rectangle
    }, {
        enabled: this.options.circle,
        handler: new L.Draw.Circle(map, this.options.circle),
        title: L.drawLocal.draw.toolbar.buttons.circle
    }, {
        enabled: this.options.marker,
        handler: new L.Draw.Marker(map, this.options.marker),
        title: L.drawLocal.draw.toolbar.buttons.marker
    }, {
        enabled: this.options.box,
        handler: new L.Draw.Box(map, {}),
        title: L.drawLocal.draw.toolbar.buttons.box
    }];
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

L.Draw.Box = L.Draw.SimpleShape.extend({
    statics: {
        TYPE: 'box'
    },

    options: {
        shapeOptions: {
            stroke: true,
            color: '#f06eaa',
            weight: 4,
            opacity: 0.5,
            fill: true,
            fillColor: null, //same as color by default
            fillOpacity: 0.2,
            clickable: true
        },
        showRadius: true,
        metric: true // Whether to use the metric measurement system or imperial
    },

    initialize: function initialize(map, options) {
        // Save the type so super can fire, need to do this as cannot do this.TYPE :(
        this.type = L.Draw.Box.TYPE;

        this._initialLabelText = L.drawLocal.draw.handlers.box.tooltip.start;

        L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
    },
    _drawShape: function _drawShape(latlng) {
        var width = void 0,
            length = void 0,
            height = void 0,
            bounds = void 0;

        if (!this._shape) {

            width = Math.max(this._startLatLng.distanceTo(latlng), 10), length = width;

            this._shape = L.box(_extends({
                center: this._startLatLng,
                width: width,
                length: length,
                bearing: 0
            }, this.options.shapeOptions));
            this._map.addLayer(this._shape);
        } else {
            bounds = new L.LatLngBounds(this._startLatLng, latlng);
            width = 2 * bounds.getNorthWest().distanceTo(bounds.getNorthEast());
            height = width;

            this._shape.setWidth(width);
            this._shape.setLength(height);
            this._shape.setLatLngs(this._shape.getLatLngs());
        }
    },
    _fireCreatedEvent: function _fireCreatedEvent() {
        var box = L.box(_extends({}, this.options.shapeOptions, {
            center: this._startLatLng,
            width: this._shape.getWidth(),
            length: this._shape.getLength(),
            bearing: this._shape.getBearing()
        }));

        L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, box);
    },
    _onMouseMove: function _onMouseMove(e) {
        var latlng = e.latlng,
            showRadius = this.options.showRadius;

        var radius = void 0;

        this._tooltip.updatePosition(latlng);
        if (this._isDrawing) {
            this._drawShape(latlng);

            radius = this._shape.getWidth();

            this._tooltip.updateContent({
                text: this._endLabelText,
                subtext: showRadius ? L.drawLocal.draw.handlers.box.radius + ': ' + radius : ''
            });
        }
    }
});

L.Draw.Rect = L.Draw.Box.extend({
    statics: {
        TYPE: 'rect'
    },
    initialize: function initialize(map, options) {
        // Save the type so super can fire, need to do this as cannot do this.TYPE :(
        this.type = L.Draw.Rect.TYPE;

        this._initialLabelText = L.drawLocal.draw.handlers.box.tooltip.start;

        L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
    },
    _fireCreatedEvent: function _fireCreatedEvent() {
        var box = L.rect(_extends({}, this.options.shapeOptions, {
            center: this._startLatLng,
            width: this._shape.getWidth(),
            length: this._shape.getLength()
        }));

        L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, box);
    }
});

L.Edit = L.Edit || {};

L.Edit.Box = L.Edit.SimpleShape.extend({
    statics: {
        EDITABLES: {
            center: true,
            bearing: true,
            width: true,
            length: true
        }
    },
    options: {
        moveIcon: new L.DivIcon({
            iconSize: new L.Point(8, 8),
            className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
        }),
        resizeIcon: new L.DivIcon({
            iconSize: new L.Point(8, 8),
            className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize'
        }),
        rotateIcon: new L.DivIcon({
            iconSize: new L.Point(8, 8),
            className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-rotate'
        })
    },

    _initMarkers: function _initMarkers() {
        if (!this._markerGroup) {
            this._markerGroup = new L.LayerGroup();
        }
        this._editables = _extends({}, L.Edit.Box.EDITABLES, this._shape.options.editables);

        // Create center marker
        this._createMoveMarker();

        // Create edge marker
        this._createResizeMarker();

        // Create rotate Marker();
        this._createRotateMarker();
    },
    _createMoveMarker: function _createMoveMarker() {

        var center = this._shape.getCenter();

        this._moveMarker = this._createMarker(center, this.options.moveIcon);

        this._moveMarker.options.draggable = this._shape.moveable;

        this._moveMarker.setOpacity(this._shape.moveable ? 1.0 : 0.0);
    },
    _createResizeMarker: function _createResizeMarker() {
        var _this = this;

        this._resizeMarkers = this._shape.getLatLngs()[0].map(function (latLng) {
            return _this._createMarker(latLng, _this.options.resizeIcon);
        }).map(function (marker, index) {
            marker.options.draggable = _this._shape.wideable || _this._shape.lengthable;

            marker.setOpacity(_this._shape.wideable || _this._shape.lengthable ? 1.0 : 0.0);

            switch (index) {

                case 0:
                    return Object.assign(marker, { position: 'top-left' });
                case 1:
                    return Object.assign(marker, { position: 'top-right' });
                case 2:
                    return Object.assign(marker, { position: 'bottom-right' });
                case 3:
                    return Object.assign(marker, { position: 'bottom-left' });
                default:
                    return marker;
            }
        });
    },
    _createRotateMarker: function _createRotateMarker() {
        var center = this._shape.getCenter(),
            rotatemarkerPoint = this._getRotateMarkerPoint(center);

        this._rotateMarker = this._createMarker(rotatemarkerPoint, this.options.rotateIcon);
        this._rotateMarker.options.draggable = this._shape.rotatable;

        this._rotateMarker.setOpacity(this._shape.rotatable ? 1.0 : 0.0);
    },
    _getRotateMarkerPoint: function _getRotateMarkerPoint() {
        var moveLatLng = this._moveMarker.getLatLng(),
            br = this._shape.computeDestinationPoint(moveLatLng, this._shape.getLength() * 1.5 / 2, this._shape.getBearing());
        return br;
    },
    _onMarkerDragStart: function _onMarkerDragStart(e) {
        L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, e);
        this._currentMarker = e.target;
    },
    _onMarkerDrag: function _onMarkerDrag(e) {
        var marker = e.target,
            latlng = marker.getLatLng();

        if (marker === this._moveMarker) {
            this._move(latlng);
        } else if (marker === this._rotateMarker) {
            this._rotate(latlng);
        } else {
            this._resize(latlng);
        }

        this._shape.redraw();
    },
    _move: function _move(latlng) {
        this._shape.setCenter(latlng);
        this._shape.setLatLngs(this._shape.getLatLngs());

        // Move the resize marker
        this._repositionResizeMarkers();

        // Move the rotate marker
        this._repositionRotateMarker();
    },
    _rotate: function _rotate(latlng) {
        var moveLatLng = this._moveMarker.getLatLng(),
            pc = this._map.project(moveLatLng),
            ph = this._map.project(latlng),
            v = [ph.x - pc.x, ph.y - pc.y],
            newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI;

        this._shape.setBearing(newB);
        this._shape.setLatLngs(this._shape.getLatLngs());

        // Move the resize marker
        this._repositionResizeMarkers();

        // Move the rotate marker
        this._repositionRotateMarker();
    },
    _resize: function _resize(latlng) {
        var moveLatLng = this._moveMarker.getLatLng(),
            center = this._map.project(moveLatLng),
            corner = this._map.project(latlng),
            bearing = this._map.project(this._rotateMarker._latlng),
            bearingVector = [bearing.x - center.x, bearing.y - center.y],
            cornerVector = [corner.x - center.x, corner.y - center.y],
            bearingRadius = Math.sqrt(Math.pow(bearingVector[0], 2) + Math.pow(bearingVector[1], 2)),
            dp = bearingVector[0] * cornerVector[0] + bearingVector[1] * cornerVector[1],
            newPointVector = [dp * bearingVector[0] / Math.pow(bearingRadius, 2), dp * bearingVector[1] / Math.pow(bearingRadius, 2)],
            newPoint = new L.Point(center.x + newPointVector[0], center.y + newPointVector[1]),
            newlatlng = this._map.unproject(newPoint),
            length = 2 * moveLatLng.distanceTo(newlatlng),
            width = 2 * latlng.distanceTo(newlatlng);

        if (this._shape.wideable) {
            this._shape.setWidth(width);
        }
        if (this._shape.lengthable) {
            this._shape.setLength(length);
        }

        this._shape.setLatLngs(this._shape.getLatLngs());

        // Move the resize marker
        this._repositionResizeMarkers();
        // Move the rotate marker
        this._repositionRotateMarker();
    },
    _repositionResizeMarkers: function _repositionResizeMarkers() {
        var _this2 = this;

        this._shape.getLatLngs()[0].forEach(function (latlng, index) {
            _this2._resizeMarkers[index].setLatLng(latlng);
        });
    },
    _repositionRotateMarker: function _repositionRotateMarker() {
        //if (!this._editables.bearing) return
        var latlng = this._moveMarker.getLatLng(),
            rotatemarkerPoint = this._getRotateMarkerPoint(latlng);

        this._rotateMarker.setLatLng(rotatemarkerPoint);
    }
});

L.Box.addInitHook(function () {
    if (L.Edit.Box) {
        this.editing = new L.Edit.Box(this);

        if (this.options.editable) {
            this.editing.enable();
        }
    }

    this.on('add', function () {
        if (this.editing && this.editing.enabled()) {
            this.editing.addHooks();
        }
    });

    this.on('remove', function () {
        if (this.editing && this.editing.enabled()) {
            this.editing.removeHooks();
        }
    });
});

L.drawLocal.draw.toolbar.buttons.box = 'Draw a Box';

L.drawLocal.draw.handlers.box = {
    tooltip: {
        start: 'Click and drag to draw box.'
    },
    radius: 'Width (meters): '
};

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
		if (!this._shape) {
			var radius = this._startLatLng.distanceTo(latlng);
			this._shape = L.box(_extends({
				center: this._startLatLng,
				width: this._shape._mRadiusX,
				length: this._shape._mRadiusY
			}, this.options.shapeOptions));
			//this._shape = new L.Ellipse(this._startLatLng, [radius, radius], 0, this.options.shapeOptions);
			this._map.addLayer(this._shape);
		} else {
			//var radius = this._startLatLng.distanceTo(latlng);
			//this._shape.setRadius([radius, radius]);
			console.log('what ? ');
		}
	},

	_fireCreatedEvent: function _fireCreatedEvent() {
		var box = L.box(_extends({
			center: this._startLatLng,
			width: this._shape._mRadiusX,
			length: this._shape._mRadiusY
		}, this.options.shapeOptions));
		//var ellipse = new L.Ellipse(this._startLatLng, [this._shape._mRadiusX, this._shape._mRadiusY], 0, this.options.shapeOptions);
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, box);
	},

	_onMouseMove: function _onMouseMove(e) {
		var latlng = e.latlng,
		    showRadius = this.options.showRadius,
		    useMetric = this.options.metric,
		    radius;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._drawShape(latlng);

			// Get the new radius (rounded to 1 dp)
			radius = this._shape._mRadiusX.toFixed(1);

			this._tooltip.updateContent({
				text: this._endLabelText,
				subtext: showRadius ? L.drawLocal.draw.handlers.ellipse.radius + ': ' + L.GeometryUtil.readableDistance(radius, useMetric) : ''
			});
		}
	}
});

L.Edit = L.Edit || {};

L.Edit.Box = L.Edit.SimpleShape.extend({
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

		// Create center marker
		this._createMoveMarker();

		// Create edge marker
		this._createResizeMarker();

		// Create rotate Marker();
		this._createRotateMarker();
	},

	_createMoveMarker: function _createMoveMarker() {
		//var center = this._shape.getLatLng();
		var center = this._shape.getCenter();
		//this._moveMarker = this._createMarker(center, this.options.moveIcon);
		this._moveMarker = this._createMarker(center, this.options.moveIcon);
	},

	_createResizeMarker: function _createResizeMarker() {
		var _this = this;

		var center = this._shape.getCenter();
		//var center = this._shape.getLatLng(),
		/*resizemarkerPointX1 = this._getResizeMarkerPointX1(center),
  resizemarkerPointX2 = this._getResizeMarkerPointX2(center),
  resizemarkerPointY1 = this._getResizeMarkerPointY1(center),
  resizemarkerPointY2 = this._getResizeMarkerPointY2(center);*/

		this._resizeMarkers = this._shape.getLatLngs()[0].map(function (latLng) {
			return _this._createMarker(latLng, _this.options.resizeIcon);
		}).map(function (marker, index) {

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

		/*this._resizeMarkers = [];
  this._resizeMarkers.push(this._createMarker(resizemarkerPointX1, this.options.resizeIcon));
  this._resizeMarkers.push(this._createMarker(resizemarkerPointX2, this.options.resizeIcon));
  this._resizeMarkers.push(this._createMarker(resizemarkerPointY1, this.options.resizeIcon));
  this._resizeMarkers.push(this._createMarker(resizemarkerPointY2, this.options.resizeIcon));
  this._resizeMarkers[0]._isX = true;
  this._resizeMarkers[1]._isX = true;
  this._resizeMarkers[2]._isX = false;
  this._resizeMarkers[3]._isX = false;*/
	},

	_createRotateMarker: function _createRotateMarker() {
		/*var center = this._shape.getLatLng(),
  	rotatemarkerPoint = this._getRotateMarkerPoint(center);
  
  this._rotateMarker = this._createMarker(rotatemarkerPoint, this.options.rotateIcon);*/

		var center = this._shape.getCenter();

		var rotatemarkerPoint = this._getRotateMarkerPoint(center);

		this._rotateMarker = this._createMarker(rotatemarkerPoint, this.options.rotateIcon);
	},

	/*_getResizeMarkerPointX1: function (latlng) {
 	var tilt = this._shape._tiltDeg * L.LatLng.DEG_TO_RAD;
 	var radius = this._shape._radiusX;
 	var xDelta = radius * Math.cos(tilt);
 	var yDelta = radius * Math.sin(tilt);
 	var point = this._map.project(latlng);
 	return this._map.unproject([point.x + xDelta, point.y + yDelta]);
 },
 
 _getResizeMarkerPointX2: function (latlng) {
 	var tilt = this._shape._tiltDeg * L.LatLng.DEG_TO_RAD;
 	var radius = this._shape._radiusX;
 	var xDelta = radius * Math.cos(tilt);
 	var yDelta = radius * Math.sin(tilt);
 	var point = this._map.project(latlng);
 	return this._map.unproject([point.x - xDelta, point.y - yDelta]);
 },
 
 _getResizeMarkerPointY1: function (latlng) {
 	var tilt = this._shape._tiltDeg * L.LatLng.DEG_TO_RAD;
 	var radius = this._shape._radiusY;
 	var xDelta = radius * Math.sin(tilt);
 	var yDelta = radius * Math.cos(tilt);
 	var point = this._map.project(latlng);
 	return this._map.unproject([point.x - xDelta, point.y + yDelta]);
 },
 
 _getResizeMarkerPointY2: function (latlng) {
 	var tilt = this._shape._tiltDeg * L.LatLng.DEG_TO_RAD;
 	var radius = this._shape._radiusY;
 	var xDelta = radius * Math.sin(tilt);
 	var yDelta = radius * Math.cos(tilt);
 	var point = this._map.project(latlng);
 	return this._map.unproject([point.x + xDelta, point.y - yDelta]);
 },*/

	_getRotateMarkerPoint: function _getRotateMarkerPoint(latlng) {
		//var tilt = this._shape._tiltDeg * L.LatLng.DEG_TO_RAD;
		var tilt = this._shape.getBearing() * Math.PI / 180;
		//var radius = this._shape._radiusX + 20;
		//var radius = this._shape._length + 20
		var left = [this._shape.getLatLngs()[0][0], this._shape.getLatLngs()[0][3]];

		var tl = this._map.project(left[0]);
		var bl = this._map.project(left[1]);

		var radius = Math.sqrt(Math.pow(tl.x - bl.x, 2) + Math.pow(tl.y - bl.y, 2));

		var xDelta = radius * Math.cos(tilt);
		var yDelta = radius * Math.sin(tilt);

		var point = this._map.project(latlng);

		return this._map.unproject([point.x - xDelta, point.y - yDelta]);
	},

	_onMarkerDragStart: function _onMarkerDragStart(e) {
		L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, e);
		this._currentMarker = e.target;
	},

	_onMarkerDrag: function _onMarkerDrag(e) {
		var marker = e.target,
		    latlng = marker.getLatLng();

		if (marker === this._moveMarker) {
			//console.log('move')
			this._move(latlng);
		} else if (marker === this._rotateMarker) {
			this._rotate(latlng);
		} else {
			this._resize(latlng);
		}

		this._shape.redraw();
	},

	_move: function _move(latlng) {
		// Move the ellipse
		//this._shape.setLatLng(latlng);
		this._shape.setCenter(latlng);
		this._shape.setLatLngs(this._shape.getLatLngs());
		//console.log(this._shape.getCenter())

		// Move the resize marker
		this._repositionResizeMarkers();

		// Move the rotate marker
		this._repositionRotateMarker();
	},

	_rotate: function _rotate(latlng) {
		var moveLatLng = this._moveMarker.getLatLng();
		var point = this._map.project(latlng);
		var movePoint = this._map.project(moveLatLng);
		var xLatLng = this._map.unproject([point.x, movePoint.y]);
		var radius = moveLatLng.distanceTo(latlng);
		var xDelta = moveLatLng.distanceTo(xLatLng);

		if (movePoint.y.toFixed(1) === point.y.toFixed(1)) {
			var tilt = 0;
			// Rotate the ellipse
			//this._shape.setTilt(tilt);
			this._shape.setBearing(tilt);
		} else if (movePoint.x.toFixed(1) === point.x.toFixed(1)) {
			var tilt = 90;
			// Rotate the ellipse
			//this._shape.setTilt(tilt);
			this._shape.setBearing(tilt);
		} else if (xDelta < radius) {
			var tilt = Math.acos(xDelta / radius) * 180 / Math.PI; //L.LatLng.RAD_TO_DEG;
			if (point.x > movePoint.x) {
				tilt = 180 - tilt;
			}
			if (point.y > movePoint.y) {
				tilt = -1 * tilt;
			}
			// Rotate the ellipse
			//this._shape.setTilt(tilt);
			this._shape.setBearing(tilt);
		}
		this._shape.setLatLngs(this._shape.getLatLngs());

		// Move the resize marker
		this._repositionResizeMarkers();

		// Move the rotate marker
		this._repositionRotateMarker();
	},

	_resize: function _resize(latlng) {
		var moveLatLng = this._moveMarker.getLatLng();
		//var radius = moveLatLng.distanceTo(latlng);
		/*if(this._currentMarker._isX) {
  	this._shape.setRadius([radius, this._shape._mRadiusY]);
  } else {
  	this._shape.setRadius([this._shape._mRadiusX, radius]);
  }*/
		var topMarkers = this._resizeMarkers.filter(function (marker) {
			return marker.position === 'top-left' || marker.position === 'top-right';
		});
		var leftMarkers = this._resizeMarkers.filter(function (marker) {
			return marker.position === 'top-left' || marker.position === 'bottom-left';
		});
		console.log(topMarkers);

		var width = topMarkers[0]._latlng.distanceTo(topMarkers[1]._latlng);
		var length = leftMarkers[0]._latlng.distanceTo(leftMarkers[1]._latlng);
		console.log(this._shape.getWidth(), this._shape.getLength(), width, length);
		this._shape.setWidth(length);
		this._shape.setLength(width);

		// Move the resize marker
		this._repositionResizeMarkers();
		// Move the rotate marker
		this._repositionRotateMarker();
	},

	_repositionResizeMarkers: function _repositionResizeMarkers() {
		var _this2 = this;

		/*var latlng = this._moveMarker.getLatLng();
  var resizemarkerPointX1 = this._getResizeMarkerPointX1(latlng);
  var resizemarkerPointX2 = this._getResizeMarkerPointX2(latlng);
  var resizemarkerPointY1 = this._getResizeMarkerPointY1(latlng);
  var resizemarkerPointY2 = this._getResizeMarkerPointY2(latlng);
  	this._resizeMarkers[0].setLatLng(resizemarkerPointX1);
  this._resizeMarkers[1].setLatLng(resizemarkerPointX2);
  this._resizeMarkers[2].setLatLng(resizemarkerPointY1);
  this._resizeMarkers[3].setLatLng(resizemarkerPointY2);*/
		this._shape.getLatLngs()[0].forEach(function (latlng, index) {
			_this2._resizeMarkers[index].setLatLng(latlng);
		});
	},

	_repositionRotateMarker: function _repositionRotateMarker() {
		var latlng = this._moveMarker.getLatLng();
		var rotatemarkerPoint = this._getRotateMarkerPoint(latlng);

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

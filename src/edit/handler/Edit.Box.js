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
	
	_initMarkers: function () {
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
	
	_createMoveMarker: function () {
		//var center = this._shape.getLatLng();
        let center = this._shape.getCenter()
		//this._moveMarker = this._createMarker(center, this.options.moveIcon);
        this._moveMarker = this._createMarker(center, this.options.moveIcon)
	},

	_createResizeMarker: function () {
		var center = this._shape.getCenter()

        this._resizeMarkers = this._shape.getLatLngs()[0]
                                .map(latLng => this._createMarker(latLng, this.options.resizeIcon))
                                .map((marker, index) => {
               
                                    switch (index) {

                                    case 0: return Object.assign(marker, {position: 'top-left'})
                                    case 1: return Object.assign(marker, {position: 'top-right'})
                                    case 2: return Object.assign(marker, {position: 'bottom-right'})
                                    case 3: return Object.assign(marker, {position: 'bottom-left'})
                                    default:
                                        return marker
                                    }
                                })

	},
	
	_createRotateMarker: function() {
		var center = this._shape.getCenter()

        var rotatemarkerPoint = this._getRotateMarkerPoint(center)

        this._rotateMarker = this._createMarker(rotatemarkerPoint, this.options.rotateIcon)
	},

	_getRotateMarkerPoint: function (latlng) {
		let moveLatLng = this._moveMarker.getLatLng()
		let br = this._shape.computeDestinationPoint(moveLatLng, this._shape.getLength() * 1.5 / 2, this._shape.getBearing())
		return br
	},
	
	_onMarkerDragStart: function (e) {
		L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, e);
		this._currentMarker = e.target;
	},
	
	_onMarkerDrag: function (e) {
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

	_move: function (latlng) {
        this._shape.setCenter(latlng)
        this._shape.setLatLngs(this._shape.getLatLngs())
		
		// Move the resize marker
		this._repositionResizeMarkers();
		
		// Move the rotate marker
		this._repositionRotateMarker();
	},
	
	_rotate: function (latlng) {

		let moveLatLng = this._moveMarker.getLatLng()
		let pc = this._map.project(moveLatLng)
		let ph = this._map.project(latlng)
		let v = [ph.x - pc.x, ph.y - pc.y]

		let newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI

		this._shape.setBearing(newB)
        this._shape.setLatLngs(this._shape.getLatLngs())
		
		// Move the resize marker
		this._repositionResizeMarkers();
		
		// Move the rotate marker
		this._repositionRotateMarker();
	},

	_resize: function (latlng) {
		var moveLatLng = this._moveMarker.getLatLng();
		var radius = moveLatLng.distanceTo(latlng)

		let center = this._map.project(moveLatLng)
		let corner = this._map.project(latlng)
		let bearing = this._map.project(this._rotateMarker._latlng)

		let bearingVector = [bearing.x - center.x, bearing.y - center.y]
		let cornerVector = [corner.x - center.x, corner.y - center.y]

		let vradius = Math.sqrt(Math.pow(cornerVector[0], 2) + Math.pow(cornerVector[1], 2))
		let bearingRadius = Math.sqrt(Math.pow(bearingVector[0], 2) + Math.pow(bearingVector[1], 2))
		let dp = bearingVector[0] * cornerVector[0] + bearingVector[1] * cornerVector[1]

		let newPointVector = [dp * bearingVector[0]/Math.pow(bearingRadius, 2), dp * bearingVector[1]/Math.pow(bearingRadius,2)]

		let newPoint = new L.Point(
			center.x + newPointVector[0],
			center.y + newPointVector[1]
		)

		let newlatlng = this._map.unproject(newPoint)

		let length = 2 * moveLatLng.distanceTo(newlatlng)
		let width = 2* latlng.distanceTo(newlatlng)

		this._shape.setWidth(width)
		this._shape.setLength(length)
		this._shape.setLatLngs(this._shape.getLatLngs())

		// Move the resize marker
		this._repositionResizeMarkers();
		// Move the rotate marker
		this._repositionRotateMarker();
	},
	
	_repositionResizeMarkers: function () {
        this._shape.getLatLngs()[0]
            .forEach((latlng, index) => {
                this._resizeMarkers[index].setLatLng(latlng)
            })
	},
	
	_repositionRotateMarker: function () {
		var latlng = this._moveMarker.getLatLng();
		var rotatemarkerPoint = this._getRotateMarkerPoint(latlng)
		
		this._rotateMarker.setLatLng(rotatemarkerPoint)
	}
});

L.Box.addInitHook(function () {
	if (L.Edit.Box) {
		this.editing = new L.Edit.Box(this)

		if (this.options.editable) {
			this.editing.enable()
		}
	}

	this.on('add', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.addHooks()
		}
	})

	this.on('remove', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.removeHooks()
		}
	})
})
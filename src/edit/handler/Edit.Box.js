L.Edit = L.Edit || {}

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
        }),
    },

    _initMarkers () {
        if (!this._markerGroup) {
            this._markerGroup = new L.LayerGroup()
        }
        this._editables = {...L.Edit.Box.EDITABLES, ...this._shape.options.editables}

        // Create center marker
        this._createMoveMarker()

        // Create edge marker
        this._createResizeMarker()

        // Create rotate Marker();
        this._createRotateMarker()
    },

    _createMoveMarker () {

        const center = this._shape.getCenter()

        this._moveMarker = this._createMarker(center, this.options.moveIcon)

        this._moveMarker.options.draggable = this._shape.moveable

        this._moveMarker.setOpacity(this._shape.moveable ? 1.0 : 0.0)
    },

    _createResizeMarker () {
        this._resizeMarkers = this._shape.getLatLngs()[0]
            .map((latLng) => this._createMarker(latLng, this.options.resizeIcon))
            .map((marker, index) => {
                marker.options.draggable = (this._shape.wideable || this._shape.lengthable)

                marker.setOpacity(this._shape.wideable || this._shape.lengthable ? 1.0 : 0.0)

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

    _createRotateMarker () {
        const center = this._shape.getCenter(),
            rotatemarkerPoint = this._getRotateMarkerPoint(center)

        this._rotateMarker = this._createMarker(rotatemarkerPoint, this.options.rotateIcon)
        this._rotateMarker.options.draggable = this._shape.rotatable

        this._rotateMarker.setOpacity(this._shape.rotatable ? 1.0 : 0.0)
    },

    _getRotateMarkerPoint () {
        const moveLatLng = this._moveMarker.getLatLng(),
            br = this._shape.computeDestinationPoint(moveLatLng, this._shape.getLength() * 1.5 / 2, this._shape.getBearing())
        return br
    },

    _onMarkerDragStart (e) {
        L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, e)
        this._currentMarker = e.target
    },

    _onMarkerDrag (e) {
        const marker = e.target,
            latlng = marker.getLatLng()

        if (marker === this._moveMarker) {
            this._move(latlng)
        } else if (marker === this._rotateMarker) {
            this._rotate(latlng)
        } else {
            this._resize(latlng)
        }

        this._shape.redraw()
    },

    _move (latlng) {
        this._shape.setCenter(latlng)
        this._shape.setLatLngs(this._shape.getLatLngs())

        // Move the resize marker
        this._repositionResizeMarkers()

        // Move the rotate marker
        this._repositionRotateMarker()
    },

    _rotate (latlng) {
        const moveLatLng = this._moveMarker.getLatLng(),
            pc = this._map.project(moveLatLng),
            ph = this._map.project(latlng),
            v = [ph.x - pc.x, ph.y - pc.y],
            newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI

        this._shape.setBearing(newB)
        this._shape.setLatLngs(this._shape.getLatLngs())

        // Move the resize marker
        this._repositionResizeMarkers()

        // Move the rotate marker
        this._repositionRotateMarker()
    },

    _resize (latlng) {
        const moveLatLng = this._moveMarker.getLatLng(),
            center = this._map.project(moveLatLng),
            corner = this._map.project(latlng),
            bearing = this._map.project(this._rotateMarker._latlng),
            bearingVector = [bearing.x - center.x, bearing.y - center.y],
            cornerVector = [corner.x - center.x, corner.y - center.y],
            bearingRadius = Math.sqrt(Math.pow(bearingVector[0], 2) + Math.pow(bearingVector[1], 2)),
            dp = bearingVector[0] * cornerVector[0] + bearingVector[1] * cornerVector[1],
            newPointVector = [dp * bearingVector[0]/Math.pow(bearingRadius, 2), dp * bearingVector[1]/Math.pow(bearingRadius,2)],

            newPoint = new L.Point(
                center.x + newPointVector[0],
                center.y + newPointVector[1]
            ),

            newlatlng = this._map.unproject(newPoint),

            length = 2 * moveLatLng.distanceTo(newlatlng),
            width = 2* latlng.distanceTo(newlatlng)

        if (this._shape.wideable) {
            this._shape.setWidth(width)
        }
        if (this._shape.lengthable) {
            this._shape.setLength(length)
        }

        this._shape.setLatLngs(this._shape.getLatLngs())

        // Move the resize marker
        this._repositionResizeMarkers()
        // Move the rotate marker
        this._repositionRotateMarker()
    },

    _repositionResizeMarkers () {
        this._shape.getLatLngs()[0]
            .forEach((latlng, index) => {
                this._resizeMarkers[index].setLatLng(latlng)
            })
    },

    _repositionRotateMarker () {
        //if (!this._editables.bearing) return
        const latlng = this._moveMarker.getLatLng(),
            rotatemarkerPoint = this._getRotateMarkerPoint(latlng)

        this._rotateMarker.setLatLng(rotatemarkerPoint)
    }
})

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
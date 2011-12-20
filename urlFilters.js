/**
 * Filters object
 * 
 * Dependencies: HashUrl (urlHash.js)
 * 
 * @author abyr (abyrcheg@gmail.com)
 */
FiltersUrl = function(config) {

    if (typeof HashUrl === 'undefined') {
        alert("FiltersUrl Error. HashUrl is undefined.")
        return false
    }

    var filters = config.filters
    var containers = config.containers

    if (filters) {
        for (var prop in filters) {
            this._filters[prop] = filters[prop];
        }
    }
    if (containers) {
        for (var cont in containers) {
            this._containers[cont] = containers[cont];
        }
    }
    
    if (config.autoApply) {
        this._options.autoApply = true
    }
    
}

 
FiltersUrl.prototype = {

    _options : {
        autoApply : false
    },

    /**
     * List of properties going to use
     * in all updated via AJAX elements which are related of hash
     */
    _filters : {},

    /**
    * elements which related to hash filters
    */
    _containers : {},

    /**
    * Main constructor
    * need to be called if DOM or visibility was changed
    */
    init : function(simple) {
        that = this
        //set DOM elements to use later
        for (element in that._containers) {
            var id = that._containers[element].id
            if (id) {
                that._containers[element].element = $("#"+id)
            } else {
                that._containers[element].element = false
            }
        }

        if (!simple) simple = false

        if (that._options.autoApply) {
            //get hash params
            this.update(simple)
        }

        return false
    },

    /**
    * get stored filter from this
    */
    getFilter : function(name) {
        return this._filters[name].value
    },

    /**
    * get from hash
    */
    getHashFilter : function(name, def){
        if (!def) def = ""
        return HashUrl.getHashParam(name, def)
    },

    /**
    * renew filter by name
    */
    updateFilter : function(name) {
        var newValue = this.getHashFilter(this._filters[name].key);
        var needed = (this._filters[name].value != newValue)
        if (needed) {
            this._filters[name].value = newValue;
        }
        return needed    
    },

    /**
    * main hardworker
    * renew all filters and update AJAX-updated elements
    * only if some hash param has new value
    */
    update : function(simple) {
        that = this
        if (!simple) {
            simple = false
        }
        //AJAX elements to update
        var relsToUpdate = new Array()
        //all filters
        for (filter in this._filters) {
            if (!simple) {
                //if value was new
                if (this.updateFilter(filter)) {
                    //related elements
                    var rels = this._filters[filter].rels
                    for (rel in rels) {
                        var relName = rels[rel];
                        //store name of related element
                        relsToUpdate[relName] = true
                    }
                }
            } else {
                //same but without check new value
                this.updateFilter(filter)
                var rels = this._filters[filter].rels
                for (rel in rels) {
                    var relName = rels[rel];
                    //store name of related element
                    relsToUpdate[relName] = true
                }
            }
        }
        if (relsToUpdate) {
            /**
            * update related elements making AJAX call
            */
            for (rel in relsToUpdate) {
                that._updateContainer(rel)
            }
        }
    },

    _updateContainer : function(alias) {
        that = this
        id = "#" + this._containers[alias].id + ":visible";
        if (!$(id).size()) {
            //source is invisible
            return false;
        }
        //custom update
        fxUpdate = this._containers[alias].update
        if (fxUpdate && fxUpdate != "undefined") {
            return fxUpdate()
        }
        
        return that._updateConteinerDefault(alias)
    },

    /**
    * default update processor
    */
    _updateConteinerDefault : function(alias) {
        that = this
        var item = this._containers[alias]
        return $.ajax({
            url: baseUrl + item.src,
            dataType: "html",
            async: false,
            data: that.requestFilters(alias),
            method: "GET",
            beforeSend: function() {
                $("#" + item.id).html("");
            },
            success: function(resp) {
                $("#" + item.id).html(resp);
            },
            error: function() {
                $("#" + item.id).html("");
            }

        });

    },

    /**
     * compose element's request params into "key=value&..." string 
     */
    requestFilters : function(alias)
    {
        var data = ""
        var item = this._containers[alias]
        if (item) {
            for (param in item.filters) {
                var fk = item.filters[param]
                var pk = that._filters[fk].key
                var pv = that._filters[fk].value
                if (pk && pv) {
                    data += pk + "=" + pv + "&"
                }
            }
        }
        return data
    },

    /**
    * compose params into "key=value&..." string
    */
    toString : function() {
        var data = ""
        for (filter in this._filters) {
            if (this._filters[filter].value) {
                if (data != "") {
                    data += "&"
                }
                data += this._filters[filter].key + "=" + this._filters[filter].value
            }
        }
        return data
    },

    /**
     * makes simple array with params
     */
    toArray : function() {
        var data = {}
        for (filter in this._filters) {
            data[this._filters[filter].key] = this._filters[filter].value
        }
        return data
    }
}

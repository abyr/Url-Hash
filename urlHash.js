/**
 * HashUrl
 *
 * methods to work with window.location.hash
 * 
 * @author abyr (abyrcheg@gmail.com)
 */
HashUrl = {
    
    /**
     * return current window.location.hash without "#"
     * @return string 
     */
    getHash : function() {
        var hash = window.location.hash;
        if (hash != "") {
            //remove "#"
            return hash.replace(/#(.*)/, "$1");
        }
        return hash;
    },
    
    /**
     * set hash
     * @param hash (string) full hash string
     * return boolean
     */
    setHash: function(hash) {
        window.location.hash = hash
        return false
    },
    
    /**
     * add value to hash, add only "&" and value
     * @param h  (string) hash value
     * @param hash  (string) all hash params string
     * @param applyLater  (boolean) apply this hash later and return
     * @return boolean|string 
     */
    addHash : function(h, hash, applyLater) {
        //default = no
        if (!applyLater) {
            applyLater = false;
        }

        if (!hash) {
            //not passed, actual
            var hash = this.getHash()
        }
        
        if (hash == "") {
            if (applyLater) {
                return h
            }
            return this.setHash(h);
            
        } else {
            var arr = {};
            this._parseStr(hash, arr);
            var arrTemp = {};
            this._parseStr(h, arrTemp);

            for (var i in arrTemp) {
                arr[i] = arrTemp[i];
            }
            var temp =[];
            for (var j in arr) {
                if (arr[j] == "") {
                    temp.push(j);
                } else {
                    temp.push(j + "=" + arr[j]);
                }
            }

            //later
            if (applyLater) {
                return temp.join('&');
            }
            return this.setHash(temp.join('&'))
            
        }
        return false
    },

    /**
     * add hash-part to existed hash
     * @param list (array) parts of hash value
     * return boolean
     */
    addHashes : function(list) {

        hash = this.getHash()
        
        for (var index in list) {
            hash = this.addHash(list[index], hash, true)
        }
        
        return this.setHash(hash)
    },

    /**
     * add value to hash as key and value pair
     * @param key    (string) param name
     * @param value  (string) param value
     * @return boolean 
     */
    addHashParam : function(key, value) {
        return this.addHash(key + "=" + value)
    },

    /**
     * add hashes key-value pairs to existed hash
     * @param list (array) key-value pairs
     * return boolean
     */
    addHashesParams : function(list) {

        hash = this.getHash()

        for (var key in list) {
            hash = this.addHash(key + "=" + list[key], hash, true)
        }

        return this.setHash(hash)
    },
    
    /**
     * get hash param by name
     * @param key   (string) param name
     * @param hash  (string) whole hash string to look in
     * @return boolean 
     */
    getHashParam : function(key, hash, def) {
        if (!hash) {
            hash = this.getHash()
        }
        var arr = {};
        
        this._parseStr(hash, arr);

        for (var i in arr) {
            if (i == key) {
                return arr[i];
            }
        }
        
        if (def) {
            return def
        }

        return false;
    },

    /**
     * return true if key in hash
     * @param key (array) key-value pairs
     * @param hash (string) string to look in
     * return boolean
     */
    issetHashParam : function (key, hash) {

        if (!hash) {
            hash = this.getHash()
        }
        var arr = {};
        
        this._parseStr(hash, arr);

        for (var i in arr) {
            if (i == key) {
                return true;
            }
        }
        return false
    },
    
    /**
     * remove hash key from full hash
     * @param key (string) key of hash param
     * return boolean
     */
    removeHash : function(key) {
        return this.removeHashParam(key)
    },
    
    /**
     * remove hash param by name
     * @param key   (string) param name
     * @param hash  (string) all hash params string
     * @param applyLater  (boolean) remove this hash later and return
     * @return boolean 
     */
    removeHashParam : function(key, hash, applyLater) {

        if (!hash) {
            hash = this.getHash()
        }
        
        if (hash != "" && typeof(hash) != "undefined") {
            var arr = {};
            this._parseStr(hash, arr);
            var arr1 = {};

            for (var i in arr) {
                if (i != key) {
                    arr1[i] = arr[i];
                }
            }
            var temp =[];
            for (var j in arr1) {
                if (arr[j] == "") {
                    temp.push(j);
                } else {
                    temp.push(j + "=" + arr[j]);
                }
            }
            
            if (applyLater) {
                return temp.join('&');
            }

            return this.setHash(temp.join('&'))
            
        }
        return false
    },

    /**
     * remove hashes key-value pairs from existed hash
     * @param list (array) key-value pairs
     * return boolean
     */
    removeHashes : function(list) {
        
        hash = this.getHash()
        
        for (var index in list) {
            hash = this.removeHashParam(list[index], hash, true)
        }

        return this.setHash(hash)
    },
    
    /**
     * decode string
     * @param str   (string)
     * @return boolean 
     */
    urldecode : function(str) {
        return decodeURIComponent((str+'').replace(/\+/g, '%20'));
    },
    
    /**
     * encode string
     * @param str   (string)
     * @return boolean 
     */
    urlencode : function (str) {
        str = (str+'').toString();
        return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
        replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
    },
    
    /**
     * key value string to array
     * @param str   (string)
     * @param array (string)
     * @return string|boolean 
     */
    _parseStr : function(str, array) {
        var glue1 = '=', glue2 = '&', array2 = String(str).replace(/^&?([\s\S]*?)&?$/, '$1').split(glue2),
        i, j, chr, tmp, key, value, bracket, keys, evalStr, that = this,
        fixStr = function (str) {
            return that.urldecode(str).replace(/([\\"'])/g, '\\$1').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        };

        if (!array) {
            array = this.window;
        }

        for (i = 0; i < array2.length; i++) {
            tmp = array2[i].split(glue1);
            if (tmp.length < 2) {
                tmp = [tmp, ''];
            }
            key   = fixStr(tmp[0]);
            value = fixStr(tmp[1]);
            while (key.charAt(0) === ' ') {
                key = key.substr(1);
            }
            if (key.indexOf('\0') !== -1) {
                key = key.substr(0, key.indexOf('\0'));
            }
            if (key && key.charAt(0) !== '[') {
                keys    = [];
                bracket = 0;
                for (j = 0; j < key.length; j++) {
                    if (key.charAt(j) === '[' && !bracket) {
                        bracket = j + 1;
                    }
                    else if (key.charAt(j) === ']') {
                        if (bracket) {
                            if (!keys.length) {
                                keys.push(key.substr(0, bracket - 1));
                            }
                            keys.push(key.substr(bracket, j - bracket));
                            bracket = 0;
                            if (key.charAt(j + 1) !== '[') {
                                break;
                            }
                        }
                    }
                }
                if (!keys.length) {
                    keys = [key];
                }
                for (j = 0; j < keys[0].length; j++) {
                    chr = keys[0].charAt(j);
                    if (chr === ' ' || chr === '.' || chr === '[') {
                        keys[0] = keys[0].substr(0, j) + '_' + keys[0].substr(j + 1);
                    }
                    if (chr === '[') {
                        break;
                    }
                }
                evalStr = 'array';
                for (j = 0; j < keys.length; j++) {
                    key = keys[j];
                    if ((key !== '' && key !== ' ') || j === 0) {
                        key = "'" + key + "'";
                    }
                    else {
                        key = eval(evalStr + '.push([]);') - 1;
                    }
                    evalStr += '[' + key + ']';
                    if (j !== keys.length - 1 && eval('typeof ' + evalStr) === 'undefined') {
                        eval(evalStr + ' = [];');
                    }
                }
                evalStr += " = '" + value + "';\n";
                eval(evalStr);
            }
        }
        return false
    }
    
}

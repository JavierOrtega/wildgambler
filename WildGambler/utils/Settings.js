/**
 *
 * Static Settings class
 *  
 */

var Settings = {
    
    langCode: "en",
    
    getLangCode: function() {
        return langCode;
    },
    setLangCode: function(val) {
        langCode = val;
        return true;
    }
} 

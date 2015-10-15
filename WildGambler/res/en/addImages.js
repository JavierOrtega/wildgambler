/**
 * Will replace all occurencies of
 * <span class="image" src="example.png"></span>
 */
var addImages = function(){
    
	var arrElems = document.getElementsByClassName("image")

    for (var i = 0; i<arrElems.length; i++)
    {
    	var node = arrElems[i];
    	
    	var nodeImage = document.createElement("img");
        nodeImage.setAttribute("src", node.getAttribute("src"));
        
        node.appendChild(nodeImage);
    }
};

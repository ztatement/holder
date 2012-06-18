/*
 Holder - client side image placeholders
 (c) 2012 Ivan Malopinsky / http://imsky.co
 Provided under the BSD License. Commercial use requires attribution.
*/

var Holder = Holder || {};
(function (app, win) {
	
    //https://gist.github.com/991057 by Jed Schmidt
    function selector(a,b){a=a.match(/^(\W)?(.*)/);return(b||document)["getElement"+(a[1]?a[1]=="#"?"ById":"sByClassName":"sByTagName")](a[2])};
    
    //http://javascript.nwbox.com/ContentLoaded by Diego Perini with modifications
    function contentLoaded(n,t){var l="complete",s="readystatechange",u=!1,h=u,c=!0,i=n.document,a=i.documentElement,e=i.addEventListener?"addEventListener":"attachEvent",v=i.addEventListener?"removeEventListener":"detachEvent",f=i.addEventListener?"":"on",r=function(e){(e.type!=s||i.readyState==l)&&((e.type=="load"?n:i)[v](f+e.type,r,u),!h&&(h=!0)&&t.call(n,null))},o=function(){try{a.doScroll("left")}catch(n){setTimeout(o,50);return}r("poll")};if(i.readyState==l)t.call(n,"lazy");else{if(i.createEventObject&&a.doScroll){try{c=!n.frameElement}catch(y){}c&&o()}i[e](f+"DOMContentLoaded",r,u),i[e](f+s,r,u),n[e](f+"load",r,u)}};
	
	//object property extend
	function extend(a,b){var c={};for(var d in a)c[d]=a[d];for(var e in b)c[e]=b[e];return c}
	
	function draw(canvas, dimensions, template) {
		
	var dimension_arr = [dimensions.height, dimensions.width].sort();
		
	var maxFactor = Math.round(dimension_arr[1] / 16),
		minFactor = Math.round(dimension_arr[0] / 16);
		
	var text_height = Math.max(template.size, maxFactor);
		
	canvas.setAttribute("width", dimensions.width);
	canvas.setAttribute("height", dimensions.height);
	
	var ctx = canvas.getContext("2d");
	
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = template.background;
	ctx.fillRect(0, 0, dimensions.width, dimensions.height);
	ctx.fillStyle = template.foreground;
	ctx.font = "bold " + text_height + "px sans-serif";
	
	var text = dimensions.width + "x" + dimensions.height;
	if(Math.round(ctx.measureText(text).width) / dimensions.width > 1) {
		text_height = Math.max(minFactor, template.size);
	}
	ctx.font = "bold " + text_height + "px sans-serif";
	ctx.fillText(text, (dimensions.width / 2), (dimensions.height / 2), dimensions.width);
	return canvas.toDataURL("image/png");
	}
	
	var dimensions_regex = /([0-9]+)x([0-9]+)/;
	var hex_regex = /#([0-9a-f]{3,})\:#([0-9a-f]{3,})/i;
	var canvas = document.createElement('canvas');
	var preempted = false;
	
	var settings = {
		domain: "holder.js",
		images: "img",
		themes: {
			"gray": {
				background: "#eee",
				foreground: "#aaa",
				size: 12
			},
			"social": {
				background: "#3a5a97",
				foreground: "#fff",
				size: 12
			},
			"industrial": {
				background: "#434A52",
				foreground: "#C2F200",
				size: 12
			}
		}
	}
	app.add_theme = function (name, theme) {
		name != null && theme != null && (settings.themes[name] = theme);
		return app;
	}
	app.add_image = function (src, node) {
		var img = document.createElement("img")
		img.setAttribute("data-src", src);
		var _node = selector(node)
		if(_node) {
			if(_node.length) {
				_node = _node[0];
			}
			_node.appendChild(img);
		}
		return _node ? app : false;
	}
	app.run = function (o) {
		var options = extend(settings, o),
			images = selector(options.images);
		images = images.length != null ? images : [images];
		preempted = true;
		for(var l = images.length, i = 0; i < l; i++) {
			var dimensions, theme = settings.themes.gray;
			src = images[i].getAttribute("data-src") || images[i].getAttribute("src");
			if( !! ~src.indexOf(options.domain)) {
				var render = false;
				for(var flags = src.substr(src.indexOf(options.domain) + options.domain.length + 1).split("/"), sl = flags.length, j = 0; j < sl; j++) {
					if(flags[j].match(dimensions_regex)) {
						var exec = dimensions_regex.exec(flags[j])
						dimensions = {
							width: parseInt(exec[1]),
							height: parseInt(exec[2])
						}
						render = true;
					} else if(flags[j].match(hex_regex)) {
						var exec = hex_regex.exec(flags[j]);
						theme = {
							size: settings.themes.gray.size,
							foreground: "#" + exec[2],
							background: "#" + exec[1]
						}
					} else if(options.themes[flags[j]]) {
						theme = options.themes[flags[j]];
					}
				}
				if(render){
					images[i].setAttribute("data-src", src);
					images[i].setAttribute("src", draw(canvas, dimensions, theme));
				}
			}
		}
		return app;
	}
	contentLoaded(win, function () {
		preempted || app.run()
	})

})(Holder, window);
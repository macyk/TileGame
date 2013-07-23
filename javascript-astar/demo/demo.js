/* 	demo.js http://github.com/bgrins/javascript-astar
	MIT License
	
	Set up the demo page for the A* Search
*/

window.log = function(){
	if(this.console){
		console.log( Array.prototype.slice.call(arguments) );
	}
};

var totalScore = 0;
var matchingScore = 100;

$(function() {

    var $grid = $("#search_grid");

    var opts = {
        gridSize: 10,
        debug: false,
    };

    var grid = new GraphSearch($grid, opts, astar.search);

    $("#btnGenerate").click(function() {
    	grid.initialize();
    });
});

var css = { start: "start", finish: "finish", wall: "wall", active: "active",};
var tiles = {orange: "color00",sky: "color01",navy: "color02",bush: "color03",brown: "color04",
            grape: "color05", green: "color06",blue: "color07",red: "color08",yellow: "color09",
            purple: "color10",pink: "color11",grey: "color12",fog: "color13",cold: "color14",
            lime: "color15",mint: "color16",candy: "color17",
            orange_2: "color00",sky_2: "color01",navy_2: "color02",bush_2: "color03",brown_2: "color04",
            grape_2: "color05", green_2: "color06",blue_2: "color07",red_2: "color08",yellow_2: "color09",
            purple_2: "color10",pink_2: "color11",grey_2: "color12",fog_2: "color13",cold_2: "color14",
            lime_2: "color15",mint_2: "color16",candy_2: "color17",};

function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj){
        if (Math.random() < 1/++count){
           result = obj[prop];
           
           //log(prop);
        }
    } // remove it
    deleteByValue(result, obj);
    return result;
}

function deleteByValue(val, obj) {
    for(var f in tileSet) {
        if(obj.hasOwnProperty(f) && obj[f] == val) {
            delete tileSet[f];
            return;
        }
    }
}

function GraphSearch($graph, options, implementation) {
    this.$graph = $graph;
    this.search = implementation;
    this.opts = $.extend({wallFrequency:.1, debug:true, gridSize:10}, options);
    this.initialize();
}
GraphSearch.prototype.setOption = function(opt) {
    this.opts = $.extend(this.opts, opt);
    if(opt["debug"]||opt["debug"]==false) {
        this.drawDebugInfo(opt["debug"]);
    }
};

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

GraphSearch.prototype.initialize = function() {
    tileSet = clone(tiles);
    var self = this;
	this.grid = [];
	var nodes = [
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1]
    ];
	var $graph = this.$graph;

	$graph.empty();

    var cellWidth = ($graph.width()/this.opts.gridSize)-2;  // -2 for border
    var cellHeight = ($graph.height()/this.opts.gridSize)-2;
    var $cellTemplate = $("<span />").addClass("grid_item").width(cellWidth).height(cellHeight);
    var startSet = false;

    for(var x=0;x<this.opts.gridSize;x++) {
        var $row = $("<div class='clear' />");

    	var nodeRow = nodes[x];
    	var gridRow = [];

    	for(var y=0;y<this.opts.gridSize;y++) {
    		var id = "cell_"+x+"_"+y;
    		var $cell = $cellTemplate.clone();
    		$cell.attr("id", id).attr("x", x).attr("y", y);
    		$row.append($cell);
    		gridRow.push($cell);

    		if(nodeRow[y] == 0) {
                $cell.addClass(pickRandomProperty(tileSet));
                // make a start
    		}
    		else  {
                if (!startSet) {
                    $cell.addClass(css.start);
                    startSet = true;
                }
    		}
    	}
	    $graph.append($row);

    	this.grid.push(gridRow);   
    }

    this.graph = new Graph(nodes);
    // bind cell event, set start/wall positions
    this.$cells = $graph.find(".grid_item");
    this.$cells.click(function() { self.cellClicked($(this)) });
};

function getColorName(obj) {
    var classes = obj.attr("class");
    var start_index = classes.indexOf("color")+5;
    var color_code = classes.substring(start_index, start_index+2);
    return color_code;
};

var star_color = -1;

GraphSearch.prototype.cellClicked = function($end) {

    var end = this.nodeFromElement($end);
    // find the start
    var $start = this.$cells.filter("." + css.start);
    star_color = getColorName($start);

    var start = this.nodeFromElement($start);

    // if there is a start, change it to walkable
    if(start){
        start.type = 1;
    }

    if($end.hasClass(css.start)){
        log("clicked on start...", $end);
        return;
    }

    /*if($end.hasClass(css.start) == false && $end.hasClass(css.wall) == false){
        log("clicked on empty space...", end);
        return;
    }*/

    /*if($end.hasClass(css.wall)) {
        $end.removeClass(css.wall);
        end.type = 1;
    }*/
    log("end: "+ end.type);
    log("start: "+ start.type);
    if(end.type == 0){
        end.type = 1;
        log("new start");
        var this_color = getColorName($end);
        if(this_color != star_color){
            log("wrong color: "+ this_color + "! We need "+ star_color);
            // if picked the wrong color, reset start
            this.$cells.removeClass(css.start);
            $end.addClass("start");
            // set end type back
            end.type = 0;
            start.type = 1;
            return;
        }else{
            this.$cells.removeClass(css.finish);
            $end.addClass("finish");
            start = this.nodeFromElement($start);
        }

        var sTime = new Date();
        var path = this.search(this.graph.nodes, start, end, this.opts.diagonal);
        var fTime = new Date();

        if(!path || path.length == 0)   {
            $("#message").text("couldn't find a path ("+(fTime-sTime)+"ms)");
            this.animateNoPath();
            end.type = 0; // if there is no path, set back to wall
            this.$cells.removeClass(css.start);
            $end.addClass("start");
            star_color = getColorName($end);
        }
        else {
            $end.removeClass("color"+star_color);
            $start.removeClass("color"+star_color);
            star_color = -1;
            totalScore += matchingScore;
            if(totalScore == 1800)
            {
                $("#message").text("Great Work!");
            }else{
                $("#message").text("Score: " + totalScore);
            }
            if(this.opts.debug) {
                this.drawDebugInfo(this.opts.debug);
            }
            this.animatePath(path);
        }
    }
};
GraphSearch.prototype.drawDebugInfo = function(show) {
    this.$cells.html(" ");
    var that = this;
    if(show) {
    	that.$cells.each(function(i) { 
            var node = that.nodeFromElement($(this));
    		var debug = false;
            if (node.visited) {
                debug = "F: " + node.f + "<br />G: " + node.g + "<br />H: " + node.h;
            }

    		if (debug) {
    			$(this).html(debug);
    		}
    	});

    }
};
GraphSearch.prototype.nodeFromElement = function($cell) {
    return this.graph.nodes[parseInt($cell.attr("x"))][parseInt($cell.attr("y"))];
};
GraphSearch.prototype.animateNoPath = function() {
    var $graph = this.$graph;
    var jiggle = function(lim, i) {
	    if(i>=lim) { $graph.css("top", 0).css("left", 0); return;  }
	    if(!i) i=0;
	    i++;
	    $graph.css("top", Math.random()*6).css("left", Math.random()*6);
	    setTimeout( function() { jiggle(lim, i) }, 5 );
    };
    jiggle(15);
};
GraphSearch.prototype.animatePath = function(path) {
	var grid = this.grid;
	var timeout = 1000 / grid.length;
	var elementFromNode = function(node) {
		return grid[node.x][node.y];
	};

    var removeClass = function(path, i) {
	    if(i>=path.length) return;
	    elementFromNode(path[i]).removeClass(css.active);
	    setTimeout( function() { removeClass(path, i+1) }, timeout*path[i].cost);
    }
    var addClass = function(path, i)  {
	    if(i>=path.length) {  // Finished showing path, now remove
	    	return removeClass(path, 0);
	    }
	    elementFromNode(path[i]).addClass(css.active);
	    setTimeout( function() { addClass(path, i+1) }, timeout*path[i].cost);
    };

    addClass(path, 0)
    this.$graph.find("." + css.start).removeClass(css.start);
    this.$graph.find("." + css.finish).removeClass(css.finish).addClass(css.start);
};



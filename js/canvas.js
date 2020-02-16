var url = window.location.href;
var language = [english1, english2];
var rotationState = [Number(getUrlParameter(url, 'A')), Number(getUrlParameter(url, 'B')), Number(getUrlParameter(url, 'C'))];
var lastHover = '';
var circle = (2 * Math.PI);
var angles = [];

Global_tree.forEach(ring => {
    angles.push(circle / ring.Section.length);
});

function RotateA(amount) {
    url = window.location.href;
    rotationState[0] += amount;
    window.location.href = setUrlParameter(url, 'A', rotationState[0]);
}

function RotateB(amount) {
    url = window.location.href;
    rotationState[1] += amount;
    window.location.href = setUrlParameter(url, 'B', rotationState[1]);
}

function RotateC(amount) {
    url = window.location.href;
    rotationState[2] += amount;
    window.location.href = setUrlParameter(url, 'C', rotationState[2]);
}

function Shape(x, y, r, fill) {
    this.x = x || 0;
    this.y = y || 0;
    this.r = r || 1;
    this.fill = fill || '#AAAAAA';
}

Shape.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.fill;
    ctx.arc(this.x, this.y, this.r, 0, circle);
    ctx.fill();
}

Shape.prototype.contains = function (mx, my) {
    return Math.sqrt((mx - this.x) * (mx - this.x) + (my - this.y) * (my - this.y)) < 10
}

function Line(coordsStart, coordsEnd) {
    this.startX = coordsStart[0];
    this.startY = coordsStart[1];
    this.endX = coordsEnd[0];
    this.endY = coordsEnd[1];
}

Line.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.endX, this.endY);
    ctx.strokeStyle = 'darkgrey';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function CanvasState(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
    if (document.defaultView && document.defaultView.getComputedStyle) {
        this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
        this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
        this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
        this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
    }
    var html = document.body.parentNode;
    this.htmlTop = html.offsetTop;
    this.htmlLeft = html.offsetLeft;

    this.valid = false;
    this.shapes = [];
    this.lines = [];
    this.dragging = false;
    this.selection = null;
    this.dragoffx = 0;
    this.dragoffy = 0;

    var myState = this;

    canvas.addEventListener('selectstart', function (e) {
        e.preventDefault();
        return false;
    }, false);

    canvas.addEventListener('mousedown', function (e) {
        var mouse = myState.getMouse(e);
        var mx = mouse.x;
        var my = mouse.y;
        var shapes = myState.shapes;
        var l = shapes.length;
        for (var i = l - 1; i >= 0; i--) {
            if (shapes[i].contains(mx, my)) {
                var mySel = shapes[i];
                // Keep track of where in the object we clicked
                // so we can move it smoothly (see mousemove)
                myState.dragoffx = mx - mySel.x;
                myState.dragoffy = my - mySel.y;
                myState.dragging = true;
                myState.selection = mySel;
                myState.valid = false;
                return;
            }
        }

        if (myState.selection) {
            myState.selection = null;
            myState.valid = false;
        }
    }, true);

    canvas.onmousemove = function (e) {
        var mouse = myState.getMouse(e);
        var mx = mouse.x;
        var my = mouse.y;
        var shapes = myState.shapes;
        var l = shapes.length;
        var shapes = myState.shapes;
        for (var i = l - 1; i >= 0; i--) {
            if (shapes[i].contains(mx, my)) {
                var myHov = shapes[i];

                Global_tree.forEach(ring => {
                    ring['Section'].forEach(section => {
                        selectedSkill = Passive_tree[section['@Name'] + '_tree'].Tree.Skill.find(skill => skill['@Coords'][0] == myHov.x && skill['@Coords'][1] == myHov.y);
                        if (selectedSkill != undefined) {
                            if (lastHover != selectedSkill['@Name']) {
                                console.log(stats[section['@Name'] + '_tree'].find(item => item['@Name'] == selectedSkill['@Name']));
                                document.getElementById('UIName').innerHTML = localize(stats[section['@Name'] + '_tree'].find(item => item['@Name'] == selectedSkill['@Name'])['@UIName'].substr(1));
                                var magicEffects = stats[section['@Name'] + '_tree'].find(item => item['@Name'] == selectedSkill['@Name']).MagicEffects;
                                var effectText = '';
                                var descText = localize(stats[section['@Name'] + '_tree'].find(item => item['@Name'] == selectedSkill['@Name'])['@GameplayDesc'].substr(1));
                                var semantics;
                                if (magicEffects.EIM != undefined) {
                                    // console.log(magicEffects.EIM['@HUDDesc'].substr(1));
                                    semantics = magicEffects.EIM.Semantics;
                                    // console.log(magicEffects.EIM.Semantics);
                                    effectText = localize(magicEffects.EIM['@HUDDesc'].substr(1), 'effect');
                                    Object.keys(semantics).forEach((key, index) => {
                                        // console.log('%' + (index + 1) + ' ' + semantics[key]);
                                        effectText = effectText.replace('%' + (index + 1), semantics[key])
                                    });
                                } else {
                                    magicEffects.forEach(element => {
                                        // console.log(element['@HUDDesc'].substr(1));
                                        effectText += localize(element['@HUDDesc'].substr(1), 'effect') + '<br><br>';
                                        semantics = element.Semantics;
                                        // console.log(element.Semantics);
                                        Object.keys(semantics).forEach((key, index) => {
                                            // console.log('%' + (index + 1) + ' ' + semantics[key]);
                                            effectText = effectText.replace('%' + (index + 1), semantics[key])
                                        });
                                    });
                                    effectText = effectText.substring(0, effectText.length - 8);
                                }
                                document.getElementById('MagicEffects').innerHTML = effectText;
                                document.getElementById('GameplayDesc').innerHTML = descText;
                            }
                            lastHover = selectedSkill['@Name'];
                        }
                    });
                });
            }
        }
    }

    canvas.addEventListener('mouseup', function (e) {
        myState.dragging = false;
    }, true);

    this.selectionColor = '#000000';
    this.selectionWidth = 2;
    this.interval = 30;
    setInterval(function () {
        myState.draw();
    }, myState.interval);
}

CanvasState.prototype.addShape = function (shape) {
    this.shapes.push(shape);
    this.valid = false;
}

CanvasState.prototype.addLine = function (line) {
    this.lines.push(line);
    this.valid = false;
}

CanvasState.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
}

CanvasState.prototype.draw = function () {
    if (!this.valid) {
        var ctx = this.ctx;
        var shapes = this.shapes;
        var lines = this.lines;
        var width = this.width;
        var height = this.height;
        var x = width / 2;
        var y = height / 2;
        var r = (width - 20) / 6;
        this.clear();

        // Draw the rings
        for (var i = Global_tree.length - 1; i >= 0; i--) {
            Global_tree[i]['Section'].forEach(section => {
                var angleMod = ((Global_tree[i]['@Number'] < 2) ? 1 : 0) * angles[2];
                var currentAngle = section['@Number'] * angles[Global_tree[i]['@Number']];
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.arc(x, y, r * (i + 1), angleMod + currentAngle, angleMod + angles[Global_tree[i]['@Number']] + currentAngle);
                ctx.lineTo(x, y);
                ctx.fillStyle = 'grey';
                ctx.fill();
                ctx.lineWidth = 5;
                ctx.strokeStyle = 'black';
                ctx.stroke();
            });
        }

        // draw all lines
        var l = lines.length;
        for (var i = 0; i < l; i++) {
            var shape = lines[i];
            lines[i].draw(ctx);
        }

        // draw all shapes
        var l = shapes.length;
        for (var i = 0; i < l; i++) {
            var shape = shapes[i];
            shapes[i].draw(ctx);
        }

        // draw selection
        // right now this is just a stroke along the edge of the selected Shape
        if (this.selection != null) {
            ctx.strokeStyle = this.selectionColor;
            ctx.lineWidth = this.selectionWidth;
            var mySel = this.selection;
            ctx.beginPath();
            ctx.arc(mySel.x, mySel.y, mySel.r, 0, circle);
            ctx.stroke();

            Global_tree.forEach(ring => {
                ring['Section'].forEach(section => {
                    selectedSkill = Passive_tree[section['@Name'] + '_tree'].Tree.Skill.find(skill => skill['@Coords'][0] == mySel.x && skill['@Coords'][1] == mySel.y);
                    if (selectedSkill != undefined) {
                        console.log(selectedSkill['@Name']);
                    }
                });
            });
        }

        // draw center
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, circle);
        ctx.fillStyle = 'black';
        ctx.fill();

        this.valid = true;
    }
}

CanvasState.prototype.getMouse = function (e) {
    var element = this.canvas,
        offsetX = 0,
        offsetY = 0,
        mx, my;

    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
    offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;

    return {
        x: mx,
        y: my
    };
}

function init() {
    var end = [Ring_end[0].slice(), Ring_end[1].slice()];
    if (rotationState[0] > 0) {
        for (let i = 0; i < rotationState[0] * 2; i++) {
            end[0].unshift(end[0].pop());
        }
    } else {
        for (let i = 0; i < Math.abs(rotationState[0]) * 2; i++) {
            end[0].push(end[0].shift());
        }
    }
    if (rotationState[1] > 0) {
        for (let i = 0; i < rotationState[1] * 2; i++) {
            if (i % 2 == 0) {
                end[0].push(end[0].shift());
            }
            end[1].unshift(end[1].pop());
        }
    } else {
        for (let i = 0; i < Math.abs(rotationState[1]) * 2; i++) {
            if (i % 2 == 0) {
                end[0].unshift(end[0].pop());
            }
            end[1].push(end[1].shift());
        }
    }
    if (rotationState[2] > 0) {
        for (let i = 0; i < rotationState[2]; i++) {
            end[1].push(end[1].shift());
        }
    } else {
        for (let i = 0; i < Math.abs(rotationState[2]); i++) {
            end[1].unshift(end[1].pop());
        }
    }

    var s = new CanvasState(document.getElementById('canvas'));
    var w = s.width;
    var h = s.height;
    var x = w / 2;
    var y = h / 2;

    var typeMap = {
        melee: 'darkred',
        tank: 'darkred',
        magic: 'blue',
        range: 'green'
    }

    // Store calculated coordinates for each skill
    Global_tree.forEach(ring => {
        // console.log('Ring' + ring['@Number']);
        ring['Section'].forEach(section => {
            // console.log('    ' + section['@Name']);
            Passive_tree[section['@Name'] + '_tree'].Tree.Skill.forEach((skill, i) => {
                Passive_tree[section['@Name'] + '_tree'].Tree.Skill[i]['@Coords'] = getPoint(
                    x, y,
                    (w - 30) / 6 * Number(skill['@Pos']) + Number(ring['@Number']) * (w - 30) / 6,
                    angles[ring['@Number']] * Number(skill['@Angle']) + angles[2] + section['@Number'] * angles[ring['@Number']] + rotationState[ring['@Number']] * angles[ring['@Number']]
                );
                // console.log(Passive_tree[section['@Name'] + '_tree'].Tree.Skill[i]['@Coords']);
            });
        });
    });

    // Draw line connectors for each connected skill
    Global_tree.forEach(ring => {
        // console.log('Ring' + ring['@Number']);
        ring['Section'].forEach(section => {
            // console.log('    ' + section['@Name']);
            Passive_tree[section['@Name'] + '_tree'].Tree.Skill.forEach(skill => {
                // console.log('        ' + skill['@Name']);
                skill['@Unlock'].split(',').forEach(unlock => {
                    var linked = Passive_tree[section['@Name'] + '_tree'].Tree.Skill.find(link => link['@Name'] == unlock);
                    // Link skills in each section
                    if (linked != undefined) {
                        s.addLine(new Line(skill['@Coords'], linked['@Coords']));
                        // console.log(skill['@Coords'] + ', ' + linked['@Coords'])
                        // Link Ring 0 Skills to Center
                    } else if (unlock == 'begin') {
                        if (ring['@Number'] == 0) {
                            s.addLine(new Line(skill['@Coords'], [x, y]));
                        } else {
                            Object.keys(Passive_tree).forEach(key => {
                                var linked = Passive_tree[key].Tree.Skill.find(link => link['@Name'] == end[ring['@Number'] - 1][section['@Number']])
                                if (linked != undefined) {
                                    s.addLine(new Line(skill['@Coords'], linked['@Coords']))
                                }
                            });
                        }
                    } else if (unlock != undefined) {
                        Object.keys(Passive_tree).forEach(key => {
                            var linked = Passive_tree[key].Tree.Skill.find(link => link['@Name'] == unlock);
                            if (linked != undefined) {
                                s.addLine(new Line(skill['@Coords'], linked['@Coords']))
                            }
                        });
                    }
                });
            });
        });
    });

    // Draw Skill Dots
    Global_tree.forEach(ring => {
        // console.log('Ring' + ring['@Number']);
        ring['Section'].forEach(section => {
            // console.log('    ' + section['@Name']);
            Passive_tree[section['@Name'] + '_tree'].Tree.Skill.forEach(skill => {
                s.addShape(new Shape(skill['@Coords'][0], skill['@Coords'][1], Number(skill['@Rarity']) * 4, typeMap[skill['@Category']]));
            });
        });
    });
}

function getRelativeCoords(event) {
    console.log({
        x: event.offsetX,
        y: event.offsetY
    });
}

function getPoint(cX, cY, radius, angle) {
    return [(cX + Math.cos(angle) * radius).toFixed(2), (cY + Math.sin(angle) * radius).toFixed(2)];
}

function localize(string, type) {
    if (string) {
        if (type == 'effect') {
            var item = language[1].Worksheet.Table.Row.filter(search => search.Cell != undefined).filter(search => search.Cell[0] != undefined).filter(search => search.Cell[0].Data != undefined).find(search => search.Cell[0].Data['#text'] == string);
            return item.Cell[1].Data['#text'].replace(/\\n/g, '<br>') || '';
        } else {
            var item = language[0].Worksheet.Table.Row.filter(search => search.Cell[0] != undefined).filter(search => search.Cell[0].Data != undefined).find(search => search.Cell[0].Data['#text'] == string);
            return item.Cell[1].Data['#text'].replace(/\\n/g, '<br>') || '';
        }
    } else {
        return '';
    }
}

function getMagic() {

}
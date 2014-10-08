function slideshot(hook) { // capture current slide
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var canvasWrapper = $$('.canvasWrapper')[0];
    var slideStyle = getComputedStyle(canvasWrapper.parentElement);
    canvas.width = parseInt(slideStyle.width, 10);
    canvas.height = parseInt(slideStyle.height, 10);
    var renderQueue = [];
    $$('> div', canvasWrapper).each(function (element) {
        var $element = $Element(element);
        var zIndex = element.style.zIndex | 0;
        if ($element.hasClass('group')) {
            $$('.grouped', element).each(function (groupItem, gIndex) {
                renderQueue.push({
                    type: groupItem.className.trim().split(/\s+/)[1],
                    element: groupItem,
                    zIndex: zIndex,
                    isGrouped: true,
                    group: element,
                    gIndex: gIndex
                });
            });
        } else if ($element.hasClass('placeHolder')) {
            renderQueue.push({
                type: element.className.trim().split(/\s+/)[1],
                element: element,
                zIndex: zIndex,
                isGrouped: false
            });
        } else if ($element.hasClass('selection')) {
            return; // ignore selection
        } else {
            if (/slide.+_background/.test(element.id))
                renderQueue.push({
                    type: 'slideBackground',
                    element: element,
                    zIndex: zIndex,
                    isGrouped: false
                });
            else if (slideshot.debug)
                throw new Error('this is not slide background');
        }
    });
    renderQueue.sort(function (a, b) {
        if (a.zIndex === b.zIndex)
            return a.gIndex < b.gIndex ? -1 : 1;
        return a.zIndex < b.zIndex ? -1 : 1;
    });
    var renderPhase = 0;
    if (renderQueue.length > 0)
        setTimeout(renderNext, 0); // set timeout to clear call stack
    else if (hook && hook.complete)
        setTimeout(function () { hook.complete(canvas); }, 0);
    function renderNext() {
        var renderItem = renderQueue[renderPhase++];
        var renderFunction = slideshot.render[renderItem.type];
        if (hook && hook.progress)
            hook.progress(renderPhase, renderQueue.length, renderItem.type);
        var groupGeomInfo;
        if (renderFunction) {
            context.save();
            if (renderItem.isGrouped) {
                groupGeomInfo = slideshot.util.getGeomInfo(renderItem.group);
                slideshot.util.transformContextByGeomInfo(context, groupGeomInfo);
            }
            renderFunction(renderItem.element, context, function () {
                context.restore();
                completeOrNext();
            });
        }
        else {
            if (slideshot.debug)
                throw new Error('we need to implement ' + renderItem.type + ' render function');
            completeOrNext();
        }
    }
    function completeOrNext() {
        if (renderPhase === renderQueue.length) {
            if (hook && hook.complete)
                hook.complete(canvas);
            return;
        }
        setTimeout(renderNext, 0);
    }
    return canvas;
}
slideshot.render = {};
slideshot.render.slideBackground = function (element, context, next) {
    var canvas = context.canvas;
    var fillColor = $Element($$('.viewport', element)[0].children[0]).attr('fill');
    context.fillStyle = fillColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    next();
};
slideshot.render.line =
slideshot.render.straightConnector1 =
slideshot.render.bentConnector2 =
slideshot.render.bentConnector3 =
slideshot.render.bentConnector4 =
slideshot.render.bentConnector5 =
slideshot.render.curvedConnector2 =
slideshot.render.curvedConnector3 =
slideshot.render.curvedConnector4 =
slideshot.render.curvedConnector5 =
slideshot.render.roundrect =
slideshot.render.roundRect =
slideshot.render.snip1Rect =
slideshot.render.snip2SameRect =
slideshot.render.snip2DiagRect =
slideshot.render.snipRoundRect =
slideshot.render.round1Rect =
slideshot.render.round2SameRect =
slideshot.render.round2DiagRect =
slideshot.render.oval =
slideshot.render.ellipse =
slideshot.render.triangle =
slideshot.render.rtTriangle =
slideshot.render.parallelogram =
slideshot.render.Trapezoid =
slideshot.render.trapezoid =
slideshot.render.Trapezoid_2007 =
slideshot.render.trapezoid_2007 =
slideshot.render.diamond =
slideshot.render.pentagon =
slideshot.render.hexagon =
slideshot.render.heptagon =
slideshot.render.octagon =
slideshot.render.decagon =
slideshot.render.dodecagon =
slideshot.render.pie =
slideshot.render.chord =
slideshot.render.frame =
slideshot.render.halfFrame =
slideshot.render.corner =
slideshot.render.diagStripe =
slideshot.render.plus =
slideshot.render.plaque =
slideshot.render.can =
slideshot.render.cube =
slideshot.render.bevel =
slideshot.render.Donut =
slideshot.render.donut =
slideshot.render.NoSmoking =
slideshot.render.nosmoking =
slideshot.render.Nosmoking =
slideshot.render.noSmoking =
slideshot.render.blockArc =
slideshot.render.foldedCorner =
slideshot.render.smileyFace =
slideshot.render.heart =
slideshot.render.lightningBolt =
slideshot.render.sun =
slideshot.render.moon =
slideshot.render.cloud =
slideshot.render.arc =
slideshot.render.bracketPair =
slideshot.render.bracePair =
slideshot.render.leftBracket =
slideshot.render.rightBracket =
slideshot.render.leftBrace =
slideshot.render.rightBrace =
slideshot.render.mathPlus =
slideshot.render.mathMinus =
slideshot.render.mathMultiply =
slideshot.render.mathDivide =
slideshot.render.mathEqual =
slideshot.render.mathNotEqual =
slideshot.render.rightArrow =
slideshot.render.leftArrow =
slideshot.render.upArrow =
slideshot.render.downArrow =
slideshot.render.leftRightArrow =
slideshot.render.upDownArrow =
slideshot.render.quadArrow =
slideshot.render.LeftRightUpArrow =
slideshot.render.leftRightUpArrow =
slideshot.render.bentArrow =
slideshot.render.uturnArrow =
slideshot.render.leftUpArrow =
slideshot.render.bentUpArrow =
slideshot.render.curvedRightArrow =
slideshot.render.curvedLeftArrow =
slideshot.render.curvedUpArrow =
slideshot.render.curvedDownArrow =
slideshot.render.stripedRightArrow =
slideshot.render.notchedRightArrow =
slideshot.render.homePlate =
slideshot.render.chevron =
slideshot.render.rightArrowCallout =
slideshot.render.leftArrowCallout =
slideshot.render.upArrowCallout =
slideshot.render.downArrowCallout =
slideshot.render.leftRightArrowCallout =
slideshot.render.quadArrowCallout =
slideshot.render.flowChartProcess =
slideshot.render.flowChartAlternateProcess =
slideshot.render.flowChartDecision =
slideshot.render.flowChartInputOutput =
slideshot.render.flowChartPredefinedProcess =
slideshot.render.flowChartInternalStorage =
slideshot.render.flowChartDocument =
slideshot.render.flowChartMultidocument =
slideshot.render.flowChartTerminator =
slideshot.render.flowChartPreparation =
slideshot.render.flowChartManualInput =
slideshot.render.flowChartManualOperation =
slideshot.render.flowChartConnector =
slideshot.render.flowChartOffpageConnector =
slideshot.render.flowChartPunchedCard =
slideshot.render.flowChartPunchedTape =
slideshot.render.flowChartSummingJunction =
slideshot.render.flowChartOr =
slideshot.render.flowChartCollate =
slideshot.render.flowChartSort =
slideshot.render.flowChartExtract =
slideshot.render.flowChartMerge =
slideshot.render.flowChartOnlineStorage =
slideshot.render.flowChartDelay =
slideshot.render.flowChartMagneticTape =
slideshot.render.flowChartMagneticDisk =
slideshot.render.flowChartMagneticDrum =
slideshot.render.flowChartDisplay =
slideshot.render.irregularSeal1 =
slideshot.render.irregularSeal2 =
slideshot.render.star4 =
slideshot.render.star5 =
slideshot.render.star6 =
slideshot.render.star7 =
slideshot.render.star8 =
slideshot.render.star10 =
slideshot.render.star12 =
slideshot.render.star16 =
slideshot.render.star24 =
slideshot.render.star32 =
slideshot.render.ribbon2 =
slideshot.render.ribbon =
slideshot.render.verticalScroll =
slideshot.render.horizontalScroll =
slideshot.render.wave =
slideshot.render.doubleWave =
slideshot.render.wedgeRectCallout =
slideshot.render.wedgeRoundRectCallout =
slideshot.render.wedgeEllipseCallout =
slideshot.render.custom =
slideshot.render.teardrop =
slideshot.render.cloudCallout =
slideshot.render.borderCallout1 =
slideshot.render.borderCallout2 =
slideshot.render.borderCallout3 =
slideshot.render.borderCallout4 =
slideshot.render.accentCallout1 =
slideshot.render.accentCallout2 =
slideshot.render.accentCallout3 =
slideshot.render.accentCallout4 =
slideshot.render.callout1 =
slideshot.render.callout2 =
slideshot.render.callout3 =
slideshot.render.callout4 =
slideshot.render.accentBorderCallout1 =
slideshot.render.accentBorderCallout2 =
slideshot.render.accentBorderCallout3 =
slideshot.render.accentBorderCallout4 =
slideshot.render.unknown =
slideshot.render.upDownArrowCallout =
slideshot.render.circularArrow =
slideshot.render.ellipseRibbon2 =
slideshot.render.ellipseRibbon =
slideshot.render.actionButtonBackPrevious =
slideshot.render.actionButtonBeginning =
slideshot.render.actionButtonBlank =
slideshot.render.actionButtonDocument =
slideshot.render.actionButtonEnd =
slideshot.render.actionButtonForwardNext =
slideshot.render.actionButtonHelp =
slideshot.render.actionButtonHome =
slideshot.render.actionButtonInformation =
slideshot.render.actionButtonMovie =
slideshot.render.actionButtonReturn =
slideshot.render.actionButtonSound =
slideshot.render.leftCircularArrow =
slideshot.render.swooshArrow =
slideshot.render.gear9 =
slideshot.render.gear6 =
slideshot.render.leftRightRibbon =
slideshot.render.pieWedge =
slideshot.render.funnel =
slideshot.render.rect = function (element, context, next) {
    var geomInfo = slideshot.util.getGeomInfo(element);
    slideshot.util.transformContextByGeomInfo(context, geomInfo);
    var paths = element.querySelectorAll('svg:first-child g > path');
    var defs = element.querySelector('svg:first-child defs');
    slideshot.util.renderSVGPaths(context, geomInfo, paths, defs, function () {
        var $textArea = $$('.textArea', element);
        if ($textArea.length < 1) {
            next();
            return;
        }
        var textArea = $textArea[0];
        var content = $$('.content', textArea)[0];
        var areaStyle = getComputedStyle(textArea);
        var bodyStyle = getComputedStyle($$('.textBody', textArea)[0]);
        context.translate(
            parseFloat(areaStyle.left) + parseFloat(bodyStyle.marginLeft) + (parseFloat(bodyStyle.left) || 0),
            parseFloat(areaStyle.top) + parseFloat(bodyStyle.marginTop) + (parseFloat(bodyStyle.top) || 0)
        );
        slideshot.util.renderRichText(content, context);
        next();
    });
};
slideshot.render.picture = function (element, context, next) {
    slideshot.util.transformContextByElement(context, element);
    var sourceImage = element.querySelector('image');
    var href = sourceImage.getAttribute('xlink:href');
    var width = parseFloat(sourceImage.getAttribute('width'));
    var height = parseFloat(sourceImage.getAttribute('height'));
    var image = new Image();
    image.onload = function () {
        context.drawImage(image, 0, 0, width, height);
        next();
    };
    image.src = href;
};
slideshot.render.table = function (element, context, next) {
    slideshot.util.transformContextByElement(context, element);
    var shape = element.querySelector('div:first-child');
    var i;
    // fill cells
    var cells = shape.querySelector('div:first-child').children;
    var cell, cellGeomInfo;
    context.save();
    for (i = 0; i < cells.length; ++i) {
        cell = cells[i];
        cellGeomInfo = slideshot.util.getGeomInfo(cell);
        context.fillStyle = slideshot.util.applyOpacityToColorString(
            cellGeomInfo.style.backgroundColor,
            parseFloat(cellGeomInfo.style.opacity)
        );
        context.fillRect(cellGeomInfo.left, cellGeomInfo.top, cellGeomInfo.width, cellGeomInfo.height);
    }
    context.restore();
    var linesElement = shape.querySelector('svg');
    var linesElementStyle = getComputedStyle(linesElement);
    var linesViewBox = linesElement.getAttribute('viewBox').split(/\s+|,/);
    linesViewBox = {
        width: +linesViewBox[2],
        height: +linesViewBox[3]
    };
    var lines = linesElement.childNodes;
    var linesGeomInfo = slideshot.util.getGeomInfo(linesElement);
    context.save();
    context.translate(
        parseFloat(linesElementStyle.left),
        parseFloat(linesElementStyle.top)
    );
    context.scale((1 / linesViewBox.width) * linesGeomInfo.width, (1 / linesViewBox.height) * linesGeomInfo.height);
    slideshot.util.renderSVGPaths(context, linesGeomInfo, lines, null, function () {
        context.restore();
        var textBody = element.querySelector('.textBody');
        var bodyGeomInfo = slideshot.util.getGeomInfo(textBody);
        Array.prototype.forEach.call(textBody.children, function (content) {
            var contentGeomInfo = slideshot.util.getGeomInfo(content);
            context.save();
            context.translate(
                bodyGeomInfo.left + contentGeomInfo.left + contentGeomInfo.marginLeft,
                bodyGeomInfo.top + contentGeomInfo.top + contentGeomInfo.marginTop
            );
            slideshot.util.renderRichText(content, context);
            context.restore();
        });
        next();
    });
};
slideshot.util = {};
slideshot.util.getGeomInfo = function (element) {
    // assume getComputedStyle returns the value in pixel units for top, left, width, height
    // matrix(m11, m12, m21, m22, dx, dy) for transform
    var style = getComputedStyle(element);
    var transform = style.transform;
    var matrix;
    if (!transform || transform === 'none' || !/matrix\(/.test(transform)) {
        matrix = [1, 0, 0, 1, 0, 0]; // a unit matrix, E
    } else {
        matrix = transform.replace(/matrix\(|\)/g, '').split(',').map(function (string) {
            return parseFloat(string);
        });
    }
    return {
        top: parseFloat(style.top),
        left: parseFloat(style.left),
        width: parseFloat(style.width),
        height: parseFloat(style.height),
        marginTop: parseFloat(style.marginTop),
        marginLeft: parseFloat(style.marginLeft),
        marginRight: parseFloat(style.marginRight),
        marginBottom: parseFloat(style.marginBottom),
        matrix: matrix,
        style: style
    };
};
slideshot.util.transformContextByGeomInfo = function (context, geomInfo) {
    var halfWidth = geomInfo.width * 0.5;
    var halfHeight = geomInfo.height * 0.5;
    context.translate(halfWidth + geomInfo.left, halfHeight + geomInfo.top);
    context.transform.apply(context, geomInfo.matrix);
    context.translate(-halfWidth, -halfHeight);
};
slideshot.util.transformContextByElement = function (context, element) {
    var geomInfo = slideshot.util.getGeomInfo(element);
    slideshot.util.transformContextByGeomInfo(context, geomInfo);
};
slideshot.util.renderRichText = function (richTextDiv, context) {
    var calcDiv = document.createElement('div');
    calcDiv.style.visibility = 'hidden';
    calcDiv.style.position = 'absolute';
    calcDiv.style.top = calcDiv.style.left = 0;
    calcDiv.style.width = getComputedStyle(richTextDiv).width;
    calcDiv.innerHTML = Array.prototype.map.call(richTextDiv.querySelectorAll('div > p, div > ul > li'), function (element) {
        var style = getComputedStyle(element);
        var p = '<div style="' + [
            'height: ' + style.height,
            'line-height: ' + style.lineHeight,
            'margin-left: ' + style.marginLeft,
            'text-align: ' + style.textAlign
        ].join(';') + '">';
        p += Array.prototype.map.call(element.querySelectorAll('p > span, li > span, p > br, li > br'), function (element) {
            if (element.tagName === 'BR') return '<br>';
            var style = getComputedStyle(element);
            return '<span style="' + [
                'line-height: ' + style.lineHeight,
                'font-family: ' + style.fontFamily,
                'font-size: ' + style.fontSize,
                'font-weight: ' + style.fontWeight,
                'font-style: ' + style.fontStyle,
                'text-decoration: ' + style.textDecoration,
                'color: ' + style.color
            ].join(';') + '">' + element.textContent + '</span>';
        }).join('');
        return p + ' </div>';
    }).join('');
    document.body.appendChild(calcDiv);
    context.textBaseline = 'ideographic';
    Array.prototype.forEach.call(calcDiv.children, function (paragraph) {
        Array.prototype.forEach.call(paragraph.children, function (run) {
            var style = run.style;
            var underline = style.textDecoration.indexOf('underline') > -1;
            var strikethrough = style.textDecoration.indexOf('line-through') > -1;
            var font = [style.fontSize, style.fontFamily];
            if (style.fontStyle === 'italic') font.unshift('italic');
            if (style.fontWeight === 'bold') font.unshift('bold');
            context.font = font.join(' ');
            context.fillStyle = style.color;
            Array.prototype.forEach.call(run.childNodes, function (node) {
                var text = node.textContent;
                var range = document.createRange();
                var rect, thickness;
                for (var i = 0; i < text.length; ++i) {
                    range.setStart(node, i);
                    range.setEnd(node, i + 1);
                    rect = range.getBoundingClientRect();
                    context.fillText(text.charAt(i), rect.left, rect.bottom);
                    thickness = rect.height * 0.035;
                    if (underline)
                        context.fillRect(rect.left, rect.bottom, rect.width, thickness);
                    if (strikethrough)
                        context.fillRect(rect.left, rect.top + rect.height * 0.5, rect.width, thickness);
                }
            });
        });
    });
    document.body.removeChild(calcDiv);
};
slideshot.util.renderSVGPath = function (context, geomInfo, path, defs, callback) {
    var fillOpacity = path.getAttribute('fill-opacity');
    var strokeWidth = path.getAttribute('stroke-width');
    var strokeLineJoin = path.getAttribute('stroke-linejoin');
    var strokeOpacity = path.getAttribute('stroke-opacity');
    var strokeDash = path.getAttribute('stroke-dasharray');
    fillOpacity = fillOpacity === null ? 1 : fillOpacity;
    strokeOpacity = strokeOpacity === null ? 1 : strokeOpacity;
    if (!!strokeDash && strokeDash !== 'false')
        strokeDash = strokeDash.split(',').map(function (dash) { return parseFloat(dash); });
    else
        strokeDash = null;
    switch (path.tagName.toLowerCase()) {
    case 'path':
        slideshot.util.doSVGPath(context, path.getAttribute('d'));
        break;
    case 'line':
        slideshot.util.doSVGLine(context,
            path.getAttribute('x1'), path.getAttribute('y1'),
            path.getAttribute('x2'), path.getAttribute('y2')
        );
        break;
    default:
        throw new Error('unsupported path');
    }
    slideshot.util.createStyle('fill', context, geomInfo, path, defs, function (fillStyle) {
        if (fillStyle !== 'none') {
            context.fillStyle = fillStyle;
            context.globalAlpha = fillOpacity;
            context.fill();
        }
        slideshot.util.createStyle('stroke', context, geomInfo, path, defs, function (strokeStyle) {
            if (strokeDash !== null)
                context.setLineDash(strokeDash);
            if (strokeStyle !== 'none') {
                context.strokeStyle = strokeStyle;
                context.lineWidth = parseFloat(strokeWidth);
                context.lineJoin = strokeLineJoin;
                context.globalAlpha = strokeOpacity;
                context.stroke();
            }
            callback();
        });
    });
};
slideshot.util.renderSVGPaths = function (context, geomInfo, paths, defs, callback) {
    var current = 0;
    if (paths.length < 1) {
        callback();
        return;
    }
    doNext();
    function next() {
        context.restore();
        if (current === paths.length)
            callback();
        else
            setTimeout(doNext, 0);
    }
    function doNext() {
        context.save();
        slideshot.util.renderSVGPath(context, geomInfo, paths[current++], defs, next);
    }
};
slideshot.util.ellipticalArcTo = function (context, sx, sy, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    // calc
    var d2r, pi, pi2;
    var hdx, hdy, hsx, hsy;
    var cosr, sinr;
    var xPrime, yPrime, xpxp, ypyp;
    var radii, rxrx, ryry;
    var rxrxypyp, ryryxpxp;
    var c, cxPrime, cyPrime;
    var cx, cy;
    var ux, uy, vx, vy;
    var startAngle, sweepAngle;
    if (+rx === 0 || +ry === 0) {
        context.lineTo(x, y);
        return;
    }
    pi = Math.PI;
    d2r = pi / 180;
    pi2 = pi + pi;
    xAxisRotation = xAxisRotation * d2r;
    hdx = (sx - x) * 0.5;
    hdy = (sy - y) * 0.5;
    hsx = (sx + x) * 0.5;
    hsy = (sy + y) * 0.5;
    cosr = Math.cos(xAxisRotation);
    sinr = Math.sin(xAxisRotation);
    xPrime = (cosr * hdx) + (sinr * hdy);
    yPrime = (-sinr * hdx) + (cosr * hdy);
    rxrx = rx * rx;
    ryry = ry * ry;
    xpxp = xPrime * xPrime;
    ypyp = yPrime * yPrime;
    radii = (xpxp / rxrx) + (ypyp / ryry);
    if (radii > 1) {
        rx = Math.sqrt(radii) * rx;
        ry = Math.sqrt(radii) * ry;
        rxrx = rx * rx;
        ryry = ry * ry;
    }
    rxrxypyp = rxrx * ypyp;
    ryryxpxp = ryry * xpxp;
    c = ((rxrx * ryry) - rxrxypyp - ryryxpxp) / (rxrxypyp + ryryxpxp);
    c = Math.sqrt(c < 0 ? 0 : c);
    c = largeArcFlag === sweepFlag ? -c : c;
    cxPrime = c * ((rx * yPrime) / ry);
    cyPrime = c * -((ry * xPrime) / rx);
    cx = (cosr * cxPrime) + (-sinr * cyPrime) + hsx;
    cy = (sinr * cxPrime) + (cosr * cyPrime) + hsy;
    ux = (xPrime - cxPrime) / rx;
    uy = (yPrime - cyPrime) / ry;
    vx = (-xPrime - cxPrime) / rx;
    vy = (-yPrime - cyPrime) / ry;
    startAngle = Math.atan2(uy, ux) - Math.atan2(0, 1);
    sweepAngle = Math.atan2(vy, vx) - Math.atan2(uy, ux);
    if (!sweepFlag && sweepAngle > 0)
        sweepAngle -= pi2;
    else if (sweepFlag && sweepAngle < 0)
        sweepAngle += pi2;
    sweepAngle %= pi2;
    // render
    var segs = Math.ceil(Math.abs(sweepAngle) / (pi * 0.25));
    var segAngle = sweepAngle / segs;
    var theta = segAngle * 0.5;
    var cost = Math.cos(theta);
    var angle = startAngle;
    var sina, cosa, sinb, cosb;
    for (var i = 0; i < segs; ++i) {
        angle += theta + theta;
        sina = Math.sin(angle - theta);
        cosa = Math.cos(angle - theta);
        sinb = Math.sin(angle);
        cosb = Math.cos(angle);
        div = Math.cos(theta);
        context.quadraticCurveTo(
            (rx * cosa * cosr - ry * sina * sinr) / cost + cx,
            (rx * cosa * sinr + ry * sina * cosr) / cost + cy,
            (rx * cosb * cosr - ry * sinb * sinr) + cx,
            (rx * cosb * sinr + ry * sinb * cosr) + cy
        );
    }
    context.lineTo(x, y);
};
slideshot.util.doSVGPath = function (context, svgPathString) {
    var d = svgPathString.split(/\s+|,/).reverse();
    var sx = 0, sy = 0, x = 0, y = 0;
    context.beginPath();
    while (d.length > 1) {
        var command = d.pop();
        switch (command) {
        case 'M': context.moveTo(sx = x = +d.pop(), sy = y = +d.pop()); continue;
        case 'm': context.moveTo(sx = x += +d.pop(), sy = y += +d.pop()); continue;
        case 'L': context.lineTo(x = +d.pop(), y = +d.pop()); continue;
        case 'l': context.lineTo(x += +d.pop(), y += +d.pop()); continue;
        case 'Q': context.quadraticCurveTo(+d.pop(), +d.pop(), x = +d.pop(), y = +d.pop()); continue;
        case 'q': context.quadraticCurveTo(x + (+d.pop()) ,y + (+d.pop()), x += +d.pop(), y += +d.pop()); continue;
        case 'C': context.bezierCurveTo(+d.pop(), +d.pop(), +d.pop(), +d.pop(), x = +d.pop(), y = +d.pop()); continue;
        case 'c': context.bezierCurveTo(x + (+d.pop()), y + (+d.pop()), x + (+d.pop()), y + (+d.pop()), x += +d.pop(), y += +d.pop()); continue;
        case 'A': slideshot.util.ellipticalArcTo(context, x, y, +d.pop(), +d.pop(), +d.pop(), +d.pop(), +d.pop(), x = +d.pop(), y = +d.pop()); continue;
        case 'a': slideshot.util.ellipticalArcTo(context, x, y, +d.pop(), +d.pop(), +d.pop(), +d.pop(), +d.pop(), x += +d.pop(), y += +d.pop()); continue;
        case 'Z': case 'z': x = sx; y = sy; context.closePath(); continue;
        default: throw new Error('unsupported command: ' + command);
        }
    }
};
slideshot.util.doSVGLine = function (context, x1, y1, x2, y2) {
    context.beginPath();
    context.moveTo(+x1, +y1);
    context.lineTo(+x2, +y2);
};
slideshot.util.createStyle = function (type, context, geomInfo, path, defs, callback) {
    var style = path.getAttribute(type);
    if (style === null || style === undefined || style === 'none') {
        callback('none');
        return;
    }
    var url = /url\((.+)\)/.exec(style);
    var id, def;
    if (url !== null) {
        id = url[1];
        if (defs === null || defs === undefined || defs.childNodes.length === 0)
            throw new Error('there is no def');
        for (var i = 0; i < defs.childNodes.length; ++i) {
            def = defs.childNodes[i];
            if (defs.childNodes[i].id === id) {
                def = defs.childNodes[i];
                break;
            }
        }
        if (def === undefined)
            throw new Error('there is no corresponding def: ' + id);
        switch (def.tagName.toLowerCase()) {
        case 'lineargradient':
            (function () {
                style = context.createLinearGradient(
                    parseFloat(def.x1.baseVal.valueAsString) * geomInfo.width * 0.01,
                    parseFloat(def.y1.baseVal.valueAsString) * geomInfo.height * 0.01,
                    parseFloat(def.x2.baseVal.valueAsString) * geomInfo.width * 0.01,
                    parseFloat(def.y2.baseVal.valueAsString) * geomInfo.height * 0.01
                );
                var stop, offset, color, opacity;
                for (var i = 0; i < def.childNodes.length; ++i) {
                    stop = def.childNodes[i];
                    offset = parseInt(stop.getAttribute('offset'), 10) * 0.01;
                    color = slideshot.util.applyOpacityToColorString(
                        stop.style.stopColor,
                        parseFloat(stop.style.stopOpacity)
                    );
                    style.addColorStop(offset, color);
                }
                callback(style);
            })();
            return;
        case 'pattern':
            (function () {
                var sourceImage = def.childNodes[0];
                if (sourceImage.tagName.toLowerCase() !== 'image')
                    throw new Error('unsupported pattern');
                var href = sourceImage.href.baseVal;
                var width = parseFloat(sourceImage.width.baseVal.valueAsString);
                var height = parseFloat(sourceImage.height.baseVal.valueAsString);
                var image = new Image();
                image.onload = function () {
                    var resizeCanvas = document.createElement('canvas');
                    resizeCanvas.width = width | 0;
                    resizeCanvas.height = height | 0;
                    resizeCanvas.getContext('2d').drawImage(image, 0, 0, width, height);
                    style = context.createPattern(resizeCanvas, 'repeat');
                    callback(style);
                };
                image.src = href;
            })();
            return;
        default:
            throw new Error('unsupported style');
        }
        return;
    }
    callback(style);
};
slideshot.util.parseColor = function (cssColorString) {
    var shorthandHex = /^#(.)(.)(.)$/.exec(cssColorString);
    if (shorthandHex !== null) {
        return {
            r: parseInt(shorthandHex[1] + shorthandHex[1], 16),
            g: parseInt(shorthandHex[2] + shorthandHex[2], 16),
            b: parseInt(shorthandHex[3] + shorthandHex[3], 16),
            a: 1
        };
    }
    var hex = /^#(..)(..)(..)$/.exec(cssColorString);
    if (hex !== null) {
        return {
            r: parseInt(hex[1], 16),
            g: parseInt(hex[2], 16),
            b: parseInt(hex[3], 16),
            a: 1
        };
    }
    var rgb = /^rgb\((.+),(.+),(.+)\)$/.exec(cssColorString);
    if (rgb !== null) {
        return {
            r: parseInt(rgb[1], 10),
            g: parseInt(rgb[2], 10),
            b: parseInt(rgb[3], 10),
            a: 1
        };
    }
    var rgba = /^rgba\((.+),(.+),(.+),(.+)\)$/.exec(cssColorString);
    if (rgba !== null) {
        return {
            r: parseInt(rgba[1], 10),
            g: parseInt(rgba[2], 10),
            b: parseInt(rgba[3], 10),
            a: parseFloat(rgba[4])
        };
    }
    throw new Error('unsupported color string: ' + cssColorString);
};
slideshot.util.toCSSColorString = function (rgba) {
    return 'rgba(' + [rgba.r, rgba.g, rgba.b, rgba.a].join(',') + ')';
};
slideshot.util.applyOpacityToColorString = function (cssColorString, opacity) {
    color = slideshot.util.parseColor(cssColorString);
    color.a = isNaN(opacity)? 1 : opacity;
    return slideshot.util.toCSSColorString(color);
};
slideshot.debug = true;
slideshot({
    progress: function (current, total, type) {
        console.log(type + ': ' + current + ' / ' + total);
    },
    complete: function (canvas) {
        var dataURL = canvas.toDataURL();
        var img = new Image();
        img.src = dataURL;
        console.log('render completed');
        console.log('data url: ', dataURL);
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.zIndex = '9999999999';
        var sx, sy, ix, iy;
        img.onmousedown = function (e) {
            sx = e.clientX;
            sy = e.clientY;
            ix = parseInt(img.style.left, 10);
            iy = parseInt(img.style.top, 10);
            img.style.opacity = '0.5';
            window.addEventListener('mousemove', mousemove);
            window.addEventListener('mouseup', mouseup);
        };
        function mousemove(e) {
            img.style.top = (iy + e.clientY - sy) + 'px';
            img.style.left = (ix + e.clientX - sx) + 'px';
        }
        function mouseup(e) {
            img.style.opacity = '1';
            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
        }
        img.ondblclick = function () {
            img.parentElement.removeChild(img);
        };
        document.body.appendChild(img);
    }
});

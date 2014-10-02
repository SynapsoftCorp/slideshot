function cashbus(hook, debug) { // capture current slide
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
            else if (debug)
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
        var renderFunction = cashbus.render[renderItem.type];
        if (hook && hook.progress)
            hook.progress(renderPhase, renderQueue.length, renderItem.type);
        var groupGeomInfo;
        if (renderFunction) {
            context.save();
            if (renderItem.isGrouped) {
                groupGeomInfo = cashbus.util.getGeomInfo(renderItem.group);
                cashbus.util.transformContextByGeomInfo(context, groupGeomInfo);
            }
            renderFunction(renderItem.element, context, function () {
                context.restore();
                completeOrNext();
            });
        }
        else {
            if (debug)
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
cashbus.render = {};
cashbus.render.slideBackground = function (element, context, next) {
    var canvas = context.canvas;
    var fillColor = $Element($$('.viewport', element)[0].children[0]).attr('fill');
    context.fillStyle = fillColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    next();
};
cashbus.render.line =
cashbus.render.straightConnector1 =
cashbus.render.bentConnector2 =
cashbus.render.bentConnector3 =
cashbus.render.bentConnector4 =
cashbus.render.bentConnector5 =
cashbus.render.curvedConnector2 =
cashbus.render.curvedConnector3 =
cashbus.render.curvedConnector4 =
cashbus.render.curvedConnector5 =
cashbus.render.roundrect =
cashbus.render.roundRect =
cashbus.render.snip1Rect =
cashbus.render.snip2SameRect =
cashbus.render.snip2DiagRect =
cashbus.render.snipRoundRect =
cashbus.render.round1Rect =
cashbus.render.round2SameRect =
cashbus.render.round2DiagRect =
cashbus.render.oval =
cashbus.render.ellipse =
cashbus.render.triangle =
cashbus.render.rtTriangle =
cashbus.render.parallelogram =
cashbus.render.Trapezoid =
cashbus.render.trapezoid =
cashbus.render.Trapezoid_2007 =
cashbus.render.trapezoid_2007 =
cashbus.render.diamond =
cashbus.render.pentagon =
cashbus.render.hexagon =
cashbus.render.heptagon =
cashbus.render.octagon =
cashbus.render.decagon =
cashbus.render.dodecagon =
cashbus.render.pie =
cashbus.render.chord =
cashbus.render.frame =
cashbus.render.halfFrame =
cashbus.render.corner =
cashbus.render.diagStripe =
cashbus.render.plus =
cashbus.render.plaque =
cashbus.render.can =
cashbus.render.cube =
cashbus.render.bevel =
cashbus.render.Donut =
cashbus.render.donut =
cashbus.render.NoSmoking =
cashbus.render.nosmoking =
cashbus.render.Nosmoking =
cashbus.render.noSmoking =
cashbus.render.blockArc =
cashbus.render.foldedCorner =
cashbus.render.smileyFace =
cashbus.render.heart =
cashbus.render.lightningBolt =
cashbus.render.sun =
cashbus.render.moon =
cashbus.render.cloud =
cashbus.render.arc =
cashbus.render.bracketPair =
cashbus.render.bracePair =
cashbus.render.leftBracket =
cashbus.render.rightBracket =
cashbus.render.leftBrace =
cashbus.render.rightBrace =
cashbus.render.mathPlus =
cashbus.render.mathMinus =
cashbus.render.mathMultiply =
cashbus.render.mathDivide =
cashbus.render.mathEqual =
cashbus.render.mathNotEqual =
cashbus.render.rightArrow =
cashbus.render.leftArrow =
cashbus.render.upArrow =
cashbus.render.downArrow =
cashbus.render.leftRightArrow =
cashbus.render.upDownArrow =
cashbus.render.quadArrow =
cashbus.render.LeftRightUpArrow =
cashbus.render.leftRightUpArrow =
cashbus.render.bentArrow =
cashbus.render.uturnArrow =
cashbus.render.leftUpArrow =
cashbus.render.bentUpArrow =
cashbus.render.curvedRightArrow =
cashbus.render.curvedLeftArrow =
cashbus.render.curvedUpArrow =
cashbus.render.curvedDownArrow =
cashbus.render.stripedRightArrow =
cashbus.render.notchedRightArrow =
cashbus.render.homePlate =
cashbus.render.chevron =
cashbus.render.rightArrowCallout =
cashbus.render.leftArrowCallout =
cashbus.render.upArrowCallout =
cashbus.render.downArrowCallout =
cashbus.render.leftRightArrowCallout =
cashbus.render.quadArrowCallout =
cashbus.render.flowChartProcess =
cashbus.render.flowChartAlternateProcess =
cashbus.render.flowChartDecision =
cashbus.render.flowChartInputOutput =
cashbus.render.flowChartPredefinedProcess =
cashbus.render.flowChartInternalStorage =
cashbus.render.flowChartDocument =
cashbus.render.flowChartMultidocument =
cashbus.render.flowChartTerminator =
cashbus.render.flowChartPreparation =
cashbus.render.flowChartManualInput =
cashbus.render.flowChartManualOperation =
cashbus.render.flowChartConnector =
cashbus.render.flowChartOffpageConnector =
cashbus.render.flowChartPunchedCard =
cashbus.render.flowChartPunchedTape =
cashbus.render.flowChartSummingJunction =
cashbus.render.flowChartOr =
cashbus.render.flowChartCollate =
cashbus.render.flowChartSort =
cashbus.render.flowChartExtract =
cashbus.render.flowChartMerge =
cashbus.render.flowChartOnlineStorage =
cashbus.render.flowChartDelay =
cashbus.render.flowChartMagneticTape =
cashbus.render.flowChartMagneticDisk =
cashbus.render.flowChartMagneticDrum =
cashbus.render.flowChartDisplay =
cashbus.render.irregularSeal1 =
cashbus.render.irregularSeal2 =
cashbus.render.star4 =
cashbus.render.star5 =
cashbus.render.star6 =
cashbus.render.star7 =
cashbus.render.star8 =
cashbus.render.star10 =
cashbus.render.star12 =
cashbus.render.star16 =
cashbus.render.star24 =
cashbus.render.star32 =
cashbus.render.ribbon2 =
cashbus.render.ribbon =
cashbus.render.verticalScroll =
cashbus.render.horizontalScroll =
cashbus.render.wave =
cashbus.render.doubleWave =
cashbus.render.wedgeRectCallout =
cashbus.render.wedgeRoundRectCallout =
cashbus.render.wedgeEllipseCallout =
cashbus.render.custom =
cashbus.render.teardrop =
cashbus.render.cloudCallout =
cashbus.render.borderCallout1 =
cashbus.render.borderCallout2 =
cashbus.render.borderCallout3 =
cashbus.render.borderCallout4 =
cashbus.render.accentCallout1 =
cashbus.render.accentCallout2 =
cashbus.render.accentCallout3 =
cashbus.render.accentCallout4 =
cashbus.render.callout1 =
cashbus.render.callout2 =
cashbus.render.callout3 =
cashbus.render.callout4 =
cashbus.render.accentBorderCallout1 =
cashbus.render.accentBorderCallout2 =
cashbus.render.accentBorderCallout3 =
cashbus.render.accentBorderCallout4 =
cashbus.render.unknown =
cashbus.render.upDownArrowCallout =
cashbus.render.circularArrow =
cashbus.render.ellipseRibbon2 =
cashbus.render.ellipseRibbon =
cashbus.render.actionButtonBackPrevious =
cashbus.render.actionButtonBeginning =
cashbus.render.actionButtonBlank =
cashbus.render.actionButtonDocument =
cashbus.render.actionButtonEnd =
cashbus.render.actionButtonForwardNext =
cashbus.render.actionButtonHelp =
cashbus.render.actionButtonHome =
cashbus.render.actionButtonInformation =
cashbus.render.actionButtonMovie =
cashbus.render.actionButtonReturn =
cashbus.render.actionButtonSound =
cashbus.render.leftCircularArrow =
cashbus.render.swooshArrow =
cashbus.render.gear9 =
cashbus.render.gear6 =
cashbus.render.leftRightRibbon =
cashbus.render.pieWedge =
cashbus.render.funnel =
cashbus.render.rect = function (element, context, next) {
    var geomInfo = cashbus.util.getGeomInfo(element);
    cashbus.util.transformContextByGeomInfo(context, geomInfo);
    var paths = element.querySelectorAll('svg:first-child g > path');
    var defs = element.querySelector('svg:first-child defs');
    cashbus.util.renderSVGPaths(context, geomInfo, paths, defs, function () {
        var $textArea = $$('.textArea', element);
        if ($textArea.length < 1) {
            next();
            return;
        }
        var textArea = $textArea[0];
        var content = $$('.content', textArea)[0];
        var areaStyle = getComputedStyle(textArea);
        var bodyStyle = getComputedStyle($$('.textBody', textArea)[0]);
        var contentStyle = getComputedStyle(content);
        context.translate(
            parseFloat(areaStyle.left) + parseFloat(bodyStyle.marginLeft),
            parseFloat(areaStyle.top) + parseFloat(bodyStyle.marginTop)
        );
        cashbus.util.renderRichText(content, context, parseFloat(contentStyle.width));
        next();
    });
};
cashbus.render.picture = function (element, context, next) {
    cashbus.util.transformContextByElement(context, element);
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
cashbus.render.table = function (element, context, next) {
    cashbus.util.transformContextByElement(context, element);
    var shape = element.querySelector('div:first-child');
    var i;
    // fill cells
    var cells = shape.querySelector('div:first-child').children;
    var cell, cellGeomInfo;
    context.save();
    for (i = 0; i < cells.length; ++i) {
        cell = cells[i];
        cellGeomInfo = cashbus.util.getGeomInfo(cell);
        context.fillStyle = cashbus.util.applyOpacityToColorString(
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
    var linesGeomInfo = cashbus.util.getGeomInfo(linesElement);
    context.save();
    context.translate(
        parseFloat(linesElementStyle.left),
        parseFloat(linesElementStyle.top)
    );
    context.scale((1 / linesViewBox.width) * linesGeomInfo.width, (1 / linesViewBox.height) * linesGeomInfo.height);
    cashbus.util.renderSVGPaths(context, linesGeomInfo, lines, null, function () {
        context.restore();
        var textBody = element.querySelector('.textBody');
        var bodyGeomInfo = cashbus.util.getGeomInfo(textBody);
        Array.prototype.forEach.call(textBody.children, function (content) {
            var contentGeomInfo = cashbus.util.getGeomInfo(content);
            context.save();
            context.translate(
                bodyGeomInfo.left + contentGeomInfo.left + contentGeomInfo.marginLeft,
                bodyGeomInfo.top + contentGeomInfo.top + contentGeomInfo.marginTop
            );
            cashbus.util.renderRichText(content, context, contentGeomInfo.width);
            context.restore();
        });
        next();
    });
};
cashbus.util = {};
cashbus.util.getGeomInfo = function (element) {
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
        matrix: matrix,
        style: style
    };
};
cashbus.util.transformContextByGeomInfo = function (context, geomInfo) {
    var halfWidth = geomInfo.width * 0.5;
    var halfHeight = geomInfo.height * 0.5;
    context.translate(halfWidth + geomInfo.left, halfHeight + geomInfo.top);
    context.transform.apply(context, geomInfo.matrix);
    context.translate(-halfWidth, -halfHeight);
};
cashbus.util.transformContextByElement = function (context, element) {
    var geomInfo = cashbus.util.getGeomInfo(element);
    cashbus.util.transformContextByGeomInfo(context, geomInfo);
};
cashbus.util.renderRichText = function (richTextDiv, context, width) {
    // calc
    width = Math.abs(width);
    var currentLine, lines = [];
    function cut(font, style, text, width) {
        context.font = font;
        context.fillStyle = style;
        if (!text) return 0;
        if (!width) return text.length;
        if (context.measureText(text).width <= width) return text.length;
        var left = 0;
        var right = text.length;
        var center, sliced, textMetrics;
        while (left < right) {
            center = (left + right) * 0.5;
            sliced = text.slice(0, center | 0);
            textMetrics = context.measureText(sliced);
            if (textMetrics.width == width) return sliced.length;
            if (textMetrics.width < width)
                left = Math.ceil(center);
            else
                right = Math.floor(center);
        }
        if (context.measureText(text.slice(0, left)).width < width)
            return left;
        return Math.max(1, left - 1);
    }
    Array.prototype.forEach.call(richTextDiv.querySelectorAll('div > p, div > ul > li'), function (element) {
        var cutWidth;
        var style = getComputedStyle(element);
        function newLine() {
            currentLine = [];
            lines.push(currentLine);
            cutWidth = 0;
        }
        newLine();
        Array.prototype.forEach.call(element.querySelectorAll('p > span, p > br, li > span, li > br'), function (element) {
            if (element.tagName.toLowerCase() === 'br') {
                newLine();
                return; // continue
            }
            var text = element.textContent;
            var style = getComputedStyle(element);
            var font = [style.fontSize, style.fontFamily];
            var height = parseFloat(style.lineHeight);
            if (style.fontStyle === 'italic') font.unshift('italic');
            if (style.fontWeight === 'bold') font.unshift('bold');
            font = font.join(' ');
            style = style.color;
            var cutOffset, needToCut;
            var left, right;
            do {
                cutOffset = cut(font, style, text, Math.abs(width - cutWidth));
                needToCut = cutOffset != text.length;
                left = text.substr(0, cutOffset);
                right = text.substr(cutOffset);
                text = left;
                cutWidth += context.measureText(left).width;
                currentLine.push({
                    height: height,
                    font: font,
                    style: style,
                    text: text
                });
                text = right;
                if (needToCut) newLine();
            } while (needToCut);
        });
    });
    // render
    var verticalOffset = 0;
    context.textBaseline = 'ideographic';
    lines.forEach(function (line) {
        var horizontalOffset = 0;
        verticalOffset += (function () { // Array.reduce is not working properly on naver slide
            var result = 0;
            for (var i = 0; i < line.length; ++i)
                result = Math.max(result, line[i].height);
            return result;
        })();
        line.forEach(function (chunk) {
            context.font = chunk.font;
            context.fillStyle = chunk.style;
            context.fillText(chunk.text, horizontalOffset, verticalOffset);
            horizontalOffset += context.measureText(chunk.text).width;
        });
    });
};
cashbus.util.renderSVGPath = function (context, geomInfo, path, defs, callback) {
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
        cashbus.util.doSVGPath(context, path.getAttribute('d'));
        break;
    case 'line':
        cashbus.util.doSVGLine(context,
            path.getAttribute('x1'), path.getAttribute('y1'),
            path.getAttribute('x2'), path.getAttribute('y2')
        );
        break;
    default:
        throw new Error('unsupported path');
    }
    cashbus.util.createStyle('fill', context, geomInfo, path, defs, function (fillStyle) {
        if (fillStyle !== 'none') {
            context.fillStyle = fillStyle;
            context.globalAlpha = fillOpacity;
            context.fill();
        }
        cashbus.util.createStyle('stroke', context, geomInfo, path, defs, function (strokeStyle) {
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
cashbus.util.renderSVGPaths = function (context, geomInfo, paths, defs, callback) {
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
        cashbus.util.renderSVGPath(context, geomInfo, paths[current++], defs, next);
    }
};
cashbus.util.ellipticalArcTo = function (context, sx, sy, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
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
cashbus.util.doSVGPath = function (context, svgPathString) {
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
        case 'A': cashbus.util.ellipticalArcTo(context, x, y, +d.pop(), +d.pop(), +d.pop(), +d.pop(), +d.pop(), x = +d.pop(), y = +d.pop()); continue;
        case 'a': cashbus.util.ellipticalArcTo(context, x, y, +d.pop(), +d.pop(), +d.pop(), +d.pop(), +d.pop(), x += +d.pop(), y += +d.pop()); continue;
        case 'Z': case 'z': x = sx; y = sy; context.closePath(); continue;
        default: throw new Error('unsupported command: ' + command);
        }
    }
};
cashbus.util.doSVGLine = function (context, x1, y1, x2, y2) {
    context.beginPath();
    context.moveTo(+x1, +y1);
    context.lineTo(+x2, +y2);
};
cashbus.util.createStyle = function (type, context, geomInfo, path, defs, callback) {
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
                    color = cashbus.util.applyOpacityToColorString(
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
cashbus.util.parseColor = function (cssColorString) {
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
cashbus.util.toCSSColorString = function (rgba) {
    return 'rgba(' + [rgba.r, rgba.g, rgba.b, rgba.a].join(',') + ')';
};
cashbus.util.applyOpacityToColorString = function (cssColorString, opacity) {
    color = cashbus.util.parseColor(cssColorString);
    color.a = opacity;
    return cashbus.util.toCSSColorString(color);
};
cashbus({
    progress: function (current, total, type) {
        console.log(type + ': ' + current + ' / ' + total);
    },
    complete: function (canvas) {
        console.log('render completed');
        var img = new Image();
        img.src = canvas.toDataURL();
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
}, false);

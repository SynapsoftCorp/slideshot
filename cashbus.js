function cashbus(hook, debug) { // capture current slide
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var canvasWrapper = $$('.canvasWrapper')[0];
    var slideStyle = getComputedStyle(canvasWrapper.parentElement);
    canvas.width = parseInt(slideStyle.width, 10);
    canvas.height = parseInt(slideStyle.height, 10);
    var renderQueue = [];
    $$('> div', canvasWrapper).each(function (element) {
        var type;
        var $element = $Element(element);
        if ($element.hasClass('placeHolder')) {
            type = element.className.trim().split(/\s+/)[1];
        } else if ($element.hasClass('selection')) {
            return; // ignore selection
        } else {
            if (/slide.+_background/.test(element.id))
                type = 'slideBackground';
            else if (debug)
                throw new Error('this is not slide background');
        }
        renderQueue.push({
            type: type,
            element: element,
            zIndex: element.style.zIndex | 0
        });
    });
    renderQueue.sort(function (a, b) {
        return a.zIndex < b.zIndex ? -1 : 1;
    });
    var renderPhase = 0;
    if (renderQueue.length > 0)
        setTimeout(renderNext, 0); // set timeout to clear call stack
    function renderNext() {
        if (hook && hook.progress)
            hook.progress(renderPhase, renderQueue.length);
        if (renderPhase === renderQueue.length) {
            if (hook && hook.complete)
                hook.complete(canvas);
            return;
        }
        var renderItem = renderQueue[renderPhase++];
        var renderFunction = cashbus.render[renderItem.type];
        if (renderFunction) {
            context.save();
            renderFunction(renderItem.element, context, function () {
                context.restore();
                setTimeout(renderNext, 0);
            });
        }
        else {
            if (debug)
                throw new Error('we need to implement ' + renderItem.type + ' render function');
            setTimeout(renderNext, 0);
        }
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
cashbus.render.rect = function (element, context, next) {
    var geomInfo = cashbus.util.getGeomInfo(element);
    cashbus.util.transformContextByGeomInfo(context, geomInfo);
    var path = element.querySelector('svg:first-child path');
    var defs = element.querySelector('svg:first-child defs');
    var fillOpacity = path.getAttribute('fill-opacity');
    var strokeWidth = path.getAttribute('stroke-width');
    var strokeLineJoin = path.getAttribute('stroke-linejoin');
    var strokeOpacity = path.getAttribute('stroke-opacity');
    fillOpacity = fillOpacity === null ? 1 : fillOpacity;
    strokeOpacity = strokeOpacity === null ? 1 : strokeOpacity;
    cashbus.util.createStyle('fill', context, path, defs, function (fillStyle) {
        if (fillStyle !== 'none') {
            context.fillStyle = fillStyle;
            context.globalAlpha = fillOpacity;
            context.fillRect(0, 0, geomInfo.width, geomInfo.height);
        }
        cashbus.util.createStyle('stroke', context, path, defs, function (strokeStyle) {
            if (strokeStyle !== 'none') {
                context.strokeStyle = strokeStyle;
                context.lineWidth = parseFloat(strokeWidth);
                context.lineJoin = strokeLineJoin;
                context.globalAlpha = strokeOpacity;
                context.strokeRect(0, 0, geomInfo.width, geomInfo.height);
            }
            var style = getComputedStyle($$('.textArea .textBody', element)[0]);
            context.translate(parseFloat(style.marginLeft), parseFloat(style.marginTop));
            cashbus.util.renderRichText($$('.textArea .content', element)[0], context, geomInfo.width);
            next();
        });
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
cashbus.util = {};
cashbus.util.getGeomInfo = function (element) {
    // assume getComputedStyle returns the value in pixel units for top, left, width, height
    // matrix(m11, m12, m21, m22, dx, dy) for transform
    var style = getComputedStyle(element);
    var transform = style.transform;
    if (!transform || transform === 'none' || !/matrix\(/.test(transform)) return;
    var matrix = transform.replace(/matrix\(|\)/g, '').split(',').map(function (string) {
        return parseFloat(string);
    });
    return {
        top: parseFloat(style.top),
        left: parseFloat(style.left),
        width: parseFloat(style.width),
        height: parseFloat(style.height),
        matrix: matrix
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
cashbus.util.renderRichText = function (richTextDiv, context, width, height) {
    var verticalOffset = 0;
    context.textBaseline = 'ideographic';
    $$('p, li', richTextDiv).each(function (element) {
        var offset = 0;
        var style = getComputedStyle(element);
        verticalOffset += parseFloat(style.lineHeight);
        $$('span', element).each(function (element) {
            var style = getComputedStyle(element);
            var font = [style.fontSize, style.fontFamily];
            if (style.fontWeight === 'bold') font.unshift('bold');
            if (style.fontStyle === 'italic') font.unshift('italic');
            context.font = font.join(' ');
            var text = element.textContent;
            var textMetrics = context.measureText(text);
            context.fillStyle = style.color;
            context.fillText(text, offset, verticalOffset);
            offset += textMetrics.width;
        });
    });
};
cashbus.util.createStyle = function (type, context, path, defs, callback) {
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
                    def.x1.baseVal.value,
                    def.y1.baseVal.value,
                    def.x2.baseVal.value,
                    def.y2.baseVal.value
                );
                var stop, offset, color, opacity;
                for (var i = 0; i < def.childNodes.length; ++i) {
                    stop = def.childNodes[i];
                    offset = parseInt(stop.getAttribute('offset'), 10) * 0.01;
                    color = cashbus.util.parseColor(stop.style.stopColor);
                    opacity = parseFloat(stop.style.stopOpacity);
                    color.a = opacity;
                    color = cashbus.util.toCSSColorString(color);
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
cashbus({
    progress: function (current, total) {
        console.log(current + ' / ' + total);
    },
    complete: function (canvas) {
        console.log('render completed');
        console.log(canvas.toDataURL());
    }
}, false);

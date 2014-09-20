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
    var fillColor = path.getAttribute('fill');
    var fillOpacity = path.getAttribute('fill-opacity');
    var strokeColor = path.getAttribute('stroke');
    var strokeWidth = path.getAttribute('stroke-width');
    var strokeLineJoin = path.getAttribute('stroke-linejoin');
    var strokeOpacity = path.getAttribute('stroke-opacity');
    strokeOpacity = strokeOpacity === null ? 1 : strokeOpacity;
    if (fillColor && fillColor !== 'none') {
        context.fillStyle = fillColor;
        context.globalAlpha = fillOpacity;
        context.fillRect(0, 0, geomInfo.width, geomInfo.height);
    }
    if (strokeColor && strokeColor !== 'none') {
        context.strokeStyle = strokeColor;
        context.lineWidth = parseFloat(strokeWidth);
        context.lineJoin = strokeLineJoin;
        context.globalAlpha = strokeOpacity;
        context.strokeRect(0, 0, geomInfo.width, geomInfo.height);
    }
    var style = getComputedStyle($$('.textArea .textBody', element)[0]);
    context.translate(parseFloat(style.marginLeft), parseFloat(style.marginTop));
    cashbus.util.renderRichText($$('.textArea .content', element)[0], context, geomInfo.width);
    next();
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
cashbus({
    progress: function (current, total) {
        console.log(current + ' / ' + total);
    },
    complete: function (canvas) {
        console.log('render completed');
        console.log(canvas.toDataURL());
    }
}, false);

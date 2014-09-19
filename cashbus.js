function cashbus(hook, debug) { // capture current slide
    var canvas = document.createElement('canvas');
    var canvasWrapper = $$('.canvasWrapper')[0];
    var currentSlideElement = canvasWrapper.parentElement;
    var slideWidth = parseInt(currentSlideElement.style.width, 10);
    var slideHeight = parseInt(currentSlideElement.style.height, 10);
    //TODO: set the canvas width & height
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
        setTimeout(renderNext, 0);
    function renderNext() {
        if (renderPhase === renderQueue.length) {
            if (hook && hook.complete)
                hook.complete();
            return;
        }
        if (hook && hook.progress)
            hook.progress(renderPhase, renderQueue.length);
        var renderItem = renderQueue[renderPhase++];
        var renderFunction = cashbus.render[renderItem.type];
        if (renderFunction) {
            renderFunction(renderItem.element, canvas.getContext('2d'), function () {
                setTimeout(renderNext, 0); // set timeout to clear call stack
            });
        }
        else if (debug) {
            throw new Error('we need to implement ' + renderItem.type + ' render function');
        }
    }
    return canvas;
}
cashbus.render = {};
cashbus.render.slideBackground = function (element, context, next) {
    console.log('render slideBackground');
    next();
};
cashbus.render.rect = function (element, context, next) {
    console.log('render rect');
    next();
};
cashbus.render.picture = function (element, context, next) {
    console.log('render picture');
    next();
};
cashbus({
    progress: function (current, total) { console.log(current + ' / ' + total); },
    complete: function () { console.log('render completed'); }
}, true);

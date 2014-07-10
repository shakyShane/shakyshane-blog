var getUtils = function (context) {

    /**
     * Draw the arrow to stage
     * @param x
     * @param y
     * @param [angle]
     */
    function drawArrow(x, y, angle, color) {
        context.strokeStyle = color || '#808080';
        drawLine(x - 50, y, x, y);
        drawLine(x, y, x - 15, y - 10);
        drawLine(x, y, x - 15, y + 10);
    }

    /** Helpers **/
    function addLabel(x, y, text, color, size) {

        size  = size || 16;
        context.fillStyle = color || "blue";
        context.font = size + "px Arial";
        context.fillText(text, x + 5, y);
    }

    function drawDot(x, y, size, color) {
        context.beginPath();
        context.fillStyle = color || "black";
        context.arc(x, y, size || 2, 0, Math.PI * 2, false);
        context.fill();
    }

    /**
     * @param x
     * @param y
     * @param endx
     * @param endy
     * @param [color]
     */
    function drawLine(x, y, endx, endy, color) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(endx, endy);
        context.strokeStyle = color || 'black';
        context.stroke();
    }


    function drawCircle(x, y, radius, color) {
        context.beginPath();
        context.arc(x || 0, y || 0, radius || 10, 0, Math.PI * 2, false);
        context.fillStyle = color || "blue";
        context.fill();
    }

    function drawRect(x, y, width, height, color) {
        context.fillStyle = color || "blue";
        context.fillRect(x, y, width, height);
    }



    function lerp (min, max, norm) {
        return (max - min) * norm + min;
    }

    function norm(min, max, value) {
        return (value - min) / (max - min);
    }

    function map(value, sourceMin, sourceMax, destMin, destMax) {
        return lerp(destMin, destMax, norm(sourceMin, sourceMax, value));
    }

    function clamp(min, max, value) {
        if (value > max) {
            return max;
        }
        if (value < min) {
            return min;
        }
        return value;
    }

    return {
        drawArrow: drawArrow,
        addLabel: addLabel,
        drawLine: drawLine,
        drawDot: drawDot,
        drawCircle: drawCircle,
        drawRect: drawRect,
        norm: norm,
        lerp: lerp,
        map: map,
        clamp: clamp,
        degreesToRads: function (deg) {
            return deg/180*Math.PI;
        },
        radsToDegrees: function (rad) {
            return rad/180*Math.PI;
        },

    }
};
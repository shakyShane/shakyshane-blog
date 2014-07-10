window.onload = function () {
    var angle2;
    var canvas    = document.getElementById("canvas");
    var context   = canvas.getContext("2d");
    var width     = canvas.width = window.innerWidth;
    var height    = canvas.height = window.innerHeight;
    var utils     = getUtils(context);
    var p         = particle.create(width/2, height/2, 0, 0);
    var thrust    = vector.create(0, 0);

    var loop;
    var angle = -Math.PI/2;
    var turningLeft = false,
        turningRight = false,
        thrusting = false,
        braking   = false,
        brakePower = 0.2,
        turnSpeed = 0.09,
        speedLimit = 20,
        accelerationSpeed = 0.1,
        minSpeedX = 100,
        maxSpeedX = width-100,
        needleLength = 90;

    var needle    = window.speedo = particle.create(width/2, height-needleLength, needleLength, 0);

    update();


    function drawNeedle(newLength) {

        var minAngle = 0,
            maxAngle = 180;

        // Get a normalised value from the velocity vector of ship (current speed)
        var needleNorm = utils.norm(0, 10, utils.clamp(0, 10, newLength));

        // turn that norm value into a lerped value using min & max angles
        var needleAngle = utils.lerp(minAngle, maxAngle, needleNorm);

        // Get the new Y property using trig function sin
        var newY = Math.sin(utils.degreesToRads(needleAngle)) * needle.velocity.getLength();

        // Get the new X value using pythagorean theorem
        var newX = Math.sqrt(needleLength * needleLength - newY * newY);

        // Because we creating the speedo needle at bottom center screen,
        // we need to know whether to deduct the new X value (if below 90)
        // Or add it (above 90) to the start point (center)
        needle.position.setX(needleAngle <= 90 ? width / 2 - newX : width / 2 + newX);

        // Because Y pos will always be less that the height of the window,
        // a simple minus is good here.
        needle.position.setY(height - newY);

        // Now draw a line from bottom center, to the new coords
        utils.drawLine(width / 2, height, needle.position.getX(), needle.position.getY(), "green");

        // And place a circle at the top
        var color = "green";
        var size  = 2;

        if (needleAngle > 90 && needleAngle < 130) {
            color = "orange"
        }
        if (needleAngle >= 131) {
            color = "red";
        }

        utils.drawCircle(needle.position.getX(), needle.position.getY(), size, color);
    }

    function update() {

        context.clearRect(0, 0, width, height);

        utils.drawCircle(width/2, height, 5, "red");


        // decrease angle if turning left
        if (turningLeft) {
            angle -= turnSpeed;
        }

        // increase angle if turning right
        if (turningRight) {
            angle += turnSpeed;
        }

        thrust.setAngle(angle);

        if (thrusting && !braking) {

            thrust.setLength(accelerationSpeed);

        } else {
            thrust.setLength(0);
        }

        if (braking && !thrusting) {
            thrust.setLength(0);
            if (p.velocity.getLength() > 0) {
                p.velocity.setLength(p.velocity.getLength()-brakePower);
            }
        }

        if (p.velocity.getLength() >= speedLimit) {
            p.velocity.setLength(speedLimit);
        }


        p.accelerate(thrust);
        p.update();

        drawNeedle(p.velocity.getLength());

        context.save();
        context.translate(p.position.getX(), p.position.getY());
        context.rotate(angle);

        context.beginPath();
        context.moveTo(10, 0);
        context.lineTo(-10, -7);
        context.lineTo(-10, 7);
        context.lineTo(10, 0);
        context.strokeStyle = 'white';
        context.stroke();


        if (thrusting) {

            var norm = utils.norm(0, 10, utils.clamp(0, 10, p.velocity.getLength()));

            var fireLength = utils.lerp(10, 40, norm);

            context.beginPath();
            context.moveTo(-10, 0);
            context.strokeStyle = 'red';
            context.lineTo(-fireLength, 0);
            context.stroke();

        }

        context.restore();

        if (p.position.getX() > width) {
            p.position.setX(0);
        }
        if (p.position.getX() < 0) {
            p.position.setX(width);
        }
        if (p.position.getY() > height) {
            p.position.setY(0);
        }
        if (p.position.getY() < 0) {
            p.position.setY(height);
        }

        loop = requestAnimationFrame(update);
    }

    document.body.addEventListener("keydown", function (evt) {
        switch (evt.keyCode) {
            case 38 : // up
                thrusting = true;
                break;
            case 40 : // down
                braking = true;
                break;
            case 37 : // left
                turningLeft = true;
                break;
            case 39 : // right
                turningRight = true;
                break;

        }
    });
    document.body.addEventListener("keyup", function (evt) {
        switch (evt.keyCode) {
            case 38 : // up
                thrusting = false;
                break;
            case 40 : // up
                braking = false;
                break;
            case 37 :
                turningLeft = false;
                break;
            case 39 :
                turningRight = false;
                break;

        }
    });
};
const PixelScan = (function() {
    class Vec2 {
        x;
        y;
    
        constructor(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        }
    
        static copy(vec) {
            return new Vec2(vec.x, vec.y);
        }
    
        static fromAngle(angle) {
            return new Vec2(Math.cos(angle), Math.sin(angle));
        }
    
        static set(x, y) {
            return new Vec2(x, y);
        }
    
        static from(x, y) {
            return new Vec2(x, y);
        }
    
        copy(vec) {
            this.x = vec.x;
            this.y = vec.y;
    
            return this;
        }
    
        set(x, y) {
            this.x = x;
            this.y = y;
    
            return this;
        }
    
        add(vec) {
            this.x += vec.x;
            this.y += vec.y;
    
            return this;
        }
    
        subtract(vec) {
            this.x -= vec.x;
            this.y -= vec.y;
    
            return this;
        }
    
        sub = this.subtract;
    
        round() {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
    
            return this;
        }
    
        multiply(mat) {
            if (Number.isNaN(mat)) {
                const x = this.x * mat.v0 + this.y * mat.v3 + mat.v6;
                const y = this.x * mat.v1 + this.y * mat.v4 + mat.v7;
                this.x = x;
                this.y = y;
            } else {
                this.x *= mat;
                this.y *= mat;
            }
    
            return this;
        }
    
        mul = this.multiply;
    
        magnitude() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
    
        length = this.magnitude;
    
        magnitudeSquared() {
            return this.x * this.x + this.y * this.y;
        }
    
        square() {
            this.x = this.x * this.x;
            this.y = this.y * this.y;
    
            return this;
        }
    
        squareRoot() {
            this.x = Math.sqrt(this.x);
            this.y = Math.sqrt(this.y);
    
            return this;
        }
    
        sqrt = this.squareRoot;
    
        rotate(radians) {
            const x = this.x;
            const y = this.y;
    
            this.x = x * Math.cos(radians) - y * Math.sin(radians);
            this.y = y * Math.cos(radians) + x * Math.sin(radians);
    
            return this;
        }
    
        orthogonal() {
            const x = this.x;
            this.x = -this.y;
            this.y = x;
    
            return this;
        }
    
        ortho = this.orthogonal;
    
        normalize() {
            const length = this.magnitude();
            if (length === 0) {
                return this;
            }
    
            this.x /= length;
            this.y /= length;
    
            return this;
        }
    
        norm = this.normalize;
    
        distance(vec) {
            const dx = vec.x - this.x;
            const dy = vec.y - this.y;
    
            return Math.sqrt(dx * dx + dy * dy);
        }
    
        dist = this.distance;
    
        distanceSquared(vec) {
            const dx = vec.x - this.x;
            const dy = vec.y - this.y;
    
            return dx * dx + dy * dy;
        }
    
        distSquared = this.distanceSquared;
    
        negate() {
            this.x = -this.x;
            this.y = -this.y;
    
            return this;
        }
    
        atan2() {
            return Math.atan2(this.y, this.x);
        }
    
        dot(vec) {
            return this.x * vec.x + this.y * vec.y;
        }
    
        cross(vec) {
            return this.x * vec.y - vec.x * this.y;
        }
    
        // returns a number between -1 and 1,
        // where 0 represents the two vectors are the same direction,
        // 0.5 represents the perpendicular normal,
        // and -0.5 is the inverted normal
        // valid for all vectors where the positive angle between them is < 180, not equal
        crossDot(vec) {
            const sign = Math.sign(this.cross(vec)) || 1;
            return (0.5 - this.dot(vec) / 2.0) * sign;
        }
    
        projectOnto(vec) {
            tempVec.copy(vec);
            tempVec.normalize();
    
            const top = this.dot(tempVec);
            const bottom = tempVec.dot(tempVec);
    
            this.copy(tempVec);
            this.multiply(top / bottom);
    
            return this;
        }
    }
    
    tempVec = new Vec2();
    class Mat3 {
        v0;
        v1;
        v2;
        v3;
        v4;
        v5;
        v6;
        v7;
        v8;
    
        // NOTE: libgdx's indices are transposed
    
        constructor() {
            this.v0 = 1;
            this.v1 = 0;
            this.v2 = 0;
            this.v3 = 0;
            this.v4 = 1;
            this.v5 = 0;
            this.v6 = 0;
            this.v7 = 0;
            this.v8 = 1;
        }
    
        copy(mat) {
            this.v0 = mat.v0;
            this.v1 = mat.v1;
            this.v2 = mat.v2;
            this.v3 = mat.v3;
            this.v4 = mat.v4;
            this.v5 = mat.v5;
            this.v6 = mat.v6;
            this.v7 = mat.v7;
            this.v8 = mat.v8;
    
            return this;
        }
    
        determinant() {
            return this.v0 * this.v4 * this.v8 + this.v1 * this.v5 * this.v6 + this.v2 * this.v3 * this.v7 - this.v0
                * this.v5 * this.v7 - this.v1 * this.v3 * this.v8 - this.v2 * this.v4 * this.v6;
        }
    
        invert() {
            const det = this.determinant();
            if (det === 0) {
                return null;
            }
    
            const inv = 1.0 / det;
    
            tempMat.v0 = this.v4 * this.v8 - this.v7 * this.v5;
            tempMat.v3 = this.v6 * this.v5 - this.v3 * this.v8;
            tempMat.v6 = this.v3 * this.v7 - this.v6 * this.v4;
            tempMat.v1 = this.v7 * this.v2 - this.v1 * this.v8;
            tempMat.v4 = this.v0 * this.v8 - this.v6 * this.v2;
            tempMat.v7 = this.v6 * this.v1 - this.v0 * this.v7;
            tempMat.v2 = this.v1 * this.v5 - this.v4 * this.v2;
            tempMat.v5 = this.v3 * this.v2 - this.v0 * this.v5;
            tempMat.v8 = this.v0 * this.v4 - this.v3 * this.v1;
    
            this.v0 = inv * tempMat.v0;
            this.v3 = inv * tempMat.v3;
            this.v6 = inv * tempMat.v6;
            this.v1 = inv * tempMat.v1;
            this.v4 = inv * tempMat.v4;
            this.v7 = inv * tempMat.v7;
            this.v2 = inv * tempMat.v2;
            this.v5 = inv * tempMat.v5;
            this.v8 = inv * tempMat.v8;
    
            return this;
        }
    
        multiply(mat) {
            const v00 = this.v0 * mat.v0 + this.v3 * mat.v1 + this.v6 * mat.v2;
            const v01 = this.v0 * mat.v3 + this.v3 * mat.v4 + this.v6 * mat.v5;
            const v02 = this.v0 * mat.v6 + this.v3 * mat.v7 + this.v6 * mat.v8;
    
            const v10 = this.v1 * mat.v0 + this.v4 * mat.v1 + this.v7 * mat.v2;
            const v11 = this.v1 * mat.v3 + this.v4 * mat.v4 + this.v7 * mat.v5;
            const v12 = this.v1 * mat.v6 + this.v4 * mat.v7 + this.v7 * mat.v8;
    
            const v20 = this.v2 * mat.v0 + this.v5 * mat.v1 + this.v8 * mat.v2;
            const v21 = this.v2 * mat.v3 + this.v5 * mat.v4 + this.v8 * mat.v5;
            const v22 = this.v2 * mat.v6 + this.v5 * mat.v7 + this.v8 * mat.v8;
    
            this.v0 = v00;
            this.v1 = v10;
            this.v2 = v20;
            this.v3 = v01;
            this.v4 = v11;
            this.v5 = v21;
            this.v6 = v02;
            this.v7 = v12;
            this.v8 = v22;
    
            return this;
        }
    
        leftMultiply(mat) {
            const v00 = mat.v0 * this.v0 + mat.v3 * this.v1 + mat.v6 * this.v2;
            const v01 = mat.v0 * this.v3 + mat.v3 * this.v4 + mat.v6 * this.v5;
            const v02 = mat.v0 * this.v6 + mat.v3 * this.v7 + mat.v6 * this.v8;
    
            const v10 = mat.v1 * this.v0 + mat.v4 * this.v1 + mat.v7 * this.v2;
            const v11 = mat.v1 * this.v3 + mat.v4 * this.v4 + mat.v7 * this.v5;
            const v12 = mat.v1 * this.v6 + mat.v4 * this.v7 + mat.v7 * this.v8;
    
            const v20 = mat.v2 * this.v0 + mat.v5 * this.v1 + mat.v8 * this.v2;
            const v21 = mat.v2 * this.v3 + mat.v5 * this.v4 + mat.v8 * this.v5;
            const v22 = mat.v2 * this.v6 + mat.v5 * this.v7 + mat.v8 * this.v8;
    
            this.v0 = v00;
            this.v1 = v10;
            this.v2 = v20;
            this.v3 = v01;
            this.v4 = v11;
            this.v5 = v21;
            this.v6 = v02;
            this.v7 = v12;
            this.v8 = v22;
    
            return this;
        }
    
        setToTranslation(vec) {
            this.v0 = 1;
            this.v1 = 0;
            this.v2 = 0;
            this.v3 = 0;
            this.v4 = 1;
            this.v5 = 0;
            this.v6 = vec.x;
            this.v7 = vec.y;
            this.v8 = 1;
    
            return this;
        }
    
        getTranslation(out) {
            out.x = this.v6;
            out.y = this.v7;
    
            return out;
        }
    
        setTranslation(vec) {
            const inverseVec = this.getTranslation(tempVec).negate();
            const inverse = tempMat.setToTranslation(inverseVec);
    
            // translation * (inverse * self)
            this.leftMultiply(inverse);
    
            const correct = tempMat.setToTranslation(vec);
            return this.leftMultiply(correct)
        }
    
        translate(vec) {
            tempMat.setToTranslation(vec);
    
            return this.multiply(tempMat);
        }
    
        setToRotation(radians) {
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);
    
            this.v0 = cos;
            this.v1 = sin;
            this.v2 = 0;
    
            this.v3 = -sin;
            this.v4 = cos;
            this.v5 = 0;
    
            this.v6 = 0;
            this.v7 = 0;
            this.v8 = 1;
    
            return this;
        }
    
        getRotation() {
            return Math.atan2(this.v1, this.v0);
        }
    
        setRotation(radians) {
            const inverse = tempMat.setToRotation(-this.getRotation());
            this.multiply(inverse);
            const correct = tempMat.setToRotation(radians);
            return this.multiply(correct);
        }
    
        rotate(radians) {
            tempMat.setToRotation(radians);
    
            return this.multiply(tempMat);
        }
    }
    
    tempMat = new Mat3();
    class Hash {
        static buffer = new ArrayBuffer(4);
        static byteBuffer = new Uint8Array(Hash.buffer);
        static intBuffer = new Int32Array(Hash.buffer);
    
        static integerHash(string) {
            let value = 0;
    
            let index = 0;
            while (index < string.length) {
                for (let i = 0; i < 4; i++) {
                    if (index < string.length) {
                        Hash.byteBuffer[i] = string.charCodeAt(index);
                        index++;
                    } else {
                        Hash.byteBuffer[i] = 0;
                    }
                }
            }
            
            value ^= Hash.intBuffer[0];
    
            return value;
        }
    }
    class AABB {
        x;
        y;
        width;
        height;
        
        constructor(x, y, width, height) {
            this.x = x || 0;
            this.y = y || 0;
            this.width = width || 0;
            this.height = height || 0;
        }
    
        static copy(aabb) {
            return new AABB(aabb.x, aabb.y, aabb.width, aabb.height);
        }
    
        copy(aabb) {
            this.x = aabb.x;
            this.y = aabb.y;
            this.width = aabb.width;
            this.height = aabb.height;
    
            return this;
        }
    
        round() {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
    
            return this;
        }
    
        contains(x, y) {
            return (x >= this.x) && (y >= this.y) && (x - this.x < this.width) && (y - this.y < this.height);
        }
    }
    class Camera {
        static position = new Vec2();
        static aabb = new AABB();
        static scale = new Vec2(1, 1);
        static screen = new Vec2(window.innerWidth, window.innerHeight);
    
        static nextPosition = new Vec2();
        static nextScale = new Vec2(1, 1);
    
        static containers = [];
    
        static positionSpeedStrength = 0.5;
        static scaleSpeedStrength = 0.05;
    
        static shakeDuration = 15;
        static shakeIntensity = 10;
        static shakeFalloff = 0.75;
        static remainingShakeDuration = 0;
    
        static shakeSeedHorizontal = 0;
        static shakeSeedVertical = 0;
    
        static cameraHeight = 1080;
    
        static setPosition(position) {
            Camera.nextPosition.copy(position).round();
        }
    
        static setPositionImmediate(position) {
            Camera.nextPosition.copy(position).round();
            Camera.position.copy(position).round();
        }
    
        static setScale(scale) {
            Camera.nextScale.copy(scale);
        }
    
        static setScaleImmediate(scale) {
            Camera.nextScale.copy(scale);
            Camera.scale.copy(scale);
        }
    
        static shake(intensity) {
            Camera.shakeIntensity = intensity || 15;
            Camera.remainingShakeDuration = Camera.shakeDuration;
    
            Camera.shakeSeedHorizontal = Math.random();
            Camera.shakeSeedVertical = Math.random();
        }
    
        static setSpeedProperties(strength) {
            this.positionSpeedStrength = strength;
        }
    
        static setScaleProperties(strength) {
            this.scaleAccel = accel;
            this.minimumScaleSpeed = minumumSpeed;
            this.maximumScaleSpeed = maximumSpeed;
            this.maximumScaleDistance = maximumScale;
        }
    
        static setShakeProperties(duration, falloff) {
            Camera.shakeDuration = duration;
            Camera.shakeFalloff = falloff;
        }
    
        static setCameraHeight(height) {
            Camera.cameraHeight = height;
        }
    
        static getMousePosition() {
            let percentX = Input.mousePosition.x / window.innerWidth;
            let percentY = Input.mousePosition.y / window.innerHeight;
            if (MOBILE) {
                for (const touchID in MobileControls.touches) {
                    const touch = MobileControls.touches[touchID];
                    if (!touch.consumed) {
                        percentX = touch.x / window.innerWidth;
                        percentY = touch.y / window.innerHeight;
                        break;
                    }
                }
            }
        
            return Vec2.set(Camera.aabb.x + Camera.aabb.width * percentX, Camera.aabb.y + Camera.aabb.height * percentY).round();
        };
    
        static update() {
            let shakeX = 0;
            let shakeY = 0;
            if (Camera.remainingShakeDuration > 0) {
                Camera.remainingShakeDuration--;
    
                // its okay if progress goes past 1 because it wraps around 
                const progress = (Camera.shakeDuration - Camera.remainingShakeDuration) / 30;
                const shake = Camera.shakeIntensity - Camera.shakeIntensity * progress * Camera.shakeFalloff;
    
                shakeX = PerlinNoise.getNoise(Camera.shakeSeedHorizontal, progress) * shake - shake / 2;
                shakeY = PerlinNoise.getNoise(Camera.shakeSeedVertical, progress) * shake - shake / 2;
            }
    
            const positionDeltaX = Camera.nextPosition.x - Camera.position.x;
            const positionDeltaY = Camera.nextPosition.y - Camera.position.y;
            const positionDeltaLength = Math.sqrt(positionDeltaX * positionDeltaX + positionDeltaY * positionDeltaY);
            if (positionDeltaLength <= 0.5) {
                Camera.position.copy(Camera.nextPosition);
            } else {
                Camera.position.x += positionDeltaX * Camera.positionSpeedStrength;
                Camera.position.y += positionDeltaY * Camera.positionSpeedStrength;
            }
    
            const scaleDelta = Camera.nextScale.x - Camera.scale.x;
            if (Math.abs(scaleDelta) <= 0.01) {
                Camera.scale.copy(Camera.nextScale);
            } else {
                Camera.scale.x += scaleDelta * Camera.scaleSpeedStrength;
                Camera.scale.y = Camera.scale.x;
            }
    
            const width = window.innerWidth;
            const height = window.innerHeight;
    
            const heightScale = height / Camera.cameraHeight;
    
            const scaleX = Camera.scale.x * heightScale;
            const scaleY = Camera.scale.y * heightScale;
    
            Camera.aabb.x = Camera.position.x - width / 2 / scaleX + shakeX;
            Camera.aabb.y = Camera.position.y - height / 2 / scaleY + shakeY;
            Camera.aabb.width = width / scaleX;
            Camera.aabb.height = height / scaleY;
    
            const x = Camera.aabb.width / 2 * scaleX - Camera.position.x * scaleX;
            const y = Camera.aabb.height / 2 * scaleY - Camera.position.y * scaleY;
    
            for (let i = 0; i < Camera.containers.length; i++) {
                Camera.containers[i].position.x = x + shakeX;
                Camera.containers[i].position.y = y + shakeY;
                Camera.containers[i].scale.x = scaleX;
                Camera.containers[i].scale.y = scaleY;
            }
        }
    
        static addContainer(container) {
            Camera.containers.push(container);
        }
    }
    class CPUTracker extends PIXI.Text {
        history;
        nextIndex;
    
        startTime;
        endTime;
    
        constructor(color) {
            super('CPU: 0.0%', {fill: color === undefined ? 0xffffff : color, fontSize: 16});
    
            this.history = new Array(60).fill(0);
            this.nextIndex = 0;
    
            this.startTime = 0;
            this.endTime = 0;
        }
    
        beginFrame(time) {
            if (this.startTime > 0 && this.endTime > 0) {
                const totalTime = time - this.startTime;
                const frameTime = this.endTime - this.startTime;
    
                this.history[this.nextIndex] = Math.max(frameTime / totalTime, Number.MIN_VALUE);
                this.nextIndex = (this.nextIndex + 1) % this.history.length;
    
                let total = 0;
                let count = 0;
                for (let i = 0; i < this.history.length; i++) {
                    if (this.history[i] === 0) {
                        continue;
                    }
        
                    total += this.history[i];
                    count++;
                }
                
                const cpu = total / count * 100;
                const integer = Math.floor(cpu);
                const remainder = Math.floor((cpu - integer) * 100);
        
                this.text = 'CPU: ' + integer + '.' + remainder + '%';
            }
    
            this.startTime = time;
        }
    
        endFrame(time) {
            this.endTime = time;
        }
    }
    class DebugCanvas extends PIXI.Graphics {
        constructor() {
            super();
        }
    
        drawRect(x, y, width, height, color, alpha) {
            color = color || 0;
            alpha = alpha === undefined ? 1 : alpha;
    
            this.lineStyle(0);
            this.beginFill(color, alpha);
    
            super.drawRect(x, y, width, height);
    
            this.endFill();
        }
    
        drawLine(x1, y1, x2, y2, color, alpha) {
            color = color || 0;
            alpha = alpha === undefined ? 1 : alpha;
    
            this.lineStyle(1, color, alpha);
    
            this.moveTo(x1, y1);
            this.lineTo(x2, y2);
    
            this.closePath();
        }
    
        drawCircle(x, y, radius, color, alpha) {
            color = color || 0;
            alpha = alpha === undefined ? 1 : alpha;
        
            this.lineStyle(0);
            this.beginFill(color, alpha);
        
            super.drawCircle(x, y, radius);
        
            this.endFill();
        }
    
        render(renderer) {
            super.render(renderer);
    
            this.clear();
        }
    }
    class FPSTracker extends PIXI.Text {
        history;
        nextIndex;
    
        constructor(color) {
            super('FPS: 0.0', {fill: color === undefined ? 0xffffff : color, fontSize: 16});
    
            this.history = new Array(60).fill(0);
            this.nextIndex = 0;
        }
    
        getFPS() {
            let startIndex = this.nextIndex;
            if (this.history[startIndex] === 0) {
                startIndex = 0;
            }
        
            const firstTime = this.history[startIndex];
            if (startIndex === 0 && firstTime === 0) {
                return 0.0;
            }
        
            const lastIndex = (this.nextIndex + this.history.length - 1) % this.history.length;
            const lastTime = this.history[lastIndex];
        
            const deltaTime = lastTime - firstTime;
            const deltaFrames = (lastIndex - startIndex + this.history.length) % this.history.length;
        
            if (deltaTime === 0) {
                return 0;
            }
        
            return deltaFrames / deltaTime * 1000;
        }
        
        tick(time) {
            this.history[this.nextIndex] = time;
            this.nextIndex = (this.nextIndex + 1) % this.history.length;
            
            const fps = this.getFPS();
            const integer = Math.floor(fps);
            const remainder = Math.floor((fps - integer) * 100);
    
            this.text = 'FPS: ' + integer + '.' + remainder;
        }
    }
    
    class FramedSprite extends PIXI.Sprite {
        textures;
        animations;
    
        currentName;
        currentFrame;
    
        // left to right top to bottom sprite sheet
        constructor(texture, width, height, columns, count) {
            super(null);
    
            this.textures = [];
            this.textures.length = count;
            for (let i = 0; i < count; i++) {
                const row = Math.floor(i / columns);
                const column = i % columns;
    
                const x = column * width;
                const y = row * height;
    
                this.textures[i] = new PIXI.Texture(texture, new PIXI.Rectangle(x, y, width, height));
            }
    
            this.texture = this.textures[0];
    
            this.animations = {};
    
            this.currentName = undefined;
            this.currentFrame = 0;
        }
    
        addAnimation(name, start, count) {
            const animation = {
                start: start,
                count: count,
                linked: {},
            };
    
            this.animations[name] = animation;
        }
    
        gotoAnimation(name, frame) {
            if (frame !== undefined) {
                this.currentFrame = frame;
            } else if (this.currentName !== name) {
                // if were on a different animation check if we need to reset the frame
                if (!this.animations[this.currentName] || !this.animations[this.currentName].linked[name]) {
                    this.currentFrame = 0;
                }
            }
    
            this.currentName = name;
            if (this.animations[this.currentName]) {
                this.currentFrame = this.currentFrame % this.animations[this.currentName].count;
            } else {
                this.currentFrame = this.currentFrame
            }
    
            this.updateFrame();
        }
    
        stepAnimation(name, frames, loop) {
            if (Number.isNaN(name)) {
                loop = frames;
                frames = name;
                name = undefined;
            }
    
            frames = frames || 1;
            if (loop === undefined) {
                loop = true;
            }
    
            if (this.currentName !== name) {
                if (!this.animations[this.currentName] || !this.animations[this.currentName].linked[name]) {
                    this.currentFrame = 0;
                }
            }
    
            this.currentName = name;
            if (this.animations[this.currentName]) {
                if (loop) {
                    this.currentFrame = (this.currentFrame + frames) % this.animations[this.currentName].count;
                } else {
                    this.currentFrame = Math.min(this.currentFrame + frames, this.animations[this.currentName].count - 1);
                }
            } else {
                if (loop) {
                    this.currentFrame = (this.currentFrame + frames) % this.textures.length;
                } else {
                    this.currentFrame = Math.min(this.currentFrame + frames, this.textures.length - 1);
                }
            }
    
            this.updateFrame();
        }
    
        // adds a linked animation so the animation will pick up from where it left off
        linkAnimations(name, linkedName) {
            this.animations[name].linked[linkedName] = true;
            this.animations[linkedName].linked[name] = true;
        }
    
        getFrame() {
            return this.currentFrame;
        }
    
        updateFrame() {
            if (this.animations[this.currentName]) {
                this.texture = this.textures[Math.floor(this.currentFrame + this.animations[this.currentName].start)];
            } else {
                this.texture = this.textures[Math.floor(this.currentFrame)];
            }
        }
    }
    class ParallaxSprite extends PIXI.Sprite {
        aabb;
    
        constructor(texture, aabb) {
            super(texture);
            
            this.aabb = aabb;
        }
    
        update(cameraAABB) {
            const cameraCenterX = cameraAABB.x + cameraAABB.width / 2;
            const cameraCenterY = cameraAABB.y + cameraAABB.height / 2;
            const minX = this.aabb.x + cameraAABB.width / 2;
            const minY = this.aabb.y + cameraAABB.height / 2;
            const maxX = this.aabb.x + this.aabb.width - cameraAABB.width / 2;
            const maxY = this.aabb.y + this.aabb.height - cameraAABB.height / 2;
    
            const progressX = Math.min(Math.max((cameraCenterX - minX) / (maxX - minX), 0), 1);
            const progressY = Math.min(Math.max((cameraCenterY - minY) / (maxY - minY), 0), 1);
    
            const spriteMaxDeltaX = this.width - cameraAABB.width;
            const spriteMaxDeltaY = this.height - cameraAABB.height;
    
            this.position.x = -spriteMaxDeltaX * progressX;
            this.position.y = -spriteMaxDeltaY * progressY;
        }
    }
    class WaterShader extends PIXI.Filter {
        static NOISE_TEXTURE = PIXI.Texture.from('assets/simple-noise.png', {wrapMode: PIXI.WRAP_MODES.REPEAT, scaleMode: PIXI.SCALE_MODES.LINEAR, mipmap: PIXI.MIPMAP_MODES.ON, type: PIXI.TYPES.UNSIGNED_BYTE});
        static HIGHLIGHT_TEXTURE = PIXI.Texture.from('assets/highlights.png', {wrapMode: PIXI.WRAP_MODES.REPEAT, scaleMode: PIXI.SCALE_MODES.LINEAR, mipmap: PIXI.MIPMAP_MODES.ON});
    
        static FRAG_SRC = `
        varying vec2 vTextureCoord;
        
        uniform sampler2D uSampler;
        uniform vec4 inputPixel;
    
        uniform float uTime;
        uniform sampler2D uNoiseSampler;
        uniform sampler2D uHighlights;
        uniform vec2 uOffset;
        uniform float uOpacity;
        uniform float uStrength;
        uniform float uScale;
        uniform float uSpeed;
    
        float avg(vec4 color) {
            return (color.r + color.g + color.b) / 3.0;
        }
    
        void main(void) {
            float time = uTime / 60.0;
         
            vec2 uv = vec2(vTextureCoord.x, 1.0 - vTextureCoord.y) + uOffset / inputPixel.xy;
            vec2 scaledUv = uv * uScale * inputPixel.xy / 1200.0;
        
            vec4 water1 = vec4(texture2D(uNoiseSampler, scaledUv + time * uSpeed * 0.02 - 0.1 + vec2(0.0, 0.5)).rgb / 3.0, 1.0);
            vec4 water2 = vec4(texture2D(uNoiseSampler, scaledUv + time * uSpeed * -0.02 + 0.1).rgb / 3.0, 1.0);
            
            vec4 highlights1 = vec4(texture2D(uHighlights, scaledUv + time * uSpeed / vec2(-10, 100) + vec2(0.0, 0.5)).rgb / 3.0, 1.0);
            vec4 highlights2 = vec4(texture2D(uHighlights, scaledUv + time * uSpeed / vec2(10, 100)).rgb / 3.0, 1.0);
            
            vec4 background = texture2D(uSampler, vTextureCoord + avg(water1) * 0.05 * uStrength);
            
            water1.rgb = vec3(avg(water1));
            water2.rgb = vec3(avg(water2));
            
            highlights1.rgb = vec3(avg(highlights1) / 1.5);
            highlights2.rgb = vec3(avg(highlights2) / 1.5);
            
            float alpha = uOpacity;
            
            if (avg(water1 + water2) > 0.3) {
                alpha = 0.0;
            }
            
            if (avg(water1 + water2 + highlights1 + highlights2) > 0.85) {
                alpha = 5.0 * uOpacity;
            }
    
            gl_FragColor = (water1 + water2) * alpha + background;
        }
        `;
    
        constructor() {
            super(null, WaterShader.FRAG_SRC, {
                uTime: 0.0,
                uNoiseSampler: WaterShader.NOISE_TEXTURE,
                uHighlights: WaterShader.HIGHLIGHT_TEXTURE,
                uOffset: new Float32Array([0, 0]),
                uOpacity: 0.5,
                uStrength: 1.0,
                uScale: 1.5,
                uSpeed: 0.8,
            });
    
            this.autoFit = false;
        }
    
        getTime() {
            return this.uniforms.uTime;
        }
    
        setTime(time) {
            this.uniforms.uTime = time;
        }
    
        getOffset() {
            return new Vec2(this.uniforms.uOffset[0], this.uniforms.uOffset[1]);
        }
    
        setOffset(offset) {
            this.uniforms.uOffset[0] = offset.x;
            this.uniforms.uOffset[1] = offset.y;
        }
    
        getOpacity() {
            return this.uniforms.uOpacity;
        }
    
        setOpacity(opacity) {
            this.uniforms.uOpacity = opacity;
        }
    
        getStrength() {
            return this.uniforms.uStrength;
        }
    
        setStrength(strength) {
            this.uniforms.uStrength = strength;
        }
    
        getScale() {
            return this.uniforms.uScale;
        }
    
        setScale(scale) {
            this.uniforms.uScale = scale;
        }
    
        getSpeed() {
            return this.uniforms.uSpeed;
        }
    
        setSpeed(speed) {
            this.uniforms.uSpeed = speed;
        }
    }
    class Input {
        static KEY_0 = '0';
        static KEY_1 = '1';
        static KEY_2 = '2';
        static KEY_3 = '3';
        static KEY_4 = '4';
        static KEY_5 = '5';
        static KEY_6 = '6';
        static KEY_7 = '7';
        static KEY_8 = '8';
        static KEY_9 = '9';
        static KEY_A = 'a';
        static KEY_B = 'b';
        static KEY_C = 'c';
        static KEY_D = 'd';
        static KEY_E = 'e';
        static KEY_F = 'f';
        static KEY_G = 'g';
        static KEY_H = 'h';
        static KEY_I = 'i';
        static KEY_J = 'j';
        static KEY_K = 'k';
        static KEY_L = 'l';
        static KEY_M = 'm';
        static KEY_N = 'n';
        static KEY_O = 'o';
        static KEY_P = 'p';
        static KEY_Q = 'q';
        static KEY_R = 'r';
        static KEY_S = 's';
        static KEY_T = 't';
        static KEY_U = 'u';
        static KEY_V = 'v';
        static KEY_W = 'w';
        static KEY_X = 'x';
        static KEY_Y = 'y';
        static KEY_Z = 'z';
        static KEY_ESCAPE = 'escape';
        static KEY_SHIFT = 'shift';
        static KEY_ENTER = 'enter';
        static KEY_SPACE = ' ';
    
        static NONE = 0x0;
        static DOWN = 0x1;
        static DELTA_DOWN = 0x2;
    
        static keys = {};
    
        static mouseDownLeft = Input.NONE;
        static mouseDownRight = Input.NONE;
    
        static mousePosition = new Vec2();
    
        static clear() {
            Input.mouseDownLeft &= ~Input.DELTA_DOWN;
            Input.mouseDownRight &= ~Input.DELTA_DOWN;
            
            for (const key in Input.keys) {
                Input.keys[key] &= ~Input.DELTA_DOWN;
            }
        }
    }
    
    window.addEventListener('load', () => {
        window.addEventListener('keydown', event => {
            if (!event.key) {
                return true;
            }

            if (event.target.tagName.toLowerCase() !== 'input') {
                if (event.key.toLowerCase() === Input.KEY_ENTER) {
                    ChatManager.focusInput();
                }

                Input.keys[event.key.toLowerCase()] = Input.DOWN | Input.DELTA_DOWN;
            }
    
            return true;
        }, true);
    
    
        window.addEventListener('keyup', event => {
            if (!event.key) {
                return true;
            }
    
            delete Input.keys[event.key.toLowerCase()];
    
            return true;
        }, true);
    
        window.addEventListener('mousedown', event => {
            console.log(event);
            if (event.button === 0) {
                Input.mouseDownLeft = Input.DOWN | Input.DELTA_DOWN;
            }
            if (event.button === 2) {
                Input.mouseDownRight = Input.DOWN | Input.DELTA_DOWN;
            }
    
            return true;
        });
    
        window.addEventListener('mouseup', event => {
            if (event.button === 0) {
                Input.mouseDownLeft = Input.NONE;
            }
            if (event.button === 2) {
                Input.mouseDownRight = Input.NONE;
            }
    
            return true;
        });
    
        window.addEventListener('mousemove', event => {
            Input.mousePosition.x = event.clientX;
            Input.mousePosition.y = event.clientY;
    
            return true;
        }, true);
    
        window.addEventListener('contextmenu', event => {
            event.preventDefault();
            return false;
        }, true);
    });
    const box2d = {
        b2_aabbExtension: 0.1,
    };
    
    box2d.DEBUG = false;
    box2d.ENABLE_ASSERTS = box2d.DEBUG;
    
    /**
     * @export
     * @const
     * @type {number}
     */
    box2d.b2_maxFloat = 1E+37; // FLT_MAX instead of Number.MAX_VALUE;
    
    /**
     * @export
     * @const
     * @type {number}
     */
    box2d.b2_epsilon = 1E-5; // FLT_EPSILON instead of Number.MIN_VALUE;
    
    /**
     * This is used to fatten AABBs in the dynamic tree. This is
     * used to predict the future position based on the current
     * displacement.
     * This is a dimensionless multiplier.
     * @export
     * @const
     * @type {number}
     */
    box2d.b2_aabbMultiplier = 2;
    
    box2d.b2Assert = function(condition, opt_message, var_args) {
        if (box2d.DEBUG) {
            if (!condition) {
                throw new Error();
            }
    
            //goog.asserts.assert(condition, opt_message, var_args);
        }
    }
    
    /**
     * @export
     * @return {number}
     * @param {number} n
     */
    box2d.b2Abs = Math.abs;
    
    /**
     * @export
     * @return {number}
     * @param {number} a
     * @param {number} b
     */
    box2d.b2Min = Math.min;
    
    /**
     * @export
     * @return {number}
     * @param {number} a
     * @param {number} b
     */
    box2d.b2Max = Math.max;
    
    /**
     * @export
     * @return {number}
     * @param {number} a
     * @param {number} lo
     * @param {number} hi
     */
    box2d.b2Clamp = function(a, lo, hi) {
        return Math.min(Math.max(a, lo), hi);
    }
    
    
    
    
    
    
    
    
    
    /**
     * @export
     * @return {Array.<*>}
     * @param {number=} length
     * @param {function(number): *=} init
     */
    box2d.b2MakeArray = function(length, init) {
        length = (typeof(length) === 'number') ? (length) : (0);
        var a = [];
        if (typeof(init) === 'function') {
            for (var i = 0; i < length; ++i) {
                a.push(init(i));
            }
        } else {
            for (var i = 0; i < length; ++i) {
                a.push(null);
            }
        }
        return a;
    }
    
    /**
     * @export
     * @return {Array.<number>}
     * @param {number=} length
     */
    box2d.b2MakeNumberArray = function(length) {
        return box2d.b2MakeArray(length, function(i) {
            return 0;
        });
    }
    
    
    
    
    
    
    
    
    
    
    
    
    /**
     * This is a growable LIFO stack with an initial capacity of N.
     * If the stack size exceeds the initial capacity, the heap is
     * used to increase the size of the stack.
     * @export
     * @constructor
     * @param {number} N
     */
    box2d.b2GrowableStack = function(N) {
        this.m_stack = new Array(N);
    }
    
    /**
     * @export
     * @type {Array.<*>}
     */
    box2d.b2GrowableStack.prototype.m_stack = null;
    /**
     * @export
     * @type {number}
     */
    box2d.b2GrowableStack.prototype.m_count = 0;
    
    /**
     * @export
     * @return {box2d.b2GrowableStack}
     */
    box2d.b2GrowableStack.prototype.Reset = function() {
        this.m_count = 0;
        return this;
    }
    
    /**
     * @export
     * @return {void}
     * @param {*} element
     */
    box2d.b2GrowableStack.prototype.Push = function(element) {
        this.m_stack[this.m_count] = element;
        ++this.m_count;
    }
    
    /**
     * @export
     * @return {*}
     */
    box2d.b2GrowableStack.prototype.Pop = function() {
        if (box2d.ENABLE_ASSERTS) {
            box2d.b2Assert(this.m_count > 0);
        }
        --this.m_count;
        var element = this.m_stack[this.m_count];
        this.m_stack[this.m_count] = null;
        return element;
    }
    
    /**
     * @export
     * @return {number}
     */
    box2d.b2GrowableStack.prototype.GetCount = function() {
        return this.m_count;
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    /**
     * A 2D column vector.
     * @export
     * @constructor
     * @param {number=} x
     * @param {number=} y
     */
    box2d.b2Vec2 = function(x, y) {
        this.x = x || 0.0;
        this.y = y || 0.0;
        //this.a = new Float32Array(2);
        //this.a[0] = x || 0;
        //this.a[1] = y || 0;
    }
    
    /**
     * @export
     * @type {number}
     */
    box2d.b2Vec2.prototype.x = 0.0;
    /**
     * @export
     * @type {number}
     */
    box2d.b2Vec2.prototype.y = 0.0;
    
    //  /**
    //   * @type {Float32Array}
    //   */
    //  box2d.b2Vec2.prototype.a;
    //
    //  box2d.b2Vec2.prototype.__defineGetter__('x', function () { return this.a[0]; });
    //  box2d.b2Vec2.prototype.__defineGetter__('y', function () { return this.a[1]; });
    //  box2d.b2Vec2.prototype.__defineSetter__('x', function (n) { this.a[0] = n; });
    //  box2d.b2Vec2.prototype.__defineSetter__('y', function (n) { this.a[1] = n; });
    
    /**
     * @export
     * @const
     * @type {box2d.b2Vec2}
     */
    box2d.b2Vec2_zero = new box2d.b2Vec2();
    /**
     * @export
     * @const
     * @type {box2d.b2Vec2}
     */
    box2d.b2Vec2.ZERO = new box2d.b2Vec2();
    /**
     * @export
     * @const
     * @type {box2d.b2Vec2}
     */
    box2d.b2Vec2.UNITX = new box2d.b2Vec2(1.0, 0.0);
    /**
     * @export
     * @const
     * @type {box2d.b2Vec2}
     */
    box2d.b2Vec2.UNITY = new box2d.b2Vec2(0.0, 1.0);
    
    /**
     * @export
     * @type {box2d.b2Vec2}
     */
    box2d.b2Vec2.s_t0 = new box2d.b2Vec2();
    /**
     * @export
     * @type {box2d.b2Vec2}
     */
    box2d.b2Vec2.s_t1 = new box2d.b2Vec2();
    /**
     * @export
     * @type {box2d.b2Vec2}
     */
    box2d.b2Vec2.s_t2 = new box2d.b2Vec2();
    /**
     * @export
     * @type {box2d.b2Vec2}
     */
    box2d.b2Vec2.s_t3 = new box2d.b2Vec2();
    
    /**
     * @export
     * @return {Array.<box2d.b2Vec2>}
     * @param {number=} length
     */
    box2d.b2Vec2.MakeArray = function(length) {
        return box2d.b2MakeArray(length, function(i) {
            return new box2d.b2Vec2();
        });
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     */
    box2d.b2Vec2.prototype.Clone = function() {
        return new box2d.b2Vec2(this.x, this.y);
    }
    
    /**
     * Set this vector to all zeros.
     * @export
     * @return {box2d.b2Vec2}
     */
    box2d.b2Vec2.prototype.SetZero = function() {
        this.x = 0.0;
        this.y = 0.0;
        return this;
    }
    
    /**
     * Set this vector to some specified coordinates.
     * @export
     * @return {box2d.b2Vec2}
     * @param {number} x
     * @param {number} y
     */
    box2d.b2Vec2.prototype.Set = function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} other
     */
    box2d.b2Vec2.prototype.Copy = function(other) {
        //if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(this !== other); }
        this.x = other.x;
        this.y = other.y;
        return this;
    }
    
    /**
     * Add a vector to this vector.
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} v
     */
    box2d.b2Vec2.prototype.SelfAdd = function(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {number} x
     * @param {number} y
     */
    box2d.b2Vec2.prototype.SelfAddXY = function(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }
    
    /**
     * Subtract a vector from this vector.
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} v
     */
    box2d.b2Vec2.prototype.SelfSub = function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {number} x
     * @param {number} y
     */
    box2d.b2Vec2.prototype.SelfSubXY = function(x, y) {
        this.x -= x;
        this.y -= y;
        return this;
    }
    
    /**
     * Multiply this vector by a scalar.
     * @export
     * @return {box2d.b2Vec2}
     * @param {number} s
     */
    box2d.b2Vec2.prototype.SelfMul = function(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }
    
    /**
     * this += s * v
     * @export
     * @return {box2d.b2Vec2}
     * @param {number} s
     * @param {box2d.b2Vec2} v
     */
    box2d.b2Vec2.prototype.SelfMulAdd = function(s, v) {
        this.x += s * v.x;
        this.y += s * v.y;
        return this;
    }
    
    /**
     * this -= s * v
     * @export
     * @return {box2d.b2Vec2}
     * @param {number} s
     * @param {box2d.b2Vec2} v
     */
    box2d.b2Vec2.prototype.SelfMulSub = function(s, v) {
        this.x -= s * v.x;
        this.y -= s * v.y;
        return this;
    }
    
    /**
     * @export
     * @return {number}
     * @param {box2d.b2Vec2} v
     */
    box2d.b2Vec2.prototype.Dot = function(v) {
        return this.x * v.x + this.y * v.y;
    }
    
    /**
     * @export
     * @return {number}
     * @param {box2d.b2Vec2} v
     */
    box2d.b2Vec2.prototype.Cross = function(v) {
        return this.x * v.y - this.y * v.x;
    }
    
    /**
     * Get the length of this vector (the norm).
     * @export
     * @return {number}
     */
    box2d.b2Vec2.prototype.Length = function() {
        var x = this.x,
            y = this.y;
        return Math.sqrt(x * x + y * y);
    }
    
    /**
     * Get the length squared. For performance, use this instead of
     * b2Vec2::Length (if possible).
     * @export
     * @return {number}
     */
    box2d.b2Vec2.prototype.LengthSquared = function() {
        var x = this.x,
            y = this.y;
        return (x * x + y * y);
    }
    
    /**
     * Convert this vector into a unit vector. Returns the length.
     * @export
     * @return {number}
     */
    box2d.b2Vec2.prototype.Normalize = function() {
        var length = this.Length();
        if (length >= box2d.b2_epsilon) {
            var inv_length = 1.0 / length;
            this.x *= inv_length;
            this.y *= inv_length;
        }
        return length;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     */
    box2d.b2Vec2.prototype.SelfNormalize = function() {
        this.Normalize();
        return this;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {number} c
     * @param {number} s
     */
    box2d.b2Vec2.prototype.SelfRotate = function(c, s) {
        var x = this.x,
            y = this.y;
        this.x = c * x - s * y;
        this.y = s * x + c * y;
        return this;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {number} radians
     */
    box2d.b2Vec2.prototype.SelfRotateAngle = function(radians) {
        return this.SelfRotate(Math.cos(radians), Math.sin(radians));
    }
    
    /**
     * Does this vector contain finite coordinates?
     * @export
     * @return {boolean}
     */
    box2d.b2Vec2.prototype.IsValid = function() {
        return isFinite(this.x) && isFinite(this.y);
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} v
     */
    box2d.b2Vec2.prototype.SelfMin = function(v) {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        return this;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} v
     */
    box2d.b2Vec2.prototype.SelfMax = function(v) {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        return this;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     */
    box2d.b2Vec2.prototype.SelfAbs = function() {
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
        return this;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     */
    box2d.b2Vec2.prototype.SelfNeg = function() {
        this.x = (-this.x);
        this.y = (-this.y);
        return this;
    }
    
    /**
     * Get the skew vector such that dot(skew_vec, other) ===
     * cross(vec, other)
     * @export
     * @return {box2d.b2Vec2}
     */
    box2d.b2Vec2.prototype.SelfSkew = function() {
        var x = this.x;
        this.x = -this.y;
        this.y = x;
        return this;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} v
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Abs_V2 = function(v, out) {
        out.x = Math.abs(v.x);
        out.y = Math.abs(v.y);
        return out;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} a
     * @param {box2d.b2Vec2} b
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Min_V2_V2 = function(a, b, out) {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        return out;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} a
     * @param {box2d.b2Vec2} b
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Max_V2_V2 = function(a, b, out) {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        return out;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} v
     * @param {box2d.b2Vec2} lo
     * @param {box2d.b2Vec2} hi
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Clamp_V2_V2_V2 = function(v, lo, hi, out) {
        out.x = Math.min(Math.max(v.x, lo.x), hi.x);
        out.y = Math.min(Math.max(v.y, lo.y), hi.y);
        return out;
    }
    
    /**
     * Perform the dot product on two vectors.
     * a.x * b.x + a.y * b.y
     * @export
     * @return {number}
     * @param {box2d.b2Vec2} a
     * @param {box2d.b2Vec2} b
     */
    box2d.b2Dot_V2_V2 = function(a, b) {
        return a.x * b.x + a.y * b.y;
    }
    
    /**
     * Perform the cross product on two vectors. In 2D this produces a scalar.
     * a.x * b.y - a.y * b.x
     * @export
     * @return {number}
     * @param {box2d.b2Vec2} a
     * @param {box2d.b2Vec2} b
     */
    box2d.b2Cross_V2_V2 = function(a, b) {
        return a.x * b.y - a.y * b.x;
    }
    
    /**
     * Perform the cross product on a vector and a scalar. In 2D
     * this produces a vector.
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} v
     * @param {number} s
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Cross_V2_S = function(v, s, out) {
        var v_x = v.x;
        out.x = s * v.y;
        out.y = -s * v_x;
        return out;
    }
    
    /**
     * Perform the cross product on a scalar and a vector. In 2D
     * this produces a vector.
     * @export
     * @return {box2d.b2Vec2}
     * @param {number} s
     * @param {box2d.b2Vec2} v
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Cross_S_V2 = function(s, v, out) {
        var v_x = v.x;
        out.x = -s * v.y;
        out.y = s * v_x;
        return out;
    }
    
    /**
     * Add two vectors component-wise.
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} a
     * @param {box2d.b2Vec2} b
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Add_V2_V2 = function(a, b, out) {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        return out;
    }
    
    /**
     * Subtract two vectors component-wise.
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} a
     * @param {box2d.b2Vec2} b
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Sub_V2_V2 = function(a, b, out) {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        return out;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} v
     * @param {number} s
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Add_V2_S = function(v, s, out) {
        out.x = v.x + s;
        out.y = v.y + s;
        return out;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} v
     * @param {number} s
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Sub_V2_S = function(v, s, out) {
        out.x = v.x - s;
        out.y = v.y - s;
        return out;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {number} s
     * @param {box2d.b2Vec2} v
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Mul_S_V2 = function(s, v, out) {
        out.x = v.x * s;
        out.y = v.y * s;
        return out;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} v
     * @param {number} s
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Mul_V2_S = function(v, s, out) {
        out.x = v.x * s;
        out.y = v.y * s;
        return out;
    }
    
    /**
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} v
     * @param {number} s
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Div_V2_S = function(v, s, out) {
        out.x = v.x / s;
        out.y = v.y / s;
        return out;
    }
    
    /**
     * out = a + (s * b)
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} a
     * @param {number} s
     * @param {box2d.b2Vec2} b
     * @param {box2d.b2Vec2} out
     */
    box2d.b2AddMul_V2_S_V2 = function(a, s, b, out) {
        out.x = a.x + (s * b.x);
        out.y = a.y + (s * b.y);
        return out;
    }
    /**
     * out = a - (s * b)
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} a
     * @param {number} s
     * @param {box2d.b2Vec2} b
     * @param {box2d.b2Vec2} out
     */
    box2d.b2SubMul_V2_S_V2 = function(a, s, b, out) {
        out.x = a.x - (s * b.x);
        out.y = a.y - (s * b.y);
        return out;
    }
    
    /**
     * out = a + b2Cross(s, v)
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} a
     * @param {number} s
     * @param {box2d.b2Vec2} v
     * @param {box2d.b2Vec2} out
     */
    box2d.b2AddCross_V2_S_V2 = function(a, s, v, out) {
        var v_x = v.x;
        out.x = a.x - (s * v.y);
        out.y = a.y + (s * v_x);
        return out;
    }
    
    /**
     * Get the center of two vectors.
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} a
     * @param {box2d.b2Vec2} b
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Mid_V2_V2 = function(a, b, out) {
        out.x = (a.x + b.x) * 0.5;
        out.y = (a.y + b.y) * 0.5;
        return out;
    }
    
    /**
     * Get the extent of two vectors (half-widths).
     * @export
     * @return {box2d.b2Vec2}
     * @param {box2d.b2Vec2} a
     * @param {box2d.b2Vec2} b
     * @param {box2d.b2Vec2} out
     */
    box2d.b2Ext_V2_V2 = function(a, b, out) {
        out.x = (b.x - a.x) * 0.5;
        out.y = (b.y - a.y) * 0.5;
        return out;
    }
    
    /**
     * @export
     * @return {number}
     * @param {box2d.b2Vec2} a
     * @param {box2d.b2Vec2} b
     */
    box2d.b2Distance = function(a, b) {
        var c_x = a.x - b.x;
        var c_y = a.y - b.y;
        return Math.sqrt(c_x * c_x + c_y * c_y);
    }
    
    /**
     * @export
     * @return {number}
     * @param {box2d.b2Vec2} a
     * @param {box2d.b2Vec2} b
     */
    box2d.b2DistanceSquared = function(a, b) {
        var c_x = a.x - b.x;
        var c_y = a.y - b.y;
        return (c_x * c_x + c_y * c_y);
    }
    
    
    
    
    
    
    
    
    
    
    
    /**
     * Ray-cast input data. The ray extends from p1 to p1 +
     * maxFraction * (p2 - p1).
     * @export
     * @constructor
     */
    box2d.b2RayCastInput = function() {
        this.p1 = new box2d.b2Vec2();
        this.p2 = new box2d.b2Vec2();
        this.maxFraction = 1;
    }
    
    /**
     * @export
     * @type {box2d.b2Vec2}
     */
    box2d.b2RayCastInput.prototype.p1 = null;
    /**
     * @export
     * @type {box2d.b2Vec2}
     */
    box2d.b2RayCastInput.prototype.p2 = null;
    /**
     * @export
     * @type {number}
     */
    box2d.b2RayCastInput.prototype.maxFraction = 1;
    
    /**
     * @export
     * @return {box2d.b2RayCastInput}
     * @param {box2d.b2RayCastInput} o
     */
    box2d.b2RayCastInput.prototype.Copy = function(o) {
        this.p1.Copy(o.p1);
        this.p2.Copy(o.p2);
        this.maxFraction = o.maxFraction;
        return this;
    }
    
    /**
     * Ray-cast output data. The ray hits at p1 + fraction * (p2 -
     * p1), where p1 and p2 come from box2d.b2RayCastInput.
     * @export
     * @constructor
     */
    box2d.b2RayCastOutput = function() {
        this.normal = new box2d.b2Vec2();
        this.fraction = 0;
    };
    
    /**
     * @export
     * @type {box2d.b2Vec2}
     */
    box2d.b2RayCastOutput.prototype.normal = null;
    /**
     * @export
     * @type {number}
     */
    box2d.b2RayCastOutput.prototype.fraction = 0;
    
    /**
     * @export
     * @return {box2d.b2RayCastOutput}
     * @param {box2d.b2RayCastOutput} o
     */
    box2d.b2RayCastOutput.prototype.Copy = function(o) {
        this.normal.Copy(o.normal);
        this.fraction = o.fraction;
        return this;
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    /**
     * An axis aligned bounding box.
     * @export
     * @constructor
     */
    box2d.b2AABB = function() {
        this.lowerBound = new box2d.b2Vec2();
        this.upperBound = new box2d.b2Vec2();
    
        this.m_out_center = new box2d.b2Vec2();
        this.m_out_extent = new box2d.b2Vec2();
    };
    
    /**
     * @export
     * @type {box2d.b2Vec2}
     */
    box2d.b2AABB.prototype.lowerBound = null; ///< the lower vertex
    /**
     * @export
     * @type {box2d.b2Vec2}
     */
    box2d.b2AABB.prototype.upperBound = null; ///< the upper vertex
    
    /**
     * @export
     * @type {box2d.b2Vec2}
     */
    box2d.b2AABB.prototype.m_out_center = null; // access using GetCenter()
    /**
     * @export
     * @type {box2d.b2Vec2}
     */
    box2d.b2AABB.prototype.m_out_extent = null; // access using GetExtents()
    
    /**
     * @export
     * @return {box2d.b2AABB}
     */
    box2d.b2AABB.prototype.Clone = function() {
        return new box2d.b2AABB().Copy(this);
    }
    
    /**
     * @export
     * @return {box2d.b2AABB}
     * @param {box2d.b2AABB} o
     */
    box2d.b2AABB.prototype.Copy = function(o) {
        this.lowerBound.Copy(o.lowerBound);
        this.upperBound.Copy(o.upperBound);
        return this;
    }
    
    /**
     * Verify that the bounds are sorted.
     * @export
     * @return {boolean}
     */
    box2d.b2AABB.prototype.IsValid = function() {
        var d_x = this.upperBound.x - this.lowerBound.x;
        var d_y = this.upperBound.y - this.lowerBound.y;
        var valid = d_x >= 0 && d_y >= 0;
        valid = valid && this.lowerBound.IsValid() && this.upperBound.IsValid();
        return valid;
    }
    
    /**
     * Get the center of the AABB.
     * @export
     * @return {box2d.b2Vec2}
     */
    box2d.b2AABB.prototype.GetCenter = function() {
        return box2d.b2Mid_V2_V2(this.lowerBound, this.upperBound, this.m_out_center);
    }
    
    /**
     * Get the extents of the AABB (half-widths).
     * @export
     * @return {box2d.b2Vec2}
     */
    box2d.b2AABB.prototype.GetExtents = function() {
        return box2d.b2Ext_V2_V2(this.lowerBound, this.upperBound, this.m_out_extent);
    }
    
    /**
     * Get the perimeter length
     * @export
     * @return {number}
     */
    box2d.b2AABB.prototype.GetPerimeter = function() {
        var wx = this.upperBound.x - this.lowerBound.x;
        var wy = this.upperBound.y - this.lowerBound.y;
        return 2 * (wx + wy);
    }
    
    /**
     * @return {box2d.b2AABB}
     * @param {box2d.b2AABB} a0
     * @param {box2d.b2AABB=} a1
     */
    box2d.b2AABB.prototype.Combine = function(a0, a1) {
        switch (arguments.length) {
            case 1:
                return this.Combine1(a0);
            case 2:
                return this.Combine2(a0, a1 || new box2d.b2AABB());
            default:
                throw new Error();
        }
    }
    
    /**
     * Combine an AABB into this one.
     * @export
     * @return {box2d.b2AABB}
     * @param {box2d.b2AABB} aabb
     */
    box2d.b2AABB.prototype.Combine1 = function(aabb) {
        this.lowerBound.x = box2d.b2Min(this.lowerBound.x, aabb.lowerBound.x);
        this.lowerBound.y = box2d.b2Min(this.lowerBound.y, aabb.lowerBound.y);
        this.upperBound.x = box2d.b2Max(this.upperBound.x, aabb.upperBound.x);
        this.upperBound.y = box2d.b2Max(this.upperBound.y, aabb.upperBound.y);
        return this;
    }
    
    /**
     * Combine two AABBs into this one.
     * @export
     * @return {box2d.b2AABB}
     * @param {box2d.b2AABB} aabb1
     * @param {box2d.b2AABB} aabb2
     */
    box2d.b2AABB.prototype.Combine2 = function(aabb1, aabb2) {
        this.lowerBound.x = box2d.b2Min(aabb1.lowerBound.x, aabb2.lowerBound.x);
        this.lowerBound.y = box2d.b2Min(aabb1.lowerBound.y, aabb2.lowerBound.y);
        this.upperBound.x = box2d.b2Max(aabb1.upperBound.x, aabb2.upperBound.x);
        this.upperBound.y = box2d.b2Max(aabb1.upperBound.y, aabb2.upperBound.y);
        return this;
    }
    
    /**
     * @export
     * @return {box2d.b2AABB}
     * @param {box2d.b2AABB} aabb1
     * @param {box2d.b2AABB} aabb2
     * @param {box2d.b2AABB} out
     */
    box2d.b2AABB.Combine = function(aabb1, aabb2, out) {
        out.Combine2(aabb1, aabb2);
        return out;
    }
    
    /**
     * Does this aabb contain the provided AABB.
     * @export
     * @return {boolean}
     * @param {box2d.b2AABB} aabb
     */
    box2d.b2AABB.prototype.Contains = function(aabb) {
        var result = true;
        result = result && this.lowerBound.x <= aabb.lowerBound.x;
        result = result && this.lowerBound.y <= aabb.lowerBound.y;
        result = result && aabb.upperBound.x <= this.upperBound.x;
        result = result && aabb.upperBound.y <= this.upperBound.y;
        return result;
    }
    
    /**
     * From Real-time Collision Detection, p179.
     * @export
     * @return {boolean}
     * @param {box2d.b2RayCastOutput} output
     * @param {box2d.b2RayCastInput} input
     */
    box2d.b2AABB.prototype.RayCast = function(output, input) {
        var tmin = (-box2d.b2_maxFloat);
        var tmax = box2d.b2_maxFloat;
    
        var p_x = input.p1.x;
        var p_y = input.p1.y;
        var d_x = input.p2.x - input.p1.x;
        var d_y = input.p2.y - input.p1.y;
        var absD_x = box2d.b2Abs(d_x);
        var absD_y = box2d.b2Abs(d_y);
    
        var normal = output.normal;
    
        if (absD_x < box2d.b2_epsilon) {
            // Parallel.
            if (p_x < this.lowerBound.x || this.upperBound.x < p_x) {
                return false;
            }
        } else {
            var inv_d = 1 / d_x;
            var t1 = (this.lowerBound.x - p_x) * inv_d;
            var t2 = (this.upperBound.x - p_x) * inv_d;
    
            // Sign of the normal vector.
            var s = (-1);
    
            if (t1 > t2) {
                var t3 = t1;
                t1 = t2;
                t2 = t3;
                s = 1;
            }
    
            // Push the min up
            if (t1 > tmin) {
                normal.x = s;
                normal.y = 0;
                tmin = t1;
            }
    
            // Pull the max down
            tmax = box2d.b2Min(tmax, t2);
    
            if (tmin > tmax) {
                return false;
            }
        }
    
        if (absD_y < box2d.b2_epsilon) {
            // Parallel.
            if (p_y < this.lowerBound.y || this.upperBound.y < p_y) {
                return false;
            }
        } else {
            var inv_d = 1 / d_y;
            var t1 = (this.lowerBound.y - p_y) * inv_d;
            var t2 = (this.upperBound.y - p_y) * inv_d;
    
            // Sign of the normal vector.
            var s = (-1);
    
            if (t1 > t2) {
                var t3 = t1;
                t1 = t2;
                t2 = t3;
                s = 1;
            }
    
            // Push the min up
            if (t1 > tmin) {
                normal.x = 0;
                normal.y = s;
                tmin = t1;
            }
    
            // Pull the max down
            tmax = box2d.b2Min(tmax, t2);
    
            if (tmin > tmax) {
                return false;
            }
        }
    
        // Does the ray start inside the box?
        // Does the ray intersect beyond the max fraction?
        if (tmin < 0 || input.maxFraction < tmin) {
            return false;
        }
    
        // Intersection.
        output.fraction = tmin;
    
        return true;
    }
    
    /**
     * @export
     * @return {boolean}
     * @param {box2d.b2AABB} other
     */
    box2d.b2AABB.prototype.TestOverlap = function(other) {
        var d1_x = other.lowerBound.x - this.upperBound.x;
        var d1_y = other.lowerBound.y - this.upperBound.y;
        var d2_x = this.lowerBound.x - other.upperBound.x;
        var d2_y = this.lowerBound.y - other.upperBound.y;
    
        if (d1_x > 0 || d1_y > 0)
            return false;
    
        if (d2_x > 0 || d2_y > 0)
            return false;
    
        return true;
    }
    
    /**
     * @export
     * @return {boolean}
     * @param {box2d.b2AABB} a
     * @param {box2d.b2AABB} b
     */
    box2d.b2TestOverlap_AABB = function(a, b) {
        var d1_x = b.lowerBound.x - a.upperBound.x;
        var d1_y = b.lowerBound.y - a.upperBound.y;
        var d2_x = a.lowerBound.x - b.upperBound.x;
        var d2_y = a.lowerBound.y - b.upperBound.y;
    
        if (d1_x > 0 || d1_y > 0)
            return false;
    
        if (d2_x > 0 || d2_y > 0)
            return false;
    
        return true;
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    /**
     * A node in the dynamic tree. The client does not interact with
     * this directly.
     * @export
     * @constructor
     * @param {number=} id
     */
    box2d.b2TreeNode = function(id) {
        this.m_id = id || 0;
    
        this.aabb = new box2d.b2AABB();
    };
    
    /**
     * @export
     * @type {number}
     */
    box2d.b2TreeNode.prototype.m_id = 0;
    
    /**
     * Enlarged AABB
     * @export
     * @type {box2d.b2AABB}
     */
    box2d.b2TreeNode.prototype.aabb = null;
    
    /**
     * @export
     * @type {*}
     */
    box2d.b2TreeNode.prototype.userData = null;
    
    /**
     * @export
     * @type {box2d.b2TreeNode}
     */
    box2d.b2TreeNode.prototype.parent = null; // or box2d.b2TreeNode.prototype.next
    
    /**
     * @export
     * @type {box2d.b2TreeNode}
     */
    box2d.b2TreeNode.prototype.child1 = null;
    /**
     * @export
     * @type {box2d.b2TreeNode}
     */
    box2d.b2TreeNode.prototype.child2 = null;
    
    /**
     * leaf = 0, free node = -1
     * @export
     * @type {number}
     */
    box2d.b2TreeNode.prototype.height = 0;
    
    /**
     * @export
     * @return {boolean}
     */
    box2d.b2TreeNode.prototype.IsLeaf = function() {
        return this.child1 === null;
    }
    
    /**
     * A dynamic tree arranges data in a binary tree to accelerate
     * queries such as volume queries and ray casts. Leafs are proxies
     * with an AABB. In the tree we expand the proxy AABB by b2_fatAABBFactor
     * so that the proxy AABB is bigger than the client object. This allows the client
     * object to move by small amounts without triggering a tree update.
     *
     * Nodes are pooled and relocatable, so we use node indices rather than pointers.
     * @export
     * @constructor
     */
    DynamicTree = function() {}
    
    /**
     * @export
     * @type {box2d.b2TreeNode}
     */
    DynamicTree.prototype.m_root = null;
    
    //b2TreeNode* DynamicTree.prototype.m_nodes;
    //int32 DynamicTree.prototype.m_nodeCount;
    //int32 DynamicTree.prototype.m_nodeCapacity;
    
    /**
     * @export
     * @type {box2d.b2TreeNode}
     */
    DynamicTree.prototype.m_freeList = null;
    
    /**
     * This is used to incrementally traverse the tree for
     * re-balancing.
     * @export
     * @type {number}
     */
    DynamicTree.prototype.m_path = 0;
    
    /**
     * @export
     * @type {number}
     */
    DynamicTree.prototype.m_insertionCount = 0;
    
    DynamicTree.s_stack = new box2d.b2GrowableStack(256);
    DynamicTree.s_r = new box2d.b2Vec2();
    DynamicTree.s_v = new box2d.b2Vec2();
    DynamicTree.s_abs_v = new box2d.b2Vec2();
    DynamicTree.s_segmentAABB = new box2d.b2AABB();
    DynamicTree.s_subInput = new box2d.b2RayCastInput();
    DynamicTree.s_combinedAABB = new box2d.b2AABB();
    DynamicTree.s_aabb = new box2d.b2AABB();
    
    /**
     * Get proxy user data.
     * @export
     * @return {*} the proxy user data or 0 if the id is invalid.
     * @param {box2d.b2TreeNode} proxy
     */
    DynamicTree.prototype.GetUserData = function(proxy) {
        if (box2d.ENABLE_ASSERTS) {
            box2d.b2Assert(proxy !== null);
        }
        return proxy.userData;
    }
    
    /**
     * Get the fat AABB for a proxy.
     * @export
     * @return {box2d.b2AABB}
     * @param {box2d.b2TreeNode} proxy
     */
    DynamicTree.prototype.GetFatAABB = function(proxy) {
        if (box2d.ENABLE_ASSERTS) {
            box2d.b2Assert(proxy !== null);
        }
        return proxy.aabb;
    }
    
    /**
     * Query an AABB for overlapping proxies. The callback class is
     * called for each proxy that overlaps the supplied AABB.
     * @export
     * @return {void}
     * @param {function(box2d.b2TreeNode):boolean} callback
     * @param {box2d.b2AABB} aabb
     */
    DynamicTree.prototype.Query = function(callback, aabb) {
        if (this.m_root === null) return;
    
        /** @type {box2d.b2GrowableStack} */
        var stack = DynamicTree.s_stack.Reset();
        stack.Push(this.m_root);
    
        while (stack.GetCount() > 0) {
            /** @type {box2d.b2TreeNode} */
            var node = /** @type {box2d.b2TreeNode} */ (stack.Pop());
            if (node === null) {
                continue;
            }
    
            if (node.aabb.TestOverlap(aabb)) {
                if (node.IsLeaf()) {
                    /** @type {boolean} */
                    var proceed = callback(node);
                    if (!proceed) {
                        return;
                    }
                } else {
                    stack.Push(node.child1);
                    stack.Push(node.child2);
                }
            }
        }
    }
    
    /**
     * Query an AABB for all entries. The callback class is
     * called for each proxy.
     * @export
     * @return {void}
     * @param {function(box2d.b2TreeNode):boolean} callback
     */
    DynamicTree.prototype.Recurse = function(callback) {
        if (this.m_root === null) return;
    
        /** @type {box2d.b2GrowableStack} */
        var stack = DynamicTree.s_stack.Reset();
        stack.Push(this.m_root);
    
        while (stack.GetCount() > 0) {
            /** @type {box2d.b2TreeNode} */
            var node = /** @type {box2d.b2TreeNode} */ (stack.Pop());
            if (node === null) {
                continue;
            }
    
            if (node.IsLeaf()) {
                /** @type {boolean} */
                var proceed = callback(node);
                if (!proceed) {
                    return;
                }
            } else {
                stack.Push(node.child1);
                stack.Push(node.child2);
            }
        }
    }
    
    /**
     * Ray-cast against the proxies in the tree. This relies on the callback
     * to perform a exact ray-cast in the case were the proxy contains a shape.
     * The callback also performs the any collision filtering. This has performance
     * roughly equal to k * log(n), where k is the number of collisions and n is the
     * number of proxies in the tree.
     * @export
     * @return {void}
     * @param
     *      {function(box2d.b2RayCastInput,box2d.b2TreeNode):number}
     *      callback a callback class that is called for each
     *      proxy that is hit by the ray.
     * @param {box2d.b2RayCastInput} input the ray-cast input data.
     *      The ray extends from p1 to p1 + maxFraction * (p2 -
     *      p1).
     */
    DynamicTree.prototype.RayCast = function(callback, input) {
        if (this.m_root === null) return;
    
        /** @type {box2d.b2Vec2} */
        var p1 = input.p1;
        /** @type {box2d.b2Vec2} */
        var p2 = input.p2;
        /** @type {box2d.b2Vec2} */
        var r = box2d.b2Sub_V2_V2(p2, p1, DynamicTree.s_r);
        if (box2d.ENABLE_ASSERTS) {
            box2d.b2Assert(r.LengthSquared() > 0);
        }
        r.Normalize();
    
        // v is perpendicular to the segment.
        /** @type {box2d.b2Vec2} */
        var v = box2d.b2Cross_S_V2(1.0, r, DynamicTree.s_v);
        /** @type {box2d.b2Vec2} */
        var abs_v = box2d.b2Abs_V2(v, DynamicTree.s_abs_v);
    
        // Separating axis for segment (Gino, p80).
        // |dot(v, p1 - c)| > dot(|v|, h)
    
        /** @type {number} */
        var maxFraction = input.maxFraction;
    
        // Build a bounding box for the segment.
        /** @type {box2d.b2AABB} */
        var segmentAABB = DynamicTree.s_segmentAABB;
        /** @type {number} */
        var t_x = p1.x + maxFraction * (p2.x - p1.x);
        /** @type {number} */
        var t_y = p1.y + maxFraction * (p2.y - p1.y);
        segmentAABB.lowerBound.x = box2d.b2Min(p1.x, t_x);
        segmentAABB.lowerBound.y = box2d.b2Min(p1.y, t_y);
        segmentAABB.upperBound.x = box2d.b2Max(p1.x, t_x);
        segmentAABB.upperBound.y = box2d.b2Max(p1.y, t_y);
    
        /** @type {box2d.b2GrowableStack} */
        var stack = DynamicTree.s_stack.Reset();
        stack.Push(this.m_root);
    
        while (stack.GetCount() > 0) {
            /** @type {box2d.b2TreeNode} */
            var node = /** @type {box2d.b2TreeNode} */ (stack.Pop());
            if (node === null) {
                continue;
            }
    
            if (!box2d.b2TestOverlap_AABB(node.aabb, segmentAABB)) {
                continue;
            }
    
            // Separating axis for segment (Gino, p80).
            // |dot(v, p1 - c)| > dot(|v|, h)
            /** @type {box2d.b2Vec2} */
            var c = node.aabb.GetCenter();
            /** @type {box2d.b2Vec2} */
            var h = node.aabb.GetExtents();
            /** @type {number} */
            var separation = box2d.b2Abs(box2d.b2Dot_V2_V2(v, box2d.b2Sub_V2_V2(p1, c, box2d.b2Vec2.s_t0))) - box2d.b2Dot_V2_V2(abs_v, h);
            if (separation > 0) {
                continue;
            }
    
            if (node.IsLeaf()) {
                /** @type {box2d.b2RayCastInput} */
                var subInput = DynamicTree.s_subInput;
                subInput.p1.Copy(input.p1);
                subInput.p2.Copy(input.p2);
                subInput.maxFraction = maxFraction;
    
                /** @type {number} */
                var value = callback(subInput, node);
    
                if (value === 0) {
                    // The client has terminated the ray cast.
                    return;
                }
    
                if (value > 0) {
                    // Update segment bounding box.
                    maxFraction = value;
                    t_x = p1.x + maxFraction * (p2.x - p1.x);
                    t_y = p1.y + maxFraction * (p2.y - p1.y);
                    segmentAABB.lowerBound.x = box2d.b2Min(p1.x, t_x);
                    segmentAABB.lowerBound.y = box2d.b2Min(p1.y, t_y);
                    segmentAABB.upperBound.x = box2d.b2Max(p1.x, t_x);
                    segmentAABB.upperBound.y = box2d.b2Max(p1.y, t_y);
                }
            } else {
                stack.Push(node.child1);
                stack.Push(node.child2);
            }
        }
    }
    
    /**
     * @export
     * @return {box2d.b2TreeNode}
     */
    DynamicTree.prototype.AllocateNode = function() {
        // Expand the node pool as needed.
        if (this.m_freeList) {
            /** @type {box2d.b2TreeNode} */
            var node = this.m_freeList;
            this.m_freeList = node.parent; // this.m_freeList = node.next;
            node.parent = null;
            node.child1 = null;
            node.child2 = null;
            node.height = 0;
            node.userData = null;
            return node;
        }
    
        return new box2d.b2TreeNode(DynamicTree.prototype.s_node_id++);
    }
    DynamicTree.prototype.s_node_id = 0;
    
    /**
     * @export
     * @return {void}
     * @param {box2d.b2TreeNode} node
     */
    DynamicTree.prototype.FreeNode = function(node) {
        node.parent = this.m_freeList; // node.next = this.m_freeList;
        node.height = -1;
        this.m_freeList = node;
    }
    
    /**
     * Create a proxy. Provide a tight fitting AABB and a userData
     * pointer.
     * @export
     * @return {box2d.b2TreeNode}
     * @param {box2d.b2AABB} aabb
     * @param {*} userData
     */
    DynamicTree.prototype.CreateProxy = function(aabb, userData) {
        /** @type {box2d.b2TreeNode} */
        var node = this.AllocateNode();
    
        // Fatten the aabb.
        /** @type {number} */
        var r_x = box2d.b2_aabbExtension;
        /** @type {number} */
        var r_y = box2d.b2_aabbExtension;
        node.aabb.lowerBound.x = aabb.lowerBound.x - r_x;
        node.aabb.lowerBound.y = aabb.lowerBound.y - r_y;
        node.aabb.upperBound.x = aabb.upperBound.x + r_x;
        node.aabb.upperBound.y = aabb.upperBound.y + r_y;
        node.userData = userData;
        node.height = 0;
    
        this.InsertLeaf(node);
    
        return node;
    }
    
    /**
     * Destroy a proxy. This asserts if the id is invalid.
     * @export
     * @return {void}
     * @param {box2d.b2TreeNode} proxy
     */
    DynamicTree.prototype.DestroyProxy = function(proxy) {
        if (box2d.ENABLE_ASSERTS) {
            box2d.b2Assert(proxy.IsLeaf());
        }
    
        this.RemoveLeaf(proxy);
        this.FreeNode(proxy);
    }
    
    /**
     * Move a proxy with a swepted AABB. If the proxy has moved
     * outside of its fattened AABB, then the proxy is removed from
     * the tree and re-inserted. Otherwise the function returns
     * immediately.
     * @export
     * @return {boolean} true if the proxy was re-inserted.
     * @param {box2d.b2TreeNode} proxy
     * @param {box2d.b2AABB} aabb
     * @param {box2d.b2Vec2} displacement
     */
    DynamicTree.prototype.MoveProxy = function(proxy, aabb, displacement) {
        if (box2d.ENABLE_ASSERTS) {
            box2d.b2Assert(proxy.IsLeaf());
        }
    
        if (proxy.aabb.Contains(aabb)) {
            return false;
        }
    
        this.RemoveLeaf(proxy);
    
        // Extend AABB.
        // Predict AABB displacement.
        /** @type {number} */
        var r_x = box2d.b2_aabbExtension + box2d.b2_aabbMultiplier * (displacement.x > 0 ? displacement.x : (-displacement.x));
        /** @type {number} */
        var r_y = box2d.b2_aabbExtension + box2d.b2_aabbMultiplier * (displacement.y > 0 ? displacement.y : (-displacement.y));
        proxy.aabb.lowerBound.x = aabb.lowerBound.x - r_x;
        proxy.aabb.lowerBound.y = aabb.lowerBound.y - r_y;
        proxy.aabb.upperBound.x = aabb.upperBound.x + r_x;
        proxy.aabb.upperBound.y = aabb.upperBound.y + r_y;
    
        this.InsertLeaf(proxy);
        return true;
    }
    
    /**
     * @export
     * @return {void}
     * @param {box2d.b2TreeNode} leaf
     */
    DynamicTree.prototype.InsertLeaf = function(leaf) {
        ++this.m_insertionCount;
    
        if (this.m_root === null) {
            this.m_root = leaf;
            this.m_root.parent = null;
            return;
        }
    
        // Find the best sibling for this node
        /** @type {box2d.b2AABB} */
        var leafAABB = leaf.aabb;
        /** @type {box2d.b2Vec2} */
        var center = leafAABB.GetCenter();
        /** @type {box2d.b2TreeNode} */
        var index = this.m_root;
        /** @type {box2d.b2TreeNode} */
        var child1;
        /** @type {box2d.b2TreeNode} */
        var child2;
        while (!index.IsLeaf()) {
            child1 = index.child1;
            child2 = index.child2;
    
            /** @type {number} */
            var area = index.aabb.GetPerimeter();
    
            /** @type {box2d.b2AABB} */
            var combinedAABB = DynamicTree.s_combinedAABB;
            combinedAABB.Combine2(index.aabb, leafAABB);
            /** @type {number} */
            var combinedArea = combinedAABB.GetPerimeter();
    
            // Cost of creating a new parent for this node and the new leaf
            /** @type {number} */
            var cost = 2 * combinedArea;
    
            // Minimum cost of pushing the leaf further down the tree
            /** @type {number} */
            var inheritanceCost = 2 * (combinedArea - area);
    
            // Cost of descending into child1
            /** @type {number} */
            var cost1;
            /** @type {box2d.b2AABB} */
            var aabb = DynamicTree.s_aabb;
            /** @type {number} */
            var oldArea;
            /** @type {number} */
            var newArea;
            if (child1.IsLeaf()) {
                aabb.Combine2(leafAABB, child1.aabb);
                cost1 = aabb.GetPerimeter() + inheritanceCost;
            } else {
                aabb.Combine2(leafAABB, child1.aabb);
                oldArea = child1.aabb.GetPerimeter();
                newArea = aabb.GetPerimeter();
                cost1 = (newArea - oldArea) + inheritanceCost;
            }
    
            // Cost of descending into child2
            /** @type {number} */
            var cost2;
            if (child2.IsLeaf()) {
                aabb.Combine2(leafAABB, child2.aabb);
                cost2 = aabb.GetPerimeter() + inheritanceCost;
            } else {
                aabb.Combine2(leafAABB, child2.aabb);
                oldArea = child2.aabb.GetPerimeter();
                newArea = aabb.GetPerimeter();
                cost2 = newArea - oldArea + inheritanceCost;
            }
    
            // Descend according to the minimum cost.
            if (cost < cost1 && cost < cost2) {
                break;
            }
    
            // Descend
            if (cost1 < cost2) {
                index = child1;
            } else {
                index = child2;
            }
        }
    
        /** @type {box2d.b2TreeNode} */
        var sibling = index;
    
        // Create a parent for the siblings.
        /** @type {box2d.b2TreeNode} */
        var oldParent = sibling.parent;
        /** @type {box2d.b2TreeNode} */
        var newParent = this.AllocateNode();
        newParent.parent = oldParent;
        newParent.userData = null;
        newParent.aabb.Combine2(leafAABB, sibling.aabb);
        newParent.height = sibling.height + 1;
    
        if (oldParent) {
            // The sibling was not the root.
            if (oldParent.child1 === sibling) {
                oldParent.child1 = newParent;
            } else {
                oldParent.child2 = newParent;
            }
    
            newParent.child1 = sibling;
            newParent.child2 = leaf;
            sibling.parent = newParent;
            leaf.parent = newParent;
        } else {
            // The sibling was the root.
            newParent.child1 = sibling;
            newParent.child2 = leaf;
            sibling.parent = newParent;
            leaf.parent = newParent;
            this.m_root = newParent;
        }
    
        // Walk back up the tree fixing heights and AABBs
        index = leaf.parent;
        while (index !== null) {
            index = this.Balance(index);
    
            child1 = index.child1;
            child2 = index.child2;
    
            if (box2d.ENABLE_ASSERTS) {
                box2d.b2Assert(child1 !== null);
            }
            if (box2d.ENABLE_ASSERTS) {
                box2d.b2Assert(child2 !== null);
            }
    
            index.height = 1 + box2d.b2Max(child1.height, child2.height);
            index.aabb.Combine2(child1.aabb, child2.aabb);
    
            index = index.parent;
        }
    
        //this.Validate();
    }
    
    /**
     * @export
     * @return {void}
     * @param {box2d.b2TreeNode} leaf
     */
    DynamicTree.prototype.RemoveLeaf = function(leaf) {
        if (leaf === this.m_root) {
            this.m_root = null;
            return;
        }
    
        /** @type {box2d.b2TreeNode} */
        var parent = leaf.parent;
        /** @type {box2d.b2TreeNode} */
        var grandParent = parent.parent;
        /** @type {box2d.b2TreeNode} */
        var sibling;
        if (parent.child1 === leaf) {
            sibling = parent.child2;
        } else {
            sibling = parent.child1;
        }
    
        if (grandParent) {
            // Destroy parent and connect sibling to grandParent.
            if (grandParent.child1 === parent) {
                grandParent.child1 = sibling;
            } else {
                grandParent.child2 = sibling;
            }
            sibling.parent = grandParent;
            this.FreeNode(parent);
    
            // Adjust ancestor bounds.
            /** @type {box2d.b2TreeNode} */
            var index = grandParent;
            while (index) {
                index = this.Balance(index);
    
                /** @type {box2d.b2TreeNode} */
                var child1 = index.child1;
                /** @type {box2d.b2TreeNode} */
                var child2 = index.child2;
    
                index.aabb.Combine2(child1.aabb, child2.aabb);
                index.height = 1 + box2d.b2Max(child1.height, child2.height);
    
                index = index.parent;
            }
        } else {
            this.m_root = sibling;
            sibling.parent = null;
            this.FreeNode(parent);
        }
    
        //this.Validate();
    }
    
    /**
     * Perform a left or right rotation if node A is imbalanced.
     * Returns the new root index.
     * @export
     * @param {box2d.b2TreeNode} A
     * @return {box2d.b2TreeNode}
     */
    DynamicTree.prototype.Balance = function(A) {
        if (box2d.ENABLE_ASSERTS) {
            box2d.b2Assert(A !== null);
        }
    
        if (A.IsLeaf() || A.height < 2) {
            return A;
        }
    
        /** @type {box2d.b2TreeNode} */
        var B = A.child1;
        /** @type {box2d.b2TreeNode} */
        var C = A.child2;
    
        /** @type {number} */
        var balance = C.height - B.height;
    
        // Rotate C up
        if (balance > 1) {
            /** @type {box2d.b2TreeNode} */
            var F = C.child1;
            /** @type {box2d.b2TreeNode} */
            var G = C.child2;
    
            // Swap A and C
            C.child1 = A;
            C.parent = A.parent;
            A.parent = C;
    
            // A's old parent should point to C
            if (C.parent !== null) {
                if (C.parent.child1 === A) {
                    C.parent.child1 = C;
                } else {
                    if (box2d.ENABLE_ASSERTS) {
                        box2d.b2Assert(C.parent.child2 === A);
                    }
                    C.parent.child2 = C;
                }
            } else {
                this.m_root = C;
            }
    
            // Rotate
            if (F.height > G.height) {
                C.child2 = F;
                A.child2 = G;
                G.parent = A;
                A.aabb.Combine2(B.aabb, G.aabb);
                C.aabb.Combine2(A.aabb, F.aabb);
    
                A.height = 1 + box2d.b2Max(B.height, G.height);
                C.height = 1 + box2d.b2Max(A.height, F.height);
            } else {
                C.child2 = G;
                A.child2 = F;
                F.parent = A;
                A.aabb.Combine2(B.aabb, F.aabb);
                C.aabb.Combine2(A.aabb, G.aabb);
    
                A.height = 1 + box2d.b2Max(B.height, F.height);
                C.height = 1 + box2d.b2Max(A.height, G.height);
            }
    
            return C;
        }
    
        // Rotate B up
        if (balance < -1) {
            /** @type {box2d.b2TreeNode} */
            var D = B.child1;
            /** @type {box2d.b2TreeNode} */
            var E = B.child2;
    
            // Swap A and B
            B.child1 = A;
            B.parent = A.parent;
            A.parent = B;
    
            // A's old parent should point to B
            if (B.parent !== null) {
                if (B.parent.child1 === A) {
                    B.parent.child1 = B;
                } else {
                    if (box2d.ENABLE_ASSERTS) {
                        box2d.b2Assert(B.parent.child2 === A);
                    }
                    B.parent.child2 = B;
                }
            } else {
                this.m_root = B;
            }
    
            // Rotate
            if (D.height > E.height) {
                B.child2 = D;
                A.child1 = E;
                E.parent = A;
                A.aabb.Combine2(C.aabb, E.aabb);
                B.aabb.Combine2(A.aabb, D.aabb);
    
                A.height = 1 + box2d.b2Max(C.height, E.height);
                B.height = 1 + box2d.b2Max(A.height, D.height);
            } else {
                B.child2 = E;
                A.child1 = D;
                D.parent = A;
                A.aabb.Combine2(C.aabb, D.aabb);
                B.aabb.Combine2(A.aabb, E.aabb);
    
                A.height = 1 + box2d.b2Max(C.height, D.height);
                B.height = 1 + box2d.b2Max(A.height, E.height);
            }
    
            return B;
        }
    
        return A;
    }
    
    /**
     * Compute the height of the binary tree in O(N) time. Should
     * not be called often.
     * @export
     * @return {number}
     */
    DynamicTree.prototype.GetHeight = function() {
        if (this.m_root === null) {
            return 0;
        }
    
        return this.m_root.height;
    }
    
    /**
     * Get the ratio of the sum of the node areas to the root area.
     * @export
     * @return {number}
     */
    DynamicTree.prototype.GetAreaRatio = function() {
        if (this.m_root === null) {
            return 0;
        }
    
        /** @type {box2d.b2TreeNode} */
        var root = this.m_root;
        /** @type {number} */
        var rootArea = root.aabb.GetPerimeter();
    
        var GetAreaNode = function(node) {
            if (node === null) {
                return 0;
            }
    
            if (node.IsLeaf()) {
                return 0;
            }
    
            /** @type {number} */
            var area = node.aabb.GetPerimeter();
            area += GetAreaNode(node.child1);
            area += GetAreaNode(node.child2);
            return area;
        }
        /** @type {number} */
        var totalArea = GetAreaNode(this.m_root);
    
        /*
        float32 totalArea = 0.0;
        for (int32 i = 0; i < m_nodeCapacity; ++i)
        {
          const b2TreeNode* node = m_nodes + i;
          if (node.height < 0)
          {
            // Free node in pool
            continue;
          }
          totalArea += node.aabb.GetPerimeter();
        }
        */
    
        return totalArea / rootArea;
    }
    
    /**
     * Compute the height of a sub-tree.
     * @export
     * @return {number}
     * @param {box2d.b2TreeNode} node
     */
    DynamicTree.prototype.ComputeHeightNode = function(node) {
        if (node.IsLeaf()) {
            return 0;
        }
    
        /** @type {number} */
        var height1 = this.ComputeHeightNode(node.child1);
        /** @type {number} */
        var height2 = this.ComputeHeightNode(node.child2);
        return 1 + box2d.b2Max(height1, height2);
    }
    
    /**
     * @export
     * @return {number}
     */
    DynamicTree.prototype.ComputeHeight = function() {
        /** @type {number} */
        var height = this.ComputeHeightNode(this.m_root);
        return height;
    }
    
    /**
     * @export
     * @return {void}
     * @param {box2d.b2TreeNode} index
     */
    DynamicTree.prototype.ValidateStructure = function(index) {
        if (index === null) {
            return;
        }
    
        if (index === this.m_root) {
            if (box2d.ENABLE_ASSERTS) {
                box2d.b2Assert(index.parent === null);
            }
        }
    
        /** @type {box2d.b2TreeNode} */
        var node = index;
    
        /** @type {box2d.b2TreeNode} */
        var child1 = node.child1;
        /** @type {box2d.b2TreeNode} */
        var child2 = node.child2;
    
        if (node.IsLeaf()) {
            if (box2d.ENABLE_ASSERTS) {
                box2d.b2Assert(child1 === null);
            }
            if (box2d.ENABLE_ASSERTS) {
                box2d.b2Assert(child2 === null);
            }
            if (box2d.ENABLE_ASSERTS) {
                box2d.b2Assert(node.height === 0);
            }
            return;
        }
    
        if (box2d.ENABLE_ASSERTS) {
            box2d.b2Assert(child1.parent === index);
        }
        if (box2d.ENABLE_ASSERTS) {
            box2d.b2Assert(child2.parent === index);
        }
    
        this.ValidateStructure(child1);
        this.ValidateStructure(child2);
    }
    
    /**
     * @export
     * @return {void}
     * @param {box2d.b2TreeNode} index
     */
    DynamicTree.prototype.ValidateMetrics = function(index) {
        if (index === null) {
            return;
        }
    
        /** @type {box2d.b2TreeNode} */
        var node = index;
    
        /** @type {box2d.b2TreeNode} */
        var child1 = node.child1;
        /** @type {box2d.b2TreeNode} */
        var child2 = node.child2;
    
        if (node.IsLeaf()) {
            if (box2d.ENABLE_ASSERTS) {
                box2d.b2Assert(child1 === null);
            }
            if (box2d.ENABLE_ASSERTS) {
                box2d.b2Assert(child2 === null);
            }
            if (box2d.ENABLE_ASSERTS) {
                box2d.b2Assert(node.height === 0);
            }
            return;
        }
    
        /** @type {number} */
        var height1 = child1.height;
        /** @type {number} */
        var height2 = child2.height;
        /** @type {number} */
        var height;
        height = 1 + box2d.b2Max(height1, height2);
        if (box2d.ENABLE_ASSERTS) {
            box2d.b2Assert(node.height === height);
        }
    
        /** @type {box2d.b2AABB} */
        var aabb = DynamicTree.s_aabb;
        aabb.Combine2(child1.aabb, child2.aabb);
    
        if (box2d.ENABLE_ASSERTS) {
            box2d.b2Assert(aabb.lowerBound === node.aabb.lowerBound);
        }
        if (box2d.ENABLE_ASSERTS) {
            box2d.b2Assert(aabb.upperBound === node.aabb.upperBound);
        }
    
        this.ValidateMetrics(child1);
        this.ValidateMetrics(child2);
    }
    
    /**
     * Validate this tree. For testing.
     * @export
     * @return {void}
     */
    DynamicTree.prototype.Validate = function() {
        this.ValidateStructure(this.m_root);
        this.ValidateMetrics(this.m_root);
    
        /** @type {number} */
        var freeCount = 0;
        /** @type {box2d.b2TreeNode} */
        var freeIndex = this.m_freeList;
        while (freeIndex !== null) {
            freeIndex = freeIndex.parent; //freeIndex = freeIndex.next;
            ++freeCount;
        }
    
        if (box2d.ENABLE_ASSERTS) {
            box2d.b2Assert(this.GetHeight() === this.ComputeHeight());
        }
    }
    
    /**
     * Get the maximum balance of an node in the tree. The balance
     * is the difference in height of the two children of a node.
     * @export
     * @return {number}
     */
    DynamicTree.prototype.GetMaxBalance = function() {
        var GetMaxBalanceNode = function(node, maxBalance) {
            if (node === null) {
                return maxBalance;
            }
    
            if (node.height <= 1) {
                return maxBalance;
            }
    
            if (box2d.ENABLE_ASSERTS) {
                box2d.b2Assert(!node.IsLeaf());
            }
    
            /** @type {box2d.b2TreeNode} */
            var child1 = node.child1;
            /** @type {box2d.b2TreeNode} */
            var child2 = node.child2;
            /** @type {number} */
            var balance = box2d.b2Abs(child2.height - child1.height);
            return box2d.b2Max(maxBalance, balance);
        }
    
        /** @type {number} */
        var maxBalance = GetMaxBalanceNode(this.m_root, 0);
    
        /*
        int32 maxBalance = 0;
        for (int32 i = 0; i < m_nodeCapacity; ++i)
        {
          const b2TreeNode* node = m_nodes + i;
          if (node.height <= 1)
          {
            continue;
          }
          b2Assert(!node.IsLeaf());
          int32 child1 = node.child1;
          int32 child2 = node.child2;
          int32 balance = b2Abs(m_nodes[child2].height - m_nodes[child1].height);
          maxBalance = b2Max(maxBalance, balance);
        }
        */
    
        return maxBalance;
    }
    
    /**
     * Build an optimal tree. Very expensive. For testing.
     * @export
     * @return {void}
     */
    DynamicTree.prototype.RebuildBottomUp = function() {
        /*
        int32* nodes = (int32*)b2Alloc(m_nodeCount * sizeof(int32));
        int32 count = 0;
        // Build array of leaves. Free the rest.
        for (int32 i = 0; i < m_nodeCapacity; ++i)
        {
          if (m_nodes[i].height < 0)
          {
            // free node in pool
            continue;
          }
          if (m_nodes[i].IsLeaf())
          {
            m_nodes[i].parent = b2_nullNode;
            nodes[count] = i;
            ++count;
          }
          else
          {
            FreeNode(i);
          }
        }
        while (count > 1)
        {
          float32 minCost = b2_maxFloat;
          int32 iMin = -1, jMin = -1;
          for (int32 i = 0; i < count; ++i)
          {
            b2AABB aabbi = m_nodes[nodes[i]].aabb;
            for (int32 j = i + 1; j < count; ++j)
            {
              b2AABB aabbj = m_nodes[nodes[j]].aabb;
              b2AABB b;
              b.Combine(aabbi, aabbj);
              float32 cost = b.GetPerimeter();
              if (cost < minCost)
              {
                iMin = i;
                jMin = j;
                minCost = cost;
              }
            }
          }
          int32 index1 = nodes[iMin];
          int32 index2 = nodes[jMin];
          b2TreeNode* child1 = m_nodes + index1;
          b2TreeNode* child2 = m_nodes + index2;
          int32 parentIndex = AllocateNode();
          b2TreeNode* parent = m_nodes + parentIndex;
          parent.child1 = index1;
          parent.child2 = index2;
          parent.height = 1 + b2Max(child1.height, child2.height);
          parent.aabb.Combine(child1.aabb, child2.aabb);
          parent.parent = b2_nullNode;
          child1.parent = parentIndex;
          child2.parent = parentIndex;
          nodes[jMin] = nodes[count-1];
          nodes[iMin] = parentIndex;
          --count;
        }
        m_root = nodes[0];
        b2Free(nodes);
        */
    
        this.Validate();
    }
    
    /**
     * Shift the world origin. Useful for large worlds.
     * The shift formula is: position -= newOrigin
     * @export
     * @param {box2d.b2Vec2} newOrigin the new origin with respect to the old origin
     * @return {void}
     */
    DynamicTree.prototype.ShiftOrigin = function(newOrigin) {
        var ShiftOriginNode = function(node, newOrigin) {
            if (node === null) {
                return;
            }
    
            if (node.height <= 1) {
                return;
            }
    
            if (box2d.ENABLE_ASSERTS) {
                box2d.b2Assert(!node.IsLeaf());
            }
    
            /** @type {box2d.b2TreeNode} */
            var child1 = node.child1;
            /** @type {box2d.b2TreeNode} */
            var child2 = node.child2;
            ShiftOriginNode(child1, newOrigin);
            ShiftOriginNode(child2, newOrigin);
    
            node.aabb.lowerBound.SelfSub(newOrigin);
            node.aabb.upperBound.SelfSub(newOrigin);
        }
    
        ShiftOriginNode(this.m_root, newOrigin);
    
        /*
        // Build array of leaves. Free the rest.
        for (int32 i = 0; i < m_nodeCapacity; ++i)
        {
          m_nodes[i].aabb.lowerBound -= newOrigin;
          m_nodes[i].aabb.upperBound -= newOrigin;
        }
        */
    }
    const LE = new Uint8Array(new Uint32Array([0x00000001]).buffer)[0] === 0x01;
    
    class BinaryHelper {
        static _buffer = new ArrayBuffer(4);
        static _floatBuffer = new Float32Array(BinaryHelper._buffer);
        static _intBuffer = new Int32Array(BinaryHelper._buffer);
        static _uintBuffer = new Uint32Array(BinaryHelper._buffer);
        static _byteBuffer = new Uint8Array(BinaryHelper._buffer);
    
        static readFloat(byte1, byte2, byte3, byte4) {
            if (LE) {
                BinaryHelper._byteBuffer[0] = byte1;
                BinaryHelper._byteBuffer[1] = byte2;
                BinaryHelper._byteBuffer[2] = byte3;
                BinaryHelper._byteBuffer[3] = byte4;
            } else {
                BinaryHelper._byteBuffer[0] = byte4;
                BinaryHelper._byteBuffer[1] = byte3;
                BinaryHelper._byteBuffer[2] = byte2;
                BinaryHelper._byteBuffer[3] = byte1;
            }
    
            return BinaryHelper._floatBuffer[0];
        }
    
        static readInt(byte1, byte2, byte3, byte4) {
            if (LE) {
                BinaryHelper._byteBuffer[0] = byte1;
                BinaryHelper._byteBuffer[1] = byte2;
                BinaryHelper._byteBuffer[2] = byte3;
                BinaryHelper._byteBuffer[3] = byte4;
            } else {
                BinaryHelper._byteBuffer[0] = byte4;
                BinaryHelper._byteBuffer[1] = byte3;
                BinaryHelper._byteBuffer[2] = byte2;
                BinaryHelper._byteBuffer[3] = byte1;
            }
    
            return BinaryHelper._intBuffer[0];
        }
    
        static readUnsignedInt(byte1, byte2, byte3, byte4) {
            if (LE) {
                BinaryHelper._byteBuffer[0] = byte1;
                BinaryHelper._byteBuffer[1] = byte2;
                BinaryHelper._byteBuffer[2] = byte3;
                BinaryHelper._byteBuffer[3] = byte4;
            } else {
                BinaryHelper._byteBuffer[0] = byte4;
                BinaryHelper._byteBuffer[1] = byte3;
                BinaryHelper._byteBuffer[2] = byte2;
                BinaryHelper._byteBuffer[3] = byte1;
            }
    
            return BinaryHelper._uintBuffer[0];
        }
    
        static readUnsignedLong(byte1, byte2, byte3, byte4, byte5, byte6, byte7, byte8) {
            if (LE) {
                BinaryHelper._byteBuffer[0] = byte1;
                BinaryHelper._byteBuffer[1] = byte2;
                BinaryHelper._byteBuffer[2] = byte3;
                BinaryHelper._byteBuffer[3] = byte4;
            } else {
                BinaryHelper._byteBuffer[0] = byte8;
                BinaryHelper._byteBuffer[1] = byte7;
                BinaryHelper._byteBuffer[2] = byte6;
                BinaryHelper._byteBuffer[3] = byte5;
            }
            const int1 = BinaryHelper._uintBuffer[0];
    
            if (LE) {
                BinaryHelper._byteBuffer[0] = byte5;
                BinaryHelper._byteBuffer[1] = byte6;
                BinaryHelper._byteBuffer[2] = byte7;
                BinaryHelper._byteBuffer[3] = byte8;
            } else {
                BinaryHelper._byteBuffer[0] = byte4;
                BinaryHelper._byteBuffer[1] = byte3;
                BinaryHelper._byteBuffer[2] = byte2;
                BinaryHelper._byteBuffer[3] = byte1;
            }
            const int2 = BinaryHelper._uintBuffer[0];
    
            return int1 * 0x100000000 + int2;
        }
    
        static writeFloat(float, bytes, index) {
            BinaryHelper._floatBuffer[0] = float;
    
            if (LE) {
                bytes[index + 0] = BinaryHelper._byteBuffer[0];
                bytes[index + 1] = BinaryHelper._byteBuffer[1];
                bytes[index + 2] = BinaryHelper._byteBuffer[2];
                bytes[index + 3] = BinaryHelper._byteBuffer[3];
    
                return index + 4;
            }
    
            bytes[index + 0] = BinaryHelper._byteBuffer[3];
            bytes[index + 1] = BinaryHelper._byteBuffer[2];
            bytes[index + 2] = BinaryHelper._byteBuffer[1];
            bytes[index + 3] = BinaryHelper._byteBuffer[0];
    
            return index + 4;
        }
    
        static writeInt(int, bytes, index) {
            BinaryHelper._intBuffer[0] = int;
    
            if (LE) {
                bytes[index + 0] = BinaryHelper._byteBuffer[0];
                bytes[index + 1] = BinaryHelper._byteBuffer[1];
                bytes[index + 2] = BinaryHelper._byteBuffer[2];
                bytes[index + 3] = BinaryHelper._byteBuffer[3];
    
                return index + 4;
            }
    
            bytes[index + 0] = BinaryHelper._byteBuffer[3];
            bytes[index + 1] = BinaryHelper._byteBuffer[2];
            bytes[index + 2] = BinaryHelper._byteBuffer[1];
            bytes[index + 3] = BinaryHelper._byteBuffer[0];
    
            return index + 4;
        }
    
        static writeLong(int, bytes, index) {
            if (LE) {
                BinaryHelper._intBuffer[0] = MathHelper.left32Bits(int);
                const byte1 = BinaryHelper._byteBuffer[0];
                const byte2 = BinaryHelper._byteBuffer[1];
                const byte3 = BinaryHelper._byteBuffer[2];
                const byte4 = BinaryHelper._byteBuffer[3];
    
                BinaryHelper._intBuffer[0] = MathHelper.right32Bits(int);
    
                bytes[index + 0] = BinaryHelper._byteBuffer[0];
                bytes[index + 1] = BinaryHelper._byteBuffer[1];
                bytes[index + 2] = BinaryHelper._byteBuffer[2];
                bytes[index + 3] = BinaryHelper._byteBuffer[3];
                bytes[index + 4] = byte1;
                bytes[index + 5] = byte2;
                bytes[index + 6] = byte3;
                bytes[index + 7] = byte4;
    
                return index + 8;
            }
    
            BinaryHelper._intBuffer[0] = MathHelper.right32Bits(int);
            const byte1 = BinaryHelper._byteBuffer[3];
            const byte2 = BinaryHelper._byteBuffer[2];
            const byte3 = BinaryHelper._byteBuffer[1];
            const byte4 = BinaryHelper._byteBuffer[0];
    
            BinaryHelper._intBuffer[0] = MathHelper.left32Bits(int);
    
            bytes[index + 0] = BinaryHelper._byteBuffer[3];
            bytes[index + 1] = BinaryHelper._byteBuffer[2];
            bytes[index + 2] = BinaryHelper._byteBuffer[1];
            bytes[index + 3] = BinaryHelper._byteBuffer[0];
            bytes[index + 4] = byte1;
            bytes[index + 5] = byte2;
            bytes[index + 6] = byte3;
            bytes[index + 7] = byte4;
    
            return index + 8;
        }
    
        static writeString(string, bytes, index) {
            index = BinaryHelper.writeInt(string.length, bytes, index);
            for (let i = 0; i < string.length; i++) {
                index = BinaryHelper.writeInt(string.charCodeAt(i), bytes, index);
            }
    
            return index;
        }
    }
    
    class PerlinNoise {
        static getNoise(seed, t) {
            if (seed <= 1) {
                seed *= 256;
            }
    
            const row = (Math.floor(Math.abs(seed) % 256) + Math.floor(t)) % 256;
            
            const rawColumn = (t % 1) * 256;
            const columnStart = Math.floor(rawColumn);
            const columnEnd = (columnStart + 1) % 256;
            const columnProgress = t % 1;
    
            const startValue = PERLIN[row * 256 + columnStart];
            const endValue = PERLIN[row * 256 + columnEnd];
    
            return startValue + (endValue - startValue) * columnProgress;
        }
    }
    const PERLIN = [0.75058643,0.68983790,0.62418898,0.57274462,0.52677603,0.42424050,0.31973800,0.22257702,0.11663777,0.21803392,0.32017477,0.39545609,0.46860530,0.57359169,0.67771321,0.76576550,0.86470511,0.78024121,0.70242114,0.61626731,0.53170735,0.50363982,0.46776319,0.44523642,0.42024339,0.40873780,0.39503936,0.36744580,0.34388266,0.37036359,0.39154136,0.39152950,0.39846225,0.35707774,0.30903251,0.27301358,0.23634116,0.21011276,0.18221788,0.16511445,0.13655208,0.24058476,0.33696787,0.43111823,0.52823468,0.63644421,0.74142055,0.84114394,0.95056190,0.91196401,0.88099294,0.85414582,0.82118593,0.82728529,0.83538429,0.85809972,0.87700883,0.86659717,0.85211676,0.85756138,0.86625280,0.87793086,0.88829333,0.89971877,0.92071868,0.87579991,0.83913532,0.79928092,0.76452441,0.73239299,0.70049744,0.68142091,0.65909352,0.65998723,0.66313971,0.67577953,0.68041952,0.73034588,0.77886658,0.83605656,0.88936524,0.78319801,0.68330482,0.57771995,0.46995284,0.38462799,0.29847328,0.21125826,0.12616218,0.18030217,0.23550701,0.27201020,0.31325107,0.34383905,0.37222845,0.41702076,0.45438940,0.46821512,0.48161788,0.50259080,0.52294588,0.55413204,0.58023345,0.62701667,0.67125978,0.65308534,0.63940602,0.62193013,0.60157743,0.59685589,0.59557811,0.59762359,0.59861188,0.58238278,0.56904969,0.57328140,0.57271551,0.60698897,0.63647081,0.65654748,0.67882322,0.66981502,0.65948799,0.66600371,0.67312831,0.64230742,0.60708599,0.59418594,0.57562893,0.54842473,0.51498538,0.49602230,0.48175069,0.39129889,0.29755097,0.22646795,0.15348805,0.20497744,0.24891238,0.29588254,0.34851053,0.35052575,0.36079538,0.36105644,0.36162024,0.42664666,0.48878654,0.56909798,0.64201032,0.71773225,0.79979052,0.88462833,0.96916922,0.87329877,0.77661770,0.69834123,0.61596304,0.50402092,0.38870088,0.28409964,0.17792656,0.20002736,0.21339495,0.23572800,0.25676157,0.26008527,0.26248754,0.27641306,0.29090170,0.35178932,0.40413105,0.45961941,0.51131522,0.61022841,0.70079414,0.81308315,0.92150666,0.89032372,0.85782239,0.84907178,0.84346756,0.83941443,0.83367327,0.83774023,0.84990176,0.80225410,0.76264591,0.73088979,0.70074808,0.64789421,0.59375011,0.56215359,0.52510314,0.50238747,0.47810449,0.47187093,0.47002090,0.41656961,0.37130380,0.30150899,0.23671829,0.30033470,0.35928730,0.39942256,0.43377730,0.51812012,0.59784989,0.67768263,0.75369282,0.70785954,0.65783330,0.62035275,0.58250108,0.58590603,0.59038925,0.60020588,0.60758799,0.60649492,0.60980196,0.61587579,0.62582132,0.61086171,0.60599589,0.58471421,0.56829979,0.61074300,0.64941233,0.68899642,0.72490298,0.76518937,0.79833967,0.86654160,0.92872108,0.87871005,0.82605755,0.80922717,0.79321343,0.73631959,0.68769096,0.63802295,0.59411229,0.53503978,0.47619284,0.41973933,0.35963153,0.27164754,0.18756266,0.09869982,0.00472748,0.09611202,0.19127480,0.25167221,0.30657630,0.42885503,0.54470813,0.64398162,0.68661282,0.62596938,0.57029351,0.52596681,0.48486893,0.39965402,0.31202301,0.23687700,0.16167588,0.23770923,0.31078512,0.38781387,0.45917255,0.55092268,0.64882695,0.74849865,0.84488787,0.77240836,0.70490563,0.63759203,0.56992454,0.53795938,0.51151231,0.49122678,0.46998281,0.45249010,0.42544797,0.40584727,0.38563938,0.39853512,0.40584317,0.40094518,0.39342657,0.36195831,0.33332406,0.30824891,0.28106133,0.25544991,0.22449575,0.20191848,0.17016523,0.25347931,0.33747411,0.41071554,0.48900541,0.57997912,0.66901385,0.76271805,0.85260418,0.82551100,0.79869595,0.76998968,0.74575989,0.75332465,0.75909419,0.77346026,0.79415367,0.78880036,0.78461021,0.77701362,0.77287396,0.79569407,0.81074818,0.82931379,0.84897135,0.83220899,0.81496905,0.79185329,0.76613746,0.75074185,0.72940919,0.71413902,0.70323296,0.69712487,0.69177684,0.69031900,0.69135245,0.73414176,0.77350301,0.80508722,0.83865240,0.74281581,0.64632936,0.55446685,0.45354370,0.37716141,0.30093814,0.23202328,0.15909173,0.20057381,0.24389621,0.27375607,0.31219106,0.33841508,0.36487002,0.39426984,0.42330597,0.45900003,0.48557559,0.51062312,0.52789838,0.56628570,0.59982978,0.63498092,0.67450171,0.65806834,0.64001996,0.63464435,0.61970567,0.61395965,0.60044503,0.58298257,0.56880361,0.56156751,0.54868807,0.54866549,0.54704215,0.56146985,0.57861846,0.58732195,0.59883397,0.59575812,0.58816300,0.58633672,0.58263470,0.56335414,0.54751853,0.53833812,0.53011445,0.49878934,0.46520760,0.45211120,0.43121882,0.36374913,0.29720454,0.23008920,0.16631518,0.21313433,0.26550796,0.30170553,0.34170745,0.34527601,0.35413618,0.35704048,0.36174528,0.41039966,0.46037120,0.52881798,0.59087527,0.65790310,0.72635087,0.79910176,0.86906737,0.80083496,0.73124824,0.66429228,0.59425954,0.50121651,0.40566366,0.31847326,0.22754297,0.25493485,0.28019685,0.30844726,0.33154502,0.33425046,0.34320285,0.35386281,0.37288480,0.41323229,0.45987540,0.50349225,0.55164662,0.63215947,0.72041860,0.80849418,0.89585042,0.87107351,0.84837722,0.82284262,0.80173997,0.79097037,0.77322005,0.76421932,0.75175722,0.72906144,0.70164593,0.67645734,0.65000695,0.61935092,0.58601926,0.56414534,0.53895414,0.50238013,0.47287936,0.45966638,0.44701985,0.39539605,0.33951984,0.28311935,0.22847064,0.28638996,0.33470298,0.37283610,0.40387126,0.48192113,0.55472602,0.61939596,0.68190461,0.64458307,0.60321672,0.56811770,0.53481274,0.54994975,0.56143268,0.56014615,0.56646601,0.57612131,0.58619630,0.59808826,0.60889853,0.59536047,0.58631620,0.56751330,0.55937267,0.59752875,0.64175111,0.67778239,0.71870333,0.75783116,0.79758623,0.84854613,0.89845309,0.85803482,0.82268240,0.79120265,0.76522258,0.71938935,0.67756584,0.64753359,0.61143419,0.54714206,0.47645274,0.41922435,0.36168326,0.28907830,0.21223025,0.13437350,0.05557967,0.12404751,0.20122448,0.26678863,0.33452528,0.42338611,0.51753030,0.59930079,0.61626423,0.56930715,0.51546464,0.47990126,0.44763778,0.37463408,0.30739319,0.25624937,0.20664874,0.25780961,0.30552559,0.37905129,0.44283335,0.53877485,0.62638020,0.72516025,0.82562380,0.76671096,0.70570784,0.65443531,0.60630800,0.57601962,0.54410775,0.53820486,0.52741156,0.49372268,0.45750609,0.44053386,0.42802833,0.42420095,0.42817876,0.40733499,0.38218507,0.37168317,0.35437530,0.33352410,0.32036463,0.29099667,0.27268866,0.23551031,0.20084960,0.26905814,0.33698842,0.39390837,0.45257641,0.52433976,0.60029635,0.67689593,0.75499020,0.73488342,0.71559706,0.69466824,0.67426197,0.68132736,0.68483431,0.69727746,0.70951850,0.71166131,0.71811436,0.69857456,0.68470249,0.70840606,0.73022686,0.76062480,0.78571576,0.79035726,0.79524386,0.77838956,0.76850640,0.76752147,0.76044890,0.75144406,0.75202077,0.72946691,0.71549196,0.71014726,0.70425800,0.73023650,0.76412673,0.77441124,0.78341251,0.69704331,0.61355583,0.52754809,0.43622669,0.36904910,0.29699573,0.24887378,0.19617239,0.22277512,0.24815307,0.27745417,0.30344319,0.32787768,0.35136509,0.37468810,0.39242072,0.44187439,0.49285196,0.51314722,0.53104007,0.57164449,0.61530247,0.64719439,0.67735676,0.66030544,0.64390352,0.64708882,0.64099246,0.62132179,0.60341780,0.56811355,0.53361089,0.53170701,0.53207241,0.52562057,0.51743290,0.51837450,0.52539185,0.52154923,0.52264147,0.52015423,0.51413106,0.50382886,0.49108702,0.49437482,0.49274429,0.49111351,0.48545637,0.45491896,0.41725838,0.40135916,0.39050344,0.33762050,0.29196336,0.23848671,0.18120041,0.23168333,0.27821071,0.30489789,0.32841259,0.34412908,0.35612228,0.35396361,0.35734450,0.39155956,0.43121739,0.48872581,0.53478888,0.59977633,0.65611296,0.71316310,0.77566095,0.73181825,0.68916748,0.62544526,0.56667094,0.49716410,0.42579652,0.34980230,0.26900312,0.31184247,0.35090630,0.37763154,0.40787293,0.40918190,0.41592496,0.43087615,0.44843639,0.48483458,0.52155779,0.55294251,0.58728231,0.65871093,0.73342979,0.80678575,0.87450176,0.85633123,0.83837178,0.80228298,0.76265481,0.73926240,0.71381557,0.69083099,0.66047577,0.65409082,0.64160049,0.62068594,0.60210374,0.59605299,0.58390671,0.56622311,0.55134577,0.50349092,0.46229340,0.44737757,0.43356680,0.37524642,0.31436620,0.27102232,0.22131010,0.26862423,0.31975943,0.34973296,0.37337202,0.44191867,0.50704676,0.55979670,0.61755491,0.58218924,0.55141169,0.51661616,0.48473938,0.50392531,0.52692946,0.52726151,0.52712926,0.54176052,0.55545687,0.57399762,0.59064758,0.57682621,0.56330454,0.55126736,0.54463207,0.58965215,0.63364901,0.67084148,0.71212154,0.75652755,0.80074901,0.83205957,0.86628710,0.83820509,0.81527353,0.77686984,0.73367495,0.70202145,0.66893267,0.65219773,0.63067827,0.55756513,0.47715454,0.42514681,0.36692272,0.30191635,0.24208196,0.17224204,0.10316849,0.15472994,0.20670517,0.28299195,0.36192806,0.42779418,0.48893747,0.55088682,0.57105938,0.51949895,0.47562133,0.44404568,0.41275087,0.36215207,0.31788997,0.27397079,0.23525686,0.27959970,0.32811367,0.38468221,0.43535618,0.53022486,0.61918437,0.71005748,0.79879461,0.74871057,0.70540248,0.66680709,0.62722485,0.60389928,0.57942217,0.56653681,0.55325543,0.52923176,0.50965150,0.48412290,0.46050632,0.44491744,0.43282536,0.41497088,0.39688680,0.38158721,0.36727719,0.35628259,0.34177792,0.32009278,0.28901054,0.26352699,0.23646363,0.27718611,0.32100962,0.35517428,0.39682740,0.45954112,0.52041813,0.58896208,0.65141868,0.64112904,0.62269994,0.59760981,0.57529979,0.58621151,0.60183967,0.61435116,0.62435349,0.63126053,0.63003992,0.62211908,0.60681888,0.63979945,0.67020128,0.69362331,0.71410258,0.73480272,0.75655093,0.77615566,0.79416952,0.78801215,0.79015057,0.78553849,0.78517576,0.76652383,0.74344278,0.73014145,0.71713255,0.72796720,0.74139902,0.74897040,0.75109978,0.66911802,0.58745776,0.50691755,0.43002479,0.37086695,0.31873048,0.26931882,0.21868134,0.23904847,0.25810387,0.28940183,0.31816025,0.32920271,0.34435226,0.36165996,0.37434010,0.42441540,0.47585901,0.51273383,0.54735653,0.58654811,0.61864759,0.64534986,0.66699203,0.66817724,0.67262100,0.67114016,0.67556046,0.63934220,0.60633091,0.56333249,0.51535043,0.51055184,0.49823643,0.47948932,0.46407136,0.45954714,0.45646172,0.45158442,0.44281900,0.44120777,0.43510250,0.41495948,0.39567846,0.41112254,0.42029409,0.42649431,0.43818149,0.41037935,0.37817695,0.35728478,0.33681808,0.30461747,0.27001477,0.22762917,0.18590363,0.22928177,0.26621885,0.30458824,0.33523997,0.34180129,0.34308645,0.34065710,0.33501235,0.37542546,0.41960046,0.45910797,0.49537351,0.54168754,0.58396751,0.62155532,0.66361148,0.64670288,0.63052140,0.59901427,0.57064120,0.51255895,0.44841316,0.38583755,0.31917617,0.35569348,0.39574958,0.43182063,0.46657700,0.47355272,0.47997649,0.50067418,0.52184766,0.54202198,0.56498755,0.58194898,0.60070905,0.67056380,0.74053390,0.81080289,0.87839546,0.84403539,0.81587496,0.78191565,0.74216548,0.70005209,0.65820876,0.62174942,0.58716993,0.58807970,0.58097330,0.57654786,0.57195198,0.56097845,0.55757845,0.55011656,0.54633171,0.51130121,0.46958593,0.43671943,0.40049802,0.35266381,0.29887693,0.25526161,0.21946949,0.25394877,0.29482147,0.32529177,0.35687700,0.40407416,0.45878567,0.50063863,0.54602759,0.52006987,0.49077863,0.46356090,0.43417154,0.46212886,0.48313225,0.49277052,0.49960268,0.51813003,0.53647404,0.55955577,0.57831801,0.56509351,0.55351660,0.54032442,0.52406885,0.57320306,0.61917333,0.65909775,0.69555322,0.73083622,0.77078141,0.81113248,0.84529043,0.82386169,0.79591744,0.75879718,0.72082138,0.70185132,0.68324186,0.67013293,0.64902450,0.57464366,0.49950580,0.43592439,0.36904952,0.30993128,0.25358938,0.19299499,0.12554427,0.18559847,0.23994793,0.31184217,0.37529853,0.42357100,0.46716994,0.51905086,0.52144921,0.47568921,0.42713812,0.40160515,0.37576582,0.35108977,0.32257026,0.29640654,0.26988841,0.31130752,0.34915813,0.39056660,0.42463905,0.52378575,0.61878522,0.69399858,0.77447021,0.73762105,0.69739295,0.67467405,0.64272099,0.63205803,0.61471707,0.60250745,0.58115722,0.56798328,0.55708522,0.52279333,0.48680741,0.46369878,0.44090399,0.42428510,0.41246772,0.39098952,0.37495800,0.37266119,0.37412158,0.33987752,0.31436937,0.29128942,0.27028713,0.28234782,0.30063463,0.32244348,0.33643713,0.39305859,0.44129375,0.49773204,0.54929765,0.54070356,0.53217871,0.50662037,0.48038524,0.49757329,0.51654574,0.53154939,0.54047843,0.54579838,0.55100768,0.53834261,0.52467296,0.56445600,0.60616567,0.62777639,0.64452930,0.68765373,0.72354652,0.77215261,0.81608912,0.81675668,0.81666745,0.82199917,0.82478631,0.80132701,0.77494214,0.75369042,0.73523115,0.72732276,0.72218182,0.71709289,0.71969303,0.64134953,0.56702815,0.48957864,0.41765150,0.37616952,0.33998666,0.29116458,0.24660923,0.25612888,0.26738350,0.29890110,0.32748031,0.32868674,0.33051822,0.34344184,0.35454642,0.40888365,0.46361108,0.51007876,0.56137241,0.59586081,0.62753134,0.64163491,0.65442841,0.67857869,0.69628315,0.69722510,0.70825187,0.65881895,0.60971281,0.55388355,0.49806377,0.48395551,0.46750266,0.43904612,0.40960660,0.40347142,0.39232841,0.37768480,0.36148908,0.35873550,0.36122344,0.33270438,0.30353771,0.32806672,0.34079991,0.36451789,0.39081585,0.35978055,0.33344306,0.31315708,0.28863814,0.27120742,0.24948784,0.22561180,0.19266596,0.22891845,0.25618861,0.29937283,0.34340270,0.33775967,0.33183744,0.32548298,0.31139410,0.35492027,0.40445803,0.42817730,0.45402330,0.47896294,0.50709516,0.53251638,0.54895945,0.56068897,0.57309815,0.56756081,0.56816492,0.51846582,0.47611247,0.42247772,0.36467094,0.40593431,0.44685565,0.48872549,0.52716939,0.53402284,0.54733439,0.57506968,0.59993914,0.60607372,0.60993304,0.60961455,0.61157239,0.67694360,0.74522759,0.81281710,0.87902488,0.83287041,0.79677970,0.75792318,0.72450448,0.66085710,0.60351975,0.55817618,0.51369624,0.51669977,0.52559874,0.53050842,0.53921651,0.53162490,0.52620923,0.53641095,0.54955932,0.50933080,0.47625390,0.42194628,0.37615241,0.32660144,0.27957822,0.24495689,0.21214899,0.24445837,0.27480440,0.30574630,0.33869414,0.37448090,0.40897384,0.44091395,0.48158130,0.45847687,0.43420055,0.41169310,0.38140234,0.41316741,0.44454296,0.45235128,0.46426407,0.48791891,0.50897869,0.54194261,0.57084057,0.55579877,0.54037264,0.52378218,0.50518022,0.55731206,0.60907960,0.64755658,0.68036547,0.71346637,0.74095211,0.78753797,0.82477684,0.79862666,0.77931329,0.73966707,0.70719741,0.70221413,0.70251072,0.68483413,0.67276823,0.59870829,0.52486831,0.44353679,0.36847326,0.31755228,0.26426124,0.20753881,0.15557151,0.21652586,0.27721976,0.33180219,0.39642425,0.41982528,0.43798564,0.48160510,0.43174012,0.40789400,0.37738172,0.35964328,0.33995212,0.31517326,0.29135447,0.26163777,0.23384864,0.28392530,0.33266081,0.38424096,0.43583128,0.51718729,0.59890299,0.68213329,0.76062717,0.74461007,0.72218171,0.70571765,0.68439671,0.68496689,0.69024080,0.68906146,0.68456200,0.63874776,0.59706911,0.54196028,0.49361558,0.45851224,0.42791773,0.39188552,0.35291596,0.35048379,0.34300244,0.34619024,0.34266869,0.31306056,0.28489224,0.26199715,0.24351657,0.26750115,0.29666537,0.32010610,0.34299004,0.38848431,0.43148904,0.47025113,0.50561905,0.49391054,0.48125389,0.46806767,0.45577611,0.45408626,0.45240198,0.45637583,0.45777894,0.47782162,0.50264415,0.50689891,0.51212748,0.54987758,0.58688478,0.61100106,0.62824247,0.66712498,0.70141807,0.74436900,0.78496149,0.80109386,0.81413534,0.84095917,0.86111886,0.82439551,0.78150390,0.74369972,0.70674778,0.69014529,0.68053766,0.66097530,0.65011064,0.58158223,0.51846929,0.44838532,0.38220887,0.33108977,0.28726627,0.24256677,0.19562045,0.22010616,0.25123479,0.28172152,0.31310534,0.32533519,0.33260094,0.34179554,0.34934479,0.41179327,0.47455455,0.53038112,0.58768487,0.63308097,0.66962400,0.69583261,0.71813455,0.72246018,0.72656774,0.71534892,0.70203100,0.66348686,0.62075268,0.56661950,0.51365710,0.49526435,0.47200679,0.44718224,0.42478580,0.39807977,0.36919294,0.34497304,0.31618841,0.31684437,0.32120400,0.30592710,0.29189310,0.29399600,0.29897765,0.31216479,0.31920014,0.30495151,0.29710715,0.28895592,0.28507556,0.27249925,0.25674427,0.24006553,0.22450732,0.25106892,0.28340447,0.31534797,0.35038422,0.34043942,0.33079485,0.31920368,0.30752052,0.33527710,0.36619256,0.38894337,0.41258707,0.43426842,0.45742300,0.48461415,0.50685860,0.52168119,0.53289540,0.54056265,0.54797032,0.52875227,0.50649550,0.47307427,0.44331447,0.47278289,0.49537080,0.51814336,0.54184069,0.55915721,0.57790296,0.60656780,0.63219916,0.64357753,0.64952349,0.65068532,0.65659064,0.71428506,0.76578377,0.81845419,0.86999565,0.81559617,0.76888252,0.71246443,0.65299656,0.58879386,0.52856168,0.46466586,0.40229686,0.42138306,0.43908270,0.46136829,0.47880218,0.49577412,0.51465426,0.53034381,0.55061128,0.51206003,0.46826854,0.41205313,0.35662040,0.31037281,0.26260461,0.21632488,0.16978258,0.20742447,0.24070168,0.27623424,0.30815055,0.32749846,0.34601294,0.36041374,0.37290128,0.37411794,0.37317144,0.36824810,0.36537266,0.39228798,0.42135229,0.43376611,0.44790064,0.46693646,0.49073494,0.51227768,0.53304564,0.54135916,0.55296136,0.54961880,0.55231007,0.59469039,0.63546226,0.66756753,0.69925599,0.73104151,0.76535405,0.80386803,0.84190287,0.81608732,0.78805529,0.74940476,0.70836040,0.70122627,0.69701601,0.68389165,0.67081350,0.60077514,0.52852086,0.45979715,0.38212139,0.32402596,0.26583944,0.21008600,0.15216480,0.20581343,0.26041910,0.30841323,0.36161197,0.37974987,0.39226704,0.41661513,0.34683640,0.33916870,0.32794150,0.31863341,0.30956562,0.28355685,0.25762128,0.22856688,0.20264969,0.26372187,0.31782813,0.38572475,0.45039320,0.52043168,0.58402028,0.66633260,0.74337121,0.74647457,0.74877326,0.73541955,0.71958435,0.74015162,0.76921420,0.77766281,0.78503314,0.71061462,0.63552399,0.56585348,0.49788549,0.45559352,0.41584719,0.35707661,0.30115178,0.30469347,0.31130904,0.31469924,0.31968051,0.28939839,0.25766978,0.23575715,0.21499574,0.24945690,0.29038307,0.31286455,0.34531812,0.37720321,0.42014510,0.43636859,0.45789504,0.44806244,0.43160669,0.43079145,0.43067834,0.40750494,0.38342703,0.37850037,0.37493394,0.41205703,0.45420102,0.47406908,0.49165465,0.53413395,0.57251487,0.59179285,0.61230420,0.65154294,0.68204227,0.71930442,0.75430730,0.78832578,0.81813216,0.86248179,0.90304670,0.84836118,0.79627821,0.74080140,0.68302399,0.65910324,0.63515853,0.60621199,0.57579226,0.52523183,0.46737976,0.40993657,0.34740307,0.29031907,0.23039577,0.19097005,0.14406430,0.18591428,0.22748616,0.26420347,0.30491675,0.31995203,0.33782507,0.33649592,0.34156289,0.41365789,0.48232248,0.54859302,0.61753709,0.66945268,0.72176975,0.74863142,0.77559168,0.76484078,0.75479440,0.72623861,0.69944656,0.66537880,0.63295489,0.58128795,0.52900181,0.50521229,0.47491698,0.45410470,0.42973084,0.39072843,0.34316851,0.30984824,0.27677718,0.27705516,0.28407914,0.27968617,0.27769662,0.27011381,0.25535886,0.25050178,0.24078754,0.25075270,0.25395591,0.27104940,0.28074397,0.27253155,0.25952880,0.25182039,0.24897991,0.27865927,0.30369883,0.32925899,0.35458349,0.34434267,0.32888589,0.31337068,0.29478485,0.31117059,0.32758918,0.34946460,0.37037964,0.39328971,0.40909011,0.43605801,0.46905674,0.47959939,0.49277453,0.51409199,0.53157093,0.53012678,0.53838323,0.52567043,0.51462563,0.53447935,0.55006754,0.55118018,0.55358409,0.57886451,0.60424886,0.63336184,0.66406523,0.68271823,0.69732969,0.69578351,0.69451523,0.74234872,0.79438348,0.82363528,0.85708654,0.79887644,0.74230868,0.66114661,0.58052978,0.51471442,0.44867424,0.37078265,0.28848314,0.32216972,0.35858848,0.39018115,0.41980801,0.45983566,0.49828822,0.52756110,0.55562383,0.51100226,0.46173176,0.39267108,0.32824186,0.28673485,0.24104335,0.18091949,0.12337396,0.17235653,0.21508887,0.24191796,0.27577974,0.28153459,0.29013918,0.27955155,0.26488506,0.28998940,0.30446091,0.32639451,0.34244696,0.37481811,0.40574728,0.41629678,0.43186191,0.44884819,0.46259294,0.48533691,0.50007727,0.53283442,0.56287801,0.57576528,0.59362499,0.63078796,0.66169843,0.69179051,0.72518031,0.75250776,0.78631008,0.82037334,0.85626444,0.83084714,0.80026804,0.75649484,0.70925978,0.69824168,0.69025946,0.68307436,0.67594819,0.60586939,0.53807572,0.46757719,0.39895763,0.33755063,0.26975481,0.21441548,0.15458351,0.20311144,0.24840872,0.28937746,0.32750915,0.33416552,0.34548328,0.34793936,0.27558620,0.28000170,0.28743390,0.29050404,0.28964609,0.25932870,0.23554451,0.20718122,0.17699928,0.24428407,0.31160153,0.38024194,0.44308658,0.51968442,0.59402482,0.67533875,0.75118422,0.75403585,0.76456155,0.76088865,0.75432027,0.78742371,0.82287011,0.85170553,0.87948539,0.78147637,0.67778576,0.58562038,0.48519053,0.43722650,0.38813335,0.31970128,0.24662679,0.26485739,0.27490926,0.28438928,0.29528346,0.26331527,0.23268191,0.21043821,0.18702460,0.22294496,0.26274458,0.29359770,0.32995337,0.35682115,0.38795503,0.40230796,0.41692574,0.40611532,0.38907976,0.38509261,0.37867183,0.35276399,0.33383124,0.31038125,0.28296601,0.34247679,0.39141772,0.43918491,0.48237392,0.51578191,0.54701909,0.57666452,0.61202045,0.63743162,0.67111403,0.70247152,0.72843575,0.78012845,0.83301804,0.88961734,0.94706363,0.86989152,0.79505070,0.72107997,0.64487220,0.61837235,0.58930509,0.56104672,0.52565447,0.47409477,0.41689574,0.36288478,0.31195211,0.25651421,0.20281005,0.14896566,0.09853484,0.15673151,0.21495460,0.26103232,0.30956691,0.30992834,0.31609483,0.31847977,0.31516230,0.40222575,0.48117153,0.56516252,0.65404569,0.70316504,0.74857286,0.80342380,0.85505848,0.82157099,0.79249028,0.75120157,0.71212874,0.67458027,0.63103957,0.58222177,0.53712513,0.50908712,0.48575281,0.46386448,0.45013358,0.38243572,0.31772541,0.26370253,0.21049856,0.22635475,0.24278446,0.25658936,0.27208592,0.24928525,0.22829337,0.20676958,0.18032160,0.20443322,0.22294102,0.24561196,0.27162172,0.26792825,0.26798510,0.26209767,0.26333313,0.29074292,0.32210686,0.35093482,0.38099712,0.36209641,0.34471150,0.31967300,0.30128005,0.30478967,0.31280226,0.32013039,0.31984319,0.34512300,0.37222981,0.39420115,0.41178433,0.43102626,0.45585277,0.47497985,0.50181768,0.52897121,0.55526969,0.57202205,0.59769240,0.59475804,0.59582725,0.58582736,0.56861030,0.60672755,0.64190934,0.67779545,0.72135419,0.73084331,0.74311774,0.74830405,0.74707573,0.77449428,0.80433112,0.82974656,0.85464882,0.77986818,0.70161244,0.61925069,0.53138228,0.44773931,0.36183406,0.27439570,0.18830824,0.23607810,0.28368115,0.31932396,0.35328024,0.40699675,0.46133444,0.51336201,0.56303633,0.50762611,0.44474545,0.38296101,0.31741376,0.27379653,0.22518951,0.15727361,0.08724136,0.13001700,0.17569905,0.20824104,0.24295286,0.22665549,0.21471600,0.19212056,0.17171445,0.20752134,0.24680012,0.28181889,0.32742152,0.34992428,0.36947841,0.39268733,0.41634387,0.43112209,0.45029257,0.46214357,0.47402890,0.51916263,0.56543868,0.60129349,0.63936973,0.66521426,0.68992645,0.71102650,0.72770777,0.77015170,0.80987519,0.85038643,0.89699194,0.85048884,0.81159945,0.75932070,0.70930792,0.69904652,0.68855666,0.67579589,0.66609698,0.60655469,0.54575925,0.47839023,0.41711353,0.34813317,0.28061361,0.21310749,0.14034445,0.18666981,0.22669974,0.27176207,0.30779382,0.30623693,0.30226580,0.28845257,0.19664387,0.22267755,0.24888192,0.25570330,0.26388048,0.23704169,0.20951226,0.18342313,0.15227162,0.23063199,0.30501910,0.37186760,0.43862127,0.52629546,0.60950316,0.68217152,0.75354025,0.76556483,0.78377924,0.78435604,0.78619914,0.82746960,0.87371992,0.92434093,0.97971938,0.85334616,0.72601961,0.60266673,0.47604210,0.41809214,0.36146243,0.27858176,0.19615633,0.22036646,0.24269894,0.25936648,0.27719536,0.24144664,0.20086052,0.17750365,0.15179211,0.19728024,0.23761228,0.27514106,0.31461460,0.33745047,0.36170068,0.36440397,0.37009606,0.35840981,0.34794703,0.34011096,0.32777987,0.30636552,0.28388671,0.24086113,0.19569879,0.26687561,0.33307013,0.40046109,0.47475081,0.49396645,0.51641785,0.55991315,0.60376643,0.63297656,0.66025988,0.68294917,0.69954143,0.77934589,0.85324560,0.92372017,0.99799200,0.89573377,0.79104697,0.70291430,0.60583824,0.57986737,0.54804728,0.51040882,0.47344749,0.41949067,0.36761064,0.32401942,0.27804380,0.22450382,0.17188745,0.11453568,0.04853351,0.12244503,0.20060688,0.25493833,0.31357734,0.30607791,0.29472325,0.29344627,0.29412725,0.38701646,0.48358621,0.58291414,0.68905829,0.73267659,0.77580673,0.85009754,0.93054068,0.87941688,0.82993902,0.77705370,0.72583809,0.68022085,0.63125277,0.59030909,0.54763524,0.51640102,0.48985975,0.47759812,0.46651540,0.37867994,0.28612182,0.21672917,0.13850246,0.17569944,0.20644859,0.23218637,0.26520403,0.23148543,0.20702702,0.16228042,0.11630388,0.15501025,0.18804621,0.22364532,0.26404688,0.27447676,0.28107785,0.27815766,0.27213278,0.30274500,0.33605374,0.37387468,0.41062575,0.37975726,0.35712105,0.33040371,0.29805554,0.30152913,0.29908428,0.28524106,0.26767858,0.30118205,0.33872490,0.34603127,0.35393025,0.38400174,0.41202137,0.44205220,0.47482211,0.52386557,0.57245447,0.62239870,0.67555518,0.66068922,0.64500234,0.61512667,0.58413656,0.63329738,0.67236174,0.72202143,0.77428362,0.78405475,0.79604159,0.79220361,0.79935570,0.81048043,0.81700761,0.83706481,0.85849097,0.75743174,0.66519893,0.57204854,0.48229221,0.38053057,0.27550982,0.18107904,0.08120378,0.14682859,0.21238057,0.25086898,0.29003103,0.35476558,0.41894967,0.49463736,0.57072629,0.49962261,0.43168058,0.36905737,0.30523553,0.25246269,0.20731348,0.13043600,0.04908158,0.09331307,0.13775871,0.17008400,0.20738431,0.17408943,0.14775106,0.11352387,0.07570792,0.13102396,0.18081431,0.24462673,0.30660101,0.32504242,0.33720161,0.36719766,0.39658239,0.41171779,0.43124411,0.43608124,0.43932060,0.50812569,0.57453113,0.62825494,0.68441087,0.70239442,0.72504520,0.72438019,0.73163532,0.78234411,0.82752633,0.88143392,0.93394968,0.87574208,0.82243044,0.76548658,0.71072855,0.69496995,0.68045837,0.66926251,0.66407835,0.60944341,0.55185115,0.48945914,0.43527531,0.36182481,0.29185298,0.21012654,0.12671983,0.17140066,0.20733317,0.24747541,0.29534578,0.27572331,0.25931069,0.22722903,0.26152189,0.27002269,0.28168330,0.28065944,0.28597896,0.26052024,0.22796147,0.21051146,0.18522944,0.25312501,0.32506858,0.38671774,0.44616081,0.51712699,0.59167354,0.66332665,0.73427061,0.73480238,0.73552625,0.73140645,0.73167304,0.75822039,0.78262734,0.80624111,0.83387194,0.74523856,0.65241748,0.55534558,0.45699745,0.40849717,0.36352560,0.30069811,0.23512437,0.25766545,0.27942677,0.30486226,0.32850633,0.30617899,0.27944394,0.25812145,0.23571689,0.27721532,0.31959332,0.35405709,0.39229085,0.41044171,0.42848851,0.43163429,0.43163335,0.42512508,0.41621446,0.40238747,0.38625817,0.35063132,0.31521469,0.28277125,0.25070812,0.29828724,0.34142329,0.39102342,0.43674865,0.46738747,0.49615155,0.53324524,0.57729965,0.59900157,0.62282314,0.64601759,0.67188297,0.74062151,0.81176322,0.87670642,0.93670323,0.86167910,0.79183249,0.71169270,0.63551251,0.60236652,0.56637142,0.52740549,0.49069685,0.44535620,0.40567380,0.36323643,0.32192583,0.27258947,0.21822938,0.16460914,0.11261321,0.16743026,0.21790107,0.25913628,0.29547341,0.29836303,0.30247439,0.30874374,0.31932797,0.39729705,0.46815663,0.54701724,0.62110635,0.66908686,0.72157685,0.78068786,0.83782986,0.79140738,0.74394989,0.69917838,0.64954499,0.62059027,0.58680951,0.56399370,0.54256145,0.52199376,0.49228778,0.47676306,0.46198852,0.40104352,0.34085586,0.28510759,0.24013210,0.25309065,0.27152634,0.28002075,0.29674898,0.26916193,0.24387506,0.20548045,0.16724773,0.20151316,0.24416361,0.27247667,0.29801034,0.31919972,0.33209384,0.33847409,0.34233453,0.35014124,0.36329446,0.38388029,0.41086342,0.37029381,0.33270873,0.30175058,0.27554786,0.27759158,0.28619966,0.28384489,0.27944538,0.29205667,0.31116126,0.30985579,0.30718747,0.34218806,0.38080754,0.41923895,0.45447620,0.50826853,0.56346726,0.61947440,0.66722396,0.65895219,0.65603345,0.64696012,0.63540588,0.66071357,0.68412322,0.71993257,0.75153546,0.76660607,0.77457699,0.76603632,0.76095923,0.78242172,0.80360477,0.82413957,0.84331174,0.76096583,0.67236104,0.58450677,0.49671363,0.40466879,0.30425517,0.20798052,0.10803551,0.16840517,0.23949874,0.29179565,0.34171750,0.40600124,0.46061285,0.52395483,0.58932436,0.52878874,0.47206829,0.41222280,0.35155845,0.29361143,0.22819981,0.15809452,0.08568678,0.11813254,0.15456864,0.18043818,0.20608214,0.19082151,0.17038728,0.15915685,0.15107740,0.17866233,0.21180817,0.25598695,0.30155409,0.31796967,0.33796481,0.36465079,0.39185261,0.40283259,0.42066197,0.42844271,0.43194463,0.48019677,0.52720712,0.56674724,0.61468760,0.63030166,0.65147066,0.66942360,0.68633157,0.72910679,0.76842979,0.80276313,0.84036929,0.78925598,0.74207930,0.69217208,0.64637561,0.63033820,0.61601204,0.60331085,0.59364128,0.55694418,0.51547298,0.47065325,0.42106348,0.36200428,0.30261545,0.24662640,0.18607596,0.22275000,0.25619837,0.28261451,0.30869524,0.30129680,0.29303165,0.27841554,0.32248132,0.32079247,0.31340366,0.31453933,0.30722445,0.28160191,0.24742903,0.23314610,0.22162442,0.27947662,0.34695750,0.39679155,0.44638982,0.51138785,0.57050750,0.64133983,0.71758028,0.70064212,0.68871020,0.67927866,0.66980617,0.68434863,0.69049620,0.68998198,0.68690210,0.63531912,0.58509760,0.50811500,0.43567485,0.40408619,0.37240268,0.32112825,0.27286747,0.29340209,0.31260855,0.34632850,0.38251821,0.36743941,0.35378969,0.33784180,0.31547104,0.36124909,0.40622109,0.43688260,0.46983588,0.48552086,0.49912039,0.49431553,0.49558029,0.48826100,0.48493818,0.45772431,0.44080600,0.39526841,0.35273710,0.32829555,0.30768939,0.32652958,0.35536954,0.37448902,0.39750805,0.43150289,0.47029654,0.50987487,0.54625635,0.56458481,0.58162775,0.61354994,0.64233457,0.70464564,0.77121082,0.82664317,0.87549546,0.83532700,0.79763605,0.73041458,0.65962151,0.62292794,0.58380959,0.54458684,0.50907047,0.47228283,0.44195072,0.40426511,0.36916829,0.31743305,0.26344363,0.21915247,0.16819918,0.20311835,0.24386294,0.26134448,0.28405736,0.29444372,0.30911901,0.32909086,0.34877343,0.40421782,0.45857716,0.50865667,0.55661720,0.61069818,0.66443279,0.70869535,0.75480726,0.70301869,0.65354182,0.61621767,0.57529703,0.56248983,0.54209831,0.54015631,0.53984849,0.52113061,0.49905368,0.47672442,0.45667870,0.42207062,0.38519556,0.35800697,0.33626455,0.33766190,0.33685031,0.32815503,0.32602006,0.30020793,0.27940144,0.24614259,0.20939406,0.25729280,0.29942089,0.31509123,0.33261508,0.36497718,0.39329389,0.39712115,0.40974689,0.39913978,0.38828040,0.39970887,0.41192134,0.36062804,0.31506060,0.28194221,0.25189727,0.26346075,0.27732135,0.28127211,0.28326030,0.28078457,0.28030776,0.27435281,0.26053186,0.30594387,0.34820564,0.39243946,0.42779840,0.49410605,0.56200332,0.60606586,0.65766763,0.66254591,0.66740487,0.67050742,0.67998731,0.68508813,0.69596727,0.71590170,0.73242882,0.74321461,0.75840272,0.73974709,0.72595120,0.76175615,0.79206076,0.81024017,0.82497477,0.75315526,0.68541875,0.60028919,0.51227840,0.42780349,0.33710547,0.22983559,0.12754389,0.19882239,0.26156019,0.32743112,0.39409762,0.44852292,0.50661153,0.55916336,0.60730364,0.56400332,0.51613983,0.45644249,0.39563257,0.32897691,0.25164619,0.18883057,0.12100036,0.14700523,0.17592964,0.19362726,0.21212904,0.20143849,0.19076527,0.20242021,0.21895562,0.23212456,0.23955643,0.26689125,0.28957203,0.31747941,0.34172474,0.36421064,0.38269170,0.39538177,0.41092875,0.41649981,0.42249101,0.45108990,0.47681178,0.51102241,0.54008029,0.55814401,0.58006618,0.61240053,0.63625166,0.67459316,0.71201564,0.72895932,0.74957531,0.70694527,0.65834509,0.62106356,0.58418090,0.56570018,0.54301688,0.53838773,0.52825003,0.50084915,0.48088674,0.44682054,0.41292025,0.36246708,0.31741489,0.28033824,0.24448923,0.27470961,0.30037133,0.31758453,0.32824369,0.32644970,0.32188388,0.32136301,0.38387899,0.36830086,0.35716798,0.35640610,0.34885926,0.31775180,0.29131843,0.26768887,0.24276157,0.29851619,0.35607194,0.41217981,0.46732753,0.51105115,0.56192228,0.62885775,0.69284960,0.67740918,0.65692453,0.64380435,0.62446322,0.61370025,0.60287160,0.58178927,0.56400013,0.52481324,0.49438273,0.44759645,0.40568033,0.38497749,0.36749353,0.33663938,0.30755384,0.33626403,0.36374081,0.38861402,0.41879187,0.41580397,0.41592106,0.40981669,0.40689119,0.43916523,0.47211707,0.50670979,0.54358354,0.54962803,0.55841739,0.56354618,0.56571930,0.54557137,0.52316144,0.50763689,0.48948273,0.44611589,0.40713349,0.37749105,0.34837069,0.34842283,0.34806102,0.34416890,0.34352083,0.38890673,0.43513407,0.47834444,0.52769016,0.54799714,0.57082160,0.59208127,0.61811178,0.67087718,0.72955323,0.77608445,0.82786444,0.79983662,0.77685744,0.73942286,0.69644159,0.65686178,0.61187437,0.56612527,0.51574201,0.48939551,0.45833916,0.43106414,0.40715576,0.35718563,0.30985520,0.27913924,0.24257284,0.25748486,0.26407330,0.26687722,0.27114313,0.29081826,0.31544554,0.33852085,0.35430718,0.39790601,0.44135626,0.47729844,0.51647082,0.55568645,0.58799826,0.62552484,0.65983264,0.62031017,0.58444977,0.54948228,0.51524462,0.52020115,0.52261444,0.52591932,0.52930116,0.51248263,0.49811457,0.48751418,0.47542860,0.45485241,0.43370577,0.42449077,0.40920780,0.40287074,0.39385457,0.38027798,0.36426045,0.33690164,0.31562693,0.28939789,0.25779299,0.29156809,0.32423224,0.35457856,0.37808349,0.40877455,0.43720601,0.45779358,0.48246750,0.45300835,0.43137101,0.42503755,0.41503525,0.35383964,0.29821968,0.25202300,0.19890493,0.22166976,0.25075677,0.26966165,0.28834536,0.28078504,0.26330993,0.23874914,0.22070016,0.27370689,0.32197962,0.36590265,0.40785085,0.47467455,0.53991307,0.59996775,0.66318352,0.67185322,0.67872599,0.69972790,0.71313148,0.71738181,0.71725598,0.71908822,0.71980269,0.72508731,0.73281912,0.71565338,0.70649667,0.73786442,0.76646294,0.79913572,0.82867702,0.75579006,0.68665255,0.61541743,0.54411412,0.45197767,0.35813235,0.25118495,0.14783355,0.22273538,0.29145197,0.37084755,0.44589141,0.49509260,0.54330338,0.57769141,0.61842733,0.58146574,0.54059925,0.49870491,0.45791415,0.37871639,0.29774813,0.22394000,0.14904144,0.16860865,0.18114844,0.18690196,0.19186475,0.21163378,0.23310251,0.25020670,0.27029867,0.27881021,0.28141856,0.28389018,0.29100708,0.31606267,0.33945414,0.35742370,0.37767840,0.38162509,0.38610439,0.39436783,0.40498112,0.42268716,0.44597724,0.45385768,0.46990592,0.50118754,0.53734186,0.56446896,0.59526678,0.61568968,0.64030293,0.65281755,0.66620957,0.62990740,0.58489590,0.54588983,0.50122097,0.48814903,0.47700918,0.47052438,0.46509073,0.45100279,0.43461399,0.41168098,0.38127957,0.36240594,0.33757353,0.31766644,0.29981895,0.31434513,0.33010432,0.34852070,0.37007435,0.36890283,0.36216929,0.36988583,0.44141812,0.42337401,0.40416250,0.39584740,0.39559911,0.36224327,0.33080733,0.29737497,0.27145101,0.32134669,0.36789276,0.42204179,0.48483986,0.51932508,0.54962065,0.61273809,0.67668882,0.65255680,0.62805004,0.60386143,0.57837775,0.54770114,0.51908781,0.47784817,0.43007818,0.41720092,0.40183863,0.38695154,0.36875922,0.36662357,0.36209657,0.35001658,0.33614678,0.37449309,0.40894489,0.43520634,0.46441856,0.47210289,0.47631879,0.48746654,0.49339273,0.51963782,0.53835618,0.58252268,0.62074594,0.62124602,0.62364416,0.62832486,0.62991951,0.59652848,0.56548287,0.55921900,0.54764046,0.49947959,0.45632708,0.42221402,0.39135565,0.36597423,0.34434542,0.32067079,0.29138343,0.34650977,0.39311243,0.44798235,0.50659077,0.52978144,0.55949926,0.57781476,0.59297111,0.63979376,0.67917649,0.73136133,0.77904694,0.76676138,0.75786825,0.74637447,0.73666671,0.68744309,0.64551713,0.58222884,0.52526135,0.50440237,0.47789577,0.46488278,0.44819083,0.40631668,0.35974406,0.33803072,0.31741637,0.30186800,0.29577545,0.27305137,0.25699827,0.29000049,0.32439820,0.34482744,0.36980999,0.39366715,0.42550984,0.44842077,0.47998651,0.49912001,0.51259535,0.54333940,0.56861382,0.54057487,0.50986792,0.48225881,0.45485465,0.47345206,0.49471200,0.51262902,0.52874578,0.51076467,0.49600185,0.49621341,0.49417625,0.48708664,0.48422515,0.48690506,0.48212957,0.46724891,0.45124249,0.42483627,0.40149699,0.37522222,0.34768042,0.32604274,0.30544886,0.32876256,0.35054042,0.39109596,0.42284032,0.45494215,0.48385648,0.51509031,0.55260226,0.51383538,0.47352735,0.44742022,0.41836078,0.34916712,0.28711133,0.21344139,0.14307150,0.18795905,0.22535708,0.26371417,0.29822019,0.27225788,0.25185421,0.21486971,0.17195421,0.23689901,0.29604475,0.33826725,0.38625301,0.45397466,0.52307769,0.59514532,0.66796852,0.67917645,0.69182496,0.72058325,0.75560548,0.74450932,0.73863605,0.72495642,0.70863131,0.70730098,0.70657154,0.69600387,0.67968574,0.71317497,0.74357381,0.78739314,0.82809104,0.75508971,0.68850307,0.63236855,0.58243997,0.47563106,0.37561129,0.27019178,0.15822889,0.24375680,0.32547150,0.40944994,0.49489363,0.53444525,0.57715721,0.60234701,0.62683359,0.59785403,0.56137854,0.54391547,0.52328078,0.43243177,0.34380824,0.26288781,0.17812843,0.18404100,0.19743556,0.18915622,0.17752048,0.22553258,0.27243393,0.30067506,0.32468294,0.32364790,0.32106956,0.30619124,0.28862408,0.31872068,0.34407515,0.35932980,0.37578292,0.37031389,0.36112110,0.37368562,0.38597034,0.40277070,0.41515629,0.40090622,0.38978375,0.44314077,0.48900287,0.52045226,0.55143283,0.56649211,0.57830746,0.58001798,0.58782646,0.54658882,0.51039142,0.46909618,0.42276424,0.41607441,0.40998108,0.41163350,0.40690190,0.39539818,0.38958882,0.37417990,0.35720528,0.35782554,0.35672505,0.35576212,0.35157265,0.36147940,0.36388920,0.38414460,0.40985948,0.40628970,0.40248198,0.42492470,0.46970889,0.45318822,0.44150876,0.42158612,0.39962465,0.35877881,0.32311232,0.27891264,0.23810829,0.28579900,0.33408680,0.38575949,0.43988544,0.48193494,0.52974335,0.58313574,0.63958489,0.61033222,0.58355911,0.54915687,0.51655791,0.47276605,0.42988095,0.39251523,0.34627898,0.35166898,0.35154241,0.36037808,0.36235097,0.37521018,0.38865970,0.39920403,0.41085396,0.43716877,0.46452317,0.49190294,0.51122120,0.52346775,0.54085872,0.55318678,0.56670855,0.59549132,0.61734723,0.64195890,0.67394858,0.67643665,0.68209427,0.69728073,0.71584731,0.66660587,0.61935702,0.58707025,0.55745567,0.51465314,0.46783751,0.42930080,0.39601579,0.37141732,0.34725375,0.32510781,0.31167508,0.33476797,0.36125126,0.39503849,0.42967846,0.47258012,0.51578677,0.55062242,0.58105778,0.63086900,0.68752762,0.74753532,0.81080772,0.78807018,0.76529597,0.74093546,0.71272227,0.67748057,0.64491943,0.59867211,0.55263743,0.51529573,0.47749480,0.45697205,0.43554333,0.38965042,0.34408999,0.32261643,0.29736605,0.29717351,0.29416377,0.28658449,0.28000707,0.28866187,0.29993336,0.31780168,0.34006372,0.36198557,0.39323739,0.41699055,0.43384365,0.45324979,0.46538220,0.48943677,0.51766987,0.49059193,0.46776173,0.44533021,0.42498939,0.44310636,0.45134211,0.46826660,0.47527810,0.47505281,0.47912344,0.49301142,0.51098769,0.53130061,0.54808585,0.57407296,0.59890637,0.57093235,0.54370376,0.50664343,0.47506356,0.44767147,0.41622752,0.39641536,0.36883450,0.38374404,0.40243422,0.42562551,0.44822411,0.48169119,0.51247566,0.54947068,0.57611790,0.53012302,0.47849335,0.43259020,0.37923839,0.31347763,0.25601163,0.18284945,0.11793511,0.14912262,0.18320759,0.20975721,0.23373430,0.21614464,0.20596348,0.17925689,0.15386594,0.20801149,0.26103312,0.31830867,0.37324754,0.43409554,0.50177353,0.57279663,0.64373453,0.66210182,0.68278079,0.70603143,0.73544370,0.73463975,0.73680766,0.73420937,0.73206385,0.72765551,0.72263085,0.70774210,0.69486516,0.72867329,0.76203688,0.79932587,0.83432442,0.75846669,0.68294630,0.61995109,0.55628166,0.46377311,0.37942028,0.28660063,0.20070617,0.28209883,0.36379806,0.45062471,0.52917097,0.58175048,0.63259685,0.67545123,0.72410722,0.66051055,0.60406037,0.56095236,0.52435706,0.42981725,0.33517610,0.24785216,0.16073358,0.18233463,0.20339817,0.21125152,0.22006512,0.27209919,0.32306052,0.36211033,0.40341676,0.38348075,0.36589725,0.35165544,0.33106730,0.33161907,0.32893535,0.32693938,0.32928073,0.33598639,0.33905966,0.34702822,0.34929026,0.36340461,0.36911334,0.37539435,0.37341451,0.40685091,0.43922386,0.46676655,0.48865513,0.49348754,0.49486501,0.49431889,0.50395295,0.47010168,0.44568695,0.40705111,0.36828730,0.36005599,0.34737944,0.34488937,0.33653714,0.33642838,0.33700172,0.33523098,0.33565988,0.34698646,0.35739075,0.37070492,0.38458730,0.39084385,0.39555714,0.40852722,0.42561117,0.42933814,0.43488538,0.44869553,0.49820655,0.48544077,0.47532779,0.43960162,0.40114538,0.35922946,0.31243728,0.26192876,0.21281998,0.25292368,0.29272101,0.34507181,0.39449930,0.44797799,0.50027833,0.55089376,0.60171697,0.56636183,0.53794452,0.49702544,0.45243855,0.39691823,0.34169023,0.30695677,0.26598720,0.28190806,0.30257414,0.32836499,0.34879089,0.37750450,0.40846058,0.44831491,0.48536951,0.50163332,0.52624665,0.54222653,0.56366140,0.58323312,0.60019516,0.62510454,0.64274042,0.66951694,0.69627364,0.70815661,0.72654507,0.73461711,0.73949495,0.76784000,0.79869190,0.73848955,0.67502201,0.62139478,0.56979045,0.52206211,0.48005299,0.43983516,0.39987639,0.37089095,0.34533470,0.33876038,0.32764800,0.32733676,0.32529356,0.34294164,0.35789442,0.41816717,0.47465975,0.52078006,0.57220851,0.63001185,0.68628152,0.76434184,0.83755851,0.80021974,0.76691789,0.73089285,0.68782654,0.66955722,0.64315677,0.61022940,0.57829070,0.53177792,0.47957759,0.44991793,0.42506708,0.37820672,0.33114892,0.30593019,0.27726549,0.28661461,0.29829875,0.29382868,0.29886436,0.28924827,0.27895616,0.29181940,0.30742179,0.33303800,0.36246047,0.37812028,0.39102922,0.40345268,0.41380803,0.43916916,0.46351080,0.43952351,0.41978479,0.40810788,0.39477448,0.40787863,0.41521914,0.41764543,0.42963515,0.44168167,0.45454508,0.49232235,0.52963724,0.57394033,0.61782261,0.66534198,0.71894957,0.67427162,0.63606430,0.58911056,0.54416116,0.51613955,0.48837464,0.46297084,0.43243389,0.44016776,0.44700916,0.46375789,0.47290230,0.50784603,0.54917598,0.57405161,0.60997756,0.54633000,0.48929857,0.41815850,0.34089709,0.28308888,0.21722197,0.15758773,0.08845046,0.11807461,0.14786213,0.15878396,0.17369810,0.16752404,0.15849511,0.14519040,0.13254991,0.18054156,0.22981577,0.29533222,0.35567969,0.41733914,0.47435262,0.54280446,0.61805596,0.64054498,0.67142760,0.69510243,0.71556374,0.73113492,0.74139114,0.74773687,0.75476894,0.75044664,0.73857234,0.72416681,0.70463382,0.74578922,0.78502470,0.80753147,0.83828464,0.75375094,0.66973958,0.60321725,0.53089808,0.45733467,0.38498533,0.30718390,0.23778510,0.32040255,0.40863106,0.48806177,0.56432335,0.62874360,0.69091839,0.75251063,0.81934286,0.73090572,0.63841083,0.58464127,0.52502265,0.42014311,0.32104653,0.23776995,0.14713753,0.17807221,0.20438665,0.23231241,0.25666206,0.31261038,0.37112865,0.42105249,0.48129765,0.44722445,0.41774707,0.39090322,0.37082388,0.34661901,0.31517694,0.30137696,0.27943855,0.29542779,0.31088706,0.31281635,0.31327570,0.32048341,0.32678703,0.34277780,0.35977845,0.37470675,0.39426996,0.40983238,0.42954957,0.41556416,0.40544334,0.41244920,0.41334789,0.39422934,0.38222349,0.34632880,0.31556050,0.29949091,0.28706914,0.27650936,0.26914117,0.27643180,0.28594987,0.30486802,0.32240925,0.33705505,0.35656619,0.38155915,0.41237683,0.41652534,0.42683932,0.43185938,0.43799265,0.45038178,0.46034389,0.47670582,0.52912391,0.51346342,0.49359886,0.46641541,0.43897069,0.38106147,0.32211333,0.25048907,0.17871512,0.23002849,0.27534250,0.32026858,0.36864676,0.42072469,0.46600909,0.51962951,0.56693930,0.52932622,0.48696227,0.44111903,0.39635582,0.33630744,0.27254687,0.21393158,0.15516037,0.20302291,0.25170366,0.29493045,0.33868206,0.39097640,0.43528959,0.49029320,0.53420520,0.55701689,0.57489921,0.58506308,0.59552949,0.62503586,0.66390390,0.70036194,0.74095954,0.75345075,0.75690652,0.76066895,0.76894716,0.78940268,0.80752399,0.84674609,0.88929815,0.81204585,0.73221886,0.65292862,0.57626439,0.53855598,0.49224222,0.44788651,0.39747627,0.37905873,0.36372524,0.34462633,0.32843478,0.31342904,0.29631807,0.29113490,0.28905354,0.35379315,0.42345135,0.48816147,0.55450933,0.62824154,0.69903578,0.77520203,0.85599862,0.80717412,0.76071139,0.72146986,0.68092784,0.66360677,0.65188800,0.62687515,0.60431844,0.54918769,0.49455035,0.44510019,0.38883664,0.36038674,0.33001699,0.29994122,0.26168381,0.27700778,0.29464702,0.30284972,0.31523338,0.30051859,0.28008901,0.27425965,0.27137782,0.29290959,0.31738964,0.34252874,0.36249522,0.36661708,0.37407817,0.38237259,0.39311660,0.38144223,0.37901966,0.36821184,0.36023965,0.36299307,0.36851416,0.36416151,0.36592626,0.40256361,0.44076698,0.48624017,0.52936314,0.59662191,0.66695357,0.74477716,0.82156904,0.76858949,0.71978778,0.66163734,0.59973057,0.57376908,0.54238475,0.51593001,0.48703720,0.49233129,0.49543058,0.49934127,0.50351900,0.53799597,0.57083117,0.60385443,0.62781723,0.55464782,0.48160290,0.39814575,0.32106831,0.25955516,0.19607701,0.12936017,0.06073919,0.07845428,0.10079257,0.10309670,0.10771099,0.10952629,0.10922256,0.10202089,0.09277867,0.14855682,0.20690124,0.26908362,0.33822899,0.39818712,0.45860495,0.52170700,0.58797232,0.62223213,0.65368346,0.68508269,0.72018468,0.73603582,0.74766052,0.76515344,0.78796179,0.77449346,0.76152688,0.74500272,0.72286526,0.75275733,0.78381028,0.81524223,0.84835316,0.75339411,0.66030924,0.57860298,0.49245589,0.44158424,0.38616740,0.31640755,0.25430420,0.34116047,0.43465965,0.52131014,0.60732537,0.67538686,0.74275221,0.81906544,0.89495545,0.79524095,0.69431870,0.60561386,0.50965368,0.42273399,0.33156608,0.22909564,0.13369364,0.18051844,0.22754029,0.26126956,0.28807269,0.35963237,0.42547964,0.48259884,0.53648349,0.50625713,0.46997662,0.43897164,0.40795289,0.36162858,0.32001822,0.28539994,0.24428615,0.25247076,0.26642128,0.27332386,0.28025704,0.29118172,0.29710570,0.31091033,0.32394690,0.33343848,0.34115920,0.34467200,0.34937135,0.34449586,0.33921148,0.34209430,0.33897980,0.31646893,0.29234584,0.26061884,0.23426168,0.22022577,0.20722697,0.19800628,0.18484083,0.21052494,0.23158876,0.25419443,0.27807629,0.31771785,0.35427432,0.39806279,0.44070579,0.44379902,0.44442523,0.44546547,0.43824462,0.46226068,0.48202156,0.50183328,0.56166523,0.53611466,0.51821782,0.49803438,0.47962564,0.40088862,0.32854289,0.23397298,0.14648281,0.20151426,0.25602142,0.30123688,0.34302390,0.38893852,0.42918568,0.48069719,0.53519613,0.48532379,0.43448581,0.38837004,0.34022138,0.26891296,0.20262614,0.12672236,0.04606094,0.12413921,0.19903727,0.26275639,0.32977691,0.39747639,0.46761022,0.53154263,0.59231614,0.60296464,0.62247523,0.62514939,0.62378443,0.67230949,0.71999316,0.77930666,0.84223316,0.83205897,0.82237641,0.81795765,0.80751983,0.84104623,0.87086896,0.92601136,0.98013788,0.88339788,0.78658236,0.68472560,0.58240894,0.55049337,0.51341324,0.45333843,0.39451410,0.38575866,0.38349508,0.35700166,0.33053966,0.29856912,0.26247981,0.23980919,0.21769233,0.29320097,0.36774945,0.45308665,0.53268995,0.61876957,0.71165891,0.78944963,0.87451690,0.81756166,0.75595191,0.71636431,0.67611058,0.66974852,0.65691938,0.63979546,0.62901904,0.56615104,0.51039358,0.43385049,0.35901196,0.34559652,0.33257554,0.29291600,0.24813832,0.26726460,0.28943556,0.31363050,0.33637313,0.30726955,0.27645911,0.25868945,0.23155386,0.25293568,0.27777150,0.30227268,0.32654607,0.33059500,0.33068942,0.32444592,0.31921632,0.32783899,0.33485109,0.33561929,0.33018157,0.32731086,0.31687454,0.31424280,0.30501065,0.36542213,0.42592490,0.47959509,0.52781602,0.62247302,0.71392417,0.82420535,0.93415457,0.86804399,0.80390710,0.72969221,0.66145053,0.63010524,0.59844308,0.57513435,0.54817953,0.54818294,0.54909838,0.53681194,0.52675785,0.56229506,0.59729719,0.62616624,0.65395051,0.56492397,0.46981481,0.38310734,0.29450331,0.23645659,0.16966985,0.10024399,0.02706256,0.04159513,0.05998575,0.04536212,0.03430467,0.04905899,0.06557441,0.06373742,0.05363672,0.11631828,0.17909373,0.25107141,0.31478154,0.37823687,0.43795275,0.49312717,0.55508530,0.59583072,0.63768960,0.68116170,0.72904705,0.74208347,0.75205963,0.78676034,0.82183795,0.79987305,0.78779597,0.76328424,0.74289085,0.76637617,0.78168208,0.82111524,0.85749179,0.74991671,0.64723668,0.55513061,0.45755367,0.42616759,0.39180814,0.33098753,0.26657942,0.36869377,0.46755253,0.55826210,0.64998694,0.72424122,0.79346192,0.88793254,0.97800902,0.86159251,0.75305983,0.62943333,0.50199465,0.42174499,0.33759564,0.22685163,0.11963913,0.18779313,0.25247283,0.28437074,0.32200415,0.40017167,0.48250617,0.53455120,0.59627860,0.55900065,0.52653669,0.47985173,0.44010517,0.38079022,0.31986152,0.26174713,0.20638340,0.21359951,0.21810191,0.23190132,0.24545604,0.25820137,0.26516118,0.27826520,0.28477153,0.28703592,0.28558512,0.28001480,0.27125080,0.27349446,0.27222380,0.26727484,0.25818808,0.23076834,0.20267916,0.17836834,0.15221311,0.14226475,0.12914710,0.11677123,0.09468255,0.14062934,0.18286550,0.21031455,0.23289175,0.29764661,0.35245898,0.41159728,0.46829828,0.46605466,0.46969687,0.45781904,0.44157973,0.47082228,0.49582684,0.53002789,0.60723368,0.58015703,0.56165721,0.53406375,0.50687346,0.43591776,0.36405598,0.29446613,0.22334881,0.25358461,0.29161136,0.32010635,0.34860439,0.39076865,0.42545194,0.47252067,0.52324382,0.48261021,0.44364126,0.40772958,0.36831714,0.30866326,0.25302963,0.18069903,0.10744158,0.18187890,0.24961778,0.31535664,0.37812610,0.42797651,0.47980413,0.53479894,0.58105457,0.59623137,0.60787342,0.61258291,0.61341723,0.64658828,0.68066618,0.71997953,0.76006954,0.76000474,0.75866046,0.74993986,0.74749057,0.79018815,0.82703300,0.87534398,0.92610332,0.84775969,0.76929962,0.68878590,0.60607894,0.55426061,0.50355077,0.45491124,0.40227815,0.40659429,0.41489000,0.39867255,0.39025902,0.36274424,0.33349862,0.31069580,0.27908302,0.34819262,0.41119501,0.48170652,0.55434908,0.62407333,0.69543875,0.76852927,0.85141223,0.79771246,0.74576681,0.71552807,0.68252113,0.65192454,0.63119979,0.59822363,0.56619076,0.52934540,0.48496434,0.44343656,0.39645510,0.38125849,0.36695459,0.32758066,0.29762845,0.31569378,0.32562826,0.33204150,0.34251151,0.32423573,0.30738888,0.30052406,0.28579417,0.30457275,0.32099355,0.33502640,0.34357126,0.36256637,0.37878571,0.38634096,0.39749062,0.38554097,0.37701077,0.36843508,0.35742112,0.34936419,0.33834626,0.33337436,0.32684983,0.38777214,0.44580755,0.49200057,0.54304160,0.63230365,0.72267638,0.82324035,0.92111223,0.86393142,0.81093210,0.75285732,0.69639157,0.66332060,0.62828171,0.60571001,0.57841477,0.57317165,0.57066812,0.56137995,0.55807140,0.58000571,0.59765171,0.62330425,0.64525100,0.57192786,0.49935372,0.41688168,0.34016987,0.28373900,0.22326117,0.15756659,0.09270784,0.10161153,0.11017613,0.09697465,0.08590575,0.09727780,0.11223738,0.11367948,0.11045875,0.16843031,0.22391028,0.28328857,0.34244109,0.39528150,0.44205666,0.48977360,0.54048822,0.57903202,0.61623036,0.66034424,0.70544141,0.71832519,0.73012184,0.74805133,0.76339790,0.74628881,0.73121076,0.71115980,0.69490275,0.70724817,0.72154638,0.75150269,0.78209866,0.71057624,0.63097004,0.57561537,0.50963956,0.46603487,0.42266942,0.37647967,0.33037882,0.40949760,0.48879499,0.57112648,0.65173610,0.70347388,0.76073348,0.82827448,0.90098051,0.81049804,0.71541454,0.61632728,0.51606467,0.44355718,0.37337405,0.27940997,0.19390600,0.24919305,0.31060720,0.34274408,0.37506883,0.43878237,0.50583053,0.56407496,0.62854585,0.58694047,0.55412667,0.51135509,0.46725769,0.42147280,0.37244467,0.33475437,0.28654372,0.28437850,0.27458264,0.27924099,0.28070139,0.28423946,0.28902360,0.29444354,0.30593024,0.30482335,0.30532115,0.29875738,0.28445054,0.28843131,0.28703527,0.28342716,0.28233163,0.26786791,0.24991791,0.24249615,0.23829245,0.23258201,0.22164997,0.22067278,0.21250352,0.23549470,0.26176516,0.27756198,0.29420570,0.32186556,0.34945466,0.38518965,0.42044512,0.44231337,0.46257719,0.46892659,0.47985624,0.51638352,0.54746678,0.57584907,0.65495221,0.62971994,0.60308166,0.56879203,0.53677616,0.46784820,0.40537756,0.34781741,0.29539229,0.30966564,0.32337921,0.33524288,0.35704214,0.38850260,0.42217048,0.46206374,0.50876977,0.47602408,0.44445108,0.42301706,0.39561864,0.34871052,0.29936581,0.23466367,0.16881220,0.23479775,0.29823274,0.36537691,0.42392211,0.46322758,0.49313559,0.53347677,0.57645130,0.58224269,0.59559818,0.59872682,0.59741789,0.61881889,0.63475179,0.66097541,0.67897931,0.69016529,0.69406474,0.69287952,0.68567972,0.73579612,0.78271814,0.82762167,0.88013150,0.81247533,0.74976512,0.68666667,0.62537120,0.56492665,0.49725436,0.45487229,0.41224741,0.42738548,0.44704563,0.44718300,0.45289823,0.42946254,0.40476787,0.37181502,0.34355803,0.39659263,0.45342528,0.51655536,0.58039501,0.62689731,0.67343732,0.75050366,0.83049936,0.78145127,0.73735805,0.71105537,0.68639784,0.64560589,0.60404421,0.55613524,0.50675641,0.48469268,0.46287996,0.45189704,0.43365076,0.41460010,0.39820707,0.36835137,0.34422370,0.35799905,0.36832264,0.35667855,0.34247969,0.34097815,0.34023285,0.34110004,0.34309010,0.35357215,0.36277909,0.36274034,0.36205980,0.39266190,0.42524259,0.44972536,0.48048494,0.44859143,0.41777169,0.40384924,0.38356414,0.37449566,0.35996165,0.35495765,0.35640593,0.40758566,0.46520213,0.51345512,0.55781258,0.64331267,0.73342265,0.82174404,0.90365066,0.86237247,0.81290336,0.77424058,0.73627496,0.69754354,0.65499081,0.63843688,0.61759146,0.60203908,0.58660349,0.58482085,0.58192611,0.59258141,0.59929294,0.62192419,0.64215530,0.58007433,0.52608838,0.45312336,0.38390175,0.32965298,0.27414916,0.21420020,0.15894848,0.15751383,0.16042361,0.14666477,0.13162041,0.14592753,0.16486818,0.16732887,0.17165658,0.21860996,0.27346578,0.31877314,0.36985843,0.41045742,0.44594973,0.48775852,0.52593513,0.56644813,0.59760228,0.63937804,0.68337721,0.69477609,0.70712196,0.70686553,0.70211919,0.69087186,0.67799954,0.66096074,0.64222927,0.65454742,0.66316780,0.68914410,0.71401431,0.66126234,0.61291972,0.59048164,0.56692482,0.51041723,0.45815956,0.43277517,0.39708111,0.45621736,0.50941587,0.58303328,0.65952406,0.69310743,0.72144774,0.77109727,0.81994604,0.75404483,0.68740275,0.60460520,0.53280986,0.46695351,0.41097875,0.33587170,0.26090245,0.31475297,0.36996581,0.39749067,0.43103696,0.47965659,0.52703983,0.59340238,0.65809827,0.61888871,0.57987109,0.53695743,0.49907201,0.46471208,0.42919442,0.39925298,0.37302489,0.34554878,0.32480891,0.31970678,0.31721946,0.31031547,0.30272146,0.31300021,0.32471179,0.32416469,0.32865712,0.31250778,0.29699008,0.29933821,0.30259013,0.30246433,0.30619128,0.29955351,0.29464715,0.30666349,0.31781796,0.31689353,0.31375778,0.32361505,0.32981485,0.33695522,0.33919957,0.34382737,0.34525625,0.34858755,0.34476103,0.36177918,0.37745264,0.41327934,0.45787499,0.48983001,0.52020150,0.55681968,0.60166236,0.62649370,0.70392025,0.67217828,0.64060054,0.59638745,0.55994587,0.50436011,0.44327111,0.40001171,0.34877813,0.34838495,0.34434554,0.33834903,0.33620094,0.37572724,0.40840973,0.45121461,0.48894061,0.47609523,0.47006354,0.45840082,0.44703838,0.39932470,0.34896015,0.28524368,0.22148375,0.28893743,0.36021048,0.42281437,0.48715907,0.50710987,0.52372709,0.54009128,0.56178686,0.57529228,0.58732579,0.58654169,0.58883611,0.59087793,0.59576185,0.60498217,0.61444326,0.61698100,0.62323787,0.62532213,0.62586504,0.67504328,0.72932247,0.77732405,0.82389561,0.77463610,0.72120392,0.68492147,0.64120365,0.57724416,0.51272892,0.46173532,0.41260700,0.43836803,0.46110787,0.48635206,0.50985065,0.48746192,0.45515346,0.42673202,0.40004020,0.44285026,0.48699453,0.53406401,0.58542670,0.62884683,0.68440909,0.73966932,0.79411992,0.76340226,0.73072983,0.70734771,0.68514937,0.62030717,0.55721953,0.50253993,0.43942170,0.44964086,0.46250432,0.47006732,0.47593115,0.46470882,0.44658068,0.41624816,0.39033187,0.38176492,0.38307776,0.36784831,0.35449530,0.36052741,0.36209265,0.37211634,0.37941082,0.38359382,0.39440733,0.38211855,0.37987749,0.42072830,0.46798416,0.51227109,0.55503803,0.51588973,0.47424222,0.44462467,0.41839311,0.40193110,0.38762636,0.36987712,0.35293830,0.41100500,0.46639285,0.51593243,0.56442177,0.65050050,0.73898675,0.82735940,0.91558459,0.87536704,0.83656037,0.80844523,0.77288965,0.73175549,0.68837887,0.66552891,0.63932230,0.62817443,0.61458453,0.61624674,0.61771732,0.61474856,0.61621178,0.61526941,0.61957618,0.57658711,0.53701130,0.49095878,0.44143159,0.38482048,0.32932252,0.27892027,0.22508236,0.21310447,0.20270569,0.18643400,0.17377169,0.18862128,0.19357487,0.20712520,0.21054524,0.25434009,0.29564685,0.35172120,0.40634558,0.43262886,0.46195888,0.48858283,0.52121604,0.55904903,0.59793634,0.63654500,0.67247583,0.67400644,0.67480521,0.66859980,0.66392535,0.65179072,0.63260513,0.60886218,0.58483046,0.59451022,0.61252121,0.62642833,0.64584847,0.62252996,0.60530895,0.60256775,0.60013549,0.55782167,0.51469277,0.48944629,0.46105453,0.50817465,0.55327423,0.60409268,0.65356759,0.67648014,0.69480014,0.72401981,0.76446374,0.70902135,0.65100645,0.58802743,0.52715422,0.48250059,0.44588507,0.38836144,0.32551117,0.37359522,0.42378445,0.45228752,0.48144738,0.52599048,0.56749924,0.62682830,0.67833658,0.63794927,0.59878282,0.55758636,0.51669522,0.49485547,0.47778677,0.45524489,0.43670297,0.40338711,0.37269444,0.35281625,0.33662926,0.33700044,0.34202621,0.34403708,0.35019035,0.34713016,0.34123043,0.33563331,0.32472246,0.31798330,0.31257350,0.31023933,0.30159001,0.32820367,0.35178398,0.38947533,0.42052842,0.41714718,0.42164304,0.42875533,0.43372603,0.42600375,0.41842808,0.41319274,0.40488177,0.37863224,0.35607842,0.33372446,0.31870324,0.37826449,0.43647776,0.49856796,0.55349396,0.59222851,0.63391163,0.67244582,0.75534997,0.71333615,0.67817045,0.62587567,0.58353561,0.53647653,0.48410688,0.44398825,0.40808735,0.38378499,0.36130373,0.34103580,0.31462656,0.35851751,0.39605025,0.43339332,0.47266930,0.48149258,0.49337058,0.49324025,0.50253130,0.44929880,0.39706696,0.33334985,0.26997233,0.34586316,0.41442688,0.48232064,0.55456384,0.55216140,0.54758976,0.54773624,0.54264245,0.55939817,0.58102240,0.58133359,0.57678475,0.56669720,0.55452476,0.54980318,0.54380333,0.55047004,0.55663487,0.56172790,0.55706185,0.61821292,0.67048097,0.72163679,0.77680471,0.73464186,0.69642378,0.67564677,0.65832634,0.59101359,0.52101024,0.47017658,0.41053212,0.44168161,0.47339175,0.52286353,0.57602245,0.54532429,0.51301209,0.48279522,0.45072887,0.48736896,0.51967962,0.55292380,0.58485131,0.63362777,0.68693145,0.72861798,0.76534425,0.74879845,0.72984204,0.70611965,0.68475761,0.59814538,0.51584993,0.44933011,0.37531877,0.41716656,0.45802192,0.48929804,0.52511299,0.50676815,0.49418667,0.46319764,0.42800321,0.41258393,0.39374629,0.38061309,0.36118898,0.37328646,0.37846033,0.39942308,0.41911572,0.42153326,0.42644852,0.40781526,0.39068503,0.45379630,0.50971806,0.57098780,0.62956512,0.58200807,0.53031832,0.48732672,0.44575532,0.42888225,0.41709027,0.37959787,0.34552044,0.41291800,0.47162465,0.52012637,0.56798028,0.65687313,0.74380500,0.83744993,0.92718034,0.89423712,0.86515199,0.83584292,0.81418507,0.76520600,0.72436844,0.69447963,0.67074286,0.65793835,0.64200914,0.64878937,0.64836369,0.63853979,0.63510961,0.61517554,0.59372645,0.57595133,0.55022329,0.52198228,0.49988422,0.44254226,0.38715956,0.33978161,0.29107013,0.26430964,0.24413345,0.22986679,0.22134575,0.22886079,0.23207255,0.24037796,0.25543414,0.28701832,0.32241270,0.38126963,0.44025683,0.45559947,0.46886140,0.49085542,0.51630365,0.55354327,0.58954082,0.62999337,0.66852822,0.65672716,0.64742766,0.63398508,0.62707182,0.60559464,0.58825915,0.55692388,0.51975966,0.53861082,0.55468575,0.56297545,0.57274522,0.58215182,0.59653185,0.61453322,0.64004155,0.60223419,0.56712956,0.54801246,0.52571559,0.56000442,0.59403801,0.62172649,0.65498910,0.65543975,0.65842019,0.68381478,0.70354838,0.66272110,0.62225102,0.56824625,0.51821847,0.50220177,0.48263122,0.43417945,0.39027781,0.43706210,0.48250473,0.51094557,0.53557872,0.57052434,0.60690350,0.65745600,0.70577033,0.66564766,0.62308237,0.58259464,0.54055136,0.52950655,0.52642101,0.51950677,0.51049716,0.46091923,0.41605422,0.38790253,0.35563578,0.36786114,0.37718123,0.37823808,0.38316418,0.37296215,0.36008498,0.35645931,0.34845386,0.33541426,0.32647688,0.31168149,0.29529262,0.35736112,0.41342476,0.46545691,0.52133473,0.52296167,0.52498576,0.53263295,0.54373864,0.52255449,0.50455148,0.48305741,0.47073972,0.41551460,0.36261886,0.31024101,0.25607269,0.33818968,0.42479077,0.50516328,0.58877984,0.62902993,0.67501803,0.71599513,0.80024196,0.76012551,0.71495914,0.66015510,0.61224852,0.56234103,0.51225436,0.47655354,0.44157135,0.41950217,0.39490829,0.37164889,0.35831517,0.37575680,0.39184954,0.41574955,0.43581541,0.45318049,0.46804872,0.48297032,0.49988194,0.47375736,0.43950128,0.40086844,0.36343763,0.41026478,0.45388817,0.50650476,0.55786167,0.56517712,0.57174559,0.58458159,0.59349189,0.58629470,0.58611586,0.57680781,0.56765498,0.54768304,0.52394023,0.51200070,0.49748566,0.51229401,0.52930339,0.54494711,0.55623411,0.60361473,0.64868214,0.68954734,0.73157997,0.69480192,0.66289477,0.64409727,0.62770270,0.57752098,0.53191025,0.48565069,0.44893583,0.47708484,0.51024057,0.54420162,0.57323829,0.56449234,0.55289890,0.53814907,0.53007040,0.55791619,0.58946862,0.61552752,0.63943662,0.68382711,0.73130070,0.75615120,0.78697905,0.74923704,0.71171089,0.66424281,0.61674184,0.54093066,0.45970023,0.39498589,0.32963692,0.36667465,0.41298559,0.45175499,0.49310525,0.49962696,0.50118740,0.50155435,0.49801843,0.47956506,0.45480487,0.44360939,0.42652756,0.42724989,0.42765912,0.43361023,0.43842132,0.44082850,0.44483387,0.44419925,0.44152345,0.49853136,0.55289871,0.60763106,0.66382225,0.61585648,0.57106100,0.52117364,0.47151282,0.45828771,0.45080140,0.42529588,0.39122118,0.44474385,0.49490891,0.53994540,0.58377175,0.66306758,0.74198743,0.82955363,0.92415197,0.88416480,0.85168213,0.81009022,0.77733174,0.75127395,0.72417131,0.70524011,0.68416879,0.67115931,0.65667809,0.66211180,0.66196942,0.65622986,0.64960867,0.64118565,0.63665876,0.60598047,0.57074261,0.53699805,0.50885267,0.44969968,0.39700729,0.33670759,0.27871393,0.26864337,0.25272610,0.24377551,0.23647210,0.23473774,0.23556716,0.23292869,0.23022799,0.27444261,0.31929224,0.37021449,0.41917564,0.44439072,0.46825041,0.50446069,0.53927272,0.56297512,0.58774857,0.61235579,0.64213367,0.63329616,0.62910415,0.61612364,0.60341194,0.58153961,0.55746913,0.53600452,0.51145839,0.51262109,0.50841323,0.50982494,0.51377663,0.53307331,0.55554036,0.58053696,0.60207329,0.59910499,0.59666228,0.61152751,0.61601597,0.62802120,0.63430320,0.63955715,0.64678231,0.63842022,0.63139035,0.63420580,0.63612324,0.60546631,0.58045619,0.55315344,0.52524905,0.52148564,0.52042990,0.51143544,0.50346485,0.52646053,0.55438515,0.56209635,0.57671738,0.60444203,0.63412681,0.67696763,0.71335799,0.68241784,0.64479572,0.61252255,0.57295438,0.56615723,0.56557750,0.54470545,0.52993614,0.49117070,0.45184191,0.42564954,0.40057404,0.38873682,0.37706180,0.36270729,0.35400142,0.34987083,0.33979858,0.33957526,0.34297782,0.33569510,0.32528409,0.32047860,0.31606598,0.37370242,0.42745649,0.48564619,0.53854792,0.55639740,0.57869072,0.60493300,0.62697172,0.59210828,0.55499885,0.51711390,0.47541327,0.41181410,0.35562872,0.28946763,0.21949986,0.30430676,0.38427484,0.47230866,0.56055792,0.61826812,0.67081400,0.73939843,0.84827012,0.79825631,0.75452783,0.69551200,0.63603476,0.58337364,0.53323028,0.50355056,0.47746344,0.44756960,0.42119257,0.40505567,0.39227907,0.39190276,0.39071634,0.39763377,0.40006187,0.42380410,0.44083615,0.47605789,0.50299072,0.49432605,0.48997062,0.47190454,0.45441340,0.47467519,0.49584862,0.53431081,0.56708413,0.58295433,0.59579983,0.61505287,0.63511667,0.61473981,0.59125073,0.57692638,0.56437623,0.52719463,0.48923508,0.47426967,0.45385470,0.47407844,0.49805663,0.52681550,0.55512117,0.59318588,0.63294943,0.65718577,0.68589944,0.65665141,0.62631487,0.61240905,0.60172697,0.56712538,0.53502010,0.51133012,0.48209634,0.51081351,0.54528397,0.55481540,0.57105422,0.58024221,0.58921208,0.59745220,0.60422966,0.63162602,0.64933872,0.67109799,0.69101444,0.73695508,0.77858350,0.79113864,0.80317356,0.75188700,0.70409457,0.62485897,0.55214167,0.48335344,0.40500993,0.34256381,0.27781901,0.32518053,0.36572916,0.41795704,0.46288699,0.49281362,0.51716624,0.54616178,0.56792002,0.54369419,0.51633958,0.50121310,0.48916695,0.48379983,0.47966279,0.46864856,0.46170690,0.46628493,0.46769815,0.47856546,0.49420731,0.54299844,0.59072328,0.64260351,0.69374481,0.65616797,0.61876432,0.55314927,0.49447927,0.49094435,0.48729750,0.46321412,0.43972676,0.47480913,0.51276050,0.55690228,0.60302223,0.66663977,0.73198791,0.82751807,0.91940312,0.87468835,0.83709827,0.78791529,0.74134200,0.73049289,0.72186830,0.70940756,0.70160035,0.68476066,0.67136513,0.67711911,0.68242405,0.67004854,0.66519272,0.67323054,0.67822157,0.63377381,0.58906142,0.55273403,0.51258442,0.45598199,0.40554165,0.33494656,0.26875416,0.26652943,0.26657802,0.26105754,0.25189704,0.24657593,0.23703484,0.22116473,0.20556968,0.25807652,0.30955555,0.35258938,0.40281181,0.43211235,0.46150459,0.51205610,0.56619869,0.57994007,0.58945285,0.59979258,0.61475603,0.61460825,0.61071252,0.59206184,0.58238913,0.55697735,0.52854247,0.51765838,0.50613422,0.48441036,0.46479700,0.46464753,0.45911855,0.48395060,0.51362771,0.54030563,0.56591109,0.59974558,0.62636219,0.67057054,0.71130482,0.69411451,0.67333202,0.65697876,0.64592499,0.62012481,0.60011257,0.58578538,0.56889198,0.55347157,0.53338486,0.53202274,0.52742223,0.54729714,0.56048023,0.58986502,0.60995637,0.61842169,0.62660541,0.62104288,0.61823191,0.63917081,0.66524629,0.69509577,0.71912527,0.69857536,0.67209096,0.63706208,0.60446234,0.60630021,0.60525746,0.57890353,0.55620070,0.52047944,0.48559730,0.46978125,0.45379150,0.41074240,0.37386215,0.35019772,0.33136424,0.32504074,0.31744640,0.33172187,0.34296816,0.33097557,0.32398029,0.32785615,0.32917885,0.38709039,0.44876319,0.49968879,0.55736370,0.59522083,0.63710662,0.67383597,0.71062884,0.65920993,0.61323505,0.54407782,0.48017457,0.41078685,0.34858263,0.26663069,0.18387277,0.26709825,0.34470185,0.44435515,0.54012945,0.60199082,0.66960224,0.76195472,0.90010151,0.83884475,0.78034160,0.72638731,0.66699704,0.62134256,0.57862196,0.54125065,0.50422354,0.48087223,0.45550256,0.43996723,0.42383571,0.41150895,0.40313429,0.38639504,0.37674921,0.40538671,0.43324604,0.46955542,0.51495697,0.51639854,0.52445754,0.53192533,0.53804684,0.54539567,0.55262809,0.56467196,0.57545931,0.59846894,0.62671208,0.65532141,0.68100404,0.64507626,0.60648508,0.58111820,0.55123428,0.50532467,0.46318451,0.42380903,0.38891194,0.42799906,0.46074978,0.49816390,0.53472084,0.56390366,0.59931178,0.62651912,0.65098749,0.62775475,0.60271567,0.58595148,0.56945947,0.55483223,0.54034515,0.52847604,0.51402568,0.53531637,0.55438636,0.56865189,0.58175888,0.61311634,0.64884251,0.67019367,0.69655264,0.71611223,0.73039221,0.74649270,0.76337010,0.78139937,0.79975778,0.81715737,0.83697881,0.75747207,0.68326806,0.58328414,0.49339689,0.42992677,0.36183821,0.29610204,0.22190687,0.27351587,0.32997337,0.38771885,0.44019422,0.49140395,0.53839551,0.58789285,0.63855648,0.60856011,0.57851603,0.55771852,0.54178614,0.53137226,0.52456743,0.50946580,0.49625511,0.49627415,0.50027206,0.51103302,0.52415592,0.57974487,0.63559930,0.68804848,0.74518937,0.70008341,0.65291685,0.58268361,0.51248587,0.51729727,0.51483101,0.49744378,0.48262366,0.51167136,0.54247738,0.57112171,0.59231750,0.67205868,0.74413308,0.83021213,0.91577061,0.87136288,0.81951422,0.76308328,0.70542888,0.70616967,0.71231898,0.70963835,0.71302076,0.70254333,0.68809713,0.68262962,0.67637076,0.68733887,0.69411026,0.70817777,0.72693331,0.67709281,0.63061315,0.58814821,0.54819685,0.47448729,0.40307892,0.32155876,0.24054179,0.25600164,0.26915250,0.27846869,0.29362622,0.27205691,0.24540084,0.22141478,0.19301951,0.24151392,0.29250400,0.33358090,0.36886597,0.41750855,0.46696888,0.52726610,0.58479712,0.58869275,0.58672330,0.59457948,0.60377192,0.59297267,0.58208491,0.56103495,0.54868157,0.52788806,0.51025214,0.49782814,0.48611244,0.46100072,0.43138849,0.41189255,0.38774332,0.43509209,0.47423970,0.51063422,0.54831824,0.60564039,0.66333292,0.72669052,0.79508905,0.75078330,0.70798842,0.67184411,0.64138073,0.61071090,0.57274777,0.53573535,0.50326801,0.50882097,0.51445016,0.51473277,0.52218120,0.57418560,0.61995736,0.66905432,0.72202859,0.70772964,0.69589171,0.66785549,0.64793980,0.66873612,0.69078587,0.71574586,0.73922085,0.72069947,0.70673849,0.68125344,0.66342112,0.64259049,0.62587735,0.60569839,0.58308889,0.55583240,0.53042441,0.51164067,0.49453807,0.43721575,0.37632889,0.33150486,0.28849509,0.29787430,0.30008100,0.30879790,0.31694074,0.32255537,0.33011715,0.34417823,0.35633707,0.41813420,0.47775624,0.52506119,0.57399500,0.63762235,0.69556377,0.75530895,0.81073065,0.73902124,0.66164149,0.58259426,0.49810510,0.41708327,0.33288713,0.22664929,0.12911984,0.22016056,0.31051805,0.40226844,0.49843768,0.59963972,0.69503023,0.79957179,0.96048925,0.88335300,0.80765152,0.75269677,0.70108371,0.66174307,0.62470829,0.58061488,0.53353344,0.50690411,0.48492490,0.47572001,0.45977455,0.43607817,0.41195132,0.38132849,0.34812669,0.38468008,0.41631891,0.46977198,0.52374313,0.54599406,0.56325621,0.59067731,0.62312721,0.61712446,0.60739041,0.59472658,0.58464140,0.61941743,0.64901543,0.68552327,0.72697208,0.67177989,0.61509681,0.58133265,0.54125676,0.48924550,0.43920915,0.38274309,0.32371764,0.37617460,0.43125055,0.46869047,0.51229794,0.53867759,0.56645717,0.58973770,0.62079325,0.59781870,0.57880121,0.55832669,0.53371792,0.53613111,0.54119620,0.54488958,0.54318714,0.55101472,0.56246093,0.58171971,0.59439765,0.64720458,0.70559813,0.74281384,0.78941185,0.79699233,0.81328696,0.82087149,0.83246375,0.82750390,0.82378981,0.84724133,0.87250204,0.76238174,0.66086967,0.54629541,0.42673023,0.37685847,0.32365143,0.24781891,0.16811635,0.22801980,0.28716640,0.35783871,0.42013202,0.48776152,0.55547069,0.63861530,0.71524733,0.67624700,0.63298674,0.61597407,0.59327532,0.58010626,0.57364281,0.55115017,0.52750058,0.52826404,0.53299539,0.54166100,0.54965293,0.61288306,0.67831392,0.74106715,0.80072781,0.74035923,0.68643807,0.60577592,0.53100510,0.53896615,0.54382308,0.53226540,0.52383940,0.54721548,0.57307770,0.57690778,0.58561683,0.67361811,0.75317008,0.83372606,0.92125937,0.86129159,0.81024782,0.73596786,0.66739776,0.68299299,0.70001853,0.71331536,0.72956519,0.71078028,0.69822311,0.68505117,0.67638403,0.70103479,0.72905131,0.75050907,0.77030773,0.71931134,0.67749066,0.62754061,0.58186360,0.49557517,0.41199724,0.31612000,0.21748532,0.24353567,0.26782877,0.30250304,0.33602256,0.28992476,0.25064418,0.21925552,0.17866499,0.23256239,0.28068989,0.30773153,0.33368395,0.40464671,0.46983947,0.53727022,0.59938002,0.59455937,0.58840150,0.58994722,0.59313711,0.57217307,0.54993961,0.53232145,0.51502412,0.50485683,0.49834888,0.48507619,0.47260309,0.43509125,0.39733436,0.36179690,0.32115603,0.38410087,0.44179078,0.48133176,0.52521290,0.61572810,0.70091545,0.79205899,0.88165883,0.80641696,0.73508557,0.68759532,0.64379358,0.59371577,0.54696337,0.49253760,0.43393335,0.45756839,0.48703781,0.50276246,0.51753146,0.59623088,0.67744906,0.75735349,0.83521312,0.79624274,0.76593074,0.71799761,0.67171191,0.69041179,0.71001586,0.73474379,0.75861621,0.75260698,0.74517733,0.73091288,0.71669342,0.68213876,0.64796683,0.63498497,0.61483409,0.58888887,0.56765919,0.54902111,0.53736181,0.46140439,0.38324992,0.31969193,0.24859757,0.26790134,0.28394229,0.28921989,0.29194239,0.31761765,0.33581397,0.35506342,0.37733939,0.44336629,0.50721734,0.54770247,0.59425571,0.68095853,0.76388745,0.83327833,0.91054038,0.81246926,0.71537221,0.61351631,0.51727065,0.41718111,0.31849143,0.19600675,0.07232207,0.17030129,0.26947885,0.36544504,0.45879284,0.59036295,0.72306561,0.83671252,0.91822380,0.86138713,0.79825834,0.75513040,0.70489480,0.66200554,0.62348558,0.58231696,0.54063276,0.51472165,0.49373372,0.47577567,0.45636506,0.43298813,0.40536898,0.37385624,0.34778948,0.38541349,0.42817512,0.46828871,0.51341420,0.54738805,0.57696246,0.62359557,0.66590997,0.64314768,0.62428328,0.60236663,0.57950981,0.59995993,0.61637074,0.62437836,0.63583767,0.59965153,0.57196837,0.54407419,0.51663019,0.46162163,0.41377964,0.36550628,0.31364353,0.35728146,0.40015236,0.43918825,0.47489435,0.50897219,0.53364291,0.56420594,0.58882482,0.58806223,0.58322804,0.58096328,0.57351864,0.57412257,0.56997778,0.57510048,0.57654892,0.58239111,0.58754329,0.59706190,0.60368361,0.63821001,0.67006260,0.69839275,0.72137577,0.72249651,0.72947022,0.74437655,0.76120613,0.75260426,0.74107216,0.75648352,0.77296406,0.68643721,0.60542133,0.52258234,0.44075806,0.39102492,0.34975965,0.29338497,0.23524492,0.29138387,0.34648093,0.40024413,0.44910943,0.50662676,0.56488113,0.62403762,0.68873939,0.65643084,0.63337134,0.60921588,0.58932161,0.57534241,0.56445136,0.54147989,0.51782948,0.52862162,0.53587639,0.54026308,0.54883799,0.59709121,0.64784108,0.69191125,0.73613035,0.68904701,0.63784652,0.58959340,0.54166134,0.52248626,0.51101494,0.50178782,0.49750274,0.51872649,0.54101189,0.56050068,0.57398656,0.65303313,0.72535382,0.79336782,0.86268412,0.81853523,0.77299406,0.71805254,0.65289159,0.64852081,0.64800099,0.63833924,0.63469862,0.62829410,0.62259177,0.62633715,0.62745548,0.63961520,0.66086298,0.66864934,0.67659128,0.63896170,0.59544917,0.54670336,0.50334676,0.44293166,0.37602859,0.31162868,0.23874060,0.25608478,0.26894684,0.28712380,0.31087712,0.28414965,0.26348510,0.25491566,0.24129719,0.27700238,0.31470229,0.34375090,0.37322213,0.41654873,0.46299997,0.51326057,0.56022470,0.55941272,0.55643983,0.56646318,0.58107377,0.55246507,0.52973720,0.50790491,0.48699203,0.48837069,0.48424756,0.47703348,0.47217392,0.44702182,0.41951109,0.39645651,0.37184717,0.42378066,0.47267711,0.51449020,0.55219011,0.63294411,0.70993112,0.78941051,0.87336765,0.81371304,0.75736343,0.70696911,0.66233456,0.61357034,0.55960698,0.51314424,0.46038483,0.47574702,0.49309004,0.52255639,0.54481777,0.60678069,0.66693244,0.73294366,0.79938758,0.77098994,0.73857722,0.70074247,0.66976651,0.67676276,0.69046183,0.70494878,0.72714537,0.70766047,0.68402164,0.66427871,0.64506147,0.61663732,0.58186894,0.56731371,0.54957934,0.53642648,0.51444556,0.50983441,0.50208693,0.46086860,0.40960908,0.35799624,0.30460582,0.31576873,0.33500133,0.33337232,0.33544570,0.34623552,0.35365770,0.35883300,0.36810378,0.41797483,0.47070852,0.51847937,0.55938713,0.62978509,0.70535155,0.76548968,0.82752271,0.74595129,0.65891109,0.57123901,0.49060606,0.39744306,0.30820306,0.19651129,0.09053415,0.18525367,0.28812450,0.37615086,0.46787692,0.58185150,0.69521977,0.80488343,0.88389529,0.83345358,0.79142107,0.75532322,0.71724440,0.66937049,0.62133532,0.58375606,0.54695148,0.52256711,0.50368503,0.47857291,0.45450837,0.42258580,0.39063002,0.36923863,0.34173681,0.38806641,0.43991948,0.47340049,0.50937670,0.54721673,0.58657667,0.64742057,0.71050969,0.67093188,0.63554399,0.60851056,0.57610676,0.57526052,0.58169426,0.56102843,0.54599763,0.53330694,0.52271352,0.50730787,0.49621516,0.44267809,0.38360363,0.34409147,0.30096066,0.33952357,0.36720842,0.40700316,0.44230546,0.47538262,0.50802891,0.53503917,0.56111254,0.57595106,0.59570306,0.60273840,0.60771880,0.60305995,0.60262047,0.60888031,0.61157221,0.61232733,0.61582301,0.61351948,0.60938401,0.62391350,0.64074004,0.64622889,0.65217645,0.64741104,0.64423412,0.66780062,0.69145688,0.67165496,0.65720857,0.66998124,0.67646695,0.61418573,0.55056328,0.49938474,0.44913551,0.41208856,0.36928908,0.33789159,0.29688669,0.34804868,0.40470744,0.43916200,0.47572604,0.52972909,0.57817806,0.61531624,0.65476333,0.64427827,0.63096001,0.60724578,0.59041495,0.57052108,0.55445486,0.53035723,0.50620514,0.52479973,0.53414099,0.54121701,0.54704596,0.58052080,0.61648441,0.64014577,0.67129788,0.63607232,0.59744062,0.56842392,0.54534328,0.51321643,0.47791934,0.47739442,0.47101709,0.49356048,0.51693826,0.53330028,0.55641647,0.63134764,0.70388769,0.75732444,0.80554193,0.77828345,0.74653484,0.69214401,0.63864799,0.61281914,0.59125624,0.56657433,0.53729067,0.54108051,0.54675037,0.56171775,0.57157310,0.58249235,0.59629597,0.59000462,0.58963625,0.54862515,0.51225603,0.46972348,0.42895068,0.38569501,0.34720195,0.30465994,0.26538004,0.26459731,0.26824911,0.27803864,0.28290357,0.28297648,0.27481655,0.28738552,0.30402097,0.32469847,0.35201615,0.37974890,0.40602631,0.43082236,0.44931646,0.48618501,0.52558723,0.52563242,0.52085886,0.54440988,0.56970333,0.53987068,0.50999054,0.49027788,0.46163658,0.47065533,0.47409299,0.47693793,0.47983295,0.45670447,0.43306409,0.42565371,0.41957350,0.46365788,0.51160126,0.54197609,0.57781637,0.64797567,0.71197808,0.79209435,0.87015207,0.82422980,0.77149884,0.72239353,0.68172909,0.62811218,0.57714366,0.53374908,0.48871793,0.49391359,0.50210537,0.53669757,0.57048664,0.61596768,0.65538508,0.71668383,0.77134728,0.74246297,0.71468513,0.68632493,0.66245056,0.66454723,0.66511632,0.68002148,0.69509708,0.66057135,0.62364163,0.59884140,0.57756392,0.54922404,0.51614634,0.50015839,0.48633287,0.47451166,0.46466752,0.47322768,0.47421190,0.45780550,0.43936222,0.40150498,0.35783442,0.37180801,0.38165292,0.37592635,0.37456716,0.37549975,0.37035020,0.36141265,0.35175958,0.39114280,0.43251496,0.48274218,0.52944428,0.58677982,0.64671299,0.69843144,0.75163614,0.68075955,0.60130937,0.53487901,0.46131386,0.38591920,0.30958136,0.20129731,0.09670517,0.19977199,0.30366059,0.38411919,0.47250893,0.57156183,0.66946368,0.77573397,0.83922632,0.80604747,0.77402207,0.74389861,0.71581232,0.66856998,0.62547197,0.57870782,0.53841361,0.51818421,0.49389473,0.48367883,0.46815635,0.43211140,0.40317479,0.37587952,0.34870689,0.39065233,0.42573031,0.45667506,0.47850240,0.55000739,0.62041483,0.68833343,0.76580422,0.70758455,0.65311822,0.61208430,0.56361243,0.54308818,0.51770585,0.48767904,0.46330594,0.46534049,0.46593553,0.46399702,0.46707809,0.42348595,0.38128667,0.34436609,0.30312417,0.33356705,0.36222347,0.38961610,0.41292407,0.44522540,0.48007339,0.51068887,0.54463089,0.56335152,0.59244392,0.62002282,0.64476486,0.64317634,0.64389385,0.65243794,0.65645638,0.65199009,0.64758308,0.63177882,0.61795464,0.61780604,0.60988343,0.60067737,0.58657018,0.58867153,0.58753949,0.59881547,0.60994461,0.59738665,0.58055572,0.57478694,0.56520851,0.53985372,0.51819798,0.48484373,0.45905950,0.44033972,0.42109496,0.39484113,0.37291943,0.41254357,0.45156825,0.47281654,0.50057617,0.53512617,0.57623468,0.61378362,0.65715305,0.63359282,0.61590639,0.59996875,0.58081020,0.56503971,0.54990499,0.53001450,0.51270063,0.51712271,0.52629420,0.54047153,0.54748192,0.56102799,0.57016842,0.57946416,0.59491339,0.58034416,0.55952511,0.55001460,0.53975564,0.50634682,0.47485951,0.44916801,0.41741680,0.44687201,0.47279670,0.50066140,0.53307819,0.59460062,0.65358703,0.71431344,0.77400143,0.73618985,0.70575739,0.66401855,0.62531917,0.58574503,0.54335712,0.49316164,0.45019585,0.47274736,0.49155627,0.50346358,0.52374660,0.51941730,0.51985920,0.51624117,0.51232458,0.47677189,0.43038690,0.38360880,0.33821433,0.32264796,0.30913207,0.28593163,0.27205613,0.27099120,0.27099470,0.26667457,0.26078606,0.28146376,0.30132739,0.32528541,0.35311208,0.37734802,0.40413040,0.42697644,0.44347265,0.45246850,0.45397727,0.46702693,0.48200003,0.49565789,0.50440101,0.52465311,0.55176427,0.52755357,0.49684285,0.47512167,0.45447277,0.45256544,0.46239804,0.46388232,0.46985205,0.46895087,0.47270905,0.47776240,0.48952340,0.51682264,0.54098699,0.56838516,0.59340800,0.66872097,0.73859928,0.80812298,0.88557536,0.83304485,0.78108331,0.73962772,0.68866368,0.63935343,0.59433354,0.55066126,0.49988461,0.51556477,0.53433644,0.55202114,0.57429690,0.61738862,0.65719312,0.70292682,0.74879959,0.72197429,0.69785218,0.66173680,0.62724949,0.63717754,0.64324975,0.66775994,0.68654582,0.64051218,0.59062621,0.54707042,0.49791999,0.47890703,0.45948938,0.43894461,0.41801527,0.42299608,0.43530465,0.45225524,0.46778537,0.45769015,0.44195494,0.43417292,0.42608550,0.42265021,0.42304132,0.42143839,0.41872354,0.40134360,0.38769314,0.36480241,0.34270976,0.37371839,0.40743087,0.44991614,0.49045760,0.54004409,0.59050852,0.63643107,0.68637450,0.62332995,0.56603828,0.51086437,0.45495496,0.37400108,0.29670289,0.20813643,0.11884442,0.20861454,0.29020790,0.36839641,0.45379546,0.54706715,0.64191418,0.74076489,0.79357012,0.77934422,0.76325875,0.74035063,0.71767565,0.67481722,0.62961866,0.58242655,0.53589289,0.51218585,0.48724268,0.48864376,0.48408025,0.44187065,0.40670879,0.38441285,0.35808815,0.38471717,0.41916299,0.43642173,0.45201114,0.55052565,0.64934024,0.73008357,0.81833665,0.74519682,0.67507644,0.61643389,0.55470137,0.50906229,0.46096017,0.41792056,0.37235004,0.38816762,0.40696010,0.42460024,0.44098066,0.40779436,0.37458022,0.34281164,0.30904165,0.33091884,0.35785621,0.36681768,0.37873649,0.41703015,0.45415901,0.48477803,0.51982742,0.55270591,0.58737111,0.63677349,0.68547285,0.68672567,0.69204613,0.69849309,0.70645607,0.69208384,0.67753728,0.64949874,0.63046828,0.60385524,0.58687543,0.55518025,0.52005888,0.52432896,0.53065475,0.52734372,0.52461267,0.51694353,0.50692115,0.48005458,0.45293972,0.46540919,0.48304498,0.47258183,0.46069667,0.46390447,0.46880582,0.45354942,0.44226402,0.46710669,0.49723646,0.51322948,0.52969096,0.54766003,0.56956404,0.60934903,0.65609573,0.62483383,0.59813197,0.58747812,0.57839957,0.56281735,0.54858882,0.52846481,0.51387073,0.52046332,0.51857434,0.53754713,0.55203184,0.53964537,0.52086978,0.52341647,0.51513860,0.52205903,0.52525166,0.52644719,0.53326849,0.49725146,0.46936908,0.42159966,0.36782643,0.40574476,0.43413124,0.47077670,0.50378579,0.55481951,0.60554028,0.67297212,0.74165924,0.70182975,0.66073691,0.63838253,0.61397662,0.55016041,0.48950019,0.42903808,0.36176218,0.39470466,0.43112329,0.44918650,0.47163135,0.45653264,0.44797323,0.44560000,0.44064401,0.39901926,0.35483803,0.29805942,0.24576769,0.25828832,0.26752387,0.27117499,0.28014022,0.27709425,0.27585726,0.26014782,0.23733986,0.28688684,0.32736862,0.36513521,0.40137744,0.42678484,0.45161150,0.46741758,0.48699078,0.47294348,0.45298698,0.45177199,0.44485919,0.46023836,0.48155260,0.51090343,0.53695497,0.51170826,0.48739204,0.46151855,0.43884011,0.44526541,0.44251222,0.45604123,0.46438868,0.48541109,0.50396004,0.52634779,0.55794462,0.56133119,0.56791763,0.58923832,0.61364845,0.68650424,0.75944207,0.82733771,0.90137511,0.84599072,0.79762858,0.75152859,0.70148632,0.65671503,0.60961235,0.56086914,0.51919361,0.53548644,0.55963635,0.56673004,0.57367496,0.61697712,0.65911364,0.68834646,0.72174683,0.70220704,0.68433316,0.63493888,0.58867234,0.60955053,0.62217964,0.64794226,0.67455788,0.61793064,0.56372956,0.48932190,0.41923365,0.41589368,0.40890479,0.37882404,0.34649948,0.37080582,0.40063045,0.43096291,0.45943422,0.45583126,0.44744796,0.47281086,0.49089905,0.47418590,0.45975459,0.46252807,0.46396790,0.43215542,0.40828892,0.37008244,0.32766596,0.35518500,0.37738534,0.41233611,0.44835191,0.49317751,0.53478833,0.57955601,0.62275998,0.57014279,0.52167501,0.48629103,0.44905647,0.36118412,0.27895602,0.20912386,0.14014606,0.21417148,0.28130707,0.35714436,0.42907111,0.52154037,0.61256071,0.70441854,0.82652977,0.79569743,0.76516476,0.73340282,0.70199852,0.65018486,0.60520810,0.56028605,0.51794950,0.49026533,0.46647309,0.46028027,0.45321622,0.41592845,0.38047994,0.34688262,0.31126754,0.35625478,0.40339858,0.43376435,0.46500855,0.56108917,0.66279198,0.74739956,0.83616271,0.76628008,0.69458255,0.63153978,0.56730200,0.50072083,0.44185590,0.37833270,0.31695828,0.32683057,0.33441115,0.35105001,0.36473636,0.33907593,0.31317083,0.29620867,0.27095395,0.30515876,0.34195087,0.36584657,0.39014992,0.42399243,0.45729553,0.48199795,0.50425043,0.53761865,0.56227154,0.59872030,0.63577576,0.66317270,0.68661187,0.70495867,0.72210516,0.69641588,0.67012413,0.62922694,0.59021691,0.56893577,0.54492347,0.50407338,0.47063587,0.47954075,0.49540795,0.49069550,0.49759337,0.47367325,0.45856760,0.42804307,0.40348726,0.42478868,0.43605032,0.44783338,0.45397295,0.46896787,0.48180030,0.49456198,0.49895864,0.51254652,0.52315465,0.53222279,0.53959104,0.54271661,0.54970924,0.56813288,0.59254632,0.58389752,0.56490463,0.55917914,0.55436015,0.54745113,0.54150194,0.53012604,0.51908426,0.51793283,0.52087372,0.52703254,0.53096827,0.52458768,0.51014394,0.49141435,0.47523264,0.48022185,0.48549173,0.49194963,0.49786546,0.47467272,0.44691975,0.40929776,0.37144340,0.40749316,0.44562833,0.48165413,0.50921437,0.54854217,0.58997272,0.63563584,0.68189852,0.64481298,0.61162226,0.58921180,0.56393067,0.50555852,0.44281108,0.37629443,0.30989001,0.33313107,0.35523734,0.37652292,0.40054678,0.38265526,0.36095639,0.34651419,0.33704103,0.31081296,0.28692083,0.25838889,0.23519759,0.23924886,0.24396819,0.23928257,0.23676153,0.25625013,0.28086195,0.28226952,0.28784901,0.33337851,0.37008625,0.41213890,0.45473539,0.46132629,0.46812835,0.46345013,0.46207752,0.44718748,0.43320320,0.41217875,0.39272666,0.41971672,0.44912956,0.48475587,0.51928133,0.48879866,0.46444938,0.44930944,0.43060390,0.43082032,0.43939970,0.44677887,0.46052779,0.48251348,0.51389545,0.53800088,0.56598864,0.57609198,0.59240149,0.60573736,0.62195248,0.69405166,0.76814722,0.82856685,0.89612304,0.84966030,0.79666648,0.74922204,0.69491794,0.65021140,0.61194053,0.57227968,0.53344700,0.55101959,0.56466603,0.57078896,0.58097788,0.62280887,0.67354073,0.70998616,0.74083776,0.71821770,0.68602600,0.63905655,0.59266847,0.60464688,0.60790443,0.62287575,0.63316781,0.58089462,0.52221942,0.45990676,0.39209931,0.36741823,0.33895504,0.30585158,0.27343058,0.31416760,0.35418772,0.40377814,0.45084141,0.45349586,0.45591239,0.48638192,0.52114859,0.50357386,0.48594519,0.47380674,0.46315347,0.42848794,0.40025400,0.35754766,0.31351962,0.33398404,0.36540011,0.38437734,0.40500120,0.43851534,0.47470021,0.50776898,0.54294498,0.51248836,0.47539379,0.44292248,0.40475971,0.33973679,0.26649028,0.19529978,0.12321742,0.20356420,0.29290468,0.37609975,0.45865503,0.55088899,0.63321855,0.73246727,0.85964538,0.81329469,0.77378865,0.72863181,0.68689134,0.63414136,0.57898964,0.53601357,0.49691024,0.47230573,0.44615106,0.43468577,0.42468913,0.39184363,0.36000727,0.31530370,0.26424733,0.32336904,0.38482667,0.43236278,0.47967991,0.57426337,0.67402680,0.76885744,0.85867253,0.78082949,0.70548883,0.64386834,0.57780396,0.50100388,0.42137294,0.33966733,0.26307571,0.26106471,0.26447486,0.27845425,0.29474197,0.27561278,0.25760304,0.24709200,0.24062213,0.28417937,0.32872589,0.36473386,0.40430813,0.43431223,0.46592214,0.47916312,0.49177324,0.51993383,0.53847994,0.56971653,0.58993002,0.63999922,0.68337107,0.70920031,0.73702675,0.69951741,0.66831411,0.61167689,0.55383156,0.53281180,0.50456482,0.46205290,0.41148946,0.43485999,0.45637018,0.45778340,0.46677905,0.43744897,0.40924830,0.37985588,0.35141083,0.37368274,0.39727366,0.41680286,0.44405837,0.47058805,0.50123603,0.52944877,0.55798031,0.55409364,0.55436671,0.55225745,0.55004777,0.53208708,0.51962567,0.53103005,0.53893442,0.53842992,0.53552717,0.52885634,0.52411861,0.52831505,0.53630318,0.53143410,0.52637822,0.52530092,0.51790135,0.51367647,0.50628586,0.50413370,0.50491714,0.47058886,0.43145707,0.43688028,0.44221520,0.45833089,0.47039090,0.44878479,0.42944497,0.40160964,0.36863402,0.41364307,0.46361148,0.48771666,0.51070732,0.54251518,0.57429177,0.60207638,0.62673051,0.59442740,0.56573684,0.53916659,0.50981957,0.45793691,0.40172321,0.32671004,0.26054184,0.26652894,0.27594246,0.30569664,0.33085969,0.30410121,0.27109202,0.25335107,0.22794447,0.22334780,0.21222517,0.21904072,0.21677329,0.21753869,0.22364675,0.20745186,0.18710802,0.23795770,0.28788618,0.31486178,0.33672663,0.37514471,0.41514927,0.46441934,0.50211198,0.49063253,0.47978398,0.45516368,0.43473175,0.42210086,0.41216947,0.37473264,0.33942712,0.37749176,0.41490845,0.45999055,0.50150718,0.47254680,0.43935921,0.42672695,0.41359097,0.42728430,0.43161793,0.44159913,0.45433483,0.48527847,0.52194485,0.54547784,0.57719416,0.59834047,0.61954003,0.62181724,0.62529404,0.70111667,0.77789642,0.83616533,0.88799182,0.84789183,0.80432703,0.74200609,0.68748935,0.64770361,0.61206090,0.57917469,0.54585886,0.56280926,0.57820354,0.58409907,0.58788154,0.63462167,0.68508028,0.72360750,0.76612198,0.72915362,0.69683491,0.64289598,0.59158177,0.59341464,0.59675217,0.59529981,0.59755962,0.53855766,0.48502833,0.42523514,0.36609444,0.31728782,0.26971583,0.23416387,0.19398306,0.25064353,0.30839463,0.37877320,0.45024816,0.45849097,0.46445418,0.50632841,0.54955167,0.52510807,0.50749205,0.48633118,0.46521271,0.42811694,0.39068937,0.34383900,0.29123012,0.31876608,0.34676528,0.35610207,0.36725321,0.38774554,0.40974250,0.44239398,0.46520237,0.44630021,0.42689210,0.39455530,0.36717077,0.31002477,0.25971162,0.17891428,0.09779312,0.20146896,0.30299117,0.39294511,0.49150295,0.57467577,0.65537078,0.75560529,0.88412623,0.82803175,0.76969056,0.72070246,0.67271565,0.62301627,0.56350172,0.52176178,0.48319902,0.45876320,0.43482006,0.41607799,0.39460975,0.35772766,0.32006733,0.27573494,0.23177195,0.29908909,0.37090517,0.42177175,0.47646641,0.58552191,0.69471078,0.79042820,0.89679174,0.81598405,0.73168293,0.66103986,0.59073333,0.48128929,0.37916671,0.27697517,0.17953709,0.18639675,0.18993706,0.20049256,0.20860043,0.20659852,0.19785657,0.19372069,0.18888478,0.24378891,0.29360727,0.35295283,0.41839129,0.43091470,0.44985917,0.46436435,0.48489695,0.50027336,0.52241090,0.54599596,0.56224075,0.61642722,0.67131173,0.72266644,0.77600386,0.71942163,0.66276388,0.60179675,0.53043662,0.49551566,0.45883844,0.41563902,0.37521869,0.39093581,0.41554336,0.42595641,0.43260917,0.40133468,0.36690540,0.33415860,0.29648506,0.32851255,0.36187836,0.39037850,0.41502742,0.47108202,0.52328471,0.57501552,0.61951480,0.60070998,0.57924754,0.55986081,0.53934479,0.52148179,0.50480570,0.49506898,0.48528618,0.49628447,0.49919774,0.50713020,0.50984006,0.51088689,0.51766172,0.52369369,0.53393327,0.53068733,0.52792935,0.51695009,0.50893511,0.48969520,0.46940046,0.43443167,0.40283300,0.40904640,0.41199487,0.42198706,0.43494781,0.42446982,0.41302114,0.39145898,0.36699793,0.40719250,0.45249641,0.48714563,0.52744484,0.53974367,0.55024065,0.55697098,0.56711813,0.53645533,0.50807173,0.49122006,0.47912747,0.40832218,0.34361949,0.26875497,0.19120396,0.20342579,0.21911272,0.24141608,0.26156857,0.23184928,0.19568726,0.15751287,0.12567976,0.14602249,0.16878817,0.18767189,0.21135435,0.19620990,0.18375817,0.17419461,0.15794281,0.22058996,0.28069274,0.33246132,0.39079160,0.43521560,0.47756689,0.52371812,0.57251967,0.53713328,0.50225274,0.46040136,0.41936807,0.40013828,0.37888214,0.33958618,0.29932062,0.34353148,0.38506858,0.43180910,0.48190552,0.45342281,0.43051461,0.42743497,0.41803481,0.42710026,0.43244051,0.43255941,0.43245027,0.47358081,0.50935586,0.54469801,0.58076264,0.59742670,0.61964927,0.63139952,0.64321097,0.71483283,0.78825106,0.85291980,0.90991091,0.85047640,0.79361914,0.73527805,0.67776531,0.64448182,0.61290753,0.58483986,0.56063018,0.56579805,0.56806895,0.56862854,0.57432904,0.61983149,0.67058309,0.72568548,0.77672177,0.73367188,0.68599535,0.63760778,0.59601268,0.58574432,0.57060566,0.56450041,0.56015740,0.50522269,0.45308198,0.39724039,0.34161600,0.28229750,0.22777391,0.17791330,0.11902942,0.19927610,0.27818494,0.35701357,0.43463227,0.45888623,0.48445857,0.52637533,0.56700046,0.54771541,0.52691314,0.50722388,0.48760546,0.43932662,0.39402581,0.33697492,0.28157361,0.29642204,0.30824669,0.30866437,0.31717045,0.34056241,0.35717648,0.37679858,0.40153793,0.39099107,0.37961482,0.36289246,0.34981306,0.29021757,0.22505564,0.15248214,0.08245750,0.19515339,0.30463560,0.40259679,0.50271270,0.58944066,0.67985651,0.78313407,0.91115745,0.83700285,0.76793417,0.71465031,0.66414257,0.60613579,0.54679491,0.50595248,0.46667413,0.44749111,0.42504595,0.39299844,0.36652351,0.32362026,0.27670843,0.24030951,0.19589136,0.27851371,0.35939068,0.41951801,0.47595954,0.59707171,0.71270579,0.82282158,0.93160175,0.84528264,0.76063962,0.68149717,0.60734281,0.46982157,0.33454683,0.21719742,0.09491545,0.10750801,0.11796356,0.12373674,0.12495998,0.13533289,0.13622426,0.13945735,0.13383145,0.19845032,0.26241015,0.34797861,0.43096378,0.43097782,0.43657919,0.45337224,0.47198062,0.49045558,0.50152665,0.51996765,0.53390144,0.60206417,0.66165308,0.73539009,0.80930048,0.73905702,0.66645682,0.58460242,0.50730539,0.46029183,0.40781172,0.36869015,0.32894253,0.34922656,0.37327420,0.38904444,0.40374637,0.36684851,0.33126437,0.28740790,0.23939505,0.28785439,0.33196947,0.35815659,0.38646676,0.46865113,0.55031359,0.62002372,0.68773899,0.64117301,0.59749753,0.56624252,0.53579756,0.50959047,0.48529993,0.45747695,0.43061011,0.45293754,0.47058449,0.47826507,0.49268468,0.49710684,0.49685670,0.51924696,0.54153285,0.53586447,0.53609150,0.52075450,0.50407950,0.46994460,0.44487043,0.40766763,0.36658388,0.37066554,0.37849756,0.38798847,0.39996538,0.40081454,0.40015497,0.38014370,0.36041427,0.39958129,0.44311735,0.49294901,0.54320786,0.53495147,0.53406901,0.52036915,0.50579103,0.47612654,0.44933661,0.44612656,0.44534051,0.36589675,0.29669714,0.20898356,0.11946421,0.14027117,0.15380422,0.17602203,0.19321473,0.15422376,0.12549785,0.07163990,0.01479785,0.06919207,0.12640327,0.15997513,0.19956241,0.17204013,0.14915464,0.13996584,0.12269065,0.19817923,0.26690623,0.35195550,0.44129309,0.49225204,0.54050801,0.58840167,0.64113870,0.58333438,0.52363056,0.45938000,0.39760482,0.37463781,0.34953707,0.30638330,0.25763136,0.30816679,0.35531852,0.40709579,0.46337982,0.44140517,0.42352396,0.42126381,0.41394483,0.42813528,0.43882135,0.42798033,0.41259089,0.45441903,0.49848025,0.54130379,0.58165328,0.59982782,0.62183057,0.63783973,0.65741272,0.72844834,0.80400110,0.86581723,0.93538933,0.85304707,0.77594249,0.72009474,0.66233606,0.63683009,0.61478011,0.59835355,0.57574952,0.57352017,0.56579638,0.56253591,0.55537475,0.61374918,0.66044978,0.73151164,0.79585697,0.73849561,0.67495429,0.63419796,0.59118920,0.56749448,0.54680868,0.53579839,0.51886396,0.47204761,0.42587854,0.36542348,0.31072268,0.24786576,0.18916223,0.11712917,0.04031994,0.15028903,0.25428119,0.33710178,0.42950113,0.46366377,0.50579994,0.54436751,0.58988120,0.57063691,0.54996813,0.52658762,0.50779844,0.45346019,0.40162184,0.33523210,0.26946844,0.26736795,0.26356168,0.26486990,0.26351267,0.28539294,0.30469965,0.31591346,0.33097567,0.32697207,0.32626214,0.32662298,0.33076580,0.26290472,0.19494683,0.13173390,0.06392847,0.19008399,0.31411183,0.41541760,0.51883022,0.60960597,0.70156737,0.80250898,0.80845050,0.76012348,0.70346512,0.65725321,0.61296183,0.58249873,0.54944746,0.52358537,0.49486865,0.46424007,0.42741777,0.38238028,0.33988562,0.30955659,0.28196503,0.24452436,0.20758286,0.28415620,0.35540646,0.40957865,0.46554194,0.56925675,0.66373586,0.75191302,0.84060984,0.76763703,0.68860408,0.61959730,0.55036513,0.43841676,0.31702844,0.20593517,0.09273840,0.11802127,0.14253114,0.15690392,0.17549338,0.17160334,0.17030365,0.17765987,0.18178420,0.23912675,0.29238528,0.36315328,0.42864732,0.43692077,0.44598654,0.47147796,0.49054294,0.50180877,0.51925889,0.52710061,0.53487468,0.58170220,0.62491797,0.66623640,0.70499739,0.65962700,0.61652223,0.56536032,0.51287739,0.47597312,0.44262161,0.40766556,0.37756435,0.38653379,0.39878787,0.39922454,0.40517161,0.38727754,0.36713615,0.34388795,0.31909826,0.34753803,0.37934502,0.40578110,0.43057944,0.49014347,0.55280684,0.61622559,0.67380478,0.64585737,0.61627932,0.59483054,0.57627682,0.55380603,0.52963119,0.50990986,0.49326537,0.48572853,0.48199472,0.47193616,0.46758910,0.46748341,0.47030845,0.46755787,0.46741654,0.46452429,0.46317474,0.45451390,0.44309845,0.42579224,0.41601284,0.39442404,0.37347235,0.37496358,0.38192412,0.38524525,0.39225096,0.40052527,0.40934619,0.39830125,0.39225747,0.41907995,0.44445487,0.47544150,0.50363799,0.49592626,0.48704045,0.46498241,0.44929966,0.43905559,0.43013323,0.42235096,0.40772157,0.37064844,0.32633448,0.28663833,0.24693953,0.24534755,0.24311703,0.25717559,0.26123308,0.22671944,0.19650291,0.15664798,0.11361502,0.15045703,0.19017443,0.22493205,0.25041718,0.24294322,0.23172752,0.22921340,0.22313152,0.28579506,0.34068281,0.40339158,0.46038618,0.50802802,0.55689925,0.60036248,0.64265465,0.58971728,0.53719975,0.48819602,0.44088245,0.41049612,0.38877323,0.35052164,0.31169452,0.34670393,0.37768403,0.40546505,0.43547070,0.42795917,0.42113123,0.42208153,0.42428954,0.44170829,0.46216500,0.46101201,0.46589567,0.49430069,0.52792759,0.55279318,0.57304718,0.59506677,0.61996672,0.63891669,0.66184463,0.72536891,0.78839875,0.85496876,0.92380045,0.85463682,0.78638064,0.73954151,0.68337010,0.66439591,0.64621875,0.62938698,0.61388481,0.61115325,0.60744489,0.61021799,0.61386718,0.65530744,0.70384294,0.74353399,0.78831654,0.73549430,0.68194556,0.63663502,0.58912591,0.57274750,0.55145043,0.53782879,0.52383952,0.47285947,0.41868208,0.36439288,0.31080861,0.25520795,0.19835256,0.13961189,0.07858007,0.16073343,0.24810166,0.31285069,0.38398401,0.43541303,0.48964517,0.52926583,0.57401324,0.55837434,0.54459354,0.51802470,0.49718296,0.46418049,0.42524910,0.37518430,0.32498932,0.31810677,0.30668369,0.29519755,0.28557873,0.29255656,0.30243300,0.30934023,0.30960775,0.30392565,0.29364034,0.29003507,0.28668035,0.24513154,0.20180300,0.15373888,0.10249037,0.19714061,0.29229159,0.37796670,0.46997301,0.55120125,0.63102133,0.71793156,0.71117961,0.67784385,0.64423527,0.60562939,0.56499049,0.55817251,0.54800708,0.53786162,0.52747726,0.48108478,0.43654671,0.37248317,0.30916892,0.29657122,0.28764581,0.25218425,0.22169522,0.28814176,0.35235804,0.40831298,0.45511803,0.53660889,0.62297412,0.68181784,0.74826990,0.68462130,0.62388867,0.56084692,0.50027782,0.39883472,0.30379877,0.19620155,0.08483989,0.12900156,0.16796384,0.19305420,0.21960031,0.21108302,0.20610519,0.21862352,0.23151918,0.27560689,0.31729147,0.37967789,0.43511317,0.44670799,0.45332423,0.48585036,0.51433670,0.51989363,0.53271431,0.53458919,0.53751005,0.56339198,0.58978917,0.59320146,0.59633604,0.58682292,0.57338236,0.54228700,0.51246482,0.49220718,0.47282013,0.44996195,0.42607955,0.42459995,0.42751805,0.41522805,0.40657241,0.40790054,0.40863862,0.40218403,0.40074927,0.41099480,0.42532036,0.45136314,0.46958848,0.51391801,0.55557045,0.60612550,0.65694313,0.64405395,0.63024156,0.62212669,0.61658379,0.59363775,0.57244746,0.56370837,0.54760103,0.52242220,0.48700047,0.46653747,0.44886636,0.44470489,0.43810302,0.41578098,0.38809848,0.39212439,0.39637711,0.38758067,0.37775706,0.38516217,0.39179722,0.38758207,0.38251985,0.38095556,0.37984622,0.38142126,0.38748993,0.40375063,0.41742131,0.41751731,0.41662716,0.43211849,0.44246178,0.45696696,0.46487736,0.45268488,0.44863873,0.41752238,0.38368490,0.39462021,0.40995207,0.39066695,0.37697163,0.36945059,0.35554474,0.36018516,0.36876336,0.35522327,0.33611949,0.33713329,0.33338456,0.30454182,0.27044207,0.23727775,0.20589958,0.23485624,0.26093994,0.28707440,0.30799267,0.31056863,0.31317138,0.32088559,0.32217297,0.36920193,0.41442534,0.44890770,0.47531184,0.52671913,0.58166989,0.60859260,0.64598220,0.59596157,0.54900781,0.51248330,0.47854836,0.44947747,0.42784744,0.39172520,0.36120665,0.38539045,0.40371212,0.41057892,0.41280787,0.41975844,0.41751067,0.42549434,0.42906984,0.45721663,0.48291541,0.50142388,0.51396204,0.53220037,0.55506541,0.55996176,0.56429793,0.58906265,0.61625052,0.64325151,0.66377291,0.72013603,0.77168527,0.84362955,0.91105455,0.85139170,0.79253939,0.75471721,0.71065137,0.69162225,0.67262062,0.66373190,0.65455505,0.65457697,0.65141454,0.66015681,0.67273307,0.70372286,0.74498991,0.76398973,0.78219228,0.73966089,0.69071478,0.63891081,0.58403507,0.57312207,0.55391299,0.54365819,0.52267553,0.46695118,0.41230029,0.36393676,0.31437915,0.26080477,0.21116738,0.16025892,0.10907286,0.17490433,0.24365438,0.29034250,0.33530017,0.40585459,0.47239590,0.51529238,0.55672462,0.54581048,0.53526631,0.51234853,0.48741679,0.47103740,0.45804248,0.41468722,0.37792817,0.36702550,0.35417399,0.33073002,0.30232106,0.30582357,0.30278788,0.29513194,0.29112792,0.27637091,0.26039236,0.25480140,0.24889731,0.22724718,0.20625347,0.17092331,0.14216377,0.20668609,0.26897495,0.34679898,0.41823039,0.49307822,0.55801843,0.63337501,0.62257247,0.59551650,0.56160344,0.53206945,0.50865527,0.51968242,0.53507961,0.54096825,0.54873062,0.49355538,0.43491685,0.36106624,0.29100436,0.28786685,0.28256789,0.26532292,0.24139371,0.29778605,0.35484033,0.40610645,0.46523767,0.51686223,0.57097562,0.61688540,0.67158487,0.60800054,0.55045770,0.49908617,0.44553295,0.35828353,0.26476647,0.17038609,0.07687094,0.12282360,0.17053598,0.21249183,0.25820082,0.25671812,0.25938294,0.26864245,0.27008945,0.31460188,0.35816211,0.40170708,0.44619803,0.45832228,0.47939929,0.49853946,0.52089069,0.52246552,0.52563744,0.52652781,0.52410056,0.52479441,0.52846891,0.51453772,0.50498113,0.51411285,0.51527184,0.52180185,0.52769448,0.51074317,0.49061883,0.47516992,0.45869903,0.45556933,0.45016790,0.43477701,0.42108474,0.43980761,0.45508887,0.46251877,0.46998399,0.47776210,0.48265551,0.49508878,0.51786772,0.54683368,0.58374435,0.61566584,0.65199635,0.65015688,0.64485895,0.65432506,0.65906588,0.64431896,0.63094655,0.62990609,0.62893977,0.57535256,0.52311792,0.47393227,0.42038877,0.40110622,0.37730258,0.34898340,0.31700070,0.32049987,0.33095147,0.32255889,0.31920785,0.33549060,0.34497117,0.36233481,0.38065688,0.38302413,0.38323141,0.38647853,0.38633750,0.40893313,0.42796142,0.44447814,0.46296594,0.46244876,0.45676214,0.45040536,0.43898129,0.41630801,0.39306138,0.36625606,0.34442830,0.35424999,0.36348571,0.35811616,0.35515531,0.38206345,0.41170097,0.44507183,0.48330796,0.46249258,0.43502290,0.41846766,0.39889438,0.37679892,0.35804313,0.33344390,0.30491644,0.31519614,0.33012278,0.34262015,0.35425908,0.37346105,0.39561144,0.41390449,0.43556918,0.45771592,0.48339373,0.49830981,0.50786029,0.54493189,0.57926146,0.60304431,0.63636691,0.60203069,0.57286435,0.53532947,0.50315754,0.48542715,0.46653371,0.44731296,0.42547050,0.42073040,0.41552265,0.41130006,0.41017144,0.42238941,0.43919415,0.43820490,0.44613792,0.48186749,0.52327347,0.54776772,0.57815859,0.57924365,0.57572367,0.56622877,0.56379020,0.58644626,0.61904002,0.64056171,0.65831680,0.72091649,0.78216382,0.84295067,0.90720289,0.85150853,0.79889563,0.75811956,0.71449091,0.71269583,0.70616611,0.70679068,0.70818052,0.70658147,0.69801131,0.70187097,0.70183945,0.72701063,0.75346942,0.77697236,0.80697248,0.75014945,0.70075930,0.64440105,0.59034427,0.57538492,0.57033383,0.55908383,0.54691704,0.48175786,0.41027405,0.34845387,0.29057667,0.24862503,0.20939867,0.16990436,0.13066606,0.17897692,0.23388799,0.27327025,0.31516775,0.38347249,0.44843615,0.50765643,0.56415467,0.54401101,0.53227143,0.52106147,0.50955518,0.49455551,0.48019766,0.45979852,0.43293829,0.40634552,0.38262136,0.35936938,0.33281743,0.30995987,0.28932938,0.26475213,0.24607764,0.24107609,0.23819417,0.22467225,0.21595030,0.21058554,0.20734652,0.18667950,0.16613125,0.21750661,0.26652613,0.32612422,0.38261979,0.43965746,0.50239710,0.56545667,0.54159239,0.50631944,0.47532020,0.46851495,0.45444472,0.49093993,0.52637716,0.54816251,0.57593079,0.50105015,0.43704067,0.35181545,0.27007164,0.27616107,0.28626840,0.27097853,0.25775199,0.30278856,0.35146823,0.40845688,0.47017775,0.49292542,0.52176903,0.55793946,0.59146432,0.53449913,0.47379336,0.43404421,0.40031293,0.31558304,0.22903301,0.14877932,0.05890269,0.12113633,0.17752391,0.23703370,0.29402675,0.29734550,0.30818783,0.31068216,0.31275045,0.35003123,0.39229594,0.42610126,0.45534916,0.47339061,0.49704079,0.51340859,0.53070475,0.52446388,0.51501063,0.51690547,0.51478212,0.49268157,0.47155069,0.43869670,0.40942748,0.43668493,0.46022880,0.49789275,0.53833452,0.52438204,0.51230914,0.50739361,0.49688475,0.48933291,0.47546078,0.45123477,0.42915856,0.46477572,0.50276637,0.52369151,0.54288858,0.54020775,0.53144742,0.54738083,0.55868399,0.57874509,0.60352649,0.62055802,0.64183880,0.65343945,0.65802424,0.67955903,0.69974367,0.69327099,0.69031761,0.69624836,0.70653306,0.62687408,0.55661490,0.47444478,0.38726525,0.35744613,0.32306585,0.28345180,0.24191855,0.24949797,0.26011233,0.25989778,0.25590066,0.28393347,0.30378729,0.33814201,0.37601226,0.38280160,0.38571348,0.38310648,0.38284881,0.40950007,0.43212514,0.47152745,0.51304220,0.49421010,0.47588763,0.44019798,0.41430278,0.38209961,0.34392658,0.32097039,0.29712098,0.30765215,0.31555658,0.32269533,0.32676351,0.39375308,0.46065726,0.52769996,0.60241912,0.56718455,0.53820856,0.49833230,0.46518403,0.45788232,0.45099497,0.42882427,0.40397116,0.40188437,0.39293743,0.40052125,0.40145159,0.43617920,0.47337279,0.51394662,0.55147836,0.54719365,0.55067965,0.54539504,0.54069796,0.56233439,0.57314790,0.59943740,0.62216764,0.60633811,0.59528509,0.56161418,0.53114951,0.51915274,0.50724845,0.50035437,0.49095832,0.45784755,0.43142998,0.41608827,0.40174337,0.42810419,0.45464166,0.45668615,0.45450239,0.51107768,0.56419631,0.59935454,0.64537574,0.61967296,0.59287607,0.57229759,0.55546687,0.58574926,0.62062657,0.63639169,0.64748719,0.72098464,0.79585209,0.84974973,0.90785937,0.85308870,0.80248602,0.76286516,0.71679930,0.73281683,0.74292540,0.75247740,0.76662338,0.75676943,0.74688075,0.74061923,0.73830093,0.74872613,0.76121839,0.79370909,0.82587899,0.76469491,0.71226919,0.65036839,0.58726942,0.58525523,0.58285607,0.58042206,0.57568722,0.49006863,0.40578558,0.33540897,0.26262297,0.23944656,0.21477170,0.18299281,0.14749343,0.18895392,0.22856004,0.25711270,0.28461326,0.35825865,0.42643333,0.49662253,0.56540744,0.54545993,0.52835465,0.52848493,0.52422769,0.51695659,0.50943351,0.49865677,0.48862470,0.44951090,0.40593679,0.38120525,0.35874439,0.31242843,0.26898617,0.23437936,0.19701776,0.20358562,0.21630588,0.19634256,0.17687710,0.18962273,0.20658288,0.19822819,0.18642550,0.22624567,0.26629021,0.30331011,0.34273823,0.39233632,0.44004908,0.48984321,0.42368160,0.41964250,0.42219367,0.43289486,0.44298133,0.46823038,0.49844010,0.52232913,0.55433427,0.48496507,0.42162531,0.36288721,0.30748892,0.28842456,0.27429915,0.26373592,0.24907679,0.28040044,0.30717061,0.35281756,0.39302186,0.40429261,0.41652790,0.43854124,0.46636628,0.42760102,0.39488038,0.37300947,0.35237417,0.27918461,0.20861468,0.14113726,0.06617853,0.12421027,0.17970209,0.23257248,0.29022598,0.30704922,0.32739737,0.34549637,0.36519108,0.39535997,0.42140600,0.44594822,0.46828695,0.49647788,0.51970902,0.54498984,0.57505238,0.54933403,0.52984645,0.51085823,0.48798994,0.45645514,0.42930670,0.39251244,0.35684551,0.39663742,0.42833280,0.47777906,0.52400962,0.53452238,0.53992846,0.54811820,0.55740471,0.54887208,0.54099272,0.51733780,0.49446958,0.52368043,0.55418339,0.56216016,0.57280392,0.57669353,0.58591853,0.58393520,0.58538769,0.61298991,0.64074529,0.65166540,0.66742759,0.68018101,0.68484601,0.69927155,0.71446801,0.71706598,0.72024049,0.73334048,0.74059798,0.66838361,0.58917209,0.51133161,0.43004142,0.36921341,0.30403014,0.25124382,0.19626378,0.21865023,0.24232897,0.25555394,0.27604328,0.29485587,0.30962728,0.32547266,0.34765390,0.36584017,0.38059338,0.39570105,0.41297270,0.44138334,0.46407250,0.49240880,0.52338685,0.49855947,0.46928302,0.42868947,0.39184791,0.34640237,0.30468466,0.26768835,0.23382578,0.26542602,0.30640512,0.34876549,0.39513833,0.46232569,0.52639123,0.59917834,0.67303147,0.64261032,0.61091675,0.58411063,0.55761797,0.54689357,0.54198553,0.52359952,0.50791367,0.50482425,0.50326709,0.49691857,0.49618404,0.52195079,0.55026636,0.58155649,0.61222511,0.61235183,0.60659713,0.59380516,0.58133130,0.60438597,0.62452810,0.65186507,0.67810640,0.64705938,0.60901319,0.57275851,0.53547228,0.52400486,0.50881155,0.49316840,0.48505195,0.47634816,0.46603684,0.46002992,0.44493007,0.46556609,0.47646294,0.48474991,0.48889166,0.53500959,0.58133573,0.60658475,0.63791402,0.61799147,0.59941671,0.59322414,0.58951709,0.60368408,0.62054579,0.64030399,0.65460546,0.72799501,0.79454680,0.86139924,0.91907949,0.88365290,0.83999962,0.81017338,0.77128691,0.78551548,0.79799867,0.80175153,0.80816444,0.78978024,0.76977024,0.75928896,0.74447213,0.76175764,0.77250465,0.79811719,0.82068305,0.76622731,0.71425932,0.65970510,0.60931849,0.59201381,0.58523551,0.57277671,0.55987103,0.49158948,0.41925813,0.36240403,0.30158237,0.26641640,0.22810124,0.18541105,0.14791094,0.18352124,0.21508462,0.25957941,0.29473113,0.35107873,0.40529492,0.46170754,0.52376035,0.51387071,0.50996345,0.51356283,0.51075723,0.51352291,0.51143037,0.50907484,0.50753389,0.47306811,0.43596085,0.40382076,0.37267701,0.32334938,0.26817986,0.21861958,0.16063900,0.18153135,0.20180144,0.21192361,0.21857654,0.22561633,0.23673977,0.23391913,0.23313048,0.24917499,0.27153136,0.30026540,0.32443338,0.35153380,0.37021458,0.39386417,0.30739566,0.33199413,0.36501425,0.39192841,0.42748191,0.44905389,0.46815665,0.50480130,0.53818871,0.47378897,0.40429098,0.37079706,0.33879834,0.30607936,0.26790489,0.25631291,0.24385126,0.25343091,0.25770265,0.29273376,0.32028678,0.31882706,0.31214752,0.32718016,0.33652464,0.32844339,0.31228388,0.30895199,0.30991879,0.25262703,0.19356562,0.13343877,0.07580845,0.12973809,0.18044961,0.23491385,0.28676932,0.31979305,0.35372599,0.38558462,0.41393365,0.43044536,0.45025289,0.46782494,0.48408437,0.51237306,0.54190109,0.57933258,0.61819001,0.57712487,0.54231743,0.49734822,0.45339070,0.42264082,0.38434636,0.34280985,0.30550597,0.35004985,0.39403959,0.45269199,0.51460879,0.53629743,0.56118440,0.58934391,0.61447209,0.61435079,0.61136313,0.58671145,0.56119500,0.58645823,0.60948649,0.60702477,0.60169939,0.61749838,0.63709093,0.62278676,0.61612806,0.64314238,0.67587629,0.68306383,0.69108568,0.70226525,0.71231168,0.72355874,0.73021883,0.74113436,0.75093790,0.76857345,0.78219930,0.70747065,0.62940340,0.54836427,0.47841025,0.37951463,0.28535000,0.21515477,0.14740932,0.18081708,0.22365947,0.25582759,0.29731181,0.30415427,0.31349166,0.31576253,0.31701446,0.35019211,0.38048636,0.40836884,0.43492993,0.46521416,0.49877049,0.51487138,0.53754269,0.50083423,0.46399360,0.41667732,0.37387687,0.32140466,0.26891950,0.21674694,0.16632730,0.22890871,0.29104559,0.37964309,0.46533153,0.52595935,0.58598840,0.66361559,0.74106426,0.71509900,0.68877873,0.66823594,0.65301400,0.64566889,0.63814663,0.62689255,0.61582523,0.61221204,0.60899461,0.59941646,0.58613920,0.60798844,0.62941403,0.65891132,0.68030786,0.67164732,0.66016565,0.63945012,0.61673323,0.64353112,0.66497356,0.70111819,0.73354982,0.67651241,0.62339424,0.58395202,0.53713496,0.52315604,0.50876677,0.49319132,0.47339293,0.48981467,0.50498462,0.49529694,0.48562645,0.49686532,0.50441039,0.51741573,0.52536227,0.56029884,0.60003268,0.61109607,0.62713203,0.62084456,0.60646846,0.61364791,0.61816919,0.62149219,0.62173365,0.64334301,0.65860258,0.72771487,0.80103113,0.86735837,0.93659026,0.90798870,0.87944394,0.85199545,0.82716996,0.84095073,0.85160218,0.84757828,0.85076415,0.82270894,0.80034608,0.77865384,0.75900134,0.76855057,0.78732798,0.80182941,0.81784370,0.76712870,0.71974337,0.67618615,0.62521165,0.60779097,0.58114498,0.56300916,0.54930386,0.48908408,0.43319263,0.38556559,0.33784576,0.29049649,0.24563633,0.19692283,0.14754365,0.17659544,0.20287156,0.25407053,0.31088173,0.34709206,0.38017329,0.43346133,0.48060709,0.48465300,0.49191899,0.49522294,0.50786563,0.50630222,0.50891318,0.52350389,0.53116794,0.50324179,0.47077360,0.42793767,0.38953858,0.32513509,0.26663147,0.19413999,0.12532765,0.16111656,0.19586011,0.22342138,0.25116167,0.25852731,0.27090399,0.26760375,0.27527842,0.27082382,0.27172448,0.29262771,0.31379139,0.30259223,0.29934435,0.30175433,0.17130706,0.23633033,0.29337952,0.35055443,0.41073960,0.42875865,0.44813154,0.47431941,0.50888819,0.46615779,0.41811989,0.38552863,0.34487761,0.31390743,0.28523945,0.25644453,0.22316196,0.22618799,0.22558146,0.23127464,0.23742964,0.23680258,0.23672880,0.22459804,0.22079937,0.23414835,0.24570813,0.25228346,0.26325346,0.21171332,0.16273958,0.10929580,0.06372072,0.12198155,0.17728083,0.22872490,0.28282180,0.32310787,0.36542581,0.41134923,0.45600127,0.46554735,0.47371099,0.49271806,0.51222223,0.54540552,0.57672072,0.61501826,0.65766125,0.60295916,0.54897599,0.48927667,0.43834069,0.38964832,0.33415092,0.28537070,0.23334179,0.29539228,0.35493574,0.42864990,0.49317766,0.54150548,0.58718150,0.63254662,0.68467589,0.67406337,0.65971552,0.63823891,0.61854973,0.63626016,0.64589097,0.65286776,0.65711734,0.65967322,0.65627079,0.64698869,0.63922368,0.66653181,0.69050808,0.71146114,0.73155486,0.73759176,0.74022007,0.75399130,0.75944761,0.77416618,0.78339423,0.81036899,0.82922531,0.74668469,0.66208526,0.58104124,0.50366350,0.39126752,0.27506877,0.17463728,0.08009301,0.13860670,0.19166146,0.24669540,0.29808008,0.29890627,0.30038394,0.29726437,0.29609228,0.34195772,0.39237925,0.43221395,0.47647120,0.49557150,0.51148187,0.53370621,0.55655807,0.49982454,0.44206845,0.39022652,0.33564953,0.27518286,0.21302857,0.14869211,0.08408147,0.18302003,0.28255303,0.39821647,0.51450281,0.58676105,0.65413109,0.74846283,0.83943594,0.80314604,0.76858756,0.74815984,0.72755637,0.72401757,0.72469276,0.71939305,0.71333874,0.70486346,0.69883771,0.69454982,0.68532796,0.70670581,0.72358194,0.74390368,0.76254299,0.73929155,0.71577053,0.69263069,0.66093224,0.68880578,0.71776403,0.75140927,0.78200990,0.72326099,0.66063920,0.60603872,0.55036766,0.54085769,0.53194871,0.50933981,0.49496806,0.50923942,0.53254529,0.53105947,0.53776389,0.54406839,0.54768614,0.56265982,0.57219652,0.59645580,0.61978600,0.62406354,0.63454579,0.63290911,0.62894126,0.62927865,0.63413200,0.63530928,0.64485402,0.65525285,0.66452471,0.73961177,0.81239198,0.87623947,0.94771558,0.92241404,0.90478175,0.89758869,0.88891089,0.89345572,0.89997795,0.89747421,0.89882317,0.85736368,0.81573658,0.78016920,0.74620545,0.76261598,0.78158733,0.80018362,0.81633257,0.77240015,0.73005062,0.69333241,0.65666313,0.62175706,0.59176174,0.56347212,0.53358081,0.48393427,0.43413602,0.39405640,0.35894280,0.29737635,0.23998844,0.19036449,0.13536339,0.17386949,0.21336818,0.25884879,0.30093365,0.33569565,0.37603962,0.41075892,0.45041462,0.45323945,0.46108114,0.46881597,0.48102878,0.49918805,0.52076082,0.54669864,0.57810925,0.52988067,0.48559315,0.44460532,0.40113105,0.32415570,0.24484254,0.16425754,0.08454356,0.14011226,0.18970775,0.24220017,0.29237801,0.29958997,0.30012573,0.29714946,0.29226597,0.28570704,0.27001962,0.27765712,0.28473045,0.25668304,0.22987194,0.20428409,0.03952107,0.13455820,0.22639370,0.30614347,0.39472559,0.40928279,0.42288365,0.45048057,0.48110080,0.45504470,0.43020604,0.39013113,0.35721492,0.32829318,0.30076980,0.24900447,0.20361708,0.19252374,0.18393324,0.17048758,0.15722969,0.15822576,0.15492055,0.12732716,0.10226952,0.14081603,0.17662876,0.19462643,0.21637343,0.17210919,0.12812685,0.09280852,0.04855938,0.10900441,0.16679766,0.22724308,0.27968904,0.33077776,0.37394637,0.43304545,0.49395732,0.49535770,0.49970033,0.51942243,0.53584874,0.57117558,0.60616019,0.64843298,0.69586499,0.62418653,0.54805474,0.48655564,0.42034090,0.35243371,0.28662638,0.22254753,0.16034925,0.23753162,0.31529593,0.39869368,0.47858050,0.54224198,0.60560017,0.67747958,0.75379130,0.72684322,0.70692871,0.69448253,0.67618177,0.68232231,0.68767494,0.70437127,0.71647263,0.69364107,0.67592076,0.67564523,0.66747323,0.68534013,0.70297791,0.73449241,0.76968023,0.76939246,0.77255143,0.78262516,0.78946548,0.80478878,0.81358339,0.84923804,0.88397221,0.78748931,0.69289989,0.60810200,0.52992879,0.39365906,0.26017141,0.13531025,0.00817877,0.08778150,0.17024916,0.23167893,0.30216946,0.29247239,0.29349564,0.28212726,0.27308474,0.33654071,0.40201345,0.45718579,0.51810411,0.51833096,0.51814370,0.54625229,0.57428275,0.49841099,0.42441433,0.36736319,0.30217493,0.23247922,0.15963704,0.08203261,0.00107063,0.13519159,0.26744331,0.41704686,0.57082655,0.64308490,0.71792098,0.82891834,0.93629378,0.89286681,0.84837738,0.82589726,0.80744850,0.81236861,0.81645125,0.81376322,0.81563287,0.80231353,0.79639206,0.79071154,0.78086080,0.79542479,0.81893712,0.82560413,0.84277490,0.80673822,0.77788219,0.74239739,0.70247282,0.73856070,0.76689561,0.80022487,0.82944091,0.76353570,0.70184327,0.63048951,0.55301165,0.55012480,0.54892806,0.52966776,0.50753493,0.52996896,0.55797211,0.57183351,0.58845020,0.59008600,0.59179622,0.60093719,0.61618924,0.62634612,0.63998079,0.64312602,0.64637335,0.64571296,0.65325472,0.65447251,0.65238411,0.65737713,0.65860252,0.66448711,0.66343852,0.74488498,0.82380496,0.88843849,0.95885126,0.94554810,0.92921818,0.93925274,0.95218384,0.94869119,0.95104166,0.94609341,0.94670011,0.88848093,0.83329883,0.78277186,0.73281249,0.75884932,0.78458950,0.79959700,0.81285619,0.77580383,0.73795127,0.71063341,0.68796242,0.64274122,0.60241218,0.56530722,0.52268170,0.48130487,0.43949672,0.41057603,0.37895330,0.30794257,0.23931634,0.18468077,0.11947464,0.17346233,0.22541677,0.25747374,0.28923701,0.32723433,0.37083953,0.39240727,0.41288009,0.42559878,0.43158362,0.44248648,0.45050165,0.48652164,0.52475354,0.57468932,0.61730710,0.56048246,0.50082069,0.45898476,0.41575070,0.31507927,0.21940173,0.13380438,0.04492536,0.11517802,0.17550759,0.25397071,0.33654264,0.33274066,0.33615467,0.32691136,0.31313220,0.29126650,0.26893345,0.26197952,0.25326636,0.20884398,0.16477851,0.10168906,0.13775902,0.21260430,0.28056362,0.33612727,0.39182216,0.40946817,0.42571895,0.44882877,0.46722131,0.43392082,0.40153816,0.36634045,0.33278729,0.30625062,0.28531595,0.25679501,0.22815690,0.21876595,0.21146737,0.20694515,0.19652664,0.20131956,0.20215249,0.19000579,0.18253194,0.19169202,0.20096067,0.21068738,0.22861490,0.19534821,0.15711050,0.13261161,0.11087042,0.15633016,0.20976150,0.25780734,0.29827775,0.35543390,0.40859226,0.46709080,0.52354283,0.51827812,0.51323156,0.52201461,0.52768408,0.56411412,0.59225428,0.63695414,0.67797653,0.60772480,0.53570836,0.47500828,0.41530028,0.35414886,0.28242412,0.22207043,0.15338305,0.23510340,0.31549531,0.40174394,0.49056631,0.54852021,0.60970215,0.68924054,0.76845715,0.74922077,0.72766875,0.70933009,0.69398478,0.68548845,0.67606290,0.67243740,0.66848583,0.65351084,0.64316467,0.64969265,0.65729948,0.68187334,0.70697181,0.73605937,0.76667155,0.76739216,0.76300458,0.76216545,0.76601695,0.76938613,0.76734851,0.78650478,0.79768240,0.72131861,0.64331206,0.56094681,0.48483675,0.37025020,0.25291395,0.15303954,0.04416567,0.11256036,0.17590520,0.23710613,0.29946607,0.30079085,0.30455119,0.32021287,0.33327823,0.38851501,0.44161528,0.49369904,0.54711697,0.55259740,0.56306661,0.57870695,0.59573916,0.52437955,0.45234146,0.39102613,0.33556252,0.26841895,0.20404794,0.13714351,0.07234727,0.18935856,0.30317717,0.42419583,0.54194064,0.61496443,0.69666060,0.79333308,0.89353359,0.86091233,0.83443772,0.80999249,0.79360102,0.79641993,0.79424529,0.79282333,0.78599606,0.78305791,0.78122578,0.77005846,0.75722026,0.75685703,0.75996434,0.74977303,0.74486463,0.72392019,0.70575873,0.67789054,0.64946053,0.67716580,0.70776056,0.74151751,0.77446196,0.72572764,0.67480326,0.61792976,0.55569589,0.55148374,0.54101644,0.52883597,0.51471658,0.53004672,0.54541406,0.54395600,0.54035691,0.55020942,0.56296079,0.56985182,0.57689537,0.57908159,0.59073721,0.58765355,0.58677223,0.58936408,0.58566615,0.58858298,0.59215475,0.61097746,0.62341959,0.63550582,0.64433937,0.71682225,0.78568468,0.84653665,0.90318645,0.89687190,0.88799121,0.89591566,0.90214566,0.90034897,0.89214231,0.88329048,0.87197371,0.82722065,0.77611202,0.74078698,0.70453460,0.71283499,0.72797872,0.74070012,0.74495970,0.71405556,0.68329915,0.65584290,0.62617567,0.58436751,0.53820055,0.49227697,0.44452342,0.42598271,0.41328753,0.39462643,0.37656830,0.32776730,0.27398519,0.22566675,0.17232764,0.22226626,0.26473101,0.29496048,0.32431727,0.34611025,0.37770977,0.40135592,0.42733911,0.44245273,0.45929682,0.47725036,0.49256288,0.52412233,0.55787979,0.58493346,0.61323632,0.56831482,0.51768862,0.47548440,0.43352697,0.35423047,0.27028832,0.19695063,0.12443966,0.17800092,0.22305923,0.29395262,0.36011914,0.37430090,0.38232063,0.39659754,0.40967968,0.38161524,0.35014106,0.33681546,0.31735917,0.27706698,0.24190194,0.19373851,0.23627994,0.28418287,0.33579574,0.36060073,0.38715447,0.40559960,0.42588685,0.43965749,0.45230558,0.41458354,0.37954520,0.34237475,0.30628653,0.28837182,0.26344337,0.25800685,0.25459840,0.24460532,0.23309094,0.23448394,0.23725670,0.24070720,0.24961563,0.25016924,0.25839448,0.23998489,0.22067156,0.22997553,0.24108717,0.21230841,0.18524804,0.18024704,0.16360566,0.20834238,0.24976184,0.28636411,0.31695235,0.38202699,0.44490680,0.49173893,0.54930037,0.53733730,0.52775336,0.52600955,0.52406105,0.55373622,0.58117867,0.62251826,0.66355749,0.59515804,0.52119640,0.46736436,0.41605064,0.34916631,0.28188068,0.21520377,0.14467701,0.23237323,0.31823847,0.40860993,0.50304675,0.55946473,0.61014673,0.69718965,0.78233324,0.76043715,0.74623660,0.72783115,0.70824898,0.68666408,0.66641110,0.63929298,0.61751414,0.61315603,0.60472029,0.62309775,0.64300632,0.67470716,0.70923488,0.73885097,0.76984240,0.75973894,0.75406400,0.74821785,0.74109531,0.72960544,0.72287279,0.71939587,0.71407740,0.65337522,0.58829285,0.51475230,0.44403652,0.35100050,0.24715559,0.16331588,0.07974810,0.13136191,0.18128418,0.23840535,0.30124086,0.30859117,0.31841911,0.35574142,0.38805303,0.43404845,0.48396826,0.52706695,0.57772828,0.59485446,0.61129936,0.61181080,0.61848944,0.54662344,0.47361882,0.42475021,0.36897929,0.30704545,0.24027795,0.19079645,0.14442286,0.24014154,0.34087601,0.42656856,0.51058968,0.58890151,0.67101185,0.76331779,0.85684250,0.83362337,0.81126952,0.79816889,0.78170228,0.77952049,0.77710353,0.76994804,0.75987312,0.76786567,0.77053599,0.74819758,0.72925617,0.71388856,0.70046341,0.67659362,0.64948207,0.64191863,0.63017964,0.61128294,0.58916745,0.62516585,0.65346093,0.68731188,0.72268294,0.68651683,0.65405635,0.60537143,0.55191465,0.54546192,0.53862870,0.53002406,0.51814551,0.52682720,0.53673632,0.51413853,0.49581186,0.51895060,0.53694539,0.53346551,0.53382673,0.53263283,0.53978414,0.53574626,0.53428584,0.52870094,0.51779116,0.52806879,0.53717487,0.56008065,0.58799869,0.60843023,0.62979027,0.68838460,0.75215812,0.80342377,0.85160210,0.85160570,0.84973721,0.85475627,0.85010724,0.84900758,0.84404595,0.82181042,0.80081252,0.75889640,0.71941647,0.70051259,0.67260652,0.67449765,0.67123495,0.67916163,0.68513562,0.65096217,0.62093832,0.59743475,0.56820172,0.51905900,0.47386624,0.42233974,0.36868899,0.37771369,0.37966955,0.37988550,0.37553048,0.34295845,0.30565645,0.26864312,0.22526830,0.26842965,0.30831338,0.32672585,0.35214657,0.36805223,0.37895130,0.40774176,0.44265522,0.46036694,0.48405473,0.50919766,0.53579531,0.55624553,0.58785690,0.59749991,0.60715216,0.56992317,0.53810682,0.49955504,0.46025848,0.38405617,0.31451130,0.25852429,0.20497684,0.24032591,0.27162793,0.33031583,0.38806307,0.41079116,0.43641086,0.46741825,0.50269483,0.46921664,0.43275364,0.40399270,0.37801592,0.35164520,0.32292710,0.28004352,0.34202859,0.36163058,0.37811094,0.39590663,0.40386937,0.42388747,0.43600472,0.44721441,0.45430977,0.40738230,0.36376124,0.31802254,0.26935320,0.26701546,0.27408065,0.27674966,0.28480491,0.28281601,0.28038353,0.27932031,0.27886399,0.28668909,0.29017404,0.30304682,0.31820380,0.28924448,0.26779878,0.25119369,0.23175853,0.22984182,0.22870481,0.23499413,0.23914952,0.26445117,0.29034542,0.31452893,0.34029845,0.40004768,0.46643770,0.51666630,0.56967768,0.54822302,0.53150604,0.52349982,0.51396123,0.54258296,0.57750532,0.61305667,0.65149500,0.58331755,0.51259368,0.45163835,0.39263749,0.33089145,0.27259292,0.20309235,0.13666220,0.22522070,0.31601487,0.40438876,0.49864576,0.56069182,0.62781290,0.71289896,0.79600558,0.77587745,0.75121635,0.73140873,0.71756806,0.67543903,0.63183571,0.59203701,0.55635831,0.56269681,0.57460165,0.59001033,0.61431682,0.65148255,0.69598542,0.73337480,0.76816108,0.75203692,0.73949172,0.73335035,0.72923436,0.69997079,0.67705632,0.65337146,0.62795333,0.58266271,0.53738007,0.49015857,0.43635620,0.34544886,0.26307822,0.17556662,0.09545924,0.14438261,0.19478421,0.24627065,0.29803082,0.32087821,0.34537547,0.39394549,0.43793328,0.48349927,0.51954908,0.56660543,0.61464717,0.62560496,0.63046604,0.63824384,0.64792398,0.57726660,0.50963248,0.44906098,0.38743980,0.34092666,0.29213516,0.25245260,0.21869816,0.28956928,0.36242325,0.43016721,0.49490038,0.57279731,0.64720248,0.73677630,0.82511803,0.81127966,0.79430164,0.78129945,0.77050926,0.76768340,0.76559233,0.75762785,0.74692708,0.74558326,0.74344654,0.73367399,0.71578019,0.68737922,0.65340056,0.61126713,0.57797425,0.57445071,0.57061464,0.54953341,0.53426101,0.56586015,0.59770748,0.63557998,0.66728161,0.64322385,0.61297830,0.57771059,0.54784493,0.54426192,0.53850628,0.53720881,0.53656270,0.52930235,0.52094680,0.49515186,0.46182850,0.47950523,0.49209857,0.48938850,0.48933189,0.48571051,0.48754521,0.48647762,0.48629475,0.47774509,0.46786343,0.47863167,0.48338899,0.50719931,0.53256298,0.55957795,0.58256212,0.64073276,0.69779317,0.75042506,0.79821633,0.80746947,0.81854553,0.82619877,0.83215700,0.80494977,0.78344875,0.75415918,0.72790317,0.70789095,0.67855934,0.65500883,0.63490932,0.62409100,0.62385342,0.62223824,0.61952585,0.59359973,0.56657214,0.53936546,0.51746254,0.46523786,0.41434298,0.35659906,0.30162207,0.32222882,0.34597664,0.37158877,0.39109151,0.36367385,0.33840212,0.31040768,0.28325595,0.30960552,0.33644555,0.36335888,0.38924061,0.39747029,0.40405793,0.41691182,0.43117168,0.46216415,0.48606382,0.52517386,0.56414032,0.57331360,0.58692728,0.60663894,0.62348294,0.58586796,0.55487762,0.51979392,0.48479672,0.42434148,0.36710317,0.31521113,0.25855109,0.29472253,0.32067910,0.36798900,0.40851942,0.45700756,0.49978313,0.53996040,0.58580684,0.54577151,0.50527824,0.47328790,0.43923120,0.41833671,0.40135635,0.36840068,0.44452177,0.43905253,0.42930929,0.42738771,0.42592862,0.43728160,0.45104176,0.45218690,0.46359546,0.39938357,0.34315004,0.28887009,0.22971241,0.25579209,0.27775203,0.29291093,0.31637897,0.31571267,0.32273020,0.32141841,0.32340646,0.33009118,0.33569090,0.35826794,0.38124186,0.34329237,0.31063664,0.26899177,0.22553549,0.24805393,0.26704331,0.28498794,0.31000525,0.31762521,0.32216133,0.34494259,0.36356193,0.42380301,0.48801047,0.53462008,0.58943559,0.56309987,0.53533025,0.52149441,0.50526570,0.53524698,0.56666113,0.60166492,0.63852788,0.57086562,0.51010213,0.44140598,0.37551687,0.32096216,0.26874065,0.19478627,0.12362083,0.22132428,0.31186924,0.40360850,0.49785578,0.57280822,0.64108379,0.72649542,0.81189232,0.78577768,0.76034869,0.74170710,0.72707131,0.66133639,0.59346329,0.54843448,0.49825510,0.51717142,0.53626011,0.56435576,0.58271487,0.63612781,0.68427345,0.72420471,0.76928515,0.75129714,0.72543244,0.72309116,0.71690897,0.66998081,0.62714048,0.58423370,0.54280118,0.52091797,0.49523776,0.45997520,0.42847708,0.35145481,0.27406080,0.19206408,0.10881019,0.15793306,0.21119409,0.25026297,0.29772559,0.33361448,0.37301427,0.43116925,0.49463592,0.52816859,0.56036877,0.60447709,0.65296626,0.65109279,0.65444757,0.65964088,0.66949049,0.60407629,0.53895216,0.46830918,0.40015754,0.37102824,0.34558257,0.31797332,0.29069035,0.33989132,0.38920963,0.43299728,0.47355706,0.54842315,0.62513860,0.70824188,0.79979640,0.78618087,0.78172534,0.76872967,0.75765503,0.75621844,0.76001479,0.74064390,0.72762156,0.72197175,0.71958845,0.71234382,0.70877353,0.65200456,0.60382565,0.55347317,0.50508622,0.50174173,0.50788972,0.48756078,0.47187533,0.50880688,0.54590476,0.58486442,0.61689861,0.59863313,0.57285585,0.55737288,0.53615516,0.54244617,0.53850609,0.54725525,0.55472583,0.52973144,0.51090012,0.46955609,0.42929453,0.44617556,0.45796209,0.44545765,0.44170297,0.43533347,0.43072867,0.43148714,0.43717779,0.42646386,0.41443175,0.42020513,0.42851171,0.45355736,0.47716723,0.51236467,0.54025032,0.59521514,0.64271223,0.69462064,0.74347145,0.76291266,0.78648048,0.79852759,0.81388712,0.76666215,0.71803498,0.69225662,0.66135916,0.65311486,0.64286176,0.61474506,0.58886816,0.58323628,0.57039097,0.56488270,0.55043240,0.53197939,0.50472760,0.48277587,0.46366222,0.41221268,0.35279757,0.29367948,0.23313345,0.27292196,0.30662059,0.35988553,0.41068695,0.38928657,0.37268785,0.35747771,0.34513425,0.35883119,0.36796535,0.39466736,0.42097960,0.42464137,0.42757250,0.42695299,0.42622935,0.46217755,0.48908319,0.53918306,0.59391271,0.58922151,0.58580482,0.61067406,0.63962774,0.59927292,0.56937954,0.53615556,0.50674662,0.46344316,0.42312496,0.36785492,0.31750419,0.34357288,0.36914874,0.40588982,0.43324127,0.49884402,0.56098775,0.61881844,0.67478725,0.62666238,0.57656977,0.53857865,0.49920370,0.48672630,0.47953747,0.46204942,0.50334336,0.49055684,0.47657560,0.45699199,0.43658084,0.42382695,0.41382053,0.40663857,0.40033823,0.35297693,0.30618299,0.27450687,0.23782067,0.24164006,0.24795792,0.25191436,0.26063200,0.27274505,0.28519444,0.30034675,0.31341677,0.32955842,0.35180443,0.37932343,0.41750255,0.38294866,0.35237141,0.31506270,0.27915212,0.28296530,0.28950230,0.30458901,0.31807352,0.34033192,0.35757624,0.38066637,0.39658218,0.44566745,0.48824882,0.52904347,0.57422227,0.55208302,0.53128498,0.52057832,0.50995621,0.52760580,0.54525096,0.55586365,0.57013003,0.51824590,0.45896896,0.40308331,0.34645140,0.28771485,0.22853985,0.16458270,0.09898814,0.19857528,0.30571460,0.40649009,0.50929530,0.58396339,0.66597860,0.74353269,0.82691716,0.78676707,0.75544854,0.72758333,0.69827447,0.63694416,0.57344915,0.51827351,0.46537264,0.48833405,0.51375964,0.54518519,0.57784918,0.63197354,0.68422928,0.73847305,0.79324711,0.75431478,0.71691023,0.67909826,0.64980189,0.60127243,0.55886246,0.51799486,0.48206033,0.45740824,0.42845672,0.39973154,0.37162785,0.30347078,0.23852491,0.16287706,0.07998815,0.13633497,0.19305970,0.24165443,0.29205389,0.33764288,0.38439911,0.43479746,0.48998178,0.53896680,0.58251725,0.62740984,0.67234556,0.68814534,0.70278017,0.71825658,0.74160305,0.66455700,0.58316819,0.51960136,0.45247674,0.41007964,0.37371013,0.33071443,0.29245072,0.33389959,0.37717839,0.41794040,0.45337982,0.51976720,0.58657745,0.66058405,0.74111071,0.73095962,0.72592195,0.72747303,0.72509548,0.74327054,0.76083758,0.76148731,0.76512689,0.73215060,0.69542135,0.65889860,0.62800033,0.56762852,0.51338285,0.45602115,0.39429597,0.40619818,0.41923048,0.42350781,0.42013981,0.46693470,0.50898898,0.54612263,0.57808848,0.57359185,0.56783813,0.56166498,0.55910585,0.56745567,0.57596530,0.58784687,0.59291619,0.55565103,0.52130147,0.47557220,0.43435698,0.42541219,0.41646915,0.39478536,0.36283391,0.36415059,0.35635964,0.36021561,0.36680373,0.35753227,0.34787266,0.35305332,0.35638797,0.39647181,0.43674881,0.47803177,0.52039854,0.58385868,0.64183972,0.70947859,0.77754290,0.78144218,0.78117410,0.77873489,0.77152504,0.72300715,0.68383686,0.64843778,0.61231932,0.60481981,0.60157803,0.59072801,0.57779319,0.56596357,0.56001539,0.55989274,0.55315302,0.51444110,0.47830617,0.44946022,0.41699332,0.35888307,0.30558201,0.24777541,0.18797775,0.23365613,0.27732148,0.32310567,0.37645877,0.37641992,0.37345813,0.37725228,0.37645505,0.38472654,0.39495989,0.41735904,0.43109787,0.43900091,0.44021869,0.44707325,0.45797072,0.48535377,0.51163280,0.54377413,0.57986443,0.57393620,0.57168293,0.59100779,0.60824241,0.58229713,0.55918562,0.54024289,0.51963457,0.48672238,0.44967713,0.41470150,0.37831719,0.41778709,0.44934961,0.49201374,0.53623557,0.58715146,0.63261637,0.68962832,0.74110651,0.69064807,0.64111615,0.59194844,0.54491011,0.54273058,0.53756835,0.51872879,0.55906157,0.53736044,0.52146028,0.48402401,0.44835473,0.41297624,0.37957580,0.36051309,0.33811419,0.30316662,0.26644912,0.25853270,0.25116619,0.23014812,0.21716144,0.21046144,0.20119793,0.22814889,0.25374291,0.27947401,0.31006306,0.33600370,0.36014636,0.40603152,0.45114393,0.42187876,0.40010920,0.36221881,0.32510181,0.31760303,0.31124977,0.32460959,0.33020816,0.36120641,0.39846576,0.41264622,0.43447523,0.46465771,0.49277586,0.52715780,0.56583551,0.54571764,0.52296846,0.51888384,0.50729377,0.51633142,0.52434723,0.51324453,0.50537546,0.46113469,0.40677033,0.36628862,0.32183940,0.25748149,0.19161870,0.13456565,0.06980633,0.18273298,0.29491120,0.40899924,0.52515482,0.60535265,0.68536750,0.76099103,0.83799502,0.79226164,0.74648250,0.71074784,0.67160734,0.60727853,0.54834399,0.49480318,0.43839425,0.46562917,0.48813049,0.53387969,0.58016600,0.63043092,0.67731407,0.74363755,0.81083132,0.75739836,0.70189089,0.63918582,0.57818971,0.53680354,0.48846566,0.45612913,0.42513318,0.39378400,0.37232955,0.34344504,0.31941925,0.26024512,0.20952636,0.13406914,0.05481642,0.11884866,0.17805521,0.22990064,0.28601429,0.33921489,0.39258354,0.44074899,0.48652005,0.55003480,0.61186816,0.65459599,0.69683758,0.72263694,0.74581032,0.77642088,0.81156683,0.71705729,0.62846692,0.56682683,0.50655012,0.45501265,0.39967664,0.34555204,0.29177009,0.32984652,0.37157717,0.40123339,0.43769446,0.49114434,0.54651449,0.61369768,0.68442301,0.67703612,0.67565097,0.68823207,0.69832771,0.73252688,0.76356552,0.78546924,0.80113274,0.73463823,0.66891159,0.61119828,0.54850205,0.48202712,0.42300227,0.35309361,0.28784102,0.31091952,0.34115083,0.35543019,0.36461251,0.42034418,0.47241321,0.50606232,0.54587010,0.54919112,0.55761149,0.56784868,0.58103068,0.59959002,0.61547868,0.62061133,0.62709806,0.57812925,0.52880648,0.48802064,0.43800429,0.41194393,0.38344820,0.33533562,0.28740775,0.28612186,0.28282917,0.29404350,0.29780474,0.29029930,0.27813000,0.28775699,0.28999531,0.34044242,0.38801085,0.44320965,0.50137891,0.56954366,0.64183555,0.72486843,0.80435868,0.79181475,0.78427373,0.75526187,0.72614551,0.68796186,0.64364029,0.60626866,0.56244442,0.56346351,0.56168503,0.56142163,0.56443226,0.55818964,0.55075573,0.55386606,0.55544249,0.50412784,0.45209990,0.40832511,0.36700492,0.31225240,0.26343579,0.20301450,0.14258886,0.19518290,0.24046072,0.29188916,0.34313622,0.35599173,0.37510404,0.39279880,0.40992150,0.41859397,0.42380872,0.43359609,0.44862718,0.44580803,0.44491406,0.47154095,0.49282797,0.51350019,0.53782053,0.55205422,0.56746363,0.56320522,0.56049222,0.56527180,0.57682119,0.56115195,0.55156453,0.54522432,0.53797275,0.50765116,0.48041378,0.46430258,0.44233736,0.48534774,0.53219007,0.58405624,0.63652964,0.67086113,0.70710172,0.75820954,0.81137532,0.75822233,0.70572184,0.65125555,0.58762507,0.59321440,0.59551656,0.57599181,0.62960905,0.59228895,0.55127604,0.51618389,0.47871430,0.42575869,0.36861781,0.31736257,0.26631496,0.25543953,0.24210278,0.24318227,0.23339716,0.21805816,0.19284974,0.17771438,0.15419056,0.18790274,0.21726424,0.25037828,0.28008585,0.32364005,0.37057008,0.42044426,0.47627595,0.45961331,0.43720550,0.40653600,0.36809033,0.35872787,0.34127439,0.33746631,0.33884417,0.37153771,0.41137176,0.44195088,0.47259965,0.49338500,0.50852285,0.53039076,0.54947346,0.53783001,0.53158117,0.51914043,0.51325591,0.49763306,0.48990760,0.47925398,0.46790791,0.42107611,0.37395790,0.33496130,0.29496846,0.23583501,0.18379077,0.11259506,0.04973845,0.17482601,0.29766318,0.41204476,0.53198390,0.61635549,0.70095060,0.78869645,0.87445691,0.81442943,0.75244487,0.69357261,0.63241764,0.56973844,0.50665590,0.45030080,0.39650176,0.42943132,0.46747815,0.50706750,0.54606690,0.61788803,0.69316439,0.76910194,0.84315315,0.76819846,0.68674118,0.60530768,0.52554826,0.48458189,0.43704911,0.39024604,0.34281258,0.32810128,0.31174029,0.28816948,0.26580204,0.21798429,0.16793759,0.10108972,0.03615337,0.09699095,0.15429303,0.21277739,0.26898747,0.32937470,0.38964358,0.45269291,0.50668329,0.56498120,0.62235530,0.67464646,0.72310778,0.74899589,0.78058864,0.82213755,0.86496916,0.77908662,0.69153169,0.61566263,0.54205234,0.48397180,0.42335424,0.35841184,0.29311743,0.32615538,0.35242417,0.37438418,0.40108595,0.45476122,0.51391442,0.56602742,0.62608250,0.63369218,0.63609986,0.64982582,0.66334466,0.70964775,0.75800144,0.80973516,0.85759189,0.75797715,0.65969649,0.56829311,0.47184537,0.39971113,0.32532771,0.24355682,0.16306491,0.20394227,0.25345763,0.28562693,0.31691923,0.36560449,0.40833685,0.46086721,0.50428646,0.53355527,0.55307828,0.58390950,0.61059156,0.62815669,0.64645036,0.65983067,0.67095897,0.61907876,0.56527719,0.51179491,0.45184294,0.39906797,0.35313229,0.29155377,0.22368137,0.22394397,0.22120999,0.22167215,0.22286339,0.21485391,0.21004907,0.20876509,0.21243804,0.27884768,0.34186626,0.40317025,0.46514788,0.55222278,0.64021832,0.73891006,0.83216570,0.79826103,0.76910983,0.73580295,0.69722293,0.65222023,0.60346809,0.55975855,0.51905750,0.52513171,0.52827580,0.52712893,0.52905649,0.52793833,0.52517951,0.52799039,0.53830099,0.48177093,0.42464269,0.36825403,0.30561660,0.25864776,0.21180331,0.15572913,0.09683924,0.15868778,0.21604039,0.26301343,0.31063592,0.33923117,0.37112324,0.40385713,0.43743651,0.44584331,0.44802312,0.45440514,0.45226129,0.46625667,0.48246822,0.49747322,0.51372880,0.52808760,0.54343875,0.55419377,0.56727775,0.55437332,0.54246311,0.54098030,0.53728104,0.53863453,0.54074853,0.55368585,0.57022405,0.54283781,0.52011598,0.50458403,0.49430567,0.54696188,0.60163001,0.66198130,0.72452261,0.76306683,0.80610347,0.85863146,0.90386708,0.84184289,0.77543090,0.70551758,0.64631722,0.64599685,0.64254807,0.63562838,0.69747437,0.64130370,0.58135831,0.54503749,0.51031854,0.42920156,0.35569202,0.27838594,0.20030000,0.21435547,0.22094309,0.21937966,0.22388839,0.19481984,0.16990458,0.14249643,0.10741898,0.14564595,0.18412816,0.22256028,0.25132785,0.31655045,0.37113608,0.43970981,0.50525607,0.48895090,0.47942305,0.44954729,0.41556537,0.39815287,0.37140993,0.35670127,0.34346918,0.38838057,0.42743425,0.46898161,0.51288041,0.52260651,0.53121139,0.52780906,0.53072898,0.52882519,0.53613015,0.52259936,0.51480108,0.48789982,0.45658614,0.43847847,0.42423932,0.38142818,0.33445957,0.30480164,0.26907119,0.21759232,0.16947844,0.09652388,0.02527149,0.16369460,0.29413996,0.41927080,0.54634168,0.63543639,0.72186991,0.81919022,0.91579440,0.83792498,0.76594592,0.67911334,0.60030812,0.53854375,0.47073046,0.41156490,0.35070305,0.39978424,0.44689980,0.48172851,0.51536233,0.60824296,0.70219542,0.78492812,0.87649934,0.77427082,0.67651092,0.57440123,0.46932079,0.42826620,0.38180276,0.32643004,0.26521457,0.25444362,0.24738854,0.23099831,0.21956221,0.17797265,0.13804535,0.07337355,0.00810986,0.07424625,0.13464232,0.19776743,0.25112506,0.32232554,0.39236276,0.45839612,0.52450842,0.57779196,0.63735595,0.69123510,0.75349848,0.78049229,0.80817894,0.87044103,0.93029979,0.83690542,0.74802759,0.66723524,0.58161686,0.51712784,0.44936165,0.37455388,0.29615392,0.31809502,0.33585178,0.35255538,0.36519288,0.41905975,0.47619636,0.51648811,0.56430995,0.57998771,0.60124352,0.61296961,0.62332965,0.69255970,0.75165230,0.83159439,0.91350659,0.78215220,0.65437991,0.52443415,0.39105974,0.31255217,0.23070118,0.13229741,0.03162050,0.10149824,0.16973891,0.21471697,0.26245574,0.30723717,0.34905034,0.41199584,0.46578700,0.51002028,0.55172379,0.59387291,0.64456389,0.66489491,0.68651627,0.69896240,0.71489451,0.65685552,0.60314275,0.53161193,0.46530864,0.39464417,0.32016415,0.24365306,0.15950958,0.15875798,0.15424718,0.15143003,0.14478885,0.14464218,0.13803387,0.13947716,0.12999868,0.21355795,0.29525429,0.36700756,0.43320526,0.53342595,0.63358292,0.75007390,0.86189427,0.80956336,0.75539138,0.71681961,0.67317277,0.61397619,0.55396950,0.51564000,0.47081433,0.48181765,0.49808885,0.49206023,0.49332759,0.49885208,0.49763617,0.51130952,0.52182366,0.46371928,0.40497764,0.32129931,0.24335640,0.19928611,0.15357206,0.10656586,0.05084203,0.12007231,0.19484204,0.23341438,0.27827797,0.31989611,0.36082489,0.41321165,0.46310376,0.46623546,0.47738687,0.46716514,0.46048590,0.48521056,0.51792611,0.52192254,0.53100623,0.54306425,0.55471301,0.55898827,0.56638968,0.54538822,0.52744023,0.51521697,0.50230080,0.51609804,0.52980987,0.56519558,0.60425514,0.57835427,0.55261346,0.55264956,0.55102753,0.61182272,0.66600803,0.74201932,0.81565677,0.85970165,0.90629062,0.94691377,0.99966729,0.91628189,0.83782329,0.76639233,0.69414016,0.69553562,0.68948368,0.69224994,0.64604581,0.60152918,0.55668825,0.52688711,0.49944515,0.44512960,0.39161102,0.33052536,0.26478277,0.26552839,0.25751435,0.25672865,0.25341661,0.23313318,0.20623394,0.18553146,0.16343286,0.20656819,0.25106151,0.30333062,0.34948121,0.39714544,0.44787063,0.49217520,0.53442853,0.52493678,0.50526662,0.48701507,0.47329566,0.44400058,0.42282712,0.40524730,0.38955576,0.42806881,0.46039442,0.50065994,0.53947730,0.53949066,0.54680151,0.54297471,0.54232667,0.53834172,0.54223067,0.53113371,0.52232257,0.49981175,0.48100513,0.46999722,0.46236078,0.42038084,0.37971610,0.35101793,0.31523185,0.27595699,0.23884041,0.19592854,0.14503344,0.24104210,0.33448231,0.43020804,0.52498839,0.60296597,0.68495987,0.76416942,0.84629694,0.77212528,0.69916873,0.63819064,0.57377620,0.51182539,0.45501135,0.39919373,0.34525565,0.38886388,0.42842748,0.46860734,0.50586248,0.57453267,0.64619392,0.72132786,0.79484106,0.70958222,0.62424720,0.53487614,0.44371470,0.39794544,0.35807850,0.31729747,0.27495670,0.27070297,0.27007588,0.26892860,0.27592579,0.23948799,0.20315779,0.15652311,0.11192148,0.17004344,0.22259967,0.28052562,0.33677184,0.39366653,0.44566692,0.49408481,0.53634211,0.58330008,0.63117711,0.67738466,0.72440526,0.74772621,0.77389549,0.81377966,0.85035856,0.78362168,0.71944894,0.66844576,0.61253846,0.54303810,0.47972946,0.42402072,0.36449074,0.36938564,0.38141802,0.39326076,0.40001834,0.43656041,0.47500566,0.50550212,0.53520408,0.55443105,0.57897479,0.58800969,0.59925719,0.65977643,0.72470034,0.78838931,0.85197986,0.74247428,0.63211643,0.52340221,0.42014502,0.34673022,0.27952185,0.20716981,0.13336960,0.18045372,0.23180053,0.25771144,0.29079208,0.32962887,0.37243436,0.40435206,0.44410887,0.48012895,0.51376706,0.54941226,0.57926128,0.59374564,0.60106288,0.61521606,0.62907926,0.58945066,0.54445967,0.48931637,0.42983818,0.37921227,0.31776562,0.27205618,0.22022369,0.20970246,0.20346600,0.20533215,0.21341686,0.21935009,0.22680829,0.23307108,0.23992304,0.30776204,0.38364507,0.43904184,0.50185468,0.58529233,0.66378541,0.75275361,0.83832601,0.79056404,0.74600537,0.70935533,0.67918246,0.62667928,0.57543188,0.52776450,0.47677395,0.48848981,0.49139228,0.48703662,0.48795655,0.49232259,0.50684045,0.51203721,0.52324915,0.46137198,0.40082187,0.33673266,0.26692569,0.23382662,0.19547810,0.15100999,0.11067589,0.17078164,0.22957664,0.27451364,0.31787804,0.35818325,0.39340226,0.43350771,0.47363176,0.47256438,0.47693934,0.47232269,0.47071458,0.49143007,0.51334713,0.51625343,0.52393560,0.52589701,0.52314878,0.53022126,0.53919630,0.51807975,0.49947094,0.48326771,0.46310093,0.48727632,0.51032190,0.53771113,0.56194378,0.55736999,0.55125475,0.54612902,0.54693167,0.58915690,0.63640907,0.67789437,0.71961959,0.77459458,0.82156560,0.86739278,0.90476776,0.84519767,0.78823134,0.72881833,0.67305931,0.66145500,0.65660767,0.64854598,0.59181533,0.55664276,0.52215751,0.50864457,0.49086409,0.45650563,0.42798890,0.38114492,0.32870703,0.31515166,0.29511046,0.29159074,0.28652560,0.26643730,0.24728931,0.23046962,0.22304352,0.26983655,0.31837358,0.38362151,0.44609775,0.47978593,0.51868879,0.54235479,0.56793463,0.55252225,0.53675624,0.53633388,0.52911789,0.49814115,0.46562098,0.45282909,0.43885738,0.46774037,0.49047548,0.53057784,0.56427541,0.56333188,0.56067433,0.55785583,0.55053553,0.54835235,0.54844666,0.53420030,0.52409448,0.51818594,0.50669422,0.50536957,0.50115251,0.45884070,0.42044139,0.39167000,0.36373472,0.33921866,0.30934325,0.28973918,0.26477161,0.32309768,0.37603188,0.44215795,0.50082351,0.57191373,0.64613502,0.71117419,0.78110726,0.70578531,0.63245078,0.59242859,0.54780126,0.49050562,0.43923358,0.39213581,0.33740328,0.37522190,0.41447999,0.45200850,0.49192072,0.54242411,0.58842839,0.65504607,0.71632510,0.64502701,0.57812055,0.49417231,0.41556026,0.37591669,0.32989445,0.30833828,0.27944997,0.28431972,0.29379399,0.30962912,0.32990859,0.29845329,0.26878415,0.24197957,0.21735238,0.26620315,0.30441228,0.36119939,0.41848885,0.46219752,0.50320880,0.52922924,0.55284230,0.59154704,0.62944666,0.66775268,0.69957005,0.72099700,0.73439563,0.75339450,0.77465931,0.73677937,0.69333317,0.66677244,0.64028372,0.57489619,0.51239047,0.47152282,0.43083843,0.42903340,0.42604648,0.42726792,0.43378948,0.45376407,0.47138166,0.48613939,0.49945729,0.52742467,0.55446176,0.56085085,0.57270894,0.63561232,0.69742323,0.74293266,0.78474466,0.69964651,0.61136293,0.52307947,0.44257593,0.38675788,0.32979954,0.27653868,0.22578789,0.25935400,0.29459643,0.30596045,0.31572859,0.35561791,0.38883533,0.40199300,0.41588194,0.44662338,0.47868672,0.49565268,0.51522589,0.52145332,0.52200117,0.53417779,0.54837546,0.51564462,0.48695300,0.44318023,0.40270531,0.36075976,0.32030613,0.29688361,0.27671317,0.26639364,0.25112015,0.26319250,0.27785072,0.29864112,0.31891442,0.32919353,0.34705697,0.40870824,0.46810894,0.51539843,0.57255123,0.63018606,0.68961631,0.75252213,0.81444305,0.77587066,0.73720401,0.71122670,0.68134803,0.63766187,0.59986343,0.54402603,0.48148183,0.48656754,0.49157132,0.48587443,0.48033963,0.49464362,0.51004064,0.51736143,0.52874005,0.46556537,0.39563167,0.34459323,0.28534486,0.26253981,0.23892282,0.19940581,0.16834691,0.21728450,0.26293873,0.31242210,0.36398450,0.39022479,0.41685597,0.44900634,0.48010088,0.47727231,0.47291756,0.47826320,0.48187709,0.50005214,0.51667828,0.50930125,0.51235135,0.50673450,0.49688258,0.50486270,0.51054050,0.49286019,0.47875819,0.45070630,0.43032226,0.45689996,0.48882537,0.50573506,0.52665160,0.53730643,0.54524403,0.53899546,0.53754777,0.57349492,0.60799214,0.61878895,0.63052860,0.68881333,0.74350673,0.77881902,0.81884534,0.77151653,0.73268294,0.68759763,0.64847347,0.63212805,0.61729537,0.60538712,0.52949605,0.51565159,0.49952066,0.48839989,0.47984270,0.46239589,0.44926631,0.42879132,0.40206706,0.37208122,0.34332996,0.32305626,0.30288664,0.29633489,0.28873175,0.26890716,0.25111068,0.31760163,0.38741264,0.45408809,0.52354321,0.54009618,0.55361315,0.58058635,0.60462142,0.59363918,0.58819546,0.58208538,0.57917033,0.54693421,0.51487391,0.49824944,0.47669961,0.50342010,0.53338977,0.57325848,0.60872367,0.59828691,0.58576617,0.57882917,0.57078492,0.56663999,0.56518592,0.55211035,0.54172389,0.53385567,0.53138963,0.53103527,0.53705900,0.50327919,0.47084675,0.44507138,0.41093477,0.40330071,0.39409869,0.38344053,0.37321507,0.39891198,0.42462990,0.45659042,0.48523953,0.54347727,0.59899199,0.65081887,0.70342897,0.64550545,0.59087840,0.54360027,0.49976211,0.45881176,0.42237478,0.38116795,0.34758478,0.36716894,0.39283740,0.42442749,0.45404082,0.50203404,0.55292290,0.60490935,0.65665400,0.58801578,0.51406346,0.44501818,0.37589481,0.34914593,0.32440416,0.29716864,0.27463651,0.29584555,0.31680102,0.34889739,0.37505747,0.35986583,0.34639469,0.32944331,0.31778695,0.35654263,0.40233671,0.45524374,0.50232623,0.52221055,0.54633065,0.55840153,0.57430530,0.60731586,0.63827752,0.66488634,0.69172957,0.69041139,0.69018214,0.69439763,0.69368405,0.67878974,0.66335930,0.66238516,0.65658565,0.61062564,0.56408907,0.52241441,0.48888963,0.47462649,0.46331265,0.45478689,0.45170239,0.45668353,0.46146111,0.47141182,0.47927423,0.49323428,0.50776030,0.51602168,0.52663023,0.59001728,0.65226231,0.69694283,0.74912656,0.67058757,0.59624972,0.51674971,0.44139203,0.40912793,0.38463911,0.35701636,0.32748610,0.34115449,0.35631099,0.35658256,0.35533111,0.37210155,0.39222872,0.39408205,0.39619767,0.41955406,0.44348260,0.45517360,0.47320813,0.47468414,0.47045652,0.46681500,0.46288322,0.43741180,0.41695331,0.38558433,0.35229899,0.33821714,0.32966537,0.32720063,0.31880456,0.31609114,0.30926042,0.31017464,0.30828132,0.34441950,0.38181110,0.41664961,0.44670570,0.49439034,0.53528186,0.57850818,0.62113398,0.67243773,0.71556785,0.76372019,0.81311312,0.77937531,0.74548531,0.71828713,0.69480279,0.64798059,0.60576641,0.55892239,0.51062313,0.49745994,0.49269258,0.47929220,0.46536797,0.47940929,0.49395843,0.51228131,0.53110309,0.47780924,0.42403019,0.36555059,0.31303301,0.28800571,0.26173024,0.23687334,0.20678011,0.25617335,0.30067956,0.34655035,0.39896939,0.42413216,0.44773453,0.46660640,0.48889358,0.48790335,0.48720191,0.49336657,0.49677536,0.50098636,0.49717078,0.49291243,0.48632445,0.48518800,0.48394646,0.48380887,0.47570525,0.46073543,0.44262685,0.41927465,0.39739240,0.42063437,0.44353563,0.46677233,0.49479627,0.50805283,0.51561363,0.53675134,0.55102840,0.55347288,0.55842778,0.55801512,0.55637622,0.60632550,0.65771617,0.70067387,0.74163502,0.70455087,0.66966029,0.63609879,0.59989310,0.58502299,0.56896924,0.55049957,0.46364817,0.46612482,0.47273670,0.47287603,0.46796902,0.47119067,0.47814188,0.47644082,0.47626269,0.43532847,0.39218029,0.35810221,0.32190783,0.32777099,0.33347748,0.30256278,0.27383279,0.36643038,0.45843545,0.53008809,0.60323803,0.60101799,0.59426659,0.61456522,0.63322323,0.63682188,0.63640597,0.63297897,0.63663349,0.59953606,0.56832668,0.54033767,0.51345203,0.54544410,0.57961400,0.61322428,0.65362815,0.63016312,0.60266443,0.59793229,0.58136940,0.58523401,0.57952835,0.56481005,0.55430828,0.55001779,0.54805926,0.56175224,0.57165973,0.54370386,0.52682318,0.49249309,0.45729279,0.46695459,0.47212581,0.48038543,0.48598907,0.47913720,0.47481325,0.47390076,0.46716283,0.51526173,0.55413178,0.59305407,0.63406322,0.58753882,0.54064887,0.50044950,0.45636998,0.43069326,0.39907557,0.37480671,0.35214867,0.36109213,0.36810521,0.39931769,0.42218419,0.46783484,0.51583798,0.55261667,0.59709533,0.52309463,0.45120084,0.39156655,0.33127819,0.32432920,0.31938401,0.29257572,0.26598829,0.30177162,0.33970019,0.37905895,0.42259799,0.42227898,0.42920347,0.42173351,0.41016751,0.45178706,0.49519428,0.54036893,0.58911840,0.58851913,0.59513181,0.59702313,0.59848571,0.62238514,0.64846464,0.66465462,0.68925775,0.66321777,0.64175303,0.63021531,0.61586853,0.62356755,0.63095426,0.65204762,0.67872158,0.64303361,0.61523483,0.57773828,0.54363514,0.52609779,0.50362458,0.48623773,0.46908147,0.46173861,0.45437717,0.45915391,0.45746214,0.46085420,0.45838345,0.47210962,0.47674164,0.54066977,0.60652455,0.65495406,0.71423531,0.65076654,0.58717737,0.51266497,0.43619782,0.43642619,0.44218898,0.43579710,0.43512081,0.42782157,0.42091521,0.40940247,0.39882375,0.39340971,0.39330705,0.38677031,0.37554579,0.39314521,0.40539335,0.41618319,0.43106459,0.42080723,0.41655640,0.39349812,0.37576168,0.36243100,0.35001422,0.32787424,0.29768490,0.32096721,0.33862011,0.35301789,0.36569308,0.36446093,0.37090792,0.35947836,0.34234655,0.39563204,0.43987784,0.49733994,0.55229205,0.57537772,0.60346677,0.64158361,0.67722235,0.71176995,0.74364518,0.77713379,0.81040922,0.77590140,0.74483416,0.72581709,0.70892312,0.66068782,0.61222291,0.57480824,0.53234052,0.51525158,0.49283500,0.47610974,0.45144877,0.46261599,0.47561970,0.50686348,0.53143711,0.48584504,0.45022573,0.38654217,0.33044122,0.30690490,0.28423893,0.26914227,0.25151358,0.29605737,0.33538877,0.38473076,0.43855822,0.45596853,0.47742980,0.49133982,0.50145618,0.49802265,0.49469839,0.50760763,0.51183123,0.49973280,0.48057564,0.47646726,0.46281113,0.46961372,0.47536102,0.46245518,0.44892205,0.42911242,0.40842716,0.38576807,0.36846987,0.38463811,0.40162974,0.43449638,0.46746992,0.47631996,0.48764612,0.52740035,0.56875815,0.53935999,0.50451068,0.49188815,0.47615726,0.52859412,0.57513278,0.61850815,0.66402554,0.63629267,0.61261464,0.58778588,0.56041537,0.54562432,0.52795977,0.49610505,0.43270446,0.44741781,0.45674220,0.47584138,0.49158436,0.50244188,0.50709763,0.51903934,0.53073816,0.49020363,0.44384218,0.41085819,0.37534154,0.38204680,0.38754209,0.36549851,0.34787120,0.41367140,0.47883299,0.54738692,0.60918754,0.62519716,0.64654803,0.66995196,0.69870327,0.69143768,0.67871109,0.66669058,0.64901014,0.62152073,0.59143431,0.57100408,0.54372206,0.57717269,0.60738882,0.63695816,0.66286945,0.66374789,0.66180017,0.66441196,0.66277986,0.64192629,0.62509448,0.60207817,0.57644894,0.57035683,0.56088527,0.56286184,0.56097271,0.54722954,0.53159573,0.51702515,0.50713679,0.52864394,0.55007352,0.57402911,0.60078232,0.58204157,0.56578808,0.54608418,0.52973850,0.54129678,0.55170711,0.55501515,0.55860690,0.52105283,0.48478875,0.45203155,0.42143281,0.39784765,0.36956064,0.33801720,0.31467234,0.33088936,0.33964008,0.36036678,0.37625844,0.40745323,0.44381951,0.47210313,0.50672623,0.46038966,0.41378829,0.37602843,0.34636170,0.32455014,0.30360365,0.28260802,0.26031276,0.30559810,0.35187425,0.40241814,0.45093295,0.47363001,0.50152057,0.53242211,0.55544647,0.57259772,0.59329486,0.60167602,0.61661221,0.61152648,0.60001970,0.59075715,0.58074652,0.60581473,0.62709690,0.64092026,0.65822378,0.64463868,0.62891997,0.62159127,0.60840738,0.62319347,0.63371745,0.65810020,0.68016392,0.65333998,0.62304389,0.60398958,0.58101004,0.55482045,0.52464119,0.50912695,0.49165377,0.46720947,0.44698206,0.43005819,0.42304850,0.43128834,0.44259824,0.46299708,0.47506333,0.52149987,0.56837175,0.60445708,0.64047582,0.58968128,0.53997112,0.49132361,0.43875289,0.44619442,0.45474076,0.45834571,0.46266328,0.44880615,0.43075275,0.41746737,0.40480051,0.39797061,0.39238169,0.37213158,0.35716827,0.35782953,0.36631405,0.37096470,0.38026708,0.37118675,0.35877264,0.33599352,0.32037290,0.32177917,0.32472583,0.31734052,0.30906598,0.32372898,0.34262926,0.35784722,0.37285056,0.39760913,0.41488842,0.43392501,0.44401541,0.49900217,0.54956198,0.60079417,0.64575348,0.66394601,0.67820501,0.69450349,0.71615173,0.74290471,0.76660730,0.79565935,0.82415511,0.79706986,0.76617607,0.73395482,0.70253356,0.65899995,0.61680767,0.58093411,0.53571211,0.52483058,0.51483915,0.49662519,0.47781728,0.48305973,0.48632788,0.50206027,0.51686688,0.47970402,0.43799927,0.39339796,0.34865093,0.32845295,0.30222799,0.29327187,0.28500067,0.32753761,0.36432189,0.40331109,0.44951179,0.47603102,0.49884447,0.51522718,0.53549692,0.53508650,0.52912774,0.54292948,0.55347877,0.53792747,0.52202646,0.50811349,0.49275666,0.48791503,0.48688861,0.46502730,0.44578247,0.40288365,0.37001665,0.32514614,0.28445048,0.30750237,0.32925810,0.36286926,0.39511040,0.42875047,0.46268649,0.49558203,0.53056614,0.50010856,0.46708932,0.45096268,0.43627679,0.46637918,0.50154387,0.52222853,0.54590533,0.53479211,0.52102519,0.51608543,0.50703812,0.48577107,0.46781875,0.45079226,0.40235574,0.42330175,0.44259183,0.47986367,0.51829735,0.53030409,0.54122803,0.56433278,0.58871483,0.54282759,0.49815600,0.46438917,0.42231866,0.43457135,0.44147977,0.42869422,0.41054883,0.45642251,0.50056489,0.56565985,0.62386817,0.65383972,0.69022878,0.72406319,0.75913983,0.74031601,0.72441418,0.69449532,0.66991580,0.64042584,0.60865098,0.59489208,0.58120328,0.60778158,0.63556899,0.65494956,0.67006953,0.69717146,0.71902395,0.73104474,0.74153462,0.70361418,0.66323333,0.63181981,0.60180475,0.58069917,0.56570432,0.56464179,0.55689704,0.55153390,0.53829037,0.54403125,0.55102779,0.58526916,0.62276160,0.67186156,0.71980802,0.68580445,0.65697057,0.62407170,0.58777197,0.57101329,0.55003221,0.51908595,0.48169892,0.45565971,0.42235111,0.41004837,0.39320203,0.35991277,0.33235708,0.30854311,0.27717179,0.29973127,0.31417110,0.32310551,0.32271105,0.34864865,0.37692308,0.39858341,0.41897654,0.39374269,0.37451884,0.36308104,0.35700314,0.32234955,0.28463447,0.27465030,0.26157794,0.31190855,0.36127997,0.41971441,0.48003410,0.52789597,0.57179940,0.64015018,0.70728182,0.69557387,0.68976416,0.66953125,0.64442338,0.62678069,0.60611827,0.58623527,0.56189824,0.58617920,0.60856099,0.61813938,0.62701612,0.61872957,0.61582986,0.60771084,0.60415767,0.62019333,0.64043426,0.66212735,0.69089994,0.66423021,0.63400798,0.62852173,0.62108624,0.58492027,0.54369038,0.53262960,0.51649363,0.47084422,0.43110322,0.40628526,0.38281333,0.40388402,0.42697129,0.44803942,0.47437571,0.50260087,0.53803388,0.55550333,0.57457398,0.53280208,0.48599451,0.46743821,0.43968639,0.45466040,0.46343171,0.47865815,0.49757983,0.47071292,0.44571857,0.43140976,0.40710211,0.39925602,0.39527434,0.36304333,0.33799796,0.33198117,0.32004482,0.32649754,0.33169108,0.31252465,0.29965432,0.28142054,0.26357762,0.28140281,0.30611382,0.30689925,0.31338241,0.32995491,0.34999874,0.36825533,0.38382431,0.42326763,0.46616084,0.50713285,0.54374705,0.60027566,0.65827503,0.69818171,0.74520942,0.74734149,0.74736750,0.75149999,0.75906002,0.77533329,0.78955095,0.81606273,0.83792511,0.81298341,0.79009940,0.74809114,0.69886651,0.66325195,0.62658518,0.58449681,0.54846694,0.54454361,0.54484497,0.52258715,0.50548673,0.50427744,0.49710240,0.50132433,0.51048589,0.47139419,0.43530374,0.40263759,0.37212345,0.34809917,0.32187954,0.31989683,0.32149241,0.35563075,0.39343496,0.42194444,0.45426643,0.49364193,0.52940026,0.54334456,0.56517535,0.56520757,0.56277737,0.57938001,0.59451910,0.58097954,0.56315838,0.54619492,0.52066761,0.50914521,0.50358388,0.47218232,0.43805334,0.38400114,0.32937832,0.26391826,0.20838756,0.22760357,0.25027392,0.29036089,0.32580422,0.37966446,0.43140549,0.45967890,0.49808537,0.46766544,0.43051417,0.41174791,0.39086458,0.41092042,0.42598764,0.43107529,0.43563282,0.43509504,0.43400021,0.44668538,0.44981738,0.42984997,0.40577295,0.40660196,0.34914045,0.38503989,0.42157906,0.47616189,0.52976378,0.55009631,0.56773367,0.60306999,0.63318421,0.59602360,0.55228041,0.51506634,0.47590892,0.48588401,0.48968305,0.49047677,0.48705645,0.52354204,0.55685231,0.59182072,0.62478417,0.67552348,0.72243522,0.77951190,0.83764397,0.79196236,0.75719523,0.71657436,0.67717330,0.65811678,0.63088961,0.62435082,0.61398687,0.63518215,0.65550465,0.67116197,0.69407904,0.73172368,0.76597359,0.79546004,0.82662215,0.77396890,0.71714045,0.65804122,0.60326826,0.59120142,0.57135673,0.56921903,0.56156874,0.56833198,0.57469634,0.57959827,0.58842279,0.65174982,0.71095485,0.77397369,0.84251753,0.78806964,0.73593685,0.69607344,0.65060171,0.59780445,0.54408204,0.48457924,0.41968441,0.40669442,0.38569420,0.36738601,0.35081538,0.32427098,0.29578989,0.27307234,0.25445648,0.26961471,0.28330575,0.28492188,0.29251333,0.30318832,0.30918345,0.31513972,0.31426098,0.32107159,0.33378141,0.34501149,0.35271223,0.32237213,0.28783140,0.26478122,0.23382935,0.30466349,0.37531418,0.44040167,0.50144905,0.58281031,0.66249697,0.75083782,0.83605381,0.80100375,0.76554472,0.72936654,0.69597304,0.66266408,0.63271950,0.59877486,0.56194046,0.57475685,0.57787595,0.59247529,0.60237436,0.59965747,0.59172781,0.58498598,0.57759335,0.59784818,0.62336414,0.65902402,0.68946789,0.67811916,0.65996448,0.66567955,0.66450522,0.62874079,0.59115547,0.55935769,0.52644012,0.47771835,0.43595391,0.39117798,0.34077770,0.38000015,0.41377391,0.44668193,0.47832324,0.48194104,0.48906122,0.49136628,0.49827179,0.48007568,0.46148196,0.45006286,0.43740644,0.46490909,0.49074646,0.51370973,0.53810156,0.50973957,0.48118638,0.45206111,0.43127916,0.40632713,0.38124685,0.34704469,0.31576355,0.30500078,0.29608077,0.27499858,0.25855261,0.24824644,0.24158184,0.22048570,0.20387143,0.23536987,0.26663734,0.28882086,0.31593821,0.33111614,0.35232032,0.37351361,0.40052266,0.45932870,0.51840684,0.58074719,0.64072421,0.69422061,0.74965770,0.79663804,0.85047132,0.83503550,0.82679230,0.81346430,0.80254913,0.81592610,0.83006606,0.85375742,0.87488302,0.83700124,0.79792489,0.75901846,0.72030194,0.67613548,0.63584349,0.58923550,0.54489550,0.55034028,0.55071044,0.55275615,0.55216887,0.53219524,0.51475508,0.50372546,0.49456076,0.46349221,0.43563183,0.40381291,0.37782821,0.36238996,0.35531150,0.34350182,0.33353529,0.37209951,0.40554941,0.44184938,0.47713632,0.50792872,0.53724810,0.57133660,0.59872850,0.59762714,0.59864182,0.61631895,0.63231519,0.61484692,0.59595001,0.57989048,0.56021317,0.53135289,0.49757610,0.47060174,0.43702780,0.35354723,0.27653171,0.18984986,0.11079853,0.14725642,0.18471879,0.23203802,0.27328830,0.32705502,0.37742954,0.42207763,0.45806842,0.42318825,0.38889853,0.36593712,0.34253838,0.34411891,0.35282540,0.33711907,0.32559557,0.34352650,0.36515505,0.38554917,0.41286608,0.39634209,0.37708077,0.36289082,0.29195601,0.34601838,0.39903138,0.47417009,0.54269534,0.57404256,0.60101529,0.63823293,0.68023073,0.64521381,0.60936651,0.57031514,0.52957975,0.53589650,0.53902880,0.55183814,0.56363163,0.58614051,0.60660009,0.61981777,0.62615815,0.68898554,0.74935886,0.83034282,0.91151495,0.84738109,0.78729730,0.73888712,0.68608549,0.66798659,0.65238846,0.64831907,0.64855525,0.65885491,0.67353704,0.69583542,0.71546986,0.76557007,0.81670073,0.86394302,0.91257352,0.84084059,0.77189872,0.68864510,0.60483568,0.59313317,0.57573539,0.57292080,0.56822609,0.58473248,0.60580418,0.61482025,0.62493353,0.70993765,0.79267189,0.87721563,0.96402419,0.88840595,0.81174974,0.76195919,0.71732408,0.62749666,0.53648348,0.44818620,0.35945893,0.35784650,0.35310142,0.32583865,0.30325806,0.28193780,0.26199207,0.24078300,0.22259217,0.23364744,0.25019795,0.25380340,0.25276403,0.24660085,0.24711489,0.22756366,0.20860599,0.24980153,0.28858770,0.31949603,0.35905114,0.32514308,0.28892868,0.24783396,0.21191437,0.30300690,0.39398053,0.45838583,0.52245412,0.63723486,0.74909480,0.85909380,0.96884317,0.90877830,0.84527486,0.79518540,0.75121565,0.70020221,0.65201726,0.61086841,0.56386960,0.55962146,0.54967719,0.56594251,0.57570395,0.57050961,0.57246533,0.55980210,0.55444507,0.58277741,0.60366701,0.65195161,0.69726073,0.69363799,0.68786310,0.70315888,0.71522381,0.67094245,0.63534655,0.58892026,0.54227093,0.49003906,0.43754030,0.36719487,0.30224552,0.34853474,0.39682045,0.43565459,0.48467321,0.46467189,0.44398787,0.43522611,0.42392357,0.42865254,0.43091704,0.43475980,0.43373793,0.47655990,0.51565549,0.54737414,0.58164911,0.54559533,0.51600725,0.48353369,0.44673112,0.40805003,0.36696531,0.33131219,0.29606799,0.27993667,0.26846948,0.22419991,0.18348195,0.18551692,0.18303537,0.16446351,0.13844662,0.19022604,0.23431402,0.27305784,0.31397864,0.33580580,0.35412710,0.38261989,0.41383902,0.49567674,0.57510520,0.65758988,0.74448008,0.79067693,0.83912188,0.89749586,0.95861289,0.92891553,0.90126012,0.87204047,0.84322262,0.85219950,0.86525558,0.89013811,0.91424096,0.85975806,0.81088923,0.77304096,0.73916365,0.69424121,0.64775454,0.59346484,0.54059924,0.55453439,0.56502237,0.57514045,0.59500846,0.56104716,0.53597880,0.50822176,0.47680046,0.45454577,0.43076288,0.40447393,0.37842883,0.38349389,0.38988800,0.37125363,0.35208250,0.38770510,0.41524544,0.45534081,0.49282977,0.52472318,0.55152546,0.59395618,0.63048518,0.63172590,0.63627351,0.65536171,0.67715965,0.65116478,0.62609807,0.61219572,0.59969741,0.54770390,0.49498234,0.46852804,0.44175315,0.33010142,0.22182566,0.11974893,0.01318119,0.06823314,0.12111082,0.17306176,0.21762719,0.27414884,0.33041694,0.37781404,0.42159524,0.38717939,0.34732577,0.32228095,0.29021535,0.28397478,0.28292004,0.24653033,0.21645723,0.25961179,0.29473786,0.33368408,0.37364086,0.36148338,0.34838893,0.31971321,0.29122079,0.33216462,0.38194023,0.44047624,0.49621688,0.53227287,0.56828199,0.60607117,0.64136553,0.61426422,0.58272389,0.54897871,0.51694978,0.51973252,0.52329867,0.52397194,0.52520344,0.55515938,0.59093455,0.61629857,0.64008898,0.68870739,0.73796144,0.79684264,0.85406718,0.81686456,0.77285960,0.73854818,0.70650875,0.68990226,0.67189578,0.65895922,0.64362177,0.66047966,0.67302526,0.69910765,0.71781349,0.75468352,0.79162550,0.82953674,0.86344165,0.80695905,0.74023962,0.68352647,0.61920649,0.61762611,0.60946476,0.60034142,0.58584405,0.59881654,0.61345298,0.62964530,0.64589646,0.69474669,0.74759128,0.79941618,0.85323611,0.79139735,0.73162286,0.68302407,0.63428983,0.56052095,0.49098647,0.41214812,0.33749762,0.35130601,0.35996059,0.35920268,0.35079914,0.33972971,0.33398349,0.32034496,0.31169091,0.31079318,0.31017696,0.30606636,0.29887329,0.29569216,0.29323752,0.28324098,0.27374784,0.29256654,0.31924812,0.34300036,0.36582233,0.34439141,0.31792595,0.29067738,0.26026465,0.32173937,0.38361310,0.44042467,0.49163861,0.58367428,0.67270788,0.75169209,0.83355331,0.79986156,0.76317891,0.74351862,0.71732277,0.68785723,0.65637974,0.62437138,0.60147981,0.58065985,0.56780553,0.55606074,0.54715733,0.53780216,0.52448524,0.51074056,0.48741858,0.52484417,0.55689274,0.60193403,0.64510005,0.64015726,0.63453538,0.65323435,0.66630737,0.62886621,0.59031954,0.54842271,0.50924232,0.47721722,0.45258462,0.40913122,0.36761128,0.39655151,0.42984503,0.45024833,0.47795208,0.45432134,0.43266142,0.41901322,0.40167615,0.41034495,0.41636520,0.42746644,0.42909937,0.46375953,0.48950797,0.51306115,0.53750207,0.52381790,0.51451801,0.50226441,0.48477772,0.46054940,0.43160616,0.39962428,0.37195710,0.34253553,0.30774918,0.27887331,0.24086939,0.22676587,0.21400130,0.19900331,0.18049186,0.21083246,0.24632255,0.28117905,0.31513743,0.33030953,0.33616532,0.35655128,0.37628566,0.44968145,0.52660934,0.59265451,0.66201888,0.70688473,0.75563311,0.80066752,0.84361968,0.83679329,0.83022828,0.81407149,0.79517436,0.81095163,0.82702094,0.84428333,0.86053265,0.81748207,0.77877929,0.73873327,0.69543517,0.65707846,0.62592111,0.58968159,0.55618909,0.55165621,0.54655218,0.54251048,0.54064796,0.52561423,0.50275907,0.47864194,0.45104322,0.43091638,0.41122870,0.40596020,0.39557699,0.39157218,0.38907687,0.38238016,0.38043825,0.41573993,0.44469960,0.48238642,0.51920911,0.53824971,0.56542046,0.58290386,0.60549147,0.60536813,0.61032390,0.61726299,0.62193118,0.60170945,0.57923070,0.56243171,0.54749721,0.51756851,0.48324068,0.45840853,0.43718655,0.35219174,0.26917350,0.19833044,0.12394046,0.16360230,0.21218923,0.24717457,0.28748805,0.32979260,0.37050465,0.40603310,0.44591227,0.42025705,0.38681194,0.35949711,0.33621489,0.31721698,0.29662061,0.26910186,0.24646019,0.27223648,0.29817969,0.32936956,0.35749099,0.33875906,0.32031498,0.30280377,0.28723602,0.32130612,0.35696954,0.40708562,0.45476631,0.49668336,0.53534396,0.57103092,0.60497554,0.57978349,0.55863370,0.53158670,0.50371024,0.50358568,0.50453886,0.49392391,0.48811726,0.52838569,0.57314896,0.61450635,0.65730766,0.68516182,0.71875069,0.75863325,0.79539179,0.77964181,0.76026513,0.74316113,0.72112358,0.70630135,0.68517331,0.66123899,0.64192607,0.66210959,0.67568917,0.69895420,0.71953821,0.74427311,0.76829116,0.79388569,0.82122337,0.77029495,0.71452358,0.67336565,0.63182839,0.64182501,0.64638071,0.62749087,0.60439117,0.61311045,0.61475990,0.63720428,0.66090585,0.67981098,0.69729825,0.72130910,0.74599271,0.70078636,0.65286319,0.60162542,0.54734678,0.49835439,0.44366812,0.37927034,0.31620598,0.34722039,0.37521173,0.38712961,0.40202533,0.39924046,0.39960198,0.39770131,0.39115780,0.38041895,0.36903474,0.35686575,0.34788764,0.34129977,0.34385369,0.33756110,0.33635091,0.33769683,0.34249552,0.35781373,0.37316729,0.36443604,0.34835299,0.32777521,0.29892443,0.33632918,0.37585300,0.42051720,0.46073765,0.53092458,0.59987406,0.65046920,0.70440710,0.69747943,0.68545062,0.68964019,0.69056514,0.67240407,0.65870236,0.64973958,0.63217148,0.60667823,0.58115029,0.55111773,0.51506035,0.50016462,0.48306925,0.45182715,0.42536907,0.46441281,0.50733123,0.54709912,0.59254311,0.58387833,0.57820899,0.60257437,0.62191153,0.57827336,0.54164751,0.51129934,0.47097935,0.47283384,0.47330411,0.45131098,0.42691783,0.44428041,0.46726904,0.46437794,0.46683322,0.43987097,0.41284259,0.39740145,0.38381034,0.39208268,0.40872843,0.41549338,0.42909250,0.44909963,0.47182650,0.48177222,0.49181057,0.50358669,0.51385589,0.51632269,0.52879707,0.50770317,0.49198284,0.47225192,0.45034461,0.39934959,0.35180411,0.32511596,0.30048762,0.26953346,0.24489567,0.23217386,0.21787228,0.24147732,0.26410433,0.29186951,0.31971380,0.31809194,0.31949688,0.33331956,0.34283079,0.40821514,0.47768036,0.52580750,0.57895925,0.62749075,0.67816143,0.70677509,0.73272939,0.74860610,0.76236671,0.75540878,0.75093576,0.76927412,0.78831919,0.79825813,0.80431490,0.78040306,0.75067734,0.69979102,0.64907583,0.63016298,0.60166533,0.59072223,0.57850453,0.55777214,0.53171317,0.51066068,0.48944524,0.48380671,0.47807903,0.44656044,0.42406226,0.40846083,0.38867562,0.40034098,0.41205218,0.39762529,0.38567189,0.40023423,0.40997321,0.44303966,0.47892374,0.50903910,0.54895114,0.55952633,0.57315609,0.57966506,0.58122888,0.58019819,0.58474280,0.57890435,0.57257238,0.54579557,0.52702852,0.50995326,0.49762275,0.47891058,0.46607905,0.44966653,0.43922359,0.37529963,0.31368177,0.27610378,0.23160715,0.26316908,0.29807900,0.32739544,0.36014420,0.38360132,0.40426584,0.44236611,0.47395967,0.44738664,0.42657933,0.40063127,0.38081418,0.34367477,0.31186351,0.29689057,0.27675813,0.29168713,0.30219390,0.32034749,0.34366846,0.31715142,0.28679400,0.29015823,0.27171267,0.31035703,0.34823673,0.38535262,0.42551225,0.47207013,0.51363060,0.54720705,0.58167264,0.56247047,0.53754625,0.50762524,0.47039743,0.47559359,0.48018733,0.47104146,0.45954293,0.50194180,0.54913579,0.60427381,0.65361036,0.67110233,0.69548227,0.72044750,0.75080844,0.74972468,0.74609405,0.75091773,0.74984182,0.72228285,0.69493442,0.66714228,0.64153922,0.65821319,0.67007049,0.68659697,0.70264419,0.72300601,0.74010281,0.75617728,0.77026116,0.73484128,0.70418145,0.67551989,0.64487334,0.65155784,0.65805014,0.64971183,0.63642413,0.63481227,0.63606109,0.64509572,0.65745719,0.65056314,0.64654747,0.64880028,0.65039804,0.61053666,0.56661480,0.51958097,0.46863761,0.43591114,0.40191797,0.34738813,0.30203526,0.33929005,0.37781556,0.41522268,0.45875189,0.45989188,0.46644315,0.47771082,0.48224734,0.46205801,0.43603866,0.40566691,0.37609204,0.38094957,0.38278274,0.39084212,0.39622881,0.39492327,0.39486642,0.40208927,0.41816058,0.40468855,0.38893079,0.37070274,0.35342141,0.37554486,0.38620748,0.40148536,0.42108013,0.46791168,0.51593825,0.54471647,0.57473481,0.59538637,0.61831196,0.63567448,0.66212299,0.66813356,0.67362942,0.67853706,0.68230131,0.64117046,0.59700673,0.54978214,0.49301888,0.46279281,0.43057245,0.39054582,0.35815210,0.40067914,0.44504477,0.49266470,0.54254663,0.53662255,0.53330610,0.54315034,0.55891196,0.53463688,0.50743732,0.47742845,0.45024792,0.46588168,0.47755794,0.48345712,0.48893627,0.48799098,0.48895830,0.48895536,0.48330679,0.44991075,0.41288117,0.38652743,0.34930136,0.36263320,0.37532179,0.38632280,0.40842176,0.41943648,0.42805415,0.43697285,0.44845541,0.47566678,0.50327911,0.52793116,0.55462601,0.54440494,0.52957343,0.52225496,0.51754286,0.46526292,0.40806111,0.36251876,0.32337026,0.30272980,0.28662096,0.26307039,0.23968023,0.25949542,0.28083394,0.29016211,0.30893897,0.30430254,0.30033948,0.30160587,0.30393624,0.36211950,0.41171101,0.46199008,0.50376639,0.54567188,0.58584194,0.61188137,0.63730295,0.66130668,0.67812206,0.68339779,0.69015386,0.71237381,0.73664020,0.75181115,0.77343409,0.74094626,0.71177208,0.66137287,0.61355651,0.60906153,0.60454351,0.60124651,0.60188592,0.56131900,0.52530838,0.49515598,0.46504072,0.44940255,0.43404983,0.41325437,0.39269411,0.38851657,0.39177221,0.39863012,0.40409568,0.40454153,0.39892075,0.40698120,0.41032796,0.45237002,0.49742306,0.53442301,0.56707481,0.56900742,0.57291497,0.57378241,0.57399276,0.55646603,0.54324715,0.52632999,0.50524592,0.48328322,0.46263584,0.45078788,0.44129728,0.44107407,0.44066158,0.43966389,0.43901038,0.40714930,0.37257404,0.35190642,0.32453256,0.34576306,0.36664695,0.39354172,0.41706764,0.43576528,0.45290253,0.47613361,0.49625202,0.47290385,0.44826143,0.43032344,0.41016847,0.38057849,0.34951724,0.32577066,0.29883222,0.30048467,0.30909185,0.31411947,0.32391948,0.30063839,0.27726676,0.27554334,0.25628968,0.29175038,0.33670411,0.36540059,0.39734857,0.44309996,0.49387929,0.52229719,0.55845520,0.53901290,0.52221978,0.48202027,0.43994681,0.44573605,0.45597180,0.44206229,0.42643220,0.47591194,0.52681394,0.58705372,0.65049042,0.65704329,0.66217360,0.68886573,0.70384641,0.71917227,0.73166470,0.75169961,0.77511107,0.73970844,0.70391556,0.67327151,0.64493816,0.65801804,0.66427527,0.67750713,0.68667351,0.69932974,0.71578613,0.71830128,0.72164316,0.70284558,0.68243728,0.67294519,0.65820630,0.66943671,0.67993013,0.67066478,0.66953320,0.66321326,0.65824435,0.65527663,0.65852739,0.62480382,0.59024958,0.57833924,0.55760398,0.51606688,0.47698686,0.43318401,0.38824159,0.37183186,0.35850463,0.31837206,0.28015200,0.33044763,0.37890319,0.44255542,0.51062059,0.52079848,0.53764387,0.55220949,0.56811770,0.54022180,0.51056116,0.45561222,0.40069706,0.41190556,0.42645829,0.43916583,0.45590359,0.44798411,0.44037433,0.44954728,0.45873405,0.44405935,0.43680421,0.42238725,0.41250989,0.40282651,0.40202716,0.38881216,0.37740434,0.40631390,0.43868557,0.43631269,0.44125691,0.49661375,0.54414331,0.58840405,0.63078471,0.65454958,0.68453605,0.70198651,0.72561958,0.67245599,0.62090018,0.54425465,0.46847252,0.42403136,0.37339204,0.33213075,0.28653377,0.33378413,0.37491043,0.43743981,0.49875888,0.48841904,0.48401893,0.49353808,0.50027958,0.49065436,0.47736411,0.45233925,0.42561725,0.45491747,0.48070327,0.52051608,0.55239511,0.53058870,0.51148302,0.50708233,0.50540356,0.46082785,0.41833792,0.36697469,0.32323075,0.32981165,0.33854092,0.36562461,0.38546122,0.38549244,0.39213781,0.39516018,0.39752529,0.44257013,0.48916696,0.53728315,0.58972575,0.57942971,0.57023817,0.58017790,0.58997071,0.52888614,0.46275444,0.40562815,0.34409145,0.33584359,0.32706796,0.29795271,0.26318350,0.27886264,0.29739385,0.29723325,0.29517013,0.28757809,0.27845698,0.27439611,0.26287252,0.31203443,0.35232160,0.39278264,0.42939939,0.45914445,0.48848932,0.51693631,0.53627221,0.56795023,0.60284200,0.61486907,0.62289685,0.65853418,0.68986300,0.71030832,0.73430131,0.70649929,0.67224010,0.62758202,0.57648478,0.59453309,0.60741455,0.61635301,0.62230078,0.57256614,0.51742377,0.47651474,0.43609701,0.41885733,0.39617980,0.37530958,0.35857086,0.37019420,0.38897415,0.39161718,0.40005544,0.40868938,0.41664083,0.41269114,0.41188341,0.46459846,0.51773017,0.54916512,0.59021706,0.57930907,0.57591352,0.56707855,0.56183998,0.53702364,0.50961077,0.47245592,0.43968422,0.41930265,0.39942000,0.39404192,0.38138743,0.39728755,0.41821545,0.42545677,0.43732935,0.43336369,0.43303886,0.42544983,0.41459099,0.43061105,0.44053750,0.46042890,0.47686454,0.48338432,0.49221845,0.50831299,0.52208471,0.49598610,0.46761044,0.45621843,0.44042799,0.41195043,0.37850445,0.35008707,0.32322872,0.32040391,0.31003113,0.30944066,0.31278428,0.29104198,0.26295147,0.26295459,0.19041948,0.23514023,0.28200375,0.31823135,0.36397486,0.40745944,0.45086496,0.48942270,0.53419544,0.51984802,0.50784077,0.47966687,0.44754207,0.44617410,0.44944973,0.43465296,0.42074999,0.46492215,0.50403493,0.55760719,0.60844796,0.63756178,0.66947120,0.69781628,0.72504368,0.73403629,0.74326555,0.74561402,0.75263988,0.73484376,0.71514268,0.70207994,0.68790603,0.69152386,0.69884161,0.70408629,0.70395263,0.71384059,0.71869882,0.72600103,0.73210929,0.72273220,0.70653628,0.69159970,0.68181874,0.68893842,0.69468036,0.69042040,0.69166348,0.67213597,0.65775561,0.64125453,0.62847509,0.58528276,0.54328016,0.51201058,0.47900560,0.45546098,0.42679606,0.39611753,0.36686878,0.34780253,0.33450914,0.30166259,0.26889998,0.33286235,0.38604647,0.44912353,0.51269514,0.54964702,0.59438703,0.63346487,0.66802813,0.62422896,0.58039031,0.52534142,0.47060539,0.46571231,0.46052710,0.46257893,0.46372028,0.46237641,0.46024611,0.46342187,0.46824304,0.45827647,0.44251025,0.41882953,0.39741926,0.38863312,0.38285110,0.36848326,0.36224691,0.35838129,0.35934099,0.35181324,0.34971987,0.41153534,0.48320396,0.54464784,0.61444013,0.65356176,0.70200914,0.74185841,0.77715317,0.71740852,0.64966783,0.56195074,0.47927071,0.42202590,0.35682923,0.28738596,0.22518441,0.27923432,0.32749892,0.37932264,0.42767423,0.42723871,0.42937648,0.43587477,0.44196432,0.44949687,0.45281653,0.44269363,0.43213838,0.46991746,0.50928517,0.55246262,0.59766922,0.56367537,0.52742720,0.50103550,0.47019475,0.41945328,0.36853095,0.31418914,0.25837166,0.27874525,0.28887786,0.31012129,0.33399735,0.34397391,0.35341687,0.35822047,0.36147931,0.41521791,0.47301120,0.53053524,0.58748009,0.59495061,0.60975745,0.63052729,0.65621866,0.59446544,0.52785655,0.47391881,0.41933944,0.38910287,0.36442199,0.33186059,0.29810081,0.30244826,0.30585436,0.29985123,0.29107647,0.27978680,0.27296139,0.26309305,0.25271139,0.29117758,0.33504805,0.36704302,0.40240642,0.42706510,0.45221708,0.47145964,0.49382998,0.52469432,0.56147221,0.58580012,0.60753429,0.63984106,0.67021885,0.70975564,0.74781408,0.72024050,0.68750600,0.65899712,0.62355341,0.62244916,0.61523682,0.61821721,0.61805902,0.57240282,0.52568220,0.47308128,0.42345098,0.39191589,0.35884103,0.32449870,0.28669975,0.32385262,0.35443950,0.38555045,0.41166295,0.42999626,0.44687089,0.46006344,0.47640419,0.49907980,0.52630460,0.54763149,0.56338132,0.56749665,0.56846306,0.57065275,0.56664843,0.52841735,0.48717456,0.44947606,0.40649558,0.37980999,0.35177230,0.33925373,0.32224619,0.34998796,0.38493025,0.41932442,0.45159978,0.47871721,0.50072267,0.52169065,0.53818079,0.53441106,0.53633771,0.52900683,0.52834540,0.53319324,0.54350567,0.54619889,0.55303031,0.52256593,0.49997905,0.48182233,0.46686820,0.43548707,0.40526064,0.37109322,0.34302406,0.32649227,0.31482377,0.30750919,0.30321043,0.27615481,0.24154174,0.21770416,0.12665355,0.17493806,0.22412798,0.27768469,0.32719662,0.36922362,0.41140581,0.45846907,0.50236356,0.50348790,0.50400556,0.47993095,0.45143440,0.44637769,0.44338739,0.42633683,0.40763034,0.44853315,0.48316944,0.52677590,0.56070951,0.61337622,0.67166138,0.70731564,0.74582225,0.74630784,0.75361511,0.74510632,0.73635383,0.72924495,0.72428273,0.72375034,0.72200681,0.72654121,0.73653570,0.72421358,0.72170308,0.72105243,0.72322472,0.73390149,0.74514914,0.73351306,0.72560023,0.71471440,0.69793724,0.70423423,0.70696868,0.70647852,0.71112501,0.68563981,0.66516158,0.62883918,0.59762821,0.54662166,0.49995786,0.44722615,0.39582424,0.38925226,0.37666804,0.35561269,0.33733952,0.32016199,0.30608359,0.28026334,0.25845415,0.32544809,0.39810541,0.45379955,0.51197042,0.57726631,0.64639162,0.70712855,0.77107799,0.71496007,0.65907229,0.59669791,0.53610848,0.51511008,0.49985748,0.48878359,0.47551575,0.47693776,0.47916742,0.47801462,0.48458183,0.46363746,0.44936168,0.42038904,0.38783663,0.37475421,0.35690135,0.35345769,0.34609544,0.31269873,0.28625630,0.26729283,0.24995530,0.33355458,0.41673845,0.50581987,0.59563628,0.65268105,0.71695326,0.77863076,0.83115907,0.75973443,0.68267298,0.58265302,0.48857521,0.41365707,0.34343591,0.25001857,0.15453353,0.21992236,0.28704044,0.31882422,0.35583020,0.36608206,0.36751440,0.37876374,0.38519864,0.41260067,0.43457924,0.43441094,0.42952255,0.48807607,0.53924983,0.59156447,0.64105808,0.59549756,0.55006803,0.48887547,0.43471945,0.38003790,0.32472746,0.26375400,0.19917639,0.22429603,0.24394168,0.26549017,0.28151507,0.29556955,0.31510802,0.32327294,0.32417459,0.39134544,0.45679370,0.52062775,0.58954200,0.61939162,0.64386004,0.68312486,0.72731489,0.65849152,0.59220406,0.54187885,0.49122970,0.44922876,0.40445093,0.36794371,0.33295502,0.32279066,0.31564745,0.30210469,0.28306662,0.27588001,0.26284896,0.24887526,0.24232115,0.27851749,0.31739971,0.34494645,0.37506901,0.39450364,0.41348462,0.43325291,0.44649400,0.48574731,0.51755908,0.55319227,0.58575270,0.62234732,0.65354735,0.70620890,0.75770383,0.72841552,0.70651748,0.69192426,0.67542650,0.64932468,0.62622325,0.61798614,0.61003611,0.57257672,0.53668001,0.46894603,0.40366305,0.36223666,0.32044494,0.26872276,0.21892085,0.27107867,0.32600505,0.37723538,0.42566320,0.45269274,0.47308463,0.50322126,0.54121260,0.53687730,0.53279323,0.53637923,0.54022703,0.55372662,0.56488123,0.56607830,0.56999660,0.51726469,0.45954651,0.42106068,0.37762905,0.33688072,0.29752044,0.28295277,0.26533706,0.30552607,0.34504608,0.40682353,0.46933080,0.51678678,0.56372020,0.61312956,0.66663789,0.64470423,0.62652292,0.60333320,0.57846439,0.58696778,0.59192736,0.58611297,0.57975084,0.55486628,0.52954236,0.50978642,0.48797079,0.45862694,0.43154624,0.39515550,0.35918288,0.34226637,0.31980544,0.30959911,0.29500118,0.26244048,0.22248381,0.17428579,0.07130054,0.12490584,0.18624105,0.23318334,0.27996229,0.33913721,0.38981936,0.43888559,0.49028344,0.49171807,0.49570565,0.48735635,0.47274271,0.45794727,0.43997704,0.41912794,0.40088858,0.43441728,0.47146600,0.49776016,0.52285175,0.59280059,0.65392540,0.70664576,0.75390667,0.74672396,0.74159030,0.73182153,0.72474310,0.73586754,0.74390835,0.75705196,0.77125843,0.76382676,0.75815942,0.73960258,0.72087455,0.72497235,0.72886791,0.74281156,0.75178197,0.74870561,0.74271508,0.73811697,0.73860803,0.74002641,0.74423449,0.73724109,0.73941473,0.69764124,0.65365644,0.60987435,0.56390232,0.50375509,0.45045810,0.38240652,0.31475598,0.31593129,0.32754637,0.32153963,0.32270036,0.30790209,0.28845704,0.26877106,0.24597867,0.31902100,0.39355156,0.44781711,0.50437413,0.59908840,0.69676642,0.78649345,0.87819111,0.80243684,0.72556117,0.65066476,0.57142059,0.54834048,0.52830556,0.50020919,0.47851896,0.48499041,0.48392862,0.49125904,0.49879859,0.48137046,0.46000063,0.42844461,0.40003783,0.37601539,0.35120758,0.33361183,0.31395053,0.27000951,0.22810395,0.18744230,0.15148253,0.24970872,0.35273592,0.46197386,0.57072729,0.65145827,0.73270958,0.82145785,0.91163233,0.81154180,0.71174879,0.60141063,0.49360883,0.39845544,0.31067915,0.20053604,0.08983943,0.15385480,0.21827191,0.26528444,0.30618540,0.31437289,0.32437115,0.32902609,0.33806991,0.36608536,0.39799910,0.41432886,0.42892514,0.49630705,0.56956768,0.63831739,0.70269008,0.63020156,0.55288254,0.47300248,0.39518460,0.33557329,0.27494141,0.20479067,0.13185985,0.16063907,0.19372338,0.20979154,0.23296563,0.24996435,0.27709810,0.28780606,0.29893475,0.37665440,0.45557343,0.52437431,0.59797689,0.63885606,0.68197432,0.73537452,0.79524150,0.72377970,0.65581442,0.60588921,0.55470395,0.50368854,0.45443860,0.40486141,0.35914616,0.34120075,0.32617905,0.30332320,0.28734219,0.26792074,0.24521001,0.22596400,0.20421753,0.24177534,0.27496857,0.30648188,0.34518855,0.35715508,0.37040154,0.38794875,0.40256322,0.44115396,0.49067757,0.52810294,0.56521634,0.60590210,0.64951579,0.69994489,0.75537970,0.73529588,0.71808141,0.71013164,0.70613676,0.68458742,0.65702195,0.64342093,0.62748260,0.57370345,0.51910837,0.45842067,0.39354578,0.34661234,0.29351467,0.22567447,0.16011683,0.23870755,0.31509964,0.38192036,0.44711907,0.47642739,0.51261425,0.55142326,0.58136344,0.56986703,0.54971234,0.54504881,0.53753739,0.55514447,0.57050211,0.56851244,0.57488961,0.50987186,0.45130028,0.39126603,0.32794734,0.28921035,0.24633813,0.21759003,0.18898079,0.25790436,0.33396354,0.40755070,0.48455422,0.55820692,0.62456242,0.70532099,0.78241224,0.73529695,0.69368668,0.66192740,0.62974866,0.62562420,0.62742622,0.61585892,0.60547923,0.58451817,0.56397180,0.53895536,0.51400349,0.48665954,0.45080085,0.41129290,0.36961327,0.34616963,0.32670817,0.31715383,0.30976197,0.25505733,0.20475236,0.13642572,0.00622535,0.08112814,0.15043542,0.19064849,0.23185649,0.30098769,0.37539003,0.42237564,0.47013952,0.47729777,0.49317784,0.49013984,0.49303949,0.46406855,0.43630690,0.41662211,0.39288970,0.42477367,0.45540977,0.46792345,0.48396583,0.56647754,0.64512849,0.70384715,0.76534314,0.74315253,0.72583733,0.72090628,0.70918125,0.73554926,0.75941493,0.78937592,0.82585796,0.80345465,0.78399960,0.74804357,0.71802743,0.72219938,0.73113798,0.74821807,0.76042274,0.76010041,0.76268433,0.76540605,0.77426588,0.77486521,0.77702676,0.77049793,0.76818773,0.70210513,0.64074980,0.58426366,0.53449427,0.46883737,0.40117064,0.31279556,0.22839278,0.24911543,0.27285098,0.29357161,0.30970991,0.28564566,0.26521960,0.25011334,0.23135478,0.31072435,0.39342179,0.44684311,0.49738479,0.62318949,0.74577210,0.86782857,0.99056969,0.89217403,0.79288697,0.70113664,0.60732071,0.58388121,0.55308895,0.52037794,0.48392233,0.49009294,0.49142412,0.50894098,0.52288494,0.49312511,0.46834079,0.43783967,0.40541308,0.37430783,0.34717834,0.31228879,0.27864483,0.22231296,0.16847197,0.10545378,0.04418354,0.16961949,0.28539333,0.42054735,0.54816779,0.64869016,0.74846815,0.86831457,0.99299902,0.86567357,0.74985665,0.62071525,0.49949857,0.38926366,0.27658496,0.15168707,0.02173854,0.09370344,0.15907148,0.20687385,0.26106149,0.26854106,0.28143462,0.28389483,0.28553980,0.32284612,0.35964892,0.39168075,0.42223003,0.50941051,0.59336670,0.67944603,0.76793057,0.66043318,0.55768034,0.45677414,0.34896878,0.28808969,0.23093625,0.14684157,0.05916351,0.09867645,0.13882974,0.16077478,0.17916287,0.20992665,0.23274718,0.25015132,0.27186742,0.36602047,0.45712928,0.53039433,0.60573588,0.66224981,0.71523492,0.78810366,0.86266827,0.78801600,0.71678825,0.67091741,0.62163984,0.55823591,0.49926622,0.44114361,0.38033315,0.35752870,0.33644250,0.31018600,0.28615186,0.26186899,0.22949420,0.19568909,0.16277927,0.20154503,0.23448235,0.27453511,0.31284066,0.32429952,0.33116198,0.34265516,0.35119172,0.40419699,0.46014252,0.50339079,0.54406597,0.59162754,0.63709305,0.69780717,0.75984533,0.74087914,0.72447235,0.73419086,0.74534835,0.71137630,0.68576403,0.66396545,0.64698398,0.57719880,0.50566264,0.44597779,0.38605265,0.32627064,0.26296046,0.17994512,0.10048878,0.20433079,0.30258759,0.38326844,0.46553349,0.51153707,0.55718154,0.58840314,0.62984888,0.59513697,0.56280531,0.54952578,0.52786167,0.55192945,0.57390597,0.57170144,0.57799977,0.50758693,0.43517194,0.35959120,0.27733463,0.23954532,0.19380335,0.15411560,0.11208729,0.21406448,0.31896453,0.41398634,0.50450451,0.59832221,0.69018636,0.79393985,0.89792623,0.83207355,0.76522600,0.72299858,0.67665193,0.67032705,0.66337663,0.64999950,0.63385879,0.61545832,0.60118645,0.57191038,0.54576440,0.50877040,0.47753285,0.42822487,0.37553768,0.35728153,0.33065533,0.33238882,0.32992086,0.25846569,0.18597782,0.09519145,0.11702007,0.16014360,0.20078857,0.23584674,0.27727158,0.32932991,0.37367024,0.42153442,0.46485356,0.47917766,0.48844600,0.49940525,0.50881438,0.48630132,0.46323131,0.45292959,0.44191415,0.46264958,0.48933445,0.49608330,0.51000398,0.57002330,0.62731929,0.67006125,0.71455820,0.70252423,0.68037320,0.67502156,0.66187217,0.66968759,0.67665976,0.69605688,0.71740806,0.69701211,0.68847962,0.66784908,0.65531177,0.67180632,0.69089984,0.70086372,0.71378289,0.71453637,0.71849669,0.72393231,0.73268474,0.72464719,0.71505491,0.70394750,0.69092605,0.64650561,0.59926720,0.54925043,0.50705751,0.45562514,0.40438838,0.33558713,0.27013726,0.28934461,0.30483213,0.31847480,0.33605696,0.31736693,0.30058255,0.27059505,0.24361240,0.31642977,0.39361712,0.45059289,0.51253867,0.63020816,0.74881685,0.85623635,0.96131499,0.87777622,0.78690656,0.70166882,0.61815095,0.58938261,0.55172879,0.50428768,0.45651624,0.47005291,0.47894149,0.49924250,0.51566206,0.50196163,0.49077785,0.47431130,0.46289547,0.43213755,0.40526278,0.36318115,0.32202484,0.28012969,0.24276736,0.19097100,0.13748236,0.23755926,0.34490843,0.44312401,0.54488041,0.62609427,0.70931894,0.80581535,0.90639116,0.79639086,0.68383299,0.57561858,0.46309238,0.37537292,0.28140449,0.18386370,0.09128250,0.13996050,0.18798932,0.23400412,0.28480026,0.30048089,0.31496624,0.32873602,0.33991771,0.37571152,0.41436578,0.44439818,0.48012026,0.55038582,0.61816925,0.68679446,0.75506471,0.67096114,0.58495339,0.50085363,0.42128571,0.36540461,0.30394207,0.23661134,0.16962845,0.20017979,0.23920967,0.25911328,0.27423009,0.29841385,0.32251290,0.33937653,0.35729600,0.41788923,0.47288330,0.53043025,0.58838990,0.63006073,0.67784073,0.72397918,0.76889868,0.71565517,0.65718076,0.61149330,0.56636828,0.52143164,0.47717783,0.43508671,0.39703417,0.37753718,0.35776781,0.34684691,0.33450850,0.31592651,0.30432949,0.28503412,0.26487012,0.27897245,0.29401948,0.32754540,0.35722123,0.35941740,0.36106052,0.36588514,0.37158975,0.41423856,0.45941946,0.49864253,0.53331262,0.59244477,0.65168057,0.71381291,0.77121414,0.75365505,0.73280451,0.72375846,0.71037290,0.68436360,0.66300339,0.63734361,0.61874148,0.55749516,0.49484679,0.44563157,0.39411671,0.33982742,0.28130199,0.21785880,0.15876558,0.23517635,0.31091684,0.37807805,0.44410425,0.49033774,0.53601064,0.57620204,0.61363469,0.59467474,0.57770183,0.56522510,0.55183267,0.55599989,0.55903848,0.57018754,0.57451044,0.51528615,0.45193131,0.38114833,0.31030998,0.26511137,0.21763936,0.17659846,0.13027109,0.22635305,0.32248423,0.40597157,0.48877981,0.57754122,0.66219796,0.74341180,0.83500466,0.78424494,0.72987106,0.69453082,0.65547493,0.63698581,0.61664433,0.60363099,0.58589007,0.56626334,0.54623891,0.53134506,0.50756610,0.48666215,0.46730511,0.43616861,0.40468397,0.39006898,0.37638760,0.37091280,0.36622802,0.31024770,0.24843820,0.18365166,0.22510678,0.24084616,0.25196765,0.28873265,0.31941120,0.34933101,0.37905358,0.42079448,0.46114418,0.47804954,0.49228194,0.50606559,0.52069963,0.50858276,0.49292523,0.49169651,0.49501409,0.50808607,0.51879125,0.52883802,0.53538965,0.57557990,0.61225480,0.63883933,0.67181318,0.65630134,0.63792475,0.63016253,0.61914269,0.60680559,0.59797624,0.60220686,0.60609361,0.59458726,0.58796163,0.59126697,0.59017041,0.61982641,0.65326645,0.66220496,0.67088126,0.67649150,0.67729790,0.68645573,0.69477103,0.67241995,0.65087310,0.63543826,0.62171394,0.58533267,0.55831619,0.51642595,0.47227458,0.43949953,0.41266412,0.35992694,0.30842691,0.32394446,0.33968461,0.34695654,0.35853614,0.35004263,0.33713730,0.29856097,0.25531345,0.32679661,0.39686102,0.46155655,0.52096781,0.63641844,0.75054509,0.84194218,0.93927689,0.85898445,0.77752947,0.70559461,0.62854284,0.59040036,0.55695257,0.49704321,0.43083797,0.44813815,0.46519302,0.48591867,0.50979016,0.51013558,0.50947734,0.51113848,0.51347586,0.48447642,0.46188603,0.41331245,0.35931402,0.33907677,0.32076251,0.27145997,0.22698433,0.31427851,0.39884169,0.47095917,0.54463312,0.60052840,0.66181114,0.74346130,0.82139621,0.72540247,0.62612475,0.52672695,0.43300985,0.35525775,0.28347997,0.21773023,0.15944484,0.18706214,0.21425583,0.26467189,0.30936590,0.33442652,0.35433799,0.37527605,0.39453145,0.43156114,0.46539964,0.50443346,0.53971321,0.58935257,0.64961929,0.69526310,0.74188839,0.67239280,0.60904214,0.55053848,0.49000278,0.43396389,0.37883681,0.32496259,0.27223508,0.30638048,0.33902255,0.35433671,0.36647587,0.39472226,0.42035528,0.42896460,0.44216842,0.46979528,0.49455167,0.53502422,0.57114510,0.60158723,0.63480591,0.65355136,0.67127973,0.63877096,0.59989269,0.55377703,0.51193264,0.48555230,0.45465511,0.43550600,0.41169443,0.39435517,0.37685378,0.37796665,0.38117782,0.37496219,0.37760783,0.36528464,0.36239952,0.35814164,0.35064896,0.37421001,0.39797405,0.39461410,0.38808732,0.38870400,0.39063694,0.42118305,0.45497752,0.49339605,0.52788790,0.59798642,0.66808871,0.72634724,0.78205985,0.76413603,0.74062326,0.71401321,0.68054745,0.65582269,0.63176756,0.60982884,0.58234253,0.53827617,0.48333455,0.44945423,0.40693511,0.35410451,0.29273823,0.25560522,0.21496545,0.26651254,0.32744061,0.37360256,0.42552810,0.47437125,0.52604471,0.55960484,0.59359007,0.58850979,0.58949758,0.57967896,0.57717376,0.56151602,0.54451591,0.55854522,0.57467471,0.51715660,0.46788716,0.40141388,0.33514310,0.28567947,0.23827363,0.19639614,0.14954350,0.23873288,0.31937603,0.40223740,0.47624562,0.55448527,0.62860585,0.70198309,0.77040279,0.73392238,0.69733027,0.66902310,0.63879179,0.60336029,0.57414344,0.55398976,0.54270218,0.52272080,0.49927119,0.48765059,0.46934211,0.46820800,0.45915943,0.44698238,0.43146520,0.42477140,0.41480860,0.41198546,0.41116370,0.36049341,0.31674478,0.27082307,0.30579357,0.31700891,0.32161852,0.34047698,0.35070630,0.37778645,0.40076508,0.42545456,0.44908587,0.46643668,0.48865134,0.51397590,0.53448882,0.53660146,0.53615867,0.53423278,0.53144635,0.54375429,0.55457167,0.56038135,0.56309956,0.58085789,0.59889654,0.61812047,0.63159669,0.61245672,0.59251614,0.57821223,0.56170114,0.54402158,0.52551181,0.50879818,0.48895520,0.50417333,0.51613818,0.52065643,0.53019898,0.56394112,0.60470512,0.61495406,0.63071942,0.63513776,0.63908707,0.64774394,0.65188637,0.62073483,0.59692481,0.56176169,0.53203527,0.51581482,0.49881635,0.48181804,0.46750073,0.43443810,0.40297847,0.36650851,0.32764870,0.35166489,0.36706898,0.38621382,0.40548173,0.38066940,0.35288073,0.31087871,0.27234768,0.34310334,0.40996963,0.46487155,0.51781542,0.62933208,0.73729106,0.83917518,0.94563315,0.86066114,0.77682531,0.69875728,0.62575437,0.58639949,0.54335288,0.47898122,0.41946874,0.43234358,0.45476128,0.46988653,0.48768205,0.50638769,0.52413922,0.55196755,0.57646846,0.53763104,0.50569656,0.46186541,0.41626331,0.40504809,0.39243334,0.36188842,0.33565147,0.38567840,0.43724392,0.48267304,0.52937780,0.58260036,0.63280144,0.69118920,0.74684304,0.65419501,0.56233555,0.47104132,0.38233667,0.33625200,0.29745906,0.25349280,0.21407828,0.24533145,0.27179173,0.30317885,0.33965888,0.36672532,0.39290605,0.40928326,0.42864121,0.47139322,0.51449954,0.54353149,0.57836801,0.61904778,0.65288991,0.69135162,0.72515740,0.67506018,0.63048254,0.58683148,0.54129482,0.50229674,0.46676946,0.42683655,0.38968881,0.41847815,0.44386324,0.46059252,0.47533377,0.48580025,0.50092705,0.50540473,0.51605829,0.52052914,0.52928227,0.54333415,0.55676099,0.56804589,0.58401916,0.59140340,0.59651662,0.56388575,0.53212287,0.49327048,0.44972955,0.44601641,0.44068241,0.43232668,0.42629945,0.41836133,0.40320377,0.41016416,0.41411336,0.42274886,0.43918958,0.44411414,0.44424473,0.43249813,0.42126991,0.42768655,0.43332549,0.42124645,0.40155352,0.40317786,0.40442691,0.42540707,0.45154279,0.48746101,0.51949954,0.59267536,0.67415227,0.74377738,0.80734134,0.77065082,0.73434063,0.70244727,0.66478543,0.64612209,0.62723865,0.60235962,0.57496942,0.53314090,0.48643493,0.44966647,0.41393740,0.37837094,0.33582109,0.29693937,0.26337327,0.29956894,0.33690556,0.36554738,0.39614428,0.45273258,0.50244270,0.53978319,0.57667525,0.58668418,0.58986286,0.59412556,0.59365031,0.57137961,0.55150522,0.55593508,0.56575253,0.51424640,0.46235295,0.41091278,0.36412798,0.31502213,0.27244639,0.22014275,0.17535235,0.25684262,0.33496729,0.41144865,0.48578422,0.54161238,0.58914998,0.65287394,0.70456744,0.67691645,0.64249306,0.61989028,0.59942043,0.56558442,0.52895336,0.50272917,0.47471413,0.47007018,0.46661839,0.45601524,0.44856847,0.45757915,0.45683960,0.45745206,0.46185533,0.45511296,0.45145973,0.45539096,0.45981063,0.42242848,0.38579827,0.34298153,0.38099469,0.39136473,0.39490162,0.38752199,0.38305779,0.40728001,0.42700971,0.43080006,0.43993013,0.46218256,0.47875283,0.51484406,0.55292038,0.56556634,0.58114588,0.57513097,0.57265071,0.58279091,0.59035920,0.59000708,0.58753198,0.58583982,0.59241961,0.58682907,0.59180637,0.56808305,0.55348951,0.53068995,0.51087638,0.48622050,0.46038168,0.41640707,0.37388310,0.40883677,0.43888436,0.45612346,0.46612522,0.50987727,0.55514228,0.57365881,0.59263678,0.59498575,0.59848147,0.60634384,0.61171464,0.57453283,0.54222172,0.48975902,0.44414468,0.44314318,0.44699312,0.45048346,0.45514396,0.42552110,0.39760709,0.37930434,0.35137450,0.37428492,0.39526546,0.42637277,0.45242646,0.41096996,0.36914191,0.32512109,0.28054022,0.35559452,0.42883124,0.47231014,0.51598698,0.62265889,0.72128147,0.83275355,0.94605012,0.86230718,0.77564962,0.69668314,0.61909882,0.57962254,0.54138174,0.47052089,0.39790955,0.42219381,0.43809745,0.45829521,0.46866787,0.50379352,0.53497511,0.58913101,0.63722785,0.58885972,0.54808805,0.51041855,0.47258303,0.46609852,0.46339396,0.44952125,0.43756366,0.45505016,0.48020592,0.50003097,0.51861546,0.55935780,0.60667604,0.64132503,0.68171619,0.59136114,0.50047345,0.41613872,0.32566835,0.31792516,0.31159519,0.29269551,0.27211749,0.30059742,0.32911830,0.34925208,0.36599891,0.39964680,0.43463665,0.45259859,0.46350833,0.51681728,0.57099089,0.59063539,0.61475006,0.64007017,0.66377018,0.68139777,0.70320765,0.67608529,0.64656881,0.62505283,0.59601872,0.57272908,0.54899186,0.52801540,0.51002248,0.53032548,0.55124023,0.56407354,0.57988671,0.57867585,0.58273386,0.58325802,0.59194009,0.57778952,0.56587524,0.55061474,0.54096176,0.53975126,0.53743292,0.52712047,0.51494477,0.49199230,0.47322421,0.42496965,0.38119222,0.40503051,0.42270574,0.43275194,0.44545859,0.43768185,0.42712924,0.43816939,0.44774353,0.47614558,0.50214037,0.51823425,0.53432956,0.51048657,0.48857115,0.47917484,0.47134888,0.44258563,0.41837626,0.41708126,0.41612540,0.43135205,0.44749072,0.47432687,0.50183621,0.59152025,0.68523015,0.75932577,0.83761714,0.78181160,0.72229373,0.68838610,0.65262124,0.63673117,0.62378468,0.59441262,0.56935857,0.52986664,0.49119700,0.45993324,0.42591859,0.40207001,0.37957923,0.34347223,0.30752534,0.32769896,0.34417686,0.35960559,0.36777350,0.42555166,0.48337505,0.52036342,0.56026736,0.57878100,0.60062480,0.60050198,0.61018284,0.57816543,0.55158630,0.55230175,0.55731620,0.50734829,0.46042581,0.43022704,0.39604305,0.34746263,0.30113846,0.24784448,0.19850914,0.27499529,0.34674982,0.41925719,0.49479234,0.52128417,0.55465390,0.60385756,0.64632318,0.61979831,0.58752436,0.57596068,0.55879649,0.52055476,0.48655721,0.44654334,0.40620289,0.41860762,0.42605539,0.42587562,0.42929888,0.44596469,0.45791907,0.47075958,0.49289695,0.48951146,0.49176200,0.50568343,0.51757726,0.48591243,0.45838367,0.41999715,0.51937268,0.50711471,0.49086024,0.47141505,0.44788907,0.44265574,0.43931035,0.42811802,0.42021924,0.44722024,0.47890375,0.51806899,0.56327560,0.59111876,0.61656588,0.63492002,0.64665792,0.63795700,0.62009158,0.60531971,0.59584810,0.57115027,0.54844744,0.52550118,0.50244161,0.49228178,0.48620701,0.46619468,0.44453830,0.41141414,0.37868338,0.33141427,0.28797032,0.33699819,0.38617596,0.41901633,0.46053322,0.50134676,0.54369689,0.57664570,0.61545689,0.60444998,0.59043779,0.56570691,0.54637999,0.51398702,0.47640081,0.42075562,0.36894543,0.38216872,0.40405956,0.42375750,0.43900233,0.43844758,0.43208996,0.42478544,0.42473147,0.42369972,0.42321623,0.42914373,0.43528370,0.41005106,0.38252036,0.35032064,0.31736560,0.38167695,0.44897141,0.50806431,0.56940726,0.65826109,0.74547117,0.83833507,0.93274597,0.85586289,0.77403538,0.69470202,0.61002027,0.57175954,0.53962241,0.48162293,0.42978392,0.44349197,0.46558256,0.48823189,0.51800208,0.55204597,0.57942565,0.63023710,0.67565224,0.63063791,0.58784073,0.55339547,0.51806113,0.51556452,0.51500837,0.50106450,0.49741080,0.50138562,0.50531649,0.50875645,0.51082979,0.53104626,0.54772041,0.55786037,0.57261546,0.49979425,0.43276398,0.36651848,0.30012478,0.29146579,0.28595402,0.27466117,0.26312137,0.29547985,0.32796133,0.36049886,0.39489077,0.44235980,0.49126796,0.53202744,0.57191452,0.60011255,0.63384225,0.64824612,0.67137700,0.68868521,0.70861639,0.72074216,0.73038035,0.70748929,0.68708259,0.65699214,0.62689505,0.62040788,0.61368470,0.60489759,0.59840562,0.60397388,0.60877867,0.61432792,0.61891415,0.62507793,0.62930521,0.61749407,0.61409614,0.58989748,0.56382675,0.54449145,0.52474069,0.50582595,0.48459413,0.46898537,0.44721817,0.43591822,0.41711311,0.38690026,0.36128718,0.38006076,0.39495088,0.41353125,0.42386989,0.43651110,0.44966337,0.46875288,0.48251769,0.50893094,0.53652325,0.56439746,0.59699410,0.56022450,0.52671489,0.50068968,0.47182462,0.45515744,0.42970162,0.41499739,0.40098930,0.42610904,0.45889552,0.48785438,0.51365418,0.60367981,0.69664010,0.78247222,0.87468376,0.81034847,0.74162253,0.69983269,0.66082781,0.62503098,0.59019014,0.55241347,0.51852419,0.49331637,0.47488112,0.45138356,0.42238531,0.39843697,0.38027914,0.35145828,0.31943084,0.35244751,0.38122877,0.40124918,0.41429398,0.46682996,0.51121767,0.54553585,0.57824230,0.57832414,0.58350919,0.58354047,0.57270856,0.54770057,0.52427795,0.51314156,0.50336646,0.46846295,0.43386832,0.40072284,0.36785616,0.32565531,0.28113132,0.24072794,0.20286486,0.26073382,0.32352083,0.38386912,0.44992036,0.47951437,0.51549496,0.55328387,0.59464131,0.57530827,0.55753303,0.54333521,0.53543625,0.50003251,0.46702904,0.43268596,0.40478597,0.41944529,0.42813352,0.43115294,0.43554972,0.44327922,0.45085002,0.45389230,0.45797055,0.47627641,0.50059366,0.52173213,0.54603892,0.53633936,0.52838929,0.52262552,0.65646192,0.62340960,0.58467313,0.54628733,0.50674923,0.48246622,0.44803148,0.42343685,0.39465240,0.43338588,0.47075765,0.52539783,0.57506252,0.62008390,0.66195816,0.69487068,0.72018803,0.68687456,0.65307082,0.62512970,0.60339990,0.55344768,0.50536954,0.45824167,0.41005270,0.41427594,0.42122452,0.39882820,0.37719238,0.33997392,0.29952455,0.25017629,0.19799944,0.26764292,0.33586321,0.39165141,0.45003349,0.48829688,0.52577275,0.57931485,0.63348601,0.60405941,0.57725161,0.53248676,0.48285018,0.44403047,0.41073761,0.34994974,0.28856020,0.32577366,0.35244182,0.39328767,0.42227727,0.44415535,0.46575703,0.48173684,0.49627333,0.47160134,0.44430390,0.43283843,0.42303350,0.41394733,0.40015136,0.37618678,0.35805748,0.41266222,0.46457664,0.53949796,0.61861439,0.68930335,0.76608072,0.84238537,0.91978112,0.84238041,0.76704270,0.68677210,0.59884505,0.56948731,0.54100101,0.49598500,0.45508035,0.47306294,0.49009625,0.52756460,0.56580834,0.59588156,0.62536268,0.67015593,0.71555326,0.67178138,0.62676372,0.59250014,0.55688211,0.55896512,0.56198093,0.55929885,0.55517807,0.54187570,0.53084149,0.51706406,0.50256357,0.49332426,0.49057214,0.47219020,0.46251177,0.41285778,0.36727295,0.32164251,0.27824557,0.26514444,0.25441050,0.25443295,0.25528177,0.29526354,0.32948622,0.37713540,0.42533531,0.48395979,0.54491045,0.60793709,0.67146066,0.68737097,0.69885462,0.70903763,0.72028750,0.74054046,0.75650287,0.75725390,0.75455316,0.73793700,0.72876188,0.69428584,0.66082259,0.67133006,0.68369179,0.68552449,0.68783139,0.67389847,0.66449995,0.66188525,0.65830075,0.66692368,0.68023268,0.65854610,0.63218905,0.59931759,0.56304388,0.53984921,0.51429615,0.47051191,0.43013854,0.40505177,0.37939279,0.37069986,0.36221962,0.35046469,0.32935710,0.35337207,0.37225297,0.38902335,0.40792536,0.43644098,0.47628832,0.49370577,0.50961356,0.54522945,0.57280184,0.61904976,0.65978376,0.61138241,0.56430529,0.51836807,0.47317288,0.46112822,0.44565857,0.41827481,0.38919624,0.42716193,0.46245540,0.49563624,0.52086376,0.61787607,0.71243031,0.80988541,0.90991842,0.83229374,0.76019195,0.71093988,0.66581844,0.61561911,0.56426830,0.51648388,0.46708091,0.45892516,0.45646292,0.43736697,0.42423785,0.39875114,0.37847020,0.35767807,0.33479281,0.37422617,0.41564755,0.43772246,0.46363885,0.50502330,0.54484362,0.57000570,0.59067146,0.58123837,0.57388392,0.55663469,0.54191743,0.51730731,0.48871587,0.47036833,0.45890018,0.43580879,0.41225572,0.37640091,0.34347018,0.30402432,0.26647530,0.23226913,0.20525844,0.25240957,0.30736721,0.35554046,0.40215075,0.43599174,0.46868774,0.50333144,0.53841632,0.53182795,0.52636384,0.51340006,0.50817631,0.47583440,0.43986025,0.42013154,0.40674026,0.41629834,0.43390427,0.43668997,0.44559017,0.44198325,0.44355171,0.43146590,0.42172260,0.46444837,0.50771164,0.53647971,0.57179235,0.58864341,0.60416624,0.63325123,0.79036334,0.73356881,0.67256511,0.62357750,0.57978155,0.52571838,0.47420187,0.42759349,0.37656630,0.42440288,0.47426962,0.53348017,0.58809324,0.65161452,0.70697883,0.76058938,0.81825074,0.75433189,0.69518688,0.64618439,0.60629092,0.53870164,0.47140991,0.40541384,0.33662971,0.33746719,0.34864817,0.33976942,0.33011123,0.27761247,0.22554532,0.16866640,0.11002838,0.18674640,0.26756231,0.34175395,0.41359527,0.47420161,0.53575454,0.59676548,0.65515932,0.60317115,0.55256835,0.49668029,0.43442444,0.39042437,0.34374811,0.27828701,0.21631629,0.26779763,0.31813881,0.37347355,0.42812308,0.45998000,0.48504597,0.51930953,0.54199240,0.50780298,0.47094162,0.44581290,0.41886285,0.40779385,0.40343611,0.38939516,0.37750159,0.43871923,0.50752480,0.57908516,0.65701269,0.72582202,0.79197970,0.86783618,0.93663885,0.85516301,0.77210239,0.67888063,0.58647977,0.56112903,0.52927289,0.49447865,0.46079778,0.49197013,0.52388264,0.55729378,0.59769634,0.63291791,0.66916674,0.70780927,0.75011813,0.70974672,0.67161062,0.63732673,0.60384872,0.61056077,0.61569232,0.61858017,0.62786236,0.59826803,0.56399983,0.53609254,0.50483886,0.46357683,0.42462358,0.38745461,0.34951049,0.32063065,0.29302202,0.26977566,0.23811433,0.24773322,0.25673273,0.25347531,0.25563733,0.31222622,0.36338581,0.40467499,0.45237456,0.52869146,0.60925672,0.69002719,0.76932256,0.76779717,0.77079515,0.78067813,0.79024998,0.78890143,0.78783335,0.79212961,0.78860709,0.76864360,0.75590710,0.72040252,0.69618502,0.71507748,0.72851941,0.75145845,0.77376960,0.75564977,0.73746602,0.73327565,0.72555616,0.71872754,0.70997141,0.69698925,0.68335110,0.62968173,0.57106666,0.52596010,0.47915526,0.43729448,0.38645545,0.35334101,0.31582684,0.32031333,0.32175270,0.31922114,0.31382876,0.33152919,0.34844621,0.36331049,0.37399475,0.42061437,0.47055731,0.51753398,0.56949935,0.59773819,0.63165711,0.67966704,0.72328406,0.66595677,0.60365710,0.54527290,0.48926298,0.47033454,0.44770649,0.40702401,0.36688105,0.40731259,0.45312099,0.49358074,0.53750041,0.63579656,0.73496827,0.83571499,0.94122519,0.85872413,0.78148071,0.72201039,0.65974296,0.60676023,0.54621801,0.48432760,0.42325613,0.42695207,0.42943822,0.42568501,0.42419674,0.41029240,0.38686606,0.37447427,0.36017834,0.40049746,0.44494433,0.47819167,0.50859887,0.53750537,0.57189257,0.59024862,0.61402117,0.59039491,0.56496667,0.54235262,0.51969998,0.48413627,0.45172728,0.43086030,0.40355939,0.38683808,0.36732305,0.34483642,0.32558639,0.29539208,0.25842178,0.22623450,0.19200527,0.24145394,0.28905699,0.32616749,0.36839960,0.39587111,0.43251552,0.46090041,0.48472051,0.48534676,0.48706466,0.48570615,0.47463425,0.44574856,0.41855919,0.39913954,0.38070108,0.40261938,0.42770554,0.44265423,0.46650961,0.45479702,0.44017277,0.42663406,0.41049751,0.46607425,0.51742588,0.56184093,0.60094866,0.64714550,0.69327443,0.74403426,0.92710901,0.84574261,0.75974409,0.70387199,0.64915878,0.57408692,0.50141657,0.42496442,0.35341273,0.41425253,0.48046386,0.54142198,0.60137649,0.67667974,0.75866820,0.82966319,0.91006806,0.81648852,0.72777076,0.67050279,0.60695576,0.52301023,0.44257740,0.35090302,0.25796156,0.26304092,0.27386989,0.27762081,0.28277369,0.21288045,0.14776682,0.08445929,0.01514635,0.11474647,0.20460342,0.29705862,0.38550722,0.46325499,0.54321835,0.61127955,0.68011105,0.60432453,0.53024139,0.45888520,0.38352941,0.32759249,0.27565212,0.20781511,0.14064359,0.21459232,0.28198704,0.35632653,0.43005369,0.47200415,0.51175432,0.55601513,0.59601270,0.54190692,0.49168624,0.45193052,0.40749746,0.41000748,0.40504187,0.39970157,0.39457571,0.47116236,0.55055741,0.62020671,0.69492998,0.76030252,0.82557397,0.88684352,0.95534519,0.86318535,0.77202217,0.67654817,0.57429739,0.54727555,0.51978328,0.50011019,0.47177096,0.51101296,0.55353684,0.59166809,0.63126308,0.66849368,0.71223723,0.75071013,0.78938064,0.75257632,0.71543679,0.68132719,0.64840943,0.66022202,0.66214317,0.67885401,0.69814226,0.64719005,0.60399779,0.55926727,0.51224655,0.43242581,0.35465995,0.29407142,0.23279000,0.22765323,0.22186070,0.21301743,0.19940538,0.22443287,0.25188082,0.25303812,0.25745735,0.32518178,0.39091316,0.43819168,0.47892111,0.57749008,0.67374030,0.76597126,0.86688869,0.84905185,0.83716224,0.85056008,0.86589265,0.84413588,0.82438133,0.82447236,0.82306618,0.80336036,0.78275115,0.74964921,0.72287855,0.75315821,0.77854552,0.82048829,0.86811743,0.83476949,0.80481248,0.80225897,0.79274292,0.76456810,0.73686642,0.73544805,0.73398910,0.65685841,0.58170683,0.51571282,0.44969499,0.39551974,0.34221787,0.30031618,0.24841307,0.26763957,0.28223715,0.28724570,0.28976908,0.31147109,0.32839541,0.33469594,0.34043032,0.40801323,0.46779906,0.54501401,0.62322715,0.65187661,0.68113646,0.73926473,0.79582492,0.71978102,0.64128780,0.57052502,0.50305981,0.47570164,0.44969147,0.39306811,0.34241934,0.39453161,0.44272003,0.49398351,0.54570872,0.65001859,0.75011634,0.86161981,0.97867023,0.88871138,0.79844538,0.72744574,0.66101157,0.59604432,0.53201693,0.45451414,0.38245740,0.39289892,0.40581844,0.41935936,0.42918804,0.41504287,0.39586983,0.39106468,0.38344751,0.42833302,0.47767251,0.51874975,0.55712223,0.57286949,0.59602600,0.61697473,0.63595101,0.59665557,0.55675321,0.52915669,0.49846527,0.45823488,0.41538072,0.38228534,0.34814504,0.33323218,0.31809330,0.31044812,0.30397213,0.28204531,0.25752261,0.21705442,0.17632789,0.22163304,0.27320324,0.29995978,0.32760872,0.35792877,0.39568258,0.41519732,0.43540885,0.44737514,0.45501048,0.45202621,0.44955295,0.42369690,0.39604133,0.37609494,0.35381514,0.38917060,0.41977623,0.45273503,0.48646625,0.45879282,0.44142521,0.41712996,0.39534874,0.46202379,0.53531801,0.58594002,0.63450099,0.71048615,0.78447623,0.85357200,0.90579778,0.83064699,0.75337013,0.68324277,0.61394347,0.54996221,0.48161910,0.41662691,0.34540752,0.40439843,0.46342746,0.51777526,0.57753065,0.64652310,0.71186504,0.78967860,0.86672350,0.78928710,0.71440649,0.65668906,0.60737208,0.53508659,0.47009073,0.39422115,0.31104660,0.30739005,0.30559376,0.29297979,0.28511268,0.24755511,0.20835701,0.16238459,0.11983950,0.19211856,0.26091840,0.33004172,0.39938950,0.46230250,0.53299159,0.58898565,0.64719321,0.58142314,0.51442187,0.44958138,0.38832431,0.33136689,0.27220427,0.20643721,0.14529936,0.21074599,0.27170415,0.33591834,0.39909615,0.44503303,0.48439184,0.54084399,0.59785468,0.55331997,0.50878972,0.48455350,0.45761593,0.45499443,0.45584111,0.46265535,0.46154569,0.50995380,0.55502579,0.59511500,0.64215583,0.69043048,0.74101361,0.78201703,0.82625942,0.76475879,0.69415215,0.61587912,0.53932250,0.51403328,0.48980204,0.45823109,0.41889250,0.46177790,0.51069081,0.55566915,0.60352114,0.63138147,0.66151166,0.68927309,0.71930972,0.70629711,0.69364333,0.67770049,0.66695286,0.67714749,0.68498828,0.69995446,0.72103443,0.66786307,0.60812793,0.55869957,0.50541814,0.44258990,0.38382559,0.32958724,0.27944543,0.26785586,0.25928404,0.24457731,0.22569481,0.25001196,0.27132156,0.27215792,0.27514662,0.34124033,0.41037199,0.46519743,0.51867110,0.58530419,0.65388248,0.73053039,0.80320635,0.80329687,0.79790178,0.81407930,0.83365895,0.81884038,0.80880704,0.81042395,0.81294992,0.79171474,0.76974197,0.75752167,0.74021999,0.77257588,0.80263647,0.83923115,0.87303524,0.83535787,0.80313983,0.78359711,0.75894408,0.72524047,0.68769169,0.66160117,0.64199834,0.58286909,0.52321406,0.47723960,0.42108304,0.39094731,0.35968468,0.32194835,0.28891198,0.29661578,0.30328616,0.31358629,0.31812984,0.33167545,0.35258056,0.36742985,0.38501988,0.42516019,0.46660889,0.51515479,0.56471571,0.60152706,0.64527830,0.69156404,0.74155791,0.68167861,0.62396890,0.56692559,0.51170324,0.48836238,0.46425687,0.43591880,0.41524935,0.44452844,0.48057781,0.51337834,0.54726652,0.62240141,0.69382700,0.77643121,0.85897895,0.78780558,0.71737503,0.65411897,0.59750660,0.53598621,0.48205169,0.43038448,0.38343041,0.40364755,0.42048661,0.43501705,0.44587436,0.44189512,0.44718153,0.45312989,0.45521497,0.47571817,0.50008327,0.51700145,0.54069659,0.55159290,0.57040554,0.57852361,0.58678464,0.56265364,0.53889178,0.52121286,0.49901698,0.47429564,0.45710414,0.43116462,0.40993345,0.39739586,0.38526750,0.37014550,0.35348957,0.32647496,0.30444897,0.26435114,0.23014204,0.26795076,0.30213957,0.33271633,0.36161636,0.39063517,0.41874233,0.43901399,0.46199446,0.46433897,0.46456039,0.46512423,0.45855609,0.43998985,0.41931849,0.40683547,0.39082859,0.41647383,0.44468301,0.47227494,0.49445509,0.48293850,0.47053008,0.46257903,0.45098725,0.50285947,0.55343402,0.60454676,0.64705635,0.71618161,0.78492202,0.84298607,0.88349994,0.81792973,0.74490753,0.66636270,0.58550130,0.52159007,0.46724303,0.40485912,0.34333098,0.39210821,0.44565152,0.49561831,0.54985726,0.60927722,0.66752804,0.74250987,0.82373509,0.75567893,0.69100280,0.64975898,0.60365295,0.54979553,0.50322314,0.43764045,0.36683496,0.35376043,0.33642795,0.31094934,0.28408237,0.28004033,0.27089364,0.24633003,0.22362036,0.27415908,0.32273778,0.36310994,0.40828985,0.46741850,0.52113897,0.56308469,0.60912224,0.55942250,0.50217684,0.44656460,0.38879311,0.33373383,0.27672853,0.21285466,0.14385553,0.20445295,0.26404392,0.31250213,0.37044647,0.41557940,0.45869079,0.52808265,0.59788178,0.56184249,0.52705916,0.52098201,0.51152620,0.50788191,0.50117164,0.51588190,0.53452929,0.54512481,0.55575962,0.57134809,0.59138717,0.61981086,0.65811548,0.68192248,0.70506487,0.65945984,0.62136239,0.55485584,0.49304102,0.47577224,0.46284236,0.41129360,0.36613588,0.41752862,0.46100761,0.51975965,0.58178015,0.59619545,0.61801560,0.63645851,0.64945104,0.66162366,0.67538543,0.67851482,0.68107849,0.69304909,0.71015346,0.72554239,0.74294344,0.68136341,0.62143654,0.55404027,0.49472970,0.44983044,0.40527675,0.36543142,0.31881860,0.31304232,0.30162974,0.27541336,0.25337257,0.27156687,0.28921256,0.29330953,0.29293910,0.36146188,0.43629424,0.49767746,0.55723617,0.59842430,0.64042113,0.69447871,0.74877669,0.75386705,0.75879377,0.78057484,0.80144600,0.79178455,0.78672247,0.79770692,0.81274579,0.78486821,0.75905329,0.75999970,0.75981993,0.79126592,0.82686488,0.84919024,0.87832516,0.83656084,0.79455697,0.76548015,0.73178426,0.68251537,0.63004431,0.58811874,0.54850620,0.50477597,0.46613517,0.42986799,0.39255077,0.38594181,0.37605517,0.35155300,0.32842686,0.32471189,0.32608573,0.33728861,0.34807293,0.35932349,0.37117366,0.40330754,0.42867439,0.44723465,0.46324120,0.48279734,0.50317054,0.55670571,0.60860482,0.64791645,0.68729829,0.64674932,0.61050008,0.55795500,0.51536073,0.50031134,0.48256560,0.48092849,0.48303999,0.49859394,0.51685834,0.53302205,0.55187701,0.59274585,0.63123431,0.68828832,0.74540430,0.69068325,0.63849052,0.58645313,0.53131109,0.48122088,0.42689911,0.40579536,0.38078667,0.40678560,0.43680349,0.44891584,0.45697686,0.47398306,0.49180431,0.51065556,0.53290018,0.52449061,0.52440625,0.52070244,0.52046969,0.53400573,0.54476370,0.54627274,0.54397190,0.53266135,0.52431580,0.51043842,0.49573291,0.49260966,0.49410806,0.48265217,0.47052506,0.46364606,0.45844317,0.43227322,0.40734498,0.37939280,0.35172979,0.31564992,0.28195634,0.31002075,0.33628040,0.37026208,0.40329293,0.42320535,0.44551434,0.46501091,0.48321353,0.48295142,0.48105224,0.47584465,0.47485263,0.45630527,0.44334835,0.43436459,0.42251034,0.44538868,0.46978523,0.48584410,0.51032638,0.50336482,0.49462708,0.50329960,0.50409418,0.53907778,0.57242026,0.62121800,0.66627683,0.72704050,0.79086345,0.84041040,0.89431138,0.80928375,0.72337182,0.63018741,0.54380756,0.49039086,0.43645627,0.38866621,0.33273006,0.37666582,0.42361137,0.46372196,0.50874911,0.56975906,0.63410466,0.70604900,0.77640728,0.73599712,0.68542308,0.65164382,0.61368349,0.56572976,0.52383133,0.47954583,0.42926244,0.40181003,0.37240638,0.33205295,0.29928842,0.30546189,0.31553744,0.32078365,0.32183950,0.34761584,0.36781244,0.40321432,0.43443218,0.47407947,0.51504217,0.55457769,0.59714094,0.53936999,0.48847954,0.43764441,0.38803393,0.32953081,0.26365667,0.20115415,0.14394876,0.18892751,0.23607325,0.27849155,0.32647410,0.38630322,0.43909409,0.51680294,0.59169542,0.56622635,0.54464651,0.54120498,0.53811585,0.54730916,0.55414543,0.57873158,0.60526882,0.58546817,0.57091046,0.54680988,0.52630620,0.54763096,0.56824958,0.57527121,0.58218919,0.55371140,0.53007714,0.49632307,0.45712336,0.43158522,0.41030927,0.36817363,0.32117142,0.37320089,0.42410247,0.48786641,0.54366134,0.55797022,0.57786730,0.58136586,0.59148419,0.62048801,0.64261974,0.66282402,0.68797155,0.69889702,0.71348267,0.73144696,0.75076163,0.68691625,0.61499096,0.54626456,0.47754258,0.45026442,0.42374423,0.39710463,0.37292162,0.34650822,0.32527453,0.29870118,0.27358339,0.28672312,0.30142992,0.30146968,0.30129918,0.37224955,0.44245038,0.51441712,0.58562903,0.60610100,0.61892145,0.64832449,0.67404490,0.69733289,0.71487342,0.74627256,0.77497325,0.77720422,0.78294177,0.79154236,0.79746630,0.77882624,0.75736753,0.75663954,0.75404398,0.78807391,0.82191874,0.85206330,0.89128830,0.84514635,0.79413049,0.75785984,0.71975788,0.65527812,0.58448147,0.51844570,0.45041010,0.42956680,0.41908949,0.39406856,0.36398255,0.36958605,0.37097718,0.35447165,0.34418374,0.34872173,0.34943247,0.35574768,0.35925508,0.38013703,0.40445872,0.43888694,0.47716395,0.47194118,0.46393681,0.45615812,0.44075466,0.49454810,0.53983294,0.58889577,0.63206855,0.59834405,0.57024996,0.54047088,0.50280818,0.51734777,0.52514394,0.53364916,0.54209630,0.54009134,0.53719661,0.53185804,0.53171271,0.55495702,0.57279625,0.60200310,0.63602168,0.58504894,0.53568275,0.49524600,0.44965403,0.42298763,0.40002849,0.38280664,0.37057197,0.39963435,0.43884273,0.46649180,0.49968703,0.51560446,0.53774712,0.56466590,0.59187253,0.57498232,0.56007831,0.53727354,0.52000652,0.51367680,0.51800264,0.50620742,0.49895931,0.49690262,0.50597162,0.49981650,0.50055526,0.51255373,0.52311920,0.53354369,0.53969484,0.52347140,0.50831873,0.48023656,0.45616118,0.42655021,0.38749456,0.35292009,0.31245411,0.34127008,0.37529698,0.40268875,0.42714934,0.45252627,0.47397172,0.49665873,0.51742055,0.50716476,0.49583951,0.48821641,0.48652894,0.47203993,0.45686538,0.45084997,0.44917137,0.47008379,0.48767265,0.50001590,0.51566543,0.52961682,0.54217605,0.55340197,0.57251892,0.59351419,0.61409046,0.64292326,0.67129063,0.73373115,0.79238387,0.84856561,0.90972618,0.80412945,0.70260589,0.59998582,0.49719395,0.45576421,0.40844940,0.37020646,0.32684637,0.36419043,0.40906919,0.43621596,0.46694052,0.53799758,0.60419660,0.67142267,0.73673472,0.70873522,0.68317186,0.64877402,0.62444291,0.58415479,0.54102995,0.51864704,0.49969322,0.45291394,0.40291831,0.35598818,0.30822844,0.33367011,0.35492093,0.38605482,0.42366405,0.42221249,0.41626706,0.43909394,0.45496488,0.48057154,0.51345006,0.54667016,0.58605422,0.52523082,0.46930648,0.42884496,0.38916545,0.32229127,0.25347911,0.19709507,0.14104423,0.17343109,0.20344849,0.24869951,0.28481261,0.35042038,0.41460207,0.49860429,0.58581348,0.57269497,0.56285733,0.56571455,0.57059867,0.58585270,0.59832487,0.64050131,0.68021753,0.62921562,0.58896231,0.52411362,0.46358502,0.47798223,0.49002644,0.47121888,0.45829877,0.44765711,0.44203260,0.43142800,0.42078143,0.38791700,0.35785475,0.31546578,0.27642766,0.33368855,0.38394040,0.45189342,0.51238055,0.52461853,0.53343858,0.53268955,0.52781697,0.57438001,0.61537977,0.65301498,0.69350568,0.70894067,0.72004398,0.73779772,0.75988984,0.68772748,0.61700366,0.53981960,0.45846575,0.45187298,0.44463521,0.42992762,0.42348627,0.38952924,0.35547142,0.32429711,0.28571793,0.30223588,0.31133870,0.31397552,0.31055999,0.38082430,0.44775350,0.53249480,0.61803848,0.61089001,0.59954957,0.60307844,0.59991359,0.63625246,0.67433927,0.71570508,0.75521245,0.76407970,0.77779290,0.77901119,0.78169120,0.76711415,0.75718979,0.75328234,0.75208772,0.78442369,0.81117526,0.86187886,0.90768292,0.84553849,0.78759335,0.74552339,0.71040447,0.62432073,0.54372843,0.44521335,0.34437350,0.35585461,0.37068123,0.34929936,0.33264910,0.35135154,0.36470921,0.36301766,0.36482699,0.36710841,0.37168295,0.36954613,0.36424627,0.40080420,0.43993359,0.47813600,0.52424018,0.49110658,0.46909061,0.42434360,0.37972851,0.42890576,0.47287174,0.52412642,0.58154482,0.55474308,0.53341867,0.51252932,0.49517772,0.53044842,0.56566878,0.58431025,0.60695909,0.57809373,0.55302791,0.53746640,0.51746426,0.51642290,0.50964097,0.52265519,0.52939039,0.48620079,0.43720580,0.40377980,0.36841952,0.36784290,0.36985700,0.36375523,0.35792177,0.39615449,0.43681767,0.48821078,0.53814928,0.56326662,0.58659780,0.62432502,0.66142138,0.62496799,0.59772418,0.55109962,0.51244627,0.50127141,0.48888961,0.46788195,0.44794989,0.46332786,0.48119209,0.49230202,0.50673943,0.53110313,0.55263814,0.57970622,0.60485028,0.58169273,0.55760578,0.53073761,0.50913099,0.46687607,0.43182604,0.39106369,0.34870750,0.37805256,0.41370741,0.43324250,0.45950573,0.47773853,0.50300196,0.52433226,0.55083701,0.53069069,0.51350009,0.50476707,0.49552594,0.47851499,0.46587693,0.47691822,0.48269119,0.49340295,0.50246231,0.51344674,0.52442814,0.55285346,0.58579758,0.61237657,0.63715854,0.64505289,0.65343538,0.66731847,0.67843820,0.74207371,0.80289075,0.85093547,0.88558446,0.79173479,0.69494639,0.59466615,0.49774575,0.43930957,0.37684779,0.32040278,0.26608477,0.31361760,0.36136214,0.39579651,0.43468329,0.50048551,0.55886691,0.62629220,0.69147256,0.67600468,0.65606349,0.63535921,0.61897004,0.57941384,0.53949195,0.51924804,0.49850369,0.45931669,0.42650276,0.38976661,0.35899158,0.39174375,0.41797726,0.44116646,0.46787379,0.46366331,0.46169993,0.47257814,0.48262396,0.48479668,0.49148900,0.50701777,0.51488754,0.46770385,0.42490457,0.38965483,0.35208348,0.28405682,0.22145413,0.16658562,0.11787614,0.15505665,0.19701565,0.23825361,0.28098945,0.33943876,0.39798836,0.46427094,0.53115579,0.54335041,0.54808132,0.56449054,0.58456364,0.60626917,0.63205428,0.67308818,0.71442253,0.64975171,0.57982648,0.51141787,0.44464456,0.42935908,0.41589959,0.38583698,0.36452670,0.36819769,0.37185631,0.36655559,0.36363920,0.33441687,0.31128399,0.28434421,0.25356437,0.30662083,0.35853147,0.41790201,0.47933427,0.49391530,0.50999653,0.51379070,0.51296581,0.56285339,0.60496615,0.64024422,0.67885055,0.70669552,0.73784684,0.77157152,0.80393129,0.73202556,0.66170169,0.59627624,0.53011034,0.49851875,0.46532282,0.43721711,0.41565997,0.39913541,0.38004399,0.35982024,0.33887625,0.34344323,0.34636762,0.35047546,0.35351553,0.40747044,0.46658927,0.52030262,0.58076735,0.58490138,0.59536807,0.60067886,0.60680616,0.63294971,0.66300200,0.69605216,0.72653258,0.74140166,0.76167588,0.77721732,0.79037590,0.78584470,0.78279456,0.78044238,0.78598863,0.81467305,0.84114345,0.87974426,0.91780643,0.85205691,0.78118459,0.71527978,0.64929373,0.57132120,0.49153814,0.39133439,0.30021978,0.31879548,0.33956788,0.34417915,0.34755005,0.36387090,0.38693764,0.38794111,0.39553171,0.40359147,0.40574450,0.40349530,0.40222089,0.42838866,0.46012917,0.48399739,0.50896367,0.48398744,0.45974842,0.40940667,0.36217848,0.39258207,0.42163259,0.45510969,0.48251555,0.48998782,0.49632631,0.49640955,0.50159892,0.54867570,0.59645843,0.63070253,0.67174663,0.61877940,0.57299169,0.53366851,0.49426398,0.47693055,0.45801111,0.43153763,0.40758696,0.38443817,0.35895578,0.34320927,0.32279041,0.32655231,0.33175129,0.32498382,0.32116231,0.37839722,0.42924390,0.47400887,0.51869529,0.55639798,0.60079198,0.64341370,0.68940922,0.64748299,0.60856295,0.56714598,0.51734878,0.49152398,0.46863915,0.44069282,0.41528455,0.44775079,0.47562765,0.50843396,0.53618870,0.57655680,0.61569194,0.65264808,0.69868423,0.66040798,0.61703971,0.57149617,0.52501439,0.48975958,0.45857679,0.40894342,0.36607648,0.39247127,0.42142226,0.43850539,0.46181067,0.47962475,0.49638862,0.51624147,0.52923511,0.51717209,0.50998827,0.50054168,0.48740119,0.47640051,0.47329378,0.46917742,0.46417773,0.49265507,0.51706030,0.53867472,0.56208541,0.60250712,0.63861522,0.66622442,0.69818719,0.70647573,0.70840592,0.72032345,0.73217609,0.77202860,0.80966253,0.85232781,0.86348222,0.77835960,0.68739719,0.59408090,0.50114630,0.42493220,0.34922369,0.27596918,0.20754275,0.25918365,0.31324300,0.35754357,0.40527221,0.46278319,0.51509441,0.58681499,0.64923445,0.64151252,0.63497786,0.62217210,0.61539519,0.57433786,0.54042233,0.51796170,0.49806511,0.46990065,0.44473208,0.43114816,0.41004821,0.44343445,0.47929652,0.49175194,0.50907940,0.51012873,0.50559837,0.50335134,0.50640409,0.48896247,0.46997644,0.46287146,0.44747233,0.41350998,0.37713747,0.34563231,0.31333810,0.24938162,0.18214917,0.14219766,0.09539636,0.14416997,0.19017631,0.23178241,0.27810626,0.32612151,0.37897595,0.42981111,0.48125526,0.50867720,0.52842244,0.56230505,0.59991587,0.62864346,0.65475450,0.70519254,0.75430170,0.66538028,0.57156198,0.49863421,0.41636692,0.37963348,0.34500802,0.30577553,0.26671437,0.27917335,0.30110591,0.30107420,0.29767656,0.28104885,0.25851046,0.24626715,0.22705087,0.27827208,0.32800620,0.38258202,0.44390102,0.46484117,0.48682234,0.49296534,0.49628304,0.54933335,0.60099964,0.63210304,0.66422104,0.70943064,0.75965572,0.80422017,0.85003815,0.77982902,0.70514465,0.65569057,0.60749225,0.54285675,0.48495903,0.44860935,0.40345818,0.40396660,0.41055740,0.39705877,0.38477203,0.38638283,0.38474912,0.38977711,0.40231687,0.44159074,0.48075004,0.51341857,0.54715716,0.56759173,0.59282636,0.60026525,0.60589460,0.62563588,0.64284800,0.66973602,0.69500014,0.71784105,0.74019742,0.76852086,0.80139729,0.80026296,0.80144201,0.80665975,0.81725901,0.84344896,0.87300829,0.90088023,0.93320396,0.84930363,0.77498885,0.68223192,0.58926456,0.51139673,0.44045679,0.34177944,0.24627394,0.28150755,0.31294997,0.33413255,0.35384986,0.38358002,0.41353808,0.41481288,0.42026070,0.43292832,0.44239251,0.44236387,0.43875051,0.45683509,0.47629404,0.48601957,0.49512675,0.47638836,0.45177283,0.39388230,0.33958537,0.36012468,0.37119927,0.37857485,0.38280978,0.41918754,0.45512469,0.47701966,0.50611389,0.56493826,0.62583375,0.67972688,0.73679409,0.66130814,0.58234598,0.52773774,0.47137701,0.43956511,0.40465059,0.34673688,0.28752612,0.28177980,0.27401146,0.27377653,0.27667362,0.28712271,0.29419808,0.29099983,0.28843411,0.35540635,0.42585473,0.46424289,0.49985275,0.55543155,0.61333270,0.66767702,0.71591236,0.66915340,0.62401421,0.57717961,0.52335495,0.48405033,0.44761159,0.41218975,0.38297383,0.42446208,0.47401549,0.51679686,0.56324133,0.62103081,0.67057678,0.73247183,0.79147536,0.73080643,0.67694511,0.60339061,0.53388041,0.51024982,0.48181169,0.43564824,0.38331805,0.41152638,0.43822820,0.44916641,0.45785872,0.47547028,0.49170510,0.50082405,0.51358881,0.50573836,0.50348330,0.49239370,0.47795373,0.47810121,0.47485893,0.46548131,0.44847311,0.48843227,0.53162436,0.56590748,0.59941065,0.64660061,0.68836246,0.72580449,0.75777752,0.76492985,0.76363623,0.77631835,0.78126050,0.80429458,0.82040793,0.84479149,0.87246267,0.77636850,0.68164937,0.58441657,0.49345027,0.40739627,0.32242442,0.23608193,0.14552057,0.20468435,0.25485166,0.31363228,0.36445334,0.43137371,0.49030953,0.55627878,0.62037607,0.61141660,0.60516583,0.60304907,0.60065588,0.57524629,0.54379231,0.52452737,0.50821228,0.49486290,0.48209053,0.46977288,0.45473042,0.48630059,0.52538804,0.54775790,0.57004679,0.55881897,0.54515517,0.54326786,0.53233777,0.49340339,0.45612805,0.42318240,0.39565467,0.37003695,0.33447726,0.30850800,0.28212487,0.22199498,0.15728078,0.10897430,0.05241491,0.10578834,0.15926509,0.21519817,0.26778918,0.31427254,0.35695751,0.40104360,0.45174936,0.48471221,0.51646659,0.55527879,0.59706540,0.64466398,0.68868163,0.74405926,0.79605462,0.69782757,0.58970875,0.48785371,0.38876569,0.32502598,0.26419307,0.20596561,0.13956045,0.17096037,0.20554622,0.23340300,0.25341497,0.24525725,0.22919329,0.21367110,0.19783427,0.25194341,0.30228414,0.35054604,0.40204356,0.42651154,0.44430398,0.46954515,0.49022217,0.53322779,0.57464720,0.60224118,0.63555179,0.69874997,0.76305028,0.83097001,0.89535030,0.82843985,0.75566381,0.71043028,0.66088474,0.58767369,0.52246064,0.46148713,0.40842671,0.41053017,0.41833615,0.42081523,0.41859758,0.41637304,0.41592668,0.41705906,0.42218753,0.44567323,0.47101008,0.48993402,0.50734182,0.53867453,0.56693434,0.58512678,0.60235392,0.61930518,0.64110658,0.66056933,0.68322270,0.71610977,0.74901291,0.78132976,0.81466910,0.81055938,0.81142437,0.82175167,0.83038060,0.86370085,0.88960243,0.92173948,0.94971619,0.84793844,0.75183671,0.64727275,0.53984636,0.45862483,0.38017569,0.28248849,0.18485546,0.23034608,0.27464366,0.32136190,0.37298287,0.39501674,0.41709992,0.44048952,0.46501040,0.46698222,0.47068782,0.46661342,0.46087824,0.47194764,0.48522769,0.49705782,0.50415051,0.46662153,0.42884477,0.37444062,0.32156475,0.31873590,0.31610520,0.31163074,0.30725168,0.35433708,0.41070013,0.45141550,0.48688962,0.56435523,0.64246535,0.71999189,0.80133849,0.70544393,0.61168979,0.52046047,0.43730879,0.38099075,0.32856756,0.25408136,0.17991254,0.19408928,0.20510472,0.20850408,0.22045178,0.22926581,0.24888586,0.25568672,0.26212327,0.33492509,0.40269967,0.45469567,0.50192921,0.57018088,0.64082927,0.69735238,0.75784401,0.69902685,0.64359898,0.59555479,0.54343459,0.49132234,0.43711456,0.38609773,0.32925128,0.39505144,0.46463088,0.53114939,0.60444915,0.67482442,0.73980164,0.81159146,0.88290719,0.79919558,0.71998786,0.63886971,0.55742868,0.52709555,0.50211681,0.45553972,0.41194235,0.43089971,0.45437065,0.46800461,0.47507516,0.47977486,0.48120837,0.49566874,0.50536195,0.49917864,0.49768986,0.49618605,0.48549156,0.48338296,0.47968511,0.46757175,0.45004940,0.50117389,0.55262015,0.59875648,0.64621554,0.69806609,0.75213543,0.79587010,0.84045453,0.83857995,0.83804367,0.83970903,0.84408160,0.84721837,0.85011039,0.86143967,0.88282044,0.77528788,0.66789678,0.57910803,0.48614006,0.38891172,0.29765967,0.19004194,0.08270858,0.14386438,0.19909176,0.26299243,0.32507670,0.39765593,0.46779288,0.52998537,0.58938253,0.58368851,0.57764262,0.58383293,0.59346335,0.56797564,0.54662369,0.53102854,0.51513631,0.51938271,0.52536914,0.50640636,0.49400765,0.53727475,0.57443025,0.59827109,0.62971128,0.60821482,0.59010852,0.57446411,0.56353839,0.50156465,0.43456368,0.39036182,0.34426094,0.31635762,0.29242169,0.27424376,0.25016047,0.18874559,0.13279302,0.07433371,0.01257613,0.07263299,0.13364392,0.19546388,0.25745463,0.29320758,0.33115197,0.37588343,0.41548573,0.45552488,0.49842777,0.54876206,0.59882790,0.65794479,0.71523994,0.77885050,0.84677413,0.72618276,0.60947367,0.48373825,0.35116285,0.27395576,0.18743176,0.10381092,0.01822998,0.06492634,0.10782955,0.16095570,0.21400270,0.20432536,0.19536471,0.18162548,0.17093786,0.22479749,0.27357499,0.31446445,0.35828146,0.38630936,0.40587676,0.44415895,0.48421959,0.51837162,0.55282462,0.57724372,0.60022677,0.68644963,0.77432023,0.85604979,0.94008026,0.87468923,0.80890820,0.76009238,0.71738450,0.63537379,0.55632079,0.47997279,0.40611609,0.42038367,0.42869091,0.43968615,0.45680454,0.45210335,0.44100586,0.44525519,0.44505972,0.45190434,0.45997923,0.46500696,0.46759837,0.50672084,0.54859072,0.57233600,0.60356382,0.61747891,0.63261911,0.64883186,0.66504234,0.71188868,0.75570878,0.78910117,0.82498716,0.81828914,0.81307494,0.83147826,0.84924038,0.87789692,0.91227756,0.93828369,0.97117940,0.85058318,0.72862166,0.60911334,0.48984698,0.40556551,0.32547220,0.21976735,0.11864706,0.18425144,0.24032465,0.31141720,0.38614387,0.40238488,0.42073470,0.46488987,0.50123672,0.50053204,0.49559725,0.48767677,0.48451945,0.48573463,0.48750540,0.50324409,0.51417924,0.45682362,0.40164594,0.35458209,0.29973322,0.28207406,0.26171848,0.24288082,0.22079317,0.29232355,0.37028185,0.41937368,0.47151401,0.56381593,0.65268791,0.76134921,0.87288235,0.75211529,0.63192885,0.51845698,0.40251788,0.32841258,0.25177106,0.15881827,0.06524251,0.09874226,0.13285592,0.14714760,0.15729954,0.17800466,0.19916918,0.21770445,0.23006766,0.31058359,0.38666684,0.44399858,0.50736514,0.58696835,0.67035137,0.73406317,0.80578106,0.73504060,0.65887850,0.61048956,0.56021169,0.49425193,0.43260500,0.35743459,0.27811913,0.37009573,0.45428248,0.54754180,0.64414152,0.72967505,0.81280164,0.89424330,0.97758804,0.86956777,0.76342098,0.67164012,0.57645377,0.54798096,0.51791627,0.47843405,0.43872160,0.45296648,0.47480624,0.48039029,0.49138791,0.48142312,0.47102160,0.48474423,0.49217615,0.49131532,0.49579929,0.49263928,0.49464737,0.48630192,0.48710434,0.46916480,0.44932119,0.50743385,0.56711284,0.62546512,0.69144133,0.75012090,0.81330903,0.86503793,0.92253275,0.91249639,0.90670340,0.90089303,0.90367223,0.88671827,0.87649961,0.87725051,0.84711853,0.76829525,0.68836594,0.60227166,0.52084995,0.44579677,0.36990510,0.28922765,0.21061491,0.24593027,0.28990095,0.34270286,0.39195516,0.44470702,0.50089864,0.55123216,0.60269437,0.60148282,0.60041560,0.60041103,0.60120446,0.58463996,0.56890001,0.55796916,0.55068431,0.54163956,0.53937885,0.52455049,0.51123172,0.52372902,0.53980788,0.56060596,0.57688178,0.55818600,0.53971195,0.53024721,0.52581900,0.48689886,0.45181003,0.42732469,0.40746579,0.37845823,0.35332304,0.33369494,0.30875497,0.26275873,0.21231658,0.16659318,0.11176663,0.15424655,0.19070294,0.22978542,0.27778848,0.31382053,0.34740295,0.38271323,0.42073697,0.46064111,0.50652635,0.55390992,0.59664886,0.64741382,0.70239835,0.74929783,0.79496454,0.70193989,0.60757461,0.50528852,0.40707953,0.34063856,0.27279181,0.20750923,0.14296095,0.17052521,0.19531129,0.22725555,0.25793616,0.24703007,0.23729347,0.22380116,0.21563885,0.25410666,0.29260596,0.32706517,0.36631660,0.38619395,0.40925174,0.43892142,0.46455950,0.49287975,0.52505862,0.56317732,0.59526265,0.66541281,0.72702529,0.80418360,0.87968006,0.82721522,0.77116584,0.72752684,0.68276228,0.61272403,0.54791081,0.49726439,0.44026222,0.43451188,0.43734614,0.43494403,0.43438903,0.42953109,0.42863718,0.43150630,0.43558792,0.44827939,0.45776560,0.47694793,0.49289396,0.51218088,0.53846752,0.55911484,0.58644276,0.59764026,0.61871569,0.63111467,0.64593101,0.69335948,0.73627760,0.77932806,0.81713797,0.81571277,0.81789054,0.83846685,0.85494888,0.87329528,0.88808877,0.91018083,0.93239187,0.83165677,0.72952292,0.64044057,0.54598075,0.47001807,0.39543885,0.30885283,0.22314784,0.26025076,0.30062745,0.33974930,0.38133815,0.39726623,0.41602821,0.44412369,0.47438382,0.48085935,0.48788425,0.48139669,0.47490298,0.48462208,0.49815187,0.50430030,0.50675514,0.46487443,0.42655160,0.39003417,0.34956184,0.32732639,0.29909096,0.27221770,0.23950104,0.29648581,0.35005219,0.40241176,0.46015743,0.52391878,0.58496073,0.66608996,0.73920687,0.65560204,0.56929571,0.47543000,0.37840635,0.31410245,0.24305507,0.17121295,0.09331068,0.12581331,0.15187510,0.17268225,0.19825019,0.21959416,0.24094124,0.26292684,0.28554493,0.34985478,0.42222625,0.47770385,0.53184186,0.59959551,0.66759389,0.73598076,0.80625157,0.74400380,0.67717630,0.62538514,0.57327645,0.50601678,0.44293301,0.37906033,0.31416448,0.38809034,0.46628437,0.54515936,0.62204405,0.68418640,0.74389324,0.82065182,0.89380672,0.81090643,0.73282711,0.65352873,0.58199228,0.55430254,0.53550865,0.50064688,0.46990481,0.47205594,0.48272355,0.48317000,0.48685434,0.47210077,0.46167805,0.45999987,0.45644689,0.45896173,0.46192387,0.46113966,0.45960682,0.45848352,0.45998828,0.45249557,0.44670358,0.50423825,0.55855953,0.61274730,0.66557394,0.72635709,0.78500289,0.84878541,0.91257402,0.90309624,0.89409938,0.89093273,0.88385822,0.86878099,0.85803833,0.84864161,0.80921048,0.75558767,0.70272827,0.63170697,0.55497804,0.49575728,0.43784406,0.38812015,0.33409006,0.35363346,0.37076369,0.41273356,0.45750772,0.50060846,0.53673938,0.57641710,0.61083983,0.61685153,0.62189173,0.61858584,0.61751188,0.60008276,0.58287957,0.58236328,0.58177069,0.57098078,0.55892926,0.53930406,0.52660172,0.51531387,0.50944377,0.51943192,0.52388408,0.50973320,0.49198881,0.49199791,0.48442787,0.47676412,0.47029218,0.46575083,0.46374509,0.43655213,0.41430697,0.39170917,0.36754321,0.33079392,0.29570734,0.25319698,0.21273109,0.22428795,0.24244601,0.26919403,0.29355761,0.32944588,0.36272301,0.39106987,0.42452766,0.47190407,0.51695616,0.55704752,0.59705518,0.64045396,0.68884964,0.71656047,0.74867088,0.67585565,0.60850649,0.53242552,0.46123329,0.40895801,0.35673399,0.31120948,0.26619077,0.27592035,0.27514385,0.29639545,0.31114829,0.29427278,0.27789522,0.26886657,0.25880092,0.28999788,0.31527804,0.34527331,0.37046306,0.39573240,0.41362702,0.42615869,0.44099711,0.47523389,0.50016597,0.54486397,0.59219572,0.63575335,0.68352679,0.74791659,0.81789191,0.77368979,0.73946238,0.69122147,0.64727093,0.59898255,0.54375936,0.50927314,0.46988432,0.45764122,0.44131434,0.42602967,0.41138012,0.41115745,0.40759331,0.41414698,0.42217456,0.43982783,0.45371042,0.48357542,0.51774428,0.52389421,0.52530351,0.54659855,0.56363071,0.58369784,0.59970743,0.61506473,0.62925115,0.67911369,0.72552268,0.76225415,0.80771660,0.81799289,0.82695084,0.84253430,0.86109666,0.86513608,0.87138755,0.88872136,0.90289088,0.81481491,0.73067528,0.66471746,0.59558562,0.53258674,0.47032239,0.39332074,0.32195519,0.33557218,0.35714221,0.36164230,0.37264701,0.39166387,0.40606397,0.43054050,0.44759299,0.46230086,0.48006713,0.47219028,0.45961907,0.48667325,0.51044792,0.50455063,0.49408010,0.47471300,0.44534476,0.42627720,0.40200148,0.36882351,0.34129433,0.29419708,0.25170017,0.29327914,0.32886706,0.38848466,0.44578845,0.47860423,0.51225103,0.56425288,0.60986717,0.55824211,0.50566939,0.42419973,0.34917176,0.29524563,0.24214291,0.18300302,0.12785836,0.14701351,0.17057194,0.20135766,0.23445606,0.25728940,0.28190001,0.31224834,0.33745957,0.39820042,0.45484310,0.50802942,0.55727565,0.61183300,0.66894405,0.74448382,0.81256027,0.75382708,0.68909246,0.63659686,0.58437127,0.51969692,0.44967799,0.39635251,0.34066277,0.41119674,0.47470806,0.53312647,0.60007961,0.64310696,0.68008925,0.74658675,0.81307011,0.75709992,0.69749191,0.63985467,0.57761443,0.56319578,0.54754455,0.52029296,0.49447140,0.49178174,0.48752747,0.48475064,0.47981176,0.46430817,0.44905569,0.43597600,0.42594981,0.42740776,0.43047480,0.42544125,0.41919827,0.43273751,0.44128421,0.43839203,0.44135924,0.49362510,0.54792425,0.59637714,0.64232859,0.69855106,0.75195705,0.82666975,0.90440325,0.89353452,0.88959833,0.87498722,0.86416048,0.85318334,0.83684324,0.82248525,0.78165687,0.74205126,0.69774449,0.65343499,0.60845054,0.56151516,0.51123646,0.47619350,0.44334356,0.45216242,0.46640058,0.49638891,0.52440205,0.55583131,0.58799975,0.61894574,0.64649270,0.64129376,0.63280400,0.62665625,0.62508763,0.62226286,0.62006217,0.62120045,0.62807543,0.60642466,0.58317254,0.55963767,0.53595564,0.51067569,0.48911390,0.47872901,0.47346299,0.46997246,0.46723246,0.46362166,0.45883190,0.47624064,0.49160874,0.51315896,0.52969449,0.50387308,0.48533512,0.46245333,0.43513059,0.40461625,0.37088559,0.33488331,0.29377777,0.29295750,0.29590118,0.29914987,0.29423517,0.33269815,0.36743819,0.39259309,0.42567994,0.46684574,0.51039346,0.54728164,0.58639822,0.62310668,0.65275890,0.68648931,0.71260242,0.65894559,0.60564158,0.55528532,0.50106937,0.47029675,0.44822093,0.42615917,0.40410206,0.38780478,0.37059072,0.35807193,0.34974723,0.33612568,0.31622687,0.31466751,0.30690483,0.32430897,0.34375041,0.36683842,0.39373560,0.40802528,0.41957411,0.43161052,0.44323618,0.46633980,0.49561162,0.53086346,0.56241883,0.60444822,0.65161336,0.70394717,0.75459098,0.72359044,0.68964085,0.65706088,0.61827385,0.58388345,0.54245948,0.51861797,0.49579762,0.47019672,0.44069568,0.41828706,0.39271751,0.39813350,0.39489048,0.39529786,0.39146619,0.42214565,0.45459648,0.48838622,0.52506369,0.52508919,0.51686144,0.53418779,0.54320576,0.56642897,0.59207661,0.60403156,0.62038348,0.66801087,0.71469870,0.74690649,0.78110268,0.80491349,0.81712220,0.83808919,0.85721736,0.85040575,0.85101255,0.85929985,0.86256624,0.80274065,0.74201496,0.69752786,0.65578780,0.59800641,0.53144603,0.47086265,0.40189241,0.39513610,0.38800564,0.38114203,0.36475494,0.38364743,0.40633099,0.42643907,0.44903193,0.45677846,0.46542433,0.47052900,0.47265593,0.47888913,0.49348898,0.49612474,0.50252557,0.48624031,0.45875510,0.45339274,0.44945378,0.40991527,0.36555504,0.31251273,0.25636127,0.29654730,0.33314543,0.37072795,0.40876481,0.43431673,0.45059331,0.47666057,0.50012496,0.46079473,0.42585002,0.37872241,0.32515320,0.27926283,0.22777458,0.17790490,0.13196849,0.16105652,0.19117875,0.23935137,0.28101819,0.31389225,0.34029572,0.37407012,0.40830515,0.45308170,0.49556047,0.53196518,0.56839779,0.63169345,0.69742550,0.76547788,0.83131420,0.76494630,0.69966978,0.63958528,0.57233023,0.52886933,0.47905580,0.42901295,0.37713599,0.42293493,0.47157059,0.52043227,0.55980359,0.59864151,0.63981562,0.69261068,0.74671615,0.70139422,0.65745459,0.62583021,0.58789106,0.57028702,0.54932562,0.53504782,0.52480413,0.50144522,0.48931518,0.47817199,0.47222020,0.44762322,0.43086871,0.41365192,0.39674045,0.39414881,0.40037211,0.39397327,0.39026693,0.40793135,0.42294257,0.43239210,0.44379013,0.48314658,0.53149104,0.56844896,0.61040035,0.68119845,0.74524267,0.82315615,0.89918001,0.89047358,0.88451207,0.87916086,0.87167413,0.84942501,0.82617841,0.79982795,0.75031553,0.72651968,0.69778415,0.67918423,0.66579604,0.62519906,0.58611263,0.56877266,0.55395420,0.55466753,0.55766555,0.57347638,0.59243715,0.61620697,0.64406120,0.66090919,0.67529408,0.66434289,0.64794803,0.63986900,0.63386128,0.64395409,0.65418809,0.66154907,0.67203876,0.63723583,0.60812562,0.57501707,0.54336383,0.50422264,0.46323106,0.44029584,0.42097137,0.43494703,0.44920569,0.44380233,0.43389897,0.47325046,0.51761397,0.55200143,0.59261999,0.57281254,0.55149441,0.53049075,0.50916101,0.47666310,0.45228258,0.41360487,0.37792442,0.36237381,0.35472839,0.32559618,0.29936976,0.33252700,0.36701394,0.39440606,0.42571307,0.46444878,0.50608554,0.54090823,0.57929298,0.59838908,0.62200463,0.65146772,0.67676970,0.64232560,0.60176408,0.57003017,0.54130723,0.53948319,0.53059006,0.53659330,0.54122021,0.49988116,0.46732999,0.42354990,0.38434055,0.37539701,0.35670212,0.35485493,0.35467084,0.36172138,0.37006553,0.39473983,0.41808890,0.42306778,0.42614224,0.42807823,0.43992796,0.46600437,0.49706308,0.51552997,0.54084920,0.57753155,0.61281513,0.65353310,0.69851980,0.67237360,0.64201913,0.61679074,0.59228650,0.56827726,0.53642644,0.53074440,0.52981465,0.48453141,0.43764811,0.40865024,0.37343410,0.38271875,0.38633732,0.37731107,0.36431482,0.40991727,0.45669552,0.49471698,0.54028219,0.52430373,0.51024512,0.51897677,0.52310253,0.55361951,0.58062115,0.59775072,0.61242610,0.65463425,0.69940084,0.72947945,0.76071845,0.78579759,0.81360589,0.83292417,0.85127947,0.83986378,0.83031086,0.82653097,0.82275714,0.78831270,0.75443753,0.73461885,0.71507869,0.65740896,0.60112613,0.54409846,0.48773278,0.45562435,0.42267916,0.39540952,0.35830405,0.38168797,0.40099100,0.42524355,0.44654976,0.45185285,0.45823730,0.46679401,0.48133734,0.48013820,0.47438888,0.49554709,0.51627489,0.49390130,0.47353800,0.48612046,0.49908054,0.44463812,0.39436680,0.32475662,0.25710802,0.29507440,0.33262610,0.35874762,0.37905937,0.38287820,0.38736573,0.38699886,0.38626674,0.36802272,0.35095938,0.32626247,0.29918229,0.25704472,0.21834962,0.17613272,0.13538631,0.17661037,0.21139487,0.26902023,0.33059478,0.35945752,0.39494108,0.43778589,0.48139354,0.50996809,0.53669687,0.55919935,0.58588326,0.65461805,0.72625603,0.78824696,0.85177450,0.78006988,0.71418860,0.63727662,0.56411885,0.53211653,0.50371500,0.46220264,0.41202872,0.44111515,0.47185247,0.49879343,0.52514490,0.55924825,0.59748023,0.63979906,0.68582534,0.64969560,0.61820066,0.60910786,0.60175990,0.57802409,0.55228832,0.55206873,0.55147213,0.51577253,0.48351748,0.47097338,0.46200041,0.43776542,0.40963519,0.38677914,0.36915812,0.36475679,0.36577046,0.36252912,0.36614834,0.38155831,0.40232699,0.42134362,0.44164907,0.47427558,0.51538966,0.54664094,0.57502884,0.65943086,0.74393638,0.81727322,0.89622644,0.89194841,0.88691014,0.87999865,0.88120616,0.84358228,0.81277638,0.77940868,0.76149642,0.74251133,0.71580775,0.70621049,0.69537883,0.67025018,0.64514964,0.62756968,0.61666549,0.62520166,0.62804987,0.63897617,0.64694702,0.65757728,0.66964434,0.68366404,0.69118578,0.68511035,0.68093954,0.66447605,0.65520090,0.65614462,0.65609285,0.66392837,0.67247791,0.63300715,0.59088799,0.54426909,0.50246413,0.45965233,0.41996792,0.38383597,0.35334445,0.38807660,0.41916727,0.44377550,0.46265776,0.51069286,0.54862516,0.59266454,0.63273643,0.60792224,0.58113927,0.54930252,0.52331342,0.49921153,0.47746152,0.45606340,0.43636944,0.42567992,0.41401466,0.38984240,0.37021715,0.38175046,0.39827216,0.40906277,0.42288476,0.44985546,0.47961384,0.51217791,0.54082927,0.56590045,0.59293087,0.61949736,0.65424969,0.63205114,0.60610309,0.58927903,0.57529167,0.57953595,0.58312556,0.60216673,0.61803307,0.56861747,0.51924166,0.47490703,0.42873512,0.41098306,0.39938708,0.38841810,0.38428344,0.37318070,0.37150399,0.37537096,0.37972551,0.37483080,0.36387535,0.36469091,0.36452623,0.39554938,0.42279103,0.44607399,0.46890688,0.51157801,0.55328772,0.58974871,0.62795711,0.61162211,0.60138055,0.58591751,0.57882319,0.55652392,0.53799965,0.53205116,0.52717725,0.49134101,0.45935286,0.41927996,0.38823128,0.38378222,0.38965677,0.37758708,0.36697081,0.40665994,0.44573170,0.47718463,0.51031899,0.50629307,0.50596936,0.51791385,0.52959696,0.55858749,0.59117180,0.61331047,0.64071800,0.69341515,0.74035329,0.78038708,0.82585985,0.83298860,0.83611560,0.84445526,0.85450518,0.85105304,0.84354432,0.84667733,0.84942467,0.81628605,0.78674679,0.75744059,0.72694207,0.69472362,0.65991857,0.62087811,0.58425304,0.54414109,0.50076809,0.45146763,0.39911818,0.39809933,0.38931846,0.38215420,0.36606648,0.38761094,0.41411108,0.43209119,0.44869534,0.45557265,0.45570793,0.46607006,0.47256700,0.46838523,0.45901225,0.46967833,0.47652236,0.43853328,0.39950685,0.34945140,0.29520818,0.31048675,0.32064862,0.33340104,0.34314092,0.32860418,0.32167358,0.30637144,0.29764050,0.29872949,0.30005796,0.28385204,0.27034533,0.23427989,0.19617282,0.15478520,0.11278303,0.17045764,0.22231622,0.28160711,0.34212556,0.37354658,0.40775666,0.45528292,0.49235661,0.52080548,0.54213267,0.57182945,0.60685993,0.67129380,0.74401094,0.80337832,0.85682858,0.79855437,0.74454142,0.67530021,0.60970872,0.58486990,0.55730430,0.52160886,0.49253279,0.49059482,0.49390146,0.50142623,0.50532805,0.52380988,0.53705917,0.56569302,0.58981064,0.57832198,0.57052506,0.57489935,0.56881634,0.56747877,0.57050177,0.56503436,0.56450950,0.52922921,0.49678211,0.46868849,0.44320841,0.40261360,0.35586513,0.32209399,0.29455698,0.29893850,0.29959607,0.31223816,0.32911933,0.34371965,0.35880286,0.38183274,0.40899685,0.44910987,0.49475574,0.53629214,0.57187163,0.64934802,0.72562361,0.80908211,0.88644108,0.87218286,0.86057473,0.85098602,0.84305557,0.82027207,0.80110254,0.77809780,0.77275586,0.75375313,0.73412809,0.72709117,0.72369110,0.71290202,0.70044594,0.68987684,0.67988009,0.68843499,0.70327832,0.70145016,0.70992883,0.70210953,0.69860287,0.70486416,0.71263031,0.71233093,0.71112094,0.69372138,0.67437795,0.67028938,0.65656598,0.67115662,0.67960348,0.62509895,0.57561824,0.51785229,0.46875581,0.41670114,0.37298287,0.33169727,0.28509694,0.33874005,0.39341990,0.44619873,0.49812971,0.53902704,0.58678526,0.62968026,0.67898937,0.64564497,0.61821134,0.57500847,0.53871236,0.52592807,0.50773071,0.50553339,0.50008845,0.48529066,0.47253421,0.45140852,0.43438252,0.43169619,0.42280535,0.42230818,0.42671350,0.43575229,0.45044047,0.47950297,0.50760762,0.53234450,0.56078250,0.59513177,0.63237768,0.61888914,0.61578648,0.61162024,0.60832437,0.62490497,0.63858107,0.66870133,0.69756880,0.63416889,0.57084107,0.52317707,0.46779950,0.45345633,0.43300304,0.42292510,0.40703220,0.38917235,0.36343946,0.35545520,0.34547262,0.32336344,0.30386595,0.29862527,0.29865979,0.32481804,0.35898756,0.37784794,0.40303518,0.44492398,0.49230108,0.52345569,0.55865054,0.56115236,0.55417327,0.56235376,0.56619736,0.55139292,0.54102020,0.53044327,0.52506860,0.49769682,0.47595948,0.43738662,0.39982187,0.39172670,0.38819495,0.37996582,0.36397063,0.39892076,0.43216834,0.45980281,0.48481009,0.49100958,0.49761518,0.51795682,0.53513027,0.56470723,0.59690533,0.63251994,0.66835950,0.72353806,0.77592137,0.83234411,0.88852158,0.87844313,0.86243060,0.86382819,0.85903167,0.85932968,0.84980059,0.86282324,0.87717965,0.84448022,0.81643065,0.77851890,0.73813911,0.72682338,0.72235388,0.70331777,0.67837171,0.62585978,0.57615655,0.50821371,0.44311359,0.41106945,0.38446947,0.33846846,0.29172924,0.32986649,0.36674336,0.39428664,0.42360632,0.42966871,0.43920348,0.43403190,0.43254784,0.43966232,0.44689555,0.45430482,0.45870465,0.43162753,0.40502430,0.36845259,0.33371493,0.32219060,0.31173217,0.31140483,0.30147932,0.27671912,0.24871690,0.22397463,0.19853833,0.22252803,0.24899299,0.24348602,0.23849406,0.20748070,0.16966168,0.13499582,0.09149648,0.15981622,0.22531985,0.28782690,0.35031710,0.38697390,0.42353913,0.46968205,0.51208259,0.52730011,0.54690244,0.59033081,0.62722759,0.69376586,0.76242882,0.81511443,0.87028126,0.82361442,0.77463639,0.71189820,0.65516198,0.63310378,0.60719174,0.59166335,0.57445312,0.54152127,0.51019357,0.49565780,0.47948909,0.48133333,0.47398185,0.48418729,0.49773348,0.50906075,0.52592995,0.53198669,0.53996546,0.55903632,0.58420579,0.57831697,0.57537316,0.53731862,0.50468996,0.46811458,0.43258135,0.36957274,0.30159896,0.25842644,0.21942812,0.22383591,0.23174194,0.26183247,0.28845636,0.30098380,0.30754432,0.34318610,0.37722016,0.42806415,0.47860923,0.51942343,0.56983716,0.63840795,0.71426301,0.80201772,0.88585194,0.86107410,0.83102211,0.81658236,0.80178464,0.79178226,0.78136019,0.78094916,0.79304593,0.78055959,0.76604020,0.75509842,0.73760972,0.74874096,0.75243331,0.75587718,0.75814132,0.75499111,0.75890026,0.75843159,0.75861535,0.74777252,0.73476065,0.73827898,0.74331468,0.73133498,0.72269876,0.71205814,0.70459476,0.69295981,0.68720343,0.68425205,0.68767580,0.61626780,0.54634078,0.47613847,0.40686345,0.36474493,0.32758207,0.27221805,0.21462304,0.29134883,0.36591483,0.43862021,0.51562912,0.56327122,0.61915165,0.67010604,0.71597267,0.67749305,0.63980085,0.59396220,0.54312823,0.54810117,0.55036000,0.55282595,0.55257681,0.53658801,0.52233998,0.50716639,0.49798533,0.46971521,0.44489806,0.42534808,0.41273852,0.42449147,0.43445218,0.44625255,0.46227341,0.49733006,0.52982367,0.55908962,0.59521427,0.60429516,0.60734753,0.62061912,0.63251146,0.67346203,0.71161221,0.74964670,0.79555605,0.72529482,0.65410283,0.58242216,0.51292937,0.49878896,0.48161274,0.46275610,0.44264495,0.40500837,0.36429698,0.33637530,0.30105265,0.27996855,0.26092454,0.24018088,0.21813770,0.25498773,0.28768881,0.31337684,0.33529333,0.38070183,0.42778567,0.46594577,0.50583418,0.51400628,0.52460875,0.54119268,0.56105085,0.54988424,0.53795800,0.53074203,0.52732449,0.49194694,0.46298187,0.42697734,0.38409391,0.39031114,0.38745863,0.37692283,0.36940260,0.38801457,0.40862701,0.43088357,0.45377032,0.47103099,0.49098731,0.50105514,0.51941625,0.56725205,0.60815062,0.65993245,0.70553580,0.76194057,0.82212949,0.88252036,0.94201427,0.92110840,0.89701977,0.89271701,0.88027318,0.87824363,0.88174498,0.88854179,0.89406312,0.85320128,0.81741847,0.78164599,0.74652402,0.75750850,0.77140338,0.77830274,0.79080737,0.71060554,0.62730270,0.55282507,0.47706903,0.41653133,0.36262843,0.29108406,0.22766295,0.27556459,0.31508717,0.36164821,0.40847181,0.40787422,0.41333238,0.40690685,0.39607702,0.41060980,0.42216292,0.43034564,0.43913272,0.42056975,0.40555451,0.38856244,0.36984266,0.35104554,0.32481339,0.29647792,0.27211923,0.23348917,0.19263628,0.15113603,0.10643303,0.14465777,0.18620767,0.20579637,0.23048638,0.19239537,0.15289643,0.11482026,0.07068291,0.15207693,0.22853699,0.30216314,0.37648746,0.41222090,0.44486766,0.48666743,0.52703223,0.55056948,0.58378672,0.61133500,0.64137403,0.70219580,0.76137134,0.82942984,0.89373627,0.84240334,0.79567498,0.74759431,0.70201071,0.67739103,0.66037241,0.64191040,0.63397931,0.59019039,0.54375681,0.51254052,0.47343847,0.44554752,0.41874842,0.40076231,0.38593675,0.41909153,0.45802717,0.49523682,0.52799594,0.55198744,0.57952707,0.58821177,0.59810826,0.55662666,0.51291590,0.45642335,0.40598212,0.34061889,0.26589024,0.19546576,0.12981876,0.15235663,0.18399037,0.21815351,0.24654616,0.26867456,0.28450564,0.31057654,0.33662044,0.38542314,0.43479015,0.49393745,0.54466939,0.62461280,0.70578669,0.79209735,0.88507589,0.86166897,0.83661549,0.81127206,0.78841617,0.78786110,0.78823430,0.78796557,0.81587231,0.80225077,0.79805998,0.77561283,0.75938305,0.78423220,0.81105538,0.82357499,0.84239165,0.82272752,0.81089981,0.81095295,0.80789943,0.79314370,0.77327112,0.77416265,0.77418972,0.75791451,0.74106255,0.73846188,0.73542515,0.72388167,0.71050415,0.70200715,0.69540851,0.60606384,0.51533032,0.43387682,0.35036907,0.31766414,0.28200180,0.21042154,0.14502869,0.24079064,0.33276382,0.43524016,0.53658328,0.59367424,0.65451627,0.70300451,0.75894850,0.71047366,0.66780251,0.60700922,0.55023514,0.57113384,0.59125392,0.59924307,0.60811133,0.58848346,0.56901037,0.56299944,0.56020412,0.50826381,0.45849634,0.42783979,0.39887446,0.40700197,0.41548664,0.42024921,0.42127225,0.45935591,0.49655873,0.52823204,0.55744334,0.58351440,0.60292374,0.63005207,0.65322138,0.71530526,0.78242939,0.83516463,0.89225466,0.80863127,0.73238347,0.64144513,0.54835285,0.54524188,0.53604960,0.50355384,0.47312833,0.42005226,0.36195172,0.31324589,0.26094430,0.23594310,0.20891133,0.17767339,0.14189982,0.18154882,0.22608999,0.24369122,0.25979619,0.31553614,0.37071995,0.41161518,0.45177451,0.47026072,0.49317295,0.52170852,0.55454471,0.54137081,0.52689954,0.53335254,0.53231005,0.49073947,0.44759764,0.40985001,0.37209266,0.38273217,0.39114121,0.38247708,0.37569840,0.38322631,0.38571853,0.40214756,0.41853713,0.45128506,0.48167524,0.49037048,0.50760668,0.56509639,0.62487008,0.68669562,0.74677835,0.80489803,0.86220027,0.92775717,0.99992599,0.96618261,0.93319491,0.91740694,0.90117078,0.90150352,0.91025400,0.91182702,0.91279566,0.86674987,0.82181956,0.78948125,0.75116135,0.78509853,0.81762739,0.85893100,0.90496766,0.79568815,0.68357775,0.59457161,0.50531272,0.42011856,0.34003293,0.25345188,0.15830703,0.21399851,0.26899574,0.33062724,0.39843857,0.39088283,0.38785382,0.37511340,0.36404645,0.38376330,0.40159849,0.41460111,0.42535429,0.41566427,0.40480683,0.40687838,0.40625034,0.37360227,0.34161781,0.29240694,0.23841377,0.19173629,0.13795967,0.07819853,0.01174191,0.07421275,0.13154943,0.17475592,0.21877250,0.18155010,0.14243025,0.09921918,0.05035012,0.14281418,0.23474291,0.32019363,0.40347088,0.43251399,0.46131302,0.49980057,0.54067967,0.57418538,0.61430856,0.63556672,0.65414032,0.70931412,0.76685065,0.84256424,0.91443385,0.86206548,0.81038084,0.77689143,0.74395614,0.72553327,0.70712691,0.69951095,0.69232423,0.63482184,0.58202684,0.51907916,0.46082761,0.41184930,0.36051773,0.32049087,0.27904118,0.33591617,0.38773974,0.45584399,0.52129526,0.54687842,0.57673065,0.59731304,0.62605255,0.57018641,0.51917587,0.45399536,0.38740794,0.30849447,0.23421065,0.13465382,0.03577763,0.08265959,0.13168191,0.17143319,0.20501923,0.23204993,0.26440422,0.27566655,0.29102596,0.34626617,0.39712814,0.46412164,0.52144106,0.60651770,0.69201836,0.78867025,0.88520887,0.85656782,0.83759500,0.80208978,0.77265968,0.78170537,0.78903804,0.80049437,0.80491640,0.79709617,0.78858471,0.77687880,0.76019663,0.77841652,0.80302990,0.80462370,0.81241617,0.79238869,0.77696217,0.76452663,0.74930056,0.72819426,0.71091857,0.69731068,0.67620193,0.67811257,0.68136016,0.68588264,0.69491485,0.68845763,0.68129889,0.68629351,0.69012162,0.61491954,0.53952213,0.46914516,0.40553661,0.36113522,0.32146457,0.26772850,0.21199265,0.28532200,0.36408923,0.43960431,0.51357357,0.56785094,0.61651323,0.66334493,0.71156094,0.68626735,0.65458666,0.61836303,0.57817744,0.58367188,0.58711305,0.58448624,0.58040473,0.57601585,0.56710622,0.55803889,0.55489753,0.50895006,0.46874952,0.44144573,0.41036523,0.43079687,0.45638370,0.47055361,0.48087918,0.52168359,0.55639269,0.58429893,0.60813593,0.62327635,0.63667178,0.64909097,0.65540627,0.69121239,0.73142407,0.76978853,0.80479572,0.75477005,0.70145944,0.63558071,0.57741319,0.55074693,0.53040626,0.50915887,0.48174266,0.43077900,0.38213570,0.34297004,0.29901360,0.26717176,0.23682556,0.20026216,0.16322589,0.20672762,0.25380554,0.29040309,0.32027544,0.36419555,0.41311454,0.43955053,0.46694387,0.47564596,0.48087198,0.49689580,0.50582779,0.49630723,0.49459227,0.49105041,0.48512515,0.45788060,0.43013684,0.39470247,0.36515221,0.37400047,0.38767559,0.39054489,0.39671511,0.41264681,0.43050959,0.45157341,0.46774001,0.49806625,0.53468641,0.55022175,0.56618334,0.59683814,0.63170563,0.66608266,0.69832630,0.73834302,0.78803260,0.82150994,0.86081176,0.84928170,0.84286179,0.83348823,0.82577450,0.83074328,0.83294461,0.83785644,0.84294645,0.80727126,0.77797686,0.74846909,0.73008073,0.76325946,0.80249381,0.84442444,0.87899693,0.78231815,0.69032425,0.59943486,0.50427781,0.43090773,0.35995397,0.27595702,0.18787245,0.23580428,0.28588367,0.34840453,0.40490356,0.40464958,0.40778637,0.40902046,0.41191499,0.41296476,0.42245070,0.42233930,0.42151261,0.42225308,0.41968911,0.41917371,0.41739295,0.37997878,0.34002696,0.28779847,0.24163996,0.19943727,0.16110601,0.11688812,0.07649120,0.12785153,0.17112513,0.21020814,0.24770072,0.23303163,0.21408951,0.19766162,0.16936993,0.22872806,0.29054348,0.34608702,0.40452455,0.42878859,0.45619219,0.49801847,0.53510484,0.57013135,0.60338021,0.62329296,0.64913300,0.70459897,0.75971291,0.81812572,0.87917531,0.83851559,0.80146768,0.76164531,0.72407155,0.70847241,0.69581891,0.67981029,0.66227606,0.61673730,0.56905536,0.52069068,0.47737978,0.43711832,0.40266556,0.36862421,0.33325279,0.37462825,0.41540950,0.47591091,0.53420040,0.55164066,0.56955727,0.58408157,0.58857775,0.54708294,0.50118737,0.45015583,0.40599882,0.34044215,0.28118399,0.20961172,0.14471915,0.17343633,0.19925184,0.21360636,0.23122441,0.24648026,0.25641493,0.27713177,0.29109229,0.34692459,0.39860823,0.45755464,0.51469984,0.59474145,0.66977277,0.75124190,0.83833903,0.81397608,0.79078428,0.77288878,0.74860773,0.76532124,0.78596001,0.79846951,0.79724428,0.79408026,0.78308473,0.77356824,0.75488113,0.77243562,0.79525722,0.79122165,0.78739555,0.76158586,0.74379389,0.72064613,0.69622010,0.66788326,0.64946699,0.61876498,0.58189452,0.60594714,0.62553742,0.63917398,0.65051167,0.65202279,0.65497542,0.67702844,0.69146632,0.63010314,0.56533192,0.50724160,0.45379637,0.41216953,0.36940267,0.32418750,0.27653569,0.33077809,0.39105466,0.44617556,0.49974706,0.53909720,0.58199211,0.62769691,0.66692804,0.65193134,0.64164808,0.62208841,0.60817382,0.59906585,0.58848666,0.57114782,0.55622098,0.56006162,0.56450800,0.55868380,0.55346523,0.51018461,0.47123679,0.44805064,0.42047095,0.45865059,0.49681677,0.52180854,0.54196328,0.57701209,0.61835953,0.63705774,0.66226680,0.66258596,0.67276469,0.66803674,0.66186471,0.67194791,0.67596553,0.69901472,0.72378127,0.69494646,0.67000150,0.63128298,0.59623500,0.56707810,0.53113742,0.50663368,0.48569182,0.44546045,0.39882586,0.36588496,0.33044081,0.29230782,0.25556758,0.22440929,0.18382764,0.23210597,0.28129203,0.33530856,0.38203971,0.41764655,0.45479519,0.46513515,0.48131498,0.47855807,0.47077930,0.46161059,0.45487312,0.45980819,0.45815962,0.44996898,0.43375364,0.42056365,0.40589373,0.37973579,0.34997637,0.37006520,0.38986321,0.40267097,0.41257228,0.44332645,0.47262206,0.49467827,0.51430579,0.55267843,0.59104259,0.60791700,0.63262157,0.63446122,0.63511003,0.64342611,0.64608868,0.68027114,0.71130300,0.71613644,0.72386370,0.74006406,0.75090262,0.75145988,0.75101499,0.76000218,0.76497052,0.76652778,0.77290685,0.74693078,0.72428527,0.71604475,0.69932029,0.74676449,0.78846151,0.82258195,0.85946468,0.77512063,0.69827027,0.59826472,0.50121119,0.44331493,0.38390526,0.29758283,0.21774914,0.25861876,0.30126216,0.36141373,0.41883858,0.42260797,0.42308851,0.44168355,0.45608018,0.44694179,0.43979738,0.43069275,0.42485061,0.42780144,0.43742475,0.43380447,0.42795702,0.38257804,0.33587067,0.28873097,0.24035171,0.21229283,0.18418782,0.16464115,0.13676766,0.17659987,0.22006907,0.25022196,0.28450051,0.29121984,0.29566845,0.28971415,0.29390372,0.31806107,0.35105287,0.37730152,0.41246371,0.43387912,0.44965858,0.49279279,0.53694810,0.56761834,0.60034741,0.62056395,0.63613721,0.69735357,0.75282517,0.80091701,0.84941443,0.82173165,0.79303160,0.75124524,0.70811113,0.69620821,0.68557574,0.66346239,0.64160146,0.59907763,0.55621602,0.52371168,0.49236640,0.46667306,0.43605161,0.41218623,0.39505857,0.41778987,0.44420863,0.50162084,0.55441164,0.56211744,0.56943297,0.56083280,0.55460634,0.51685939,0.47972653,0.45240587,0.42030974,0.37385397,0.32287661,0.28776346,0.24692744,0.25962771,0.27088411,0.25793713,0.25304013,0.25115995,0.25102526,0.26886789,0.28821189,0.34000897,0.39714814,0.45303814,0.50948722,0.57870936,0.64642906,0.71724778,0.79159742,0.77083276,0.74841918,0.73966210,0.72048356,0.75255105,0.78320826,0.78709977,0.81102209,0.79865579,0.78735690,0.77849520,0.77464617,0.78104581,0.78254669,0.77478775,0.76006393,0.72361735,0.69447554,0.65637972,0.62488639,0.59702046,0.57584765,0.54283107,0.51233374,0.53843971,0.57254843,0.59152473,0.61503176,0.62914195,0.64369232,0.66798220,0.69177240,0.63799035,0.57762956,0.52922545,0.48318931,0.44186369,0.40372180,0.36522095,0.32719647,0.36403931,0.40759145,0.44168905,0.47611161,0.51945520,0.55887570,0.59309929,0.63539925,0.63390811,0.63200294,0.62919062,0.62640178,0.60423129,0.58022969,0.55726017,0.53531946,0.53498174,0.53796512,0.53512761,0.53935607,0.50742839,0.47518672,0.45498639,0.42713545,0.47929929,0.52966448,0.57626679,0.61449717,0.63769998,0.65342688,0.67712708,0.70052864,0.69728193,0.68931420,0.67506348,0.66847951,0.66050041,0.65819936,0.64836425,0.64049634,0.63857240,0.63457012,0.63245903,0.62750073,0.58684752,0.55437543,0.52181200,0.49367189,0.46112231,0.42272097,0.39751114,0.37309529,0.32896876,0.28887256,0.24561286,0.20330674,0.26341613,0.31807158,0.38612031,0.46021495,0.46501406,0.47583960,0.48295890,0.48952273,0.48020892,0.47486474,0.44712220,0.42230553,0.42899122,0.42684884,0.41773163,0.41165490,0.39800741,0.37757714,0.34885616,0.32466173,0.35306031,0.38173417,0.40630145,0.43382680,0.46795225,0.50407647,0.54514773,0.58620184,0.61314060,0.63786467,0.66525048,0.69149038,0.66762765,0.65095961,0.62712814,0.60627757,0.61044101,0.61154973,0.60247748,0.59545104,0.62176161,0.64157178,0.66014302,0.67739130,0.68878147,0.69506031,0.71079691,0.72093391,0.70335225,0.69136086,0.68485588,0.67690621,0.71686675,0.75393018,0.79056989,0.82986731,0.75126146,0.67150366,0.59456120,0.51220758,0.45577466,0.39405028,0.32256562,0.25191834,0.29159545,0.33406224,0.38387081,0.42747395,0.44860756,0.46520204,0.48339897,0.50538887,0.48399504,0.45848799,0.43284332,0.41068491,0.42527217,0.43069916,0.43190581,0.44146675,0.38511970,0.33862386,0.28560808,0.22934283,0.22842679,0.22289629,0.21086623,0.20295178,0.23250103,0.26556610,0.29846351,0.33201369,0.34322065,0.35961211,0.37402335,0.39566230,0.39112908,0.39177297,0.40236126,0.40527840,0.42972716,0.46080892,0.48559674,0.51672370,0.54790803,0.57650751,0.60697586,0.63893384,0.68964961,0.73854734,0.78552190,0.83488340,0.80301876,0.77511110,0.73202435,0.68805469,0.66639086,0.64565383,0.62811918,0.60589728,0.58000396,0.55534000,0.53809171,0.52519305,0.49178222,0.46701850,0.44523033,0.43153247,0.45319106,0.48305250,0.52559035,0.57315156,0.56500073,0.56000231,0.54784520,0.53692505,0.51178798,0.49349355,0.46330405,0.43256061,0.41680914,0.39828208,0.38039815,0.36089992,0.34037524,0.31485918,0.28965330,0.26534018,0.25977158,0.26277625,0.27605593,0.28255528,0.34355463,0.40432571,0.46115439,0.52184354,0.57777754,0.63717829,0.68990180,0.74560051,0.74011658,0.72623721,0.71946211,0.71342674,0.73531800,0.75887611,0.78266284,0.81914788,0.80276570,0.79031649,0.79052636,0.78760599,0.78030164,0.77711370,0.75408597,0.73189817,0.68451897,0.63833701,0.59818283,0.55454388,0.53102815,0.49897579,0.46444927,0.43265130,0.47654700,0.52588472,0.55080728,0.58035846,0.60553224,0.62751700,0.66011546,0.69365511,0.64082389,0.59155841,0.55183190,0.51103782,0.47554608,0.43636175,0.40425689,0.37163899,0.40008079,0.43162376,0.44266924,0.44804014,0.49575142,0.53622491,0.56350161,0.59554120,0.60491070,0.61845401,0.62958746,0.64060232,0.60687454,0.57542650,0.54653394,0.51077304,0.51347291,0.50950333,0.51680496,0.52164644,0.49995396,0.47822453,0.45676970,0.43466292,0.50373018,0.56558164,0.62624507,0.69348381,0.69428437,0.69159976,0.72046935,0.74829623,0.72768882,0.70212018,0.68928367,0.67045856,0.65687008,0.64005698,0.60089939,0.55583335,0.57844582,0.60208918,0.62959031,0.65496865,0.60947220,0.57324481,0.53831804,0.50354469,0.47307611,0.44341323,0.43297858,0.41510858,0.36820864,0.31673158,0.27126061,0.21808589,0.28854749,0.35468630,0.44276682,0.53433729,0.51525553,0.50250393,0.50425991,0.49923963,0.48915565,0.47542906,0.42887366,0.38618186,0.39245451,0.40188396,0.39363240,0.38765753,0.37088356,0.35536006,0.32493034,0.29052408,0.33738533,0.37689428,0.41330501,0.44951669,0.49199951,0.52881774,0.58945832,0.65273196,0.66994609,0.68823145,0.72117990,0.75530722,0.70805391,0.66030788,0.61483090,0.56235270,0.53772393,0.51035343,0.49005715,0.46372653,0.50043004,0.53363181,0.57276218,0.61144932,0.61939731,0.62808755,0.64908121,0.66852289,0.66104975,0.65227254,0.65204560,0.64842858,0.68683751,0.72061207,0.76486700,0.80481059,0.73110251,0.65026030,0.59072406,0.52586225,0.47008057,0.41367612,0.34609055,0.28400578,0.32534020,0.36776817,0.40047803,0.43555143,0.47280865,0.50878309,0.52902340,0.55524791,0.51703297,0.46949647,0.43501887,0.40058244,0.41603781,0.42932879,0.43903823,0.45315464,0.39420017,0.34105787,0.27912772,0.21703216,0.23576511,0.26008988,0.25934586,0.26672846,0.28812932,0.31390077,0.34481699,0.37988388,0.40331766,0.42425564,0.46364205,0.49984581,0.46635914,0.43404191,0.41636040,0.39812141,0.43418988,0.46536196,0.48211826,0.49446889,0.52563919,0.55543660,0.59877476,0.63791843,0.67826594,0.72271399,0.77315783,0.82590699,0.79100362,0.75706764,0.71113360,0.66915551,0.63990956,0.60747361,0.59681435,0.57979749,0.56328553,0.55256393,0.55417022,0.55238175,0.51857606,0.48793981,0.47583293,0.46526224,0.48868220,0.51184554,0.55719991,0.59925645,0.57124630,0.54895499,0.53348241,0.51839306,0.50764425,0.50175293,0.47129296,0.44486952,0.46025162,0.47856188,0.47974371,0.48040818,0.41969764,0.35794207,0.31566210,0.27156039,0.27004775,0.27162308,0.27564158,0.28101234,0.34442594,0.41289594,0.47311617,0.53297599,0.57988496,0.62976247,0.66927385,0.70642029,0.70805842,0.70524622,0.70169156,0.69768371,0.72263104,0.73798853,0.78203619,0.80661873,0.79906524,0.79674171,0.78598681,0.77920811,0.78082566,0.77740635,0.76847135,0.75860573,0.70977078,0.66040512,0.60332748,0.55205402,0.50673775,0.45387643,0.40734391,0.36382024,0.41481422,0.47328864,0.51479750,0.55931355,0.59046881,0.62258088,0.65867643,0.69755632,0.65954935,0.62144595,0.57780533,0.53989096,0.51620982,0.48994829,0.46817205,0.44921268,0.45855629,0.46835732,0.47035908,0.47320637,0.50794787,0.54092656,0.57061193,0.59160193,0.59825318,0.60635871,0.61871246,0.63891449,0.60805562,0.58367665,0.56529259,0.54042947,0.54002551,0.53754491,0.54073600,0.55004073,0.53551893,0.52100614,0.50522265,0.48397653,0.54926135,0.60779375,0.65864429,0.71244735,0.73170411,0.74794527,0.77201831,0.79726377,0.77359356,0.74091920,0.71681629,0.69057208,0.65135652,0.61700057,0.57464036,0.53413241,0.55110485,0.56885218,0.58929404,0.60589753,0.57460992,0.54502592,0.52650704,0.50001694,0.47884487,0.46312815,0.45238583,0.44655469,0.39205854,0.34071617,0.29477126,0.25417354,0.31461860,0.37260682,0.44586715,0.52602145,0.53530798,0.54746494,0.55787848,0.57570941,0.53653427,0.49529395,0.44749765,0.40179598,0.38370371,0.36038257,0.32776318,0.29997524,0.30832427,0.32310061,0.31781957,0.31807557,0.36019221,0.40031501,0.43293079,0.46236102,0.50379855,0.54573370,0.59801353,0.64749430,0.68248643,0.70833593,0.75209251,0.79202273,0.73575038,0.67663412,0.62339208,0.57337008,0.52681913,0.48099954,0.44141438,0.39610533,0.43036015,0.47017831,0.50180296,0.53351791,0.54421397,0.55440280,0.56188442,0.57304251,0.58658158,0.59252711,0.61052055,0.63028934,0.67650842,0.71712327,0.75354874,0.78515826,0.72123413,0.64807808,0.58724232,0.52174444,0.46328245,0.39967059,0.34833480,0.29291082,0.33280195,0.37291978,0.40466426,0.44167385,0.49600552,0.54333617,0.57871221,0.61114463,0.56173641,0.52005215,0.47203043,0.42583413,0.42428521,0.42527894,0.41401529,0.39866206,0.37003444,0.33210619,0.29765503,0.26539696,0.27228464,0.28058874,0.28360367,0.28570180,0.31705273,0.34462960,0.39369024,0.43857325,0.46375716,0.49157528,0.52728662,0.56478349,0.54022316,0.51837171,0.49468657,0.47604033,0.49161068,0.50251613,0.51215440,0.51427825,0.54826746,0.58062564,0.61296141,0.64748739,0.68576398,0.71786360,0.75907303,0.79838681,0.75567646,0.71245154,0.66305902,0.61635113,0.59832796,0.58206588,0.55509066,0.53027791,0.53154186,0.53075111,0.53029679,0.52812908,0.52098789,0.51209521,0.51454332,0.50693327,0.53091277,0.54932241,0.57715213,0.61230119,0.58336063,0.55824509,0.54081027,0.51890068,0.51601233,0.51679056,0.49769116,0.47971005,0.49810956,0.50942368,0.53070212,0.55037604,0.49308532,0.43009907,0.37453784,0.32015769,0.29233665,0.26978817,0.24534208,0.21435512,0.28391624,0.34775829,0.41660056,0.48110441,0.53554383,0.59535776,0.63655525,0.67908188,0.68806629,0.70034609,0.70251843,0.70530986,0.73329245,0.75965835,0.78243069,0.79984592,0.80234112,0.79586365,0.78414739,0.77044497,0.77482792,0.77641226,0.78303071,0.78192411,0.73068797,0.68094963,0.61613309,0.54574027,0.48415063,0.41304696,0.35550952,0.29433066,0.35495129,0.42368226,0.47800487,0.53247598,0.57064708,0.60860475,0.65494571,0.69668550,0.67399381,0.64826601,0.60467361,0.56587985,0.55653206,0.54225771,0.53401651,0.52436186,0.51443444,0.51278323,0.50454198,0.49572690,0.52339142,0.54944102,0.56707977,0.59446395,0.59493391,0.59226563,0.61239812,0.63302664,0.61357786,0.59474225,0.58351598,0.56592537,0.56489881,0.55895508,0.57176078,0.58116035,0.56669853,0.55822987,0.54368325,0.53573497,0.59304469,0.65304131,0.69405094,0.73343474,0.77131738,0.80195203,0.82771561,0.85212212,0.81680545,0.78226065,0.74671320,0.71180156,0.65404645,0.59076793,0.54922055,0.50138718,0.51534785,0.52775325,0.54504581,0.55862437,0.54243039,0.52115897,0.51024758,0.49600676,0.48745308,0.48022910,0.47997631,0.47740758,0.41474527,0.35553568,0.32222008,0.29136191,0.33526091,0.38370912,0.45241356,0.51794969,0.54914614,0.58742039,0.61339080,0.64530145,0.58708608,0.52311615,0.46951993,0.41771679,0.37303441,0.32862947,0.27141885,0.21295834,0.25403395,0.29242356,0.31110559,0.33343516,0.38024949,0.42322205,0.44444867,0.46770914,0.51639894,0.55592357,0.60346459,0.64737278,0.69003441,0.73336498,0.78048258,0.82614394,0.76356442,0.69429213,0.63983790,0.57860437,0.51574702,0.44942099,0.38848899,0.32567884,0.36170984,0.40134715,0.43168874,0.46118654,0.46863896,0.48004272,0.48191604,0.48360879,0.51120181,0.53472505,0.57523174,0.61215255,0.66661257,0.72072488,0.74235969,0.76689634,0.71153741,0.65027652,0.58137243,0.51561592,0.45044324,0.38749925,0.34773391,0.30910868,0.34363202,0.37327940,0.41221766,0.45387345,0.51533349,0.58145267,0.61937734,0.66158159,0.61513447,0.56355781,0.50755963,0.45276820,0.43544618,0.42077061,0.38763484,0.35279918,0.33935956,0.32756518,0.31841792,0.31313980,0.30568001,0.30075729,0.30309649,0.30954351,0.34395032,0.37600134,0.43378394,0.49478887,0.52281749,0.55867950,0.59400058,0.62842907,0.61423429,0.60181315,0.57553635,0.54374811,0.54288904,0.54193645,0.53835535,0.53536174,0.57208811,0.60400733,0.63422100,0.66416646,0.68394862,0.70521170,0.74391708,0.77944832,0.72515602,0.66698641,0.62163006,0.56850208,0.56423352,0.55704887,0.51926255,0.47983094,0.49231705,0.50087876,0.50367170,0.50515326,0.52308050,0.53468971,0.54444655,0.55085340,0.56414021,0.57513909,0.60369781,0.63128386,0.60095152,0.57008753,0.54469943,0.52415250,0.52669358,0.53326496,0.52140170,0.50805136,0.52907849,0.54629243,0.58308155,0.62483811,0.56302360,0.50146729,0.42839395,0.35889855,0.31134027,0.26663637,0.20641169,0.15118777,0.22267013,0.28559171,0.35831174,0.43089460,0.49488632,0.56242458,0.60254903,0.64328656,0.66887964,0.69954218,0.70086875,0.70502098,0.74507596,0.77847887,0.78809811,0.81607045,0.80594242,0.79721220,0.78306887,0.77649025,0.78094806,0.79140123,0.80638021,0.82109867,0.75736579,0.68904823,0.62300407,0.55542206,0.46549570,0.37213837,0.28606394,0.20496168,0.28053607,0.35810915,0.43824789,0.51702136,0.55715874,0.59874112,0.65934383,0.71212417,0.68659980,0.66456292,0.62841946,0.59604565,0.59445850,0.59352910,0.59292468,0.59488423,0.57259280,0.55560589,0.52550563,0.49888562,0.52024317,0.53905999,0.55816416,0.57983733,0.58838772,0.59967227,0.62224495,0.63911581,0.62409185,0.61742233,0.59922281,0.58617533,0.58683522,0.58989845,0.59575455,0.60238400,0.60239692,0.59675241,0.58985841,0.57757487,0.62880861,0.67840665,0.72419484,0.77442195,0.80816559,0.84658132,0.88014416,0.91905277,0.86987956,0.81945940,0.77045054,0.71700925,0.65568573,0.59066370,0.53270955,0.48601232,0.49253656,0.49718454,0.51211144,0.52411343,0.51813110,0.51630593,0.51044242,0.50473316,0.49656750,0.49344746,0.49712391,0.50169008,0.44663675,0.38566919,0.34701827,0.30602911,0.35564758,0.40722298,0.46320043,0.51754519,0.56610874,0.61524873,0.66163091,0.71068517,0.63171953,0.55623588,0.49069678,0.42522628,0.35641950,0.28739443,0.20321813,0.11944066,0.18772426,0.25558897,0.31311377,0.37064473,0.40217748,0.43846535,0.46807705,0.49415970,0.53448182,0.58179199,0.62376109,0.66355993,0.71414375,0.77064328,0.82216563,0.88092669,0.80210590,0.72975759,0.66073307,0.59131754,0.50906455,0.41916356,0.33172905,0.24299203,0.28301795,0.32777915,0.37197458,0.41217785,0.40797515,0.40689512,0.39106198,0.38247919,0.43181676,0.48109278,0.54893545,0.60671954,0.65305602,0.69079341,0.73370921,0.77404784,0.70293378,0.63866246,0.56911412,0.49855868,0.44842392,0.39287866,0.35072723,0.30898620,0.34349205,0.37709307,0.41733597,0.45336904,0.53393439,0.60718302,0.67479517,0.73499318,0.67589743,0.61400847,0.54844935,0.48762769,0.44890651,0.40505734,0.35108239,0.29879867,0.31317138,0.32894720,0.33565268,0.34403135,0.33319103,0.32589468,0.32606914,0.31901803,0.37271347,0.42467057,0.48550104,0.54941778,0.58017981,0.61555405,0.65913857,0.70580199,0.68919391,0.67153235,0.65321245,0.62752082,0.61406995,0.59155874,0.57280182,0.55115076,0.58032630,0.60972233,0.64238499,0.67326864,0.68926588,0.70514302,0.73045609,0.74928396,0.69125369,0.63517965,0.57968870,0.52767694,0.51499798,0.50472813,0.47541076,0.44779897,0.46332935,0.47955920,0.48637543,0.50030387,0.52937376,0.55856866,0.58320922,0.61282022,0.61370965,0.62062536,0.63202951,0.64616697,0.61307764,0.57443962,0.54694883,0.51833020,0.52468640,0.53232645,0.53080808,0.53451854,0.57365572,0.61193121,0.65410578,0.69401401,0.62014967,0.55105801,0.48184469,0.41538008,0.34526373,0.26488456,0.17974908,0.09497500,0.17121205,0.25344744,0.32768349,0.40648862,0.46573995,0.52749123,0.58053001,0.63395248,0.66065960,0.68989390,0.70916740,0.72755053,0.75358757,0.78255773,0.80128923,0.83366907,0.81446778,0.79859742,0.78523842,0.77588333,0.78908237,0.80264411,0.83148315,0.85653048,0.77587296,0.70261017,0.63548955,0.56795242,0.44571946,0.32195369,0.21646417,0.11001386,0.20705946,0.29382098,0.39659792,0.50494534,0.54755595,0.58769645,0.65756228,0.72799753,0.70678411,0.68418957,0.64890135,0.61933733,0.63367246,0.64118488,0.64977003,0.66330659,0.63533432,0.60648708,0.55534079,0.50004044,0.52154163,0.53312714,0.54816462,0.56796573,0.58410804,0.60542110,0.62829921,0.64991425,0.64299678,0.63582308,0.61979045,0.60697054,0.61364508,0.62243270,0.62396313,0.63202928,0.63037195,0.63573295,0.62740032,0.62442793,0.66156804,0.69872894,0.76033789,0.82168939,0.85362764,0.88907916,0.93330623,0.98457932,0.92167470,0.85932866,0.79050001,0.72869348,0.65690069,0.57931278,0.52536803,0.46380719,0.46235840,0.46139448,0.48104077,0.49371871,0.49830970,0.50863850,0.50809696,0.50638634,0.50766595,0.50596424,0.51503180,0.53051124,0.47099642,0.41506264,0.37124119,0.32368954,0.37759930,0.42826471,0.47336547,0.52182678,0.58113074,0.63826923,0.70817911,0.77450756,0.68445720,0.59335652,0.51215753,0.43112709,0.33927965,0.24723658,0.13493303,0.02158181,0.11963946,0.21689720,0.31616796,0.41229622,0.42791480,0.45174398,0.48307219,0.51742421,0.56247117,0.60580989,0.63874118,0.67688790,0.73606046,0.80076589,0.86514723,0.93241775,0.84566473,0.76209362,0.68474153,0.61054520,0.49880566,0.38856390,0.27256219,0.15599746,0.21039171,0.25814443,0.30795373,0.36141286,0.34482030,0.33383474,0.30305445,0.27797253,0.35177911,0.42863082,0.51485279,0.60649797,0.63975098,0.66803400,0.71906499,0.77611553,0.69557205,0.62151932,0.55509228,0.48584130,0.44145612,0.40032600,0.35965498,0.31143236,0.34372034,0.37835733,0.41957346,0.45097893,0.54734615,0.63778860,0.72315042,0.81071494,0.73723621,0.66142741,0.59476933,0.52192331,0.45365869,0.38939319,0.31610963,0.24410391,0.28630785,0.33156664,0.35739862,0.38237253,0.36663196,0.34687514,0.34380869,0.33325576,0.40303350,0.46552941,0.53880849,0.61087711,0.64035550,0.66887915,0.72703263,0.78386703,0.76440232,0.74596542,0.72954219,0.71633615,0.67835021,0.64860607,0.60967411,0.56934870,0.58867889,0.61232656,0.64708236,0.68607398,0.69573441,0.71057156,0.71542257,0.72882310,0.66281023,0.59700647,0.54260034,0.48018716,0.46608653,0.45186028,0.43475276,0.41739015,0.43255383,0.45148437,0.47644512,0.49299762,0.53483118,0.57557706,0.62944765,0.67665141,0.66824516,0.65854142,0.66713664,0.67222713,0.62505508,0.57450417,0.54273223,0.50899628,0.52257204,0.52783102,0.54624243,0.56211707,0.61709262,0.67015132,0.71725591,0.77185372,0.68165144,0.59597763,0.53402873,0.47339733,0.37011619,0.27201809,0.15322124,0.03048326,0.12740813,0.22355591,0.29954930,0.37775824,0.43873584,0.49661557,0.55925018,0.61898431,0.65088372,0.67941466,0.71205225,0.75291624,0.77329528,0.79243915,0.81059031,0.77530232,0.75841615,0.74245307,0.73704478,0.72711322,0.73739225,0.75694177,0.78072598,0.81370250,0.73666096,0.66107339,0.59148992,0.53074339,0.43175784,0.32938279,0.23290050,0.14048954,0.22027312,0.30136596,0.37742328,0.45808999,0.51325390,0.57144161,0.63269177,0.69821105,0.66603673,0.63503944,0.61570842,0.59092298,0.59894492,0.60520750,0.62511466,0.63933104,0.61552318,0.58679379,0.55222413,0.51262470,0.51788113,0.52831836,0.53808180,0.55167447,0.55016612,0.55714511,0.56687286,0.57090567,0.57342035,0.57531631,0.57534807,0.57652651,0.58741317,0.59272057,0.60022434,0.60917963,0.60616966,0.60537862,0.60918700,0.61169324,0.65146500,0.68499033,0.72860018,0.77453673,0.80476587,0.83414305,0.86666371,0.89504935,0.84380528,0.78926193,0.73056957,0.67111757,0.61126120,0.54518628,0.49170404,0.42677944,0.43304929,0.43603882,0.44645019,0.45705822,0.46548651,0.47037201,0.47177802,0.47623648,0.48181704,0.48266945,0.48566117,0.49126162,0.45263513,0.41568517,0.38880406,0.35667790,0.39898811,0.44107306,0.48589433,0.52907402,0.56880688,0.61405492,0.65934442,0.70566908,0.63521924,0.55922732,0.49138562,0.42728115,0.34243008,0.26262762,0.18070946,0.09383383,0.16984013,0.23970355,0.30746326,0.38067927,0.40794394,0.44247027,0.47756431,0.51132463,0.55153999,0.59236560,0.61821561,0.65083708,0.72023155,0.78415946,0.84955091,0.91801294,0.83985854,0.76406618,0.69023518,0.62108431,0.51660486,0.41208046,0.31832156,0.21931543,0.26410301,0.30555893,0.34530972,0.38649572,0.37357308,0.36991634,0.34901659,0.33637034,0.39507179,0.44881435,0.51799659,0.58493828,0.61455062,0.65229823,0.68726989,0.72919402,0.66171408,0.59300843,0.53876788,0.47774546,0.43341933,0.39176637,0.34384959,0.29040036,0.33445178,0.38385299,0.41716741,0.45199270,0.52698874,0.60341665,0.68237191,0.75731092,0.68496659,0.62043181,0.55162429,0.48309082,0.42542168,0.37307705,0.31238744,0.24861825,0.27533377,0.30162517,0.31739326,0.34198490,0.33571018,0.33134001,0.32702976,0.32658844,0.38302451,0.43603488,0.50166578,0.56389048,0.61784450,0.66900985,0.72972120,0.78829276,0.76584797,0.73688814,0.71219048,0.68994055,0.64800174,0.60539303,0.56852387,0.53104851,0.55844790,0.58494322,0.62329253,0.66248705,0.67200131,0.67949783,0.68215435,0.68627477,0.64239181,0.60266460,0.55535112,0.51147668,0.48650490,0.46084953,0.44278411,0.41419393,0.44425026,0.47304129,0.49391756,0.51772557,0.55185111,0.58811872,0.61812328,0.65323720,0.65732985,0.66810638,0.66994950,0.67599766,0.63577022,0.59887731,0.56343550,0.52514978,0.53260332,0.53801626,0.54229729,0.55471805,0.58685395,0.61734021,0.64926781,0.68638171,0.62538063,0.56657983,0.50992160,0.44761002,0.36307556,0.27252254,0.17536776,0.07470007,0.14912627,0.22744199,0.28997232,0.35746668,0.41163320,0.46810115,0.52288944,0.57302385,0.60570881,0.64046728,0.66859744,0.69706065,0.72032648,0.73919705,0.75655150,0.71380457,0.70119874,0.69117523,0.68615847,0.67853325,0.69345411,0.70197098,0.73663806,0.77609189,0.69834527,0.61914189,0.55877155,0.49366978,0.41455020,0.33832936,0.25308355,0.16718881,0.23528260,0.30543475,0.36188228,0.41844328,0.48291345,0.54821432,0.60661661,0.66919681,0.62785157,0.58484001,0.57268811,0.56383689,0.56900925,0.56950343,0.59523356,0.62364018,0.59548604,0.57148793,0.54792055,0.52989247,0.51987699,0.51857408,0.52777240,0.53311327,0.51727125,0.50544615,0.50131716,0.49862935,0.51182496,0.52092451,0.53067459,0.54636215,0.55528763,0.56915155,0.57884093,0.58928398,0.58198693,0.57869692,0.59584353,0.60806412,0.64085593,0.67372082,0.70115880,0.72650964,0.75815697,0.78844804,0.79616114,0.81011972,0.76652880,0.72434498,0.66613017,0.61143066,0.56321170,0.51388603,0.45601939,0.39360470,0.39620218,0.40042093,0.41207490,0.41972186,0.42673025,0.43640689,0.44224915,0.45515426,0.45486565,0.45568314,0.45466780,0.45737655,0.43836852,0.42172038,0.40787939,0.39468279,0.42412470,0.45246355,0.49673953,0.53340057,0.55906852,0.58704922,0.61514931,0.64138689,0.58207189,0.52609865,0.47435798,0.42325835,0.35330145,0.27900094,0.22592909,0.16774184,0.21134202,0.25848623,0.30896462,0.35553872,0.39242945,0.42756221,0.46226258,0.50332020,0.53827087,0.57865835,0.60100216,0.62652062,0.69869736,0.76439377,0.83718830,0.90450180,0.83378860,0.76045367,0.69761606,0.63588863,0.53639327,0.43532548,0.35934234,0.28104760,0.31119504,0.35085816,0.38105880,0.40805662,0.40910614,0.40268310,0.40160770,0.39744713,0.42597993,0.46070524,0.51440362,0.56605123,0.59821419,0.62980465,0.65694291,0.68582723,0.62446058,0.56785834,0.51455049,0.46127627,0.42404457,0.38000026,0.32688190,0.26582663,0.32879228,0.38616022,0.41755467,0.44584765,0.50977577,0.56881015,0.63775760,0.70010177,0.63741746,0.57295570,0.50477285,0.43919419,0.40175971,0.35921637,0.30252970,0.25257329,0.25899980,0.26944423,0.28792828,0.30232794,0.30509772,0.31199714,0.32079247,0.32800791,0.36517129,0.40702143,0.46370959,0.52159873,0.59449738,0.66854861,0.73386532,0.79823276,0.76371056,0.72731490,0.69322425,0.65997140,0.61449638,0.55912799,0.52735613,0.49327399,0.52848561,0.56034462,0.59798632,0.63516902,0.63843992,0.64656036,0.65092006,0.64799873,0.62708300,0.60452041,0.57020198,0.53520067,0.50814953,0.47478124,0.44645846,0.41477211,0.45254177,0.49041359,0.51648629,0.54025836,0.56518006,0.59263105,0.60700938,0.62315627,0.65294759,0.68242362,0.68222052,0.67834311,0.65122390,0.62515920,0.58570582,0.54407675,0.54737418,0.54448149,0.54097364,0.54337198,0.55277883,0.56053342,0.58038127,0.59454337,0.57016246,0.54131360,0.48038338,0.42519477,0.34933560,0.27257265,0.19330202,0.11694377,0.17163645,0.22890286,0.28628368,0.33890195,0.38932021,0.43730800,0.48400437,0.52746141,0.57034507,0.60928383,0.62608564,0.64104979,0.66323323,0.68565035,0.70388113,0.68125783,0.66300956,0.64576558,0.63019507,0.61235093,0.63230110,0.65845673,0.69610944,0.73191000,0.65434866,0.58000851,0.51948999,0.45199417,0.38904155,0.32464558,0.25445051,0.18544057,0.24068141,0.28963350,0.33860590,0.38793539,0.44768302,0.51766461,0.57201440,0.62977863,0.59515162,0.56801703,0.53727863,0.50845814,0.52890376,0.55196818,0.57662980,0.60537816,0.58121197,0.55485950,0.53860293,0.52160188,0.51877604,0.51199758,0.51009132,0.51316321,0.49028488,0.46124726,0.44294793,0.42267125,0.44482960,0.46333119,0.47889307,0.50177124,0.51799102,0.53609024,0.54955851,0.56030015,0.56695462,0.56637970,0.57678867,0.58591194,0.61548496,0.64709009,0.67386951,0.70660259,0.71694525,0.72898218,0.72489909,0.72155712,0.68638165,0.65337303,0.61463772,0.57961820,0.52896919,0.47801570,0.42839511,0.37954225,0.36863811,0.36548854,0.36668633,0.36994483,0.38034987,0.38979209,0.39802441,0.41529414,0.41220356,0.41489024,0.41538324,0.41764128,0.41569637,0.41194778,0.40377332,0.40069022,0.43755791,0.47827435,0.51254732,0.55325106,0.55601790,0.56217883,0.57143416,0.57860339,0.53858027,0.49819559,0.45788921,0.41578833,0.36826520,0.32064364,0.27929916,0.24560452,0.26986940,0.29376275,0.31360352,0.33516354,0.37403124,0.40987696,0.44728481,0.48037165,0.51735543,0.54978723,0.57999320,0.60401050,0.68208035,0.75881982,0.83764745,0.91170776,0.84559203,0.77636639,0.72091662,0.66578523,0.56783451,0.47634749,0.39239413,0.31199819,0.35386022,0.38966439,0.42907406,0.46391759,0.45501995,0.45165965,0.44413957,0.43940688,0.46150728,0.48589975,0.52521244,0.56295593,0.57756860,0.59838271,0.61716101,0.63248450,0.58780959,0.54779967,0.50655541,0.46632460,0.41963538,0.37000420,0.31256656,0.25470003,0.30937474,0.36778514,0.40846885,0.44945320,0.49287552,0.54490653,0.59882107,0.66315472,0.59800788,0.53847708,0.47097967,0.40543852,0.36711774,0.32338651,0.28428402,0.23695205,0.25030127,0.25833102,0.25859836,0.26422908,0.27375153,0.28350922,0.29207720,0.30577247,0.34716211,0.38396622,0.43719345,0.48745529,0.57204976,0.66089340,0.74793830,0.83422886,0.77995298,0.73347630,0.69049892,0.64611999,0.59367193,0.53391504,0.48641494,0.43231613,0.48084627,0.53223760,0.57796353,0.62408433,0.63184840,0.63620878,0.62800459,0.61999043,0.61610203,0.60351866,0.59171842,0.57253645,0.52615508,0.48142985,0.44832076,0.40921871,0.44649626,0.48869794,0.53758600,0.58016360,0.59016563,0.59545689,0.60145995,0.61105045,0.64678433,0.67794667,0.69577939,0.70927092,0.67451260,0.63961233,0.60322002,0.56571714,0.55414564,0.54322240,0.52650080,0.51375518,0.51388535,0.51420892,0.52067714,0.53046038,0.50852417,0.48422689,0.45398449,0.42520797,0.35520331,0.28052028,0.20807294,0.13380078,0.18767648,0.24083801,0.28531792,0.33144943,0.37288986,0.41340992,0.45626500,0.49532406,0.52344642,0.55348796,0.57779566,0.59939435,0.62156409,0.64157670,0.66005156,0.64828440,0.62579634,0.60472653,0.57613359,0.54317980,0.57614210,0.60948601,0.64513426,0.68505735,0.61526315,0.54447039,0.47537173,0.40947114,0.36042707,0.30769377,0.25516543,0.20166523,0.23871758,0.27960524,0.31954681,0.35343660,0.41530875,0.48504093,0.53693412,0.59493638,0.56596633,0.54638607,0.50221501,0.45809163,0.49274525,0.52990124,0.55832707,0.59388647,0.56093635,0.53117500,0.52428344,0.51284410,0.51020778,0.50760981,0.49586384,0.49065426,0.45439237,0.42114874,0.38584840,0.34968506,0.38008328,0.40281539,0.42905085,0.46154273,0.48082092,0.51066228,0.52286268,0.54005081,0.54613505,0.55050609,0.56014616,0.56304749,0.59263571,0.61525714,0.65239712,0.69046065,0.67974039,0.66808193,0.64553698,0.62902177,0.60647166,0.58851902,0.56587662,0.54367790,0.48845868,0.43993767,0.39779199,0.35826072,0.34265848,0.32812016,0.32448760,0.32172063,0.32893089,0.34055575,0.35826186,0.37680854,0.37657862,0.38177337,0.37976470,0.38207821,0.39206288,0.39662005,0.40334016,0.40696142,0.45468886,0.50045863,0.53295294,0.57414732,0.55597073,0.53374137,0.52559533,0.51541540,0.49299839,0.47436962,0.43804280,0.40758777,0.38082733,0.35194362,0.33555133,0.31800645,0.32420654,0.33253619,0.31959438,0.31348445,0.35875403,0.39868911,0.42959945,0.46381615,0.49246296,0.52671287,0.55580908,0.57775961,0.67058729,0.75713907,0.83562509,0.92185520,0.85060116,0.78641106,0.73724578,0.69266832,0.59648054,0.50614726,0.42988760,0.34749580,0.39142706,0.42871593,0.47830089,0.52482908,0.50968515,0.49526420,0.48779847,0.47992286,0.49762029,0.51451736,0.53769557,0.56115421,0.56411165,0.56371936,0.57145343,0.57993735,0.55111908,0.52050590,0.49978704,0.47471250,0.41724103,0.35765758,0.30024235,0.24229417,0.29386035,0.35017744,0.39716410,0.45057238,0.48315929,0.51011414,0.57047351,0.62328928,0.56243778,0.50801057,0.43738152,0.37061157,0.33426785,0.28897247,0.25961124,0.22369150,0.23262941,0.24410845,0.23025202,0.22231597,0.23865703,0.25380118,0.26858690,0.28885857,0.32148873,0.35694819,0.40333641,0.44412169,0.55423976,0.65636792,0.76136402,0.86618001,0.79620042,0.72913619,0.68308618,0.63649970,0.57042833,0.50775650,0.44380691,0.37435608,0.44029677,0.49839240,0.55731326,0.61463475,0.62011581,0.62408692,0.60566149,0.59236564,0.60298781,0.60621274,0.60598245,0.61116952,0.55045119,0.49168283,0.44677369,0.40070617,0.44169495,0.48493216,0.55149410,0.62309580,0.60931603,0.59151549,0.59223270,0.59143043,0.63670444,0.67677464,0.70693510,0.74509659,0.70164479,0.65955574,0.62357369,0.58902393,0.56614482,0.53659253,0.51647412,0.48790117,0.47790122,0.46296613,0.46508204,0.45995393,0.44418741,0.43419290,0.42681316,0.42625633,0.35655744,0.28964835,0.22016498,0.14986507,0.19942239,0.24740476,0.28342158,0.31640201,0.34892302,0.38489492,0.42682895,0.46316506,0.48242863,0.49287784,0.52441743,0.55718236,0.57745547,0.59876526,0.62476305,0.57851802,0.56316915,0.54677581,0.52802509,0.50648484,0.54322165,0.58371200,0.61271450,0.64535280,0.58380872,0.52776152,0.46919028,0.40345673,0.34907765,0.29631819,0.24496724,0.18937518,0.23096672,0.27203097,0.32215387,0.36685996,0.41210899,0.45168930,0.49451645,0.54137097,0.52639094,0.50712462,0.47590549,0.44679557,0.47528838,0.50201029,0.52056021,0.53933617,0.51642783,0.50013872,0.50100039,0.49966159,0.49151205,0.48247940,0.46885918,0.45789613,0.43045292,0.40111514,0.38144319,0.35860358,0.36824334,0.36984514,0.37959024,0.38627633,0.41726560,0.44530399,0.47170922,0.49066162,0.51302170,0.53221968,0.55131056,0.57370168,0.58643319,0.59872915,0.61933186,0.63312075,0.62613102,0.61919689,0.60392674,0.58189866,0.55958904,0.53578529,0.51269693,0.49351662,0.43693136,0.38315233,0.33116828,0.28103633,0.28328364,0.27884499,0.28956596,0.29436399,0.29264850,0.28614197,0.29048790,0.29574234,0.31508211,0.33225108,0.35234601,0.37691250,0.39876698,0.42256971,0.44624257,0.47216175,0.49742965,0.51786613,0.54672776,0.56998522,0.54622205,0.51779403,0.50072271,0.49177478,0.47011791,0.45514986,0.43245000,0.40439933,0.39132005,0.37383650,0.35935008,0.34617540,0.34581891,0.34765041,0.33307811,0.32716636,0.35624214,0.38247019,0.41599896,0.44420434,0.48224430,0.52297666,0.54953579,0.57878203,0.66201690,0.75299755,0.83467804,0.91718945,0.85343082,0.79590777,0.74013723,0.68472492,0.61566368,0.54594456,0.48650991,0.41825534,0.44980882,0.47832019,0.51097103,0.54807643,0.54163171,0.53464746,0.52493226,0.51187015,0.51899980,0.52600793,0.53850552,0.55069305,0.55033363,0.54779733,0.54780681,0.54718921,0.51685649,0.48212139,0.44964680,0.41598537,0.35966034,0.30441383,0.24845948,0.20111887,0.25515388,0.30951297,0.35854797,0.40664694,0.43769684,0.46892877,0.50796336,0.55294761,0.51256905,0.46860837,0.41629426,0.36177929,0.32433657,0.28927356,0.25663542,0.22162084,0.22232797,0.23181883,0.21782068,0.20848693,0.20845139,0.20868048,0.21095090,0.22167618,0.27387491,0.31988817,0.37930846,0.43769059,0.54751385,0.65503853,0.76135855,0.87133243,0.80614962,0.74279056,0.68316540,0.63118958,0.56649945,0.51010936,0.43845184,0.37275399,0.42541749,0.47937071,0.53801741,0.60565899,0.60930126,0.61550036,0.61459574,0.62086999,0.61149894,0.60329163,0.60266490,0.60109544,0.53549797,0.47476703,0.42742786,0.37988907,0.43140975,0.48224874,0.54820415,0.60680376,0.60859070,0.60820326,0.62316123,0.64205350,0.66357155,0.68001833,0.70436003,0.73182079,0.70568017,0.67682594,0.66670253,0.65815546,0.60527986,0.55893165,0.52476647,0.48202489,0.45717664,0.42423387,0.40271242,0.37611746,0.36789476,0.35642796,0.36029260,0.36959553,0.32953758,0.28816947,0.24183179,0.20152688,0.23254011,0.26103291,0.28589065,0.31143171,0.33289593,0.35715212,0.39287051,0.42776352,0.44804419,0.46748098,0.48316654,0.49739057,0.51430820,0.53724956,0.55623234,0.51362255,0.50559251,0.49677191,0.47795201,0.46269727,0.50577180,0.55336783,0.57599599,0.60389413,0.55692623,0.51583548,0.45993575,0.40400150,0.34031967,0.28327964,0.23219689,0.17454050,0.22470600,0.26709882,0.32801087,0.38400366,0.39903258,0.41965752,0.45388892,0.49110013,0.47848312,0.47446269,0.45182092,0.42682381,0.44873697,0.47525746,0.47831560,0.48500457,0.47717244,0.46693003,0.47461562,0.48308918,0.46600357,0.45486074,0.44229908,0.42578294,0.40164016,0.37427624,0.37382126,0.37076139,0.35780691,0.33994487,0.32320572,0.30748232,0.34870168,0.38260963,0.41458924,0.44180668,0.48050197,0.51161995,0.54680803,0.58402458,0.58246095,0.57841342,0.58434372,0.58408834,0.57787511,0.57926624,0.55404945,0.53229759,0.50720785,0.47785306,0.46050366,0.44665792,0.38716831,0.32853285,0.27273316,0.20979523,0.21975686,0.23167437,0.25533895,0.27316153,0.25671760,0.23284740,0.22696140,0.21625532,0.24988704,0.28252360,0.32881703,0.36888882,0.40499625,0.44872425,0.48947096,0.53473781,0.53562681,0.53918222,0.55789887,0.57380101,0.53145255,0.49191221,0.47856818,0.46601283,0.44946516,0.43263701,0.41863091,0.40690013,0.39621927,0.39129448,0.38405598,0.38406630,0.36941145,0.36135875,0.34864403,0.33457356,0.35075754,0.36756160,0.39468888,0.42611278,0.47106408,0.51786913,0.54521682,0.57085762,0.66011146,0.74677464,0.82710633,0.91319337,0.85762910,0.80665672,0.74178117,0.68037172,0.63439540,0.58487517,0.53840970,0.49124017,0.50910402,0.52688815,0.55042489,0.56671022,0.56774808,0.57610693,0.56263834,0.55247411,0.54724100,0.54282790,0.54390813,0.53863135,0.53506520,0.53431646,0.52615782,0.51537198,0.48056087,0.44924855,0.40554322,0.36575366,0.30975303,0.25084392,0.20229328,0.15239343,0.21153538,0.27474768,0.31321650,0.35618442,0.38700477,0.41899635,0.45308640,0.48691088,0.46176646,0.43768948,0.39080293,0.35070361,0.31529066,0.28329022,0.24919643,0.21603985,0.21676648,0.21936671,0.20658884,0.19839076,0.17925331,0.15837589,0.15956730,0.15237687,0.21841944,0.28439348,0.35986950,0.43165334,0.54058504,0.65093323,0.76853170,0.87905507,0.81516081,0.75298990,0.68734721,0.61978133,0.56393639,0.50988356,0.43706336,0.36955108,0.41593631,0.45541106,0.52558263,0.59392046,0.59824088,0.60576360,0.62385007,0.64424124,0.62040870,0.59395387,0.59038963,0.59199713,0.52006251,0.45304851,0.40447694,0.35688530,0.41744036,0.48423818,0.53865637,0.59235913,0.60803748,0.61772630,0.65547099,0.68531882,0.68507689,0.68663301,0.70419617,0.72065769,0.70909803,0.69606929,0.70728145,0.72267522,0.65013348,0.58063033,0.52928853,0.47655455,0.43236197,0.38956278,0.34105984,0.29368057,0.28798728,0.28198211,0.29972050,0.31084780,0.30355316,0.29282752,0.26780989,0.25004070,0.26011429,0.27370834,0.28774763,0.30285555,0.31514276,0.32877303,0.36026931,0.39446936,0.41495120,0.43878052,0.43657955,0.43035802,0.45099128,0.47260109,0.49346480,0.44653521,0.45068780,0.44518059,0.43662387,0.42252207,0.45791410,0.49873412,0.53057871,0.56623353,0.52126813,0.48184060,0.43415832,0.38416632,0.33741899,0.28900728,0.23127033,0.17419072,0.21923145,0.27342156,0.32668071,0.38184416,0.38965474,0.39326409,0.41148305,0.43302804,0.42897367,0.42891171,0.42759845,0.41814237,0.42740965,0.43352176,0.43326463,0.42630431,0.43464148,0.44872932,0.46277136,0.47649295,0.45119389,0.43398974,0.40685526,0.38798571,0.37749277,0.36461268,0.37177431,0.37617826,0.33917157,0.30627966,0.27719356,0.23934718,0.29001255,0.33596386,0.37366712,0.40911389,0.45923378,0.50450910,0.55192400,0.60431342,0.58738479,0.56768773,0.54541489,0.52558136,0.52447598,0.52240787,0.51193535,0.49396679,0.47146114,0.43998358,0.41125243,0.38615840,0.32963215,0.27228259,0.20753862,0.14298917,0.16946769,0.20192839,0.22242646,0.25406427,0.22058094,0.18256641,0.15943262,0.13384195,0.18757235,0.24226265,0.30125729,0.35359390,0.40773749,0.46946516,0.52526142,0.57662974,0.56526175,0.55669830,0.55997620,0.56686717,0.52384448,0.47493463,0.45664760,0.43222441,0.42791857,0.41841411,0.40763988,0.39471157,0.39418719,0.39249165,0.40209798,0.40126631,0.39459380,0.38260345,0.36470620,0.34108562,0.35223683,0.35912770,0.37456502,0.39042191,0.44657380,0.49940388,0.53278235,0.57101489,0.65549923,0.73688502,0.82756236,0.91433398,0.85762332,0.79315175,0.74303752,0.69197345,0.65959132,0.62620933,0.59223829,0.56011433,0.57156292,0.58613264,0.59959888,0.60884814,0.60313096,0.59894640,0.58971765,0.58091548,0.56346046,0.55046862,0.54684069,0.54077607,0.52633898,0.50411107,0.49297142,0.47797718,0.43860656,0.39960772,0.34801646,0.29256179,0.24991567,0.20753147,0.16409330,0.11550130,0.17255499,0.22600577,0.27635182,0.32875009,0.35021338,0.37541822,0.40049601,0.42974397,0.41242865,0.39343391,0.36330958,0.32751202,0.30066756,0.26748803,0.23657743,0.20719170,0.20442087,0.20314908,0.18793911,0.17005503,0.15475858,0.13103778,0.11160200,0.08673705,0.16756331,0.25050917,0.33118896,0.40625822,0.53049936,0.65732508,0.78284570,0.90197800,0.83596655,0.75961981,0.70231467,0.63971345,0.56507440,0.49022302,0.41763258,0.34768239,0.39547299,0.45032652,0.51775368,0.58775498,0.60789959,0.62434981,0.64226089,0.66237145,0.63522984,0.60906489,0.59346055,0.57988782,0.51693855,0.44728999,0.38033971,0.31923618,0.38689318,0.45347088,0.51683867,0.58699350,0.61346358,0.63595079,0.67835832,0.71902717,0.71328715,0.70847775,0.70529226,0.70100001,0.70874002,0.71938290,0.74917570,0.77221646,0.70137645,0.61908978,0.55445854,0.48412233,0.41304596,0.34134498,0.27027154,0.19020036,0.21263719,0.23345305,0.24700027,0.26497651,0.26747530,0.26976984,0.26520520,0.27040020,0.27126875,0.27265429,0.27745679,0.27670305,0.29331453,0.30849825,0.33224448,0.35630889,0.37073373,0.38770721,0.39040271,0.38468159,0.40613475,0.42442963,0.43926400,0.38096565,0.38879180,0.40300381,0.39076228,0.37228773,0.41126857,0.44594834,0.48522637,0.52813670,0.48856596,0.45241153,0.40590729,0.36568536,0.32637764,0.29022170,0.22681191,0.16602845,0.21896216,0.27421043,0.32938482,0.38831218,0.37673651,0.35854619,0.36463429,0.37110072,0.37473364,0.38152045,0.39971469,0.41391107,0.40904868,0.40308788,0.38257818,0.36542498,0.39653973,0.43059098,0.45038797,0.47149421,0.44097305,0.41247653,0.37760201,0.34654520,0.35000840,0.35603081,0.36522038,0.37920993,0.32518679,0.27611696,0.22660660,0.17094820,0.22884030,0.28967663,0.33178228,0.37787211,0.43905405,0.49438356,0.56124588,0.62310481,0.58902246,0.55354443,0.50717099,0.46165319,0.46241076,0.46597905,0.46426436,0.45711167,0.43154055,0.40498948,0.36665411,0.32632146,0.26956366,0.21739649,0.14624850,0.07269958,0.11823535,0.16590016,0.19793751,0.23431337,0.18339359,0.13293054,0.09515990,0.05069108,0.12641421,0.20084228,0.27245301,0.33939290,0.41430357,0.48663156,0.55770964,0.62405288,0.59861161,0.56632575,0.56360575,0.55853420,0.50686851,0.45800386,0.43298103,0.40002045,0.40256436,0.40116657,0.39495152,0.38424028,0.39594364,0.39782372,0.41557818,0.42506453,0.41574512,0.40734940,0.37808159,0.34965041,0.34988023,0.34899613,0.35516269,0.35783815,0.41995574,0.48407625,0.52692847,0.57158259,0.65132825,0.73102008,0.82214215,0.91974661,0.85295884,0.78353676,0.73973993,0.69599016,0.68334960,0.66562726,0.64506072,0.62383300,0.63216838,0.64316973,0.64454590,0.65165002,0.63773976,0.62451656,0.61598917,0.61251154,0.58472679,0.55680592,0.55139684,0.54265245,0.50711952,0.47532837,0.46360097,0.44480630,0.40216215,0.35776321,0.28888782,0.22095300,0.19836212,0.16853574,0.11935540,0.07226092,0.13019213,0.17738285,0.23587874,0.29607748,0.31733282,0.33642245,0.35173433,0.36724469,0.36085014,0.34950462,0.32866754,0.30866469,0.28099419,0.24455921,0.22437523,0.20017866,0.19117321,0.18714979,0.16730903,0.14406708,0.12443394,0.10814683,0.05879038,0.01206525,0.11736118,0.22085131,0.30035155,0.38011366,0.52757557,0.67071977,0.79660377,0.93317106,0.85165298,0.76524392,0.71047122,0.65365578,0.56647654,0.47397284,0.40105587,0.32171227,0.37909137,0.43701431,0.50856948,0.58539066,0.61386481,0.64154619,0.66144014,0.68574490,0.65370163,0.61774557,0.59486861,0.57853531,0.50416328,0.43817908,0.35941701,0.27990773,0.34995827,0.41928619,0.50445029,0.58484140,0.61570572,0.64719043,0.70160939,0.76152681,0.74389872,0.73608725,0.70250280,0.67578923,0.71117488,0.73785535,0.78286847,0.83121419,0.74394855,0.66207214,0.57379072,0.48752453,0.39160760,0.29502926,0.19791377,0.09209592,0.13463919,0.17885974,0.19586648,0.21609328,0.22804566,0.24179505,0.27006373,0.28956563,0.28627173,0.27538405,0.26380219,0.24938644,0.26818772,0.28653211,0.30381124,0.31933415,0.33441103,0.34473497,0.33800632,0.33743547,0.36109883,0.38460538,0.38409709,0.43701410,0.43666122,0.44010144,0.42819361,0.41564465,0.43594114,0.45815951,0.47787243,0.50512202,0.46965712,0.44020385,0.41052295,0.38430482,0.35012610,0.31716171,0.26509763,0.21062428,0.25302285,0.29689347,0.34546309,0.39500521,0.37577132,0.35247768,0.34865281,0.33930207,0.34680591,0.34929081,0.36875831,0.39209859,0.39602463,0.39651743,0.39859701,0.39577805,0.41011421,0.42550039,0.42494331,0.42243303,0.40780594,0.39094140,0.36611020,0.33526578,0.34811692,0.35677489,0.37269868,0.38457812,0.36365770,0.33671913,0.30785891,0.27800451,0.31840757,0.36418023,0.39111825,0.41931040,0.46666313,0.51913398,0.56764512,0.61430051,0.58847301,0.56341645,0.53343886,0.50359146,0.50190250,0.50160592,0.48963431,0.47567639,0.45764493,0.43886687,0.40381869,0.36522277,0.31642336,0.26161571,0.20557522,0.14495321,0.17983794,0.22225696,0.25433853,0.28743934,0.24168372,0.19229913,0.15947333,0.13024972,0.19483657,0.26447830,0.33539669,0.40859353,0.46708691,0.52547339,0.57560985,0.63148946,0.60985085,0.58926302,0.58061179,0.57352354,0.52570494,0.48501685,0.44560105,0.40482612,0.41097829,0.42184054,0.42433950,0.42634884,0.43763193,0.45534013,0.45820162,0.46549214,0.46267291,0.45859496,0.43506429,0.41079448,0.40427464,0.39953890,0.38700526,0.37053131,0.42906143,0.48612055,0.53170751,0.57357142,0.64859385,0.72489932,0.79979272,0.87091714,0.83029973,0.79420957,0.75346294,0.71971734,0.70505512,0.68996927,0.67168441,0.64806463,0.64358401,0.63078599,0.62794249,0.62796854,0.61107029,0.59990093,0.59075418,0.58862700,0.55538130,0.52912769,0.52082314,0.51156664,0.47993186,0.45071269,0.43100537,0.40914211,0.37391537,0.33507868,0.29646846,0.25539848,0.22925083,0.19556457,0.15977406,0.12209857,0.16571351,0.21011324,0.25628942,0.29560955,0.31130205,0.33493183,0.34699746,0.36551425,0.36296449,0.36041948,0.34831306,0.33691211,0.31510780,0.28661647,0.26927507,0.24451026,0.22800588,0.21008217,0.18479318,0.15772818,0.14750155,0.12776835,0.10627154,0.08514535,0.16798254,0.24880525,0.31887631,0.39357939,0.50808472,0.62436399,0.73238581,0.84446416,0.77589734,0.70583544,0.64813744,0.59888868,0.53019708,0.46218527,0.40234574,0.34144015,0.38865619,0.43581908,0.48884041,0.54250935,0.57047332,0.59923956,0.63639355,0.66569588,0.63905834,0.60754089,0.58773489,0.56710113,0.49008060,0.42221620,0.34886433,0.26866031,0.32659013,0.38585022,0.45653649,0.52218729,0.56023078,0.60142916,0.63756106,0.67817775,0.67897733,0.67929617,0.65745594,0.63371683,0.65784157,0.68064428,0.71128198,0.74121944,0.66847163,0.59818905,0.52809619,0.46093265,0.38652063,0.31608707,0.24600163,0.18009477,0.20902200,0.23566647,0.26209168,0.28912418,0.29171010,0.29136459,0.30905282,0.32518404,0.32477058,0.32434813,0.31776675,0.30799694,0.31827496,0.32953099,0.33280167,0.33539662,0.34902020,0.36141948,0.37020607,0.37915917,0.40230160,0.42043630,0.42755389,0.49277731,0.48837039,0.47899926,0.46349351,0.45301988,0.45807670,0.46709375,0.47015416,0.48322308,0.45339658,0.42160170,0.41164531,0.40106764,0.37049143,0.34409221,0.30092843,0.25869562,0.29188123,0.32201164,0.36220933,0.40882399,0.37536275,0.33936791,0.32848048,0.30992004,0.31335659,0.31826452,0.34220340,0.36864905,0.38177187,0.39733909,0.41158402,0.42474993,0.42103727,0.42322959,0.39854122,0.37434469,0.37369656,0.36921100,0.34750987,0.33039705,0.33833244,0.35080438,0.37101665,0.39741521,0.39951791,0.39689453,0.39218331,0.38526055,0.41185920,0.43467710,0.44657158,0.46371074,0.50074890,0.54333903,0.56901711,0.60600764,0.58397166,0.57172160,0.55781740,0.54614645,0.54042757,0.53669227,0.51496198,0.49358421,0.48671781,0.47421475,0.43657649,0.40554805,0.35746605,0.31240825,0.26392663,0.21436556,0.24811044,0.28097657,0.31029399,0.34094765,0.29894391,0.25444207,0.22597808,0.20126936,0.26680388,0.33154403,0.40180382,0.47038571,0.51260272,0.55878292,0.59822952,0.63466541,0.62023894,0.60206481,0.59320089,0.58628494,0.54811394,0.51187642,0.45907723,0.40181404,0.42106269,0.43633618,0.44804465,0.46293655,0.48539529,0.50626886,0.50883314,0.50826843,0.50941284,0.51309656,0.48601089,0.46115367,0.45768484,0.45068575,0.41653618,0.38489755,0.43875007,0.49097580,0.53115444,0.57840447,0.64456471,0.71859066,0.77602244,0.82890314,0.81161679,0.79704630,0.76653084,0.74331089,0.73245710,0.71960305,0.69414795,0.68034160,0.65329819,0.62226676,0.61537787,0.60307509,0.59091028,0.56995075,0.56562033,0.56212213,0.53221485,0.49906506,0.49204354,0.48225125,0.45079965,0.42025673,0.39357325,0.37259430,0.34382796,0.31283189,0.30573684,0.29417686,0.26154248,0.22791279,0.20199958,0.17315488,0.20528903,0.24640726,0.26863535,0.29662902,0.31289686,0.32622177,0.34386195,0.35729495,0.36612775,0.37523782,0.37530305,0.37289825,0.35268301,0.33029067,0.30840839,0.28927875,0.26306296,0.23402593,0.20237967,0.16753132,0.16498507,0.15440562,0.15415153,0.15228140,0.21438383,0.27580712,0.33508060,0.39613414,0.48718352,0.57828219,0.66832093,0.75968702,0.70364690,0.64282528,0.59050648,0.53708096,0.49824013,0.45033722,0.40323365,0.36013658,0.39913458,0.43399117,0.46422779,0.49804555,0.53260072,0.56213886,0.60959172,0.65465780,0.62561192,0.59477778,0.57608520,0.55451651,0.47917914,0.40602947,0.33008563,0.25896095,0.30658957,0.34981446,0.40998302,0.46214510,0.50967238,0.55529730,0.57482933,0.59361505,0.60982421,0.62367067,0.60768409,0.58734054,0.60304648,0.61855004,0.63430282,0.65325253,0.59796186,0.53662359,0.48864045,0.43519153,0.38508086,0.33107033,0.29612049,0.26316418,0.27628432,0.29572834,0.32920774,0.36468183,0.35231348,0.33934985,0.35337064,0.36478023,0.36721640,0.37944900,0.36777279,0.35514709,0.36436084,0.37573166,0.36345138,0.34794024,0.36321594,0.37472077,0.39980832,0.42559250,0.44611348,0.46574605,0.47733733,0.56511629,0.53803712,0.51319368,0.49762013,0.48170755,0.46797382,0.45574542,0.44894373,0.44695724,0.43549940,0.42560182,0.43065270,0.44125617,0.40920985,0.37615901,0.32703274,0.28196321,0.31518979,0.34808286,0.38225995,0.41847403,0.37969081,0.33962570,0.31115279,0.28632079,0.29401247,0.29487546,0.30796118,0.32128077,0.36370322,0.39928570,0.43612583,0.47179340,0.44237565,0.41139877,0.37627950,0.34430140,0.33916168,0.33741750,0.32303921,0.31144391,0.32542364,0.34738466,0.38053908,0.41253670,0.43521018,0.45255435,0.47980672,0.50484798,0.50282284,0.50193428,0.50109346,0.50800222,0.52701899,0.54819959,0.56360607,0.58686284,0.57124203,0.56180976,0.56649267,0.56901720,0.56261099,0.55644437,0.54727483,0.53279391,0.51388757,0.49855386,0.47419715,0.45038886,0.40218828,0.35164753,0.31029609,0.26977518,0.29904232,0.32984983,0.35855321,0.38680097,0.35499874,0.32341823,0.29251456,0.26105212,0.33255772,0.39871860,0.47310214,0.54563467,0.57818981,0.60480137,0.62916276,0.65027356,0.63875893,0.62970849,0.61776179,0.60781891,0.56083181,0.51307489,0.46366427,0.41479656,0.44429871,0.46306619,0.48544527,0.50996462,0.52484861,0.54308356,0.55932956,0.57400372,0.56657728,0.56592005,0.55008451,0.53170206,0.50146238,0.47719158,0.43536004,0.39858756,0.44357442,0.48584675,0.52277663,0.55739017,0.62713746,0.69314584,0.75273561,0.80968607,0.79490392,0.78385030,0.77237336,0.76532591,0.74320220,0.72298974,0.70703207,0.68651674,0.66009793,0.63813425,0.61368999,0.58925614,0.57162383,0.55247535,0.54209229,0.53577310,0.50974396,0.48143675,0.46287185,0.43989991,0.40850462,0.38423891,0.34468388,0.31144160,0.31563927,0.31697667,0.32159145,0.32183577,0.28827990,0.26161048,0.23131990,0.20064665,0.22914595,0.26020171,0.28680859,0.30705200,0.32242908,0.34055356,0.34598149,0.35465772,0.36867097,0.37969121,0.38487670,0.39283541,0.37669971,0.36651809,0.34963985,0.33246018,0.29999629,0.26113282,0.22383733,0.18102807,0.19295075,0.20538775,0.20777462,0.21173693,0.26263868,0.31386555,0.36209669,0.41209389,0.48032070,0.54929145,0.62234020,0.68708084,0.63880105,0.58506193,0.54250746,0.50058447,0.46474948,0.43373234,0.39963294,0.37143022,0.39669231,0.41980849,0.44756448,0.46531991,0.50570430,0.54223379,0.58277044,0.62023327,0.59535307,0.57332198,0.56024642,0.54497903,0.47078023,0.39489982,0.31990825,0.24760983,0.28815437,0.32763031,0.37008313,0.41000876,0.44872243,0.49092268,0.50923799,0.52734460,0.54445387,0.56477348,0.55762788,0.55744296,0.56198656,0.56407921,0.56731369,0.57115454,0.53157103,0.49274013,0.45383619,0.41980745,0.38938699,0.36511855,0.34459232,0.32032661,0.34245454,0.37048642,0.40092909,0.43091290,0.41238740,0.39498445,0.39440520,0.38564943,0.39887813,0.41692540,0.41336680,0.41871707,0.41121431,0.40093882,0.37899852,0.35462396,0.38514391,0.40877955,0.42946432,0.44931869,0.48524192,0.51693355,0.53854013,0.63225941,0.59185441,0.54502760,0.53105220,0.51015121,0.47250383,0.43932181,0.42600146,0.41780996,0.42140020,0.42046165,0.45265011,0.48011705,0.44022665,0.40937462,0.35476638,0.30503857,0.34224693,0.37087321,0.40057229,0.43065958,0.37953485,0.33500738,0.29837621,0.26182822,0.26989629,0.27251072,0.27925216,0.28101651,0.34240321,0.40293898,0.45959093,0.51490362,0.45730575,0.39666470,0.35514119,0.31086456,0.31056740,0.31008623,0.30234418,0.29213036,0.31703889,0.33424998,0.38016662,0.42612021,0.46812561,0.51028071,0.56418054,0.61986996,0.59222176,0.56769529,0.56210547,0.54911519,0.55082264,0.54958109,0.55694815,0.56822269,0.56388864,0.55614940,0.57535195,0.59925928,0.59085969,0.58186625,0.57590701,0.57533862,0.54672751,0.52000202,0.50539012,0.49461346,0.44348277,0.39487142,0.36078040,0.32433760,0.35417959,0.37711818,0.40977783,0.44271491,0.41910681,0.39534062,0.36021218,0.32163627,0.39590042,0.46861497,0.54471281,0.62317700,0.63828213,0.65793697,0.66525494,0.66740760,0.65933439,0.65016996,0.64107814,0.63515143,0.57211622,0.51279594,0.47251714,0.42923351,0.46376427,0.49411611,0.52247971,0.55359556,0.56214038,0.57430910,0.60375931,0.63410401,0.62750403,0.62677185,0.61654596,0.60818842,0.55347965,0.49908370,0.45655217,0.41475257,0.45130032,0.48146550,0.50995644,0.54281419,0.61182698,0.67644958,0.73135834,0.79200708,0.78227991,0.76902414,0.78320858,0.79369787,0.76008604,0.72414906,0.70920241,0.69494903,0.67578582,0.65213927,0.60922632,0.56784898,0.54787018,0.52774579,0.52010457,0.50993731,0.48611117,0.46083100,0.42941191,0.39680795,0.36859030,0.34793681,0.29792876,0.24561948,0.28337318,0.31993964,0.33120920,0.35094765,0.32442379,0.29621796,0.26363453,0.22673123,0.25468823,0.28243110,0.30177513,0.31580587,0.33889986,0.35714472,0.35287571,0.34852716,0.37090278,0.39302738,0.39992682,0.41082415,0.40552702,0.40808316,0.39407203,0.37941525,0.33445431,0.28996476,0.24503089,0.19455447,0.22757499,0.25819360,0.26882916,0.27827284,0.31802341,0.35479536,0.38606566,0.42125812,0.47378693,0.52474852,0.56864518,0.61920473,0.57267016,0.52369463,0.49176514,0.45910330,0.43497241,0.40864829,0.39733601,0.38805006,0.40214156,0.41098884,0.42619569,0.43438775,0.47737492,0.51880766,0.54962050,0.58145864,0.56746214,0.55499045,0.54889995,0.53767411,0.46071019,0.38112390,0.30690316,0.22890782,0.26610964,0.30466153,0.32975938,0.35154137,0.38805345,0.42711882,0.44391404,0.45351290,0.48055187,0.50755838,0.51642392,0.52262260,0.51380912,0.50240625,0.50157259,0.49590170,0.46849928,0.44219128,0.42407375,0.39758816,0.39931652,0.39755705,0.38889907,0.37139041,0.40910609,0.44605528,0.46921675,0.49504509,0.47202967,0.44980561,0.42768144,0.40704899,0.43432124,0.45595963,0.46127058,0.47580293,0.45109548,0.43523267,0.39788354,0.36372158,0.40663364,0.44513395,0.46398026,0.47944827,0.52390221,0.57099561,0.60107291,0.67873670,0.62567448,0.57647366,0.53683362,0.50228016,0.45503295,0.40942936,0.37361614,0.34303224,0.36585844,0.39697240,0.42993368,0.45671427,0.44332326,0.42169648,0.40049855,0.37937285,0.38720299,0.39093812,0.39825898,0.40132035,0.34793776,0.29310493,0.25383076,0.21276260,0.22841258,0.23801063,0.25639038,0.28072326,0.33551128,0.38797108,0.43238585,0.48114551,0.43402264,0.39091322,0.35100875,0.30505471,0.29004501,0.27251330,0.24872807,0.22730478,0.26516646,0.31214218,0.36457321,0.42199300,0.48980653,0.54899966,0.62834024,0.70368355,0.65821809,0.62043677,0.58637509,0.54790874,0.53862344,0.52845466,0.52651015,0.52412451,0.52847366,0.53487144,0.55104703,0.56571452,0.56383216,0.56469127,0.56233074,0.56027392,0.54453454,0.53007135,0.51599106,0.51045376,0.48285362,0.45496873,0.42843088,0.39904988,0.42189673,0.44397010,0.46192450,0.48357191,0.46933956,0.45695256,0.43135749,0.40126356,0.45683916,0.50874435,0.57045314,0.63642620,0.66830755,0.69389329,0.71476001,0.73095556,0.71115437,0.68901907,0.65494807,0.62328989,0.57398796,0.51895531,0.47509970,0.43803800,0.46777620,0.50008554,0.52404046,0.55109368,0.57802861,0.60513623,0.64129460,0.67284151,0.65507318,0.64061476,0.61584416,0.58942486,0.54923538,0.50483186,0.47415730,0.43143443,0.46814915,0.50410665,0.52903899,0.55288151,0.60035668,0.64571116,0.69226164,0.74078261,0.74429194,0.74793144,0.75954707,0.77621992,0.76877540,0.76102912,0.76475744,0.76974175,0.72102358,0.66912689,0.62267000,0.58014711,0.54775228,0.51401139,0.49838981,0.47502268,0.44949948,0.42472400,0.39701384,0.36993848,0.33933536,0.30656390,0.26567848,0.22928582,0.25728604,0.29406519,0.31052894,0.32557310,0.31593515,0.30019306,0.28404934,0.26709475,0.28478393,0.30261937,0.31785808,0.33040571,0.35090647,0.36545330,0.37896460,0.38219819,0.39912950,0.40681649,0.41107654,0.41314623,0.40518023,0.39969685,0.39158242,0.38020418,0.34933822,0.32445794,0.28093291,0.24392840,0.26051863,0.27677789,0.28470991,0.29669768,0.32881005,0.36049657,0.38624125,0.41017241,0.44476156,0.47901312,0.50225745,0.52978331,0.50445562,0.48070998,0.46014080,0.44375621,0.42297013,0.39785714,0.38248493,0.37408415,0.39249637,0.40896069,0.42895219,0.44466191,0.48644987,0.53311614,0.57746957,0.62640629,0.59385307,0.56599883,0.54075459,0.51762294,0.44940728,0.38221288,0.31646709,0.24545856,0.27914090,0.30903976,0.33803114,0.36970061,0.39060010,0.40956240,0.41737329,0.43358482,0.43911147,0.45093029,0.45122003,0.46016300,0.44456561,0.42665544,0.41235538,0.39763992,0.40124095,0.40326553,0.41151086,0.41493705,0.43085120,0.44623118,0.46945914,0.48412879,0.49429211,0.50635597,0.52202070,0.53442984,0.51768093,0.50392670,0.48661920,0.47121364,0.47251685,0.47770147,0.47691638,0.47595287,0.45374868,0.43031303,0.40296849,0.37699025,0.42457731,0.47135445,0.50074546,0.53490957,0.56661461,0.60580330,0.63867400,0.73092414,0.66841299,0.60504000,0.55337899,0.49835889,0.43741453,0.38268702,0.32725347,0.26564817,0.31625588,0.36976841,0.40707640,0.44157663,0.44252394,0.44142868,0.44844240,0.45236141,0.43315099,0.41660804,0.39075000,0.37438381,0.31308328,0.25169330,0.20975783,0.16800357,0.18840108,0.20254656,0.24122295,0.27212537,0.32369090,0.37739724,0.41351198,0.44629379,0.41914441,0.38796747,0.34019731,0.29777923,0.26159958,0.23023771,0.19758563,0.15873617,0.22246311,0.28288660,0.35421201,0.41985056,0.50654550,0.58916092,0.68711248,0.78413778,0.72892769,0.66748745,0.61115411,0.54726642,0.53279944,0.51150153,0.50011016,0.48938739,0.49917935,0.51685775,0.52484509,0.53608124,0.54071274,0.54886873,0.54565533,0.54234981,0.53889558,0.53272398,0.53069968,0.52780444,0.51700340,0.51192827,0.49165628,0.47515264,0.48907875,0.50990359,0.51389653,0.52408204,0.51915941,0.52222286,0.50106033,0.48435389,0.52110240,0.55011253,0.60512766,0.65157184,0.69386895,0.74124738,0.76482147,0.79479266,0.75977482,0.72931247,0.66769719,0.61095179,0.56780991,0.52474338,0.48144029,0.44213862,0.47868173,0.51207348,0.53329036,0.55123147,0.59061874,0.63165968,0.67311409,0.72039130,0.68845538,0.65411568,0.61515478,0.57227800,0.54746280,0.51400440,0.48582814,0.45181659,0.49389890,0.53045984,0.54854247,0.56270158,0.59582874,0.62155714,0.65795825,0.68822102,0.70333078,0.71934125,0.74284184,0.76653287,0.78341810,0.80134490,0.82389363,0.84343732,0.76346915,0.68603235,0.63675767,0.59369960,0.54734497,0.50234877,0.47668611,0.44565011,0.42054472,0.39534728,0.36920291,0.34488393,0.30431387,0.26850073,0.23475628,0.20147995,0.23461312,0.26538913,0.28442319,0.30402031,0.30667579,0.30138779,0.30664042,0.31020050,0.31830829,0.32340022,0.33256910,0.34039859,0.36095373,0.37746745,0.39760670,0.41542182,0.41875700,0.42197612,0.42218699,0.42031437,0.40893483,0.39954420,0.39150153,0.37787542,0.36579035,0.35786146,0.31938200,0.28829863,0.29097466,0.29253659,0.30569219,0.31821522,0.34369799,0.36934513,0.38548914,0.39885807,0.41608405,0.43268428,0.43304279,0.43413322,0.43728842,0.43156709,0.43132612,0.43250092,0.40974220,0.38161559,0.37243799,0.35664308,0.37834484,0.39813203,0.42616696,0.45142956,0.49944123,0.54625125,0.60771205,0.66901833,0.62282853,0.57471535,0.53910865,0.50306730,0.44592118,0.38934108,0.32516917,0.26610083,0.28549158,0.30784166,0.35027238,0.38456508,0.38918991,0.38521468,0.39763654,0.40674752,0.40387789,0.39403830,0.39311602,0.39395142,0.37360834,0.35670374,0.32949383,0.30756363,0.33545632,0.36490222,0.39557877,0.43200543,0.46476549,0.49732514,0.54942680,0.59625069,0.58479396,0.56943388,0.57496618,0.58214561,0.56382068,0.55306940,0.54146579,0.53609892,0.51786712,0.49365037,0.48980715,0.48167537,0.45910298,0.42762621,0.41308115,0.38749798,0.44536576,0.49670305,0.53861609,0.58461495,0.61082198,0.63495248,0.68145230,0.77961308,0.70494276,0.63353939,0.55521601,0.48303352,0.41588529,0.35129713,0.27518116,0.19690485,0.25805450,0.31976854,0.37706098,0.43935458,0.45749886,0.47553149,0.49672509,0.51958540,0.47559311,0.42200006,0.37772111,0.33855667,0.27764147,0.21835485,0.16264569,0.10083573,0.13861480,0.17869163,0.22199250,0.25817990,0.31035809,0.35985895,0.40038426,0.44166722,0.40564099,0.36715134,0.32969609,0.29743928,0.24536935,0.19747855,0.14287533,0.09672280,0.17662670,0.26404393,0.34627008,0.42416211,0.53783770,0.65089286,0.76400079,0.88329427,0.79888266,0.71195214,0.63155814,0.55155935,0.51795691,0.49044150,0.46343677,0.43760914,0.45922784,0.48163148,0.50191546,0.52112527,0.52990417,0.53684098,0.54643266,0.55391068,0.55266501,0.55641082,0.55622200,0.55945355,0.55283325,0.54749744,0.53529356,0.52858760,0.54237595,0.55483170,0.56355128,0.57393264,0.56603484,0.56495932,0.56582987,0.56392237,0.58574312,0.60836356,0.63663310,0.66533732,0.71846925,0.77624417,0.81847939,0.86256884,0.80736036,0.74901249,0.68289567,0.61595131,0.56904064,0.52251951,0.48244295,0.44296397,0.47598629,0.50365045,0.52416532,0.55471865,0.60042548,0.65057454,0.70362564,0.76246264,0.71926501,0.67235625,0.62726616,0.57847740,0.55099737,0.52455389,0.50017980,0.47376586,0.50814878,0.53877212,0.56181414,0.58906720,0.59780457,0.60305179,0.62058907,0.63864250,0.67257753,0.70178946,0.73672884,0.76763119,0.79913564,0.83781420,0.86840910,0.90022795,0.81269920,0.71904031,0.64616288,0.57561234,0.53517759,0.48548954,0.45097047,0.41099136,0.38833572,0.36389027,0.33532790,0.30279052,0.27121131,0.24058758,0.21340592,0.18413778,0.21899707,0.24407053,0.27771651,0.30541417,0.30905660,0.31660827,0.32358780,0.32405001,0.34194181,0.34982220,0.35770896,0.35961979,0.38678905,0.41586663,0.43492695,0.45691482,0.45405915,0.44855885,0.42584245,0.41120115,0.41159184,0.40953090,0.39825035,0.38925189,0.37686380,0.36677143,0.34788579,0.33010734,0.33307503,0.33471519,0.33388141,0.33147222,0.34865696,0.37002676,0.38232299,0.39914777,0.39866177,0.39662164,0.37728646,0.35915737,0.36795116,0.37645995,0.38944092,0.40427768,0.38689711,0.36688301,0.35467896,0.34834614,0.37567743,0.40362001,0.43336276,0.46281046,0.51125091,0.56308766,0.62793078,0.69517276,0.63890386,0.58480971,0.52436067,0.47206268,0.42073649,0.37732405,0.31888484,0.26851584,0.29673403,0.33091966,0.35986456,0.39920799,0.39149927,0.38091056,0.38874635,0.39091051,0.37044151,0.35371659,0.33498773,0.31892188,0.29497264,0.26986806,0.23478149,0.20065252,0.26434466,0.31976233,0.37058607,0.41640682,0.48842684,0.56049952,0.63900939,0.70714712,0.68126390,0.65115967,0.63518744,0.61637514,0.60662339,0.59774084,0.59517267,0.58816590,0.56018386,0.52970779,0.51077805,0.49048004,0.46837196,0.44205651,0.42804338,0.41110010,0.46847193,0.51954815,0.57596191,0.63825393,0.67170258,0.70247061,0.74467896,0.83794900,0.74580511,0.65893160,0.56483056,0.46645817,0.39331759,0.31850747,0.22432019,0.12546076,0.20184177,0.27037884,0.34982284,0.43290081,0.46654862,0.50463091,0.54686569,0.59034104,0.51084195,0.43119458,0.36703391,0.29738195,0.24105491,0.19012955,0.11028547,0.03331755,0.09622590,0.15699076,0.20304637,0.24686422,0.29261648,0.34292373,0.38772937,0.42922481,0.38727101,0.34259907,0.31907420,0.29405549,0.22776300,0.16375218,0.09589241,0.02589083,0.13726556,0.24582740,0.33628564,0.42466421,0.56509067,0.70725244,0.84113755,0.98060408,0.87113021,0.75701259,0.65723363,0.55220299,0.51042959,0.46402973,0.42772946,0.38626430,0.41907621,0.45123073,0.47597364,0.50596174,0.51909396,0.53119325,0.54495633,0.55955740,0.56631961,0.57792292,0.58093975,0.58732281,0.58348104,0.58150355,0.58696974,0.59034995,0.59702957,0.60709866,0.61099164,0.61996656,0.61754501,0.61193932,0.62894166,0.64597332,0.65096425,0.65619542,0.66963951,0.68239322,0.74732217,0.81081350,0.87231621,0.93508947,0.85238534,0.77483551,0.69419357,0.61298935,0.57051638,0.52008208,0.48339031,0.44855193,0.46916144,0.48875962,0.52325276,0.55247895,0.61297072,0.66846099,0.73374088,0.80503066,0.74817517,0.69881557,0.63707385,0.58027917,0.56183928,0.53771858,0.52133674,0.49855504,0.52432826,0.54376580,0.58016739,0.61986754,0.59857809,0.57966076,0.58566853,0.59179864,0.63639243,0.68694888,0.72402999,0.76816675,0.81778663,0.87371599,0.91843953,0.96884338,0.85882339,0.74884226,0.65685227,0.56230411,0.51666634,0.46883859,0.42546716,0.37577064,0.35264936,0.33566581,0.30041820,0.26208194,0.23899379,0.20665042,0.18896669,0.16383059,0.19869080,0.22496849,0.26480631,0.29989737,0.31855218,0.33353042,0.34223670,0.34506369,0.36450101,0.38509090,0.37441286,0.36846389,0.40805383,0.45308436,0.47349108,0.49947138,0.48829562,0.47440866,0.43806480,0.40208088,0.41272721,0.41756535,0.40942891,0.39710179,0.38743150,0.38251880,0.38000116,0.36981020,0.36930719,0.37142444,0.35778923,0.34977447,0.36236506,0.36828716,0.38921559,0.40537686,0.37834261,0.35719206,0.31945029,0.28409421,0.30091725,0.32028136,0.35487352,0.38211768,0.36987015,0.35478539,0.34368452,0.33419451,0.37377478,0.41150050,0.44169693,0.47013565,0.52642654,0.57737209,0.64894351,0.72026525,0.65878987,0.59561045,0.51514961,0.43557313,0.40210167,0.36601498,0.31761332,0.26796953,0.30855403,0.34927948,0.37799516,0.41173725,0.39085689,0.37581372,0.37350092,0.36862196,0.33786149,0.30998036,0.27732202,0.23841242,0.21256442,0.19048943,0.14020768,0.09329938,0.18955122,0.28263827,0.34388502,0.40759678,0.51647960,0.62931440,0.72220959,0.82294644,0.77313573,0.72193819,0.68715448,0.65026140,0.64975006,0.64836858,0.64692761,0.64412934,0.60123268,0.56387653,0.53163223,0.50163831,0.47932384,0.45515706,0.44599955,0.43137774,0.48961782,0.54103722,0.61815086,0.69543878,0.72881571,0.77026974,0.80030497,0.84664740,0.75884240,0.66718307,0.56844284,0.47185487,0.39957914,0.32883226,0.24401952,0.15598862,0.22390105,0.29862304,0.37546615,0.44920110,0.49333074,0.53438880,0.57414208,0.61484447,0.54202301,0.46555436,0.39280885,0.31893884,0.27055178,0.21487257,0.14831245,0.08160154,0.12964413,0.17817941,0.22004177,0.25489058,0.30436524,0.35298512,0.39317740,0.43922270,0.39694346,0.35161179,0.32174616,0.29372334,0.24527564,0.19972559,0.14086474,0.08557408,0.18412474,0.28697797,0.37158287,0.44948213,0.57139439,0.69634254,0.80678585,0.92089485,0.82811589,0.73374266,0.64411144,0.55626515,0.51293367,0.47153226,0.42331130,0.37902511,0.41314696,0.44223723,0.48444017,0.52173416,0.53978460,0.56038785,0.58840291,0.61151973,0.60103595,0.59110128,0.59139475,0.59193918,0.57936098,0.57469537,0.57208890,0.56608422,0.56951750,0.56433250,0.57018177,0.57437708,0.56845431,0.56010700,0.56886321,0.57344770,0.59351062,0.61483207,0.63944483,0.65747118,0.70994169,0.76522869,0.81931742,0.87050171,0.80277308,0.73708410,0.67286615,0.61061949,0.57046881,0.53230774,0.49462371,0.45712861,0.47809208,0.49848427,0.52675701,0.55027573,0.59854163,0.65030730,0.70241141,0.75596213,0.71003348,0.66565703,0.62530632,0.58882954,0.55887084,0.53170805,0.51334180,0.49523954,0.51408025,0.53212569,0.56042495,0.59810168,0.58307465,0.56670005,0.56504395,0.56260347,0.61377377,0.66183134,0.69974429,0.73419137,0.77131905,0.81813599,0.86334219,0.90781208,0.82325819,0.74007217,0.66005819,0.57732120,0.53597080,0.49139714,0.44669183,0.40507130,0.38248161,0.36728511,0.33764097,0.30869966,0.28485946,0.26761331,0.24397182,0.22011166,0.24663483,0.26848343,0.30709376,0.34366116,0.35015632,0.36298670,0.36065454,0.36045774,0.37504517,0.39053296,0.38672622,0.38136579,0.40691512,0.43092104,0.43785720,0.44650438,0.43837905,0.43530161,0.40949564,0.39208317,0.40217882,0.41204655,0.42376974,0.43419326,0.41454443,0.40086812,0.39458464,0.39278300,0.38122247,0.37659747,0.36110991,0.35005674,0.35509625,0.36492522,0.37371782,0.38146814,0.36135127,0.33719382,0.30546273,0.27734307,0.29936441,0.32157391,0.34929205,0.38368252,0.36860405,0.36112222,0.36123290,0.35839584,0.38607230,0.41463718,0.43470994,0.45316086,0.49747520,0.53599617,0.59469153,0.65192994,0.60404013,0.54717998,0.49264465,0.43271188,0.40338490,0.36971874,0.32678953,0.29279744,0.33046112,0.36786846,0.39714487,0.43582685,0.43637100,0.43729839,0.44822588,0.45902548,0.42461441,0.39019367,0.35273883,0.31787122,0.27764070,0.24306765,0.19527617,0.15005700,0.23068388,0.31579718,0.38003895,0.44467205,0.53758752,0.63698993,0.72910030,0.82214415,0.77698764,0.74021798,0.71714868,0.69333258,0.68569530,0.67259528,0.67412555,0.68001465,0.63429484,0.59680085,0.56466154,0.53671109,0.51694006,0.49362864,0.48233386,0.46942829,0.51889147,0.55851794,0.61788390,0.67426123,0.71276405,0.75695663,0.80289201,0.86307661,0.77123771,0.67790034,0.57218416,0.46883772,0.40244741,0.34139749,0.26044345,0.18220776,0.25119248,0.32449428,0.39756976,0.46788318,0.52043530,0.56787196,0.60757439,0.64393906,0.57191820,0.49615676,0.41733676,0.34529750,0.29284585,0.24090552,0.17877314,0.12342412,0.16151428,0.20200064,0.23518475,0.26585847,0.31215248,0.36031590,0.39830186,0.44641201,0.39857528,0.35622166,0.32837368,0.29323384,0.26282138,0.23242830,0.18995875,0.14346924,0.23298757,0.32568334,0.39888025,0.47477831,0.58257866,0.68566612,0.77359715,0.86263184,0.79162083,0.71290416,0.63261271,0.55324079,0.51343179,0.47196448,0.41960527,0.37344701,0.40638921,0.43511560,0.48937057,0.54039699,0.56640716,0.59144032,0.62292774,0.66216784,0.63404088,0.60643223,0.60117494,0.59510576,0.57721360,0.56023170,0.55565370,0.54790546,0.53599828,0.52376444,0.52755436,0.53140090,0.51753567,0.50632790,0.50561563,0.50210064,0.53939954,0.57900002,0.60577882,0.63327983,0.68079665,0.72972525,0.76525114,0.80330611,0.75612684,0.70494415,0.65251960,0.60427969,0.57223749,0.54228153,0.50063933,0.46375655,0.48373298,0.51226948,0.52587822,0.54209593,0.59016388,0.63118623,0.66861201,0.70929004,0.67061996,0.63194129,0.61606213,0.59794407,0.56014077,0.51664667,0.50655406,0.49982192,0.50357517,0.51362288,0.54765778,0.57712157,0.56471930,0.54520284,0.54265218,0.53428491,0.58439787,0.64019806,0.66984200,0.69803987,0.73245374,0.76014250,0.80449098,0.84698541,0.78681173,0.72970459,0.65930007,0.59230447,0.55383196,0.50496885,0.47144179,0.43566617,0.41776941,0.39348802,0.37409887,0.35288940,0.34085078,0.32455114,0.29548199,0.26836906,0.29420929,0.31293082,0.35184396,0.38834482,0.38828090,0.39608654,0.38060608,0.37141644,0.38531020,0.39863933,0.39567917,0.39776858,0.40481190,0.41523966,0.40254431,0.39621363,0.39410038,0.39879871,0.38616719,0.37657634,0.39304880,0.41175667,0.44053403,0.47254753,0.44493221,0.41530963,0.41889676,0.41609350,0.39419550,0.37706037,0.36410940,0.34261739,0.35370144,0.35711173,0.35788041,0.35967452,0.34066750,0.32631695,0.29480853,0.26033058,0.29021483,0.32139527,0.35188069,0.38318495,0.37759844,0.36435286,0.37723150,0.38259803,0.39950684,0.41394595,0.42514928,0.43475212,0.46243369,0.49536350,0.54141762,0.58554305,0.54286035,0.50647714,0.47094476,0.43096774,0.40256153,0.37002866,0.34104950,0.31600932,0.34845911,0.38541774,0.42091159,0.45891528,0.47832556,0.49106874,0.52059773,0.55417587,0.51294053,0.47655891,0.42976104,0.39201276,0.34464186,0.30490572,0.24940272,0.20168474,0.27727574,0.35137442,0.41234831,0.48055278,0.56005046,0.64821745,0.73388184,0.82393640,0.78688295,0.74874714,0.74500152,0.74346630,0.72187985,0.69688142,0.70809378,0.71463377,0.66907885,0.62229796,0.59902022,0.57453707,0.54854710,0.53102073,0.51690773,0.51006879,0.54156815,0.57907747,0.61549106,0.65159201,0.70302637,0.74848596,0.80323205,0.87327734,0.77573731,0.67377046,0.57392484,0.47686576,0.41025015,0.34669324,0.26618219,0.19306736,0.27247530,0.35346658,0.42774267,0.50375330,0.54401110,0.58390004,0.62910907,0.67165119,0.59707983,0.51517796,0.43582328,0.35720046,0.31362696,0.26452024,0.21456066,0.16514026,0.19566721,0.22447715,0.24970120,0.26779423,0.30730538,0.34864465,0.39361191,0.43302385,0.39723986,0.36725518,0.33332867,0.30135859,0.28066668,0.25782495,0.23842734,0.21556148,0.29047201,0.36500573,0.43857037,0.51564208,0.59477156,0.68109393,0.75527186,0.83504726,0.76601748,0.69959324,0.61610562,0.53562293,0.49171071,0.44847071,0.40386314,0.35059053,0.40244179,0.45501797,0.50388079,0.54743419,0.58201137,0.61533880,0.65641837,0.70396878,0.66907582,0.63949857,0.62027941,0.59837151,0.58210009,0.55959705,0.53905207,0.51675033,0.49815722,0.48401347,0.47189057,0.46412181,0.46348662,0.45396018,0.45024723,0.45075392,0.48958298,0.52793470,0.56024301,0.59299624,0.63563878,0.66953545,0.71030097,0.75246969,0.71461701,0.67496934,0.63325551,0.59748307,0.56059301,0.52265981,0.49243881,0.45864556,0.48042318,0.49980688,0.52719481,0.55408444,0.57637361,0.60517201,0.64019295,0.67720901,0.65226814,0.62599238,0.60634625,0.59147660,0.55525247,0.52214763,0.49950405,0.47950621,0.49925605,0.51474165,0.53891690,0.55685961,0.54178606,0.53169217,0.51870259,0.50678224,0.55916512,0.60384800,0.64107913,0.67271177,0.69613524,0.72187316,0.74586829,0.77295742,0.73238615,0.69163700,0.65009783,0.60741789,0.57612568,0.53683875,0.50542122,0.47618516,0.45341819,0.43306174,0.41110888,0.39105792,0.37874150,0.36516639,0.34235515,0.32320310,0.34524766,0.37029636,0.39444773,0.42136738,0.41184897,0.40344384,0.40189799,0.40043168,0.40620660,0.41593309,0.41490880,0.41583024,0.39879406,0.37846637,0.36109170,0.33788783,0.34790418,0.36255434,0.35954822,0.36506613,0.39722213,0.42510235,0.46253349,0.50073885,0.47233969,0.44540106,0.43736791,0.43031131,0.40920926,0.38206423,0.36358133,0.34037963,0.34443180,0.34899834,0.34635397,0.33966386,0.32457751,0.30801047,0.28404501,0.25931754,0.28935052,0.32373153,0.36010488,0.39453609,0.39167958,0.39352593,0.40114712,0.40551980,0.40118766,0.39724957,0.39299121,0.39075699,0.42026092,0.44873120,0.48816229,0.52684843,0.49793239,0.46372888,0.44681830,0.42662900,0.39816421,0.37153524,0.35104230,0.32491721,0.36648444,0.40243350,0.45218487,0.49707373,0.52698055,0.55890856,0.60099315,0.63871368,0.59263027,0.54838158,0.50146503,0.45802515,0.40410973,0.35535495,0.30060216,0.24299007,0.30867250,0.37525795,0.43913087,0.49779220,0.57677737,0.64764287,0.73000913,0.81010069,0.79106260,0.76947875,0.77049577,0.77243524,0.75214045,0.73461037,0.74064656,0.74574970,0.69582016,0.65141228,0.62320459,0.59158566,0.57369098,0.55486809,0.54741469,0.53948517,0.57023645,0.59923469,0.62464818,0.65087907,0.70095330,0.75538189,0.81738770,0.89120849,0.77888155,0.66447703,0.57419602,0.48214185,0.41882432,0.35001594,0.27554465,0.19946937,0.29042692,0.37670053,0.45969630,0.54566642,0.57568550,0.60142742,0.65010540,0.70093282,0.61734278,0.54180232,0.45692023,0.37178695,0.33257059,0.28690777,0.24670221,0.20713156,0.22600346,0.25241081,0.26530492,0.27474376,0.30896470,0.33645532,0.37995164,0.42262194,0.39926123,0.37424419,0.34048971,0.30802632,0.29419854,0.27830985,0.28414376,0.28850666,0.34531431,0.39831690,0.47503670,0.55080042,0.61215295,0.67737494,0.74374886,0.80667030,0.74093281,0.68475687,0.59864384,0.51675170,0.47775374,0.42938079,0.38146836,0.32992362,0.40062076,0.47002061,0.51338701,0.56078361,0.59927307,0.63977485,0.69171394,0.74377968,0.70214095,0.66672311,0.63866430,0.60310806,0.57676549,0.55740504,0.52240324,0.48340380,0.46214337,0.43842711,0.42052774,0.40302012,0.40567610,0.40163498,0.39857709,0.39264939,0.43540688,0.47964629,0.52037973,0.56176207,0.58955263,0.61894033,0.65993228,0.69837447,0.67187336,0.64701294,0.61922754,0.59224809,0.54780250,0.51091230,0.48359724,0.46119490,0.47310815,0.48721836,0.52472752,0.56193260,0.56724415,0.57087706,0.61172875,0.64655102,0.63141527,0.62044669,0.60637615,0.59039305,0.55786732,0.52139407,0.49120194,0.45855641,0.48882892,0.51947391,0.52838932,0.53916805,0.52687631,0.51432482,0.49726836,0.47773565,0.52956863,0.57471863,0.61154706,0.64430785,0.66255417,0.68832397,0.69447496,0.69489796,0.67556428,0.65252440,0.63720067,0.62477268,0.59790820,0.56733561,0.53909302,0.51434099,0.49301966,0.46813457,0.44431658,0.42384592,0.41908325,0.40826767,0.39145907,0.37765897,0.40193178,0.42882637,0.44498530,0.46221499,0.43655721,0.41459271,0.42022754,0.42646466,0.42449168,0.43337615,0.43598698,0.43859048,0.39296002,0.34439996,0.31751192,0.28102255,0.30230045,0.32196342,0.33423366,0.35006255,0.39301816,0.43324091,0.48388682,0.53358147,0.49713112,0.46469328,0.45822808,0.45106969,0.41826166,0.39019886,0.36591389,0.33604149,0.33767967,0.33973765,0.33296244,0.32095716,0.30510978,0.28707939,0.27702083,0.26061546,0.29226546,0.31890278,0.36001761,0.40324562,0.41229142,0.41939273,0.42080621,0.42866266,0.40346264,0.37348574,0.36277844,0.35113981,0.37950189,0.40229128,0.43567831,0.46704279,0.44682743,0.42338079,0.42379618,0.42065560,0.39802920,0.37734225,0.35605172,0.33947899,0.37897383,0.42666575,0.48058956,0.53501883,0.58027757,0.62897939,0.67875665,0.73132311,0.67586609,0.62374305,0.57633724,0.52584645,0.46511686,0.41184334,0.34981029,0.28881429,0.34279364,0.39954020,0.45947054,0.51721332,0.58603451,0.64947710,0.72680248,0.80036028,0.79328928,0.78485554,0.79090095,0.80239725,0.78605303,0.77282785,0.77476341,0.77868846,0.73026265,0.68286199,0.64640351,0.60766710,0.59305769,0.57397450,0.57511901,0.56950132,0.59300558,0.62130318,0.63148593,0.64098267,0.70549449,0.76622126,0.82534387,0.88760651,0.78171875,0.68338755,0.58849881,0.49873557,0.43140088,0.36632028,0.29532045,0.22212500,0.29934966,0.38169562,0.46224563,0.54012777,0.57816165,0.61433207,0.67251168,0.73045328,0.64634497,0.56231212,0.47934384,0.39578024,0.34296075,0.28548289,0.23136601,0.17749791,0.20544210,0.23316997,0.25956307,0.28357394,0.31694020,0.34619715,0.39243832,0.43123779,0.41085631,0.38321515,0.34925045,0.31678039,0.30058377,0.29040374,0.28372959,0.27624447,0.33043723,0.38770879,0.45513795,0.52493340,0.58844837,0.64966089,0.71837238,0.78373687,0.72458478,0.66919458,0.60830378,0.54505851,0.50055489,0.45438965,0.39793804,0.34790709,0.41109739,0.47625630,0.52973148,0.58398448,0.63441761,0.68945952,0.74245204,0.78957378,0.74529235,0.69929723,0.65569597,0.61296592,0.57852936,0.54783747,0.51102533,0.47737427,0.45335326,0.43213708,0.41154028,0.39617515,0.37913342,0.36863671,0.35237246,0.33366104,0.37453325,0.42209028,0.46011265,0.49263699,0.52484756,0.55603341,0.58776755,0.61478620,0.59150379,0.56260400,0.53788182,0.51489112,0.48286836,0.45063137,0.42795509,0.40606777,0.42543168,0.45205235,0.47111139,0.49634780,0.51037675,0.52376199,0.54998882,0.58048498,0.56488081,0.55103522,0.54315850,0.53535697,0.51959772,0.50636156,0.49192486,0.47727292,0.49565262,0.51950135,0.53017138,0.53812377,0.52681926,0.51189456,0.50295333,0.48849584,0.53218222,0.57567342,0.60309030,0.63100096,0.64434939,0.66501550,0.67886293,0.69656823,0.68104391,0.65803068,0.64406042,0.62405100,0.59318282,0.56631647,0.54754217,0.52671899,0.50639406,0.48471479,0.45986093,0.43488090,0.44290548,0.44334536,0.44537926,0.44681894,0.45718994,0.46378461,0.46673757,0.46918879,0.43792623,0.41136422,0.39915358,0.38779279,0.37828449,0.37358438,0.37023202,0.37284250,0.33356563,0.29969899,0.26995247,0.23914763,0.26442102,0.28717867,0.31510095,0.33806579,0.38175350,0.42041918,0.46417234,0.49947028,0.48604735,0.46924967,0.46316992,0.45251192,0.42640377,0.40023683,0.37941116,0.36047371,0.35432591,0.35677922,0.34209755,0.32810544,0.30184572,0.27698355,0.25550723,0.23322811,0.27310328,0.31484346,0.35761462,0.39471676,0.40911521,0.41950245,0.41641156,0.42252552,0.40267108,0.38475424,0.36755731,0.35265716,0.35480094,0.34934343,0.36142239,0.37166278,0.35917090,0.34568679,0.33873352,0.33426230,0.32137309,0.31434639,0.30506159,0.29695387,0.34725686,0.39845747,0.45883067,0.52499289,0.59110556,0.65056130,0.71445011,0.77756025,0.72500327,0.67254582,0.62210177,0.56295916,0.50685371,0.45065760,0.38403151,0.31704286,0.37424815,0.44159756,0.50144641,0.56157847,0.62167023,0.68657346,0.75776605,0.82972203,0.81231821,0.79735393,0.78828063,0.77706174,0.77473002,0.77191549,0.78092345,0.78522982,0.75173217,0.72160180,0.68546087,0.65235568,0.63408116,0.62460513,0.61426174,0.60662097,0.63129416,0.65188613,0.66650660,0.67915241,0.72700494,0.77892610,0.83328235,0.88747744,0.78787136,0.69384528,0.60636720,0.52254503,0.44779040,0.38123211,0.31714770,0.24555756,0.31698878,0.37940789,0.45876851,0.53948113,0.58131948,0.62525275,0.69588892,0.76432449,0.67737295,0.58879763,0.50452071,0.42179604,0.35704806,0.29186395,0.21789543,0.14701389,0.18362494,0.21881560,0.25426526,0.29350519,0.32097470,0.35404522,0.40082033,0.44282715,0.41953791,0.40153836,0.35920146,0.32278824,0.30738545,0.29875915,0.27719898,0.25885271,0.31562749,0.37139292,0.43219601,0.49934967,0.55802842,0.62533550,0.69392179,0.76634764,0.70636454,0.65392356,0.61548620,0.57493083,0.52591614,0.48285532,0.42077668,0.35766060,0.42463915,0.48238612,0.54418067,0.60292449,0.67563021,0.74488501,0.79388954,0.84072954,0.78821201,0.72997657,0.68114756,0.62471385,0.57880003,0.53411378,0.49999333,0.46275769,0.44279102,0.41948051,0.40510715,0.38706958,0.36190842,0.33157832,0.30039096,0.27610894,0.31728924,0.36616062,0.39750348,0.42902644,0.45824852,0.49040240,0.51225153,0.54254587,0.51007701,0.48356661,0.46062255,0.43407909,0.40992594,0.38185340,0.36729398,0.34950300,0.38168786,0.41183756,0.42516971,0.43668780,0.45789276,0.47563552,0.49425646,0.51311080,0.50297682,0.48486632,0.48551376,0.47766725,0.48342139,0.48780996,0.48904794,0.48493384,0.50724166,0.52233391,0.53435246,0.54366476,0.52711090,0.51021819,0.50647890,0.49847381,0.53334631,0.57187518,0.59108896,0.61173284,0.63086673,0.64408349,0.67464277,0.70019066,0.68065214,0.66972482,0.64458168,0.62653166,0.59400659,0.56629265,0.55086233,0.53770696,0.51533501,0.49988232,0.47414381,0.44796112,0.46528241,0.47995924,0.49635810,0.51921913,0.50811632,0.50705885,0.49031873,0.47419027,0.43761398,0.40349533,0.37388365,0.34552941,0.33262863,0.31171795,0.31444044,0.31602760,0.28110133,0.25148119,0.22453597,0.19945523,0.22912899,0.25067424,0.29045379,0.32278886,0.36594470,0.40768474,0.43991938,0.47393784,0.47285561,0.47794461,0.46925231,0.46329095,0.43536736,0.41288063,0.39674759,0.37847370,0.37617522,0.37021059,0.35555979,0.33573984,0.30052219,0.26448320,0.23725280,0.20410230,0.26248454,0.31755802,0.35270095,0.39183481,0.40345142,0.42195905,0.41782909,0.41207667,0.39964083,0.38700729,0.37306132,0.35537366,0.33030750,0.29797992,0.28851574,0.28164243,0.27226766,0.26424260,0.26109690,0.25062112,0.24974103,0.24849512,0.24797419,0.25610195,0.30799267,0.36542852,0.44389227,0.51919874,0.60182081,0.67795591,0.75305287,0.82552784,0.78055840,0.73115551,0.66508651,0.60537166,0.54775751,0.49359956,0.41643788,0.33556486,0.40711855,0.47953811,0.54096284,0.59787076,0.66448615,0.72361320,0.79372257,0.86040082,0.83392370,0.80950056,0.78480115,0.75568339,0.76238485,0.76895709,0.78466781,0.79211615,0.77747167,0.76441146,0.72917934,0.69434954,0.68233307,0.66707848,0.65322780,0.64503651,0.66582389,0.68818396,0.70018315,0.71506044,0.75306876,0.79214266,0.84034744,0.88924565,0.78650824,0.68816688,0.59799425,0.50943248,0.45450317,0.39042839,0.32943400,0.27039262,0.33945574,0.40597961,0.47204199,0.54238225,0.59041005,0.64596498,0.71216496,0.78508379,0.69672169,0.60590675,0.52516242,0.43961041,0.36064265,0.28298962,0.19984306,0.10889871,0.15445392,0.19992315,0.24098130,0.28164312,0.32562929,0.36204770,0.41185982,0.46290392,0.43093935,0.39961159,0.35553780,0.31107717,0.30015375,0.28857188,0.27506531,0.25859893,0.31279093,0.36688781,0.41642886,0.46461115,0.53072961,0.59206461,0.66136359,0.73747491,0.69664739,0.66149080,0.62875127,0.60085725,0.55110446,0.49496561,0.43461158,0.37143204,0.43918561,0.50912312,0.57542436,0.64027119,0.70671471,0.77217777,0.84114319,0.90566560,0.83377426,0.76359370,0.70071608,0.63669882,0.59424278,0.55309346,0.50994328,0.46121204,0.43954867,0.41460222,0.39540373,0.37991383,0.33533644,0.29089425,0.24745928,0.19981825,0.25149217,0.30308104,0.34662962,0.38327839,0.40515191,0.42252482,0.43800674,0.45467186,0.43161866,0.41190943,0.38719194,0.36500625,0.34653480,0.32873208,0.32203691,0.30958925,0.32547646,0.35029049,0.36267637,0.37829044,0.39409794,0.41112193,0.43392634,0.45038780,0.44109540,0.43482599,0.43119976,0.43078575,0.45312462,0.46976653,0.49381636,0.51223603,0.52367784,0.52653179,0.53257184,0.54062194,0.53392423,0.53300625,0.52689026,0.52513381,0.54902129,0.57366732,0.58463834,0.59915942,0.61268907,0.63292853,0.66284671,0.68752092,0.67276484,0.65793561,0.63848244,0.61319307,0.59158890,0.57138786,0.56186192,0.55040833,0.53270323,0.51506965,0.48990814,0.46989656,0.48837930,0.51812333,0.54652219,0.57285387,0.55322410,0.53933496,0.51504357,0.49078127,0.44978882,0.40171699,0.35474315,0.31184353,0.29086532,0.26972346,0.26038269,0.24862665,0.22674488,0.20541812,0.17274044,0.14416544,0.18804722,0.23845550,0.28250922,0.32651568,0.36161430,0.39920873,0.43076036,0.46042187,0.45528026,0.45413996,0.46028879,0.45733921,0.44678989,0.43324554,0.41390973,0.40016439,0.38537049,0.37762935,0.36288018,0.34519080,0.30823436,0.27487625,0.23082273,0.18382813,0.24191113,0.29169893,0.34908252,0.39961765,0.40737502,0.41883512,0.41775571,0.41380968,0.39723931,0.38010218,0.37286316,0.35845310,0.31029278,0.26083055,0.21569754,0.17372675,0.18274045,0.18582255,0.18816384,0.18700875,0.18565994,0.18875585,0.19044703,0.19786008,0.27513668,0.35624114,0.44502624,0.53188536,0.62059001,0.72060613,0.80960337,0.90339700,0.84077694,0.78233511,0.70943713,0.64300461,0.58057010,0.52438178,0.44798304,0.37768033,0.45051000,0.52394865,0.58655113,0.65151046,0.70893457,0.77579251,0.83891299,0.90324413,0.86679271,0.83258011,0.79205040,0.74411103,0.76154694,0.78349275,0.80171686,0.81841295,0.79811510,0.78132516,0.76006328,0.74408253,0.72518871,0.70777276,0.69110956,0.67454491,0.69668323,0.71296839,0.72589412,0.74337002,0.77709925,0.81298103,0.84811661,0.89628353,0.79164653,0.68190946,0.59218375,0.50243650,0.45264297,0.39848636,0.35062895,0.29526480,0.36757695,0.43569784,0.48680038,0.54432147,0.60112000,0.65579252,0.73106720,0.81141089,0.71788876,0.62473758,0.54208411,0.46009185,0.37369152,0.28292911,0.17549257,0.07287034,0.12873834,0.18158204,0.22701880,0.27535563,0.32450210,0.36392491,0.42595447,0.47929389,0.44588604,0.40850056,0.35467923,0.29526579,0.28758167,0.27488789,0.26210748,0.25153105,0.30663009,0.36891907,0.39704939,0.42835831,0.49757423,0.56101401,0.63554387,0.70652106,0.68520038,0.66854951,0.64693646,0.62755242,0.56759233,0.51530441,0.44630471,0.38429625,0.45771555,0.53551854,0.60514554,0.67430045,0.73629386,0.80336994,0.88872209,0.97497215,0.87957281,0.79045933,0.71853334,0.64617705,0.60806471,0.56372269,0.51105690,0.46281635,0.43541143,0.40829474,0.38904513,0.36948577,0.31066801,0.24897572,0.18532981,0.12490241,0.18707648,0.25080769,0.29120678,0.33873418,0.34559288,0.36176144,0.36445970,0.36493508,0.35253719,0.34049780,0.31613590,0.28795350,0.28304626,0.27476147,0.26943750,0.26277508,0.27643622,0.28379118,0.30194983,0.31948375,0.33868936,0.34806149,0.37394560,0.39069923,0.38844374,0.37971950,0.38055181,0.37778112,0.41927373,0.45102881,0.49401792,0.53932246,0.53430057,0.53321497,0.53516226,0.53533075,0.54067085,0.55167956,0.54878285,0.54324528,0.55796017,0.57950842,0.58090581,0.58689314,0.60173813,0.61520319,0.65040740,0.68060219,0.66163252,0.64772310,0.62790880,0.60734140,0.58786089,0.56914334,0.56665182,0.56207623,0.54813785,0.53020870,0.50809476,0.47988490,0.51331856,0.54764654,0.59123046,0.62944607,0.60225686,0.57095008,0.54063150,0.51275086,0.45765120,0.40631214,0.33713965,0.27073765,0.25310195,0.22843775,0.20470849,0.17572673,0.16477301,0.16053727,0.12410476,0.08572499,0.15390294,0.21869222,0.27139006,0.32749860,0.36335283,0.39743787,0.42035180,0.43993190,0.43934520,0.43291122,0.44410676,0.45726326,0.45288489,0.45280723,0.43813723,0.42087762,0.40176101,0.38142321,0.36481803,0.35364941,0.31548193,0.27941062,0.22146903,0.16407141,0.21786123,0.26687821,0.34129588,0.40954081,0.41024894,0.41949192,0.41519160,0.41753721,0.39409693,0.37390805,0.37020182,0.36680073,0.29268797,0.21527104,0.14319849,0.06841398,0.08615670,0.10425930,0.11180335,0.11593443,0.12507028,0.12381274,0.12949177,0.13620379,0.23835563,0.33994261,0.43657281,0.53747775,0.64821716,0.75728368,0.86766555,0.98751955,0.90543468,0.83147965,0.75487950,0.67715588,0.61456400,0.55932188,0.48863210,0.41435246,0.49163673,0.56386725,0.63290314,0.70052880,0.76085163,0.82460764,0.88914590,0.95342539,0.90092846,0.85894682,0.79434850,0.72842895,0.75915945,0.78894060,0.81674787,0.84873521,0.82164971,0.79933900,0.79962006,0.79727844,0.77030873,0.74406760,0.72603612,0.71210092,0.73163753,0.74914604,0.75847574,0.77043704,0.80078361,0.83389661,0.86241766,0.80984662,0.72364107,0.63797652,0.56375098,0.48818281,0.43832073,0.38382808,0.33432399,0.28131398,0.36051041,0.43334396,0.49529991,0.54935584,0.60312759,0.65658344,0.71698564,0.77891375,0.69325561,0.61525165,0.54317794,0.47285359,0.39177958,0.31140295,0.22488710,0.14306690,0.19107651,0.23183785,0.26903285,0.30105202,0.33454696,0.37512186,0.41867998,0.45741030,0.43386001,0.41107975,0.38697855,0.36279649,0.35344323,0.34734218,0.34086966,0.33451063,0.37617603,0.41969218,0.44242800,0.47017484,0.52200855,0.57505525,0.62049648,0.66690308,0.64081987,0.61201143,0.58668612,0.55951971,0.51281254,0.46129400,0.40745597,0.35088375,0.41238726,0.47486873,0.53343259,0.59390069,0.64304221,0.69390035,0.76361785,0.83049816,0.77686931,0.72553866,0.68096373,0.64146423,0.60992634,0.57954828,0.54966613,0.51752584,0.49177161,0.45771975,0.43452352,0.40550621,0.36219980,0.32426231,0.27216325,0.22144163,0.25366456,0.28085515,0.30681106,0.33328736,0.33076309,0.33381425,0.32534022,0.32060622,0.31637716,0.31329366,0.29396665,0.27678135,0.27434947,0.27648739,0.27152832,0.26796172,0.28402922,0.29656529,0.32617664,0.35120422,0.35876386,0.35880059,0.38146322,0.39548651,0.40395177,0.41071113,0.41548822,0.42796079,0.46024766,0.49050951,0.52607647,0.56342953,0.56745864,0.56892707,0.56851820,0.56971255,0.57088791,0.56658164,0.57180179,0.57626689,0.57905994,0.57708377,0.57080143,0.56103610,0.58224411,0.60277061,0.62035597,0.63836590,0.63370046,0.62964916,0.63088617,0.62897700,0.61392983,0.60239006,0.59126931,0.58602102,0.57541762,0.55788713,0.54384715,0.53491330,0.55003229,0.56314422,0.59026066,0.61354526,0.57972549,0.53906210,0.50759810,0.47927141,0.42966703,0.38491280,0.32570285,0.26724722,0.25372423,0.23608516,0.20539934,0.17905347,0.16864861,0.15949141,0.12955816,0.09877375,0.15542683,0.21475990,0.26113819,0.31288012,0.34907515,0.38531858,0.41339984,0.43885294,0.43099307,0.42380967,0.43035302,0.42673215,0.42835503,0.42330728,0.40884819,0.40323697,0.37773546,0.35276739,0.33272079,0.31267825,0.28050140,0.24918730,0.21977877,0.18758733,0.23275178,0.27808920,0.32872285,0.38271420,0.40205054,0.42231295,0.43382311,0.44635650,0.42447007,0.39498220,0.38524792,0.38107963,0.30831900,0.24083728,0.16912129,0.09831913,0.12186472,0.14205185,0.15863194,0.17350642,0.18238529,0.19561718,0.20988918,0.22678794,0.30124502,0.37858089,0.46141139,0.54776838,0.62477105,0.69809916,0.78529684,0.86617533,0.81008925,0.75673102,0.69375479,0.63165377,0.59802059,0.56407879,0.51854143,0.47226777,0.53015600,0.58709327,0.64794416,0.71489855,0.76408961,0.81024855,0.87159229,0.93595347,0.89990950,0.86517201,0.81290201,0.76395821,0.77395017,0.78027935,0.79849054,0.82134927,0.79637646,0.77924936,0.77006798,0.76686125,0.75005352,0.72814455,0.71211508,0.69602973,0.70012123,0.70543572,0.71548727,0.71867746,0.74838490,0.77193290,0.78917238,0.71740182,0.65379057,0.59239586,0.53307060,0.47481760,0.42076752,0.36743127,0.31839150,0.26433295,0.34798557,0.43646846,0.49647022,0.55797958,0.60861789,0.65471199,0.70115696,0.74487391,0.67518978,0.60285611,0.54289131,0.48261533,0.41243794,0.33605040,0.27171791,0.20909977,0.24960746,0.28868521,0.30272221,0.31768064,0.34934320,0.38412420,0.41202399,0.43348353,0.42608724,0.41795833,0.41828797,0.42382719,0.41617013,0.41164520,0.41250720,0.41370083,0.44193879,0.47651420,0.49636487,0.50942093,0.55141401,0.59186799,0.60806583,0.62411355,0.58943509,0.55789023,0.53004100,0.49810478,0.44984038,0.40905327,0.36597626,0.32182791,0.37176473,0.42108701,0.46481208,0.51352688,0.54851512,0.58620243,0.64128062,0.69684573,0.67668989,0.65421471,0.64970234,0.63543383,0.62026215,0.60154803,0.58508725,0.57191885,0.54018580,0.51254258,0.48112376,0.44597449,0.42108383,0.39679032,0.35740100,0.31928038,0.31949811,0.31604270,0.32429647,0.32628569,0.31608877,0.30718605,0.29165039,0.27987539,0.28102002,0.28881633,0.27780231,0.26558627,0.26712935,0.27553957,0.27223166,0.26945659,0.29282415,0.30714333,0.34564344,0.38373701,0.37920728,0.36824508,0.38435325,0.40413989,0.41796595,0.43767742,0.45086614,0.47013213,0.49567372,0.52354806,0.55943724,0.58918625,0.60031855,0.60912532,0.61094499,0.61087213,0.59712179,0.58353260,0.59492697,0.60781226,0.59096928,0.58295688,0.56048788,0.53719128,0.56963379,0.59651967,0.59446885,0.59255287,0.60259745,0.61176479,0.62962475,0.65141377,0.64126857,0.62883769,0.62247701,0.61225745,0.60159376,0.58471469,0.58549617,0.58260463,0.57972548,0.57454404,0.59016289,0.60526761,0.56040136,0.51032266,0.47903747,0.44305676,0.40954955,0.36976833,0.31650272,0.26587214,0.25334989,0.23944105,0.20937193,0.18160014,0.17294759,0.16694522,0.13747603,0.10439507,0.15668631,0.20988750,0.25006892,0.29418968,0.33987186,0.38333738,0.41020442,0.43535855,0.42400857,0.41659568,0.40964837,0.40000471,0.39673236,0.39446210,0.38372623,0.38023550,0.35164894,0.32603496,0.30052780,0.28144102,0.25082005,0.21676698,0.21613888,0.21250417,0.24678808,0.28634359,0.32133621,0.35880646,0.39437002,0.43511613,0.45720268,0.47932295,0.44864136,0.41531206,0.40399426,0.39571149,0.32935920,0.26658038,0.19480385,0.12178213,0.15407639,0.17983618,0.20654211,0.22744260,0.24692112,0.26794781,0.29505059,0.31770220,0.36878774,0.41804688,0.48566247,0.55622600,0.59721263,0.64204942,0.70111908,0.75144650,0.71241488,0.67736002,0.63731667,0.59171839,0.58477061,0.57289856,0.55162519,0.53145361,0.57393664,0.61462221,0.66831261,0.72854006,0.75930111,0.79418568,0.85975653,0.92479149,0.89569018,0.87193825,0.83528967,0.80196723,0.79079627,0.77241522,0.78533145,0.79700344,0.77587438,0.75225465,0.74841358,0.74148079,0.72839404,0.71536548,0.69715976,0.67759272,0.67349148,0.66577452,0.66730986,0.67131562,0.69336940,0.71386118,0.71784871,0.64823210,0.59881858,0.55997266,0.49943817,0.44569021,0.40150561,0.36172577,0.31511465,0.26052711,0.34598861,0.42347219,0.49657276,0.57152146,0.61308959,0.64712549,0.67973100,0.71490872,0.66085373,0.60552434,0.54333882,0.48497772,0.43872275,0.38570242,0.33210989,0.27943177,0.30197641,0.32888090,0.33706443,0.35230615,0.36812761,0.38817447,0.39925925,0.41619306,0.42716466,0.44067657,0.45663755,0.47207705,0.47038981,0.47041349,0.47674210,0.48936514,0.50881640,0.53485241,0.54692534,0.56348392,0.57848108,0.58869333,0.58742360,0.59026494,0.55551911,0.52076988,0.47437791,0.42576809,0.38987553,0.35329138,0.31594457,0.27532254,0.30918663,0.34693544,0.38419007,0.41761227,0.44560195,0.47762979,0.51420744,0.54895658,0.57529986,0.59534405,0.61994840,0.64416363,0.63839661,0.63184402,0.62546459,0.61982610,0.59068204,0.56495378,0.52924907,0.48795656,0.46647563,0.45012257,0.42843019,0.40543615,0.38300375,0.36556560,0.34507954,0.31875968,0.29918032,0.27430762,0.25270168,0.22356659,0.23380990,0.24167284,0.24184539,0.24232488,0.25617578,0.26045977,0.26665333,0.27133034,0.30823116,0.33553912,0.37746436,0.41349789,0.40227805,0.39762060,0.39300284,0.38632234,0.41933031,0.45008447,0.47512500,0.50271330,0.53139428,0.55877156,0.58421959,0.61525931,0.61969029,0.62153829,0.63177529,0.64146998,0.62832150,0.61545510,0.61900459,0.62010908,0.59774472,0.57964102,0.55280959,0.52019423,0.54289416,0.56160122,0.56026757,0.56922904,0.58890673,0.60332382,0.63783868,0.66995432,0.66383009,0.65429427,0.64852350,0.64280449,0.63373928,0.62377878,0.62550861,0.63079283,0.61562460,0.59891793,0.58665503,0.57549501,0.53264632,0.49479348,0.46019844,0.43273296,0.39162821,0.35437877,0.31350289,0.27404020,0.25166840,0.22621476,0.19455221,0.16597883,0.16810790,0.16718971,0.14040788,0.12179874,0.16108754,0.20623344,0.24955104,0.28840989,0.32663438,0.36889717,0.40157517,0.43135813,0.41328225,0.39395820,0.38531228,0.37495005,0.36692504,0.35616695,0.35756824,0.35953227,0.32823743,0.29388788,0.25574563,0.22411188,0.21688282,0.21823667,0.22021190,0.22467414,0.25626451,0.28353795,0.31231741,0.34550378,0.38805423,0.43346143,0.47386215,0.50535407,0.47634205,0.44973349,0.42738105,0.40750495,0.34266043,0.27515805,0.20955078,0.14605255,0.18462497,0.22000962,0.25072398,0.27426248,0.30515822,0.32953900,0.36022889,0.39016069,0.42334520,0.45968775,0.50035117,0.54895463,0.57114961,0.59226019,0.62027753,0.64976241,0.62785740,0.60630507,0.57894124,0.55150575,0.56488608,0.58028166,0.58807044,0.59459208,0.62618440,0.65290001,0.69513745,0.73449532,0.76834973,0.79940119,0.85943215,0.90999137,0.89357526,0.87447183,0.85376783,0.83809591,0.80566741,0.77996429,0.76718726,0.75366382,0.74658049,0.73395675,0.72087409,0.71061212,0.70090025,0.69341124,0.67339073,0.66167078,0.64708385,0.62898531,0.61944458,0.61192494,0.62781520,0.64141429,0.64193252,0.56739037,0.54766954,0.52273231,0.46807475,0.41547941,0.38741641,0.36111932,0.30884459,0.26000431,0.33643896,0.41005277,0.50017887,0.58897217,0.61281659,0.64662300,0.66533690,0.68145040,0.64920603,0.61081341,0.55076053,0.48733971,0.46016157,0.43724976,0.38900634,0.34803815,0.36329861,0.37815006,0.37559009,0.37842190,0.38358601,0.39636108,0.39535934,0.39510377,0.42550627,0.45893615,0.49056518,0.52643741,0.52939759,0.52814198,0.54471186,0.56127739,0.57659786,0.59393827,0.60053001,0.61268239,0.60266795,0.59533001,0.57300294,0.55070463,0.51624309,0.48528867,0.41577563,0.34931430,0.32657386,0.30544130,0.26406989,0.22656116,0.25149359,0.27305345,0.29997864,0.31944806,0.34482672,0.36867161,0.38640995,0.39851958,0.46781225,0.53737666,0.59773946,0.65673773,0.65806000,0.66649122,0.66771896,0.66897394,0.64321244,0.61931772,0.57538419,0.52825270,0.51684175,0.49880800,0.49805650,0.48938425,0.45038196,0.41848654,0.35977209,0.30632879,0.27615762,0.24489796,0.21120649,0.16662186,0.18093377,0.18908338,0.20788887,0.22358387,0.23611382,0.24960193,0.26378699,0.27988022,0.32416191,0.36541741,0.40091288,0.44735065,0.43641282,0.42525993,0.39867177,0.36565038,0.41570535,0.45831294,0.49409109,0.53411858,0.56530048,0.59744613,0.61631495,0.63715622,0.64087166,0.63589329,0.65722276,0.67445845,0.65782215,0.64335142,0.64075127,0.63571444,0.60824250,0.57894217,0.54048424,0.50320212,0.51570995,0.52452136,0.53128730,0.54067874,0.56420677,0.59320605,0.64288882,0.68935509,0.68754542,0.68801245,0.67981918,0.67600844,0.66949803,0.65825625,0.67172972,0.68237584,0.64745486,0.62108442,0.58457077,0.54104816,0.50900699,0.47102390,0.44190583,0.41454880,0.37789034,0.34174111,0.30924552,0.28127005,0.24930164,0.22111745,0.18779373,0.14694095,0.15502850,0.16734188,0.15215910,0.13063368,0.16881103,0.19594208,0.23831346,0.28112284,0.31925529,0.35977833,0.39002058,0.42525378,0.39875413,0.37255132,0.36510648,0.35239200,0.33956531,0.32095289,0.32829456,0.33523109,0.29822520,0.26365510,0.21711036,0.16357728,0.18880632,0.21639913,0.22704779,0.24145489,0.26106593,0.28072059,0.30590182,0.32725732,0.37986871,0.43852268,0.48723330,0.53827146,0.50960335,0.48209761,0.44808824,0.42345476,0.35774674,0.28981943,0.22898104,0.16139588,0.21223766,0.26754956,0.29263218,0.32451608,0.35848129,0.38835900,0.42573511,0.46064567,0.47859647,0.49136660,0.52152410,0.54725208,0.54324045,0.54491120,0.54450862,0.54705675,0.54160277,0.52955752,0.51522424,0.50297643,0.54966514,0.59249520,0.62370630,0.66236351,0.67474174,0.68727675,0.71664114,0.74292351,0.77685356,0.80612294,0.85701764,0.90589206,0.89245827,0.87653385,0.87642796,0.87808629,0.82929751,0.77983133,0.75238673,0.71726230,0.71626528,0.71371993,0.69473599,0.67484136,0.67072970,0.67437447,0.65856817,0.64219303,0.61788491,0.59131646,0.57019313,0.55016677,0.56512475,0.57250840,0.57187542,0.55389367,0.52613862,0.50218659,0.46313336,0.41748368,0.37585331,0.32905314,0.27657149,0.21960637,0.29916568,0.38385219,0.46842989,0.55071362,0.59976976,0.64621131,0.69053916,0.72760066,0.68105671,0.63563983,0.57666362,0.51603869,0.49139974,0.46772225,0.42725765,0.38766777,0.38749716,0.39356173,0.38917749,0.38865523,0.38788079,0.38997954,0.38458021,0.38438868,0.41504692,0.44445105,0.48773888,0.52803136,0.55148407,0.57254150,0.60656788,0.63941748,0.63616420,0.63072207,0.62255901,0.61201461,0.60639498,0.59784027,0.57842393,0.56327630,0.52795944,0.48426460,0.42878328,0.36832554,0.33187440,0.29324465,0.24663045,0.19645576,0.21139891,0.23620504,0.25843587,0.28159266,0.29061318,0.30593353,0.30782986,0.30845077,0.38358256,0.46254639,0.52590154,0.59389832,0.62955878,0.66320771,0.70336789,0.73808788,0.70472180,0.66905109,0.63612426,0.59864240,0.59406701,0.58647858,0.59305253,0.59776472,0.54417457,0.48934371,0.42258430,0.35021643,0.30540713,0.25395059,0.19644572,0.14417326,0.15112379,0.16609803,0.17741544,0.18515986,0.19851922,0.21653308,0.22848616,0.23881146,0.28717424,0.33571763,0.38614179,0.43874145,0.43563915,0.42571648,0.41595470,0.40480617,0.44483715,0.49070089,0.51826122,0.54436756,0.57714061,0.61496009,0.64325612,0.67452510,0.67866988,0.67779858,0.69094195,0.69825410,0.69219795,0.68649997,0.69090629,0.69323514,0.65259112,0.60597758,0.56397887,0.52024826,0.51835763,0.51437756,0.50970885,0.50309780,0.53319346,0.56463520,0.60734982,0.65440867,0.67139784,0.69171941,0.71413080,0.73485066,0.71426231,0.69377763,0.68993543,0.68098059,0.65129112,0.62755670,0.59261721,0.56411883,0.52169397,0.48351334,0.45090453,0.41764444,0.37556226,0.32525898,0.28760942,0.23995088,0.23379416,0.22281985,0.20478915,0.18870604,0.18839769,0.18568656,0.16598589,0.14825810,0.18263373,0.21328064,0.25037338,0.28349441,0.31549769,0.34280517,0.37049336,0.39044265,0.37369393,0.35779056,0.34290075,0.33338510,0.31605373,0.29774269,0.28506384,0.28053765,0.25101950,0.22086019,0.18463563,0.14859208,0.16282855,0.18393570,0.19433735,0.20302476,0.24017602,0.27737851,0.30817156,0.34036173,0.39090101,0.44691216,0.49894003,0.55419885,0.52891737,0.49553914,0.45808944,0.42095407,0.35971653,0.30704629,0.24266124,0.18922789,0.24194013,0.29679698,0.34452314,0.39409189,0.43503270,0.47742906,0.52396724,0.57071418,0.56723079,0.55928452,0.56096065,0.55844485,0.53317499,0.50619534,0.48054897,0.45232930,0.46167307,0.47091274,0.49252334,0.50784747,0.56215010,0.61275943,0.66211067,0.72023990,0.72628394,0.72759380,0.74468333,0.75615658,0.78501931,0.80998359,0.84810784,0.88156464,0.87151944,0.85791669,0.85675711,0.86084618,0.82366341,0.78324176,0.75956139,0.73899412,0.71716084,0.70245493,0.68801031,0.66794126,0.66175402,0.65065186,0.63574611,0.62298170,0.60652609,0.58838191,0.57024261,0.55363763,0.56144480,0.56415700,0.55308821,0.52965790,0.50794470,0.49203760,0.45624349,0.42299882,0.35983064,0.29562937,0.23954712,0.17774759,0.26596784,0.35200598,0.43143773,0.51780472,0.58118931,0.65564518,0.70980323,0.76635685,0.71315629,0.66176135,0.60582518,0.54592703,0.52756396,0.50434978,0.46471477,0.42694150,0.41673975,0.40508779,0.40132173,0.39827917,0.38840454,0.37823775,0.37689770,0.37212450,0.40164937,0.42922509,0.48109237,0.53220415,0.57614692,0.61916482,0.66937998,0.71822712,0.69651675,0.67479824,0.64671848,0.61621395,0.60670788,0.59979827,0.59182991,0.57882361,0.53310573,0.48585429,0.43288809,0.38191654,0.33262634,0.29009846,0.22266464,0.16048047,0.17364569,0.19273512,0.21185496,0.23585170,0.23933213,0.24930930,0.22953322,0.21286844,0.30158525,0.38993601,0.46052694,0.52986208,0.59313521,0.65274233,0.73468204,0.81340731,0.76727735,0.71648249,0.69379562,0.67276809,0.67401561,0.67493251,0.68963484,0.70292044,0.62926686,0.55757736,0.47804944,0.39698447,0.33062448,0.26216584,0.18428219,0.10956153,0.12695535,0.13944705,0.14237129,0.14712260,0.16700868,0.17984947,0.19179849,0.19717766,0.25278082,0.30577117,0.37224958,0.43781215,0.43648452,0.43092128,0.43521739,0.43781819,0.47853626,0.52174574,0.53669132,0.54775075,0.59237228,0.63119740,0.66935875,0.70531945,0.71012108,0.71686109,0.72138680,0.72700365,0.72347650,0.72834644,0.74017343,0.75410629,0.69052801,0.63141109,0.58218445,0.54073382,0.51743563,0.50250146,0.48365137,0.46399869,0.50217544,0.53820242,0.57818239,0.62174478,0.65777011,0.70207309,0.74507820,0.79179733,0.75840322,0.73476493,0.70340725,0.67664835,0.65471179,0.62936672,0.60606081,0.57751207,0.54167132,0.49985423,0.45896258,0.42258960,0.36595297,0.31164365,0.25576691,0.20286094,0.21462772,0.22264362,0.23032695,0.23570810,0.21656284,0.20559349,0.18388840,0.15886335,0.19539852,0.23080715,0.25816625,0.28195240,0.30737234,0.32542740,0.34356213,0.35990355,0.34964597,0.34292690,0.32666988,0.31170346,0.29386701,0.27450865,0.24530503,0.22396864,0.20252197,0.17886265,0.15636988,0.13343347,0.13950375,0.14475746,0.15793103,0.17110142,0.22260748,0.27414360,0.31304816,0.35273314,0.40264508,0.44940500,0.51175477,0.57876001,0.54642605,0.51148749,0.46493164,0.41928403,0.37273067,0.31812967,0.26498502,0.21184837,0.26973136,0.32774951,0.39608844,0.45968491,0.51549605,0.57103075,0.62510923,0.68516871,0.65774641,0.62912080,0.59939430,0.57413103,0.51853895,0.46725971,0.41113048,0.36305185,0.38682461,0.41623884,0.46048744,0.50820829,0.56992131,0.63452610,0.70100652,0.77426233,0.77107101,0.76841792,0.77260105,0.77277571,0.79427882,0.81154888,0.83661347,0.86413379,0.85446688,0.84631263,0.84462929,0.84404236,0.81634735,0.78437544,0.76726080,0.75577555,0.72198637,0.68844466,0.67635870,0.66779085,0.64591828,0.62601831,0.61484887,0.60241618,0.59297497,0.57675814,0.56602153,0.55850494,0.55605976,0.55108257,0.54074085,0.51304541,0.48603298,0.46298482,0.43758014,0.41720814,0.34549747,0.27859224,0.21090576,0.14567316,0.22239202,0.30664694,0.38457303,0.45975975,0.56102969,0.65574489,0.73925148,0.82122941,0.76479852,0.70035878,0.64123609,0.57481976,0.55070808,0.53353196,0.50097748,0.47564282,0.45643161,0.43765194,0.42562776,0.40756890,0.39679056,0.37960786,0.36553304,0.34117881,0.38635401,0.43655150,0.48223007,0.52888231,0.58851024,0.65343878,0.71990890,0.79127055,0.74758400,0.70815285,0.66527588,0.62325142,0.61762213,0.60841586,0.59678748,0.58459434,0.53841925,0.48450870,0.44535102,0.40705709,0.33295220,0.26671919,0.18605466,0.10339460,0.12701847,0.15452748,0.17257373,0.19549938,0.17778237,0.16817613,0.14145322,0.11692415,0.20980491,0.30644833,0.39391402,0.47614460,0.57262919,0.66793959,0.77471348,0.88228084,0.83880358,0.79467149,0.75155556,0.71387651,0.73705900,0.75490763,0.77917821,0.80613039,0.70925794,0.61420364,0.52477406,0.43647502,0.34730142,0.26892111,0.17219997,0.08027250,0.09611428,0.10770984,0.11229794,0.11945192,0.13174186,0.14390457,0.15167345,0.15016323,0.21877893,0.28882209,0.36577157,0.43997928,0.44966032,0.45514386,0.46671592,0.48199527,0.50741506,0.53325473,0.54870283,0.56359285,0.60665737,0.65564549,0.70854612,0.76517284,0.75724212,0.74815062,0.74468626,0.73791822,0.75025341,0.76654859,0.78450152,0.80155019,0.73271153,0.65856167,0.59532705,0.53351709,0.50508652,0.47427727,0.44448317,0.41000336,0.45448577,0.49980326,0.54500361,0.58454470,0.65114348,0.71513912,0.77928356,0.83778035,0.80049284,0.75667059,0.70592539,0.66245132,0.64868315,0.62816560,0.61685361,0.60459143,0.55823923,0.51581066,0.46009612,0.41325909,0.35028351,0.29280191,0.23492429,0.16779512,0.19571597,0.22349528,0.23997231,0.25887441,0.23935158,0.21244638,0.19101089,0.17081644,0.20303811,0.23682550,0.26100427,0.29477965,0.30100277,0.30633223,0.31914137,0.33191440,0.31891119,0.30634431,0.29818572,0.29272393,0.25665607,0.22771799,0.19151264,0.15568431,0.14733430,0.13961891,0.12595001,0.11070131,0.11545415,0.12228450,0.13324943,0.13488675,0.19770039,0.25130484,0.30357399,0.35510033,0.41051424,0.46659940,0.52845680,0.59275179,0.55929689,0.52119093,0.48066921,0.43900933,0.38502476,0.33629749,0.28060227,0.21945289,0.29598924,0.37423682,0.45030632,0.52104204,0.58622938,0.64974270,0.71586186,0.78594758,0.73936696,0.68699402,0.64006479,0.58372740,0.50047412,0.41006388,0.33131483,0.25182217,0.30681903,0.35916426,0.42261343,0.47910482,0.56975932,0.65369896,0.74297420,0.83324932,0.82683444,0.81691470,0.81738328,0.81587095,0.81796923,0.82779897,0.83740660,0.84498738,0.83566086,0.82951968,0.82936392,0.83480958,0.81356094,0.79399163,0.78162060,0.76929228,0.73748437,0.70348309,0.68229082,0.65866920,0.63837319,0.62702444,0.61650153,0.60446123,0.59221070,0.57707981,0.56134008,0.54055371,0.53282279,0.52699138,0.52134471,0.49444660,0.46817155,0.43445345,0.42541113,0.41242515,0.33994948,0.26795989,0.18875873,0.10789552,0.18366956,0.25735856,0.33356667,0.40573313,0.53418493,0.66302845,0.76991008,0.88082701,0.80736321,0.73737058,0.67057748,0.60279034,0.58264360,0.55674228,0.54155548,0.51865151,0.49771550,0.47630662,0.44278221,0.41465708,0.39818422,0.38730869,0.35326759,0.31552306,0.38019729,0.44236677,0.48029745,0.52040609,0.60723103,0.68526718,0.77504537,0.86782215,0.80276343,0.73662270,0.68301033,0.63053058,0.62813248,0.62423367,0.61033854,0.59303877,0.53699247,0.48303075,0.45471575,0.42895785,0.33881924,0.24829060,0.14771206,0.04893381,0.07936456,0.11085183,0.13268670,0.15003287,0.11620475,0.08515531,0.05429859,0.01617411,0.12147036,0.22767738,0.32726887,0.41902513,0.54928038,0.67340309,0.81680117,0.95868772,0.91045434,0.86772249,0.81141102,0.75897295,0.80275273,0.84181315,0.87259834,0.90916742,0.78988225,0.66524453,0.57154800,0.46990556,0.37072839,0.27027854,0.16364899,0.05086907,0.06814675,0.07938566,0.08774480,0.08681817,0.10048973,0.11154299,0.10836460,0.10650841,0.19089141,0.26892914,0.35842457,0.44616802,0.46163896,0.48319885,0.49842406,0.51937657,0.53407952,0.54602505,0.55956079,0.57061429,0.62722041,0.67959507,0.74959304,0.82201297,0.80322144,0.78497825,0.76503839,0.75038451,0.77871360,0.80830896,0.83254071,0.85581731,0.76982324,0.67966330,0.60276586,0.52596689,0.48668594,0.45053304,0.40278922,0.35706419,0.40673796,0.45813982,0.50643172,0.54937726,0.64275679,0.73337541,0.81110799,0.89358073,0.83549853,0.78041025,0.71396348,0.64801138,0.64094527,0.62969975,0.62671283,0.62549398,0.57337740,0.53039386,0.46767772,0.40169778,0.34033805,0.27877774,0.20503384,0.13354761,0.17559362,0.22053285,0.25545858,0.28883305,0.25668159,0.22626890,0.20523107,0.17949533,0.21000777,0.23799658,0.27383774,0.30308273,0.29880387,0.28625574,0.29646991,0.29988431,0.28863727,0.27316155,0.27193782,0.27409927,0.22679772,0.17682908,0.13175444,0.08096443,0.09810321,0.10833746,0.09250664,0.07798067,0.09047329,0.10295776,0.10399071,0.10012112,0.16663625,0.23383737,0.29558630,0.35736040,0.41941913,0.48374203,0.54544916,0.61120077,0.57539971,0.53807101,0.49356836,0.45444696,0.40023929,0.34958885,0.28882098,0.23165699,0.33092140,0.42556697,0.50812061,0.58961431,0.65788696,0.72122301,0.81133967,0.89601459,0.81918045,0.75023580,0.67542456,0.60319463,0.47922754,0.35578108,0.25310812,0.14264185,0.22136832,0.29772285,0.37651769,0.45453455,0.56786365,0.67399367,0.78531254,0.90168855,0.88138466,0.86870000,0.86152826,0.85417362,0.84916162,0.84570992,0.83370745,0.82843952,0.82284046,0.81432304,0.81678508,0.82477453,0.81231059,0.79924145,0.79230088,0.78762244,0.75105017,0.71919802,0.68355185,0.64400392,0.63602946,0.62490162,0.61416747,0.60430426,0.58958391,0.58074099,0.55245526,0.52989740,0.51627342,0.50161020,0.50164372,0.45064017,0.43253976,0.41421873,0.40873410,0.39674663,0.35145256,0.30251625,0.24481897,0.18454813,0.25530474,0.31746257,0.38790062,0.45219747,0.55334593,0.65762880,0.75086708,0.83527937,0.78094990,0.72451955,0.67672287,0.62337513,0.60059177,0.57689310,0.56202594,0.54949152,0.51890453,0.49135101,0.46637208,0.44079133,0.41496149,0.38338241,0.35133131,0.31504266,0.37532416,0.43634535,0.48206775,0.53062523,0.59796614,0.66939608,0.74898438,0.82457390,0.76865154,0.71430386,0.66522218,0.61249130,0.59643341,0.58094952,0.55831674,0.53958959,0.50310190,0.46170320,0.44825025,0.43087763,0.35689960,0.28009341,0.20686127,0.13554639,0.15842085,0.17504002,0.18440917,0.19837506,0.16863777,0.13662931,0.10571595,0.07602885,0.17109389,0.26867595,0.35572141,0.43809124,0.53677591,0.64169323,0.74801870,0.84919355,0.82363763,0.79937314,0.76280751,0.72763587,0.75564911,0.77940950,0.80623757,0.83181832,0.73703406,0.64826039,0.56250554,0.47673670,0.38434390,0.29704982,0.20724735,0.11732261,0.10921955,0.11106322,0.11394507,0.11511396,0.12129847,0.12175063,0.11903595,0.11344135,0.18506617,0.26384979,0.34381258,0.42620741,0.45577855,0.48215939,0.51039829,0.53534908,0.55695386,0.56990604,0.58476651,0.59291729,0.63701763,0.67659399,0.73198450,0.78572462,0.77368431,0.76453372,0.74709814,0.73275938,0.74845608,0.76278171,0.76790930,0.78352609,0.70909221,0.63931545,0.56501603,0.48543695,0.45074296,0.41452044,0.36965380,0.33123407,0.37853511,0.42629210,0.48313800,0.53645430,0.62083337,0.70659781,0.78440185,0.86866467,0.81039834,0.75221499,0.68702775,0.61814211,0.60990581,0.60237268,0.58846980,0.57057051,0.52832031,0.48399093,0.43462134,0.38977831,0.34226226,0.30394658,0.26307876,0.22114852,0.24595890,0.27021086,0.29302810,0.31790605,0.30735916,0.29501016,0.28030187,0.27466461,0.29523743,0.31611376,0.34706905,0.37426929,0.37516408,0.37296568,0.38405189,0.39064566,0.37695869,0.36004032,0.35544782,0.34806685,0.31188783,0.26559789,0.23361533,0.19586358,0.19273547,0.19314757,0.19306878,0.18603245,0.18124644,0.17370900,0.17406744,0.17260629,0.22370979,0.27579376,0.32984227,0.39286962,0.43327792,0.46863574,0.51947268,0.56341851,0.53329690,0.50698060,0.46624106,0.43366368,0.38777296,0.34020807,0.28814937,0.23577367,0.32384261,0.40928978,0.48069358,0.55160252,0.61333891,0.67353745,0.73923510,0.80691082,0.74300950,0.68251927,0.60727621,0.53991245,0.44808148,0.34918252,0.26862265,0.19135523,0.25512011,0.31475894,0.38649374,0.45394144,0.54261983,0.63076909,0.72773448,0.82335638,0.81963878,0.80841655,0.79892160,0.79244250,0.78854645,0.78199198,0.77924300,0.77684748,0.76296726,0.74761094,0.74118173,0.73054718,0.71841595,0.70861104,0.70533507,0.69691749,0.68281287,0.66832695,0.65681143,0.63679735,0.62442604,0.61438751,0.60637377,0.60593155,0.57566710,0.54537043,0.51374720,0.48671870,0.47168973,0.46168389,0.45406535,0.40631351,0.40207265,0.39854556,0.39023701,0.38379912,0.36081682,0.34294848,0.30193141,0.26201944,0.31868158,0.37712442,0.43587522,0.50154232,0.57943118,0.65860986,0.72943572,0.79678012,0.75984316,0.71602968,0.68176237,0.64317842,0.62213999,0.59318358,0.58685436,0.58352442,0.54049983,0.50219969,0.48130670,0.46389370,0.42528333,0.38839199,0.35173714,0.31638934,0.37612461,0.44077443,0.48369967,0.53372928,0.59275449,0.65272125,0.71384147,0.77693544,0.73622756,0.69085110,0.63802921,0.58747597,0.56253339,0.54017708,0.51483034,0.48936568,0.46436457,0.43682364,0.44138030,0.43703065,0.37261427,0.31111775,0.26605945,0.21604430,0.23120329,0.24449379,0.24165626,0.24353069,0.21970921,0.19141657,0.16568558,0.14060366,0.22151568,0.30468195,0.38244550,0.45557560,0.53019470,0.60630799,0.67190769,0.74358735,0.73964904,0.73620901,0.71107370,0.68578693,0.70341051,0.71946216,0.73782124,0.75094704,0.68716189,0.62377545,0.55362738,0.48713885,0.40269393,0.31712906,0.24547495,0.18127681,0.15684349,0.13281545,0.13466310,0.13967810,0.13879596,0.13726217,0.12630150,0.11816373,0.18497016,0.25324841,0.33662091,0.41688824,0.44980187,0.49111094,0.52597777,0.55888854,0.57782183,0.59667798,0.60504588,0.61656931,0.64905167,0.67238789,0.71347097,0.75599533,0.75072088,0.74803278,0.72981970,0.72147956,0.71842766,0.71635275,0.71267977,0.70856473,0.65245214,0.59553014,0.52065599,0.44590413,0.41389156,0.37642316,0.33804199,0.30088754,0.34711055,0.39681536,0.46395024,0.52884048,0.60822220,0.68553081,0.75990621,0.83923243,0.78720398,0.73311705,0.65683569,0.58070272,0.57796685,0.57638654,0.54567934,0.51387974,0.47674641,0.43886565,0.40811543,0.37076741,0.35158916,0.32417471,0.31844664,0.31345425,0.31640230,0.31889323,0.33815901,0.35474291,0.35879662,0.35982904,0.35690601,0.36351545,0.38256942,0.39902981,0.41860355,0.44117105,0.45204752,0.46508629,0.46744109,0.47821458,0.45755547,0.44113303,0.43319811,0.42868575,0.39517307,0.35542458,0.33023061,0.30727175,0.29327536,0.28291636,0.29203302,0.29862110,0.27184878,0.24867639,0.24585944,0.23917542,0.27583895,0.31296777,0.36931591,0.42279364,0.44235905,0.45539963,0.48934860,0.51940372,0.49907794,0.46966870,0.44070814,0.40477397,0.37051254,0.33192337,0.28754355,0.23923824,0.31553422,0.39122867,0.45078014,0.51832984,0.56976396,0.62912787,0.67094386,0.71139850,0.66134499,0.61621800,0.54648138,0.47779071,0.41015615,0.34051142,0.28813552,0.23616453,0.28267007,0.33223238,0.39136416,0.45190664,0.51589204,0.58393323,0.66935983,0.75270927,0.75304519,0.75441246,0.74367462,0.73073678,0.72934202,0.71668249,0.72088082,0.72721326,0.69929907,0.68186808,0.65488704,0.63538393,0.62943111,0.62239574,0.61807997,0.60800730,0.61750693,0.62043510,0.62953132,0.63604996,0.62024730,0.60340391,0.60463538,0.60303778,0.55885422,0.51075769,0.47756630,0.44169558,0.43129543,0.41336308,0.41190310,0.33936686,0.34877926,0.35536093,0.36934012,0.37916167,0.37942134,0.37685225,0.35692428,0.33652287,0.38242205,0.42644119,0.47331429,0.52571740,0.58235539,0.64169296,0.70232543,0.76184241,0.73788436,0.71541971,0.68364713,0.65940550,0.63522533,0.61128076,0.60214907,0.59178496,0.55816070,0.53217501,0.50148281,0.47002460,0.42907980,0.38357081,0.34245046,0.29803437,0.36220777,0.42106698,0.48443401,0.54474577,0.59699090,0.64675559,0.70360805,0.75120421,0.70900167,0.66731734,0.61975263,0.56451767,0.53688472,0.49965155,0.45557283,0.41431011,0.42310462,0.42730680,0.43930671,0.45381415,0.41385899,0.36979018,0.33210698,0.29456685,0.29780203,0.30182444,0.30111501,0.30503271,0.27386191,0.24176079,0.21003373,0.17297438,0.25387144,0.32967492,0.40717144,0.47923689,0.51678122,0.55445704,0.59977976,0.63584069,0.64848068,0.65490555,0.65523061,0.65670567,0.66272566,0.67104351,0.67571351,0.67866265,0.62792033,0.58009050,0.53266519,0.48496772,0.41210117,0.33354922,0.27654957,0.21621396,0.19557026,0.17167537,0.16091918,0.15192448,0.14400336,0.13179943,0.12083319,0.10297970,0.18011490,0.25193430,0.32735342,0.39617884,0.44358883,0.48248424,0.52036906,0.55763727,0.58429106,0.61368922,0.63331414,0.64606991,0.66500905,0.67971971,0.70560046,0.73110752,0.71650978,0.70302465,0.69624216,0.68886272,0.67651808,0.66147897,0.65089076,0.64120618,0.59048246,0.53944525,0.47034154,0.39999166,0.36593263,0.33504323,0.30217108,0.26750212,0.32388001,0.37877241,0.44024544,0.50068692,0.58274170,0.66581786,0.75050133,0.82955068,0.76856581,0.70075359,0.62890901,0.55032744,0.53888631,0.53508705,0.50533462,0.47342871,0.44151646,0.41018519,0.38189819,0.35571898,0.36107128,0.37286866,0.38227509,0.39401369,0.39461043,0.39098840,0.39001387,0.38966728,0.39947767,0.40642908,0.42555004,0.44099942,0.45662661,0.46818494,0.48654027,0.50818944,0.51818078,0.53678353,0.55121773,0.56305031,0.54244956,0.52060469,0.51460576,0.51085751,0.47529356,0.44353255,0.42315064,0.40137397,0.39569132,0.38550464,0.38724698,0.38958214,0.35582774,0.32385717,0.31545382,0.30143030,0.33435838,0.36416705,0.40945523,0.44829609,0.45330600,0.45912402,0.47348168,0.48326531,0.46139941,0.44030857,0.42597768,0.40149423,0.36302270,0.32412849,0.29895437,0.26675885,0.32203089,0.38164907,0.43062611,0.47961876,0.52096221,0.55895941,0.60506876,0.64601192,0.59939023,0.55714424,0.48866194,0.42213139,0.37923086,0.33723940,0.30829888,0.27638449,0.30988323,0.35012059,0.38366367,0.41935120,0.48736962,0.54924120,0.61269870,0.67972177,0.68528494,0.69345291,0.69968977,0.69831125,0.68097320,0.66481435,0.67108443,0.66794287,0.63516543,0.60166629,0.57172139,0.53896537,0.54157901,0.54524888,0.53850910,0.52578853,0.55040421,0.57878604,0.59786211,0.62804846,0.61276270,0.60047055,0.59926234,0.60690493,0.55395538,0.50246719,0.45091341,0.40641350,0.38434221,0.36560669,0.35109877,0.26880915,0.29072819,0.31230730,0.34388321,0.37640244,0.39397470,0.40988107,0.41249750,0.41554809,0.44339988,0.47659009,0.51632404,0.54871929,0.58559108,0.62338842,0.68023685,0.73141369,0.71673961,0.70987748,0.68730164,0.66969038,0.64698117,0.62606352,0.61640842,0.59523012,0.57433178,0.55591175,0.51912164,0.48297342,0.43298354,0.38540385,0.33437066,0.28219124,0.34316101,0.40145132,0.48512236,0.56236302,0.60322031,0.64185320,0.68620844,0.73103327,0.68747694,0.64253212,0.59163990,0.54520104,0.50337183,0.46479091,0.39967444,0.33467697,0.37416417,0.41910937,0.44143129,0.47345124,0.44969189,0.42445928,0.39866593,0.37814026,0.36972086,0.35711666,0.36320273,0.36491095,0.33277052,0.29979226,0.25804592,0.21125722,0.28322062,0.35630525,0.43050373,0.50626219,0.50532859,0.50490534,0.51850179,0.52779665,0.55266595,0.57473702,0.59974359,0.62778667,0.61963090,0.61628382,0.61312869,0.60322303,0.56701378,0.53184162,0.50454762,0.48071530,0.41907672,0.35235803,0.30391053,0.24656086,0.23232156,0.21125997,0.18537114,0.16232132,0.15148333,0.13306140,0.11422065,0.08668227,0.17365851,0.25615376,0.31435474,0.38075614,0.43345627,0.47860783,0.52179694,0.56134521,0.59770218,0.63371606,0.65370715,0.67601301,0.68301230,0.68605721,0.69815475,0.70624867,0.68712712,0.66486544,0.66376393,0.66528888,0.63672734,0.60878967,0.59076962,0.56906674,0.52724096,0.48336250,0.41653650,0.34765088,0.32457502,0.29394068,0.26410019,0.22877653,0.29334611,0.35582870,0.41597771,0.47675286,0.55934548,0.64569621,0.73188898,0.81971881,0.74277924,0.67073817,0.59636369,0.51615833,0.50158089,0.49194499,0.46010858,0.43172350,0.40498654,0.37954861,0.35891878,0.33457773,0.37271421,0.41287484,0.44853780,0.48193379,0.47130993,0.46831579,0.44880209,0.42688979,0.44110850,0.45344103,0.48914503,0.52079472,0.53154809,0.54317857,0.55923579,0.57400789,0.58569448,0.60602850,0.62694766,0.65221599,0.62539154,0.59553211,0.59300837,0.59496306,0.56136508,0.52583688,0.51294700,0.49802725,0.49621931,0.49396804,0.48435221,0.48380343,0.44362472,0.40228795,0.38131004,0.36085962,0.38965299,0.42115864,0.44847400,0.48208614,0.47465616,0.46375862,0.45304248,0.44330922,0.42637724,0.40908259,0.40340472,0.40240584,0.36138336,0.31815260,0.30714441,0.29091066,0.32815674,0.37095442,0.41078617,0.45082711,0.47069843,0.49133892,0.54012250,0.58328909,0.53835281,0.49748532,0.43442071,0.36779703,0.34911556,0.33063554,0.32302602,0.31122498,0.34056973,0.36372164,0.37508032,0.38955886,0.45683586,0.51918796,0.55928245,0.60451954,0.61756951,0.63528932,0.65355598,0.67006532,0.64069407,0.61289456,0.61917693,0.61966735,0.57079663,0.51855460,0.48791969,0.44551759,0.46265631,0.47434642,0.45461667,0.43532274,0.48738453,0.53400095,0.57384557,0.61915351,0.60158715,0.58951645,0.60393066,0.61311686,0.55003576,0.48454059,0.42540426,0.36198080,0.34508551,0.31812478,0.29662921,0.24712584,0.27834265,0.31104628,0.35672969,0.40227573,0.42481915,0.44336212,0.46248413,0.48020751,0.50224156,0.52142268,0.54424707,0.56620589,0.59990266,0.63321573,0.67478209,0.71241210,0.71013668,0.69901997,0.69686612,0.68664424,0.68531030,0.67827414,0.68297868,0.69071870,0.64650799,0.60802741,0.55672412,0.50419883,0.43914032,0.38040985,0.32473911,0.26223113,0.32490723,0.38124329,0.45059176,0.51775426,0.56380719,0.60800416,0.65598981,0.70350863,0.65165742,0.60320843,0.55564262,0.50340985,0.46487706,0.42024580,0.36831118,0.32254890,0.36004347,0.39823458,0.42684053,0.45712665,0.45332398,0.44811693,0.43545267,0.42426845,0.40632686,0.39010198,0.38934416,0.38090322,0.35574027,0.32252650,0.29252946,0.26595734,0.32082837,0.37044920,0.41911224,0.46995463,0.47123556,0.46727856,0.47644115,0.48384812,0.50257560,0.52610553,0.55241725,0.57210845,0.57056248,0.56542053,0.56270994,0.56070481,0.53715610,0.51334514,0.49464752,0.47113581,0.42679585,0.38938238,0.34841106,0.30545670,0.27898712,0.25405251,0.22568542,0.20123257,0.16950129,0.13986228,0.10759546,0.07296229,0.15929482,0.25029694,0.32147399,0.39515227,0.45934612,0.52719793,0.58525499,0.63931286,0.65072062,0.66675675,0.67258369,0.68104213,0.67706084,0.66884035,0.66261221,0.65816333,0.65231198,0.64196316,0.63204501,0.62777520,0.59363360,0.56317453,0.54361354,0.51945398,0.48539955,0.44578432,0.39013068,0.33355286,0.30071732,0.25857574,0.22558591,0.18676810,0.26261361,0.33232390,0.39366663,0.45261762,0.54563763,0.64198397,0.73360160,0.82352419,0.75176121,0.67828577,0.60771568,0.53283620,0.49026574,0.45689939,0.41634637,0.37601516,0.37265285,0.37600860,0.36985881,0.36675313,0.40961535,0.44945959,0.48475149,0.51785778,0.51746343,0.51998975,0.51085538,0.49942405,0.50832165,0.52167691,0.54440910,0.56698532,0.58180349,0.59419540,0.60836651,0.62368250,0.64472858,0.66549900,0.68209470,0.70100396,0.68912366,0.67947184,0.68049112,0.67748252,0.66029655,0.63496587,0.62476597,0.60991955,0.58868545,0.57377483,0.55295379,0.52568869,0.48272554,0.44117836,0.40941340,0.37375217,0.39222733,0.41127330,0.44049665,0.46722718,0.45991665,0.45439888,0.45512576,0.44997912,0.42986053,0.40969034,0.39966162,0.38211722,0.33581660,0.29040636,0.25281247,0.22159470,0.26198847,0.30003667,0.34338415,0.39321493,0.40793159,0.42590293,0.45748500,0.48473150,0.45888371,0.42824017,0.39000656,0.35563618,0.35355250,0.34950644,0.34430391,0.33905357,0.36239349,0.38159360,0.39220472,0.40416150,0.44950948,0.49218271,0.53284291,0.57702320,0.57409619,0.57115525,0.57908138,0.58564779,0.56554817,0.55180983,0.54472150,0.54129453,0.50626160,0.47240213,0.44985147,0.42364055,0.42740115,0.43061845,0.41635923,0.40377329,0.44633189,0.49019916,0.52725912,0.56807519,0.56297678,0.55203786,0.56464543,0.57953565,0.52780219,0.47597940,0.41479672,0.35728265,0.32672314,0.29662101,0.27069504,0.22257798,0.26197109,0.29794567,0.36426498,0.43319033,0.45322060,0.47951858,0.51234133,0.55248426,0.55557456,0.56310007,0.57173028,0.57917947,0.60597005,0.63420664,0.66512061,0.69962055,0.69773626,0.68999936,0.69675355,0.70538933,0.71770027,0.72466316,0.75698990,0.78378726,0.72325001,0.66171878,0.59325307,0.52187558,0.44883970,0.37340111,0.30684022,0.24508999,0.30181442,0.36265964,0.41998435,0.47448784,0.52609736,0.57702744,0.62320004,0.67229555,0.62070561,0.56493545,0.51797442,0.46443481,0.41900652,0.37408242,0.33795812,0.30463363,0.34308214,0.38534204,0.41314578,0.44717715,0.45673902,0.47227504,0.47120437,0.46666773,0.45040416,0.42718998,0.41603317,0.40524846,0.37549048,0.34816314,0.33504866,0.31687080,0.35236066,0.38790911,0.40940487,0.43869878,0.43042126,0.42575416,0.43030054,0.43315556,0.45588027,0.47116157,0.49711610,0.52112726,0.52094371,0.51643102,0.52047963,0.51476769,0.50902858,0.49287693,0.47772518,0.45945485,0.44109668,0.41758873,0.38594055,0.35726724,0.32433938,0.28738019,0.26428728,0.23913613,0.19624900,0.15225424,0.10213188,0.05009543,0.15375393,0.25231141,0.32449520,0.40227863,0.48487842,0.57153052,0.64189382,0.71390029,0.71056321,0.70207607,0.69707506,0.69051493,0.66824040,0.64890784,0.63130494,0.61181124,0.61366380,0.62064643,0.60223329,0.58649551,0.55368410,0.51967130,0.49705943,0.47067141,0.44091709,0.40796721,0.36693974,0.31967196,0.27447179,0.22549842,0.18666616,0.14719040,0.22629786,0.31270254,0.36823568,0.41938372,0.52534058,0.63368446,0.73304671,0.83078546,0.75960519,0.68741509,0.61351598,0.53927390,0.48395810,0.42206209,0.37072642,0.31700534,0.34000409,0.36833171,0.38228754,0.39806543,0.44138581,0.48676762,0.51858857,0.55567070,0.56035451,0.57117720,0.56801817,0.57306774,0.57409737,0.57989208,0.59763875,0.61379764,0.63106457,0.64413823,0.66228768,0.67805266,0.70124959,0.72787075,0.73549959,0.74710062,0.75321546,0.76374794,0.76531685,0.77011838,0.75727279,0.74597585,0.72994225,0.71331643,0.68735447,0.65644715,0.61834617,0.57431008,0.52722808,0.47703925,0.43476615,0.39411784,0.40125309,0.40651207,0.43489442,0.45971447,0.45493230,0.44311088,0.44858801,0.45878186,0.43233443,0.40954836,0.38927102,0.36565460,0.30824728,0.25565224,0.20801745,0.15441809,0.19251432,0.22290754,0.27957907,0.33392846,0.34695804,0.35780065,0.37774012,0.39066051,0.37925669,0.36208432,0.35260562,0.34022372,0.35282834,0.36389143,0.36788207,0.37283144,0.38718226,0.39822570,0.40833561,0.41860104,0.44420497,0.47031696,0.50799844,0.54552965,0.52423250,0.50691242,0.50556805,0.49738063,0.49557967,0.49161252,0.47501798,0.46757253,0.44816032,0.42635134,0.41260522,0.40397152,0.39499157,0.39301175,0.37802522,0.36337363,0.40476908,0.44588182,0.47828838,0.51995816,0.51740211,0.51209317,0.52922967,0.54369191,0.50127435,0.46725514,0.40983717,0.35420264,0.31730694,0.27643840,0.24945040,0.18016080,0.23995893,0.30261251,0.37456785,0.44283927,0.48171320,0.52044696,0.56589072,0.60439570,0.60803223,0.60938951,0.61188132,0.61311564,0.62652171,0.64316890,0.66454120,0.68289882,0.69380292,0.70167509,0.70707045,0.71500505,0.74682503,0.77560185,0.82636653,0.87051410,0.79074357,0.70754031,0.62842674,0.54706431,0.45901474,0.37396957,0.29237705,0.21087946,0.26881531,0.32781540,0.38286122,0.43481820,0.48726838,0.54070166,0.59214672,0.64023923,0.59211783,0.54224571,0.48718736,0.43695110,0.39052939,0.34976995,0.30955005,0.26310268,0.30630318,0.34953671,0.39944477,0.44904793,0.46732611,0.49149938,0.50779117,0.51354151,0.48568381,0.45938302,0.43309418,0.41326320,0.40301250,0.39432014,0.38269374,0.37394759,0.38399934,0.39040590,0.38918666,0.38655450,0.38673918,0.39292974,0.39329577,0.38627784,0.40441881,0.41689549,0.43968265,0.46425066,0.47154416,0.48149666,0.48169560,0.48148666,0.47890064,0.47158639,0.46625647,0.46438102,0.45002741,0.43714324,0.42620793,0.41804208,0.38233621,0.35120803,0.31040173,0.27419151,0.21673285,0.15920934,0.09478629,0.03166062,0.13275557,0.24321385,0.33547922,0.42413175,0.51650487,0.60656742,0.69704634,0.79079612,0.77065425,0.74358103,0.72931999,0.71052862,0.68019174,0.64849151,0.61601795,0.58402689,0.58374608,0.58503133,0.56666800,0.55440944,0.51662576,0.48473693,0.45856647,0.43731393,0.40615290,0.37470628,0.34197560,0.30561211,0.25793698,0.20747876,0.15925454,0.10724960,0.18389242,0.26500584,0.33354768,0.39793887,0.50834764,0.61472416,0.72420818,0.83743991,0.76317698,0.68996997,0.62695872,0.56485448,0.47972644,0.39132314,0.31275808,0.23852815,0.29177659,0.35058722,0.40125157,0.44589370,0.48106493,0.51877670,0.55889305,0.59837976,0.61128581,0.61738256,0.62291860,0.62769485,0.63903382,0.63825129,0.65938212,0.68294430,0.69480252,0.70229837,0.72423252,0.74885817,0.77193156,0.79026707,0.79919276,0.81777641,0.82333260,0.82927812,0.84167064,0.85052966,0.84547474,0.84065698,0.83922873,0.84514135,0.79818780,0.74563001,0.69479476,0.63366878,0.57433955,0.51269545,0.45581302,0.40212204,0.40766252,0.42338246,0.44293558,0.45896975,0.44867757,0.44304379,0.44293159,0.45036265,0.42789509,0.40038931,0.37451470,0.35066310,0.28064906,0.21719963,0.15227311,0.08672518,0.13004299,0.17382906,0.22791737,0.27911617,0.28952926,0.29069188,0.29868559,0.30442728,0.31454513,0.31951435,0.31648351,0.31093515,0.33675663,0.36719749,0.38385541,0.39951905,0.40107339,0.39651703,0.40014940,0.40759170,0.42375831,0.44383125,0.47310133,0.49893513,0.47882125,0.46042754,0.44366502,0.42638953,0.41764105,0.41214418,0.39005549,0.37918919,0.36590309,0.36034632,0.35768639,0.35728353,0.35782568,0.35131115,0.34281057,0.32514671,0.36402237,0.40575397,0.43419221,0.45622625,0.47589348,0.48833607,0.50287666,0.52262679,0.48337066,0.44601474,0.39712426,0.34063244,0.30304393,0.26239508,0.22139124,0.13530488,0.21926446,0.29787224,0.37438831,0.45815839,0.51091138,0.56287068,0.61583611,0.66509234,0.66414660,0.66006789,0.65372769,0.64316258,0.64088667,0.64251060,0.65410516,0.66990169,0.68725846,0.70896011,0.71567917,0.72683272,0.77601219,0.82851433,0.89407793,0.95713418,0.85416843,0.75702775,0.66671297,0.57166767,0.47372237,0.37645432,0.27947297,0.18178143,0.23825617,0.29704190,0.35015321,0.39728073,0.44835014,0.50183389,0.55914444,0.61149693,0.56525850,0.51727844,0.46210890,0.40382773,0.36338382,0.32707384,0.27368863,0.22036945,0.27272287,0.31755570,0.38348618,0.44747810,0.48104491,0.52091142,0.54345365,0.56521460,0.52670538,0.48239083,0.45373049,0.42042696,0.42974879,0.43699360,0.43431802,0.42934468,0.40741153,0.39117559,0.36681900,0.33811577,0.34472310,0.35595339,0.34938731,0.34206825,0.35705199,0.36337454,0.38707581,0.40256216,0.42110125,0.44264726,0.44159794,0.44641812,0.44863686,0.44482344,0.45889933,0.46884876,0.46225287,0.45569641,0.46956097,0.47879885,0.44116724,0.41158301,0.35971462,0.31139657,0.24117480,0.16714589,0.08713509,0.00519275,0.12386516,0.23301487,0.33782389,0.44546951,0.54114050,0.63351972,0.75237690,0.87080952,0.82828489,0.78614172,0.75777988,0.73550898,0.69006955,0.65396913,0.60560974,0.55402560,0.55288691,0.54997951,0.53719463,0.52384737,0.48481590,0.43946022,0.42363873,0.39761777,0.37592529,0.34797177,0.31632996,0.29097378,0.23747977,0.18987080,0.12345418,0.05950022,0.14654237,0.22503597,0.29645467,0.36911345,0.48232600,0.59124240,0.71701267,0.84142641,0.77201354,0.69798370,0.64325762,0.59002936,0.47613001,0.35870717,0.26119089,0.16193872,0.24645148,0.33257222,0.41344608,0.49775482,0.51944976,0.54750940,0.60006186,0.64614897,0.65494002,0.66624422,0.67683144,0.69187126,0.69418422,0.69750854,0.72605181,0.75205950,0.75356915,0.75929827,0.78820421,0.82250357,0.83449529,0.84977273,0.86921614,0.88737639,0.88865641,0.89665008,0.91523188,0.93347827,0.92816776,0.92883713,0.95246623,0.97731855,0.90462736,0.84109893,0.76717331,0.69871195,0.62391221,0.54747071,0.47930243,0.40832038,0.41859092,0.43089541,0.44518140,0.46125107,0.44839126,0.43700636,0.43978194,0.44133604,0.41596070,0.39816577,0.36184742,0.33583499,0.25785859,0.17781717,0.09927270,0.01674424,0.07521753,0.12487362,0.17493309,0.22979960,0.22795937,0.22448747,0.22271790,0.21897891,0.24805251,0.28017995,0.27750042,0.28048089,0.32384479,0.36774785,0.39336035,0.42388116,0.41045804,0.39882289,0.40094162,0.39448390,0.40379259,0.41493313,0.43428046,0.45412926,0.43236415,0.40617307,0.38396121,0.35696513,0.34471529,0.32892518,0.30874638,0.28700920,0.29173718,0.29074662,0.30357076,0.31553268,0.31473438,0.31773919,0.30260302,0.28591683,0.32633664,0.36492306,0.37967022,0.39997786,0.43146811,0.46202058,0.47949363,0.49529855,0.46188612,0.43227212,0.38064889,0.32912170,0.28885621,0.24706813,0.19292871,0.15909923,0.23810940,0.31158026,0.38200671,0.44865224,0.51163107,0.58046986,0.63617273,0.70034578,0.69071135,0.67572870,0.65696306,0.64102877,0.63799587,0.62951610,0.62350854,0.61853233,0.64618445,0.67281382,0.68795319,0.70527164,0.76225466,0.81039483,0.87579534,0.93884438,0.84702972,0.76093595,0.68031703,0.59897320,0.51043603,0.41559011,0.31884445,0.22291007,0.26650745,0.30716209,0.34900401,0.38688111,0.42466137,0.46628019,0.50308187,0.54057661,0.51177170,0.48424443,0.44884307,0.40551444,0.36471095,0.32466839,0.28467198,0.23769580,0.28005110,0.32168065,0.37808752,0.43457269,0.47383831,0.50582328,0.53082827,0.55794276,0.52854508,0.49979983,0.46853743,0.43991547,0.43721168,0.43582109,0.42951399,0.42926830,0.41605607,0.39606058,0.37949677,0.35701897,0.36285964,0.36300522,0.36218619,0.35740742,0.37042279,0.37544627,0.37856527,0.37460039,0.38915039,0.39763068,0.40107080,0.40940059,0.41466353,0.41684260,0.43452187,0.44659173,0.43959903,0.42961271,0.43504234,0.43889756,0.41102399,0.38901822,0.35680149,0.32243581,0.26546782,0.21212849,0.15750924,0.10595383,0.19364561,0.27862916,0.37475017,0.46123453,0.54743679,0.63145286,0.73485821,0.83021599,0.79133388,0.75255309,0.71479746,0.68411377,0.65855566,0.62707998,0.59804158,0.57175722,0.56396592,0.56149473,0.55801714,0.55474684,0.52366384,0.49089260,0.47424080,0.46163408,0.42579525,0.39129889,0.35793966,0.32678348,0.27129014,0.21369779,0.14832710,0.08824127,0.16571412,0.23934713,0.31934232,0.39561906,0.50038023,0.59790298,0.69704723,0.78790200,0.73178101,0.67143367,0.62628325,0.57631729,0.48501274,0.39189238,0.31292904,0.23053592,0.29823182,0.36511729,0.43048626,0.50359589,0.52835213,0.55789212,0.60741990,0.65445280,0.65750742,0.65647614,0.66076085,0.67008356,0.67953868,0.69757162,0.72244569,0.75569224,0.75550628,0.76224084,0.77332485,0.79034151,0.80301805,0.81494564,0.82560537,0.83329870,0.83367098,0.82922418,0.84055682,0.84478844,0.84899965,0.84932660,0.85985737,0.87004587,0.82173645,0.76675521,0.71944239,0.67540495,0.61925632,0.56120360,0.50380717,0.45162565,0.46506861,0.47377348,0.48402477,0.49973129,0.49411722,0.49134692,0.50000746,0.50811464,0.47977625,0.44578704,0.41753688,0.39464902,0.32598228,0.26057957,0.19285611,0.12420395,0.15713574,0.18951562,0.23145350,0.27335734,0.27382200,0.27058176,0.26008486,0.24831314,0.27937029,0.30468982,0.30986030,0.30967025,0.33637749,0.36339242,0.38973014,0.40988616,0.40793714,0.40327337,0.41093475,0.42281515,0.43640786,0.45896050,0.48014215,0.50246629,0.47864253,0.45054352,0.42432277,0.39672788,0.37025032,0.33579989,0.31113059,0.28191996,0.28751906,0.30218228,0.30623620,0.31553491,0.31225504,0.30812530,0.29519385,0.28273502,0.32534687,0.36751763,0.40562118,0.43645862,0.46594925,0.49817777,0.52744995,0.56099271,0.51225348,0.47279825,0.41524290,0.36339681,0.30966185,0.26068377,0.20918732,0.18103613,0.25213995,0.33021201,0.38288650,0.43912018,0.51523397,0.59602148,0.66494878,0.73391753,0.71332710,0.69976437,0.67108624,0.64450308,0.62743584,0.61674011,0.59547270,0.57405810,0.60770897,0.64489110,0.66099909,0.68012152,0.74269372,0.79570409,0.85431461,0.92022036,0.84262606,0.77304060,0.69812943,0.63242547,0.53762188,0.45229110,0.35888290,0.26716421,0.29171744,0.31129754,0.34239505,0.37489356,0.40126196,0.42612523,0.45095356,0.46982092,0.46069277,0.45420195,0.43063173,0.41097051,0.37074940,0.32587375,0.29139931,0.25456254,0.28999837,0.32257293,0.37554905,0.42479448,0.46013448,0.49447258,0.52588772,0.55728364,0.53533750,0.51831356,0.48835643,0.46002372,0.44686561,0.43454507,0.43428390,0.43093228,0.41819918,0.40574930,0.39092793,0.37769516,0.37475226,0.37615685,0.37747434,0.37539269,0.38202359,0.38749470,0.36944026,0.34793698,0.35160957,0.35710066,0.36350497,0.37008714,0.38319304,0.38925762,0.40983763,0.42972327,0.41668816,0.39899487,0.39826020,0.39477864,0.38089596,0.36826253,0.35316727,0.33442633,0.29262779,0.25353146,0.22650113,0.20280110,0.26338952,0.32800734,0.40464364,0.47771499,0.55260283,0.62980025,0.71091680,0.79622567,0.75595483,0.71341711,0.67098721,0.63625383,0.62280345,0.60338033,0.59736786,0.58375023,0.57946954,0.57094480,0.58283684,0.59481362,0.56404866,0.53614871,0.53547851,0.53117447,0.48310672,0.43713587,0.40374059,0.36548337,0.30306495,0.23409046,0.17245247,0.10966101,0.17930478,0.25259299,0.34097003,0.42226583,0.51265650,0.60826152,0.67082247,0.74075535,0.69619077,0.64910154,0.60972520,0.56694445,0.49544857,0.42464425,0.35906615,0.29165270,0.34659520,0.39707517,0.45496365,0.50827367,0.53904255,0.56557017,0.61526100,0.66799716,0.65534527,0.64028048,0.64489840,0.64563676,0.66910472,0.69067084,0.72809993,0.75995723,0.75920342,0.75945706,0.75835214,0.75617550,0.77069004,0.77915183,0.78232040,0.78473155,0.77606087,0.76693619,0.76689465,0.76266483,0.76268588,0.76312143,0.76265804,0.76357069,0.73322779,0.69504813,0.67469823,0.64778849,0.61600754,0.57821806,0.53235034,0.48975331,0.50874749,0.52159563,0.53066078,0.53141713,0.54097709,0.54576087,0.55722978,0.57143996,0.53838530,0.49717903,0.47640906,0.45255799,0.39365232,0.34061921,0.28281509,0.22874046,0.24444132,0.25697383,0.29142206,0.32069352,0.31998475,0.32131490,0.30032554,0.27896097,0.30724440,0.33718867,0.33123009,0.33020120,0.34738203,0.36217291,0.37848287,0.39925608,0.40143417,0.40541477,0.42382655,0.44278390,0.47163440,0.49719271,0.52804024,0.55365985,0.52460630,0.49003026,0.46476909,0.43860583,0.39472539,0.34550571,0.31061721,0.27508266,0.28734335,0.30788313,0.31268273,0.32023179,0.31323933,0.29913671,0.28835798,0.27798649,0.32933086,0.37159725,0.42340104,0.47572162,0.50244698,0.53148564,0.57481951,0.62175922,0.57054799,0.51824772,0.45498104,0.39864751,0.33667076,0.27637707,0.23312606,0.21462843,0.27211112,0.32784979,0.37534406,0.41879222,0.51043708,0.59800002,0.68842986,0.78186590,0.74749726,0.71260811,0.67319920,0.62596711,0.60354707,0.57194112,0.55379797,0.52765565,0.56812016,0.60440118,0.63709087,0.67650591,0.72899080,0.78442172,0.84196538,0.89397776,0.83244615,0.77217221,0.71632648,0.65938505,0.56807421,0.47350458,0.38432346,0.29592063,0.31342449,0.32965774,0.34243714,0.36477801,0.37798052,0.38767347,0.40113444,0.41504328,0.42103266,0.42561526,0.41895853,0.41542160,0.37864081,0.34275238,0.30213819,0.25649469,0.30217167,0.34351125,0.38336999,0.42366985,0.45674482,0.48815452,0.50880622,0.53590069,0.51961782,0.50892899,0.49015527,0.47684588,0.46024442,0.44444728,0.42856036,0.40896293,0.40316902,0.39402509,0.38947496,0.38343967,0.39554413,0.39893354,0.40728846,0.41019206,0.39644602,0.38324437,0.35379567,0.33256848,0.33196506,0.33225209,0.33278273,0.32979341,0.34575865,0.35807097,0.38115573,0.40222954,0.38665106,0.36899749,0.36159725,0.35551738,0.35352288,0.34309158,0.33745232,0.33014461,0.31103617,0.29411616,0.28850479,0.28897122,0.34017017,0.39237360,0.44876674,0.49942596,0.55551519,0.61245929,0.68609810,0.75684656,0.70750629,0.66354135,0.62505241,0.57960389,0.58897142,0.60100758,0.61096733,0.61981895,0.61692818,0.61322534,0.62133532,0.63028818,0.60786211,0.58768128,0.58723314,0.58970914,0.54669700,0.50225680,0.46328628,0.41990751,0.34067037,0.26502570,0.18338239,0.11225087,0.18980981,0.27371699,0.36511028,0.45392434,0.51966469,0.58051294,0.64797437,0.71855325,0.67337426,0.62780296,0.58566488,0.55063350,0.50360622,0.45491113,0.41321628,0.36971848,0.40449449,0.43620919,0.47551566,0.51453002,0.54707023,0.58003189,0.62938978,0.68230707,0.65987161,0.64010792,0.63294684,0.61792099,0.65565074,0.68940749,0.72444886,0.75951837,0.75735594,0.74937550,0.74642659,0.74999401,0.74882969,0.74621553,0.73610323,0.72251009,0.72083269,0.71922575,0.70464686,0.69696216,0.69188583,0.68677093,0.68252936,0.67224766,0.65932921,0.64830794,0.63532405,0.62906244,0.61288597,0.59268175,0.57272187,0.54966734,0.55590582,0.56163202,0.56980239,0.58403300,0.59273324,0.60250327,0.61976919,0.63690986,0.59926695,0.56837980,0.54356753,0.52214321,0.46663479,0.41042516,0.36496716,0.32046446,0.32763498,0.33256783,0.34972814,0.37080179,0.36437309,0.35882114,0.34546058,0.32730158,0.34555017,0.35937649,0.36421560,0.36743431,0.36840661,0.37168304,0.36644864,0.36135175,0.38141747,0.40666986,0.43492691,0.46949357,0.50811451,0.54296072,0.57468227,0.60789065,0.57892510,0.54908331,0.51842500,0.48772481,0.42720712,0.36603690,0.30886457,0.24962187,0.27184707,0.29983225,0.31155158,0.32111896,0.31778206,0.30734173,0.29636445,0.28631000,0.34121535,0.39126438,0.44967830,0.50988119,0.55055584,0.58671518,0.63480122,0.68925837,0.61621410,0.54629732,0.47590453,0.40741588,0.35902215,0.30766913,0.26177650,0.24774963,0.28561048,0.32476468,0.36258147,0.40202533,0.50338974,0.59937284,0.71741136,0.83603985,0.78345585,0.73103563,0.67482717,0.61774655,0.57172405,0.53085548,0.50897792,0.48926148,0.52408448,0.55959276,0.61845320,0.67078723,0.72362263,0.77637252,0.82104899,0.87267296,0.82309416,0.77196854,0.72554299,0.68756663,0.59202459,0.50109262,0.40795794,0.31812428,0.33306301,0.34224323,0.34344549,0.34838136,0.34993646,0.34727595,0.35487567,0.35563741,0.37448416,0.39389617,0.41021562,0.42279017,0.39038764,0.35701355,0.30853846,0.25965245,0.31002893,0.36087318,0.39049078,0.41596470,0.45017487,0.48442025,0.49967740,0.51086915,0.50623498,0.50046982,0.49897926,0.49089795,0.47422967,0.45440116,0.41983423,0.38651192,0.38724743,0.38547630,0.39139818,0.39459413,0.40659984,0.42437852,0.43534621,0.44597473,0.41304520,0.38284954,0.34274590,0.30814221,0.30838648,0.30236311,0.29421608,0.28383208,0.30554905,0.32268220,0.35390082,0.37869472,0.35869565,0.33873404,0.32626026,0.31278306,0.32198396,0.32125427,0.32824981,0.32970946,0.33210583,0.33514119,0.35258603,0.37276650,0.41094640,0.45517581,0.48944732,0.52125845,0.56119306,0.59421791,0.65796535,0.71534373,0.66412026,0.61302419,0.57179249,0.52665902,0.56615492,0.59911300,0.62722073,0.65655715,0.65111175,0.65704880,0.66196706,0.67079322,0.64919106,0.63144301,0.64245185,0.65297522,0.60838832,0.56285809,0.52046386,0.47919194,0.38029310,0.28914170,0.19912843,0.10967779,0.20362855,0.29412381,0.38768677,0.48826009,0.52152119,0.55818960,0.62734104,0.69103374,0.64564534,0.59945576,0.57162091,0.53979502,0.51060905,0.48362528,0.46479768,0.44034818,0.45955944,0.47965489,0.49868509,0.51715150,0.55948147,0.59608184,0.64544189,0.69711521,0.66991838,0.63868033,0.61727624,0.58970213,0.64300090,0.69533483,0.72595790,0.76147391,0.74927033,0.74262873,0.73869124,0.73580791,0.72609401,0.72361629,0.69120022,0.65968113,0.66434435,0.66629715,0.64541591,0.62611543,0.61882066,0.60664169,0.59710332,0.57951392,0.58884764,0.59195272,0.60116181,0.61425500,0.60749730,0.60543712,0.60481357,0.60742345,0.60272250,0.59648820,0.61931572,0.63494091,0.64359594,0.65277131,0.68147746,0.70822240,0.66953260,0.62989948,0.61309392,0.59390332,0.53442830,0.48014311,0.45224571,0.41695175,0.41417780,0.40686569,0.41667098,0.42323677,0.40908651,0.39924893,0.38391936,0.37239436,0.37571011,0.38657901,0.39570775,0.40867397,0.39258677,0.38624165,0.35381945,0.32235147,0.36659285,0.39970306,0.44994792,0.49116029,0.53786814,0.58995475,0.62339424,0.66253796,0.63042300,0.60497539,0.57035023,0.53320605,0.46102688,0.38747274,0.30578599,0.22383514,0.25809428,0.29361782,0.31011184,0.32712029,0.32103727,0.31326178,0.30041874,0.29579925,0.35206137,0.41499137,0.48425793,0.55122564,0.59417575,0.64038793,0.69580181,0.75853707,0.66811034,0.57859962,0.49929503,0.42422645,0.38161322,0.33569012,0.29359337,0.21093092,0.26173774,0.31010170,0.36379815,0.41491101,0.52171182,0.62549964,0.73547164,0.84217539,0.78688964,0.73346239,0.66847284,0.60323442,0.54656680,0.48876498,0.43911569,0.38919911,0.44674960,0.50845890,0.56805737,0.62875593,0.69042106,0.75020635,0.81614535,0.87927176,0.82697978,0.77704228,0.73334125,0.68673560,0.60389373,0.52048678,0.44026239,0.36403662,0.37002802,0.37546522,0.37623822,0.37215787,0.36257070,0.35286468,0.34038064,0.32260155,0.33776037,0.35393508,0.37410666,0.39791483,0.36859429,0.34007425,0.30899510,0.27637371,0.32311633,0.37878639,0.41167476,0.44412405,0.47376455,0.50142111,0.51682164,0.53075061,0.52778949,0.52025613,0.51549490,0.51329122,0.49024967,0.46524669,0.44609176,0.42455573,0.42153229,0.42153090,0.41626185,0.41209301,0.41580690,0.41794369,0.42177461,0.41714848,0.39075186,0.37101924,0.34744275,0.31818011,0.31392038,0.29877452,0.28853731,0.27890795,0.28691785,0.29774724,0.31654299,0.33351754,0.32389068,0.31577628,0.31476681,0.31564034,0.31945061,0.32454293,0.33504351,0.34612886,0.35877340,0.37230157,0.39896483,0.42310726,0.44970937,0.47745371,0.49264324,0.51343049,0.54266302,0.58229624,0.62987069,0.68192129,0.64668543,0.61661957,0.58556819,0.55486247,0.57064935,0.59022776,0.61100699,0.63114946,0.64036107,0.64806044,0.66121922,0.67371773,0.67508946,0.66642040,0.67717947,0.68879699,0.64076537,0.58855824,0.53360515,0.48419679,0.39853155,0.31222039,0.21841413,0.12625847,0.20679849,0.29550035,0.37456770,0.45530304,0.48631383,0.52100920,0.57236987,0.62787320,0.59966514,0.58036765,0.55801964,0.53586351,0.52828065,0.52141581,0.51459321,0.51086934,0.52561844,0.54319723,0.54967479,0.55010187,0.58151170,0.61647884,0.65111569,0.68483124,0.66051755,0.64500099,0.62348719,0.60654944,0.65528868,0.70159198,0.73920301,0.77033219,0.76094529,0.75311949,0.74250067,0.74102015,0.72439956,0.71429971,0.69221989,0.67702243,0.66425510,0.65285443,0.62859703,0.60254980,0.59145133,0.57768399,0.55059694,0.52434196,0.54858835,0.56756836,0.59217656,0.61598817,0.62077733,0.62589783,0.63583340,0.64443155,0.65053051,0.65626233,0.66847099,0.67807879,0.69660930,0.71046390,0.73398383,0.74999301,0.72348856,0.69273355,0.66201818,0.63503578,0.59723609,0.56291378,0.53046791,0.49146443,0.47915419,0.46670154,0.45702349,0.44629098,0.43229541,0.41366491,0.39192740,0.36726165,0.36994607,0.36526745,0.36587406,0.36729214,0.36236023,0.35643525,0.33660682,0.31952234,0.36948274,0.41858680,0.47436470,0.53650800,0.58446905,0.62984091,0.67297923,0.72089691,0.67854866,0.63777621,0.59392911,0.54752411,0.47741296,0.40610919,0.32880185,0.24872171,0.26899523,0.28027568,0.29887197,0.31950950,0.29780619,0.28089320,0.27155090,0.26581660,0.33512285,0.40720411,0.47437175,0.54885457,0.60747004,0.66443042,0.73684090,0.79731070,0.70982762,0.62123704,0.54101837,0.45603126,0.39534904,0.33771847,0.27898551,0.18338426,0.23888422,0.29201828,0.36371505,0.42676221,0.53581590,0.64468660,0.74654666,0.84950116,0.79402554,0.73573121,0.66323539,0.59253791,0.51911951,0.45022307,0.37028965,0.29180367,0.37203659,0.45446775,0.52455254,0.59169048,0.66345333,0.72551214,0.80952901,0.89229647,0.83779747,0.78656831,0.73570195,0.68687102,0.60958003,0.53469078,0.47383039,0.40953742,0.40834608,0.40263301,0.39837296,0.40024382,0.38089051,0.36106088,0.32535667,0.28438995,0.30582907,0.31573773,0.34664389,0.37042102,0.35125771,0.33234681,0.31169769,0.28872096,0.34361593,0.39667165,0.43018336,0.47117804,0.49440807,0.51788449,0.53425928,0.54806541,0.54736002,0.54150623,0.53883020,0.53052411,0.50472361,0.48006904,0.47403749,0.46477115,0.46146840,0.45551444,0.44014935,0.42984890,0.42041393,0.41872768,0.40876306,0.39814038,0.37640275,0.35445134,0.34470279,0.33130835,0.31851575,0.30221845,0.28437974,0.26905109,0.26722135,0.26216171,0.27419489,0.28770310,0.28983093,0.29024629,0.30558291,0.32107895,0.32693810,0.32767328,0.34727937,0.36506444,0.38311099,0.40412428,0.43629987,0.46785401,0.48527513,0.50276766,0.50110122,0.50268039,0.53382749,0.55936304,0.60115075,0.64786718,0.63289545,0.61578512,0.59688530,0.58002168,0.58319761,0.58455763,0.59661955,0.60858203,0.62684598,0.63784113,0.66560814,0.68359241,0.69586370,0.69996609,0.71559605,0.73163551,0.67047018,0.61565844,0.55149368,0.48418932,0.40799854,0.33295504,0.23679155,0.13976324,0.21792172,0.29697897,0.35671568,0.42218752,0.45094397,0.47508173,0.51825286,0.56154430,0.55818600,0.55882264,0.54724016,0.53504450,0.54612102,0.55864280,0.56554229,0.57562978,0.58909056,0.60571475,0.59212200,0.58462599,0.60798046,0.63290965,0.65138870,0.67395606,0.65879644,0.64323967,0.63180668,0.62182744,0.66693343,0.70888050,0.74818258,0.78588163,0.77110183,0.75986280,0.75259650,0.74223832,0.72305107,0.70149847,0.69863999,0.69456793,0.66383357,0.63740426,0.61180506,0.57981864,0.56245520,0.54589139,0.50793590,0.47114671,0.50282610,0.53644827,0.58278986,0.62563333,0.63670993,0.64952865,0.66478151,0.68944712,0.70169112,0.71125722,0.71576024,0.72074959,0.74093499,0.76504614,0.78155557,0.79466889,0.77047151,0.74848565,0.71231804,0.67974196,0.66369770,0.64323124,0.60620591,0.56712233,0.54425334,0.52497261,0.49946815,0.47216183,0.45323912,0.43113894,0.39514660,0.36447482,0.35520753,0.34703965,0.34191552,0.32832436,0.32995807,0.33123831,0.32086496,0.31221434,0.37411270,0.42651501,0.50171590,0.57847750,0.62530097,0.67382548,0.72333589,0.77504305,0.72215521,0.66986621,0.61658811,0.56394250,0.49457600,0.42712196,0.34604920,0.27459740,0.27502747,0.27150621,0.29662723,0.31378966,0.28031157,0.24729844,0.24387337,0.23558335,0.31239313,0.39549936,0.46585918,0.54302952,0.61825515,0.69453738,0.77222899,0.84457371,0.75412984,0.65887559,0.57572948,0.49493145,0.41757920,0.34302837,0.26173116,0.14144830,0.21321445,0.28544169,0.36113668,0.42726689,0.54747142,0.66942476,0.77870835,0.89180381,0.81428870,0.73743287,0.66112236,0.58476539,0.48580892,0.39302411,0.30381520,0.21124328,0.30083232,0.39215410,0.48411153,0.56852828,0.65009606,0.73113880,0.81696022,0.90504766,0.84739301,0.79186259,0.74211551,0.68683944,0.62621900,0.56735346,0.51598589,0.46772579,0.45763321,0.44200882,0.42386341,0.40599730,0.37111434,0.33890565,0.29771183,0.25709781,0.27335677,0.28716913,0.31238690,0.34026797,0.33168190,0.32421267,0.31243951,0.29816245,0.34677075,0.39720419,0.45235460,0.50806190,0.52714916,0.54378240,0.56479036,0.57671594,0.57578218,0.56905729,0.56219786,0.54892444,0.52881324,0.50687737,0.49846195,0.49187065,0.48257236,0.47498540,0.45930970,0.43868787,0.42471359,0.41042887,0.38245521,0.36009416,0.35622521,0.34944843,0.35062791,0.34306593,0.31529223,0.28028563,0.25489410,0.22989114,0.23418799,0.24185493,0.24314666,0.24084932,0.25496651,0.26794321,0.28486186,0.30381599,0.32456099,0.33579880,0.35289229,0.36753204,0.41138821,0.45418726,0.49339250,0.53474543,0.52863821,0.51903109,0.50881562,0.49508490,0.51573278,0.53867865,0.57007823,0.60412470,0.60387306,0.60500293,0.60439307,0.60556603,0.59821264,0.59372980,0.59896486,0.60340069,0.62386791,0.64151422,0.68008969,0.70984550,0.72688082,0.73381409,0.75943918,0.77493444,0.71092890,0.64607351,0.57865545,0.51633351,0.42794061,0.33638356,0.23684826,0.13532467,0.20801385,0.28058545,0.34557927,0.40365508,0.42525897,0.44351538,0.46963399,0.49851032,0.51099675,0.51736187,0.51597312,0.51257540,0.54968844,0.59004114,0.62196636,0.65524547,0.65371377,0.65147461,0.63562370,0.62736206,0.63736210,0.65396880,0.66915293,0.68113439,0.66387550,0.64942225,0.63526074,0.61593941,0.66336198,0.70431941,0.75512658,0.79732951,0.78167991,0.76606402,0.76002222,0.75039137,0.73317960,0.70912371,0.70665942,0.69738343,0.66384241,0.63432630,0.59959853,0.57178836,0.53425123,0.49780871,0.46175550,0.42290948,0.46475046,0.50638382,0.56382480,0.61922062,0.64422820,0.66942580,0.69684338,0.72545332,0.73947317,0.75095049,0.76454545,0.77541548,0.79929110,0.81642950,0.84271139,0.86874642,0.83278186,0.80030460,0.76827667,0.74446122,0.72017037,0.70421990,0.67991438,0.65981471,0.61735842,0.57871906,0.53253226,0.49086506,0.46573023,0.44336231,0.40755434,0.37464121,0.35858823,0.34319564,0.32526107,0.30496067,0.30850878,0.31644926,0.31162353,0.30946324,0.37658962,0.45099485,0.52777016,0.60994517,0.66546140,0.71884639,0.78876961,0.85214360,0.78260497,0.72073870,0.65477626,0.58321764,0.50678543,0.42827843,0.35235498,0.27428654,0.28163015,0.28723239,0.29880723,0.31146794,0.27000043,0.23470992,0.20724286,0.18354407,0.28325240,0.37869880,0.46655120,0.55187312,0.63538910,0.71686826,0.81056444,0.90107659,0.80502895,0.70424567,0.60933000,0.51126372,0.42112232,0.32597966,0.23230095,0.09801652,0.19306070,0.27972677,0.35791890,0.43030784,0.56277048,0.69812422,0.80824319,0.92896869,0.82988018,0.73566142,0.65740850,0.57433768,0.45943383,0.33951805,0.23149279,0.12418070,0.23202543,0.33057210,0.43554001,0.54534291,0.63747653,0.73272837,0.82080521,0.91728211,0.85840569,0.80459216,0.74610941,0.68697250,0.64431521,0.59874243,0.56206872,0.52471562,0.49835800,0.47968363,0.45049535,0.41891081,0.36637598,0.31284204,0.26913681,0.22196954,0.24264616,0.25523311,0.28988803,0.31587866,0.31342731,0.31713561,0.31090727,0.30355899,0.35236995,0.40335158,0.47653885,0.54428463,0.55587101,0.57507669,0.59149099,0.60797495,0.60145187,0.59909423,0.58546929,0.57210716,0.54847738,0.52465591,0.51929830,0.51568374,0.50643361,0.49824513,0.47470891,0.45431773,0.42666488,0.40008082,0.36408765,0.32293169,0.33478472,0.34583714,0.35358781,0.36184377,0.31163092,0.25848260,0.22794121,0.19033535,0.20464191,0.21999313,0.20713118,0.19443932,0.21971404,0.23646244,0.26555749,0.28815411,0.31753472,0.34909271,0.35678117,0.36834638,0.43112269,0.49726120,0.55002715,0.60125560,0.57305497,0.54047191,0.51343841,0.47798207,0.49847920,0.51330437,0.53791355,0.56262158,0.57726042,0.59082133,0.61105950,0.63559338,0.61351234,0.59471251,0.59930995,0.59624663,0.62108075,0.64336981,0.69219038,0.74187938,0.75645963,0.76937216,0.79397912,0.82631358,0.74860995,0.68026473,0.61134385,0.54529769,0.44541855,0.34586272,0.23668862,0.12649620,0.19703296,0.26603383,0.32595924,0.39094574,0.39689828,0.40785749,0.42347131,0.43820983,0.45462699,0.47659096,0.48571781,0.49111004,0.55547213,0.62416802,0.67249448,0.72916262,0.71273094,0.70052028,0.68159083,0.66321977,0.66813068,0.67771579,0.68089191,0.68284712,0.67092934,0.65595432,0.63265082,0.61154970,0.65791330,0.70005169,0.75567911,0.81526481,0.79295456,0.77824014,0.77250962,0.76265177,0.74110138,0.71899009,0.71199788,0.70717797,0.66650281,0.62851898,0.59026041,0.55571732,0.50487840,0.45149656,0.41202510,0.36969637,0.42383039,0.47425747,0.54486674,0.61843096,0.65021584,0.68732568,0.72274838,0.76396742,0.77289248,0.78566041,0.80804457,0.83330105,0.84932138,0.86426042,0.89724961,0.93780241,0.88966687,0.84358723,0.82700072,0.80340130,0.78563798,0.76528957,0.75490748,0.75077554,0.69237930,0.62895938,0.56914540,0.51383368,0.48594914,0.45259542,0.41506975,0.37686174,0.35419258,0.33259192,0.30554178,0.27181309,0.28846736,0.30780154,0.30578930,0.29837132,0.38774721,0.47672546,0.55788844,0.64093166,0.70456201,0.76520874,0.84806786,0.92983807,0.84641652,0.76735133,0.68390886,0.60753103,0.51717293,0.42967940,0.34846156,0.26959973,0.29017063,0.30723063,0.30898808,0.31082307,0.25910992,0.21297827,0.17776267,0.13796776,0.25361992,0.36310886,0.46069455,0.56489861,0.65269574,0.73525142,0.84938077,0.96258419,0.85258661,0.75015354,0.63910053,0.53651753,0.42647457,0.31380833,0.20549744,0.16711640,0.24980811,0.32792388,0.39559758,0.45674517,0.56184652,0.66977871,0.75733508,0.84360450,0.77416839,0.70967508,0.63686943,0.56766788,0.47763040,0.39099535,0.31501600,0.23881160,0.31661459,0.40006160,0.47918585,0.55721037,0.63798986,0.72585104,0.81022021,0.89938030,0.84508340,0.78889254,0.73261640,0.67525122,0.64303253,0.60930186,0.58731592,0.57012545,0.54141693,0.50939892,0.48049919,0.45028899,0.39951103,0.35214388,0.30598756,0.26300909,0.26858644,0.27146460,0.28261148,0.29380166,0.29160202,0.28663320,0.28384697,0.27999367,0.32684532,0.38396130,0.44805179,0.51146815,0.52493519,0.54057472,0.56472732,0.59034439,0.58135855,0.57145813,0.55747038,0.53927639,0.51679693,0.49243588,0.47863020,0.46301364,0.46944006,0.47212794,0.46075659,0.44867078,0.43966862,0.42712020,0.41025562,0.40007228,0.39989983,0.39340903,0.39552045,0.39406282,0.36368589,0.32704158,0.29538024,0.26652005,0.26833159,0.26612843,0.24974508,0.23426279,0.24453100,0.25922845,0.27101346,0.28534906,0.30956284,0.32692287,0.34477478,0.35727047,0.42107710,0.47981690,0.53843834,0.59189418,0.56061832,0.53511763,0.51117877,0.48816418,0.49629526,0.49858356,0.51101850,0.52203962,0.53626500,0.53906965,0.56243933,0.58525208,0.56507364,0.54948123,0.55001849,0.55223956,0.57553862,0.59474313,0.63690756,0.67391763,0.69977692,0.72598129,0.75718320,0.79041529,0.72882870,0.67112764,0.60454930,0.53951981,0.46207937,0.38380109,0.30160822,0.22087419,0.25999615,0.29330518,0.33639488,0.37674797,0.38927980,0.40949653,0.41911448,0.43223149,0.45601918,0.48087181,0.50503954,0.52507652,0.57462486,0.63185671,0.67755745,0.72874205,0.70785338,0.68961233,0.66446771,0.64468925,0.65972659,0.66870819,0.68142540,0.68965655,0.67682082,0.65639665,0.63606841,0.61529320,0.65977841,0.69347735,0.74013038,0.78406406,0.77312219,0.76274681,0.74828082,0.73000270,0.72989786,0.72686823,0.72400182,0.72127249,0.69276943,0.66238163,0.61987179,0.58202548,0.54427504,0.51127251,0.47011620,0.43353794,0.47677536,0.51611282,0.57347680,0.62908265,0.66572172,0.70531700,0.74102193,0.77511464,0.77582087,0.78124849,0.78920674,0.79966188,0.81954710,0.84411694,0.86474407,0.89195207,0.85061846,0.80109075,0.76852711,0.73724480,0.72311119,0.70956820,0.69363820,0.67972118,0.63555434,0.59775595,0.56643990,0.52949338,0.50908843,0.49224094,0.46173051,0.42315741,0.40818433,0.39114461,0.36297183,0.33020074,0.33737254,0.34523035,0.35166161,0.34936552,0.41926260,0.48858870,0.54477505,0.60407790,0.66358796,0.72334466,0.78360366,0.84771430,0.78739339,0.72610235,0.66504061,0.61467371,0.54882449,0.48389647,0.41268824,0.34535325,0.35087119,0.35640743,0.34804301,0.34027527,0.29479564,0.25078379,0.20728731,0.16541354,0.26347430,0.35817343,0.44356292,0.53799333,0.62841157,0.71724627,0.81717912,0.90806689,0.81659802,0.72613111,0.64106926,0.56052321,0.46143190,0.35722944,0.26397833,0.23246638,0.30230701,0.37344186,0.42988823,0.48285480,0.56479793,0.64407741,0.69812799,0.75771224,0.71852369,0.67840823,0.61993914,0.55925953,0.50264137,0.43708038,0.39033197,0.34741511,0.40634119,0.47384137,0.51621112,0.56100213,0.64008074,0.71728320,0.79791569,0.88199078,0.82743815,0.77698510,0.71857470,0.66061084,0.64519069,0.62088598,0.61973853,0.61381049,0.57753070,0.54275358,0.51610427,0.48688656,0.43422755,0.38650124,0.34236060,0.30775724,0.29362748,0.28957798,0.27846725,0.27214139,0.26536685,0.26250767,0.25845430,0.25088642,0.30176746,0.35881884,0.42208863,0.48372565,0.49908128,0.50883184,0.54116007,0.57411388,0.56314578,0.55202610,0.52983792,0.50632059,0.48101542,0.45299870,0.43264129,0.41274874,0.42934218,0.44466007,0.44489403,0.44978052,0.45188586,0.45477550,0.46346924,0.47379266,0.45921217,0.44809688,0.43746836,0.42429725,0.41136690,0.39981103,0.36985427,0.33624133,0.32712724,0.31706211,0.29599960,0.27466083,0.27348068,0.27478365,0.28069502,0.28733585,0.29681310,0.30179697,0.32290059,0.34054997,0.40397792,0.46253383,0.52470130,0.58808652,0.55352071,0.52040019,0.50897083,0.50187921,0.48905901,0.47838087,0.48188930,0.48822776,0.48793786,0.49134157,0.51266665,0.53679253,0.52156219,0.50573678,0.50891273,0.51619430,0.52903455,0.54879989,0.57573818,0.60266809,0.64632192,0.68822896,0.71716236,0.75297018,0.70880667,0.66331997,0.59822003,0.53796149,0.47645768,0.41628202,0.37171628,0.32110878,0.32018607,0.32318115,0.34617189,0.36175060,0.38274435,0.40943178,0.41412189,0.42481048,0.45532618,0.48267082,0.51962746,0.55099295,0.59275356,0.63478072,0.67990939,0.72790306,0.70318561,0.67583743,0.65209590,0.62553726,0.64300479,0.66103788,0.68002413,0.69474312,0.67824363,0.66433816,0.64261633,0.62023568,0.65644326,0.69203809,0.72577632,0.76063870,0.75143564,0.74437129,0.72559658,0.70235537,0.71953973,0.73114470,0.73232843,0.73547535,0.71490611,0.69516746,0.64949602,0.60901741,0.59072068,0.56918824,0.53100857,0.49581625,0.52655957,0.55550423,0.59974973,0.64582096,0.68023055,0.72199118,0.75347984,0.78550459,0.78173787,0.77229182,0.77379072,0.76658088,0.79576221,0.82132289,0.83321171,0.85117039,0.80492811,0.76008815,0.71608092,0.67301239,0.66368011,0.65482735,0.62844014,0.61065191,0.58790463,0.56684692,0.56089418,0.54539892,0.53925469,0.53408632,0.50032769,0.47301564,0.46163106,0.45281986,0.41745573,0.38436826,0.38983076,0.38600674,0.39618157,0.39715576,0.44776606,0.49789257,0.53239359,0.56801902,0.62930513,0.68559224,0.72089741,0.75954502,0.72332114,0.67985471,0.64899652,0.61929213,0.57421024,0.53289625,0.47330922,0.41999577,0.41434327,0.41127301,0.39210216,0.37460669,0.32899920,0.28857271,0.23848682,0.19439335,0.27290444,0.35502416,0.43264935,0.50390002,0.60126105,0.70513735,0.78067654,0.86173006,0.78370180,0.70579617,0.64422580,0.57939507,0.49129632,0.40246000,0.32173209,0.31511659,0.36676641,0.41760943,0.46421358,0.51872291,0.55765790,0.59855331,0.64765268,0.69592481,0.67050100,0.64937683,0.61563474,0.58007125,0.54180806,0.50794807,0.47221501,0.43840197,0.48179614,0.52674150,0.55606965,0.58590246,0.65599157,0.72992741,0.79735705,0.87142957,0.81903357,0.76847275,0.71566334,0.65702489,0.65065837,0.64738587,0.65278315,0.65167724,0.61710197,0.57830332,0.54772342,0.51186588,0.45736692,0.40520498,0.36703119,0.33020302,0.30614576,0.28901710,0.26629535,0.24567102,0.23349700,0.22584043,0.21965297,0.21049781,0.27259735,0.33239394,0.39453527,0.45277389,0.47313073,0.49266560,0.52289499,0.55877053,0.54391434,0.52123262,0.49784553,0.47470671,0.44992170,0.42835681,0.39973188,0.37513186,0.39479202,0.41067193,0.43376428,0.44944481,0.47104868,0.49014943,0.50985226,0.53377504,0.51379919,0.49917379,0.48401498,0.47147547,0.46414653,0.45753694,0.43920004,0.42618367,0.39832635,0.37786968,0.33959318,0.30495922,0.29728521,0.28095877,0.27524738,0.27121011,0.28837347,0.29996217,0.31810622,0.32828719,0.39461622,0.45275465,0.51733972,0.57079888,0.54903081,0.52769979,0.51207237,0.49053672,0.48079772,0.47069092,0.46287228,0.45166998,0.45215380,0.45898715,0.46420671,0.47201404,0.47019738,0.46486684,0.46241686,0.46139049,0.48448788,0.50542508,0.51863973,0.53158362,0.58173880,0.63070117,0.67753797,0.72661797,0.68031572,0.63978485,0.59547335,0.55534974,0.51017609,0.47273817,0.43836571,0.40012322,0.38015037,0.36526764,0.35667967,0.35044745,0.37886758,0.40400880,0.41342159,0.42827815,0.46178214,0.50273022,0.54716149,0.59549886,0.62812357,0.66294072,0.70358780,0.74156313,0.71078216,0.67210852,0.64004716,0.60194138,0.63336851,0.66547466,0.69148441,0.71699570,0.69139589,0.66461111,0.63753124,0.61008187,0.63954674,0.67223868,0.69395706,0.71924584,0.71727433,0.70907541,0.70289623,0.69074665,0.71504034,0.74005716,0.75362834,0.76663282,0.73945048,0.71837081,0.68752893,0.65484464,0.62707550,0.59942061,0.57409822,0.54730575,0.56922355,0.59361168,0.62505249,0.65657790,0.69839536,0.73469097,0.77532007,0.81447858,0.79880080,0.78121744,0.76363069,0.74817227,0.76647703,0.78506797,0.79563233,0.81129261,0.76850875,0.73001898,0.67728294,0.62656139,0.60721867,0.59004600,0.55802139,0.52681167,0.53364689,0.54936206,0.56076555,0.57861672,0.56502507,0.55191158,0.54020847,0.52895909,0.51173955,0.49762450,0.46692496,0.43711803,0.44690210,0.45171695,0.45778657,0.46381754,0.48838166,0.51808482,0.53686659,0.55983619,0.59897131,0.64591159,0.67304572,0.70667697,0.67882585,0.65865625,0.63881134,0.62561856,0.59081278,0.55815840,0.52935879,0.49575148,0.47344544,0.45479040,0.42721495,0.40016152,0.35399375,0.30546459,0.26225514,0.21639448,0.28685969,0.35368514,0.42230671,0.48236498,0.57707439,0.66229426,0.74373312,0.82477384,0.76373245,0.70375074,0.65808737,0.60928241,0.53612293,0.45835405,0.38649938,0.39348263,0.42733783,0.45836925,0.50370097,0.55292729,0.55671319,0.55810418,0.59514206,0.63230751,0.62126179,0.61880084,0.60525271,0.60190626,0.58776630,0.57292676,0.54613523,0.52560520,0.55346189,0.57772654,0.59025225,0.60740489,0.67886886,0.74709377,0.80221863,0.86008838,0.80970283,0.76564212,0.70663193,0.64758489,0.66362005,0.67133994,0.68268646,0.69484445,0.65444383,0.61915559,0.57814559,0.53779534,0.48044760,0.42333971,0.39046940,0.35956105,0.32064153,0.28293092,0.24709007,0.21372824,0.20215732,0.18487582,0.18089088,0.16580757,0.23822745,0.30822155,0.36744332,0.42999222,0.44942615,0.47242110,0.50900399,0.54911944,0.51969031,0.50077941,0.47079297,0.45113757,0.42294934,0.40282978,0.36724843,0.33281119,0.35923208,0.38273554,0.41419800,0.44989237,0.48896756,0.52439070,0.55670516,0.59446524,0.57276358,0.55256186,0.53588063,0.51729293,0.51690437,0.51831168,0.51131195,0.51481735,0.47307287,0.43748744,0.39005067,0.34051568,0.31917579,0.29147607,0.27205902,0.25323488,0.27602285,0.30173887,0.30822263,0.31612092,0.38087185,0.44781187,0.50530715,0.55981790,0.54768801,0.53243816,0.50708077,0.48651931,0.47298049,0.46186891,0.43902445,0.41390399,0.41735548,0.42717999,0.41886059,0.41571558,0.42315257,0.43051551,0.42086415,0.41027442,0.43563378,0.46119824,0.45921524,0.46257202,0.52378838,0.57767751,0.63628528,0.69506186,0.65703657,0.61454818,0.59114171,0.56538469,0.54286127,0.52750440,0.50378729,0.48341982,0.43821014,0.39852451,0.36947070,0.33377575,0.36516127,0.40179364,0.41151837,0.42913304,0.47197730,0.51300240,0.57480205,0.63522366,0.65668588,0.68717590,0.71718977,0.75646610,0.71363456,0.67310291,0.62811210,0.57822223,0.62248871,0.66387210,0.70350849,0.74230476,0.70377855,0.66469632,0.63262478,0.59742019,0.62764745,0.65360218,0.66744006,0.67935685,0.67854197,0.67680573,0.67475379,0.67189622,0.70906290,0.75274850,0.77486540,0.79650201,0.76513349,0.74063337,0.72100123,0.69654355,0.66101226,0.62745688,0.61614735,0.59927609,0.61186187,0.63098042,0.65240618,0.67178715,0.70978286,0.75225705,0.79274728,0.83837784,0.81303517,0.78622330,0.76022541,0.73175658,0.73991357,0.74932465,0.76269041,0.77316917,0.73282099,0.69555989,0.63206455,0.57179211,0.54778062,0.52255321,0.48089446,0.43883715,0.47972913,0.52604727,0.56419868,0.60851512,0.58870493,0.56909232,0.57536845,0.58488985,0.56232042,0.54701240,0.51408846,0.48830279,0.50684336,0.52328040,0.52478843,0.52492847,0.52880850,0.53482077,0.53620472,0.54533133,0.57228511,0.60567336,0.62774961,0.65440482,0.64337273,0.63087335,0.63067396,0.63203058,0.60437381,0.58074932,0.57941416,0.57165967,0.53755889,0.49841031,0.46140382,0.42573986,0.37368577,0.32072520,0.27640386,0.23679933,0.29460473,0.35733461,0.41023342,0.46355504,0.54172781,0.62439770,0.70408564,0.78512651,0.74004152,0.69603492,0.66593613,0.64346795,0.57838512,0.51712981,0.45290896,0.42573583,0.44686063,0.46215853,0.48536491,0.50885445,0.50753180,0.50365330,0.51713806,0.52952890,0.54208251,0.54618963,0.55454198,0.56142808,0.58667252,0.60857758,0.61581884,0.62339532,0.64157913,0.65626863,0.65788495,0.66807773,0.71707332,0.76505860,0.79926511,0.83676568,0.79844367,0.76070085,0.71547087,0.67031111,0.68271366,0.69637458,0.70720977,0.71909662,0.67344674,0.63328416,0.57501321,0.52293941,0.47186282,0.42445794,0.38342800,0.34613606,0.31235519,0.28896883,0.26554187,0.24735133,0.21241493,0.18448064,0.16560792,0.14886275,0.20225660,0.25303635,0.31153466,0.36987353,0.39260120,0.41981343,0.45040907,0.47650630,0.45797755,0.43551254,0.42031678,0.39710443,0.36913904,0.33474322,0.29897361,0.26472877,0.31432470,0.35830373,0.41520680,0.46697473,0.51435490,0.55401024,0.60179241,0.65039046,0.62636936,0.60377785,0.57545527,0.55723027,0.55039539,0.54428844,0.54293252,0.54113006,0.50037398,0.45456218,0.41571808,0.37674080,0.33314815,0.29255790,0.25851557,0.21380747,0.25294104,0.28940829,0.31679231,0.34169468,0.40159349,0.46457160,0.51051829,0.56238760,0.54319791,0.52441487,0.51081635,0.49190214,0.46369006,0.43425084,0.40419039,0.37525078,0.38677671,0.39710703,0.39845140,0.40092506,0.39210345,0.38015077,0.36610622,0.35438962,0.38190240,0.41074152,0.43104666,0.44756158,0.50881542,0.57120360,0.63305288,0.69098844,0.65407770,0.62032306,0.59741565,0.57815168,0.56952917,0.56279798,0.55409392,0.53951994,0.49588452,0.45272483,0.42134854,0.38854122,0.39761338,0.41076859,0.40163481,0.39507784,0.44208908,0.48858477,0.53659155,0.58462810,0.62375713,0.66271689,0.70375749,0.74792787,0.71059488,0.67343946,0.63756726,0.60363147,0.63517083,0.67303241,0.69871669,0.72348219,0.69365474,0.66894315,0.64197843,0.61959756,0.64658748,0.67106587,0.67685075,0.68427286,0.68745657,0.68841817,0.68455823,0.67728955,0.71818657,0.76089865,0.78931512,0.81301975,0.78565427,0.75865997,0.73290352,0.70731519,0.69366316,0.67645117,0.66448756,0.65122511,0.65907480,0.65711114,0.66880156,0.68323493,0.72707870,0.76970609,0.80797104,0.85218964,0.82557451,0.80267392,0.77000145,0.74502561,0.74020172,0.74451637,0.74591248,0.75061570,0.71180361,0.66673937,0.62232159,0.57558763,0.53191957,0.49587286,0.44984560,0.39899096,0.43943970,0.48427517,0.52657273,0.57413865,0.58106812,0.58927087,0.60977597,0.63274061,0.61130047,0.58135796,0.55129149,0.52419597,0.52831729,0.53586512,0.54270402,0.54991408,0.55132110,0.54894770,0.54587194,0.53433515,0.53797456,0.54325431,0.54767152,0.55128286,0.56510279,0.57878554,0.58553546,0.59822419,0.60464768,0.61530287,0.62900100,0.65098740,0.59231304,0.53944887,0.49935971,0.45223520,0.39471503,0.33728768,0.28729236,0.23229980,0.29517426,0.35408778,0.41513900,0.47913172,0.54061185,0.60455499,0.67427309,0.74301871,0.70428179,0.67491458,0.64263083,0.60631927,0.56381804,0.52766495,0.47477219,0.45825901,0.46418576,0.46132625,0.46536681,0.46572941,0.45964649,0.45032745,0.44121289,0.43571463,0.45512496,0.48318425,0.50388425,0.52136779,0.58210676,0.64422238,0.68293007,0.72228389,0.72682333,0.73461152,0.72978250,0.71795434,0.75147979,0.78365926,0.80096399,0.82122687,0.78976610,0.76343765,0.72617845,0.69058901,0.70422157,0.71502923,0.73129926,0.74622857,0.69337789,0.64445804,0.57840025,0.50981747,0.46923074,0.42410840,0.37729479,0.33011762,0.31108301,0.28753652,0.28367159,0.27960788,0.22387351,0.17242050,0.15686005,0.13542284,0.16887280,0.19937909,0.25467284,0.31231188,0.34200870,0.37130913,0.38532363,0.39984068,0.38713432,0.37401504,0.36243529,0.34552291,0.30675054,0.27249811,0.24049686,0.20353359,0.26593403,0.33156920,0.40725254,0.48555772,0.53862030,0.58929937,0.64934834,0.70735857,0.67821977,0.65032882,0.61901491,0.59499819,0.58521090,0.57504935,0.57292775,0.57162013,0.52243243,0.47335323,0.44130373,0.41408357,0.35211361,0.29991669,0.23819692,0.18131968,0.22779690,0.27156750,0.31976504,0.36188273,0.41826164,0.47606469,0.52269278,0.56803541,0.54467946,0.51555872,0.50868697,0.50033852,0.45424752,0.40586850,0.37072574,0.34043948,0.34878773,0.36411150,0.37419461,0.38244453,0.35857248,0.33722227,0.32049970,0.29749535,0.33140436,0.36356087,0.39899750,0.43681726,0.49931723,0.56383198,0.62453599,0.69043099,0.65455106,0.61934396,0.61020049,0.59654887,0.60204087,0.60612424,0.60336711,0.59824041,0.55530563,0.50636448,0.46868238,0.43350403,0.42638033,0.42175975,0.39524502,0.36473996,0.41453653,0.46577527,0.49605659,0.53141014,0.58643090,0.63951888,0.69169360,0.73918732,0.70848005,0.67336747,0.65012033,0.62319703,0.64903296,0.67957462,0.69260089,0.70853848,0.68607097,0.66657820,0.65351631,0.64437043,0.66638290,0.68756492,0.69205503,0.69225244,0.69758451,0.70328189,0.69741306,0.68597592,0.72578231,0.77155752,0.80355706,0.83474934,0.80558060,0.77743602,0.75382791,0.72161658,0.72476249,0.72138110,0.71324321,0.70614617,0.69983595,0.68594754,0.68987521,0.69233182,0.74077104,0.78476458,0.82832396,0.86346258,0.84418167,0.81926572,0.78175144,0.75257264,0.74497893,0.73766823,0.73331777,0.72710567,0.68792588,0.64096692,0.60916284,0.57220967,0.52102642,0.47431248,0.41157642,0.35777972,0.39652584,0.43584416,0.49088124,0.54170153,0.57261114,0.60591595,0.64475489,0.68542828,0.65067081,0.62408651,0.59209996,0.56406883,0.55354549,0.54976059,0.56426181,0.57873617,0.57048078,0.56621118,0.54323066,0.52625250,0.50157027,0.47424051,0.46794799,0.45321199,0.48749108,0.52723184,0.54511091,0.55845970,0.60174630,0.64470663,0.68624752,0.72750607,0.65549100,0.58274909,0.53355018,0.48133166,0.41955340,0.35437099,0.28897955,0.22890590,0.28936591,0.35255013,0.42451731,0.49302045,0.53742554,0.58668537,0.64641428,0.70024382,0.67658376,0.64740387,0.60795337,0.57401269,0.55513363,0.53900716,0.49622291,0.51204003,0.49874887,0.48205489,0.46337770,0.45079612,0.41475910,0.38306528,0.35111759,0.32004008,0.37454263,0.42073678,0.45808795,0.49880784,0.58353370,0.67471826,0.75506049,0.83239312,0.82203592,0.81415504,0.80629216,0.79561967,0.79524721,0.79358137,0.80279318,0.80109153,0.77407114,0.74426567,0.71436506,0.68558121,0.71338137,0.74763696,0.77087398,0.79981766,0.72705694,0.65814928,0.57811981,0.49979767,0.45160168,0.40491463,0.36162791,0.31381070,0.30388589,0.29101095,0.29709973,0.29440891,0.23704971,0.17548663,0.13078214,0.08501530,0.12617561,0.16562505,0.20477770,0.24679012,0.27316288,0.30035791,0.32302899,0.34283983,0.33600934,0.32655904,0.31260680,0.30454582,0.25805377,0.21995558,0.17044880,0.12496087,0.22177286,0.31247799,0.40821649,0.50135849,0.56332178,0.62544209,0.69018318,0.75736682,0.72539000,0.69077374,0.66533943,0.63362875,0.62821011,0.62330039,0.61223250,0.60582303,0.56327078,0.51485162,0.47488842,0.43694073,0.35926145,0.28357935,0.20520871,0.12959219,0.19272259,0.26136878,0.32823653,0.39492183,0.43996691,0.48729925,0.52811003,0.56873304,0.54753903,0.52650085,0.51177866,0.49735228,0.44106981,0.37937459,0.33943281,0.29065577,0.31568954,0.33494989,0.35438719,0.36796706,0.33775788,0.31366344,0.28117072,0.25210766,0.29014915,0.33062850,0.36112317,0.40074738,0.46702856,0.53340642,0.60580780,0.67603343,0.65589573,0.63668757,0.62133578,0.60033493,0.62034390,0.63874495,0.64459510,0.65450745,0.61414618,0.56486194,0.52607529,0.48559976,0.45359632,0.41989490,0.38216854,0.33790050,0.38768346,0.43287146,0.46361823,0.49459092,0.55946203,0.61837080,0.67747259,0.73765004,0.70629903,0.67476668,0.65419753,0.62686070,0.64951119,0.67449901,0.68765344,0.70081942,0.68483151,0.67371533,0.66940203,0.66407820,0.67682513,0.69175145,0.69924774,0.70633063,0.70560326,0.70917677,0.69572783,0.68623414,0.73297947,0.77536541,0.82596334,0.87033355,0.83818986,0.81159611,0.77663474,0.75094818,0.75663427,0.76215269,0.76249391,0.75998138,0.74973493,0.73101021,0.72418575,0.71212423,0.76432395,0.81437338,0.86397182,0.90603169,0.86771861,0.82647464,0.78521242,0.74895026,0.73973956,0.72785269,0.72963868,0.72563497,0.67809427,0.63253396,0.60286347,0.56989425,0.50149278,0.42774106,0.35857575,0.29207435,0.34791918,0.40099859,0.45823369,0.51376915,0.56707828,0.60909596,0.66798786,0.72114123,0.68241627,0.64070672,0.60549951,0.57151686,0.57800449,0.58418602,0.59426124,0.61129894,0.58924670,0.57208925,0.55179978,0.54183456,0.48743862,0.43546594,0.39230914,0.35371840,0.40686629,0.46203592,0.49992544,0.54237081,0.60821397,0.67224930,0.73740173,0.80324835,0.71954179,0.64344043,0.58027815,0.51465894,0.43825334,0.35507664,0.27845194,0.20377598,0.27171412,0.34775848,0.42656336,0.50682747,0.54480509,0.58435335,0.62926473,0.67673011,0.64157648,0.60682908,0.57983520,0.54645078,0.54886100,0.55123012,0.53225761,0.56423803,0.52931574,0.49774666,0.46319383,0.43153838,0.36960937,0.31114003,0.26172648,0.20799584,0.28738966,0.36455476,0.41867972,0.46854602,0.58709978,0.70970080,0.82363595,0.94194389,0.92108091,0.89965313,0.87904360,0.86851402,0.84053409,0.81021053,0.80027912,0.79063512,0.75817517,0.73105470,0.70980095,0.68285275,0.72962914,0.77875962,0.81144498,0.84767039,0.76072640,0.67378318,0.58066395,0.48883774,0.44022170,0.38606133,0.34379351,0.29443370,0.30015353,0.29808793,0.30703601,0.31889809,0.24472551,0.16958858,0.10842725,0.03788205,0.08390703,0.12751151,0.15920061,0.18436897,0.20608967,0.22742500,0.25701137,0.28794209,0.28143735,0.27456737,0.26954559,0.26188445,0.21410843,0.16217927,0.10368142,0.04883347,0.17168640,0.28918667,0.40491552,0.52434146,0.59277119,0.66808307,0.73713955,0.80998297,0.77082461,0.73232436,0.70020625,0.67235310,0.66912514,0.66629312,0.65273033,0.64670027,0.59930022,0.55454870,0.50669044,0.46431528,0.36685259,0.26783538,0.17546977,0.08128632,0.16660263,0.24432229,0.33875476,0.43319141,0.46187945,0.49657404,0.53804610,0.57417379,0.55595225,0.53408149,0.51784504,0.50081081,0.42587637,0.35345464,0.30490633,0.24556897,0.27659697,0.30747342,0.33224065,0.35759039,0.31688507,0.28370122,0.24431778,0.19995490,0.24977783,0.29550967,0.32681032,0.35841143,0.43299851,0.50752305,0.58371912,0.65970295,0.65546322,0.65225159,0.63156472,0.60677682,0.63600876,0.67160466,0.69490008,0.71551105,0.67123879,0.62669195,0.58436133,0.53914707,0.47650309,0.41930236,0.36827167,0.30987000,0.35901658,0.40473884,0.43501120,0.46000646,0.53293322,0.60081985,0.66615635,0.73651612,0.71078592,0.67986450,0.65560634,0.63504465,0.64974091,0.66886881,0.67959662,0.69668436,0.68507656,0.67837836,0.67937630,0.68431474,0.69133049,0.70603668,0.71066113,0.71936179,0.71921488,0.71662001,0.69980490,0.68476580,0.73649115,0.78071544,0.84533756,0.90671492,0.87005113,0.84381945,0.81021937,0.77404960,0.78563721,0.80333503,0.80761050,0.81828753,0.79895358,0.78004317,0.75453753,0.72495051,0.78475299,0.84112951,0.89599725,0.95323562,0.89055567,0.83175270,0.79167904,0.74415396,0.73261897,0.71588699,0.72134588,0.72215658,0.67081385,0.61572930,0.59590742,0.57175456,0.47384891,0.38253487,0.30915806,0.23078867,0.30102182,0.36688624,0.43069382,0.49165056,0.55430484,0.61701476,0.69288346,0.76729800,0.71550646,0.65891367,0.62332672,0.58198832,0.60398201,0.61847460,0.63001662,0.63972480,0.60542202,0.57542368,0.56448020,0.55237290,0.47556755,0.39760173,0.32472856,0.25077947,0.32421541,0.39671366,0.45411719,0.51734996,0.60973488,0.69929351,0.79023091,0.88154194,0.78774628,0.69271444,0.62594496,0.55311175,0.45781047,0.35890689,0.27138411,0.17498761,0.25932260,0.33764575,0.42978690,0.52222676,0.55014978,0.58532782,0.61685857,0.64674850,0.60904701,0.56802967,0.54338652,0.51564588,0.53686288,0.56437659,0.56276213,0.54465816,0.51474849,0.48864622,0.46072420,0.43255976,0.37196558,0.31916626,0.26957794,0.21885788,0.29260970,0.36159897,0.43444459,0.50597803,0.60636319,0.70540051,0.80968910,0.91123952,0.88958889,0.87343719,0.85602503,0.83489159,0.81079832,0.78805894,0.76730376,0.75002702,0.72589439,0.70318728,0.68528290,0.67000935,0.69656876,0.72600680,0.74462021,0.76260572,0.70914560,0.64583069,0.58517956,0.51983849,0.47644188,0.43661718,0.39049790,0.34148063,0.32649797,0.30947203,0.30360246,0.29883635,0.23328179,0.17396703,0.12314903,0.07159235,0.10981580,0.14733987,0.18325644,0.21322616,0.24333764,0.26984203,0.30525908,0.33913250,0.33489994,0.32877396,0.31758652,0.30280897,0.26413172,0.22409639,0.17597873,0.13624108,0.22382180,0.31888796,0.40857430,0.50426639,0.56508054,0.62576727,0.68696189,0.74701472,0.71358784,0.68608566,0.66923704,0.64401083,0.64672642,0.64133682,0.64098748,0.63752033,0.59295800,0.54761966,0.49847798,0.45297521,0.36098465,0.27461006,0.19310819,0.11047625,0.18549218,0.25610395,0.33361440,0.40444536,0.44341443,0.48345854,0.53379615,0.58947877,0.56242723,0.53658302,0.51115025,0.47585979,0.43635751,0.39771344,0.35577352,0.31705227,0.32191001,0.33253426,0.33110769,0.33735990,0.30033874,0.26201896,0.23096277,0.19767180,0.25340385,0.30871707,0.35925302,0.40661178,0.47256805,0.53847702,0.60188191,0.66916092,0.65757431,0.64526753,0.63263239,0.61849808,0.64185953,0.67221642,0.68215163,0.69826349,0.65874969,0.61828042,0.56477677,0.51446375,0.46738287,0.42429805,0.36687427,0.31095634,0.35359640,0.39698203,0.42817665,0.45672967,0.52176797,0.58102026,0.64484441,0.70611257,0.68508684,0.65796960,0.63464472,0.61416644,0.63173369,0.64500866,0.65303600,0.65936239,0.66030852,0.66316905,0.66326696,0.66096620,0.67320211,0.68927910,0.71104766,0.73015486,0.71823739,0.71086398,0.70321516,0.70095141,0.72173431,0.74773081,0.78430009,0.82053802,0.78940838,0.76383444,0.72848651,0.68894312,0.70132119,0.71682013,0.72634552,0.73227697,0.72158775,0.70734844,0.69312315,0.68002615,0.70728552,0.74127600,0.78496378,0.82343535,0.78639702,0.74910244,0.72583194,0.69844060,0.68453487,0.67564099,0.67983530,0.68191971,0.64964725,0.61384074,0.59588052,0.57756990,0.50618459,0.43438432,0.37359820,0.31410407,0.35551007,0.40397310,0.45388536,0.49694914,0.55333573,0.60662941,0.66054765,0.71192401,0.69058632,0.67274441,0.65108463,0.63061892,0.63583400,0.63600667,0.64221369,0.64439307,0.62860978,0.60532839,0.59464997,0.57743971,0.51034589,0.44294876,0.38231237,0.31925273,0.38020113,0.43733767,0.49478498,0.55061966,0.62843060,0.70464932,0.77989457,0.85778909,0.77838621,0.70092735,0.63415326,0.57500994,0.49375982,0.41540790,0.34791005,0.27675015,0.33118017,0.39510861,0.45766102,0.51537494,0.54557679,0.57310196,0.59258181,0.62051640,0.59055166,0.55992568,0.52853822,0.49317012,0.51974850,0.54186355,0.54591347,0.52883449,0.50587400,0.47836378,0.45219952,0.43101781,0.37686567,0.32084931,0.27293389,0.22686071,0.29135446,0.36201837,0.45417265,0.54759295,0.62323585,0.70533516,0.79090015,0.88379943,0.86486821,0.84958979,0.82448248,0.80387281,0.78105441,0.76645457,0.73595679,0.71088960,0.69365331,0.67319524,0.66514036,0.65918959,0.66553100,0.66844512,0.67711166,0.68488488,0.65067801,0.62460271,0.58409978,0.54289738,0.51263219,0.48626212,0.43163128,0.37943185,0.35202305,0.31427762,0.29438186,0.27599517,0.22187968,0.16978217,0.13469853,0.10150397,0.13107400,0.16263934,0.20272863,0.24116679,0.27499931,0.30915424,0.35106497,0.39550135,0.38534257,0.37923622,0.36310001,0.34816331,0.31531889,0.28174336,0.24985750,0.21996073,0.27842395,0.34484683,0.41755896,0.49010530,0.54000584,0.58946619,0.63388896,0.68711090,0.66155090,0.63818574,0.62795474,0.62226858,0.61829152,0.61394550,0.62604558,0.63044192,0.59130900,0.54658399,0.49631553,0.44162604,0.35602644,0.27174199,0.20761605,0.14342197,0.20462631,0.26907212,0.32368039,0.37795814,0.42577356,0.47457920,0.53928930,0.60321828,0.57111449,0.54452020,0.49847344,0.45740969,0.44893374,0.43649384,0.41271098,0.38784568,0.37403246,0.35723591,0.33416191,0.31377408,0.28113285,0.23964432,0.21949062,0.19858710,0.25793300,0.31901069,0.38507349,0.46127204,0.51440990,0.56591482,0.62303641,0.67699062,0.65795347,0.63494937,0.63102889,0.62524891,0.64798684,0.67046919,0.67316763,0.67753916,0.64666454,0.61131670,0.54900979,0.49229996,0.45754117,0.42786839,0.37033356,0.31114170,0.34979568,0.38532745,0.41740918,0.45237419,0.50875825,0.56111106,0.62384685,0.67917789,0.65954404,0.63810909,0.61920133,0.59143845,0.60701640,0.62664284,0.62478883,0.62763854,0.63884149,0.64644641,0.64118459,0.63274327,0.65617600,0.67357634,0.70494550,0.73947103,0.71902849,0.70366834,0.70525783,0.71077646,0.71280780,0.71693683,0.72149719,0.73171599,0.70663343,0.68291317,0.64411390,0.60522505,0.62193694,0.63084735,0.64186899,0.65155576,0.64632708,0.64400187,0.63459565,0.63133989,0.63606681,0.63859017,0.67076997,0.70029857,0.67916488,0.66747406,0.66007741,0.65338686,0.64180249,0.63601171,0.64120986,0.64396396,0.62206183,0.60993673,0.59907910,0.59094011,0.53331279,0.47628857,0.43456833,0.39236328,0.41732919,0.44058305,0.47317004,0.50531194,0.54879871,0.59151949,0.62667309,0.65622411,0.67012078,0.67969246,0.68195488,0.68357340,0.67114592,0.65778836,0.65659666,0.65077093,0.64135944,0.63461491,0.62088444,0.60701788,0.54657240,0.48238616,0.43911486,0.38848445,0.43745084,0.47769719,0.53441578,0.58344166,0.64794078,0.70652158,0.77527970,0.83859190,0.76982120,0.69865384,0.64500557,0.59586258,0.53229896,0.47360692,0.42558070,0.36930025,0.41165436,0.44855143,0.48018094,0.51842566,0.53878897,0.55806652,0.57651849,0.59512025,0.57249532,0.55789283,0.51577102,0.46869609,0.49200680,0.51925120,0.52551081,0.50864393,0.49554368,0.47250869,0.45641169,0.43106680,0.38053765,0.32360728,0.26684918,0.21549789,0.29729976,0.38844144,0.47688428,0.57471384,0.63818471,0.70614220,0.77769461,0.84617345,0.82704438,0.81911974,0.80129082,0.78146186,0.74981405,0.72306079,0.69191453,0.66624120,0.65695066,0.65009559,0.65402966,0.65157417,0.63688591,0.62498704,0.60946333,0.59934522,0.59082511,0.57993935,0.57854568,0.56863532,0.54167777,0.51219654,0.47500091,0.43565047,0.39125048,0.33960262,0.29342905,0.25067323,0.21673552,0.18169226,0.15226820,0.12067937,0.15509060,0.18905334,0.23342321,0.27511481,0.32237267,0.36302358,0.40096338,0.44099862,0.42971142,0.41113447,0.40507728,0.39604998,0.36850303,0.33504578,0.30813837,0.28325544,0.32753220,0.37410270,0.41932985,0.46750766,0.50909313,0.54387927,0.57738608,0.60593142,0.59318764,0.58701278,0.58260618,0.57858534,0.58804474,0.60069397,0.61334011,0.63118253,0.59169950,0.54998421,0.50140899,0.45361548,0.37486199,0.29432689,0.21988598,0.15374275,0.20466317,0.26133152,0.30962627,0.35560256,0.42087583,0.48336888,0.55157350,0.61695650,0.57515067,0.53826001,0.49304082,0.45125223,0.45149687,0.45936128,0.45553340,0.45786197,0.41768833,0.37949962,0.34937042,0.31024416,0.27607670,0.24643193,0.20494645,0.17354297,0.24704731,0.32858974,0.40834611,0.48938732,0.53311674,0.58123432,0.62611453,0.67166590,0.66111292,0.64890656,0.63473562,0.62118252,0.64594017,0.66136071,0.67714768,0.68725400,0.64145548,0.59229148,0.53832220,0.48310321,0.44861512,0.41755683,0.37153436,0.32325183,0.35849170,0.39040973,0.41631752,0.44007243,0.49432519,0.54340199,0.61055124,0.67270336,0.64772278,0.62367169,0.60410801,0.58371892,0.58721419,0.59516781,0.60147579,0.60932622,0.61373184,0.62416129,0.62005568,0.61463398,0.63867645,0.66869189,0.70926194,0.74375622,0.73315442,0.72055643,0.71557224,0.72046888,0.69930098,0.67711481,0.66460027,0.64763840,0.62202854,0.59964938,0.56474669,0.52870241,0.54530196,0.55563672,0.56423608,0.56860000,0.56879124,0.56689385,0.56694779,0.56699086,0.56685535,0.56146913,0.55665207,0.55298992,0.56455015,0.57315205,0.58060432,0.58606913,0.58658171,0.58843904,0.58820322,0.58616877,0.58170255,0.58380338,0.59204414,0.60187267,0.56107726,0.52512106,0.50034990,0.47381939,0.47894489,0.48415962,0.48681475,0.49708723,0.53275597,0.56998950,0.59509612,0.61623047,0.64772324,0.67327425,0.69539063,0.71097889,0.70143144,0.69456845,0.68118299,0.67309589,0.66720325,0.66472985,0.65884645,0.64897881,0.59252457,0.53931022,0.49228186,0.44966086,0.49176331,0.53316082,0.57959414,0.62551733,0.67694282,0.71855298,0.76953733,0.82199433,0.76470670,0.71381642,0.65882853,0.60785515,0.57161748,0.53709533,0.50837613,0.48268418,0.48810371,0.49673582,0.50723108,0.51790780,0.53364848,0.54673855,0.56507151,0.57937702,0.54889299,0.52510084,0.48582032,0.44913754,0.47346008,0.50126775,0.50593624,0.49207970,0.48001077,0.46949169,0.45560435,0.43775450,0.38048568,0.33001415,0.26945399,0.20521394,0.30595392,0.40782431,0.50429343,0.60102622,0.65673725,0.71489656,0.76017137,0.80580396,0.79294091,0.78599880,0.77046510,0.75583425,0.71750685,0.67758346,0.64747454,0.61858864,0.62168888,0.62730236,0.63495455,0.64806261,0.61127946,0.57762086,0.54687224,0.51342880,0.52850812,0.53664104,0.57270127,0.60298005,0.57164616,0.54400027,0.51579103,0.49366095,0.42729595,0.36534329,0.29459587,0.22184640,0.20929216,0.19217872,0.16631482,0.14167841,0.17935660,0.21570370,0.26315523,0.30621130,0.36294313,0.41743704,0.44811671,0.48510824,0.47080038,0.44592353,0.44347539,0.44507983,0.42203645,0.39721055,0.37531256,0.35144714,0.37457706,0.40330775,0.42732322,0.44814068,0.47337652,0.50308321,0.51274274,0.52545418,0.53335808,0.52999599,0.53541079,0.53608382,0.56031532,0.58033624,0.60772361,0.63124442,0.59051783,0.55687392,0.50748193,0.46381035,0.38721778,0.31696006,0.23993404,0.16139353,0.21062645,0.25760625,0.29291367,0.33009726,0.41039071,0.49171912,0.55714485,0.63061199,0.57867283,0.53240160,0.48921597,0.43877717,0.46150502,0.47860816,0.50098278,0.52756828,0.46397456,0.40097778,0.35432471,0.30970998,0.27689915,0.24909816,0.19360364,0.14381898,0.23995762,0.33688920,0.42925277,0.52416103,0.55958995,0.59800501,0.63159835,0.66659209,0.66386398,0.65502201,0.63503408,0.61798743,0.64194356,0.66172483,0.67870511,0.69400365,0.63189872,0.57397105,0.52632889,0.47390388,0.43847744,0.40630692,0.36860300,0.32501643,0.36318932,0.39768246,0.40770752,0.42083710,0.47691730,0.52605786,0.59331573,0.66116654,0.62771768,0.60064108,0.58519087,0.57405350,0.57012148,0.56326751,0.57900646,0.59174952,0.59809322,0.60167475,0.59311429,0.59002208,0.62992529,0.66303230,0.70970777,0.75016620,0.74102349,0.73293733,0.72828468,0.72865763,0.68017299,0.63746755,0.60151509,0.56873434,0.53984154,0.51548216,0.48569153,0.45140559,0.46426746,0.47960767,0.48381765,0.48866066,0.48942602,0.49284960,0.50276925,0.50831341,0.49440815,0.47968937,0.44380071,0.40966935,0.44468292,0.48409024,0.49902959,0.51930087,0.53535052,0.54688499,0.53999302,0.52796176,0.54436598,0.55329473,0.58466115,0.61688784,0.59575987,0.57066432,0.56834400,0.56141166,0.54457851,0.53033992,0.50468744,0.48137006,0.51456724,0.54970654,0.55798875,0.57128526,0.62025939,0.67509575,0.70794584,0.74738697,0.73783695,0.73453434,0.71337349,0.69141953,0.69589966,0.70004983,0.69817248,0.69806163,0.64576374,0.59106904,0.55426322,0.51457586,0.55229644,0.58872912,0.63035423,0.67034456,0.70159013,0.73513422,0.77231704,0.80524634,0.76471683,0.72623303,0.67415947,0.62103960,0.61078861,0.59059824,0.59370700,0.59621408,0.56891886,0.54957275,0.53861180,0.52158079,0.52900627,0.54072280,0.55062940,0.56513533,0.52717876,0.49035699,0.46148994,0.42613767,0.45676080,0.48234183,0.48671552,0.51856478,0.48517251,0.45425724,0.43402743,0.41368299,0.36183459,0.30891472,0.25010123,0.19108117,0.28496545,0.37393001,0.47772806,0.57784008,0.63412796,0.69408215,0.75330242,0.81909808,0.80217217,0.79499497,0.77115252,0.74916781,0.71918169,0.68333699,0.65289071,0.61809865,0.61516020,0.60851444,0.60259955,0.59444225,0.56396599,0.53386631,0.49692150,0.46318459,0.47977727,0.49841389,0.52466612,0.55118676,0.53922829,0.53056806,0.52188975,0.51912370,0.45599624,0.39539510,0.33387536,0.26779623,0.24014130,0.21725958,0.17649737,0.13709259,0.18826328,0.24266258,0.29208055,0.35102470,0.40237110,0.45731467,0.50485555,0.56032529,0.53129619,0.50981038,0.49530200,0.48811419,0.44980355,0.41724305,0.38691956,0.35732670,0.38553924,0.40976274,0.42623552,0.44495435,0.46447245,0.48258191,0.49597974,0.51374656,0.52203497,0.52318035,0.53509965,0.54096956,0.56739736,0.58830346,0.61956720,0.64979870,0.60071339,0.55120923,0.49419863,0.43852792,0.36823590,0.29433750,0.21413953,0.13062875,0.18609371,0.23770944,0.27964737,0.32149246,0.39287653,0.46221019,0.53591657,0.60476905,0.57304526,0.54316040,0.50502591,0.46838057,0.49386849,0.51494381,0.52907965,0.54857887,0.49358383,0.43691491,0.38853750,0.34377262,0.28413303,0.22919982,0.17635109,0.11966404,0.22161577,0.32132123,0.42313826,0.52785823,0.58727299,0.64087685,0.69621076,0.75403570,0.72856492,0.70160485,0.67193820,0.64397593,0.64462771,0.64761746,0.65063498,0.64980745,0.60515072,0.55970562,0.51976450,0.48020318,0.45463393,0.43049051,0.39893307,0.36923724,0.39310256,0.42526431,0.44486923,0.46427753,0.49258238,0.52903320,0.57653038,0.61986456,0.59206672,0.57006494,0.55024937,0.53024983,0.52574112,0.52847566,0.53769798,0.55292342,0.56884798,0.59346566,0.60506834,0.61902495,0.65206752,0.68929384,0.72330038,0.75953541,0.74210546,0.71484663,0.69936870,0.67540223,0.63099297,0.58192681,0.53916365,0.50111575,0.47106126,0.44978030,0.41744074,0.38401630,0.39220726,0.39619455,0.38673239,0.37916399,0.38573940,0.39925123,0.40909057,0.41861081,0.39778616,0.38342085,0.35801218,0.33390669,0.37013720,0.40948585,0.44321683,0.47311768,0.49711643,0.51423750,0.52101405,0.53161243,0.55086898,0.57004552,0.59967164,0.63231318,0.62420798,0.61752448,0.61360902,0.61372285,0.59117326,0.57052634,0.55028669,0.52419266,0.54957090,0.56949262,0.57662178,0.57789544,0.61701822,0.65636979,0.69329454,0.73348439,0.74185380,0.75113061,0.75017525,0.74556725,0.74498927,0.74166398,0.73570458,0.73012029,0.68638769,0.64645281,0.62068405,0.58703179,0.61961486,0.65379256,0.68558178,0.71078360,0.72920796,0.75250056,0.78241372,0.80914642,0.77973354,0.75396027,0.71905095,0.68097145,0.67854294,0.67172783,0.66543875,0.66017296,0.63749620,0.60586047,0.57756005,0.54116577,0.53681378,0.52978349,0.51542586,0.50506088,0.48515244,0.46164462,0.44929804,0.44013959,0.45703027,0.47685703,0.50015836,0.54079462,0.49104048,0.43969107,0.41437067,0.39189921,0.34092147,0.28669525,0.23036968,0.18274592,0.26239042,0.34586987,0.44813312,0.55433738,0.61447259,0.67652459,0.75255912,0.82488846,0.81131907,0.80294864,0.77178681,0.74298602,0.71896777,0.69447103,0.65274513,0.61746952,0.60593646,0.58937621,0.56405582,0.53988427,0.51098978,0.48689769,0.44734182,0.41041470,0.43272822,0.45441776,0.47368694,0.49684468,0.50602578,0.51433191,0.53200718,0.54513049,0.48817153,0.42671715,0.37075788,0.30743366,0.27311232,0.24143332,0.18579883,0.13404861,0.19731480,0.26407433,0.32456500,0.39207568,0.44413325,0.49525854,0.56467678,0.62855879,0.59994749,0.56425906,0.55051481,0.53624424,0.48747112,0.43507706,0.40273046,0.36585113,0.39008425,0.42237430,0.43023218,0.43764859,0.44880362,0.45722856,0.48106037,0.49553619,0.50531675,0.51510210,0.53186160,0.54375341,0.57013289,0.59231846,0.62775056,0.66587173,0.60600811,0.55330006,0.48206885,0.41906504,0.35044909,0.28186951,0.19413179,0.10453674,0.16572756,0.22253820,0.26861826,0.31394554,0.37198047,0.43056146,0.51217284,0.58587106,0.56960304,0.55306565,0.52359013,0.49593265,0.52795853,0.55807389,0.56019988,0.56293388,0.52110814,0.47334529,0.42439759,0.37424101,0.29302037,0.20762956,0.15363229,0.09417690,0.19552602,0.29936296,0.41882146,0.53563916,0.60805165,0.68578913,0.75712551,0.83666791,0.78667899,0.74317298,0.70343960,0.66834855,0.65118059,0.63263790,0.62219000,0.60935143,0.57847616,0.54883533,0.52109750,0.49251753,0.47572391,0.45843692,0.43037843,0.41240223,0.43130738,0.44925860,0.47129406,0.50301938,0.51559355,0.52755412,0.55143908,0.57945875,0.55733417,0.53066307,0.50605401,0.47779183,0.48921272,0.49409796,0.50476069,0.50957897,0.54592989,0.58571261,0.61449168,0.64421421,0.67546072,0.71509053,0.74623395,0.77449984,0.73700715,0.69907717,0.66440932,0.63050333,0.58170038,0.52871924,0.47878121,0.42961942,0.40369400,0.37927814,0.34750300,0.31611996,0.31419207,0.31345226,0.29027764,0.26679576,0.28249924,0.30089067,0.31172308,0.32680939,0.30576367,0.28335070,0.27113810,0.25386961,0.29768626,0.34068591,0.38900729,0.42996758,0.45794317,0.48536968,0.50497229,0.52938135,0.55496969,0.58510832,0.61497507,0.65089087,0.65223704,0.66291139,0.66179284,0.66898251,0.64413706,0.61682131,0.59167579,0.55914656,0.57950608,0.59468307,0.58837713,0.57746823,0.61287535,0.64354482,0.68346332,0.72088438,0.74276568,0.76714665,0.78326122,0.80665169,0.79327141,0.78218364,0.77537917,0.76705561,0.73301573,0.69789430,0.68451278,0.66334025,0.69135184,0.72362769,0.73417136,0.75056712,0.76031947,0.76579577,0.79366360,0.82156727,0.80127333,0.78331261,0.76544500,0.74320625,0.74581397,0.75159039,0.73834803,0.72847278,0.69799853,0.66921851,0.61182491,0.56176491,0.54015453,0.51796072,0.48198580,0.45150088,0.43727936,0.42470693,0.43400764,0.44589169,0.45887437,0.47284658,0.51029079,0.55332536,0.49977260,0.44559638,0.40509099,0.36421482,0.31585777,0.26697954,0.20903564,0.14432431,0.23354601,0.31998718,0.42282836,0.51909029,0.60464194,0.68845052,0.77435090,0.85714689,0.82467660,0.79557845,0.76117731,0.72146606,0.70057945,0.67762880,0.65001405,0.61823934,0.59020742,0.56276498,0.52634591,0.49527179,0.46838613,0.43935836,0.39703984,0.35238540,0.38261338,0.40586207,0.42376330,0.44202940,0.47708321,0.50479443,0.54773312,0.58308595,0.52241314,0.46144448,0.40313541,0.34079908,0.30046891,0.25821031,0.19565968,0.13970216,0.20715485,0.28174324,0.34343221,0.40551224,0.48006388,0.55122712,0.62550453,0.70374416,0.66494562,0.62454310,0.60186034,0.57792501,0.52164149,0.47206609,0.42853482,0.37863055,0.40049153,0.42732255,0.43357329,0.43991168,0.44930352,0.45999698,0.47281472,0.48323033,0.49395177,0.50106018,0.51460451,0.53224372,0.56371127,0.59316901,0.63361782,0.67345142,0.60746302,0.53701679,0.46846952,0.40181431,0.33273234,0.25335364,0.16371840,0.07496460,0.14057852,0.20562994,0.25005792,0.28835165,0.35635887,0.42343492,0.49630621,0.56924812,0.56346687,0.54908257,0.53840602,0.52873362,0.55502924,0.58495916,0.59854916,0.60708831,0.55524406,0.50578977,0.44710293,0.39266702,0.30284678,0.21543585,0.13481307,0.05280649,0.17390725,0.29722849,0.42480925,0.54434049,0.63748422,0.72088695,0.81266988,0.90406022,0.84060639,0.78465881,0.73365368,0.68875776,0.66161967,0.62879860,0.60316409,0.58018128,0.55217013,0.52699576,0.51136311,0.49412015,0.47585066,0.46307114,0.45130784,0.43861026,0.45224658,0.46267229,0.48982591,0.51724337,0.52682448,0.53028776,0.54220143,0.54767022,0.52224886,0.49049818,0.46878701,0.44047698,0.45015650,0.46319617,0.46573130,0.46745691,0.51645277,0.55739463,0.60984121,0.66359409,0.69469019,0.72879932,0.76007591,0.80132585,0.74213740,0.68614181,0.63632421,0.59106677,0.53020430,0.46694389,0.41150536,0.35705131,0.33551808,0.31649215,0.28895557,0.25459360,0.23895353,0.21836045,0.19145234,0.16373137,0.18470882,0.20083537,0.21622825,0.22836341,0.21412767,0.19916770,0.17639965,0.15438848,0.21735697,0.27496796,0.33443696,0.39594970,0.42368623,0.45816692,0.48167784,0.50862279,0.54373936,0.57842951,0.62227085,0.66643328,0.68006327,0.68800724,0.70360163,0.71442902,0.68847506,0.66128577,0.63320032,0.60179838,0.60336928,0.60963332,0.60242073,0.59348272,0.62028785,0.64951405,0.67864674,0.71270404,0.74599928,0.78113769,0.81913297,0.85522709,0.84248809,0.83344391,0.82077295,0.81176068,0.78803822,0.76307178,0.75561789,0.74236364,0.75916666,0.77563418,0.78794870,0.80236017,0.80248365,0.80288764,0.81520988,0.82053170,0.82003646,0.80890399,0.81186467,0.81159154,0.81539134,0.82126961,0.81397597,0.80982547,0.76380870,0.70771810,0.65650568,0.59727427,0.54941956,0.50432716,0.44908725,0.38703139,0.39892204,0.41226039,0.42602540,0.44098038,0.46493394,0.48650510,0.52172541,0.56447491,0.50719637,0.45124273,0.39389904,0.33309832,0.28788660,0.24977081,0.18107448,0.11060360,0.20416060,0.29104715,0.39402673,0.48925345,0.59383431,0.69641530,0.79134373,0.88818211,0.83705588,0.79048209,0.74714283,0.70723505,0.68832649,0.66683046,0.64178766,0.62424648,0.57805536,0.53539147,0.48999521,0.44809892,0.41537599,0.38960157,0.34162881,0.29854640,0.32670919,0.35332393,0.37263581,0.38523380,0.44690817,0.49835682,0.55960541,0.62181019,0.55897407,0.48966470,0.43549117,0.37579916,0.32384192,0.27410358,0.20348959,0.13653144,0.21693232,0.29811685,0.36360590,0.42429519,0.51916555,0.60963811,0.68796619,0.77468361,0.72734966,0.68777497,0.65621981,0.62008097,0.55838848,0.50478588,0.45217442,0.39454279,0.41419761,0.43226686,0.43178354,0.43688005,0.44986686,0.46423713,0.46985094,0.47355705,0.48280316,0.48292917,0.49996731,0.51900293,0.55975982,0.59447101,0.63918819,0.68091455,0.60174870,0.52233569,0.45474009,0.38727578,0.30918286,0.23578582,0.14030037,0.04521163,0.11408092,0.18784092,0.22528676,0.26760422,0.34397582,0.41153423,0.48261289,0.55711722,0.55457511,0.54987805,0.55716246,0.56140125,0.58555914,0.61170968,0.63337520,0.65284346,0.59392495,0.53760025,0.47516166,0.41411351,0.32042554,0.22331250,0.11828348,0.00968983,0.15489726,0.29441077,0.42464476,0.56138784,0.66111901,0.76215894,0.86480628,0.97204777,0.89652396,0.81734652,0.76451241,0.71075959,0.66678749,0.62860177,0.58924410,0.55179849,0.52746969,0.50302902,0.50169796,0.49161387,0.48298149,0.46950983,0.46442338,0.46249000,0.47506132,0.47961340,0.50924659,0.54048598,0.53758377,0.53989571,0.53009016,0.51673205,0.48317003,0.45324452,0.42313677,0.39455274,0.41926505,0.43957537,0.43492893,0.42868748,0.47919447,0.53225825,0.61000383,0.68716650,0.71504126,0.73921464,0.77843228,0.82488950,0.74585996,0.66873857,0.60800534,0.54625153,0.47681910,0.40777715,0.34733098,0.28596880,0.27063667,0.25626844,0.22239645,0.19396514,0.16298552,0.13003636,0.09180175,0.05102923,0.08152341,0.10766361,0.12007113,0.13659378,0.12288881,0.11717814,0.08932403,0.05625154,0.12813659,0.20158022,0.28185185,0.35591579,0.39013576,0.42858906,0.45932084,0.49589154,0.53514893,0.57704892,0.63307651,0.68591856,0.70063462,0.72136576,0.74599079,0.76746578,0.73429576,0.71089926,0.67442473,0.64292884,0.63559154,0.62664347,0.61307022,0.60349387,0.62331978,0.64993297,0.67681383,0.70273154,0.74999673,0.80337719,0.85294430,0.90348314,0.89468231,0.88486353,0.87411851,0.86227450,0.84818341,0.83029632,0.82817949,0.82401782,0.82820688,0.83063357,0.84416185,0.85897675,0.84632190,0.84377143,0.83484810,0.82889015,0.83376789,0.84057859,0.85731487,0.87822954,0.87964012,0.89057919,0.89307678,0.89887079,0.82740763,0.75284918,0.69361294,0.63242938,0.56040129,0.49431149,0.40937014,0.32774662,0.36320715,0.39634151,0.41881888,0.43665048,0.46787557,0.49901061,0.53345390,0.53868386,0.48717138,0.44461492,0.38837577,0.33006538,0.28501953,0.23918480,0.17834335,0.11882113,0.20370382,0.28313597,0.38121914,0.47201406,0.55043271,0.63454963,0.72417678,0.80790738,0.77963919,0.74235840,0.72147250,0.70134749,0.68099825,0.66898954,0.65558230,0.64551388,0.59555808,0.55436405,0.51722476,0.48516618,0.45693495,0.43203512,0.39161535,0.35158443,0.37580871,0.39407710,0.41416899,0.43159538,0.47755639,0.51992403,0.56232841,0.61088269,0.54353489,0.47730857,0.42501641,0.37666940,0.32050715,0.27000045,0.20267153,0.14199990,0.22041819,0.30419356,0.36909191,0.43531514,0.52899227,0.61975306,0.69812862,0.78541730,0.74770927,0.70980253,0.67621006,0.64009958,0.58304701,0.52754627,0.47665470,0.42910425,0.44501733,0.45992331,0.46479820,0.47523890,0.49026293,0.50147532,0.50265414,0.50189313,0.51569911,0.52380302,0.54243891,0.55897213,0.57603604,0.59533319,0.62300914,0.64283343,0.56535194,0.49165136,0.42312788,0.35594929,0.28045014,0.20329714,0.12310621,0.04917570,0.11132653,0.17453047,0.21708904,0.26540617,0.32250643,0.37639511,0.44465307,0.50371050,0.52289606,0.53231939,0.55287751,0.56559245,0.59053771,0.61775129,0.65244259,0.68669795,0.62519435,0.55950523,0.50371426,0.44304460,0.34748029,0.25215002,0.15878562,0.06432603,0.18745158,0.31306627,0.42301016,0.53877481,0.63759539,0.74396862,0.84934701,0.95953972,0.89216406,0.82863856,0.76781478,0.70561050,0.65688412,0.60879932,0.56476875,0.52195244,0.50399797,0.47972303,0.47728560,0.48009999,0.46420224,0.45284004,0.45140291,0.45232908,0.46553416,0.47917356,0.49860751,0.51660989,0.52620518,0.53853672,0.53494591,0.53822746,0.50867998,0.48129853,0.46315486,0.43894894,0.44234388,0.44583150,0.44083174,0.43247151,0.48040800,0.52786853,0.57955920,0.63043462,0.66305551,0.68920228,0.72861176,0.77090408,0.70902323,0.63963205,0.58415292,0.52976960,0.46240588,0.39706744,0.33637071,0.27237832,0.26788851,0.25912970,0.24810171,0.23699915,0.21209909,0.18716705,0.15200652,0.12362099,0.14308645,0.15971108,0.16429240,0.16622061,0.16315671,0.16510958,0.14600699,0.12842406,0.19713201,0.26168515,0.32850749,0.39253310,0.41887445,0.45430900,0.47934183,0.50890578,0.54293750,0.57185998,0.61735675,0.65658231,0.67593538,0.69593407,0.71989903,0.74137511,0.71813685,0.69588472,0.66648781,0.64340849,0.61187759,0.58777267,0.56691104,0.54693688,0.57145570,0.59570814,0.62263800,0.65142779,0.67798392,0.70741913,0.73661404,0.77249670,0.77873937,0.78151257,0.78551305,0.79185671,0.79384606,0.78959826,0.80711031,0.81821834,0.81954950,0.82206229,0.83560533,0.85632590,0.84410194,0.83356373,0.82839291,0.82937584,0.82649997,0.83008897,0.83903877,0.84817702,0.85339743,0.85154433,0.85051694,0.85317611,0.78260528,0.71995806,0.65706052,0.60061077,0.53508390,0.46764095,0.39522557,0.32954372,0.33958835,0.35699127,0.37434843,0.39472615,0.42732024,0.46768538,0.50484387,0.51349442,0.47455891,0.43482977,0.38196005,0.32431283,0.27901013,0.22933480,0.17685656,0.12665463,0.20146002,0.27681990,0.36769118,0.46037109,0.51224716,0.56843957,0.65144831,0.73775452,0.71964736,0.69775456,0.69783171,0.69628590,0.67996301,0.66777539,0.66257982,0.66486685,0.61571151,0.56852147,0.54363810,0.52172539,0.49815105,0.47816342,0.44198813,0.40842130,0.42015755,0.42915775,0.45309120,0.47307576,0.50542701,0.54246268,0.57201151,0.60212557,0.53321436,0.46515138,0.42119679,0.37123614,0.32067872,0.26612397,0.20395106,0.13929837,0.22526761,0.31605888,0.38134907,0.45093923,0.54107241,0.62790609,0.71273188,0.79176645,0.75838581,0.72906265,0.69387889,0.65657280,0.60681162,0.54793719,0.50957433,0.46340041,0.47671408,0.49485548,0.50523258,0.50646550,0.52486794,0.54139076,0.53675127,0.53484913,0.54600466,0.55657970,0.57716306,0.59968152,0.60033901,0.59577323,0.60073263,0.61125879,0.53673490,0.46027836,0.39597727,0.32632889,0.25004113,0.17524345,0.11071348,0.04279587,0.09864854,0.15890752,0.20838342,0.26508218,0.30389487,0.34139591,0.39797473,0.45521385,0.48714562,0.52031502,0.54286891,0.56993923,0.60087290,0.62713557,0.67349794,0.72543897,0.64894101,0.57495335,0.52831524,0.48074606,0.38228701,0.28121215,0.19638159,0.11517244,0.22005427,0.33292439,0.42076236,0.51182689,0.61936678,0.72235639,0.83871615,0.94701908,0.89451492,0.84187860,0.77001763,0.69805624,0.64177813,0.58057480,0.53863041,0.49175259,0.47106327,0.45415961,0.46116723,0.46320796,0.44737398,0.43042785,0.44155320,0.44871185,0.45699730,0.47138960,0.48457608,0.50128167,0.51739254,0.53890210,0.54786394,0.55511727,0.53443734,0.51031283,0.49437524,0.48209401,0.46996917,0.46103294,0.45122460,0.43643609,0.47544704,0.51697899,0.54762325,0.58013508,0.61024559,0.63720631,0.67798277,0.71674191,0.66849404,0.61365381,0.56624602,0.51269874,0.44418184,0.37644381,0.32349503,0.26118289,0.26639940,0.26716522,0.27341162,0.28002641,0.25873308,0.23695949,0.21434029,0.19626884,0.20210188,0.21259687,0.20165610,0.19523003,0.20684004,0.21669942,0.20987986,0.20290091,0.26373061,0.32485793,0.37366537,0.42475066,0.44900125,0.47683695,0.49864214,0.52446010,0.54554433,0.57028114,0.60183537,0.63660520,0.65359080,0.67624990,0.69598986,0.71907026,0.69722033,0.67786861,0.66146487,0.64694036,0.59693516,0.54100908,0.51715620,0.48948447,0.51424452,0.54201570,0.56951397,0.59465591,0.60397973,0.61057380,0.62452316,0.64234346,0.65782987,0.67857516,0.70229050,0.72888423,0.73762840,0.75126699,0.78685051,0.81726662,0.81728027,0.81082493,0.83640420,0.85729611,0.84195779,0.82745347,0.83182259,0.83095973,0.82512597,0.82092742,0.81850871,0.82076976,0.81630583,0.81640234,0.81489858,0.80778817,0.74644257,0.68333378,0.63027134,0.57114354,0.50674804,0.44490873,0.38623322,0.32805503,0.31868212,0.31485408,0.33107094,0.34517435,0.39150517,0.43812324,0.47590353,0.47528538,0.43966211,0.40791433,0.36888834,0.33339570,0.28495013,0.23774634,0.18103301,0.12735136,0.19912695,0.27513166,0.35087131,0.42852843,0.47399037,0.51935643,0.58543552,0.65297724,0.65584852,0.66515579,0.66703255,0.67971191,0.66867362,0.66378692,0.66694624,0.66601418,0.63680344,0.60875421,0.57748383,0.55229661,0.53182771,0.51513605,0.47919009,0.44322490,0.45946882,0.47322251,0.48966711,0.50400537,0.52133424,0.53636368,0.55700247,0.58509974,0.51656891,0.45797570,0.41301315,0.37655511,0.32600581,0.27187512,0.20876712,0.14239701,0.23246369,0.31378654,0.38354781,0.45097664,0.54765685,0.63793342,0.72880310,0.81789702,0.78889061,0.75701351,0.72437563,0.68891535,0.64319351,0.59176223,0.53805722,0.48383911,0.50625186,0.52500329,0.54211140,0.56439491,0.56428353,0.56900746,0.56245914,0.56065193,0.57827752,0.59835868,0.61758865,0.63640441,0.61762954,0.60060678,0.58137302,0.56341009,0.49687413,0.42649470,0.35850382,0.29160963,0.22672327,0.16232478,0.09471700,0.03291324,0.09279032,0.15312505,0.19519671,0.24358480,0.28300238,0.31873190,0.35808555,0.39912079,0.44256029,0.48155436,0.52339628,0.56289650,0.60673384,0.64568852,0.70157901,0.75787368,0.68838019,0.61542684,0.56036481,0.50551120,0.41660805,0.32561532,0.24050024,0.15586519,0.24882502,0.34151094,0.42252766,0.50604719,0.61176884,0.71860085,0.83703829,0.94693219,0.89138459,0.82713095,0.76491487,0.69557949,0.62722727,0.56430924,0.50166421,0.44369422,0.44465380,0.44337353,0.44362234,0.44022973,0.43374272,0.42942317,0.42305026,0.42377565,0.43808678,0.44802834,0.46020675,0.47390473,0.49849222,0.52993909,0.55339619,0.58322470,0.55935692,0.53519374,0.51877021,0.50666477,0.50164485,0.49036889,0.47269737,0.45947993,0.47577581,0.48955560,0.50829366,0.52918382,0.56853255,0.60795295,0.64243055,0.68111592,0.63643133,0.59355314,0.54526982,0.49356026,0.43491255,0.37635968,0.31875403,0.25595465,0.27368783,0.28740498,0.30383797,0.32133327,0.30641640,0.28717318,0.27691726,0.26794645,0.26852915,0.26135325,0.24936242,0.23278926,0.24769679,0.25704681,0.25805076,0.25901539,0.30615556,0.35655072,0.41282346,0.46392372,0.48531012,0.50383203,0.52468472,0.54157465,0.55644722,0.56574535,0.57886980,0.59789380,0.62817129,0.65746945,0.68517457,0.71527317,0.69041892,0.66955666,0.65385816,0.63403883,0.58159132,0.53033397,0.47623975,0.42405162,0.45993177,0.49197491,0.52380741,0.54888422,0.53275218,0.52108447,0.51476943,0.50688391,0.54732856,0.58234461,0.61352787,0.64855954,0.69110110,0.72865118,0.76924509,0.80820549,0.81127643,0.81121267,0.83453413,0.85174528,0.83969725,0.82571341,0.83197721,0.82962951,0.82837147,0.81796537,0.80987103,0.80505479,0.79655706,0.78640085,0.77835347,0.76752010,0.71064162,0.65527801,0.59711976,0.54101098,0.48384594,0.42480761,0.36725536,0.31108988,0.30357004,0.30255629,0.30129237,0.29555259,0.34157534,0.38342717,0.42797854,0.43705967,0.40664745,0.37640234,0.35973776,0.34428260,0.29338833,0.25008214,0.18717569,0.13114277,0.20110634,0.26904967,0.33801163,0.40542909,0.43813576,0.46756675,0.52295096,0.57132771,0.60105528,0.62783906,0.64348641,0.66096136,0.65938037,0.66041834,0.66721316,0.67354048,0.65546967,0.64138502,0.61115448,0.58265722,0.56939422,0.55152279,0.51927961,0.48185704,0.50009970,0.50889837,0.52491115,0.54222299,0.53606786,0.52635870,0.54743536,0.56866706,0.50365060,0.44360932,0.41073925,0.37840673,0.32625994,0.27960799,0.21322254,0.14582686,0.23638443,0.31889893,0.39019069,0.45642095,0.55258231,0.64533649,0.74829808,0.85148003,0.82055274,0.79193052,0.75586646,0.72594323,0.67980615,0.63379039,0.56815616,0.50471177,0.53176164,0.55620463,0.58338983,0.61296538,0.60399415,0.59695342,0.59472606,0.58375568,0.61089067,0.64223378,0.65479939,0.67720395,0.63647338,0.60636278,0.56217827,0.51684984,0.45131962,0.38598064,0.32231355,0.24870435,0.19838002,0.13883457,0.08421934,0.02158884,0.08298243,0.14914550,0.18495994,0.22093924,0.25807337,0.28976645,0.31907800,0.34417518,0.39605190,0.44384058,0.49929288,0.55638697,0.61327892,0.66410594,0.72923294,0.79336021,0.72389800,0.65509472,0.59246732,0.53569481,0.44820770,0.36874118,0.28560783,0.20202951,0.27719594,0.34549796,0.42205643,0.50053579,0.60532208,0.71125969,0.83442283,0.95391727,0.88304747,0.82039821,0.75488934,0.69496009,0.61754937,0.54164266,0.46944753,0.39358316,0.41263168,0.42502812,0.42338468,0.42281849,0.42165574,0.42478319,0.40963293,0.39667160,0.41195394,0.43273879,0.44240670,0.44903254,0.48443200,0.51622644,0.56661120,0.61150092,0.58323864,0.55641165,0.54704768,0.54004069,0.52886897,0.51806332,0.49827463,0.47937266,0.46776453,0.46169896,0.47128027,0.47317342,0.52441128,0.57430983,0.61068708,0.64657419,0.60767144,0.57569452,0.52616503,0.47763254,0.42684970,0.38033213,0.31437071,0.24234779,0.27333466,0.30531263,0.33419127,0.36732814,0.34951575,0.33569980,0.34029810,0.34597058,0.32748578,0.31613706,0.29431309,0.27202619,0.28805944,0.30771279,0.31067628,0.31422046,0.35768450,0.39623817,0.44931382,0.50554667,0.51756997,0.53680455,0.54772326,0.55700812,0.56163992,0.56200444,0.56120376,0.55280027,0.59818646,0.64527214,0.67357372,0.70167794,0.67726446,0.65493511,0.64444076,0.62925122,0.56857291,0.51381384,0.43554095,0.35509481,0.40057557,0.44686383,0.47600526,0.50302008,0.46477794,0.42371920,0.40425060,0.37274192,0.43166608,0.48552081,0.52654433,0.56764566,0.63674357,0.71241942,0.75924008,0.80272663,0.81047570,0.81132469,0.83311966,0.85523762,0.84220622,0.82444797,0.82863769,0.83653647,0.82473718,0.81773136,0.80238039,0.78793863,0.77106034,0.75183333,0.73991664,0.72429889,0.67223830,0.62276206,0.56617666,0.51481853,0.45912450,0.40474455,0.35066132,0.29648019,0.29219731,0.28728302,0.26768230,0.24270290,0.29118436,0.33453012,0.38469705,0.38170935,0.37020533,0.35150582,0.33809644,0.32304827,0.27395205,0.22528798,0.16752175,0.11470449,0.17601307,0.24087104,0.30366287,0.36884697,0.39849594,0.42552934,0.46309474,0.50798458,0.53691344,0.56744192,0.58988199,0.61349176,0.64526128,0.67251692,0.69756167,0.72387399,0.71058759,0.69486274,0.67274694,0.64712344,0.63238588,0.62402403,0.60059808,0.58409458,0.57397702,0.56136323,0.56481251,0.56749730,0.54279926,0.51505504,0.50312140,0.49030723,0.45176887,0.41170617,0.37448376,0.34238567,0.30399018,0.26078466,0.22151853,0.17046254,0.25846193,0.34482652,0.41593030,0.49137239,0.58128828,0.67155975,0.75755549,0.84671589,0.81194666,0.77236187,0.73922328,0.71044430,0.69078792,0.66418460,0.62959330,0.59227653,0.61570919,0.63015432,0.64252203,0.65495216,0.65339359,0.65167688,0.64992304,0.65479798,0.65479840,0.65808996,0.64997809,0.64708640,0.61012330,0.57660495,0.54275132,0.50388018,0.44524894,0.38591300,0.32311233,0.25927274,0.20569020,0.15332640,0.09028497,0.02695507,0.08372544,0.13325942,0.17889667,0.21496848,0.24385344,0.27117460,0.29668213,0.32022381,0.37815054,0.44101649,0.51091313,0.57722252,0.64013117,0.70075957,0.76770956,0.84028808,0.75822793,0.67845152,0.60339484,0.52382617,0.44692207,0.36530403,0.29093323,0.21437652,0.29196172,0.36633928,0.45567974,0.54265234,0.63813833,0.73837843,0.84777377,0.95100221,0.87973268,0.81249215,0.74550803,0.68454918,0.61689410,0.54267712,0.47170426,0.39898116,0.40076436,0.40162609,0.40663325,0.40524017,0.39604562,0.39145974,0.37614842,0.36488579,0.39337726,0.42706678,0.44245573,0.46193764,0.49779176,0.53234185,0.57141828,0.60983796,0.58461931,0.55512476,0.54084707,0.52950743,0.50954737,0.49076727,0.47328347,0.45871966,0.46287324,0.46662818,0.47398435,0.48663934,0.52422427,0.55885608,0.57918053,0.60530781,0.57564369,0.55059202,0.51104719,0.48045871,0.42125456,0.36973903,0.31614952,0.26457011,0.29548835,0.33149498,0.35225973,0.38125535,0.37973523,0.37297116,0.37710831,0.37658429,0.36245143,0.35401243,0.35000294,0.34198789,0.34633351,0.34438163,0.34358881,0.34680716,0.38193587,0.41570281,0.45318600,0.49169877,0.51654751,0.54038482,0.55954572,0.57923784,0.59117283,0.59807845,0.59260344,0.59477208,0.63289522,0.67572330,0.70711466,0.73386285,0.70437653,0.66837651,0.64468959,0.62111639,0.54962333,0.48387705,0.41248587,0.34077751,0.36511644,0.39199382,0.40783502,0.42799472,0.38927359,0.35234145,0.31674974,0.28769060,0.36037284,0.43370268,0.48859774,0.54854367,0.62407139,0.70483141,0.77634483,0.85308521,0.85000333,0.85247311,0.85890147,0.86046816,0.85722897,0.85204038,0.84492931,0.84524995,0.82185644,0.80502342,0.78587677,0.76830277,0.75748860,0.74849576,0.74561585,0.73466669,0.67394669,0.62100618,0.55172711,0.48837803,0.41778146,0.34661854,0.28582993,0.21849035,0.23124222,0.24682259,0.24353475,0.24026491,0.27888373,0.32118897,0.34872128,0.32717319,0.33165796,0.33359890,0.31786413,0.30370122,0.25173950,0.20034221,0.14540466,0.09664687,0.15496517,0.20990306,0.27074679,0.33168317,0.35892958,0.38158675,0.41343167,0.43924663,0.47623016,0.51197563,0.53958757,0.56486052,0.62841538,0.69113298,0.73063598,0.77888952,0.76288355,0.75537680,0.72619341,0.70393465,0.69985771,0.69548913,0.69247386,0.68761248,0.64885629,0.61050416,0.60288672,0.59703807,0.55092845,0.50185277,0.46121035,0.41582420,0.39811404,0.37948615,0.34213860,0.30000808,0.27781919,0.24927367,0.22414719,0.19969165,0.28662611,0.37253233,0.45183796,0.52713803,0.61150105,0.70130854,0.77378776,0.84537993,0.80124768,0.75611718,0.72817013,0.69184516,0.69984186,0.70358151,0.69206124,0.68509114,0.69026420,0.70698497,0.69775772,0.69251953,0.69846998,0.70118069,0.70760746,0.71872425,0.69723888,0.68258888,0.64662212,0.61596004,0.58479598,0.55306802,0.52175913,0.48655159,0.43472305,0.38863350,0.32197363,0.25853314,0.21652229,0.17218293,0.09575397,0.02705446,0.07583942,0.12576530,0.16536255,0.21165679,0.22971451,0.25621968,0.27063837,0.29427916,0.36298859,0.43832983,0.51622804,0.59033667,0.66409761,0.73571148,0.81386155,0.88917054,0.79535473,0.69821551,0.61019765,0.51551898,0.43674585,0.35551542,0.29318444,0.23450351,0.31389794,0.38857632,0.48648399,0.58193780,0.67068612,0.76682950,0.86298689,0.95760826,0.87976912,0.79877015,0.73935901,0.67505078,0.60690793,0.54671368,0.47250489,0.40141606,0.39126945,0.38025463,0.38429107,0.38547855,0.37143923,0.36416738,0.34822929,0.33180779,0.37693673,0.42554667,0.44796997,0.47743168,0.51261467,0.54169831,0.57269276,0.61165233,0.57841584,0.55142715,0.53231046,0.51730010,0.48920861,0.46156575,0.44667521,0.43620683,0.44788879,0.46671913,0.48173584,0.49975837,0.52285217,0.54458953,0.55733578,0.56292225,0.54434237,0.52193684,0.49854601,0.47966764,0.42049052,0.35714887,0.32247066,0.29083875,0.32193034,0.35570819,0.37221339,0.39139906,0.40272479,0.41269090,0.40515038,0.40623708,0.39541617,0.39042857,0.39771696,0.40868850,0.39539802,0.38380057,0.38000510,0.37401800,0.40071955,0.42539664,0.45963985,0.48261534,0.52084247,0.55272808,0.58095148,0.60884108,0.61949701,0.63101787,0.63103553,0.62824616,0.66852309,0.71267638,0.73958959,0.76504375,0.72532611,0.68171843,0.64606380,0.61521364,0.53295769,0.45639136,0.39192023,0.32813646,0.33556423,0.34324374,0.34944806,0.35411298,0.31410973,0.27070271,0.23524565,0.19776439,0.29056138,0.38685806,0.45517046,0.51962437,0.60843947,0.69718700,0.80071594,0.90372798,0.89867736,0.89522770,0.88110259,0.87128051,0.87506570,0.87306511,0.85892150,0.84917100,0.82161246,0.79438850,0.77276646,0.74981244,0.75215660,0.74618170,0.74902156,0.74209193,0.67919486,0.61579416,0.53351389,0.46197447,0.37658901,0.29301979,0.22230467,0.14311123,0.17957970,0.21176968,0.22072414,0.23283225,0.26435237,0.30340083,0.31365697,0.28682295,0.28393256,0.29005139,0.28767709,0.28263689,0.22461073,0.16777416,0.11552286,0.05961224,0.11603733,0.17433116,0.24048655,0.29913810,0.32184463,0.34011852,0.35112109,0.37158771,0.41772819,0.46491295,0.50011818,0.53702464,0.60633212,0.68091308,0.75226389,0.81926264,0.81333854,0.79820221,0.78889632,0.77693563,0.77109574,0.76750902,0.76745273,0.76958721,0.72700213,0.68003889,0.64917832,0.61546181,0.55272028,0.48421059,0.42529224,0.36188543,0.34654893,0.32556090,0.29898155,0.27068511,0.25862764,0.24452619,0.22193400,0.20226703,0.29020622,0.38519473,0.47346390,0.56673381,0.64009231,0.71278422,0.77652845,0.84713383,0.80851667,0.76764679,0.72788558,0.69006589,0.71382641,0.72875122,0.74461180,0.74944674,0.75370379,0.75918471,0.75276198,0.75167777,0.75574071,0.75977872,0.76996629,0.78168211,0.73545286,0.68642779,0.63998849,0.58805447,0.56138845,0.53578893,0.50199282,0.47160495,0.42463262,0.37966688,0.32810971,0.27328757,0.21323703,0.15380426,0.08674627,0.01287161,0.06923140,0.12159020,0.16123722,0.20263101,0.21747707,0.22877728,0.23480460,0.23957477,0.33560554,0.42196402,0.51970386,0.62221751,0.69925937,0.77514100,0.85995113,0.93980650,0.83413100,0.73099651,0.61844098,0.50769864,0.44266046,0.37239675,0.30575397,0.23503223,0.32666916,0.41600453,0.51780007,0.61974716,0.70053775,0.78581557,0.87771359,0.96630919,0.88460662,0.80272862,0.72545593,0.64904549,0.59281012,0.53241666,0.47683560,0.41640627,0.39689703,0.37031472,0.36339285,0.35127458,0.33838626,0.32598745,0.31232563,0.29696093,0.35231019,0.40221602,0.45127364,0.50056793,0.52840394,0.55688065,0.58312395,0.60765368,0.57891029,0.55313734,0.52664219,0.49556300,0.47386706,0.44875121,0.43116752,0.41296046,0.42883227,0.45256168,0.48139276,0.50749714,0.51641337,0.51728506,0.52961090,0.53779134,0.52363790,0.50434475,0.49045689,0.47803601,0.41923159,0.36407694,0.33042084,0.29374954,0.32524523,0.35927479,0.39910262,0.43378528,0.43852561,0.44275244,0.43170218,0.42423326,0.44181703,0.44913264,0.46802757,0.48716942,0.46679472,0.44585859,0.43521921,0.42157452,0.43675381,0.45796389,0.47268316,0.49490556,0.52487941,0.55445142,0.58608687,0.61660136,0.63109279,0.64091128,0.65401800,0.66319517,0.70631585,0.75095162,0.77982592,0.80962641,0.75820379,0.70065927,0.65496781,0.60920762,0.52632017,0.44403019,0.36195619,0.28494850,0.28353650,0.28561488,0.28947895,0.29428744,0.24871285,0.20402158,0.15961478,0.11514425,0.21538936,0.31580391,0.40021490,0.48955888,0.60508042,0.71167475,0.82933670,0.93844277,0.93227844,0.92588839,0.91351910,0.90063216,0.89251790,0.88943001,0.88157909,0.86627775,0.83420113,0.79711956,0.77125093,0.74548589,0.74777094,0.75687316,0.76181732,0.77145126,0.68017033,0.59403877,0.50663510,0.41116872,0.33040149,0.24657881,0.16044247,0.07652560,0.12135282,0.16463029,0.19618828,0.22697690,0.24757883,0.27162898,0.27940904,0.24107292,0.24018365,0.24116217,0.25402377,0.27149704,0.20719049,0.13869165,0.07788261,0.01550389,0.07700491,0.13566042,0.20499239,0.27250964,0.28631848,0.29770274,0.29966343,0.29850451,0.35994062,0.41728686,0.45932647,0.49835179,0.58369663,0.66950886,0.76712205,0.86542601,0.85597742,0.85103828,0.84760999,0.84988923,0.84343727,0.84230435,0.84486252,0.85445313,0.80087761,0.74952065,0.69143277,0.64020844,0.55481516,0.46646797,0.38543723,0.30471830,0.29150160,0.27536030,0.25552975,0.23805778,0.23834519,0.23848662,0.22606845,0.20638756,0.30127336,0.39200247,0.49838381,0.60909936,0.66578399,0.72247116,0.78868414,0.85702549,0.81397419,0.77335379,0.73367394,0.68720005,0.72632080,0.76156299,0.79093399,0.82528772,0.81982119,0.81120008,0.81340495,0.81506722,0.80994940,0.80918622,0.82987788,0.85045081,0.77492160,0.69574417,0.63251621,0.56017749,0.53979629,0.51540294,0.49021970,0.46084985,0.41746543,0.36938056,0.33216921,0.28909149,0.21667895,0.13949240,0.07398200,0.00020952,0.05803310,0.11726664,0.15437392,0.19200950,0.19727699,0.21078657,0.20210460,0.19030548,0.29668181,0.40482524,0.53038070,0.65441212,0.73574733,0.81706317,0.90804547,0.99790415,0.87861297,0.76534686,0.63248175,0.49681800,0.44413931,0.39234033,0.31522613,0.23979531,0.33948862,0.44165558,0.54553464,0.65531333,0.73210190,0.81372602,0.89231946,0.98038042,0.89044807,0.80447218,0.71715506,0.62486472,0.57458585,0.51804406,0.47208942,0.42597197,0.39767769,0.36034757,0.33913856,0.31246631,0.30420520,0.29445348,0.28003257,0.26546243,0.32515200,0.38353136,0.45449920,0.53147028,0.54764237,0.57379281,0.58394556,0.60334581,0.57890629,0.55066321,0.51597759,0.47975678,0.45214271,0.42699027,0.40922819,0.38690280,0.41002836,0.43643809,0.47541318,0.52000533,0.50854726,0.49130744,0.50094863,0.51027760,0.49474069,0.48401473,0.47584448,0.47438677,0.42469975,0.36831958,0.33126686,0.29113282,0.33025474,0.36479405,0.41845950,0.47402226,0.47018720,0.47193574,0.45695683,0.44917627,0.48275331,0.51408594,0.53432023,0.56330611,0.53618217,0.51132588,0.48640348,0.46399993,0.47219768,0.48202662,0.48830952,0.49794794,0.52419273,0.55010674,0.59490955,0.63287707,0.64296548,0.64801995,0.67354998,0.69714546,0.73838566,0.78822068,0.82163951,0.85726590,0.78568773,0.71628411,0.65868376,0.60153035,0.51294772,0.43283169,0.33954381,0.24149538,0.24200075,0.23419569,0.23721763,0.23798113,0.18733592,0.14087461,0.08339577,0.02231395,0.13626111,0.24213564,0.35209041,0.45868314,0.59610805,0.73258833,0.85388240,0.98283188,0.96826144,0.95718787,0.93852771,0.92873218,0.92038928,0.91158603,0.89568953,0.88933852,0.84437871,0.79729528,0.76782502,0.73670158,0.74761902,0.75938364,0.77870800,0.79710832,0.68509098,0.57471347,0.47401391,0.36441902,0.28492976,0.20233512,0.10885911,0.00709324,0.06070181,0.11411880,0.16998721,0.21996720,0.23333098,0.24259750,0.24008599,0.22601223,0.23039781,0.24168236,0.25851413,0.27261717,0.23401615,0.18614168,0.15089837,0.11540022,0.15655757,0.19849254,0.24157869,0.28673580,0.29627784,0.30757832,0.31242356,0.31564736,0.35827680,0.39874538,0.43753396,0.47957881,0.56456429,0.64495738,0.72806524,0.80445407,0.80726914,0.81993381,0.81832227,0.81730109,0.81621018,0.81518342,0.81605017,0.81492576,0.76356683,0.71543457,0.66788350,0.61032492,0.53700918,0.46328438,0.39249603,0.31852890,0.30797473,0.28971437,0.28271210,0.27384632,0.25907034,0.25349953,0.24169770,0.23677888,0.31633159,0.40249962,0.49125895,0.58405360,0.64584339,0.70593689,0.77723977,0.83990144,0.79491613,0.74669152,0.70905032,0.66311128,0.67774461,0.68470891,0.69752214,0.71042287,0.71103875,0.71383469,0.72474019,0.73062295,0.73120562,0.72961374,0.73868187,0.74342313,0.69644052,0.65253369,0.60558527,0.56240062,0.53943660,0.51466334,0.49039429,0.47013686,0.43170422,0.38762733,0.35467000,0.31249977,0.24878752,0.18202389,0.11405429,0.03818671,0.09114993,0.13781997,0.17191923,0.21070457,0.21857603,0.22469523,0.22395043,0.22359122,0.32274143,0.41979209,0.53374049,0.64482581,0.71450141,0.77907233,0.86033378,0.93693852,0.84720572,0.75263519,0.65580485,0.54869404,0.49337348,0.43307091,0.36792711,0.30467081,0.38390477,0.46786924,0.54995619,0.63304889,0.70283400,0.77685553,0.84938188,0.92413334,0.84075115,0.76166074,0.68809194,0.61381961,0.56015085,0.50602502,0.46434176,0.41839501,0.39709531,0.37636183,0.36133775,0.34553737,0.33056059,0.31592844,0.31000313,0.29983358,0.33876853,0.37842794,0.42478680,0.46986980,0.49421640,0.51813885,0.54061632,0.56272102,0.54078987,0.51905566,0.50459542,0.49519260,0.46850636,0.45099744,0.44091813,0.42688017,0.44574501,0.46432971,0.49361149,0.52657098,0.51635070,0.51034897,0.50225298,0.49569597,0.48730560,0.47195142,0.46020844,0.44757169,0.42056255,0.38954143,0.36097707,0.32662430,0.36926418,0.41267884,0.45578460,0.49646936,0.49475657,0.49875617,0.48856437,0.47050173,0.49499745,0.51599061,0.52901658,0.54012701,0.52444241,0.50957823,0.49064055,0.47266799,0.48592122,0.49604544,0.50455645,0.51701264,0.55230984,0.58146080,0.61402223,0.64207249,0.64528065,0.64774234,0.65938821,0.66969371,0.68725972,0.70901944,0.72971024,0.75127137,0.69787755,0.64311313,0.59677832,0.55237950,0.47597235,0.40285810,0.31704332,0.23370738,0.23350444,0.23084087,0.22309330,0.21661104,0.17376969,0.13143650,0.09215522,0.05935362,0.15272463,0.24205318,0.34312633,0.44444313,0.55340268,0.66732462,0.76528045,0.85955005,0.86233964,0.86196656,0.86625752,0.87167130,0.87502989,0.86904374,0.85995889,0.84582963,0.80507417,0.76410402,0.73446750,0.70192130,0.71893278,0.72732897,0.73742271,0.75043166,0.66952866,0.59271057,0.51069160,0.42622766,0.35344659,0.27462133,0.20010840,0.12143132,0.15155135,0.18495453,0.21413205,0.25055098,0.24968383,0.24862266,0.23776293,0.20308824,0.22097724,0.24121194,0.26231136,0.28132676,0.26045037,0.23161292,0.22721069,0.21696952,0.23614542,0.25147845,0.27632154,0.29955595,0.31451506,0.32550051,0.32328717,0.32905064,0.35431686,0.38160908,0.41857837,0.45663229,0.53940265,0.62451917,0.68251251,0.74035518,0.76447777,0.78632482,0.78595301,0.78333262,0.78710470,0.79168455,0.78439772,0.77465119,0.73346626,0.68798157,0.63560277,0.58782442,0.52376524,0.45662212,0.39218468,0.33027412,0.31815274,0.30289753,0.30545658,0.30242310,0.28168559,0.26367859,0.26006467,0.26226218,0.33502102,0.41128428,0.48895966,0.57048851,0.62849171,0.69507424,0.76404644,0.82997826,0.77456399,0.71806030,0.68384308,0.64177016,0.62881685,0.61133720,0.60831350,0.60094534,0.60404421,0.61112125,0.63510055,0.65263701,0.65467980,0.65333152,0.64810859,0.63776159,0.62261536,0.61283555,0.58490359,0.56508278,0.53455009,0.50852304,0.49777280,0.47994555,0.44578387,0.40650905,0.37344232,0.33824817,0.28064482,0.22957519,0.15262116,0.07663524,0.12318574,0.16911836,0.19827547,0.22659892,0.23029537,0.23896216,0.24463988,0.25365671,0.34386335,0.43389962,0.53689159,0.64624927,0.69404219,0.74128704,0.81299681,0.87889071,0.81547633,0.74768769,0.67412977,0.59872302,0.54050562,0.47572068,0.42005882,0.36715066,0.42825405,0.49295142,0.54987885,0.61330775,0.67577443,0.74196359,0.80938415,0.87634999,0.79647646,0.71325947,0.66273975,0.60383704,0.55183058,0.49742971,0.45278942,0.41405855,0.39602766,0.38407435,0.38021573,0.37785940,0.35672417,0.33696415,0.33168849,0.32900186,0.34927842,0.37680260,0.38878501,0.40807101,0.43261622,0.46293425,0.48752367,0.52136183,0.50786690,0.49077394,0.50060009,0.50565473,0.48612130,0.46996749,0.46941519,0.46760940,0.47832244,0.48714518,0.51055312,0.52966102,0.52789195,0.52729179,0.50808003,0.48650589,0.47157165,0.46649897,0.44501293,0.42842434,0.41797695,0.41411625,0.38650862,0.36578280,0.41441688,0.46504749,0.48725155,0.51358743,0.52522975,0.53430562,0.51577060,0.49303262,0.50805883,0.52161487,0.52555606,0.52683497,0.52090344,0.51355428,0.49653303,0.47754557,0.49242562,0.50276823,0.52156330,0.53306851,0.57692461,0.61813852,0.63801361,0.65075122,0.65370736,0.64630277,0.64289492,0.64317405,0.63777723,0.62976727,0.64271671,0.65215983,0.61032724,0.57513097,0.53962520,0.51087085,0.44222499,0.37963418,0.30041387,0.22392905,0.22028398,0.22523583,0.20739450,0.19475500,0.15947813,0.12327492,0.10748433,0.09197289,0.16905796,0.24454643,0.33332252,0.42514538,0.51367752,0.60924903,0.67129364,0.73838173,0.75583801,0.77311126,0.79408969,0.81563390,0.82630928,0.83718613,0.82314525,0.80701445,0.76804220,0.73044900,0.69936900,0.66627707,0.68203116,0.69592538,0.70341794,0.70893456,0.66154009,0.61020515,0.54715771,0.48902787,0.41642567,0.35169346,0.29139523,0.22658575,0.24012824,0.24744259,0.26617306,0.28226806,0.26430659,0.25359326,0.22705489,0.18979021,0.21643935,0.23880777,0.26469641,0.28902506,0.28652451,0.28614098,0.29581090,0.30444225,0.31318698,0.31937084,0.32644605,0.32943974,0.33435668,0.33343901,0.33296073,0.32614845,0.34909747,0.36911687,0.39676404,0.43005454,0.50843109,0.58271656,0.64303593,0.69512118,0.72257671,0.74936693,0.75438123,0.76669995,0.76636153,0.76724679,0.76139274,0.75726183,0.70779331,0.66246407,0.61792648,0.57776453,0.52193006,0.46652516,0.40700169,0.35442935,0.34092895,0.32492633,0.32150795,0.32441160,0.30824545,0.29075784,0.27510979,0.25432481,0.33153530,0.39829194,0.46765276,0.53225191,0.61256143,0.69387771,0.76027875,0.83427373,0.76919693,0.70608345,0.65107431,0.59486046,0.56557101,0.53815854,0.51224590,0.48469043,0.50614945,0.52861426,0.55586615,0.57989450,0.57154187,0.56602998,0.56014656,0.54934849,0.55252482,0.55781740,0.55287349,0.54739939,0.52757317,0.50786326,0.50842532,0.49983539,0.46871024,0.43753605,0.40086764,0.37251724,0.31012436,0.25612027,0.18388154,0.10832071,0.15233244,0.18659569,0.21158493,0.23922765,0.24865004,0.26067255,0.27625659,0.29273061,0.36828103,0.44649225,0.54739040,0.64163826,0.68127974,0.72241131,0.78100114,0.83353093,0.79424055,0.75142914,0.70366979,0.65925070,0.59513037,0.53417273,0.48018965,0.43028935,0.47006546,0.50425359,0.54064129,0.57080662,0.63016323,0.69576031,0.75644288,0.82495574,0.75736875,0.68710877,0.63708189,0.58523008,0.53495572,0.49437885,0.44809740,0.40189663,0.39524438,0.38434349,0.38874902,0.39634562,0.38070485,0.36717897,0.36223124,0.35603112,0.36048548,0.35847165,0.35122055,0.34800917,0.37558561,0.41071344,0.44039969,0.47011687,0.47261948,0.47452885,0.50071857,0.51603379,0.50947685,0.50186103,0.49286208,0.48657544,0.50301216,0.51708750,0.53827897,0.56198732,0.53717869,0.51342708,0.49460313,0.46961448,0.45386070,0.43662706,0.41718783,0.39843917,0.40894087,0.42263438,0.41038103,0.40136660,0.44506909,0.48548709,0.52508010,0.56031360,0.55271724,0.54436210,0.53603550,0.52400181,0.51821162,0.51676197,0.51099552,0.50181007,0.50676951,0.50967059,0.50809697,0.50048294,0.51394199,0.52265595,0.54160349,0.55975157,0.59369212,0.63117749,0.65768622,0.68364133,0.66369346,0.64710179,0.63428207,0.61944432,0.59950287,0.58239938,0.56901126,0.54958447,0.52544582,0.49833462,0.47662700,0.45878838,0.40016815,0.33871622,0.27574207,0.21082642,0.20331346,0.19214657,0.17688820,0.16669014,0.14435454,0.12635391,0.11248374,0.09476973,0.17762091,0.25578269,0.33265932,0.41511396,0.48164092,0.53864726,0.59057485,0.63738897,0.67608883,0.71363079,0.75224810,0.78887661,0.78679550,0.78647032,0.78301089,0.78169375,0.74483631,0.70680144,0.67189329,0.63271175,0.64841064,0.66030667,0.67648696,0.68659198,0.64638511,0.60448575,0.57045718,0.52598868,0.48355781,0.43507783,0.38418599,0.33770125,0.31966062,0.31126756,0.30341746,0.29901871,0.27570747,0.24778932,0.21377359,0.16766416,0.20265191,0.23944873,0.26688138,0.29651273,0.32181031,0.34080790,0.36710403,0.38960300,0.38587872,0.38274537,0.37238075,0.36130642,0.35559966,0.34685129,0.33912024,0.33221099,0.34220543,0.34852732,0.37798865,0.40145389,0.47824896,0.54750458,0.59839229,0.65012232,0.68569764,0.71462722,0.72648237,0.74700560,0.74108976,0.74319257,0.73697795,0.73445253,0.68016411,0.62859848,0.60148346,0.57180071,0.52295087,0.47303946,0.42131313,0.37683745,0.36258794,0.34243969,0.34627214,0.34477543,0.33456947,0.32165830,0.28875772,0.25278628,0.32464933,0.39259845,0.44773678,0.50024060,0.59515590,0.68974755,0.76228255,0.83270460,0.75857569,0.68489710,0.62259624,0.54967727,0.50447970,0.46097161,0.41975291,0.36809874,0.40677726,0.45096019,0.47844725,0.50613682,0.49000106,0.47507596,0.46979121,0.46278924,0.48564932,0.50378314,0.51431193,0.52908358,0.52074172,0.50814807,0.51313944,0.51837414,0.49173969,0.46464866,0.43146443,0.40369919,0.34269870,0.28182871,0.21044530,0.14290635,0.17491579,0.21385624,0.23205571,0.25063228,0.26529871,0.28583515,0.30503816,0.33058963,0.39262334,0.45842580,0.55281050,0.64726660,0.67739658,0.70358073,0.74670385,0.78047653,0.76953946,0.75911588,0.73885026,0.71777477,0.65205636,0.58720506,0.53997711,0.49701100,0.50841783,0.51749466,0.52368938,0.52991315,0.58691928,0.64292794,0.70644067,0.77034835,0.71185133,0.65363599,0.60749750,0.56133443,0.52413935,0.48761093,0.44414167,0.39839764,0.39194891,0.38804220,0.40501801,0.41858532,0.40488631,0.40133968,0.39630533,0.39010079,0.36320381,0.34457366,0.31295969,0.28043098,0.31747752,0.35861023,0.39022888,0.41900876,0.43769925,0.45830615,0.49600506,0.53376378,0.53068284,0.53346118,0.52182369,0.50843012,0.52776688,0.54808101,0.57113933,0.59042754,0.54452711,0.50459139,0.48049681,0.45189767,0.43283804,0.41317144,0.38949710,0.36191182,0.39589084,0.43050639,0.43565769,0.43740744,0.47768175,0.51075680,0.55955619,0.61229205,0.58615319,0.55892992,0.56174234,0.55755388,0.53430975,0.50912548,0.49849239,0.48370967,0.49764065,0.51131755,0.51797723,0.52242352,0.52839511,0.53718089,0.55854833,0.58117941,0.61111974,0.63845803,0.67487571,0.70851761,0.68004195,0.64640469,0.62195010,0.59622325,0.56726466,0.53972157,0.49571330,0.44827989,0.43339049,0.42240253,0.41702181,0.41026960,0.35245018,0.29799761,0.24422210,0.19184944,0.17458032,0.15881608,0.15147755,0.13753557,0.13348179,0.13227764,0.11585456,0.10540129,0.18451387,0.26147198,0.33515901,0.40654471,0.44004047,0.47892296,0.50280860,0.52826479,0.59494020,0.65857059,0.70272262,0.75755861,0.74736660,0.73862708,0.74462390,0.75036648,0.71361929,0.68006173,0.63971457,0.59640580,0.61384866,0.62782396,0.64426903,0.66148998,0.63251822,0.60800085,0.58699029,0.57300967,0.54450773,0.52598364,0.48297513,0.43953343,0.40757045,0.36849061,0.34259359,0.31684174,0.27735062,0.24121977,0.20544981,0.13728252,0.19539426,0.25584419,0.30764057,0.35546976,0.39787473,0.43721912,0.47901286,0.51895218,0.48890325,0.46066469,0.42638815,0.39831496,0.35541910,0.32202561,0.29240340,0.26264861,0.29556448,0.32142062,0.36733990,0.41429188,0.48056703,0.54281682,0.60335946,0.66488083,0.68215098,0.70718834,0.72053419,0.73736481,0.72949827,0.71895623,0.72046123,0.72301280,0.66640070,0.61519318,0.57469153,0.53174648,0.48216617,0.43684574,0.39069179,0.33791664,0.34896356,0.35090891,0.35673125,0.36017725,0.35437505,0.34271710,0.31794211,0.29138879,0.35520281,0.41717972,0.46712842,0.50881983,0.60113212,0.68315100,0.77127513,0.85000918,0.76650503,0.68532102,0.60833596,0.52210554,0.47359825,0.41719780,0.35554421,0.28881768,0.32078607,0.35271168,0.38657188,0.41412518,0.39781335,0.38824473,0.38431674,0.37689062,0.40346733,0.43178495,0.45421720,0.48506780,0.50133257,0.51929095,0.54079715,0.56087459,0.52676277,0.49197480,0.45373371,0.41387160,0.35204250,0.28801168,0.23172193,0.17725735,0.19422058,0.20967544,0.21978406,0.23354798,0.24388910,0.25777956,0.27601154,0.29707273,0.36633565,0.43898785,0.52194006,0.60146569,0.65672705,0.70775391,0.75857353,0.80416789,0.77682377,0.75194853,0.71785996,0.69052305,0.64735630,0.60837800,0.56854901,0.52854405,0.53753313,0.53910413,0.54763957,0.54940353,0.60318604,0.65417051,0.71143506,0.76438732,0.70830318,0.64762967,0.60183141,0.55268143,0.50149645,0.44725341,0.39906869,0.35136618,0.36009854,0.36528744,0.38239838,0.39593110,0.38970595,0.37463581,0.37041338,0.36036403,0.34212424,0.32439864,0.29437919,0.27109204,0.28644517,0.30674025,0.32158714,0.33723318,0.37931322,0.42140827,0.46073518,0.50414878,0.53294011,0.56239999,0.57932064,0.59526741,0.59050892,0.58844756,0.59183882,0.58913384,0.54077361,0.49512072,0.46001914,0.42549240,0.41733861,0.40137100,0.39675807,0.39647169,0.43013782,0.46056215,0.47189567,0.48536833,0.51644782,0.54601018,0.57323569,0.59723837,0.58716395,0.58708382,0.59119531,0.59265008,0.56451517,0.53386289,0.52491868,0.50706391,0.51042516,0.50566029,0.50083971,0.49947911,0.52304573,0.54959164,0.57512460,0.60920989,0.64598289,0.68204517,0.71694493,0.75342534,0.70623390,0.66669457,0.61667752,0.56405645,0.52024732,0.47932041,0.41891959,0.36250075,0.35570666,0.34287297,0.34469459,0.34590030,0.30360527,0.25534737,0.21135931,0.17086983,0.16834950,0.16494561,0.16114097,0.15298403,0.13694269,0.11918237,0.11492059,0.10634112,0.16820675,0.24076462,0.29443696,0.35867352,0.38291834,0.41775497,0.43085270,0.45219187,0.51173296,0.57751169,0.63328912,0.68619277,0.70228267,0.71894186,0.75157657,0.78207758,0.73838893,0.69324426,0.63975830,0.58103469,0.58462152,0.58904053,0.59619069,0.59888830,0.59034232,0.58118737,0.57973855,0.57992537,0.58004205,0.57646446,0.56817896,0.55965121,0.50624643,0.44579400,0.40304873,0.35352054,0.29736767,0.24708504,0.19486192,0.10958937,0.19254570,0.27553482,0.34714125,0.42022589,0.47295992,0.53014251,0.58506668,0.64664300,0.59152892,0.54224116,0.48423064,0.43300283,0.36022967,0.29206089,0.24364568,0.19712571,0.24399234,0.29281013,0.36336473,0.42500399,0.48409273,0.54219431,0.61033938,0.66987339,0.68436706,0.69808400,0.70917397,0.72595873,0.71028715,0.69224625,0.70581389,0.71790457,0.65460554,0.59540650,0.54590863,0.49576825,0.45229536,0.40020679,0.35107905,0.30325453,0.33092926,0.35943921,0.36688301,0.37797920,0.37328122,0.37357824,0.35092874,0.32737568,0.38278312,0.44485953,0.47893167,0.51645143,0.60285775,0.68160941,0.77777693,0.87347710,0.77675795,0.68831828,0.59194388,0.49328040,0.43725624,0.38060663,0.28791485,0.19930876,0.23354439,0.25750485,0.29378483,0.32069937,0.30896570,0.29571621,0.29585629,0.29406763,0.32544817,0.35620978,0.39553297,0.43783148,0.48375034,0.53218627,0.56327645,0.60265032,0.55539713,0.51493763,0.46901787,0.43149129,0.36440941,0.29916124,0.25576749,0.21564531,0.21223781,0.21142700,0.20938268,0.21154608,0.22302474,0.22600724,0.24776487,0.27109258,0.34034115,0.41076215,0.49080712,0.56199101,0.63632345,0.71350207,0.76906424,0.82863405,0.78672665,0.74739390,0.70336717,0.66019830,0.64482742,0.62920741,0.59833508,0.57060158,0.56593563,0.56149270,0.56740765,0.57271387,0.61789737,0.66921037,0.71094793,0.75735914,0.69963353,0.63783392,0.59586653,0.55043162,0.47604878,0.40636484,0.35810618,0.30808640,0.32648943,0.34636698,0.35882594,0.38025195,0.36906434,0.35448519,0.33901465,0.32682549,0.31685777,0.31200103,0.27926164,0.25269872,0.25458092,0.24774700,0.25764395,0.26115196,0.31954174,0.38056792,0.42415628,0.47115226,0.52952002,0.58975618,0.63346741,0.67434436,0.65779045,0.63314071,0.61658940,0.59361606,0.54059479,0.47914442,0.44283810,0.40286312,0.39931779,0.39094837,0.40938863,0.42328385,0.46124923,0.49477378,0.51710906,0.53436082,0.56001272,0.58210812,0.57733481,0.57855593,0.59484126,0.61236553,0.62261090,0.63424065,0.59390771,0.55876046,0.54413734,0.53049945,0.52144275,0.50802119,0.48912604,0.47400155,0.51570460,0.55349820,0.59536408,0.63067924,0.67948507,0.72212064,0.75589745,0.78962593,0.73557202,0.68313593,0.60676720,0.53179512,0.47937538,0.42095313,0.34990297,0.27847850,0.27246643,0.26591257,0.27976067,0.29194397,0.25099889,0.20531231,0.17824593,0.15222273,0.16159196,0.17703405,0.17261802,0.16949943,0.13905850,0.10978419,0.10439130,0.10384931,0.15848482,0.21930411,0.26109990,0.30446867,0.33310757,0.35510778,0.36371752,0.37038844,0.43392646,0.50041132,0.56013996,0.62274700,0.65717889,0.69757086,0.75301035,0.80971080,0.75610479,0.70319507,0.63398558,0.56271700,0.55995086,0.54953610,0.54477901,0.54485825,0.55050080,0.54931530,0.56529071,0.58040685,0.61139326,0.63319527,0.65895569,0.68137984,0.60324118,0.51880014,0.45402815,0.39267038,0.31967851,0.25379916,0.18108068,0.07167356,0.17211776,0.27732986,0.38072080,0.47731895,0.55174956,0.62261152,0.69536596,0.76754241,0.68860355,0.60571830,0.52889697,0.45221074,0.35960747,0.27577318,0.19985070,0.12164821,0.19697775,0.27136974,0.36027054,0.44623874,0.50576563,0.56587309,0.62979106,0.68895092,0.69444006,0.69817886,0.70816511,0.70872922,0.69790394,0.69131029,0.69509093,0.69883925,0.63895155,0.57525779,0.52197661,0.46240328,0.42073367,0.38231501,0.33161890,0.28487153,0.32035879,0.35468714,0.38356204,0.40950644,0.40010537,0.38485373,0.37138529,0.35851716,0.40587149,0.45122292,0.49280329,0.53182679,0.62009697,0.71304990,0.79954944,0.89337830,0.78828155,0.68732057,0.58274295,0.47632776,0.39091328,0.30556746,0.21415935,0.11207802,0.14421826,0.17451266,0.21148803,0.24255459,0.23334798,0.21316725,0.20583753,0.20019625,0.25044092,0.29527110,0.34635581,0.39078743,0.45279528,0.51961537,0.58021323,0.63878694,0.58420312,0.53330467,0.47647783,0.42522966,0.37591132,0.32483628,0.27727352,0.22620018,0.21996160,0.20976586,0.20471276,0.19848215,0.20320445,0.20629443,0.21811969,0.22347987,0.30713313,0.38833455,0.46471754,0.54515606,0.62518590,0.69753499,0.77804954,0.85906402,0.80686666,0.75149832,0.69812861,0.64443057,0.63741776,0.63498806,0.61273924,0.59694765,0.58538230,0.57822025,0.57277042,0.56627332,0.61206628,0.65479928,0.69684275,0.73976439,0.68763364,0.63412136,0.58876679,0.54673950,0.46816877,0.39238736,0.31502330,0.24281249,0.27943174,0.31121974,0.33945616,0.36665427,0.35946390,0.34289073,0.33012066,0.31247044,0.29836043,0.28564023,0.25756433,0.23853263,0.22055234,0.20359510,0.19562935,0.18477998,0.25684920,0.32796475,0.39444664,0.45383022,0.53894687,0.61967806,0.68804615,0.76311585,0.72196938,0.68313916,0.64885620,0.60932784,0.54926440,0.48145624,0.42491147,0.37066524,0.38997776,0.40381545,0.42583261,0.44183877,0.48343364,0.51843274,0.56194745,0.59791482,0.59909404,0.59497348,0.58128819,0.56560366,0.59107913,0.61261397,0.63780872,0.65936125,0.62372535,0.59016135,0.56935696,0.55464818,0.52820183,0.50385085,0.48044830,0.45246235,0.50382484,0.55524090,0.61362052,0.67668971,0.71851535,0.75888171,0.80221266,0.85589438,0.77345729,0.68908171,0.60496518,0.51841672,0.43554127,0.35251145,0.26699282,0.17922252,0.18913135,0.19271016,0.20447561,0.21802047,0.19675734,0.16819076,0.15079463,0.12847937,0.14460030,0.15254188,0.16625190,0.17356804,0.14494238,0.11514497,0.09637085,0.07832805,0.13242073,0.19170901,0.23460939,0.27741312,0.28449262,0.28930094,0.28895856,0.29363842,0.35611917,0.42259313,0.48414526,0.55177291,0.61158180,0.67880246,0.75049553,0.83184286,0.76437394,0.70193835,0.62544812,0.55116659,0.52764393,0.50825348,0.49534765,0.47721593,0.51406581,0.54500719,0.57607608,0.60382192,0.65883750,0.70750210,0.76523551,0.81540129,0.70912101,0.60260854,0.50290661,0.40352356,0.32050298,0.24236817,0.15805174,0.02807999,0.16046364,0.28673969,0.41205733,0.54228649,0.62998559,0.72188160,0.80659704,0.89440652,0.78516609,0.67576280,0.57185200,0.47063023,0.36307708,0.25443973,0.15066234,0.04301755,0.14733498,0.24113695,0.35587238,0.46585249,0.52727646,0.59521592,0.64980713,0.71163274,0.70346085,0.70204076,0.69912245,0.70049180,0.68902690,0.68340681,0.68093510,0.68488214,0.62133239,0.55937218,0.49504683,0.43023345,0.39840451,0.36067934,0.31204658,0.26277096,0.31277976,0.35861549,0.39804924,0.44593657,0.42265566,0.39696596,0.39038490,0.38622574,0.42262268,0.45483724,0.49819711,0.53635372,0.64057117,0.73838692,0.82505014,0.91282535,0.80345854,0.69538860,0.57366063,0.45617172,0.34696770,0.23725063,0.13135432,0.02409558,0.05852838,0.08635082,0.12519249,0.16712809,0.15309235,0.13212498,0.12206873,0.10224899,0.16841399,0.23435403,0.29158265,0.33992408,0.42276068,0.50701915,0.59651450,0.68105890,0.61447516,0.55050204,0.48598463,0.41983122,0.38511052,0.35735912,0.30062560,0.23888090,0.22767481,0.21351576,0.19480263,0.17500955,0.18200053,0.18453476,0.18535390,0.17931708,0.27117424,0.36114037,0.44274102,0.52843763,0.60598483,0.68168945,0.78646718,0.88726045,0.82175639,0.75589261,0.68639068,0.62063070,0.63016929,0.64003255,0.62773218,0.62197226,0.61294289,0.60131372,0.58468927,0.56165413,0.60230318,0.64512876,0.68663035,0.72916182,0.67727634,0.63163519,0.58820006,0.54431640,0.45398529,0.37490516,0.27944975,0.17865378,0.23310796,0.28712139,0.32175864,0.36198662,0.34796764,0.33375641,0.30964442,0.29183811,0.27330326,0.25760648,0.24108494,0.21910398,0.18796673,0.15786331,0.13746586,0.10800110,0.19440683,0.27782431,0.36015743,0.43462339,0.53886489,0.64902526,0.74779331,0.84785386,0.78420566,0.72803263,0.68084970,0.62940507,0.55739495,0.48424493,0.40829896,0.33569300,0.37649678,0.41874883,0.43910603,0.45808364,0.50054790,0.54330748,0.60423695,0.66171506,0.63618261,0.60895955,0.58578054,0.55487492,0.58545758,0.60895931,0.65074033,0.68838680,0.64954900,0.61165120,0.59744291,0.58027986,0.54262847,0.50383543,0.46558357,0.43061743,0.49423487,0.55777253,0.63555768,0.71880234,0.75541292,0.78752032,0.85263898,0.91794279,0.80492425,0.69714421,0.59736901,0.49743607,0.38663986,0.27691021,0.18249348,0.07648729,0.10344071,0.12308717,0.13733944,0.14928895,0.14005072,0.13379591,0.12436376,0.10677476,0.12294800,0.13417338,0.15840796,0.17774167,0.14562086,0.11559663,0.08421348,0.04803526,0.10864539,0.17024631,0.20802233,0.25081491,0.23935519,0.22232529,0.21741886,0.21307375,0.28082510,0.33958288,0.40823239,0.47682725,0.56837832,0.65513605,0.75527177,0.85196439,0.77307213,0.69821335,0.61796463,0.53284657,0.50180139,0.46760423,0.44237302,0.41630580,0.47645701,0.53615573,0.58302188,0.62617887,0.70037591,0.77823381,0.86300568,0.95578964,0.81762123,0.68874982,0.55133564,0.41080987,0.32252886,0.22800924,0.13287085,0.07611512,0.18492315,0.29027443,0.40041674,0.50908620,0.58851229,0.67243265,0.74853165,0.82633233,0.73165083,0.64231023,0.55532864,0.47733393,0.39110903,0.30044425,0.21377607,0.13048522,0.21556724,0.29699108,0.38190814,0.46291412,0.52721119,0.58786249,0.64185744,0.69799627,0.70383239,0.70668498,0.70846912,0.70615218,0.70822070,0.71010257,0.71256971,0.71529014,0.64778801,0.58131151,0.52394287,0.46228977,0.42758116,0.39075025,0.35131635,0.31060200,0.34540528,0.38383801,0.42344941,0.45901353,0.45007319,0.43839254,0.43745160,0.43366198,0.46596809,0.49891384,0.52665833,0.55757301,0.62070985,0.69064892,0.74636713,0.80858799,0.72756547,0.64354211,0.54980381,0.45681644,0.37148901,0.28110562,0.20110721,0.11991356,0.15170424,0.18412784,0.20749834,0.23840778,0.22988108,0.22147035,0.21258591,0.19716754,0.24305284,0.28782709,0.32565476,0.36445701,0.43312711,0.50306116,0.56579541,0.63190186,0.57919288,0.53237084,0.48023314,0.43038461,0.39682923,0.36159561,0.31383938,0.26650065,0.26077629,0.25548802,0.24644640,0.23481475,0.23149058,0.22577500,0.21616523,0.20878713,0.28817197,0.37094320,0.44231355,0.51392368,0.59752468,0.67144573,0.76051028,0.84567279,0.79114426,0.74182545,0.68342755,0.63419270,0.63105445,0.63537982,0.62405366,0.61004039,0.59991788,0.59475037,0.58260860,0.57494164,0.59800556,0.62513743,0.64096499,0.66551170,0.62029387,0.58232211,0.54541993,0.50475299,0.44112311,0.36746363,0.30013559,0.23333711,0.27235752,0.31894814,0.35015245,0.38035383,0.38545334,0.39000242,0.39402654,0.39115001,0.35577407,0.32228813,0.29911585,0.26594434,0.23686835,0.20839075,0.18303358,0.15037819,0.22811494,0.30504521,0.38046394,0.44731018,0.53319568,0.62032472,0.70381568,0.78245925,0.73560606,0.68047789,0.63807587,0.58879044,0.52739977,0.47062116,0.40903950,0.34732781,0.37845930,0.40482734,0.42234800,0.43479106,0.47084889,0.49985787,0.54343193,0.58394645,0.57258135,0.56443609,0.55145661,0.53529422,0.55423740,0.57387280,0.59192282,0.60673441,0.59011054,0.57237734,0.55536841,0.54150109,0.51484045,0.48691896,0.45698723,0.43361747,0.49143118,0.54777380,0.60805312,0.67290068,0.69820454,0.72304514,0.76364973,0.80257273,0.71994050,0.64133274,0.56530859,0.48440085,0.38092885,0.28514772,0.19244040,0.09824713,0.12259881,0.15073687,0.16250316,0.17945749,0.17282923,0.15905957,0.16066068,0.15894518,0.16634292,0.17542013,0.18124506,0.19323454,0.17559059,0.16011418,0.13105461,0.10649691,0.14601739,0.19650585,0.22665853,0.25991164,0.26633086,0.26939635,0.27223548,0.28220602,0.34006476,0.39289963,0.45864551,0.51948923,0.59859193,0.67638563,0.75453976,0.83479667,0.76834496,0.70920024,0.64207668,0.57663119,0.54675858,0.50946130,0.47991728,0.44989547,0.49191202,0.53071920,0.56292501,0.58997642,0.65667260,0.71632811,0.78005199,0.84099945,0.73245288,0.62019698,0.51086934,0.40220322,0.32749492,0.24820708,0.16328605,0.12538011,0.21295738,0.29713748,0.38932682,0.48245185,0.54990128,0.62099875,0.68893458,0.75670967,0.67846507,0.60174892,0.53836313,0.48255115,0.41221071,0.34698737,0.28336564,0.21573499,0.28665231,0.35601971,0.40782867,0.46356777,0.52504053,0.58923490,0.63443384,0.67864259,0.69887426,0.71489214,0.71635430,0.71649057,0.72730983,0.73341828,0.74308933,0.74806725,0.67743412,0.60181445,0.55093713,0.49670992,0.45272251,0.41749870,0.38973912,0.36177944,0.38473847,0.41005675,0.44579988,0.47889391,0.47714338,0.47434859,0.47503876,0.47735353,0.50886669,0.53587694,0.55397825,0.57118463,0.60348573,0.64031506,0.66918650,0.69956590,0.65239971,0.60305454,0.52731693,0.45201400,0.38583086,0.32276892,0.26334821,0.20919692,0.24422999,0.27799352,0.29212436,0.30583109,0.30857493,0.30892686,0.29959534,0.29694547,0.32158841,0.34259769,0.36490374,0.38381789,0.44002371,0.49334882,0.53941564,0.58928092,0.54976794,0.51002311,0.47388272,0.43849299,0.40589401,0.37301190,0.33165164,0.28785786,0.29854925,0.30279036,0.29475957,0.28597370,0.27609332,0.26610720,0.25385966,0.24043631,0.30851985,0.38478920,0.44162697,0.50545918,0.57970144,0.65998847,0.73515367,0.80290080,0.76524229,0.72260236,0.68385271,0.64663527,0.63699559,0.63437194,0.61363762,0.59132492,0.59269262,0.58645912,0.58612325,0.58424791,0.59683163,0.60082534,0.60198734,0.59703285,0.56140671,0.52610776,0.50160369,0.47267029,0.42334334,0.36664551,0.32996384,0.28606965,0.31416215,0.34919899,0.37075189,0.39461257,0.42660918,0.45209504,0.46934394,0.49173367,0.44254206,0.39166623,0.35520817,0.31788665,0.28791131,0.26336224,0.22377616,0.19095551,0.26226447,0.33752921,0.39910348,0.45990202,0.52802722,0.58822555,0.65464564,0.72302906,0.68306654,0.63283724,0.59286888,0.54747247,0.50267856,0.45295640,0.40850699,0.35966189,0.37582569,0.39566239,0.40287112,0.40557365,0.43175185,0.45891211,0.47935441,0.50364948,0.51226871,0.52532094,0.51799223,0.50497117,0.51956330,0.53071313,0.53066143,0.53020328,0.52811548,0.52933952,0.51369374,0.49736031,0.48424322,0.46428739,0.44771750,0.43328214,0.48658764,0.54043470,0.58139787,0.63176757,0.64761121,0.66181676,0.67266233,0.68630362,0.63450024,0.58592477,0.52589552,0.47393900,0.37937062,0.28380458,0.20346944,0.11985017,0.14759565,0.17594472,0.19690145,0.21651952,0.19811552,0.18438687,0.19530992,0.20821952,0.20709650,0.21025895,0.21080916,0.21078923,0.20560103,0.20413245,0.18174736,0.15608293,0.18546910,0.22223578,0.24528661,0.26944650,0.29351754,0.31320671,0.33381403,0.35061281,0.39496062,0.43905614,0.50171999,0.56196241,0.62886325,0.70368971,0.75738538,0.81710410,0.77267568,0.72097353,0.66979663,0.62152421,0.58761346,0.54788009,0.51927359,0.48837224,0.50766526,0.52191371,0.54121052,0.55617561,0.60865003,0.65705118,0.69303832,0.72033717,0.63895785,0.55815528,0.47828494,0.39695763,0.33479075,0.26931691,0.19919642,0.18504874,0.24865104,0.31618915,0.39095269,0.46407468,0.52284786,0.58495712,0.63537184,0.68938705,0.63759824,0.58022548,0.51850866,0.46337385,0.41671675,0.38130966,0.34883341,0.31278071,0.36360054,0.41141793,0.44547238,0.48017259,0.53297657,0.58157226,0.62507651,0.67273219,0.68932739,0.70621263,0.72862396,0.74576600,0.75163738,0.75620775,0.76916181,0.78486913,0.70640569,0.63162259,0.56829982,0.50914905,0.48112649,0.44842302,0.41767234,0.39142914,0.42210146,0.44860714,0.48073965,0.50719007,0.50894085,0.51230734,0.52268074,0.52613175,0.54377030,0.55763171,0.56747596,0.57175248,0.58210560,0.59280007,0.61023717,0.62603014,0.58686961,0.54698334,0.50723230,0.46399359,0.41729375,0.37214298,0.32766461,0.28807050,0.32426042,0.35056381,0.37699523,0.39950142,0.39202765,0.38005314,0.37687920,0.37338433,0.38259274,0.39715116,0.40272938,0.40395345,0.44126120,0.48095892,0.50702741,0.52450401,0.51018548,0.48836324,0.46115779,0.42800431,0.40668925,0.38303609,0.35400255,0.31954872,0.32711574,0.32929951,0.33402613,0.33963814,0.30935591,0.28878497,0.26661620,0.24655736,0.31351074,0.37179648,0.43528207,0.48971225,0.56605063,0.64437936,0.71458518,0.78915193,0.74794226,0.70320254,0.66803409,0.62937157,0.62861899,0.62516636,0.60770689,0.58687734,0.59261597,0.60225261,0.60374325,0.60574433,0.59385009,0.58667148,0.55732399,0.53322648,0.51202169,0.49333109,0.46888042,0.44096218,0.41289441,0.39221606,0.36172415,0.33155842,0.35946214,0.38342083,0.40444435,0.42615425,0.46442039,0.50138537,0.54198137,0.58265644,0.51688950,0.45348912,0.39593355,0.34397962,0.31176751,0.28249135,0.25863426,0.22803187,0.29238989,0.36207576,0.42270736,0.48261028,0.52917655,0.58084179,0.62710691,0.67419865,0.64262923,0.60550068,0.56214938,0.51890833,0.48238548,0.44654528,0.40612293,0.36855366,0.37864198,0.38415136,0.38620603,0.38363179,0.39851952,0.41518235,0.41838849,0.41931461,0.43758992,0.45674764,0.47452881,0.48827946,0.47670839,0.46945663,0.46187762,0.44825007,0.46272677,0.47687188,0.46678804,0.46804393,0.46162132,0.45334749,0.45028368,0.44681858,0.48097505,0.52145521,0.55266627,0.58366162,0.59055759,0.59456028,0.59325776,0.58746711,0.55160261,0.51772632,0.48574990,0.44891779,0.36686258,0.28622469,0.21546168,0.14936171,0.17336411,0.19464315,0.21689565,0.23808686,0.22949660,0.22233581,0.22961889,0.23724739,0.23882864,0.23041806,0.23152578,0.23308813,0.23057839,0.22617134,0.21476500,0.19745623,0.22740954,0.24600937,0.26126515,0.27933401,0.31283394,0.34908520,0.38463531,0.41628184,0.45374862,0.48680975,0.54049633,0.59900302,0.65683797,0.70649306,0.76051707,0.80828198,0.77486933,0.73588101,0.70643979,0.67958604,0.63460230,0.58589415,0.55366125,0.52118471,0.52152039,0.51710502,0.52633581,0.53120729,0.55679761,0.58688499,0.60745983,0.63050273,0.56416988,0.49997179,0.43459170,0.36580558,0.32702638,0.28674210,0.23461344,0.24318232,0.28530849,0.33600293,0.39301752,0.44573863,0.49467264,0.54473831,0.58543762,0.62425062,0.58939580,0.55642302,0.49948545,0.44096342,0.42717835,0.40696354,0.41096694,0.41125296,0.43381240,0.46666928,0.48087586,0.49565364,0.53546611,0.57713679,0.62033907,0.66406891,0.68350057,0.70255175,0.73543873,0.77127666,0.77438193,0.77325704,0.79801663,0.82099775,0.73876327,0.65210945,0.58559094,0.51937626,0.50238688,0.48017936,0.45549929,0.42655588,0.45637084,0.48809740,0.50913979,0.53808834,0.54348500,0.55316078,0.56452031,0.57139388,0.57674296,0.57926257,0.57725039,0.57786905,0.56205291,0.53982969,0.54046816,0.54454881,0.52075999,0.49725740,0.48432333,0.47089932,0.44261140,0.41644569,0.39735843,0.37494265,0.40025675,0.43195405,0.45983384,0.48972747,0.47110029,0.45466848,0.45066132,0.44765405,0.44994882,0.44825569,0.43516052,0.41985893,0.45001437,0.47433163,0.46778732,0.46490894,0.46624794,0.46865972,0.44637530,0.41855099,0.40488149,0.39070027,0.36968920,0.34772904,0.35656122,0.35759703,0.37733925,0.38978508,0.34910015,0.30612733,0.28287840,0.25984387,0.31221632,0.36726503,0.42366999,0.47384576,0.55241722,0.62938703,0.70010705,0.77911669,0.72648643,0.67725414,0.64655930,0.61508919,0.61812144,0.62045809,0.60147069,0.58194736,0.59572840,0.61404938,0.62342250,0.63108615,0.60139241,0.57064257,0.51757198,0.46316072,0.46606698,0.46599703,0.43478185,0.40669139,0.41036250,0.41575411,0.39735831,0.37704437,0.39953194,0.41895562,0.43859122,0.45803883,0.50540161,0.54453833,0.60776573,0.67720246,0.58981145,0.50792272,0.43713640,0.36606128,0.33748792,0.30689586,0.28290877,0.26311348,0.32718297,0.38785373,0.44065569,0.49873773,0.53946330,0.57899171,0.59991274,0.62147754,0.60470469,0.58187772,0.53433492,0.49079103,0.46520319,0.43048425,0.40204504,0.36865433,0.37413210,0.37973307,0.37066140,0.35405724,0.35914839,0.36905080,0.34945804,0.33228757,0.36594396,0.39488216,0.43316190,0.47316026,0.44415531,0.40804489,0.38909754,0.36876098,0.39694855,0.42262196,0.42753203,0.43192447,0.43569596,0.44632481,0.45046013,0.46203380,0.47701675,0.50172150,0.51864602,0.54170201,0.53188180,0.52827604,0.50587670,0.48529579,0.46741822,0.44974697,0.43779600,0.43121861,0.35734594,0.27837592,0.22756994,0.18029044,0.19413885,0.20952935,0.23879815,0.26409798,0.26204419,0.25216294,0.26217106,0.27157094,0.26405226,0.25270709,0.25635496,0.25797742,0.25612977,0.25095413,0.24626029,0.24460014,0.25862951,0.27900251,0.28102181,0.28286535,0.33522898,0.38589430,0.43284234,0.48314096,0.50991466,0.53341184,0.58735085,0.63714533,0.67586007,0.71778675,0.76150340,0.80046614,0.77692293,0.74841826,0.73852714,0.73555160,0.68026921,0.62294093,0.58628066,0.55173529,0.53273673,0.51276799,0.50581039,0.49923947,0.50687560,0.50960269,0.52341276,0.53218209,0.48416562,0.44122197,0.39018664,0.34102338,0.32238857,0.30608793,0.27387090,0.22304674,0.26994091,0.32701377,0.37993352,0.43791847,0.49047132,0.54310054,0.58849463,0.63777861,0.60016297,0.56428168,0.53021751,0.48917387,0.47459970,0.46345701,0.45006630,0.43779045,0.45569429,0.48061947,0.50052890,0.51847272,0.56303156,0.60583060,0.65325873,0.69750885,0.70830725,0.71685709,0.73887785,0.75652539,0.77505466,0.78953427,0.81089376,0.83342049,0.75758441,0.68183828,0.62079348,0.56062307,0.53517088,0.51378501,0.47949074,0.43921618,0.47824275,0.51714674,0.55025069,0.58305750,0.59770109,0.61482640,0.63524044,0.65653001,0.63850328,0.62872580,0.60370665,0.58225953,0.54731413,0.51015072,0.47185165,0.43871271,0.44050989,0.43850199,0.44350338,0.45275017,0.44220890,0.42518950,0.41878948,0.40549545,0.43826132,0.46828207,0.49594467,0.52776733,0.52927346,0.52600239,0.54025413,0.55009118,0.52971181,0.51828319,0.49159779,0.46591665,0.46912026,0.46912279,0.46395485,0.46297806,0.46086355,0.46176916,0.45970016,0.44904199,0.44204961,0.43401278,0.42207752,0.40318937,0.40458215,0.41046968,0.41182393,0.41321536,0.37560707,0.33581948,0.30138873,0.26782334,0.31398361,0.36378578,0.41729121,0.47047661,0.53486937,0.60234931,0.66704196,0.73681422,0.70474355,0.67107687,0.64922143,0.62606619,0.62406634,0.62417634,0.61951475,0.61359942,0.61786497,0.61739300,0.61804450,0.61357769,0.58108650,0.55269198,0.50847039,0.46503852,0.46855821,0.47043626,0.45718972,0.45049982,0.44585601,0.44149692,0.42934493,0.42220596,0.44738325,0.47127221,0.49768353,0.52427322,0.57000478,0.61243511,0.66814281,0.73225250,0.65038721,0.56523119,0.49420186,0.41801296,0.38057686,0.34319069,0.30096044,0.26820302,0.32348364,0.37585685,0.42339303,0.47936452,0.51898634,0.55975501,0.58755617,0.62258396,0.60527869,0.58332094,0.55562757,0.52697821,0.50138323,0.48160841,0.46136856,0.43239250,0.41468137,0.39346954,0.37260931,0.35558140,0.33909150,0.32540284,0.29983387,0.27475894,0.30951159,0.34097085,0.37141285,0.40311913,0.38037977,0.35486983,0.34481019,0.33498244,0.35616490,0.37748392,0.39190027,0.40260594,0.41267053,0.41673194,0.42009910,0.42108107,0.43545167,0.44870611,0.45500046,0.46494454,0.45838938,0.44746676,0.43093890,0.41638234,0.40809829,0.39831823,0.39251759,0.38140227,0.32133399,0.26825264,0.21300123,0.15354181,0.18236671,0.21524604,0.25230324,0.28952582,0.28642032,0.28686785,0.30024315,0.30978095,0.30194404,0.29029415,0.28800531,0.29233522,0.28665036,0.28410736,0.27221493,0.26207364,0.27693592,0.29659622,0.31360159,0.32743240,0.36288114,0.40927829,0.43994685,0.47955715,0.52652576,0.56979647,0.61015270,0.65173415,0.69583628,0.74097293,0.78161275,0.81775847,0.78223120,0.74892789,0.72505984,0.70238528,0.66108734,0.61417879,0.58818354,0.55683098,0.53566600,0.51093600,0.49429304,0.47946787,0.46730707,0.46399175,0.46342170,0.45695883,0.42663036,0.39290782,0.35937034,0.32677366,0.30052770,0.27529474,0.24741856,0.20137369,0.25635290,0.31385429,0.36870616,0.42600516,0.48664863,0.54282065,0.59172344,0.64808882,0.61053016,0.57477058,0.55942009,0.54184563,0.52391374,0.51532702,0.48597935,0.46462350,0.47846100,0.49549589,0.52161247,0.54401377,0.59456802,0.63513613,0.68192230,0.72592420,0.73269622,0.72948000,0.74188101,0.74808599,0.77797490,0.80371030,0.82197910,0.84767770,0.77339079,0.70415310,0.65535612,0.60684387,0.57548701,0.55001985,0.50278550,0.45224669,0.50016234,0.54920551,0.59210122,0.63334077,0.64890985,0.67008951,0.70480705,0.73191806,0.70670554,0.67843387,0.63272425,0.58150980,0.52902245,0.47771898,0.40373474,0.33431289,0.35755661,0.38118384,0.40595334,0.43230549,0.43686835,0.44007393,0.44418996,0.44487198,0.47590524,0.50947903,0.53956697,0.57115227,0.58420391,0.59446601,0.62550195,0.64599581,0.61459937,0.58566352,0.54493187,0.51401374,0.49056643,0.46147697,0.45661885,0.45358128,0.45768231,0.45841681,0.47026584,0.47897267,0.47993108,0.48303200,0.46892747,0.45182325,0.45758933,0.46405375,0.44671491,0.43678364,0.39655791,0.36383017,0.31505372,0.26739695,0.31308596,0.35570153,0.41482537,0.46633411,0.52328345,0.58023445,0.63882836,0.69713883,0.67893760,0.65686918,0.64806369,0.63724154,0.63766309,0.63082946,0.63964713,0.64602102,0.63509170,0.62231591,0.61368043,0.59773498,0.57093606,0.53683225,0.49474902,0.45989828,0.46355302,0.47381809,0.48594776,0.49630172,0.48127113,0.46489367,0.46736967,0.46643522,0.49575261,0.52946088,0.55709195,0.59289217,0.63012673,0.66865933,0.73087116,0.78544770,0.70624975,0.62707495,0.54678297,0.46625871,0.42208893,0.37399644,0.31989697,0.26877845,0.31724305,0.36526363,0.40941404,0.45506918,0.49910162,0.53859164,0.57578706,0.61793084,0.60231164,0.58636513,0.56837944,0.55098076,0.54375743,0.53410314,0.51659465,0.49927692,0.45204492,0.40566605,0.38192737,0.35577617,0.32143441,0.27813220,0.24723004,0.21259451,0.25436182,0.28829237,0.31048241,0.33650747,0.31833884,0.29612906,0.29396607,0.29373729,0.31575076,0.33698921,0.35428278,0.37972493,0.38237339,0.39314630,0.38933728,0.38302262,0.39080875,0.40077090,0.38935971,0.38577200,0.37785983,0.37521086,0.35752844,0.34266812,0.34421145,0.35007629,0.34478253,0.33126165,0.29039552,0.25345705,0.19148142,0.13522293,0.17853266,0.21741131,0.26699023,0.31426482,0.31694398,0.32222255,0.33474551,0.34974110,0.33255305,0.31786094,0.31807534,0.31897823,0.32077233,0.32444375,0.29551483,0.27026645,0.29767270,0.31694639,0.34401296,0.36487130,0.39620760,0.42686351,0.45557843,0.47649440,0.53890013,0.60563380,0.63253414,0.66404419,0.71246355,0.76366404,0.79677678,0.83867901,0.79369909,0.75332337,0.71059184,0.66609574,0.64043428,0.60914120,0.58867865,0.56611164,0.53914145,0.51466391,0.48228798,0.45584563,0.43071256,0.41004788,0.40112641,0.38747574,0.36596932,0.33947410,0.32971198,0.31520746,0.28419261,0.24804635,0.22402009,0.17453625,0.24196296,0.30171259,0.37077873,0.43320946,0.48359666,0.53920875,0.58446380,0.63726869,0.61769455,0.60699617,0.59427970,0.57844591,0.56300401,0.54745102,0.52128613,0.49376817,0.50855581,0.53121987,0.55485444,0.57654244,0.62441162,0.67306710,0.72364813,0.76926932,0.76396313,0.75271454,0.74820035,0.73754499,0.77549873,0.80837427,0.83418004,0.86508701,0.80855136,0.74375265,0.69822497,0.64608687,0.60613690,0.56566820,0.52280843,0.47741887,0.52401993,0.57163852,0.61923237,0.66624767,0.70536266,0.73775113,0.78002880,0.82898565,0.77544926,0.72134002,0.66126419,0.59917378,0.51353969,0.42383980,0.33487413,0.24366700,0.28505599,0.32621785,0.37614058,0.42227331,0.43883978,0.44845128,0.46208982,0.47720094,0.50963652,0.54141213,0.56897394,0.60237300,0.63706037,0.67261663,0.71505119,0.76081896,0.70659852,0.65427148,0.59095093,0.53285784,0.50433981,0.47278087,0.45481345,0.44059631,0.45716338,0.47663726,0.50521898,0.52830012,0.52386630,0.51787412,0.51392098,0.50653859,0.49675314,0.48783425,0.47465181,0.46328357,0.42200581,0.37513608,0.32904270,0.28584620,0.32879834,0.37075937,0.40834506,0.44856793,0.49721542,0.55211993,0.60668987,0.65734846,0.65345212,0.65168737,0.66257199,0.66425338,0.66073025,0.65018070,0.65266758,0.66034351,0.64805137,0.63482621,0.62355451,0.61151320,0.56982910,0.52201888,0.48312388,0.43713807,0.45976721,0.48581112,0.50723800,0.53228582,0.52279175,0.51135086,0.51488169,0.50986801,0.54222560,0.57637892,0.61235023,0.64582089,0.70069198,0.74818697,0.80296112,0.85770097,0.77002195,0.68654081,0.59585896,0.50784378,0.45979725,0.40724674,0.34186887,0.28112247,0.32723890,0.36785246,0.40271819,0.43771224,0.48553734,0.53249348,0.57602481,0.61280998,0.61270187,0.60520176,0.60141866,0.59986037,0.58720925,0.57333766,0.55325385,0.53518716,0.48139947,0.42855183,0.39411192,0.35288648,0.30577545,0.26187911,0.21036518,0.16095967,0.19383376,0.22359103,0.24615888,0.26703409,0.26004197,0.24630413,0.24201346,0.23290168,0.26168643,0.28079633,0.31023976,0.33910340,0.34459328,0.34959815,0.35217560,0.35274765,0.34923516,0.34167846,0.32136159,0.30152284,0.29908405,0.29103016,0.27839767,0.27164811,0.28286183,0.29068084,0.30344685,0.31291371,0.26112680,0.20739437,0.15219024,0.09709212,0.15351863,0.21329947,0.27396629,0.34375116,0.35091575,0.35910464,0.37107064,0.38157942,0.36912473,0.35678802,0.35433887,0.35061633,0.35076396,0.34788744,0.32152092,0.30029465,0.32346919,0.34782605,0.37641137,0.40749748,0.43442527,0.46290818,0.48119123,0.50212764,0.55827571,0.61275300,0.66168431,0.70753298,0.74378444,0.77939814,0.81683708,0.85373173,0.80476299,0.75262298,0.70527875,0.65306953,0.62813757,0.60654802,0.58625349,0.56627317,0.53209710,0.49674680,0.45791290,0.42597387,0.39475909,0.36336294,0.33228492,0.30194262,0.29834825,0.29888523,0.29912573,0.30088081,0.26966196,0.24061493,0.20699971,0.14985503,0.22065777,0.29286439,0.36309178,0.43960892,0.48596633,0.53469110,0.57780302,0.62829329,0.62990036,0.63422892,0.62750032,0.62452549,0.60179389,0.58307025,0.55304864,0.52370069,0.54315170,0.56077918,0.58544959,0.60926682,0.66095838,0.71424977,0.76274783,0.81580319,0.79188221,0.77036096,0.75008589,0.72805225,0.77269138,0.81748137,0.84665936,0.88590957,0.83463723,0.78951346,0.73353599,0.68237945,0.63432838,0.58903648,0.54041539,0.49629662,0.54848793,0.60114722,0.65042125,0.70776185,0.75365742,0.80449506,0.86409871,0.92175526,0.84344188,0.76559166,0.69153274,0.61932554,0.49337418,0.37243038,0.26256859,0.14473768,0.21094287,0.26957812,0.34676899,0.41794553,0.43335346,0.45578753,0.48511990,0.51229692,0.54544482,0.57513621,0.60491485,0.63320998,0.68831057,0.74483634,0.81023597,0.87630810,0.79491782,0.72058398,0.63102916,0.54609410,0.51283155,0.47841027,0.45211500,0.42228887,0.46053873,0.49332162,0.53540295,0.58170159,0.56711783,0.55921591,0.55753257,0.55584866,0.53116723,0.50769127,0.50145165,0.49353628,0.44165867,0.38723362,0.34636450,0.29917560,0.34215578,0.38592396,0.41144945,0.43413612,0.47840158,0.52023919,0.56813066,0.61853964,0.63243088,0.64719093,0.67163606,0.69430453,0.68161994,0.66513534,0.67251798,0.67386747,0.66241977,0.64725292,0.63343663,0.62674491,0.57079110,0.51299675,0.46641389,0.41977661,0.45369715,0.49324710,0.53067067,0.56752602,0.56054458,0.56241695,0.56045063,0.55422409,0.59391318,0.62926028,0.66735068,0.70388099,0.76315163,0.82720290,0.87339198,0.93049694,0.83559780,0.74031193,0.64744711,0.55155171,0.49674227,0.43675054,0.36331352,0.28913395,0.33289597,0.37484024,0.39241314,0.41654614,0.47622173,0.53279827,0.57338733,0.61146671,0.61447204,0.62514281,0.63596970,0.64700900,0.63069259,0.61851061,0.59553989,0.57867437,0.51366223,0.45118618,0.39978951,0.34543011,0.29692332,0.24786056,0.17052462,0.09772466,0.12877053,0.16275915,0.18343647,0.20297348,0.19603078,0.19286960,0.18648581,0.17616854,0.20451857,0.22947446,0.26779430,0.30101613,0.30481512,0.31148592,0.31943593,0.32232272,0.30281827,0.28377006,0.24814900,0.21269292,0.21619709,0.21276546,0.20580735,0.19129478,0.21475395,0.23293666,0.26405989,0.29318235,0.22880072,0.16829023,0.11315500,0.05710508,0.13023214,0.20024852,0.28688263,0.37727242,0.38306383,0.39618114,0.40224000,0.41273509,0.40526248,0.39436445,0.38803151,0.38590352,0.38092894,0.37733864,0.34831223,0.32602128,0.35203426,0.37604152,0.41405802,0.45099946,0.47307228,0.49584688,0.50817614,0.52564418,0.57690256,0.62994415,0.68805177,0.74510219,0.77230634,0.79855916,0.83051290,0.87049262,0.81113709,0.75281480,0.69578100,0.63821643,0.62480668,0.60472598,0.58713600,0.57256540,0.52370339,0.47635754,0.43947158,0.39634007,0.36044799,0.32117686,0.26538480,0.20970827,0.23237097,0.25900340,0.27044663,0.29010192,0.26351664,0.23414154,0.19481902,0.20926473,0.27228039,0.33595589,0.39803552,0.46539310,0.51060595,0.55074842,0.59614631,0.63892846,0.63957621,0.63685075,0.61705619,0.59860480,0.58267214,0.56973558,0.54366517,0.52024151,0.54336499,0.56157420,0.57750302,0.59137882,0.63314793,0.66806214,0.69749846,0.73096621,0.72796941,0.71823042,0.71053926,0.70778572,0.74598613,0.79209931,0.82399828,0.85673583,0.80901748,0.76381387,0.72469411,0.68435757,0.65169975,0.61973933,0.58458580,0.54790893,0.58480172,0.62377322,0.66078027,0.69305487,0.72273797,0.74922927,0.78317148,0.81982195,0.75649947,0.69332477,0.62972435,0.56853153,0.46623561,0.36181056,0.27722826,0.19133251,0.23020574,0.27469980,0.31917329,0.37335070,0.39925327,0.43041083,0.44989147,0.47767708,0.51427331,0.54849818,0.56926106,0.59799967,0.63970651,0.69087721,0.74430607,0.80511851,0.73808303,0.66872506,0.59882917,0.53026197,0.50170859,0.47228425,0.45677652,0.43293090,0.46239063,0.48603436,0.51492995,0.53591274,0.53169689,0.52576144,0.52129856,0.52354982,0.50626190,0.48597799,0.48139721,0.46883610,0.43374479,0.38631713,0.35591894,0.32411991,0.35093394,0.37080099,0.38877891,0.40847646,0.44378797,0.48388357,0.52982135,0.57520610,0.58627737,0.59262306,0.61333224,0.63189170,0.63048129,0.62960009,0.65595873,0.67427085,0.64912351,0.62400235,0.60845179,0.59299956,0.55421535,0.51650537,0.47701881,0.44044403,0.47286086,0.50362022,0.53112408,0.55915809,0.55937738,0.56024749,0.55808693,0.54976109,0.57294167,0.59953951,0.62894529,0.66034187,0.69572747,0.73562456,0.77719877,0.81150111,0.74600122,0.67089862,0.60203937,0.54024283,0.50262723,0.46127843,0.41995827,0.37479573,0.39441061,0.40847876,0.41724607,0.42787779,0.46620107,0.50458858,0.53701122,0.56534978,0.57123985,0.57717755,0.59060356,0.60802494,0.59822247,0.59105403,0.57872537,0.56757640,0.52126090,0.47863520,0.43514961,0.39619657,0.35296843,0.31165369,0.25071995,0.20103728,0.21013127,0.21942469,0.22556117,0.22702986,0.22233077,0.22253992,0.21366776,0.20064015,0.22947127,0.26324508,0.29415417,0.31973376,0.32351672,0.32390189,0.31726563,0.31255451,0.30241385,0.28848872,0.27335671,0.25980391,0.26170827,0.27225639,0.27246939,0.27905609,0.28422072,0.29503784,0.30501679,0.31605677,0.26776869,0.21741191,0.17762726,0.13027059,0.18227117,0.23411270,0.29722812,0.36775096,0.36880531,0.37331045,0.37748703,0.38590216,0.38164538,0.38075052,0.37546252,0.37037060,0.36561079,0.36343423,0.34015841,0.32563856,0.35885032,0.38856313,0.42866892,0.46730280,0.48308892,0.50257465,0.51741016,0.53375284,0.57436652,0.62275487,0.65875053,0.69896495,0.71672388,0.73986521,0.74939324,0.76523771,0.72422733,0.68451862,0.63885461,0.60152870,0.58292635,0.56630727,0.55597692,0.54416374,0.49127047,0.44731737,0.41466652,0.38256189,0.34468941,0.30810361,0.26484181,0.22033236,0.23884193,0.25417933,0.27622936,0.29899289,0.28016489,0.26227373,0.23665254,0.26788971,0.32246844,0.37593641,0.43416489,0.49223605,0.53421734,0.57178694,0.60941037,0.64510524,0.64734620,0.64548407,0.60976517,0.57416541,0.56513299,0.55178127,0.53700316,0.51700984,0.54154951,0.56161026,0.56990047,0.57731673,0.60044497,0.61903626,0.63510158,0.64574280,0.65686450,0.66804941,0.67789947,0.68405921,0.72035675,0.76685677,0.79168969,0.82482818,0.78677272,0.74370979,0.72032961,0.69397943,0.67179929,0.65314234,0.62462397,0.59042956,0.62063804,0.64306599,0.66118277,0.68360638,0.68951594,0.69062336,0.70535605,0.72358237,0.66893208,0.61704332,0.56837920,0.52250878,0.43600714,0.35291086,0.29661887,0.23819166,0.25355463,0.26918139,0.29863870,0.32633423,0.36509127,0.40173171,0.42110935,0.43972172,0.47985237,0.51846966,0.53713766,0.55930386,0.59704579,0.62752309,0.67952270,0.73367323,0.67301481,0.61294973,0.56376357,0.51607158,0.49078620,0.46767893,0.45709493,0.44467728,0.46346478,0.48370352,0.48673914,0.49210209,0.49445681,0.48946043,0.49225732,0.48694684,0.47421000,0.46477214,0.45860553,0.45109558,0.42000685,0.38858000,0.36753178,0.34990053,0.35546320,0.36281817,0.36753470,0.37571960,0.41035876,0.44128928,0.48606896,0.53090201,0.53500780,0.54061093,0.55550879,0.57585945,0.58288475,0.59535554,0.63522541,0.67871444,0.63795890,0.59961560,0.58175117,0.56310230,0.53754052,0.51842737,0.48899998,0.45506926,0.48468490,0.51696907,0.53288080,0.54708393,0.55501996,0.56668835,0.55500224,0.54311974,0.55851527,0.56685924,0.59128045,0.61798068,0.63726782,0.64831813,0.67766597,0.70179124,0.65554520,0.60536938,0.56094209,0.52619277,0.51147164,0.49638748,0.47877288,0.46595716,0.45814621,0.45261607,0.44468784,0.43945004,0.45645341,0.48080850,0.49976314,0.51837709,0.52640101,0.52648028,0.54794800,0.57373058,0.57456690,0.57344484,0.55933125,0.55091542,0.52862113,0.50851115,0.47312505,0.43914370,0.40609707,0.37151576,0.33661161,0.29390043,0.28544207,0.27003240,0.26379097,0.25489451,0.25385524,0.24610217,0.23652044,0.22484474,0.25777099,0.29223495,0.31544891,0.34056301,0.33728614,0.33546308,0.31425926,0.29500937,0.29435469,0.29454060,0.30287876,0.30215950,0.31382189,0.32430729,0.34572031,0.36226424,0.35977622,0.35634767,0.35212481,0.34662974,0.30586153,0.26526958,0.23532804,0.20578681,0.23178105,0.25778829,0.30612844,0.35665041,0.35639413,0.34922126,0.35522700,0.36649244,0.36728630,0.36859163,0.36429564,0.35641823,0.35437868,0.34975201,0.33141229,0.31859970,0.35985561,0.40492282,0.44473517,0.48788258,0.49234749,0.50451927,0.52696663,0.54665936,0.58001516,0.61438226,0.63191837,0.64835730,0.66147892,0.67963751,0.66799297,0.65853434,0.63604419,0.61553731,0.58531912,0.55696091,0.54566103,0.53401623,0.52159964,0.51293703,0.46213854,0.40973359,0.38713928,0.36301172,0.33042040,0.30232190,0.26737552,0.22960789,0.24105109,0.25389477,0.28279548,0.31603520,0.30561337,0.29525354,0.28192183,0.30762071,0.36802011,0.42062214,0.47872020,0.53787041,0.56886945,0.59990461,0.63817087,0.67231025,0.65678372,0.63835642,0.60117502,0.56452506,0.56110018,0.55439842,0.53979279,0.52510473,0.53460420,0.54418889,0.55985188,0.57445845,0.57142138,0.56945750,0.58134257,0.58186219,0.60066943,0.61494432,0.63267953,0.64973545,0.68406290,0.72240628,0.75375084,0.78883205,0.76503448,0.74836706,0.72101476,0.69021234,0.69020056,0.68831987,0.67589947,0.66154642,0.66738937,0.66880936,0.66645825,0.66767813,0.65524877,0.64379638,0.63824341,0.63472449,0.59147256,0.55410198,0.51267270,0.47929269,0.41941327,0.36134561,0.31689811,0.27695684,0.27801106,0.28196437,0.28634728,0.29135738,0.32484199,0.35908392,0.39281526,0.42531646,0.44839045,0.47351534,0.49883943,0.52005266,0.55184633,0.58645597,0.62865126,0.67502199,0.62997192,0.58550488,0.54158015,0.49559496,0.47611243,0.46103014,0.45360705,0.44893503,0.45877057,0.46437210,0.46813648,0.47722852,0.47021111,0.46860618,0.46535706,0.46154333,0.46040204,0.45143053,0.44667352,0.44438200,0.42746998,0.39992798,0.38317140,0.36578493,0.35596293,0.34919590,0.34578767,0.33743522,0.37508484,0.41083624,0.44444837,0.47709939,0.47823625,0.48601786,0.49511665,0.50109575,0.53912544,0.57666000,0.63094028,0.67905257,0.64301017,0.60306665,0.56967045,0.53304749,0.52602895,0.51910107,0.49353543,0.47251919,0.49982835,0.51951966,0.54584164,0.56306795,0.56388072,0.55662265,0.55148113,0.54806769,0.55015972,0.55038823,0.56674558,0.58065973,0.57383696,0.56930417,0.57615201,0.58640630,0.56403039,0.53679926,0.50727215,0.48521157,0.49539025,0.51037261,0.52258840,0.53066177,0.51294846,0.48554789,0.45676747,0.43226760,0.44453161,0.45428277,0.46791213,0.48456953,0.48874660,0.49817878,0.51583832,0.53424949,0.53907502,0.54056937,0.54406952,0.54030712,0.53688144,0.52993000,0.51619514,0.50360249,0.47751335,0.45368097,0.42889678,0.40470809,0.37552001,0.35058418,0.31365467,0.28444379,0.27909189,0.27301308,0.25207884,0.23366285,0.27266209,0.31376921,0.34221523,0.37312109,0.35677153,0.33539709,0.31230837,0.28418991,0.30439295,0.31677327,0.32829852,0.33730593,0.36863809,0.40151020,0.43167661,0.45966571,0.43312837,0.41362676,0.39219875,0.37277157,0.34269075,0.30887928,0.27832786,0.25105496,0.27048004,0.29719829,0.32552905,0.36118999,0.34672446,0.33571758,0.33098227,0.31940199,0.32702508,0.33915263,0.34484851,0.34838202,0.34463616,0.33868958,0.33483209,0.32299022,0.36766935,0.40574625,0.45766187,0.50361818,0.50553343,0.50844288,0.52580106,0.53283314,0.56135894,0.58721589,0.60898978,0.62861953,0.61732146,0.60424998,0.58741142,0.57536213,0.56299801,0.55513676,0.54017816,0.52134498,0.50440098,0.48862610,0.47440090,0.46398412,0.42977617,0.39450655,0.36698557,0.33695606,0.31472887,0.29115001,0.26856706,0.24828714,0.25609339,0.26797735,0.30070449,0.32918481,0.32234947,0.31259720,0.31087759,0.35215529,0.41204466,0.47282388,0.52398404,0.58413776,0.60368567,0.62670782,0.66134150,0.69353136,0.66770367,0.64186044,0.59438770,0.55031863,0.55195939,0.55070690,0.53762161,0.52724264,0.52943315,0.52727589,0.54817918,0.57504690,0.54967261,0.52381153,0.52140488,0.52284771,0.53895055,0.55447878,0.58247074,0.61365652,0.64571048,0.67666494,0.71713147,0.75197108,0.74722937,0.74806685,0.71778042,0.68794783,0.70822685,0.72257647,0.72785925,0.73732722,0.71383449,0.69251206,0.67209334,0.66122555,0.62326942,0.59280204,0.56791645,0.54492322,0.51577361,0.48605071,0.46111809,0.43969550,0.39595196,0.35959373,0.33654246,0.31883217,0.30417773,0.29539603,0.27755169,0.25684790,0.28870119,0.31787659,0.36475361,0.41307895,0.41832993,0.42458216,0.45197478,0.48185648,0.51043251,0.54497540,0.57681756,0.61140432,0.58097843,0.55765773,0.50959326,0.46845918,0.45986826,0.45175593,0.45713231,0.45945040,0.44849292,0.44110709,0.45208699,0.46326937,0.45490665,0.44784810,0.44250635,0.44252830,0.44123226,0.44373961,0.44042852,0.44305672,0.42538455,0.41771706,0.39819977,0.38224837,0.36071448,0.33588347,0.31988576,0.29977888,0.33690442,0.37890526,0.39888217,0.42427466,0.42771413,0.43338890,0.42619685,0.42244200,0.49426996,0.56160675,0.62233679,0.68599653,0.64322023,0.60328322,0.55705890,0.50379987,0.51484140,0.52312597,0.50690412,0.48706061,0.51034748,0.52549624,0.55652759,0.58178360,0.56240016,0.54543733,0.54960061,0.54599083,0.53808745,0.53366910,0.53706286,0.53910302,0.51758883,0.49002418,0.48396549,0.46866214,0.46651248,0.46739600,0.45477961,0.44084269,0.48620929,0.53263053,0.57032611,0.60535674,0.56335188,0.52782441,0.47530618,0.42056926,0.42320280,0.42607686,0.44338808,0.45768035,0.46127151,0.45978689,0.47670391,0.49295621,0.50526464,0.51015044,0.51978720,0.53040152,0.54053833,0.54940443,0.56155135,0.56826817,0.55373111,0.54156877,0.52954014,0.51604222,0.46912998,0.42397223,0.36557126,0.30414904,0.30665245,0.30357306,0.27538066,0.24219293,0.29046549,0.33716881,0.37091346,0.40950383,0.37064208,0.33505899,0.30588871,0.27315925,0.30461981,0.34039212,0.35812217,0.37693669,0.42617723,0.47583839,0.51160820,0.55364099,0.51351580,0.47558639,0.44040397,0.40256417,0.37497425,0.34501651,0.32575354,0.29659256,0.31393126,0.32876586,0.34613726,0.36481229,0.34481210,0.32596686,0.30377559,0.27820817,0.29324812,0.31163078,0.32873455,0.34415865,0.33583006,0.32909948,0.33096646,0.33177149,0.36563234,0.40221030,0.46490434,0.52591430,0.52365806,0.51752716,0.52190705,0.52491135,0.54229953,0.55885002,0.58634866,0.60978236,0.56825212,0.52965882,0.51382056,0.49146590,0.49201496,0.49674657,0.48838673,0.48565565,0.45966312,0.43821942,0.42658458,0.41017959,0.39708282,0.38436243,0.34495506,0.30630128,0.29479637,0.28397444,0.27415325,0.26600982,0.27059949,0.28034316,0.31616360,0.34917221,0.34024938,0.33297927,0.34330865,0.34151865,0.40674911,0.47308651,0.53999717,0.60923719,0.63922677,0.67318211,0.72288167,0.76909367,0.72931708,0.68972280,0.63983666,0.59419437,0.59107856,0.58326236,0.56154810,0.53759837,0.52828919,0.52228994,0.52345944,0.52453889,0.49106485,0.45980255,0.43532765,0.40737393,0.44975552,0.49298951,0.54205515,0.58571582,0.63807452,0.68752787,0.74389121,0.79649431,0.78891873,0.78078790,0.76303558,0.74387561,0.74908364,0.75959519,0.76666717,0.76742676,0.73671014,0.70503423,0.66587947,0.63029467,0.57762360,0.53214393,0.49466838,0.45263260,0.43291241,0.40703333,0.38853645,0.36935102,0.34380718,0.31194555,0.29493669,0.27431591,0.26761974,0.26914349,0.26131839,0.24979542,0.26646079,0.28580706,0.30475359,0.32403530,0.34076274,0.36591238,0.39523265,0.41821159,0.45471919,0.49242048,0.52194141,0.55003920,0.53077468,0.51208779,0.48242383,0.45439499,0.45417153,0.45102080,0.44870626,0.44371150,0.43701658,0.42613694,0.42228919,0.42278824,0.40787800,0.39376675,0.37455822,0.35322382,0.36914333,0.37752123,0.38636894,0.39525638,0.38469383,0.38184592,0.37597091,0.36639698,0.35794922,0.34462489,0.32609522,0.30744750,0.32211665,0.33112996,0.33720055,0.34450482,0.36763805,0.39572578,0.41013059,0.42486491,0.48205448,0.53963331,0.59833778,0.65202985,0.62248258,0.59591219,0.55738833,0.51593397,0.52654942,0.53834835,0.53958472,0.54215168,0.55608989,0.56844127,0.58015597,0.59389449,0.57954566,0.57170423,0.56080466,0.54733782,0.54223858,0.52760817,0.51918692,0.51368536,0.48075979,0.44806964,0.41513523,0.38558225,0.40304189,0.41874359,0.43152845,0.43903547,0.50208976,0.56806866,0.61609706,0.66591157,0.61038448,0.55662439,0.49672579,0.43881032,0.42423213,0.40501651,0.39382102,0.38094908,0.40135077,0.41724475,0.44278325,0.47155926,0.49119084,0.51322659,0.54465774,0.57348599,0.57728640,0.58714057,0.58832223,0.59619688,0.59364819,0.59422304,0.58957888,0.58592017,0.53678615,0.48512282,0.42326951,0.36797332,0.35447401,0.33841125,0.32225875,0.29662863,0.31740869,0.33727430,0.36247011,0.38173086,0.35408341,0.32469212,0.30372717,0.28130709,0.31815573,0.35599552,0.38141244,0.40057807,0.45166824,0.50114483,0.54149450,0.58073241,0.55772715,0.53696610,0.50603166,0.48090841,0.45260652,0.42269243,0.39842986,0.37539982,0.36611464,0.36517768,0.36787797,0.37437696,0.33841485,0.30593707,0.27269781,0.24437434,0.25549097,0.27359674,0.28462568,0.30192737,0.29033105,0.27767241,0.28255931,0.27790623,0.32819236,0.37459236,0.42205953,0.47312101,0.49355175,0.51387530,0.53849284,0.56340126,0.55960096,0.55255795,0.55403140,0.55059865,0.50375757,0.45020052,0.41719303,0.38014161,0.39205024,0.40877665,0.42043502,0.43983315,0.42988142,0.41711122,0.40979468,0.40060070,0.38797672,0.36782483,0.34590817,0.32581152,0.29444707,0.26328840,0.24824839,0.23528711,0.24303863,0.25824984,0.28267634,0.30764108,0.31234291,0.32308930,0.32998576,0.34037753,0.40589286,0.47338758,0.55186049,0.63587710,0.67752390,0.71421962,0.77747773,0.84540041,0.78874782,0.73943190,0.68831624,0.63358411,0.62254412,0.61796908,0.58499569,0.55061832,0.52995438,0.50963077,0.49650851,0.47788618,0.44009126,0.39970128,0.34758113,0.29249085,0.35877348,0.43334672,0.49775891,0.56423243,0.62693931,0.69323617,0.77030064,0.84008239,0.82805154,0.81119899,0.79966987,0.79174481,0.79495626,0.79993883,0.80468383,0.80184418,0.75961679,0.72049616,0.65904649,0.59664958,0.53562248,0.46979250,0.41732082,0.36031465,0.34362241,0.33449218,0.32034556,0.30047485,0.28588036,0.26562216,0.25020335,0.22643087,0.23365498,0.24127890,0.24208824,0.24075724,0.24585236,0.25034002,0.24373532,0.23288283,0.26998968,0.29954280,0.33111000,0.35922809,0.39711769,0.43724351,0.46649674,0.49471176,0.47735749,0.46177279,0.44941460,0.44015787,0.44800501,0.45112756,0.44186262,0.43417319,0.42348155,0.41024986,0.39142126,0.37593497,0.35851302,0.33704058,0.30625986,0.27293939,0.29277964,0.31626509,0.33168931,0.35312346,0.34577462,0.34477565,0.34962777,0.35458479,0.35344290,0.35813236,0.33273290,0.30902332,0.29691385,0.28597286,0.28058471,0.26920195,0.31470498,0.35891208,0.39410702,0.42984168,0.47438076,0.51998865,0.56984893,0.61737784,0.60337859,0.58497094,0.55739092,0.52573403,0.54537235,0.56019649,0.57345128,0.58788340,0.59598318,0.60346088,0.61025445,0.60773827,0.59907741,0.58991597,0.56973909,0.55178130,0.54121561,0.52786006,0.50377625,0.48436174,0.44205388,0.39911855,0.34343114,0.29474337,0.33389606,0.36941731,0.40411918,0.43192134,0.52061711,0.60596825,0.66635344,0.73401020,0.66275136,0.59024712,0.52425519,0.45562936,0.42095917,0.38481579,0.34527811,0.30371000,0.33755664,0.37434188,0.41454550,0.44614182,0.48373432,0.51520521,0.56868727,0.62187082,0.62185154,0.62032023,0.61816692,0.61899289,0.63551521,0.64848644,0.65622740,0.66472878,0.60361821,0.54501791,0.48611269,0.42456722,0.40465175,0.37871608,0.36389362,0.35198929,0.34229990,0.33227382,0.35118042,0.36201478,0.33238955,0.30663522,0.29496399,0.28367773,0.32909132,0.37304567,0.40049620,0.42913831,0.47506672,0.52384574,0.57032200,0.61228546,0.60396742,0.59786728,0.57979748,0.56293412,0.52985405,0.49687078,0.47206829,0.44625073,0.42430541,0.39431727,0.38982545,0.37997695,0.32909422,0.28074222,0.24495608,0.20772665,0.22010739,0.23831659,0.24993521,0.26399053,0.24681429,0.22969015,0.23302542,0.22937457,0.28605878,0.34303090,0.37866135,0.42218936,0.46093254,0.50192496,0.55706532,0.60569480,0.57218669,0.53835610,0.52057240,0.49744953,0.43679165,0.37294522,0.32266071,0.26559467,0.29465935,0.31397156,0.35643147,0.39239172,0.39257901,0.40293204,0.39231152,0.38948932,0.37233723,0.35837690,0.34790333,0.33927324,0.29449081,0.24155281,0.22279590,0.20662033,0.21899317,0.23260781,0.24967359,0.27406936,0.29236492,0.31058732,0.32482123,0.32212628,0.39889688,0.47847992,0.56346140,0.65765010,0.71504530,0.76720732,0.83766589,0.90563601,0.85042834,0.79577270,0.73827172,0.68237136,0.65783371,0.63723303,0.59724448,0.55919171,0.53349040,0.50024869,0.47822626,0.44720350,0.38196730,0.31758469,0.24730689,0.17360424,0.26096134,0.35588819,0.43784904,0.52379153,0.60584495,0.69340605,0.79301324,0.88950536,0.87601688,0.85699957,0.85594290,0.84695122,0.84451952,0.84522171,0.84993652,0.85555367,0.78681459,0.72438792,0.65431960,0.58947944,0.50358609,0.41167174,0.33336457,0.24504541,0.25336265,0.26383351,0.25552530,0.25206133,0.24221632,0.22651489,0.21652644,0.20269711,0.21560001,0.23204233,0.24027634,0.24686468,0.23192475,0.22005392,0.18907507,0.16142691,0.19574011,0.23128994,0.27285588,0.30582777,0.33649645,0.36931875,0.39605249,0.42296789,0.42965659,0.43346331,0.43688491,0.44162749,0.43222421,0.43212229,0.41532439,0.40819770,0.39521398,0.38099374,0.37378330,0.36278175,0.32107833,0.28587886,0.23760918,0.18685988,0.21933222,0.24742671,0.27347394,0.29365173,0.30929235,0.32564594,0.33551734,0.35053754,0.34840334,0.34327810,0.33943864,0.33669988,0.29219494,0.25534875,0.21950139,0.18682116,0.25472054,0.32124947,0.37510888,0.42706346,0.46977907,0.50979866,0.55320731,0.59826964,0.58626477,0.58496267,0.56309341,0.54375410,0.57194544,0.60115703,0.62207827,0.64821473,0.64442990,0.64153263,0.64571885,0.64628392,0.62106095,0.60174187,0.57788037,0.55168756,0.53267037,0.51303380,0.48199382,0.44951082,0.39410873,0.33355373,0.27046691,0.19987744,0.26401388,0.32911009,0.38150289,0.42916399,0.52990310,0.63406080,0.71977008,0.80045328,0.71453114,0.63311790,0.55767448,0.49022218,0.41951529,0.34642630,0.28016480,0.21491887,0.27422015,0.33532904,0.38558619,0.43912129,0.48742406,0.54116413,0.59337926,0.64433775,0.65297315,0.66179560,0.66079213,0.66536096,0.68160987,0.69305324,0.71622496,0.73741674,0.66770118,0.59696261,0.53797256,0.46977343,0.45515286,0.43748285,0.41224304,0.39085674,0.37302307,0.35801749,0.34583811,0.32818978,0.31888540,0.30225141,0.29893488,0.29118973,0.33624158,0.37968602,0.40977769,0.44603672,0.50244721,0.56121557,0.61524213,0.66811589,0.66077417,0.65244485,0.64338767,0.63778880,0.60447678,0.57007129,0.54891430,0.52421154,0.48354399,0.45274722,0.41904848,0.38608804,0.32650639,0.26539696,0.20374918,0.15197015,0.16591832,0.18209265,0.19345901,0.20906351,0.19830542,0.18579795,0.18472554,0.17445206,0.23549622,0.29639435,0.33818717,0.37461139,0.44109752,0.51491693,0.57887860,0.64639890,0.58830655,0.53368389,0.49170316,0.44488917,0.37362339,0.30988685,0.23584323,0.16597218,0.20630958,0.24616829,0.29154213,0.34036292,0.34947180,0.35334160,0.36149925,0.36497022,0.35657597,0.34781747,0.34622831,0.35015556,0.30007475,0.24740245,0.19869229,0.15625642,0.17067421,0.18705694,0.20799100,0.22345122,0.25314966,0.28425583,0.30178715,0.30636138,0.39138667,0.47667534,0.58147478,0.68305927,0.75548845,0.82690760,0.89686072,0.97322851,0.90875911,0.84892692,0.79142073,0.73248585,0.69532650,0.65475198,0.60946193,0.57123008,0.53393943,0.49553933,0.45922210,0.42296404,0.32920222,0.23191659,0.14098621,0.05151788,0.16851507,0.27897205,0.38461201,0.48480729,0.59062902,0.68819977,0.81267561,0.93799026,0.92021408,0.90583630,0.90301391,0.90656883,0.89876017,0.88575320,0.89858674,0.90933375,0.82069970,0.72911345,0.65504176,0.58442695,0.46816671,0.35403278,0.24563285,0.13604714,0.16636865,0.19235207,0.19617174,0.20550739,0.20003069,0.18785350,0.18065320,0.17586054,0.19396694,0.21560794,0.23847176,0.25658010,0.21959698,0.18564474,0.13154907,0.08164632,0.12513492,0.16593426,0.20617519,0.24905395,0.27548343,0.29875012,0.33032108,0.35635241,0.38252174,0.40767551,0.42266495,0.43609958,0.42154249,0.41323858,0.39549844,0.38063795,0.36372478,0.34920021,0.35222692,0.35165405,0.29233705,0.23182638,0.16669000,0.09871841,0.14412900,0.18445172,0.21065894,0.23365189,0.26917185,0.30300341,0.32214889,0.34119790,0.33955348,0.33496273,0.34923857,0.35882988,0.28785766,0.21874724,0.16039028,0.09983986,0.19339272,0.28172447,0.35260797,0.43015028,0.46094624,0.49615485,0.53373818,0.57396665,0.57336910,0.58171413,0.56875794,0.55109504,0.59690644,0.63471705,0.67001380,0.71298578,0.69244901,0.67211733,0.67994858,0.68547609,0.64817823,0.60769416,0.58327465,0.55721763,0.52380651,0.49838835,0.45916450,0.41842281,0.34448977,0.26942396,0.19100358,0.10637347,0.19958146,0.29148089,0.35933596,0.42769818,0.54847051,0.66669216,0.76740879,0.86957311,0.76918079,0.66924618,0.59572745,0.51728363,0.41062381,0.30662562,0.21656402,0.12303749,0.21131336,0.30003100,0.36230919,0.43046915,0.49273961,0.56244787,0.61552923,0.66896362,0.68499982,0.70199236,0.70020863,0.70784624,0.72246709,0.73927631,0.77693934,0.81484470,0.73104002,0.65216469,0.58826360,0.51349079,0.50805131,0.49625940,0.45869293,0.42775579,0.40475716,0.38033361,0.33713317,0.29368985,0.29633126,0.29980290,0.29678814,0.29232150,0.34004172,0.38418130,0.42349347,0.46451487,0.53289912,0.59763526,0.65976496,0.72429167,0.72032109,0.71345555,0.71486867,0.71714752,0.67887502,0.64433127,0.62419172,0.59813643,0.54754282,0.50608491,0.44781280,0.39345505,0.31811697,0.24911917,0.17257710,0.08959345,0.11193022,0.12498887,0.14342187,0.15990746,0.15311931,0.14159983,0.13493779,0.12238025,0.18732696,0.25625636,0.29108909,0.32500654,0.42551679,0.52274161,0.60115296,0.68558313,0.60529887,0.52672155,0.45576682,0.38961982,0.31613021,0.24207839,0.14778004,0.05642508,0.11501457,0.17189642,0.23301433,0.29584173,0.30135847,0.30755525,0.32523272,0.34126675,0.34053960,0.33039111,0.34727261,0.36666091,0.30255302,0.24754804,0.17557644,0.10371229,0.12641511,0.14531841,0.15780588,0.17023246,0.22042983,0.26646334,0.28350598,0.36491923,0.44036304,0.51495508,0.58426113,0.65834208,0.71683193,0.77960451,0.83402998,0.88549544,0.83797394,0.78475073,0.74568584,0.70990454,0.67240058,0.63680140,0.59285453,0.55072105,0.51146011,0.47707216,0.43178159,0.38006090,0.31295319,0.23441945,0.16236108,0.08622164,0.19249096,0.29288291,0.38269305,0.46737671,0.57336612,0.67533607,0.79260913,0.90579706,0.90139529,0.89085916,0.88744271,0.88497038,0.86873950,0.85611114,0.84849673,0.83243876,0.76567224,0.68741823,0.61491177,0.54402668,0.45792663,0.36398524,0.27727320,0.18394367,0.19880390,0.20953838,0.21771345,0.22431307,0.21845336,0.21396878,0.20927595,0.20661984,0.21182347,0.22598629,0.23933202,0.25271755,0.22751713,0.20141021,0.17012119,0.13827344,0.17713163,0.21205796,0.24280362,0.27701247,0.29292739,0.30194641,0.31083213,0.31301735,0.34242556,0.37687494,0.39949044,0.42198260,0.42345557,0.42615393,0.41614102,0.41626562,0.38686549,0.35997383,0.35302620,0.34423600,0.28201230,0.22079782,0.16154622,0.10335357,0.14424603,0.18582025,0.22101016,0.25978532,0.30052865,0.33521732,0.37062868,0.40348829,0.39470753,0.39086880,0.38930997,0.39229372,0.34662619,0.30021652,0.24796038,0.20075254,0.25901066,0.31843291,0.37643591,0.43158546,0.47053459,0.50087891,0.54307758,0.58791240,0.59082256,0.59335109,0.59072927,0.58633114,0.62245386,0.65866211,0.67658957,0.70093407,0.68651352,0.67208416,0.66269690,0.65189415,0.60893612,0.57123197,0.53068359,0.49711564,0.47933485,0.45364530,0.42219585,0.39574486,0.34060071,0.28627089,0.23087394,0.16462663,0.23929680,0.31551478,0.37474587,0.43450909,0.53728133,0.64017818,0.73845505,0.83772741,0.75182671,0.66736743,0.59308947,0.51039053,0.42237793,0.33712093,0.25076280,0.16712617,0.23613683,0.30897515,0.37447116,0.44125601,0.49147229,0.53985668,0.58721722,0.63499508,0.64543727,0.65328145,0.65731476,0.66244053,0.68181287,0.69344397,0.71855411,0.74568876,0.68064290,0.61779454,0.55265886,0.48399330,0.47522362,0.46500343,0.44106147,0.41236947,0.40424285,0.39180216,0.36423803,0.32867779,0.33227999,0.33367446,0.33376700,0.33771427,0.37244810,0.41052341,0.43647324,0.46574984,0.51046377,0.55573187,0.61331504,0.66649431,0.66783779,0.66779448,0.66887157,0.67599132,0.65836248,0.63657032,0.62697619,0.61812871,0.57004294,0.51975923,0.45707116,0.40217497,0.34625565,0.29098306,0.23344810,0.17724448,0.19228766,0.20712267,0.22081839,0.23685323,0.22508505,0.20818076,0.21102956,0.20885391,0.25685709,0.29661903,0.33607789,0.37144356,0.44394074,0.52300037,0.59576303,0.67097032,0.60085078,0.53979938,0.48035234,0.42617967,0.36508294,0.30237758,0.23913606,0.18179388,0.22049317,0.25204191,0.30288689,0.35196841,0.35874415,0.37362621,0.38945787,0.41606964,0.40866548,0.40690154,0.40905302,0.40493760,0.35397368,0.30609810,0.23916127,0.17769244,0.20007273,0.22259038,0.23667155,0.25139067,0.28639770,0.31904058,0.34762661,0.42789691,0.48967848,0.55005763,0.59258359,0.63712579,0.68200690,0.73243648,0.76599267,0.80883667,0.76378659,0.72081785,0.70171671,0.68379335,0.65126409,0.62032419,0.57414318,0.52228679,0.49192051,0.46214074,0.39973304,0.34439415,0.29488825,0.23909192,0.17689551,0.11547543,0.21645869,0.31060753,0.37401119,0.44268722,0.55332568,0.65855439,0.76936640,0.88220176,0.88063560,0.88107416,0.87506592,0.86165092,0.84513019,0.82310845,0.79380242,0.76195918,0.70889464,0.65148732,0.57820825,0.51122102,0.44436849,0.37717923,0.30410664,0.23372977,0.22976362,0.22396446,0.23148448,0.23993713,0.24291194,0.24699358,0.24265121,0.23602021,0.23472606,0.22942998,0.24165513,0.25664049,0.23819019,0.21390643,0.20306714,0.19626842,0.22856419,0.25614027,0.28239143,0.30848836,0.30403250,0.30838909,0.28654358,0.26925698,0.30547084,0.34228812,0.37305328,0.40159201,0.41926616,0.44210916,0.43963738,0.44656018,0.40406255,0.36558523,0.35274532,0.34068931,0.27660049,0.21677482,0.15737401,0.10117265,0.14200874,0.18713502,0.23578770,0.28918113,0.33140890,0.37153750,0.42345185,0.47025430,0.45726260,0.43927918,0.43715244,0.43166475,0.41111086,0.38853298,0.34154943,0.29326299,0.32555570,0.35749516,0.39904028,0.43512633,0.47652569,0.51062181,0.55210763,0.59830354,0.60429947,0.61299408,0.61672920,0.62239012,0.64980169,0.68233658,0.68350126,0.68654339,0.67659364,0.67200102,0.64687796,0.62392263,0.57447357,0.52755696,0.48169308,0.43727338,0.42577365,0.41196415,0.39682597,0.37236438,0.34378646,0.30940771,0.26632829,0.22711158,0.28415434,0.34413430,0.38782367,0.43653762,0.52695213,0.61692654,0.70822648,0.80579159,0.73547843,0.66519089,0.58396763,0.50580426,0.43721942,0.36926454,0.28981877,0.21121638,0.26206918,0.31773835,0.38358188,0.44935428,0.48483741,0.52151780,0.56560726,0.60967311,0.60585377,0.60777982,0.61111018,0.62019576,0.63488953,0.65185669,0.66642821,0.67944013,0.62771454,0.58053144,0.51614017,0.45827841,0.44587348,0.43964091,0.42175199,0.39615491,0.40238774,0.40557695,0.38579976,0.36378217,0.36456939,0.35926314,0.37616277,0.38496336,0.40785201,0.44008043,0.45570784,0.46909864,0.49705085,0.51604516,0.56195260,0.60963967,0.61138514,0.61902100,0.62807570,0.63730986,0.63778027,0.63424544,0.63575801,0.63889734,0.58545732,0.53488454,0.47224511,0.40434462,0.36534174,0.32675774,0.29951270,0.27129121,0.27665588,0.28318473,0.29699497,0.31290442,0.29313979,0.27263770,0.28139553,0.29575184,0.31812862,0.34522936,0.37843980,0.41664261,0.47026673,0.52064968,0.58636324,0.65369303,0.60135528,0.54728186,0.50437722,0.45917116,0.40773653,0.35769801,0.33195307,0.30782399,0.32037544,0.33547142,0.37118455,0.40704307,0.41712750,0.43306041,0.45944690,0.48231444,0.48209955,0.48573136,0.46699696,0.44728762,0.40597865,0.36949724,0.30875871,0.24447985,0.27070222,0.29953727,0.31421625,0.33480802,0.35918737,0.38194982,0.40051078,0.47253932,0.52193249,0.56357340,0.60243817,0.63754873,0.66080052,0.68984596,0.70327159,0.72030136,0.69398796,0.67691949,0.66602347,0.65226328,0.62190519,0.59687256,0.55618522,0.51671937,0.47328436,0.43193705,0.37355965,0.31876876,0.27573550,0.24257533,0.19888654,0.16279177,0.23874619,0.31288754,0.37209712,0.42999849,0.54009264,0.65295951,0.75586272,0.85819271,0.85436647,0.85616343,0.86464795,0.86924674,0.82727448,0.78383629,0.74139042,0.70000228,0.64558953,0.59359309,0.52746764,0.46742588,0.42444809,0.37557734,0.33635317,0.29644983,0.27394610,0.26122817,0.25491614,0.24752764,0.24784450,0.24965269,0.25648617,0.25708759,0.25150312,0.24950429,0.25319064,0.25579699,0.25418378,0.24599582,0.25093372,0.25329842,0.26556742,0.28452327,0.30755340,0.32939249,0.30805181,0.28914353,0.26016275,0.23208642,0.27873302,0.32618305,0.36767668,0.39950243,0.42165291,0.44493701,0.46203257,0.47616766,0.42693183,0.37969260,0.35624269,0.32733443,0.26517177,0.20496107,0.14153339,0.08019050,0.13594111,0.18440398,0.23965085,0.29385594,0.35219169,0.41449826,0.47013798,0.53391875,0.51889791,0.50657715,0.49791351,0.48841453,0.46772904,0.45086616,0.42576375,0.39606856,0.41164652,0.41868661,0.43025531,0.43751190,0.48689865,0.53023499,0.56879532,0.60908064,0.62819254,0.63832491,0.65533588,0.66536988,0.68413209,0.69895797,0.69485473,0.69225058,0.67357590,0.65224162,0.62652825,0.60402559,0.55471025,0.49861138,0.44609348,0.39606412,0.39178308,0.39247972,0.38199824,0.37806457,0.35176860,0.32604275,0.29985626,0.26562111,0.31611912,0.36223612,0.39686106,0.43086594,0.51513374,0.60130662,0.69128164,0.78217600,0.71790195,0.65310957,0.58262674,0.51282060,0.45019940,0.38249960,0.31073226,0.23699829,0.28880290,0.33751617,0.38759539,0.44348376,0.47524729,0.50264385,0.52898180,0.55895003,0.55795386,0.56218374,0.56601107,0.56875900,0.58354297,0.59605904,0.60889369,0.61350620,0.57332297,0.52929490,0.47340595,0.41199575,0.41254581,0.41127493,0.40561378,0.40663254,0.40858511,0.42219390,0.41704665,0.40762767,0.40773469,0.40770431,0.41546430,0.42151350,0.43545825,0.45363493,0.45813134,0.46553408,0.48716691,0.50258199,0.52644810,0.54884384,0.56228858,0.58050207,0.59810330,0.62153684,0.62205232,0.62267708,0.63196947,0.64496708,0.59516017,0.54251611,0.48263690,0.42296449,0.40464298,0.38375924,0.36151568,0.33639250,0.34442684,0.34907647,0.36727196,0.37917881,0.36515975,0.35466621,0.35662402,0.36202291,0.38128176,0.39947621,0.42106837,0.44273394,0.48952414,0.53231020,0.59165205,0.65483173,0.60961689,0.55659515,0.52226196,0.48252767,0.45958870,0.43439563,0.42421349,0.41191250,0.41259299,0.41612222,0.42718237,0.44446868,0.47099676,0.50368773,0.53407039,0.56588338,0.55052378,0.53683233,0.51845668,0.49988537,0.46100168,0.41752294,0.36640802,0.30972633,0.34059735,0.36936497,0.38257802,0.39566292,0.41594789,0.43909312,0.45754800,0.52449368,0.55199967,0.58373700,0.61094683,0.64196866,0.64529141,0.64781991,0.64165286,0.63221158,0.63080878,0.62339465,0.62741983,0.62779317,0.59785151,0.57382941,0.53957294,0.50151074,0.45334242,0.41099313,0.34886045,0.28356436,0.26535835,0.24143506,0.22471369,0.20202182,0.25841350,0.31789543,0.36656305,0.41654767,0.52948576,0.64149455,0.73375641,0.82822118,0.83212170,0.83030678,0.85611734,0.87874155,0.81458204,0.74752352,0.69647868,0.63747515,0.59154725,0.53904709,0.47935191,0.41910592,0.40080432,0.37652990,0.36447325,0.35646340,0.32620292,0.29332152,0.27092296,0.25179922,0.25295581,0.26111324,0.27032197,0.28708948,0.27719110,0.26919786,0.26320401,0.25663226,0.26616911,0.28122999,0.28993048,0.30727311,0.31294973,0.31901724,0.33924335,0.35825075,0.31112876,0.26787519,0.23100323,0.19358794,0.25267583,0.31606996,0.35413620,0.40264162,0.43106437,0.45819704,0.47949920,0.50510972,0.45189812,0.39711353,0.35507144,0.31614699,0.25202498,0.18744878,0.12553292,0.06296261,0.12350865,0.18482875,0.23882789,0.29392962,0.37383053,0.46030636,0.52365620,0.59461040,0.58275678,0.57076576,0.55649238,0.54426466,0.53300556,0.51920640,0.50926332,0.50184694,0.49285348,0.48275296,0.45887754,0.43823387,0.49794174,0.55302758,0.58916800,0.62499167,0.64674482,0.66738645,0.68715110,0.71251924,0.71006852,0.71621081,0.70031484,0.69295519,0.66228765,0.63283751,0.60660452,0.58483728,0.52728718,0.47775977,0.41344596,0.35262408,0.36156262,0.37237030,0.37397278,0.38203277,0.36057328,0.34258601,0.33051805,0.31112410,0.34580536,0.38110399,0.39956513,0.41837570,0.50225660,0.57706400,0.67070853,0.76015419,0.70030125,0.63924704,0.57802116,0.52351178,0.45880597,0.39645939,0.33082242,0.26781999,0.31333798,0.35380916,0.39613633,0.43393761,0.46020127,0.49244109,0.49989972,0.50325717,0.51364065,0.52190194,0.51707500,0.51354859,0.53084366,0.54474667,0.54896083,0.55304037,0.51201837,0.47724809,0.42250762,0.36614221,0.37873261,0.38793507,0.40106532,0.40963427,0.42449137,0.43775744,0.44141760,0.45556455,0.45862555,0.45981726,0.45826941,0.45920546,0.46412394,0.46986406,0.46361220,0.46162662,0.47756596,0.49000701,0.48272635,0.48282641,0.51152152,0.53489634,0.57174988,0.60301323,0.60565626,0.61209598,0.63388505,0.65468538,0.60184411,0.54674451,0.49548834,0.43637339,0.43721472,0.43625628,0.42242252,0.41164999,0.41824697,0.42211236,0.43739286,0.45172874,0.44319005,0.43571259,0.43343412,0.43253196,0.44638477,0.46277488,0.46060815,0.46660561,0.50426519,0.54088414,0.59711726,0.65526711,0.61026054,0.56918001,0.53677551,0.50765615,0.51129460,0.50844033,0.51660000,0.52567121,0.50825568,0.49351928,0.48702646,0.47831958,0.52719322,0.57405100,0.60840038,0.64471087,0.62028641,0.59522872,0.57327099,0.55465903,0.50669619,0.46318968,0.41846698,0.37487370,0.40880484,0.44593054,0.44995150,0.45783871,0.47979888,0.49671506,0.51277879,0.58946795,0.60114913,0.60531137,0.62381353,0.63682688,0.62508495,0.61063218,0.59169566,0.57687241,0.58183290,0.57968315,0.59281164,0.60158824,0.58202142,0.56291109,0.53928818,0.52079557,0.46805232,0.41886642,0.36952569,0.31394847,0.27770704,0.23868577,0.21603097,0.19163932,0.26171447,0.32407670,0.40091869,0.46708316,0.57245100,0.67436514,0.76279133,0.84781872,0.84581228,0.84276013,0.84739757,0.84618805,0.78935368,0.73362311,0.68883044,0.64332773,0.59688337,0.55120626,0.48789856,0.42411651,0.40208079,0.37695010,0.35390516,0.33107639,0.30880005,0.29080231,0.28225744,0.27384446,0.26555584,0.25382520,0.24632914,0.23649147,0.24087300,0.24095122,0.24439082,0.24808756,0.26025695,0.26774423,0.28604254,0.30235503,0.30552732,0.31383527,0.32684084,0.34285689,0.29704311,0.25293967,0.21750122,0.18961588,0.23769496,0.28777218,0.33091673,0.37748000,0.40252324,0.42752532,0.45470672,0.47803334,0.42061866,0.36985251,0.32774567,0.28342762,0.23028950,0.17784493,0.12347693,0.06995967,0.13340286,0.19403150,0.25247272,0.30468917,0.39406939,0.47492661,0.56105051,0.64323025,0.62199766,0.59961915,0.58338889,0.56058432,0.56293664,0.55615613,0.55664326,0.55093147,0.53996320,0.52358425,0.50799074,0.48616485,0.53917993,0.59011298,0.62786549,0.65845213,0.67324484,0.67592413,0.69429145,0.70648516,0.71321505,0.71556238,0.70948958,0.70665395,0.66763847,0.63361195,0.58990030,0.54718679,0.47629678,0.40476942,0.33955846,0.27312764,0.30127996,0.32288964,0.33899548,0.35952562,0.35317814,0.34786161,0.35723848,0.36595065,0.38928197,0.41576063,0.43335501,0.45194878,0.51443735,0.58039938,0.64953013,0.71425916,0.66594646,0.61440185,0.57109497,0.53292499,0.47529782,0.41770467,0.36217168,0.30290961,0.34108127,0.38070288,0.41923851,0.46548715,0.47879103,0.49604157,0.50316903,0.52095574,0.51222566,0.50992492,0.50325790,0.49417426,0.49325442,0.49484579,0.49289934,0.49603325,0.46833877,0.44752172,0.40912417,0.37312062,0.36543377,0.35531696,0.35889772,0.35820513,0.38274437,0.40614272,0.42581206,0.45146003,0.46080282,0.47087222,0.47628221,0.48509769,0.47375408,0.47126965,0.46140812,0.45289883,0.44686233,0.44735735,0.44121249,0.43191037,0.47144495,0.51218624,0.55215199,0.58997684,0.60558215,0.61931298,0.63978250,0.65945972,0.61289797,0.56786473,0.51966507,0.47414861,0.47528969,0.47244864,0.46395204,0.45447100,0.45296549,0.45560827,0.46814614,0.47489579,0.46714429,0.46084957,0.45864902,0.46273058,0.46668164,0.46932879,0.47845965,0.48618055,0.51347491,0.54178810,0.57773942,0.61073206,0.59746147,0.58991830,0.57841932,0.56558211,0.57630802,0.58761058,0.59555447,0.60538010,0.59222627,0.58349538,0.57184096,0.55468017,0.60577966,0.65473516,0.68886147,0.72138389,0.69814365,0.67415158,0.65816664,0.63552495,0.59614683,0.56014616,0.52466838,0.48128917,0.50186031,0.52647223,0.53548577,0.54289212,0.55400754,0.56324271,0.57389853,0.65479057,0.64067608,0.63363209,0.63123278,0.62842915,0.60026816,0.57667177,0.55005303,0.52695440,0.52998150,0.53604907,0.55573311,0.57600077,0.56433402,0.54821267,0.54635907,0.54106901,0.48754960,0.43216006,0.38699761,0.35074455,0.29443739,0.23636890,0.20735608,0.18524063,0.25859801,0.33495882,0.43015643,0.52007510,0.61722106,0.71446269,0.79021495,0.86450075,0.85670423,0.85067739,0.83690032,0.81956974,0.76742543,0.72072430,0.68610340,0.64667803,0.60814504,0.56590459,0.49730149,0.43222752,0.40344389,0.37012510,0.33615132,0.30802393,0.29772465,0.28535806,0.29191345,0.29837810,0.26814628,0.24465725,0.21360250,0.18674718,0.20677807,0.22105013,0.22736008,0.24022870,0.24818317,0.26076813,0.27874051,0.29390649,0.29893410,0.30891267,0.31845523,0.32233302,0.28326425,0.23486376,0.20833186,0.18043564,0.21955504,0.25844512,0.30370196,0.34629575,0.37159212,0.40063251,0.42307411,0.45006171,0.39279090,0.33749335,0.29766140,0.25492858,0.21219592,0.16904708,0.11860889,0.06584453,0.13983613,0.20661350,0.26351617,0.31440057,0.40796188,0.49065806,0.59419577,0.69315274,0.66549122,0.63626611,0.61077024,0.58438292,0.59313219,0.59901888,0.60288898,0.60899059,0.59039890,0.57232671,0.55080215,0.52981780,0.57735917,0.62827827,0.66253635,0.69787471,0.69409375,0.68880447,0.69898768,0.70635993,0.71388682,0.72179651,0.72381004,0.72211475,0.67702413,0.63340711,0.56858873,0.50437770,0.42188643,0.33227294,0.26728819,0.19556326,0.23451376,0.28001784,0.30482587,0.33553196,0.34527773,0.34964583,0.38546719,0.41890832,0.43186304,0.45682222,0.47028518,0.48102547,0.53359821,0.58462951,0.62552169,0.66785776,0.63060456,0.58988559,0.56908736,0.54068376,0.49147135,0.44571802,0.39088221,0.34072871,0.36882922,0.40168593,0.45178970,0.49838812,0.49531997,0.49495519,0.51123463,0.53021615,0.51364932,0.49226653,0.48494457,0.47376014,0.45907776,0.44743365,0.44078186,0.43565282,0.43079338,0.42177487,0.39699321,0.37559867,0.35215831,0.32232383,0.32213971,0.31446551,0.34463399,0.37401147,0.41087821,0.44029031,0.46327614,0.48545147,0.49356310,0.50692412,0.48613207,0.47133680,0.45931717,0.44649687,0.42325186,0.40620678,0.39263356,0.37929549,0.43091433,0.48625883,0.53179354,0.57919327,0.60261642,0.62578216,0.64554449,0.66489075,0.62536393,0.58694729,0.54765369,0.51067447,0.51490087,0.51872708,0.50582208,0.49943743,0.49815372,0.49201141,0.49705919,0.49661594,0.49405015,0.48413338,0.49149259,0.49574022,0.48862778,0.48125892,0.49516306,0.51252278,0.52315375,0.53806412,0.55804274,0.57210489,0.58701831,0.60370309,0.61401516,0.62476670,0.64511538,0.66300646,0.67376574,0.69046461,0.67529997,0.66793123,0.65218611,0.63160873,0.68387022,0.73796164,0.76425945,0.79165019,0.77538026,0.75973712,0.74158174,0.72084923,0.68444052,0.65705452,0.62185040,0.58801415,0.59603364,0.60285228,0.61315172,0.63063897,0.63124346,0.63512328,0.64503432,0.70381439,0.68652546,0.66449723,0.64673294,0.62735659,0.58065895,0.53004782,0.49675568,0.46134714,0.48296119,0.50240856,0.53626373,0.56670101,0.55831619,0.54314667,0.54330973,0.54350854,0.49404946,0.44574386,0.40236629,0.36007912,0.30355506,0.25411083,0.20285976,0.15665988,0.25289776,0.35734630,0.46018158,0.56630601,0.65221449,0.73219968,0.82202187,0.90362430,0.87506986,0.84129317,0.81130911,0.78660171,0.75294501,0.72450569,0.69479713,0.66388220,0.61578982,0.56228571,0.49660446,0.42968601,0.39957961,0.36163699,0.32489639,0.29048032,0.29113560,0.30139967,0.30727884,0.31484408,0.27445696,0.23782552,0.19115596,0.14186481,0.16891260,0.19349381,0.21194170,0.22445138,0.23804726,0.25150053,0.27167203,0.29108296,0.29795316,0.30909581,0.32455491,0.33220355,0.27722992,0.22630289,0.18481399,0.14142761,0.18651873,0.23102402,0.28616011,0.33795232,0.36245220,0.38508746,0.40404875,0.42358661,0.37594885,0.33216700,0.28100243,0.22609642,0.19599468,0.16260154,0.11070628,0.06051088,0.13281440,0.20667244,0.26639725,0.32762889,0.42861969,0.52388692,0.63088998,0.73804469,0.70303935,0.66217243,0.63394773,0.61032177,0.62411747,0.63481532,0.64448755,0.65198382,0.63634396,0.62083626,0.59615331,0.57294726,0.61159224,0.65861257,0.69833935,0.73384134,0.72094828,0.71032462,0.71067999,0.70702058,0.72334943,0.73197305,0.73411873,0.74351088,0.67597536,0.61579253,0.54981909,0.48997798,0.38563683,0.28328670,0.19621172,0.10564978,0.16301936,0.21743378,0.27069958,0.32192556,0.34556960,0.37486260,0.41108287,0.45213508,0.46437392,0.47829792,0.48929964,0.49767997,0.53368697,0.56556377,0.59331365,0.62649051,0.60634002,0.58582039,0.57541987,0.56089121,0.51098868,0.46401308,0.41560888,0.36461327,0.39591819,0.42997234,0.47676931,0.52280783,0.51489674,0.51063700,0.52551515,0.53588986,0.50589987,0.48115007,0.45188082,0.42683307,0.41573285,0.40652053,0.39051782,0.38266838,0.38076696,0.38086741,0.36941736,0.36164766,0.33592131,0.30473743,0.28088165,0.25880061,0.31133164,0.36187735,0.41174533,0.46650746,0.47788648,0.49696267,0.51331743,0.52484058,0.50596337,0.47888925,0.45353096,0.42456777,0.39897187,0.38119218,0.34868111,0.32447645,0.38974224,0.45251545,0.51511092,0.57702666,0.60537003,0.63070677,0.65710303,0.68820442,0.65504790,0.62110307,0.57992703,0.54242347,0.54428211,0.54545737,0.54155023,0.54147107,0.53418669,0.52698503,0.53014304,0.53190242,0.52990070,0.52644612,0.53008891,0.53047931,0.51838017,0.50858408,0.51588387,0.52830739,0.53536491,0.53924634,0.54548229,0.54725302,0.58563296,0.61963067,0.65414120,0.68729249,0.71251821,0.73646541,0.75139303,0.77566114,0.75748944,0.73303181,0.71905803,0.70206038,0.75530860,0.81262421,0.84838343,0.88994866,0.86568368,0.84091626,0.81546209,0.78835871,0.76768501,0.74705374,0.72727850,0.70637488,0.70003534,0.69545403,0.69773851,0.69866149,0.69529940,0.69148765,0.70130899,0.75759216,0.72825198,0.69909439,0.66023672,0.62902507,0.55662556,0.48789080,0.44490351,0.39184565,0.43229764,0.46713010,0.51559117,0.56496214,0.54951734,0.53698449,0.54340891,0.54570311,0.50326938,0.46502999,0.42080465,0.37293852,0.31692635,0.26746493,0.19422288,0.12451170,0.25067267,0.37970538,0.49559539,0.62032022,0.68510636,0.75099390,0.84936787,0.94886739,0.88720197,0.83124904,0.79654115,0.75636644,0.74036882,0.72856876,0.70194946,0.67858670,0.61943483,0.56660789,0.49505228,0.42824425,0.39084496,0.35320880,0.31241621,0.26752729,0.29359880,0.31488184,0.32163570,0.33825953,0.28348369,0.22843108,0.16054329,0.09521229,0.13355371,0.16358691,0.18717520,0.21304967,0.22977184,0.24501551,0.26358590,0.28238049,0.29562414,0.31408630,0.32914773,0.34464219,0.27904283,0.21071989,0.16305932,0.10625588,0.15795905,0.20506996,0.27104934,0.32965107,0.34564850,0.36790234,0.38256092,0.39748415,0.36131810,0.32123056,0.25867729,0.19584720,0.17467664,0.15656432,0.10429530,0.05451008,0.12966851,0.19974608,0.27307448,0.34054406,0.45193477,0.55301986,0.66846868,0.78536352,0.73673559,0.69161262,0.66496201,0.62734814,0.65017646,0.67799309,0.68935945,0.70310783,0.68727323,0.67770461,0.64341471,0.60917649,0.64758234,0.68361957,0.72576309,0.77417588,0.75136151,0.72149784,0.71651930,0.71344500,0.72374919,0.74135612,0.74991845,0.76265837,0.67588343,0.59280490,0.52932426,0.46971122,0.34793977,0.23162745,0.12344160,0.01082233,0.08836665,0.15618621,0.23204131,0.30459586,0.35007128,0.40145894,0.43910363,0.48320220,0.49229265,0.50103881,0.50951615,0.51858730,0.53141359,0.54158424,0.56311371,0.58965071,0.58512490,0.57751204,0.58135192,0.58892960,0.53656752,0.48273584,0.44099918,0.39417347,0.42647700,0.44973211,0.49581818,0.54587423,0.53541190,0.52496483,0.53483411,0.53797330,0.50020887,0.46443133,0.42255990,0.38458466,0.37563134,0.35870560,0.33955963,0.32257903,0.32940432,0.33684502,0.34397246,0.35245234,0.31861035,0.28439787,0.24528396,0.20735191,0.27681288,0.34631061,0.41514276,0.49001711,0.50045776,0.50761010,0.52842351,0.54949553,0.51818001,0.48921893,0.44603532,0.40340963,0.37726981,0.35376068,0.30975890,0.26255891,0.34562261,0.42789595,0.50072851,0.57761804,0.60767864,0.63995787,0.66989646,0.70547035,0.67580541,0.65434468,0.61152980,0.57025207,0.57075078,0.56853757,0.57594371,0.58515103,0.57639379,0.56597110,0.56434766,0.56138118,0.56250477,0.57013389,0.56687676,0.56073400,0.54695183,0.53509347,0.53717975,0.54093833,0.53896586,0.53901289,0.53216644,0.52542003,0.57906764,0.63109762,0.69297200,0.75461295,0.77951347,0.80961178,0.83285441,0.86244169,0.83316422,0.80077705,0.78592026,0.76854236,0.83095928,0.89177303,0.93593816,0.98648338,0.95157918,0.92517800,0.89199645,0.86366605,0.85029097,0.83942926,0.83068497,0.82197413,0.80506804,0.79179211,0.77904835,0.76983329,0.76090663,0.75550079,0.75729760,0.68668074,0.66664600,0.64433798,0.61895852,0.59684339,0.55755655,0.51659570,0.48108926,0.44783113,0.48376807,0.51143105,0.54021555,0.57028636,0.55087803,0.53120768,0.51894920,0.50445082,0.47446804,0.43928232,0.39746303,0.34981921,0.29796855,0.24980819,0.19773275,0.14295742,0.24940153,0.36020127,0.45896977,0.55881971,0.63146512,0.70106505,0.78844739,0.87938605,0.82315569,0.77576161,0.73481845,0.69977456,0.67927707,0.66222484,0.63367311,0.60243519,0.55559319,0.50284983,0.45988034,0.41195887,0.39310345,0.37035751,0.35204062,0.32983245,0.33086623,0.33071887,0.32570120,0.31650195,0.27112208,0.22066615,0.17313566,0.12427413,0.14652079,0.17941336,0.19568600,0.21994783,0.22683140,0.24319199,0.26201750,0.28185227,0.30254327,0.31364642,0.34048827,0.36045955,0.30530955,0.25305225,0.20416005,0.15833535,0.19974845,0.25132823,0.30203540,0.35279844,0.36607423,0.38320309,0.41098175,0.42822641,0.38849821,0.34267194,0.29334523,0.24515349,0.21962609,0.20105223,0.16238502,0.13142120,0.19632538,0.25578238,0.31799706,0.38106671,0.46098585,0.53726629,0.62919857,0.71829699,0.69144439,0.65341120,0.62773330,0.59935799,0.61134895,0.61333846,0.62650194,0.63419534,0.63737987,0.64476973,0.63581795,0.62588331,0.66032225,0.69255041,0.73844723,0.77764811,0.74794641,0.71596121,0.68903166,0.66337734,0.67593446,0.68935722,0.69552218,0.70474461,0.63451129,0.56248580,0.50162743,0.43595482,0.35266038,0.27282738,0.18423291,0.09002799,0.14220544,0.18791428,0.24397880,0.29716693,0.33630530,0.38443899,0.41598080,0.44673068,0.45530614,0.46677032,0.48061203,0.49802919,0.51591018,0.53761618,0.55998138,0.58373732,0.56977843,0.55234682,0.54050894,0.53043775,0.49782783,0.45975336,0.42491956,0.39485268,0.43267524,0.46921606,0.51080066,0.55774980,0.55515387,0.55380194,0.56236404,0.56722247,0.52704021,0.48101265,0.44100626,0.39436416,0.38018285,0.36274047,0.34214483,0.31918151,0.31896119,0.31725410,0.31372806,0.30745081,0.28569323,0.26079915,0.23554817,0.21030369,0.26656842,0.32018666,0.37131373,0.42519802,0.43945384,0.46080347,0.48336953,0.51471203,0.48251535,0.45504063,0.41734982,0.37728080,0.36794181,0.35630285,0.33194701,0.30999770,0.37439626,0.43342562,0.49195303,0.54930414,0.57536021,0.60738635,0.64832808,0.68174210,0.66358992,0.64797634,0.62517233,0.60206538,0.60602988,0.60333686,0.61322069,0.62593632,0.60721476,0.59102397,0.58091391,0.57730826,0.57872429,0.58101565,0.57822659,0.57343569,0.56510756,0.55043305,0.53909694,0.52721866,0.52813828,0.53616116,0.53014504,0.52242300,0.56868573,0.61398347,0.67357379,0.72903608,0.74739711,0.76460371,0.78547530,0.80320613,0.79466081,0.78048857,0.77007712,0.76869860,0.81317686,0.85875580,0.89707233,0.94014351,0.90137133,0.86524395,0.83328200,0.80910614,0.78003081,0.75158536,0.72923744,0.70079786,0.70193472,0.69763597,0.69893428,0.69456450,0.69317815,0.69686219,0.69587798,0.62053221,0.60632912,0.58539447,0.57931282,0.57325350,0.55571690,0.54344631,0.52581426,0.50689919,0.52996874,0.55833158,0.56830773,0.57972979,0.55289707,0.52257551,0.49161372,0.46484207,0.44235408,0.41908645,0.37146665,0.32060782,0.28154877,0.23699327,0.19856826,0.15610735,0.24607101,0.33828773,0.42065957,0.49704599,0.57325139,0.65183185,0.72958116,0.81325684,0.76316239,0.71087868,0.67890843,0.64581066,0.61976568,0.60027032,0.56385309,0.53243434,0.48533103,0.44077166,0.42215553,0.39880118,0.39188468,0.38963192,0.38665675,0.38804620,0.36872405,0.35542185,0.32609330,0.30040982,0.25735742,0.21934182,0.18304149,0.14659215,0.16660515,0.19229241,0.20764749,0.22604676,0.22992798,0.23092260,0.25855732,0.28717547,0.29726314,0.31359600,0.34871762,0.38080426,0.34021628,0.29926915,0.24980935,0.20223293,0.24849652,0.28828691,0.33369728,0.37461139,0.39323033,0.40356534,0.43592704,0.46551019,0.41309023,0.36736976,0.32890327,0.29519970,0.27093450,0.24090656,0.22310763,0.20222703,0.25379427,0.30888684,0.36174445,0.42167375,0.47120450,0.51616459,0.58553841,0.65819499,0.63528611,0.62062978,0.59655236,0.57528419,0.56521365,0.55398732,0.55797213,0.56619513,0.59136731,0.61712303,0.62318905,0.63643146,0.67145496,0.70184953,0.73948408,0.78419185,0.74224165,0.70971497,0.66493120,0.61683543,0.62961822,0.63276079,0.64509132,0.65272848,0.58827392,0.52790337,0.46710649,0.39880195,0.35345878,0.30878760,0.23599800,0.17177647,0.19344713,0.21317591,0.25010596,0.29070248,0.32374538,0.36540715,0.38887713,0.41639188,0.42269062,0.43170662,0.45005813,0.47342162,0.50157072,0.53582500,0.56059181,0.58311620,0.55590965,0.51996541,0.49886968,0.47713083,0.45829967,0.43602784,0.41689334,0.39467110,0.43781099,0.48027576,0.52952863,0.57831745,0.57856290,0.58729139,0.59184372,0.59444999,0.54634956,0.50170159,0.45389415,0.40179856,0.38814938,0.37067089,0.34372253,0.32310500,0.30575796,0.29440551,0.27872180,0.26935449,0.25250051,0.24443031,0.22751857,0.20887132,0.24992231,0.29783337,0.32929853,0.35833056,0.38810882,0.41293333,0.44327165,0.47707557,0.44660639,0.42122939,0.38893931,0.35486480,0.35800690,0.35612717,0.35454945,0.35819328,0.39795042,0.44560522,0.48353939,0.51810537,0.54761581,0.57630793,0.61827281,0.65849820,0.64897596,0.63610041,0.63305546,0.63045739,0.63585764,0.63889668,0.65036403,0.66777552,0.63583193,0.60724517,0.59872743,0.58677337,0.59072744,0.59646130,0.58910412,0.58292970,0.57726823,0.56671998,0.54010451,0.50797401,0.51846382,0.53310863,0.52529252,0.51382661,0.55186011,0.59157234,0.65165372,0.70934183,0.71266886,0.71699521,0.73366697,0.75261207,0.75039794,0.74976273,0.76066761,0.76339398,0.79518923,0.82582643,0.86142195,0.89893086,0.85490927,0.80773989,0.78214658,0.75292940,0.71041336,0.67043999,0.62445175,0.58095095,0.59606965,0.60768721,0.61028020,0.61530132,0.63059227,0.64364375,0.63157772,0.54821071,0.54883317,0.54636797,0.54709940,0.54596559,0.55562152,0.56896059,0.57244789,0.57307612,0.58125841,0.58271603,0.59109227,0.59519056,0.54989227,0.50750372,0.46676957,0.42891316,0.40722211,0.37783385,0.34806105,0.31472016,0.27816041,0.24366668,0.20798493,0.17124508,0.24273258,0.31740839,0.39005917,0.45916801,0.52598436,0.59934049,0.67450094,0.74524931,0.70679121,0.66476564,0.62932208,0.60166402,0.56692560,0.53228068,0.49153777,0.45075401,0.41756431,0.39184582,0.37400510,0.35188991,0.37440711,0.39771671,0.41742106,0.43854211,0.40342120,0.36470234,0.32285406,0.28460584,0.25803897,0.23305354,0.19523834,0.16776726,0.17402175,0.18715644,0.19859136,0.20881433,0.22001458,0.23522570,0.25089078,0.26673053,0.29638911,0.32621492,0.36154651,0.40086887,0.36583161,0.33165070,0.29215013,0.24818810,0.29324648,0.33887701,0.36984829,0.40620318,0.42528076,0.44057699,0.46486660,0.48966370,0.44499751,0.39472218,0.36236920,0.32742060,0.31393623,0.30475734,0.28940849,0.27321470,0.31142603,0.35290408,0.39089402,0.43463768,0.47005359,0.50661210,0.54614984,0.58903360,0.57472936,0.55840451,0.53996688,0.52291833,0.51278128,0.49877456,0.50565520,0.50449020,0.54597447,0.58528574,0.62386497,0.65666877,0.68275412,0.70976180,0.74256441,0.77598950,0.73575752,0.69049507,0.63088986,0.57907665,0.58538880,0.59626707,0.60323689,0.61328045,0.54957932,0.49266332,0.43648019,0.38383681,0.35282270,0.31674934,0.27518458,0.23368135,0.23473857,0.24233448,0.25459995,0.26793721,0.30036571,0.32210456,0.35036490,0.38239205,0.39139801,0.40758824,0.41707510,0.43217117,0.47021023,0.50195588,0.54780239,0.59049719,0.54849126,0.50250840,0.46911583,0.43884806,0.42960616,0.41683498,0.40729202,0.39127370,0.43653675,0.48618058,0.54325371,0.59231806,0.60216496,0.61317128,0.61462253,0.62051325,0.56880764,0.51970201,0.45639773,0.39707631,0.37630651,0.35474221,0.33141153,0.30511436,0.28585327,0.26507388,0.23576821,0.21078990,0.20373147,0.20009306,0.19903923,0.19191705,0.22769272,0.25964147,0.28322498,0.30307036,0.34152452,0.37336013,0.39941342,0.42707615,0.40573487,0.37570019,0.35040639,0.31969710,0.33854649,0.36317946,0.37599357,0.39611540,0.42335747,0.44953971,0.47273082,0.49473607,0.52811033,0.56830618,0.61479215,0.65553155,0.66285731,0.66357744,0.66265909,0.66414884,0.67263973,0.68077638,0.68910311,0.70145166,0.67245636,0.64626054,0.61964299,0.60008482,0.60403085,0.60571860,0.61140321,0.61467654,0.58981701,0.57205300,0.54039239,0.50341673,0.51019594,0.52233366,0.51499130,0.51305442,0.54550020,0.57642262,0.63356215,0.68822778,0.68297710,0.68576357,0.68799175,0.69276555,0.70521614,0.71741043,0.73736285,0.76103296,0.78758360,0.80815171,0.83198056,0.85154797,0.81354427,0.77013564,0.72657625,0.68396039,0.64003699,0.58905964,0.53682680,0.47547530,0.49990592,0.52028798,0.54034990,0.56374487,0.56523929,0.56922775,0.55555682,0.47835873,0.48878145,0.49847332,0.51135155,0.52246610,0.55509128,0.59253083,0.61719471,0.64259137,0.62983644,0.61351357,0.61342972,0.61128715,0.55403019,0.49836020,0.44419298,0.38872606,0.36747156,0.33868202,0.32104699,0.30183188,0.27052479,0.24164576,0.21510856,0.18757655,0.24546816,0.29721779,0.35460751,0.41395917,0.47987910,0.54416720,0.61649352,0.68493240,0.64927831,0.61328828,0.58442098,0.55576496,0.51381440,0.47448761,0.42239144,0.36855823,0.34978205,0.33518523,0.32485711,0.31060055,0.35980572,0.40534914,0.44998239,0.49768945,0.43311255,0.37451369,0.32249940,0.26631007,0.25322675,0.24350330,0.21321999,0.18254890,0.18222940,0.18261559,0.18681363,0.18969602,0.21458324,0.23919829,0.24231342,0.24717602,0.29582769,0.34047485,0.38284768,0.42615971,0.39305562,0.36040032,0.33135378,0.29345000,0.34278274,0.39034212,0.41609386,0.43964635,0.45317766,0.47508585,0.49443520,0.51846446,0.46968580,0.42042357,0.39108824,0.36143233,0.36447627,0.36272917,0.35455566,0.34450444,0.36919589,0.39429826,0.42483657,0.44794823,0.47038690,0.49531071,0.50482779,0.51277850,0.50664023,0.50267234,0.48928879,0.47014986,0.46270478,0.44627225,0.44521739,0.44244885,0.50092323,0.55615290,0.61787678,0.68205841,0.70351688,0.72436853,0.74939994,0.77158748,0.71882575,0.67442233,0.60317931,0.53291173,0.54283469,0.55495517,0.56097907,0.57097462,0.51158963,0.45035492,0.41281164,0.36851318,0.34704144,0.32297701,0.31100870,0.29250146,0.28486041,0.26876021,0.26229441,0.25009514,0.26631808,0.28285471,0.31247798,0.34652056,0.36349495,0.38084860,0.38956227,0.39494433,0.43532886,0.47100188,0.53267403,0.59599445,0.53908719,0.48334072,0.44241961,0.40116435,0.39980593,0.40124998,0.39620256,0.38891234,0.43914886,0.49319585,0.55056280,0.61602407,0.62738422,0.64314247,0.64306159,0.64062039,0.58780601,0.53572304,0.46608311,0.39499429,0.37220415,0.34604054,0.32217482,0.29777528,0.26670985,0.23648428,0.19495428,0.15177698,0.15644482,0.15956433,0.17355166,0.17621878,0.20105967,0.21954121,0.23496612,0.24364796,0.29308128,0.33882802,0.36076460,0.38397273,0.36002689,0.33027439,0.31300671,0.28518634,0.32658623,0.36986916,0.40136608,0.43892545,0.44454426,0.45637151,0.46172544,0.46857283,0.51474924,0.55453340,0.60293885,0.65655535,0.66787257,0.68944610,0.69190981,0.70138912,0.70989837,0.72362441,0.72957084,0.73840543,0.70666506,0.68360495,0.64859229,0.61136596,0.61621304,0.61676642,0.63256760,0.64213304,0.60735082,0.57590290,0.53625565,0.49805808,0.50182619,0.50992489,0.51260635,0.51074575,0.53547740,0.56090877,0.61217151,0.66612704,0.65819983,0.65155397,0.64070158,0.62881945,0.65985646,0.68614338,0.72371678,0.75548573,0.77227415,0.79216274,0.79984398,0.81056402,0.76815397,0.73170867,0.67663569,0.62190841,0.56309594,0.50870948,0.43952867,0.36936988,0.40473206,0.43139829,0.46869515,0.50433878,0.50032319,0.49149733,0.48520073,0.43220278,0.45453570,0.48002108,0.51020146,0.53988367,0.57476959,0.60762344,0.64042791,0.67676179,0.65062795,0.62830454,0.60630256,0.58052335,0.53330091,0.49357651,0.43810509,0.38403458,0.35915416,0.33711237,0.31466976,0.30016942,0.26639700,0.22725109,0.20556740,0.17614114,0.23525524,0.28854475,0.34736522,0.41091993,0.45778632,0.51010455,0.56732339,0.62043488,0.58057357,0.54305305,0.50307442,0.46540172,0.42552828,0.38534848,0.33710327,0.28890001,0.29703802,0.30361556,0.30586426,0.31177520,0.36259922,0.40211071,0.44825893,0.48833202,0.44343956,0.39924505,0.34953999,0.30749759,0.27802222,0.24815263,0.20671586,0.16985610,0.18348192,0.20031826,0.20638507,0.22040088,0.23778629,0.24866990,0.25860572,0.26689691,0.31013286,0.34502612,0.38073917,0.41060199,0.40245771,0.39432392,0.38675947,0.37599472,0.39880834,0.41965508,0.43074166,0.44518159,0.45752758,0.47193550,0.48991885,0.50552259,0.47954541,0.46044148,0.44446212,0.42971800,0.42925748,0.42950849,0.43051900,0.42899995,0.43507218,0.44332698,0.45994713,0.47927325,0.48728727,0.49589978,0.50453716,0.50973634,0.49497516,0.47391973,0.45248714,0.43438089,0.40756474,0.37827482,0.35960855,0.34733120,0.41123559,0.46837547,0.54150049,0.60929484,0.65634233,0.69668547,0.74383113,0.79290394,0.73657225,0.68029060,0.61926561,0.55328887,0.53674675,0.51400713,0.49596300,0.47599664,0.45158967,0.42896678,0.40516930,0.38547314,0.37723085,0.36900652,0.36804376,0.36969406,0.34796514,0.32147386,0.30056482,0.28305271,0.27708344,0.27319656,0.26291948,0.26123966,0.28211188,0.30887471,0.32500429,0.33938139,0.39104104,0.43374756,0.48802127,0.54470144,0.50010198,0.45780122,0.42198666,0.38643853,0.38107222,0.37624669,0.36711148,0.35659733,0.41841498,0.48355029,0.55173402,0.61538279,0.64192894,0.66633795,0.69275421,0.72548579,0.64872818,0.57544811,0.50501657,0.43104375,0.38359901,0.33163142,0.28311651,0.23865384,0.21945663,0.19746115,0.17160464,0.14423497,0.15269825,0.16228282,0.16983300,0.18155281,0.19468480,0.21148410,0.23555504,0.25506808,0.28269469,0.30700186,0.31542335,0.32288589,0.32211138,0.31754512,0.31335837,0.30084528,0.33349068,0.35759398,0.38446189,0.40208680,0.42419697,0.44362718,0.44344472,0.45312674,0.49415115,0.54423852,0.59131565,0.64470440,0.65459216,0.66733851,0.67432390,0.68301098,0.69387968,0.71141524,0.72949306,0.74486102,0.72921601,0.70632565,0.68605822,0.66526834,0.66680304,0.65981138,0.67435659,0.68495495,0.64739641,0.61507263,0.57476632,0.53726043,0.52497063,0.50901981,0.49672959,0.48667763,0.52245751,0.55847469,0.60135227,0.64517488,0.64694335,0.65433167,0.64490525,0.63906074,0.66876616,0.69707085,0.71765915,0.74170879,0.76289602,0.78792854,0.80366240,0.82313562,0.77175385,0.72540630,0.66890157,0.61001768,0.53574964,0.46260386,0.38773404,0.30738917,0.34144634,0.37120996,0.41337541,0.44702224,0.44793100,0.44767986,0.44346046,0.38847646,0.42545025,0.45615721,0.50527848,0.56040492,0.59264855,0.62346368,0.66524080,0.71089706,0.67919414,0.64501161,0.59750348,0.54538991,0.51612272,0.48624482,0.43523982,0.37723381,0.35334839,0.32951475,0.31091849,0.29497199,0.25590462,0.21280121,0.19266650,0.16744975,0.22383753,0.28636038,0.34369905,0.40687582,0.43882205,0.47338724,0.51895356,0.55966952,0.51377840,0.46511628,0.42209219,0.37736062,0.33555180,0.29403032,0.24663727,0.20511827,0.23698320,0.26967986,0.29220623,0.31811197,0.35760233,0.40417332,0.44713315,0.48485285,0.45403670,0.42000551,0.38580780,0.34882181,0.29997770,0.25176590,0.20409108,0.15196926,0.18736325,0.21657345,0.22876601,0.24588340,0.25605669,0.26451960,0.27761280,0.28989468,0.32051741,0.35602928,0.37729106,0.39238322,0.40961611,0.42679975,0.44225670,0.45961659,0.45440320,0.44925047,0.44468996,0.44820708,0.45961122,0.47757334,0.48464358,0.49121005,0.49193184,0.49642834,0.49725392,0.50127756,0.49990117,0.49863847,0.50372175,0.51027559,0.50200467,0.48882615,0.49759928,0.50469617,0.50088936,0.50270465,0.50540157,0.50828614,0.47402287,0.44268065,0.41888606,0.40134973,0.35156970,0.30325631,0.28188683,0.25301973,0.31666752,0.38139156,0.46135883,0.54386499,0.60505420,0.66810450,0.74547404,0.81918960,0.75313571,0.68707993,0.63399441,0.57758405,0.52063809,0.47272271,0.42860379,0.38484950,0.39518389,0.40245382,0.39985589,0.39934316,0.40053448,0.40789639,0.43011952,0.44635165,0.40834644,0.36918923,0.34355044,0.31502863,0.28216494,0.25939011,0.21321748,0.17214663,0.20609166,0.23622009,0.26355229,0.28674585,0.34048671,0.39754148,0.44727821,0.49405371,0.45947848,0.42184165,0.39659760,0.36410129,0.35807518,0.35698616,0.34416128,0.32681748,0.40006070,0.47189109,0.54638687,0.61878460,0.65820681,0.68992392,0.75049444,0.80655203,0.71294765,0.61748509,0.53923343,0.46772691,0.39353281,0.31965081,0.24444858,0.17824317,0.16853898,0.16038892,0.14618286,0.12685372,0.14793083,0.16433140,0.17145974,0.18020571,0.18870942,0.19835183,0.23203135,0.26886821,0.26696253,0.27277440,0.26701967,0.26018387,0.28437311,0.30847148,0.31215425,0.31788188,0.33714179,0.35253939,0.36544203,0.37323570,0.40330600,0.42946897,0.42970015,0.43419289,0.47923586,0.52502266,0.58452451,0.63833028,0.64359977,0.64678419,0.65673192,0.66632171,0.67980027,0.69965345,0.72951806,0.75905111,0.74308219,0.73589059,0.72496908,0.72265860,0.71535089,0.70426758,0.71673297,0.72478152,0.68916703,0.65762153,0.61119275,0.56948251,0.54204482,0.51131369,0.48479347,0.46242382,0.50457139,0.54835350,0.58508021,0.61957941,0.63784420,0.65696498,0.65633391,0.64914265,0.67623647,0.69972731,0.71467961,0.72229634,0.75665549,0.78522034,0.81227939,0.83973512,0.77764716,0.71864822,0.66079819,0.60094983,0.50533695,0.41590441,0.33389393,0.25119900,0.27895389,0.31243311,0.35092900,0.39206075,0.40019167,0.40286361,0.39817269,0.34042391,0.39070395,0.44576342,0.50035983,0.55776504,0.60649342,0.65620315,0.71472676,0.76475682,0.70929758,0.65407927,0.58913753,0.52661116,0.49701268,0.47224335,0.42661869,0.38212571,0.35365590,0.32709774,0.30002237,0.27399544,0.24429121,0.21459973,0.17606393,0.13708269,0.20224756,0.26235080,0.32566963,0.39487852,0.42046216,0.44452357,0.47389660,0.50528344,0.45820241,0.41011712,0.35071657,0.29816985,0.25489011,0.21014841,0.15634473,0.10425514,0.15786776,0.21133190,0.25263223,0.30142653,0.35019081,0.40153304,0.44742217,0.49198961,0.46188987,0.42983114,0.41157880,0.38643315,0.32412533,0.26834337,0.20531235,0.14267243,0.17716924,0.21637844,0.24309617,0.27030333,0.27326658,0.28018643,0.28774455,0.29939693,0.32280626,0.35326674,0.37338121,0.39442119,0.42924760,0.46633747,0.49538171,0.52693495,0.49955835,0.47903173,0.45709599,0.43517476,0.44835956,0.45469991,0.46309578,0.46951508,0.48929398,0.50411093,0.53169846,0.55968396,0.56602027,0.56775836,0.58393576,0.59699683,0.57470938,0.54850442,0.53368990,0.52060591,0.51423686,0.50639451,0.49761673,0.48646065,0.45288063,0.42103588,0.38490398,0.34967535,0.29356852,0.23889692,0.19588046,0.15268144,0.23249242,0.31518535,0.39506399,0.47429437,0.56728055,0.66849834,0.76403567,0.85945908,0.78033094,0.70033908,0.63814854,0.57167215,0.50260073,0.43183895,0.36213361,0.29575128,0.32620000,0.35453917,0.37166668,0.38928297,0.41756678,0.44946305,0.48473878,0.51444971,0.46958716,0.42162632,0.37216187,0.32440800,0.27462834,0.21526582,0.15641557,0.10123650,0.13584535,0.17533637,0.20085031,0.23748009,0.29563232,0.34888475,0.40523607,0.45870702,0.43261185,0.40408974,0.37591828,0.34628585,0.34173989,0.33072292,0.31156784,0.29116620,0.37840883,0.45849225,0.54934819,0.63423224,0.68602467,0.74352298,0.80705060,0.87240490,0.76751274,0.66567419,0.57008024,0.47841372,0.38806750,0.29184818,0.19551713,0.10025059,0.10534451,0.11498810,0.11482889,0.10972407,0.12946043,0.14983960,0.15378180,0.16152084,0.18504016,0.21361319,0.24666746,0.27781718,0.26296285,0.24729431,0.22922429,0.20558490,0.24653500,0.28664555,0.31613130,0.34690656,0.35055976,0.35726893,0.35382963,0.35741423,0.38555330,0.40633989,0.41130733,0.42007620,0.46995903,0.51730809,0.57430190,0.62881725,0.62825274,0.62803232,0.63054054,0.63579687,0.65984306,0.69200312,0.72863773,0.76871738,0.76303809,0.76033243,0.76541328,0.76485593,0.76531139,0.75791583,0.76634760,0.77230533,0.73053234,0.68407865,0.64473060,0.60261028,0.56385523,0.52146701,0.47516853,0.43495893,0.47912836,0.52177591,0.56429240,0.61014627,0.63209202,0.64247524,0.65470039,0.66814354,0.68643009,0.70017016,0.70493517,0.71020055,0.74588354,0.77934968,0.81806345,0.85518727,0.78138561,0.70864750,0.64305273,0.58264455,0.46966317,0.35756991,0.26193940,0.15759991,0.20828896,0.25690419,0.30632902,0.35617082,0.35624493,0.35699916,0.35033144,0.29136905,0.36390045,0.43650502,0.49502178,0.56096768,0.62702300,0.69617332,0.75478337,0.81772753,0.74444573,0.66875932,0.58358741,0.49793195,0.47934728,0.45808156,0.41888819,0.37931791,0.35392952,0.32835269,0.29127796,0.25885336,0.23323059,0.21194188,0.15764576,0.10492415,0.17723229,0.24070918,0.31101724,0.38606599,0.39937957,0.42023678,0.43793528,0.45242752,0.40164515,0.35202606,0.28001926,0.20959506,0.17363594,0.13282874,0.07057117,0.00430036,0.08007917,0.14890855,0.21611894,0.28773759,0.34519809,0.39872154,0.44676389,0.49700948,0.46826585,0.44371720,0.43691164,0.42985457,0.35524234,0.28184055,0.20547060,0.12960923,0.17304821,0.21478956,0.25255049,0.29362905,0.29125333,0.28987484,0.29906870,0.30463238,0.32962207,0.34563531,0.37315673,0.39671635,0.45343212,0.50591429,0.55016850,0.59714918,0.54936491,0.50520404,0.46563551,0.42393206,0.42904475,0.43117614,0.44312627,0.45353629,0.48377330,0.51317440,0.57041698,0.62055679,0.62488715,0.63233157,0.66061785,0.68588927,0.64290453,0.59870205,0.56637250,0.53181390,0.52166689,0.51337670,0.48820443,0.46878027,0.43182861,0.40251486,0.34769344,0.29395370,0.23751134,0.17618783,0.11999473,0.05405386,0.15494869,0.24783849,0.32310933,0.39660433,0.53248507,0.66399055,0.77711135,0.89703195,0.80466135,0.71433240,0.64745107,0.57386399,0.48541275,0.39260453,0.30203516,0.20635719,0.25864896,0.30772218,0.34486442,0.37971261,0.43352767,0.48983174,0.53617634,0.58614248,0.53042470,0.47964968,0.40885125,0.33854841,0.26047896,0.17581379,0.10208703,0.01842951,0.06346340,0.10641789,0.14621167,0.17789090,0.24303243,0.30412975,0.36642100,0.42230342,0.40514076,0.39087806,0.36159321,0.33014488,0.31920989,0.30404048,0.28269071,0.25673569,0.35379796,0.44741679,0.54599324,0.65021536,0.72203391,0.79379500,0.86685826,0.94470689,0.82242606,0.70792880,0.59898934,0.48943934,0.37787894,0.27234567,0.14980919,0.02199047,0.04745330,0.07423671,0.08155453,0.09004494,0.11864647,0.14343014,0.14034748,0.13852616,0.18210574,0.22435135,0.24973153,0.28575171,0.25149895,0.21924257,0.18571961,0.15192163,0.20618216,0.26095058,0.31472440,0.37267772,0.36297025,0.35835530,0.34721950,0.33791177,0.36535089,0.39170483,0.39855522,0.40006509,0.45389465,0.50182059,0.56415741,0.62265529,0.61347429,0.60349760,0.60282567,0.60099023,0.64096701,0.68056336,0.73294244,0.78575963,0.78742725,0.78430423,0.80076259,0.81397322,0.81524926,0.81420088,0.81465667,0.81950395,0.76784784,0.71761454,0.67965796,0.64088635,0.58142912,0.53097269,0.46681231,0.40871415,0.44725980,0.48819101,0.54874707,0.60751759,0.62277730,0.63621094,0.66180136,0.68875500,0.69369104,0.69519265,0.69881806,0.69907156,0.73499226,0.77350120,0.81878551,0.86782823,0.78487982,0.70049482,0.63470703,0.56799562,0.43257155,0.29971251,0.18569473,0.06840317,0.14049834,0.20707046,0.26241681,0.31948846,0.31702779,0.31233423,0.29960666,0.32159169,0.38209962,0.43925597,0.49289672,0.54664774,0.61542176,0.68006221,0.74051632,0.79607232,0.72945205,0.66302641,0.59189834,0.51739125,0.48479276,0.45281152,0.40882259,0.36722099,0.34207023,0.31879309,0.29509622,0.26979066,0.26175715,0.24842564,0.22417421,0.20041796,0.23674635,0.27783535,0.33022728,0.37876140,0.38689951,0.39664413,0.41221302,0.42630031,0.38384210,0.34080597,0.28607653,0.22795681,0.19623920,0.15619615,0.11686429,0.07738309,0.13591642,0.19293085,0.25692682,0.32088656,0.37816050,0.43493126,0.48763691,0.54246927,0.51284859,0.48774010,0.47182836,0.45340624,0.39411368,0.32976529,0.27453555,0.22016478,0.23972743,0.26824829,0.29518380,0.32664191,0.33402763,0.34122637,0.35097342,0.35602231,0.37007839,0.37955889,0.39517403,0.40410823,0.45270684,0.49902833,0.55189252,0.59646017,0.55325959,0.51115147,0.46774348,0.42119423,0.42603024,0.42751263,0.44431980,0.45392282,0.48058158,0.50970722,0.54281143,0.57219212,0.58634461,0.60006305,0.61483297,0.63065289,0.59766548,0.56301003,0.53475938,0.49975843,0.49037076,0.47911109,0.45747463,0.43578232,0.40897906,0.38192058,0.34053145,0.29254134,0.26699777,0.23444511,0.20197334,0.16340646,0.22987542,0.29727769,0.36211595,0.42506116,0.52336928,0.62097796,0.71958783,0.81456480,0.73304491,0.65605581,0.59290297,0.52439660,0.45480540,0.39208474,0.31946103,0.24608585,0.27888714,0.31486571,0.33909980,0.37173184,0.41279892,0.44951892,0.48888228,0.52185547,0.47628505,0.42778476,0.37460162,0.32315661,0.25395017,0.19243686,0.11961527,0.05444679,0.09779894,0.13828925,0.18486729,0.23098551,0.28043567,0.32542420,0.38380925,0.43800533,0.41727230,0.40186086,0.38175192,0.35563684,0.34121969,0.31973352,0.29914681,0.28558991,0.36897887,0.45309644,0.53797784,0.62680733,0.69862951,0.76728642,0.82651825,0.89314765,0.79795394,0.70692044,0.61355952,0.52297187,0.42435443,0.32428089,0.21081386,0.10522174,0.13445034,0.17063548,0.18061341,0.19293745,0.20976038,0.22787166,0.22006193,0.21163619,0.24304852,0.27369274,0.30293484,0.33536286,0.30855427,0.27406201,0.24911303,0.22319222,0.25986026,0.29895234,0.33761371,0.37736384,0.36156529,0.35017666,0.34325194,0.33905023,0.36163885,0.38915612,0.41295021,0.43942189,0.47593781,0.51551269,0.56028643,0.60828519,0.60926965,0.60512813,0.62073897,0.63105292,0.65033861,0.67214154,0.70130389,0.73350453,0.73702672,0.73596624,0.74214719,0.75372008,0.75091684,0.74738696,0.75695685,0.75857565,0.71186060,0.66507559,0.62502369,0.57983854,0.53674703,0.49827637,0.44794431,0.40402031,0.43344649,0.46662753,0.50516492,0.54845581,0.55960369,0.57809184,0.59767378,0.61308133,0.63174710,0.64322467,0.66010916,0.67660457,0.70596993,0.73670730,0.77791109,0.81607016,0.74688244,0.67442774,0.61503190,0.55189886,0.45721924,0.35466409,0.26529792,0.17814605,0.22278750,0.26652955,0.30317943,0.33914311,0.33549542,0.33343197,0.33102953,0.35429486,0.39877568,0.44616310,0.49370555,0.53660133,0.60235961,0.66268945,0.72299464,0.78147121,0.72408272,0.66004066,0.59414105,0.52986106,0.49135640,0.44939203,0.40179031,0.35027238,0.32975279,0.31363910,0.29388771,0.27682796,0.28265158,0.29045575,0.28561991,0.28705855,0.29877779,0.31255411,0.34442021,0.36709348,0.36953716,0.37357119,0.38305047,0.39628983,0.36164972,0.32825763,0.28645024,0.24809929,0.21697986,0.18397711,0.16995221,0.15254026,0.19483350,0.23806387,0.29712301,0.35041428,0.40930956,0.46795252,0.52392390,0.58375627,0.55828555,0.52801771,0.49948447,0.47279836,0.43130881,0.37941238,0.34069650,0.30296631,0.30891496,0.31799585,0.34385914,0.36201530,0.37809821,0.39240364,0.40292198,0.41284818,0.41192942,0.40885269,0.41145645,0.41318373,0.45459064,0.49644149,0.54788074,0.59667190,0.55886888,0.51350491,0.47043499,0.42074527,0.42565671,0.42462165,0.44036177,0.45547961,0.47688550,0.50162896,0.51797732,0.52974616,0.54652154,0.56754641,0.56796706,0.57143485,0.55240453,0.53137607,0.49759564,0.46587446,0.45423552,0.44143214,0.42072374,0.40259396,0.38160111,0.36363808,0.32679296,0.29246055,0.29211079,0.29671850,0.27895516,0.26834314,0.31042215,0.34901863,0.39837966,0.44405242,0.51275428,0.57590467,0.65364560,0.73299668,0.66485059,0.59954666,0.54252035,0.48065431,0.43191899,0.38781034,0.33501644,0.28910508,0.30389085,0.31552174,0.33875041,0.35490403,0.38674293,0.41355357,0.43414944,0.45826371,0.41463358,0.37222814,0.34162507,0.30269653,0.25737557,0.20765966,0.14496497,0.08069657,0.12886080,0.17196251,0.22725125,0.27748525,0.31107349,0.34352284,0.40080080,0.45458127,0.43184350,0.41524719,0.39684586,0.38267864,0.35710866,0.33938727,0.32263047,0.31115891,0.38316807,0.46345692,0.52851561,0.60418865,0.66975764,0.74261277,0.78936805,0.83872463,0.77440267,0.70560645,0.62636138,0.55299335,0.46188041,0.37575272,0.28113706,0.17808591,0.22310531,0.26320313,0.28184854,0.29682644,0.30522238,0.31053383,0.29644511,0.28171270,0.30162849,0.32155975,0.35962231,0.39375211,0.36491617,0.33106834,0.31110912,0.29530042,0.31761143,0.34032854,0.36203855,0.37986593,0.36443820,0.34629117,0.34328539,0.33399953,0.36157119,0.38539264,0.43128293,0.47238631,0.49759791,0.52228022,0.55533458,0.59225578,0.59842898,0.60773145,0.63582533,0.66725849,0.66168232,0.66117788,0.67122610,0.68170872,0.68735710,0.69227579,0.69098674,0.69066166,0.68681138,0.68486177,0.69096567,0.70445282,0.65544352,0.61559978,0.56536766,0.52169593,0.48909859,0.46362311,0.42999398,0.39723065,0.42224176,0.44452113,0.46623549,0.48805793,0.50505776,0.52007964,0.53072506,0.54295612,0.57084478,0.59336977,0.62670208,0.66194287,0.67611584,0.69621024,0.73151078,0.76901711,0.70775574,0.64756345,0.59374301,0.53781336,0.47520514,0.40567606,0.34634346,0.27578428,0.30294018,0.32494701,0.33939764,0.36250326,0.36026251,0.35655355,0.35233371,0.39040889,0.41762844,0.44905104,0.48688340,0.52282982,0.58999406,0.65566320,0.71218419,0.77735603,0.71987917,0.66665983,0.60667641,0.54861511,0.49779384,0.44370546,0.38414381,0.32627015,0.32052349,0.30816125,0.29932817,0.29126975,0.31581205,0.33560654,0.35769791,0.37613449,0.37428043,0.37003361,0.37497813,0.37580210,0.36958560,0.36470238,0.36117186,0.36266114,0.33714580,0.31727949,0.28820250,0.26791935,0.24829341,0.22993383,0.22291344,0.21965727,0.25448023,0.29257686,0.34277012,0.38750471,0.45091595,0.50977854,0.56699290,0.62890261,0.59617851,0.56350184,0.54094670,0.51085201,0.47581308,0.44369242,0.41126069,0.38559805,0.38618259,0.38776163,0.39414491,0.40171641,0.41594849,0.42579741,0.43803028,0.45105323,0.43614186,0.42324832,0.41789299,0.40840895,0.46595219,0.51528590,0.56828563,0.61917950,0.56994230,0.51915456,0.46345522,0.41005117,0.41621674,0.42209214,0.43402373,0.44382067,0.45520646,0.46593276,0.48800515,0.50573642,0.51352468,0.51579370,0.52292248,0.52928805,0.50564681,0.48304555,0.46439777,0.44259450,0.42288691,0.41251529,0.39537080,0.37672130,0.36185482,0.35270408,0.32821498,0.30532843,0.32373333,0.34133472,0.35118386,0.36055337,0.39105268,0.42028613,0.44925188,0.48624340,0.52548286,0.56514024,0.61482665,0.66379099,0.59925705,0.53378400,0.47746709,0.42835065,0.40189819,0.37976474,0.35127385,0.32121012,0.32613251,0.32685882,0.34426293,0.35422868,0.36306727,0.37693143,0.38213719,0.39439011,0.36919254,0.34595886,0.32044737,0.28872992,0.25076561,0.20887931,0.15246835,0.09891316,0.15887628,0.20710032,0.26359369,0.32010003,0.34907703,0.37867810,0.41680707,0.45862804,0.44361028,0.42675758,0.41031663,0.39173040,0.37412566,0.35210984,0.33311599,0.32215086,0.38221458,0.44452221,0.51272603,0.58353288,0.64457851,0.70236341,0.75597236,0.80769779,0.75272727,0.69351004,0.64270470,0.58481161,0.50912271,0.42404808,0.34363804,0.25841303,0.30149244,0.34422189,0.38199079,0.41751962,0.40466616,0.39962429,0.38046015,0.36045258,0.37883189,0.39431909,0.42137117,0.45171425,0.42191582,0.39755750,0.36888616,0.34453915,0.35886563,0.37445456,0.39065392,0.40063156,0.38530409,0.36924455,0.34252135,0.32381028,0.36469832,0.40644317,0.45342765,0.50228591,0.51516919,0.53226864,0.55244684,0.57521265,0.60244673,0.62252322,0.65341335,0.67853903,0.66626659,0.65183099,0.64818695,0.63798830,0.63980241,0.64272044,0.63006658,0.62597335,0.62264821,0.62218507,0.63496419,0.64187730,0.59397497,0.54044422,0.49677390,0.44825946,0.43661724,0.42854866,0.40707273,0.38823133,0.39933760,0.40613030,0.41914359,0.42791084,0.44153369,0.45700964,0.46856515,0.47922680,0.51324906,0.54177705,0.58376150,0.62005048,0.64222839,0.66606040,0.70216081,0.72711863,0.68665967,0.64708268,0.59268861,0.54169907,0.51102921,0.47499932,0.43705738,0.39565610,0.38786982,0.38588848,0.38103421,0.37144494,0.37710598,0.37963978,0.38817015,0.42613113,0.43729867,0.45176083,0.48330550,0.51119701,0.57500507,0.64349586,0.70835615,0.77320861,0.72204176,0.67806497,0.62118883,0.56250789,0.49784252,0.43738088,0.36821786,0.29910556,0.30305851,0.30577694,0.30844407,0.30368015,0.34825963,0.38403071,0.42828690,0.46943330,0.44810078,0.43042166,0.40431713,0.37854051,0.36947621,0.36214350,0.34019372,0.32602439,0.31107453,0.30158032,0.29424731,0.28291562,0.27883168,0.26809440,0.27360765,0.28205805,0.30920438,0.33993197,0.38514331,0.42659195,0.48826417,0.55147544,0.61567806,0.67369470,0.63586438,0.60025089,0.57464478,0.55144660,0.52589687,0.50358902,0.48615496,0.46290012,0.45404623,0.45087427,0.44646460,0.44253753,0.45228116,0.46054509,0.47980949,0.50096495,0.47049672,0.43636373,0.42243668,0.40543146,0.47286136,0.53326637,0.58571913,0.64246819,0.58298596,0.52430603,0.45917301,0.39530130,0.40802077,0.41558147,0.42549835,0.43978026,0.43944813,0.43635537,0.45972090,0.48954931,0.47863535,0.47074207,0.47928462,0.49036203,0.46530583,0.43642042,0.42207011,0.41439805,0.39453949,0.37901870,0.36441200,0.35007161,0.34860031,0.34421961,0.32942661,0.31310051,0.34852006,0.38368098,0.41732563,0.45780391,0.46855306,0.48901165,0.50623976,0.52484615,0.54077464,0.55528654,0.56978698,0.59382543,0.52665253,0.46342493,0.42316637,0.37252757,0.37300907,0.36880687,0.35914191,0.35282425,0.34747609,0.33817487,0.34575191,0.34876838,0.34056054,0.33125123,0.33351176,0.32522870,0.32789672,0.32580533,0.29752710,0.27535931,0.24021789,0.20889495,0.16273314,0.11966549,0.18481064,0.24608689,0.30307031,0.35856364,0.38401482,0.40608094,0.43500805,0.46327029,0.45287530,0.44437775,0.42680165,0.40818466,0.38737126,0.36739333,0.34722719,0.33188860,0.37932195,0.42207319,0.49216978,0.56640593,0.61692826,0.66722800,0.72605225,0.78046079,0.73066011,0.68117454,0.65177368,0.62375270,0.55202161,0.47528190,0.40898165,0.33863416,0.38375504,0.43055307,0.48282081,0.53732074,0.51226485,0.48825241,0.46063222,0.43279508,0.44982394,0.46344087,0.48884491,0.51202955,0.48442853,0.46563484,0.43000635,0.40044828,0.40761560,0.41530580,0.41752789,0.42353423,0.40271577,0.38804230,0.34874529,0.31068593,0.36947826,0.42289862,0.48019135,0.53441465,0.53454560,0.53335150,0.54809137,0.56139322,0.60262038,0.64413504,0.66678536,0.69588294,0.66743206,0.63815833,0.61522513,0.59509921,0.59252836,0.58794317,0.57245844,0.55752287,0.56059913,0.56151797,0.57516418,0.58741483,0.52953109,0.46766723,0.42430844,0.38088452,0.39096085,0.39698690,0.38731131,0.38636100,0.37520799,0.36690426,0.36723724,0.37250014,0.37950847,0.39061383,0.40195733,0.41706545,0.45751816,0.49441865,0.54269743,0.58386680,0.60836091,0.63843344,0.66173397,0.68852328,0.66813913,0.64311787,0.58739706,0.53874234,0.54458653,0.54552077,0.52687747,0.50745695,0.47549905,0.44188542,0.41814743,0.38774658,0.39522875,0.40742516,0.41605256,0.39389345,0.42041466,0.45597476,0.48322221,0.51368322,0.57266902,0.63658983,0.69836576,0.76269668,0.70885324,0.65574866,0.60120743,0.53641292,0.47725228,0.41778929,0.36531682,0.31193015,0.32409141,0.33099206,0.34828747,0.36535972,0.39888928,0.43623114,0.46813963,0.49771457,0.47075199,0.44505432,0.41071565,0.38588434,0.35618107,0.32947303,0.29152799,0.25591500,0.26573759,0.27202489,0.27611305,0.28101690,0.27938216,0.28097998,0.29055198,0.29978078,0.34590459,0.39784690,0.44586678,0.48924260,0.55599652,0.62523859,0.68844590,0.75555875,0.72031528,0.68069334,0.65479631,0.62508918,0.60366844,0.57506055,0.55010373,0.52832182,0.51712998,0.50262604,0.48842809,0.46933295,0.47710775,0.47629632,0.47803702,0.48168923,0.46016206,0.44613524,0.43915198,0.42723110,0.47936329,0.52785363,0.57356168,0.61864728,0.56774829,0.51277376,0.44938531,0.39482254,0.38693589,0.38499185,0.37665993,0.37217335,0.38401451,0.39143723,0.41957697,0.43766667,0.42505421,0.41088041,0.39898307,0.39189727,0.38219873,0.37036779,0.35769207,0.34457091,0.32718374,0.31336036,0.29976817,0.28737064,0.30005786,0.30278856,0.31479005,0.32384672,0.36862184,0.41993485,0.46866027,0.51521185,0.51532436,0.50882140,0.49771927,0.49322741,0.48952961,0.48408160,0.47445916,0.46297383,0.43050467,0.40446898,0.38351011,0.36349910,0.37071280,0.37921279,0.37577761,0.37632351,0.37679322,0.37591127,0.37498426,0.37556987,0.35860036,0.34206811,0.32056538,0.30916446,0.29588302,0.28471028,0.27866098,0.26397256,0.24109447,0.21656181,0.18128352,0.15434730,0.20700517,0.26577396,0.31044490,0.35930074,0.38506570,0.41373602,0.43905826,0.47054945,0.44899586,0.42896090,0.40838353,0.38567536,0.36557487,0.34595327,0.31236482,0.28778110,0.33645687,0.39123666,0.45437232,0.52260537,0.58230960,0.64225794,0.69855256,0.74890668,0.72317878,0.69180240,0.67261930,0.65575460,0.60840542,0.55323653,0.50545752,0.45091875,0.48058832,0.50697378,0.53129464,0.55953650,0.55008508,0.54235883,0.52925569,0.52064204,0.52533182,0.53345597,0.53086179,0.53290353,0.51063869,0.48935180,0.47071358,0.45109028,0.44168011,0.43038292,0.43275573,0.42729526,0.40502488,0.38536548,0.35597449,0.32349888,0.37260605,0.42507968,0.46563364,0.49876263,0.51920350,0.54425542,0.56495940,0.58735195,0.60779322,0.62907947,0.65654440,0.67559657,0.65515849,0.62746376,0.61777565,0.61001451,0.59256025,0.57975995,0.55950795,0.54441475,0.53108938,0.51447235,0.51570391,0.50678735,0.47391610,0.44019152,0.40522409,0.36874818,0.35182038,0.33974057,0.32386691,0.30692060,0.31552366,0.31970827,0.32343007,0.32604166,0.33140246,0.34409134,0.35191968,0.35422456,0.40036386,0.44912319,0.49745903,0.54287199,0.58419781,0.62358283,0.66162390,0.69861164,0.67691941,0.66451169,0.62780584,0.59776563,0.60089346,0.60963145,0.60213825,0.59206856,0.55695737,0.52017240,0.48822663,0.45942085,0.44770912,0.43293076,0.41155624,0.35944739,0.41039552,0.45432601,0.48162918,0.51927719,0.56749655,0.62332299,0.68873807,0.75373590,0.69535454,0.64371527,0.58121533,0.51657006,0.45581233,0.39586279,0.36133967,0.32849325,0.34378591,0.35399873,0.38984979,0.42821594,0.45970469,0.49144214,0.50929387,0.52486544,0.49398233,0.45990932,0.42450526,0.38817149,0.34505800,0.29785965,0.24535231,0.18889657,0.21315428,0.23826546,0.25837457,0.27585428,0.28335085,0.28998384,0.30396047,0.31227161,0.38539746,0.45531530,0.50340119,0.54590521,0.62158895,0.69386316,0.76460962,0.84138714,0.79939102,0.76087185,0.72800697,0.70062733,0.67285102,0.65057079,0.62038535,0.59313604,0.57507785,0.55877123,0.52693089,0.50278721,0.49655651,0.49157441,0.47695563,0.46189971,0.45677418,0.44571178,0.45051047,0.45363321,0.48767644,0.51730911,0.55968137,0.59641907,0.54561014,0.49634537,0.44340803,0.38778382,0.36773529,0.34800198,0.32520938,0.29946555,0.32426158,0.35067278,0.36987215,0.39622466,0.36948855,0.34994322,0.32565796,0.29774401,0.29997731,0.29833694,0.28564461,0.27058078,0.25512380,0.24181546,0.23552869,0.23219063,0.24798099,0.26373379,0.29701636,0.32616271,0.38979603,0.45655381,0.51822964,0.57962787,0.55787909,0.53535386,0.49783612,0.45767258,0.44050073,0.41909499,0.37886244,0.33634388,0.33830764,0.33765384,0.34188122,0.34823440,0.36554703,0.38680551,0.39467243,0.40088757,0.40137218,0.40495269,0.40236852,0.40759871,0.37957054,0.34889238,0.31784709,0.28503448,0.26596932,0.24763589,0.25361197,0.25480439,0.23652160,0.22231280,0.20001341,0.18137782,0.23746743,0.29043326,0.31902131,0.35696040,0.39352212,0.42687920,0.44643757,0.47350249,0.44173277,0.41440321,0.38724605,0.35997166,0.34093466,0.32233221,0.28312116,0.23730759,0.30080619,0.36203194,0.41844811,0.48075634,0.54851289,0.61448880,0.67037872,0.72014470,0.71167165,0.70098757,0.69282784,0.69005993,0.66373684,0.63740080,0.59684710,0.56003940,0.56535279,0.57781852,0.58174366,0.58888650,0.59529685,0.60085174,0.60138066,0.60437847,0.60018231,0.60201313,0.58055269,0.55891847,0.53897511,0.51384300,0.50895667,0.50459574,0.48006714,0.45230901,0.44293187,0.43743202,0.40913031,0.38485411,0.36217426,0.33812013,0.38446674,0.42748288,0.44664753,0.46806793,0.51103335,0.54821762,0.57927067,0.61052889,0.61097476,0.61858768,0.64212260,0.66347971,0.64193433,0.61822632,0.61958557,0.61909400,0.59238844,0.56942263,0.54669394,0.53117340,0.49959204,0.47020209,0.44845203,0.42894599,0.41850000,0.41516834,0.38361239,0.35094459,0.31728957,0.28651613,0.26467065,0.23379710,0.25663877,0.27904190,0.27604665,0.27705684,0.28587081,0.29556885,0.29627261,0.29640703,0.34895056,0.40499111,0.45238848,0.49890523,0.55221772,0.60436948,0.65524852,0.70392598,0.69761391,0.68675957,0.66892463,0.64966730,0.65873911,0.67272465,0.67480252,0.67952936,0.64317005,0.60181010,0.56094641,0.52773437,0.49352736,0.46269020,0.40920714,0.34960075,0.39135146,0.43179246,0.46794558,0.50406411,0.55566670,0.61369951,0.68101806,0.74852565,0.68505581,0.61722970,0.55154621,0.48806343,0.44565311,0.40555124,0.36270953,0.31986373,0.35658774,0.39218942,0.44014623,0.48321423,0.50430863,0.52392187,0.54665594,0.57431475,0.52448779,0.47720093,0.43617200,0.39873548,0.33120086,0.25709088,0.19493815,0.12530167,0.16677484,0.21495922,0.24316385,0.27115662,0.29402163,0.31723851,0.33158805,0.34673667,0.42468243,0.49245588,0.55992546,0.62757306,0.70130831,0.77259003,0.84407524,0.91407454,0.86902245,0.82853820,0.80078893,0.76919100,0.74793552,0.71900875,0.69808151,0.66797257,0.63685608,0.60802875,0.56713093,0.52826015,0.51683711,0.50335225,0.48862399,0.46920294,0.45869837,0.45504659,0.45318085,0.45252438,0.48770789,0.51325773,0.55477053,0.60036198,0.54831397,0.49779609,0.44237533,0.38318411,0.35168431,0.32047993,0.28916846,0.25050430,0.27878001,0.29922691,0.32310578,0.35007618,0.31831069,0.28664331,0.24942162,0.21195569,0.22103545,0.22753041,0.21630392,0.21090821,0.19370703,0.17832222,0.16511360,0.15442567,0.20327803,0.24346678,0.28837457,0.33470657,0.41574148,0.49246641,0.56435325,0.63509560,0.58550579,0.53573354,0.48770275,0.44044888,0.38924388,0.34004766,0.27624882,0.22210523,0.24529076,0.27458917,0.31219738,0.34672570,0.36130996,0.38377357,0.40395610,0.42488335,0.42938744,0.42597682,0.42977187,0.43027069,0.38554178,0.33850652,0.29198846,0.24387448,0.24127214,0.23959403,0.23908539,0.23524155,0.23140283,0.23267303,0.22183764,0.21221679,0.24883653,0.29052656,0.32038752,0.35194054,0.38899663,0.42591421,0.44977838,0.48190654,0.44343052,0.41295180,0.38069593,0.35091929,0.32348796,0.29727178,0.25096421,0.21128412,0.26736463,0.32250125,0.37408187,0.41938452,0.49503656,0.57237466,0.64636990,0.71657837,0.71164692,0.70475490,0.71342869,0.72552290,0.71217093,0.70048075,0.68438324,0.66915224,0.66054823,0.65074450,0.62817270,0.61148967,0.63783700,0.66118732,0.68458598,0.70113041,0.67476585,0.64760466,0.61799767,0.58339489,0.56884470,0.55058868,0.54965303,0.53748009,0.51310291,0.47973385,0.45508826,0.43387439,0.41036753,0.39142103,0.37216285,0.34744186,0.37810458,0.40469220,0.42864685,0.44885925,0.48983738,0.53408959,0.57380780,0.62193417,0.61850515,0.61604414,0.62407881,0.63255299,0.62601812,0.61257561,0.61158177,0.61814389,0.58097306,0.55100536,0.52510869,0.49832843,0.45808652,0.42036946,0.39442925,0.36401930,0.36396494,0.36191124,0.34995333,0.34255615,0.29715694,0.25187851,0.21239156,0.17192934,0.19986091,0.22485350,0.23758718,0.25142111,0.24590479,0.23879918,0.22670288,0.21179990,0.27933649,0.34515255,0.39821499,0.46001935,0.52394354,0.59038446,0.65103408,0.71226819,0.71793404,0.71389942,0.70926873,0.70621706,0.72906187,0.74510072,0.76576546,0.78083327,0.73346584,0.68230208,0.63297756,0.58984892,0.53704627,0.48279750,0.41844764,0.33896379,0.37382197,0.40705654,0.44520319,0.48537112,0.54476298,0.59925822,0.67097052,0.74739989,0.66824106,0.58665611,0.52395908,0.46088847,0.43420365,0.41032562,0.35990305,0.30649369,0.36573063,0.42557065,0.48494761,0.54392299,0.55044460,0.55790533,0.59055787,0.61868787,0.55536136,0.48995722,0.45100263,0.41000023,0.31330759,0.22047580,0.14197481,0.05562456,0.12115487,0.18975295,0.23178014,0.27111519,0.30252965,0.34244453,0.35765166,0.38036975,0.45829331,0.53510700,0.61982166,0.70197760,0.77793653,0.85336028,0.92204809,0.99645657,0.93927724,0.88803395,0.86865291,0.84454981,0.81617806,0.79435869,0.76742250,0.74869883,0.70019753,0.65827312,0.59987628,0.54834660,0.53586312,0.51888682,0.49157211,0.46934138,0.46462757,0.46285727,0.45896174,0.45103464,0.48079137,0.51075561,0.55165863,0.59633715,0.54849460,0.49786875,0.43763501,0.37862450,0.33724856,0.29401169,0.24483160,0.19921879,0.22213328,0.24730922,0.27819157,0.31043310,0.26131002,0.21896251,0.17206313,0.12386632,0.13976020,0.15698448,0.15123645,0.14507906,0.13082356,0.11021311,0.09857611,0.07946199,0.15615389,0.22338647,0.28392994,0.34279992,0.43563788,0.53410639,0.61037648,0.69503301,0.61844509,0.54016842,0.48487051,0.42394603,0.34397888,0.26010993,0.18420270,0.09837099,0.16050675,0.21325852,0.27875914,0.33888314,0.35738789,0.37598097,0.41861907,0.45154113,0.44964756,0.45164964,0.45147028,0.46030447,0.39571801,0.33064621,0.26782743,0.20253238,0.22123576,0.23691694,0.22643337,0.21592019,0.22724011,0.23765610,0.24053241,0.23584738,0.26756382,0.29513913,0.31943429,0.34571958,0.38710005,0.43005578,0.45676906,0.48502400,0.44480324,0.40152505,0.37424436,0.34184745,0.30974383,0.27225863,0.22804383,0.17806749,0.23178870,0.28551664,0.32466553,0.35926589,0.44545418,0.53128717,0.61681329,0.70651005,0.70963831,0.71046252,0.73801334,0.76343518,0.76792903,0.77549282,0.77161086,0.77638471,0.74835461,0.72559156,0.68060576,0.63309374,0.68267944,0.72574169,0.75978456,0.79836023,0.74279606,0.69090480,0.65141188,0.61068831,0.60345794,0.59022970,0.58441731,0.57916363,0.54564582,0.51163203,0.47050484,0.42697842,0.41354490,0.40570834,0.37661668,0.35319506,0.37406933,0.38578791,0.40892185,0.42823622,0.47527582,0.51730370,0.57766654,0.63238304,0.62474281,0.61950028,0.61337130,0.60775799,0.60506822,0.60676736,0.61178346,0.61403419,0.56850681,0.52709579,0.49826637,0.47183515,0.42183237,0.36878802,0.33301953,0.29563475,0.30599924,0.31086533,0.31938937,0.33283772,0.27696994,0.22069529,0.16756072,0.10889767,0.14331057,0.17057965,0.19516684,0.22583331,0.20488415,0.18087168,0.15621434,0.13029876,0.21066621,0.28344342,0.34823415,0.41709991,0.49861000,0.57560837,0.64744619,0.72303097,0.73231071,0.75019800,0.75166002,0.75984049,0.79113607,0.82584504,0.85778817,0.88851628,0.82681658,0.76398852,0.70901166,0.65368177,0.58103821,0.50656847,0.42099697,0.38563870,0.40932142,0.43272236,0.45654247,0.48354794,0.52987963,0.58027006,0.63396856,0.69061032,0.62680751,0.56957660,0.50599941,0.44441301,0.42383981,0.39943208,0.36030540,0.32378106,0.36838061,0.41610137,0.46592640,0.51307609,0.51976154,0.52745342,0.54653943,0.56293376,0.51404673,0.46402555,0.42228032,0.38063287,0.29972927,0.21809304,0.14518297,0.07415457,0.12889721,0.18683106,0.22768091,0.27309829,0.29737219,0.32858431,0.35080883,0.37534284,0.45313523,0.53775193,0.60857823,0.68057560,0.74485678,0.80901644,0.88451768,0.95600450,0.91179137,0.86191758,0.83245422,0.79397622,0.76601893,0.73240937,0.70262608,0.66416666,0.64672302,0.61991806,0.59627419,0.57018903,0.55552444,0.54478910,0.52069952,0.50026585,0.50878358,0.51041067,0.52092054,0.52491547,0.54619965,0.56703197,0.60355352,0.63982186,0.59788823,0.55908882,0.51084159,0.46842804,0.42836619,0.38752846,0.35119833,0.31534307,0.31830615,0.32663816,0.32929843,0.33527883,0.28708751,0.24397209,0.20155959,0.15873027,0.15993013,0.17011646,0.17181748,0.17098534,0.16775537,0.16131884,0.15350932,0.14356614,0.20713308,0.26991326,0.32395720,0.38267038,0.45934424,0.54343151,0.61563173,0.69171764,0.62190061,0.55875102,0.49356107,0.42825873,0.36051169,0.29661913,0.23618351,0.17253133,0.21686800,0.25595819,0.29827514,0.33830902,0.36079198,0.38259200,0.40364914,0.43167975,0.41984047,0.40372354,0.40061560,0.39702550,0.34912250,0.30212334,0.25311828,0.20953793,0.22050738,0.23868965,0.24066940,0.24301664,0.24504103,0.25428395,0.25885459,0.26371359,0.28228810,0.30634382,0.32127072,0.34078523,0.36677071,0.39778110,0.41269891,0.42640029,0.39934159,0.37279493,0.35133737,0.33062854,0.29859368,0.26495727,0.23022086,0.19761649,0.24326314,0.28638194,0.32768057,0.37139816,0.44292665,0.51646839,0.58930600,0.66901813,0.67337854,0.68136838,0.70400517,0.72813274,0.73216641,0.74436351,0.74831029,0.75236664,0.72786317,0.69998475,0.67209640,0.63501876,0.66148083,0.67669013,0.70231269,0.72165647,0.68993609,0.66513928,0.64038398,0.61427432,0.61646734,0.62003522,0.62784583,0.63187699,0.60171429,0.56037156,0.52623909,0.49484914,0.46796847,0.44319258,0.41653238,0.39187747,0.41799356,0.44150635,0.46451692,0.48298477,0.52048577,0.55788294,0.59755033,0.63285180,0.62961449,0.62778798,0.61192219,0.60359055,0.59977903,0.60300011,0.59488510,0.58954846,0.55484809,0.52168004,0.49412508,0.46697637,0.41727471,0.35905511,0.31964856,0.28130429,0.30044364,0.31332915,0.32905437,0.33670497,0.30404413,0.26772240,0.23103958,0.20248394,0.21963364,0.24614320,0.26750558,0.30052425,0.27873044,0.25599707,0.23947070,0.22035954,0.28279869,0.35065006,0.41456295,0.47781134,0.53292695,0.58661507,0.63627341,0.68847338,0.70688179,0.73138409,0.74465212,0.75949140,0.78106823,0.80923639,0.82526194,0.83791775,0.79223700,0.74093401,0.68241830,0.62576498,0.56914835,0.51227041,0.44920092,0.43295164,0.44391597,0.45958801,0.46704962,0.48031381,0.52024578,0.55784974,0.59235907,0.63080271,0.59187743,0.54768985,0.48870268,0.42803944,0.41293007,0.39745954,0.36332355,0.33211404,0.37677046,0.41317105,0.45245854,0.49220682,0.49550188,0.49452166,0.50201225,0.51128646,0.47681308,0.43979724,0.39269482,0.34668899,0.28207648,0.21460511,0.15168557,0.09036438,0.13424997,0.18401976,0.22723447,0.27697242,0.29227611,0.30985169,0.34464800,0.37034287,0.45188872,0.53771944,0.59529575,0.65692116,0.71322764,0.76992282,0.84434702,0.91259396,0.87675317,0.83798728,0.79300531,0.74639923,0.70922458,0.67495414,0.62755456,0.58446128,0.58407850,0.58880288,0.59041414,0.59469852,0.57934186,0.56755070,0.54872488,0.52966187,0.54444679,0.55619012,0.57527252,0.59587725,0.60852070,0.62333058,0.65457775,0.68648516,0.64906624,0.62291673,0.58919813,0.55566388,0.51305706,0.47742478,0.45299719,0.43009746,0.41436693,0.40152803,0.38033181,0.35753590,0.31749036,0.27295056,0.22923096,0.18843696,0.18668277,0.17720010,0.19089610,0.19715737,0.20498436,0.20931024,0.20802472,0.20939990,0.26030160,0.31278710,0.36222630,0.41342460,0.48192859,0.55143303,0.62173619,0.69651920,0.63089961,0.57014614,0.49873615,0.43137732,0.38300781,0.33105320,0.28779421,0.25113878,0.27870379,0.30514493,0.31528453,0.33176468,0.35917316,0.38702343,0.39676782,0.40337211,0.38270493,0.35650253,0.34556436,0.32967128,0.29898316,0.27123976,0.24036540,0.21196761,0.22370723,0.24013181,0.25091667,0.26051490,0.26461510,0.27017063,0.27954099,0.29369702,0.30539196,0.31567886,0.32108216,0.32778020,0.34817589,0.36896292,0.36701377,0.37529982,0.35903515,0.34364701,0.32903845,0.31558658,0.28847718,0.26012351,0.23690041,0.20881305,0.24578442,0.28396932,0.33564347,0.38248832,0.44114029,0.49446395,0.56079996,0.63220180,0.63911113,0.64631310,0.66729238,0.68695076,0.70584292,0.71917106,0.72508480,0.73465027,0.70645419,0.67846261,0.66148317,0.64107591,0.63728766,0.63483077,0.63499239,0.64452139,0.63809133,0.64366646,0.62844564,0.61553770,0.63344756,0.65487102,0.67393819,0.69046429,0.65303378,0.61423891,0.58599872,0.55765625,0.52098506,0.48593736,0.45897565,0.42763655,0.46081203,0.49407100,0.51644517,0.53478716,0.56565620,0.59437204,0.61332015,0.63098620,0.63586822,0.63833700,0.61611547,0.59198551,0.59851813,0.59892340,0.58273212,0.57109599,0.53616285,0.50631590,0.48931935,0.46941324,0.41032148,0.34564044,0.30564361,0.26486030,0.29190597,0.32005224,0.33174667,0.34529493,0.32561945,0.30948629,0.30466433,0.29524758,0.30200335,0.31329391,0.34442706,0.37169379,0.34500590,0.32315766,0.31645349,0.30904573,0.36289643,0.41430877,0.48030820,0.54171642,0.56426414,0.59199381,0.62669609,0.65933183,0.68394885,0.70980094,0.73378366,0.75454295,0.77573566,0.79671944,0.79110692,0.79170213,0.75598348,0.71535591,0.65751343,0.60363782,0.56178315,0.51339859,0.47517790,0.45425065,0.46028662,0.47079608,0.47510699,0.48132223,0.50887055,0.54299974,0.56750504,0.59485295,0.54770318,0.50165663,0.45053538,0.40735960,0.39599535,0.38658151,0.37066563,0.36281843,0.38332006,0.40914300,0.43504179,0.46701862,0.45935238,0.45931955,0.45541017,0.45703338,0.43264688,0.41056686,0.37932796,0.34454689,0.27190347,0.20409818,0.14078688,0.07562300,0.12421133,0.17368736,0.21912802,0.26968880,0.29325318,0.31161601,0.35090147,0.38951726,0.45277750,0.51750376,0.57700836,0.63396153,0.69212104,0.74753620,0.82646004,0.90539272,0.85044119,0.80285456,0.75244765,0.69776842,0.65615740,0.60681509,0.56098140,0.50442721,0.53194366,0.55781053,0.58398915,0.61566733,0.60525983,0.59538498,0.58247327,0.56634214,0.58879217,0.61619660,0.63831161,0.66698586,0.66799585,0.67601218,0.69977854,0.72209686,0.69187040,0.67005087,0.64906059,0.62462695,0.59245194,0.56145245,0.54564839,0.53885451,0.49716833,0.46541635,0.42496773,0.38651413,0.34495951,0.30761170,0.25603651,0.20730673,0.21087635,0.21437273,0.21589427,0.21308441,0.22633555,0.23435213,0.23772752,0.24084740,0.29949446,0.35384551,0.39995738,0.44910242,0.50633274,0.56440517,0.63471933,0.69409767,0.62952499,0.56598113,0.49588096,0.42929896,0.40068886,0.36977641,0.33362401,0.30019651,0.31535258,0.32947291,0.33733627,0.33831552,0.35321690,0.37422819,0.38114755,0.38814398,0.36590922,0.33673587,0.30528809,0.27452663,0.25414757,0.23357600,0.21048768,0.18295696,0.21799959,0.24697713,0.27406996,0.30245899,0.29820477,0.29449100,0.30387824,0.30886090,0.31338881,0.32493934,0.33241718,0.33926044,0.32556098,0.31974581,0.30874505,0.29685092,0.30522172,0.30798510,0.31010138,0.30943019,0.28763000,0.26406696,0.24124438,0.21921786,0.25808521,0.29737497,0.33352705,0.36957236,0.42179211,0.47366091,0.52789946,0.58077511,0.60279275,0.62019651,0.64979070,0.67813243,0.68170423,0.68830186,0.69320986,0.69527657,0.67341097,0.65255962,0.64107593,0.62995095,0.60558025,0.57937646,0.56775888,0.55635267,0.57428822,0.59454210,0.61135391,0.62506017,0.65680321,0.69008835,0.71815149,0.75391784,0.71482234,0.67831850,0.64570962,0.61116786,0.57831456,0.54068796,0.51024373,0.47827851,0.51282711,0.54109820,0.57503255,0.60546584,0.61457179,0.62290872,0.63605257,0.64292557,0.63781914,0.62741029,0.61627167,0.59587805,0.58674829,0.57806515,0.56739176,0.55175432,0.52620344,0.50765797,0.48577851,0.46841462,0.41194646,0.35060668,0.29274614,0.23282787,0.27104042,0.30213927,0.33457039,0.36027606,0.36267181,0.36198285,0.36029428,0.36591706,0.37885493,0.39311053,0.42544787,0.44847623,0.42710467,0.40496524,0.38850387,0.37100442,0.42683126,0.48756069,0.54957087,0.60861829,0.60956798,0.61602890,0.61441241,0.62036370,0.65079498,0.68994241,0.72759071,0.76602866,0.77074297,0.77197495,0.76822637,0.75467253,0.72257524,0.69313103,0.64459374,0.58935813,0.56286019,0.53263826,0.49071248,0.47289884,0.47835433,0.48257045,0.48052793,0.47952195,0.50274051,0.52841898,0.54155958,0.55830861,0.51012240,0.45810294,0.41639943,0.37902789,0.37317673,0.36914852,0.38070582,0.38885556,0.39371563,0.39874788,0.41751518,0.44083161,0.43003034,0.41790442,0.41023328,0.40031852,0.39120029,0.38151051,0.35986267,0.33884376,0.26618641,0.19078152,0.12942607,0.05795707,0.10939475,0.15780137,0.20944504,0.26166482,0.28806948,0.31290712,0.35522143,0.40096821,0.45164236,0.50406610,0.55654462,0.61197005,0.67068293,0.72458776,0.81095916,0.89615833,0.82651342,0.76640231,0.70446914,0.64895816,0.59525415,0.54469250,0.49033192,0.42868063,0.48186317,0.53183199,0.58380366,0.63562636,0.63340560,0.63189663,0.61102928,0.59461392,0.63591174,0.67412332,0.70402402,0.73649138,0.73290612,0.72233444,0.73793339,0.75558449,0.73599359,0.71554920,0.70876168,0.70328844,0.67318785,0.64380263,0.64659184,0.64614294,0.58482065,0.53008889,0.47383190,0.41457633,0.37621237,0.34134466,0.28327990,0.22651537,0.23414820,0.24297974,0.23592309,0.22950646,0.24426460,0.25623962,0.27059268,0.27778307,0.33419408,0.39469762,0.43726853,0.47856050,0.53267454,0.58049587,0.64232170,0.69998313,0.62607971,0.55738948,0.48942014,0.42307089,0.41317037,0.40195055,0.37957752,0.35724900,0.35509753,0.35638113,0.35319405,0.34482501,0.35514686,0.35709816,0.36476454,0.37269741,0.34489990,0.31766645,0.26603439,0.21306486,0.20496045,0.19441610,0.17613082,0.16035683,0.21061384,0.25627262,0.29706509,0.33946911,0.32881680,0.31779640,0.32281105,0.32487368,0.32784346,0.33319411,0.33539752,0.34349034,0.31179213,0.27271344,0.25353904,0.22325792,0.24657290,0.26599688,0.28350424,0.30158192,0.28428772,0.26290153,0.25138936,0.23071335,0.27038908,0.30798079,0.33662843,0.35927319,0.40434474,0.44641743,0.49251529,0.53588005,0.56045529,0.58296580,0.62554881,0.66289666,0.66000002,0.65167268,0.65674239,0.66093895,0.64034456,0.62133032,0.62280455,0.62048730,0.57069979,0.52128255,0.49625481,0.47212217,0.51034634,0.54885351,0.59265189,0.63925889,0.67722562,0.72107697,0.76872155,0.81729249,0.77314452,0.73559476,0.70200986,0.67198477,0.63702533,0.59925547,0.55982390,0.52512410,0.55702996,0.59238658,0.63178635,0.67074004,0.66176617,0.64480973,0.65010527,0.65338542,0.64262738,0.62214675,0.61468566,0.60413997,0.58526288,0.56334399,0.54977058,0.53740338,0.51811051,0.50328026,0.48741612,0.47258901,0.41253360,0.35387232,0.28016935,0.20353617,0.25044282,0.28632364,0.33211664,0.37503099,0.39402836,0.41447821,0.42568854,0.43382628,0.45326614,0.47637463,0.50319487,0.52982349,0.50789929,0.49244592,0.45797192,0.42662126,0.49427442,0.55824903,0.61403810,0.67705667,0.65771664,0.64143905,0.60955324,0.57383702,0.62040168,0.66222591,0.72051406,0.77906145,0.76931946,0.75618015,0.73545949,0.71976519,0.69851527,0.67451901,0.62390578,0.57565781,0.56605721,0.55551629,0.51694096,0.55968554,0.54522570,0.53249770,0.50567693,0.48215010,0.47635881,0.47654897,0.45988092,0.44917627,0.42917400,0.41798774,0.39431379,0.37578666,0.37733087,0.37964372,0.38622555,0.38890480,0.38351459,0.37564290,0.39030516,0.39402049,0.38622494,0.37940127,0.36634985,0.36332659,0.35222870,0.34046802,0.32990882,0.31426612,0.25143531,0.18526735,0.12544391,0.06925960,0.12119275,0.17152245,0.21684344,0.26410978,0.28723544,0.30766654,0.34149171,0.36977778,0.41970229,0.46456995,0.51991472,0.58244085,0.64245663,0.70744286,0.78449639,0.86295376,0.80488105,0.74298644,0.67674169,0.61322511,0.56098866,0.50007693,0.44064423,0.37758991,0.43799273,0.49286588,0.54827688,0.60214571,0.62668517,0.65321910,0.66457817,0.68087917,0.70156098,0.71560456,0.73920553,0.76393001,0.76809050,0.77161055,0.78586015,0.79643811,0.77861684,0.76179618,0.75053493,0.74493073,0.72292357,0.71075155,0.70803803,0.70551261,0.64494943,0.58512898,0.51700635,0.45083776,0.41182040,0.37517705,0.32300735,0.27664232,0.28785808,0.29738706,0.29683357,0.30073418,0.30597701,0.31748873,0.33195940,0.34776924,0.38670261,0.42585826,0.47174217,0.52069874,0.56377105,0.60144601,0.64854290,0.70155335,0.63207568,0.56629063,0.51869522,0.46601904,0.45550051,0.44230966,0.42917696,0.41082653,0.40421387,0.39544511,0.38957557,0.37730965,0.37226216,0.36970668,0.35331500,0.34059307,0.31618132,0.29641414,0.25680611,0.22083204,0.20772156,0.18988751,0.17353396,0.15612016,0.19988283,0.23834163,0.27670030,0.32430586,0.31491302,0.30875541,0.31153094,0.31583276,0.31616859,0.31803663,0.32647902,0.33318651,0.29338427,0.25477801,0.21799402,0.18326381,0.20945223,0.22927648,0.26312126,0.29069481,0.28216173,0.27210857,0.25606747,0.24370305,0.27669659,0.31734854,0.33767732,0.36234966,0.40812807,0.45265131,0.48992352,0.52204264,0.54743137,0.56930335,0.60360539,0.64345956,0.64740769,0.65027597,0.66147948,0.67078389,0.64836574,0.62203390,0.59856021,0.57703373,0.52296292,0.47216975,0.42473532,0.38044920,0.43794338,0.49179017,0.55471322,0.61677047,0.68090046,0.73494272,0.79313612,0.84710423,0.81408428,0.78285518,0.75127001,0.72320736,0.69371352,0.66128353,0.63428086,0.60429575,0.63020431,0.65405702,0.67715634,0.70793328,0.70118810,0.70172655,0.70334617,0.70065904,0.67964218,0.65377303,0.62212049,0.59684267,0.56970842,0.53991260,0.51469324,0.49301956,0.47140167,0.45011981,0.43511753,0.41751899,0.36691758,0.31745071,0.26194568,0.20732561,0.25675866,0.30708643,0.35672874,0.41002077,0.43966187,0.46731604,0.48750920,0.51506515,0.53390283,0.56066199,0.57876417,0.60354670,0.59084196,0.57814707,0.56587817,0.55046617,0.58292161,0.62404276,0.66693832,0.70844826,0.69090199,0.66883432,0.64120640,0.60899884,0.64429575,0.68135934,0.71552390,0.75947611,0.75085838,0.75122129,0.74651737,0.73638395,0.71284608,0.69395267,0.65371629,0.61430302,0.60873799,0.59818147,0.57912084,0.64381451,0.60934174,0.57764088,0.53032076,0.48566536,0.45537306,0.42044508,0.38191775,0.33909674,0.35472398,0.37315939,0.36983637,0.36540109,0.37710784,0.39237256,0.39451755,0.39539132,0.37424796,0.35306085,0.35320833,0.35683683,0.34808221,0.34062341,0.32724096,0.32242768,0.31301541,0.30559661,0.29987910,0.29367287,0.23784071,0.17401950,0.12907608,0.07471731,0.12924943,0.18548589,0.22335350,0.26336011,0.28239178,0.30178907,0.32320553,0.34637824,0.38839296,0.42874968,0.48763689,0.55062594,0.62031845,0.68984316,0.76247485,0.83876730,0.77598654,0.71825148,0.64613804,0.57796095,0.52323137,0.46132654,0.39200690,0.32904613,0.39352094,0.46112904,0.51429683,0.56821366,0.62266903,0.68271647,0.71825224,0.75916795,0.76292729,0.76126687,0.78035426,0.79385931,0.80411112,0.81891173,0.83008769,0.84276932,0.82674331,0.80824986,0.79868529,0.78956058,0.77648836,0.76929706,0.76500418,0.76565518,0.70290207,0.64788997,0.56810489,0.48556312,0.44932176,0.40451924,0.37043941,0.32570458,0.33957545,0.35412249,0.35596201,0.36355641,0.36834300,0.37334725,0.39057881,0.41235213,0.43864179,0.45811626,0.51241166,0.56786979,0.59283714,0.62243988,0.66167222,0.70505614,0.63766932,0.57522014,0.54481734,0.51257995,0.49734699,0.47856756,0.47339637,0.46521678,0.45273269,0.43336453,0.42430926,0.41083328,0.39320775,0.38135873,0.34447338,0.31134106,0.29185133,0.27151825,0.24953722,0.22115974,0.20459609,0.18553858,0.17306872,0.15321658,0.18699600,0.21329743,0.25854994,0.30872985,0.30067578,0.29369316,0.30273570,0.30666190,0.30681397,0.30859155,0.31582754,0.32222540,0.27772617,0.22785087,0.18491430,0.13801274,0.16696324,0.19606083,0.24004479,0.28063515,0.27632478,0.28125629,0.26638111,0.24584009,0.28420867,0.32229712,0.34365146,0.36019974,0.40626633,0.45569291,0.48330081,0.50553604,0.53142858,0.55469965,0.58958067,0.62216479,0.63012570,0.64740473,0.66599396,0.68392983,0.65377183,0.62895079,0.58054206,0.52710679,0.47673147,0.42268336,0.35974330,0.29727657,0.36494969,0.43783344,0.52013687,0.60225296,0.67422748,0.75480030,0.81562531,0.88135971,0.85383263,0.82845552,0.80118051,0.77927975,0.74838150,0.72337214,0.70244698,0.68384715,0.69219542,0.70770845,0.72782845,0.74007734,0.74393006,0.74938638,0.75241051,0.74647941,0.71612714,0.68243963,0.63455307,0.58834257,0.55734284,0.51982203,0.48251087,0.44913689,0.42519017,0.39888625,0.38312082,0.35778865,0.32449517,0.28161959,0.24567918,0.21145568,0.27140241,0.32285988,0.38411321,0.44467432,0.48016058,0.51540052,0.55888286,0.59534643,0.61743651,0.63699991,0.65907641,0.67914904,0.67361213,0.65984197,0.66613080,0.66737735,0.68187575,0.68612518,0.71303733,0.74271551,0.71995848,0.70382857,0.66804989,0.63968811,0.66820000,0.69483939,0.71529600,0.73789154,0.73916381,0.74798938,0.75022549,0.75314143,0.73387672,0.70977521,0.67817484,0.64697088,0.64707116,0.64539209,0.64264147,0.71906234,0.66786083,0.61469171,0.55979570,0.50238104,0.44175027,0.38448599,0.31585764,0.25363373,0.28937373,0.31986723,0.34566826,0.36801225,0.37972350,0.38211282,0.38165923,0.38501436,0.35447608,0.32775913,0.31281429,0.29502325,0.29067391,0.29049538,0.27191852,0.25858628,0.26871145,0.27977114,0.28607884,0.29000627,0.23433897,0.17889503,0.12650834,0.07162377,0.12925003,0.19028519,0.23784831,0.28926073,0.28911048,0.28917355,0.29502181,0.30113089,0.34678317,0.38603128,0.44190250,0.49502663,0.57181673,0.64469805,0.72543045,0.80594451,0.74878696,0.68854191,0.62870889,0.56714820,0.49043512,0.40931056,0.33412609,0.25862706,0.33096756,0.40647810,0.47490091,0.53941314,0.62135080,0.70015419,0.78183673,0.85866367,0.84280176,0.82623180,0.82137657,0.80925748,0.83536500,0.85698166,0.87882810,0.89510798,0.87525658,0.85253084,0.83826926,0.81750990,0.82491400,0.82725347,0.83449308,0.84275857,0.76962805,0.68945104,0.60825406,0.52525070,0.49598241,0.46002550,0.41951277,0.38073370,0.39356302,0.40784447,0.41437036,0.41381594,0.42052365,0.42354047,0.43980397,0.46034859,0.48647457,0.51965937,0.56079673,0.59734458,0.61299497,0.63061013,0.66563196,0.70089420,0.65346489,0.60389952,0.55968790,0.52203070,0.52705451,0.52743968,0.53160886,0.53195999,0.50905103,0.48999919,0.47155381,0.45280799,0.41563041,0.37649721,0.33214302,0.28446450,0.26365751,0.24675341,0.22880941,0.21433876,0.20127042,0.18451087,0.16261513,0.14661167,0.17524095,0.21036493,0.24954791,0.28530474,0.28439122,0.28336182,0.28416270,0.28913352,0.28938471,0.29339476,0.30841281,0.32408965,0.26369033,0.20982489,0.15394168,0.09505925,0.13305649,0.17497035,0.20956195,0.25247198,0.25937583,0.26297142,0.26315607,0.26659817,0.28959133,0.32227786,0.33642335,0.35215905,0.39472266,0.44033863,0.47025850,0.50659826,0.51775541,0.53222687,0.56271856,0.58675475,0.60741529,0.63533836,0.65775584,0.69106558,0.64992634,0.60688263,0.56083745,0.51242993,0.43869785,0.35711701,0.27365041,0.18403264,0.28258411,0.38903400,0.48786373,0.58827074,0.67751701,0.76570209,0.84782013,0.93227265,0.90069916,0.87201910,0.85030508,0.83069115,0.80166889,0.77285199,0.76388168,0.74896793,0.76021232,0.77086461,0.78855030,0.80430185,0.80250896,0.80163784,0.80527278,0.81233103,0.75773034,0.71011796,0.64720032,0.58868009,0.54391190,0.49586356,0.44416343,0.39459537,0.38394374,0.36538717,0.34721738,0.32290018,0.29435698,0.26902210,0.24160599,0.21251587,0.28255833,0.35111649,0.42408409,0.49988849,0.53847872,0.58359214,0.63185850,0.68483276,0.70312216,0.71899995,0.74563179,0.76810438,0.76759025,0.76315320,0.77612425,0.79298109,0.78147031,0.76575309,0.77179391,0.78275489,0.75069462,0.72424310,0.69815993,0.67253594,0.67920158,0.68457002,0.69594980,0.70068573,0.72230402,0.74640330,0.76388905,0.78775717,0.76702753,0.74807193,0.71510488,0.68286623,0.68801034,0.69963708,0.70992456,0.79656998,0.72282208,0.64794305,0.58150843,0.51624585,0.42943359,0.34794097,0.25177434,0.15735052,0.21503093,0.27404458,0.32444743,0.37635800,0.37718407,0.37895910,0.37813225,0.37355187,0.33977473,0.29968269,0.26931054,0.23488640,0.23769039,0.24215247,0.22234515,0.19855252,0.22886931,0.25865065,0.26703395,0.28498543,0.22846998,0.17682789,0.12366093,0.06862319,0.13042262,0.19320669,0.25387721,0.32091006,0.29696698,0.27802072,0.26851944,0.25445672,0.30191233,0.34338270,0.39844958,0.44575814,0.52494223,0.60353478,0.69107761,0.77661051,0.71551623,0.66285338,0.60877471,0.55354846,0.45285151,0.35904428,0.27412300,0.18363688,0.27358286,0.35872804,0.43274770,0.50990619,0.61570925,0.72285947,0.83492602,0.95494584,0.92580389,0.89632070,0.86048198,0.82874111,0.86365128,0.89813902,0.92534282,0.95286989,0.92535569,0.90263551,0.87475544,0.85047019,0.87353768,0.89211297,0.90807736,0.92629940,0.83092257,0.73686599,0.64989707,0.56416634,0.54552451,0.52062718,0.47169413,0.43079599,0.44562216,0.46619729,0.46360644,0.46858051,0.47539970,0.47716152,0.49587867,0.50858550,0.54508507,0.58114500,0.60045157,0.62923554,0.63310302,0.64088440,0.67074706,0.69814100,0.66250076,0.62637352,0.57748048,0.52879512,0.55556360,0.58151337,0.58729848,0.59310519,0.56886982,0.55300953,0.52668351,0.49946494,0.43797861,0.37535286,0.31617872,0.25199866,0.23809891,0.22165336,0.21274109,0.20581926,0.19313135,0.18591801,0.15686112,0.13051159,0.17239279,0.21061346,0.24064216,0.26605390,0.27162652,0.27574192,0.27144509,0.26917309,0.27740394,0.27789876,0.30211569,0.32423430,0.25680141,0.19125173,0.11727058,0.04547924,0.09732255,0.15008211,0.18822085,0.22409011,0.23401884,0.24352307,0.26166974,0.27838781,0.30172262,0.31719311,0.33246596,0.34220290,0.38499840,0.42167189,0.46288915,0.49931323,0.50381882,0.51036905,0.53690352,0.55428120,0.58826936,0.61950569,0.65410315,0.69538746,0.64198723,0.58553853,0.53882434,0.49970162,0.39933956,0.30020738,0.18814592,0.07419507,0.20825609,0.33425446,0.45656331,0.58081796,0.67530683,0.77822483,0.87705346,0.98621169,0.94390658,0.90944678,0.89256738,0.87988870,0.85191730,0.82420163,0.82160676,0.81799888,0.82493943,0.83255198,0.84399543,0.86295976,0.85535600,0.85034992,0.86103898,0.87793644,0.80598709,0.73493943,0.66417057,0.58927220,0.53109367,0.47377170,0.40485967,0.34138106,0.33612066,0.33694070,0.31238101,0.28572904,0.26847856,0.24651286,0.23246200,0.21092650,0.28989369,0.36992278,0.46499150,0.55464713,0.59925149,0.64283414,0.71134966,0.78050620,0.79344117,0.80510866,0.83257186,0.86030713,0.86208059,0.86764163,0.89341793,0.91708678,0.87668615,0.84286301,0.83336322,0.82473192,0.78262513,0.74458235,0.72696226,0.70377577,0.69008324,0.67597475,0.67430876,0.66750866,0.70742737,0.74438275,0.78376979,0.82139916,0.79774102,0.78287778,0.75116756,0.71574290,0.73506964,0.74938135,0.77453336,0.78666861,0.71713956,0.64413752,0.58257372,0.52538916,0.44990414,0.37104169,0.30147110,0.22490091,0.27987877,0.33106100,0.37767077,0.41883103,0.42497490,0.42103422,0.42970439,0.43035206,0.38679771,0.34216871,0.29803593,0.25727396,0.24268980,0.23521900,0.21524683,0.19397449,0.21759975,0.23753152,0.26109930,0.27950415,0.23835534,0.19519093,0.15359310,0.10923402,0.16398980,0.22157973,0.27260743,0.31868867,0.29502307,0.27693696,0.26939538,0.26077135,0.31008926,0.35742600,0.40868599,0.45459773,0.51983709,0.58418191,0.65763620,0.72657929,0.67768321,0.61945125,0.57270929,0.52969763,0.45397975,0.37241947,0.29464005,0.22020005,0.28276292,0.34757695,0.41973331,0.48422152,0.56838459,0.64942552,0.74232347,0.83140316,0.81209864,0.79507956,0.77964675,0.76141004,0.78700933,0.82258352,0.83281704,0.85088670,0.83472960,0.81503572,0.80165733,0.78536292,0.80166988,0.81579181,0.83004548,0.83725617,0.76118241,0.68629442,0.61442197,0.54637734,0.52653038,0.50395935,0.46881415,0.43533053,0.44082279,0.44235076,0.43690550,0.42731984,0.44423191,0.45762127,0.46537225,0.48186211,0.49453871,0.51036770,0.53513679,0.55058491,0.56050608,0.57229761,0.59751746,0.62437137,0.60288462,0.58657833,0.55088093,0.51760164,0.53361340,0.55406576,0.56416519,0.57786211,0.56069041,0.54642294,0.52454770,0.50355541,0.45989903,0.41184492,0.37113435,0.33272755,0.30738859,0.28860118,0.27147012,0.25543470,0.24030192,0.22226838,0.20545990,0.18643397,0.21225663,0.23359833,0.25743584,0.28122250,0.28341392,0.28585494,0.29970138,0.30998339,0.31028483,0.31415600,0.32358816,0.32660860,0.28308809,0.24148896,0.19657963,0.14249679,0.17626744,0.20937090,0.22997667,0.24449375,0.25719809,0.26346993,0.27622825,0.28921979,0.31070295,0.33273672,0.34936076,0.36925482,0.40442812,0.44330655,0.48222032,0.51789538,0.51917910,0.52875435,0.53784256,0.55407913,0.58861714,0.61614154,0.64622393,0.67385292,0.62251544,0.56985952,0.51399162,0.44860757,0.36178577,0.27360063,0.18092979,0.08314720,0.19670541,0.30607897,0.41418938,0.52356450,0.61180766,0.69862734,0.78116690,0.86649796,0.84384127,0.81774269,0.81735579,0.81045109,0.80097287,0.79159432,0.80660565,0.81711364,0.81893636,0.82704182,0.84089592,0.85364936,0.85256596,0.85421368,0.85761024,0.85498209,0.79616723,0.73449707,0.67299557,0.61277381,0.56409443,0.51046293,0.45659038,0.39706418,0.40094841,0.40218557,0.38787713,0.37896852,0.36027406,0.33944408,0.32650708,0.31268277,0.37192987,0.43408737,0.50228604,0.57911898,0.61126801,0.63902037,0.69529224,0.74857541,0.75125926,0.75508910,0.76194380,0.76967885,0.76912902,0.77186809,0.78393602,0.79218685,0.76914117,0.74227633,0.73971261,0.73700748,0.70679699,0.67282883,0.64818394,0.62759073,0.63318684,0.64093858,0.65470406,0.66031352,0.69808525,0.73240110,0.77278747,0.81453610,0.78974333,0.76321749,0.73455316,0.70863006,0.72774005,0.74450053,0.76354247,0.77537843,0.70795230,0.64066929,0.58845211,0.53099754,0.46831605,0.39785984,0.34356808,0.29131336,0.33998335,0.38398331,0.42679297,0.46663631,0.46616357,0.46617498,0.48165968,0.49436381,0.43737709,0.37916273,0.32718604,0.26972746,0.25262214,0.23259925,0.21094208,0.18577032,0.20340613,0.21883223,0.25128368,0.28021294,0.24564065,0.20706138,0.18250862,0.14779942,0.20056998,0.25269895,0.28588464,0.31559621,0.29540439,0.27573045,0.27456108,0.27139987,0.32138249,0.37433486,0.41361657,0.45370421,0.50897403,0.56180327,0.62154665,0.68287576,0.63368860,0.57895237,0.54077924,0.50701149,0.44837357,0.38812407,0.31937900,0.25699360,0.29381160,0.33656499,0.40067836,0.46457297,0.51954323,0.56837731,0.64138679,0.71926317,0.70308193,0.69312096,0.69052643,0.68677305,0.71695279,0.74601877,0.74559070,0.74916161,0.74068994,0.73022665,0.72574393,0.72862024,0.73432150,0.74530586,0.75089952,0.75690800,0.70090978,0.63899134,0.58265970,0.52139836,0.50729864,0.48652696,0.46268931,0.43724145,0.42620902,0.41749242,0.40473835,0.38491092,0.40891657,0.43162567,0.44051138,0.44783076,0.44559951,0.44180524,0.46153624,0.47985754,0.49116672,0.50138903,0.52456622,0.54963234,0.54790469,0.54660056,0.52263039,0.50245376,0.51247674,0.52346836,0.54565727,0.56699467,0.55446296,0.53929447,0.52108126,0.50920458,0.48117720,0.45296484,0.42982780,0.40614106,0.37710791,0.34821105,0.32388472,0.30194600,0.28269394,0.26102231,0.25112317,0.24251905,0.25401370,0.26251956,0.28161470,0.29473471,0.29501161,0.29909470,0.32469371,0.34539676,0.34981950,0.35502931,0.34173379,0.32860466,0.31517156,0.30091097,0.26819548,0.24180434,0.25347747,0.26709603,0.26829185,0.26943813,0.27788568,0.28313616,0.28807481,0.29682099,0.32105749,0.35080618,0.37226907,0.39083704,0.43052619,0.47014664,0.49900043,0.53710251,0.53955167,0.53839657,0.54782783,0.55920847,0.58675604,0.61476628,0.63490727,0.65374957,0.60528832,0.56132303,0.47868089,0.40056396,0.32404549,0.24865896,0.17504712,0.09348746,0.18571358,0.27475230,0.37164633,0.47559327,0.54838514,0.62501968,0.68088644,0.74201409,0.73499014,0.72644814,0.73361131,0.74540110,0.75250133,0.75847760,0.78630289,0.81564977,0.81469955,0.81507466,0.83502981,0.85140779,0.85353123,0.85714608,0.84303433,0.83343090,0.78773471,0.73403744,0.68911663,0.63323622,0.59273394,0.55168304,0.50359477,0.45100813,0.46072019,0.47107725,0.46997716,0.46707880,0.44616859,0.42616888,0.42012175,0.41229097,0.45388417,0.48812094,0.54556330,0.60519014,0.62126772,0.63555686,0.67774022,0.71413880,0.71150082,0.70621485,0.68916297,0.68030575,0.67773318,0.68248579,0.67710938,0.67234525,0.65651671,0.63889182,0.64893148,0.65042686,0.62404934,0.60267673,0.57510893,0.54559928,0.57559028,0.60540660,0.63463111,0.65328050,0.69342040,0.72262100,0.76464733,0.80408751,0.77500988,0.74208163,0.71905181,0.69643589,0.71893113,0.73641885,0.75696823,0.77490616,0.71747314,0.65884043,0.59642819,0.54155210,0.48957220,0.43866305,0.39690933,0.35697151,0.40240491,0.44689367,0.48523043,0.52866641,0.52528025,0.51990825,0.52985603,0.54300486,0.48094623,0.41266119,0.35036998,0.28662169,0.25525332,0.22614681,0.19970695,0.17550713,0.19845468,0.22698829,0.25716111,0.28908799,0.26566020,0.24034830,0.21945741,0.19539881,0.23467211,0.27320314,0.29704072,0.32409599,0.31444387,0.29540736,0.28283764,0.26777252,0.32323404,0.37774559,0.42772881,0.47037465,0.51102682,0.54908928,0.59094039,0.63050790,0.58953267,0.55101273,0.51875575,0.48160302,0.43259961,0.38173369,0.32471407,0.26955387,0.30570284,0.34758422,0.38792951,0.42371538,0.46285332,0.49860197,0.54271357,0.59277494,0.60004023,0.60666418,0.61268939,0.61586859,0.63969756,0.66117263,0.65853667,0.66464724,0.66242914,0.65376091,0.65193442,0.64340390,0.65661184,0.66715874,0.66810291,0.67502736,0.63250533,0.58204801,0.55010073,0.51199241,0.49419531,0.48153631,0.46184270,0.44267814,0.43093752,0.41104342,0.38148191,0.35592926,0.37675332,0.39907469,0.41643103,0.43198309,0.42097927,0.40304795,0.39498459,0.38786066,0.40941439,0.43426156,0.46116064,0.48389466,0.49239128,0.49545578,0.48568896,0.48057834,0.49719145,0.50676056,0.53117824,0.55660844,0.54172496,0.53578076,0.52034541,0.51406694,0.50157283,0.49897719,0.49262998,0.48870467,0.44862831,0.40982746,0.36519104,0.32631130,0.31130171,0.29875996,0.30422945,0.30232764,0.29838703,0.30116636,0.30341710,0.30451094,0.31971068,0.33158138,0.34667944,0.35701364,0.36691245,0.37093995,0.36311030,0.34715235,0.34612704,0.33545128,0.32200905,0.30979275,0.30495560,0.30940788,0.30092701,0.29263526,0.29039541,0.29207844,0.29261401,0.29580652,0.32737652,0.35158169,0.38650318,0.42371232,0.44748760,0.47683279,0.51522690,0.54887062,0.54863894,0.54683638,0.54491325,0.53968683,0.56680348,0.59734633,0.62502752,0.65347375,0.59202105,0.52629232,0.45426926,0.37517998,0.30803921,0.24382003,0.16591733,0.09153584,0.17698275,0.25713393,0.34230974,0.41965849,0.47806276,0.53207897,0.58548895,0.64170196,0.64730175,0.64892196,0.65167643,0.66054855,0.69880407,0.74219935,0.78344700,0.82400580,0.82296147,0.82200842,0.83385640,0.84408719,0.84577023,0.84974903,0.84793871,0.84263145,0.80597071,0.76030388,0.71560042,0.67627395,0.63757079,0.60620017,0.55726739,0.50627117,0.52244401,0.53186438,0.53882532,0.54615864,0.52999604,0.51788882,0.51474575,0.50425537,0.53137585,0.56034742,0.58887568,0.62150296,0.63134432,0.64627363,0.66498974,0.68908394,0.66932522,0.64602325,0.61939930,0.58690885,0.57869165,0.56880819,0.54676534,0.52865360,0.54500677,0.54994871,0.56408934,0.57137498,0.54748056,0.52372820,0.49724862,0.47142887,0.52436486,0.57620996,0.62094954,0.66872074,0.70119386,0.73070401,0.76859485,0.80365837,0.77178993,0.74428228,0.72137400,0.69591855,0.71829136,0.73845722,0.75565467,0.77154734,0.71887427,0.67500995,0.61069858,0.55004746,0.51450740,0.47826146,0.44834342,0.41648836,0.46329263,0.51305446,0.55330572,0.59374774,0.58304121,0.56802664,0.58435261,0.59668146,0.52097051,0.44914781,0.37374417,0.29311148,0.25893709,0.21802947,0.18968026,0.15959357,0.19887145,0.23483340,0.26558889,0.29602091,0.28241259,0.27567512,0.25872128,0.24377717,0.27120570,0.29269841,0.31159930,0.33667823,0.32664968,0.32102820,0.29308346,0.26160183,0.32769543,0.38846157,0.43144998,0.48113982,0.50505240,0.53501481,0.55947373,0.57883570,0.55041325,0.51954015,0.49164216,0.46133937,0.42275478,0.37592176,0.32751295,0.27774570,0.31773651,0.36031761,0.37054201,0.38121359,0.40452053,0.43077219,0.45060579,0.46501242,0.49646438,0.52875942,0.53626424,0.54514958,0.56396465,0.57818633,0.57494450,0.56940869,0.57433253,0.58239520,0.57418895,0.56477524,0.57755487,0.58911099,0.59152673,0.59889806,0.56219077,0.52526825,0.51585519,0.49723477,0.48596277,0.47831624,0.46438248,0.45369252,0.42776555,0.41075635,0.36537387,0.32089511,0.34722264,0.36490991,0.38945237,0.41682988,0.38636133,0.36573835,0.32784133,0.29116570,0.32800675,0.36752649,0.39772068,0.42232464,0.42944079,0.44190476,0.44762215,0.45678684,0.47667299,0.49461971,0.52085618,0.54545051,0.53685158,0.52937828,0.51935926,0.51406126,0.52980265,0.54151741,0.55345725,0.56670959,0.51450084,0.46649994,0.40942730,0.34550136,0.34742957,0.33802574,0.35006263,0.36303853,0.35093726,0.33893930,0.32928821,0.31466427,0.33657694,0.36251285,0.36786650,0.36697765,0.37786109,0.39327255,0.38194938,0.36579425,0.37161012,0.37499965,0.37606352,0.37634595,0.36279722,0.34989039,0.33318799,0.31386429,0.30823916,0.29698799,0.29440003,0.29449638,0.32293502,0.35340787,0.40447450,0.45324046,0.46755163,0.48815781,0.52544101,0.56775009,0.56180681,0.55636750,0.53869586,0.52428772,0.55113616,0.57733423,0.61614124,0.64939611,0.57407643,0.50014336,0.42402055,0.34600095,0.29714052,0.24380442,0.16526006,0.08572515,0.16586734,0.24534774,0.30583579,0.36597503,0.40238160,0.44026793,0.49392005,0.54526860,0.55666471,0.56326908,0.57132745,0.57741757,0.64891310,0.72264904,0.78044326,0.83768825,0.83199839,0.83032165,0.83590313,0.84212785,0.84374087,0.84911759,0.84684224,0.85208560,0.82074583,0.79016116,0.74989884,0.71259570,0.68597010,0.66083304,0.61322621,0.56342912,0.58344838,0.59654824,0.61269165,0.62921925,0.62063467,0.61011000,0.60596603,0.60323697,0.61675374,0.62719499,0.63172443,0.63967730,0.64971493,0.65899897,0.65973185,0.66535996,0.62513527,0.59228871,0.54598650,0.49438327,0.47504284,0.45623347,0.42747825,0.39026996,0.42663745,0.46643788,0.48143522,0.49890136,0.47282116,0.43971757,0.42064640,0.39907749,0.47426511,0.55140343,0.61615991,0.67959126,0.70844497,0.73904124,0.77261916,0.80690278,0.77495395,0.73708650,0.71459411,0.69479501,0.71697246,0.74377305,0.75829596,0.76523778,0.72866798,0.68842870,0.64708760,0.59764762,0.57915837,0.55620367,0.53129508,0.50889246,0.53251878,0.56548311,0.59282422,0.61897744,0.61434751,0.60687986,0.61634225,0.62429251,0.55914762,0.49581855,0.41765851,0.34170807,0.28779768,0.23469519,0.18204109,0.12610418,0.17314437,0.21958770,0.25074424,0.28717411,0.28099476,0.27562670,0.27128684,0.26157040,0.28555699,0.31691544,0.33569570,0.36229670,0.34871372,0.33574864,0.31088156,0.29270618,0.34428542,0.39325119,0.43751791,0.48178645,0.51016755,0.53576722,0.55657663,0.58028070,0.55608424,0.52618690,0.50261304,0.48197538,0.44816831,0.41508908,0.37100351,0.33327353,0.34841469,0.36912115,0.36897809,0.37155072,0.37348170,0.37231547,0.37267468,0.36760094,0.39114636,0.42243326,0.44049478,0.46177921,0.48692906,0.51047984,0.53140085,0.55391896,0.54577772,0.54171542,0.53436963,0.52555720,0.52098348,0.51107150,0.50530767,0.49876535,0.48438180,0.46745967,0.46993032,0.47046102,0.46871635,0.46355311,0.45120553,0.44760416,0.42463787,0.39911213,0.37026779,0.34329570,0.33579719,0.33503905,0.33516236,0.33311652,0.32173352,0.30855616,0.29333612,0.27234537,0.29347805,0.31333919,0.33619684,0.35933979,0.37015958,0.38106800,0.39002374,0.39157669,0.41215880,0.43740998,0.45873048,0.48856317,0.49826087,0.50690863,0.53314937,0.55514809,0.58421579,0.60892314,0.63789404,0.66613863,0.61206799,0.55375472,0.47904235,0.41127256,0.38754522,0.36372687,0.35872897,0.35047543,0.34521877,0.34630170,0.34901819,0.34759853,0.36851116,0.39554811,0.42114502,0.44758624,0.45290756,0.46171597,0.45649923,0.45800306,0.46007304,0.45906750,0.46999381,0.47843364,0.45669777,0.42901386,0.40772979,0.38255074,0.35422235,0.32685285,0.30326453,0.28326708,0.31497961,0.34744944,0.38833993,0.42540833,0.44299307,0.46787550,0.49767445,0.52350837,0.52743870,0.53425926,0.52462890,0.52246382,0.54933952,0.57388696,0.61167942,0.63988564,0.57188164,0.50727551,0.43363315,0.36201762,0.30461806,0.24293767,0.16376649,0.08471632,0.14193608,0.20312868,0.24931316,0.29734195,0.32816945,0.35869401,0.39278988,0.42092688,0.46125550,0.50770582,0.53206951,0.55846253,0.63742321,0.71362742,0.76986897,0.82943375,0.82598085,0.82141068,0.81985398,0.81751576,0.81980299,0.82924207,0.84073899,0.85235812,0.82759097,0.80187984,0.78072236,0.75377104,0.73787856,0.72144327,0.69393612,0.66462601,0.67587807,0.68810503,0.69346767,0.69449893,0.69767199,0.69436501,0.69319527,0.69634445,0.68452591,0.67199218,0.66757806,0.65650946,0.64602536,0.63493333,0.63259506,0.62642597,0.58546287,0.54274317,0.49056372,0.44582554,0.40947390,0.37692455,0.34735487,0.31569970,0.34256894,0.37117581,0.38757656,0.40900063,0.38789247,0.37204523,0.37275400,0.36656913,0.43837754,0.50780520,0.57855703,0.64720433,0.68530683,0.72284905,0.76089285,0.79376889,0.76471601,0.74210250,0.72514318,0.70761470,0.72271503,0.73451856,0.74958872,0.76421485,0.73470937,0.71048301,0.67931171,0.64658207,0.63581920,0.62979028,0.61075805,0.59671791,0.60590180,0.61643377,0.63202697,0.65550418,0.64988223,0.64567239,0.65124243,0.65925454,0.60241722,0.54715130,0.46382885,0.38354946,0.31490053,0.24638494,0.16713944,0.08967025,0.15257718,0.20793967,0.24306669,0.27276336,0.28142511,0.28170066,0.28233854,0.27658482,0.30765659,0.33635821,0.36237255,0.38626570,0.36857893,0.35023816,0.33286310,0.32150875,0.36167202,0.40516642,0.44152894,0.47915981,0.50442937,0.53491963,0.55674326,0.58368125,0.55699589,0.53502988,0.51175574,0.49505703,0.47320236,0.45310889,0.41965638,0.38081217,0.38102200,0.38748702,0.37397327,0.35603396,0.33893148,0.32222080,0.29063040,0.26545091,0.28616594,0.31272452,0.34686281,0.37240830,0.41482949,0.44780148,0.49130945,0.54164880,0.51779592,0.50048324,0.49058896,0.48169013,0.45978975,0.43603533,0.42294010,0.40847306,0.40938772,0.40694767,0.42553959,0.44473310,0.44149039,0.44396037,0.44550273,0.44303929,0.41234410,0.38306933,0.37516482,0.36391230,0.32757413,0.29779397,0.27612345,0.25020554,0.25529831,0.25779268,0.25827500,0.25736534,0.26086013,0.25939776,0.27648672,0.29245279,0.31100289,0.32835371,0.32800671,0.32871008,0.35641948,0.37590472,0.40400797,0.43684168,0.46276630,0.48815518,0.54133434,0.59442453,0.63469771,0.68233942,0.72373657,0.76557351,0.70527586,0.64109042,0.55674045,0.47158930,0.43296789,0.38960100,0.36430341,0.33568275,0.34295213,0.35882661,0.36759942,0.38429803,0.40347787,0.42508105,0.47172577,0.52335683,0.52613604,0.53493894,0.53935145,0.54510478,0.54264717,0.54573858,0.56345534,0.58202881,0.54321760,0.50625990,0.47796885,0.44807423,0.39866536,0.34810125,0.30844195,0.26252539,0.30085596,0.34000598,0.36819092,0.39806389,0.42278659,0.44155340,0.46384106,0.48226449,0.50066385,0.51002102,0.51554759,0.51462178,0.54615900,0.57024431,0.60735580,0.63730467,0.57295243,0.51121642,0.44120940,0.37823238,0.31403713,0.25182962,0.16567892,0.08357658,0.12181762,0.16352274,0.19796189,0.23216454,0.25614686,0.28111586,0.28771898,0.29841026,0.37224444,0.44946501,0.49245655,0.53766519,0.62141577,0.71000989,0.76450993,0.82298757,0.81934831,0.81417889,0.80017044,0.79356908,0.80016124,0.80618817,0.82975908,0.85266877,0.83597317,0.82012927,0.80590741,0.78809238,0.78503348,0.78020513,0.77183569,0.76197972,0.77295784,0.78704811,0.77429199,0.75864817,0.76923866,0.78584162,0.78436697,0.78777473,0.75198374,0.72086934,0.69997208,0.68306477,0.64244103,0.60748356,0.59828361,0.59503339,0.54348046,0.50036713,0.44465801,0.39029424,0.34229730,0.29693061,0.26938580,0.23446379,0.25959406,0.28524687,0.29982487,0.31673321,0.31216647,0.30448241,0.32455629,0.33900478,0.39722642,0.46116540,0.53726608,0.61052021,0.66152759,0.70536901,0.74329804,0.78015764,0.76513021,0.73911754,0.73316288,0.72321410,0.72388299,0.72991811,0.74657157,0.76447057,0.74626071,0.73436304,0.72055736,0.70890488,0.69949641,0.69118412,0.67968023,0.67130518,0.66695482,0.67007314,0.67429801,0.67627838,0.67984772,0.68568069,0.69584591,0.70154278,0.64551378,0.58376635,0.51383739,0.44485682,0.34822718,0.25764056,0.16097549,0.06175999,0.12646917,0.18701809,0.24148157,0.29257622,0.29324322,0.29592663,0.30178721,0.30263721,0.33320171,0.35880702,0.37857787,0.40280351,0.39265231,0.38018481,0.36186153,0.34693935,0.37327830,0.40555531,0.44690471,0.48081278,0.50555171,0.53046306,0.54976743,0.56313267,0.54822986,0.53563428,0.52478481,0.50716101,0.49354108,0.48113359,0.45819578,0.43088452,0.41477961,0.40260051,0.37975646,0.35759011,0.30771666,0.26118546,0.20321147,0.14198864,0.18595996,0.22734904,0.25729980,0.29275733,0.34018618,0.39215787,0.44197445,0.49816756,0.47544607,0.45336864,0.44419381,0.43955036,0.40192364,0.36140175,0.33236249,0.30026397,0.32306919,0.34770794,0.38338355,0.42222209,0.42456314,0.43083364,0.43131660,0.43097419,0.40777547,0.38922733,0.38088842,0.36992329,0.31613166,0.26494449,0.21901945,0.17126234,0.19380001,0.21013753,0.21683499,0.22771364,0.21815442,0.21625877,0.21383732,0.21715782,0.24233301,0.26407281,0.27289880,0.27810746,0.29398836,0.31513585,0.34364697,0.36990044,0.42180350,0.47808148,0.54788852,0.62063266,0.68521533,0.74527910,0.81047540,0.87280359,0.79323942,0.71116673,0.62160029,0.52835915,0.48129671,0.42465601,0.37373584,0.32341681,0.34658849,0.36604340,0.37791571,0.38759989,0.43587643,0.47702682,0.52905981,0.57332544,0.58515649,0.59664732,0.60832925,0.61797540,0.62591632,0.63862717,0.65745634,0.67720270,0.63260228,0.58827425,0.55539071,0.52307595,0.44910323,0.38168580,0.32190086,0.25711432,0.29291217,0.32468938,0.36065651,0.38900735,0.40573647,0.42189250,0.44059568,0.46329146,0.47987003,0.49673501,0.51424387,0.52994023,0.54887082,0.57381546,0.60034141,0.62803217,0.56869504,0.50969559,0.45129838,0.39424164,0.32199783,0.25185390,0.16208686,0.08113291,0.10603247,0.12682669,0.14577187,0.16066544,0.17453552,0.19429611,0.19123822,0.18795397,0.27871808,0.37061796,0.45482429,0.53837054,0.61691459,0.70287580,0.76728967,0.83533902,0.81478773,0.79521251,0.77308421,0.74992568,0.77515635,0.79424348,0.81859612,0.84649386,0.84377419,0.84017900,0.84709671,0.84475609,0.85532835,0.86256970,0.87350040,0.87514055,0.87016357,0.86564477,0.85108149,0.83069233,0.84863024,0.86142883,0.87222812,0.87903259,0.82836945,0.78504059,0.73528175,0.68765405,0.64582395,0.60773576,0.57838285,0.54494849,0.49362348,0.43853691,0.38083011,0.32333225,0.28063397,0.23594371,0.18610165,0.13906501,0.16531846,0.18871436,0.20402737,0.21647898,0.22553610,0.23949402,0.26527222,0.28845443,0.35823954,0.43243408,0.51104466,0.59429730,0.64039464,0.68634769,0.73898007,0.79252187,0.76858547,0.74840368,0.73697832,0.72542397,0.73165183,0.74278052,0.75024271,0.76701186,0.75999245,0.75350962,0.75817302,0.77012862,0.76057728,0.75722404,0.74979967,0.75002674,0.73580397,0.72273450,0.70967095,0.69591648,0.71037925,0.72989000,0.73777433,0.74558373,0.68682499,0.62851667,0.56444145,0.50228823,0.38103177,0.26633264,0.15008097,0.03237643,0.09665663,0.15902371,0.23591597,0.31538021,0.30896460,0.30929288,0.32318437,0.32879876,0.35113475,0.37802529,0.39771393,0.42563435,0.41534375,0.41264956,0.38672261,0.36538743,0.38619957,0.40961085,0.44703439,0.48455345,0.50572972,0.52815944,0.53661891,0.54786635,0.54057440,0.53624375,0.52742919,0.52576529,0.51668909,0.51504713,0.49390106,0.47970292,0.45058146,0.42247999,0.39196897,0.35986867,0.27881198,0.20208122,0.11006907,0.01460768,0.07770012,0.14150030,0.17004162,0.20309885,0.27023660,0.33065699,0.39597366,0.45815011,0.43617117,0.40588816,0.40419254,0.39610785,0.34142352,0.29124456,0.24445152,0.19333851,0.23805527,0.27854083,0.33570314,0.39637366,0.40526145,0.41819965,0.41586216,0.42142591,0.41011842,0.39288311,0.38605197,0.37868786,0.30143728,0.23046928,0.15945968,0.08791533,0.12828272,0.16791634,0.18087681,0.19930993,0.18616896,0.16507137,0.15299614,0.14236487,0.17310682,0.20798432,0.21588702,0.21855370,0.24079481,0.25484981,0.28424681,0.30431994,0.38333212,0.46423456,0.55778559,0.65433284,0.73113874,0.80196780,0.89603375,0.98708859,0.87993095,0.77715873,0.68507563,0.58898305,0.52726606,0.46473612,0.38839357,0.30779976,0.34222045,0.37947550,0.38430961,0.39370786,0.46180398,0.53357191,0.57849550,0.63288489,0.64998281,0.66840472,0.67613456,0.69232724,0.70853500,0.72540380,0.74561161,0.77189903,0.71843396,0.66282977,0.63076038,0.59419317,0.50124478,0.40840162,0.33151891,0.25351216,0.28398390,0.30670965,0.34290959,0.38044748,0.38824355,0.39494987,0.41802053,0.44046082,0.45958550,0.47653410,0.51160475,0.54050792,0.55652647,0.57868850,0.60200302,0.62036692,0.56230319,0.51030564,0.45571123,0.40837262,0.32709131,0.24945772,0.15993936,0.07345981,0.08529724,0.08791946,0.09115043,0.08914389,0.09587851,0.10909011,0.09193808,0.07091618,0.18220784,0.29198845,0.41297003,0.53174783,0.61162003,0.69761953,0.77578611,0.85360646,0.81399579,0.77834682,0.74512208,0.70990118,0.74729116,0.77812556,0.81528191,0.85078078,0.85306269,0.86105738,0.88111485,0.90601256,0.92657783,0.95081386,0.96824721,0.99522926,0.96972671,0.94921481,0.92462569,0.90795242,0.92679131,0.94450309,0.96006156,0.97510801,0.91007588,0.84608474,0.77356629,0.70191725,0.65414293,0.60037784,0.55170167,0.50341970,0.43778227,0.37423197,0.31758215,0.25787727,0.21366996,0.17031079,0.10814504,0.04001551,0.06972267,0.09131152,0.10711420,0.11402560,0.14387142,0.17035650,0.20141436,0.23194362,0.31450760,0.39936283,0.48651282,0.58030393,0.62260127,0.66852201,0.73830236,0.80549697,0.78045730,0.75256022,0.73961379,0.72702411,0.73862987,0.74978094,0.75669021,0.77572482,0.76651407,0.75958568,0.76909524,0.76809932,0.75586995,0.74631513,0.73862073,0.73303902,0.72394859,0.71298973,0.70686224,0.69704582,0.69984025,0.70475199,0.71765332,0.72622236,0.66869882,0.61109032,0.55572619,0.49715607,0.40380716,0.30499786,0.20862078,0.11629170,0.15752196,0.20552162,0.25736805,0.30952758,0.31074299,0.31233460,0.32853260,0.34305253,0.34328005,0.34817600,0.35954227,0.36712480,0.36924445,0.36603349,0.36095529,0.35494970,0.37766291,0.40811599,0.43950726,0.46607417,0.49309362,0.52153239,0.54384372,0.56248531,0.55204627,0.53871207,0.53500832,0.52073619,0.51152921,0.50453796,0.49058521,0.47901246,0.45363027,0.42156530,0.38431043,0.34206535,0.27156539,0.19214672,0.11107485,0.02213849,0.08425720,0.14378850,0.18812306,0.23065081,0.27670512,0.33001045,0.38893070,0.44194257,0.43083544,0.41709381,0.41021481,0.39874909,0.34802304,0.29689018,0.24926129,0.19141179,0.24660089,0.29830632,0.34485180,0.39482427,0.41567647,0.43701252,0.45276664,0.47544839,0.45227943,0.43213658,0.41214377,0.38823534,0.33381102,0.27481733,0.22614226,0.16988786,0.19846958,0.21934669,0.23500153,0.25499565,0.24500179,0.22856128,0.22833415,0.21827578,0.24704815,0.27584271,0.28363007,0.29112131,0.30927153,0.33683962,0.36044874,0.38207256,0.44504403,0.51316492,0.59281922,0.67403890,0.72762586,0.78714342,0.85658409,0.93102242,0.84320901,0.75280693,0.66641695,0.58519919,0.50900023,0.43837093,0.36671451,0.29444670,0.32072011,0.34565610,0.36030915,0.37397719,0.44676919,0.51430008,0.56771652,0.62000613,0.63211397,0.64442330,0.65754626,0.66934128,0.68719525,0.71284228,0.73431046,0.76234306,0.71453397,0.66414162,0.62552515,0.58080462,0.51246173,0.44510706,0.37590439,0.31082249,0.33269146,0.35573098,0.38548257,0.40692208,0.41347683,0.41353094,0.41544064,0.41898434,0.43473427,0.45508797,0.46971416,0.48683711,0.51415688,0.54373294,0.57585711,0.60403270,0.55285182,0.50402590,0.46243828,0.41660599,0.34848834,0.27807146,0.22287849,0.16130440,0.15962257,0.16400998,0.16579029,0.16528621,0.18039970,0.19188669,0.18660614,0.18870623,0.27117262,0.36151406,0.45189644,0.54030796,0.60879373,0.67977554,0.73921154,0.79896064,0.78201441,0.76105727,0.74705837,0.72538265,0.75605409,0.78396874,0.80302746,0.82073688,0.81664162,0.81698328,0.82034283,0.82746996,0.83886458,0.85132638,0.87170669,0.89142773,0.87894641,0.87296680,0.86236060,0.84738174,0.86276804,0.87297376,0.88456725,0.89831975,0.83006622,0.76530881,0.70381823,0.64360887,0.60629691,0.56658039,0.52327134,0.48352687,0.43113880,0.38005979,0.31849285,0.26330390,0.23218122,0.20740629,0.16251905,0.11874805,0.14125377,0.15987887,0.18219812,0.20529597,0.23496549,0.26887607,0.30144561,0.33215730,0.38628909,0.43413491,0.49043350,0.54518068,0.58180960,0.62096696,0.66781864,0.71182677,0.70331255,0.69506013,0.69072012,0.68558538,0.70803438,0.72884124,0.75470366,0.78961548,0.78142434,0.77160315,0.77067648,0.77449060,0.75173902,0.73212762,0.72904848,0.71984918,0.71160394,0.69969348,0.70010423,0.70080769,0.68683173,0.67475386,0.69416739,0.71367811,0.65732905,0.59869161,0.54934754,0.49553139,0.41857119,0.35045380,0.27569241,0.20006989,0.22310430,0.24426788,0.27516895,0.30646606,0.31075156,0.31530281,0.33805199,0.35796684,0.33688883,0.31870031,0.31029595,0.30317192,0.31398413,0.32910750,0.33289136,0.34031924,0.37037795,0.40226299,0.42323335,0.45347326,0.48003428,0.51498453,0.55152993,0.58318435,0.56861974,0.54721282,0.53458377,0.52527027,0.50516000,0.49069566,0.48611978,0.47329508,0.45287861,0.43079401,0.38094749,0.32525777,0.25833303,0.18975937,0.11090470,0.02830273,0.08996091,0.15261219,0.19961959,0.25120071,0.28640347,0.32638961,0.37798041,0.42722721,0.42538939,0.43249083,0.41322941,0.39816814,0.35384088,0.30715157,0.24713226,0.19162018,0.25478806,0.31412772,0.35180173,0.39450503,0.42658408,0.45572647,0.49462927,0.52867626,0.50119098,0.47563723,0.43937665,0.39810962,0.36032847,0.32220716,0.28863714,0.24794456,0.26269983,0.27630888,0.28813557,0.30467403,0.29861672,0.29620149,0.29750268,0.29760459,0.31964423,0.34445985,0.35200050,0.35409750,0.38514299,0.41362953,0.43166821,0.45438826,0.50447653,0.55072435,0.62199107,0.69716107,0.72907831,0.76518315,0.82080567,0.87781418,0.80820070,0.73512983,0.65244536,0.57762301,0.49245535,0.41575425,0.34751767,0.27609599,0.29216635,0.30779952,0.33362622,0.35561513,0.43062786,0.50415923,0.55450976,0.60725884,0.61705181,0.62001851,0.63802942,0.64603551,0.67261279,0.69369243,0.72416023,0.74646579,0.70587176,0.66271929,0.61977458,0.57301936,0.52409799,0.47490834,0.41599881,0.36536406,0.38502307,0.40449109,0.41831844,0.44058040,0.43160920,0.42933319,0.41249662,0.40328551,0.41571083,0.42913269,0.43031166,0.42727539,0.46789363,0.50981673,0.55341262,0.58816304,0.54250932,0.49206719,0.46331480,0.42852767,0.37156268,0.30900950,0.28009613,0.24502336,0.24449835,0.24374822,0.24183605,0.24412795,0.25840872,0.27147874,0.28560269,0.29845516,0.36340447,0.42879625,0.48654250,0.54357046,0.60813874,0.66772384,0.70911997,0.75236496,0.74627369,0.74643011,0.74162887,0.73898408,0.76526021,0.78965283,0.79192254,0.79846290,0.78442771,0.76381480,0.75648577,0.74486026,0.75256398,0.75960034,0.77782146,0.79789828,0.79623005,0.79501054,0.78925427,0.79213029,0.79477398,0.80406309,0.81575588,0.82257344,0.75699054,0.68414222,0.63765501,0.58622441,0.55823803,0.53706040,0.49709241,0.46342425,0.42409967,0.38189963,0.32062524,0.26130117,0.25295392,0.24417571,0.21601867,0.19656290,0.20878397,0.22220298,0.25684054,0.28892795,0.32346914,0.36175444,0.39962656,0.43506783,0.45412915,0.47297009,0.48947219,0.50916630,0.54120617,0.57373047,0.59453136,0.62092150,0.62671152,0.63303141,0.63906704,0.64682726,0.68012808,0.70265855,0.74905638,0.79951056,0.79043695,0.78226712,0.77455880,0.77029044,0.75838068,0.74275679,0.73409432,0.72721642,0.71317289,0.70224694,0.69554784,0.68342072,0.67596207,0.66130547,0.67670986,0.68852497,0.63333993,0.58574614,0.54592212,0.50115164,0.43601161,0.38027290,0.31435421,0.25248115,0.26734045,0.28684973,0.29529629,0.30721250,0.31813446,0.32176077,0.33724501,0.35286892,0.32540372,0.29964494,0.27207480,0.24662577,0.27322606,0.29258976,0.31492842,0.32935339,0.36038960,0.38120579,0.39896118,0.41578692,0.46228700,0.51318785,0.56106440,0.61025491,0.57880480,0.54717183,0.52458387,0.50590842,0.50178646,0.50357705,0.49238518,0.48827294,0.45417892,0.41541389,0.37766817,0.33582669,0.26135592,0.19069880,0.10821495,0.02147984,0.08735630,0.14900408,0.20598273,0.25984455,0.29737553,0.33784502,0.36842924,0.40492512,0.41314921,0.42478060,0.41982946,0.40910276,0.36109357,0.30908445,0.25323303,0.18996554,0.25344448,0.32008213,0.36859075,0.42123817,0.45221449,0.49276842,0.52806484,0.56399301,0.53446408,0.50890712,0.46350733,0.41692405,0.39449051,0.37233156,0.34506321,0.32315040,0.33915006,0.35105043,0.35600612,0.36527634,0.36295371,0.36038438,0.35847874,0.35447503,0.38435542,0.40735667,0.42135066,0.43913109,0.45734437,0.47659150,0.49828199,0.52285910,0.56168875,0.59724879,0.65294005,0.70918653,0.73273807,0.75870058,0.79708649,0.82915214,0.76394009,0.70284373,0.62479972,0.54720676,0.47400578,0.39287759,0.32790173,0.26268581,0.27866431,0.29716272,0.31137994,0.32557426,0.40177276,0.47873049,0.55069199,0.61536400,0.62155283,0.62409106,0.62554640,0.63370855,0.66211517,0.68822134,0.71781131,0.75023035,0.70580482,0.66103276,0.61826022,0.57735051,0.53675539,0.48985929,0.44673024,0.39729167,0.41463451,0.42170226,0.44261938,0.45854354,0.44069921,0.41689261,0.39503298,0.38286303,0.38103428,0.38472039,0.38322865,0.38280690,0.43414166,0.49198612,0.54264086,0.58990521,0.54921214,0.50033959,0.47046082,0.43539211,0.39944643,0.36082144,0.33958661,0.31398611,0.30533640,0.30248951,0.30593655,0.30172005,0.33495470,0.36210290,0.39247076,0.42136401,0.45296869,0.48995836,0.53131896,0.57662288,0.60845632,0.64057895,0.67382411,0.70610231,0.71844182,0.73340297,0.74396718,0.76004539,0.76173695,0.76788932,0.77579020,0.78011942,0.75122607,0.72373826,0.69692277,0.67345891,0.67734187,0.67846711,0.68455418,0.68434942,0.70329930,0.71509862,0.71783342,0.72385567,0.73377409,0.74151000,0.74959975,0.75322640,0.69337231,0.62715748,0.56745199,0.50865947,0.50219986,0.49181291,0.47202748,0.46020468,0.41342965,0.36757106,0.32143261,0.27359529,0.26835165,0.26515740,0.25386199,0.24620378,0.27299171,0.29994756,0.33819253,0.38122273,0.41351135,0.43640899,0.47807527,0.51233508,0.50153232,0.49217839,0.47633930,0.46357005,0.48538656,0.50748983,0.51480457,0.52225785,0.54703110,0.57412671,0.60048777,0.62352133,0.66059906,0.70341158,0.74884340,0.81205236,0.79986283,0.79785632,0.77966236,0.76839061,0.75741095,0.74820312,0.74155953,0.73391532,0.71959497,0.70662088,0.68837683,0.67164448,0.66388942,0.64877717,0.65278445,0.66168414,0.61777919,0.57113306,0.53955087,0.50692380,0.45631017,0.40594228,0.36153903,0.31367983,0.31785640,0.32714017,0.31573218,0.30661023,0.32235078,0.33438674,0.34567583,0.35507394,0.31972441,0.28174444,0.23760683,0.18550026,0.22557526,0.26357673,0.29432807,0.32384127,0.34188119,0.37004340,0.37671291,0.37983359,0.44652938,0.50569761,0.57107430,0.63255265,0.58778440,0.54415792,0.51414616,0.48531935,0.49679239,0.51248065,0.50433473,0.50205862,0.45045675,0.40335868,0.37494803,0.34700145,0.26557171,0.19266851,0.10625240,0.01683103,0.08878157,0.15219379,0.21044580,0.27209557,0.31048782,0.34514172,0.36019390,0.37998854,0.39816587,0.42139191,0.42102839,0.42516858,0.36587364,0.31764898,0.25612783,0.19231559,0.26165459,0.32784595,0.38229655,0.44320005,0.48254035,0.52305578,0.56198354,0.60784147,0.57757085,0.54547035,0.49288700,0.43445913,0.42581282,0.41135277,0.40867629,0.39732608,0.40971211,0.42550009,0.42167933,0.42302524,0.42197594,0.42061774,0.41939525,0.42129672,0.44220190,0.47067520,0.49711054,0.52836339,0.53436880,0.53444748,0.56516974,0.59336061,0.62105977,0.64176692,0.68702972,0.72612817,0.73761942,0.75533772,0.76993022,0.78090248,0.72504648,0.67184185,0.59655742,0.52442948,0.45217149,0.37120346,0.30580339,0.24273552,0.26435641,0.28341661,0.29197438,0.29581477,0.37697850,0.45895595,0.54044913,0.62289514,0.62393188,0.62503146,0.62182482,0.61719192,0.64704784,0.67698141,0.71493195,0.75313571,0.70278089,0.65488208,0.62178012,0.57954804,0.54806572,0.50865418,0.46951605,0.43154800,0.43934583,0.44527961,0.46387837,0.48835936,0.44349564,0.40122718,0.38397157,0.36435192,0.35456319,0.34133761,0.33478378,0.32868918,0.40069634,0.47210008,0.53241796,0.59864237,0.54807662,0.50574953,0.47350884,0.44219268,0.42660901,0.41647203,0.39776714,0.38188267,0.37172666,0.36231249,0.36438310,0.36511817,0.40861904,0.45335295,0.49830897,0.54595127,0.54817390,0.54929569,0.57649395,0.60313917,0.61152839,0.61371304,0.63864428,0.65542331,0.69176601,0.72609648,0.74888232,0.77883690,0.76303968,0.74835514,0.75517927,0.75742457,0.71841601,0.67347050,0.63478344,0.59422190,0.59826532,0.60144519,0.58965121,0.57876028,0.60746000,0.63746108,0.64818507,0.66092215,0.66722993,0.68131290,0.68275871,0.68756331,0.62477411,0.56999606,0.49888356,0.42766761,0.43921712,0.44970686,0.45274856,0.45365566,0.40560616,0.35544839,0.31513110,0.27444927,0.28428452,0.28542054,0.29474293,0.30333478,0.33721238,0.36688731,0.42489870,0.47722571,0.49877495,0.51437820,0.55548079,0.59826120,0.55567349,0.51029616,0.46784541,0.41834407,0.43065655,0.43807051,0.43320771,0.42919299,0.47081615,0.50866002,0.55210171,0.59608991,0.64373370,0.69601847,0.75476868,0.82476071,0.81281570,0.79936499,0.78068827,0.77072429,0.76476496,0.76106661,0.74667832,0.73382736,0.70907480,0.69151221,0.67603182,0.65812190,0.64343913,0.63484138,0.63491532,0.63527457,0.59888458,0.56400351,0.52974313,0.49592452,0.45393634,0.41890870,0.39020863,0.36108924,0.35534707,0.35325160,0.34183715,0.32498785,0.32170504,0.32149677,0.30754978,0.29591892,0.27109593,0.24267368,0.21333417,0.17834874,0.20472354,0.23093342,0.24031228,0.25502781,0.29824090,0.34294957,0.36963868,0.39748223,0.46101200,0.52562956,0.58592380,0.64870972,0.60718318,0.57122896,0.54073625,0.50361007,0.49829051,0.49118143,0.49109629,0.48573869,0.43854153,0.39130211,0.36156507,0.32948733,0.25246361,0.17058216,0.10150125,0.03224818,0.09176752,0.15033719,0.20989705,0.26880457,0.30791635,0.34458950,0.37646050,0.41143469,0.40536905,0.40473263,0.40226098,0.39343014,0.33801429,0.27652790,0.22490891,0.17023165,0.23801757,0.30634892,0.36308700,0.42335695,0.48599566,0.54617149,0.59804157,0.65559122,0.62964000,0.61216274,0.57074329,0.53217816,0.51582632,0.50620384,0.50448732,0.50177829,0.49901033,0.49119797,0.48656073,0.48761678,0.46772741,0.44983219,0.44342436,0.44123976,0.46763948,0.49691511,0.51965475,0.54444515,0.57056058,0.59652945,0.62031280,0.65004469,0.66742509,0.67706385,0.70431321,0.73163159,0.74712283,0.76463433,0.78153067,0.79307447,0.72923211,0.66826364,0.59203910,0.52001915,0.43722934,0.34681119,0.27283468,0.19561131,0.22529668,0.26237116,0.28874381,0.31589728,0.37582458,0.43992279,0.51360674,0.58911655,0.59472316,0.60437120,0.61381594,0.62280252,0.66836249,0.70364259,0.74193762,0.78224622,0.74064856,0.69856664,0.65285890,0.61396281,0.58933506,0.56824707,0.53900482,0.51659314,0.49348853,0.47415059,0.46656992,0.46177236,0.41182267,0.35549048,0.31399844,0.27624377,0.28529585,0.30311761,0.31125566,0.31538649,0.37941782,0.43680890,0.49081866,0.54732052,0.51774389,0.49484934,0.46879238,0.44803019,0.43817531,0.43603540,0.43917310,0.43808472,0.44059395,0.44385301,0.45070128,0.45499293,0.49510813,0.53222715,0.57006871,0.60276675,0.60778647,0.60642638,0.61760286,0.62996625,0.62783383,0.61874562,0.62152399,0.61958119,0.65869327,0.68898381,0.71263246,0.73476163,0.74010956,0.74836876,0.75878965,0.76829544,0.72980963,0.68300652,0.64489769,0.59650328,0.57536636,0.54318418,0.52214830,0.50412658,0.52957873,0.56002589,0.58244742,0.59915765,0.60548946,0.61483799,0.61576787,0.61924636,0.56625835,0.51193741,0.46412236,0.40713808,0.40675926,0.39939724,0.39094743,0.38712741,0.36770022,0.35199348,0.33070684,0.31542921,0.32116974,0.32997068,0.33893876,0.34492178,0.38663854,0.42414903,0.47104819,0.52170749,0.55262359,0.58299144,0.62255739,0.66520292,0.60850664,0.55920672,0.50093051,0.44593957,0.43464662,0.41776954,0.38827653,0.36320102,0.41660759,0.46883058,0.51513127,0.56491738,0.63531061,0.69738736,0.76614931,0.84782090,0.82188688,0.79643628,0.78787581,0.76965247,0.77278144,0.77548657,0.75107576,0.73744477,0.70363895,0.67247591,0.65623833,0.64400000,0.62818832,0.61520225,0.61164945,0.60180197,0.58353613,0.56051986,0.52205565,0.48476376,0.45735330,0.42924852,0.42229481,0.41014507,0.39533282,0.38172272,0.36398347,0.34525210,0.32277279,0.30583371,0.27301910,0.24104315,0.22521473,0.20839763,0.18949800,0.16867404,0.18308766,0.20099725,0.19173464,0.18759232,0.25526695,0.32200704,0.36754336,0.41141961,0.48143543,0.54916053,0.60126508,0.65727109,0.62715543,0.59943839,0.55617220,0.51901488,0.49920852,0.47647041,0.47466357,0.46670543,0.42179941,0.37506971,0.34648731,0.31295144,0.23119440,0.14940211,0.09502497,0.04520705,0.09892068,0.14790105,0.20901584,0.26874082,0.30561641,0.34303860,0.38806035,0.43795809,0.41902664,0.39532562,0.38052120,0.36314877,0.30496991,0.23991788,0.19433909,0.14954435,0.21164633,0.28189438,0.34558359,0.40239651,0.48562962,0.56592677,0.63414821,0.70231864,0.69102991,0.67976090,0.65104151,0.62929707,0.61294741,0.59193577,0.59867512,0.60725779,0.58499913,0.55601540,0.55595839,0.55602809,0.52029224,0.48116519,0.47284048,0.45968117,0.49133553,0.51922374,0.54181778,0.56241673,0.60756763,0.65300965,0.68374322,0.70804728,0.70961072,0.71434738,0.72200877,0.73484683,0.74928268,0.76954003,0.79044544,0.80663430,0.73747031,0.66671397,0.58926585,0.51613765,0.42067949,0.32319241,0.23458414,0.14915419,0.18994712,0.23777437,0.28585964,0.33420616,0.37495716,0.41978172,0.49481320,0.56562433,0.57201542,0.58065268,0.61028013,0.63282408,0.68262951,0.73368472,0.77143137,0.81881504,0.77739778,0.74227410,0.69327918,0.64397971,0.63588453,0.62914264,0.61096992,0.59533266,0.54392496,0.49661570,0.47283705,0.44313264,0.37077529,0.30365875,0.24779605,0.18243337,0.22347095,0.26314106,0.28442475,0.30331189,0.35111293,0.40093525,0.44685366,0.49479988,0.48478826,0.47783815,0.46110896,0.44874915,0.45088184,0.45413245,0.47477543,0.49546044,0.50782771,0.52476051,0.53327150,0.53911620,0.57615662,0.61681551,0.64033323,0.66500398,0.66593501,0.66094368,0.66092556,0.66251232,0.64123437,0.62487878,0.60476621,0.58402309,0.61856020,0.65807574,0.67510829,0.68968336,0.71875856,0.74995094,0.76916806,0.78130938,0.74245334,0.69815060,0.65027210,0.60429318,0.54541095,0.48793325,0.46106715,0.42556814,0.45902130,0.49091070,0.51532290,0.54233682,0.54649030,0.54759521,0.55041964,0.55802094,0.50538314,0.45353150,0.42281768,0.39104327,0.37358975,0.35146916,0.33758738,0.32331690,0.33968479,0.35094948,0.35212359,0.35067341,0.36338924,0.37600705,0.37880977,0.38436964,0.42825781,0.47663900,0.52484565,0.56815754,0.61241035,0.65285365,0.69300686,0.72485239,0.66450773,0.60459661,0.54121245,0.47362389,0.43643833,0.39936764,0.34672738,0.29551270,0.35724370,0.42255026,0.47929178,0.53640083,0.61737616,0.70325415,0.77452984,0.85922995,0.84237113,0.82432994,0.81460399,0.79933754,0.78447905,0.77041801,0.74968216,0.73478653,0.70575104,0.67951847,0.65279298,0.62810755,0.61691349,0.59826719,0.59886626,0.59465261,0.56327160,0.53364221,0.49608705,0.46177414,0.45432204,0.44741510,0.45013475,0.45533458,0.42729754,0.39846958,0.37643904,0.35848736,0.32234122,0.28683660,0.24174355,0.19919564,0.18622941,0.18115709,0.16945063,0.15860976,0.15633510,0.15790704,0.14410310,0.12954518,0.21024146,0.29147746,0.36587749,0.43497065,0.50278666,0.56707684,0.62741944,0.69115501,0.65270863,0.61225129,0.56992344,0.52224134,0.50662622,0.48763283,0.46565740,0.44257835,0.39921946,0.35756075,0.32200817,0.29531931,0.22596049,0.15348206,0.09393778,0.03059283,0.08738922,0.14680848,0.20862750,0.27320135,0.31475196,0.35943700,0.40618169,0.44836670,0.42208305,0.39444646,0.36885452,0.34581669,0.28593235,0.22422281,0.16491826,0.10509161,0.18049973,0.25339812,0.32922940,0.39797532,0.49261960,0.58717717,0.67107052,0.75561486,0.74388407,0.74064189,0.73046056,0.71466287,0.70744057,0.68948145,0.69385068,0.70323635,0.67009720,0.63970518,0.62837966,0.61803290,0.57149795,0.52892149,0.50207818,0.47999093,0.51709807,0.55056134,0.57431910,0.60462311,0.65449949,0.70141130,0.74257086,0.78714092,0.76891143,0.75525836,0.74000802,0.72268921,0.75090864,0.76998186,0.79720180,0.82285961,0.74322151,0.66511891,0.59036561,0.52257202,0.40876295,0.29857620,0.19707179,0.09030665,0.15399131,0.21774157,0.27362967,0.32918518,0.37263260,0.41496343,0.46771083,0.52440582,0.55349210,0.57661104,0.60818827,0.63691083,0.69269212,0.74333102,0.79103238,0.83824883,0.79947268,0.75793076,0.71528371,0.67776285,0.67810020,0.68334784,0.67723405,0.66831827,0.60172522,0.53575262,0.47495621,0.41098822,0.34079905,0.27019219,0.19051599,0.11223143,0.16469553,0.22190513,0.25741913,0.29296609,0.32915919,0.36362478,0.41053578,0.45132924,0.45733692,0.45712079,0.46051144,0.46282561,0.47754512,0.49295445,0.51778176,0.54000265,0.55996581,0.58164778,0.60726101,0.63397848,0.66906375,0.69679734,0.72369093,0.74218267,0.72411641,0.70384500,0.69756834,0.68930853,0.65699157,0.62534890,0.59480005,0.56413321,0.59493522,0.62385129,0.64025611,0.65820424,0.70006384,0.74225984,0.77361337,0.80539281,0.74901940,0.68967716,0.63480141,0.58437695,0.52350334,0.46101808,0.39893226,0.34299688,0.38366949,0.42283795,0.45460687,0.49439167,0.48475515,0.48396520,0.48969259,0.49049001,0.45110400,0.41636132,0.38411663,0.35005704,0.33401123,0.31429025,0.29018851,0.26452417,0.30279643,0.33997937,0.37024775,0.39699314,0.40892373,0.41793287,0.42170758,0.42843499,0.47192584,0.51605265,0.56589617,0.60699964,0.66630867,0.71904838,0.76877377,0.81491445,0.73941818,0.66327560,0.58798244,0.51126811,0.43898509,0.36973507,0.29119204,0.21490782,0.29841794,0.37682754,0.45342444,0.52051725,0.60914547,0.68738644,0.77826366,0.88015070,0.86458218,0.85387803,0.84017195,0.82995552,0.79775317,0.76990851,0.75302020,0.73510187,0.71266249,0.68919904,0.65081739,0.61442628,0.60153876,0.58050056,0.58164789,0.58325956,0.54176779,0.50246994,0.47303465,0.43937347,0.45591893,0.46150342,0.47827422,0.49839895,0.46182968,0.41904321,0.39840333,0.37145467,0.32011279,0.27584399,0.21218065,0.14723772,0.15072660,0.14707681,0.14643318,0.14667420,0.13197166,0.11474426,0.09010398,0.06303109,0.16704449,0.26950625,0.36532658,0.45866986,0.51898464,0.58751571,0.65014294,0.72118987,0.67155275,0.62526886,0.57885002,0.53111030,0.50944952,0.49355157,0.45919404,0.42161541,0.37614969,0.33280287,0.30353396,0.27329031,0.21125075,0.15407261,0.08165530,0.01163946,0.07691132,0.13973162,0.20782538,0.27251035,0.32343773,0.37684742,0.42002724,0.46116477,0.42830685,0.39686947,0.36134541,0.32491714,0.26392341,0.20197930,0.13242892,0.06002010,0.15024873,0.23073165,0.30788674,0.38531702,0.49998789,0.61362499,0.70963503,0.80526958,0.80202832,0.80300107,0.80555595,0.80947910,0.79963899,0.78608316,0.79401146,0.79776078,0.75638517,0.71868633,0.70013171,0.68423116,0.63204144,0.57694982,0.53841948,0.49668926,0.53927063,0.58520764,0.60808274,0.63822290,0.69519299,0.75237611,0.80429011,0.86501269,0.82859969,0.79356350,0.75776453,0.71501113,0.74469934,0.77647906,0.80393298,0.83793145,0.74836685,0.65796031,0.59335313,0.53274119,0.40028636,0.26523322,0.15506312,0.03414559,0.11618659,0.20413447,0.26186361,0.32810977,0.36801773,0.40854584,0.44813770,0.48944003,0.52943697,0.56791595,0.60825203,0.64522427,0.69752391,0.74979608,0.80416184,0.86297763,0.81916395,0.77875048,0.73901048,0.70373717,0.71936630,0.74036394,0.74332119,0.74945638,0.66002427,0.57573245,0.48196674,0.38616989,0.31395437,0.23896815,0.13503843,0.03165919,0.10819333,0.17743125,0.23056347,0.28486084,0.30639044,0.32726677,0.36944270,0.40580890,0.42282143,0.43854431,0.45527387,0.47590811,0.50427818,0.52464977,0.55734168,0.58488335,0.60778473,0.63101327,0.67997463,0.73062629,0.75336103,0.78378629,0.79870296,0.82496049,0.78581385,0.74533303,0.73513796,0.72540005,0.67613946,0.63031627,0.58511449,0.54135331,0.56949425,0.59825749,0.61480325,0.62886540,0.68104329,0.73772572,0.78634640,0.83305954,0.75831113,0.68066196,0.62415260,0.56373389,0.49562376,0.42857855,0.34408181,0.26126897,0.30874001,0.34937223,0.39881603,0.44611942,0.42609896,0.41159373,0.41892560,0.42564036,0.39957829,0.37425981,0.33848043,0.30675134,0.29307170,0.27787766,0.24114332,0.20140578,0.26239006,0.32843891,0.38573147,0.44822690,0.45159017,0.45884057,0.46474469,0.47542963,0.51622060,0.55250199,0.60428761,0.65285421,0.72023636,0.78940618,0.84928209,0.90997849,0.81449824,0.71732439,0.63208172,0.54607457,0.44332632,0.33609880,0.23228398,0.13109570,0.23277975,0.33317653,0.41882667,0.50739314,0.59111064,0.67546838,0.77925441,0.78880230,0.78891288,0.78147173,0.78809005,0.78664321,0.76488815,0.74164574,0.72544280,0.71388666,0.69249430,0.66676144,0.63327155,0.59913439,0.58908065,0.58147470,0.57632729,0.57241968,0.54835671,0.53108422,0.51219339,0.50029363,0.50765647,0.51706819,0.52610880,0.52928409,0.50544796,0.47904839,0.45251662,0.43585890,0.38398940,0.33641677,0.28244418,0.23489010,0.23103922,0.22589480,0.21654672,0.21227768,0.19508228,0.17654630,0.15883922,0.14079725,0.21794829,0.29768508,0.37743182,0.45735013,0.51624170,0.57279347,0.63144412,0.69226671,0.64980306,0.60138464,0.55869070,0.51580947,0.48860135,0.46303584,0.43351997,0.40347064,0.37632386,0.35686776,0.32913648,0.30512024,0.25695610,0.21483968,0.16107064,0.10395432,0.16425097,0.21866242,0.28323800,0.34536786,0.38339272,0.41782566,0.45317402,0.49001410,0.45766249,0.43151867,0.38912581,0.35191729,0.29679171,0.24570904,0.18541528,0.12069895,0.19593213,0.26596965,0.34325601,0.41375210,0.49681274,0.57369793,0.64549076,0.72201535,0.72674964,0.73526966,0.73727058,0.73652455,0.72704834,0.70831386,0.70181242,0.68692930,0.65788292,0.63391834,0.62352446,0.61273177,0.57932602,0.54614488,0.52874296,0.50799331,0.53932291,0.57183457,0.59254993,0.61411096,0.64924596,0.68408876,0.72153032,0.75615814,0.73744370,0.72033568,0.69836548,0.67595439,0.70861634,0.73845299,0.76348824,0.79035455,0.72044858,0.64880416,0.59262859,0.53319781,0.43336649,0.33302465,0.24643005,0.16686788,0.21014229,0.25035305,0.30139896,0.34386188,0.37829513,0.41341898,0.43682142,0.47065741,0.50284137,0.54378584,0.57693734,0.61267085,0.66491138,0.71306293,0.75696060,0.80172582,0.76377755,0.72557161,0.69481637,0.66235611,0.66263244,0.66848471,0.66934298,0.67423029,0.60656980,0.53698224,0.47625437,0.41076885,0.34666401,0.28234867,0.21547666,0.14816779,0.20415661,0.25730265,0.29365479,0.33425492,0.34922895,0.36065487,0.39321585,0.42451383,0.44032781,0.45353402,0.46753300,0.48788531,0.51750363,0.54912409,0.58773428,0.62920576,0.64863153,0.67128324,0.69804061,0.72532182,0.75253973,0.77728858,0.79916140,0.82757568,0.79375820,0.75919244,0.73526423,0.70904933,0.66555178,0.61683596,0.58132118,0.54107677,0.56786380,0.59755466,0.61480231,0.62956418,0.67135459,0.71735746,0.76361029,0.81061882,0.74689244,0.67582980,0.62155076,0.56925570,0.49341158,0.41445635,0.33407870,0.25242179,0.29364085,0.32814951,0.36305290,0.39016407,0.39053812,0.39594398,0.39766906,0.40293795,0.38891365,0.38151261,0.36866427,0.35175608,0.34980805,0.34370627,0.32505938,0.30668907,0.33594675,0.36985290,0.40594223,0.43947603,0.44912689,0.45859025,0.46675122,0.47942552,0.49978751,0.52472352,0.55651511,0.59733377,0.65399993,0.71007396,0.75559310,0.80375757,0.74463741,0.67967924,0.61431417,0.54320769,0.46150700,0.37719290,0.29010678,0.20776470,0.28386806,0.36501924,0.43422981,0.50279019,0.56517075,0.63308614,0.71348322,0.69708280,0.70968304,0.71456502,0.73231691,0.74663484,0.72810090,0.71140832,0.70108515,0.68812627,0.66809866,0.65068707,0.61598065,0.58139871,0.57878105,0.57609647,0.56914855,0.56478881,0.55969470,0.55595792,0.55844693,0.56022641,0.56502644,0.56744714,0.56702199,0.56194161,0.54579934,0.52812706,0.51212960,0.49351277,0.44639009,0.39612859,0.35565292,0.32113499,0.31061849,0.29980693,0.28919018,0.28089049,0.26008040,0.23897020,0.22682256,0.20983846,0.26634526,0.31988984,0.38988982,0.46519539,0.50629479,0.55579124,0.60685238,0.66205449,0.62543655,0.58258930,0.54053167,0.49314826,0.46573248,0.43332621,0.40582324,0.37720500,0.37579460,0.37603091,0.35729686,0.33372539,0.30725283,0.27489409,0.23776997,0.19968742,0.25243276,0.30097694,0.35514686,0.41008959,0.43749914,0.46057003,0.48743630,0.51283816,0.48935794,0.46937411,0.42520525,0.37863927,0.33286246,0.28811894,0.23410540,0.18090402,0.24535605,0.30437113,0.37204047,0.43953795,0.49002178,0.53987900,0.59145771,0.63713569,0.65389587,0.67497720,0.67210501,0.67211112,0.65553705,0.63664261,0.60340730,0.58075506,0.55911961,0.54384556,0.54253135,0.54253730,0.52480739,0.51012592,0.51649950,0.51899718,0.54020397,0.56183818,0.57985430,0.59871902,0.60756900,0.62306127,0.63367170,0.64882843,0.65083205,0.65136545,0.64275866,0.63111458,0.66828233,0.69934425,0.71569914,0.73863622,0.68969554,0.64108273,0.58892715,0.53452095,0.46054390,0.39001729,0.33879639,0.29415587,0.29577218,0.29801427,0.33117451,0.36779009,0.38786860,0.41678588,0.42768619,0.44238455,0.48230301,0.52091182,0.55381432,0.58086497,0.62585046,0.67508045,0.71062453,0.73861329,0.70804301,0.66603693,0.64528027,0.61620713,0.60559016,0.59730834,0.59860269,0.60024730,0.55120059,0.50035493,0.47145668,0.44099586,0.38383751,0.32781396,0.29560358,0.26444571,0.30196552,0.34301475,0.35913002,0.37904641,0.39026201,0.39417689,0.42021852,0.44236720,0.45299795,0.46937085,0.48412708,0.49184496,0.53655630,0.57630073,0.62906999,0.67667945,0.69133433,0.70548912,0.71359494,0.72691448,0.74805928,0.76843177,0.80014349,0.83555763,0.80054091,0.77567257,0.73174439,0.69487971,0.64773506,0.60413803,0.57414579,0.54187561,0.56609331,0.59937297,0.61328787,0.62661081,0.66162277,0.69189721,0.74378744,0.79272427,0.72947147,0.67509836,0.62435396,0.57836068,0.48530052,0.39595889,0.32407619,0.24194637,0.27499891,0.31380482,0.32425726,0.33664073,0.35519482,0.38243171,0.37974677,0.37255091,0.38666388,0.39190894,0.39443389,0.39328931,0.40947238,0.41845731,0.41176883,0.40682549,0.41228502,0.40983201,0.41870922,0.42755105,0.43980791,0.45129367,0.46606920,0.48828318,0.48717786,0.48569838,0.51316734,0.54137060,0.58760818,0.63378006,0.66792409,0.69880988,0.67179468,0.64556308,0.59121797,0.54175819,0.47677610,0.41332089,0.34867914,0.28021847,0.33669569,0.39604916,0.44251676,0.49025264,0.54156202,0.59102561,0.64761720,0.62106033,0.64818394,0.67789956,0.69993516,0.71763945,0.70832148,0.69185548,0.68152777,0.66637865,0.64710492,0.63385334,0.60245029,0.57113659,0.56274768,0.55231654,0.55115032,0.55005672,0.56346672,0.57493026,0.59513122,0.60967588,0.60578987,0.60808508,0.60884320,0.60651114,0.59771085,0.59237334,0.58632982,0.57867392,0.51974619,0.46987773,0.42481773,0.38319438,0.37288363,0.36320670,0.34039746,0.31917485,0.31062728,0.30384556,0.29825467,0.28635694,0.32095951,0.35828724,0.40142655,0.45169332,0.49642043,0.54397072,0.59542931,0.64465257,0.60292258,0.56685558,0.52055372,0.48254252,0.45876069,0.42857008,0.39725861,0.37396754,0.37722328,0.39004041,0.39155333,0.38870174,0.36074777,0.32939636,0.30060262,0.27974788,0.32811278,0.38463382,0.43931680,0.48964503,0.50399443,0.51977400,0.52796448,0.53894818,0.51375656,0.48988986,0.45308980,0.41764120,0.37623172,0.33222000,0.27654265,0.22073023,0.28665166,0.35147543,0.41673802,0.47610624,0.49883171,0.52459877,0.54008907,0.56304228,0.57962243,0.60215726,0.60546379,0.61370057,0.57031497,0.53569702,0.49787910,0.45737707,0.46425634,0.46739109,0.46556339,0.46714036,0.47766744,0.49442256,0.51282217,0.52872925,0.54180914,0.55200635,0.55828919,0.56251099,0.56435384,0.56198685,0.56027305,0.55241522,0.56311410,0.57232238,0.58046440,0.58900942,0.62088324,0.65172236,0.67863171,0.70131229,0.65560479,0.61274794,0.57163525,0.53035007,0.49319085,0.45662340,0.42731694,0.39641191,0.38104819,0.36563330,0.37049123,0.37478969,0.39402146,0.41685924,0.43001581,0.44545236,0.46552009,0.49327298,0.52085201,0.54736421,0.59267034,0.63662593,0.66462154,0.70103778,0.66225743,0.61959742,0.59256616,0.55891029,0.54865360,0.54058064,0.52559968,0.51249091,0.49668971,0.47931503,0.45967535,0.44383234,0.41210571,0.38660691,0.36997908,0.35579593,0.38113188,0.40676741,0.42350100,0.44579803,0.44016608,0.43418047,0.43242589,0.43630137,0.45619319,0.47634829,0.49223429,0.50499093,0.55979459,0.61294556,0.66665666,0.71777931,0.71588526,0.71951431,0.72135631,0.72544800,0.75409434,0.77323289,0.81280444,0.84274573,0.80249184,0.75725229,0.71892746,0.68275774,0.64484644,0.60428558,0.57134452,0.53534184,0.56391770,0.58829166,0.60394482,0.63036510,0.65944882,0.69232245,0.72530843,0.75461571,0.70837937,0.66119479,0.62373149,0.58000855,0.49214026,0.40681128,0.32626587,0.24064935,0.26054397,0.27935691,0.28087229,0.28623288,0.31324376,0.33638780,0.35251881,0.36358287,0.38215276,0.40468954,0.42614295,0.45592024,0.47175103,0.48172752,0.50019230,0.51452844,0.49648207,0.47676326,0.45696409,0.44443155,0.45304558,0.45883089,0.46955690,0.48501182,0.47837291,0.47029743,0.47177275,0.47381144,0.50862916,0.54722305,0.57367397,0.60245473,0.59648462,0.59922587,0.58387144,0.56558647,0.51411775,0.45993557,0.40962714,0.35033200,0.38985611,0.42849947,0.45723566,0.48745038,0.52754238,0.56749451,0.59720022,0.54001875,0.59272708,0.64003421,0.66343138,0.69437269,0.68516496,0.67339588,0.65984947,0.64079464,0.63156734,0.61481217,0.58418468,0.55758329,0.54479756,0.52675366,0.53521859,0.54475300,0.56806257,0.60051931,0.62844995,0.66182917,0.65260495,0.64502307,0.64688694,0.64686637,0.64905968,0.65036029,0.65807358,0.66192448,0.60174226,0.53497887,0.49266815,0.44124036,0.43139374,0.42436267,0.39672151,0.36380249,0.37126162,0.36988935,0.36196606,0.35921748,0.37507585,0.39058541,0.41404553,0.43773421,0.48702129,0.52859879,0.57478288,0.62340147,0.58087568,0.54444035,0.50749225,0.47219289,0.44880312,0.42446851,0.39086583,0.36299126,0.38063926,0.40424440,0.41942196,0.44473797,0.41248943,0.38117523,0.36717364,0.35694459,0.41425559,0.46981390,0.51900250,0.57582632,0.57964807,0.58298863,0.57394980,0.56190876,0.53947111,0.51841833,0.48561431,0.45066176,0.41219399,0.37931228,0.31671292,0.26077569,0.32857738,0.39783969,0.45470825,0.51540905,0.51042326,0.50778022,0.49545633,0.48285076,0.50950281,0.53406213,0.54389825,0.55493233,0.49409191,0.43236903,0.38702071,0.33726760,0.36574423,0.38760681,0.38646144,0.38807149,0.42916129,0.47474307,0.50806934,0.53645303,0.53685553,0.54617178,0.53429190,0.53002213,0.51424829,0.50272144,0.47902040,0.45687623,0.47568181,0.49036156,0.52269104,0.55179057,0.57474487,0.60261441,0.63397459,0.66480703,0.62789503,0.58837108,0.55715096,0.52231717,0.52273827,0.51744950,0.50476810,0.49856358,0.46132615,0.42757002,0.40500928,0.37954140,0.39952210,0.41607056,0.42934946,0.44892825,0.45358486,0.45652023,0.49085400,0.51620822,0.55949678,0.59887070,0.62705869,0.65758107,0.61399679,0.57429040,0.53542064,0.49735053,0.49284812,0.48258288,0.45598829,0.42128474,0.44077428,0.46133970,0.45589291,0.44701077,0.44398160,0.44112114,0.45120626,0.45342240,0.46013321,0.47047566,0.49268898,0.50854686,0.49431204,0.47868887,0.45405376,0.42431022,0.45068298,0.47901230,0.50082869,0.51829663,0.57925760,0.64308675,0.70319217,0.76134671,0.74573334,0.73321845,0.72774195,0.72629669,0.75161286,0.78124118,0.81817115,0.85675003,0.79680624,0.73842232,0.70898395,0.67716609,0.64144410,0.60517779,0.56990126,0.53399659,0.55636075,0.57466860,0.60407635,0.62605627,0.65730923,0.69145714,0.70687525,0.71531955,0.68133715,0.64935072,0.62005872,0.59038615,0.49799975,0.40783054,0.32266103,0.24220512,0.24410479,0.24668235,0.24070422,0.23503899,0.26490213,0.29908201,0.32358944,0.34591574,0.37770726,0.41049738,0.46225812,0.51648346,0.53105093,0.54798807,0.58389682,0.61769887,0.58083270,0.54164871,0.49684127,0.45625266,0.46311385,0.47167327,0.47749681,0.48500132,0.46493113,0.44779619,0.42511259,0.40443355,0.42991911,0.45671133,0.47646756,0.49889344,0.52382892,0.55682492,0.57163117,0.58770347,0.54956663,0.51164827,0.46551468,0.42138522,0.44015233,0.45255491,0.46999411,0.48347846,0.51687839,0.54462703,0.54046784,0.52733270,0.56562041,0.60490830,0.64324880,0.68274119,0.68013155,0.68665708,0.67967292,0.67880216,0.65182135,0.62309505,0.58511060,0.54686275,0.52551484,0.50505703,0.49598087,0.48127887,0.52676184,0.57170137,0.61666765,0.66250008,0.67686085,0.69196164,0.71493269,0.73428878,0.72372143,0.71799483,0.72141343,0.72124115,0.67520542,0.62406013,0.58823903,0.54304949,0.53064663,0.51901477,0.49169966,0.46242530,0.45589710,0.44229747,0.43740604,0.42710500,0.43556818,0.44283438,0.45873523,0.47158594,0.49893186,0.53324224,0.55927424,0.58521083,0.55767492,0.52729046,0.49389085,0.46877491,0.43381248,0.39908769,0.35981755,0.32374540,0.34962024,0.38353124,0.40509104,0.43090507,0.42375256,0.41727599,0.41874015,0.41140009,0.45619708,0.49776958,0.54220558,0.58744121,0.60277509,0.62081372,0.63420983,0.65175384,0.62218162,0.59769353,0.55651921,0.51962345,0.47652096,0.42243283,0.36811914,0.30580203,0.35494250,0.40373488,0.44947101,0.49746726,0.49350203,0.48960999,0.47313612,0.45317994,0.46010002,0.46568573,0.46833028,0.46356971,0.41165905,0.36361893,0.31812037,0.26866688,0.30038235,0.33743569,0.35903142,0.37910484,0.42465677,0.47110391,0.50777350,0.53829252,0.53158698,0.53247801,0.51606339,0.50698118,0.46820268,0.43202385,0.39726115,0.36996069,0.39832698,0.42237686,0.45801365,0.49274062,0.51962338,0.54059096,0.57965764,0.61655063,0.59666150,0.57578913,0.56214697,0.55341028,0.57088261,0.58588672,0.59518458,0.60767293,0.56159903,0.51624739,0.47814169,0.43460401,0.42328938,0.41213169,0.39187152,0.37644305,0.39937384,0.41605222,0.44714386,0.47864677,0.52035653,0.55198534,0.59021633,0.62600390,0.59101928,0.55528555,0.51804100,0.47975377,0.46534590,0.44741240,0.42391449,0.39756011,0.41949260,0.44950513,0.46413459,0.47287846,0.49282932,0.51284703,0.53467010,0.55789814,0.55576862,0.55713281,0.56382569,0.56348776,0.54367321,0.52333423,0.50084018,0.48604367,0.50818637,0.53326603,0.55778057,0.58512193,0.64070731,0.68891454,0.74339983,0.79078434,0.78044332,0.77320350,0.76695369,0.76767884,0.78810981,0.81130507,0.83424000,0.85934901,0.80374634,0.75111698,0.71664148,0.67777452,0.63675405,0.60149447,0.55171579,0.51063038,0.53304627,0.55674054,0.58366756,0.61142420,0.66217839,0.70647194,0.74514050,0.77998888,0.72342894,0.67031695,0.61545543,0.56026564,0.47056954,0.38692604,0.29810001,0.21182952,0.21469441,0.21568734,0.22289236,0.22138477,0.24970535,0.26827805,0.28781086,0.30158018,0.35616100,0.40833480,0.46701389,0.52472952,0.56464264,0.60064467,0.64877196,0.68690149,0.64193141,0.58995702,0.53840807,0.48144809,0.46584496,0.45258975,0.43969018,0.42082321,0.41800189,0.41785276,0.40503474,0.38919662,0.39757862,0.41292043,0.41943610,0.41978060,0.46126282,0.50727687,0.54598752,0.58165046,0.57061258,0.55026132,0.54109591,0.52465868,0.51977298,0.51826673,0.51202136,0.51051891,0.52062371,0.53229425,0.52773562,0.50719170,0.53673640,0.56593128,0.61643040,0.67169755,0.68603542,0.69862438,0.70145819,0.70585581,0.66835631,0.63526368,0.58518544,0.53783560,0.50399985,0.47906384,0.45506622,0.42936311,0.48798400,0.54833868,0.60290448,0.66421655,0.70064850,0.74150976,0.78251821,0.82220980,0.80695269,0.78828471,0.78256161,0.77837516,0.74883055,0.71857299,0.68244486,0.64733234,0.63013719,0.62000723,0.58687085,0.55848116,0.53832893,0.51812452,0.50743490,0.49639822,0.49611499,0.49742156,0.50039581,0.49511680,0.51609360,0.53194217,0.53918786,0.54564143,0.52894985,0.51293881,0.48649857,0.46093137,0.41873139,0.37723280,0.32950887,0.28411184,0.32026121,0.36042981,0.38547167,0.41879412,0.43829600,0.45978723,0.46558409,0.47128118,0.50270704,0.53154673,0.56077264,0.59337142,0.62615301,0.65962490,0.70210071,0.73904788,0.70591100,0.67939632,0.63715810,0.59485933,0.53269993,0.47737528,0.41613926,0.35920250,0.38229055,0.41266755,0.44898866,0.47614654,0.47255570,0.46767640,0.44700545,0.42371804,0.41627154,0.40506715,0.38979423,0.37503094,0.33577787,0.29683203,0.24634379,0.19189050,0.24469048,0.29486535,0.33141022,0.36876680,0.42415402,0.47535510,0.51111419,0.54158575,0.53077467,0.51705148,0.50111356,0.48617207,0.42325951,0.35543381,0.31833589,0.27737656,0.31640648,0.35748239,0.39756878,0.43590824,0.45996657,0.48201797,0.52559419,0.56895270,0.56741002,0.56675382,0.57193929,0.58398834,0.61719801,0.65082171,0.68677272,0.72324793,0.66404845,0.60602341,0.54652141,0.48667967,0.45190598,0.41036124,0.36058890,0.30720878,0.33954059,0.37676666,0.40817538,0.44772788,0.48113085,0.51023515,0.55166862,0.59078512,0.56471990,0.54005303,0.49926991,0.46370205,0.44153066,0.41079418,0.38802832,0.36521187,0.40484860,0.44234657,0.47148224,0.49393952,0.53839717,0.58016131,0.62519148,0.66443122,0.65376531,0.63908399,0.63465012,0.62422403,0.59378445,0.56657040,0.55429435,0.54232505,0.56204844,0.58100108,0.61855934,0.65191964,0.69363285,0.73554282,0.78262536,0.82388174,0.81232702,0.80556425,0.80825495,0.81133550,0.82519485,0.83624734,0.85124658,0.86770703,0.81590614,0.76422324,0.72433020,0.67924584,0.63633083,0.59664220,0.53633393,0.48215867,0.50520158,0.53204055,0.56816000,0.59872916,0.66241197,0.72881912,0.78503151,0.84313965,0.76161353,0.69010940,0.61168611,0.53326719,0.44502280,0.36431690,0.27444539,0.18415885,0.18382220,0.18645691,0.20228097,0.20792935,0.22691378,0.24247626,0.25453452,0.25936080,0.33640729,0.40669001,0.47278115,0.53667578,0.59750980,0.65581621,0.70896967,0.76404658,0.70434163,0.64321753,0.57669975,0.50718009,0.46938871,0.43241468,0.39655327,0.36250866,0.37907387,0.39095933,0.37822664,0.36596680,0.36698309,0.36247532,0.35294453,0.34517036,0.40413457,0.45787633,0.52252482,0.58315969,0.58513088,0.59144770,0.61396326,0.63105420,0.60284348,0.57770136,0.55270628,0.52914566,0.53080727,0.52803100,0.51952587,0.48372852,0.51874119,0.55431444,0.59953209,0.64243235,0.67641324,0.70822383,0.72818165,0.75314713,0.69286381,0.63310979,0.56699254,0.50776397,0.46386979,0.42677934,0.39335641,0.36165097,0.44461886,0.52291997,0.60005006,0.67810709,0.72779720,0.78205260,0.83985037,0.89351470,0.87947838,0.85566291,0.85476250,0.84768925,0.81664568,0.78477972,0.76332495,0.74116437,0.72367565,0.70208911,0.68320440,0.66336239,0.63940526,0.61211286,0.58961076,0.57284788,0.55883959,0.55164142,0.54393640,0.54189601,0.54138410,0.54427361,0.53693581,0.52997451,0.50746983,0.48454190,0.46497601,0.44424482,0.39751566,0.34935280,0.30492991,0.25331473,0.29432184,0.33992903,0.37261822,0.40935205,0.43940254,0.47277498,0.50497023,0.53020425,0.55114056,0.56870269,0.59384900,0.61549410,0.66845936,0.71781470,0.77635481,0.83452995,0.78802467,0.74570702,0.69792470,0.65041408,0.58204113,0.51239018,0.44964780,0.38296138,0.40943894,0.43707227,0.46186708,0.49240818,0.47370770,0.45608957,0.42573344,0.39777687,0.37296583,0.33702864,0.30491811,0.27171492,0.24219647,0.20674456,0.15907491,0.10534182,0.18260245,0.25299030,0.31507722,0.37070226,0.42030336,0.46602422,0.50374254,0.55339844,0.52783418,0.50250687,0.48115515,0.45961280,0.38759921,0.30907268,0.24279633,0.16882200,0.21745270,0.26659688,0.31349132,0.36428805,0.40100770,0.44141913,0.48047789,0.51588868,0.53285936,0.54710539,0.56726020,0.59134423,0.65528383,0.71812302,0.78150088,0.84200939,0.76183739,0.68889425,0.62067952,0.55811803,0.47486585,0.39277307,0.31453359,0.23428866,0.28043439,0.32787258,0.35810066,0.39501530,0.43480727,0.47728071,0.52490546,0.57231403,0.54364337,0.51825197,0.48010435,0.44322662,0.41548192,0.38486893,0.35170548,0.32756880,0.37773001,0.43228576,0.47873818,0.52403370,0.58347656,0.64933376,0.71526788,0.79063670,0.75746624,0.73054746,0.70787456,0.68094718,0.65670807,0.62977695,0.60329699,0.57913938,0.60772422,0.64109281,0.68187926,0.71421820,0.74874234,0.77999085,0.81896597,0.86535385,0.85117561,0.84536473,0.84950436,0.85366771,0.85852428,0.86014691,0.86888847,0.87436326,0.81935577,0.76152762,0.72115282,0.68425640,0.62825737,0.57728710,0.51756091,0.45847008,0.49250776,0.51679872,0.55627806,0.58428193,0.66388717,0.74527331,0.82114249,0.88961646,0.79521067,0.69320323,0.59227139,0.49412109,0.41156259,0.33424139,0.24494106,0.15272681,0.16540838,0.17498562,0.18607807,0.19393063,0.20384037,0.21882934,0.21718508,0.22288767,0.31075508,0.39953302,0.48832865,0.57449262,0.63883619,0.70234132,0.77437385,0.84512469,0.76836832,0.69682389,0.62591093,0.55174244,0.49389054,0.43351228,0.37602893,0.31433418,0.33878407,0.35980601,0.36258528,0.36704209,0.34017061,0.31031925,0.28213483,0.25893350,0.33983630,0.41625828,0.50416500,0.59175846,0.62533743,0.65522723,0.70131090,0.73757776,0.68504063,0.63690050,0.59194489,0.54844442,0.53857960,0.52915994,0.50561901,0.46418420,0.50352751,0.54649054,0.58592964,0.62136486,0.67102660,0.72094000,0.75618505,0.80159976,0.71431142,0.62564013,0.55052987,0.47251161,0.42897429,0.37652302,0.33951684,0.29417927,0.39587034,0.50183747,0.59575379,0.69638339,0.75688344,0.82164866,0.89472333,0.97395625,0.95031084,0.92848703,0.92294192,0.91788676,0.88306715,0.84545636,0.84130354,0.83529202,0.81273771,0.79155018,0.78194854,0.77224727,0.73993585,0.70692408,0.67184874,0.64339462,0.62320302,0.60145066,0.59158870,0.58232524,0.56874617,0.55260082,0.52994847,0.50723492,0.48308171,0.46273020,0.44802549,0.43356486,0.37522126,0.32316230,0.27406144,0.21894045,0.27106162,0.32099534,0.35794684,0.39503872,0.44343773,0.49353136,0.54264494,0.58916455,0.59785770,0.59817003,0.62131781,0.63439491,0.70073560,0.76661877,0.84744501,0.92755739,0.87320291,0.82111639,0.76574508,0.71688457,0.63290925,0.54433921,0.48365076,0.41401094,0.43755599,0.45887252,0.47900971,0.50522490,0.47089899,0.44211155,0.40834439,0.37390596,0.32462969,0.27267693,0.22345009,0.16684593,0.14675477,0.12508606,0.06887618,0.01795100,0.11484940,0.21603192,0.29401054,0.37638493,0.41164706,0.45109082,0.50550768,0.55918333,0.52468706,0.49058235,0.46511294,0.44197922,0.35104318,0.25759692,0.16216958,0.06489884,0.12147318,0.17708899,0.23572511,0.29396231,0.34341541,0.39957324,0.43290949,0.46937381,0.49938033,0.52910748,0.56236908,0.59538137,0.69029973,0.78553100,0.87074708,0.95995590,0.86406158,0.77114296,0.69708659,0.62876865,0.50412251,0.37800543,0.26972316,0.16066599,0.22119416,0.27660926,0.30632417,0.34256719,0.39198101,0.43540779,0.49242160,0.55304010,0.52211469,0.49364651,0.45956311,0.42602257,0.38913392,0.35209540,0.31954478,0.28541963,0.35534001,0.42454408,0.48985428,0.55379296,0.63241447,0.70900209,0.80783592,0.91187821,0.86714405,0.81897956,0.78077246,0.74536413,0.71700377,0.69332131,0.65142044,0.61619140,0.65982130,0.70896570,0.74136566,0.78316543,0.80079028,0.82198835,0.86474006,0.90785649,0.88992288,0.87659341,0.88509754,0.89845892,0.89002803,0.88731102,0.88340655,0.88192792,0.82046745,0.75955060,0.72657185,0.68866703,0.62616345,0.56088188,0.49915932,0.43757149,0.47103255,0.50102846,0.53757862,0.57190302,0.67250612,0.76792098,0.85299409,0.94244155,0.82243761,0.70468632,0.57467461,0.44964824,0.38302063,0.31032371,0.21174116,0.11723887,0.14251913,0.16134124,0.17295506,0.18221572,0.18520624,0.18795562,0.18765635,0.18434071,0.29004090,0.39156153,0.50254331,0.61648252,0.68110208,0.75094037,0.83846099,0.93110032,0.84129128,0.74807808,0.67224255,0.59155984,0.51116524,0.43598182,0.35151546,0.26762351,0.29618960,0.32676043,0.34466363,0.37041316,0.31189274,0.25385403,0.21350469,0.17273606,0.27146878,0.37067178,0.48278792,0.59885432,0.66093635,0.72195911,0.78553317,0.85001597,0.77321475,0.69140695,0.62738891,0.55920465,0.54371777,0.53060363,0.49663126,0.47299767,0.50240492,0.53556752,0.55932935,0.57905832,0.61238439,0.64674781,0.68058644,0.71243650,0.65357730,0.60163852,0.55729582,0.51017370,0.46875252,0.43229337,0.40006486,0.36069302,0.44841864,0.52750602,0.60330056,0.67593565,0.73452321,0.79111159,0.84278498,0.89272410,0.88554938,0.87601476,0.85752040,0.84364335,0.81810701,0.79587841,0.78953485,0.78302511,0.76111004,0.73750911,0.72451766,0.71851532,0.68417599,0.64872839,0.60833033,0.57642946,0.57578576,0.57394928,0.58061313,0.59086010,0.57987119,0.57685247,0.56941330,0.55802006,0.53221332,0.50778340,0.48218312,0.45279387,0.41760678,0.38276947,0.35027918,0.31889273,0.35226402,0.39067995,0.41349128,0.43592946,0.48454234,0.53028586,0.58171050,0.62451608,0.63251886,0.63711688,0.64368442,0.64562000,0.70263632,0.75303657,0.81408408,0.86783857,0.82977531,0.78338753,0.75085559,0.72436985,0.64712406,0.56813178,0.51421504,0.45470694,0.46205098,0.46206570,0.46433770,0.46946976,0.44052104,0.41997406,0.38281441,0.35304464,0.31679261,0.28505946,0.25089961,0.21490538,0.19486291,0.17649717,0.13765532,0.10248629,0.16982514,0.24159743,0.31061562,0.37988734,0.42412676,0.47227309,0.52835213,0.58221704,0.54661517,0.51422327,0.48583280,0.45335111,0.37050324,0.28612215,0.20801128,0.12819387,0.18425492,0.23248834,0.28863275,0.34270732,0.37630761,0.41669669,0.44952049,0.48507165,0.52386024,0.56199890,0.59012396,0.62416378,0.69398336,0.76954844,0.82938520,0.89190245,0.81259068,0.73230631,0.66761456,0.61029481,0.49737708,0.39478615,0.29264607,0.18850274,0.23016384,0.26957259,0.29898571,0.32200430,0.38069186,0.44191252,0.49576303,0.54943811,0.52414210,0.49858996,0.47872290,0.45813619,0.43392028,0.41155501,0.38587047,0.35559308,0.41504428,0.46788930,0.51357493,0.56064645,0.62471914,0.68750820,0.75244858,0.81757611,0.78701546,0.75272886,0.72306338,0.68647527,0.66918781,0.65108045,0.61358284,0.57195132,0.61860695,0.66078927,0.70439523,0.75068119,0.77897346,0.80751286,0.83834290,0.87464313,0.87691561,0.87852538,0.88142058,0.88694547,0.87882949,0.87176481,0.86839163,0.86023536,0.81335559,0.76481052,0.71758001,0.67398971,0.61724345,0.56240121,0.51300116,0.46555587,0.49080559,0.51304867,0.54704316,0.58085760,0.64951438,0.72179206,0.78455806,0.85197935,0.75863431,0.66959690,0.57039863,0.47815219,0.41038286,0.34728198,0.26885623,0.18514814,0.19607050,0.21008407,0.21831578,0.23189446,0.24112870,0.24582232,0.25412193,0.26419459,0.33772330,0.41860080,0.50546523,0.58778836,0.65409813,0.72042295,0.79037335,0.85827023,0.78178826,0.71444643,0.64989121,0.58685077,0.53372945,0.48127950,0.41728493,0.36188719,0.36767574,0.36925492,0.37682851,0.38269756,0.35201829,0.31206081,0.28555408,0.25458853,0.32547066,0.39196928,0.46897967,0.55174270,0.59579576,0.64231972,0.68561743,0.72620258,0.67739487,0.63139202,0.58753265,0.54130455,0.53017942,0.51210443,0.49417349,0.48164372,0.50280346,0.52597482,0.53085269,0.54160736,0.56034317,0.58123498,0.60212547,0.61943128,0.59827960,0.57587932,0.55873016,0.54355801,0.51664985,0.48459350,0.46200934,0.42983139,0.49409143,0.56216239,0.61206748,0.66014928,0.71018663,0.75626340,0.78535394,0.81816805,0.81964935,0.82322455,0.79771714,0.76735664,0.75952581,0.74879245,0.74178157,0.73396626,0.70736192,0.68150392,0.66865123,0.66290153,0.62668239,0.58816493,0.55168226,0.50691618,0.52672703,0.54436066,0.57082591,0.59629849,0.59946183,0.60279003,0.60775113,0.60738368,0.58114732,0.55865043,0.51937383,0.47683323,0.46085241,0.44642302,0.42969578,0.41359865,0.43334231,0.46076532,0.46397470,0.47429411,0.52367313,0.57256363,0.61732008,0.66438552,0.67193172,0.67795188,0.66769538,0.65814898,0.69978995,0.73978937,0.77969161,0.81443270,0.78488668,0.74676652,0.74429357,0.73605169,0.66379913,0.59290997,0.54509662,0.49599367,0.48427920,0.47033003,0.45023580,0.42776114,0.41117526,0.39527934,0.36134429,0.32975379,0.31120577,0.29573457,0.28023604,0.26478075,0.25089461,0.23545935,0.20664280,0.19004988,0.22320798,0.26344740,0.32740613,0.38491217,0.43859327,0.49571973,0.54915046,0.59966610,0.56888648,0.53825561,0.50294727,0.47216786,0.39115925,0.31233053,0.25465007,0.19102351,0.24381283,0.29171023,0.34179337,0.38623211,0.40937179,0.42943903,0.46469210,0.49512631,0.54443491,0.59914356,0.62256672,0.64619376,0.70088679,0.75329177,0.78646694,0.81961439,0.75567235,0.68944831,0.63953383,0.59235016,0.49680584,0.40518644,0.31145144,0.21255805,0.23727429,0.26175153,0.28417645,0.29988892,0.37281035,0.44879671,0.49589188,0.54689071,0.52438787,0.50523489,0.49729655,0.48612542,0.47642815,0.46371834,0.44479738,0.42823615,0.47087369,0.51589548,0.54277539,0.57097470,0.62006940,0.67193028,0.70205577,0.72877457,0.70906391,0.69264578,0.66577108,0.63087077,0.61953592,0.61213875,0.57194496,0.53320886,0.57265996,0.61477676,0.67252311,0.72680563,0.75693802,0.79320761,0.81422913,0.83713815,0.86075499,0.88264877,0.88007528,0.87858986,0.86864729,0.86045519,0.84625254,0.83511135,0.79721530,0.76450845,0.71169567,0.66445935,0.61547590,0.56800105,0.53502687,0.49768976,0.51185528,0.52791525,0.56252126,0.59496284,0.63677813,0.67630715,0.71663256,0.76142497,0.69756746,0.63529612,0.56958878,0.50116884,0.44388812,0.38857517,0.31656960,0.25210726,0.25159097,0.25348675,0.27078451,0.28502881,0.29777684,0.30852601,0.32564430,0.33755706,0.39314057,0.44183489,0.50185182,0.56201732,0.62728886,0.69665847,0.73802374,0.78327192,0.72825885,0.67471965,0.62597824,0.57826918,0.55296473,0.52768952,0.49076324,0.45202699,0.43270152,0.41599229,0.40747035,0.40079082,0.38410128,0.37394032,0.35396758,0.33831089,0.37479303,0.40596007,0.46011317,0.51152153,0.53486293,0.56051737,0.58557255,0.60768972,0.59159252,0.56703316,0.54841122,0.52214669,0.51061644,0.49469923,0.49038145,0.48838106,0.49665191,0.50409487,0.49849289,0.48738437,0.50222271,0.51545141,0.52555222,0.53058124,0.53918312,0.53736268,0.55406030,0.56986651,0.55798820,0.54260751,0.52434092,0.51341175,0.54798444,0.58123644,0.62388594,0.66724117,0.69445797,0.72490185,0.75025563,0.77129197,0.76405136,0.75160507,0.73624606,0.71962827,0.71088354,0.69866535,0.68711423,0.67689865,0.65597451,0.63542756,0.62098543,0.60876345,0.56989913,0.52503436,0.49185296,0.45821575,0.50071373,0.53898646,0.57906917,0.61704257,0.62409865,0.63089228,0.64467999,0.65439636,0.62028134,0.58249689,0.54320613,0.50017987,0.49705790,0.49958704,0.49918034,0.49663248,0.51092603,0.52477997,0.51485842,0.51581243,0.56034699,0.60932445,0.66104841,0.71157422,0.70307131,0.69378729,0.67702588,0.66074923,0.68649307,0.71323090,0.73995406,0.76040633,0.75060351,0.73924903,0.74150584,0.74015844,0.68042377,0.62863363,0.56984431,0.52004163,0.49650156,0.47566514,0.44256084,0.40961125,0.38960717,0.37509707,0.34083096,0.31292319,0.30941737,0.31276139,0.30803124,0.31027703,0.29174935,0.27446416,0.26204288,0.24715845,0.27968014,0.31123702,0.34998612,0.39010644,0.45305867,0.51192541,0.57782647,0.64247555,0.59902366,0.56265072,0.52318727,0.48518975,0.42003785,0.36223297,0.31007032,0.25677794,0.29453302,0.34260911,0.38805063,0.42930692,0.45302608,0.47442788,0.49455734,0.52167062,0.56232528,0.60743643,0.64629222,0.68099621,0.70473580,0.72830367,0.74887443,0.76901179,0.71554195,0.66127558,0.61681620,0.57514083,0.48742868,0.39811402,0.32260375,0.25099779,0.26287837,0.27773513,0.28228672,0.28097030,0.35120058,0.42082181,0.48346111,0.54762277,0.53419547,0.52627265,0.52464858,0.52662955,0.52354376,0.51135641,0.50798672,0.50200711,0.52324217,0.54933373,0.56916906,0.59077666,0.60613196,0.62874000,0.64142939,0.65367912,0.63503986,0.61874636,0.61016632,0.60326446,0.58153175,0.56105418,0.53168800,0.50774989,0.55131645,0.59465342,0.63892871,0.68297458,0.72330334,0.76348578,0.79139708,0.81720207,0.83798692,0.85403457,0.86859953,0.89011931,0.87829088,0.86494621,0.84598151,0.83545302,0.79132729,0.75122723,0.70049964,0.65696370,0.61193356,0.57353009,0.54812849,0.51566772,0.53197809,0.54204818,0.56767065,0.59229048,0.61082695,0.63149194,0.64599169,0.67106902,0.63654625,0.60142637,0.56319245,0.51591597,0.46937171,0.41849619,0.36123928,0.30204544,0.31020265,0.31813805,0.31934434,0.32453633,0.34481258,0.36880277,0.39265508,0.41967849,0.44982807,0.48593870,0.52053492,0.55583514,0.60560297,0.65625072,0.69668210,0.73244456,0.68738462,0.64124953,0.60728534,0.56442829,0.56453441,0.56951096,0.55331592,0.54269661,0.50645210,0.47413369,0.44352426,0.41879696,0.41775826,0.41559096,0.41333701,0.41934381,0.41861374,0.42188165,0.44785155,0.46954737,0.48301165,0.48960940,0.49931777,0.50003022,0.50248384,0.49723860,0.50259471,0.49983897,0.49722114,0.50016264,0.49508349,0.49533185,0.49274852,0.49247944,0.46367033,0.42818657,0.44606225,0.45748111,0.44781525,0.44494786,0.47712927,0.50032704,0.54967003,0.60488344,0.59811434,0.60019100,0.59650096,0.59259804,0.59677494,0.60409388,0.63709332,0.66924224,0.67672749,0.69269083,0.70866061,0.72705610,0.70434221,0.68471778,0.68166212,0.67351530,0.66414051,0.65399897,0.63569469,0.61875808,0.60382841,0.59242857,0.57616901,0.56238693,0.51349252,0.46337317,0.43797025,0.41037227,0.46727936,0.52975714,0.58084104,0.63913853,0.64953990,0.66343803,0.68710379,0.70720736,0.65597831,0.60924183,0.56334182,0.51564866,0.53707523,0.54911765,0.56693564,0.58802793,0.58724701,0.58834346,0.56880491,0.55009871,0.59978662,0.64925586,0.70576573,0.76172914,0.73966467,0.71769525,0.68518772,0.65661756,0.67097647,0.68844838,0.70254673,0.71092120,0.72226032,0.72932855,0.73501587,0.74870760,0.70127248,0.66291329,0.60153335,0.53702874,0.51141328,0.48673301,0.43880293,0.38473223,0.37170483,0.36048548,0.32449774,0.28891338,0.30463141,0.32489314,0.33532125,0.35394033,0.33013417,0.30779033,0.30962137,0.31120866,0.33239598,0.35725485,0.37317674,0.38915648,0.45863805,0.52855392,0.60691699,0.68407259,0.63361817,0.58271257,0.54320137,0.49903894,0.45072702,0.40296685,0.35838849,0.31372494,0.34892020,0.38528847,0.43456931,0.47777379,0.49424334,0.51430962,0.52662309,0.54045606,0.58009850,0.61550093,0.66549842,0.72037527,0.71186274,0.70529267,0.71263681,0.71471430,0.67305277,0.62899404,0.59390203,0.56089565,0.47683354,0.38991474,0.33732405,0.28522136,0.28661596,0.28861901,0.27392129,0.26191059,0.33152408,0.39037057,0.47524148,0.55784003,0.54748117,0.53678867,0.55148172,0.56949610,0.56737329,0.56337566,0.56730869,0.56780227,0.57804021,0.58423929,0.59604872,0.61050068,0.59975040,0.58546670,0.58076701,0.57323883,0.55910833,0.54439681,0.55651763,0.57316643,0.53794790,0.50840287,0.49182988,0.47510452,0.52451222,0.57221198,0.60568204,0.64613835,0.68779301,0.73549607,0.76675780,0.79637513,0.80964647,0.82461736,0.86174756,0.89997527,0.88013529,0.86667259,0.84558076,0.83172594,0.78310305,0.74229720,0.69226991,0.64582462,0.61281459,0.57239891,0.55664522,0.54319647,0.54631482,0.55674447,0.57575150,0.59749301,0.59082932,0.58388780,0.58283442,0.57758650,0.57521481,0.57175257,0.55336779,0.53806246,0.48968341,0.44403858,0.39885427,0.34911379,0.36659598,0.37510612,0.36819058,0.36295371,0.39263756,0.42415023,0.46206788,0.49860170,0.51099924,0.53096270,0.53702710,0.54856030,0.58749311,0.62471304,0.65071567,0.67366078,0.64477182,0.60863269,0.57803912,0.54857157,0.58397839,0.61464325,0.62213488,0.63579185,0.57992516,0.53046457,0.48428034,0.43049514,0.44536559,0.45127674,0.47747565,0.50368145,0.47102624,0.43723153,0.43633762,0.42726147,0.42346816,0.42576332,0.41112289,0.39306645,0.40997482,0.42627662,0.45600786,0.47858097,0.48815126,0.49863677,0.49993410,0.55784862,0.53896661,0.51979828,0.48770823,0.45396521,0.43462464,0.41727442,0.38684209,0.36330247,0.40967491,0.44858367,0.50864354,0.57157196,0.59035786,0.61182918,0.63400253,0.66173185,0.65029405,0.63939658,0.63311767,0.62700267,0.63807568,0.64109676,0.63991944,0.63771503,0.62334025,0.60812896,0.60110857,0.59711176,0.58762966,0.57307692,0.56543055,0.55489299,0.53517998,0.52005739,0.50442013,0.48506623,0.44775498,0.40266967,0.38079008,0.34869892,0.41243426,0.47670220,0.54469813,0.61431547,0.64398961,0.68225975,0.72464865,0.77008449,0.72753843,0.68168781,0.63950964,0.60507128,0.61536399,0.62522193,0.63485697,0.64708638,0.64989735,0.65337526,0.64791563,0.64023078,0.67444520,0.71257952,0.75214413,0.80007331,0.77661538,0.74729199,0.71927812,0.68404359,0.68767532,0.69113704,0.70037991,0.70867631,0.70781958,0.71135379,0.71898896,0.72993425,0.71281776,0.69331314,0.66288560,0.62985254,0.58302265,0.53544113,0.47786449,0.41425200,0.37786764,0.33559311,0.29345974,0.25122789,0.27474215,0.29811174,0.31540881,0.34015227,0.33448520,0.33166969,0.34088153,0.34287491,0.36891282,0.38951548,0.41178667,0.42755921,0.48537110,0.54932821,0.61246225,0.67805688,0.63824664,0.59926517,0.56076969,0.51645388,0.48504572,0.44750248,0.41423721,0.38289762,0.41507487,0.44189824,0.46872818,0.49892421,0.52511065,0.54989318,0.56432602,0.58197108,0.60709327,0.63191804,0.66479052,0.70473121,0.68929236,0.67920448,0.67460329,0.67165724,0.63890343,0.60501482,0.56665166,0.52344845,0.45281282,0.38379563,0.31528083,0.24851288,0.26387252,0.27997408,0.28560879,0.29786087,0.34131454,0.39123252,0.44832314,0.50565564,0.51733883,0.53540694,0.56007616,0.58686555,0.60925060,0.62640323,0.64685648,0.66220904,0.64688967,0.62673065,0.61708339,0.60867394,0.57717650,0.53552611,0.50363061,0.46936231,0.46784500,0.46293211,0.47731671,0.48506834,0.47001330,0.44860637,0.43341505,0.42117221,0.47364062,0.52588592,0.56783893,0.61795973,0.66942783,0.72416834,0.77470789,0.82071054,0.83006904,0.83604314,0.85858736,0.87327087,0.86654855,0.85643748,0.85083226,0.83642840,0.79661651,0.75397200,0.70699628,0.66267934,0.62541239,0.59470444,0.56674106,0.53734136,0.53594235,0.53463256,0.54867896,0.56481483,0.54391538,0.52115011,0.50271885,0.49005021,0.50433944,0.51414915,0.50842612,0.50889658,0.49421074,0.48277387,0.46179597,0.45012617,0.44853165,0.44570328,0.43112122,0.42172781,0.44919335,0.47111803,0.49542249,0.51820429,0.53207164,0.54665237,0.54925236,0.55921949,0.58138151,0.60707671,0.62495558,0.64611294,0.63226126,0.62548060,0.60987216,0.59440503,0.62335272,0.66082223,0.67874438,0.69409408,0.64731565,0.60318817,0.56399855,0.52464086,0.52403547,0.51572957,0.51656382,0.52623556,0.48927011,0.46190687,0.43489610,0.40820365,0.38713054,0.36800276,0.33751063,0.30424821,0.33877711,0.37394584,0.40994533,0.44673482,0.47758685,0.51176477,0.53503632,0.61630652,0.58482697,0.54984926,0.51084571,0.47196397,0.42462896,0.37034481,0.32941190,0.28149136,0.33638842,0.39238998,0.46982692,0.54675567,0.58522828,0.62133850,0.67532451,0.73131846,0.69955913,0.67694356,0.63461168,0.58613347,0.59180158,0.59293898,0.56937915,0.54943869,0.54243946,0.52631508,0.52565390,0.52602970,0.50745749,0.49190764,0.49414313,0.49393418,0.46894325,0.44299098,0.42489698,0.41098997,0.37886384,0.34366464,0.31831522,0.29410779,0.35737466,0.42333494,0.50791702,0.59195915,0.64248164,0.70025624,0.76872210,0.83496322,0.79400138,0.75190568,0.71898902,0.69004708,0.69646930,0.70181011,0.70969170,0.71018031,0.71684897,0.71742580,0.72362265,0.72943175,0.74592293,0.76860258,0.80548065,0.84157565,0.80902454,0.78501209,0.74900078,0.71119267,0.70655743,0.69726452,0.69674561,0.70330583,0.69523972,0.69024016,0.70059035,0.70691017,0.71525919,0.72878935,0.71925837,0.71979790,0.65020052,0.58589881,0.51651171,0.44660403,0.38279857,0.31806015,0.26442209,0.20521273,0.23639132,0.26789479,0.29349919,0.32339759,0.33946967,0.35638730,0.36598003,0.37715686,0.40072569,0.42797822,0.44443776,0.46835471,0.51905173,0.56640484,0.61629688,0.67262799,0.64389646,0.61818059,0.57635782,0.53008611,0.51462454,0.48984735,0.47723904,0.45553387,0.47625978,0.49623367,0.51337308,0.52613071,0.55576209,0.58350655,0.59899796,0.62364377,0.63754796,0.64937204,0.66854642,0.68714647,0.66702391,0.65114099,0.64238777,0.62778212,0.60511110,0.57998027,0.53747994,0.48844779,0.42912695,0.37536803,0.29216930,0.20536489,0.24478599,0.27882602,0.30290584,0.32787839,0.35498068,0.38880734,0.42031142,0.45493345,0.49211900,0.53275980,0.56909729,0.60739081,0.64750852,0.68684663,0.72159971,0.75827148,0.71668259,0.66904834,0.64261005,0.61390398,0.55314607,0.48990762,0.42615320,0.36488758,0.37783723,0.38236049,0.39271298,0.40447892,0.39911943,0.38906424,0.38332718,0.36854058,0.42326244,0.47834694,0.53154404,0.58441856,0.64878611,0.70767214,0.77604774,0.84533383,0.84443977,0.84237864,0.84546386,0.85076672,0.85216108,0.85287957,0.84663549,0.84692316,0.80119008,0.76477532,0.71704626,0.67666613,0.64261754,0.61566076,0.57340162,0.53150871,0.51897432,0.50882360,0.51853465,0.53398517,0.49497337,0.45416742,0.42781995,0.40217304,0.43218426,0.46590312,0.47186973,0.47327631,0.49385319,0.51333091,0.53016023,0.54351721,0.52779646,0.50855412,0.49504206,0.47683145,0.50226655,0.52172132,0.52785791,0.53608901,0.54768887,0.55969529,0.56372872,0.56427617,0.57964179,0.59540460,0.60957234,0.61547177,0.62494547,0.63612981,0.63485300,0.63057763,0.66879950,0.70601890,0.73087809,0.74928682,0.71538522,0.67117239,0.65033145,0.62245845,0.60175682,0.58038597,0.56094198,0.54731387,0.51499831,0.48172392,0.43236544,0.39054997,0.34928415,0.30800797,0.26613651,0.22153649,0.26760890,0.32088963,0.36754357,0.41713189,0.46910777,0.52682645,0.57450536,0.68387273,0.63534274,0.58700062,0.54357997,0.49802359,0.42298993,0.34448734,0.27459280,0.19825628,0.28171273,0.35353309,0.42955851,0.50757700,0.58046496,0.64566513,0.72203088,0.79840133,0.74064608,0.69022923,0.62551100,0.56396458,0.54853391,0.52847333,0.50587089,0.48656673,0.47637343,0.46172003,0.44952493,0.43824385,0.43996201,0.44228291,0.44356471,0.44510666,0.41226661,0.37636869,0.35010018,0.32553605,0.29725380,0.26171816,0.24290339,0.21763670,0.29540792,0.38095884,0.47256821,0.55852580,0.63720952,0.71796294,0.80168415,0.88954213,0.85522692,0.81456503,0.78331128,0.75504602,0.76433995,0.76873882,0.77819643,0.79252000,0.78923010,0.78293084,0.79212680,0.79591418,0.81420253,0.82739928,0.85378705,0.88129064,0.84492879,0.81001006,0.77072041,0.73862181,0.72143480,0.69952899,0.68930457,0.67945589,0.68083888,0.67595530,0.68743231,0.69722082,0.72283951,0.75565089,0.77767818,0.80433311,0.71642536,0.63084152,0.54416059,0.45588934,0.38323702,0.31261275,0.24201521,0.16659458,0.20661900,0.25451617,0.28698635,0.31908152,0.34174333,0.36400961,0.39123406,0.41382265,0.43835739,0.45412553,0.47593073,0.49619648,0.53705355,0.57591513,0.62059824,0.66962163,0.64910074,0.62597793,0.59483900,0.56876521,0.55562258,0.54720623,0.53475378,0.52662897,0.53005071,0.53500825,0.54050584,0.54843115,0.58065013,0.60995476,0.62836250,0.64671619,0.65219886,0.65730948,0.66730917,0.68096674,0.65727674,0.63097731,0.61501219,0.60387156,0.57265145,0.54578684,0.51718361,0.48297876,0.40917859,0.33623642,0.26117902,0.18041763,0.22011175,0.26100579,0.29953118,0.33822980,0.35448572,0.37169264,0.39036656,0.40928943,0.45920910,0.51412845,0.56823551,0.62691177,0.68166580,0.74223971,0.80129535,0.86013461,0.79300401,0.72566068,0.67176445,0.61234522,0.52578060,0.44309082,0.35839861,0.27508150,0.28835476,0.29829070,0.31516049,0.33165103,0.33181785,0.32898172,0.33094347,0.33150873,0.38982152,0.44507717,0.49666893,0.54672498,0.62940909,0.70873859,0.79685809,0.88105344,0.86448239,0.85545001,0.85214181,0.84559891,0.84297363,0.84234400,0.84648085,0.84793830,0.80421115,0.76369069,0.72374654,0.68744320,0.64671903,0.60447621,0.56425117,0.53107828,0.51033292,0.49268197,0.50002912,0.49738339,0.45610401,0.41029568,0.36843133,0.32199340,0.36580245,0.41182052,0.43211793,0.45633842,0.50653229,0.55709393,0.60058973,0.64718920,0.61680668,0.58316449,0.55905224,0.53037504,0.54493019,0.55355172,0.56249142,0.56977264,0.57950354,0.58405579,0.58793637,0.59267024,0.59640883,0.60134023,0.59796424,0.59156686,0.61470031,0.64148324,0.66259751,0.67688922,0.71703959,0.75178921,0.79515234,0.84183876,0.79833404,0.75090725,0.72684199,0.70223187,0.66689646,0.63170161,0.60112782,0.57032713,0.52290006,0.47413708,0.42354814,0.37733372,0.30942159,0.24914148,0.18337109,0.11643621,0.18208985,0.25144784,0.31095661,0.35999274,0.45058616,0.53443623,0.60743052];
    class GroundController {
        position = new Vec2();
        velocity = new Vec2();
        jumping = false;
        falling = false;
        normals = [];
        accel = 2;
        friction = 0.75;
        // the fricton that is applied on top of default friction once you've exceeded max speed
        terminalFriction = 0.15;
        speed = 4;
        // the y component of the maximumly angled normal vector that you're able to walk on, default 30 degrees
        groundNormalSlope = 0.707;
        // the x component of the maximumly angled normal vector that you're able to slide on, default 30 degrees
        wallNormalSlope = 0.866;
        groundJumpVelocity = 5.4;
        wallJumpVelocity = 5.4 * 1.5;
        fallingFrames = 10;
        allowedStepHeight = 6;
        gravityScale = 1;
    
        slidingLeft = false;
        slidingRight = false;
    
        releasedJumpButton = true;
    
        jumpVector = new Vec2(0, 0);
    
        enableWallJumping = false;
    
        leftGroundFrames = 0;
        maximumLeftGroundFrames = 2;
    
        _jumpingForce = 0;
        _jumpingDelta = 0;
        _currentFallingFrames = 0;
    
        constructor() {
    
        }
    
        applyAcceleration(up, left, down, right) {
            let ground = false;
            let leftWall = false;
            let rightWall = false;
            for (let i = 0; i < this.normals.length; i++) {
                if (this.normals[i].y <= -this.groundNormalSlope) {
                    ground = true;
                }
                
                if (this.normals[i].x >= this.wallNormalSlope) {
                    leftWall = true;
                }
    
                if (this.normals[i].x <= -this.wallNormalSlope) {
                    rightWall = true;
                }
            }
    
            if (ground) {
                this.leftGroundFrames = 0;
            } else {
                this.leftGroundFrames++;
            }
    
            const realGround = ground;
            ground = this.leftGroundFrames <= this.maximumLeftGroundFrames;
    
            if (leftWall || rightWall) {
                this.slidingLeft = leftWall;
                this.slidingRight = rightWall;
                if (this.enableWallJumping) {
                    this.velocity.y = Math.min(this.velocity.y, 1);
                }
            }
    
            if (!this.enableWallJumping) {
                leftWall = false;
                rightWall = false;
            }
    
            if (!up && !this.releasedJumpButton) {
                this.releasedJumpButton = true;
            }
    
            let accelX = 0;
            if (left) {
                accelX -= this.accel;
            }
            if (right) {
                accelX += this.accel;
            }
    
            const accelVec = new Vec2(accelX, 0);
            for (let i = 0; i < this.normals.length; i++) {
                // if this isnt ground try and project your accel if its going into the normal
                if (this.normals[i].y >= -this.groundNormalSlope) {
                    // if (Math.sign(this.normals[i].x) == -Math.sign(accelX)) {
                    //     accelX = 0;
                    // }
                    projectVelocityIfNecessary(this.normals[i], accelVec);
                }
            }
            accelX = accelVec.x;
    
            const friction = ground ? this.friction : this.friction / 2;
    
            // for (let i = 0; i < this.normals.length; i++) {
            //     Renderer.debugCanvas.drawLine(this.position.x, this.position.y, this.position.x + this.normals[i].x * 20, this.position.y + this.normals[i].y * 20, 0xffffff);
            // }
        
            // TODO when not on ground dont apply friction
            const initialVelocityX = this.velocity.x;
            if (Math.abs(this.velocity.x + accelX) <= friction) {
                this.velocity.x = 0;
            } else {
                this.velocity.x += accelX;
                this.velocity.x -= Math.sign(this.velocity.x) * friction;
            }
        
            if (Math.abs(initialVelocityX) > this.speed && Math.abs(this.velocity.x) > this.speed) {
                if (Math.abs(this.velocity.x) > Math.abs(initialVelocityX)) {
                    // in this scenario we want to match the previously applied acceleration to the friciton to only cancel it out, then apply the terminal friction on top
                    this.velocity.x -= (accelX - Math.sign(accelX) * friction);
                }
        
                if (Math.abs(this.velocity.x) - this.terminalFriction <= this.speed) {
                    // because we're able to go past the max speed using the terminal friction we only adjust to the max speed
                    this.velocity.x = Math.sign(this.velocity.x) * this.speed;
                } else {
                    this.velocity.x -= Math.sign(this.velocity.x) * this.terminalFriction;
                }
            } else if (Math.abs(this.velocity.x) > this.speed) {
                // if this scenario we want to slow you down to the maximum speed because we were the ones that applied you to be above it
                this.velocity.x = Math.sign(this.velocity.x) * this.speed;
            }
        
            // clear the jumping flag if you're not jumping
            if (this.jumping && (!up || realGround)) {
                this.falling = true;
                this.jumping = false;
            }
        
            // jump if you're trying to and able to
            if (ground || leftWall || rightWall) {
                this._jumpingForce = 0;
                this._jumpingDelta = 0;
    
                if (!this.jumping && up && this.releasedJumpButton) {
                    const jumpVelocity = ground ? this.groundJumpVelocity : this.wallJumpVelocity;
    
                    this.releasedJumpButton = false;
        
                    if (ground) {
                        this.jumpVector.x = 0;
                        this.jumpVector.y = -1;
                    } else if (leftWall && rightWall) {
                        this.jumpVector.x = 0;
                        this.jumpVector.y = -1;
                    } else if (leftWall) {
                        this.jumpVector.x = 0.7071067811865476;
                        this.jumpVector.y = -0.7071067811865476;
                    } else if (rightWall) {
                        this.jumpVector.x = -0.7071067811865476;
                        this.jumpVector.y = -0.7071067811865476;
                    }
        
                    this.jumping = true;
                    this.velocity.x += this.jumpVector.x * jumpVelocity;
                    this.velocity.y = this.jumpVector.y * jumpVelocity;
                }
            }
    
            // const MAX_JUMPING_FORCE = 0.002;
            const JUMP_ACCEL = 0.0001;
            const DELTA = 16;
    
            if (this.jumping) {
                const startingDelta = this._jumpingDelta;
                this._jumpingDelta += DELTA;
    
                const progress = this._jumpingDelta / 600;
                const startProgress = startingDelta / 400;
                const finalProgress = this._jumpingDelta / 400;
    
                let integratedJumpingForce = 1.0 / (startProgress + 1) - 1.0 / (finalProgress + 1);
                integratedJumpingForce *= 8;
    
                this._jumpingForce = 1.0 / (progress * (progress + 2) + 1);
                this._jumpingForce *= 0.0042;
    
                this.velocity.y += integratedJumpingForce * this.jumpVector.y;
                this.velocity.x += integratedJumpingForce * this.jumpVector.x * 2;
                // client_player.body.velocity.y -= client_player.jumping_force * delta;
            } else {
                this._jumpingForce -= JUMP_ACCEL * DELTA;
                this._jumpingForce = Math.max(this._jumpingForce, 0);
    
                this.velocity.y -= this._jumpingForce * DELTA * this.jumpVector.y;
                this.velocity.x -= this._jumpingForce * DELTA * this.jumpVector.x * 2;
            }
    
            if (this.velocity.y >= 0) {
                if (this.jumping) {
                    this.falling = true;
                }
    
                this.jumping = false;
            }
    
            if (!this.jumping && !ground && !leftWall && !rightWall) {
                this._currentFallingFrames++;
            } else {
                this._currentFallingFrames = 0;
            }
    
            this.falling = (this.falling || this._currentFallingFrames > this.fallingFrames) && !this.jumping && !ground && !leftWall && !rightWall;
        }
    
        applyForce(force) {
            this.velocity.add(force);
        }
    }
    class World {
        width;
        height;
        pixels;
    
        gravity;
        airResistance;
    
        constructor(width, height, gravity) {
            this.width = width;
            this.height = height;
            this.pixels = new Array(width * height);
            this.gravity = gravity || new Vec2(0, 1);
            this.airResistance = 2;
        }
    
        // stride and offset indicate the size of a given pixel in bytes and the offset in order to access the alpha value
        fillPixels(x, y, width, height, data, stride, offset) {
            stride = stride || 1;
            offset = offset || 0;
            
            for (let offsetX = 0; offsetX < width; offsetX++) {
                const realX = x + offsetX;
        
                for (let offsetY = 0; offsetY < height; offsetY++) {
                    const realY = y + offsetY;
                    
                    const worldIndex = realY * this.width + realX;
                    const dataIndex = offsetY * width + offsetX;
        
                    this.pixels[worldIndex] = !!data[dataIndex * stride + offset];
                }
            }
        }
    
        // physics logic for walls
        // when you've collided with a wall, get the normal angle of that wall
        // add it to the restricted angles thing
        // adjust the velocity of your character to be projected onto the perpendicular to the normal of that wall clamped by the restricted angles thing
        // try to resolve the collision:
        //     find the vector to the nearest adjacent pixel defined by the restricted angle
        //     move the character to the nearest adjacent pixel along this vector
        //     add this normal to the restricted normal list
        //     repeat until you've exhausted your velocity I guess, and if you're still in a wall go back to the beginning pixel and set your velocity to 0
    
        resolvePhysics(controller, aabb) {
            let bodyFallingSpeed = Vec2.copy(controller.velocity).projectOnto(this.gravity).length() * 0.01 * this.airResistance;
            if (controller.velocity.dot(this.gravity) <= 0) {
                bodyFallingSpeed = 0;
            }
    
            const gravitySpeed = this.gravity.length();
            const appliedGravity = Vec2.copy(this.gravity).normalize().multiply(Math.max(gravitySpeed - bodyFallingSpeed * bodyFallingSpeed, 0)).multiply(controller.gravityScale);
            controller.velocity.add(appliedGravity);
    
            if (controller.velocity.length() === 0) {
                return;
            }
    
            const position = Vec2.copy(controller.position);
            const velocity = Vec2.copy(controller.velocity);
    
            // TODO specifically if you've moved at least 1 pixel then we can clear this
            const nextPosition = Vec2.copy(controller.position).add(controller.velocity).round();
            if (position.y !== nextPosition.y) {
                controller.normals.length = 0;
            }
        
            // this is not great, yet, because its stepping with lengths less than one entire step into the next pixel, so it will get overlapped pixels
            // like forming and L shape and stuff
            let remainingLength = controller.velocity.length();
            const step = Vec2.copy(controller.velocity).normalize();
            while (remainingLength > 0) {
                // is this kind of thing too confusing? idk
                const newPosition = new Vec2();
                if (remainingLength >= 1) {
                    newPosition.x = position.x + step.x;
                    newPosition.y = position.y + step.y;
                } else {
                    // partial steps to preserve floating point accuracy
                    newPosition.x = position.x + step.x * remainingLength;
                    newPosition.y = position.y + step.y * remainingLength;
                }
        
                const pixelNewPosition = new AABB(newPosition.x + aabb.x, newPosition.y + aabb.y, aabb.width, aabb.height);
                pixelNewPosition.round();
    
                const collisionPixel = new Vec2();
                const collision = checkCollisions(this, pixelNewPosition, collisionPixel);
                if (collision) {
                    const stepCollisionPixel = new Vec2();
                    const stepNormal = new Vec2();
                    const stepUpOffset = stepUp(this, controller, pixelNewPosition, stepNormal, stepCollisionPixel);
                    if (stepUpOffset !== 0) {
                        // TODO do this less stupidly
                        controller.jumping = false;
                        newPosition.y -= stepUpOffset;
        
                        // if youve been teleported up a step subtract this from the remaining movement length
                        // basically calculate the difference in the y value would make to equal the hypotenuse considering we're already subtracting one
                        // we need to calculate the distance that this vertical line would be to the actual velocity line, and use that as one of the
                        // edges of the triangle to calculate the hypotenuse
                        // const travelDirection = Vec2.copy(velocity).normalize();
                        // const verticalStep = new Vec2(0, stepUpOffset);
                        // const stepAngle = Math.acos(travelDirection.dot(verticalStep) / (travelDirection.length() * verticalStep.length()));
                        // const minimumStepDistance = 1 / Math.tan(Math.PI / 2 - stepAngle);
    
                        const slopePenalty = Math.sqrt(1 + stepUpOffset * stepUpOffset) - 1;
                        remainingLength = Math.max(remainingLength - slopePenalty, 0);
    
                        if (stepNormal.y <= -controller.groundNormalSlope) {
                            velocity.y = 0;
                        } else {
                            projectVelocityIfNecessary(stepNormal, velocity);
                        }
                    } else {
                        // actual collision we can't resolve, for now stop here?
                        // paint_edges(collision_pixel.x, collision_pixel.y, velocity);
                        // controller.position.x = position.x;
                        // controller.position.y = position.y;
                        // velocity.y = 0;
    
                        // const center = Vec2.set(pixelNewPosition.x + pixelNewPosition.width / 2, pixelNewPosition.y + pixelNewPosition.height / 2).round();
                        const normal = getNormal(this, pixelNewPosition, collisionPixel);
                        if (normal.y <= -controller.groundNormalSlope) {
                            velocity.y = 0;
                        } else {
                            projectVelocityIfNecessary(normal, velocity);
                        }
    
                        const startPoint = new Vec2(pixelNewPosition.x, pixelNewPosition.y);
    
                        const attemptClearDistance = 4;
                        let foundEmpty = false;
                        for (let distance = 1; distance <= attemptClearDistance; distance++) {
                            pixelNewPosition.x = startPoint.x + Math.round(normal.x * distance);
                            pixelNewPosition.y = startPoint.y + Math.round(normal.y * distance);
    
                            if (!checkCollisions(this, pixelNewPosition, collisionPixel)) {
                                foundEmpty = true;
                                break;
                            }
                        }
    
                        if (!foundEmpty) {
                            break;
                        }
    
                        newPosition.x = pixelNewPosition.x - aabb.x;
                        newPosition.y = pixelNewPosition.y - aabb.y;
                    }
                }
        
                position.x = newPosition.x;
                position.y = newPosition.y;
                // each step is a length of 1 for now
                remainingLength = Math.max(remainingLength - 1.0, 0);
            }
        
            controller.position.x = position.x;
            controller.position.y = position.y;
            controller.velocity.x = velocity.x;
            controller.velocity.y = velocity.y;
    
            // test
            controller.normals.length = 0;
            const expandedAABB = new AABB(position.x + aabb.x - 1, position.y + aabb.y - 1, aabb.width + 2, aabb.height + 2);
            expandedAABB.round();
            const expandedPixel = new Vec2();
            for (let x = 0; x < expandedAABB.width; x++) {
                if (this.getPixel(expandedAABB.x + x, expandedAABB.y)) {
                    controller.normals.push(getNormal(this, expandedAABB, expandedPixel.set(expandedAABB.x + x, expandedAABB.y)));
                }
                if (this.getPixel(expandedAABB.x + x, expandedAABB.y + expandedAABB.height - 1)) {
                    controller.normals.push(getNormal(this, expandedAABB, expandedPixel.set(expandedAABB.x + x, expandedAABB.y + expandedAABB.height - 1)));
                }
            }
        
            for (let y = 1; y < expandedAABB.height - 1; y++) {
                if (this.getPixel(expandedAABB.x, expandedAABB.y + y)) {
                    controller.normals.push(getNormal(this, expandedAABB, expandedPixel.set(expandedAABB.x, expandedAABB.y + y)));
                }
                if (this.getPixel(expandedAABB.x + expandedAABB.width - 1, expandedAABB.y + y)) {
                    controller.normals.push(getNormal(this, expandedAABB, expandedPixel.set(expandedAABB.x + expandedAABB.width - 1, expandedAABB.y + y)));
                }
            }
        }
    
        getPixel(x, y) {
            if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
                return false;
            }
    
            return this.pixels[y * this.width + x];
        }
    
        scanLine(start, end) {
            const line = PixelScan.getLinePixels(start.x, start.y, end.x, end.y, true);
        
            for (let i = 0; i < line.length; i++) {
                if (this.getPixel(line[i].x, line[i].y)) {
                    return line[i];
                }
            }
        
            return null;
        };
        
        scanLineEmpty(start, end) {
            const line = PixelScan.getLinePixels(start.x, start.y, end.x, end.y, true);
        
            for (let i = 0; i < line.length; i++) {
                if (!this.getPixel(line[i].x, line[i].y)) {
                    return line[i];
                }
            }
        
            return null;
        };
    }
    
    const paintEdges = (x, y, velocity) => {
        // // okay first probably I will just draw all the pixels along a wall red to see what happens, if this algorithm even works for finding edges
        // normal_angle := atan2(-velocity.y, -velocity.x);
    
        // SetPixelColor(LEVEL.image, RED, x, y);
    
        // current_pixel, valid_pixel := get_next_wall_pixel(x, y, normal_angle);
        // color := GetPixelColor(LEVEL.image, current_pixel.x, current_pixel.y);
        // while valid_pixel && color != RED {
        //     SetPixelColor(LEVEL.image, RED, current_pixel.x, current_pixel.y);
    
        //     current_pixel, valid_pixel = get_next_wall_pixel(current_pixel.x, current_pixel.y, normal_angle);
        //     color = GetPixelColor(LEVEL.image, current_pixel.x, current_pixel.y);
        // }
    }
    
    // the original method also returned a point
    const checkCollisions = (world, aabb, returnPixel) => {
        for (let x = 0; x < aabb.width; x++) {
            if (world.getPixel(aabb.x + x, aabb.y)) {
                if (returnPixel) {
                    returnPixel.x = aabb.x + x;
                    returnPixel.y = aabb.y;
                }
    
                return true;
            }
            if (world.getPixel(aabb.x + x, aabb.y + aabb.height - 1)) {
                if (returnPixel) {
                    returnPixel.x = aabb.x + x;
                    returnPixel.y = aabb.y + aabb.height - 1;
                }
    
                return true;
            }
        }
    
        for (let y = 0; y < aabb.height; y++) {
            if (world.getPixel(aabb.x, aabb.y + y)) {
                if (returnPixel) {
                    returnPixel.x = aabb.x;
                    returnPixel.y = aabb.y + y;
                }
    
                return true;
            }
            if (world.getPixel(aabb.x + aabb.width - 1, aabb.y + y)) {
                if (returnPixel) {
                    returnPixel.x = aabb.x + aabb.width - 1;
                    returnPixel.y = aabb.y + y;
                }
                
                return true;
            }
        }
    
        return false;
    };
    
    const requiredLineAccuracy = 16;
    const rightPixel = new Vec2();
    const leftPixel = new Vec2();
    const startPixel = new Vec2();
    const nextPixel = new Vec2();
    const pixelLine = new Vec2();
    const pixelOffsets = [
        new Vec2(0, 0),
        new Vec2(1, 0),
        new Vec2(1, 1),
        new Vec2(0, 1),
    ];
    const getNormal = (world, aabb, pixel) => {
        const center = Vec2.set(aabb.x, aabb.y);
        center.x += aabb.width / 2;
        center.y += aabb.height / 2;
        center.round();
    
        // check for additional pixels on the side that this is colliding with
        // top wall
        if (pixel.y == aabb.y && !world.getPixel(pixel.x, pixel.y + 1)) {
            for (let x = 0; x < aabb.width; x++) {
                if (aabb.x + x == pixel.x) {
                    continue;
                }
                
                if (world.getPixel(aabb.x + x, pixel.y) && !world.getPixel(aabb.x + x, pixel.y + 1)) {
                    return new Vec2(0, 1);
                }
            }
        }
        // bottom wall
        if (pixel.y == aabb.y + aabb.height - 1 && !world.getPixel(pixel.x, pixel.y - 1)) {
            for (let x = 0; x < aabb.width; x++) {
                if (aabb.x + x == pixel.x) {
                    continue;
                }
                
                if (world.getPixel(aabb.x + x, pixel.y) && !world.getPixel(aabb.x + x, pixel.y - 1)) {
                    return new Vec2(0, -1);
                }
            }
        }
        // left wall
        if (pixel.x == aabb.x && !world.getPixel(pixel.x + 1, pixel.y)) {
            for (let y = 0; y < aabb.height; y++) {
                if (aabb.y + y == pixel.y) {
                    continue;
                }
                
                if (world.getPixel(pixel.x, aabb.y + y) && !world.getPixel(pixel.x + 1, aabb.y + y)) {
                    return new Vec2(1, 0);
                }
            }
        }
        // right wall
        if (pixel.x == aabb.x + aabb.width - 1 && !world.getPixel(pixel.x - 1, pixel.y)) {
            for (let y = 0; y < aabb.height; y++) {
                if (aabb.y + y == pixel.y) {
                    continue;
                }
                
                if (world.getPixel(pixel.x, aabb.y + y) && !world.getPixel(pixel.x - 1, aabb.y + y)) {
                    return new Vec2(-1, 0);
                }
            }
        }
    
        // left means, if your character is falling down to the ground, the left direction of the surface
        // pixel - character center gets you an approximation of what the normal probably is
        leftPixel.copy(pixel).subtract(center).orthogonal();
        let leftAngle = leftPixel.atan2();
    
        rightPixel.copy(leftPixel).negate();
        let rightAngle = rightPixel.atan2();
    
        const startX = pixel.x + 0.5;
        const startY = pixel.y + 0.5;
    
        startPixel.copy(pixel);
        if (getNextWallPixel(world, startPixel, leftAngle, nextPixel)) {
            // here we know that the nextPixel is valid because its only the second, so skip the corner check
            // ccw most
            let leftMostAngle = Math.atan2(nextPixel.y + pixelOffsets[0].y - startY, nextPixel.x + pixelOffsets[0].x - startX);
            // cw most
            let rightMostAngle = leftMostAngle;
    
            // this is just the first pixel along the line, so get the widest angle possible
            for (let i = 1; i < pixelOffsets.length; i++) {
                const cornerX = nextPixel.x + pixelOffsets[i].x;
                const cornerY = nextPixel.y + pixelOffsets[i].y;
    
                const newAngle = Math.atan2(cornerY - startY, cornerX - startX);
                if (radiansBetween(leftMostAngle, newAngle) < 0) {
                    leftMostAngle = newAngle;
                }
                if (radiansBetween(rightMostAngle, newAngle) > 0) {
                    rightMostAngle = newAngle;
                }
            }
    
            // get the average of the possible line angle range
            leftAngle = Math.atan2(nextPixel.y + 0.5 - startY, nextPixel.x + 0.5 - startX);
    
            let count = 0;
            while (count < requiredLineAccuracy) {
                startPixel.copy(nextPixel);
    
                if (!getNextWallPixel(world, startPixel, leftAngle, nextPixel)) {
                    break;
                } else {
                    if (!validateCorners(startX, startY, nextPixel.x, nextPixel.y, leftMostAngle, rightMostAngle)) {
                        break;
                    }
                    
    
                    let nextLeftMostAngle = Math.atan2(nextPixel.y + pixelOffsets[0].y - startY, nextPixel.x + pixelOffsets[0].x - startX);
                    let nextRightMostAngle = nextLeftMostAngle;
    
                    for (let i = 0; i < pixelOffsets.length; i++) {
                        const cornerX = nextPixel.x + pixelOffsets[i].x;
                        const cornerY = nextPixel.y + pixelOffsets[i].y;
            
                        const newAngle = Math.atan2(cornerY - startY, cornerX - startX);
                        if (radiansBetween(nextLeftMostAngle, newAngle) < 0) {
                            nextLeftMostAngle = newAngle;
                        }
                        if (radiansBetween(nextRightMostAngle, newAngle) > 0) {
                            nextRightMostAngle = newAngle;
                        }
                    }
    
                    // this is more restricting, so update it
                    if (radiansBetween(leftMostAngle, nextLeftMostAngle) > 0) {
                        leftMostAngle = nextLeftMostAngle;
                    }
                    if (radiansBetween(rightMostAngle, nextRightMostAngle) < 0) {
                        rightMostAngle = nextRightMostAngle;
                    }
    
                    leftAngle = Math.atan2(nextPixel.y + 0.5 - startY, nextPixel.x + 0.5 - startX);
                }
    
                count++;
            }
        }
    
        startPixel.copy(pixel);
        if (getNextWallPixel(world, startPixel, rightAngle, nextPixel)) {
            // here we know that the nextPixel is valid because its only the second, so skip the corner check
            // ccw most
            let leftMostAngle = Math.atan2(nextPixel.y + pixelOffsets[0].y - startY, nextPixel.x + pixelOffsets[0].x - startX);
            // cw most
            let rightMostAngle = leftMostAngle;
    
            // this is just the first pixel along the line, so get the widest angle possible
            for (let i = 1; i < pixelOffsets.length; i++) {
                const cornerX = nextPixel.x + pixelOffsets[i].x;
                const cornerY = nextPixel.y + pixelOffsets[i].y;
    
                const newAngle = Math.atan2(cornerY - startY, cornerX - startX);
                if (radiansBetween(leftMostAngle, newAngle) < 0) {
                    leftMostAngle = newAngle;
                }
                if (radiansBetween(rightMostAngle, newAngle) > 0) {
                    rightMostAngle = newAngle;
                }
            }
    
            // get the average of the possible line angle range
            rightAngle = Math.atan2(nextPixel.y + 0.5 - startY, nextPixel.x + 0.5 - startX);
    
            let count = 0;
            while (count < requiredLineAccuracy) {
                startPixel.copy(nextPixel);
    
                if (!getNextWallPixel(world, startPixel, rightAngle, nextPixel)) {
                    break;
                } else {
                    if (!validateCorners(startX, startY, nextPixel.x, nextPixel.y, leftMostAngle, rightMostAngle)) {
                        break;
                    }
    
                    let nextLeftMostAngle = Math.atan2(nextPixel.y + pixelOffsets[0].y - startY, nextPixel.x + pixelOffsets[0].x - startX);
                    let nextRightMostAngle = nextLeftMostAngle;
    
                    for (let i = 0; i < pixelOffsets.length; i++) {
                        const cornerX = nextPixel.x + pixelOffsets[i].x;
                        const cornerY = nextPixel.y + pixelOffsets[i].y;
            
                        const newAngle = Math.atan2(cornerY - startY, cornerX - startX);
                        if (radiansBetween(nextLeftMostAngle, newAngle) < 0) {
                            nextLeftMostAngle = newAngle;
                        }
                        if (radiansBetween(nextRightMostAngle, newAngle) > 0) {
                            nextRightMostAngle = newAngle;
                        }
                    }
    
                    // this is more restricting, so update it
                    if (radiansBetween(leftMostAngle, nextLeftMostAngle) > 0) {
                        leftMostAngle = nextLeftMostAngle;
                    }
                    if (radiansBetween(rightMostAngle, nextRightMostAngle) < 0) {
                        rightMostAngle = nextRightMostAngle;
                    }
    
                    rightAngle = Math.atan2(nextPixel.y + 0.5 - startY, nextPixel.x + 0.5 - startX);
                }
    
                count++;
            }
        }
    
        // temporary
        const leftNormal = Vec2.fromAngle(leftAngle).orthogonal();
        const rightNormal = Vec2.fromAngle(rightAngle).orthogonal().negate();
        const averagedNormal = leftNormal.add(rightNormal).normalize();
        if (leftNormal.y <= rightNormal.y && leftNormal.y <= averagedNormal.y) {
            return leftNormal;
        } else if (rightNormal.y <= leftNormal.y && rightNormal.y <= averagedNormal.y) {
            return rightNormal;
        } else {
            return averagedNormal;
        }
    };
    
    const validateCorners = (startX, startY, endX, endY, leftMostAngle, rightMostAngle) => {
        for (let i = 0; i < pixelOffsets.length; i++) {
            const cornerX = endX + pixelOffsets[i].x;
            const cornerY = endY + pixelOffsets[i].y;
    
            const angle = Math.atan2(cornerY - startY, cornerX - startX);
            if (radiansBetween(leftMostAngle, angle) >= 0 && radiansBetween(rightMostAngle, angle) <= 0) {
                return true;
            }
        }
    
        return false;
    };
    
    const projectVelocityIfNecessary = (normal, velocity) => {
        if (normal.dot(velocity) >= 0) {
            return;
        }
    
        const normalOrthogonal = Vec2.copy(normal).orthogonal();
        velocity.projectOnto(normalOrthogonal);
    };
    
    // tries to step up from your current position, returns the necessary offset
    const stepPixel = new Vec2();
    const previousStepPixel = new Vec2();
    const stepAABB = new AABB();
    const previousStepAABB = new AABB();
    const stepUpCenter = new Vec2();
    const stepUp = (world, controller, aabb, returnNormal, returnCollisionPixel) => {
        stepAABB.width = aabb.width;
        stepAABB.height = aabb.height;
    
        let previouslyCollided = false;
        for (let y = 0; y <= controller.allowedStepHeight; y++) {
            stepAABB.x = aabb.x;
            stepAABB.y = aabb.y - y;
    
            const collided = checkCollisions(world, stepAABB, stepPixel);
            if (!collided && previouslyCollided) {
                // get the floor angle from the collided step pixel and determine if its valid
                stepUpCenter.set(stepAABB.x + stepAABB.width / 2, stepAABB.y + 1 + stepAABB.height / 2).round();
                const normal = getNormal(world, previousStepAABB, previousStepPixel);
                if (normal.y <= -controller.groundNormalSlope) {
                    if (returnNormal) {
                        returnNormal.copy(normal);
                    }
                    if (returnCollisionPixel) {
                        returnCollisionPixel.copy(previousStepPixel);
                    }
    
                    return y;
                }
            }
    
            previousStepPixel.copy(stepPixel);
            previousStepAABB.copy(stepAABB);
            previouslyCollided = collided;
        }
    
        return 0;
    };
    
    // we need to find all pixels that have at least one adjacent empty space
    // .[top left, top middle, top right, middle left, middle right, bottom left, bottom middle, bottom right]
    const found = [false, false, false, false, false, false, false, false];
    const pixels = [new Vec2(-1, -1), new Vec2(0, -1), new Vec2(1, -1), new Vec2(-1, 0), new Vec2(1, 0), new Vec2(-1, 1), new Vec2(0, 1), new Vec2(1, 1)];
    const angles = [pixels[0].atan2(), pixels[1].atan2(), pixels[2].atan2(), pixels[3].atan2(), pixels[4].atan2(), pixels[5].atan2(), pixels[6].atan2(), pixels[7].atan2()];
    const getNextWallPixel = (world, pixel, angle, mostAccuratePixel) => {    
        for (let i = 0; i < found.length; i++) {
            found[i] = false;
        }
    
        // the problem is that this pixel could easily have a wall facing the opposite way of the player, but do we care?
        // no we dont care, I dont think
        if (world.getPixel(pixel.x - 1, pixel.y - 1)) {
            // pixel to the right is transparent or pixel below is transparent
            if (!world.getPixel(pixel.x, pixel.y - 1) || !world.getPixel(pixel.x - 1, pixel.y)) {
                found[0] = true;
            }
        }
        if (world.getPixel(pixel.x, pixel.y - 1)) {
            // pixel to the left is transparent or pixel to the right is transparent
            if (!world.getPixel(pixel.x - 1, pixel.y - 1) || !world.getPixel(pixel.x + 1, pixel.y - 1)) {
                found[1] = true;
            }
        }
        if (world.getPixel(pixel.x + 1, pixel.y - 1)) {
            // pixel to the left is transparent or pixel below is transparent
            if (!world.getPixel(pixel.x, pixel.y - 1) || !world.getPixel(pixel.x + 1, pixel.y)) {
                found[2] = true;
            }
        }
        if (world.getPixel(pixel.x - 1, pixel.y)) {
            // pixel above is transparent or pixel below is transparent
            if (!world.getPixel(pixel.x - 1, pixel.y - 1) || !world.getPixel(pixel.x - 1, pixel.y + 1)) {
                found[3] = true;
            }
        }
        if (world.getPixel(pixel.x + 1, pixel.y)) {
            // pixel above is transparent or pixel below is transparent
            if (!world.getPixel(pixel.x + 1, pixel.y - 1) || !world.getPixel(pixel.x + 1, pixel.y + 1)) {
                found[4] = true;
            }
        }
        if (world.getPixel(pixel.x - 1, pixel.y + 1)) {
            // pixel to the right is transparent or pixel above is transparent
            if (!world.getPixel(pixel.x, pixel.y + 1) || !world.getPixel(pixel.x - 1, pixel.y)) {
                found[5] = true;
            }
        }
        if (world.getPixel(pixel.x, pixel.y + 1)) {
            // pixel to the left is transparent or pixel to the right is transparent
            if (!world.getPixel(pixel.x - 1, pixel.y + 1) || !world.getPixel(pixel.x + 1, pixel.y + 1)) {
                found[6] = true;
            }
        }
        if (world.getPixel(pixel.x + 1, pixel.y + 1)) {
            // pixel to the left is transparent or pixel above is transparent
            if (!world.getPixel(pixel.x, pixel.y + 1) || !world.getPixel(pixel.x + 1, pixel.y)) {
                found[7] = true;
            }
        }
    
        // temp code
        // for i: 0..7 {
        //     pos := pixels[i] + Vector2i.{1, 1};
        //     if GetPixel(view, pos.x, pos.y) == RED {
        //         found[i] = false;
        //     }
        // }
    
        let validPixel = false;
        let mostAccurateAbsAngleDiff = 0;
    
        for (let i = 0; i < 8; i++) {
            if (!found[i]) {
                continue;
            }
    
            const absAngleDiff = Math.abs(radiansBetween(angle, angles[i]));
            if (!validPixel || absAngleDiff < mostAccurateAbsAngleDiff) {
                mostAccuratePixel.x = pixels[i].x + pixel.x;
                mostAccuratePixel.y = pixels[i].y + pixel.y;
                mostAccurateAbsAngleDiff = absAngleDiff;
            }
    
            validPixel = true;
        }
    
        return validPixel;
    };
    
    const radiansBetween = (start, end) => {
        // TODO this is bad and probably slow I need to change it later
        if (end < start) {
            if (start - end > Math.PI) {
                return Math.PI * 2 - (start - end);
            } else {
                return -(start - end);
            }
        } else {
            if (end - start > Math.PI) {
                return -(Math.PI * 2 - (end - start));
            } else {
                return end - start;
            }
        }
    };
    const extract = (application, texture) => {
        const renderTexture = PIXI.RenderTexture.create({width: texture.width, height: texture.height});
        const sprite = new PIXI.Sprite(texture);
    
        application.renderer.render(sprite, renderTexture);
        const pixels = application.renderer.plugins.extract.pixels(renderTexture);
    
        renderTexture.destroy();
    
        return pixels;
    };
    
    const getLinePixels = (x1, y1, x2, y2, inclusive) => {
        x1 = Math.round(x1);
        y1 = Math.round(y1);
        x2 = Math.round(x2);
        y2 = Math.round(y2);
    
        // modified bresenham’s to handle reverse lines and vertical lines
        const dx = x2 - x1;
        const dy = y2 - y1;
    
        const pixels = [];
        if (Math.abs(dx) >= Math.abs(dy)) {
            let x = x1;
            let y = y1;
    
            if (x2 > x1) {
                let p = 2 * dy - dx;
                while (x < x2) {
                    if (p >= 0) {
                        const point = new Vec2(x, y);
                        pixels.push(point);
    
                        y = y + 1;
                        p = p + 2 * dy - 2 * dx;
                    } else {
                        const point = new Vec2(x, y);
                        pixels.push(point);
    
                        p = p + 2 * dy;
                    }
    
                    x = x + 1;
                }
            } else {
                let p = -2 * dy + dx;
                while (x > x2) {
                    if (p >= 0) {
                        const point = new Vec2(x, y);
                        pixels.push(point);
    
                        y = y - 1;
                        p = p - 2 * dy + 2 * dx;
                    } else {
                        const point = new Vec2(x, y);
                        pixels.push(point);
    
                        p = p - 2 * dy;
                    }
    
                    x = x - 1;
                }
            }
        } else {
            let x = x1;
            let y = y1;
    
            if (y2 > y1) {
                let p = 2 * dx - dy;
                while (y < y2) {
                    if (p >= 0) {
                        const point = new Vec2(x, y);
                        pixels.push(point);
    
                        x = x + 1;
                        p = p + 2 * dx - 2 * dy;
                    } else {
                        const point = new Vec2(x, y);
                        pixels.push(point);
    
                        p = p + 2 * dx;
                    }
    
                    y = y + 1;
                }
            } else {
                let p = -2 * dx + dy;
                while (y > y2) {
                    if (p >= 0) {
                        const point = new Vec2(x, y);
                        pixels.push(point);
    
                        x = x - 1;
                        p = p - 2 * dx + 2 * dy;
                    } else {
                        const point = new Vec2(x, y);
                        pixels.push(point);
    
                        p = p - 2 * dx;
                    }
    
                    y = y - 1;
                }
            }
        }
    
        if (inclusive || (x1 == x2 && y1 == y2)) {
            const point = new Vec2(x2, y2);
            pixels.push(point);
        }
    
        return pixels;
    }
    const PixelScan = {
        FramedSprite,
        AABB,
        Vec2,
        Input,
        World,
        GroundController,
        FPSTracker,
        CPUTracker,
        ParallaxSprite,
        WaterShader,
        PerlinNoise,
        Camera,
        Hash,
        DebugCanvas,
        DynamicTree,
        BinaryHelper,
        extract,
        getLinePixels,
    };
    return PixelScan;
    })();

    const Camera = PixelScan.Camera;
    const CPUTracker = PixelScan.CPUTracker;
    const DebugCanvas = PixelScan.DebugCanvas;
    const FPSTracker = PixelScan.FPSTracker;
    const FramedSprite = PixelScan.FramedSprite;
    const ParallaxSprite = PixelScan.ParallaxSprite;
    const WaterShader = PixelScan.WaterShader;
    const Input = PixelScan.Input;
    const AABB = PixelScan.AABB;
    const Hash = PixelScan.Hash;
    const Mat3 = PixelScan.Mat3;
    const Vec2 = PixelScan.Vec2;
    const BinaryHelper = PixelScan.BinaryHelper;
    const PerlinNoise = PixelScan.PerlinNoise;
    const GroundController = PixelScan.GroundController;
    const World = PixelScan.World;
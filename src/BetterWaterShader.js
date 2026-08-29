class BetterWaterShader extends PIXI.Filter {
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
    uniform vec3 uBackgroundColor;

    float luminance(vec3 color) {
        return (color.r + color.g + color.b) / 3.0;
    }

    void main(void) {
        float time = uTime / 60.0;
        vec2 uv = vec2(vTextureCoord.x, 1.0 - vTextureCoord.y) + uOffset / inputPixel.xy;
        vec2 scaledUv = uv * uScale * inputPixel.xy / 1200.0;

        float water1 = luminance(texture2D(uNoiseSampler, scaledUv + time * uSpeed * 0.02 - 0.1 + vec2(0.0, 0.5)).rgb) / 3.0;
        float water2 = luminance(texture2D(uNoiseSampler, scaledUv - time * uSpeed * 0.02 + 0.1).rgb) / 3.0;
        float highlights = luminance(texture2D(uHighlights, scaledUv + time * uSpeed / vec2(-10.0, 100.0) + vec2(0.0, 0.5)).rgb) / 4.5;

        vec4 normalBackground = texture2D(uSampler, vTextureCoord);
        vec4 background = texture2D(uSampler, vTextureCoord + water1 * 0.05 * uStrength - 0.005 * uStrength);

        float alpha = uOpacity;
        float water = water1 + water2;
        if (water > 0.3) {
            alpha = 0.0;
        }
        if (water + highlights * 2.0 > 0.85) {
            alpha = 5.0 * uOpacity;
        }

        float waterTotal = normalBackground.a;
        if (normalBackground.a > 0.0) {
            normalBackground.rgb /= normalBackground.a;
            normalBackground.a = 1.0;
        } else {
            normalBackground = vec4(uBackgroundColor, 1.0);
        }
        if (background.a > 0.0) {
            background.rgb /= background.a;
            background.a = 1.0;
        } else {
            background = vec4(uBackgroundColor, 1.0);
        }

        waterTotal = waterTotal * waterTotal * waterTotal;
        vec4 color = min(vec4(vec3(water * alpha), 0.0) + background, 1.0);
        gl_FragColor = color * waterTotal + normalBackground * (1.0 - waterTotal);
    }
    `;

    constructor() {
        super(null, BetterWaterShader.FRAG_SRC, {
            uTime: 0.0,
            uNoiseSampler: BetterWaterShader.NOISE_TEXTURE,
            uHighlights: BetterWaterShader.HIGHLIGHT_TEXTURE,
            uOffset: new Float32Array([0, 0]),
            uOpacity: 0.5,
            uStrength: 1.0,
            uScale: 1.5,
            uSpeed: 0.8,
            uBackgroundColor: new Float32Array([0, 0, 0]),
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

    setOffset(x, y) {
        this.uniforms.uOffset[0] = x;
        this.uniforms.uOffset[1] = y;
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

    getBackgroundColor() {
        return this.uniforms.uBackgroundColor;
    }

    setBackgroundColor(r, g, b) {
        this.uniforms.uBackgroundColor[0] = r;
        this.uniforms.uBackgroundColor[1] = g;
        this.uniforms.uBackgroundColor[2] = b;
    }
}
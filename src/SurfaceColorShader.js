class SurfaceColorShader extends PIXI.Filter {
    static FRAG_SRC = `
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;

    uniform vec4 uColor;

    void main(void) {
        vec4 color = texture2D(uSampler, vTextureCoord);
        gl_FragColor = color * (1.0 - uColor.a) + uColor * uColor.a * color.a;
    }
    `;

    constructor() {
        super(null, SurfaceColorShader.FRAG_SRC, {
            uColor: new Float32Array([0, 0, 0, 0]),
        });
    }

    getColor() {
        return this.uniforms.uColor;
    }

    setColor(r, g, b, a) {
        this.uniforms.uColor[0] = r;
        this.uniforms.uColor[1] = g;
        this.uniforms.uColor[2] = b;
        this.uniforms.uColor[3] = a;
    }
}
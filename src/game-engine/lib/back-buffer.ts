import { ShaderSource, Shader } from './shader';
import { GameContext } from '..';

export interface BackBufferOptions {
    width?: number;
    height?: number;
}

export class BackBuffer {
    public width: number;
    public height: number;
    public frameBuffer: WebGLFramebuffer;

    private renderBuffer: WebGLRenderbuffer;
    private texture: WebGLTexture;
    private buffer: WebGLBuffer;
    private shader: Shader;

    constructor(private context: GameContext, opts: BackBufferOptions = {}) {
        const gl = context.gl;
        this.shader = this.context.resources.getShader(BackBufferShader);

        this.width = opts.width ? opts.width : 512;
        this.height = opts.height ? opts.height : 512;

        this.frameBuffer = gl.createFramebuffer();
        this.renderBuffer = gl.createRenderbuffer();
        this.texture = gl.createTexture();

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);

        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.getVertexMatrix(), gl.STATIC_DRAW);

        // cleanup
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    draw() {
        const gl = this.context.gl;
        this.shader.use();

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        this.shader.setInteger('image', 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        const positionIndex = this.shader.getAttributeIndex('vertex');
        gl.enableVertexAttribArray(positionIndex);
        gl.vertexAttribPointer(positionIndex, 4, gl.FLOAT, false, 4 * 4, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);

        // cleanup
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.useProgram(null);
    }

    private getVertexMatrix(): Float32Array {
        // prettier-ignore
        return new Float32Array([
        //  POS      TEX
            -1,  1, 0, 1,
             1, -1, 1, 0,
            -1, -1, 0, 0,
                    
            -1,  1, 0, 1,
             1,  1, 1, 1,
             1, -1, 1, 0
        ]);
    }
}

const BackBufferShader: ShaderSource = {
    id: 'back-buffer-shader',

    vertexShader: `
    attribute vec4 vertex; //<vec2 position , vec2 texCoords>

    varying vec2 texCoord;

    void main() {
        gl_Position = vec4(vertex.xy, 0.0, 1.0);
        texCoord = vertex.zw;
    }
    `,

    fragmentShader: `
    precision mediump float;
    uniform sampler2D image;
    varying vec2 texCoord;

    void main() {
        gl_FragColor = texture2D(image, texCoord);
    }
    `,
};

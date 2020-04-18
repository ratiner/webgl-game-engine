import { Shader } from '../shaders/shader';
import { Texture2D } from '../texture-2d';
import { mat4 } from 'gl-matrix';
import { GameContext } from '../game-context';
import { ShaderSource } from '../shaders';

export interface SpriteRenderOptions {
    position: [number, number];
    size: [number, number];
    crop?: CropOptions;
    rotate?: number;
    color?: [number, number, number];
}

export interface CropOptions {
    size: [number, number];
    index: [number, number];
    spacing?: [number, number];
}

export class SpriteRenderer {
    private shader: Shader;
    private vertexBuffer: WebGLBuffer;

    constructor(private context: GameContext) {
        this.shader = context.resources.getShader(SpriteShader);

        this.initRenderData();
    }

    render(
        texture: Texture2D,
        opts: SpriteRenderOptions = {
            position: [0, 0],
            size: null,
        }
    ) {
        if (!texture.isLoaded) return;

        const { position, size, crop, rotate } = opts;
        const gl = this.context.gl;

        this.shader.use();

        this.handleCrop(texture, crop); // crop if needed

        const model = mat4.create();
        mat4.translate(model, model, [position[0], position[1], 0]); // First translate (transformations are: scale happens first, then rotation and then finall translation happens; reversed order)
        if (rotate) {
            mat4.translate(model, model, [0.5 * size[0], 0.5 * size[1], 0]); // Move origin of rotation to center of quad
            mat4.rotate(model, model, rotate, [0, 0, 1]); // Then rotate
            mat4.translate(model, model, [-0.5 * size[0], -0.5 * size[1], 0]); // Move origin back
        }
        mat4.scale(model, model, [size[0], size[1], 1]); // Last scale

        this.shader.setMatrix4('model', model);

        this.shader.setInteger('image', 0);
        gl.activeTexture(gl.TEXTURE0);
        texture.bind();

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);

        gl.useProgram(null);
    }

    private handleCrop(texture: Texture2D, crop: CropOptions) {
        const gl = this.context.gl;

        let rw = 1;
        let rh = 1;

        if (crop) {
            rw = crop.size[0] / texture.width;
            rh = crop.size[1] / texture.height;

            let offset_x = crop.index[0] * rw;
            let offset_y = crop.index[1] * rh;

            this.shader.setVector2fXy('offset', offset_x, offset_y);
        } else {
            this.shader.setVector2fXy('offset', 0, 0);
        }

        // prettier-ignore
        const rectArray = new Float32Array([
           //  POS   TEX
           0, 1, 0, rh,
           1, 0, rw, 0,
           0, 0, 0, 0,
         
           0, 1, 0, rh,
           1, 1, rw, rh,
           1, 0, rw, 0
        ]);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, rectArray, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    private initRenderData(): void {
        const gl = this.context.gl;

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        const positionIndex = this.shader.getAttributeIndex('vertex');
        gl.enableVertexAttribArray(positionIndex);
        gl.vertexAttribPointer(positionIndex, 4, gl.FLOAT, false, 4 * 4, 0);

        // cleaup
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }
}

const SpriteShader: ShaderSource = {
    id: 'sprite-shader',

    vertexShader: `
    attribute vec4 vertex; //<vec2 position , vec2 texCoords>
        
    uniform mat4 projection;
    uniform mat4 model;
    uniform vec2 offset;

    varying vec2 texCoord;

    void main() {
        gl_Position = projection * model * vec4(vertex.xy, 0.0, 1.0);
        texCoord = vertex.zw + offset;
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

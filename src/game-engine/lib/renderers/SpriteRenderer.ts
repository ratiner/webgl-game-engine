import { mat4 } from 'gl-matrix';
import { Shader } from '../shader';
import { Texture2D } from '../texture-2d';
import { ShaderSource } from '../shader';
import { GameContext } from '../../';

export interface SpriteRenderOptions {
    position: [number, number];
    size: [number, number];
    rotate?: number;
    spriteSize?: [number, number];
    offset?: [number, number];
}

export class SpriteRenderer {
    private shader: Shader;
    private vertexBuffer: WebGLBuffer;

    constructor(private context: GameContext) {
        const gl = context.gl;
        this.shader = context.resources.getShader(SpriteShader);

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.getVertexMatrix(), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    render(texture: Texture2D, opts: SpriteRenderOptions = { position: [0, 0], size: null }) {
        if (!texture.isLoaded) {
            return;
        }

        const { position, size, rotate, spriteSize, offset } = opts;
        const gl = this.context.gl;

        this.shader.use();

        // transfom
        const model = mat4.create();
        mat4.translate(model, model, [position[0], position[1], 0]); // First translate (transformations are: scale happens first, then rotation and then finall translation happens; reversed order)
        if (rotate) {
            mat4.translate(model, model, [0.5 * size[0], 0.5 * size[1], 0]); // Move origin of rotation to center of quad
            mat4.rotate(model, model, rotate, [0, 0, 1]); // Then rotate
            mat4.translate(model, model, [-0.5 * size[0], -0.5 * size[1], 0]); // Move origin back
        }
        mat4.scale(model, model, [size[0], size[1], 1]); // Last scale
        this.shader.setMatrix4('model', model);

        // sprite
        const uv_x = spriteSize ? spriteSize[0] / texture.width : 1;
        const uv_y = spriteSize ? spriteSize[1] / texture.height : 1;
        const offset_x = offset ? offset[0] / texture.width : 0;
        const offset_y = offset ? offset[1] / texture.height : 0;

        this.shader.setVector2fXy('offset', offset_x, offset_y);
        this.shader.setVector2fXy('spriteSize', uv_x, uv_y);

        // draw
        this.shader.setInteger('image', 0);
        gl.activeTexture(gl.TEXTURE0);
        texture.bind();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
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
            0, 1,   0, 1,
            1, 0,   1, 0,
            0, 0,   0, 0,
        
            0, 1,   0, 1,
            1, 1,   1, 1,
            1, 0,   1, 0
        ]);
    }
}

const SpriteShader: ShaderSource = {
    id: 'sprite-shader',

    vertexShader: `
    attribute vec4 vertex; //<vec2 position , vec2 texCoords>
        
    uniform mat4 projection;
    uniform mat4 model;
    
    varying vec2 texCoord;

    void main() {
        gl_Position = projection * model * vec4(vertex.xy, 0.0, 1.0);
        texCoord = vertex.zw;
    }
    `,

    fragmentShader: `
    precision mediump float;
    uniform sampler2D image;

    uniform vec2 spriteSize;
    uniform vec2 offset;

    varying vec2 texCoord;

    void main() {
        gl_FragColor = texture2D(image, texCoord * spriteSize + offset);
    }
    `,
};

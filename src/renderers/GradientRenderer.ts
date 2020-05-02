import { mat4 } from 'gl-matrix';
import { Shader, ShaderSource } from '../core/shader';
import { GameContext } from '../game-context';

export interface GradientRenderOptions {
    position: [number, number];
    size: [number, number];
    steps: GradientStep[];
    rotate?: number;
}

export interface GradientStep {
    color: string;
}

export class GradientRenderer {
    private shader: Shader;
    private vertexBuffer: WebGLBuffer;
    private colorsBuffer: WebGLBuffer;
    private indices: number[];
    private indexBuffer: WebGLBuffer;

    constructor(private context: GameContext) {
        const gl = context.gl;
        this.shader = context.resources.getShader(GradientShader);

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.getVertexMatrix(), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.indices = [3, 2, 1, 3, 1, 0];
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.colorsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.getColorsMatrix(), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    render(opts: GradientRenderOptions) {
        const { position, size, rotate, steps } = opts;
        const gl = this.context.gl;

        this.shader.use();
        this.shader.setMatrix4('projection', this.context.projection.value);

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

        // draw
        let positionIndex: number;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        positionIndex = this.shader.getAttributeIndex('vertex');
        gl.enableVertexAttribArray(positionIndex);
        gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
        positionIndex = this.shader.getAttributeIndex('color');
        gl.enableVertexAttribArray(positionIndex);
        gl.vertexAttribPointer(positionIndex, 4, gl.FLOAT, false, 0, 0);

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

        // cleanup
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.useProgram(null);
    }

    private getVertexMatrix(): Float32Array {
        // prettier-ignore
        return new Float32Array([ 
            0, 1, 
            0, 0,
            1, 0,
            1, 1
        ]);
    }

    private getColorsMatrix(): Float32Array {
        // prettier-ignore
        return new Float32Array([ 
        //   R    G    B    A
            0.0, 1.0, 0.0, 1.0, 
            0.0, 1.0, 0.0, 1.0, 
            0.0, 0.0, 1.0, 1.0, 
            0.0, 0.0, 1.0, 1.0, 
        ]);
    }
}

export const GradientShader: ShaderSource = {
    id: 'gradient-shader',

    vertexShader: `
    attribute vec2 vertex; //position
    attribute vec4 color; //colors

    uniform mat4 projection;
    uniform mat4 model;

    varying vec4 out_color;
    void main() {
        gl_Position = projection * model * vec4(vertex, 0.0, 1.0);
        out_color = color;
    }
    `,

    fragmentShader: `
    precision mediump float;

    varying vec4 out_color;

    void main() {
        gl_FragColor = out_color;
    }
    `,
};

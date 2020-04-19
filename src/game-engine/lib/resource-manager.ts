import { Shader, ShaderSource } from './shader';
import { Texture2D } from './texture-2d';
import { mat4 } from 'gl-matrix';

export class ResourceManager {
    private shaders: { [id: string]: Shader };
    textures: { [id: string]: Texture2D };

    constructor(private gl: WebGL2RenderingContext) {
        this.shaders = {};
        this.textures = {};
    }

    getShader(shaderSource: ShaderSource): Shader {
        if (!this.shaders[shaderSource.id]) {
            this.shaders[shaderSource.id] = new Shader(this.gl, shaderSource.vertexShader, shaderSource.fragmentShader);
        }
        return this.shaders[shaderSource.id];
    }

    setShaderProjection(projection: Float32List): void {
        Object.keys(this.shaders).forEach((id) => {
            this.shaders[id].use().setMatrix4('projection', projection);
        });
    }

    clear(): void {
        const gl = this.gl;

        // (Properly) delete all shaders
        Object.keys(this.shaders).forEach((id) => {
            gl.deleteProgram(this.shaders[id].program);
        });

        // (Properly) delete all textures
        Object.keys(this.textures).forEach((id) => {
            gl.deleteProgram(this.textures[id].texture);
        });

        this.shaders = {};
        this.textures = {};
    }
}

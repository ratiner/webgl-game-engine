export interface ShaderSource {
    id: string;
    vertexShader: string;
    fragmentShader: string;
}

export class Shader {
    program: WebGLProgram;

    constructor(private gl: WebGL2RenderingContext, vertexShader: string, fragmentShader: string) {
        const vsShader = this.getShader(vertexShader, gl.VERTEX_SHADER);
        const fsShader = this.getShader(fragmentShader, gl.FRAGMENT_SHADER);

        if (vsShader && fsShader) {
            this.program = gl.createProgram();
            gl.attachShader(this.program, vsShader);
            gl.attachShader(this.program, fsShader);
            gl.linkProgram(this.program);

            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                console.error('Link Error: \n:' + gl.getProgramInfoLog(this.program));
                return null;
            }
        }

        gl.detachShader(this.program, vsShader);
        gl.detachShader(this.program, fsShader);
        gl.deleteShader(vsShader);
        gl.deleteShader(fsShader);
        gl.useProgram(null);
    }

    private getShader(source: string, type: number): WebGLShader {
        const gl = this.gl;
        const output = gl.createShader(type);
        gl.shaderSource(output, source);
        gl.compileShader(output);

        if (!gl.getShaderParameter(output, gl.COMPILE_STATUS)) {
            console.error('Shader Error: \n:' + gl.getShaderInfoLog(output));
        }
        return output;
    }

    public use(): Shader {
        this.gl.useProgram(this.program);
        return this;
    }

    // Utility functions
    public setFloat(name: string, value: number, useShader: boolean = false) {
        if (useShader) {
            this.use();
        }
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, name), value);
    }

    public setInteger(name: string, value: number, useShader: boolean = false) {
        if (useShader) {
            this.use();
        }
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, name), value);
    }

    public setVector2fXy(name: string, x: number, y: number, useShader: boolean = false): void {
        if (useShader) {
            this.use();
        }
        this.gl.uniform2f(this.gl.getUniformLocation(this.program, name), x, y);
    }

    public setVector2fVec2(name: string, vec2: [number, number], useShader: boolean = false): void {
        if (useShader) {
            this.use();
        }
        this.gl.uniform2f(this.gl.getUniformLocation(this.program, name), vec2[0], vec2[1]);
    }

    public setVector3fXyz(name: string, x: number, y: number, z: number, useShader: boolean = false): void {
        if (useShader) {
            this.use();
        }
        this.gl.uniform3f(this.gl.getUniformLocation(this.program, name), x, y, z);
    }

    public setVector3fVec3(name: string, vec3: [number, number, number], useShader: boolean = false): void {
        if (useShader) {
            this.use();
        }
        this.gl.uniform3f(this.gl.getUniformLocation(this.program, name), vec3[0], vec3[1], vec3[2]);
    }

    public setVector4fXyz(name: string, x: number, y: number, z: number, w: number, useShader: boolean = false): void {
        if (useShader) {
            this.use();
        }
        this.gl.uniform4f(this.gl.getUniformLocation(this.program, name), x, y, z, w);
    }

    public setVector4fVec4(name: string, vec4: [number, number, number, number], useShader: boolean = false): void {
        if (useShader) {
            this.use();
        }
        this.gl.uniform4f(this.gl.getUniformLocation(this.program, name), vec4[0], vec4[1], vec4[2], vec4[3]);
    }

    public setMatrix4(name: string, mat4: Float32List, useShader: boolean = false): void {
        if (useShader) {
            this.use();
        }
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, name), false, mat4);
    }

    public getAttributeIndex(name: string, useShader: boolean = false): number {
        if (useShader) {
            this.use();
        }
        return this.gl.getAttribLocation(this.program, name);
    }
}

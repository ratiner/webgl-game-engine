import { mat4 } from 'gl-matrix';
import { ResourceManager } from './core/resource-manager';
import { BackBuffer } from './core/back-buffer';
import { BlendMode } from './core/enums';

export abstract class GameContext {
    abstract setup(): void;
    abstract draw(): void;
    get width(): number {
        return this.canvas.width;
    }
    get height(): number {
        return this.canvas.height;
    }

    resources: ResourceManager;
    gl: WebGL2RenderingContext;

    private host: HTMLElement;
    private canvas: HTMLCanvasElement;

    constructor() {
        // Setup
        this.canvas = document.createElement('canvas');
        this.canvas.style.backgroundColor = 'black';
        this.canvas.style.overflow = 'hidden'; // Prevents white spacesw hen resizing (where scrolls used to be)

        // Initialize WebGL Context
        this.gl = this.canvas.getContext('webgl2');
        this.gl.clearColor(0.4, 0.6, 1.0, 0.0);
        this.gl.enable(this.gl.BLEND);

        // Initialize Engine
        this.resources = new ResourceManager(this.gl);

        this.setup(); // Let user handle additional setup stuff
    }

    resize(width?: number, height?: number) {
        if (!this.host) {
            console.error('cannot resize before attaching');
            return;
        }

        width = width ? width : this.host.clientWidth;
        height = height ? height : this.host.clientHeight;
        this.canvas.width = width;
        this.canvas.height = height;

        // Set Projection
        const projection = mat4.create();
        mat4.ortho(projection, 0, width, height, 0, -1, 1);
        this.resources.setShaderProjection(projection);
    }

    attach(hostElement: HTMLElement): void {
        this.host = hostElement;
        this.host.style.overflow = 'hidden'; // Prevents white spacesw hen resizing (where scrolls used to be)
        this.host.appendChild(this.canvas);
        this.resize();
        this.drawLoop();
    }

    setBuffer(buffer: BackBuffer) {
        const gl = this.gl;
        if (!!buffer) {
            gl.viewport(0, 0, buffer.width, buffer.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, buffer.frameBuffer);
        } else {
            // main buffer
            gl.viewport(0, 0, this.width, this.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
    }

    setBlendMode(blndMode: BlendMode): void {
        const gl = this.gl;

        switch (blndMode) {
            case BlendMode.ALPHA:
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                break;
            case BlendMode.ADDITIVE:
                gl.blendFunc(gl.ONE, gl.ONE);
                break;
            case BlendMode.MULTIPLY:
                gl.blendFunc(gl.DST_COLOR, gl.ZERO);
                break;
        }
    }

    private drawLoop() {
        // TODO: fps calc
        const gl = this.gl;

        // Activate main buffer
        this.setBuffer(null);
        this.setBlendMode(BlendMode.ALPHA);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.draw();

        gl.flush();

        requestAnimationFrame(() => this.drawLoop());
    }
}

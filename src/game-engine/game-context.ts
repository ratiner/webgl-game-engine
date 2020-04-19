import { mat4 } from 'gl-matrix';
import { BackBuffer } from './lib/back-buffer';
import { ResourceManager } from './lib/resource-manager';

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
    private backBuffer: BackBuffer;

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
        this.backBuffer = new BackBuffer(this, { width: 1920, height: 1080 });

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

    private drawLoop() {
        // TODO: fps calc
        const gl = this.gl;

        // Activate back buffer
        gl.viewport(0, 0, this.backBuffer.width, this.backBuffer.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.backBuffer.frameBuffer);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.draw();

        // Activate main buffer
        gl.viewport(0, 0, this.width, this.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        this.backBuffer.draw();

        gl.flush();

        requestAnimationFrame(() => this.drawLoop());
    }
}

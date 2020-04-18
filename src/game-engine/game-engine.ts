import { GameContext } from './lib/game-context';
import { BackBuffer } from './lib/back-buffer';

export class GameEngine {
    private host: HTMLElement;
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private context: GameContext;
    private backBuffer: BackBuffer;

    constructor(hostElement: HTMLElement) {
        // Setup
        this.host = hostElement;
        this.canvas = document.createElement('canvas');
        this.canvas.style.backgroundColor = 'black';
        this.canvas.style.overflow = 'hidden'; // Prevents white spacesw hen resizing (where scrolls used to be)
        this.host.style.overflow = 'hidden'; // Prevents white spacesw hen resizing (where scrolls used to be)

        // Initialize WebGL Context
        this.gl = this.canvas.getContext('webgl2');
        this.gl.clearColor(0.4, 0.6, 1.0, 0.0);
        this.gl.enable(this.gl.BLEND);

        // Initialize Game Context
        this.context = new GameContext(this.gl);
        this.resize();
        this.backBuffer = new BackBuffer(this.context, { width: 512, height: 512 });

        // Begin Draw Loop
        hostElement.appendChild(this.canvas);
        this.drawLoop();
    }

    resize(width?: number, height?: number) {
        width = width ? width : this.host.clientWidth;
        height = height ? height : this.host.clientHeight;
        this.canvas.width = width;
        this.canvas.height = height;
        this.context.onResize(width, height);
    }

    private drawLoop() {
        // TODO: fps calc
        const gl = this.gl;

        // Activate back buffer
        gl.viewport(0, 0, this.backBuffer.width, this.backBuffer.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.backBuffer.frameBuffer);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.context.onRender();

        // Activate main buffer
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        this.backBuffer.render();

        gl.flush();

        requestAnimationFrame(() => this.drawLoop());
    }
}

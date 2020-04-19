import { SpriteRenderer } from 'src/game-engine/lib/renderers/SpriteRenderer';
import { Texture2D } from 'src/game-engine/lib/texture-2d';
import { GameContext } from 'src/game-engine';

export class DemoGame extends GameContext {
    renderer: SpriteRenderer;
    pos: number = 0;
    index: number = 0;

    constructor() {
        super();

        const hostElement = document.getElementById('host');
        this.attach(hostElement);
        // Bind to events
        window.onresize = () => this.resize();
    }

    setup() {
        const { gl } = this;

        // TODO: Preload shaders / textures here
        this.renderer = new SpriteRenderer(this);
        const background = new Texture2D(gl, '/assets/bg.png', false);
        this.resources.textures['background'] = background;
        const dino = new Texture2D(gl, '/assets/dino.png', true);
        this.resources.textures['dino'] = dino;
    }

    draw() {
        const { width, height, resources } = this;

        const d = new Date() as any;
        this.index = Math.floor((d * 0.006) % 5);
        this.pos += 1;
        // render scene
        this.renderer.render(resources.textures['background'], {
            position: [-this.pos % width, 0],
            size: [width + (this.pos % width), height],
            offset: [this.pos % width, 0],
        });

        this.renderer.render(resources.textures['dino'], {
            position: [20 + (this.pos % width), height - 290],
            size: [360, 250],
            spriteSize: [685, 475],
            offset: [this.index * 685, 0],
            rotate: 0,
        });
    }
}

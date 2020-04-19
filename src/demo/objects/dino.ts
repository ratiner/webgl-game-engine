import { GameObject, GameContext } from 'src/game-engine';
import { Texture2D } from 'src/game-engine/lib/texture-2d';
import { SpriteRenderer } from 'src/game-engine/lib/renderers/SpriteRenderer';

export class Dino implements GameObject {
    private renderer: SpriteRenderer;
    pos: number = 0;
    index: number = 0;

    constructor(private context: GameContext) {
        const dino = new Texture2D(context.gl, '/assets/dino.png', true);
        context.resources.textures['dino'] = dino;

        this.renderer = new SpriteRenderer(this.context);
    }

    draw(): void {
        const { width, height, resources } = this.context;

        this.renderer.render(resources.textures['dino'], {
            position: [20 + (this.pos % width), height - 290],
            size: [360, 250],
            spriteSize: [685, 475],
            offset: [this.index * 685, 0],
            rotate: 0,
        });
    }
}

import { GameObject, GameContext } from 'src/game-engine';
import { SpriteRenderer } from 'src/game-engine/lib/renderers/SpriteRenderer';
import { Texture2D } from 'src/game-engine/lib/texture-2d';

export class Background implements GameObject {
    private renderer: SpriteRenderer;
    pos: number = 0;

    constructor(private context: GameContext) {
        const background = new Texture2D(context.gl, '/assets/bg.png', false);
        context.resources.textures['background'] = background;

        this.renderer = new SpriteRenderer(this.context);
    }

    draw(): void {
        const { width, height, resources } = this.context;
        this.renderer.render(resources.textures['background'], {
            position: [-this.pos % width, 0],
            size: [width + (this.pos % width), height],
            offset: [this.pos % width, 0],
        });
    }
}

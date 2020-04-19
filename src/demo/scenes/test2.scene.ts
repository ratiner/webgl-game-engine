import { GameLayer, GameContext, SimpleGameLayer, BlendMode } from 'src/game-engine';
import { SpriteRenderer } from 'src/game-engine/lib/renderers/SpriteRenderer';
import { Background } from '../objects/background';
import { Dino } from '../objects/dino';

export class Test2Scene extends GameLayer {
    renderer: SpriteRenderer;
    background: Background;
    dino: Dino;

    index: number = 0;
    pos: number = 0;

    constructor(context: GameContext) {
        super(context, { width: 1000, height: 1000 });
        this.background = new Background(context);
        this.dino = new Dino(context);

        this.objects = [this.background, this.dino];
    }

    update(): void {
        const d = new Date() as any;
        this.index = Math.floor((d * 0.006) % 5);
        this.pos += 1;

        this.background.pos = -this.pos;
        this.dino.pos = this.pos;
        this.dino.index = this.index;
    }
}

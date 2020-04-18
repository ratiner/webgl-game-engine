import { ResourceManager } from './resource-manager';
import { SpriteRenderer } from './renderers/SpriteRenderer';
import { Texture2D } from './texture-2d';
import { mat4 } from 'gl-matrix';

export class GameContext {
    resources: ResourceManager;
    renderer: SpriteRenderer;
    width: number;
    height: number;

    constructor(public gl: WebGL2RenderingContext) {
        this.resources = new ResourceManager(gl);

        // TODO: Preload shaders / textures here
        this.renderer = new SpriteRenderer(this);

        const background = new Texture2D(this.gl, '/assets/bg.png', false);
        this.resources.textures['background'] = background;
    }

    onResize(width: number, height: number) {
        this.width = width;
        this.height = height;

        // Set Projection
        const projection = mat4.create();
        mat4.ortho(projection, 0, width, height, 0, -1, 1);
        this.resources.setShaderProjection(projection);
    }

    onRender() {
        // render scene
        this.renderer.render(this.resources.textures['background'], {
            position: [0, 0],
            size: [this.width, this.height],
        });
    }

    processInput(): void {}
}

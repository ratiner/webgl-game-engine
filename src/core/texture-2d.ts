export class Texture2D {
    // Texture Format
    internalFormat: number; // Format of texture object
    imageFormat: number; // Format of loaded image
    // Texture configuration
    wrapS: number; // Wrapping mode on S axis
    wrapT: number; // Wrapping mode on T axis
    filterMin: number; // Filtering mode if texture pixels < screen pixels
    filterMax: number; // Filtering mode if texture pixels > screen pixels

    isLoaded: boolean = false;
    texture: WebGLTexture;
    width: number;
    height: number;

    constructor(private gl: WebGL2RenderingContext, img_url: string, alpha: boolean) {
        this.texture = gl.createTexture();
        this.internalFormat = alpha ? gl.RGBA : gl.RGB;
        this.imageFormat = alpha ? gl.RGBA : gl.RGB;

        // Default Values
        this.wrapS = gl.REPEAT; //gl.MIRRORED_REPEAT
        this.wrapT = gl.REPEAT; //gl.MIRRORED_REPEAT
        this.filterMin = gl.LINEAR; //gl.NEAREST
        this.filterMax = gl.LINEAR; //gl.NEAREST

        const image = new Image();
        image.src = img_url;
        image.onload = () => {
            this.setup(image);
        };
    }

    setup(image: HTMLImageElement): void {
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.internalFormat, this.imageFormat, gl.UNSIGNED_BYTE, image);
        // Set Texture wrap and filter modes
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filterMin);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filterMax);
        // Unbind texture
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.isLoaded = true;
        this.width = image.width;
        this.height = image.height;
    }

    bind(): void {
        // Binds the texture as the current active GL_TEXTURE_2D texture object
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }
}

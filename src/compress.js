import sharp from 'sharp';
import { redirect } from './redirect.js';

export async function compressImg(request, reply, imgStream) {
    const imgFormat = request.params.webp ? 'webp' : 'jpeg';
    const grayscale = Boolean(request.params.grayscale);
    const quality = request.params.quality;
    const originSize = request.params.originSize;

    try {
        // Create a Sharp instance that processes the stream
        const { data, info } = await sharp(imgStream)
            .grayscale(grayscale)
            .toFormat(imgFormat, {
                quality,
                progressive: true,
                optimizeScans: true,
                chromaSubsampling: '4:4:4',
            })
            .toBuffer({ resolveWithObject: true });

        reply
            .header('content-type', `image/${imgFormat}`)
            .header('content-length', info.size)
            .header('x-original-size', originSize)
            .header('x-bytes-saved', originSize - info.size)
            .code(200)
            .send(data);
    } catch (error) {
        return redirect(request, reply);
    }
}


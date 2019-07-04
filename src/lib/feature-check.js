/* global document navigator */
/* eslint-disable import/prefer-default-export */

// Modified from: https://stackoverflow.com/a/40511297
export const supportsWebMAlpha = (callback) => {
  if (navigator.userAgent.match(/Android.+(Chrome|Firefox)\//)) {
    // Android Chrome & Firefox lie with the test below, not sure why.
    callback(false);
    return;
  }

  const vid = document.createElement('video');
  vid.autoplay = true;
  vid.playsinline = true;
  vid.muted = true;
  vid.loop = false;
  vid.style.display = 'none';

  vid.addEventListener('loadeddata', () => {
    document.body.removeChild(vid);
    // Create a canvas element, this is what user sees.
    const canvas = document.createElement('canvas');

    // If we don't support the canvas, we definitely don't support webm alpha video.
    if (!(canvas.getContext && canvas.getContext('2d'))) {
      callback(false);
      return;
    }

    // Get the drawing context for canvas.
    const ctx = canvas.getContext('2d');

    // Draw the current frame of video onto canvas.
    ctx.drawImage(vid, 0, 0);
    if (ctx.getImageData(0, 0, 1, 1).data[3] === 0) {
      callback(true);
    } else {
      callback(false);
    }
  }, false);

  vid.addEventListener('error', () => {
    try {
      document.body.removeChild(vid);
    } catch (err) {
      // do nothing
    }
    callback(false);
  });

  vid.addEventListener('stalled', () => {
    document.body.removeChild(vid);
    callback(false);
  });

  // Just in case
  vid.addEventListener('abort', () => {
    document.body.removeChild(vid);
    callback(false);
  });

  const source = document.createElement('source');
  source.src = 'data:video/webm;base64,GkXfowEAAAAAAAAfQoaBAUL3gQFC8oEEQvOBCEKChHdlYm1Ch4ECQoWBAhhTgGcBAAAAAAACBRFNm3RALE27i1OrhBVJqWZTrIHlTbuMU6uEFlSua1OsggEjTbuMU6uEHFO7a1OsggHo7AEAAAAAAACqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmAQAAAAAAADIq17GDD0JATYCNTGF2ZjU3LjU3LjEwMFdBjUxhdmY1Ny41Ny4xMDBEiYhARAAAAAAAABZUrmsBAAAAAAAARq4BAAAAAAAAPdeBAXPFgQGcgQAitZyDdW5khoVWX1ZQOYOBASPjg4QCYloA4AEAAAAAAAARsIFAuoFAmoECU8CBAVSygQQfQ7Z1AQAAAAAAAGfngQCgAQAAAAAAAFuhooEAAACCSYNCAAPwA/YAOCQcGFQAADBgAABnP///NXgndmB1oQEAAAAAAAAtpgEAAAAAAAAk7oEBpZ+CSYNCAAPwA/YAOCQcGFQAADBgAABnP///Vttk7swAHFO7awEAAAAAAAARu4+zgQC3iveBAfGCAXXwgQM=';
  source.addEventListener('error', () => {
    try {
      document.body.removeChild(vid);
    } catch (err) {
      // do nothing
    }
    callback(false);
  });
  vid.appendChild(source);

  // This is required for IE
  document.body.appendChild(vid);
};

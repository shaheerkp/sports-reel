import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

// Step 0: Define image list and temp directory


const tempDir = path.resolve('temp');

// Make sure temp folder exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Resolve full paths for image and audio files (assume all in /temp now)

const clips: string[] = [];
let index = 0;

// Step 1: Create clips for each image
export function createClip(name: string): Promise<void> {
  const imageDurations = [0, 1, 2, 3, 4].map((ele, index) => ({
    file: `${name}-${index}.jpg`,
    duration: 6
  }));

  const resolvedImages = imageDurations.map(({ file, duration }, index) => ({
    file: path.join(tempDir, `${name}-${index}.jpg`),
    duration,
  }));

  return new Promise((resolve, reject) => {
    const clips: string[] = [];
    let index = 0;

    function processNextImage() {
      if (index >= resolvedImages.length) {
        return concatenateClips(name, clips).then(resolve).catch(reject);
      }

      const { file, duration } = resolvedImages[index];
      const outFile = path.join(tempDir, `${name}-${index}.mp4`);
      clips.push(outFile);

      ffmpeg()
        .input(file)
        .loop(duration)
        .outputOptions([
          '-c:v libx264',
          `-t ${duration}`,
          '-pix_fmt yuv420p',
          '-vf scale=1280:720',
          '-r 30'
        ])
        .output(outFile)
        .on('end', () => {
          index++;
          processNextImage();
        })
        .on('error', (err:any) => reject(err))
        .run();
    }

    processNextImage();
  });
}

// Step 2: Concatenate all clips
function concatenateClips(name: string, clips: string[]): Promise<void> {
  const concatList = path.join(tempDir, 'concat_list.txt');
  const tempVideo = path.join(tempDir, `${name}-temp.mp4`);

  fs.writeFileSync(concatList, clips.map(c => `file '${c}'`).join('\n'));

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatList)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])
      .output(tempVideo)
      .on('end', () => {
        console.log('✅ Image video created');
        addAudio(tempVideo, name).then(resolve).catch(reject);
      })
      .on('error', reject)
      .run();
  });
}

function addAudio(tempVideo: string, name: string): Promise<void> {
  const finalOutput = path.join(tempDir, `${name}.mp4`);
  const audioFile = path.join(tempDir, `${name}.mp3`);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(tempVideo)
      .input(audioFile)
      .outputOptions(['-c:v copy', '-c:a aac', '-shortest'])
      .output(finalOutput)
      .on('end', () => {
        console.log(`🎉 Final video created at: ${finalOutput}`);
        resolve();
      })
      .on('error', reject)
      .run();
  });
}

// Step 3: Add audio and finalize video
// function addAudio(tempVideo: string,name:string) {
//   const finalOutput = path.join(tempDir, `${name}.mp4`);
//   const audioFile = path.join(tempDir, `${name}.mp3`);


//   ffmpeg()
//     .input(tempVideo)
//     .input(audioFile)
//     .outputOptions(['-c:v copy', '-c:a aac', '-shortest'])
//     .output(finalOutput)
//     .on('end', () => {
//       console.log(`🎉 Final video created at: ${finalOutput}`);
//       // cleanupTempFiles(tempVideo);
//     })
//     .on('error', (err: any) => console.error('Audio error:', err.message))
//     .run();
// }

// Step 4: Cleanup all temp files except output.mp4
function cleanupTempFiles(tempVideo: string) {
  try {
    fs.unlinkSync(tempVideo);
    fs.unlinkSync(path.join(tempDir, 'concat_list.txt'));
    clips.forEach(file => fs.unlinkSync(file));
    console.log('🧹 Cleaned up all intermediate files.');
  } catch (err: any) {
    console.error('❌ Cleanup error:', err.message);
  }
}


import * as fs from "fs";

export const downloadImage = async (url, path) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(path, buffer);
    console.log("Image downloaded successfully: ", path);
  } catch (error) {
    console.log(error);
  }
};

export const downloadImages = async (images) => {
  for (let i = 0; i < images.length; i++) {
    const { url, path } = images[i];
    await downloadImage(url, path);
  }
};

export const deleteImage = async (path) => {
  try {
    fs.rmSync(path, {
      force: true,
    });
    console.log("Image deleted successfully: ", path);
  } catch (error) {
    console.log(error);
  }
};

export const deleteMultipleImages = async (paths) => {
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    await deleteImage(path);
  }
};

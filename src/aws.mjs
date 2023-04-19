import * as dotenv from "dotenv";
import { Upload } from "@aws-sdk/lib-storage";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";

dotenv.config();

const client = new S3Client({});

export const uploadFile = async (path, key) => {
  const fileContent = fs.readFileSync(path);
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileContent,
  };
  try {
    const parallelUploads3 = new Upload({
      client,
      params,
    });
    parallelUploads3.on("httpUploadProgress", (progress) => {
      console.log(progress);
    });
    return await parallelUploads3.done();
  } catch (error) {
    console.error(error);
  }
};

export const uploadFileByURL = async (url, key) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
  };
  try {
    const parallelUploads3 = new Upload({
      client,
      params,
    });
    parallelUploads3.on("httpUploadProgress", (progress) => {
      console.log(progress);
    });
    return await parallelUploads3.done();
  } catch (error) {
    console.error(error);
  }
};

export const deleteFile = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });

  try {
    const response = await client.send(command);
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

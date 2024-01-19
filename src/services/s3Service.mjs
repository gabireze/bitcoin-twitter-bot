import { DeleteObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.MY_CUSTOM_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_CUSTOM_SECRET_ACCESS_KEY,
  },
});

export const uploadFile = async (path, key) => {
  try {
    const fileContent = fs.readFileSync(path);

    if (!fileContent) {
      throw { message: "Failed to read file content", error: null };
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: fileContent,
    };

    const parallelUploads3 = new Upload({
      client,
      params,
    });

    parallelUploads3.on("httpUploadProgress", (progress) => {
      console.log(progress);
    });

    await parallelUploads3.done();

    return "File uploaded successfully";
  } catch (error) {
    const errorMessage = "Failed to upload file to AWS S3";
    console.error(errorMessage, error);
    throw { message: errorMessage, error };
  }
};

export const uploadFileByURL = async (url, key) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw { message: `Failed to fetch the file from ${url}`, error: null };
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
    };

    const parallelUploads3 = new Upload({
      client,
      params,
    });

    parallelUploads3.on("httpUploadProgress", (progress) => {
      console.log(progress);
    });

    await parallelUploads3.done();

    return "File uploaded successfully";
  } catch (error) {
    const errorMessage = "Failed to upload file to AWS S3";
    throw { message: errorMessage, error };
  }
};

export const uploadFileByBuffer = async (buffer, key) => {
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

    await parallelUploads3.done();

    const getSignedUrlCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    const signedUrl = await getSignedUrl(client, getSignedUrlCommand, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    const errorMessage = "Failed to upload file to AWS S3";
    throw new Error({ message: errorMessage, error });
  }
};

export const deleteFile = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    const response = await client.send(command);

    if (response && response.$metadata.httpStatusCode === 204) {
      console.log("File deleted successfully");
    } else {
      throw { message: "Failed to delete the file", error: null };
    }
  } catch (error) {
    const errorMessage = "Failed to delete file from AWS S3";
    throw { message: errorMessage, error };
  }
};

import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

export default s3;

export const uploadToS3 = async (
  key: string,
  body: Buffer | string,
  contentType: string
): Promise<string> => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || 'right-to-read-bucket',
      Key: key,
      Body: body,
      ContentType: contentType,
    };

    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

export const getS3Url = (key: string): string => {
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

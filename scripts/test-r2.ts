import { config } from "dotenv";
import {
  ListBucketsCommand,
  S3Client,
} from "@aws-sdk/client-s3";

config({ path: ".env.local" });

const required = [
  "AWS_ENDPOINT_URL_S3",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "S3_BUCKET",
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error("Missing R2 environment variables:");
  console.error(missing.join("\n"));
  process.exit(1);
}

const client = new S3Client({
  region: process.env.AWS_REGION!,
  endpoint: process.env.AWS_ENDPOINT_URL_S3!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function main() {
  console.log("Testing Cloudflare R2 connection...");
  console.log(`Bucket: ${process.env.S3_BUCKET}`);

  const result = await client.send(new ListBucketsCommand({}));

  const buckets = result.Buckets ?? [];

  console.log("");
  console.log("✓ R2 connection successful");
  console.log("");
  console.log("Available buckets:");

  for (const bucket of buckets) {
    console.log(`  - ${bucket.Name}`);
  }

  const target = buckets.find(
    (bucket) => bucket.Name === process.env.S3_BUCKET
  );

  if (target) {
    console.log("");
    console.log(`✓ Target bucket "${process.env.S3_BUCKET}" found`);
  } else {
    console.error("");
    console.error(
      `✗ Bucket "${process.env.S3_BUCKET}" was not found`
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("");
  console.error("✗ R2 connection failed");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
});

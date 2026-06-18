import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { CreateAvatarUploadDto } from './dto/avatar-upload.dto.js';

@Injectable()
export class AvatarService {
  private readonly client: S3Client;

  constructor(private readonly config: ConfigService) {
    this.client = new S3Client({
      endpoint: this.config.get<string>('s3.endpoint'),
      region: this.config.get<string>('s3.region') ?? 'us-east-1',
      forcePathStyle: true,
      credentials: this.config.get<string>('s3.accessKeyId') && this.config.get<string>('s3.secretAccessKey')
        ? {
            accessKeyId: this.config.get<string>('s3.accessKeyId') as string,
            secretAccessKey: this.config.get<string>('s3.secretAccessKey') as string,
          }
        : undefined,
    });
  }

  async createUpload(userId: string, dto: CreateAvatarUploadDto) {
    const bucket = this.config.get<string>('s3.bucket');
    if (!bucket) {
      throw new ServiceUnavailableException('Avatar storage is not configured');
    }
    const extension = dto.mimeType.split('/')[1] === 'jpeg' ? 'jpg' : dto.mimeType.split('/')[1];
    const storageKey = `avatars/${userId}/${randomUUID()}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      ContentType: dto.mimeType,
      ContentLength: dto.byteSize,
      Metadata: { originalName: dto.fileName, userId },
    });
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 300 });
    return { uploadUrl, storageKey, expiresIn: 300 };
  }

  publicUrl(storageKey: string) {
    const endpoint = this.config.get<string>('s3.publicBaseUrl') ?? this.config.get<string>('s3.endpoint');
    const bucket = this.config.get<string>('s3.bucket');
    if (!endpoint || !bucket) {
      return storageKey;
    }
    return `${endpoint.replace(/\/$/, '')}/${bucket}/${storageKey}`;
  }
}

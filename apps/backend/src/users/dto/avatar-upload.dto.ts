import { IsIn, IsInt, IsString, Max, Min } from 'class-validator';

export class CreateAvatarUploadDto {
  @IsString()
  fileName!: string;

  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  mimeType!: 'image/jpeg' | 'image/png' | 'image/webp';

  @IsInt()
  @Min(1)
  @Max(5_242_880)
  byteSize!: number;
}

export class CompleteAvatarUploadDto {
  @IsString()
  storageKey!: string;
}

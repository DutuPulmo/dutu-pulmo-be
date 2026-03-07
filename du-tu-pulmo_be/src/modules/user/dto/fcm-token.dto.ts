import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FcmTokenDto {
  @ApiProperty({
    description: 'Firebase Cloud Messaging Device Token',
    example: 'dXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}

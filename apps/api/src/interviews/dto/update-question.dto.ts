import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateQuestionRequestDto {
  @IsOptional()
  @IsString()
  stageType?: string;

  @IsOptional()
  @IsString()
  questionText?: string;

  @IsOptional()
  @IsString()
  followUps?: string | null;

  @IsOptional()
  @IsString()
  tips?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

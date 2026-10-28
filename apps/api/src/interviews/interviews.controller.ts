import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewSubmissionDto } from '@rd-intel/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { UpdateQuestionRequestDto } from './dto/update-question.dto';

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  async submitInterview(
    @Body() data: CreateInterviewSubmissionDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.interviewsService.submitInterview(data, user.id);
  }

  // Owner-only edit — authorization enforced in the service via QuestionOwnership.
  @Patch('questions/:id')
  @UseGuards(JwtAuthGuard)
  async updateQuestion(
    @Param('id') id: string,
    @Body() data: UpdateQuestionRequestDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.interviewsService.updateQuestion(id, user.id, data);
  }

  // Admin-only delete.
  @Delete('questions/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteQuestion(@Param('id') id: string) {
    return this.interviewsService.deleteQuestion(id);
  }
}

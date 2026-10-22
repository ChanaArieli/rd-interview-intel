import { Controller, Post, Body } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewSubmissionDto } from '@rd-intel/shared';

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post('submit')
  async submitInterview(@Body() data: CreateInterviewSubmissionDto) {
    return this.interviewsService.submitInterview(data);
  }
}

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInterviewSubmissionDto,
  UpdateInterviewQuestionDto
} from '@rd-intel/shared';

@Injectable()
export class InterviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async submitInterview(data: CreateInterviewSubmissionDto, userId: string) {
    // Find or create company by name
    let company = await this.prisma.company.findUnique({
      where: { name: data.companyName }
    });

    if (!company) {
      // Generate slug from company name
      const slug = data.companyName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      company = await this.prisma.company.create({
        data: {
          name: data.companyName,
          slug: slug || 'unknown'
        }
      });
    }

    const report = await this.prisma.interviewReport.create({
      data: {
        companyId: company.id,
        roleCategory: data.roleCategory || null,
        seniority: data.seniority || null,
        interviewPeriod: data.interviewPeriod,
        difficulty: data.difficulty || 3,
        overallProcess: data.overallProcess || null,
        questions: {
          create: data.questions.map(q => ({
            stageType: q.stageType,
            questionText: q.questionText,
            followUps: q.followUps || null,
            tips: q.tips || null,
            tags: q.tags || []
          }))
        }
      },
      include: {
        questions: true
      }
    });

    // Record private ownership for each created question (never exposed publicly).
    await this.prisma.questionOwnership.createMany({
      data: report.questions.map(q => ({ questionId: q.id, userId }))
    });

    return report;
  }

  /**
   * Owner-only edit. Authorizes via the private QuestionOwnership table.
   */
  async updateQuestion(
    questionId: string,
    userId: string,
    data: UpdateInterviewQuestionDto
  ) {
    const ownership = await this.prisma.questionOwnership.findUnique({
      where: { questionId }
    });

    if (!ownership || ownership.userId !== userId) {
      // Same response whether the question is unowned or owned by someone else —
      // don't leak ownership information.
      throw new ForbiddenException('You can only edit questions you submitted');
    }

    const updated = await this.prisma.interviewQuestion.update({
      where: { id: questionId },
      data: {
        ...(data.stageType !== undefined && { stageType: data.stageType }),
        ...(data.questionText !== undefined && { questionText: data.questionText }),
        ...(data.followUps !== undefined && { followUps: data.followUps }),
        ...(data.tips !== undefined && { tips: data.tips }),
        ...(data.tags !== undefined && { tags: data.tags })
      }
    });

    return updated;
  }

  /**
   * Admin-only delete. Also removes the private ownership record.
   */
  async deleteQuestion(questionId: string) {
    const question = await this.prisma.interviewQuestion.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    await this.prisma.$transaction([
      this.prisma.questionOwnership.deleteMany({ where: { questionId } }),
      this.prisma.interviewQuestion.delete({ where: { id: questionId } })
    ]);

    return { success: true };
  }
}

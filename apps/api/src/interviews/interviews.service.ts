import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterviewSubmissionDto } from '@rd-intel/shared';

@Injectable()
export class InterviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async submitInterview(data: CreateInterviewSubmissionDto) {
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

    return report;
  }
}

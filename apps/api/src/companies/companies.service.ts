import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanySummaryDto } from '@rd-intel/shared';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<CompanySummaryDto[]> {
    const companies = await this.prisma.company.findMany({
      include: {
        reports: {
          include: {
            questions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return companies.map((company: any) => {
      const allQuestions = company.reports.flatMap((r: any) => r.questions);
      const stageTypes = [...new Set(allQuestions.map((q: any) => q.stageType))] as string[];
      const tags = [...new Set(allQuestions.flatMap((q: any) => q.tags))] as string[];

      return {
        id: company.id,
        name: company.name,
        slug: company.slug,
        industry: company.industry,
        reportCount: company.reports.length,
        questionCount: allQuestions.length,
        stageTypes,
        tags,
        createdAt: company.createdAt
      };
    });
  }

  async getBySlug(slug: string): Promise<CompanySummaryDto | null> {
    const company = await this.prisma.company.findUnique({
      where: { slug },
      include: {
        reports: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!company) {
      return null;
    }

    const allQuestions = company.reports.flatMap((r: any) => r.questions);
    const stageTypes = [...new Set(allQuestions.map((q: any) => q.stageType))] as string[];
    const tags = [...new Set(allQuestions.flatMap((q: any) => q.tags))] as string[];

    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      industry: company.industry,
      reportCount: company.reports.length,
      questionCount: allQuestions.length,
      stageTypes,
      tags,
      createdAt: company.createdAt,
      reports: company.reports.map((r: any) => ({
        id: r.id,
        companyId: r.companyId,
        roleCategory: r.roleCategory,
        seniority: r.seniority,
        interviewPeriod: r.interviewPeriod,
        overallProcess: r.overallProcess,
        difficulty: r.difficulty,
        createdAt: r.createdAt,
        questions: r.questions
      }))
    } as any;
  }
}

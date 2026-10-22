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

    return companies.map((company) => {
      const allQuestions = company.reports.flatMap((r) => r.questions);
      const stageTypes = [...new Set(allQuestions.map((q) => q.stageType))];
      const tags = [...new Set(allQuestions.flatMap((q) => q.tags))];

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

  async getBySlug(slug: string) {
    return this.prisma.company.findUnique({
      where: { slug },
      include: {
        reports: {
          include: {
            questions: true
          }
        }
      }
    });
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanySummaryDto } from '@rd-intel/shared';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async getAll(): Promise<CompanySummaryDto[]> {
    return this.companiesService.getAll();
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.companiesService.getBySlug(slug);
  }
}

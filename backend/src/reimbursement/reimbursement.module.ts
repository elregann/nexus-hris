import { Module } from '@nestjs/common';
import { ReimbursementService } from './reimbursement.service';
import { ReimbursementController } from './reimbursement.controller';

@Module({
  providers: [ReimbursementService],
  controllers: [ReimbursementController]
})
export class ReimbursementModule {}

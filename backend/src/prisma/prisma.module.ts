import { Global, Module } from '@nestjs/common';
import { PrimaryPrismaService } from './primary-prisma.service';
import { SecondaryPrismaService } from './secondary-prisma.service';

@Global()
@Module({
  providers: [PrimaryPrismaService, SecondaryPrismaService],
  exports: [PrimaryPrismaService, SecondaryPrismaService],
})
export class PrismaModule {}

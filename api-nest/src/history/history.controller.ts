import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AddHistoryDto } from './dto/add-history.dto';
import { GetHistoryDto } from './dto/get-history.dto';
import { DeleteHistoryDto } from './dto/delete-history.dto';

interface AuthenticatedRequest {
  user: { userId: string; googleId: string; email: string };
}

@Controller('history')
@UseGuards(AuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post('me')
  async addHistory(
    @Req() req: AuthenticatedRequest,
    @Body() body: AddHistoryDto,
  ) {
    const data = await this.historyService.addSearchQueryHistory(
      req.user.userId,
      body.query,
    );
    return {
      success: true,
      data,
    };
  }

  @Get('me')
  async getHistory(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetHistoryDto,
  ) {
    const data = await this.historyService.getUserQueryHistoryLazy(
      req.user.userId,
      query.limit,
      query.cursor,
    );
    return {
      success: true,
      data,
    };
  }

  @Delete('me')
  async deleteHistory(
    @Req() req: AuthenticatedRequest,
    @Body() body: DeleteHistoryDto,
  ) {
    const count = await this.historyService.softDelQueryHistory(
      req.user.userId,
      body.ids,
    );

    if (count === 0) {
      throw new NotFoundException(
        'History entries not found or already deleted.',
      );
    }

    return {
      success: true,
    };
  }
}

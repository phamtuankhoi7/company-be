import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskService } from 'src/task/task.service';
import { UserRoleEnum } from 'src/user/interfaces/role-user.enum';
import { UserService } from 'src/user/user.service';
import { CreateAssignTaskDto } from './dto/create-assign-task.dto';
import { UpdateAssignTaskDto } from './dto/update-assign-task.dto';
import { AssignTask, AssignTaskDocument } from './schema/assign-task.schema';

@Injectable()
export class AssignTaskService {
  private readonly logger = new Logger(AssignTask.name);

  constructor(
    @InjectModel(AssignTask.name) private model: Model<AssignTaskDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => TaskService))
    private taskService: TaskService,
  ) {}

  async list() {
    return await this.model.find();
  }

  async findByTask(id: string) {
    return this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$task', { $toObjectId: id }],
          },
        },
      },
    ]);
  }

  async findByProject(id: string) {
    const data = await this.model.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'worker',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'task',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'projects',
                localField: 'project',
                foreignField: '_id',
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', { $toObjectId: id }],
                      },
                    },
                  },
                ],
                as: 'projectEX',
              },
            },
            {
              $unwind: '$projectEX',
            },
          ],
          as: 'task',
        },
      },
      {
        $unwind: '$task',
      },
      {
        $project: {
          _id: '$_id',
          userId: '$user._id',
          name: '$user.name',
          avartar: '$user.avartar',
          field: '$user.field',
          taskId: '$task._id',
          taskName: '$task.name',
        },
      },
    ]);

    return { c: data.length, data };
  }

  async create(createAssignTaskDto: CreateAssignTaskDto) {
    try {
      //check user
      const isWorkerExits = await this.userService.findOne(
        createAssignTaskDto.worker,
      );

      if (!isWorkerExits)
        throw new HttpException(`User not found`, HttpStatus.BAD_REQUEST);

      if (isWorkerExits.role !== UserRoleEnum.WORKER)
        throw new HttpException(
          `nguời được giao không phải ngườii lao động`,
          HttpStatus.BAD_REQUEST,
        );

      // check task
      await this.taskService.isExitModel(createAssignTaskDto.task);

      const created = await this.model.create(createAssignTaskDto);

      this.logger.log(`created a new assign task by id #${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} assignTask`;
  }
}

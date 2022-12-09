import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-dto/create-user.dto';
import { UpdateUserDto } from './dto/update-dto/update-user.dto';
import { CreateEmployeeDto } from './dto/create-dto/create-employee.dto';
import { UpdateEmployeesDto } from './dto/update-dto/update-employees.dto';
import { CreateClientDto } from './dto/create-dto/create-client.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('employees')
  findAllEloyees() {
    return this.userService.findAllEloyees();
  }

  @Get('client')
  findAllClient() {
    return this.userService.findAllClient();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('employees')
  newEmplyees(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.userService.newEmployees(createEmployeeDto);
  }

  @Post('client')
  newClient(@Body() createClientDto: CreateClientDto) {
    return this.userService.newClient(createClientDto);
  }

  @Patch('employees/:id')
  updateEmployees(
    @Param('id') id: string,
    @Body() updateEmployeesDto: UpdateEmployeesDto,
  ) {
    return this.userService.updateEmployees(id, updateEmployeesDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}

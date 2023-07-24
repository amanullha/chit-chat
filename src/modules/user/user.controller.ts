import { Body, Controller, Post, Get, Param, UseGuards, Query, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUserDto';
import { UserLoginDto } from './dto/userLoginDto';
import { IUser, JwtTokens } from '@interfaces/user.interface';
import { UserType } from '@models/userType.enum';
import { AuthGuard } from '@nestjs/passport';
import { AllUserDto } from './dto/allUserDto';
import { RolesGuard } from '@decorators/roles.guard';
import { Roles } from '@decorators/roles.decorators';
import { UpdateProfileDto } from './dto/updateProfile';
import { GetUser } from '@decorators/getUser.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Post('/create-admin')
  async createAdmin(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto,UserType.ADMIN);
  }
  @Post('/create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }
  @Post('/login')
  async userLogin(@Body() userLoginDto: UserLoginDto): Promise<{ user: IUser; tokens:JwtTokens; }> {
    return await this.userService.userLogin(userLoginDto);
  }
  @Put('/update-profile')
  @UseGuards(AuthGuard("jwt"))
  async updateProfile(
    @Body()updateProfileDto:UpdateProfileDto,
    @GetUser()user:IUser
    ): Promise<IUser> {
    return await this.userService.updateProfile(user,updateProfileDto);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserType.ADMIN,UserType.SUPPER_ADMIN)
  async getAllUser(@Query()allUserDto:AllUserDto): Promise<IUser[]> {
    return await this.userService.getAllUsers(allUserDto);
  }
  @Get('/:userId')
  async getOneUser(@Param('userId') userId: string): Promise<IUser> {
    return await this.userService.getOneUser(userId);
  }
}

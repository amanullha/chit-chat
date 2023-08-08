import { GetUser } from '@decorators/getUser.decorator';
import { Roles } from '@decorators/roles.decorators';
import { RolesGuard } from '@decorators/roles.guard';
import { IUser, JwtTokens } from '@interfaces/user.interface';
import { UserType } from '@models/userType.enum';
import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AllUserDto } from './dto/allUserDto';
import { CreateUserDto } from './dto/createUserDto';
import { UpdateProfileDto } from './dto/updateProfile';
import { UserLoginDto } from './dto/userLoginDto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('/create-admin')
  async createAdmin(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto, UserType.ADMIN);
  }
  @Post('/create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }
  @Post('/login')
  async userLogin(@Body() userLoginDto: UserLoginDto): Promise<{ user: IUser; tokens: JwtTokens; }> {
    return await this.userService.userLogin(userLoginDto);
  }
  @Get("/google/login")
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    console.log("google login");

  }

  @Get("/google/login/callback")
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(
    @GetUser() user: any
  ) {
    console.log("calling from here");
    console.log("user: ", user);


    // Redirect or return JWT token
  }

  @Put('/update-profile')
  @UseGuards(AuthGuard("jwt"))
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @GetUser() user: IUser
  ): Promise<IUser> {
    return await this.userService.updateProfile(user, updateProfileDto);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserType.ADMIN, UserType.SUPPER_ADMIN)
  async getAllUser(@Query() allUserDto: AllUserDto): Promise<IUser[]> {
    return await this.userService.getAllUsers(allUserDto);
  }
  @Post('send-email')
  async sendEmail(@Body() data: any): Promise<any> {
    return await this.userService.sendEmail(data);
  }
  @Get('verify/:token')
  async verifyUser(@Param("token") token: string): Promise<any> {
    return await this.userService.verifyUser(token);
  }


  @Get('/:userId')
  async getOneUser(@Param('userId') userId: string): Promise<IUser> {
    return await this.userService.getOneUser(userId);
  }
}

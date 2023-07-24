// import { User } from '@interfaces/user.interface';
import { IUser } from '@interfaces/user.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data, ctx: ExecutionContext): IUser => {
        const req = ctx.switchToHttp().getRequest();
        // const user = req.user
        return req.user;
    },
);

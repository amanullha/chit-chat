import { IsNumberString, IsOptional, Min } from "class-validator";

export class AllUserDto{
    @IsNumberString({ no_symbols: true })
    // @Min(0)
    @IsOptional()
    currentPage?:number|string;
    @IsNumberString({ no_symbols: true })
    // @Min(0)
    @IsOptional()
    pageSize:number|string;
}
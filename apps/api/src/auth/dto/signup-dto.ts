 
import { IsString, IsOptional, IsInt, Min ,IsEmail, IsNumber} from 'class-validator';

export class SignupDto {
  @IsString()
  name: string;
    
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @Min(6)
  password: string;

  @IsNumber()
  avatarId:string;
}